console.log("edit-item-modal.js loaded");
document.addEventListener("DOMContentLoaded", () => {
  console.log("edit-item-modal.js DOMContentLoaded");
  const modal = document.getElementById("editSingleItemModal");
  console.log("editSingleItemModal element:", modal);
  if (!modal) {
    console.error("editSingleItemModal NOT FOUND");
    return;
  }

  const closeBtn = document.getElementById("closeEditSingleItemModal");
  const cancelBtn = document.getElementById("cancelEditSingleItem");
  const submitBtn = document.getElementById("submitEditSingleItem");
  const form = document.getElementById("editSingleItemForm");

  const nameInput = document.getElementById("editSingleItemName");
  const tombamentoInput = document.getElementById("editSingleItemTombamento");
  const descriptionInput = document.getElementById("editSingleItemDescription");
  const statusInput = document.getElementById("editSingleItemStatus");
  const reservedDateInput = document.getElementById("editSingleItemReservedDate");
  const itemIdInput = document.getElementById("editSingleItemModalItemId");

  // ─── open/close ───────────────────────────────────────────────────────────
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
    clearErrors();
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  // ─── Global entry point called by index.html button ──────────────────────
  window.openEditItemModal = async function (id) {
    itemIdInput.value = id;
    clearErrors();

    try {
      const res = await fetch(`/api/items/${id}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      const item = await res.json();

      nameInput.value = item.name || "";
      tombamentoInput.value = item.tombamento || "";
      descriptionInput.value = item.description || "";
      // Map backend state+status to a single display value
      if (item.state === "BROKEN") statusInput.value = "BROKEN";
      else if (item.status === "LOANED") statusInput.value = "IN_USE";
      else if (item.state === "MAINTENANCE") statusInput.value = "MAINTENANCE";
      else statusInput.value = "AVAILABLE";
      reservedDateInput.value = item.reservedDate || "";

      openModal();
    } catch (err) {
      console.error("openEditItemModal error:", err);
      alert("Failed to load item data.");
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  function validate() {
    let valid = true;
    clearErrors();

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, "Name is required");
      valid = false;
    }
    if (!tombamentoInput.value.trim()) {
      showFieldError(tombamentoInput, "Tombamento is required");
      valid = false;
    }
    if (!statusInput.value.trim()) {
      showFieldError(statusInput, "Status is required");
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
    form.querySelectorAll(".form-group.error").forEach((g) => g.classList.remove("error"));
    const existing = modal.querySelector(".edit-item-global-error");
    if (existing) existing.remove();
  }

  function showGlobalError(message) {
    const existing = modal.querySelector(".edit-item-global-error");
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = "edit-item-global-error";
    div.style.cssText =
      "color:#e11d48;padding:10px;margin-bottom:15px;background:#ffe4e6;border-radius:8px;font-weight:500;font-size:0.95rem;";
    div.textContent = message;
    form.insertBefore(div, form.firstChild);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  submitBtn.addEventListener("click", async () => {
    if (!validate()) return;

    const id = itemIdInput.value;
    // Map display value back to ItemStatus + ItemState
    const displayVal = statusInput.value;
    let itemStatus, itemState;
    if (displayVal === "IN_USE") {
      itemStatus = "LOANED";
      itemState = "AVAILABLE";
    } else if (displayVal === "BROKEN") {
      itemStatus = "ON_ROOM";
      itemState = "BROKEN";
    } else if (displayVal === "MAINTENANCE") {
      itemStatus = "ON_ROOM";
      itemState = "MAINTENANCE";
    } else {
      // AVAILABLE
      itemStatus = "ON_ROOM";
      itemState = "AVAILABLE";
    }

    const payload = {
      name: nameInput.value.trim(),
      tombamento: tombamentoInput.value.trim(),
      description: descriptionInput.value.trim(),
      status: itemStatus,
      state: itemState,
      reservedDate: reservedDateInput.value || null
    };

    submitBtn.disabled = true;
    submitBtn.classList.add("btn-loading");

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to update item");
      }

      const updated = await res.json();
      updateItemCardUI(id, updated);
      closeModal();
    } catch (err) {
      console.error("editItemModal submit error:", err);
      showGlobalError(err.message || "An error occurred. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("btn-loading");
    }
  });

  // ─── Update the item card in-place after save ────────────────────────────
  function updateItemCardUI(id, item) {
    const editBtn = document.querySelector(`.edit-item-btn[data-id="${id}"]`);
    if (!editBtn) return;
    const card = editBtn.closest(".item-card");
    if (!card) return;

    card.querySelector("h3").textContent = item.name;
    const descriptions = card.querySelectorAll(".description");
    if (descriptions.length >= 1) descriptions[0].textContent = item.description || "";
    if (descriptions.length >= 2) descriptions[1].textContent = item.tombamento || "";

    card.setAttribute("data-status", item.status);
    if (item.state) card.setAttribute("data-state", item.state);
    card.setAttribute("data-tombamento", item.tombamento);

    const badge = card.querySelector(".status-badge");
    if (badge) {
      badge.className = "status-badge";
      const state = item.state || "";
      const status = item.status || "";
      if (state === "BROKEN") {
        badge.classList.add("badge-broken");
        badge.textContent = "QUEBRADO";
      } else if (status === "LOANED") {
        badge.classList.add("badge-in-use");
        badge.textContent = "EM USO";
      } else if (state === "MAINTENANCE") {
        badge.classList.add("badge-maintenance");
        badge.textContent = "EM MANUTENÇÃO";
      } else if (status === "ON_ROOM") {
        badge.classList.add("badge-available");
        badge.textContent = "DISPONÍVEL";
      }
    }
  }
});
