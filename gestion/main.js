// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let datosEquipos = {};
let equipoActual = null;
let idActual = "";
let todasLasOfertas = {};

// --- NAVEGACIÓN ---
window.seleccionarEquipo = function(id) {
    idActual = id;
    if (datosEquipos && datosEquipos[id]) {
        equipoActual = datosEquipos[id];
        document.getElementById('pantalla-inicio').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
        actualizarTodo();
    }
};

window.irInicio = function() {
    idActual = ""; equipoActual = null;
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
};

function actualizarTodo() {
    if (!equipoActual) return;
    actualizarTabla();
    actualizarListasNegociacion();
    dibujarOfertas();
}

// --- LISTENERS ---
db.ref('liga/').on('value', (snapshot) => {
    datosEquipos = snapshot.val();
    if (idActual && datosEquipos) {
        equipoActual = datosEquipos[idActual];
        actualizarTodo();
    }
    cargarMercado();
});

db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    if (idActual) dibujarOfertas();
});

function salvar() { db.ref('liga/').set(datosEquipos); }

// --- TABLA ---
function actualizarTabla() {
    const elCuerpo = document.getElementById('body-plantilla');
    if (!elCuerpo || !equipoActual) return;

    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    elCuerpo.innerHTML = (equipoActual.jugadores || []).map((j, i) => `
        <tr>
            <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
            <td>$${j.valor}M</td>
            <td>$${j.salario}M</td>
            <td>$${j.prima}M</td>
            <td>${j.contrato}a</td>
            <td>
                <button onclick="window.renovar(${i})" style="background:green; color:white;">REN</button>
                <button onclick="window.venderAlAnterior(${i})" style="background:orange;">50%</button>
                <button onclick="window.toggleVenta(${i})" style="background:${j.enVenta ? 'red' : 'blue'}; color:white;">VENTA</button>
                <button onclick="window.liberarJugador(${i})" style="background:black; color:white;">LIBERAR</button>
            </td>
        </tr>`).join('');
}

// --- FICHAJES (AQUÍ ESTABA EL ERROR DE RECOMPRA) ---
window.confirmarCompra = function(n, v, s, p) {
    if (!equipoActual.jugadores) equipoActual.jugadores = [];
    
    // CORRECCIÓN: Ahora solo verifica que NO lo tengas TÚ. 
    // Ya no revisa si lo tiene el vecino, para que puedas recomprarlo si quieres.
    const yaLoTengo = equipoActual.jugadores.some(j => j.nombre.toLowerCase() === n.toLowerCase());
    
    if (yaLoTengo) return alert("Este jugador ya está en tu equipo actual.");
    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");

    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
    
    salvar();
    document.getElementById('resultado-busqueda').innerHTML = '';
    alert("Fichaje exitoso.");
};

// --- BOTÓN SI (ACEPTAR OFERTA) ---
window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    const emisor = datosEquipos[idE];
    const receptor = equipoActual;

    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    // Traspaso de jugador buscado
    const idxB = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
    if (idxB !== -1) {
        let p = receptor.jugadores.splice(idxB, 1)[0];
        p.enVenta = false;
        if (!emisor.jugadores) emisor.jugadores = [];
        emisor.jugadores.push(p);
    }

    // Traspaso de jugador ofrecido
    if (o.jugadorOfrecido) {
        const idxO = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        if (idxO !== -1) {
            let p = emisor.jugadores.splice(idxO, 1)[0];
            p.enVenta = false;
            receptor.jugadores.push(p);
        }
    }

    db.ref('liga/').set(datosEquipos).then(() => {
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("Trato hecho.");
    });
};

// --- RESTO DE FUNCIONES ---
window.venderAlAnterior = function(i) {
    equipoActual.saldo += equipoActual.jugadores[i].valor * 0.5;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.liberarJugador = function(i) {
    const j = equipoActual.jugadores[i];
    const coste = j.contrato * j.salario;
    if (!confirm("¿Liberar?")) return;
    if (equipoActual.saldo < coste) return alert("Saldo insuficiente.");
    equipoActual.saldo -= coste;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.enviarOferta = function() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    db.ref(`ofertas/${rivalId}`).push({
        desde: equipoActual.nombre, idEmisor: idActual,
        jugadorBuscado: document.getElementById('select-jugador-rival').value,
        dinero: parseFloat(document.getElementById('oferta-dinero').value) || 0,
        jugadorOfrecido: document.getElementById('mi-jugador-cambio').value
    });
    alert("Oferta enviada.");
};

function dibujarOfertas() {
    const contenedor = document.getElementById('contenedor-ofertas');
    if (!contenedor) return;
    const misOfertas = todasLasOfertas[idActual] || {};
    contenedor.innerHTML = '';
    Object.keys(misOfertas).forEach(key => {
        const o = misOfertas[key];
        contenedor.innerHTML += `
            <div style="background:#222; padding:10px; margin:5px 0; border-left:4px solid #007bff;">
                <p><b>${o.desde}</b>: ${o.jugadorBuscado} x $${o.dinero}M</p>
                <button onclick="window.aceptarOferta('${key}','${o.idEmisor}')" style="background:green; color:white;">SI</button>
                <button onclick="window.rechazarOferta('${key}')" style="background:red; color:white;">NO</button>
            </div>`;
    });
}

window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

window.calcularFichaje = function() {
    const n = document.getElementById('nombre-busqueda').value, v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;
    let s = v >= 50 ? 11 : (v >= 20 ? 5 : 1.5), p = v >= 50 ? 3 : (v >= 20 ? 1.5 : 0.7);
    document.getElementById('resultado-busqueda').innerHTML = `<button onclick="window.confirmarCompra('${n}',${v},${s},${p})">FICHAR</button>`;
};

function actualizarListasNegociacion() {
    const rival = datosEquipos[idActual === 'Deportivo' ? 'Halcones' : 'Deportivo'];
    const sR = document.getElementById('select-jugador-rival'), sM = document.getElementById('mi-jugador-cambio');
    if (sR && rival && rival.jugadores) sR.innerHTML = '<option value=\"\">Solo $</option>' + rival.jugadores.map(j => `<option value=\"${j.nombre}\">${j.nombre}</option>`).join('');
    if (sM && equipoActual.jugadores) sM.innerHTML = '<option value=\"\">Solo $</option>' + equipoActual.jugadores.map(j => `<option value=\"${j.nombre}\">${j.nombre}</option>`).join('');
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return; lista.innerHTML = '';
    for (let eq in datosEquipos) {
        if(datosEquipos[eq].jugadores) {
            datosEquipos[eq].jugadores.forEach(j => { if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`; });
        }
    }
}
