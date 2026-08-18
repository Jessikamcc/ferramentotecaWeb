// ==================================================
// ELEMENTOS DA PÁGINA
// ==================================================

const formulario = document.getElementById("formFerramenta");

const campoBusca = document.getElementById("buscaFerramenta");
const botaoBuscar = document.getElementById("btnBuscar");

const campoNome = document.getElementById("nome");
const campoLocalizacao = document.getElementById("localizacao");

const statusDisponivel = document.getElementById("disponivel");
const statusDesativada = document.getElementById("desativada");
const campoMotivo = document.getElementById("motivoDesativacao");

const campoImagem = document.getElementById("imagemFerramenta");
const areaUpload = document.querySelector(".area-upload");

const botaoAtualizar = document.getElementById("btnAtualizar");
const botaoLimpar = document.querySelector(".btn-limpar");


// Guarda o conteúdo original da área de imagem
const conteudoOriginalUpload = areaUpload.innerHTML;

// Informa se uma pesquisa já foi realizada
let pesquisaRealizada = false;

// Desativa a validação automática do navegador
// para utilizarmos nossas próprias mensagens
formulario.noValidate = true;


// ==================================================
// PESQUISA DA FERRAMENTA
// ==================================================

function buscarFerramenta() {

    const termoPesquisado = campoBusca.value.trim();

    if (termoPesquisado === "") {
        alert("Digite o ID ou o nome da ferramenta.");
        campoBusca.focus();
        return;
    }

    pesquisaRealizada = true;

    alert(
        `Pesquisa realizada por: ${termoPesquisado}\n\n` +
        "A busca está sendo simulada porque ainda não existe conexão com o banco de dados."
    );
}


botaoBuscar.addEventListener("click", buscarFerramenta);


// Permite pesquisar pressionando Enter
campoBusca.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        event.preventDefault();
        buscarFerramenta();
    }

});


// ==================================================
// STATUS DA FERRAMENTA
// ==================================================

function atualizarCampoMotivo() {

    if (statusDesativada.checked) {

        campoMotivo.disabled = false;
        campoMotivo.required = true;
        campoMotivo.focus();

    } else {

        campoMotivo.disabled = true;
        campoMotivo.required = false;
        campoMotivo.value = "";

    }

}


statusDisponivel.addEventListener("change", atualizarCampoMotivo);
statusDesativada.addEventListener("change", atualizarCampoMotivo);


// ==================================================
// VALIDAÇÃO DO FORMULÁRIO
// ==================================================

function validarFormulario() {

    const nome = campoNome.value.trim();
    const localizacao = campoLocalizacao.value;
    const motivo = campoMotivo.value.trim();

    // Validação do nome
    if (nome === "") {
        alert("Informe o nome da ferramenta.");
        campoNome.focus();
        return false;
    }

    if (nome.length < 3) {
        alert("O nome da ferramenta deve ter pelo menos 3 caracteres.");
        campoNome.focus();
        return false;
    }

    // Validação da localização
    if (localizacao === "") {
        alert("Selecione a localização da ferramenta.");
        campoLocalizacao.focus();
        return false;
    }

    // Validação do motivo da desativação
    if (statusDesativada.checked && motivo === "") {
        alert("Informe o motivo da desativação.");
        campoMotivo.focus();
        return false;
    }

    if (statusDesativada.checked && motivo.length < 5) {
        alert("O motivo da desativação deve ter pelo menos 5 caracteres.");
        campoMotivo.focus();
        return false;
    }

    return true;
}


// ==================================================
// CADASTRAR FERRAMENTA
// ==================================================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    alert("Ferramenta cadastrada com sucesso!");

    formulario.reset();

});


// ==================================================
// ATUALIZAR FERRAMENTA
// ==================================================

botaoAtualizar.addEventListener("click", function () {

    if (!pesquisaRealizada) {
        alert("Pesquise uma ferramenta antes de realizar a atualização.");
        campoBusca.focus();
        return;
    }

    if (!validarFormulario()) {
        return;
    }

    alert("Dados da ferramenta atualizados com sucesso!");

});


