// =====================================================================
// TROCA DE TELA (Visão geral <-> Sala)
// =====================================================================

function mostrarAba(telaSelecionada, botaoSelecionado) {

    // esconde todas as telas e tira o destaque de todos os botões do menu
    document.querySelectorAll('.vista').forEach(function (tela) { tela.classList.remove('ativa'); });
    document.querySelectorAll('.menu .aba').forEach(function (botao) { botao.classList.remove('ativa'); });

    // mostra a tela escolhida e destaca o botão
    document.getElementById(telaSelecionada).classList.add('ativa');
    document.getElementById(botaoSelecionado).classList.add('ativa');

    // ajusta o tamanho do gráfico quando a tela aparece
    graficoSala.resize();

    // volta para o topo da página
    window.scrollTo(0, 0);
}


// =====================================================================
// CONFIGURAÇÕES GERAIS
// =====================================================================

const LIMITE_MINIMO = 20;
const LIMITE_MAXIMO = 26;

// Margem para considerar a sala "perto do limite" (ainda na faixa, mas quase saindo)
const MARGEM_RISCO = 0.5;

// Data de referência dos dados de exemplo.
// Quando ligarem à API, troquem por: const HOJE = new Date();
const HOJE = new Date(2026, 10, 26);   // 26/11/2026 (o mês começa em 0: 10 = novembro)

// Cores iguais às do style.css
const cores = {
    verde: '#16c75a',
    amarelo: '#f2c500',
    vermelho: '#ff4545',
    laranja: '#ff9f1c',
    texto: '#aaaabb',
    grade: 'rgba(255, 255, 255, 0.06)'
};

// Cor padrão dos textos dos gráficos (eixos)
Chart.defaults.color = cores.texto;
Chart.defaults.font.family = "'Montserrat', Arial, sans-serif";


// Desenha a FAIXA IDEAL (20 °C a 26 °C) como uma área verde clara no fundo do gráfico
const faixaIdeal = {
    id: 'faixaIdeal',
    beforeDatasetsDraw: function (chart) {
        const ctx = chart.ctx;
        const area = chart.chartArea;

        const yMaxima = chart.scales.y.getPixelForValue(LIMITE_MAXIMO);
        const yMinima = chart.scales.y.getPixelForValue(LIMITE_MINIMO);

        ctx.save();

        // área sombreada
        ctx.fillStyle = 'rgba(22, 199, 90, 0.08)';
        ctx.fillRect(area.left, yMaxima, area.right - area.left, yMinima - yMaxima);

        // bordas tracejadas
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(22, 199, 90, 0.7)';

        ctx.beginPath();
        ctx.moveTo(area.left, yMaxima);
        ctx.lineTo(area.right, yMaxima);
        ctx.moveTo(area.left, yMinima);
        ctx.lineTo(area.right, yMinima);
        ctx.stroke();

        ctx.restore();
    }
};


// =====================================================================
// DADOS DAS SALAS (exemplo fixo de uma filial com 25 salas)
// Quando ligarem ao banco de dados, é só trocar esta lista pelo resultado da API.
// =====================================================================

