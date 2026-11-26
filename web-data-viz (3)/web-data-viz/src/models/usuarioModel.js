var mysql = require("mysql2");
var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email);
    // mysql.escape coloca as aspas e protege o texto digitado (evita SQL Injection)
    var instrucaoSql = `
        SELECT id, nome, email, tipo_usuario AS tipo
        FROM usuario
        WHERE email = ${mysql.escape(email)} AND senha = ${mysql.escape(senha)};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email);

    // Todo usuário cadastrado pelo site entra como 'funcionario' (tipo_usuario aceita: admin, funcionario, gerente)
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, tipo_usuario)
        VALUES (${mysql.escape(nome)}, ${mysql.escape(email)}, ${mysql.escape(senha)}, 'funcionario');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar
};
