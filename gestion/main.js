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

function seleccionarEquipo(idEquipo) {
    equipoActual = datosEquipos[idEquipo];

    // Cambiar pantallas
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Actualizar Textos
    document.getElementById('nombre-equipo-titulo').innerText = equipoActual.nombre;
    actualizarInterfaz();
}

function actualizarInterfaz() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo}M`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    const tabla = document.getElementById('body-plantilla'); // CORREGIDO: coincide con tu HTML
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${j.nombre}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td><button onclick="venderJugador(${index})" style="background:red; width:auto; padding:5px 10px;">VENDER</button></td>
            </tr>`;
    });
}

function venderJugador(index) {
    const jugador = equipoActual.jugadores[index];
    equipoActual.saldo += jugador.valor; 
    equipoActual.jugadores.splice(index, 1); 
    actualizarInterfaz();
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function buscarFichaje() {
    const busqueda = document.getElementById('input-fichaje').value;
    if(busqueda) {
        alert("Buscando a: " + busqueda + " en el mercado...");
    }
}