// ==================================================
// VALIDAÇÃO E PRÉ-VISUALIZAÇÃO DA IMAGEM
// ==================================================

function processarImagem(arquivo) {

    if (!arquivo) {
        return;
    }

    const tiposPermitidos = [
        "image/jpeg",
        "image/png"
    ];

    const tamanhoMaximo = 2 * 1024 * 1024;

    // Verifica o formato
    if (!tiposPermitidos.includes(arquivo.type)) {

        alert("Formato inválido. Selecione uma imagem JPG ou PNG.");

        campoImagem.value = "";
        restaurarAreaUpload();

        return;
    }

    // Verifica o tamanho
    if (arquivo.size > tamanhoMaximo) {

        alert("A imagem deve possuir no máximo 2 MB.");

        campoImagem.value = "";
        restaurarAreaUpload();

        return;
    }

    exibirPreviewImagem(arquivo);

}


function exibirPreviewImagem(arquivo) {

    const leitor = new FileReader();

    leitor.addEventListener("load", function () {

        areaUpload.innerHTML = "";
        areaUpload.classList.add("com-preview");

        // Mantém o quadro no tamanho correto
        areaUpload.style.width = "360px";
        areaUpload.style.height = "400px";
        areaUpload.style.padding = "16px";
        areaUpload.style.overflow = "hidden";

        const imagem = document.createElement("img");

        imagem.src = leitor.result;
        imagem.alt = "Pré-visualização da ferramenta";
        imagem.classList.add("preview-imagem");

        // Obriga a imagem a entrar dentro do quadro
        imagem.style.display = "block";
        imagem.style.width = "100%";
        imagem.style.height = "300px";
        imagem.style.maxWidth = "100%";
        imagem.style.maxHeight = "300px";
        imagem.style.objectFit = "contain";

        const nomeArquivo = document.createElement("span");

        nomeArquivo.textContent = arquivo.name;
        nomeArquivo.classList.add("nome-arquivo");

        nomeArquivo.style.display = "block";
        nomeArquivo.style.width = "100%";
        nomeArquivo.style.marginTop = "12px";
        nomeArquivo.style.overflow = "hidden";
        nomeArquivo.style.textAlign = "center";
        nomeArquivo.style.textOverflow = "ellipsis";
        nomeArquivo.style.whiteSpace = "nowrap";

        areaUpload.appendChild(imagem);
        areaUpload.appendChild(nomeArquivo);

    });

    leitor.readAsDataURL(arquivo);

}


campoImagem.addEventListener("change", function () {

    const arquivoSelecionado = campoImagem.files[0];

    processarImagem(arquivoSelecionado);

});


// ==================================================
// ARRASTAR IMAGEM PARA A ÁREA DE UPLOAD
// ==================================================

areaUpload.addEventListener("dragover", function (event) {

    event.preventDefault();
    areaUpload.classList.add("arrastando");

});


areaUpload.addEventListener("dragleave", function () {

    areaUpload.classList.remove("arrastando");

});


areaUpload.addEventListener("drop", function (event) {

    event.preventDefault();

    areaUpload.classList.remove("arrastando");

    const arquivo = event.dataTransfer.files[0];

    if (!arquivo) {
        return;
    }

    const transferencia = new DataTransfer();

    transferencia.items.add(arquivo);
    campoImagem.files = transferencia.files;

    processarImagem(arquivo);

});


// ==================================================
// LIMPAR FORMULÁRIO
// ==================================================

function restaurarAreaUpload() {

    areaUpload.innerHTML = conteudoOriginalUpload;

    areaUpload.classList.remove(
        "com-preview",
        "arrastando"
    );

}


formulario.addEventListener("reset", function () {

    setTimeout(function () {

        pesquisaRealizada = false;

        restaurarAreaUpload();
        atualizarCampoMotivo();

    }, 0);

    

});


