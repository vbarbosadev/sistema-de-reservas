package com.example.inventory.controller;

import com.example.inventory.dto.ItemDTO;
import com.example.inventory.model.Item;
import com.example.inventory.model.ItemState;
import com.example.inventory.repository.ItemRepository;
import com.example.inventory.repository.ReservationRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
public class ItemRestController {

    private final ItemRepository itemRepository;
    private final com.example.inventory.service.ItemService itemService;
    private final ReservationRepository reservationRepository;

    public ItemRestController(ItemRepository itemRepository, com.example.inventory.service.ItemService itemService, ReservationRepository reservationRepository) {
        this.itemRepository = itemRepository;
        this.itemService = itemService;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Fetch items available for a given date range (no overlapping active reservations).
     */
    @GetMapping("/available")
    public ResponseEntity<List<Item>> getAvailableItems(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        List<Item> available = itemRepository.findAll().stream()
                .filter(item -> item.getState() == ItemState.AVAILABLE)
                .filter(item -> !reservationRepository.hasConflict(item.getTombamento(), dataInicio, dataFim, 0L))
                .toList();
        return ResponseEntity.ok(available);
    }

    /**
     * Fetch all items
     *
     * @return list of items
     */
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        try {
            List<Item> items = itemRepository.findAll();
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new item
     * 
     * @param itemDTO the item data
     * @return the created item
     */
    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody ItemDTO itemDTO) {
        try {
            // Validate required fields
            if (itemDTO.getName() == null || itemDTO.getName().trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Name is required");
            }

            if (itemDTO.getTombamento() == null || itemDTO.getTombamento().trim().isEmpty()) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Tombamento is required");
            }

            if (itemDTO.getStatus() == null) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Status is required");
            }

            // Check if tombamento already exists
            if (itemRepository.existsByTombamento(itemDTO.getTombamento())) {
                return createErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "An item with this tombamento already exists");
            }

            // Create new item entity
            Item item = new Item();
            item.setName(itemDTO.getName());
            item.setDescription(itemDTO.getDescription());
            item.setTombamento(itemDTO.getTombamento());
            item.setStatus(itemDTO.getStatus());
            item.setState(itemDTO.getState() != null ? itemDTO.getState() : ItemState.AVAILABLE);
            item.setReservedDate(itemDTO.getReservedDate());

            // Save and return the created item
            Item savedItem = itemRepository.save(item);
            return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
        } catch (Exception e) {
            return createErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "An error occurred while creating the item: " + e.getMessage());
        }
    }

    /**
     * Create a standardized error response
     * 
     * @param status  the HTTP status
     * @param message the error message
     * @return ResponseEntity with error details
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(itemService.findById(id));
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Item updated) {
        try {
            Item saved = itemService.update(id, updated);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found with id")) {
                return createErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
            }
            return createErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
        } catch (IllegalArgumentException e) {
            return createErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalStateException e) {
            return createErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        }
    }
}