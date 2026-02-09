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

// DATOS INICIALES (Si la base está vacía)
const DATOS_INICIALES = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal',
        jugadores: [{ nombre: 'Jugador Prueba', valor: 10, salario: 2, prima: 1, contrato: 2, enVenta: false }]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, contrato: 2, enVenta: false },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, contrato: 2, enVenta: false }
        ]
    }
};

let datosEquipos = {};
let equipoActual = null;
let idEquipoActual = "";

// ESCUCHAR CAMBIOS EN LA NUBE
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        db.ref('liga/').set(DATOS_INICIALES);
    } else {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarInterfaz();
        }
    }
});

function seleccionarEquipo(id) {
    idEquipoActual = id;
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarInterfaz();
}

function irInicio() {
    idEquipoActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function actualizarInterfaz() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)}M`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    
    const tabla = document.getElementById('body-plantilla');
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, i) => {
        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato} años</td>
                <td>
                    <button class="btn-renovar" onclick="renovar(${i})">RENOVAR</button>
                    <button class="btn-50" onclick="vender50(${i})">50%</button>
                    <button class="btn-liberar" onclick="liberar(${i})">LIBERAR</button>
                    <button class="btn-venta" onclick="toggleVenta(${i})">${j.enVenta ? 'QUITAR' : 'VENTA'}</button>
                </td>
            </tr>`;
    });
}

// LÓGICA DEL CALCULADOR
function calcularFichaje() {
    const nombre = document.getElementById('nombre-busqueda').value;
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const res = document.getElementById('resultado-busqueda');

    if (!nombre || isNaN(valor)) return;

    // Cálculo de reglas
    let salario = valor >= 30 ? 8 : (valor >= 10 ? 3 : 0.8);
    let prima = valor >= 30 ? 2 : (valor >= 10 ? 1 : 0.4);

    res.innerHTML = `
        <div style="margin-top:15px; border:1px solid #444; padding:10px;">
            <p><strong>${nombre}</strong></p>
            <p>Salario Sugerido: $${salario}M | Prima: $${prima}M</p>
            <button onclick="confirmarFichaje('${nombre}', ${valor}, ${salario}, ${prima})" style="background:green; color:white;">FICHAR AHORA</button>
        </div>`;
}

function confirmarFichaje(n, v, s, p) {
    if (equipoActual.saldo < v) { alert("Saldo insuficiente"); return; }
    equipoActual.saldo -= v;
    equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, contrato: 2, enVenta: false });
    db.ref('liga/').set(datosEquipos);
}

// ACCIONES DE TABLA
function renovar(i) {
    const j = equipoActual.jugadores[i];
    if (equipoActual.saldo < j.prima) { alert("Saldo insuficiente"); return; }
    equipoActual.saldo -= j.prima;
    j.contrato += 1;
    db.ref('liga/').set(datosEquipos);
}

function vender50(i) {
    const j = equipoActual.jugadores[i];
    equipoActual.saldo += (j.valor * 0.5);
    equipoActual.jugadores.splice(i, 1);
    db.ref('liga/').set(datosEquipos);
}

function liberar(i) {
    equipoActual.jugadores.splice(i, 1);
    db.ref('liga/').set(datosEquipos);
}

function toggleVenta(i) {
    equipoActual.jugadores[i].enVenta = !equipoActual.jugadores[i].enVenta;
    db.ref('liga/').set(datosEquipos);
}
