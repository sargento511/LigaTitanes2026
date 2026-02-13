// Tu configuración de Firebase
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

function entrarEquipo(nombreEquipo, logo) {
    // 1. Ocultar selección y mostrar dashboard
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    // 2. Actualizar visuales del equipo seleccionado
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    // 3. Cargar datos desde Firebase en tiempo real
    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('info-presupuesto').innerText = `$${data.presupuesto.toLocaleString()}`;
            document.getElementById('info-estadio').innerText = data.estadio;
            document.getElementById('info-capacidad').innerText = data.capacidad.toLocaleString() + " espectadores";
        } else {
            // Si el equipo no existe en la DB aún, podrías crear un perfil inicial aquí
            console.log("Equipo nuevo, sin datos en Firebase.");
        }
    });
}
