const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 147.2,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Esperando lista de Deportivo...', valor: 0, salario: 0, prima: 0 }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 276.4,
        estadio: 'La Caldera Roja (Gigante)',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4 },
            { nombre: 'Puchacz', valor: 1.5, salario: 1.5, prima: 0.7 },
            { nombre: 'Kimpembe', valor: 4, salario: 8, prima: 2 },
            { nombre: 'Yan Couto', valor: 20, salario: 5, prima: 1.5 },
            { nombre: 'David Raum', valor: 20, salario: 5, prima: 1.5 },
            { nombre: 'DeAndre Yedlin', valor: 1, salario: 1, prima: 0.4 },
            { nombre: 'Yeray Álvarez', valor: 1, salario: 1, prima: 0.4 },
            { nombre: 'Unai Simón', valor: 25, salario: 8, prima: 2 },
            { nombre: 'Luis Alberto', valor: 5, salario: 5, prima: 0.7 },
            { nombre: 'Pape Cissé', valor: 1, salario: 1, prima: 0.4 },
            { nombre: 'Granit Xhaka', valor: 10, salario: 5, prima: 1.5 },
            { nombre: 'Trindade', valor: 28, salario: 8, prima: 2 },
            { nombre: 'Tomáš Souček', valor: 12, salario: 5, prima: 1.5 },
            { nombre: 'Gilberto Mora', valor: 10, salario: 5, prima: 1.5 },
            { nombre: 'Paul Pogba', valor: 5, salario: 6, prima: 2 },
            { nombre: 'Daniel James', valor: 14, salario: 14, prima: 4 },
            { nombre: 'Samuel Chukwueze', valor: 10, salario: 5, prima: 1.5 },
            { nombre: 'Kaoru Mitoma', valor: 30, salario: 11, prima: 3 },
            { nombre: 'Antonio Nusa', valor: 32, salario: 11, prima: 3 },
            { nombre: 'Takefusa Kubo', valor: 30, salario: 11, prima: 3 },
            { nombre: 'Youssoufa Moukoko', valor: 7, salario: 5, prima: 1.5 },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5 },
            { nombre: 'Aymeric Laporte', valor: 9, salario: 7, prima: 2 }
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
                <td>$${j.prima}M</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="renovar(${index})" style="background: #28a745; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 10px;">RENOVAR</button>
                        <button onclick="venderAlAnterior(${index})" style="background: #fd7e14; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 10px;">VENDER (50%)</button>
                        <button onclick="ponerEnVenta(${index})" style="background: #007bff; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 10px;">LISTA VENTAS</button>
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
    alert(`Contrato de ${j.nombre} renovado con éxito.`);
}

function ponerEnVenta(index) {
    const j = equipoActual.jugadores[index];
    alert(`${j.nombre} ha sido añadido a la Lista de Ventas de la Liga.`);
}

function irInicio() {
    window.location.reload();
}
