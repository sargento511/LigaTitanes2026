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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Datos iniciales por si la nube está vacía
let datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal (Grande)',
        jugadores: [{ nombre: 'Jugador Base', valor: 10, salario: 2, prima: 1, enVenta: false, contrato: 2 }]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja (Gigante)',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, enVenta: false, contrato: 2 },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, enVenta: false, contrato: 2 }
        ]
    }
};

let equipoActual = null;
let idEquipoActual = "";

// --- SINCRONIZACIÓN NUBE (CORREGIDA) ---
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (idEquipoActual) {
            equipoActual = datosEquipos[idEquipoActual];
            actualizarTabla();
            revisarOfertasRecibidas();
        }
    } else {
        guardarEnNube();
    }
    cargarMercado();
});

function guardarEnNube() {
    db.ref('liga/').set(datosEquipos);
}

// --- NAVEGACIÓN ---
function seleccionarEquipo(id) {
    if (!datosEquipos[id]) return; // Evita error si no ha cargado la base
    
    idEquipoActual = id;
    equipoActual = datosEquipos[id];
    
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    
    // Crear contenedor de ofertas si no existe
    if(!document.getElementById('panel-ofertas')){
        const div = document.createElement('div');
        div.id = 'panel-ofertas';
        div.style = "background:#1a1a1a; border:2px solid gold; color:white; padding:15px; margin-top:20px; border-radius:10px; display:none;";
        document.getElementById('dashboard').appendChild(div);
    }
    
    actualizarTabla();
    revisarOfertasRecib
