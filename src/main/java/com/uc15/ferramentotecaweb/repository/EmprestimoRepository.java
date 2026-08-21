
package com.uc15.ferramentotecaweb.repository;

import com.uc15.ferramentotecaweb.model.Emprestimo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    List<Emprestimo> findByDevolvidoFalseOrderByDataDevolucaoAsc();
    
    long countByProfessorIgnoreCaseAndDevolvidoFalse(String professor);
}
