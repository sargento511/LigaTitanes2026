// CONFIGURACIÓN FIREBASE
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

let datosEquipos = {}; // Se cargará de la nube
let equipoActual = null;
let idEquipoActual = "";

// --- ESCUCHA DE DATOS (NUBE) ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (equipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            revisarOfertas();
        }
        cargarMercado();
    }
});

function guardarEnNube() {
    db.ref('liga/').set(datosEquipos);
}

// --- LOGICA DE EQUIPOS ---
function seleccionarEquipo(id) {
    idEquipoActual = id;
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    
    // Crear el contenedor de notificaciones si no existe
    if(!document.getElementById('seccion-ofertas')){
        const div = document.createElement('div');
        div.id = 'seccion-ofertas';
        div.style = "background:#333; color:white; padding:10px; margin-top:20px; border-radius:8px; display:none;";
        document.getElementById('dashboard').appendChild(div);
    }
    
    actualizarTabla();
    revisarOfertas();
}

function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red;">QUITAR VENTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue;">VENDER</button>`;

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green;">RENOVAR</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    guardarEnNube();
}

// --- SISTEMA DE MERCADO Y OFERTAS ---
function cargarMercado() {
    const listaMercado = document.getElementById('lista-mercado');
    if (!listaMercado) return;
    listaMercado.innerHTML = '';

    for (let eqId in datosEquipos) {
        if (eqId === idEquipoActual) continue; // No ofertar a uno mismo

        datosEquipos[eqId].jugadores.forEach((j, idx) => {
            if (j.enVenta) {
                listaMercado.innerHTML += `
                    <li style="margin-bottom:10px;">
                        <strong>${j.nombre}</strong> (${datosEquipos[eqId].nombre})
                        <button onclick="abrirPanelOferta('${eqId}', ${idx})" style="background:gold; color:black; margin-left:10px;">ENVIAR OFERTA</button>
                    </li>`;
            }
        });
    }
}

function abrirPanelOferta(vendedorId, jugadorIdx) {
    const monto = prompt("¿Cuánto dinero ofreces? (MDD)");
    if (monto === null || isNaN(monto)) return;

    const jugadorOfertado = datosEquipos[vendedorId].jugadores[jugadorIdx];

    // Crear objeto de oferta
    const nuevaOferta = {
        desdeId: idEquipoActual,
        desdeNombre: equipoActual.nombre,
        jugadorNombre: jugadorOfertado.nombre,
        jugadorIdx: jugadorIdx,
        dinero: parseFloat(monto),
        estado: 'pendiente'
    };

    // Guardar oferta en una carpeta especial en Firebase
    if (!datosEquipos[vendedorId].ofertasRecibidas) {
        datosEquipos[vendedorId].ofertasRecibidas = [];
    }
    datosEquipos[vendedorId].ofertasRecibidas.push(nuevaOferta);
    
    guardarEnNube();
    alert("Oferta enviada. Espera a que el otro equipo acepte.");
}

// --- REVISAR SI TENGO OFERTAS ---
function revisarOfertas() {
    const panel = document.getElementById('seccion-ofertas');
    const ofertas = equipoActual.ofertasRecibidas;

    if (ofertas && ofertas.length > 0) {
        panel.style.display = 'block';
        panel.innerHTML = '<h3>📩 OFERTAS RECIBIDAS</h3>';
        ofertas.forEach((of, idx) => {
            if (of.estado === 'pendiente') {
                panel.innerHTML += `
                    <div style="border-bottom:1px solid #555; padding:10px;">
                        <p>${of.desdeNombre} ofrece <strong>$${of.dinero}M</strong> por <strong>${of.jugadorNombre}</strong></p>
                        <button onclick="responderOferta(${idx}, true)" style="background:green;">ACEPTAR</button>
                        <button onclick="responderOferta(${idx}, false)" style="background:red;">RECHAZAR</button>
                    </div>`;
            }
        });
    } else {
        panel.style.display = 'none';
    }
}

function responderOferta(ofertaIdx, aceptada) {
    const oferta = equipoActual.ofertasRecibidas[ofertaIdx];
    const comprador = datosEquipos[oferta.desdeId];
    const vendedor = equipoActual;

    if (aceptada) {
        if (comprador.saldo < oferta.dinero) {
            alert("El comprador ya no tiene dinero suficiente.");
            vendedor.ofertasRecibidas.splice(ofertaIdx, 1);
        } else {
            // TRANSFERENCIA DE DINERO
            comprador.saldo -= oferta.dinero;
            vendedor.saldo += oferta.dinero;

            // TRANSFERENCIA DE JUGADOR
            const jugadorSubido = vendedor.jugadores.splice(oferta.jugadorIdx, 1)[0];
            jugadorSubido.enVenta = false; // Quitar del mercado
            comprador.jugadores.push(jugadorSubido);

            alert("¡TRATO HECHO! El jugador ha cambiado de equipo.");
            vendedor.ofertasRecibidas.splice(ofertaIdx, 1);
        }
    } else {
        alert("Oferta rechazada.");
        vendedor.ofertasRecibidas.splice(ofertaIdx, 1);
    }

    guardarEnNube();
}
