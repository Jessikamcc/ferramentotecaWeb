
package com.uc15.ferramentotecaweb.service;

import com.uc15.ferramentotecaweb.model.Ferramenta;
import com.uc15.ferramentotecaweb.repository.FerramentaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class FerramentaService {

    private final FerramentaRepository ferramentaRepository;

    public FerramentaService(FerramentaRepository ferramentaRepository) {
        this.ferramentaRepository = ferramentaRepository;
    }

    public List<Ferramenta> listarTodas() {
        return ferramentaRepository.findAll();
    }

    public Optional<Ferramenta> buscarPorId(Long id) {
        return ferramentaRepository.findById(id);
    }

    public Ferramenta salvar(Ferramenta ferramenta) {
        return ferramentaRepository.save(ferramenta);
    }

    public void excluir(Long id) {
        ferramentaRepository.deleteById(id);
    }
}
