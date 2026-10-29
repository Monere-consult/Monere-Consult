// Desenha as linhas tracejadas de máxima (26) e mínima (20) de uma borda à outra
// (usado só no gráfico de colunas)
const linhasLimite = {
    id: 'linhasLimite',
    afterDatasetsDraw: function (chart) {
        const ctx = chart.ctx;
        const area = chart.chartArea;

        const yMaxima = chart.scales.y.getPixelForValue(26);
        const yMinima = chart.scales.y.getPixelForValue(20);

<<<<<<< HEAD
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
=======
>>>>>>> edcef00d9c29d68075af23bf7592c9691cf6b736
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;

        // linha vermelha (máxima)
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(area.left, yMaxima);
        ctx.lineTo(area.right, yMaxima);
        ctx.stroke();

        // linha azul (mínima)
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(area.left, yMinima);
        ctx.lineTo(area.right, yMinima);
        ctx.stroke();

        ctx.restore();
    }
};

// Opções dos gráficos de linha (Tempo real e Histórico)
const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: { min: 16, max: 30 }
    }
};

// Opções do gráfico de colunas (Visão geral): offset true evita cortar as barras das pontas
const opcoesColunas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        x: { offset: true },
        y: { min: 16, max: 30 }
    }
};

// ===== GRÁFICO 1: TEMPO REAL (linha) =====
const labels = ['17:46', '17:48', '17:50', '17:52', '17:54', '17:56', '17:58', '18:00',
                '18:02', '18:04', '18:06', '18:08', '18:10', '18:12', '18:14', '18:16'];

const data = {
    labels: labels,
    datasets: [{
        label: 'Temperatura',
        data: [22.1, 22.6, 22.0, 21.1, 21.6, 22.6, 23.3, 23.9, 23.4, 23.3, 24.0, 24.9, 25.5, 24.8, 24.0, 22.8],
        borderColor: 'orange',
        backgroundColor: 'orange',
        tension: 0.1
    },
    {
        label: 'Máxima',
        data: [26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26],
        borderColor: 'red',
        borderDash: [6, 6],
        pointRadius: 0
    },
    {
        label: 'Mínima',
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        borderColor: 'blue',
        borderDash: [6, 6],
        pointRadius: 0
    }]
};

const config = {
    type: 'line',
    data: data,
    options: opcoes
};

const myChart = new Chart(document.getElementById('graficoTempoReal'), config);


// ===== GRÁFICO 2: VISÃO GERAL (colunas) =====
const labels2 = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5'];

const data2 = {
    labels: labels2,
    datasets: [{
        type: 'bar',
        label: 'Temperatura',
        data: [22.4, 28.4, 24.1, 21.7, 23.5],
        // verde = dentro da faixa | amarelo = fora da faixa
        backgroundColor: ['green', 'yellow', 'green', 'green', 'green'],
        barPercentage: 0.5,
        categoryPercentage: 0.8
    }]
};

const config2 = {
    type: 'bar',
    data: data2,
    options: opcoesColunas,
    plugins: [linhasLimite]
};

const myChart2 = new Chart(document.getElementById('graficoGeral'), config2);


// ===== GRÁFICO 3: HISTÓRICO (linha) =====
const labels3 = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
                 '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

const data3 = {
    labels: labels3,
    datasets: [{
        label: 'Temperatura',
        data: [22.1, 23.1, 25.4, 27.0, 25.3, 24.0, 21.6, 22.8, 24.0, 22.2, 18.8, 20.3],
        borderColor: 'orange',
        backgroundColor: 'orange',
        tension: 0.1
    },
    {
        label: 'Máxima',
        data: [26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26],
        borderColor: 'red',
        borderDash: [6, 6],
        pointRadius: 0
    },
    {
        label: 'Mínima',
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        borderColor: 'blue',
        borderDash: [6, 6],
        pointRadius: 0
    }]
};

const config3 = {
    type: 'line',
    data: data3,
    options: opcoes
};

const myChart3 = new Chart(document.getElementById('graficoHistorico'), config3);


// ===== ABAS =====
function mostrarAba(idVista, idBotao) {
    // esconde as 3 telas
    document.getElementById('vistaTempoReal').className = 'vista';
    document.getElementById('vistaGeral').className = 'vista';
    document.getElementById('vistaHistorico').className = 'vista';

    // apaga o destaque dos 3 botões
    document.getElementById('botaoTempoReal').className = 'aba';
    document.getElementById('botaoGeral').className = 'aba';
    document.getElementById('botaoHistorico').className = 'aba';

    // mostra só a tela e o botão que foram clicados
    document.getElementById(idVista).className = 'vista ativa';
    document.getElementById(idBotao).className = 'aba ativa';

    // ajusta o tamanho dos gráficos, porque estavam escondidos
    myChart.resize();
    myChart2.resize();
    myChart3.resize();
}