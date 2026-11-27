var express = require("express");
var router = express.Router();

var medidaController = require("../controllers/medidaController");

// Temperaturas de uma sala agrupadas por hora (para o gráfico de linha)
// diasAtras = 0 -> últimas 24 horas | 1 -> ontem | 2 -> há 2 dias ... até 7
// Exemplo: /medidas/porHora/1/0
router.get("/porHora/:idSala/:diasAtras", function (req, res) {
    medidaController.buscarPorHora(req, res);
});

module.exports = router;
