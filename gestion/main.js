// 1. CONFIGURACIÓN (REVISADA)
const firebaseConfig = {
    apiKey: "AIzaSyBVPj0mlp5ThkbaRb0XClwhmLPjrpTtlSk",
    authDomain: "ligatitanes-5e005.firebaseapp.com",
    databaseURL: "https://ligatitanes-5e005-default-rtdb.firebaseio.com",
    projectId: "ligatitanes-5e005",
    storageBucket: "ligatitanes-5e005.firebasestorage.app",
    messagingSenderId: "1086847217041",
    appId: "1:1086847217041:web:8197f77206ab117d107e30"
};

// Inicialización segura
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let datosEquipos = {};
let equipoActual = null;
let idActual = "";

// 2. FUNCIÓN DE ENTRADA (ESTA ES LA QUE MANDA)
window.seleccionarEquipo = function(id) {
    console.log("Intentando abrir equipo:", id);
    idActual = id;
    
    // Si los datos de Firebase aún no llegan, usamos los de respaldo
    if (!datosEquipos[id]) {
        console.log("Cargando desde respaldo...");
        datosEquipos = DATOS_RESPALDO;
    }
    
    equipoActual = datosEquipos[id];
    
    // Cambiar pantallas
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    
    actualizarTodo();
};

window.irInicio = function() {
    idActual = "";
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
};

// 3. DATOS DE RESPALDO (HALCONES REALES)
const DATOS_RESPALDO = {
    'Deportivo': { nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal', jugadores: [] },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, contrato: 2 },
            { nombre: 'Kimpembe', valor: 4, salario: 8, prima: 2, contrato: 2 },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, contrato: 2 },
            { nombre: 'Unai Simón', valor: 25, salario: 8, prima: 2, contrato: 2 },
            { nombre: 'Takefusa Kubo', valor: 30, salario: 11, prima: 3, contrato: 2 }
        ]
    }
};

// 4. ACTUALIZAR INTERFAZ
function actualizarTodo() {
    if (!equipoActual) return;
    
    // Saldo y Estadio
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;
    
    // Tabla
    const cuerpo = document.getElementById('body-plantilla');
    if (cuerpo) {
        cuerpo.innerHTML = equipoActual.jugadores.map((j, i) => `
            <tr>
                <td>${j.nombre}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>${j.contrato}a</td>
                <td><button onclick="window.venderAlAnterior(${i})" style="background:orange;">50%</button></td>
            </tr>
        `).join('');
    }
    
    // Listas de negociación
    actualizarListas();
}

// 5. CALCULADORA (TABLA SOLICITADA)
window.calcularFichaje = function() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    if (!n || isNaN(v)) return;

    let s = v >= 120 ? 22 : (v >= 90 ? 18 : (v >= 70 ? 14 : (v >= 50 ? 11 : (v >= 30 ? 8 : (v >= 20 ? 5 : (v >= 10 ? 3 : (v >= 5 ? 1.5 : 0.8)))))));
    let p = v >= 120 ? 7 : (v >= 90 ? 5 : (v >= 70 ? 4 : (v >= 50 ? 3 : (v >= 30 ? 2 : (v >= 20 ? 1.5 : (v >= 10 ? 1 : (v >= 5 ? 0.7 : 0.4)))))));

    document.getElementById('resultado-busqueda').innerHTML = `
        <div style="background:#222; padding:10px; margin-top:10px;">
            <p>${n}: $${s}M / $${p}M</p>
            <button onclick="window.confirmarCompra('${n}',${v},${s},${p})" style="background:green; color:white; width:100%;">FICHAR</button>
        </div>`;
};

window.confirmarCompra = function(n, v, s, p) {
    if (equipoActual.saldo < v) return alert("No hay dinero");
    equipoActual.saldo -= v;
    equ
