function seleccionarEquipo(nombre) {
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('nombre-equipo-titulo').innerText = "Gestión: " + nombre;
}

function irInicio() {
    document.getElementById('pantalla-inicio').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function buscarFichaje() {
    let busqueda = document.getElementById('input-fichaje').value;
    alert("Buscando a " + busqueda + " en Transfermarkt y bases de datos rivales...");
}
