const API_FERRAMENTAS = "/api/ferramentas";

// ==================================================
// ELEMENTOS DA PÁGINA
// ==================================================

const formulario = document.getElementById("formFerramenta");

const campoBusca = document.getElementById("buscaFerramenta");
const botaoBuscar = document.getElementById("btnBuscar");

const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const campoLocalizacao = document.getElementById("localizacao");

const statusDisponivel = document.getElementById("disponivel");
const statusDesativada = document.getElementById("desativada");
const campoMotivo = document.getElementById("motivoDesativacao");

const campoImagem = document.getElementById("imagemFerramenta");
const areaUpload = document.querySelector(".area-upload");

const botaoCadastrar = document.querySelector(".btn-cadastrar");
const botaoAtualizar = document.getElementById("btnAtualizar");
const botaoExcluir = document.getElementById("btnExcluir");

const conteudoOriginalUpload = areaUpload.innerHTML;

let ferramentaSelecionadaId = null;
let imagemBase64 = null;

formulario.noValidate = true;


// ==================================================
// STATUS DA FERRAMENTA
// ==================================================

function atualizarCampoMotivo(focarCampo = true) {

    if (statusDesativada.checked) {
        campoMotivo.disabled = false;
        campoMotivo.required = true;

        if (focarCampo) {
            campoMotivo.focus();
        }
    } else {
        campoMotivo.disabled = true;
        campoMotivo.required = false;
        campoMotivo.value = "";
    }
}

statusDisponivel.addEventListener("change", function () {
    atualizarCampoMotivo();
});

statusDesativada.addEventListener("change", function () {
    atualizarCampoMotivo();
});


// ==================================================
// VALIDAÇÃO DO FORMULÁRIO
// ==================================================

function validarFormulario() {

    const nome = campoNome.value.trim();
    const descricao = campoDescricao.value.trim();
    const localizacao = campoLocalizacao.value;
    const motivo = campoMotivo.value.trim();

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

    if (nome.length > 100) {
        alert("O nome da ferramenta deve possuir no máximo 100 caracteres.");
        campoNome.focus();
        return false;
    }

    if (descricao.length > 500) {
        alert("A descrição deve possuir no máximo 500 caracteres.");
        campoDescricao.focus();
        return false;
    }

    if (localizacao === "") {
        alert("Selecione a localização da ferramenta.");
        campoLocalizacao.focus();
        return false;
    }

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

    if (motivo.length > 255) {
        alert("O motivo da desativação deve possuir no máximo 255 caracteres.");
        campoMotivo.focus();
        return false;
    }

    return true;
}


// ==================================================
// DADOS ENVIADOS PARA A API
// ==================================================

function obterDadosFormulario() {

    return {
        nome: campoNome.value.trim(),
        descricao: campoDescricao.value.trim(),
        localizacao: campoLocalizacao.value,
        disponivel: statusDisponivel.checked,
        motivoDesativacao: statusDesativada.checked
            ? campoMotivo.value.trim()
            : null,
        imagem: imagemBase64
    };
}


// ==================================================
// CADASTRAR FERRAMENTA NO MYSQL
// ==================================================

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    botaoCadastrar.disabled = true;

    try {
        const resposta = await fetch(API_FERRAMENTAS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obterDadosFormulario())
        });

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const ferramentaSalva = await resposta.json();

        alert(
            "Ferramenta cadastrada com sucesso!\n" +
            "ID: " + ferramentaSalva.id
        );

        formulario.reset();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível cadastrar a ferramenta.");
    } finally {
        botaoCadastrar.disabled = false;
    }
});


// ==================================================
// BUSCAR FERRAMENTA NO MYSQL
// ==================================================

