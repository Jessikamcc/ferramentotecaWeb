

package com.uc15.ferramentotecaweb.controller;

import com.uc15.ferramentotecaweb.model.Emprestimo;
import com.uc15.ferramentotecaweb.service.EmprestimoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoRestController {

    private final EmprestimoService emprestimoService;

    public EmprestimoRestController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @GetMapping
    public List<Emprestimo> listarTodos() {
        return emprestimoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Emprestimo> buscarPorId(@PathVariable Long id) {
        return emprestimoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Emprestimo> cadastrar(
            @RequestBody Emprestimo emprestimo) {

        Emprestimo emprestimoSalvo =
                emprestimoService.salvar(emprestimo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(emprestimoSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Emprestimo> atualizar(
            @PathVariable Long id,
            @RequestBody Emprestimo emprestimo) {

        if (emprestimoService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        emprestimo.setId(id);
        Emprestimo emprestimoAtualizado =
                emprestimoService.salvar(emprestimo);

        return ResponseEntity.ok(emprestimoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        if (emprestimoService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        emprestimoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}