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

// --- TABLA (Con visualización de Bloqueo Estricto) ---
function actualizarTabla() {
    const elCuerpo = document.getElementById('body-plantilla');
    if (!elCuerpo || !equipoActual) return;

    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    elCuerpo.innerHTML = (equipoActual.jugadores || []).map((j, i) => `
        <tr>
            <td>${j.nombre} ${j.enVenta ? '🔥' : ''} ${j.bloqueado ? '🔒' : ''}</td>
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

// --- FICHAJES (TU CALCULADORA CON BLOQUEO) ---
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
    const yaLoTengo = equipoActual.jugadores.some(j => j.nombre.toLowerCase().trim() === n.toLowerCase().trim());
    
    if (yaLoTengo) return alert("Ya tienes a " + n + " en tu plantilla.");
    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");

    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ 
        nombre: n, valor: v, salario: s, prima: p, 
        enVenta: false, contrato: 2, 
        bloqueado: true // <--- Regla estricta: entra bloqueado
    });

    salvar();
    document.getElementById('resultado-busqueda').innerHTML = ''; 
    alert(n + " fichado. No puede salir hasta la otra temporada.");
};

// --- EL BOTÓN SI (REPARADO PARA INTERCAMBIOS) ---
window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    const emisor = datosEquipos[idE];
    const receptor = equipoActual; // Es idActual

    // Verificación de seguridad para el intercambio de jugadores
    let indexReceptor = -1;
    if (o.jugadorBuscado) {
        indexReceptor = receptor.jugadores.findIndex(j => j.nombre.trim() === o.jugadorBuscado.trim());
        if (indexReceptor === -1) return alert("Error: El jugador buscado ya no está en tu equipo.");
    }

    let indexEmisor = -1;
    if (o.jugadorOfrecido) {
        indexEmisor = emisor.jugadores.findIndex(j => j.nombre.trim() === o.jugadorOfrecido.trim());
        if (indexEmisor === -1) return alert("Error: El jugador ofrecido ya no está en el equipo rival.");
    }

    // Si llegamos aquí, los jugadores existen. Procedemos al intercambio:
    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    // Mover jugador de TI hacia el RIVAL
    if (indexReceptor !== -1) {
        let p = receptor.jugadores.splice(indexReceptor, 1)[0];
        p.enVenta = false;
        p.bloqueado = true; // Se bloquea en el nuevo equipo
        if (!emisor.jugadores) emisor.jugadores = [];
        emisor.jugadores.push(p);
    }

    // Mover jugador del RIVAL hacia TI
    if (indexEmisor !== -1) {
        let p = emisor.jugadores.splice(indexEmisor, 1)[0];
        p.enVenta = false;
        p.bloqueado = true; // Se bloquea en tu equipo
        receptor.jugadores.push(p);
    }

    // Guardar todo de golpe
    db.ref('liga/').set(datosEquipos).then(() => {
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("¡Intercambio realizado con éxito y jugadores bloqueados!");
    });
};

// --- BOTONES DE SALIDA (VALIDAN BLOQUEO) ---
window.venderAlAnterior = function(i) {
    const j = equipoActual.jugadores[i];
    if (j.bloqueado) return alert("🔒 Este jugador es un fichaje reciente. Debes esperar a la próxima temporada.");
    
    equipoActual.saldo += j.valor * 0.5;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.liberarJugador = function(i) {
    const j = equipoActual.jugadores[i];
    if (j.bloqueado) return alert("🔒 No puedes liberar a un jugador recién llegado.");
    
    const coste = j.contrato * j.salario;
    if (!confirm(`¿Liberar? Coste: $${coste.toFixed(1)}M`)) return;
    if (equipoActual.saldo < coste) return alert("Saldo insuficiente.");
    equipoActual.saldo -= coste;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

// --- FINALIZAR TEMPORADA (QUITA BLOQUEOS) ---
window.finalizarTemporada = function() {
    if (!confirm("¿Finalizar temporada? Se cobrarán salarios y se desbloquearán fichajes.")) return;
    for (let idEq in datosEquipos) {
        let eq = datosEquipos[idEq];
        let gasto = 0;
        if (eq.jugadores) {
            eq.jugadores.forEach(j => {
                gasto += j.salario;
                if (j.contrato > 0) j.contrato -= 1;
                j.bloqueado = false; // <--- SE DESBLOQUEAN AQUÍ
            });
            eq.saldo -= gasto;
        }
    }
    salvar();
    alert("Temporada finalizada. Los candados han sido retirados.");
};

// --- OTROS BOTONES (CONTRA, RECHAZAR, ENVIAR) ---
window.prepararContraoferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;
    document.getElementById('select-jugador-rival').value = o.jugadorOfrecido || "";
    document.getElementById('oferta-dinero').value = o.dinero;
    document.getElementById('mi-jugador-cambio').value = o.jugadorBuscado || "";
    db.ref(`ofertas/${idActual}/${idO}`).remove();
};

window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

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

// --- FUNCIONES VIS