async function buscarFerramenta() {

    const termoPesquisado = campoBusca.value.trim();

    if (termoPesquisado === "") {
        alert("Digite o ID ou o nome da ferramenta.");
        campoBusca.focus();
        return;
    }

    botaoBuscar.disabled = true;

    try {
        let ferramentaEncontrada = null;

        if (/^\d+$/.test(termoPesquisado)) {
            const resposta = await fetch(
                API_FERRAMENTAS + "/" + termoPesquisado
            );

            if (resposta.status === 404) {
                alert("Ferramenta não encontrada.");
                return;
            }

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            ferramentaEncontrada = await resposta.json();
        } else {
            const resposta = await fetch(API_FERRAMENTAS);

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const ferramentas = await resposta.json();
            const termoNormalizado = termoPesquisado.toLowerCase();

            ferramentaEncontrada = ferramentas.find(function (ferramenta) {
                return ferramenta.nome.toLowerCase() === termoNormalizado;
            });

            if (!ferramentaEncontrada) {
                ferramentaEncontrada = ferramentas.find(function (ferramenta) {
                    return ferramenta.nome
                        .toLowerCase()
                        .includes(termoNormalizado);
                });
            }

            if (!ferramentaEncontrada) {
                alert("Ferramenta não encontrada.");
                return;
            }
        }

        preencherFormulario(ferramentaEncontrada);
        alert("Ferramenta encontrada.");
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível realizar a busca.");
    } finally {
        botaoBuscar.disabled = false;
    }
}

botaoBuscar.addEventListener("click", buscarFerramenta);

campoBusca.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        event.preventDefault();
        buscarFerramenta();
    }
});


// ==================================================
// PREENCHER O FORMULÁRIO COM O RESULTADO DA BUSCA
// ==================================================

function preencherFormulario(ferramenta) {

    ferramentaSelecionadaId = ferramenta.id;

    campoNome.value = ferramenta.nome || "";
    campoDescricao.value = ferramenta.descricao || "";
    campoLocalizacao.value = ferramenta.localizacao || "";

    if (ferramenta.disponivel) {
        statusDisponivel.checked = true;
    } else {
        statusDesativada.checked = true;
    }

    campoMotivo.value = ferramenta.motivoDesativacao || "";
    atualizarCampoMotivo(false);

    imagemBase64 = ferramenta.imagem || null;
    campoImagem.value = "";

    if (imagemBase64) {
        exibirPreviewImagem(imagemBase64, "Imagem cadastrada");
    } else {
        restaurarAreaUpload();
    }
}


// ==================================================
// ATUALIZAR FERRAMENTA NO MYSQL
// ==================================================

botaoAtualizar.addEventListener("click", async function () {

    if (ferramentaSelecionadaId === null) {
        alert("Pesquise uma ferramenta antes de realizar a atualização.");
        campoBusca.focus();
        return;
    }

    if (!validarFormulario()) {
        return;
    }

    botaoAtualizar.disabled = true;

    try {
        const resposta = await fetch(
            API_FERRAMENTAS + "/" + ferramentaSelecionadaId,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(obterDadosFormulario())
            }
        );

        if (resposta.status === 404) {
            alert("A ferramenta não foi encontrada no banco de dados.");
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const ferramentaAtualizada = await resposta.json();
        preencherFormulario(ferramentaAtualizada);

        alert("Dados da ferramenta atualizados com sucesso!");
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível atualizar a ferramenta.");
    } finally {
        botaoAtualizar.disabled = false;
    }
});


// ==================================================
// EXCLUIR FERRAMENTA DO MYSQL
// ==================================================

