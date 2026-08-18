// ==================================================
// ELEMENTOS DA PÁGINA
// ==================================================

const formPesquisa = document.getElementById("formPesquisa");
const campoFerramenta = document.getElementById("ferramenta");
const resultadoFerramenta = document.getElementById("resultadoFerramenta");

const formEmprestimo = document.getElementById("formEmprestimo");
const campoProfessor = document.getElementById("professor");
const campoDataEmprestimo = document.getElementById("dataEmprestimo");
const campoDataDevolucao = document.getElementById("dataDevolucao");


// ==================================================
// DADOS APENAS PARA DEMONSTRAÇÃO DO FRONT-END
// ==================================================

// Estes dados são temporários.
// Futuramente poderão vir do banco de dados.

const ferramentaExemplo = {
    id: 1,
    nome: "Furadeira",
    descricao: "Furadeira de impacto 16mm - 110V",
    localizacao: "Almoxarifado",
    disponivel: true
};

let ferramentaSelecionada = null;


// ==================================================
// CONFIGURAÇÃO INICIAL DA PÁGINA
// ==================================================

// O card começa escondido.
// Ele aparece somente depois que a ferramenta é pesquisada.

resultadoFerramenta.hidden = true;

const hoje = obterDataAtual();

campoDataEmprestimo.min = hoje;
campoDataEmprestimo.value = hoje;

campoDataDevolucao.min = adicionarUmDia(hoje);


// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

function obterDataAtual() {
    const dataAtual = new Date();

    const ano = dataAtual.getFullYear();

    const mes = String(
        dataAtual.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        dataAtual.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function adicionarUmDia(dataInformada) {
    const partes = dataInformada.split("-");

    const ano = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    const data = new Date(ano, mes, dia);

    data.setDate(data.getDate() + 1);

    const novoAno = data.getFullYear();

    const novoMes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const novoDia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${novoAno}-${novoMes}-${novoDia}`;
}


function formatarData(dataInformada) {
    const partes = dataInformada.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function esconderResultado() {
    ferramentaSelecionada = null;

    resultadoFerramenta.hidden = true;
}


// ==================================================
// PESQUISA DA FERRAMENTA
// ==================================================

formPesquisa.addEventListener("submit", function (event) {
    event.preventDefault();

    const pesquisa = campoFerramenta.value
        .toLowerCase()
        .trim();

    // Validação do campo vazio

    if (pesquisa === "") {
        esconderResultado();

        alert("Digite o ID ou o nome da ferramenta.");

        campoFerramenta.focus();

        return;
    }

    // Permite pesquisar pelo ID 1 ou pelo nome Furadeira

    const pesquisaPorId =
        pesquisa === String(ferramentaExemplo.id);

    const pesquisaPorNome =
        ferramentaExemplo.nome
            .toLowerCase()
            .includes(pesquisa);

    // Ferramenta não encontrada

    if (!pesquisaPorId && !pesquisaPorNome) {
        esconderResultado();

        alert("Ferramenta não encontrada nesta demonstração.");

        campoFerramenta.focus();

        return;
    }

    // Ferramenta indisponível

    if (!ferramentaExemplo.disponivel) {
        esconderResultado();

        alert("A ferramenta pesquisada não está disponível.");

        return;
    }

    // Guarda a ferramenta encontrada

    ferramentaSelecionada = ferramentaExemplo;

    // Coloca os dados no card

    resultadoFerramenta.innerHTML = `
        <p>
            <strong>Nome:</strong>
            ${ferramentaExemplo.nome}
        </p>

        <p>
            <strong>Descrição:</strong>
            ${ferramentaExemplo.descricao}
        </p>

        <p>
            <strong>Localização:</strong>
            ${ferramentaExemplo.localizacao}
        </p>
    `;

    // Mostra o card

    resultadoFerramenta.hidden = false;
});


// Se o conteúdo da pesquisa for alterado,
// a ferramenta anterior deixa de estar selecionada.

campoFerramenta.addEventListener("input", function () {
    esconderResultado();
});


// ==================================================
// CONTROLE DAS DATAS
// ==================================================

campoDataEmprestimo.addEventListener("change", function () {
    if (campoDataEmprestimo.value === "") {
        campoDataDevolucao.min = adicionarUmDia(hoje);

        return;
    }

    const primeiraDataDevolucao = adicionarUmDia(
        campoDataEmprestimo.value
    );

    // A devolução só poderá acontecer depois do empréstimo

    campoDataDevolucao.min = primeiraDataDevolucao;

    // Limpa a devolução se ela ficar anterior ao empréstimo

    if (
        campoDataDevolucao.value !== "" &&
        campoDataDevolucao.value <= campoDataEmprestimo.value
    ) {
        campoDataDevolucao.value = "";
    }
});


// ==================================================
// VALIDAÇÃO E CONFIRMAÇÃO DO EMPRÉSTIMO
// ==================================================

formEmprestimo.addEventListener("submit", function (event) {
    event.preventDefault();

    const professor = campoProfessor.value.trim();

    const dataEmprestimo =
        campoDataEmprestimo.value;

    const dataDevolucao =
        campoDataDevolucao.value;


    // Validação da ferramenta

    if (ferramentaSelecionada === null) {
        alert(
            "Pesquise e selecione uma ferramenta disponível."
        );

        campoFerramenta.focus();

        return;
    }


    // Validação do professor

    if (professor === "") {
        alert("Digite o nome do professor.");

        campoProfessor.focus();

        return;
    }

    if (professor.length < 3) {
        alert(
            "O nome do professor deve ter pelo menos 3 caracteres."
        );

        campoProfessor.focus();

        return;
    }


    // Validação da data do empréstimo

    if (dataEmprestimo === "") {
        alert("Informe a data do empréstimo.");

        campoDataEmprestimo.focus();

        return;
    }

    if (dataEmprestimo < hoje) {
        alert(
            "A data do empréstimo não pode ser anterior à data atual."
        );

        campoDataEmprestimo.focus();

        return;
    }


    // Validação da data de devolução

    if (dataDevolucao === "") {
        alert("Informe a data de devolução.");

        campoDataDevolucao.focus();

        return;
    }

    if (dataDevolucao <= dataEmprestimo) {
        alert(
            "A data de devolução deve ser posterior à data do empréstimo."
        );

        campoDataDevolucao.focus();

        return;
    }


    // Confirmação do empréstimo

    alert(
        `Empréstimo confirmado com sucesso!\n\n` +
        `Ferramenta: ${ferramentaSelecionada.nome}\n` +
        `Professor: ${professor}\n` +
        `Data do empréstimo: ${formatarData(dataEmprestimo)}\n` +
        `Data de devolução: ${formatarData(dataDevolucao)}`
    );


    // Limpa os campos após a confirmação

    formEmprestimo.reset();

    campoFerramenta.value = "";

    esconderResultado();


    // Volta a configurar as datas

    campoDataEmprestimo.value = hoje;

    campoDataEmprestimo.min = hoje;

    campoDataDevolucao.min =
        adicionarUmDia(hoje);
});

