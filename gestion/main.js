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

// --- SINCRONIZACIÓN Y BOTONES ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    datosEquipos = data ? data : DATOS_INICIALES;
    if (idActual) {
        equipoActual = datosEquipos[idActual];
        actualizarTabla();
        actualizarListasNegociacion();
        dibujarOfertas();
    }
    cargarMercado();
});

db.ref('ofertas/').on('value', (snapshot) => {
    todasLasOfertas = snapshot.val() || {};
    if (idActual) dibujarOfertas();
});

function seleccionarEquipo(id) {
    idActual = id;
    equipoActual = datosEquipos[id];
    if (!equipoActual) return;
    
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    
    actualizarTabla();
    actualizarListasNegociacion();
    dibujarOfertas();
}

function irInicio() {
    idActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function salvar() { db.ref('liga/').set(datosEquipos); }

// --- FUNCIONES DE INTERFAZ ---
function actualizarTabla() {
    if (!equipoActual) return;
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
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

function dibujarOfertas() {
    const contenedor = document.getElementById('contenedor-ofertas');
    if (!contenedor || !idActual) return;
    const misOfertas = todasLasOfertas[idActual] || {};
    contenedor.innerHTML = '';

    Object.keys(misOfertas).forEach(key => {
        const o = misOfertas[key];
        contenedor.innerHTML += `
            <div style="background:#222; padding:15px; margin:10px 0; border-radius:8px; border-left:5px solid #007bff; text-align:left;">
                <p>🚀 <b>${o.desde}</b> propone:</p>
                <p>Busca a: <b>${o.jugadorBuscado}</b></p>
                <p>Ofrece: <b>$${o.dinero}M</b> ${o.jugadorOfrecido ? ' + ' + o.jugadorOfrecido : ''}</p>
                <div style="display:flex; gap:5px; margin-top:10px;">
                    <button onclick="aceptarOferta('${key}', '${o.idEmisor}')" style="background:#28a745; color:white; flex:1; padding:8px; cursor:pointer;">ACEPTAR</button>
                    <button onclick="rechazarOferta('${key}')" style="background:#dc3545; color:white; flex:1; padding:8px; cursor:pointer;">RECHAZAR</button>
                </div>
            </div>`;
    });
}

// --- NEGOCIACIONES Y OFERTAS ---
function enviarOferta() {
    const idRival = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const jBuscado = document.getElementById('select-jugador-rival').value;
    const dinero = parseFloat(document.getElementById('oferta-dinero').value) || 0;
    const jOfrecido = document.getElementById('mi-jugador-cambio').value;
    const idOferta = "OFERTA_" + Date.now();

    const nuevaOferta = {
        desde: equipoActual.nombre,
        idEmisor: idActual,
        jugadorBuscado: jBuscado,
        dinero: dinero,
        jugadorOfrecido: jOfrecido
    };

    db.ref(`ofertas/${idRival}/${idOferta}`).set(nuevaOferta)
        .then(() => {
            alert("✅ ¡Oferta enviada!");
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

    const idxBuscado = receptor.jugadores.findIndex(j => j.nombre === o.jugadorBuscado);
    const jBuscado = receptor.jugadores.splice(idxBuscado, 1)[0];
    emisor.jugadores.push(jBuscado);

    if (o.jugadorOfrecido) {
        const idxOfrecido = emisor.jugadores.findIndex(j => j.nombre === o.jugadorOfrecido);
        const jOfrecido = emisor.jugadores.splice(idxOfrecido, 1)[0];
        receptor.jugadores.push(jOfrecido);
    }

    db.ref('liga/').set(datosEquipos);
    db.ref(`ofertas/${idActual}/${idOferta}`).remove();
    alert("Trato cerrado.");
}

function rechazarOferta(idOferta) { db.ref(`ofertas/${idActual}/${idOferta}`).remove(); }

function toggleVenta(index) { equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta; salvar(); }

function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const selectRival = document.getElementById('select-jugador-rival');
    const selectMio = document.getElementById('mi-jugador-cambio');
    if (!selectRival || !selectMio || !rival) return;

    selectRival.innerHTML = '<option value="">Solo dinero</option>' + rival.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    selectMio.innerHTML = '<option value="">Solo dinero</option>' + equipoActual.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return;
    lista.innerHTML = '';
    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) lista.innerHTML += `<li><strong>${j.nombre}</strong> (${datosEquipos[eq].nombre})</li>`;
        });
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo < j.prima) return alert("Saldo insuficiente.");
    equipoActual.saldo -= j.prima;
    j.contrato += 1;
    salvar();
}

function liberarJugador(index) {
    const j = equipoActual.jugadores[index];
    const costo = j.salario * j.contrato;
    if (equipoActual.saldo < costo) return alert("Saldo insuficiente.");
    equipoActual.saldo -= costo;
    equipoActual.jugadores.splice(index, 1);
    salvar();
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    equipoActual.saldo += j.valor * 0.5;
    equipoActual.jugadores.splice(index, 1);
    salvar();
}