// status: 'normal' (na faixa) | 'acima' | 'abaixo' (fora da faixa) | 'offline' (sensor sem comunicação)
// minutos     = há quanto tempo a sala está fora da faixa / sem sinal
// desde       = horário em que isso começou (para 'offline' = horário da última leitura)
// ocorrencias = quantas vezes a sala saiu da faixa nas últimas 24 h
// minutosFora = tempo total fora da faixa nas últimas 24 h
const salas = [
    { numero: 1,  temperatura: 22.8, status: 'normal', ocorrencias: 1, minutosFora: 120 },
    { numero: 2,  temperatura: 28.4, status: 'acima',  minutos: 2,  desde: '18:16', ocorrencias: 2, minutosFora: 4 },
    { numero: 3,  temperatura: 24.1, status: 'normal' },
    { numero: 4,  temperatura: 26.0, status: 'normal' },
    { numero: 5,  temperatura: 23.5, status: 'normal' },
    { numero: 6,  temperatura: 22.4, status: 'normal' },
    { numero: 7,  temperatura: 23.9, status: 'normal', ocorrencias: 2, minutosFora: 40 },
    { numero: 8,  temperatura: 21.7, status: 'normal' },
    { numero: 9,  temperatura: 23.4, status: 'offline', minutos: 96, desde: '16:40' },
    { numero: 10, temperatura: 24.6, status: 'normal' },
    { numero: 11, temperatura: 22.1, status: 'normal' },
    { numero: 12, temperatura: 27.1, status: 'acima',  minutos: 47, desde: '17:29', ocorrencias: 1, minutosFora: 47 },
    { numero: 13, temperatura: 23.3, status: 'normal' },
    { numero: 14, temperatura: 25.2, status: 'normal' },
    { numero: 15, temperatura: 22.9, status: 'normal' },
    { numero: 16, temperatura: 21.4, status: 'normal' },
    { numero: 17, temperatura: 19.2, status: 'abaixo', minutos: 18, desde: '17:58', ocorrencias: 1, minutosFora: 18 },
    { numero: 18, temperatura: 23.0, status: 'normal' },
    { numero: 19, temperatura: 24.4, status: 'normal' },
    { numero: 20, temperatura: 22.6, status: 'normal' },
    { numero: 21, temperatura: 22.9, status: 'offline', minutos: 21, desde: '17:55' },
    { numero: 22, temperatura: 23.7, status: 'normal' },
    { numero: 23, temperatura: 21.9, status: 'normal' },
    { numero: 24, temperatura: 24.8, status: 'normal' },
    { numero: 25, temperatura: 20.4, status: 'normal' }
];

// O que aconteceu nas ÚLTIMAS 24 HORAS, hora a hora (só as horas diferentes de "normal").
// posição 0 = 19h de ontem ... posição 23 = 18h de hoje
// Ex.: a Sala 1 ficou abaixo da faixa das 03h às 05h (posições 8 e 9)
const eventosUltimas24h = {
    1:  { 8: 'abaixo', 9: 'abaixo' },
    2:  { 23: 'acima' },
    7:  { 18: 'acima', 20: 'acima' },
    9:  { 21: 'offline', 22: 'offline', 23: 'offline' },
    12: { 22: 'acima', 23: 'acima' },
    17: { 22: 'abaixo', 23: 'abaixo' },
    21: { 23: 'offline' }
};


// =====================================================================
// FUNÇÕES DE APOIO
// =====================================================================

// 22.8 -> "22,8 °C"
function formatarTemp(valor) {
    return valor.toFixed(1).replace('.', ',') + ' °C';
}

// 2.4 -> "2,4"
function formatarNumero(valor) {
    return valor.toFixed(1).replace('.', ',');
}

// 96 -> "1h 36min"
function formatarMinutos(minutos) {
    if (minutos < 60) {
        return minutos + ' min';
    }
    return Math.floor(minutos / 60) + 'h ' + (minutos % 60) + 'min';
}

// 5 -> "05h"
function formatarHora(hora) {
    return String(hora).padStart(2, '0') + 'h';
}

// Data de "diasAtras" dias antes de HOJE -> "25/11"
function dataDoDia(diasAtras) {
    const data = new Date(HOJE);
    data.setDate(data.getDate() - diasAtras);
    return String(data.getDate()).padStart(2, '0') + '/' + String(data.getMonth() + 1).padStart(2, '0');
}

function diaDaSemana(diasAtras) {
    const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const data = new Date(HOJE);
    data.setDate(data.getDate() - diasAtras);
    return nomes[data.getDay()];
}

// Ex.: 25,5 °C a 26,0 °C ou 20,0 °C a 20,5 °C
function estaPertoDoLimite(sala) {
    return sala.status == 'normal' &&
        (sala.temperatura >= LIMITE_MAXIMO - MARGEM_RISCO || sala.temperatura <= LIMITE_MINIMO + MARGEM_RISCO);
}

function estaForaDaFaixa(sala) {
    return sala.status == 'acima' || sala.status == 'abaixo';
}

