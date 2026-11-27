var mysql = require("mysql2");
var database = require("../database/config")

// Temperaturas de UMA sala, agrupadas por hora.
// Para cada hora devolve: a média, a máxima e a mínima daquela hora.
// dia_hora sai no formato '2026-11-27 14' (ano-mês-dia hora) e o JavaScript pega só a hora.
function buscarPorHora(idSala, diasAtras) {
    console.log("ACESSEI O MEDIDA MODEL \n\n function buscarPorHora(): ", idSala, diasAtras);

    // Qual período buscar:
    // 0 = últimas 24 horas | 1 = ontem (o dia inteiro) | 2 = anteontem ... até 7
    var filtroPeriodo = "";
    if (diasAtras == 0) {
        filtroPeriodo = "m.momento >= NOW() - INTERVAL 24 HOUR";
    } else {
        filtroPeriodo = "DATE(m.momento) = CURDATE() - INTERVAL " + mysql.escape(diasAtras) + " DAY";
    }

    var instrucaoSql = `
        SELECT DATE_FORMAT(m.momento, '%Y-%m-%d %H') AS dia_hora,
               ROUND(AVG(m.temperatura), 1) AS media,
               MAX(m.temperatura) AS maxima,
               MIN(m.temperatura) AS minima
        FROM medidaSensor m
        INNER JOIN salaSensor ss ON m.fk_sensor = ss.id
        WHERE ss.fk_sala = ${mysql.escape(idSala)}
        AND ${filtroPeriodo}
        GROUP BY dia_hora
        ORDER BY dia_hora;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarPorHora
};
