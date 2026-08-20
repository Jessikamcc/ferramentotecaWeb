// ==================================================
// ELEMENTOS DA PÁGINA
// ==================================================

const formPesquisa =
    document.getElementById("formPesquisa");

const campoFerramenta =
    document.getElementById("ferramenta");

const resultadoFerramenta =
    document.getElementById("resultadoFerramenta");

const formEmprestimo =
    document.getElementById("formEmprestimo");

const campoProfessor =
    document.getElementById("professor");

const campoDataEmprestimo =
    document.getElementById("dataEmprestimo");

const campoDataDevolucao =
    document.getElementById("dataDevolucao");

const corpoTabelaEmprestimos =
    document.getElementById("corpoTabelaEmprestimos");

const mensagemSemEmprestimos =
    document.getElementById("mensagemSemEmprestimos");

let ferramentaSelecionada = null;


// ==================================================
// CONFIGURAÇÃO INICIAL
// ==================================================

const hoje = obterDataAtual();

resultadoFerramenta.hidden = true;

campoDataEmprestimo.min = hoje;
campoDataEmprestimo.value = hoje;

campoDataDevolucao.min = adicionarUmDia(hoje);

carregarEmprestimosAtivos();


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

    const data = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    data.setDate(data.getDate() + 1);

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(dataInformada) {
    if (!dataInformada) {
        return "-";
    }

    const partes = dataInformada.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function esconderResultado() {
    ferramentaSelecionada = null;
    resultadoFerramenta.hidden = true;
}


async function obterMensagemErro(resposta) {
    try {
        const dados = await resposta.json();

        return dados.detail
            || dados.message
            || "Não foi possível concluir a operação.";

    } catch {
        return "Não foi possível concluir a operação.";
    }
}


// ==================================================
// PESQUISA DE FERRAMENTA NO BANCO
// ==================================================

formPesquisa.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const pesquisa =
            campoFerramenta.value.trim();

        if (pesquisa === "") {
            esconderResultado();

            alert(
                "Digite o ID ou o nome da ferramenta."
            );

            campoFerramenta.focus();
            return;
        }

        try {
            const resposta = await fetch(
                "/api/ferramentas"
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível buscar as ferramentas."
                );
            }

            const ferramentas = await resposta.json();

            const pesquisaNormalizada =
                pesquisa.toLowerCase();

            const pesquisaNumerica =
                /^\d+$/.test(pesquisa);

            let ferramentaEncontrada;

            if (pesquisaNumerica) {
                ferramentaEncontrada =
                    ferramentas.find(function (ferramenta) {
                        return Number(ferramenta.id)
                            === Number(pesquisa);
                    });

            } else {
                ferramentaEncontrada =
                    ferramentas.find(function (ferramenta) {
                        return ferramenta.nome
                            .toLowerCase()
                            .includes(pesquisaNormalizada);
                    });
            }

            if (!ferramentaEncontrada) {
                esconderResultado();

                alert("Ferramenta não encontrada.");

                campoFerramenta.focus();
                return;
            }

            if (!ferramentaEncontrada.disponivel) {
                esconderResultado();

                alert(
                    "A ferramenta pesquisada não está disponível."
                );

                return;
            }

            ferramentaSelecionada =
                ferramentaEncontrada;

            resultadoFerramenta.innerHTML = `
                <p>
                    <strong>ID:</strong>
                    ${ferramentaEncontrada.id}
                </p>

                <p>
                    <strong>Nome:</strong>
                    ${escaparHtml(ferramentaEncontrada.nome)}
                </p>

                <p>
                    <strong>Descrição:</strong>
                    ${escaparHtml(
                        ferramentaEncontrada.descricao
                        || "Não informada"
                    )}
                </p>

                <p>
                    <strong>Localização:</strong>
                    ${escaparHtml(
                        ferramentaEncontrada.localizacao
                    )}
                </p>
            `;

            resultadoFerramenta.hidden = false;

        } catch (erro) {
            esconderResultado();

            alert(erro.message);
        }
    }
);


campoFerramenta.addEventListener(
    "input",
    esconderResultado
);


// ==================================================
// CONTROLE DAS DATAS
// ==================================================

campoDataEmprestimo.addEventListener(
    "change",
    function () {

        if (campoDataEmprestimo.value === "") {
            campoDataDevolucao.min =
                adicionarUmDia(hoje);

            campoDataDevolucao.value = "";
            return;
        }

        const primeiraDataDevolucao =
            adicionarUmDia(
                campoDataEmprestimo.value
            );

        campoDataDevolucao.min =
            primeiraDataDevolucao;

        if (
            campoDataDevolucao.value !== ""
            && campoDataDevolucao.value
                <= campoDataEmprestimo.value
        ) {
            campoDataDevolucao.value = "";
        }
    }
);