botaoExcluir.addEventListener("click", async function () {

    if (ferramentaSelecionadaId === null) {
        alert("Pesquise uma ferramenta antes de realizar a exclusão.");
        campoBusca.focus();
        return;
    }

    const confirmou = confirm(
        `Deseja realmente excluir a ferramenta ${campoNome.value.trim()}?`
    );

    if (!confirmou) {
        return;
    }

    botaoExcluir.disabled = true;

    try {
        const resposta = await fetch(
            API_FERRAMENTAS + "/" + ferramentaSelecionadaId,
            {
                method: "DELETE"
            }
        );

        if (resposta.status === 404) {
            alert("A ferramenta não foi encontrada no banco de dados.");
            formulario.reset();
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        alert("Ferramenta excluída com sucesso!");
        formulario.reset();
    } catch (erro) {
        console.error(erro);
        alert(
            "Não foi possível excluir a ferramenta. " +
            "Verifique se ela possui empréstimos cadastrados."
        );
    } finally {
        botaoExcluir.disabled = false;
    }
});


// ==================================================
// VALIDAÇÃO E PRÉ-VISUALIZAÇÃO DA IMAGEM
// ==================================================

function processarImagem(arquivo) {

    if (!arquivo) {
        return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png"];
    const tamanhoMaximo = 2 * 1024 * 1024;

    if (!tiposPermitidos.includes(arquivo.type)) {
        alert("Formato inválido. Selecione uma imagem JPG ou PNG.");
        campoImagem.value = "";
        imagemBase64 = null;
        restaurarAreaUpload();
        return;
    }

    if (arquivo.size > tamanhoMaximo) {
        alert("A imagem deve possuir no máximo 2 MB.");
        campoImagem.value = "";
        imagemBase64 = null;
        restaurarAreaUpload();
        return;
    }

    const leitor = new FileReader();

    leitor.addEventListener("load", function () {
        imagemBase64 = leitor.result;
        exibirPreviewImagem(imagemBase64, arquivo.name);
    });

    leitor.readAsDataURL(arquivo);
}

function exibirPreviewImagem(enderecoImagem, nomeArquivo) {

    areaUpload.innerHTML = "";
    areaUpload.classList.add("com-preview");

    areaUpload.style.width = "360px";
    areaUpload.style.height = "400px";
    areaUpload.style.padding = "16px";
    areaUpload.style.overflow = "hidden";

    const imagem = document.createElement("img");

    imagem.src = enderecoImagem;
    imagem.alt = "Pré-visualização da ferramenta";
    imagem.classList.add("preview-imagem");

    imagem.style.display = "block";
    imagem.style.width = "100%";
    imagem.style.height = "300px";
    imagem.style.maxWidth = "100%";
    imagem.style.maxHeight = "300px";
    imagem.style.objectFit = "contain";

    const textoNomeArquivo = document.createElement("span");

    textoNomeArquivo.textContent = nomeArquivo;
    textoNomeArquivo.classList.add("nome-arquivo");

    textoNomeArquivo.style.display = "block";
    textoNomeArquivo.style.width = "100%";
    textoNomeArquivo.style.marginTop = "12px";
    textoNomeArquivo.style.overflow = "hidden";
    textoNomeArquivo.style.textAlign = "center";
    textoNomeArquivo.style.textOverflow = "ellipsis";
    textoNomeArquivo.style.whiteSpace = "nowrap";

    areaUpload.appendChild(imagem);
    areaUpload.appendChild(textoNomeArquivo);
}

campoImagem.addEventListener("change", function () {
    processarImagem(campoImagem.files[0]);
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
    areaUpload.classList.remove("com-preview", "arrastando");

    areaUpload.style.width = "";
    areaUpload.style.height = "";
    areaUpload.style.padding = "";
    areaUpload.style.overflow = "";
}

formulario.addEventListener("reset", function () {

    setTimeout(function () {
        ferramentaSelecionadaId = null;
        imagemBase64 = null;

        restaurarAreaUpload();
        atualizarCampoMotivo(false);
    }, 0);
});

atualizarCampoMotivo(false);


// ==================================================
// ABRIR FERRAMENTA ESCOLHIDA NO INVENTÁRIO
// ==================================================

async function carregarFerramentaParaEdicao() {
    const parametros = new URLSearchParams(window.location.search);
    const idParaEditar = parametros.get("editar");

    if (!idParaEditar || !/^\d+$/.test(idParaEditar)) {
        return;
    }

    campoBusca.value = idParaEditar;
    await buscarFerramenta();
}

carregarFerramentaParaEdicao();