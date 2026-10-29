// ====================================================
// CONSTANTES
// ====================================================
const LIMITE_MIN = 20;
const LIMITE_MAX = 26;

const COR_LINHA = '#e8620c';   // laranja da linha de temperatura
const COR_OK = '#0b5a0b';      // verde escuro: dentro da faixa
const COR_NO_LIMITE = '#6df50a'; // verde-limão: exatamente no limite
const COR_FORA = '#b30000';    // vermelho: fora da faixa

// ====================================================
// DADOS MOCADOS (depois trocar por fetch na API)
// ====================================================
const ULTIMA_LEITURA = 'há 34s';
const SENSORES = { online: 25, total: 25 };

const salas = [
    { nome: 'Sala 1',  temperatura: 22.4, bateria: 91 },
    { nome: 'Sala 2',  temperatura: 17.4, bateria: 76 },
    { nome: 'Sala 3',  temperatura: 21.8, bateria: 64 },    
    { nome: 'Sala 4',  temperatura: 26.0, bateria: 88 },
    { nome: 'Sala 5',  temperatura: 19.5, bateria: 45 },
    { nome: 'Sala 6',  temperatura: 25.2, bateria: 70 },
    { nome: 'Sala 7',  temperatura: 27.1, bateria: 95 },
    { nome: 'Sala 8',  temperatura: 22.9, bateria: 58 },
    { nome: 'Sala 9',  temperatura: 22.8, bateria: 82 },
    { nome: 'Sala 10', temperatura: 28.4, bateria: 33 },
    { nome: 'Sala 11', temperatura: 23.1, bateria: 79 }
];

const SALA_REFERENCIA = 8; // índice da Sala 9, que tem a série de exemplo do protótipo

// --- Tempo real: série da Sala 9 (termina em 22.8) ---
const horasTempoReal = ['17:46','17:48','17:50','17:52','17:54','17:56','17:58','18:00',
                        '18:02','18:04','18:06','18:08','18:10','18:12','18:14','18:16'];
const serieTempoRealBase = [22.1,22.6,22.0,21.1,21.6,22.6,23.3,23.9,
                            23.4,23.3,24.0,24.9,25.5,24.8,24.0,22.8];

// --- Histórico: uma série por dia (de 2 em 2 horas) ---
const horasHistorico = ['00:00','02:00','04:00','06:00','08:00','10:00',
                        '12:00','14:00','16:00','18:00','20:00','22:00'];

const historico = {
    'Hoje': {
        serie: [21.5,22.0,22.8,23.6,24.4,25.0,24.2,23.5,23.0,22.4,22.0,21.8],
        tempoForaMin: 0
    },
    'há 1 dia': {
        serie: [22.1,23.1,25.4,27.0,25.3,24.0,21.6,22.8,24.0,22.2,18.8,20.3],
        tempoForaMin: 140   // 2h 20min (mock: na API isso vem calculado)
    },
    'há 2 dias': {
        serie: [23.0,24.2,25.8,26.6,25.9,24.8,23.2,22.0,21.4,20.6,19.6,20.9],
        tempoForaMin: 95
    }
};

// Desloca uma série para a sala escolhida ficar coerente com a temperatura dela
function ajustarParaSala(serie, sala) {
    const ajuste = sala.temperatura - salas[SALA_REFERENCIA].temperatura;
    return serie.map(v => +(v + ajuste).toFixed(1));
}

function serieTempoRealDaSala(sala) {
    const ajuste = sala.temperatura - serieTempoRealBase[serieTempoRealBase.length - 1];
    return serieTempoRealBase.map(v => +(v + ajuste).toFixed(1));
}

// ====================================================
// FUNÇÕES UTILITÁRIAS
// ====================================================
const foraDaFaixa = t => t > LIMITE_MAX || t < LIMITE_MIN;
const noLimite = t => t === LIMITE_MAX || t === LIMITE_MIN;

// Cor de cada barra do gráfico de colunas
function corDaBarra(t) {
    if (foraDaFaixa(t)) return COR_FORA;
    if (noLimite(t)) return COR_NO_LIMITE;
    return COR_OK;
}

// Status a partir de uma lista de temperaturas
function calcularStatus(temperaturas) {
    if (temperaturas.some(foraDaFaixa)) return { texto: 'Crítico', classe: 'status-critico' };
    if (temperaturas.some(noLimite))    return { texto: 'Atenção', classe: 'status-atencao' };
    return { texto: 'Normal', classe: 'status-normal' };
}

function definirStatus(idElemento, temperaturas) {
    const status = calcularStatus(temperaturas);
    const el = document.getElementById(idElemento);
    el.textContent = status.texto;
    el.className = 'valor ' + status.classe;
}

function classeBateria(percentual) {
    if (percentual >= 50) return 'status-normal';
    if (percentual >= 20) return 'status-atencao';
    return 'status-critico';
}

// Conta quantos "trechos" seguidos ficaram fora da faixa
function contarExcursoes(serie) {
    let total = 0;
    let emExcursao = false;
    serie.forEach(t => {
        if (foraDaFaixa(t)) {
            if (!emExcursao) total++;
            emExcursao = true;
        } else {
            emExcursao = false;
        }
    });
    return total;
}