// ==================================================
// CADASTRAR EMPRÉSTIMO
// ==================================================

formEmprestimo.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const professor =
            campoProfessor.value.trim();

        const dataEmprestimo =
            campoDataEmprestimo.value;

        const dataDevolucao =
            campoDataDevolucao.value;

        if (ferramentaSelecionada === null) {
            alert(
                "Pesquise e selecione uma ferramenta disponível."
            );

            campoFerramenta.focus();
            return;
        }

        if (professor.length < 3) {
            alert(
                "O nome do professor deve ter pelo menos 3 caracteres."
            );

            campoProfessor.focus();
            return;
        }

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

        const dadosEmprestimo = {
            professor: professor,
            dataEmprestimo: dataEmprestimo,
            dataDevolucao: dataDevolucao,

            ferramenta: {
                id: ferramentaSelecionada.id
            }
        };

        const botaoConfirmar =
            formEmprestimo.querySelector(
                ".btn-confirmar"
            );

        botaoConfirmar.disabled = true;

        try {
            const resposta = await fetch(
                "/api/emprestimos",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        dadosEmprestimo
                    )
                }
            );

            if (!resposta.ok) {
                const mensagem =
                    await obterMensagemErro(resposta);

                throw new Error(mensagem);
            }

            await resposta.json();

            alert(
                "Empréstimo cadastrado com sucesso!"
            );

            formEmprestimo.reset();

            campoFerramenta.value = "";

            esconderResultado();

            campoDataEmprestimo.value = hoje;
            campoDataEmprestimo.min = hoje;

            campoDataDevolucao.min =
                adicionarUmDia(hoje);

            await carregarEmprestimosAtivos();

        } catch (erro) {
            alert(erro.message);

        } finally {
            botaoConfirmar.disabled = false;
        }
    }
);


// ==================================================
// LISTAR EMPRÉSTIMOS ATIVOS
// ==================================================

async function carregarEmprestimosAtivos() {
    corpoTabelaEmprestimos.innerHTML = "";

    try {
        const resposta = await fetch(
            "/api/emprestimos/ativos"
        );

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar os empréstimos."
            );
        }

        const emprestimos = await resposta.json();

        if (emprestimos.length === 0) {
            mensagemSemEmprestimos.hidden = false;
            return;
        }

        mensagemSemEmprestimos.hidden = true;

        emprestimos.forEach(function (emprestimo) {
            const linha =
                document.createElement("tr");

            const nomeFerramenta =
                emprestimo.ferramenta
                    ? emprestimo.ferramenta.nome
                    : "-";

            linha.innerHTML = `
                <td>
                    ${escaparHtml(nomeFerramenta)}
                </td>

                <td>
                    ${escaparHtml(emprestimo.professor)}
                </td>

                <td>
                    ${formatarData(
                        emprestimo.dataEmprestimo
                    )}
                </td>

                <td>
                    ${formatarData(
                        emprestimo.dataDevolucao
                    )}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn-devolver"
                        data-id="${emprestimo.id}"
                    >
                        <i class="bi bi-arrow-return-left"></i>
                        Devolver
                    </button>
                </td>
            `;

            corpoTabelaEmprestimos.appendChild(
                linha
            );
        });

    } catch (erro) {
        mensagemSemEmprestimos.hidden = false;

        mensagemSemEmprestimos.textContent =
            erro.message;
    }
}


// ==================================================
// REGISTRAR DEVOLUÇÃO
// ==================================================

corpoTabelaEmprestimos.addEventListener(
    "click",
    async function (event) {

        const botao = event.target.closest(
            ".btn-devolver"
        );

        if (!botao) {
            return;
        }

        const idEmprestimo = botao.dataset.id;

        const confirmar = confirm(
            "Deseja confirmar a devolução desta ferramenta?"
        );

        if (!confirmar) {
            return;
        }

        botao.disabled = true;

        try {
            const resposta = await fetch(
                `/api/emprestimos/${idEmprestimo}/devolver`,
                {
                    method: "PUT"
                }
            );

            if (!resposta.ok) {
                const mensagem =
                    await obterMensagemErro(resposta);

                throw new Error(mensagem);
            }

            await resposta.json();

            alert(
                "Devolução registrada com sucesso!"
            );

            await carregarEmprestimosAtivos();

        } catch (erro) {
            alert(erro.message);

            botao.disabled = false;
        }
    }
);

