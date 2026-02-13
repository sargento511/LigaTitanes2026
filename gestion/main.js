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

// Lógica de MDD (Basada en tu tabla)
function calcularFinanzas(v) {
    let salario = 0; let prima = 0;
    if (v >= 120) { salario = 22; prima = 7; }
    else if (v >= 90) { salario = 18; prima = 5; }
    else if (v >= 70) { salario = 14; prima = 4; }
    else if (v >= 50) { salario = 11; prima = 3; }
    else if (v >= 30) { salario = 8; prima = 2; }
    else if (v >= 20) { salario = 5; prima = 1.5; }
    else if (v >= 10) { salario = 3; prima = 1; }
    else if (v >= 5) { salario = 1.5; prima = 0.7; }
    else { salario = 0.8; prima = 0.4; }
    return { salario, prima };
}

function actualizarCalculos() {
    let val = parseFloat(document.getElementById('calc-valor').value) || 0;
    let res = calcularFinanzas(val);
    document.getElementById('res-salario').innerText = res.salario;
    document.getElementById('res-prima').innerText = res.prima;
}

function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('info-presupuesto').innerText = `${data.presupuesto || 0} MDD`;
            document.getElementById('info-estadio').innerText = data.estadio || "-";
            document.getElementById('info-capacidad').innerText = data.capacidad || 0;
            document.getElementById('info-tamano').innerText = data.tamano || "-";
            
            document.getElementById('input-presupuesto').value = data.presupuesto || 0;
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            document.getElementById('input-tamano').value = data.tamano || "";
            
            renderizarJugadores(data.jugadores);
            actualizarSelects(data.jugadores);
        }
    });
    escucharNegociaciones();
}

function guardarConfiguracion() {
    const pres = parseFloat(document.getElementById('input-presupuesto').value) || 0;
    db.ref('equipos/' + equipoActualID).update({
        presupuesto: pres,
        estadio: document.getElementById('input-estadio').value,
        capacidad: document.getElementById('input-capacidad').value,
        tamano: document.getElementById('input-tamano').value
    }).then(() => alert("✅ Club actualizado"));
}

function renderizarJugadores(jugadores) {
    const tbody = document.getElementById('lista-jugadores');
    tbody.innerHTML = ""; let count = 0;
    if (jugadores) {
        Object.keys(jugadores).forEach(key => {
            const j = jugadores[key]; count++;
            tbody.innerHTML += `<tr><td>${j.nombre}</td><td>${j.valor}</td><td>${j.salario}</td><td>${j.prima}</td><td>${j.contrato} años</td></tr>`;
        });
    }
    document.getElementById('player-count').innerText = `${count} Jugadores`;
}

// FUNCIONES DEL CELULAR
function contratarJugador() {
    let nombre = document.getElementById('calc-nombre').value;
    let valor = parseFloat(document.getElementById('calc-valor').value);
    let años = parseInt(document.getElementById('calc-contrato').value);
    let finanzas = calcularFinanzas(valor);

    if (nombre && valor > 0 && años > 0) {
        db.ref('equipos/' + equipoActualID).transaction((data) => {
            if (data && data.presupuesto >= valor) {
                data.presupuesto -= valor;
                if (!data.jugadores) data.jugadores = {};
                data.jugadores[Date.now()] = { 
                    nombre, valor, salario: finanzas.salario, prima: finanzas.prima, contrato: años 
                };
                return data;
            } else { alert("Error: Presupuesto insuficiente"); return; }
        });
    }
}

function renovarJugador() {
    let id = document.getElementById('select-jugador-gestion').value;
    let extra = parseInt(document.getElementById('reno-anos-input').value) || 0;
    if (id && extra > 0) {
        db.ref(`equipos/${equipoActualID}/jugadores/${id}/contrato`).transaction(val => (val || 0) + extra);
        alert("¡Contrato extendido!");
    }
}

function liberarProceso() {
    let id = document.getElementById('select-jugador-gestion').value;
    if (!id) return;
    if (confirm("¿Estás seguro de liberar al jugador? Recuperarás los salarios restantes.")) {
        db.ref('equipos/' + equipoActualID).once('value', snap => {
            let data = snap.val();
            let jug = data.jugadores[id];
            let reembolso = jug.salario * jug.contrato;
            db.ref(`equipos/${equipoActualID}/jugadores/${id}`).remove();
            db.ref(`equipos/${equipoActualID}/presupuesto`).set(data.presupuesto + reembolso);
        });
    }
}

function enviarPropuesta() {
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    let target = document.getElementById('select-jugador-rival');
    let oferta = {
        de: equipoActualID,
        jugador: target.options[target.selectedIndex].text,
        monto: document.getElementById('nego-oferta').value,
        cambio: document.getElementById('nego-cambio').value || "Ninguno"
    };
    db.ref('negociaciones/' + rival).set(oferta);
    alert("🚀 Oferta enviada al rival");
}

function escucharNegociaciones() {
    db.ref('negociaciones/' + equipoActualID).on('value', snap => {
        let of = snap.val();
        if (of) {
            document.getElementById('modal-oferta').classList.remove('hidden');
            document.getElementById('oferta-content').innerHTML = `
                <p><b>${of.de}</b> quiere a <b>${of.jugador}</b></p>
                <p>Ofrece: <b>${of.monto} MDD</b></p>
                <p>Cambio: <b>${of.cambio}</b></p>
            `;
        }
    });
}

function cerrarOferta() {
    db.ref('negociaciones/' + equipoActualID).remove();
    document.getElementById('modal-oferta').classList.add('hidden');
}

// UI Helpers
function togglePhone() { document.getElementById('phone-container').classList.toggle('phone-hidden'); }
function openTab(id) {
    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function actualizarSelects(jugadores) {
    const selGesto = document.getElementById('select-jugador-gestion');
    const selRival = document.getElementById('select-jugador-rival');
    if (selGesto) {
        selGesto.innerHTML = "";
        if (jugadores) Object.keys(jugadores).forEach(id => {
            selGesto.innerHTML += `<option value="${id}">${jugadores[id].nombre}</option>`;
        });
    }
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    db.ref(`equipos/${rival}/jugadores`).once('value', snap => {
        if (selRival) {
            selRival.innerHTML = "";
            snap.forEach(c => { selRival.innerHTML += `<option value="${c.key}">${c.val().nombre}</option>`; });
        }
    });
}
