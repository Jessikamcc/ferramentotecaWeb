package com.uc15.ferramentotecaweb.service;

import com.uc15.ferramentotecaweb.model.Emprestimo;
import com.uc15.ferramentotecaweb.model.Ferramenta;
import com.uc15.ferramentotecaweb.repository.EmprestimoRepository;
import com.uc15.ferramentotecaweb.repository.FerramentaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final FerramentaRepository ferramentaRepository;

    public EmprestimoService(
            EmprestimoRepository emprestimoRepository,
            FerramentaRepository ferramentaRepository) {

        this.emprestimoRepository = emprestimoRepository;
        this.ferramentaRepository = ferramentaRepository;
    }

    public List<Emprestimo> listarTodos() {
        return emprestimoRepository.findAll();
    }

    public List<Emprestimo> listarAtivos() {
        return emprestimoRepository
                .findByDevolvidoFalseOrderByDataDevolucaoAsc();
    }

    public Optional<Emprestimo> buscarPorId(Long id) {
        return emprestimoRepository.findById(id);
    }

    @Transactional
    public Emprestimo registrar(Emprestimo emprestimo) {

        if (emprestimo.getProfessor() == null
                || emprestimo.getProfessor().isBlank()) {
            throw new IllegalArgumentException(
                    "Informe o nome do professor."
            );
        }
        
        long quantidadeAtivos =
            emprestimoRepository
                    .countByProfessorIgnoreCaseAndDevolvidoFalse(
                            emprestimo.getProfessor().trim()
                    );

    if (quantidadeAtivos >= 3) {
        throw new IllegalStateException(
                "Este professor já atingiu o limite de 3 empréstimos ativos."
        );
    }

        if (emprestimo.getDataEmprestimo() == null) {
            throw new IllegalArgumentException(
                    "Informe a data do empréstimo."
            );
        }

        if (emprestimo.getDataDevolucao() == null) {
            throw new IllegalArgumentException(
                    "Informe a data prevista para devolução."
            );
        }

        if (emprestimo.getDataEmprestimo()
                .isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "A data do empréstimo não pode ser anterior à data atual."
            );
        }

        if (!emprestimo.getDataDevolucao()
                .isAfter(emprestimo.getDataEmprestimo())) {
            throw new IllegalArgumentException(
                    "A devolução deve ser posterior ao empréstimo."
            );
        }

        if (emprestimo.getFerramenta() == null
                || emprestimo.getFerramenta().getId() == null) {
            throw new IllegalArgumentException(
                    "Selecione uma ferramenta."
            );
        }

        Ferramenta ferramenta = ferramentaRepository
                .findById(emprestimo.getFerramenta().getId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Ferramenta não encontrada."
                ));

        if (!ferramenta.isDisponivel()) {
            throw new IllegalStateException(
                    "Esta ferramenta não está disponível."
            );
        }

        emprestimo.setId(null);
        emprestimo.setProfessor(
                emprestimo.getProfessor().trim()
        );
        emprestimo.setFerramenta(ferramenta);
        emprestimo.setDevolvido(false);
        emprestimo.setDataDevolucaoReal(null);

        ferramenta.setDisponivel(false);
        ferramentaRepository.save(ferramenta);

        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Emprestimo devolver(Long id) {

        Emprestimo emprestimo = emprestimoRepository
                .findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Empréstimo não encontrado."
                ));

        if (emprestimo.isDevolvido()) {
            throw new IllegalStateException(
                    "Este empréstimo já foi devolvido."
            );
        }

        emprestimo.setDevolvido(true);
        emprestimo.setDataDevolucaoReal(LocalDate.now());

        Ferramenta ferramenta = emprestimo.getFerramenta();
        ferramenta.setDisponivel(true);

        ferramentaRepository.save(ferramenta);

        return emprestimoRepository.save(emprestimo);
    }

    public Emprestimo salvar(Emprestimo emprestimo) {
        return emprestimoRepository.save(emprestimo);
    }

    public void excluir(Long id) {
        emprestimoRepository.deleteById(id);
    }
}