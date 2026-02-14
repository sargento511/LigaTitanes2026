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

    // Datos en tiempo real
    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('info-presupuesto').innerText = `${data.presupuesto || 0} MDD`;
            document.getElementById('input-presupuesto').value = data.presupuesto || 0;
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            renderizarJugadores(data.jugadores);
            actualizarSelectPropio(data.jugadores);
            actualizarSelectRival();
        }
    });

   // Escuchar ofertas (Corregido para que no bloquee la entrada)
    db.ref('negociaciones/' + nombreEquipo).on('value', (snap) => {
        const of = snap.val();
        const modal = document.getElementById('modal-oferta');
        const content = document.getElementById('oferta-content');

        if (of && modal && content) {
            ofertaRecibida = of;
            modal.classList.remove('hidden');
            
            // Verificamos si hay intercambio de forma segura
            let textoExtra = of.jugadorOfrecidoNombre ? ` + <b>${of.jugadorOfrecidoNombre}</b>` : "";
            
            content.innerHTML = `
                <p><b>${of.de}</b> quiere a <b>${of.jugadorNombre}</b></p>
                <p>Ofrece: <b>${of.monto} MDD</b>${textoExtra}</p>
            `;
        } else if (modal) {
            modal.classList.add('hidden');
        }
    });
    
// LÓGICA DE FINANZAS
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
    const v = parseFloat(document.getElementById('calc-valor').value) || 0;
    const f = calcularFinanzas(v);
    document.getElementById('res-salario').innerText = f.salario;
    document.getElementById('res-prima').innerText = f.prima;
}

// ACCIONES
function contratarJugador() {
    const nombre = document.getElementById('calc-nombre').value;
    const valor = parseFloat(document.getElementById('calc-valor').value) || 0;
    const contrato = parseInt(document.getElementById('calc-contrato').value) || 0;
    const f = calcularFinanzas(valor);

    // Validación básica de campos
    if (!nombre || valor <= 0 || contrato <= 0) return alert("Llena todo");

    // Referencia al equipo actual para verificar presupuesto
    const refEquipo = db.ref(`equipos/${equipoActualID}`);
    
    refEquipo.once('value', snap => {
        const equipo = snap.val();
        const presupuestoActual = equipo.presupuesto || 0;

        // 1. Validar si el equipo tiene dinero suficiente para pagar el VALOR del jugador
        if (presupuestoActual < valor) {
            return alert(`❌ Fondos insuficientes. El jugador cuesta ${valor} MDD y tu presupuesto actual es de ${presupuestoActual} MDD.`);
        }

        // 2. Preparar el objeto del nuevo jugador
        const nuevoJugador = {
            nombre, 
            valor, 
            contrato, 
            salario: f.salario, 
            prima: f.prima
        };

        // 3. Calcular el nuevo presupuesto tras la compra
        const nuevoPresupuesto = presupuestoActual - valor;

        // 4. Actualizar Firebase: Restar dinero y luego agregar jugador
        refEquipo.update({
            presupuesto: nuevoPresupuesto
        }).then(() => {
            // Una vez descontado el dinero, se añade el jugador a la lista
            refEquipo.child('jugadores').push(nuevoJugador);
            alert(`✅ ¡Fichaje completado!\n⚽ Jugador: ${nombre}\n💰 Costo: ${valor} MDD\n📉 Nuevo Presupuesto: ${nuevoPresupuesto} MDD`);
        }).catch(error => {
            console.error("Error en el fichaje:", error);
            alert("Hubo un error al procesar el fichaje.");
        });
    });
}
function renovarJugador() {
    const id = document.getElementById('select-jugador-gestion').value;
    const masAnos = parseInt(document.getElementById('reno-anos-input').value) || 0;
    
    if (!id || masAnos <= 0) return alert("Selecciona un jugador y los años a sumar.");

    // Referencia al equipo para obtener presupuesto y datos del jugador
    db.ref(`equipos/${equipoActualID}`).once('value', snap => {
        const equipo = snap.val();
        const jugador = equipo.jugadores[id];
        
        // Calculamos la prima según el valor actual del jugador (usando tu lógica de finanzas)
        const f = calcularFinanzas(jugador.valor);
        const costoPrimaUnica = f.prima; // Se cobra solo una vez por renovación

        // Validar si el equipo tiene dinero suficiente para pagar la prima
        if (equipo.presupuesto < costoPrimaUnica) {
            return alert(`Presupuesto insuficiente. Necesitas ${costoPrimaUnica} MDD para pagar la prima de renovación.`);
        }

        // Calcular nuevos valores
        const nuevoContrato = parseInt(jugador.contrato) + masAnos;
        const nuevoPresupuesto = equipo.presupuesto - costoPrimaUnica;

        // Actualizar Firebase: restamos la prima del presupuesto y sumamos los años
        db.ref(`equipos/${equipoActualID}`).update({
            presupuesto: nuevoPresupuesto,
            [`jugadores/${id}/contrato`]: nuevoContrato
        }).then(() => {
            alert(`✅ Renovación exitosa: ${jugador.nombre}\n💰 Prima pagada: ${costoPrimaUnica} MDD\n📅 Nuevo contrato: ${nuevoContrato} años`);
        });
    });
}

