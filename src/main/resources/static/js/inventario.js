// ==================================================
// ELEMENTOS DA TELA
// ==================================================

const formularioFiltros = document.getElementById("formFiltros");

const campoNome = document.getElementById("nome");
const campoStatus = document.getElementById("status");
const campoLocalizacao = document.getElementById("localizacao");

const botaoLimpar = document.getElementById("botaoLimpar");

const corpoTabela = document.querySelector(
    ".tabela-inventario tbody"
);

const textoOrientacao = document.getElementById(
    "ajudaFiltros"
);


// ==================================================
// CONFIGURAÇÕES INICIAIS
// ==================================================

const textoOrientacaoOriginal =
    "Preencha um ou mais filtros para buscar. " +
    "Todos os filtros são opcionais.";

campoNome.maxLength = 50;

textoOrientacao.setAttribute("aria-live", "polite");


// ==================================================
// NORMALIZAÇÃO DE TEXTOS
// Remove acentos e transforma o texto em minúsculo
// ==================================================

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


// ==================================================
// RETORNA SOMENTE AS LINHAS DAS FERRAMENTAS
// ==================================================

function obterLinhasFerramentas() {
    return corpoTabela.querySelectorAll(
        "tr:not(.linha-sem-resultados)"
    );
}


// ==================================================
// VALIDAÇÃO DO CAMPO NOME
// ==================================================

function validarNome() {
    const nomePesquisado = campoNome.value.trim();

    campoNome.setCustomValidity("");

    /*
     * O preenchimento é opcional.
     * Porém, se o usuário digitar algo,
     * deverá informar pelo menos 2 caracteres.
     */
    if (
        nomePesquisado.length > 0 &&
        nomePesquisado.length < 2
    ) {
        campoNome.setCustomValidity(
            "Digite pelo menos 2 caracteres para pesquisar pelo nome."
        );

        campoNome.reportValidity();
        campoNome.focus();

        return false;
    }

    return true;
}


// Limpa a mensagem de validação quando o usuário digitar

campoNome.addEventListener("input", function () {
    campoNome.setCustomValidity("");
});


// ==================================================
// REMOVE A MENSAGEM DE TABELA VAZIA
// ==================================================

function removerMensagemSemResultados() {
    const mensagemExistente = corpoTabela.querySelector(
        ".linha-sem-resultados"
    );

    if (mensagemExistente) {
        mensagemExistente.remove();
    }
}


// ==================================================
// MOSTRA MENSAGEM QUANDO NADA FOR ENCONTRADO
// ==================================================

function mostrarMensagemSemResultados() {
    removerMensagemSemResultados();

    const novaLinha = document.createElement("tr");

    novaLinha.classList.add("linha-sem-resultados");

    novaLinha.innerHTML = `
        <td colspan="8">
            Nenhuma ferramenta encontrada com os filtros informados.
        </td>
    `;

    corpoTabela.appendChild(novaLinha);
}


// ==================================================
// FILTRAR A TABELA
// ==================================================

function filtrarTabela() {
    if (!validarNome()) {
        return;
    }

    removerMensagemSemResultados();

    const nomePesquisado = normalizarTexto(
        campoNome.value
    );

    const statusSelecionado = normalizarTexto(
        campoStatus.value
    );

    const localizacaoSelecionada = normalizarTexto(
        campoLocalizacao.value.replaceAll("-", " ")
    );

    const linhas = obterLinhasFerramentas();

    let quantidadeEncontrada = 0;

    linhas.forEach(function (linha) {
        const nomeFerramenta = normalizarTexto(
            linha.cells[1].textContent
        );

        const statusFerramenta = normalizarTexto(
            linha.cells[2].textContent
        );

        const localizacaoFerramenta = normalizarTexto(
            linha.cells[3].textContent
        );

        const nomeCorresponde =
            nomePesquisado === "" ||
            nomeFerramenta.includes(nomePesquisado);

        const statusCorresponde =
            statusSelecionado === "" ||
            statusFerramenta === statusSelecionado;

        const localizacaoCorresponde =
            localizacaoSelecionada === "" ||
            localizacaoFerramenta ===
                localizacaoSelecionada;

        const ferramentaCorresponde =
            nomeCorresponde &&
            statusCorresponde &&
            localizacaoCorresponde;

        linha.hidden = !ferramentaCorresponde;

        if (ferramentaCorresponde) {
            quantidadeEncontrada++;
        }
    });

    if (quantidadeEncontrada === 0) {
        mostrarMensagemSemResultados();

        textoOrientacao.textContent =
            "Nenhuma ferramenta foi encontrada.";
    } else if (quantidadeEncontrada === 1) {
        textoOrientacao.textContent =
            "1 ferramenta encontrada.";
    } else {
        textoOrientacao.textContent =
            `${quantidadeEncontrada} ferramentas encontradas.`;
    }
}


