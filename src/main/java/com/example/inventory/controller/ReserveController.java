package com.example.inventory.controller;

import com.example.inventory.repository.ReservationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ReserveController {

    private final ReservationRepository reservationRepository;

    public ReserveController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @GetMapping("/reserves")
    public String index(Model model) {
        model.addAttribute("reserves", reservationRepository.findAll());
        return "reserves";
    }
}
