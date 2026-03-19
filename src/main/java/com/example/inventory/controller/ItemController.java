package com.example.inventory.controller;

import com.example.inventory.repository.ItemRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("items", itemRepository.findAllByOrderByStatusAscReservedDateDesc());
        return "index";
    }
}
