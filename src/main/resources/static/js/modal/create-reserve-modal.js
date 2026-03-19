document.addEventListener("DOMContentLoaded", () => {
  const reserveModal = document.getElementById("createReserveModal");
  const openReserveModalBtn = document.getElementById("openCreateReserveModal");
  const closeReserveModalBtn = document.getElementById("closeReserveModal");
  const cancelReserveBtn = document.getElementById("cancelReserve");
  const submitReserveBtn = document.getElementById("submitReserve");
  const reserveForm = document.getElementById("createReserveForm");

  // Date step
  const dataInicioInput = document.getElementById("reserveDataInicio");
  const dataFimInput = document.getElementById("reserveDataFim");
  const buscarItensBtn = document.getElementById("buscarItensDisponiveisBtn");
  const reserveDateSection = document.getElementById("reserveDateSection");
  const reserveItemSection = document.getElementById("reserveItemSection");

  // Item step
  const tombamentoInput = document.getElementById("reserveTombamentoInput");
  const tombamentoDropdown = document.getElementById("tombamentoDropdown");
  const reserveItemName = document.getElementById("reserveItemName");
  const addTombamentoBtn = document.getElementById("addTombamentoBtn");
  const selectedTombamentosList = document.getElementById("selectedTombamentosList");
  const responsibleInput = document.getElementById("reserveResponsible");
  const requesterInput = document.getElementById("reserveRequester");
  const requesterEmailInput = document.getElementById("reserveRequesterEmail");
  const solicitacaoLinkInput = document.getElementById("reserveSolicitacaoLink");

  let availableItemsCache = [];
  let selectedReserveItems = [];

  // ── Step 1: load available items for the selected date range ─────────────
  async function loadAvailableItems() {
    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;

    if (!dataInicio) {
      alert("Informe a data de início.");
      return;
    }
    if (!dataFim) {
      alert("Informe a data de fim.");
      return;
    }
    if (dataFim < dataInicio) {
      alert("A data de fim deve ser igual ou posterior à data de início.");
      return;
    }

    try {
      buscarItensBtn.disabled = true;
      buscarItensBtn.textContent = "Buscando...";

      const res = await fetch(`/api/items/available?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      if (!res.ok) throw new Error("Falha ao buscar itens disponíveis");
      availableItemsCache = await res.json();

      reserveItemSection.style.display = "block";
      submitReserveBtn.style.display = "inline-flex";

      if (availableItemsCache.length === 0) {
        tombamentoDropdown.innerHTML = "";
        tombamentoDropdown.style.display = "none";
        const msg = document.createElement("div");
        msg.style.cssText = "color:#64748b;font-size:0.9rem;margin-top:0.5rem;";
        msg.textContent = "Nenhum item disponível para o período selecionado.";
        reserveItemSection.insertBefore(msg, reserveItemSection.firstChild);
      }

      setTimeout(() => tombamentoInput.focus(), 100);
    } catch (err) {
      alert(err.message || "Erro ao buscar itens disponíveis.");
    } finally {
      buscarItensBtn.disabled = false;
      buscarItensBtn.textContent = "Buscar Itens Disponíveis";
    }
  }

  buscarItensBtn.addEventListener("click", loadAvailableItems);

  // ── Typeahead dropdown ────────────────────────────────────────────────────
  function renderDropdown(val) {
    tombamentoDropdown.innerHTML = "";
    val = val.trim().toLowerCase();

    const exactMatch = availableItemsCache.find(i => i.tombamento.toLowerCase() === val);
    reserveItemName.value = exactMatch ? exactMatch.name : "";

    let matches = val
      ? availableItemsCache.filter(i =>
          (i.tombamento && i.tombamento.toLowerCase().includes(val)) ||
          (i.name && i.name.toLowerCase().includes(val))
        )
      : availableItemsCache;

    matches = matches.slice(0, 50);

    if (matches.length > 0) {
      tombamentoDropdown.style.display = "block";
      matches.forEach(item => {
        const div = document.createElement("div");
        div.style.cssText = "padding:0.5rem;cursor:pointer;border-bottom:1px solid #f8fafc;font-size:0.95rem;color:#334155;";
        div.textContent = `${item.tombamento} - ${item.name}`;
        div.addEventListener("mouseenter", () => div.style.backgroundColor = "#f1f5f9");
        div.addEventListener("mouseleave", () => div.style.backgroundColor = "transparent");
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          tombamentoInput.value = item.tombamento;
          reserveItemName.value = item.name;
          tombamentoDropdown.style.display = "none";
        });
        tombamentoDropdown.appendChild(div);
      });
    } else {
      tombamentoDropdown.style.display = "block";
      const div = document.createElement("div");
      div.style.cssText = "padding:0.5rem;color:#64748b;font-size:0.9rem;";
      div.textContent = "Nenhum item encontrado.";
      tombamentoDropdown.appendChild(div);
    }
  }

  tombamentoInput.addEventListener("input", e => renderDropdown(e.target.value));
  tombamentoInput.addEventListener("focus", e => renderDropdown(e.target.value));
  tombamentoInput.addEventListener("blur", () => setTimeout(() => { tombamentoDropdown.style.display = "none"; }, 200));
  document.addEventListener("click", e => {
    if (!tombamentoInput.contains(e.target) && !tombamentoDropdown.contains(e.target)) {
      tombamentoDropdown.style.display = "none";
    }
  });

  // ── Add item to list ──────────────────────────────────────────────────────
  addTombamentoBtn.addEventListener("click", () => {
    let tombamento = tombamentoInput.value.trim();
    let itemName = reserveItemName.value.trim();

    if (!tombamento) {
      alert("Informe um tombamento.");
      return;
    }

    if (!itemName) {
      const exact = availableItemsCache.find(i => i.tombamento.toLowerCase() === tombamento.toLowerCase());
      if (exact) {
        tombamento = exact.tombamento;
        itemName = exact.name;
      } else {
        alert("Tombamento inválido. Selecione um item disponível na lista.");
        return;
      }
    }

    if (selectedReserveItems.some(i => i.tombamento === tombamento)) {
      alert("Item já adicionado à lista.");
      return;
    }

    selectedReserveItems.push({ tombamento, name: itemName });
    renderSelectedItems();
    tombamentoInput.value = "";
    reserveItemName.value = "";
    tombamentoInput.focus();
  });

  function renderSelectedItems() {
    selectedTombamentosList.innerHTML = "";
    selectedReserveItems.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.cssText = "display:flex;justify-content:space-between;align-items:center;background:white;padding:0.35rem 0.5rem;border:1px solid #e2e8f0;border-radius:4px;font-size:0.9rem;";
      const span = document.createElement("span");
      span.textContent = `${item.tombamento} - ${item.name}`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remover";
      removeBtn.style.cssText = "color:#ef4444;background:transparent;border:none;cursor:pointer;font-size:0.8rem;padding:0 0.5rem;";
      removeBtn.addEventListener("click", () => {
        selectedReserveItems.splice(index, 1);
        renderSelectedItems();
      });
      li.appendChild(span);
      li.appendChild(removeBtn);
      selectedTombamentosList.appendChild(li);
    });
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function openReserveModal() {
    reserveModal.classList.add("active");
    resetModal();
    // Pre-fill responsible from logged-in user
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (currentUser && responsibleInput) {
      responsibleInput.value = currentUser;
    }
    setTimeout(() => dataInicioInput.focus(), 100);
  }

  function closeReserveModal() {
    reserveModal.classList.remove("active");
    resetModal();
  }

  function resetModal() {
    reserveForm.reset();
    selectedReserveItems = [];
    availableItemsCache = [];
    renderSelectedItems();
    reserveItemSection.style.display = "none";
    submitReserveBtn.style.display = "none";
    resetValidation();
    const successEl = reserveModal.querySelector(".success-checkmark");
    if (successEl) successEl.style.display = "none";
    reserveForm.style.display = "block";
    const errContainer = reserveModal.querySelector(".error-container");
    if (errContainer) errContainer.remove();
    // Clear any "no items available" message
    const noItemsMsg = reserveItemSection.querySelector("[data-no-items]");
    if (noItemsMsg) noItemsMsg.remove();
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validateForm() {
    let isValid = true;
    resetValidation();

    if (!dataInicioInput.value) {
      setFieldError(dataInicioInput, "Data de início é obrigatória");
      isValid = false;
    }
    if (!dataFimInput.value) {
      setFieldError(dataFimInput, "Data de fim é obrigatória");
      isValid = false;
    }
    if (dataFimInput.value && dataInicioInput.value && dataFimInput.value < dataInicioInput.value) {
      setFieldError(dataFimInput, "A data de fim deve ser igual ou posterior à data de início");
      isValid = false;
    }
    if (selectedReserveItems.length === 0) {
      setFieldError(tombamentoInput, "Pelo menos um item é obrigatório");
      isValid = false;
    }
    if (!responsibleInput.value.trim()) {
      setFieldError(responsibleInput, "Responsável é obrigatório");
      isValid = false;
    }
    if (!requesterInput.value.trim()) {
      setFieldError(requesterInput, "Solicitante é obrigatório");
      isValid = false;
    }
    return isValid;
  }

  function setFieldError(input, message) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;
    formGroup.classList.add("error");
    const errorDiv = formGroup.querySelector(".form-error");
    if (errorDiv) errorDiv.textContent = message;
  }

  function resetValidation() {
    reserveForm.querySelectorAll(".form-group.error").forEach(g => g.classList.remove("error"));
    const errContainer = reserveModal.querySelector(".error-container");
    if (errContainer) errContainer.remove();
  }

  function setGlobalError(message) {
    const existing = reserveModal.querySelector(".error-container");
    if (existing) existing.remove();
    const container = document.createElement("div");
    container.className = "error-container";
    container.style.cssText = "color:#e11d48;padding:10px;margin-bottom:15px;background:#ffe4e6;border-radius:8px;font-weight:500;font-size:0.95rem;";
    container.textContent = message;
    reserveForm.insertBefore(container, reserveForm.firstChild);
  }

  openReserveModalBtn.addEventListener("click", openReserveModal);
  closeReserveModalBtn.addEventListener("click", closeReserveModal);
  cancelReserveBtn.addEventListener("click", closeReserveModal);
  reserveModal.addEventListener("click", e => { if (e.target === reserveModal) closeReserveModal(); });

  // ── Submit ────────────────────────────────────────────────────────────────
  submitReserveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      submitReserveBtn.classList.add("btn-loading");

      const payload = {
        tombamentos: selectedReserveItems.map(i => i.tombamento),
        responsible: responsibleInput.value.trim(),
        requester: requesterInput.value.trim(),
        requesterEmail: requesterEmailInput ? requesterEmailInput.value.trim() : "",
        solicitacaoLink: solicitacaoLinkInput ? solicitacaoLinkInput.value.trim() : "",
        dataInicio: dataInicioInput.value,
        dataFim: dataFimInput.value
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar reserva");
      }

      reserveForm.style.display = "none";
      const successEl = reserveModal.querySelector(".success-checkmark");
      if (successEl) successEl.style.display = "block";

      setTimeout(() => { closeReserveModal(); window.location.reload(); }, 1500);

    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      setGlobalError(error.message || "Ocorreu um erro. Tente novamente.");
      submitReserveBtn.classList.remove("btn-loading");
    }
  });
});
