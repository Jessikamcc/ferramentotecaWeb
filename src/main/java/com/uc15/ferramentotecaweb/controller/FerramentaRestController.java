

package com.uc15.ferramentotecaweb.controller;

import com.uc15.ferramentotecaweb.model.Ferramenta;
import com.uc15.ferramentotecaweb.service.FerramentaService;
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
@RequestMapping("/api/ferramentas")
public class FerramentaRestController {

    private final FerramentaService ferramentaService;

    public FerramentaRestController(FerramentaService ferramentaService) {
        this.ferramentaService = ferramentaService;
    }

    @GetMapping
    public List<Ferramenta> listarTodas() {
        return ferramentaService.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ferramenta> buscarPorId(@PathVariable Long id) {
        return ferramentaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Ferramenta> cadastrar(
            @RequestBody Ferramenta ferramenta) {

        Ferramenta ferramentaSalva = ferramentaService.salvar(ferramenta);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ferramentaSalva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ferramenta> atualizar(
            @PathVariable Long id,
            @RequestBody Ferramenta ferramenta) {

        if (ferramentaService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ferramenta.setId(id);
        Ferramenta ferramentaAtualizada =
                ferramentaService.salvar(ferramenta);

        return ResponseEntity.ok(ferramentaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        if (ferramentaService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ferramentaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
