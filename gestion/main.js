// CONFIGURACIÓN DE TU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Datos iniciales (Solo se usan si la base de datos está vacía)
let datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal',
        jugadores: [{ nombre: 'Jugador Base', valor: 10, salario: 2, prima: 1, enVenta: false, contrato: 2 }]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja',
        jugadores: [{ nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, enVenta: false, contrato: 2 }]
    }
};

let equipoActual = null;

// --- SINCRONIZACIÓN EN TIEMPO REAL ---
// Esta función se ejecuta sola cada vez que ALGUIEN cambia algo en la nube
db.ref('liga/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        datosEquipos = data;
        if (equipoActual) {
            // Si el usuario está dentro de un equipo, refrescamos su tabla
            equipoActual = datosEquipos[Object.keys(datosEquipos).find(key => datosEquipos[key].nombre === equipoActual.nombre)];
            actualizarTabla();
        }
        cargarMercado();
    } else {
        // Si la base de datos está vacía, subimos los datos iniciales
        guardarEnNube();
    }
});

function guardarEnNube() {
    db.ref('liga/').set(datosEquipos);
}

// --- LÓGICA DEL JUEGO ---

function seleccionarEquipo(id) {
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarTabla();
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta ? 
            `<button onclick="toggleVenta(${index})" style="background:red;">QUITAR LISTA</button>` : 
            `<button onclick="toggleVenta(${index})" style="background:blue;">LISTA VENTAS</button>`;

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green;">RENOVAR</button>
                    <button onclick="vender(${index})" style="background:orange;">50%</button>
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
        guardarEnNube(); // Subir a Google
    } else { alert("Sin saldo"); }
}

function vender(index) {
    const j = equipoActual.jugadores[index];
    equipoActual.saldo += (j.valor * 0.5);
    equipoActual.jugadores.splice(index, 1);
    guardarEnNube(); // Subir a Google
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    guardarEnNube(); // Subir a Google
}

function cargarMercado() {
    const lista = document.getElementById('lista-mercado');
    if (!lista) return;
    lista.innerHTML = '';
    let hay = false;
    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) {
                hay = true;
                lista.innerHTML += `<li>${j.nombre} (${datosEquipos[eq].nombre})</li>`;
            }
        });
    }
    if (!hay) lista.innerHTML = '<li>No hay jugadores en venta</li>';
}

function calcularFichaje() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;
    
    // Lógica simple de salarios
    let s = v * 0.2; 
    let p = v * 0.1;
    
    document.getElementById('resultado-busqueda').innerHTML = 
        `${n}: Salario $${s.toFixed(1)}M | Prima $${p.toFixed(1)}M 
        <button onclick="fichar('${n}',${v},${s},${p})">CONFIRMAR COMPRA</button>`;
}

function fichar(n, v, s, p) {
    if (equipoActual.saldo >= v) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, enVenta: false, contrato: 2 });
        guardarEnNube(); // Subir a Google
        document.getElementById('resultado-busqueda').innerHTML = '';
    } else { alert("No tienes dinero"); }
}
