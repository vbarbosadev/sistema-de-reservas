package com.example.inventory.service;

import com.example.inventory.dto.ReservationRequest;
import com.example.inventory.model.Item;
import com.example.inventory.model.ItemStatus;
import com.example.inventory.model.ItemState;
import com.example.inventory.model.Reservation;
import com.example.inventory.model.ReservationStatus;
import com.example.inventory.repository.ItemRepository;
import com.example.inventory.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final ItemRepository itemRepository;

    public ReservationService(ReservationRepository reservationRepository, ItemRepository itemRepository) {
        this.reservationRepository = reservationRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Creates a reservation based on the request.
     */

    public Reservation create(ReservationRequest request) {
        List<Item> items = itemRepository.findAllByTombamentoIn(request.getTombamentos());

        if (items.isEmpty() || items.size() != request.getTombamentos().size()) {
            throw new IllegalArgumentException("Um ou mais itens não foram encontrados.");
        }

        for (Item item : items) {
            if (item.getState() != ItemState.AVAILABLE) {
                throw new IllegalArgumentException(
                        "Item com tombamento " + item.getTombamento() + " não está disponível (estado: " + item.getState() + ").");
            }
            if (reservationRepository.hasConflict(item.getTombamento(), request.getDataInicio(), request.getDataFim(), 0L)) {
                throw new IllegalArgumentException(
                        "Item com tombamento " + item.getTombamento() + " já está reservado no período informado.");
            }
        }

        log.debug("Items found for reservation: {}", items.stream().map(Item::getName).toList());

        Reservation reservation = new Reservation();
        reservation.setItems(items);
        reservation.setResponsible(request.getResponsible());
        reservation.setRequester(request.getRequester());
        reservation.setDataInicio(request.getDataInicio());
        reservation.setDataFim(request.getDataFim());
        reservation.setRequesterEmail(request.getRequesterEmail());
        reservation.setSolicitacaoLink(request.getSolicitacaoLink());

        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        } else {
            reservation.setStatus(ReservationStatus.AGUARDANDO_ACAUTELAMENTO);
        }
        if (request.getStatusUpdatedByName() != null) {
            reservation.setStatusUpdatedByName(request.getStatusUpdatedByName());
        }

        syncItemStatuses(items, reservation.getStatus());

        return reservationRepository.save(reservation);
    }

    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    public void deleteById(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new IllegalArgumentException("Reservation not found with id: " + id);
        }
        reservationRepository.deleteById(id);
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with id: " + id));
    }

    public List<Reservation> findByTombamento(String tombamento) {
        return reservationRepository.findAllByItemTombamento(tombamento);
    }

    public Reservation update(Long id, ReservationRequest request) {
        Reservation existing = findById(id);

        List<Item> currentItems = existing.getItems();
        List<Item> newItems = itemRepository.findAllByTombamentoIn(request.getTombamentos());

        if (newItems.isEmpty() || newItems.size() != request.getTombamentos().size()) {
            throw new IllegalArgumentException("Um ou mais itens não foram encontrados.");
        }

        for (Item item : newItems) {
            if (!currentItems.contains(item)) {
                if (item.getState() != ItemState.AVAILABLE) {
                    throw new IllegalArgumentException(
                            "Item com tombamento " + item.getTombamento() + " não está disponível (estado: " + item.getState() + ").");
                }
                if (reservationRepository.hasConflict(item.getTombamento(), request.getDataInicio(), request.getDataFim(), id)) {
                    throw new IllegalArgumentException(
                            "Item com tombamento " + item.getTombamento() + " já está reservado no período informado.");
                }
            }
        }

        for (Item item : currentItems) {
            if (!newItems.contains(item)) {
                item.setState(ItemState.AVAILABLE);
                item.setStatus(ItemStatus.ON_ROOM);
                itemRepository.save(item);
            }
        }

        existing.setItems(newItems);
        existing.setResponsible(request.getResponsible());
        existing.setRequester(request.getRequester());
        existing.setDataInicio(request.getDataInicio());
        existing.setDataFim(request.getDataFim());
        if (request.getRequesterEmail() != null) {
            existing.setRequesterEmail(request.getRequesterEmail());
        }
        if (request.getSolicitacaoLink() != null) {
            existing.setSolicitacaoLink(request.getSolicitacaoLink());
        }

        if (request.getStatus() != null && existing.getStatus() != request.getStatus()) {
            if (request.getStatusUpdatedByName() == null || request.getStatusUpdatedByName().trim().isEmpty()) {
                throw new IllegalArgumentException("Status updater name is required when changing status.");
            }
            existing.setStatus(request.getStatus());
            existing.setStatusUpdatedByName(request.getStatusUpdatedByName());
        } else if (request.getStatusUpdatedByName() != null) {
            existing.setStatusUpdatedByName(request.getStatusUpdatedByName());
        }

        syncItemStatuses(newItems, existing.getStatus());

        return reservationRepository.save(existing);
    }

    public Reservation updateStatus(Long id, ReservationStatus newStatus, String updatedByName) {
        if (updatedByName == null || updatedByName.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome de quem atualizou o status é obrigatório.");
        }
        Reservation reservation = findById(id);
        reservation.setStatus(newStatus);
        reservation.setStatusUpdatedByName(updatedByName.trim());
        syncItemStatuses(reservation.getItems(), newStatus);
        return reservationRepository.save(reservation);
    }

    private void syncItemStatuses(List<Item> items, ReservationStatus resStatus) {
        ItemStatus targetStatus = (resStatus == ReservationStatus.DEVOLVIDO || resStatus == ReservationStatus.CANCELADO)
                ? ItemStatus.ON_ROOM
                : ItemStatus.LOANED;

        for (Item item : items) {
            if (item.getStatus() != targetStatus) {
                item.setStatus(targetStatus);
                itemRepository.save(item);
            }
        }
    }
}
