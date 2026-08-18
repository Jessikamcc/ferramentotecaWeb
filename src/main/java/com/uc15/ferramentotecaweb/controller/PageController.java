package com.uc15.ferramentotecaweb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping({"/", "/login"})
    public String login() {
        return "login";
    }

    @GetMapping("/menu")
    public String menu() {
        return "menu";
    }

    @GetMapping("/usuarios")
    public String usuarios() {
        return "usuarios";
    }

    @GetMapping("/ferramentas")
    public String ferramentas() {
        return "ferramentas";
    }

    @GetMapping("/emprestimos")
    public String emprestimos() {
        return "emprestimos";
    }

    @GetMapping("/inventario")
    public String inventario() {
        return "inventario";
    }
}