// ==================================================
// ENVIO DO FORMULÁRIO DE PESQUISA
// ==================================================

formularioFiltros.addEventListener(
    "submit",
    function (evento) {
        /*
         * Impede que o formulário atualize
         * a página ao clicar em Buscar.
         */
        evento.preventDefault();

        filtrarTabela();
    }
);


// ==================================================
// LIMPAR TODOS OS FILTROS
// ==================================================

function limparFiltros() {
    formularioFiltros.reset();

    campoNome.setCustomValidity("");

    removerMensagemSemResultados();

    const linhas = obterLinhasFerramentas();

    linhas.forEach(function (linha) {
        linha.hidden = false;
    });

    textoOrientacao.textContent =
        textoOrientacaoOriginal;

    campoNome.focus();
}


botaoLimpar.addEventListener(
    "click",
    limparFiltros
);


// ==================================================
// VISUALIZAR OS DADOS DA FERRAMENTA
// ==================================================

function visualizarFerramenta(linha) {
    const id = linha.cells[0].textContent.trim();
    const nome = linha.cells[1].textContent.trim();
    const status = linha.cells[2].textContent.trim();
    const localizacao = linha.cells[3].textContent.trim();
    const dataDevolucao = linha.cells[4].textContent.trim();
    const responsavel = linha.cells[5].textContent.trim();
    const motivo = linha.cells[6].textContent.trim();

    alert(
        `DETALHES DA FERRAMENTA\n\n` +
        `ID: ${id}\n` +
        `Nome: ${nome}\n` +
        `Status: ${status}\n` +
        `Localização: ${localizacao}\n` +
        `Data de devolução: ${dataDevolucao}\n` +
        `Responsável: ${responsavel}\n` +
        `Motivo da desativação: ${motivo}`
    );
}


// ==================================================
// ADICIONAR OU EDITAR OBSERVAÇÃO
// ==================================================

function editarFerramenta(linha) {
    const nomeFerramenta =
        linha.cells[1].textContent.trim();

    // Recupera a observação já salva.
    // Se ainda não existir, começa vazia.

    const observacaoAtual =
        linha.dataset.observacao || "";

    const novaObservacao = prompt(
        `Digite uma observação para ${nomeFerramenta}:`,
        observacaoAtual
    );

    // O usuário clicou em Cancelar

    if (novaObservacao === null) {
        return;
    }

    const observacaoTratada =
        novaObservacao.trim();

    // Validação do tamanho

    if (observacaoTratada.length > 300) {
        alert(
            "A observação deve possuir no máximo 300 caracteres."
        );

        return;
    }

    // Guarda a observação dentro da própria linha da tabela

    linha.dataset.observacao =
        observacaoTratada;

    if (observacaoTratada === "") {
        alert("A observação foi removida.");
    } else {
        alert("Observação salva com sucesso!");
    }
}


// ==================================================
// VISUALIZAR OBSERVAÇÃO
// ==================================================

function visualizarFerramenta(linha) {
    const nomeFerramenta =
        linha.cells[1].textContent.trim();

    const observacao =
        linha.dataset.observacao || "";

    if (observacao === "") {
        alert(
            `A ferramenta ${nomeFerramenta} ` +
            `não possui observações cadastradas.`
        );

        return;
    }

    alert(
        `Observações de ${nomeFerramenta}:\n\n` +
        observacao
    );
}


// ==================================================
// AÇÕES DA TABELA
// ==================================================

corpoTabela.addEventListener(
    "click",
    function (evento) {
        const botaoClicado =
            evento.target.closest(".botao-acao");

        if (!botaoClicado) {
            return;
        }

        const linha =
            botaoClicado.closest("tr");

        const iconeVisualizar =
            botaoClicado.querySelector(".bi-eye");

        const iconeEditar =
            botaoClicado.querySelector(".bi-pencil");

        if (iconeVisualizar) {
            visualizarFerramenta(linha);
        }

        if (iconeEditar) {
            editarFerramenta(linha);
        }
    }
);

