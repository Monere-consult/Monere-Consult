var mysql = require("mysql2");
var database = require("../database/config")

// Empresa e filial (biotério) do usuário logado.
// O usuário só tem empresa no banco, então mostramos o PRIMEIRO biotério dessa empresa.
function buscarFilial(idUsuario) {
    console.log("ACESSEI O SALA MODEL \n\n function buscarFilial(): ", idUsuario);

    var instrucaoSql = `
        SELECT e.razao_social AS empresa,
               b.id AS idBioterio,
               b.nome AS filial
        FROM usuario u
        INNER JOIN empresa e ON u.fk_empresa = e.id
        INNER JOIN bioterio b ON b.fk_empresa = e.id
        WHERE u.id = ${mysql.escape(idUsuario)}
        ORDER BY b.id
        LIMIT 1;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Todas as salas da filial, cada uma com:
// - temperatura: a última temperatura medida
// - hora_ultima_leitura: horário da última medida (ex.: 18:16)
// - minutos_sem_leitura: quantos minutos se passaram desde a última medida
// - hora_ultima_na_faixa / minutos_desde_faixa: última vez que a sala esteve entre 20 °C e 26 °C
//   (serve para saber "há quanto tempo a sala está fora da faixa")
function listar(idBioterio) {
    console.log("ACESSEI O SALA MODEL \n\n function listar(): ", idBioterio);

    var instrucaoSql = `
        SELECT sa.id,
               sa.nome,

               (SELECT m.temperatura FROM medidaSensor m
                 WHERE m.fk_sensor = ss.id
                 ORDER BY m.momento DESC, m.id DESC
                 LIMIT 1) AS temperatura,

               (SELECT DATE_FORMAT(MAX(m.momento), '%H:%i') FROM medidaSensor m
                 WHERE m.fk_sensor = ss.id) AS hora_ultima_leitura,

               (SELECT TIMESTAMPDIFF(MINUTE, MAX(m.momento), NOW()) FROM medidaSensor m
                 WHERE m.fk_sensor = ss.id) AS minutos_sem_leitura,

               (SELECT DATE_FORMAT(MAX(m.momento), '%H:%i') FROM medidaSensor m
                 WHERE m.fk_sensor = ss.id
                 AND m.temperatura BETWEEN 20 AND 26) AS hora_ultima_na_faixa,

               (SELECT TIMESTAMPDIFF(MINUTE, MAX(m.momento), NOW()) FROM medidaSensor m
                 WHERE m.fk_sensor = ss.id
                 AND m.temperatura BETWEEN 20 AND 26) AS minutos_desde_faixa

        FROM sala sa
        LEFT JOIN salaSensor ss ON ss.fk_sala = sa.id
        WHERE sa.fk_bioterio = ${mysql.escape(idBioterio)}
        ORDER BY sa.id;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarFilial,
    listar
};
