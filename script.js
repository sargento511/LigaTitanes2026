const primera = ["Halcones", "Deportivo", "Al-Nassr", "Inter Miami", "Al Hilal", "Palmeiras", "America", "Flamengo", "Ulsan HD", "Yokohama F Marinos", "Columbus Crew", "Al Ittihad"];
const segunda = ["Vancouber Whitecaps", "Vissel Kobe", "Los Angeles", "Boca Juniors", "River Plate", "Tigres UANL", "Al-Ain", "Sao Paulo", "Jeonbuk Hyundai Motors", "Monterrey"];

// 1. PESTAÑAS PRINCIPALES (Tablas, Reglamento, etc.)
function openTab(evt, tabName) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
    }

    const buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

// 2. SUB-PESTAÑAS DE FINANZAS (Ingresos / Gastos)
function openSubTab(evt, subName) {
    const subContents = document.getElementsByClassName("sub-content");
    for (let i = 0; i < subContents.length; i++) {
        subContents[i].classList.remove("active");
        subContents[i].style.display = "none";
    }

    const subButtons = document.getElementsByClassName("sub-btn");
    for (let i = 0; i < subButtons.length; i++) {
        subButtons[i].classList.remove("active");
    }

    const target = document.getElementById(subName);
    if (target) {
        target.classList.add("active");
        target.style.display = "block";
        evt.currentTarget.classList.add("active");
    }
}

// 3. SWITCH INTERNO DE GASTOS (Operativos / Guía de Marcas)
function toggleGastos(modo) {
    const seccionTablas = document.getElementById('seccion-tablas-gastos');
    const seccionInfo = document.getElementById('seccion-info-gastos');
    const btnTablas = document.getElementById('btn-tablas-gastos');
    const btnInfo = document.getElementById('btn-info-gastos');

    if (modo === 'tablas') {
        seccionTablas.style.display = 'block';
        seccionInfo.style.display = 'none';
        btnTablas.classList.add('active');
        btnInfo.classList.remove('active');
    } else {
        seccionTablas.style.display = 'none';
        seccionInfo.style.display = 'block';
        btnTablas.classList.remove('active');
        btnInfo.classList.add('active');
    }
}

// 4. CARGA DE TABLAS AUTOMÁTICA
function cargarTablas() {
    const t1 = document.getElementById('body-primera');
    const t2 = document.getElementById('body-segunda');

    if (t1) {
        t1.innerHTML = "";
        primera.forEach((club, i) => {
            let pos = i + 1;
            let sponsor = pos <= 3 ? "Nivel 1" : pos <= 5 ? "Nivel 2" : "Nivel 3";
            let estatus = pos <= 5 ? "🏆 Liguilla/Champions" : pos >= 11 ? "🔴 Descenso" : "⚪ Permanente";
            t1.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }

    if (t2) {
        t2.innerHTML = "";
        segunda.forEach((club, i) => {
            let pos = i + 1;
            let sponsor = pos <= 4 ? "Nivel 3" : "Nivel 4";
            let estatus = pos <= 2 ? "🟢 Ascenso" : pos >= 9 ? "❌ Desaparece" : "⚪ Permanente";
            t2.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }
}

// Ejecutar al cargar
window.onload = cargarTablas;