// 140 -> "2h 20min" | 45 -> "45min" | 0 -> "0min"
function formatarMinutos(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}min`;
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

// ====================================================
// PLUGINS DO CHART.JS
// ====================================================

// Linhas tracejadas de limite: vermelha em 26 e azul em 20
const pluginLimites = {
    id: 'limites',
    afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.2;
        [[LIMITE_MAX, 'rgba(215,25,32,0.6)'], [LIMITE_MIN, 'rgba(31,79,224,0.75)']].forEach(([valor, cor]) => {
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

// Valor escrito em cima de cada barra
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

const grade = { color: 'rgba(255,255,255,0.06)' };

// Barras: eixo fixo de 16 a 30
const escalaYBarras = { min: 16, max: 30, ticks: { stepSize: 2 }, grid: grade };

// Linhas: começa em 16 a 30, mas cresce sozinho se algum valor passar disso
const escalaYLinha = { suggestedMin: 16, suggestedMax: 30, ticks: { stepSize: 2 }, grid: grade };

const escalaX = { grid: grade };

// ====================================================
// FUNÇÃO QUE CRIA UM GRÁFICO DE LINHA (usada em 2 telas)
// ====================================================
function criarGraficoLinha(idCanvas, labels, serie) {
    return new Chart(document.getElementById(idCanvas), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: serie,
                borderColor: COR_LINHA,
                backgroundColor: COR_LINHA,
                borderWidth: 1.5,
                pointRadius: 2,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: escalaYLinha, x: escalaX }
        },
        plugins: [pluginLimites]
    });
}

// ====================================================
// SELECTS (preenchidos pelo JS)
// ====================================================
const selectSalaTempoReal = document.getElementById('salaTempoReal');
const selectSalaHistorico = document.getElementById('salaHistorico');
const selectDia = document.getElementById('diaHistorico');

const opcoesSalas = salas.map((s, i) => `<option value="${i}">${i + 1}</option>`).join('');
selectSalaTempoReal.innerHTML = opcoesSalas;
selectSalaHistorico.innerHTML = opcoesSalas;
selectSalaTempoReal.value = SALA_REFERENCIA;  // Sala 9, como no protótipo
selectSalaHistorico.value = SALA_REFERENCIA;

selectDia.innerHTML = Object.keys(historico)
    .map(dia => `<option value="${dia}">${dia}</option>`)
    .join('');
selectDia.value = 'há 1 dia';

// ====================================================
// TELA 1: TEMPO REAL
// ====================================================
let graficoTempoReal = null;

function mostrarTempoReal() {
    const sala = salas[selectSalaTempoReal.value];
    const serie = serieTempoRealDaSala(sala);
    const atual = serie[serie.length - 1];

    document.getElementById('valorTempAtual').textContent = atual.toFixed(1) + ' °C';
    definirStatus('statusTempoReal', [atual]);
    document.getElementById('ultimaLeituraTempoReal').textContent = ULTIMA_LEITURA;

    const bateria = document.getElementById('valorBateria');
    bateria.textContent = sala.bateria + '%';
    bateria.className = 'valor ' + classeBateria(sala.bateria);

    if (graficoTempoReal) graficoTempoReal.destroy();
    graficoTempoReal = criarGraficoLinha('graficoTempoReal', horasTempoReal, serie);
}

selectSalaTempoReal.addEventListener('change', mostrarTempoReal);

// ====================================================
// TELA 2: VISÃO GERAL (colunas)
// ====================================================
let graficoColunas = null;

function mostrarVisaoGeral() {
    const temperaturas = salas.map(s => s.temperatura);
    const fora = temperaturas.filter(foraDaFaixa).length;

    definirStatus('statusGeral', temperaturas);
    document.getElementById('valorSensores').textContent = `${SENSORES.online}/${SENSORES.total}`;
    document.getElementById('valorForaFaixa').textContent = `${fora}/${salas.length}`;
    document.getElementById('ultimaLeituraGeral').textContent = ULTIMA_LEITURA;

    if (graficoColunas) graficoColunas.destroy();

    graficoColunas = new Chart(document.getElementById('graficoColunas'), {
        type: 'bar',
        data: {
            labels: salas.map(s => s.nome),
            datasets: [{
                data: temperaturas,
                backgroundColor: temperaturas.map(corDaBarra),
                barPercentage: 0.5,
                categoryPercentage: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { y: escalaYBarras, x: escalaX }
        },
        plugins: [pluginLimites, pluginValoresBarras]
    });
}

// ====================================================
// TELA 3: HISTÓRICO
// ====================================================
let graficoHistorico = null;

function mostrarHistorico() {
    const sala = salas[selectSalaHistorico.value];
    const dados = historico[selectDia.value];
    const serie = ajustarParaSala(dados.serie, sala);

    document.getElementById('valorMaxima').textContent = Math.max(...serie).toFixed(1) + ' °C';
    document.getElementById('valorMinima').textContent = Math.min(...serie).toFixed(1) + ' °C';
    document.getElementById('valorTempoFora').textContent = formatarMinutos(dados.tempoForaMin);
    document.getElementById('valorExcursoes').textContent = contarExcursoes(serie);

    if (graficoHistorico) graficoHistorico.destroy();
    graficoHistorico = criarGraficoLinha('graficoHistorico', horasHistorico, serie);
}

selectSalaHistorico.addEventListener('change', mostrarHistorico);
selectDia.addEventListener('change', mostrarHistorico);

// ====================================================
// ABAS
// ====================================================
const desenharVista = {
    vistaTempoReal: mostrarTempoReal,
    vistaGeral: mostrarVisaoGeral,
    vistaHistorico: mostrarHistorico
};

const abas = document.querySelectorAll('.aba');
const vistas = document.querySelectorAll('.vista');

abas.forEach(aba => {
    aba.addEventListener('click', () => {
        abas.forEach(a => a.classList.remove('ativa'));
        vistas.forEach(v => v.classList.remove('ativa'));

        aba.classList.add('ativa');
        document.getElementById(aba.dataset.vista).classList.add('ativa');

        // Desenha o gráfico só depois que a aba ficou visível
        desenharVista[aba.dataset.vista]();
    });
});

// Tela inicial
mostrarTempoReal();