// Texto curto que aparece no card de cada sala
function textoDaSala(sala) {
    if (estaForaDaFaixa(sala)) {
        return 'Fora da faixa · ' + formatarMinutos(sala.minutos);
    }
    if (sala.status == 'offline') {
        return 'Sem sinal · ' + formatarMinutos(sala.minutos);
    }
    if (estaPertoDoLimite(sala)) {
        return 'Perto do limite';
    }
    return 'Na faixa';
}

// Monta um card de KPI
function criarCard(classe, titulo, valor, classeValor, detalhe) {
    return '<div class="card ' + classe + '">' +
               '<div class="titulo">' + titulo + '</div>' +
               '<div class="valor ' + classeValor + '">' + valor + '</div>' +
               '<div class="detalhe">' + detalhe + '</div>' +
           '</div>';
}


// =====================================================================
// TELA INICIAL: KPIs GERAIS DA FILIAL
// Mostram PROBLEMAS (quantas salas estão ruins), não médias.
// =====================================================================

// "2 acima · 1 abaixo da faixa" — só mostra a parte que não for zero
function textoAcimaAbaixo(acima, abaixo) {
    if (acima > 0 && abaixo > 0) {
        return acima + ' acima · ' + abaixo + ' abaixo da faixa';
    }
    if (acima > 0) {
        return 'Acima do limite máximo (26 °C)';
    }
    return 'Abaixo do limite mínimo (20 °C)';
}

function montarKpisGerais() {
    const total = salas.length;

    const acima = salas.filter(function (s) { return s.status == 'acima'; }).length;
    const abaixo = salas.filter(function (s) { return s.status == 'abaixo'; }).length;
    const fora = acima + abaixo;

    const offline = salas.filter(function (s) { return s.status == 'offline'; });
    const salasPerto = salas.filter(estaPertoDoLimite);

    let cards = '';

    // Mesma ordem de cores do quadro de salas: vermelho → amarelo → cinza

    // 1) Salas fora da faixa agora
    if (fora > 0) {
        cards += criarCard('card-alerta', 'Salas fora da faixa agora',
            fora + ' <small>de ' + total + '</small>', 'status-atencao', textoAcimaAbaixo(acima, abaixo));
    } else {
        cards += criarCard('card-normal', 'Salas fora da faixa agora',
            '0 <small>de ' + total + '</small>', 'status-normal', 'Todas dentro de 20 °C a 26 °C');
    }

    // 2) Salas perto do limite (preventivo)
    if (salasPerto.length > 0) {
        cards += criarCard('card-limite', 'Salas perto do limite',
            salasPerto.length + ' <small>de ' + total + '</small>', 'status-limite', 'Até 0,5 °C de sair da faixa');
    } else {
        cards += criarCard('card-normal', 'Salas perto do limite',
            '0 <small>de ' + total + '</small>', 'status-normal', 'Todas com folga dentro da faixa');
    }

    // 3) Sensores sem comunicação (mostra há quanto tempo está o mais antigo sem sinal)
    if (offline.length > 0) {
        const maiorTempo = Math.max.apply(null, offline.map(function (s) { return s.minutos; }));
        cards += criarCard('card-offline', 'Sensores sem comunicação',
            offline.length + ' <small>de ' + total + '</small>', 'status-offline',
            'Sem comunicação há ' + formatarMinutos(maiorTempo));
    } else {
        cards += criarCard('card-normal', 'Sensores sem comunicação',
            '0 <small>de ' + total + '</small>', 'status-normal', 'Todos enviando dados');
    }

    document.getElementById('cardsGerais').innerHTML = cards;
}


// =====================================================================
// TELA INICIAL: QUADRO COM TODAS AS SALAS
// =====================================================================

// Ordem de prioridade: vermelho → amarelo → cinza → verde
function prioridadeDaSala(sala) {
    if (estaForaDaFaixa(sala)) return 0;      // vermelho: fora da faixa
    if (estaPertoDoLimite(sala)) return 1;    // amarelo: perto do limite
    if (sala.status == 'offline') return 2;   // cinza: sensor sem comunicação
    return 3;                                 // verde: na faixa
}

