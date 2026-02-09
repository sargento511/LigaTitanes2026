const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 147.2,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Esperando lista...', valor: 0, salario: 0, prima: 0, enVenta: false, contrato: 2 }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 276.4,
        estadio: 'La Caldera Roja (Gigante)',
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

let equipoActual = null;

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
    cargarMercado();
}

function actualizarTabla() {
    document.getElementById('saldo-actual').innerText = `$${equipoActual.saldo.toFixed(1)} MDD`;
    document.getElementById('tipo-estadio').innerText = equipoActual.estadio;

    const tabla = document.getElementById('body-plantilla');
    if (!tabla) return;
    tabla.innerHTML = '';

    equipoActual.jugadores.forEach((j, index) => {
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">LISTA VENTAS</button>`;

        const claseContrato = j.contrato === 0 ? 'contrato-critico' : (j.contrato === 1 ? 'contrato-bajo' : 'contrato-ok');

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td class="${claseContrato}">${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">50%</button>
                    <button onclick="liberarJugador(${index})" style="background:#444; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">LIBERAR</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    actualizarTabla();
    cargarMercado();
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5;
    if(confirm(`¿Vender a ${j.nombre} por $${pago.toFixed(1)}M?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        actualizarTabla();
    }
}

function liberarJugador(index) {
    const j = equipoActual.jugadores[index];
    const costoLiberacion = j.salario * j.contrato;
    
    let mensaje = `¿Est
