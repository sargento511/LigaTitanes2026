// CONFIGURACIÓN DE FIREBASE (Tus credenciales originales)
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let datosEquipos = {};
let equipoActual = null;
let idActual = "";
let todasLasOfertas = {};

// --- NAVEGACIÓN ---
window.seleccionarEquipo = function(id) {
    idActual = id;
    if (datosEquipos && datosEquipos[id]) {
        equipoActual = datosEquipos[id];
        document.getElementById('pantalla-inicio').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
        actualizarTodo();
    }
};

window.irInicio = function() {
    idActual = ""; equipoActual = null;
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
};

function actualizarTodo() {
    if (!equipoActual) return;
    actualizarTabla();
    actualizarListasNegociacion();
    dibujarOfertas();
}

// --- LISTENERS ---
db.ref('liga/').on('value', (snapshot) => {
    datosEquipos = snapshot.val();
    if (idActual && datosEquipos) {
        equipoActual = datosEquipos[idActual];
        actualizarTodo();
    }
    cargarMercado();
});

db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    if (idActual) dibujarOfertas();
});

function salvar() { db.ref('liga/').set(datosEquipos); }

// --- TABLA ---
function actualizarTabla() {
    const elCuerpo = document.getElementById('body-plantilla');
    if (!elCuerpo || !equipoActual) return;

    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    elCuerpo.innerHTML = (equipoActual.jugadores || []).map((j, i) => `
        <tr>
            <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
            <td>$${j.valor}M</td>
            <td>$${j.salario}M</td>
            <td>$${j.prima}M</td>
            <td>${j.contrato}a</td>
            <td>
                <button onclick="window.renovar(${i})" style="background:green; color:white;">REN</button>
                <button onclick="window.venderAlAnterior(${i})" style="background:orange;">50%</button>
                <button onclick="window.toggleVenta(${i})" style="background:${j.enVenta ? 'red' : 'blue'}; color:white;">VENTA</button>
                <button onclick="window.liberarJugador(${i})" style="background:black; color:white;">LIBERAR</button>
            </td>
        </tr>`).join('');
}

// --- FICHAJES (TU CALCULADORA ORIGINAL) ---
window.calcularFichaje = function() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;

    let s = v >= 120 ? 22 : (v >= 90 ? 18 : (v >= 70 ? 14 : (v >= 50 ? 11 : (v >= 30 ? 8 : (v >= 20 ? 5 : (v >= 10 ? 3 : (v >= 5 ? 1.5 : 0.8)))))));
    let p = v >= 120 ? 7 : (v >= 90 ? 5 : (v >= 70 ? 4 : (v >= 50 ? 3 : (v >= 30 ? 2 : (v >= 20 ? 1.5 : (v >= 10 ? 1 : (v >= 5 ? 0.7 : 0.4)))))));

    document.getElementById('resultado-busqueda').innerHTML = `
        <div style="background:#222; padding:10px; margin-top:10px; border-radius:5px;">
            <p><b>${n.toUpperCase()}</b></p>
            <p>Salario: $${s}M | Prima: $${p}M</p>
            <button onclick="window.confirmarCompra('${n}',${v},${s},${p})" style="background:green; color:white; width:100%; padding:5px;">FICHAR</button>
        </div>`;
};

window.confirmarCompra = function(n, v, s, p) {
    if (!equipoActual.jugadores) equipoActual.jugadores = [];
    const yaLoTengo = equipoActual.jugadores.some(j => j.nombre.toLowerCase() === n.trim().toLowerCase());
    
    if (yaLoTengo) return alert("Ya tienes a este jugador.");
    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");

    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
    salvar();
    document.getElementById('resultado-busqueda').innerHTML = ''; 
    alert(n + " fichado.");
};

// ... (Mantenemos tu configuración de Firebase y variables globales igual)

