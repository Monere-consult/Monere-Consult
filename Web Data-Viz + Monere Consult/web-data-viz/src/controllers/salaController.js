var salaModel = require("../models/salaModel");

function buscarFilial(req, res) {
    // Recupera o id do usuário que veio na URL (/salas/filial/:idUsuario)
    var idUsuario = req.params.idUsuario;

    if (idUsuario == undefined) {
        res.status(400).send("O id do usuário está undefined!");
    } else {

        salaModel.buscarFilial(idUsuario)
            .then(
                function (resultado) {
                    // devolve uma lista: vazia se o usuário não tiver empresa/filial
                    res.status(200).json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao buscar a filial! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function listar(req, res) {
    // Recupera o id do biotério (filial) que veio na URL (/salas/listar/:idBioterio)
    var idBioterio = req.params.idBioterio;

    if (idBioterio == undefined) {
        res.status(400).send("O id do biotério está undefined!");
    } else {

        salaModel.listar(idBioterio)
            .then(
                function (resultado) {
                    res.status(200).json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao listar as salas! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

module.exports = {
    buscarFilial,
    listar
}
