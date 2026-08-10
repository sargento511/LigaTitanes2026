document.addEventListener("DOMContentLoaded", () => {
    // 1. DATOS DE LOS EQUIPOS
    const primeraDivision = [
        { pos: 1, club: "Palmeiras", pais: "Brasil", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 2, club: "Flamengo", pais: "Brasil", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 3, club: "River Plate", pais: "Argentina", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 4, club: "Boca Juniors", pais: "Argentina", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 5, club: "Fluminense", pais: "Brasil", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 6, club: "São Paulo FC", pais: "Brasil", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 7, club: "Atlético Mineiro", pais: "Brasil", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 8, club: "Racing Club", pais: "Argentina", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 9, club: "Club América", pais: "México", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 10, club: "Tigres UANL", pais: "México", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 11, club: "CF Monterrey", pais: "México", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 12, club: "Columbus Crew", pais: "EE. UU.", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 13, club: "Al-Hilal", pais: "Arabia Saudita", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 14, club: "Al-Nassr", pais: "Arabia Saudita", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 15, club: "Al-Ittihad", pais: "Arabia Saudita", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 16, club: "Al-Ahli", pais: "Arabia Saudita", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 17, club: "Urawa Red Diamonds", pais: "Japón", sponsor: "Sponsor Nivel 1", estatus: "Élite" },
        { pos: 18, club: "Kawasaki Frontale", pais: "Japón", sponsor: "Sponsor Nivel 1", estatus: "Élite" }
    ];

    const segundaDivision = [
        { pos: 1, club: "Independiente", pais: "Argentina", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 2, club: "San Lorenzo", pais: "Argentina", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 3, club: "Vélez Sarsfield", pais: "Argentina", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 4, club: "Athletico Paranaense", pais: "Brasil", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 5, club: "Internacional", pais: "Brasil", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 6, club: "Liga de Quito", pais: "Ecuador", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 7, club: "Colo-Colo", pais: "Chile", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 8, club: "Cruz Azul", pais: "México", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 9, club: "Chivas de Guadalajara", pais: "México", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 10, club: "Toluca FC", pais: "México", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 11, club: "LAFC", pais: "EE. UU.", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 12, club: "Inter Miami CF", pais: "EE. UU.", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 13, club: "Vissel Kobe", pais: "Japón", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" },
        { pos: 14, club: "Jeonbuk Hyundai Motors", pais: "Corea del Sur", sponsor: "Sponsor Nivel 2/3", estatus: "Competitivo" }
    ];

    const terceraDivision = [
        { pos: 1, club: "Halcones Rojos", pais: "Usuario", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 2, club: "Deportivo Federal", pais: "Usuario", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 3, club: "Pumas UNAM", pais: "México", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 4, club: "Atlas FC", pais: "México", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 5, club: "Barcelona SC", pais: "Ecuador", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 6, club: "Universitario de Deportes", pais: "Perú", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 7, club: "Alianza Lima", pais: "Perú", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 8, club: "Club Bolívar", pais: "Bolivia", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 9, club: "LD Alajuelense", pais: "Costa Rica", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 10, club: "Deportivo Saprissa", pais: "Costa Rica", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 11, club: "Pohang Steelers", pais: "Corea del Sur", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 12, club: "Yokohama F. Marinos", pais: "Japón", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 13, club: "Melbourne City", pais: "Australia", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" },
        { pos: 14, club: "Al-Ain FC", pais: "EAU", sponsor: "Sponsor Nivel 4", estatus: "Desarrollo" }
    ];

    // 2. FUNCIÓN PARA RENDERIZAR TABLAS
    function renderTabla(datos, elementId) {
        const tbody = document.getElementById(elementId);
        if (!tbody) return;
        tbody.innerHTML = "";

        datos.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.pos}</td>
                <td><strong>${item.club}</strong> <small style="opacity: 0.7;">(${item.pais})</small></td>
                <td>${item.sponsor}</td>
                <td><span class="badge ${item.estatus.toLowerCase()}">${item.estatus}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Cargar tablas al iniciar
    renderTabla(primeraDivision, "body-primera");
    renderTabla(segundaDivision, "body-segunda");
    renderTabla(terceraDivision, "body-tercera");
});
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
            let estatus = pos <= 3 ? "🟢 Ascenso" : pos >= 13 ? "❌ Desaparece" : "⚪ Permanente";
            t2.innerHTML += `<tr><td>${pos}</td><td>${club}</td><td>${sponsor}</td><td>${estatus}</td></tr>`;
        });
    }
}

// Ejecutar al cargar
window.onload = cargarTablas;
