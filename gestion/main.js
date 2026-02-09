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
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 147.2,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Jugador Prueba', valor: 0, salario: 0, prima: 0, enVenta: false, contrato: 2 }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 276.4,
        estadio: 'La Caldera Roja (Gigante)',
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

// --- LOGICA DE FIREBASE Y BOTONES (ARREGLADA) ---
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

function dibujarOfertas() {
    const contenedor = document.getElementById('contenedor-ofertas');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    const ofertasMiEquipo = todasLasOfertas[idActual] || {};
    const ids = Object.keys(ofertasMiEquipo);
    if (ids.length === 0) {
        contenedor.innerHTML = "<p style='color:gray;'>No tienes ofertas.</p>";
        return;
    }
    ids.forEach(id => {
        const o = ofertasMiEquipo[id];
        const div = document.createElement('div');
        div.style = "background:#e3f2fd; padding:10px; margin-bottom:10px; border-radius:4px; color:#333; border-left:5px solid #2196f3;";
        div.innerHTML = `
            <p><strong>De:</strong> ${o.desde}</p>
            <p><strong>Para:</strong> ${o.jugadorBuscado}</p>
            <p><strong>Ofrece:</strong> ${o.dinero}M ${o.jugadorOfrecido ? "+ "+o.jugadorOfrecido : ""}</p>
            <button onclick="aceptarOferta('${id}')" style="background:green; color:white; border:none; padding:5px; cursor:pointer;">Aceptar</button>
            <button onclick="rechazarOferta('${id}')" style="background:red; color:white; border:none; padding:5px; cursor:pointer;">Rechazar</button>
        `;
        contenedor.appendChild(div);
    });
}

// --- FUNCIONES RESTANTES (TABLA, MERCADO, ETC) ---
function actualizarTabla() {
    const cuerpo = document.getElementById('cuerpo-tabla');
    if (!cuerpo || !equipoActual) return;
    cuerpo.innerHTML = equipoActual.jugadores.map((j, index) => `
        <tr>
            <td>${j.nombre}</td>
            <td>$${j.valor}M</td>
            <td>$${j.salario}M</td>
            <td>$${j.prima}M</td>
            <td>${j.contrato} años</td>
            <td><button onclick="ponerEnVenta(${index})" style="background:${j.enVenta ? 'orange' : 'gray'}; color:white; border:none; padding:5px; border-radius:3px; cursor:pointer;">
                ${j.enVenta ? 'En Venta' : 'Vender'}
            </button></td>
        </tr>
    `).join('');
    document.getElementById('saldo-actual').innerText = equipoActual.saldo.toFixed(2);
}

function cargarMercado() {
    const contenedor = document.getElementById('lista-mercado');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    Object.keys(datosEquipos).forEach(equipoId => {
        if (equipoId === idActual) return;
        datosEquipos[equipoId].jugadores.forEach(j => {
            if (j.enVenta) {
                const card = document.createElement('div');
                card.className = 'jugador-card';
                card.innerHTML = `
                    <p><strong>${j.nombre}</strong> (${datosEquipos[equipoId].nombre})</p>
                    <p>Precio: $${j.valor}M</p>
                    <button onclick="abrirNegociacion('${equipoId}', '${j.nombre}', ${j.valor})" style="background:#2196f3; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Negociar</button>
                `;
                contenedor.appendChild(card);
            }
        });
    });
}

function abrirNegociacion(rivalId, jugadorNombre, valor) {
    document.getElementById('negociacion-panel').style.display = 'block';
    document.getElementById('negociacion-titulo').innerText = `Negociar por ${jugadorNombre}`;
    document.getElementById('btn-enviar-oferta').onclick = () => enviarOferta(rivalId, jugadorNombre);
}

function enviarOferta(rivalId, jugadorBuscado) {
    const dinero = document.getElementById('oferta-dinero').value;
    const miJugador = document.getElementById('mi-jugador-cambio').value;
    if (!dinero) return alert("Pon una cifra");
    
    const nuevaOferta = {
        desde: equipoActual.nombre,
        jugadorBuscado: jugadorBuscado,
        dinero: dinero,
        jugadorOfrecido: miJugador || null
    };
    
    db.ref(`ofertas/${rivalId}`).push(nuevaOferta);
    alert("Oferta enviada");
    document.getElementById('negociacion-panel').style.display = 'none';
}

function rechazarOferta(idOferta) {
    db.ref(`ofertas/${idActual}/${idOferta}`).remove();
}

function ponerEnVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    db.ref('liga/').set(datosEquipos);
}

function actualizarListasNegociacion() {
    const rivalId = idActual === 'Deportivo' ? 'Halcones' : 'Deportivo';
    const rival = datosEquipos[rivalId];
    const selectRival = document.getElementById('select-jugador-rival');
    const selectMio = document.getElementById('mi-jugador-cambio');
    if (!selectRival || !selectMio || !rival) return;
    selectRival.innerHTML = '<option value="">Solo dinero</option>' + rival.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
    selectMio.innerHTML = '<option value="">Solo dinero</option>' + equipoActual.jugadores.map(j => `<option value="${j.nombre}">${j.nombre}</option>`).join('');
}
