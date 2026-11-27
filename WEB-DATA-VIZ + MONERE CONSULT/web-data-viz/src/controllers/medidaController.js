var medidaModel = require("../models/medidaModel");

function buscarPorHora(req, res) {
    // Recupera os valores que vieram na URL (/medidas/porHora/:idSala/:diasAtras)
    var idSala = req.params.idSala;
    var diasAtras = Number(req.params.diasAtras);

    if (idSala == undefined) {
        res.status(400).send("O id da sala está undefined!");
    } else if (isNaN(diasAtras) || diasAtras < 0 || diasAtras > 7) {
        res.status(400).send("diasAtras precisa ser um número de 0 a 7!");
    } else {

        medidaModel.buscarPorHora(idSala, diasAtras)
            .then(
                function (resultado) {
                    // devolve uma lista (vazia se não houver medidas no período)
                    res.status(200).json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao buscar as medidas! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

module.exports = {
    buscarPorHora
}
