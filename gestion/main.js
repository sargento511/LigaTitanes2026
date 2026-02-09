// --- CONFIGURACIÓN FIREBASE ---
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
let idEquipoActual = "";

// --- SINCRONIZACIÓN NUBE ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            revisarOfertasRecibidas();
        }
        cargarMercado();
    }
});

function guardarEnNube() {
    db.ref('liga/').set(datosEquipos);
}

// --- NAVEGACIÓN ---
function seleccionarEquipo(id) {
    idEquipoActual = id;
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    
    // Crear contenedor de notificaciones si no existe
    if(!document.getElementById('panel-ofertas')){
        const div = document.createElement('div');
        div.id = 'panel-ofertas';
        div.style = "background:#1a1a1a; border:2px solid gold; color:white; padding:15px; margin-top:20px; border-radius:10px; display:none;";
        document.getElementById('dashboard').appendChild(div);
    }
    
    actualizarTabla();
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

// --- GESTIÓN DE PLANTILLA (BOTONES CORREGIDOS) ---
function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white;">LISTA VENTAS</button>`;

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white;">RENOVAR</button>
                    <button onclick="vender50(${index})" style="background:orange;">50%</button>
                    <button onclick="liberar(${index})" style="background:#444; color:white;">LIBERAR</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo >= j.prima) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        guardarEnNube();
    } else { alert("Saldo insuficiente"); }
}

function vender50(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5;
    if(confirm(`¿Vender a ${j.nombre} por $${pago}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        guardarEnNube();
    }
}

function liberar(index) {
    const j = equipoActual.jugadores[index];
    const costo = j.salario * j.contrato;
    if(confirm(`¿Liberar a ${j.nombre}? Costo: $${costo}M`)) {
        if(equipoActual.saldo >= costo) {
            equipoActual.saldo -= costo;
            equipoActual.jugadores.splice(index, 1);
            guardarEnNube();
        } else { alert("No puedes pagar la indemnización"); }
    }
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    guardarEnNube();
}

// --- BUSCADOR INTELIGENTE Y OFERTAS ---
function calcularFichaje() {
    const nombreBusqueda = document.getElementById('nombre-busqueda').value.trim();
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const res = document.getElementById('resultado-busqueda');
    if (!nombreBusqueda || isNaN(valor)) return;

    // Buscar si el jugador ya tiene dueño
    let dueñoId = null;
    let jugadorIdx = -1;

    for (let id in datosEquipos) {
        const idx = datosEquipos[id].jugadores.findIndex(j => j.nombre.toLowerCase() === nombreBusqueda.toLowerCase());
        if (idx !== -1) {
            dueñoId = id;
            jugadorIdx = idx;
            break;
        }
    }

    if (dueñoId) {
        if (dueñoId === idEquipoActual) {
            res.innerHTML = `<p style="color:cyan;">Este jugador ya está en tu equipo.</p>`;
        } else {
            res.innerHTML = `
                <p style="color:yellow;">Dueño: ${datosEquipos[dueñoId].nombre}</p>
                <button onclick="enviarOfertaDirecta('${dueñoId}', ${jugadorIdx}, '${nombreBusqueda}')" style="background:gold; color:black; font-weight:bold; width:100%; padding:10px;">ENVIAR OFERTA AL DUEÑO</button>`;
        }
    } else {
        // Jugador libre
        res.innerHTML = `<p>Jugador Libre</p>
            <button onclick="confirmarCompraLibre('${nombreBusqueda}', ${valor})" style="background:green; color:white; width:100%; padding:10px;">FICHAR LIBRE</button>`;
    }
}

function enviarOfertaDirecta(vendedorId, jugadorIdx, nombreJ) {
    const monto = prompt(`¿Cuánto ofreces a ${datosEquipos[vendedorId].nombre} por ${nombreJ}?`);
    if (!monto || isNaN(monto)) return;

    const oferta = {
        desdeId: idEquipoActual,
        desdeNombre: equipoActual.nombre,
        jugadorNombre: nombreJ,
        jugadorIdx: jugadorIdx,
        dinero: parseFloat(monto)
    };

    if (!datosEquipos[vendedorId].ofertasRecibidas) datosEquipos[vendedorId].ofertasRecibidas = [];
    datosEquipos[vendedorId].ofertasRecibidas.push(oferta);
    guardarEnNube();
    alert("Oferta enviada al buzón del otro equipo.");
}

function confirmarCompraLibre(n, v) {
    if (equipoActual.saldo >= v) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: (v*0.2).toFixed(1), prima: (v*0.1).toFixed(1), enVenta: false, contrato: 2 });
        guardarEnNube();
        alert("Fichado!");
    }
}

// --- BUZÓN DE NOTIFICACIONES ---
function revisarOfertasRecibidas() {
    const panel = document.getElementById('panel-ofertas');
    const ofertas = equipoActual.ofertasRecibidas || [];

    if (ofertas.length > 0) {
        panel.style.display = 'block';
        panel.innerHTML = '<h3>📩 OFERTAS POR TUS JUGADORES</h3>';
        ofertas.forEach((of, idx) => {
            panel.innerHTML += `
                <div style="border-bottom:1px solid #444; padding:10px;">
                    <p><strong>${of.desdeNombre}</strong> quiere a <strong>${of.jugadorNombre}</strong> por <strong>$${of