function montarQuadroSalas() {
    let html = '';

    // cópia da lista ordenada (a lista original continua em ordem de número)
    const ordenadas = salas.slice().sort(function (a, b) {
        const diferenca = prioridadeDaSala(a) - prioridadeDaSala(b);
        if (diferenca != 0) {
            return diferenca;
        }
        // mesma cor: quem está com problema há mais tempo vem primeiro; depois, pelo número
        return (b.minutos || 0) - (a.minutos || 0) || a.numero - b.numero;
    });

    for (const sala of ordenadas) {
        html +=
            '<button class="sala ' + sala.status + (estaPertoDoLimite(sala) ? ' risco' : '') + '" onclick="abrirSala(' + sala.numero + ')">' +
                '<span class="sala-nome">Sala ' + sala.numero + '</span>' +
                '<span class="sala-temp">' + formatarTemp(sala.temperatura) + '</span>' +
                '<span class="sala-info">' + textoDaSala(sala) + '</span>' +
            '</button>';
    }

    document.getElementById('quadroSalas').innerHTML = html;
}


// =====================================================================
// LEITURAS HORA A HORA (exemplo)
// Com a API, esta função vira uma consulta: "leituras da sala X no dia Y".
// =====================================================================

// Número "aleatório" que é sempre o mesmo para a mesma semente (os dados não mudam a cada clique)
function ruido(semente) {
    const x = Math.sin(semente) * 10000;
    return x - Math.floor(x);
}

// Devolve { horas: ['19h', ...], valores: [22.1, ...] } com 24 leituras
// diasAtras = 0 -> últimas 24 horas (19h de ontem até 18h de hoje)
// diasAtras = 1..7 -> o dia inteiro (00h até 23h)
function leiturasDoPeriodo(sala, diasAtras) {
    const horas = [];
    const valores = [];

    // temperatura "normal" da sala, sempre com folga dentro da faixa
    const base = Math.min(24.5, Math.max(21.5, sala.temperatura));

    // nos dias anteriores, algumas salas têm uma saída da faixa (sorteada pela semente)
    let inicioEvento = -1;
    let fimEvento = -1;
    let tipoEvento = '';
    if (diasAtras > 0 && ruido(sala.numero * 31 + diasAtras * 7) > 0.72) {
        inicioEvento = 2 + Math.floor(ruido(sala.numero * 13 + diasAtras) * 19);
        fimEvento = inicioEvento + 1 + Math.floor(ruido(sala.numero * 17 + diasAtras) * 3);
        tipoEvento = ruido(sala.numero * 5 + diasAtras * 3) > 0.5 ? 'acima' : 'abaixo';
    }

    for (let i = 0; i < 24; i++) {
        const hora = diasAtras == 0 ? (19 + i) % 24 : i;
        horas.push(formatarHora(hora));

        // curva do dia: mais quente à tarde, mais fria de madrugada
        let valor = base + 0.9 * Math.sin(2 * Math.PI * (hora - 9) / 24) + 0.5 * (ruido(sala.numero * 100 + diasAtras * 24 + i) - 0.5);

        let evento = '';
        if (diasAtras == 0) {
            evento = (eventosUltimas24h[sala.numero] || {})[i] || '';
        } else if (i >= inicioEvento && i < fimEvento) {
            evento = tipoEvento;
        }

        if (evento == 'acima') valor = 26.4 + 0.8 * ruido(sala.numero + i);
        if (evento == 'abaixo') valor = 19.0 + 0.7 * ruido(sala.numero + i);

        // últimas 24 h: a última hora termina exatamente na temperatura atual da sala
        if (diasAtras == 0 && i == 23) valor = sala.temperatura;
        if (diasAtras == 0 && i == 22 && evento == '') valor = (valor + sala.temperatura) / 2;

        // sensor sem comunicação: hora sem leitura (fica um buraco no gráfico)
        if (evento == 'offline') {
            valores.push(null);
        } else {
            valores.push(Number(valor.toFixed(1)));
        }
    }

    return { horas: horas, valores: valores };
}


// =====================================================================
// TELA DA SALA (abre ao clicar no card de uma sala)
// =====================================================================

