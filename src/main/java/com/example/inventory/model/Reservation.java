package com.example.inventory.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "At least one item is required")
    @ManyToMany
    @JoinTable(name = "reserve_items", joinColumns = @JoinColumn(name = "reservation_id"), inverseJoinColumns = @JoinColumn(name = "item_id"))
    private List<Item> items = new ArrayList<>();

    @NotBlank(message = "Responsible person is required")
    @Column(nullable = false)
    private String responsible;

    @NotBlank(message = "Requester person is required")
    @Column(nullable = false)
    private String requester;

    @NotNull(message = "Data de início é obrigatória")
    @Column(nullable = false)
    private LocalDate dataInicio;

    @NotNull(message = "Data de fim é obrigatória")
    @Column(nullable = false)
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.AGUARDANDO_ACAUTELAMENTO;

    @Column(name = "status_updated_by_name")
    private String statusUpdatedByName;

    @Column(name = "requester_email")
    private String requesterEmail;

    @Column(name = "solicitacao_link")
    private String solicitacaoLink;

    public Reservation() {
    }

    public Reservation(List<Item> items, String responsible, String requester, LocalDate dataInicio, LocalDate dataFim) {
        this.items = items;
        this.responsible = responsible;
        this.requester = requester;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public String getResponsible() {
        return responsible;
    }

    public void setResponsible(String responsible) {
        this.responsible = responsible;
    }

    public String getRequester() {
        return requester;
    }

    public void setRequester(String requester) {
        this.requester = requester;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getStatusUpdatedByName() {
        return statusUpdatedByName;
    }

    public void setStatusUpdatedByName(String statusUpdatedByName) {
        this.statusUpdatedByName = statusUpdatedByName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getSolicitacaoLink() {
        return solicitacaoLink;
    }

    public void setSolicitacaoLink(String solicitacaoLink) {
        this.solicitacaoLink = solicitacaoLink;
    }
}
