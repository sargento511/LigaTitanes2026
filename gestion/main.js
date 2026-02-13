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

let equipoActualID = "";

function entrarEquipo(nombreEquipo, logo) {
    equipoActualID = nombreEquipo;
    
    // UI: Cambiar pantallas
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // UI: Header
    document.getElementById('header-name').innerText = nombreEquipo;
    document.getElementById('header-logo').src = logo;

    // Escuchar cambios en Firebase (Tiempo Real)
    db.ref('equipos/' + nombreEquipo).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // 1. Actualizar Tarjetas Superiores
            document.getElementById('info-presupuesto').innerText = `$${(data.presupuesto || 0).toLocaleString()}`;
            document.getElementById('info-estadio').innerText = data.estadio || "Sin nombre";
            document.getElementById('info-capacidad').innerText = (data.capacidad || 0).toLocaleString();
            document.getElementById('info-tamano').innerText = data.tamano || "No definido";

            // 2. Sincronizar Inputs de Edición
            document.getElementById('input-estadio').value = data.estadio || "";
            document.getElementById('input-capacidad').value = data.capacidad || 0;
            document.getElementById('input-tamano').value = data.tamano || "";

            // 3. Renderizar Jugadores
            renderizarJugadores(data.jugadores);
        }
    });
}

function guardarConfiguracion() {
    if (!equipoActualID) return;

    const est = document.getElementById('input-estadio').value;
    const cap = parseInt(document.getElementById('input-capacidad').value) || 0;
    const tam = document.getElementById('input-tamano').value;

    db.ref('equipos/' + equipoActualID).update({
        estadio: est,
        capacidad: cap,
        tamano: tam
    }).then(() => {
        alert("✅ Sede actualizada correctamente");
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
