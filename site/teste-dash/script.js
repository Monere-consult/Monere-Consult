// ====================================================
// CONSTANTES
// ====================================================
const LIMITE_MIN = 20;
const LIMITE_MAX = 26;

const COR_OK = '#e8620c';     // laranja
const COR_ALTA = '#d71920';   // vermelho
const COR_BAIXA = '#1f4fe0';  // azul

// ====================================================
// DADOS MOCADOS (depois trocar por fetch na API)
// ====================================================
const salas = [
    { nome: 'Sala 1',  temperatura: 22.4 },
    { nome: 'Sala 2',  temperatura: 17.4 },
    { nome: 'Sala 3',  temperatura: 21.8 },
    { nome: 'Sala 4',  temperatura: 24.5 },
    { nome: 'Sala 5',  temperatura: 19.5 },
    { nome: 'Sala 6',  temperatura: 25.2 },
    { nome: 'Sala 7',  temperatura: 27.1 },
    { nome: 'Sala 8',  temperatura: 22.9 },
    { nome: 'Sala 9',  temperatura: 21.2 },
    { nome: 'Sala 10', temperatura: 28.4 },
    { nome: 'Sala 11', temperatura: 23.1 }
];

const horas = ['17:46','17:48','17:50','17:52','17:54','17:56','17:58','18:00',
               '18:02','18:04','18:06','18:08','18:10','18:12','18:14','18:16'];

const serieSala9 = [22.1,22.6,22.0,21.1,21.6,22.6,23.3,23.9,
                    23.4,23.3,24.0,24.9,25.5,24.8,24.0,22.8];

// Gera a série de qualquer sala deslocando a série da Sala 9
function serieDaSala(sala) {
    const ajuste = sala.temperatura - salas[8].temperatura;
    return serieSala9.map(v => +(v + ajuste).toFixed(1));
}

// ====================================================
// FUNÇÕES UTILITÁRIAS
// ====================================================
function corDaTemperatura(t) {
    if (t > LIMITE_MAX) return COR_ALTA;
    if (t < LIMITE_MIN) return COR_BAIXA;
    return COR_OK;
}

function foraDoLimite(t) {
    return t > LIMITE_MAX || t < LIMITE_MIN;
}

function definirStatus(idElemento, atencao) {
    const el = document.getElementById(idElemento);
    el.textContent = atencao ? 'Atenção' : 'Normal';
    el.className = 'valor ' + (atencao ? 'status-atencao' : 'status-normal');
}

// ====================================================
// PLUGINS DO CHART.JS
// ====================================================

// Desenha as duas linhas tracejadas de limite (26 e 20)
const pluginLimites = {
    id: 'limites',
    afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        [[LIMITE_MAX, 'rgba(215,25,32,0.6)'], [LIMITE_MIN, 'rgba(150,160,180,0.6)']].forEach(([valor, cor]) => {
            const y = scales.y.getPixelForValue(valor);
            ctx.strokeStyle = cor;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();
        });
        ctx.restore();
    }
};

// Escreve o valor em cima de cada barra
const pluginValoresBarras = {
    id: 'valoresBarras',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '600 10px Montserrat, Arial';
        ctx.textAlign = 'center';
        chart.getDatasetMeta(0).data.forEach((barra, i) => {
            ctx.fillText(chart.data.datasets[0].data[i], barra.x, barra.y - 6);
        });
        ctx.restore();
    }
};

// ====================================================
// CONFIGURAÇÕES GERAIS DO CHART.JS
// ====================================================
Chart.defaults.color = '#dde';
Chart.defaults.font.family = 'Montserrat, Arial, sans-serif';
Chart.defaults.font.weight = 300;

const escalaY = {
    min: 16,
    max: 30,
    ticks: { stepSize: 2 },
    grid: { color: 'rgba(255,255,255,0.06)' }
};

const escalaX = {
    grid: { color: 'rgba(255,255,255,0.06)' }
};

// ====================================================
// GRÁFICO 1: LINHA (sala escolhida)
// ====================================================
let graficoLinha = null;

function mostrarSala(sala) {
    const serie = serieDaSala(sala);
    const atual = serie[serie.length - 1];

    document.getElementById('valorTempAtual').textContent = atual.toFixed(1) + ' °C';
    definirStatus('statusSala', foraDoLimite(atual));

    if (graficoLinha) graficoLinha.destroy();

    graficoLinha = new Chart(document.getElementById('graficoLinha'), {
        type: 'line',
        data: {
            labels: horas,
            datasets: [{
                data: serie,
                borderColor: COR_OK,
                backgroundColor: COR_OK,
                borderWidth: 1.5,
                pointRadius: 2,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: escalaY, x: escalaX }
        },
        plugins: [pluginLimites]
    });
}

// Preenche o select de salas
const selectSala = document.getElementById('sala');
selectSala.innerHTML = salas
    .map((s, i) => `<option value="${i}">${s.nome}</option>`)
    .join('');
selectSala.value = 8; // começa na Sala 9, como no protótipo

selectSala.addEventListener('change', () => {
    mostrarSala(salas[selectSala.value]);
});

mostrarSala(salas[8]);

// ====================================================
// GRÁFICO 2: COLUNAS (todas as salas)
// ====================================================
let graficoColunas = null;

function mostrarVisaoGeral() {
    const media = salas.reduce((soma, s) => soma + s.temperatura, 0) / salas.length;

    document.getElementById('valorTempMedia').textContent = media.toFixed(1) + ' °C';
    definirStatus('statusGeral', salas.some(s => foraDoLimite(s.temperatura)));

    if (graficoColunas) graficoColunas.destroy();

    graficoColunas = new Chart(document.getElementById('graficoColunas'), {
        type: 'bar',
        data: {
            labels: salas.map(s => s.nome),
            datasets: [{
                data: salas.map(s => s.temperatura),
                backgroundColor: salas.map(s => corDaTemperatura(s.temperatura)),
                barPercentage: 0.35,
                categoryPercentage: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { y: escalaY, x: escalaX }
        },
        plugins: [pluginLimites, pluginValoresBarras]
    });
}

// ====================================================
// ABAS
// ====================================================
const abas = document.querySelectorAll('.aba');
const vistas = document.querySelectorAll('.vista');

abas.forEach(aba => {
    aba.addEventListener('click', () => {
        abas.forEach(a => a.classList.remove('ativa'));
        vistas.forEach(v => v.classList.remove('ativa'));

        aba.classList.add('ativa');
        document.getElementById(aba.dataset.vista).classList.add('ativa');

        // Desenha o gráfico só depois que a aba ficou visível
        if (aba.dataset.vista === 'vistaGeral') mostrarVisaoGeral();
        else mostrarSala(salas[selectSala.value]);
    });
});