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

// ENTRAR AL EQUIPO
function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    // Escucha datos propios
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
            actualizarSelectPropio(data.jugadores);
        }
    });

    escucharJugadoresRival(); // Corregido: Ahora escucha siempre
    escucharNegociaciones();
}

// ESCUCHA JUGADORES RIVALES (Solución Fekir/Kubo)
function escucharJugadoresRival() {
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    db.ref(`equipos/${rival}/jugadores`).on('value', snap => {
        const selRival = document.getElementById('select-jugador-rival');
        if (selRival) {
            selRival.innerHTML = "";
            snap.forEach(child => {
                selRival.innerHTML += `<option value="${child.key}">${child.val().nombre}</option>`;
            });
        }
    });
}

// FINANZAS
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

// ACCIONES
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
            }
        });
    }
}

function liberarProceso() {
    let id = document.getElementById('select-jugador-gestion').value;
    if (!id) return;
    db.ref('equipos/' + equipoActualID).once('value', snap => {
        let data = snap.val();
        let j = data.jugadores[id];
        let coste = j.salario * j.contrato;
        if (confirm(`Despedir a ${j.nombre} cuesta ${coste} MDD. ¿Confirmar?`)) {
            if (data.presupuesto >= coste) {
                db.ref(`equipos/${equipoActualID}/jugadores/${id}`).remove();
                db.ref(`equipos/${equipoActualID}/presupuesto`).set(data.presupuesto - coste);
            } else alert("Presupuesto insuficiente para finiquito.");
        }
    });
}

function avanzarTemporada() {
    if (!confirm("¿Cerrar temporada? Los contratos bajan 1 año.")) return;
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
        alert("🗓️ Temporada terminada.");
    });
}

// NEGOCIACIÓN
function enviarPropuesta() {
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    let sel = document.getElementById('select-jugador-rival');
    if (!sel.value) return;
    let oferta = {
        de: equipoActualID,
        jugadorID: sel.value,
        jugadorNombre: sel.options[sel.selectedIndex].text,
        monto: parseFloat(document.getElementById('nego-oferta').value) || 0
    };
    db.ref('negociaciones/' + rival).set(oferta);
    alert("🚀 Oferta enviada.");
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
    const { de: comprador, jugadorID, monto } = ofertaRecibida;
    const vendedor = equipoActualID;

    db.ref(`equipos/${comprador}`).once('value', sComp => {
        let dComp = sComp.val();
        if (dComp.presupuesto >= monto) {
            db.ref(`equipos/${vendedor}/jugadores/${jugadorID}`).once('value', sJug => {
                let datosJ = sJug.val();
                db.ref(`equipos/${vendedor}/jugadores/${jugadorID}`).remove();
                db.ref(`equipos/${vendedor}/presupuesto`).transaction(p => p + monto);
                db.ref(`equipos/${comprador}/jugadores/${jugadorID}`).set(datosJ);
                db.ref(`equipos/${comprador}/presupuesto`).set(dComp.presupuesto - monto);
                cerrarOferta();
            });
        } else alert("El comprador ya no tiene dinero.");
    });
}

function contraofertar() {
    cerrarOferta();
    if(document.getElementById('phone-container').classList.contains('phone-hidden')) togglePhone();
    openTab('tab-nego');
    alert("Prepara tu contraoferta en el menú de Negociación.");
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
function renderizarJugadores(jugadores) {
    const tbody = document.getElementById('lista-jugadores');
    tbody.innerHTML = ""; let c = 0;
    if (jugadores) {
        Object.keys(jugadores).forEach(k => {
            let j = jugadores[k]; c++;
            tbody.innerHTML += `<tr><td>${j.nombre}</td><td>${j.valor}</td><td>${j.salario}</td><td>${j.prima}</td><td>${j.contrato}a</td></tr>`;
        });
    }
    document.getElementById('player-count').innerText = `${c} Jugadores`;
}
function actualizarSelectPropio(jugadores) {
    const sel = document.getElementById('select-jugador-gestion');
    if (sel) {
        sel.innerHTML = "";
        if (jugadores) Object.keys(jugadores).forEach(id => sel.innerHTML += `<option value="${id}">${jugadores[id].nombre}</option>`);
    }
}
function guardarConfiguracion() {
    db.ref('equipos/' + equipoActualID).update({
        presupuesto: parseFloat(document.getElementById('input-presupuesto').value) || 0,
        estadio: document.getElementById('input-estadio').value,
        capacidad: document.getElementById('input-capacidad').value,
        tamano: document.getElementById('input-tamano').value
    }).then(() => alert("✅ Guardado"));
}
