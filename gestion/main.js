// --- CONFIGURACIÓN FIREBASE (VERIFICADA) ---
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
let idEquipoActual = "";

// --- ESCUCHA ACTIVA DE LA NUBE ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual && datosEquipos[idEquipoActual]) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            mostrarNotificaciones(); // Se ejecuta cada vez que llega algo nuevo
        }
        cargarMercado();
    }
});

function guardarEnNube() {
    return db.ref('liga/').set(datosEquipos);
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
    if (!equipoActual) return;
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

// --- BUSCADOR E INTERCAMBIOS (REFORZADO) ---
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
                <button onclick="enviarPropuesta('${dueñoId}', ${jIdx}, '${nombreB}')" style="background:gold; width:100%; padding:10px; font-weight:bold; cursor:pointer;">ENVIAR OFERTA</button>`;
        }
    } else {
        res.innerHTML = `<button onclick="confirmarCompraLibre('${nombreB}', ${valor})" style="background:green; color:white; width:100%; padding:10px; cursor:pointer;">FICHAR LIBRE</button>`;
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
        ofertaDinero: parseFloat(dinero),
        ofertaJugador: intercambio
    };

    // Obtenemos las notificaciones actuales del OTRO equipo
    let notisVendedor = datosEquipos[vId].notificaciones || [];
    notisVendedor.push(propuesta);

    // Guardamos directamente en la carpeta de notificaciones del vendedor
    db.ref('liga/' + vId + '/notificaciones').set(notisVendedor)
    .then(() => {
        alert("¡Propuesta enviada con éxito al muro de " + datosEquipos[vId].nombre + "!");
    })
    .catch(err => alert("Error al enviar: " + err.message));
}

function confirmarCompraLibre(n, v) {
    if (equipoActual.saldo >= v) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: (v*0.2).toFixed(1), prima: (v*0.1).toFixed(1), enVenta: false, contrato: 2 });
        guardarEnNube();
    }
}

// --- MURO DE NOTIFICACIONES ---
function mostrarNotificaciones() {
    const dashboard = document.getElementById('dashboard');
    let muro = document.getElementById('muro-notis');
    
    if (!muro) {
        muro = document.createElement('div');
        muro.id = 'muro-notis';
        muro.style = "background:#1a1a1a; color:white; padding:15px; margin-top:20px; border:2px solid gold; border-radius:8px;";
        dashboard.appendChild(muro);
    }

    const notis = equipoActual.notificaciones || [];
    if (notis.length === 0) {
        muro.innerHTML = "<h3>🔔 MURO DE OFERTAS</h3><p>Sin ofertas nuevas.</p>";
        return;
    }

    muro.innerHTML = "<h3>🔔 MURO DE OFERTAS</h3>";
    notis.forEach((n, idx) => {
        muro.innerHTML += `
            <div style="background:#333; padding:10px; margin-bottom:10px; border-radius:5px; border-left: 5px solid gold;">
                <p><strong>${n.deNombre}</strong> quiere a <strong>${n.jugadorDeseado}</strong></p>
                <p>Ofrece: <span style="color:lime;">$${n.ofertaDinero}M</span> + <span style="color:cyan;">Jugador: ${n.ofertaJugador}</span></p>
                <button onclick="aceptarTrato(${idx})" style="background:green; color:white; padding:5px; margin-right:5px; cursor:pointer;">ACEPTAR</button>
                <button onclick="hacerContraoferta(${idx})" style="background:blue; color:white; padding:5px; margin-right:5px; cursor:pointer;">CONTRAOFERTA</button>
                <button onclick="rechazarTrato(${idx})" style="background:red; color:white; padding:5px; cursor:pointer;">RECHAZAR</button>
            </div>`;
    });
}

function hacerContraoferta(idx) {
    const n = equipoActual.notificaciones[idx];
