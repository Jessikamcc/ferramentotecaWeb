const API_USUARIOS = "/api/usuarios";

// ==================================================
// ELEMENTOS DA PÁGINA
// ==================================================

const formUsuario = document.getElementById("formUsuario");

const campoBusca = document.getElementById("buscarUsuario");
const btnBuscar = document.getElementById("btnBuscar");
const resultadoBusca = document.getElementById("resultadoBusca");

const usuarioId = document.getElementById("usuarioId");
const nome = document.getElementById("nome");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const tipoUsuario = document.getElementById("tipoUsuario");

const erroNome = document.getElementById("erroNome");
const erroSenha = document.getElementById("erroSenha");
const erroConfirmarSenha = document.getElementById("erroConfirmarSenha");
const erroTipoUsuario = document.getElementById("erroTipoUsuario");

const btnCadastrar = document.getElementById("btnCadastrar");
const btnAtualizar = document.getElementById("btnAtualizar");
const btnLimpar = document.getElementById("btnLimpar");
const btnExcluir = document.getElementById("btnExcluir");

const botoesMostrarSenha = document.querySelectorAll(
    ".btn-mostrar-senha"
);

let usuarioSelecionadoId = null;

formUsuario.noValidate = true;


// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function limparMensagensErro() {
    erroNome.textContent = "";
    erroSenha.textContent = "";
    erroConfirmarSenha.textContent = "";
    erroTipoUsuario.textContent = "";
}

function restaurarCamposSenha() {
    senha.type = "password";
    confirmarSenha.type = "password";

    botoesMostrarSenha.forEach(function (botao) {
        const icone = botao.querySelector("i");

        icone.classList.remove("bi-eye-slash-fill");
        icone.classList.add("bi-eye-fill");

        botao.setAttribute("aria-label", "Mostrar senha");
        botao.setAttribute("title", "Mostrar senha");
    });
}

function limparEstadoFormulario() {
    usuarioSelecionadoId = null;
    usuarioId.value = "";

    btnAtualizar.disabled = true;
    btnExcluir.disabled = true;

    resultadoBusca.textContent = "";

    limparMensagensErro();
    restaurarCamposSenha();
}


// ==================================================
// MOSTRAR E OCULTAR SENHA
// ==================================================

botoesMostrarSenha.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const idCampo = botao.dataset.campo;
        const campo = document.getElementById(idCampo);
        const icone = botao.querySelector("i");

        if (campo.type === "password") {
            campo.type = "text";

            icone.classList.remove("bi-eye-fill");
            icone.classList.add("bi-eye-slash-fill");

            botao.setAttribute("aria-label", "Ocultar senha");
            botao.setAttribute("title", "Ocultar senha");
        } else {
            campo.type = "password";

            icone.classList.remove("bi-eye-slash-fill");
            icone.classList.add("bi-eye-fill");

            botao.setAttribute("aria-label", "Mostrar senha");
            botao.setAttribute("title", "Mostrar senha");
        }
    });
});


// ==================================================
// VALIDAÇÃO DO FORMULÁRIO
// ==================================================

function validarFormulario() {
    limparMensagensErro();

    const nomeTratado = nome.value.trim();
    const senhaDigitada = senha.value;
    const confirmacaoDigitada = confirmarSenha.value;

    let formularioValido = true;
    let primeiroCampoInvalido = null;

    if (nomeTratado === "") {
        erroNome.textContent = "Informe o nome do usuário.";
        formularioValido = false;
        primeiroCampoInvalido = nome;
    } else if (nomeTratado.length < 3) {
        erroNome.textContent =
            "O nome deve possuir pelo menos 3 caracteres.";
        formularioValido = false;
        primeiroCampoInvalido = nome;
    } else if (nomeTratado.length > 100) {
        erroNome.textContent =
            "O nome deve possuir no máximo 100 caracteres.";
        formularioValido = false;
        primeiroCampoInvalido = nome;
    }

    if (senhaDigitada.trim() === "") {
        erroSenha.textContent = "Informe a senha.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = senha;
        }
    } else if (senhaDigitada.length < 6) {
        erroSenha.textContent =
            "A senha deve possuir pelo menos 6 caracteres.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = senha;
        }
    } else if (senhaDigitada.length > 255) {
        erroSenha.textContent =
            "A senha deve possuir no máximo 255 caracteres.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = senha;
        }
    }

    if (confirmacaoDigitada === "") {
        erroConfirmarSenha.textContent = "Confirme a senha.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = confirmarSenha;
        }
    } else if (confirmacaoDigitada !== senhaDigitada) {
        erroConfirmarSenha.textContent = "As senhas não coincidem.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = confirmarSenha;
        }
    }

    if (tipoUsuario.value === "") {
        erroTipoUsuario.textContent = "Selecione o tipo de usuário.";
        formularioValido = false;

        if (!primeiroCampoInvalido) {
            primeiroCampoInvalido = tipoUsuario;
        }
    }

    if (primeiroCampoInvalido) {
        primeiroCampoInvalido.focus();
    }

    return formularioValido;
}

[nome, senha, confirmarSenha, tipoUsuario].forEach(function (campo) {
    campo.addEventListener("input", limparMensagensErro);
    campo.addEventListener("change", limparMensagensErro);
});

function obterDadosFormulario() {
    return {
        nome: nome.value.trim(),
        senha: senha.value,
        tipoUsuario: tipoUsuario.value
    };
}


