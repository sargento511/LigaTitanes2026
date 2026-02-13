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

function entrarEquipo(nombre, logo) {
    equipoActualID = nombre;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('header-name').innerText = nombre;
    document.getElementById('header-logo').src = logo;

    // Datos propios en tiempo real
    db.ref('equipos/' + nombre).on('value', snap => {
        const data = snap.val();
        if(data) {
            document.getElementById('info-presupuesto').innerText = `${data.presupuesto} MDD`;
            document.getElementById('info-estadio').innerText = data.estadio || "Estadio Municipal";
            renderizarTabla(data.jugadores);
            actualizarSelectPropio(data.jugadores);
        }
    });

    // LISTA DEL RIVAL EN VIVO para negociar
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    db.ref(`equipos/${rival}/jugadores`).on('value', snap => {
        const sel = document.getElementById('select-jugador-rival');
        sel.innerHTML = '<option value="">-- Seleccionar Objetivo --</option>';
        snap.forEach(child => {
            sel.innerHTML += `<option value="${child.key}">${child.val().nombre}</option>`;
        });
    });

    // Escuchar ofertas entrantes
    db.ref('negociaciones/' + equipoActualID).on('value', snap => {
        ofertaRecibida = snap.val();
        if(ofertaRecibida) {
            document.getElementById('modal-oferta').classList.remove('hidden');
            document.getElementById('oferta-content').innerHTML = `
                <p><b>${ofertaRecibida.de}</b> ofrece <b>${ofertaRecibida.monto} MDD</b></p>
                <p>Por: <b>${ofertaRecibida.jugadorNombre}</b></p>
            `;
        }
    });
}

function calcularFinanzas(v) {
    let s=0, p=0;
    if(v>=120){s=22;p=7}else if(v>=90){s=18;p=5}else if(v>=70){s=14;p=4}else if(v>=50){s=11;p=3}else if(v>=30){s=8;p=2}else if(v>=20){s=5;p=1.5}else if(v>=10){s=3;p=1}else if(v>=5){s=1.5;p=0.7}else{s=0.8;p=0.4}
    return {salario:s, prima:p};
}

function actualizarCalculos() {
    let v = parseFloat(document.getElementById('calc-valor').value) || 0;
    let r = calcularFinanzas(v);
    document.getElementById('res-salario').innerText = r.salario;
    document.getElementById('res-prima').innerText = r.prima;
}

function contratarJugador() {
    let n = document.getElementById('calc-nombre').value;
    let v = parseFloat(document.getElementById('calc-valor').value);
    let a = parseInt(document.getElementById('calc-contrato').value);
    let f = calcularFinanzas(v);
    
    if(n && v > 0 && a > 0) {
        db.ref('equipos/'+equipoActualID).transaction(d => {
            if(d && d.presupuesto >= v) {
                d.presupuesto -= v;
                if(!d.jugadores) d.jugadores = {};
                d.jugadores[Date.now()] = { nombre:n, valor:v, salario:f.salario, prima:f.prima, contrato:a };
                return d;
            }
        }).then(() => {
            alert("Fichaje Exitoso");
            document.getElementById('calc-nombre').value = "";
        });
    }
}

function liberarJugador() {
    let id = document.getElementById('select-jugador-gestion').value;
    if(!id) return;
    db.ref(`equipos/${equipoActualID}`).once('value', snap => {
        let d = snap.val();
        let j = d.jugadores[id];
        let coste = j.salario * j.contrato;
        if(confirm(`Despedir cuesta ${coste} MDD (Sueldo x Contrato). ¿Proceder?`)) {
            if(d.presupuesto >= coste) {
                db.ref(`equipos/${equipoActualID}/presupuesto`).set(d.presupuesto - coste);
                db.ref(`equipos/${equipoActualID}/jugadores/${id}`).remove();
            } else alert("Presupuesto insuficiente");
        }
    });
}

function enviarPropuesta() {
    let rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    let sel = document.getElementById('select-jugador-rival');
    let monto = parseFloat(document.getElementById('nego-oferta').value);
    if(!sel.value || isNaN(monto)) return alert("Datos incompletos");

    db.ref('negociaciones/' + rival).set({
        de: equipoActualID,
        jugadorID: sel.value,
        jugadorNombre: sel.options[sel.selectedIndex].text,
        monto: monto
    });
    alert("Oferta enviada");
}

function aceptarOferta() {
    const { de: comprador, jugadorID, monto } = ofertaRecibida;
    db.ref(`equipos/${comprador}`).once('value', sComp => {
        let dComp = sComp.val();
        if(dComp.presupuesto >= monto) {
            db.ref(`equipos/${equipoActualID}/jugadores/${jugadorID}`).once('value', sJug => {
                let jData = sJug.val();
                db.ref(`equipos/${equipoActualID}/jugadores/${jugadorID}`).remove();
                db.ref(`equipos/${equipoActualID}/presupuesto`).transaction(p => p + monto);
                db.ref(`equipos/${comprador}/jugadores/${jugadorID}`).set(jData);
                db.ref(`equipos/${comprador}/presupuesto`).set(dComp.presupuesto - monto);
                cerrarOferta();
                alert("Trato Cerrado!");
            });
        } else alert("El rival ya no tiene dinero.");
    });
}

function contraofertar() {
    db.ref('negociaciones/' + equipoActualID).remove();
    document.getElementById('modal-oferta').classList.add('hidden');
    if(document.getElementById('phone-container').classList.contains('phone-hidden')) togglePhone();
    openTab('tab-nego');
}

function cerrarOferta() {
    db.ref('negociaciones/' + equipoActualID).remove();
    document.getElementById('modal-oferta').classList.add('hidden');
}

function avanzarTemporada() {
    if(!confirm("¿Avanzar de año? Restará 1 año de contrato a todos.")) return;
    db.ref('equipos').once('value', snap => {
        let eqs = snap.val();
        Object.keys(eqs).forEach(e => {
            let js = eqs[e].jugadores;
            if(js) Object.keys(js).forEach(k => {
                let nc = js[k].contrato - 1;
                if(nc <= 0) db.ref(`equipos/${e}/jugadores/${k}`).remove();
                else db.ref(`equipos/${e}/jugadores/${k}/contrato`).set(nc);
            });
        });
    });
}

function togglePhone() { document.getElementById('phone-container').classList.toggle('phone-hidden'); }
function openTab(id) {
    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function renderizarTabla(js) {
    const b = document.getElementById('lista-jugadores');
    b.innerHTML = ""; let c = 0;
    if(js) Object.keys(js).forEach(k => {
        let j = js[k]; c++;
        b.innerHTML += `<tr><td>${j.nombre}</td><td>${j.valor}</td><td>${j.salario}</td><td>${j.contrato}a</td></tr>`;
    });
    document.getElementById('player-count').innerText = c;
}
function actualizarSelectPropio(js) {
    const s = document.getElementById('select-jugador-gestion');
    s.innerHTML = "";
    if(js) Object.keys(js).forEach(k => s.innerHTML += `<option value="${k}">${js[k].nombre}</option>`);
}
