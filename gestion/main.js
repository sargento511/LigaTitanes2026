const datosEquipos = {
    'Deportivo': {
        nombre: 'DEPORTIVO FEDERAL',
        saldo: 147.2,
        estadio: 'Estadio Federal (Grande)',
        jugadores: [
            { nombre: 'Esperando lista...', valor: 0, salario: 0, prima: 0, enVenta: false }
        ]
    },
    'Halcones': {
        nombre: 'HALCONES ROJOS',
        saldo: 276.4,
        estadio: 'La Caldera Roja (Gigante)',
        jugadores: [
            { nombre: 'Keylor Navas', valor: 0.8, salario: 0.8, prima: 0.4, enVenta: false },
            { nombre: 'Puchacz', valor: 1.5, salario: 1.5, prima: 0.7, enVenta: false },
            { nombre: 'Kimpembe', valor: 4, salario: 8, prima: 2, enVenta: false },
            { nombre: 'Yan Couto', valor: 20, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'David Raum', valor: 20, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'DeAndre Yedlin', valor: 1, salario: 1, prima: 0.4, enVenta: false },
            { nombre: 'Yeray Álvarez', valor: 1, salario: 1, prima: 0.4, enVenta: false },
            { nombre: 'Unai Simón', valor: 25, salario: 8, prima: 2, enVenta: false },
            { nombre: 'Luis Alberto', valor: 5, salario: 5, prima: 0.7, enVenta: false },
            { nombre: 'Pape Cissé', valor: 1, salario: 1, prima: 0.4, enVenta: false },
            { nombre: 'Granit Xhaka', valor: 10, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'Trindade', valor: 28, salario: 8, prima: 2, enVenta: false },
            { nombre: 'Tomáš Souček', valor: 12, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'Gilberto Mora', valor: 10, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'Paul Pogba', valor: 5, salario: 6, prima: 2, enVenta: false },
            { nombre: 'Daniel James', valor: 14, salario: 14, prima: 4, enVenta: false },
            { nombre: 'Samuel Chukwueze', valor: 10, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'Kaoru Mitoma', valor: 30, salario: 11, prima: 3, enVenta: false },
            { nombre: 'Antonio Nusa', valor: 32, salario: 11, prima: 3, enVenta: false },
            { nombre: 'Takefusa Kubo', valor: 30, salario: 11, prima: 3, enVenta: false },
            { nombre: 'Youssoufa Moukoko', valor: 7, salario: 5, prima: 1.5, enVenta: false },
            { nombre: 'Victor Osimhen', valor: 10, salario: 15, prima: 5, enVenta: false },
            { nombre: 'Aymeric Laporte', valor: 9, salario: 7, prima: 2, enVenta: false }
        ]
    }
};

let equipoActual = null;

// Esta función corre al abrir la página y al volver al inicio
function cargarMercado() {
    const listaMercado = document.getElementById('lista-mercado');
    if (!listaMercado) return;
    listaMercado.innerHTML = '';
    
    let hayJugadores = false;

    for (let eq in datosEquipos) {
        datosEquipos[eq].jugadores.forEach(j => {
            if (j.enVenta) {
                hayJugadores = true;
                listaMercado.innerHTML += `<li><strong>${j.nombre}</strong> - ${datosEquipos[eq].nombre} ($${j.valor}M)</li>`;
            }
        });
    }

    if (!hayJugadores) {
        listaMercado.innerHTML = '<li>No hay jugadores en venta</li>';
    }
}

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
        // Lógica del botón de venta
        const btnVenta = j.enVenta 
            ? `<button onclick="toggleVenta(${index})" style="background:red; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:4px; font-size:10px;">QUITAR LISTA</button>`
            : `<button onclick="toggleVenta(${index})" style="background:blue; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:4px; font-size:10px;">LISTA VENTAS</button>`;

        tabla.innerHTML += `
            <tr>
                <td style="${j.enVenta ? 'color: #007bff; font-weight: bold;' : ''}">${j.nombre} ${j.enVenta ? '🔥' : ''}</td>
                <td>$${j.valor}M</td>
                <td>$${j.salario}M</td>
                <td>$${j.prima}M</td>
                <td>
                    <button onclick="renovar(${index})" style="background:green; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">RENOVAR</button>
                    <button onclick="venderAlAnterior(${index})" style="background:orange; color:white; border:none; padding:4px 8px; margin:2px; cursor:pointer; border-radius:4px; font-size:10px;">VENDER 50%</button>
                    ${btnVenta}
                </td>
            </tr>`;
    });
}

function toggleVenta(index) {
    equipoActual.jugadores[index].enVenta = !equipoActual.jugadores[index].enVenta;
    actualizarTabla();
}

function venderAlAnterior(index) {
    const j = equipoActual.jugadores[index];
    const pago = j.valor * 0.5; 
    if(confirm(`¿Vender a ${j.nombre} por $${pago.toFixed(1)} MDD?`)) {
        equipoActual.saldo += pago;
        equipoActual.jugadores.splice(index, 1);
        actualizarTabla();
    }
}

function renovar(index) { alert("¡Contrato renovado!"); }

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    cargarMercado();
}

// --- FUNCIONES DE FICHAJES (PEGAR AL FINAL DEL ARCHIVO) ---

function calcularFichaje() {
    const nombre = document.getElementById('nombre-busqueda').value;
    const valor = parseFloat(document.getElementById('valor-busqueda').value);
    const resultadoDiv = document.getElementById('resultado-busqueda');

    if (!nombre || isNaN(valor)) {
        resultadoDiv.innerHTML = "<span style='color: #ff4444;'>Escribe nombre y valor real.</span>";
        return;
    }

    let salario = 0;
    let prima = 0;

    // LÓGICA SEGÚN TU TABLA DE VALORES
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
        <div style="background: #222; padding: 15px; border-radius: 8px; border-left: 5px solid #28a745; margin-top: 15px; text-align: left;">
            <p style="margin: 0; color: #28a745; font-size: 1.1em;">✅ <strong>${nombre.toUpperCase()}</strong></p>
            <div style="margin: 10px 0; font-size: 14px; line-height: 1.6;">
                <strong>💰 Salario:</strong> $${salario}M <br>
                <strong>💸 Prima:</strong> $${prima}M
            </div>
            <button onclick="confirmarCompra('${nombre}', ${valor}, ${salario}, ${prima})" 
                style="background: #28a745; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold;">
                FICHAR E INCORPORAR
            </button>
        </div>
    `;
}

function confirmarCompra(nombre, valor, salario, prima) {
    if (equipoActual.saldo < valor) {
        alert("¡No tienes dinero suficiente! Te faltan $" + (valor - equipoActual.saldo).toFixed(1) + "M");
        return;
    }

    if (confirm(`¿Pagar $${valor}M por ${nombre}?`)) {
        equipoActual.saldo -= valor;
        equipoActual.jugadores.push({
            nombre: nombre,
            valor: valor,
            salario: salario,
            prima: prima,
            enVenta: false
        });
        
        // Limpiar
        document.getElementById('nombre-busqueda').value = '';
        document.getElementById('valor-busqueda').value = '';
        document.getElementById('resultado-busqueda').innerHTML = '';
        
        actualizarTabla();
        alert("¡Fichaje realizado con éxito!");
    }
}
