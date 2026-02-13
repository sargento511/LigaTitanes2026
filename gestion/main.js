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

function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    
    // UI: Cambiar pantallas
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // UI: Header
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    // Escuchar cambios en Firebase (Tiempo Real)
    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // 1. Actualizar Tarjetas Superiores
            document.getElementById('info-presupuesto').innerText = `$${(data.presupuesto || 0).toLocaleString()}`;
            document.getElementById('info-estadio').innerText = data.estadio || "Sin nombre";
            document.getElementById('info-capacidad').innerText = (data.capacidad || 0).toLocaleString();
            document.getElementById('info-tamano').innerText = data.tamano || "No definido";

            // 2. Sincronizar Inputs de Edición
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            document.getElementById('input-tamano').value = data.tamano || "";

            // 3. Renderizar Jugadores
            renderizarJugadores(data.jugadores);
        }
    });
}

function guardarConfiguracion() {
    if (!equipoActualID) return;

    const est = document.getElementById('input-estadio').value;
    const cap = parseInt(document.getElementById('input-capacidad').value) || 0;
    const tam = document.getElementById('input-tamano').value;

    db.ref('equipos/' + equipoActualID).update({
        estadio: est,
        capacidad: cap,
        tamano: tam
    }).then(() => {
        alert("✅ Sede actualizada correctamente");
    });
}

function renderizarJugadores(jugadores) {
    const tbody = document.getElementById('lista-jugadores');
    tbody.innerHTML = "";
    let count = 0;

    if (jugadores) {
        Object.keys(jugadores).forEach(key => {
            const j = jugadores[key];
            count++;
            tbody.innerHTML += `
                <tr>
                    <td>${j.nombre}</td>
                    <td>$${j.valor.toLocaleString()}</td>
                    <td>$${j.salario.toLocaleString()}</td>
                    <td>$${j.prima.toLocaleString()}</td>
                    <td>${j.contrato} años</td>
                </tr>
            `;
        });
    }
    document.getElementById('player-count').innerText = `${count} Jugadores`;
}

// ... (Mantén tu código anterior y añade esto abajo)

let rivalTeam = "";

// 1. Lógica de la Tabla de Sueldos y Primas
function calcularFinanzas(valor) {
    let v = parseFloat(valor) || 0;
    // Ajusta estos porcentajes según tu tabla de imagen
    let sueldo = v * 0.12; 
    let prima = v * 0.05;
    return { sueldo, prima };
}

function actualizarCalculos() {
    let val = document.getElementById('calc-valor').value;
    let res = calcularFinanzas(val);
    document.getElementById('res-salario').innerText = `$${Math.round(res.sueldo).toLocaleString()}`;
    document.getElementById('res-prima').innerText = `$${Math.round(res.prima).toLocaleString()}`;
}

// 2. Contratación
function contratarJugador() {
    let nombre = document.getElementById('calc-nombre').value;
    let valor = parseFloat(document.getElementById('calc-valor').value);
    let años = parseInt(document.getElementById('calc-contrato').value);
    let res = calcularFinanzas(valor);

    if (equipoActualID && nombre && valor > 0) {
        // Descontar valor del jugador del presupuesto
        db.ref('equipos/' + equipoActualID).transaction((data) => {
            if (data) {
                if (data.presupuesto >= valor) {
                    data.presupuesto -= valor;
                    if (!data.jugadores) data.jugadores = {};
                    let id = Date.now();
                    data.jugadores[id] = {
                        nombre: nombre, valor: valor, salario: res.sueldo, prima: res.prima, contrato: años
                    };
                } else { alert("Presupuesto insuficiente"); }
            }
            return data;
        });
    }
}

// 3. Liberar Jugador (Devuelve salarios de años restantes)
function liberarProceso() {
    let id = document.getElementById('select-jugador-gestion').value;
    db.ref('equipos/' + equipoActualID).once('value', snap => {
        let jug = snap.val().jugadores[id];
        let reembolso = jug.salario * jug.contrato;
        
        db.ref('equipos/' + equipoActualID + '/jugadores/' + id).remove();
        db.ref('equipos/' + equipoActualID).update({
            presupuesto: snap.val().presupuesto + reembolso
        });
    });
}

// 4. Negociaciones en Tiempo Real
function enviarPropuesta() {
    rivalTeam = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    let oferta = {
        emisor: equipoActualID,
        target: document.getElementById('select-jugador-rival').options[document.getElementById('select-jugador-rival').selectedIndex].text,
        targetID: document.getElementById('select-jugador-rival').value,
        dinero: document.getElementById('nego-oferta').value,
        cambio: document.getElementById('nego-cambio').value,
        status: "pendiente"
    };
    db.ref('negociaciones/' + rivalTeam).set(oferta);
    alert("Oferta enviada al instante!");
}

// Escuchador de ofertas (Ponlo dentro de entrarEquipo)
function activarEscuchaNegociaciones() {
    db.ref('negociaciones/' + equipoActualID).on('value', snap => {
        let of = snap.val();
        if (of && of.status === "pendiente") {
            document.getElementById('modal-oferta').classList.remove('hidden');
            document.getElementById('oferta-content').innerHTML = `
                <p>Quieren a: <b>${of.target}</b></p>
                <p>Ofrecen: <b>$${of.dinero}</b> ${of.cambio ? 'y a ' + of.cambio : ''}</p>
            `;
        }
    });
}

// UI Helpers
function togglePhone() { document.getElementById('phone-container').classList.toggle('phone-hidden'); }
function openTab(id) {
    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
