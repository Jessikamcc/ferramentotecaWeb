package com.uc15.ferramentotecaweb.controller;

import com.uc15.ferramentotecaweb.model.Emprestimo;
import com.uc15.ferramentotecaweb.service.EmprestimoService;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoRestController {

    private final EmprestimoService emprestimoService;

    public EmprestimoRestController(
            EmprestimoService emprestimoService) {

        this.emprestimoService = emprestimoService;
    }

    @GetMapping
    public List<Emprestimo> listarTodos() {
        return emprestimoService.listarTodos();
    }

    @GetMapping("/ativos")
    public List<Emprestimo> listarAtivos() {
        return emprestimoService.listarAtivos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Emprestimo> buscarPorId(
            @PathVariable Long id) {

        return emprestimoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @PostMapping
    public ResponseEntity<Emprestimo> cadastrar(
            @RequestBody Emprestimo emprestimo) {

        try {
            Emprestimo novoEmprestimo =
                    emprestimoService.registrar(emprestimo);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(novoEmprestimo);

        } catch (NoSuchElementException erro) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    erro.getMessage()
            );

        } catch (IllegalStateException erro) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    erro.getMessage()
            );

        } catch (IllegalArgumentException erro) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    erro.getMessage()
            );
        }
    }

    @PutMapping("/{id}/devolver")
    public ResponseEntity<Emprestimo> devolver(
            @PathVariable Long id) {

        try {
            Emprestimo emprestimoDevolvido =
                    emprestimoService.devolver(id);

            return ResponseEntity.ok(emprestimoDevolvido);

        } catch (NoSuchElementException erro) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    erro.getMessage()
            );

        } catch (IllegalStateException erro) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    erro.getMessage()
            );
        }
    }
}