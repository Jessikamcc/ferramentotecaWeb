const API_FERRAMENTAS = "/api/ferramentas";

const API_EMPRESTIMOS_ATIVOS =
    "/api/emprestimos/ativos";


// ==================================================
// ELEMENTOS DA TELA
// ==================================================

const formularioFiltros =
    document.getElementById("formFiltros");

const campoNome =
    document.getElementById("nome");

const campoStatus =
    document.getElementById("status");

const campoLocalizacao =
    document.getElementById("localizacao");

const botaoLimpar =
    document.getElementById("botaoLimpar");

const corpoTabela =
    document.querySelector(
        ".tabela-inventario tbody"
    );

const textoOrientacao =
    document.getElementById("ajudaFiltros");

const textoOrientacaoOriginal =
    "Preencha um ou mais filtros para buscar. " +
    "Todos os filtros são opcionais.";

let ferramentasCarregadas = [];
let emprestimosAtivos = [];

campoNome.maxLength = 50;

textoOrientacao.setAttribute(
    "aria-live",
    "polite"
);


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


function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = texto || "";

    return elemento.innerHTML;
}


function formatarLocalizacao(localizacao) {
    const nomes = {
        almoxarifado: "Almoxarifado",
        oficina: "Oficina",
        deposito: "Depósito"
    };

    return nomes[localizacao]
        || localizacao
        || "--------";
}


