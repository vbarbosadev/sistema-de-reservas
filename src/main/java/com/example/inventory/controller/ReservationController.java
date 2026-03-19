package com.example.inventory.controller;

import com.example.inventory.dto.ReservationRequest;
import com.example.inventory.model.Reservation;
import com.example.inventory.model.ReservationStatus;
import com.example.inventory.service.ReservationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private static final Logger log = LoggerFactory.getLogger(ReservationController.class);

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequest request) {
        log.debug("Received reservation request for tombamentos: {}", request.getTombamentos());
        try {
            Reservation created = reservationService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReservations() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservation(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservationService.findById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable Long id, @Valid @RequestBody ReservationRequest request) {
        try {
            Reservation saved = reservationService.update(id, request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found with id")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            String updatedByName = body.get("statusUpdatedByName");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status é obrigatório."));
            }
            ReservationStatus newStatus = ReservationStatus.valueOf(statusStr);
            Reservation saved = reservationService.updateStatus(id, newStatus, updatedByName);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        try {
            reservationService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Reservation deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/by-tombamento/{tombamento}")
    public ResponseEntity<?> getByTombamento(@PathVariable String tombamento) {
        return ResponseEntity.ok(reservationService.findByTombamento(tombamento));
    }
}
