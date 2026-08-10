// 4. CARGA DE TABLAS AUTOMÁTICA
function cargarTablas() {
    const t1 = document.getElementById('body-primera');
    const t2 = document.getElementById('body-segunda');
    const t3 = document.getElementById('body-tercera');

    if (t1) {
        t1.innerHTML = "";
        primera.forEach((club, i) => {
            let pos = i + 1;
            let sponsor = pos <= 8 ? "Nivel 1" : pos <= 14 ? "Nivel 2" : "Nivel 3";
            let estatus = pos <= 4 ? "🏆 Champions" : pos <= 8 ? "🏆 Liguilla" : pos >= 16 ? "🔴 Descenso" : "⚪ Permanente";
            t1.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }

    if (t2) {
        t2.innerHTML = "";
        segunda.forEach((club, i) => {
            let pos = i + 1;
            let sponsor = pos <= 5 ? "Nivel 3" : "Nivel 4";
            let estatus = pos <= 3 ? "🟢 Ascenso" : pos >= 13 ? "🔴 Descenso" : "⚪ Permanente";
            t2.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }

    if (t3) {
        t3.innerHTML = "";
        tercera.forEach((club, i) => {
            let pos = i + 1;
            let sponsor = "Nivel 4";
            let estatus = pos <= 3 ? "🟢 Ascenso" : "⚪ Permanente";
            t3.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }
} // <--- Aquí faltaba cerrar la función

// Cargar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarTablas);
// Ejecutar al cargar
window.onload = cargarTablas;
