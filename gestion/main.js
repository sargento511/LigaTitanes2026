// CONFIGURACIÓN DE FIREBASE (Tu configuración original)
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

let datosEquipos = {};
let equipoActual = null;
let idActual = "";
let todasLasOfertas = {};

// --- AYUDANTE: ASEGURAR QUE LOS JUGADORES SEAN UNA LISTA ---
// Esto evita que el botón "SI" falle si Firebase envía un objeto
function limpiarJugadores(idEquipo) {
    if (!datosEquipos[idEquipo].jugadores) {
        datosEquipos[idEquipo].jugadores = [];
    } else if (!Array.isArray(datosEquipos[idEquipo].jugadores)) {
        datosEquipos[idEquipo].jugadores = Object.values(datosEquipos[idEquipo].jugadores);
    }
    return datosEquipos[idEquipo].jugadores;
}

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
    datosEquipos = snapshot.val() || {};
    if (idActual) {
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

    document.getElementById('saldo-actual').innerText = `$${(equipoActual.saldo || 0).toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    const lista = limpiarJugadores(idActual);
    elCuerpo.innerHTML = lista.map((j, i) => `
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

// --- CALCULADORA (TU VERSIÓN FAVORITA) ---
window.calcularFichaje = function() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;

    let s = v >= 120 ? 22 : (v >= 90 ? 18 : (v >= 70 ? 14 : (v >= 50 ? 11 : (v >= 30 ? 8 : (v >= 20 ? 5 : (v >= 10 ? 3 : (v >= 5 ? 1.5 : 0.8)))))));
    let p = v >= 120 ? 7 : (v >= 90 ? 5 : (v >= 70 ? 4 : (v >= 50 ? 3 : (v >= 30 ? 2 : (v >= 20 ? 1.5 : (v >= 10 ? 1 : (v >= 5 ? 0.7 : 0.4)))))));

    document.getElementById('resultado-busqueda').innerHTML = `
        <div style="background:#222; padding:10px; margin-top:10px; border-radius:5px;">
            <p><b>${n.toUpperCase()}</b></p>
            <p>Salario: $${s}M | Prima: $${p}M</p>
            <button onclick="window.confirmarCompra('${n}',${v},${s},${p})" style="background:green; color:white; width:100%; padding:5px;">FICHAR</button>
        </div>`;
};

window.confirmarCompra = function(n, v, s, p) {
    const lista = limpiarJugadores(idActual);
    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");
    
    equipoActual.saldo -= v;
    lista.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
    salvar();
    document.getElementById('resultado-busqueda').innerHTML = ''; 
};

// --- EL BOTÓN SI (REPARADO DEFINITIVAMENTE) ---
window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    // Forzamos que ambos equipos tengan arrays de jugadores
    const jugEmisor = limpiarJugadores(idE);
    const jugReceptor = limpiarJugadores(idActual);

    // 1. Dinero
    datosEquipos[idE].saldo -= o.dinero;
    datosEquipos[idActual].saldo += o.dinero;

    // 2. Mover jugador que tú entregas (Receptor -> Emisor)
    if (o.jugadorBuscado) {
        const idx = jugReceptor.findIndex(j => j.nombre === o.jugadorBuscado);
        if (idx !== -1) {
            let p = jugReceptor.splice(idx, 1)[0];
            p.enVenta = false;
            jugEmisor.push(p);
        }
    }

    // 3. Mover jugador que tú recibes (Emisor -> Receptor)
    if (o.jugadorOfrecido) {
        const idx = jugEmisor.findIndex(j => j.nombre === o.jugadorOfrecido);
        if (idx !== -1) {
            let p = jugEmisor.splice(idx, 1)[0];
            p.enVenta = false;
            jugReceptor.push(p);
        }
    }

    // 4. Guardado simultáneo
    db.ref('liga/').set(datosEquipos).then(() => {
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("¡Trato cerrado!");
    });
};

// --- BOTÓN CONTRA (MANTENIDO) ---
window.prepararContraoferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;
    document.getElementById('select-jugador-rival').value = o.jugadorOfrecido || "";
    document.getElementById('oferta-dinero').value = o.dinero;
    document.getElementById('mi-jugador-cambio').value = o.jugadorBuscado || "";
    db.ref(`ofertas/${idActual}/${idO}`).remove();
    alert("Datos cargados. Modifica y envía.");
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
                <p><b>${o.desde}</b> quiere a ${o.jugadorBuscado || 'Dinero'}</p>
                <p>Ofrece $${o.dinero}M ${o.jugadorOfrecido ? '+ ' + o.jugadorOfrecido : ''}</p>
                <button onclick="window.aceptarOferta('${key}','${o.idEmisor}')" style="background:green; color:white;">SI</button>
                <button onclick="window.prepararContraoferta('${key}','${o.idEmisor}')" style="background:orange;">CONTRA</button>
                <button onclick="window.rechazarOferta('${key}')" style="background:red; color:white;">NO</button>
            </div>`;
    });
}

// --- RESTO DE FUNCIONES ---
window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

window.renovar = function(i) {
    const lista = limpiarJugadores(idActual);
    if (equipoActual.saldo < lista[i].prima) return alert("Sin saldo.");
    equipoActual.saldo -= lista[i].prima; lista[i].contrato += 1; salvar();
};

window.venderAlAnterior = function(i) {
    const lista = limpiarJugadores(idActual);
    equipoActual.saldo += lista[i].valor * 0.5;
    lista.splice(i, 1);
    salvar();
};

window.toggleVenta = function(i) {
    const lista = limpiarJugadores(idActual);
    lista[i].enVenta = !lista[i].enVenta;
    salvar();
};

window.liberarJugador = function(i) {
    const lista = limpiarJugadores(idActual);
    const j = lista[i];
    const coste = j.contrato * j.salario;
    if (!confirm(`¿Liberar? Coste: $${coste.toFixed(1)}M`)) return;
    if (equipoActual.saldo < coste) return alert("Saldo insuficiente.");
    equipoActual.saldo -= coste;
    lista.splice(i, 1);
    salvar();
};

function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const sR = document.getElementById('select-jugador-rival'), sM = document.getElementById('mi-jugador-cambio');
    if (sR && datosEquipos[rivalId]) {
        const jugR = limpiarJugadores(rivalId);
        sR.innerHTML = '<option value="">Solo $</option>' + jugR.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    }
    if (sM) {
        const jugM = limpiarJugadores(idActual);
        sM.innerHTML = '<option value="">Solo $</option>' + jugM.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    }
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return; lista.innerHTML = '';
    for (let eq in datosEquipos) {
        const jug = limpiarJugadores(eq);
        jug.forEach(j => { if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`; });
    }
}
