
package com.uc15.ferramentotecaweb.repository;


import com.uc15.ferramentotecaweb.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
     Optional<Usuario> findFirstByNomeIgnoreCaseAndSenha(
            String nome,
            String senha
    );
    
}