function liberarProceso() {
    const id = document.getElementById('select-jugador-gestion').value;
    if (!id) return;

    if (confirm("¿Despedir jugador? Pagarás (Sueldo x Años restantes) como indemnización.")) {
        db.ref(`equipos/${equipoActualID}`).once('value', snap => {
            const equipo = snap.val();
            const jugador = equipo.jugadores[id];
            const costo = jugador.salario * jugador.contrato;

            db.ref(`equipos/${equipoActualID}/presupuesto`).set(equipo.presupuesto - costo);
            db.ref(`equipos/${equipoActualID}/jugadores/${id}`).remove();
        });
    }
}

// --- FUNCIÓN NUEVA: VENDER AL 50% ---
function venderJugadorMitad() {
    const idJugador = document.getElementById('select-jugador-gestion').value;
    if (!idJugador) return alert("Selecciona un jugador");

    const refEquipo = db.ref('equipos/' + equipoActualID);
    refEquipo.once('value', snapshot => {
        const data = snapshot.val();
        const jugador = data.jugadores[idJugador];
        const valorVenta = parseFloat(jugador.valor) * 0.5;

        if (!confirm(`¿Vender a ${jugador.nombre} por ${valorVenta} MDD (50% de su valor)?`)) return;

        const nuevoPresupuesto = (parseFloat(data.presupuesto) || 0) + valorVenta;
        let jugadoresActualizados = { ...data.jugadores };
        delete jugadoresActualizados[idJugador];

        refEquipo.update({
            presupuesto: nuevoPresupuesto,
            jugadores: jugadoresActualizados
        }).then(() => alert("Venta completada"));
    });
}

function enviarPropuesta() {
    const rivalID = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    const jRivalID = document.getElementById('select-jugador-rival').value;
    const monto = parseFloat(document.getElementById('nego-oferta').value) || 0;
    const jPropioID = document.getElementById('select-jugador-intercambio').value;

    if (!jRivalID) return alert("Selecciona qué jugador quieres comprar.");

    db.ref(`equipos/${rivalID}/jugadores/${jRivalID}`).once('value', snap => {
        const dataRival = snap.val();
        let datos = {
            de: equipoActualID,
            jugadorID: jRivalID,
            jugadorNombre: dataRival.nombre,
            monto: monto
        };

        if (jPropioID) {
            db.ref(`equipos/${equipoActualID}/jugadores/${jPropioID}`).once('value', s => {
                datos.jugadorOfrecidoID = jPropioID;
                datos.jugadorOfrecidoNombre = s.val().nombre;
                db.ref('negociaciones/' + rivalID).set(datos);
            });
        } else {
            db.ref('negociaciones/' + rivalID).set(datos);
        }
        alert("¡Oferta enviada con éxito!");
    });
}

