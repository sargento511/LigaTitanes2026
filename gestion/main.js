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

const DATOS_INICIALES = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL', saldo: 147.2, estadio: 'Estadio Federal',
        jugadores: [{ nombre: 'Esperando lista...', valor: 0, salario: 0, prima: 0, contrato: 2, enVenta: false }]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS', saldo: 276.4, estadio: 'La Caldera Roja',
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
        ]
    }
};

let datosEquipos = {};
let equipoActual = null;
let idEquipoActual = "";

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
        actualizarMercadoGlobal();
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
        tabla.innerHTML += `<tr>
            <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
            <td>$${j.valor}M</td><td>$${j.salario}M</td><td>$${j.prima}M</td><td>${j.contrato}a</td>
            <td>
                <button class="btn-renovar" onclick="renovar(${i})">RENOVAR</button>
                <button class="btn-50" onclick="vender50(${i})">50%</button>
                <button class="btn-liberar" onclick="liberar(${i})">LIBERAR</button>
                <button class="btn-venta" onclick="toggleVenta(${i})">${j.enVenta ? 'QUITAR' : 'VENTA'}</button>
            </td></tr>`;
    });
}

function renovar(i) {
    const j = equipoActual.jugadores[i];
    const costo = j.salario + j.prima; // Quita salario y prima
    if (equipoActual.saldo >= costo) {
        equipoActual.saldo -= costo;
        j.contrato += 1; // Sube un año
        db.ref('liga/').set(datosEquipos);
    } else {
        alert("Saldo insuficiente para renovar");
    }
}

function liberar(i) {
    const j = equipoActual.jugadores[i];
    const multa = j.contrato * j.salario; // Años x Salario
    if (equipoActual.saldo >= multa) {
        equipoActual.saldo -= multa;
        equipoActual.jugadores.splice(i, 1);
        db.ref('liga/').set(datosEquipos);
    } else {
        alert("Saldo insuficiente para pagar la rescisión");
    }
}

function vender50(i) {
    const j = equipoActual.jugadores[i];
    equipoActual.saldo += (j.valor * 0.5);
    equipoActual.jugadores.splice(i, 1);
    db.ref('liga/').set(datosEquipos);
}

function toggleVenta(i) {
    equipoActual.jugadores[i].enVenta = !equipoActual.jugadores[i].enVenta;
    db.ref('liga/').set(datosEquipos);
}

function actualizarMercadoGlobal() {
    const lista = document.getElementById('lista-mercado-publico');
    if (!lista) return;
    lista.innerHTML = '';
    let hayVentas = false;
    for (let id in datosEquipos) {
        datosEquipos[id].jugadores.forEach(j => {
            if (j.enVenta) {
                hayVentas = true;
                lista.innerHTML += `<div class="item-venta" style="background: #222; padding: 10px; border-radius: 8px; border: 1px solid #6f42c1; min-width: 150px; text-align: center;">
                    <b style="color:gold;">${j.nombre}</b><br>
                    <small>${datosEquipos[id].nombre}</small><br>
                    <span style="color:#28a745; font-weight:bold;">$${j.valor}M</span>
                </div>`;
            }
        });
    }
    if (!hayVentas) lista.innerHTML = '<p style="color:#555;">No hay jugadores transferibles</p>';
}

function calcularFichaje() {
    const n = document.getElementById('nombre-busqueda').value;
    const v = parseFloat(document.getElementById('valor-busqueda').value);
    const res = document.getElementById('resultado-busqueda');
    if (!n || isNaN(v)) return;
    let s = v >= 30 ? 8 : (v >= 10 ? 3 : 0.8);
    let p = v >= 30 ? 2 : (v >= 10 ? 1 : 0.4);
    res.innerHTML = `<div style="border:1px solid #444; padding:10px; margin-top:10px;">
        <p>${n}: Salario $${s}M | Prima $${p}M</p>
        <button onclick="fichar('${n}',${v},${s},${p})" style="background:green; color:white;">FICHAR</button></div>`;
}

function fichar(n, v, s, p) {
    if (equipoActual.saldo >= v) {
        equipoActual.saldo -= v;
        equipoActual.jugadores.push({ nombre: n, valor: v, salario: s, prima: p, contrato: 2, enVenta: false });
        db.ref('liga/').set(datosEquipos);
    } else {
        alert("Saldo insuficiente");
    }
}