let salaAtual = 1;
let diaAtual = 0;

const graficoSala = new Chart(document.getElementById('graficoSala'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura',
            data: [],
            borderColor: cores.laranja,
            backgroundColor: cores.laranja,
            borderWidth: 2.5,
            pointRadius: 3,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (item) { return ' ' + formatarTemp(item.parsed.y); }
                }
            }
        },
        scales: {
            x: { grid: { color: cores.grade } },
            y: {
                min: 16,
                max: 30,
                grid: { color: cores.grade },
                ticks: { callback: function (valor) { return valor + ' °C'; } }
            }
        }
    },
    plugins: [faixaIdeal]
});

// Clique no card da sala: abre a tela da sala já nas últimas 24 h
function abrirSala(numero) {
    diaAtual = 0;
    document.getElementById('selectDia').value = 0;
    mostrarAba('vistaSala', 'botaoGeral');
    mostrarSala(numero);
}

// Preenche os KPIs (situação AGORA) e o gráfico da sala
function mostrarSala(numero) {
    salaAtual = numero;
    const sala = salas.find(function (s) { return s.numero == numero; });

    document.getElementById('selectSala').value = numero;
    document.getElementById('tituloSala').textContent = 'Sala ' + numero;

    // linha de atualização (última leitura)
    const atualizacao = document.getElementById('atualizacaoSala');
    if (sala.status == 'offline') {
        atualizacao.classList.add('sem-sinal');
        atualizacao.innerHTML = '<span class="pulso"></span> Sensor sem comunicação · última leitura às ' + sala.desde;
    } else {
        atualizacao.classList.remove('sem-sinal');
        atualizacao.innerHTML = '<span class="pulso"></span> Dados ao vivo · última leitura às 18:16 (há 1 min 33 seg)';
    }

    // ----- KPIs da sala -----
    let cards = '';

    // 1) Temperatura
    if (sala.status == 'offline') {
        cards += criarCard('card-offline', 'Última temperatura recebida', formatarTemp(sala.temperatura), 'status-offline', 'às ' + sala.desde);
    } else if (estaForaDaFaixa(sala)) {
        cards += criarCard('card-alerta', 'Temperatura atual', formatarTemp(sala.temperatura), 'status-atencao', 'Faixa ideal: 20 °C a 26 °C');
    } else {
        cards += criarCard('card-normal', 'Temperatura atual', formatarTemp(sala.temperatura), '', 'Faixa ideal: 20 °C a 26 °C');
    }

    // 2) Situação
    if (sala.status == 'acima') {
        cards += criarCard('card-alerta', 'Situação', 'Fora da faixa', 'status-atencao',
            '<span class="destaque-alerta">+' + formatarNumero(sala.temperatura - LIMITE_MAXIMO) + ' °C</span> acima do limite máximo');
    } else if (sala.status == 'abaixo') {
        cards += criarCard('card-alerta', 'Situação', 'Fora da faixa', 'status-atencao',
            '<span class="destaque-alerta">−' + formatarNumero(LIMITE_MINIMO - sala.temperatura) + ' °C</span> abaixo do limite mínimo');
    } else if (sala.status == 'offline') {
        cards += criarCard('card-offline', 'Situação', 'Sem sinal', 'status-offline', 'Não dá para saber a temperatura atual');
    } else if (estaPertoDoLimite(sala)) {
        cards += criarCard('card-limite', 'Situação', 'Perto do limite', 'status-limite', 'Ainda na faixa, mas a até 0,5 °C de sair');
    } else {
        cards += criarCard('card-normal', 'Situação', 'Na faixa', 'status-normal', 'Temperatura dentro dos limites');
    }

    // 3) Alerta ativo — há quanto tempo a sala está com problema
    if (estaForaDaFaixa(sala)) {
        cards += criarCard('card-alerta', 'Alerta ativo há', formatarMinutos(sala.minutos), 'status-atencao', 'desde ' + sala.desde);
    } else if (sala.status == 'offline') {
        cards += criarCard('card-offline', 'Sem comunicação há', formatarMinutos(sala.minutos), 'status-offline', 'desde ' + sala.desde);
    } else {
        cards += criarCard('card-normal', 'Alerta ativo', 'Nenhum', 'status-normal', 'Sala funcionando normalmente');
    }

    // 4) Ocorrências nas últimas 24 h
    const ocorrencias = sala.ocorrencias || 0;
    if (ocorrencias > 0) {
        cards += criarCard('card-alerta', 'Ocorrências nas últimas 24 h', ocorrencias, '',
            formatarMinutos(sala.minutosFora) + ' fora da faixa no total');
    } else {
        cards += criarCard('card-normal', 'Ocorrências nas últimas 24 h', '0', '', 'Não saiu da faixa');
    }

    document.getElementById('cardsSala').innerHTML = cards;

    atualizarGrafico();
}