function aceptarOferta() {
    const of = ofertaRecibida;
    const comprador = of.de;
    const vendedor = equipoActualID;

    db.ref(`equipos/${vendedor}`).once('value', snapV => {
        const dataV = snapV.val();
        const j = dataV.jugadores[of.jugadorID];

        db.ref(`equipos/${comprador}`).once('value', snapC => {
            const dataC = snapC.val();
            
            // 1. Cobrar al comprador
            db.ref(`equipos/${comprador}/presupuesto`).set(dataC.presupuesto - of.monto);
            // 2. Pagar al vendedor
            db.ref(`equipos/${vendedor}/presupuesto`).set(dataV.presupuesto + of.monto);
            // 3. Mover jugador
            db.ref(`equipos/${comprador}/jugadores`).push(j);
            db.ref(`equipos/${vendedor}/jugadores/${of.jugadorID}`).remove();
            
            cerrarOferta();
            alert("Trato cerrado!");
        });
    });
}

function contraofertar() {
    cerrarOferta();
    togglePhone();
    openTab('tab-nego');
}

function cerrarOferta() {
    db.ref('negociaciones/' + equipoActualID).remove();
    document.getElementById('modal-oferta').classList.add('hidden');
}

// HELPERS UI
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
    const selInter = document.getElementById('select-jugador-intercambio');
    
    if (sel) sel.innerHTML = "";
    if (selInter) selInter.innerHTML = '<option value="">Solo dinero</option>';

    if (jugadores) {
        Object.keys(jugadores).forEach(id => {
            const j = jugadores[id];
            const opt = `<option value="${id}">${j.nombre}</option>`;
            if (sel) sel.innerHTML += opt;
            if (selInter) selInter.innerHTML += opt; 
        });
    }
}

function actualizarSelectRival() {
    const rival = (equipoActualID === "HALCONES ROJOS") ? "DEPORTIVO FEDERAL" : "HALCONES ROJOS";
    const selRival = document.getElementById('select-jugador-rival');
    db.ref(`equipos/${rival}/jugadores`).once('value', snap => {
        const jugadores = snap.val();
        selRival.innerHTML = "";
        if (jugadores) Object.keys(jugadores).forEach(id => selRival.innerHTML += `<option value="${id}">${jugadores[id].nombre}</option>`);
    });
}

// --- FINALIZAR TEMPORADA (VERSIÓN DEFINITIVA) ---
function finalizarTemporada() {
    if (!confirm("¿Finalizar temporada? Se cobrarán salarios y se restará 1 año de contrato.")) return;

    const refEquipo = db.ref('equipos/' + equipoActualID);
    refEquipo.once('value', snapshot => {
        const data = snapshot.val();
        if (!data || !data.jugadores) return;

        let jugadoresActualizados = { ...data.jugadores };
        let mensajes = [];
        let totalSalarios = 0;

        Object.keys(jugadoresActualizados).forEach(id => {
            let j = jugadoresActualizados[id];
            
            // 1. Sumar salario para cobrarlo
            totalSalarios += parseFloat(j.salario || 0);
            
            // 2. Restar año de contrato
            j.contrato = parseInt(j.contrato) - 1;

            if (j.contrato <= 0) {
                mensajes.push(`❌ ${j.nombre} terminó contrato.`);
                delete jugadoresActualizados[id];
            }
        });

        // 3. Calcular nuevo presupuesto restando salarios
        const nuevoPresupuesto = (data.presupuesto || 0) - totalSalarios;

        // 4. Guardar todo (Presupuesto, Jugadores y Configuración de Estadio)
        refEquipo.update({
            presupuesto: nuevoPresupuesto,
            estadio: document.getElementById('input-estadio').value || data.estadio,
            capacidad: document.getElementById('input-capacidad').value || data.capacidad,
            jugadores: jugadoresActualizados
        }).then(() => {
            alert(`✅ Temporada cerrada.\n💰 Salarios pagados: ${totalSalarios} MDD.\n📉 Nuevo presupuesto: ${nuevoPresupuesto} MDD.`);
            if (mensajes.length > 0) alert("Resumen: " + mensajes.join("\n"));
        });
    });
}
function guardarConfiguracion() {
    db.ref('equipos/' + equipoActualID).update({
        presupuesto: parseFloat(document.getElementById('input-presupuesto').value) || 0,
        estadio: document.getElementById('input-estadio').value,
        capacidad: document.getElementById('input-capacidad').value
    });
    alert("Datos guardados");
}
