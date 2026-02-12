// CONFIGURACIÓN DE FIREBASE (Manteniendo tus credenciales)
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

// --- TABLA (Con visualización de Bloqueo) ---
function actualizarTabla() {
    const elCuerpo = document.getElementById('body-plantilla');
    if (!elCuerpo || !equipoActual) return;

    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    elCuerpo.innerHTML = (equipoActual.jugadores || []).map((j, i) => `
        <tr>
            <td>${j.nombre} ${j.enVenta ? '🔥' : ''} ${j.bloqueado ? '🔒' : ''}</td>
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

// --- FICHAJES (Regla Estricta Aplicada) ---
window.confirmarCompra = function(n, v, s, p) {
    if (!equipoActual.jugadores) equipoActual.jugadores = [];
    
    // Solo bloquea si ya lo tienes tú en tu lista actual
    const yaLoTengo = equipoActual.jugadores.some(j => j.nombre.toLowerCase() === n.toLowerCase());
    if (yaLoTengo) return alert("¡Error! " + n + " ya está en tu equipo.");

    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");

    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ 
        nombre: n, valor: v, salario: s, prima: p, 
        enVenta: false, contrato: 2, 
        bloqueado: true // <--- Se bloquea al comprar
    });

    salvar();
    document.getElementById('resultado-busqueda').innerHTML = ''; 
    alert(n + " fichado. No podrá salir hasta la próxima temporada.");
};

// --- BOTÓN SI (REPARADO Y CON BLOQUEO) ---
window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    const emisor = datosEquipos[idE];
    const receptor = equipoActual;

    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    // Traspaso del jugador que TÚ entregas
    const idxB = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
    if (idxB !== -1) {
        let p = receptor.jugadores.splice(idxB, 1)[0];
        p.enVenta = false;
        p.bloqueado = true; // Se bloquea en su nuevo equipo
        if (!emisor.jugadores) emisor.jugadores = [];
        emisor.jugadores.push(p);
    }

    // Traspaso del jugador que RECIBES
    if (o.jugadorOfrecido) {
        const idxO = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        if (idxO !== -1) {
            let p = emisor.jugadores.splice(idxO, 1)[0];
            p.enVenta = false;
            p.bloqueado = true; // Se bloquea en tu equipo
            receptor.jugadores.push(p);
        }
    }

    db.ref('liga/').set(datosEquipos).then(() => {
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("¡Trato cerrado! Jugadores bloqueados por esta temporada.");
    });
};

// --- ACCIONES CON VALIDACIÓN DE BLOQUEO ---
window.venderAlAnterior = function(i) {
    const j = equipoActual.jugadores[i];
    if (j.bloqueado) return alert("🔒 No puedes vender a un jugador que llegó esta temporada.");
    
    equipoActual.saldo += j.valor * 0.5;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.liberarJugador = function(i) {
    const j = equipoActual.jugadores[i];
    if (j.bloqueado) return alert("🔒 Los nuevos fichajes deben cumplir al menos un año de contrato.");
    
    const coste = j.contrato * j.salario;
    if (!confirm(`¿Liberar? Coste: $${coste.toFixed(1)}M`)) return;
    if (equipoActual.saldo < coste) return alert("Saldo insuficiente.");
    equipoActual.saldo -= coste;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

// --- FINALIZAR TEMPORADA (DESBLOQUEO) ---
window.finalizarTemporada = function() {
    if (!confirm("¿Finalizar temporada? Se cobrarán salarios y se desbloquearán fichajes.")) return;
    for (let idEq in datosEquipos) {
        let eq = datosEquipos[idEq];
        let gasto = 0;
        if (eq.jugadores) {
            eq.jugadores.forEach(j => {
                gasto += j.salario;
                if (j.contrato > 0) j.contrato -= 1;
                j.bloqueado = false; // <--- AQUÍ SE QUITA EL CANDADO
            });
            eq.saldo -= gasto;
        }
    }
    salvar();
    alert("Temporada finalizada. Jugadores disponibles para venta.");
};

// --- FUNCIONES DE APOYO (Manteniendo tu estructura) ---
window.calcularFichaje = function() {
    const n = document.getElementById('nombre-busqueda').value, v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;
    let s = v >= 50 ? 11 : (v >= 20 ? 5 : 1.5), p = v >= 50 ? 3 : (v >= 20 ? 1.5 : 0.7);
    document.getElementById('resultado-busqueda').innerHTML = `<button onclick="window.confirmarCompra('${n}',${v},${s},${p})" style="background:green; color:white; width:100%;">FICHAR</button>`;
};

window.enviarOferta = function() {
    const rival = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    db.ref(`ofertas/${rival}`).push({
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
                <p><b>${o.desde}</b> quiere a ${o.jugadorBuscado}</p>
                <button onclick="window.aceptarOferta('${key}','${o.idEmisor}')" style="background:green; color:white;">SI</button>
                <button onclick="window.rechazarOferta('${key}')" style="background:red; color:white;">NO</button>
            </div>`;
    });
}

window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const sR = document.getElementById('select-jugador-rival'), sM = document.getElementById('mi-jugador-cambio');
    if (sR && rival && rival.jugadores) sR.innerHTML = '<option value="">Solo $</option>' + rival.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    if (sM && equipoActual.jugadores) sM.innerHTML = '<option value="">Solo $</option>' + equipoActual.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return; lista.innerHTML = '';
    for (let eq in datosEquipos) {
        if (datosEquipos[eq].jugadores) {
            datosEquipos[eq].jugadores.forEach(j => { if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`; });
        }
    }
}