// Troca o período do gráfico (0 = últimas 24 h, 1 = ontem ... 7 = há 7 dias)
function trocarDia(diasAtras) {
    diaAtual = diasAtras;
    atualizarGrafico();
}

function atualizarGrafico() {
    const sala = salas.find(function (s) { return s.numero == salaAtual; });
    const periodo = leiturasDoPeriodo(sala, diaAtual);

    // título do gráfico
    let titulo = 'Temperatura · últimas 24 horas';
    if (diaAtual == 1) {
        titulo = 'Temperatura · ontem, ' + diaDaSemana(1) + ' ' + dataDoDia(1);
    } else if (diaAtual > 1) {
        titulo = 'Temperatura · ' + diaDaSemana(diaAtual) + ', ' + dataDoDia(diaAtual);
    }
    document.getElementById('tituloGrafico').textContent = titulo;

    // resumo do período: máxima, mínima e horas fora da faixa
    const comLeitura = periodo.valores.filter(function (v) { return v != null; });
    const maxima = Math.max.apply(null, comLeitura);
    const minima = Math.min.apply(null, comLeitura);
    const horasFora = comLeitura.filter(function (v) { return v > LIMITE_MAXIMO || v < LIMITE_MINIMO; }).length;
    const horasSemDados = periodo.valores.length - comLeitura.length;

    let resumo = 'Máxima ' + formatarTemp(maxima) + ' · Mínima ' + formatarTemp(minima) + ' · ';
    resumo += horasFora == 0 ? 'Sempre dentro da faixa' : horasFora + 'h fora da faixa';
    if (horasSemDados > 0) {
        resumo += ' · ' + horasSemDados + 'h sem dados';
    }
    document.getElementById('resumoGrafico').textContent = resumo;

    // pontos fora da faixa ficam vermelhos
    graficoSala.data.labels = periodo.horas;
    graficoSala.data.datasets[0].data = periodo.valores;
    graficoSala.data.datasets[0].pointBackgroundColor = periodo.valores.map(function (v) {
        return (v > LIMITE_MAXIMO || v < LIMITE_MINIMO) ? cores.vermelho : cores.laranja;
    });
    graficoSala.data.datasets[0].pointBorderColor = graficoSala.data.datasets[0].pointBackgroundColor;
    graficoSala.update();
}


// =====================================================================
// PREENCHE OS SELECTS (salas e períodos)
// =====================================================================

function preencherSelects() {
    let opcoesSalas = '';
    for (const sala of salas) {
        opcoesSalas += '<option value="' + sala.numero + '">Sala ' + sala.numero + '</option>';
    }
    document.getElementById('selectSala').innerHTML = opcoesSalas;

    // Últimas 24 horas, Ontem, Há 2 dias ... Há 7 dias
    let opcoesDias = '<option value="0">Últimas 24 horas</option>';
    for (let d = 1; d <= 7; d++) {
        const nome = d == 1 ? 'Ontem' : 'Há ' + d + ' dias';
        opcoesDias += '<option value="' + d + '">' + nome + ' (' + dataDoDia(d) + ')</option>';
    }
    document.getElementById('selectDia').innerHTML = opcoesDias;
}


// =====================================================================
// INÍCIO
// =====================================================================

preencherSelects();
montarKpisGerais();
montarQuadroSalas();
mostrarSala(1);
