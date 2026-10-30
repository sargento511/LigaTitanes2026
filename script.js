// LISTA OFICIAL Y CORREGIDA DE EQUIPOS (46 CLUBES)

const primera = [
    { pos: 1, club: "Palmeiras", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "champions" },
    { pos: 2, club: "Flamengo", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "champions" },
    { pos: 3, club: "River Plate", pais: "🇦🇷 Argentina", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "champions" },
    { pos: 4, club: "Boca Juniors", pais: "🇦🇷 Argentina", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "champions" },
    { pos: 5, club: "Atlético Mineiro", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "liguilla" },
    { pos: 6, club: "Botafogo", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "liguilla" },
    { pos: 7, club: "São Paulo", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 1", estatus: "liguilla" },
    { pos: 8, club: "Deportivo Federal", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "liguilla" },
    { pos: 9, club: "Tigres UANL", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 10, club: "Cruz Azul", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 11, club: "Club América", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 12, club: "Inter Miami", pais: "🇺🇸 EE.UU.", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 13, club: "Los Angeles FC", pais: "🇺🇸 EE.UU.", conf: "CONCACAF", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 14, club: "Al-Hilal", pais: "🇸🇦 A. Saudita", conf: "AFC", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 15, club: "Al-Nassr", pais: "🇸🇦 A. Saudita", conf: "AFC", sponsor: "Nivel 2", estatus: "permanente" },
    { pos: 16, club: "Al-Ahli", pais: "🇸🇦 A. Saudita", conf: "AFC", sponsor: "Nivel 3", estatus: "descenso" },
    { pos: 17, club: "Vissel Kobe", pais: "🇯🇵 Japón", conf: "AFC", sponsor: "Nivel 3", estatus: "descenso" },
    { pos: 18, club: "Ulsan HD", pais: "🇰🇷 C. del Sur", conf: "AFC", sponsor: "Nivel 3", estatus: "descenso" }
];

const segunda = [
    { pos: 1, club: "Fluminense", pais: "🇧🇷 Brasil", conf: "CONMEBOL", sponsor: "Nivel 3", estatus: "ascenso" },
    { pos: 2, club: "Racing Club", pais: "🇦🇷 Argentina", conf: "CONMEBOL", sponsor: "Nivel 3", estatus: "ascenso" },
    { pos: 3, club: "Independiente del Valle", pais: "🇪🇨 Ecuador", conf: "CONMEBOL", sponsor: "Nivel 3", estatus: "ascenso" },
    { pos: 4, club: "Liga de Quito", pais: "🇪🇨 Ecuador", conf: "CONMEBOL", sponsor: "Nivel 3", estatus: "permanente" },
    { pos: 5, club: "Peñarol", pais: "🇺🇾 Uruguay", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 6, club: "Nacional", pais: "🇺🇾 Uruguay", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 7, club: "Toluca", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 8, club: "Chivas de Guadalajara", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 9, club: "Columbus Crew", pais: "🇺🇸 EE.UU.", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 10, club: "Seattle Sounders", pais: "🇺🇸 EE.UU.", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 11, club: "Al-Ittihad", pais: "🇸🇦 A. Saudita", conf: "AFC", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 12, club: "Urawa Red Diamonds", pais: "🇯🇵 Japón", conf: "AFC", sponsor: "Nivel 4", estatus: "descenso" },
    { pos: 13, club: "Pohang Steelers", pais: "🇰🇷 C. del Sur", conf: "AFC", sponsor: "Nivel 4", estatus: "descenso" },
    { pos: 14, club: "Halcones Rojos", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "descenso" }
];

const tercera = [
    { pos: 1, club: "Olimpia", pais: "🇵🇾 Paraguay", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "ascenso" },
    { pos: 2, club: "Libertad", pais: "🇵🇾 Paraguay", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "ascenso" },
    { pos: 3, club: "Colo-Colo", pais: "🇨🇱 Chile", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "ascenso" },
    { pos: 4, club: "Atlético Nacional", pais: "🇨🇴 Colombia", conf: "CONMEBOL", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 5, club: "Pachuca", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 6, club: "Pumas UNAM", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 7, club: "Cincinnati", pais: "🇺🇸 EE.UU.", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 8, club: "Alajuelense", pais: "🇨🇷 Costa Rica", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 9, club: "Saprissa", pais: "🇨🇷 Costa Rica", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 10, club: "Al-Ain", pais: "🇦🇪 E. Árabes", conf: "AFC", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 11, club: "Yokohama F. Marinos", pais: "🇯🇵 Japón", conf: "AFC", sponsor: "Nivel 4", estatus: "permanente" },
    { pos: 12, club: "Jeonbuk Hyundai", pais: "🇰🇷 C. del Sur", conf: "AFC", sponsor: "Nivel 4", estatus: "descenso" },
    { pos: 13, club: "Central Coast Mariners", pais: "🇦🇺 Australia", conf: "AFC", sponsor: "Nivel 4", estatus: "descenso" },
    { pos: 14, club: "Monterrey (Rayados)", pais: "🇲🇽 México", conf: "CONCACAF", sponsor: "Nivel 4", estatus: "descenso" }
];

// NAVEGACIÓN DE PESTAÑAS
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }

    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let btn of tabButtons) {
        btn.classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// SUB-PESTAÑAS DE FINANZAS
function openSubTab(evt, subName) {
    const subContents = document.getElementsByClassName("sub-content");
    for (let content of subContents) {
        content.classList.remove("active");
    }

    const subButtons = document.getElementsByClassName("sub-btn");
    for (let btn of subButtons) {
        btn.classList.remove("active");
    }

    document.getElementById(subName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// FILTRAR CARDS DE DIVISIONES
function filterDivision(div) {
    const buttons = document.getElementsByClassName("div-btn");
    for (let b of buttons) b.classList.remove("active");
    event.currentTarget.classList.add("active");

    const cards = ["card-d1", "card-d2", "card-d3"];
    cards.forEach(c => {
        const el = document.getElementById(c);
        if (div === 'all') {
            el.style.display = "block";
        } else {
            el.style.display = (c === `card-${div}`) ? "block" : "none";
        }
    });
}

// FORMATO DE ESTATUS
function getBadge(estatus) {
    switch (estatus) {
        case 'champions': return '<span class="badge champions">🏆 Champions</span>';
        case 'liguilla': return '<span class="badge liguilla">🔵 Liguilla</span>';
        case 'ascenso': return '<span class="badge ascenso">🟢 Ascenso</span>';
        case 'descenso': return '<span class="badge descenso">🔴 Riesgo/Descenso</span>';
        default: return '<span class="badge permanente">⚪ Permanente</span>';
    }
}

// CARGAR TABLAS AUTOMÁTICAMENTE
function renderTables() {
    const t1 = document.getElementById('body-primera');
    const t2 = document.getElementById('body-segunda');
    const t3 = document.getElementById('body-tercera');

    if (t1) {
        t1.innerHTML = primera.map(item => `
            <tr>
                <td><strong>${item.pos}</strong></td>
                <td><strong>${item.club}</strong><br><small style="color:#64748B;">${item.pais}</small></td>
                <td>${item.conf}</td>
                <td>${item.sponsor}</td>
                <td>${getBadge(item.estatus)}</td>
            </tr>
        `).join('');
    }

    if (t2) {
        t2.innerHTML = segunda.map(item => `
            <tr>
                <td><strong>${item.pos}</strong></td>
                <td><strong>${item.club}</strong><br><small style="color:#64748B;">${item.pais}</small></td>
                <td>${item.conf}</td>
                <td>${item.sponsor}</td>
                <td>${getBadge(item.estatus)}</td>
            </tr>
        `).join('');
    }

    if (t3) {
        t3.innerHTML = tercera.map(item => `
            <tr>
                <td><strong>${item.pos}</strong></td>
                <td><strong>${item.club}</strong><br><small style="color:#64748B;">${item.pais}</small></td>
                <td>${item.conf}</td>
                <td>${item.sponsor}</td>
                <td>${getBadge(item.estatus)}</td>
            </tr>
        `).join('');
    }
}

// COPIAR PROMPTS AL PORTAPAPELES
function copyPrompt(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("¡Prompt copiado exitosamente al portapapeles!");
    });
}

window.onload = renderTables;