// --- EL BOTÓN SI (REPARADO PARA QUE SIEMPRE FUNCIONE) ---
window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    // Obtenemos los datos más recientes de los equipos directamente del objeto global
    const emisor = datosEquipos[idE];
    const receptor = datosEquipos[idActual];

    if (!emisor || !receptor) return;

    // 1. Intercambio de dinero
    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    // 2. Mover jugador del receptor al emisor (Jugador Buscado)
    if (o.jugadorBuscado) {
        const idxB = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
        if (idxB !== -1) {
            let transferido = receptor.jugadores.splice(idxB, 1)[0];
            transferido.enVenta = false; // Se quita de la lista de ventas al moverse
            if (!emisor.jugadores) emisor.jugadores = [];
            emisor.jugadores.push(transferido);
        }
    }

    // 3. Mover jugador del emisor al receptor (Jugador Ofrecido)
    if (o.jugadorOfrecido) {
        const idxO = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        if (idxO !== -1) {
            let recibido = emisor.jugadores.splice(idxO, 1)[0];
            recibido.enVenta = false;
            if (!receptor.jugadores) receptor.jugadores = [];
            receptor.jugadores.push(recibido);
        }
    }

    // 4. GUARDADO SIMULTÁNEO: Actualizamos toda la liga de una vez para evitar errores
    db.ref('liga/').set(datosEquipos).then(() => {
        // Solo borramos la oferta si el intercambio en la liga fue exitoso
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("¡Intercambio realizado con éxito!");
    }).catch(error => {
        console.error("Error al procesar el trato:", error);
        alert("Hubo un problema con la base de datos.");
    });
};

// --- BOTÓN CONTRA (MANTENIDO) ---
window.prepararContraoferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;
    
    // Carga los datos de la oferta en el formulario de envío
    const selRival = document.getElementById('select-jugador-rival');
    const selMio = document.getElementById('mi-jugador-cambio');
    const inputDinero = document.getElementById('oferta-dinero');

    if (selRival) selRival.value = o.jugadorOfrecido || "";
    if (inputDinero) inputDinero.value = o.dinero;
    if (selMio) selMio.value = o.jugadorBuscado || "";
    
    // Borra la oferta original para que no se duplique
    db.ref(`ofertas/${idActual}/${idO}`).remove();
    alert("Datos cargados. Modifica lo que quieras y dale a ENVIAR.");
};

// ... (El resto de tus funciones: calcularFichaje, renovar, etc., se quedan igual)
window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

// --- DIBUJAR OFERTAS (CON BOTÓN CONTRA) ---
function dibujarOfertas() {
    const contenedor = document.getElementById('contenedor-ofertas');
    if (!contenedor) return;
    const misOfertas = todasLasOfertas[idActual] || {};
    contenedor.innerHTML = '';
    Object.keys(misOfertas).forEach(key => {
        const o = misOfertas[key];
        contenedor.innerHTML += `
            <div style="background:#222; padding:10px; margin:5px 0; border-left:4px solid #007bff;">
                <p><b>${o.desde}</b> quiere a ${o.jugadorBuscado}</p>
                <p>Ofrece $${o.dinero}M ${o.jugadorOfrecido ? '+ ' + o.jugadorOfrecido : ''}</p>
                <button onclick="window.aceptarOferta('${key}','${o.idEmisor}')" style="background:green; color:white;">SI</button>
                <button onclick="window.prepararContraoferta('${key}','${o.idEmisor}')" style="background:orange;">CONTRA</button>
                <button onclick="window.rechazarOferta('${key}')" style="background:red; color:white;">NO</button>
            </div>`;
    });
}

// --- RESTO DE FUNCIONES ---
window.venderAlAnterior = function(i) {
    equipoActual.saldo += equipoActual.jugadores[i].valor * 0.5;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.liberarJugador = function(i) {
    const j = equipoActual.jugadores[i];
    const coste = j.contrato * j.salario;
    if (!confirm(`¿Liberar? Coste: $${coste.toFixed(1)}M`)) return;
    if (equipoActual.saldo < coste) return alert("Sin saldo.");
    equipoActual.saldo -= coste;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.enviarOferta = function() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    db.ref(`ofertas/${rivalId}`).push({
        desde: equipoActual.nombre, idEmisor: idActual,
        jugadorBuscado: document.getElementById('select-jugador-rival').value,
        dinero: parseFloat(document.getElementById('oferta-dinero').value) || 0,
        jugadorOfrecido: document.getElementById('mi-jugador-cambio').value
    });
    alert("Oferta enviada.");
};

function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const sR = document.getElementById('select-jugador-rival'), sM = document.getElementById('mi-jugador-cambio');
    if (sR && rival && rival.jugadores) sR.innerHTML = '<option value="">Solo $</option>' + rival.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    if (sM && equipoActual.jugadores) sM.innerHTML = '<option value="">Solo $</option>' + equipoActual.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return; lista.innerHTML = '';
    for (let eq in datosEquipos) {
        if (datosEquipos[eq].jugadores) {
            datosEquipos[eq].jugadores.forEach(j => { if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`; });
        }
    }
}
