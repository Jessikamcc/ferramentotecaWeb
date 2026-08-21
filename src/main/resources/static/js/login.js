//==============================
// ELEMENTOS DA PÁGINA
//==============================

const loginForm =
    document.getElementById("loginForm");

const usuario =
    document.getElementById("usuario");

const senha =
    document.getElementById("senha");

const togglePassword =
    document.getElementById("togglePassword");

const botaoEntrar =
    document.getElementById("btnEntrar");


//==============================
// MOSTRAR / OCULTAR SENHA
//==============================

if (togglePassword && senha) {
    const eyeIcon =
        togglePassword.querySelector("i");

    togglePassword.addEventListener(
        "click",
        function (event) {
            event.preventDefault();

            if (senha.type === "password") {
                senha.type = "text";

                if (eyeIcon) {
                    eyeIcon.classList.replace(
                        "bi-eye",
                        "bi-eye-slash"
                    );
                }

            } else {
                senha.type = "password";

                if (eyeIcon) {
                    eyeIcon.classList.replace(
                        "bi-eye-slash",
                        "bi-eye"
                    );
                }
            }
        }
    );
}


//==============================
// OBTER MENSAGEM DE ERRO DA API
//==============================

async function obterMensagemErro(resposta) {
    try {
        const dados = await resposta.json();

        return dados.detail
            || dados.message
            || "Não foi possível realizar o login.";

    } catch {
        return "Não foi possível realizar o login.";
    }
}


//==============================
// LOGIN COM O BANCO DE DADOS
//==============================

if (loginForm && usuario && senha) {
    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const usuarioInformado =
                usuario.value.trim();

            const senhaInformada =
                senha.value;

            if (usuarioInformado === "") {
                alert(
                    "Por favor, informe o usuário."
                );

                usuario.focus();
                return;
            }

            if (senhaInformada.trim() === "") {
                alert(
                    "Por favor, informe a senha."
                );

                senha.focus();
                return;
            }

            if (botaoEntrar) {
                botaoEntrar.disabled = true;
                botaoEntrar.textContent =
                    "Entrando...";
            }

            try {
                const resposta = await fetch(
                    "/api/usuarios/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            nome: usuarioInformado,
                            senha: senhaInformada
                        })
                    }
                );

                if (!resposta.ok) {
                    const mensagem =
                        await obterMensagemErro(
                            resposta
                        );

                    throw new Error(mensagem);
                }

                const usuarioLogado =
                    await resposta.json();

                sessionStorage.setItem(
                    "usuarioLogado",
                    JSON.stringify(usuarioLogado)
                );

                alert(
                    "Login realizado com sucesso!"
                );

                window.location.href = "/menu";

            } catch (erro) {
                alert(erro.message);

                senha.value = "";
                senha.focus();

            } finally {
                if (botaoEntrar) {
                    botaoEntrar.disabled = false;
                    botaoEntrar.textContent =
                        "Entrar";
                }
            }
        }
    );
}



