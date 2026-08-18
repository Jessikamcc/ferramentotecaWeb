alert("JavaScript carregado");

//==============================
// ELEMENTOS DA PÁGINA
//==============================

const loginForm = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const togglePassword = document.getElementById("togglePassword");


//==============================
// MOSTRAR / OCULTAR SENHA
//==============================

if (togglePassword && senha) {
    const eyeIcon = togglePassword.querySelector("i");

    togglePassword.addEventListener("click", function (event) {
        event.preventDefault();

        if (senha.type === "password") {
            senha.type = "text";

            if (eyeIcon) {
                eyeIcon.classList.remove("bi-eye");
                eyeIcon.classList.add("bi-eye-slash");
            }
        } else {
            senha.type = "password";

            if (eyeIcon) {
                eyeIcon.classList.remove("bi-eye-slash");
                eyeIcon.classList.add("bi-eye");
            }
        }
    });
}


//==============================
// VALIDAÇÃO DO LOGIN
//==============================

if (loginForm && usuario && senha) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const usuarioInformado = usuario.value.trim();
        const senhaInformada = senha.value.trim();

        if (usuarioInformado === "") {
            alert("Por favor, informe o usuário.");

            usuario.focus();

            return;
        }

        if (senhaInformada === "") {
            alert("Por favor, informe a senha.");

            senha.focus();

            return;
        }

        // USUÁRIO FICTÍCIO PARA TESTAR O FRONT-END

        if (
            usuarioInformado === "admin" &&
            senhaInformada === "123456"
        ) {
            alert("Login realizado com sucesso!");

            window.location.href = "/menu";
        } else {
            alert("Usuário ou senha incorretos.");

            senha.value = "";
            senha.focus();
        }
    });
}