function formatarData(data) {
    if (!data) {
        return "--------";
    }

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function buscarEmprestimoAtivo(ferramentaId) {
    return emprestimosAtivos.find(
        function (emprestimo) {
            return emprestimo.ferramenta &&
                Number(emprestimo.ferramenta.id) ===
                Number(ferramentaId);
        }
    );
}


function obterStatusFerramenta(ferramenta) {
    if (ferramenta.disponivel) {
        return {
            valor: "disponivel",
            texto: "Disponível",
            classe: "status-disponivel"
        };
    }

    if (
        ferramenta.motivoDesativacao &&
        ferramenta.motivoDesativacao.trim() !== ""
    ) {
        return {
            valor: "desativada",
            texto: "Desativada",
            classe: "status-desativada"
        };
    }

    return {
        valor: "emprestada",
        texto: "Emprestada",
        classe: "status-emprestada"
    };
}


function validarNome() {
    const nomePesquisado =
        campoNome.value.trim();

    campoNome.setCustomValidity("");

    if (
        nomePesquisado.length > 0 &&
        nomePesquisado.length < 2
    ) {
        campoNome.setCustomValidity(
            "Digite pelo menos 2 caracteres " +
            "para pesquisar pelo nome."
        );

        campoNome.reportValidity();
        campoNome.focus();

        return false;
    }

    return true;
}


campoNome.addEventListener(
    "input",
    function () {
        campoNome.setCustomValidity("");
    }
);


// ==================================================
// MONTAR A TABELA COM DADOS DO MYSQL
// ==================================================

function criarLinhaTabela(ferramenta) {
    const status =
        obterStatusFerramenta(ferramenta);

    const emprestimoAtivo =
        buscarEmprestimoAtivo(ferramenta.id);

    const dataDevolucao = emprestimoAtivo
        ? formatarData(
            emprestimoAtivo.dataDevolucao
        )
        : '<span class="sem-dado">--------</span>';

    const responsavel = emprestimoAtivo
        ? escaparHTML(
            emprestimoAtivo.professor
        )
        : '<span class="sem-dado">--------</span>';

    const motivo = ferramenta.motivoDesativacao
        ? escaparHTML(
            ferramenta.motivoDesativacao
        )
        : '<span class="sem-dado">--------</span>';

    const nome =
        escaparHTML(ferramenta.nome);

    const localizacao = escaparHTML(
        formatarLocalizacao(
            ferramenta.localizacao
        )
    );

    return `
        <tr data-id="${ferramenta.id}">
            <td>${ferramenta.id}</td>

            <td>${nome}</td>

            <td>
                <span class="status ${status.classe}">
                    ${status.texto}
                </span>
            </td>

            <td>${localizacao}</td>

            <td>${dataDevolucao}</td>

            <td>${responsavel}</td>

            <td>${motivo}</td>
        </tr>
    `;
}


function mostrarMensagemTabela(mensagem) {
    corpoTabela.innerHTML = `
        <tr class="linha-sem-resultados">
            <td colspan="7">
                ${escaparHTML(mensagem)}
            </td>
        </tr>
    `;
}


function atualizarTextoQuantidade(quantidade) {
    if (quantidade === 0) {
        textoOrientacao.textContent =
            "Nenhuma ferramenta foi encontrada.";

    } else if (quantidade === 1) {
        textoOrientacao.textContent =
            "1 ferramenta encontrada.";

    } else {
        textoOrientacao.textContent =
            `${quantidade} ferramentas encontradas.`;
    }
}


function renderizarTabela(ferramentas) {
    corpoTabela.innerHTML = "";

    if (ferramentas.length === 0) {
        mostrarMensagemTabela(
            "Nenhuma ferramenta encontrada."
        );

        atualizarTextoQuantidade(0);

        return;
    }

    ferramentas.forEach(
        function (ferramenta) {
            corpoTabela.insertAdjacentHTML(
                "beforeend",
                criarLinhaTabela(ferramenta)
            );
        }
    );

    atualizarTextoQuantidade(
        ferramentas.length
    );
}


// ==================================================
// CARREGAR FERRAMENTAS E EMPRÉSTIMOS DA API
// ==================================================

async function carregarFerramentas() {
    textoOrientacao.textContent =
        "Carregando ferramentas...";

    mostrarMensagemTabela(
        "Carregando ferramentas..."
    );

    try {
        const [
            respostaFerramentas,
            respostaEmprestimos
        ] = await Promise.all([
            fetch(API_FERRAMENTAS),
            fetch(API_EMPRESTIMOS_ATIVOS)
        ]);

        if (
            !respostaFerramentas.ok ||
            !respostaEmprestimos.ok
        ) {
            throw new Error(
                "Não foi possível consultar os dados."
            );
        }

        const [
            dadosFerramentas,
            dadosEmprestimos
        ] = await Promise.all([
            respostaFerramentas.json(),
            respostaEmprestimos.json()
        ]);

        ferramentasCarregadas =
            Array.isArray(dadosFerramentas)
                ? dadosFerramentas
                : [];

        emprestimosAtivos =
            Array.isArray(dadosEmprestimos)
                ? dadosEmprestimos
                : [];

        renderizarTabela(
            ferramentasCarregadas
        );

    } catch (erro) {
        console.error(erro);

        ferramentasCarregadas = [];
        emprestimosAtivos = [];

        mostrarMensagemTabela(
            "Não foi possível carregar as ferramentas."
        );

        textoOrientacao.textContent =
            "Erro ao consultar o banco de dados.";
    }
}


// ==================================================
// FILTROS
// ==================================================

function filtrarTabela() {
    if (!validarNome()) {
        return;
    }

    const nomePesquisado =
        normalizarTexto(campoNome.value);

    const statusSelecionado =
        campoStatus.value;

    const localizacaoSelecionada =
        campoLocalizacao.value;

    const ferramentasFiltradas =
        ferramentasCarregadas.filter(
            function (ferramenta) {
                const status =
                    obterStatusFerramenta(
                        ferramenta
                    );

                const nomeCorresponde =
                    nomePesquisado === "" ||
                    normalizarTexto(
                        ferramenta.nome
                    ).includes(nomePesquisado);

                const statusCorresponde =
                    statusSelecionado === "" ||
                    status.valor ===
                    statusSelecionado;

                const localizacaoCorresponde =
                    localizacaoSelecionada === "" ||
                    ferramenta.localizacao ===
                    localizacaoSelecionada;

                return nomeCorresponde &&
                    statusCorresponde &&
                    localizacaoCorresponde;
            }
        );

    renderizarTabela(
        ferramentasFiltradas
    );
}


formularioFiltros.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        filtrarTabela();
    }
);


botaoLimpar.addEventListener(
    "click",
    function () {
        formularioFiltros.reset();

        campoNome.setCustomValidity("");

        renderizarTabela(
            ferramentasCarregadas
        );

        textoOrientacao.textContent =
            textoOrientacaoOriginal;

        campoNome.focus();
    }
);


// ==================================================
// INICIALIZAÇÃO
// ==================================================

carregarFerramentas();