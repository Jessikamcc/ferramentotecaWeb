// ==================================================
// CONFIRMAR SAÍDA DO SISTEMA
// ==================================================

const botaoSair = document.querySelector(".logout a");

if (botaoSair) {
    botaoSair.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmarSaida = confirm(
            "Deseja realmente sair do sistema?"
        );

        if (confirmarSaida) {
            window.location.href = "/login";
        }
    });
}


