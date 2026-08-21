package com.uc15.ferramentotecaweb.service;

import com.uc15.ferramentotecaweb.model.Usuario;
import com.uc15.ferramentotecaweb.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository) {

        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario autenticar(
            String nome,
            String senha) {

        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException(
                    "Informe o nome do usuário."
            );
        }

        if (senha == null || senha.isBlank()) {
            throw new IllegalArgumentException(
                    "Informe a senha."
            );
        }

        Usuario usuario = usuarioRepository
                .findFirstByNomeIgnoreCaseAndSenha(
                        nome.trim(),
                        senha
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuário ou senha incorretos."
                        )
                );

        if (!usuario.isAtivo()) {
            throw new IllegalStateException(
                    "Este usuário está inativo."
            );
        }

        return usuario;
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void excluir(Long id) {
        usuarioRepository.deleteById(id);
    }
}
