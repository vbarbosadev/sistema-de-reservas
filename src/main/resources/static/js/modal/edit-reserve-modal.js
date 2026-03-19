document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("editReserveModal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeEditReserveModal");
  const cancelBtn = document.getElementById("cancelEditReserve");
  const submitBtn = document.getElementById("submitEditReserve");
  const form = document.getElementById("editReserveForm");

  const tombamentoInput = document.getElementById("editResTombamentoInput");
  const tombamentoDropdown = document.getElementById("editResTombamentoDropdown");
  const itemNamePreview = document.getElementById("editResItemName");
  const addBtn = document.getElementById("editResAddTombamentoBtn");
  const selectedItemsList = document.getElementById("editResSelectedItemsList");

  const responsibleInput = document.getElementById("editResResponsible");
  const requesterInput = document.getElementById("editResRequester");
  const requesterEmailInput = document.getElementById("editResRequesterEmail");
  const solicitacaoLinkInput = document.getElementById("editResSolicitacaoLink");
  const dataInicioInput = document.getElementById("editResDataInicio");
  const dataFimInput = document.getElementById("editResDataFim");
  const reserveIdInput = document.getElementById("editResModalReserveId");

  let itemsCache = [];
  let selectedItems = []; // { tombamento, name }
  let currentReserveId = null;

  // ── Load all items for typeahead (existing items in this reservation bypass availability) ──
  async function loadItemsCache() {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Falha ao buscar itens");
      itemsCache = await res.json();
    } catch (err) {
      console.error("editReserveModal: falha ao carregar itens", err);
    }
  }

  // ── Typeahead dropdown ────────────────────────────────────────────────────
  function renderDropdown(val) {
    tombamentoDropdown.innerHTML = "";
    val = val.trim().toLowerCase();

    const exactMatch = itemsCache.find(i => i.tombamento.toLowerCase() === val);
    itemNamePreview.value = exactMatch ? exactMatch.name : "";

    let matches = val
      ? itemsCache.filter(i =>
          (i.tombamento && i.tombamento.toLowerCase().includes(val)) ||
          (i.name && i.name.toLowerCase().includes(val))
        )
      : itemsCache;

    matches = matches.slice(0, 50);

    if (matches.length > 0) {
      tombamentoDropdown.style.display = "block";
      matches.forEach(item => {
        const div = document.createElement("div");
        div.style.cssText = "padding:0.5rem;cursor:pointer;border-bottom:1px solid #f8fafc;font-size:0.95rem;color:#334155;";
        div.textContent = `${item.tombamento} - ${item.name}`;
        div.addEventListener("mouseenter", () => (div.style.backgroundColor = "#f1f5f9"));
        div.addEventListener("mouseleave", () => (div.style.backgroundColor = "transparent"));
        div.addEventListener("mousedown", e => {
          e.preventDefault();
          tombamentoInput.value = item.tombamento;
          itemNamePreview.value = item.name;
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
  tombamentoInput.addEventListener("blur", () => setTimeout(() => (tombamentoDropdown.style.display = "none"), 200));
  document.addEventListener("click", e => {
    if (!tombamentoInput.contains(e.target) && !tombamentoDropdown.contains(e.target)) {
      tombamentoDropdown.style.display = "none";
    }
  });

  // ── Add item ──────────────────────────────────────────────────────────────
  addBtn.addEventListener("click", () => {
    let tombamento = tombamentoInput.value.trim();
    let name = itemNamePreview.value.trim();

    if (!tombamento) {
      alert("Informe um tombamento.");
      return;
    }

    if (!name) {
      const exact = itemsCache.find(i => i.tombamento.toLowerCase() === tombamento.toLowerCase());
      if (exact) {
        tombamento = exact.tombamento;
        name = exact.name;
      } else {
        alert("Tombamento inválido. Selecione um item da lista.");
        return;
      }
    }

    if (selectedItems.some(i => i.tombamento === tombamento)) {
      alert("Item já adicionado.");
      return;
    }

    selectedItems.push({ tombamento, name });
    renderSelectedItems();
    tombamentoInput.value = "";
    itemNamePreview.value = "";
    tombamentoInput.focus();
  });

  // ── Render selected items list ────────────────────────────────────────────
  function renderSelectedItems() {
    selectedItemsList.innerHTML = "";
    selectedItems.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.cssText = "display:flex;justify-content:space-between;align-items:center;background:white;padding:0.35rem 0.5rem;border:1px solid #e2e8f0;border-radius:4px;font-size:0.9rem;";
      const span = document.createElement("span");
      span.textContent = `${item.tombamento} - ${item.name}`;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "Remover";
      removeBtn.style.cssText = "color:#ef4444;background:transparent;border:none;cursor:pointer;font-size:0.8rem;padding:0 0.5rem;";
      removeBtn.addEventListener("click", () => {
        selectedItems.splice(index, 1);
        renderSelectedItems();
      });
      li.appendChild(span);
      li.appendChild(removeBtn);
      selectedItemsList.appendChild(li);
    });
  }

  // ── Open / close ──────────────────────────────────────────────────────────
  function openModal() {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => modal.classList.add("active"), 10);
  }

  function closeModal() {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
    form.reset();
    selectedItems = [];
    renderSelectedItems();
    clearErrors();
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  // ── Global entry point called by reserves.js ──────────────────────────────
  window.openEditReserveModal = async function (id) {
    currentReserveId = id;
    reserveIdInput.value = id;
    clearErrors();
    itemNamePreview.value = "";
    tombamentoInput.value = "";

    await loadItemsCache();

    try {
      const res = await fetch(`/api/reservations/${id}`);
      if (!res.ok) throw new Error("Falha ao buscar reserva");
      const reserve = await res.json();

      // Responsible: always the logged-in user
      const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
      responsibleInput.value = currentUser || reserve.responsible || "";
      // Requester: editable, pre-filled with saved value
      requesterInput.value = reserve.requester || "";
      if (requesterEmailInput) requesterEmailInput.value = reserve.requesterEmail || "";
      if (solicitacaoLinkInput) solicitacaoLinkInput.value = reserve.solicitacaoLink || "";
      dataInicioInput.value = reserve.dataInicio ? reserve.dataInicio.substring(0, 10) : "";
      dataFimInput.value = reserve.dataFim ? reserve.dataFim.substring(0, 10) : "";

      selectedItems = (reserve.items || []).map(i => ({
        tombamento: i.tombamento,
        name: i.name || i.tombamento,
      }));
      renderSelectedItems();

      openModal();
    } catch (err) {
      console.error("openEditReserveModal error:", err);
      alert("Falha ao carregar dados da reserva.");
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    let valid = true;
    clearErrors();

    if (!responsibleInput.value.trim()) {
      showFieldError(responsibleInput, "Responsável é obrigatório");
      valid = false;
    }
    if (!requesterInput.value.trim()) {
      showFieldError(requesterInput, "Solicitante é obrigatório");
      valid = false;
    }
    if (!dataInicioInput.value) {
      showFieldError(dataInicioInput, "Data de início é obrigatória");
      valid = false;
    }
    if (!dataFimInput.value) {
      showFieldError(dataFimInput, "Data de fim é obrigatória");
      valid = false;
    }
    if (dataInicioInput.value && dataFimInput.value && dataFimInput.value < dataInicioInput.value) {
      showFieldError(dataFimInput, "A data de fim deve ser igual ou posterior à data de início");
      valid = false;
    }
    if (selectedItems.length === 0) {
      showFieldError(document.getElementById("editResSelectedTombamentosContainer"), "Pelo menos um item é obrigatório");
      valid = false;
    }
    return valid;
  }

  function showFieldError(el, msg) {
    const group = el.closest(".form-group");
    if (!group) return;
    group.classList.add("error");
    const errDiv = group.querySelector(".form-error");
    if (errDiv) errDiv.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll(".form-group.error").forEach(g => g.classList.remove("error"));
    const existing = modal.querySelector(".edit-reserve-global-error");
    if (existing) existing.remove();
  }

  function showGlobalError(message) {
    const existing = modal.querySelector(".edit-reserve-global-error");
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = "edit-reserve-global-error";
    div.style.cssText = "color:#e11d48;padding:10px;margin-bottom:15px;background:#ffe4e6;border-radius:8px;font-weight:500;font-size:0.95rem;";
    div.textContent = message;
    form.insertBefore(div, form.firstChild);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn.addEventListener("click", async () => {
    if (!validate()) return;

    const id = reserveIdInput.value;
    const payload = {
      tombamentos: selectedItems.map(i => i.tombamento),
      responsible: responsibleInput.value.trim(),
      requester: requesterInput.value.trim(),
      requesterEmail: requesterEmailInput ? requesterEmailInput.value.trim() : "",
      solicitacaoLink: solicitacaoLinkInput ? solicitacaoLinkInput.value.trim() : "",
      dataInicio: dataInicioInput.value,
      dataFim: dataFimInput.value,
    };

    submitBtn.disabled = true;
    submitBtn.classList.add("btn-loading");

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Falha ao atualizar reserva");
      }

      const updated = await res.json();
      updateReserveTableRow(id, updated);
      closeModal();
    } catch (err) {
      console.error("editReserveModal submit error:", err);
      showGlobalError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("btn-loading");
    }
  });

  // ── Update the table row in-place after save ──────────────────────────────
  function updateReserveTableRow(id, reserve) {
    const editBtn = document.querySelector(`.open-edit-reserve-btn[data-id="${id}"]`);
    if (!editBtn) return;
    const row = editBtn.closest("tr");
    if (!row) return;

    const cells = row.querySelectorAll("td");
    // cells[0]=ID, [1]=tombamentos, [2]=responsible, [3]=requester,
    // [4]=dataInicio, [5]=dataFim, [6]=status, [7]=solicitacao, [8]=acoes
    if (cells.length < 6) return;

    const itemsStr = (reserve.items || []).map(i => i.tombamento).join(", ");
    const fmtDate = (d) => d ? d.substring(0, 10).split("-").reverse().join("/") : "";

    cells[1].textContent = itemsStr;
    cells[2].textContent = reserve.responsible || "";
    cells[3].textContent = reserve.requester || "";
    cells[4].textContent = fmtDate(reserve.dataInicio);
    cells[5].textContent = fmtDate(reserve.dataFim);

    // Update solicitação link cell
    if (cells[7]) {
      const link = reserve.solicitacaoLink;
      if (link) {
        const href = link.startsWith("http") ? link : "https://" + link;
        cells[7].innerHTML = `<a href="${href}" target="_blank" rel="noopener noreferrer" title="Ver e-mail de solicitação" style="display:inline-flex;align-items:center;gap:0.3rem;color:#3b82f6;text-decoration:none;font-size:0.85rem;font-weight:500;padding:0.25rem 0.5rem;border-radius:4px;background:#eff6ff;border:1px solid #bfdbfe;"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='4' width='20' height='16' rx='2'/><polyline points='2,4 12,13 22,4'/></svg>Ver</a>`;
      } else {
        cells[7].innerHTML = `<span style="color:#94a3b8;font-size:0.85rem;">—</span>`;
      }
    }

    row.setAttribute("data-tombamentos", itemsStr);
    row.setAttribute("data-responsible", reserve.responsible || "");
    row.setAttribute("data-requester", reserve.requester || "");
    row.setAttribute("data-date-inicio", reserve.dataInicio || "");
    row.setAttribute("data-date-fim", reserve.dataFim || "");
  }
});
