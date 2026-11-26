// sessão
// Os dados do usuário são gravados no sessionStorage pelo login.html
function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

    if (email != null && nome != null) {
        if (b_usuario) {
            b_usuario.innerHTML = nome;
        }
    } else {
        // as páginas protegidas ficam em /dashboard/, por isso o "../"
        window.location = "../login.html";
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}
