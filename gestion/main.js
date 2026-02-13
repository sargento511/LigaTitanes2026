// Configuración Firebase (la que proporcionaste)
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

let currentTeam = "";
let otherTeam = "";

// --- Lógica de Salarios (Aquí debes meter los datos de tu imagen) ---
function calcularFinanzas(valor) {
    // Ejemplo: Si el valor es > 1M, salario es 10%, prima 5%...
    // Sustituye con tu tabla:
    let salario = valor * 0.10; 
    let prima = valor * 0.05;
    return { salario, prima };
}

// --- Negociación en Tiempo Real ---
function enviarOferta(jugadorNombre, dinero, jugadorOfrecido) {
    const oferta = {
        desde: currentTeam,
        jugadorObjetivo: jugadorNombre,
        dineroOfertado: dinero,
        jugadorIntercambio: jugadorOfrecido,
        estado: "pendiente",
        timestamp: Date.now()
    };
    
    db.ref(`negociaciones/${otherTeam}`).set(oferta);
    alert("Oferta enviada al instante!");
}

// Escuchar ofertas entrantes (Tiempo Real)
function escucharOfertas() {
    db.ref(`negociaciones/${currentTeam}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.estado === "pendiente") {
            const aceptar = confirm(`¡Nueva Oferta de ${data.desde}! 
            Quieren a: ${data.jugadorObjetivo}
            Ofrecen: $${data.dineroOfertado} y a ${data.jugadorIntercambio}
            ¿Aceptar?`);
            
            if (aceptar) {
                ejecutarTraspaso(data);
            } else {
                db.ref(`negociaciones/${currentTeam}`).update({ estado: "rechazado" });
            }
        }
    });
}

function ejecutarTraspaso(data) {
    // 1. Quitar dinero al comprador, poner al vendedor
    // 2. Mover jugador de un nodo a otro en la DB
    // 3. Limpiar oferta
    console.log("Procesando cambios instantáneos...");
    db.ref(`negociaciones/${currentTeam}`).remove();
}

function togglePhone() {
    document.getElementById('mobile-menu').classList.toggle('closed');
}

// Inicializar equipo
function selectTeam(team) {
    currentTeam = team;
    otherTeam = (team === "halcones") ? "deportivo" : "halcones";
    document.getElementById('app-content').classList.remove('hidden');
    escucharOfertas();
    // Cargar datos de Firebase aquí...
}
