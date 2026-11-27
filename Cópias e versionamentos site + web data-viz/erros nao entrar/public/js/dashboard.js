// ============================================================
// DASHBOARD MONERE CONSULT
//   Visão geral  -> GET /medidas/geral/:idBioterio   (dados reais)
//   Tempo real   -> GET /medidas/tempo-real/:idSala  (dados reais)
//   Histórico    -> dados estáticos (ainda não tem consulta no banco)
// ============================================================

// Faixa ideal de temperatura (°C). A API também devolve esses valores em "limites".
const TEMP_MINIMA = 20;
const TEMP_MAXIMA = 26;

// Dados do usuário gravados no sessionStorage pelo login.html
var bioterios = JSON.parse(sessionStorage.BIOTERIOS || "[]");
var bioterioAtual = null;   // id do biotério (filial) selecionado
var salaAtual = null;       // id da sala selecionada na aba Tempo real


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

        const yMaxima = chart.scales.y.getPixelForValue(TEMP_MAXIMA);
        const yMinima = chart.scales.y.getPixelForValue(TEMP_MINIMA);

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


// ===== GRÁFICO 2: TEMPO REAL (linha) =====
// Começa vazio: labels e dados chegam da API (últimos 30 minutos da sala escolhida)
const data = {
    labels: [],
    datasets: [{
        label: 'Temperatura',
        data: [],
        borderColor: 'orange',
        backgroundColor: 'orange',
        tension: 0.1
    },
    {
        label: 'Máxima',
        data: [],
        borderColor: 'red',
        borderDash: [6, 6],
        pointRadius: 0
    },
    {
        label: 'Mínima',
        data: [],
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


// ===== GRÁFICO 1: VISÃO GERAL (colunas) =====
// Começa vazio: as salas e temperaturas chegam da API
const data2 = {
    labels: [],
    datasets: [{
        type: 'bar',
        label: 'Temperatura',
        data: [],
        // cor de cada barra: verde = normal | vermelho = fora da faixa | amarelo = exatamente no limite
        backgroundColor: [],
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


// ===== GRÁFICO 3: HISTÓRICO (linha) - ESTÁTICO: fixo em Sala 1 / há 1 dia =====
const labels3 = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
                 '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:59'];

const data3 = {
    labels: labels3,
    datasets: [{
        label: 'Temperatura',
        data: [22.1, 22.8, 23.5, 21.7, 18.8, 21.3, 23.0, 23.8, 24.5, 28.4, 24.8, 23.2, 23.0],
        borderColor: 'orange',
        backgroundColor: 'orange',
        tension: 0.1
    },
    {
        label: 'Máxima',
        data: [26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26],
        borderColor: 'red',
        borderDash: [6, 6],
        pointRadius: 0
    },
    {
        label: 'Mínima',
        data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
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


// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

// 22.8 -> "22,8"
function formatarTemperatura(numero) {
    return numero.toFixed(1).replace('.', ',');
}

// Classifica uma temperatura: 'fora' (acima da máxima ou abaixo da mínima),
// 'limite' (exatamente em 20 ou 26) ou 'normal'
function classificarTemperatura(temperatura) {
    if (temperatura > TEMP_MAXIMA || temperatura < TEMP_MINIMA) {
        return 'fora';
    } else if (temperatura == TEMP_MAXIMA || temperatura == TEMP_MINIMA) {
        return 'limite';
    }
    return 'normal';
}

// Liga/desliga o destaque ("selecionada") de uma faixa das métricas laterais
function marcarFaixa(idFaixa, selecionada) {
    var faixa = document.getElementById(idFaixa);
    if (selecionada) {
        faixa.classList.add('selecionada');
    } else {
        faixa.classList.remove('selecionada');
    }
}

// Preenche o resultado ("NORMAL", "ALERTA"...) das métricas laterais
// tipo: 'normal' | 'alerta' | 'limite' | '' (sem dados)
function mostrarResultado(idResultado, idTexto, idDescricao, tipo, texto, descricao) {
    document.getElementById(idResultado).className = 'metrica-resultado ' + tipo;
    document.getElementById(idTexto).innerHTML = texto;
    document.getElementById(idDescricao).innerHTML = descricao;
}

// Texto da "Última atualização" (a consulta devolve minutos)
function textoUltimaAtualizacao(minutosAtras) {
    if (minutosAtras < 1) {
        return 'Há menos de 1 min';
    } else if (minutosAtras < 60) {
        return 'Há ' + minutosAtras + ' min';
    }
    return 'Há ' + Math.floor(minutosAtras / 60) + 'h ' + (minutosAtras % 60) + 'min';
}


// ============================================================
// FILTROS: EMPRESA, FILIAL (biotério) E SALA
// ============================================================

function preencherFiltros() {

    // Empresa do usuário (campo fixo nas 3 abas)
    var camposEmpresa = document.querySelectorAll('.campo-empresa');
    for (var i = 0; i < camposEmpresa.length; i++) {
        camposEmpresa[i].innerHTML = sessionStorage.EMPRESA_USUARIO || '--';
    }

    // Filiais (biotérios) da empresa, nas 3 abas
    var selects = document.querySelectorAll('.select-filial');
    for (var j = 0; j < selects.length; j++) {
        selects[j].innerHTML = '';

        if (bioterios.length == 0) {
            selects[j].innerHTML = '<option value="">Nenhuma filial</option>';
        }

        for (var k = 0; k < bioterios.length; k++) {
            selects[j].innerHTML += `<option value="${bioterios[k].id}">${bioterios[k].nome}</option>`;
        }
    }

    if (bioterios.length > 0) {
        trocarFilial(bioterios[0].id);
    }
}

// Troca de filial: sincroniza os 3 selects e recarrega as salas e a visão geral
function trocarFilial(idBioterio) {
    bioterioAtual = idBioterio;

    var selects = document.querySelectorAll('.select-filial');
    for (var i = 0; i < selects.length; i++) {
        selects[i].value = idBioterio;
    }

    carregarSalas();
    carregarVisaoGeral();
}

// Carrega as salas da filial no select da aba Tempo real
function carregarSalas() {
    fetch(`/bioterios/${bioterioAtual}/salas`, { cache: 'no-store' }).then(function (resposta) {
        if (!resposta.ok) {
            console.error('Erro ao buscar as salas da filial');
            return;
        }

        resposta.json().then(function (salas) {
            var select = document.getElementById('selectSalaTempoReal');
            select.innerHTML = '';
            salaAtual = null;

            for (var i = 0; i < salas.length; i++) {
                // sala em manutenção ou inativa não envia medidas: fica desabilitada
                var desabilitada = salas[i].status != 'ativo' ? 'disabled' : '';

                select.innerHTML += `<option value="${salas[i].id}" ${desabilitada}>${salas[i].nome}</option>`;

                if (salaAtual == null && salas[i].status == 'ativo') {
                    salaAtual = salas[i].id;
                }
            }

            if (salaAtual != null) {
                select.value = salaAtual;
            }

            carregarTempoReal();
        });
    }).catch(function (erro) {
        console.error(`Erro ao buscar as salas: ${erro.message}`);
    });
}


// ============================================================
// VISÃO GERAL (gráfico de colunas + KPIs + métricas laterais)
// ============================================================

function carregarVisaoGeral() {
    if (bioterioAtual == null) {
        return;
    }

    fetch(`/medidas/geral/${bioterioAtual}`, { cache: 'no-store' }).then(function (resposta) {
        if (!resposta.ok) {
            console.error('Erro ao buscar a visão geral');
            return;
        }

        resposta.json().then(atualizarVisaoGeral);
    }).catch(function (erro) {
        console.error(`Erro ao buscar a visão geral: ${erro.message}`);
    });
}

function atualizarVisaoGeral(dados) {

    // ----- gráfico de colunas: temperatura mais recente de cada sala -----
    var nomes = [];
    var temperaturas = [];
    var cores = [];
    var existeFora = false;
    var existeLimite = false;

    for (var i = 0; i < dados.salas.length; i++) {
        var temperatura = dados.salas[i].temperatura;
        var situacao = classificarTemperatura(temperatura);

        nomes.push(dados.salas[i].sala);
        temperaturas.push(temperatura);

        if (situacao == 'fora') {
            cores.push('red');
            existeFora = true;
        } else if (situacao == 'limite') {
            cores.push('yellow');
            existeLimite = true;
        } else {
            cores.push('green');
        }
    }

    myChart2.data.labels = nomes;
    myChart2.data.datasets[0].data = temperaturas;
    myChart2.data.datasets[0].backgroundColor = cores;
    myChart2.update();

    // ----- cards -----
    var emAtencao = dados.foraDaFaixa > 0;

    var cardStatus = document.getElementById('geralStatus');
    cardStatus.innerHTML = emAtencao ? 'Atenção' : 'Normal';
    cardStatus.className = 'valor ' + (emAtencao ? 'status-atencao' : 'status-normal');

    document.getElementById('geralForaDaFaixa').innerHTML = dados.foraDaFaixa + '/' + dados.totalSalas;
    document.getElementById('geralSensoresOnline').innerHTML = dados.sensoresOnline + '/' + dados.totalSalas;

    // Pico de excursão: maior temperatura das últimas 24h
    if (dados.pico == null) {
        document.getElementById('geralPicoTitulo').innerHTML = 'Pico de excursão (24h)';
        document.getElementById('geralPico').innerHTML = '--';
        document.getElementById('geralPico').className = 'valor';
        document.getElementById('geralPicoDetalhe').innerHTML = 'Sem medidas nas últimas 24h';
    } else {
        document.getElementById('geralPicoTitulo').innerHTML = 'Pico de excursão na ' + dados.pico.sala.toLowerCase();
        document.getElementById('geralPico').innerHTML = formatarTemperatura(dados.pico.valor) + ' °C';

        if (dados.pico.acimaDoLimite > 0) {
            document.getElementById('geralPico').className = 'valor status-critico';
            document.getElementById('geralPicoDetalhe').innerHTML =
                '<span>+' + formatarTemperatura(dados.pico.acimaDoLimite) + ' °C</span> acima do limite';
        } else {
            document.getElementById('geralPico').className = 'valor';
            document.getElementById('geralPicoDetalhe').innerHTML = 'Dentro do limite';
        }
    }

    // ----- métrica lateral: Status das salas -----
    marcarFaixa('faixaSalasNormal', !emAtencao);
    marcarFaixa('faixaSalasAlerta', emAtencao);

    if (emAtencao) {
        mostrarResultado('resultadoSalas', 'textoResultadoSalas', 'descricaoSalas',
            'alerta', 'ALERTA', '1 ou mais salas fora da faixa ideal');
    } else {
        mostrarResultado('resultadoSalas', 'textoResultadoSalas', 'descricaoSalas',
            'normal', 'NORMAL', 'Todas as salas dentro da faixa ideal');
    }

    // ----- métrica lateral: Condição do gráfico -----
    marcarFaixa('faixaGraficoNormal', !existeFora && !existeLimite);
    marcarFaixa('faixaGraficoLimite', !existeFora && existeLimite);
    marcarFaixa('faixaGraficoFora', existeFora);

    if (existeFora) {
        mostrarResultado('resultadoGrafico', 'textoResultadoGrafico', 'descricaoGrafico',
            'alerta', 'FORA DA FAIXA', 'Existem temperaturas acima ou abaixo dos limites permitidos');
    } else if (existeLimite) {
        mostrarResultado('resultadoGrafico', 'textoResultadoGrafico', 'descricaoGrafico',
            'limite', 'NO LIMITE', 'Existem temperaturas exatamente no limite permitido');
    } else if (dados.salas.length == 0) {
        mostrarResultado('resultadoGrafico', 'textoResultadoGrafico', 'descricaoGrafico',
            '', '--', 'Nenhuma medida recebida ainda');
    } else {
        mostrarResultado('resultadoGrafico', 'textoResultadoGrafico', 'descricaoGrafico',
            'normal', 'NORMAL', 'Todas as temperaturas dentro dos limites permitidos');
    }
}


// ============================================================
// TEMPO REAL (cards + gráfico de linha + métrica lateral)
// ============================================================

// TROCA DE SALA - TEMPO REAL
function trocarSalaTempoReal(idSala) {
    salaAtual = idSala;
    carregarTempoReal();
}

function carregarTempoReal() {
    if (salaAtual == null) {
        limparTempoReal();
        return;
    }

    var salaDaRequisicao = salaAtual;

    fetch(`/medidas/tempo-real/${salaDaRequisicao}`, { cache: 'no-store' }).then(function (resposta) {
        if (!resposta.ok) {
            console.error('Erro ao buscar o tempo real');
            return;
        }

        resposta.json().then(function (dados) {
            // se o usuário trocou de sala enquanto a resposta vinha, ignora essa resposta
            if (salaDaRequisicao == salaAtual) {
                atualizarTempoReal(dados);
            }
        });
    }).catch(function (erro) {
        console.error(`Erro ao buscar o tempo real: ${erro.message}`);
    });
}

// Sem sala ativa na filial
function limparTempoReal() {
    atualizarTempoReal({ atual: null, grafico: [] });
}

function atualizarTempoReal(dados) {

    // ----- gráfico dos últimos 30 minutos (as linhas de máxima e mínima acompanham o tamanho) -----
    var horas = [];
    var temperaturas = [];
    var maximas = [];
    var minimas = [];

    for (var i = 0; i < dados.grafico.length; i++) {
        horas.push(dados.grafico[i].hora);
        temperaturas.push(dados.grafico[i].temperatura);
        maximas.push(TEMP_MAXIMA);
        minimas.push(TEMP_MINIMA);
    }

    myChart.data.labels = horas;
    myChart.data.datasets[0].data = temperaturas;
    myChart.data.datasets[1].data = maximas;
    myChart.data.datasets[2].data = minimas;
    myChart.update();

    // ----- sem medida: limpa os cards -----
    if (dados.atual == null) {
        document.getElementById('trTemperatura').innerHTML = '--';
        document.getElementById('trStatus').innerHTML = '--';
        document.getElementById('trStatus').className = 'valor';
        document.getElementById('trUltimaAtualizacao').innerHTML = 'Sem dados';

        marcarFaixa('faixaTrNormal', false);
        marcarFaixa('faixaTrAlerta', false);
        mostrarResultado('resultadoTr', 'textoResultadoTr', 'descricaoTr',
            '', '--', 'Nenhuma medida recebida desta sala');
        return;
    }

    // ----- cards -----
    var temperatura = dados.atual.temperatura;
    var foraDaFaixa = classificarTemperatura(temperatura) == 'fora';

    document.getElementById('trTemperatura').innerHTML = formatarTemperatura(temperatura) + ' °C';
    document.getElementById('trUltimaAtualizacao').innerHTML = textoUltimaAtualizacao(dados.atual.minutosAtras);

    // KPI Status: se temperatura_atual > 26 ou < 20 -> "Alerta", senão -> "Normal"
    var cardStatus = document.getElementById('trStatus');
    cardStatus.innerHTML = foraDaFaixa ? 'Alerta' : 'Normal';
    cardStatus.className = 'valor ' + (foraDaFaixa ? 'status-atencao' : 'status-normal');

    // ----- métrica lateral -----
    marcarFaixa('faixaTrNormal', !foraDaFaixa);
    marcarFaixa('faixaTrAlerta', foraDaFaixa);

    if (temperatura > TEMP_MAXIMA) {
        mostrarResultado('resultadoTr', 'textoResultadoTr', 'descricaoTr',
            'alerta', 'ALERTA', 'Temperatura acima do limite máximo permitido');
    } else if (temperatura < TEMP_MINIMA) {
        mostrarResultado('resultadoTr', 'textoResultadoTr', 'descricaoTr',
            'alerta', 'ALERTA', 'Temperatura abaixo do limite mínimo permitido');
    } else {
        mostrarResultado('resultadoTr', 'textoResultadoTr', 'descricaoTr',
            'normal', 'NORMAL', 'Temperatura dentro dos limites permitidos');
    }
}


// ============================================================
// INICIALIZAÇÃO E ATUALIZAÇÃO AUTOMÁTICA
// ============================================================

preencherFiltros();

// Atualiza sozinho: Tempo real a cada 5 s e Visão geral a cada 10 s
setInterval(carregarTempoReal, 5000);
setInterval(carregarVisaoGeral, 10000);
