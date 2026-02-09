const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 250,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Juan Pérez', valor: 20, salario: 2 },
            { nombre: 'Carlos Ruiz', valor: 15, salario: 1 }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 200,
        estadio: 'Nido del Halcón (Mediano)',
        jugadores: [
            { nombre: 'Águila Real', valor: 30, salario: 3 },
            { nombre: 'Pedro S.', valor: 50, salario: 5 }
        ]
    }
};

let equipoActual = null;

function seleccionarEquipo(id) {
    equipoActual = datosEquipos[id];
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarTabla();
}

function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo}M`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    const tabla = document.getElementById('body-plantilla');
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${j.nombre}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; width:auto; padding:5px 10px; margin-right:5px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; width:auto; padding:5px 10px; margin-right:5px;">VENDER (50%)</button>
                    <button onclick="ponerTransferible(${index})" style="background:blue; width:auto; padding:5px 10px;">LISTA VENTA</button>
                </td>
            </tr>`;
    });
}

// REGLA: Vender al equipo anterior por el 50% del valor
function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5; // Solo recibe la mitad
    if(confirm(`¿Vender a ${j.nombre} al equipo anterior por $${pago}M (50%)?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        actualizarTabla();
    }
}

// Función para Renovar (Aquí puedes cobrar un gasto si quieres)
function renovar(index) {
    const j = equipoActual.jugadores[index];
    alert(`${j.nombre} ha renovado su contrato.`);
    // Aquí podrías restar saldo por "prima de renovación" si lo deseas
}

// Función para poner a la venta (Solo avisa por ahora)
function ponerTransferible(index) {
    const j = equipoActual.jugadores[index];
    alert(`${j.nombre} ahora está en la lista de transferibles.`);
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}
