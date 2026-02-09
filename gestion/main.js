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
let idActual = "";

const DATOS_INICIALES = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal (Grande)',
        jugadores: [{ nombre: 'Jugador Prueba', valor: 0, salario: 0, prima: 0, enVenta: false, contrato: 2 }]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja (Gigante)',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, enVenta: false, contrato: 2 },
            { nombre: 'Puchacz', valor: 1.5, salario: 1.5, prima: 0.7, enVenta: false, contrato: 2 },
            { nombre: 'Kimpembe', valor: 4, salario: 8, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Yan Couto', valor: 20, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'David Raum', valor: 20, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'DeAndre Yedlin', valor: 1, salario: 1, prima: 0.4, enVenta: false, contrato: 2 },
            { nombre: 'Yeray Álvarez', valor: 1, salario: 1, prima: 0.4, enVenta: false, contrato: 2 },
            { nombre: 'Unai Simón', valor: 25, salario: 8, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Luis Alberto', valor: 5, salario: 5, prima: 0.7, enVenta: false, contrato: 2 },
            { nombre: 'Pape Cissé', valor: 1, salario: 1, prima: 0.4, enVenta: false, contrato: 2 },
            { nombre: 'Granit Xhaka', valor: 10, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'Trindade', valor: 28, salario: 8, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Tomáš Souček', valor: 12, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'Gilberto Mora', valor: 10, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'Paul Pogba', valor: 5, salario: 6, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Daniel James', valor: 14, salario: 14, prima: 4, enVenta: false, contrato: 2 },
            { nombre: 'Samuel Chukwueze', valor: 10, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'Kaoru Mitoma', valor: 30, salario: 11, prima: 3, enVenta: false, contrato: 2 },
            { nombre: 'Antonio Nusa', valor: 32, salario: 11, prima: 3, enVenta: false, contrato: 2 },
            { nombre: 'Takefusa Kubo', valor: 30, salario: 11, prima: 3, enVenta: false, contrato: 2 },
            { nombre: 'Youssoufa Moukoko', valor: 7, salario: 5, prima: 1.5, enVenta: false, contrato: 2 },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, enVenta: false, contrato: 2 },
            { nombre: 'Aymeric Laporte', valor: 9, salario: 7, prima: 2, enVenta: false, contrato: 2 }
        ]
    }
};
// --- NUEVA FUNCIÓN PARA DIBUJAR OFERTAS ---
function dibujarOfertas() {
    const contenedor = document.getElementById('contenedor-ofertas');
    if (!contenedor || !idActual) return; // Si no hay equipo, no hace nada

    const misOfertas = todasLasOfertas[idActual] || {};
    contenedor.innerHTML = '';

    Object.keys(misOfertas).forEach(key => {
        const o = misOfertas[key];
        contenedor.innerHTML += `
            <div style="background:#222; padding:15px; margin:10px 0; border-radius:8px; border-left:5px solid #007bff; text-align:left;">
                <p>🚀 <b>${o.desde}</b> propone:</p>
                <p style="font-size:14px;">Quiere a: <b>${o.jugadorBuscado}</b></p>
                <p style="font-size:14px;">Ofrece: <b>$${o.dinero}M</b> ${o.jugadorOfrecido ? ' + ' + o.jugadorOfrecido : ''}</p>
                <div style="display:flex; gap:5px; margin-top:10px;">
                    <button onclick="aceptarOferta('${key}', '${o.idEmisor}')" style="background:#28a745; color:white; flex:1; padding:8px; cursor:pointer; border-radius:4px;">ACEPTAR</button>
                    <button onclick="prepararContraoferta('${key}', '${o.idEmisor}')" style="background:#ffc107; color:black; flex:1; padding:8px; cursor:pointer; border-radius:4px;">CONTRAOFERTA</button>
                    <button onclick="rechazarOferta('${key}')" style="background:#dc3545; color:white; flex:1; padding:8px; cursor:pointer; border-radius:4px;">RECHAZAR</button>
                </div>
            </div>`;
    });
}


