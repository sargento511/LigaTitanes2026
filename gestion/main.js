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

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// --- TU BASE DE DATOS ORIGINAL ---
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

// --- SINCRONIZACIÓN NUBE ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            mostrarNotificaciones();
        }
    } else {
        guardarEnNube(); // Inicializa la nube si está vacía
    }
    cargarMercado();
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

// --- TABLA Y GESTIÓN (TUS FUNCIONES BASE) ---
function actualizarTabla() {
    if (!equipoActual) return;
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">LISTA VENTAS</button>`;

        const claseContrato = j.contrato === 0 ? 'contrato-critico' : (j.contrato === 1 ? 'contrato-bajo' : 'contrato-ok');

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td class="${claseContrato}">${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">50%</button>
                    <button onclick="liberarJugador(${index})" style="background:#444; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">LIBERAR</button>
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
    if(confirm(`¿Vender a ${j.nombre} por $${pago.toFixed(1)}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        guardarEnNube();
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo < j.prima) { alert("Saldo insuficiente."); return; }
    if (confirm(`¿Renovar a ${j.nombre} por $${j.prima}M?`)) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        guardarEnNube();
    }
}

function liberarJugador(index) {
    const j = equipoActual.jugadores[index];
    const costo = j.salario * j.contrato;
    if (confirm(`¿Liberar a ${j.nombre} por $${costo.toFixed(1)}M?`)) {
        if (equipoActual.saldo < costo) { alert("No puedes pagar la indemnización."); return; }
        equipoActual.saldo -= costo;
        equipoActual.jugadores.splice(index, 1);
        guardarEnNube();
    }
}

// --- BUSCADOR INTELIGENTE ---
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
            res.innerHTML = `<p style="color:cyan;">Ya está en tu equipo.</p>`;
        } else {
            res.innerHTML = `
                <div style="background:#333; padding:10px; border-radius:5px; border:1px solid gold;">
                    <p>Dueño: <strong>${datosEquipos[dueñoId].nombre}</strong></p>
                    <button onclick="enviarPropuesta('${dueñoId}', ${jIdx}, '${nombreB}')" style="background:gold; color:black; width:100%; padding:8px; border:none; cursor:pointer; font-weight:bold;">ENVIAR OFERTA / INTERCAMBIO</button>
                </div>`;
        }
    } else {
        // Lógica de fichaje libre original
        let salario = valor >= 30 ? 8 : (valor >= 10 ? 3 : 0.8); 
        let prima = valor >= 30 ? 2 : (valor >= 10 ? 1 : 0.4);
        res.innerHTML = `
            <div style="background:#222; padding:10px; border-radius:5px;">
                <p>Jugador Libre: Salario $${salario}M | Prima $${prima}M</p>
                <button onclick="confirmarCompraLibre('${nombreB}', ${valor}, ${salario}, ${prima})" style="background:green; color:white; width:100%; padding:8px; border:none; cursor:pointer;">FICHAR LIBRE</button>
            </div>`;
    }
}

function confirmarCompraLibre(nombre, valor, salario, prima) {
    if (equipoActual.saldo < valor) { alert("No hay dinero."); return; }
    if (confirm(`¿Fichar a ${nombre}?`)) {
        equipoActual.saldo -= valor;
        equipoActual.jugadores.push({ nombre, valor, salario, prima, enVenta: false, contrato: 2 });
        guardarEnNube();
    }
}

// --- SISTEMA DE NEGOCIACIÓN ---
function enviarPropuesta(vId, jIdx, nombreJ) {
    const dinero = prompt(`¿Cuánto dinero ofreces a ${datosEquipos[vId].nombre} por ${nombreJ}?`, "0");
    const intercambio = prompt("¿Qué jugador de tu equipo ofreces a cambio? (Escribe el nombre o 'ninguno')", "ninguno");
    
    if (dinero === null) return;

    db.ref('liga/' + vId + '/notificaciones').once('value').then(snap => {
        let notis = snap.val() || [];
        notis.push({
            deId: idEquipoActual,
            deNombre: equipoActual.nombre,
            jugadorDeseado: nombreJ,
            jugadorDeseadoIdx: jIdx,
            ofertaDinero: parseFloat(dinero),
            ofertaJugador: intercambio
        });
        return db.ref('liga/' + vId + '/notificaciones').set(notis);
    }).then(() => alert("✅ Oferta enviada al muro del dueño."));
}

function mostrarNotificaciones() {
    let muro = document.getElementById('muro-notis');
    if (!muro) {
        muro = document.createElement('div');
        muro.id = 'muro-notis';
        muro.style = "background:#111; color:white; padding:15px; margin-top:20px; border:2px solid gold; border-radius:10px;";
        document.getElementById('dashboard').appendChild(muro);
    }

    const notis = equipoActual.notificaciones || [];
    if (notis.length === 0) {
        muro.innerHTML = "<h3>📩 MURO DE OFERTAS</h3><p style='color:gray;'>Sin ofertas pendientes.</p>";
        return;
    }

    muro.innerHTML = "<h3>📩 MURO DE OFERTAS</h3>";
    notis.forEach((n, idx) => {
        muro.innerHTML += `
            <div style="background:#222; padding:10px; margin-bottom:10px; border-radius:5px; border-left:4px solid gold;">
                <p><strong>${n.deNombre}</strong> ofrece por <strong>${n.jugadorDeseado}</strong>:</p>
                <p style="color:lime;">$${n.ofertaDinero}M + Jugador: ${n.ofertaJugador}</p>
                <button onclick="aceptarTrato(${idx})" style="background:green; color:white; padding:5px; cursor:pointer;">ACEPTAR</button>
                <button onclick="hacerContraoferta(${idx})" style="background:blue; color:white; padding:5px; cursor:pointer;">CONTRAOFERTA</button>
                <button onclick="rechazarTrato(${idx})" style="background:#444; color:white; padding:5px; cursor:pointer;">RECHAZAR</button>
            </div>`;
    });
}

function hacerContraoferta(idx) {
    const n = equipoActual.notificaciones[idx];
    const nDinero = prompt(`CONTRAOFERTA por ${n.jugadorDeseado}: ¿Cuánto dinero pides?`, n.ofertaDinero);
    const nJugador = prompt(`¿Qué jugador de ${n.deNombre} pides a cambio?`, n.ofertaJugador);

    if (nDinero === null) return;

    db.ref('liga/' + n.deId + '/notificaciones').once('value').then(snap => {
        let notis = snap.val() || [];
        notis.push({
            deId: idEquipoActual,
            deNombre: equipoActual.nombre,
            jugadorDeseado: n.jugadorDeseado,
            jugadorDeseadoIdx: n.jugadorDeseadoIdx,
            ofertaDinero: parseFloat(nDinero),
            ofertaJugador: nJugador
        });
        db.ref('liga/' + n.deId + '/notificaciones').set(notis);
        equipoActual.notificaciones.splice(idx, 1);
        guardarEnNube();
        alert("Contraoferta enviada.");
    });
}

function aceptarTrato(idx) {
    const n = equipoActual.notificaciones[idx];
    const comprador = datosEquipos[n.deId];
    const vendedor = equipoActual;

    if (comprador.saldo < n.ofertaDinero) { alert("El comprador ya no tiene dinero."); return; }

    comprador.saldo -= n.ofertaDinero;
    vendedor.saldo += n.ofertaDinero;

    const jVendido = vendedor.jugadores.splice(n.jugadorDeseadoIdx, 1)[0];
    jVendido.enVenta = false;
    comprador.jugadores.push(jVendido);

    if (n.ofertaJugador.toLowerCase() !== 'ninguno') {
        const jIdx = comprador.jugadores.findIndex(j => j.nombre.toLowerCase() === n.ofertaJugador.toLowerCase());
        if (jIdx !== -1) {
            const jCambio = comprador.jugadores.splice(jIdx, 1)[0];
            vendedor.jugadores.push(jCambio);
        }
    }

    vendedor.notificaciones.splice(idx, 1);
    guardarEnNube();
    alert("¡Trato cerrado!");
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
