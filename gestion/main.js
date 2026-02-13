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
let ofertaRecibida = null;

// TABLA DE FINANZAS (MDD)
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

// GESTIÓN DE EQUIPO
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
    db.ref('equipos/' + equipoActualID).update({
        presupuesto: parseFloat(document.getElementById('input-presupuesto').value) || 0,
        estadio: document.getElementById('input-estadio').value,
        capacidad: document.getElementById('input-capacidad').value,
        tamano: document.getElementById('input-tamano').value
    }).then(() => alert("✅ Datos actualizados"));
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

// LÓGICA DE TEMPORADA
function avanzarTemporada() {
    if (!confirm("⚠️ ¿Finalizar temporada? Los contratos bajarán 1 año y se perderán los que lleguen a 0.")) return;
    db.ref('equipos').once('value', snap => {
        let equipos = snap.val();
        Object.keys(equipos).forEach(eKey => {
            let jList = equipos[eKey].jugadores;
            if (jList) {
                Object.keys(jList).forEach(jKey => {
                    let c = jList[jKey].contrato - 1;
                    if (c <= 0) db.ref(`equipos/${eKey}/jugadores/${jKey}`).remove();
                    else db.ref(`equipos/${eKey}/jugadores/${jKey}/contrato`).set(c);
                });
            }
        });
        alert("🗓️ Temporada actualizada.");
    });
}

// CELULAR: FICHAR Y RENOVAR
function contratarJugador() {
    let n = document.getElementById('calc-nombre').value;
    let v = parseFloat(document.getElementById('calc-valor').value);
    let a = parseInt(document.getElementById('calc-contrato').value);
    let f = calcularFinanzas(v);
    if (n && v > 0 && a > 0) {
        db.ref('equipos/' + equipoActualID).transaction(d => {
            if (d && d.presupuesto >= v) {
                d.presupuesto -= v;
                if (!d.jugadores) d.jugadores = {};
                d.jugadores[Date.now()] = { nombre: n, valor: v, salario: f.salario, prima: f.prima, contrato: a };
                return d;
            } else { alert("Saldo insuficiente"); return; }
        });
    }
}

function renovarJugador() {
    let id = document.getElementById('select-jugador-gestion').value;
    let extra = parseInt(document.getElementById('reno-anos-input').value) || 0;
    if (id && extra > 0) {
        db.ref(`equipos/${equipoActualID}/jugadores/${id}/contrato`).transaction(c => (c || 0) + extra);
        alert("✍️ Renovación exitosa");
    }
}

// CELULAR: LIBERAR (PENALIZACIÓN)
function liberarProceso() {
    let id = document.getElementById('select-jugador-gestion').value;
    if (!id) return;
    db.ref('equipos/' + equipoActualID).once('value', snap => {
        let data = snap.val();
        let j = data.jugadores[id];
        let coste = j.salario * j.contrato;
        if (confirm(`Despedir a ${j.nombre} te costará ${coste} MDD (Sueldo restante). ¿Proceder?`)) {
            if (data.presupuesto >= coste) {
                db.ref(`equipos/${equipoActualID}/jugadores/${id}`).remove();
                db.ref(`equipos/${equipoActualID}/presupuesto`).set(data.presupuesto - coste);
                alert("Jugador despedido. Dinero restado del presupuesto.");
            } else alert("No tienes dinero para pagar el finiquito.");
        }
    });
}

// NEGOCIACIÓN
function enviarPropuesta() {
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    let sel = document.getElementById('select-jugador-rival');
    let oferta = {
        de: equipoActualID,
        jugadorID: sel.value,
        jugadorNombre: sel.options[sel.selectedIndex].text,
        monto: parseFloat(document.getElementById('nego-oferta').value) || 0
    };
    db.ref('negociaciones/' + rival).set(oferta);
    alert("🚀 Oferta enviada al rival");
}

function escucharNegociaciones() {
    db.ref('negociaciones/' + equipoActualID).on('value', snap => {
        ofertaRecibida = snap.val();
        if (ofertaRecibida) {
            document.getElementById('modal-oferta').classList.remove('hidden');
            document.getElementById('oferta-content').innerHTML = `
                <p><b>${ofertaRecibida.de}</b> ofrece <b>${ofertaRecibida.monto} MDD</b></p>
                <p>Por: <b>${ofertaRecibida.jugadorNombre}</b></p>
            `;
        }
    });
}

function aceptarOferta() {
    if (!ofertaRecibida) return;
    const { de: comprador, jugadorID, jugadorNombre, monto } = ofertaRecibida;
    const vendedor = equipoActualID;

    db.ref(`equipos/${comprador}`).once('value', sComp => {
        let dataComp = sComp.val();
        if (dataComp.presupuesto < monto) {
            alert("El comprador ya no tiene dinero.");
            cerrarOferta();
            return;
        }
        // Ejecutar Transferencia
        db.ref(`equipos/${vendedor}/jugadores/${jugadorID}`).once('value', sJug => {
            let datosJugador = sJug.val();
            // 1. Quitar al vendedor y darle su dinero
            db.ref(`equipos/${vendedor}/jugadores/${jugadorID}`).remove();
            db.ref(`equipos/${vendedor}/presupuesto`).transaction(p => (p || 0) + monto);
            // 2. Dar al comprador y quitarle su dinero
            db.ref(`equipos/${comprador}/jugadores/${jugadorID}`).set(datosJugador);
            db.ref(`equipos/${comprador}/presupuesto`).set(dataComp.presupuesto - monto);
            
            alert("🤝 Trato cerrado!");
            cerrarOferta();
        });
    });
}

function cerrarOferta() {
    db.ref('negociaciones/' + equipoActualID).remove();
    document.getElementById('modal-oferta').classList.add('hidden');
}

// UI HELPERS
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
        if (jugadores) Object.keys(jugadores).forEach(id => selGesto.innerHTML += `<option value="${id}">${jugadores[id].nombre}</option>`);
    }
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    db.ref(`equipos/${rival}/jugadores`).once('value', snap => {
        if (selRival) {
            selRival.innerHTML = "";
            snap.forEach(c => selRival.innerHTML += `<option value="${c.key}">${c.val().nombre}</option>`);
        }
    });
}
