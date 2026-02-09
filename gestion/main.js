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

let datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal (Grande)',
        jugadores: [{ nombre: 'Esperando lista...', valor: 0, salario: 0, prima: 0, enVenta: false, contrato: 2 }],
        notificaciones: []
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
        ],
        notificaciones: []
    }
};

let equipoActual = null;
let idEquipoActual = "";

// --- SINCRONIZACIÓN CON FIREBASE ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            mostrarNotificaciones();
        }
        cargarMercado();
    } else {
        guardarEnNube();
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
    actualizarTabla();
    mostrarNotificaciones();
}

function irInicio() {
    idEquipoActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

// --- GESTIÓN DE PLANTILLA ---
function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white; border-radius:4px;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white; border-radius:4px;">LISTA VENTAS</button>`;

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white; border-radius:4px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; border-radius:4px;">50%</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    guardarEnNube();
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5;
    if(confirm(`¿Vender a ${j.nombre} por $${pago}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        guardarEnNube();
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo >= j.prima) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        guardarEnNube();
    } else { alert("Saldo insuficiente"); }
}

// --- BUSCADOR E INTERCAMBIOS ---
function calcularFichaje() {
    const nombreB = document.getElementById('nombre-busqueda').value.trim();
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const res = document.getElementById('resultado-busqueda');
    if (!nombreB || isNaN(valor)) return;

    let dueñoId = null;
    let jIdx = -1;

    for (let id in datosEquipos) {
        const idx = datosEquipos[id].jugadores.findIndex(j => j.nombre.toLowerCase() === nombreB.toLowerCase());
        if (idx !== -1) { dueñoId = id; jIdx = idx; break; }
    }

    if (dueñoId) {
        if (dueñoId === idEquipoActual) {
            res.innerHTML = `<p>Ya es tu jugador.</p>`;
        } else {
            res.innerHTML = `
                <p>Dueño: ${datosEquipos[dueñoId].nombre}</p>
                <button onclick="enviarPropuesta('${dueñoId}', ${jIdx}, '${nombreB}')" style="background:gold; width:100%; padding:10px;">ENVIAR OFERTA / INTERCAMBIO</button>`;
        }
    } else {
        res.innerHTML = `<button onclick="confirmarCompraLibre('${nombreB}', ${valor})" style="background:green; color:white; width:100%; padding:10px;">FICHAR LIBRE</button>`;
    }
}

function enviarPropuesta(vId, jIdx, nombreJ) {
    const dinero = prompt("¿Cuánto dinero ofreces? (MDD)", "0");
    const intercambio = prompt("¿Qué jugador ofreces a cambio? (Escribe el nombre o 'ninguno')", "ninguno");
    
    if (dinero === null) return;

    const propuesta = {
        deId: idEquipoActual,
        deNombre: equipoActual.nombre,
        jugadorDeseado: nombreJ,
        jugadorDeseadoIdx: jIdx,
        ofertaDinero: parseFloat(dinero),
        ofertaJugador: intercambio,
        fecha: new Date().toLocaleTimeString()
    };

    if (!datosEquipos[vId].notificaciones) datosEquipos[vId].notificaciones = [];
    datosEquipos[vId].notificaciones.push(propuesta);
    guardarEnNube();
    alert("Propuesta enviada al muro del dueño.");
}

function confirmarCompraLibre(n, v) {
    if (equipoActual.saldo >= v) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: (v*0.2).toFixed(1), prima: (v*0.1).toFixed(1), enVenta: false, contrato: 2 });
        guardarEnNube();
    }
}

// --- MURO DE NOTIFICACIONES ---
function mostrarNotificaciones() {
    const dashboard = document.getElementById('dashboard');
    let muro = document.getElementById('muro-notis');
    
    if (!muro) {
        muro = document.createElement('div');
        muro.id = 'muro-notis';
        muro.style = "background:#1a1a1a; color:white; padding:15px; margin-top:20px; border:2px solid gold; border-radius:8px;";
        dashboard.appendChild(muro);
    }

    const notis = equipoActual.notificaciones || [];
    if (notis.length === 0) {
        muro.innerHTML = "<h3>🔔 MURO DE OFERTAS</h3><p>No tienes ofertas nuevas.</p>";
        return;
    }

    muro.innerHTML = "<h3>🔔 MURO DE OFERTAS</h3>";
    notis.forEach((n, idx) => {
        muro.innerHTML += `
            <div style="background:#333; padding:10px; margin-bottom:10px; border-radius:5px;">
                <p><strong>${n.deNombre}</strong> quiere a <strong>${n.jugadorDeseado}</strong></p>
                <p>Ofrece: $${n.ofertaDinero}M + Jugador: ${n.ofertaJugador}</p>
                <button onclick="aceptarTrato(${idx})" style="background:green; color:white;">ACEPTAR TRATO</button>
                <button onclick="rechazarTrato(${idx})" style="background:red; color:white;">RECHAZAR</button>
            </div>`;
    });
}

function aceptarTrato(idx) {
    const n = equipoActual.notificaciones[idx];
    const comprador = datosEquipos[n.deId];
    const vendedor = equipoActual;

    // Verificar dinero
    if (comprador.saldo < n.ofertaDinero) { alert("El comprador no tiene dinero."); return; }

    // Proceso de intercambio
    comprador.saldo -= n.ofertaDinero;
    vendedor.saldo += n.ofertaDinero;

    // Mover jugador deseado
    const jVendido = vendedor.jugadores.splice(n.jugadorDeseadoIdx, 1)[0];
    jVendido.enVenta = false;
    comprador.jugadores.push(jVendido);

    // Mover jugador de intercambio si existe
    if (n.ofertaJugador.toLowerCase() !== 'ninguno') {
        const jIdx = comprador.jugadores.findIndex(j => j.nombre.toLowerCase() === n.ofertaJugador.toLowerCase());
        if (jIdx !== -1) {
            const jCambio = comprador.jugadores.splice(jIdx, 1)[0];
            vendedor.jugadores.push(jCambio);
        }
    }

    vendedor.notificaciones.splice(idx, 1);
    guardarEnNube();
    alert("¡Trato cerrado con éxito!");
}

function rechazarTrato(idx) {
    equipoActual.notificaciones.splice(idx, 1);
    guardarEnNube();
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return;
    lista.innerHTML = '';
    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`;
        });
    }
}

window.onload = function() {
    if (idEquipoActual) {
        equipoActual = datosEquipos[idEquipoActual];
        actualizarTabla();
        mostrarNotificaciones();
    }
};