// ==================================================
// CADASTRAR USUÁRIO NO MYSQL
// ==================================================

formUsuario.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    btnCadastrar.disabled = true;

    try {
        const resposta = await fetch(API_USUARIOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obterDadosFormulario())
        });

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const usuarioSalvo = await resposta.json();

        alert(
            "Usuário cadastrado com sucesso!\n" +
            "ID: " + usuarioSalvo.id
        );

        formUsuario.reset();
        campoBusca.value = "";
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível cadastrar o usuário.");
    } finally {
        btnCadastrar.disabled = false;
    }
});


// ==================================================
// BUSCAR USUÁRIO NO MYSQL
// ==================================================

async function buscarUsuario() {
    const termoPesquisado = campoBusca.value.trim();

    if (termoPesquisado === "") {
        resultadoBusca.textContent = "Digite o nome do usuário.";
        campoBusca.focus();
        return;
    }

    if (termoPesquisado.length < 2) {
        resultadoBusca.textContent =
            "Digite pelo menos 2 caracteres para pesquisar.";
        campoBusca.focus();
        return;
    }

    btnBuscar.disabled = true;
    resultadoBusca.textContent = "Buscando usuário...";

    try {
        const resposta = await fetch(API_USUARIOS);

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const usuarios = await resposta.json();
        const termoNormalizado = normalizarTexto(termoPesquisado);

        let usuarioEncontrado = usuarios.find(function (usuario) {
            return normalizarTexto(usuario.nome) === termoNormalizado;
        });

        if (!usuarioEncontrado) {
            usuarioEncontrado = usuarios.find(function (usuario) {
                return normalizarTexto(usuario.nome)
                    .includes(termoNormalizado);
            });
        }

        if (!usuarioEncontrado) {
            resultadoBusca.textContent = "Usuário não encontrado.";
            limparEstadoFormulario();
            resultadoBusca.textContent = "Usuário não encontrado.";
            return;
        }

        preencherFormulario(usuarioEncontrado);
    } catch (erro) {
        console.error(erro);
        resultadoBusca.textContent =
            "Não foi possível realizar a busca.";
    } finally {
        btnBuscar.disabled = false;
    }
}

function preencherFormulario(usuario) {
    usuarioSelecionadoId = usuario.id;
    usuarioId.value = usuario.id;

    nome.value = usuario.nome || "";
    senha.value = usuario.senha || "";
    confirmarSenha.value = usuario.senha || "";
    tipoUsuario.value = usuario.tipoUsuario || "";

    btnAtualizar.disabled = false;
    btnExcluir.disabled = false;

    limparMensagensErro();

    resultadoBusca.textContent =
        `Usuário encontrado: ${usuario.nome} (ID: ${usuario.id}).`;
}

btnBuscar.addEventListener("click", buscarUsuario);

campoBusca.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscarUsuario();
    }
});


// ==================================================
// ATUALIZAR USUÁRIO NO MYSQL
// ==================================================

btnAtualizar.addEventListener("click", async function () {
    if (usuarioSelecionadoId === null) {
        alert("Pesquise um usuário antes de realizar a atualização.");
        campoBusca.focus();
        return;
    }

    if (!validarFormulario()) {
        return;
    }

    btnAtualizar.disabled = true;

    try {
        const resposta = await fetch(
            API_USUARIOS + "/" + usuarioSelecionadoId,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(obterDadosFormulario())
            }
        );

        if (resposta.status === 404) {
            alert("O usuário não foi encontrado no banco de dados.");
            formUsuario.reset();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const usuarioAtualizado = await resposta.json();
        preencherFormulario(usuarioAtualizado);

        alert("Usuário atualizado com sucesso!");
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível atualizar o usuário.");
    } finally {
        btnAtualizar.disabled = usuarioSelecionadoId === null;
    }
});


// ==================================================
// EXCLUIR USUÁRIO DO MYSQL
// ==================================================

btnExcluir.addEventListener("click", async function () {
    if (usuarioSelecionadoId === null) {
        alert("Pesquise um usuário antes de realizar a exclusão.");
        campoBusca.focus();
        return;
    }

    const confirmou = confirm(
        `Deseja realmente excluir o usuário ${nome.value.trim()}?`
    );

    if (!confirmou) {
        return;
    }

    btnExcluir.disabled = true;

    try {
        const resposta = await fetch(
            API_USUARIOS + "/" + usuarioSelecionadoId,
            {
                method: "DELETE"
            }
        );

        if (resposta.status === 404) {
            alert("O usuário não foi encontrado no banco de dados.");
            formUsuario.reset();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        alert("Usuário excluído com sucesso!");

        formUsuario.reset();
        campoBusca.value = "";
        nome.focus();
    } catch (erro) {
        console.error(erro);
        alert(
            "Não foi possível excluir o usuário. " +
            "Verifique se ele possui empréstimos cadastrados."
        );
    } finally {
        btnExcluir.disabled = usuarioSelecionadoId === null;
    }
});


// ==================================================
// LIMPAR FORMULÁRIO
// ==================================================

formUsuario.addEventListener("reset", function () {
    setTimeout(function () {
        limparEstadoFormulario();
    }, 0);
});

btnLimpar.addEventListener("click", function () {
    campoBusca.value = "";

    setTimeout(function () {
        nome.focus();
    }, 0);
});

limparEstadoFormulario();

