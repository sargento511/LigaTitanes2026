const primera = [
  "Palmeiras.",
  "Flamengo",
  "River Plate",
  "Boca Juniors",
  "Fluminense",
  "São Paulo FC",
  "Atlético Mineiro",
  "Racing Club",
  "Club América",
  "Tigres UANL",
  "CF Monterrey",
  "Columbus Crew",
  "Al-Hilal",
  "Al-Nassr",
  "Al-Ittihad",
  "Al-Ahli",
  "Urawa Red Diamonds",
  "Kawasaki Frontale"];

const segunda = [
  "Independiente",
  "San Lorenzo",
  "Vélez Sarsfield",
  "Athletico Paranaense",
  "Internacional",
  "Liga de Quito",
  "Colo-Colo",
  "Cruz Azul",
  "Chivas de Guadalajara",
  "Toluca FC",
  "LAFC",
  "Inter Miami CF",
  "Vissel Kobe",
  "Jeonbuk Hyundai Motors"];

const tercera = [
  "Halcones",
  "Deportivo",
  "Pumas UNAM",
  "Atlas FC",
  "Barcelona SC",
  "Universitario de Deportes",
  "Alianza Lima",
  "Club Bolívar",
  "LD Alajuelense",
  "Deportivo Saprissa",
  "Pohang Steelers",
  "Yokohama F. Marinos",
  "Melbourne City",
  "Al-Ain FC"];

// Función para cambiar las pestañas principales
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.style.display = "block";
    }
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
}
// Ejecutar al cargar
window.onload = cargarTablas;
