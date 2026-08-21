package com.uc15.ferramentotecaweb.controller;

import com.uc15.ferramentotecaweb.model.Usuario;
import com.uc15.ferramentotecaweb.service.UsuarioService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    public UsuarioRestController(
            UsuarioService usuarioService) {

        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(
            @PathVariable Long id) {

        return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> entrar(
            @RequestBody Map<String, String> dadosLogin) {

        try {
            Usuario usuario = usuarioService.autenticar(
                    dadosLogin.get("nome"),
                    dadosLogin.get("senha")
            );

            Map<String, Object> resposta =
                    new LinkedHashMap<>();

            resposta.put("id", usuario.getId());
            resposta.put("nome", usuario.getNome());
            resposta.put(
                    "tipoUsuario",
                    usuario.getTipoUsuario()
            );

            return ResponseEntity.ok(resposta);

        } catch (IllegalStateException erro) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    erro.getMessage()
            );

        } catch (IllegalArgumentException erro) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    erro.getMessage()
            );
        }
    }

    @PostMapping
    public ResponseEntity<Usuario> cadastrar(
            @RequestBody Usuario usuario) {

        Usuario usuarioSalvo =
                usuarioService.salvar(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuarioSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario) {

        if (usuarioService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        usuario.setId(id);

        Usuario usuarioAtualizado =
                usuarioService.salvar(usuario);

        return ResponseEntity.ok(usuarioAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id) {

        if (usuarioService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        usuarioService.excluir(id);

        return ResponseEntity.noContent().build();
    }
}