// REEMPLAZA LAS LÍNEAS 77 A 92 CON ESTO:
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    datosEquipos = data ? data : DATOS_INICIALES;
    
    if (idActual) {
        equipoActual = datosEquipos[idActual];
        actualizarTabla();
        actualizarListasNegociacion();
        dibujarOfertas(); // <-- Ahora sí está bien guardadita aquí
    }
    cargarMercado();
});

// Este bloque (que ya tienes cerca de la línea 87) se encargará de dibujar
// las ofertas en cuanto el bloque de arriba termine de cargar los datos.
db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    // ... resto de tu código de dibujo de ofertas ...
});
function seleccionarEquipo(id) {
    idActual = id; 
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarTabla();
    actualizarListasNegociacion(); 
    dibujarOfertas(); // <-- ESTO LAS DIBUJA APENAS HACES CLIC EN TU BOTÓN
}
function irInicio() {
    idActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}


// Escuchador que solo actualiza los datos y manda a dibujar
db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    dibujarOfertas(); 
});
}, (error) => console.error("Error en Firebase:", error));
function salvar() { db.ref('liga/').set(datosEquipos); }

function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    const tabla = document.getElementById('body-plantilla');
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const claseContrato = j.contrato === 0 ? 'contrato-critico' : (j.contrato === 1 ? 'contrato-bajo' : 'contrato-ok');
        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td><td>$${j.salario}M</td><td>$${j.prima}M</td>
                <td class="${claseContrato}">${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; color:white;">50%</button>
                    <button onclick="liberarJugador(${index})" style="background:#444; color:white;">LIBERAR</button>
                    <button onclick="toggleVenta(${index})" style="background:${j.enVenta ? 'red' : 'blue'}; color:white;">
                        ${j.enVenta ? 'QUITAR' : 'VENTA'}
                    </button>
                </td>
            </tr>`;
    });
}

function toggleVenta(index) { equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta; salvar(); }

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5;
    if(confirm(`¿Vender por $${pago.toFixed(1)}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        salvar();
    }
}

function liberarJugador(index) {
    const j = equipoActual.jugadores[index];
    const costo = j.salario * j.contrato;
    if (confirm(`¿Liberar? Costo: $${costo.toFixed(1)}M`)) {
        if (equipoActual.saldo < costo) return alert("Saldo insuficiente.");
        equipoActual.saldo -= costo;
        equipoActual.jugadores.splice(index, 1);
        salvar();
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo < j.prima) return alert("No hay saldo.");
    if (confirm(`¿Renovar por $${j.prima}M?`)) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        salvar();
    }
}

function finalizarTemporada() {
    if (!confirm("⚠️ ¿Finalizar temporada? -1 año contrato.")) return;
    equipoActual.jugadores.forEach(j => { if (j.contrato > 0) j.contrato -= 1; });
    salvar();
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return;
    lista.innerHTML = '';
    let hay = false;
    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) { hay = true; lista.innerHTML += `<li><strong>${j.nombre}</strong> (${datosEquipos[eq].nombre}) - $${j.valor}M</li>`; }
        });
    }
    if (!hay) lista.innerHTML = '<li>Sin jugadores en venta</li>';
}

function calcularFichaje() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;
    let s = v >= 120 ? 22 : (v >= 90 ? 18 : (v >= 70 ? 14 : (v >= 50 ? 11 : (v >= 30 ? 8 : (v >= 20 ? 5 : (v >= 10 ? 3 : (v >= 5 ? 1.5 : 0.8)))))));
    let p = v >= 120 ? 7 : (v >= 90 ? 5 : (v >= 70 ? 4 : (v >= 50 ? 3 : (v >= 30 ? 2 : (v >= 20 ? 1.5 : (v >= 10 ? 1 : (v >= 5 ? 0.7 : 0.4)))))));
    document.getElementById('resultado-busqueda').innerHTML = `
        <div style="background:#222; padding:10px; margin-top:10px;">
            <p>${n.toUpperCase()}: $${s}M / $${p}M</p>
            <button onclick="confirmarCompra('${n}',${v},${s},${p})" style="background:green; color:white;">FICHAR</button>
        </div>`;
}

function confirmarCompra(n, v, s, p) {
    if (equipoActual.saldo < v) return alert("Sin dinero.");
    if (confirm(`¿Comprar a ${n}?`)) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
        salvar();
    }
}

