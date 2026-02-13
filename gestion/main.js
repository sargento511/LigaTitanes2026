// CONFIGURACIÓN PROPORCIONADA
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

let myTeam = "";
let enemyTeam = "";
let teamData = null;

// --- 1. LÓGICA DE LA TABLA DE SALARIOS (RELLENA AQUÍ) ---
function obtenerValoresSegunTabla(valor) {
    let salario = 0;
    let prima = 0;

    // Ejemplo basado en lógica común, ajusta según tu imagen:
    if (valor < 1000000) {
        salario = valor * 0.15;
        prima = valor * 0.05;
    } else if (valor >= 1000000 && valor < 5000000) {
        salario = valor * 0.10;
        prima = valor * 0.08;
    } else {
        salario = valor * 0.08;
        prima = valor * 0.12;
    }

    return { salario: Math.round(salario), prima: Math.round(prima) };
}

// --- 2. INICIALIZACIÓN ---
function initApp(name, logo) {
    myTeam = name;
    enemyTeam = (name === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('current-logo').src = logo;
    document.getElementById('current-team-name').innerText = name;

    // Escuchar datos de mi equipo en tiempo real
    db.ref('equipos/' + myTeam).on('value', snapshot => {
        teamData = snapshot.val() || { presupuesto: 100000000, jugadores: {}, estadio: "Estadio Nuevo", capacidad: 0 };
        renderUI();
    });

    // Escuchar ofertas entrantes
    db.ref('negociaciones/' + myTeam).on('value', snapshot => {
        const oferta = snapshot.val();
        if (oferta && oferta.estado === "pendiente") {
            mostrarModalOferta(oferta);
        }
    });
}

function renderUI() {
    document.getElementById('display-budget').innerText = `$${teamData.presupuesto.toLocaleString()}`;
    document.getElementById('display-stadium').innerText = teamData.estadio;
    document.getElementById('display-cap').innerText = teamData.capacidad;

    const tableBody = document.getElementById('player-table');
    const selectReno = document.getElementById('select-player-action');
    tableBody.innerHTML = "";
    selectReno.innerHTML = "";

    if (teamData.jugadores) {
        Object.keys(teamData.jugadores).forEach(id => {
            const p = teamData.jugadores[id];
            tableBody.innerHTML += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>$${p.valor.toLocaleString()}</td>
                    <td>$${p.salario.toLocaleString()}</td>
                    <td>$${p.prima.toLocaleString()}</td>
                    <td>${p.contrato} años</td>
                </tr>
            `;
            selectReno.innerHTML += `<option value="${id}">${p.nombre}</option>`;
        });
    }

    // Cargar jugadores del rival para negociar
    db.ref('equipos/' + enemyTeam + '/jugadores').once('value', snap => {
        const selectNego = document.getElementById('select-target-player');
        selectNego.innerHTML = "";
        snap.forEach(child => {
            selectNego.innerHTML += `<option value="${child.key}">${child.val().nombre}</option>`;
        });
    });
}

// --- 3. ACCIONES DEL CELULAR ---
function updateCalculations() {
    const valor = document.getElementById('new-value').value;
    const calc = obtenerValoresSegunTabla(valor);
    document.getElementById('res-salary').innerText = `$${calc.salario.toLocaleString()}`;
    document.getElementById('res-bonus').innerText = `$${calc.prima.toLocaleString()}`;
}

function ficharJugador() {
    const nombre = document.getElementById('new-name').value;
    const valor = parseInt(document.getElementById('new-value').value);
    const años = parseInt(document.getElementById('new-years').value);
    const calc = obtenerValoresSegunTabla(valor);

    if (teamData.presupuesto >= valor) {
        const newRef = db.ref('equipos/' + myTeam + '/jugadores').push();
        newRef.set({ nombre, valor, salario: calc.salario, prima: calc.prima, contrato: años });
        db.ref('equipos/' + myTeam).update({ presupuesto: teamData.presupuesto - valor });
        alert("¡Jugador Contratado!");
    } else {
        alert("Presupuesto insuficiente");
    }
}

function liberarJugador() {
    const id = document.getElementById('select-player-action').value;
    const p = teamData.jugadores[id];
    // Reembolso de salarios por años restantes
    const reembolso = p.salario * p.contrato;
    
    db.ref('equipos/' + myTeam + '/jugadores/' + id).remove();
    db.ref('equipos/' + myTeam).update({ presupuesto: teamData.presupuesto + reembolso });
    alert("Jugador liberado y salarios recuperados.");
}

function renovarJugador() {
    const id = document.getElementById('select-player-action').value;
    const añosExtra = parseInt(document.getElementById('reno-years').value);
    const p = teamData.jugadores[id];
    const calc = obtenerValoresSegunTabla(p.valor);
    
    const costoPrima = calc.prima * añosExtra;

    if (teamData.presupuesto >= costoPrima) {
        db.ref('equipos/' + myTeam + '/jugadores/' + id).update({
            contrato: parseInt(p.contrato) + añosExtra
        });
        db.ref('equipos/' + myTeam).update({ presupuesto: teamData.presupuesto - costoPrima });
        alert("Contrato renovado.");
    } else {
        alert("No hay dinero para la prima.");
    }
}

// --- 4. NEGOCIACIÓN EN TIEMPO REAL ---
function enviarOferta() {
    const playerID = document.getElementById('select-target-player').value;
    const playerName = document.getElementById('select-target-player').options[document.getElementById('select-target-player').selectedIndex].text;
    const dinero = parseInt(document.getElementById('nego-money').value);
    const intercambio = document.getElementById('nego-exchange').value;

    db.ref('negociaciones/' + enemyTeam).set({
        desde: myTeam,
        playerID: playerID,
        playerName: playerName,
        dinero: dinero,
        intercambio: intercambio,
        estado: "pendiente"
    });
    alert("Oferta enviada al rival...");
}

function mostrarModalOferta(oferta) {
    const modal = document.getElementById('offer-modal');
    const info = document.getElementById('offer-details');
    info.innerHTML = `
        <p><b>${oferta.desde}</b> quiere a <b>${oferta.playerName}</b></p>
        <p>Ofrecen: $${oferta.dinero.toLocaleString()}</p>
        ${oferta.intercambio ? `<p>Más el jugador: ${oferta.intercambio}</p>` : ""}
    `;
    modal.classList.remove('hidden');
}

function responderOferta(status) {
    db.ref('negociaciones/' + myTeam).once('value', snap => {
        const oferta = snap.val();
        if (status === 'aceptada') {
            // Lógica de traspaso instantáneo aquí (ejercicio de mover nodos)
            alert("Has aceptado. (Debes configurar los años de contrato del nuevo jugador)");
            // Aquí se moverían los datos del jugador de un equipo a otro en Firebase
        }
        db.ref('negociaciones/' + myTeam).remove();
        document.getElementById('offer-modal').classList.add('hidden');
    });
}

// Auxiliares UI
function togglePhone() { document.getElementById('phone-wrapper').classList.toggle('phone-closed'); }
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}
function updateStadium() {
    const n = document.getElementById('conf-stadium').value;
    const c = document.getElementById('conf-cap').value;
    db.ref('equipos/' + myTeam).update({ estadio: n, capacidad: c });
}
