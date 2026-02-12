// CONFIGURACIÓN DE FIREBASE
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

// VARIABLES GLOBALES
let datosEquipos = {};
let equipoActual = null;
let idActual = "";
let todasLasOfertas = {};

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
            { nombre: 'Unai Simón', valor: 25, salario: 8, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Trindade', valor: 28, salario: 8, prima: 2, enVenta: false, contrato: 2 },
            { nombre: 'Kaoru Mitoma', valor: 30, salario: 11, prima: 3, enVenta: false, contrato: 2 },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, enVenta: false, contrato: 2 }
        ]
    }
};

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
    idActual = "";
    equipoActual = null;
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
};

function actualizarTodo() {
    if (!equipoActual) return;
    actualizarTabla();
    actualizarListasNegociacion();
    dibujarOfertas();
}

// --- FIREBASE LISTENERS ---
db.ref('liga/').on('value', (snapshot) => {
    datosEquipos = snapshot.val() || DATOS_INICIALES;
    if (idActual) {
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

// --- PLANTILLA Y TABLA ---
function actualizarTabla() {
    const elSaldo = document.getElementById('saldo-actual');
    const elEstadio = document.getElementById('tipo-estadio');
    const elCuerpo = document.getElementById('body-plantilla');

    if (elSaldo) elSaldo.innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    if (elEstadio) elEstadio.innerText = equipoActual.estadio;
    if (elCuerpo) {
        elCuerpo.innerHTML = equipoActual.jugadores.map((j, i) => `
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
    actualizarListasNegociacion();
}

// --- FICHAJES ---
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
    const yaExiste = equipoActual.jugadores.some(j => j.nombre.toLowerCase() === n.toLowerCase());
    if (yaExiste) { alert("¡Error! " + n + " ya está en tu equipo."); return; }
    if (equipoActual.saldo < v) return alert("Saldo insuficiente.");

    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
    salvar();
    document.getElementById('resultado-busqueda').innerHTML = ''; 
    alert(n + " fichado correctamente.");
};

// --- GESTIÓN DE JUGADORES ---
window.renovar = function(i) {
    const j = equipoActual.jugadores[i];
    if (equipoActual.saldo < j.prima) return alert("Sin saldo.");
    equipoActual.saldo -= j.prima;
    j.contrato += 1;
    salvar();
};

window.venderAlAnterior = function(i) {
    equipoActual.saldo += equipoActual.jugadores[i].valor * 0.5;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

window.toggleVenta = function(i) {
    equipoActual.jugadores[i].enVenta = !equipoActual.jugadores[i].enVenta;
    salvar();
};

window.liberarJugador = function(i) {
    const j = equipoActual.jugadores[i];
    const coste = j.contrato * j.salario;
    if (!confirm(`¿Liberar a ${j.nombre}? Coste: $${coste.toFixed(1)}M`)) return;
    if (equipoActual.saldo < coste) return alert("Saldo insuficiente.");
    equipoActual.saldo -= coste;
    equipoActual.jugadores.splice(i, 1);
    salvar();
};

// --- NEGOCIACIONES Y OFERTAS ---
function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const selRival = document.getElementById('select-jugador-rival');
    const selMio = document.getElementById('mi-jugador-cambio');
    
    if (selRival) {
        if (rival && rival.jugadores) {
            selRival.innerHTML = '<option value="">Solo $</option>' + rival.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
        } else { selRival.innerHTML = '<option value="">Rival sin jugadores</option>'; }
    }
    if (selMio) {
        if (equipoActual && equipoActual.jugadores) {
            selMio.innerHTML = '<option value="">Solo $</option>' + equipoActual.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
        } else { selMio.innerHTML = '<option value="">No tienes jugadores</option>'; }
    }
}

window.enviarOferta = function() {
    const rival = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const nueva = {
        desde: equipoActual.nombre, idEmisor: idActual,
        jugadorBuscado: document.getElementById('select-jugador-rival').value,
        dinero: parseFloat(document.getElementById('oferta-dinero').value) || 0,
        jugadorOfrecido: document.getElementById('mi-jugador-cambio').value
    };
    db.ref(`ofertas/${rival}`).push(nueva);
    alert("Oferta enviada.");
};

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

window.aceptarOferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;

    const emisor = datosEquipos[idE];
    const receptor = equipoActual;

    // 1. Dinero
    emisor.saldo -= o.dinero;
    receptor.saldo += o.dinero;

    // 2. Mover jugador que tú tienes y el rival quiere
    const idxB = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
    if (idxB !== -1) {
        let p = receptor.jugadores.splice(idxB, 1)[0];
        p.enVenta = false;
        if (!emisor.jugadores) emisor.jugadores = [];
        emisor.jugadores.push(p);
    }

    // 3. Mover jugador que el rival te ofreció
    if (o.jugadorOfrecido) {
        const idxO = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        if (idxO !== -1) {
            let p = emisor.jugadores.splice(idxO, 1)[0];
            p.enVenta = false;
            receptor.jugadores.push(p);
        }
    }

    // 4. Guardar en Firebase y borrar la oferta
    db.ref('liga/').set(datosEquipos).then(() => {
        db.ref(`ofertas/${idActual}/${idO}`).remove();
        alert("¡Trato aceptado!");
    });
};

window.prepararContraoferta = function(idO, idE) {
    const o = todasLasOfertas[idActual][idO];
    if (!o) return;
    document.getElementById('select-jugador-rival').value = o.jugadorOfrecido || "";
    document.getElementById('oferta-dinero').value = o.dinero;
    document.getElementById('mi-jugador-cambio').value = o.jugadorBuscado || "";
    db.ref(`ofertas/${idActual}/${idO}`).remove();
};

window.rechazarOferta = function(id) { db.ref(`ofertas/${idActual}/${id}`).remove(); };

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return;
    lista.innerHTML = '';
    for (let eq in datosEquipos) {
        if(datosEquipos[eq].jugadores) {
            datosEquipos[eq].jugadores.forEach(j => {
                if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`;
            });
        }
    }
}

window.finalizarTemporada = function() {
    if (!confirm("¿Finalizar temporada? Cobro de salarios y -1 año contrato.")) return;
    for (let idEq in datosEquipos) {
        let eq = datosEquipos[idEq]; let gasto = 0;
        if (eq.jugadores) {
            eq.jugadores.forEach(j => { gasto += j.salario; if (j.contrato > 0) j.contrato -= 1; });
            eq.saldo -= gasto;
        }
    }
    salvar();
    alert("Temporada finalizada.");
};
