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
let equipoActualID = ""; // Variable global para saber qué equipo editamos

function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    // Escuchar datos del equipo y jugadores
    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Actualizar Overview
            document.getElementById('info-presupuesto').innerText = `$${data.presupuesto.toLocaleString()}`;
            document.getElementById('info-estadio').innerText = data.estadio || "Sin nombre";
            document.getElementById('info-capacidad').innerText = (data.capacidad || 0).toLocaleString();
            
            // Llenar los inputs de configuración por si quiere editarlos
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            document.getElementById('input-tamano').value = data.tamano || "";

            document.getElementById('info-tamano').innerText = data.tamano || "No definido";

            // Cargar Tabla de Jugadores
            renderizarJugadores(data.jugadores);
        }
    });
}

function guardarConfiguracion() {
    const est = document.getElementById('input-estadio').value;
    const cap = parseInt(document.getElementById('input-capacidad').value);
    const tam = document.getElementById('input-tamano').value;

    db.ref('equipos/' + equipoActualID).update({
        estadio: est,
        capacidad: cap,
        tamano: tam
    }).then(() => {
        alert("¡Configuración de sede actualizada!");
    });
}

function renderizarJugadores(jugadores) {
    const tbody = document.getElementById('lista-jugadores');
    tbody.innerHTML = "";
    let count = 0;

    if (jugadores) {
        Object.keys(jugadores).forEach(key => {
            const j = jugadores[key];
            count++;
            tbody.innerHTML += `
                <tr>
                    <td>${j.nombre}</td>
                    <td>$${j.valor.toLocaleString()}</td>
                    <td>$${j.salario.toLocaleString()}</td>
                    <td>$${j.prima.toLocaleString()}</td>
                    <td>${j.contrato} años</td>
                </tr>
            `;
        });
    }
    document.getElementById('player-count').innerText = `${count} Jugadores`;
}
