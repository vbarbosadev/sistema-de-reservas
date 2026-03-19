package com.example.inventory.dto;

import com.example.inventory.model.ItemState;
import com.example.inventory.model.ItemStatus;
import java.time.LocalDate;

/**
 * Data Transfer Object for Item operations
 */
public class ItemDTO {
    private String name;
    private String description;
    private String tombamento;
    private ItemStatus status;
    private ItemState state;
    private LocalDate reservedDate;

    // Default constructor
    public ItemDTO() {
    }

    // Constructor with all fields
    public ItemDTO(String name, String description, String tombamento, ItemStatus status, ItemState state, LocalDate reservedDate) {
        this.name = name;
        this.description = description;
        this.tombamento = tombamento;
        this.status = status;
        this.state = state;
        this.reservedDate = reservedDate;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTombamento() {
        return tombamento;
    }

    public void setTombamento(String tombamento) {
        this.tombamento = tombamento;
    }

    public ItemStatus getStatus() {
        return status;
    }

    public void setStatus(ItemStatus status) {
        this.status = status;
    }

    public ItemState getState() {
        return state;
    }

    public void setState(ItemState state) {
        this.state = state;
    }

    public LocalDate getReservedDate() {
        return reservedDate;
    }

    public void setReservedDate(LocalDate reservedDate) {
        this.reservedDate = reservedDate;
    }
}