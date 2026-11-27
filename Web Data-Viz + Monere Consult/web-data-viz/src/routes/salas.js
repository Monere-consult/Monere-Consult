var express = require("express");
var router = express.Router();

var salaController = require("../controllers/salaController");

// Busca a empresa e a filial (biotério) do usuário que fez login
// Exemplo: /salas/filial/1
router.get("/filial/:idUsuario", function (req, res) {
    salaController.buscarFilial(req, res);
});

// Lista as salas da filial com a última temperatura de cada uma
// Exemplo: /salas/listar/1
router.get("/listar/:idBioterio", function (req, res) {
    salaController.listar(req, res);
});

module.exports = router;
