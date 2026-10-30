// BOTÕES PARA TROCAR DE ABA

function mostrarAba(abaSelecionada, botaoSelecionado) {

    // Esconde as três telas
    document.getElementById('vistaTempoReal').classList.remove('ativa');
    document.getElementById('vistaGeral').classList.remove('ativa');
    document.getElementById('vistaHistorico').classList.remove('ativa');

    // Retira o destaque dos três botões
    document.getElementById('botaoTempoReal').classList.remove('ativa');
    document.getElementById('botaoGeral').classList.remove('ativa');
    document.getElementById('botaoHistorico').classList.remove('ativa');

    // Mostra a tela selecionada
    document.getElementById(abaSelecionada).classList.add('ativa');

    // Destaca o botão selecionado
    document.getElementById(botaoSelecionado).classList.add('ativa');

    // Ajusta os gráficos
    myChart.resize();
    myChart2.resize();
    myChart3.resize();

}



// Desenha as linhas tracejadas de máxima (26) e mínima (20) de uma borda à outra
// (usado só no gráfico de colunas)
const linhasLimite = {
    id: 'linhasLimite',
    afterDraw: function (chart) {
        const ctx = chart.ctx;
        const area = chart.chartArea;

        const yMaxima = chart.scales.y.getPixelForValue(26);
        const yMinima = chart.scales.y.getPixelForValue(20);

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
        data: [22.4, 28.4, 24.1, 26, 23.5],
        // verde = dentro da faixa | amarelo = fora da faixa
        backgroundColor: ['green', 'darkred', 'green', 'orange', 'green'],
        barPercentage: 0.2,
        categoryPercentage: 0.8,
        borderColor: 'cyan',
        borderWidth: 3,
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

