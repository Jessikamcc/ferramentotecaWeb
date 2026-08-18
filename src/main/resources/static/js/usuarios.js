btnLimpar.addEventListener("click", function () {
    limparFormulario(true);

    nome.focus();
});


// ==================================================
// IMPEDIR RECARREGAMENTO DA PÁGINA
// ==================================================

formUsuario.addEventListener("submit", function (event) {
    event.preventDefault();
});

