// Datos de los equipos (Esto simula tu "base de datos")
const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: '$250M',
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Juan Pérez', posicion: 'Portero', valor: '$20M' },
            { nombre: 'Carlos Ruiz', posicion: 'Defensa', valor: '$15M' },
            { nombre: 'Luis G.', posicion: 'Delantero', valor: '$45M' }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: '$200M',
        estadio: 'Nido del Halcón (Mediano)',
        jugadores: [
            { nombre: 'Águila Real', posicion: 'Medio', valor: '$30M' },
            { nombre: 'Pedro S.', posicion: 'Delantero', valor: '$50M' },
            { nombre: 'Mario L.', posicion: 'Defensa', valor: '$12M' }
        ]
    }
};

function seleccionarEquipo(nombreEquipo) {
    const equipo = datosEquipos[nombreEquipo];

    // 1. Ocultar el selector y mostrar el dashboard
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // 2. Actualizar textos
    document.getElementById('nombre-equipo-titulo').innerText = equipo.nombre;
    document.getElementById('saldo-actual').innerText = equipo.saldo;
    document.getElementById('tipo-estadio').innerText = equipo.estadio;

    // 3. Llenar la tabla de jugadores
    const tabla = document.getElementById('tabla-jugadores');
    tabla.innerHTML = ''; // Limpiar tabla antes de llenar

    equipo.jugadores.forEach(jugador => {
        const fila = `<tr>
            <td>${jugador.nombre}</td>
            <td>${jugador.posicion}</td>
            <td>${jugador.valor}</td>
            <td><button onclick="venderJugador('${jugador.nombre}')" style="padding:5px 10px; background:red;">VENDER</button></td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}