function enviarOferta() {
    const idRival = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const jBuscado = document.getElementById('select-jugador-rival').value;
    const dinero = parseFloat(document.getElementById('oferta-dinero').value) || 0;
    const jOfrecido = document.getElementById('mi-jugador-cambio').value;

    // Generamos un ID único para que la oferta entre al instante
    const idOfertaRealtime = "OFERTA_" + Date.now();

    const nuevaOferta = {
        desde: equipoActual.nombre,
        idEmisor: idActual,
        jugadorBuscado: jBuscado,
        dinero: dinero,
        jugadorOfrecido: jOfrecido,
        timestamp: firebase.database.ServerValue.TIMESTAMP // Prioridad de Firebase
    };

    // Usar .set() con ID único es mucho más rápido que .push()
    db.ref(`ofertas/${idRival}/${idOfertaRealtime}`).set(nuevaOferta)
        .then(() => {
            alert("✅ ¡Oferta enviada al instante!");
            document.getElementById('oferta-dinero').value = '';
        });
}

function aceptarOferta(idOferta, idEmisor) {
    const o = todasLasOfertas[idActual][idOferta];
    const emisor = datosEquipos[idEmisor];
    const receptor = equipoActual;

    if (emisor.saldo < o.dinero) return alert("El rival no tiene dinero.");

    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    const jBuscadoIdx = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
    const jBuscado = receptor.jugadores.splice(jBuscadoIdx, 1)[0];
    emisor.jugadores.push(jBuscado);

    if (o.jugadorOfrecido) {
        const jOfrecidoIdx = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        const jOfrecido = emisor.jugadores.splice(jOfrecidoIdx, 1)[0];
        receptor.jugadores.push(jOfrecido);
    }

    db.ref('liga/').set(datosEquipos);
    db.ref(`ofertas/${idActual}/${idOferta}`).remove();
    alert("Trato cerrado.");
}

function rechazarOferta(idOferta) {
    db.ref(`ofertas/${idActual}/${idOferta}`).remove();
}
function prepararContraoferta(idOferta, idEmisor) {
    // 1. Obtenemos los datos de la oferta original desde la variable global
    const o = todasLasOfertas[idActual][idOferta];
    if (!o) return;
     document.getElementById('mi-jugador-cambio').value = "";

    // 2. Cargamos los datos en el panel de envío para que tú los modifiques
    // El "Jugador buscado" ahora es el que el rival te ofrecía originalmente
    if (o.jugadorOfrecido) {
        document.getElementById('select-jugador-rival').value = o.jugadorOfrecido;
    }
    
    // Ponemos el dinero original para que solo lo subas o bajes
    document.getElementById('oferta-dinero').value = o.dinero;

    // 3. Borramos la oferta vieja del muro para que no se duplique
    db.ref(`ofertas/${idActual}/${idOferta}`).remove();

    alert("📝 Datos cargados. Ajusta el precio o jugador y dale a 'ENVIAR' para responder.");
    
    // Scroll automático al panel de negociación para que sea rápido
    document.getElementById('select-jugador-rival').scrollIntoView({ behavior: 'smooth' });
}
function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const selectRival = document.getElementById('select-jugador-rival');
    const selectMio = document.getElementById('mi-jugador-cambio');
    
    if (!selectRival || !selectMio || !rival) return;

    // ESTO AGREGA LA OPCIÓN DE "SOLO DINERO" AL RIVAL (IZQUIERDA)
    selectRival.innerHTML = '<option value="">Solo dinero (Ninguno)</option>' + 
        rival.jugadores.map(j => 
            `<option value="${j.nombre}">${j.nombre} ($${j.valor}M)</option>`
        ).join('');
    
    // ESTO AGREGA LA OPCIÓN DE "SOLO DINERO" A TI (DERECHA)
    selectMio.innerHTML = '<option value="">Solo dinero</option>' + 
        equipoActual.jugadores.map(j => 
            `<option value="${j.nombre}">${j.nombre}</option>`
        ).join('');
}
// Este bloque va al final de tu main.js
db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    // Solo dibuja si el usuario ya eligió un equipo
    if (idActual) {
        dibujarOfertas();
    }
});
