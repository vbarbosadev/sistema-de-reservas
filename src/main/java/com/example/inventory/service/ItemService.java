package com.example.inventory.service;

import com.example.inventory.model.Item;
import com.example.inventory.repository.ItemRepository;
import com.example.inventory.repository.ReservationRepository;
import org.springframework.stereotype.Service;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ReservationRepository reservationRepository;

    public ItemService(ItemRepository itemRepository, ReservationRepository reservationRepository) {
        this.itemRepository = itemRepository;
        this.reservationRepository = reservationRepository;
    }

    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + id));
    }

    public void deleteById(Long id) {
        Item item = findById(id);
        if (reservationRepository.existsByItemTombamento(item.getTombamento())) {
            throw new IllegalStateException("Cannot delete item that is currently reserved.");
        }
        itemRepository.deleteById(id);
    }

    public Item update(Long id, Item updatedItem) {
        Item existing = findById(id);

        if (!existing.getTombamento().equals(updatedItem.getTombamento())) {
            if (itemRepository.existsByTombamento(updatedItem.getTombamento())) {
                throw new IllegalArgumentException("An item with this tombamento already exists");
            }
        }

        existing.setName(updatedItem.getName());
        existing.setDescription(updatedItem.getDescription());
        existing.setTombamento(updatedItem.getTombamento());
        existing.setStatus(updatedItem.getStatus());
        existing.setReservedDate(updatedItem.getReservedDate());
        if (updatedItem.getState() != null) {
            existing.setState(updatedItem.getState());
        }

        return itemRepository.save(existing);
    }
}
