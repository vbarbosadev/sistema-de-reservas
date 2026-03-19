document.addEventListener("DOMContentLoaded", () => {
  const popover = document.getElementById("statusPopover");
  if (!popover) return;

  const select = document.getElementById("statusPopoverSelect");
  const nameInput = document.getElementById("statusPopoverName");
  const saveBtn = document.getElementById("statusPopoverSave");
  const cancelBtn = document.getElementById("statusPopoverCancel");
  const errorDiv = document.getElementById("statusPopoverError");

  let currentBadge = null;
  let currentId = null;

  const STATUS_LABELS = {
    AGUARDANDO_ACAUTELAMENTO: "Aguardando Acautelamento",
    LIBERADO: "Liberado",
    RETIRADO: "Retirado",
    DEVOLVIDO: "Devolvido",
    CANCELADO: "Cancelado",
  };

  // ── Open popover when clicking a status badge ─────────────────────────────
  document.addEventListener("click", (e) => {
    const badge = e.target.closest(".status-clickable");
    if (badge) {
      e.stopPropagation();
      openPopover(badge);
      return;
    }
    // Click outside → close
    if (!popover.contains(e.target)) {
      closePopover();
    }
  });

  function openPopover(badge) {
    currentBadge = badge;
    currentId = badge.getAttribute("data-id");
    const currentStatus = badge.getAttribute("data-status");

    select.value = currentStatus || "AGUARDANDO_ACAUTELAMENTO";
    // Auto-fill logged-in user
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    nameInput.value = currentUser || "";
    nameInput.readOnly = !!currentUser;
    nameInput.style.background = currentUser ? "#f8fafc" : "";
    nameInput.style.cursor = currentUser ? "not-allowed" : "";
    errorDiv.style.display = "none";
    errorDiv.textContent = "";

    // Position below the badge
    const rect = badge.getBoundingClientRect();
    const popoverWidth = 240;
    let left = rect.left + window.scrollX;
    // Prevent going off the right edge of the viewport
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }

    popover.style.top = (rect.bottom + window.scrollY + 4) + "px";
    popover.style.left = left + "px";
    popover.style.display = "block";
    setTimeout(() => nameInput.focus(), 50);
  }

  function closePopover() {
    popover.style.display = "none";
    currentBadge = null;
    currentId = null;
  }

  cancelBtn.addEventListener("click", closePopover);

  // ── Save ──────────────────────────────────────────────────────────────────
  saveBtn.addEventListener("click", async () => {
    const newStatus = select.value;
    const updatedByName = nameInput.value.trim();

    if (!updatedByName) {
      errorDiv.textContent = "Informe o nome de quem está atualizando.";
      errorDiv.style.display = "block";
      nameInput.focus();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Salvando...";
    errorDiv.style.display = "none";

    try {
      const res = await fetch(`/api/reservations/${currentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, statusUpdatedByName: updatedByName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao atualizar status.");
      }

      // Update badge in table
      if (currentBadge) {
        currentBadge.textContent = newStatus;
        currentBadge.setAttribute("data-status", newStatus);
        // Update badge colour class if any
        currentBadge.className = currentBadge.className
          .replace(/\bstatus-\S+/g, "")
          .trim();
        currentBadge.classList.add("status-badge", "status-clickable", `status-${newStatus.toLowerCase()}`);
      }

      closePopover();
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = "block";
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Salvar";
    }
  });

  // Allow pressing Enter inside the name input to save
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    if (e.key === "Escape") closePopover();
  });
});
