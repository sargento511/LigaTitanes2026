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
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white;">LISTA VENTAS</button>`;

        // Dentro de actualizarTabla, antes del innerHTML
const claseContrato = j.contrato === 0 ? 'contrato-critico' : (j.contrato === 1 ? 'contrato-bajo' : 'contrato-ok');

        tabla.innerHTML += `
            <tr>
                <td>${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td class="${claseContrato}">${j.contrato} años</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white; margin-right:5px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; color:white; margin-right:5px;">50%</button>
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

function finalizarTemporada() {
    // 1. Confirmación inicial
    if (!confirm("⚠️ ¿Finalizar temporada? Se restará 1 año de contrato a todos.")) return;

    // 2. Aplicamos la resta a todos los que tengan contrato
    equipoActual.jugadores.forEach(j => {
        if (j.contrato > 0) {
            j.contractoPrevio = j.contrato; // Guardamos estado para avisar
            j.contrato -= 1;
        }
    });

    // 3. Revisamos quiénes quedaron en 0 (recién vencidos o ya vencidos)
    const vencidos = equipoActual.jugadores.filter(j => j.contrato === 0);

    if (vencidos.length > 0) {
        const nombresVencidos = vencidos.map(j => j.nombre).join(", ");
        
        // Mensaje de ultimátum
        const continuar = confirm(
            `🚨 ¡CONTRATOS VENCIDOS!\n\n` +
            `Los siguientes jugadores han quedado con 0 temporadas:\n[ ${nombresVencidos} ]\n\n` +
            `Si cierras la temporada ahora, estos jugadores se irán LIBRES.\n` +
            `¿Deseas eliminarlos ahora? (Si cancelas, se quedan en 0 para que los renueves antes de la próxima temporada).`
        );

        if (continuar) {
            // Eliminamos a los que tienen 0
            equipoActual.jugadores = equipoActual.jugadores.filter(j => j.contrato > 0);
            alert("✅ Temporada cerrada. Los jugadores sin contrato se han marchado.");
        } else {
            alert("⚠️ Temporada cerrada. Recuerda renovar a los jugadores en 0 antes del próximo cierre.");
        }
    } else {
        alert("✅ Temporada cerrada con éxito. Todos los contratos están al día.");
    }

    actualizarTabla();
}

function renovar(index) {
    const j = equipoActual.jugadores[index];
    if (equipoActual.saldo < j.prima) {
        alert("Saldo insuficiente para la prima.");
        return;
    }
    if (confirm(`¿Renovar a ${j.nombre} por $${j.prima}M?`)) {
        equipoActual.saldo -= j.prima;
        j.contrato += 1;
        actualizarTabla();
    }
}

function cargarMercado() {
    const listaMercado = document.getElementById('lista-mercado');
    if (!listaMercado) return;
    listaMercado.innerHTML = '';
    let hayJugadores = false;
    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) {
                hayJugadores = true;
                listaMercado.innerHTML += `<li><strong>${j.nombre}</strong> (${datosEquipos[eq].nombre})</li>`;
            }
        });
    }
    if (!hayJugadores) listaMercado.innerHTML = '<li>No hay jugadores en venta</li>';
}

function calcularFichaje() {
    const nombre = document.getElementById('nombre-busqueda').value;
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const resultadoDiv = document.getElementById('resultado-busqueda');

    if (!nombre || isNaN(valor)) {
        resultadoDiv.innerHTML = "Escribe datos válidos.";
        return;
    }

    let salario = 0, prima = 0;
    if (valor >= 120) { salario = 22; prima = 7; }
    else if (valor >= 90) { salario = 18; prima = 5; }
    else if (valor >= 70) { salario = 14; prima = 4; }
    else if (valor >= 50) { salario = 11; prima = 3; }
    else if (valor >= 30) { salario = 8; prima = 2; }
    else if (valor >= 20) { salario = 5; prima = 1.5; }
    else if (valor >= 10) { salario = 3; prima = 1; }
    else if (valor >= 5) { salario = 1.5; prima = 0.7; }
    else { salario = 0.8; prima = 0.4; }

    resultadoDiv.innerHTML = `
        <div style="background:#222; padding:10px; border-radius:5px; margin-top:10px;">
            <p>${nombre.toUpperCase()} - Salario: $${salario}M | Prima: $${prima}M</p>
            <button onclick="confirmarCompra('${nombre}', ${valor}, ${salario}, ${prima})" style="background:green; color:white; width:100%;">FICHAR</button>
        </div>`;
}

function confirmarCompra(nombre, valor, salario, prima) {
    if (equipoActual.saldo < valor) {
        alert("No hay dinero.");
        return;
    }
    if (confirm(`¿Comprar a ${nombre}?`)) {
        equipoActual.saldo -= valor;
        equipoActual.jugadores.push({ nombre, valor, salario, prima, enVenta: false, contrato: 2 });
        document.getElementById('resultado-busqueda').innerHTML = '';
        actualizarTabla();
    }
}

window.onload = cargarMercado;
