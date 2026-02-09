const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: '$250M',
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Juan Pérez', posicion: 'Portero', valor: '$20M' },
            { nombre: 'Carlos Ruiz', posicion: 'Defensa', valor: '$15M' }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: '$200M',
        estadio: 'Nido del Halcón (Mediano)',
        jugadores: [
            { nombre: 'Águila Real', posicion: 'Medio', valor: '$30M' },
            { nombre: 'Pedro S.', posicion: 'Delantero', valor: '$50M' }
        ]
    }
};

function seleccionarEquipo(nombreEquipo) {
    console.log("Entrando a:", nombreEquipo); // Esto nos dirá en F12 si funciona
    const equipo = datosEquipos[nombreEquipo];

    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    document.getElementById('nombre-equipo-titulo').innerText = equipo.nombre;
    document.getElementById('saldo-actual').innerText = equipo.saldo;
    document.getElementById('tipo-estadio').innerText = equipo.estadio;

    const tabla = document.getElementById('tabla-jugadores');
    tabla.innerHTML = ''; 

    equipo.jugadores.forEach(jugador => {
        const fila = `<tr>
            <td>${jugador.nombre}</td>
            <td>${jugador.posicion}</td>
            <td>${jugador.valor}</td>
            <td><button style="width:auto; padding:5px; background:red;">VENDER</button></td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}
