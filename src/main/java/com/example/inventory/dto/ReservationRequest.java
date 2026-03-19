package com.example.inventory.dto;

import com.example.inventory.model.ReservationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class ReservationRequest {

    @NotEmpty(message = "At least one item is required")
    private List<String> tombamentos;

    @NotBlank(message = "Responsible person is required")
    private String responsible;

    @NotBlank(message = "Requester person is required")
    private String requester;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;

    @NotNull(message = "Data de fim é obrigatória")
    private LocalDate dataFim;

    private String requesterEmail;

    private String solicitacaoLink;

    private ReservationStatus status;

    private String statusUpdatedByName;

    // Getters and Setters

    public List<String> getTombamentos() {
        return tombamentos;
    }

    public void setTombamentos(List<String> tombamentos) {
        this.tombamentos = tombamentos;
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
}
