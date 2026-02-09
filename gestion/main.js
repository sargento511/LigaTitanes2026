const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 147.2,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Juan Pérez', valor: 20, salario: 2 },
            { nombre: 'Carlos Ruiz', valor: 15, salario: 1 }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 276.4,
        estadio: 'La Caldera Roja (Gigante)',
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
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
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
                    <div style="display: flex; gap: 5px;">
                        <button onclick="renovar(${index})" style="background: #28a745; font-size: 11px; padding: 5px; width: auto;">RENOVAR</button>
                        <button onclick="venderAlAnterior(${index})" style="background: #fd7e14; font-size: 11px; padding: 5px; width: auto;">VENDER (50%)</button>
                        <button onclick="ponerTransferible(${index})" style="background: #007bff; font-size: 11px; padding: 5px; width: auto;">LISTA VENTA</button>
                    </div>
                </td>
            </tr>`;
    });
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5; 
    if(confirm(`¿Vender a ${j.nombre} al equipo anterior por $${pago.toFixed(1)} MDD?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        actualizarTabla();
    }
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    alert(`Contrato de ${j.nombre} renovado en ${equipoActual.estadio}.`);
}

function ponerTransferible(index) {
    const j = equipoActual.jugadores[index];
    alert(`${j.nombre} ha sido puesto en la lista de transferibles.`);
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}
