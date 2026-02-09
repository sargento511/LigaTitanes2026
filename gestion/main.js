// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let datosEquipos = {}; 
let equipoActual = null;
let idEquipoActual = "";

// --- SINCRONIZACIÓN CON FIREBASE ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            mostrarNotificaciones();
        }
        cargarMercado();
    }
});

function guardarEnNube() {
    db.ref('liga/').set(datosEquipos);
}

// --- NAVEGACIÓN ---
function seleccionarEquipo(id) {
    idEquipoActual = id;
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarTabla();
    mostrarNotificaciones();
}

function irInicio() {
    idEquipoActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

// --- GESTIÓN DE PLANTILLA ---
function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white;">LISTA VENTAS</button>`;

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange;">50%</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    guardarEnNube();
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5;
    if(confirm(`¿Vender a ${j.nombre} por $${pago}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        guardarEnNube();
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo >= j.prima) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        guardarEnNube();
    } else { alert("Saldo insuficiente"); }
}

// --- BUSCADOR E INTERCAMBIOS ---
function calcularFichaje() {
    const nombreB = document.getElementById('nombre-busqueda').value.trim();
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const res = document.getElementById('resultado-busqueda');
    if (!nombreB || isNaN(valor)) return;

    let dueñoId = null;
    let jIdx = -1;

    for (let id in datosEquipos) {
        const idx = datosEquipos[id].jugadores.findIndex(j => j.nombre.toLowerCase() === nombreB.toLowerCase());
        if (idx !== -1) { dueñoId = id; jIdx = idx; break; }
    }

    if (dueñoId) {
        if (dueñoId === idEquipoActual) {
            res.innerHTML = `<p>Ya es tu jugador.</p>`;
        } else {
            res.innerHTML = `
                <p>Dueño: ${datosEquipos[dueñoId].nombre}</p>
                <button onclick="enviarPropuesta('${dueñoId}', ${jIdx}, '${nombreB}')" style="background:gold; width:100%; padding:10px;">ENVIAR OFERTA</button>`;
        }
    } else {
        res.innerHTML = `<button onclick="confirmarCompraLibre('${nombreB}', ${valor})" style="background:green; color:white; width:100%; padding:10px;">FICHAR LIBRE</button>`;
    }
}

function enviarPropuesta(vId, jIdx, nombreJ) {
    const dinero = prompt("¿Cuánto dinero ofreces? (MDD)", "0");
    const intercambio = prompt("¿Qué jugador ofreces a cambio? (Nombre o 'ninguno')", "ninguno");
    
    if (dinero === null) return;

    const propuesta = {
        deId: idEquipoActual,
        deNombre: equipoActual.nombre,
        jugadorDeseado: nombreJ,
        jugadorDeseadoIdx: jIdx,
        ofertaDinero: parseFloat
