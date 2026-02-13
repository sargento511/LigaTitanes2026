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

let equipoActualID = "";

// 1. Lógica de la Tabla de Salarios y Primas (Según tu imagen)
function calcularFinanzas(valor) {
    let v = parseFloat(valor) || 0;
    let m = 1000000; // Millón
    let salario = 0;
    let prima = 0;

    if (v >= 120 * m) { salario = 22 * m; prima = 7 * m; }
    else if (v >= 90 * m) { salario = 18 * m; prima = 5 * m; }
    else if (v >= 70 * m) { salario = 14 * m; prima = 4 * m; }
    else if (v >= 50 * m) { salario = 11 * m; prima = 3 * m; }
    else if (v >= 30 * m) { salario = 8 * m; prima = 2 * m; }
    else if (v >= 20 * m) { salario = 5 * m; prima = 1.5 * m; }
    else if (v >= 10 * m) { salario = 3 * m; prima = 1 * m; }
    else if (v >= 5 * m) { salario = 1.5 * m; prima = 0.7 * m; }
    else { salario = 0.8 * m; prima = 0.4 * m; }

    return { salario, prima };
}

function actualizarCalculos() {
    let val = document.getElementById('calc-valor').value;
    let res = calcularFinanzas(val);
    document.getElementById('res-salario').innerText = `$${res.salario.toLocaleString()}`;
    document.getElementById('res-prima').innerText = `$${res.prima.toLocaleString()}`;
}

// 2. Gestión de Pantallas y Datos
function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('info-presupuesto').innerText = `$${(data.presupuesto || 0).toLocaleString()}`;
            document.getElementById('info-estadio').innerText = data.estadio || "Sin nombre";
            document.getElementById('info-capacidad').innerText = (data.capacidad || 0).toLocaleString();
            document.getElementById('info-tamano').innerText = data.tamano || "No definido";

            // Sincronizar Inputs de Edición (Incluyendo Presupuesto)
            document.getElementById('input-presupuesto').value = data.presupuesto || 0;
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            document.getElementById('input-tamano').value = data.tamano || "";

            renderizarJugadores(data.jugadores);
            actualizarSelects(data.jugadores);
        }
    });
    activarEscuchaNegociaciones();
}

function guardarConfiguracion() {
    if (!equipoActualID) return;
    const pres = parseInt(document.getElementById('input-presupuesto').value) || 0;
    const est = document.getElementById('input-estadio').value;
    const cap = parseInt(document.getElementById('input-capacidad').value) || 0;
    const tam = document.getElementById('input-tamano').value;

    db.ref('equipos/' + equipoActualID).update({
        presupuesto: pres,
        estadio: est,
        capacidad: cap,
        tamano: tam
    }).then(() => alert("✅ Datos actualizados"));
}

function renderizarJugadores(jugadores) {
    const tbody = document.getElementById('lista-jugadores');
    tbody.innerHTML = "";
    let count = 0;
    if (jugadores) {
        Object.keys(jugadores).forEach(key => {
            const j = jugadores[key]; count++;
            tbody.innerHTML += `<tr><td>${j.nombre}</td><td>$${j.valor.toLocaleString()}</td><td>$${j.salario.toLocaleString()}</td><td>$${j.prima.toLocaleString()}</td><td>${j.contrato} años</td></tr>`;
        });
    }
    document.getElementById('player-count').innerText = `${count} Jugadores`;
}

// 3. Funciones del Celular
function contratarJugador() {
    let nombre = document.getElementById('calc-nombre').value;
    let valor = parseFloat(document.getElementById('calc-valor').value);
    let años = parseInt(document.getElementById('calc-contrato').value);
    let res = calcularFinanzas(valor);

    if (equipoActualID && nombre && valor > 0) {
        db.ref('equipos/' + equipoActualID).transaction((data) => {
            if (data && data.presupuesto >= valor) {
                data.presupuesto -= valor;
                if (!data.jugadores) data.jugadores = {};
                data.jugadores[Date.now()] = { nombre, valor, salario: res.salario, prima: res.prima, contrato: años };
                return data;
            } else { alert("Presupuesto insuficiente"); return; }
        });
    }
}

function liberarProceso() {
    let id = document.getElementById('select-jugador-gestion').value;
    db.ref('equipos/' + equipoActualID).once('value', snap => {
        let data = snap.val();
        let jug = data.jugadores[id];
        let reembolso = jug.salario * jug.contrato;
        db.ref('equipos/' + equipoActualID + '/jugadores/' + id).remove();
        db.ref('equipos/' + equipoActualID).update({ presupuesto: data.presupuesto + reembolso });
    });
}

// UI Helpers
function togglePhone() { document.getElementById('phone-container').classList.toggle('phone-hidden'); }
function openTab(id) {
    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function actualizarSelects(jugadores) {
    const sel = document.getElementById('select-jugador-gestion');
    if (!sel) return; sel.innerHTML = "";
    if (jugadores) Object.keys(jugadores).forEach(id => sel.innerHTML += `<option value="${id}">${jugadores[id].nombre}</option>`);
}

function enviarPropuesta() { /* Lógica de negociación pendiente */ alert("Oferta enviada"); }
function activarEscuchaNegociaciones() { /* Lógica de escucha pendiente */ }
