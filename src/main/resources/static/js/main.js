console.log("main.js loading...");
document.addEventListener("DOMContentLoaded", async () => {
  console.log("main.js DOMContentLoaded fired");
  const searchInput = document.getElementById("searchInput");
  const filterChips = document.querySelectorAll(".chip");
  const itemCards = document.querySelectorAll(".item-card");

  let currentSearchTerm = "";
  let currentFilter = "all";

  function filterItems() {
    itemCards.forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      const description = card
        .querySelector(".description")
        .textContent.toLowerCase();
      const status = card.getAttribute("data-status");

      const matchesSearch =
        name.includes(currentSearchTerm) ||
        description.includes(currentSearchTerm);
      const matchesFilter = currentFilter === "all" || status === currentFilter;

      if (matchesSearch && matchesFilter) {
        card.style.display = "flex";
        card.style.opacity = "0";
        setTimeout(() => (card.style.opacity = "1"), 50);
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.toLowerCase();
      filterItems();
    });
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.getAttribute("data-filter");
      filterItems();
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("delete-item-btn") || target.closest(".delete-item-btn")) {
      const btn = target.classList.contains("delete-item-btn") ? target : target.closest(".delete-item-btn");
      const id = btn.getAttribute("data-id");
      if (confirm(`Deseja realmente excluir o item #${id}?`)) {
        fetch(`/api/items/${id}`, { method: "DELETE" })
          .then(async (response) => {
            if (!response.ok) {
              const errorObj = await response.json();
              throw new Error(errorObj.message || "Falha ao excluir item");
            }
            btn.closest(".item-card").remove();
          })
          .catch((error) => {
            console.error("Erro ao excluir item:", error);
            alert(error.message);
          });
      }
    } else if (target.classList.contains("edit-item-btn") || target.closest(".edit-item-btn")) {
      const btn = target.classList.contains("edit-item-btn") ? target : target.closest(".edit-item-btn");
      const id = btn.getAttribute("data-id");
      if (window.openEditItemModal) {
        window.openEditItemModal(id);
      } else {
        alert("Erro: Carregamento do modal de edição falhou.");
      }
    } else if (target.classList.contains("view-item-btn") || target.closest(".view-item-btn")) {
      const btn = target.classList.contains("view-item-btn") ? target : target.closest(".view-item-btn");
      const id = btn.getAttribute("data-id");
      if (window.openItemDetailsModal) {
        window.openItemDetailsModal(id);
      }
    }
  });

  // ── Load reservations and populate item cards ─────────────────────────────
  await loadReservationsForCards();
});

async function loadReservationsForCards() {
  const today = new Date().toISOString().slice(0, 10);

  let allReservations = [];
  try {
    const res = await fetch("/api/reservations");
    if (!res.ok) return;
    allReservations = await res.json();
  } catch (err) {
    console.warn("Falha ao carregar reservas:", err);
    return;
  }

  // Group reservations by tombamento
  const byTombamento = {};
  for (const reservation of allReservations) {
    if (!reservation.items) continue;
    for (const item of reservation.items) {
      const t = item.tombamento;
      if (!byTombamento[t]) byTombamento[t] = [];
      byTombamento[t].push(reservation);
    }
  }

  const cards = document.querySelectorAll(".item-card");
  cards.forEach((card) => {
    const tombamento = card.getAttribute("data-tombamento");
    const reservations = byTombamento[tombamento] || [];

    // Sort: active/upcoming first (by dataInicio), then past
    const sorted = reservations
      .filter(r => r.status !== "CANCELADO")
      .sort((a, b) => (a.dataInicio > b.dataInicio ? 1 : -1));

    const upcoming = sorted.filter(r => r.dataFim >= today);
    const past = sorted.filter(r => r.dataFim < today);
    const ordered = [...upcoming, ...past];

    // ── Update badge dynamically based on state + active reservations ────────
    updateCardBadge(card, reservations, today);

    const nextEl = card.querySelector("[data-reservation-next]");
    const expandBtn = card.querySelector("[data-reservation-expand]");
    const listEl = card.querySelector("[data-reservation-list]");

    if (ordered.length === 0) {
      nextEl.innerHTML = `<div class="reserved-info text-muted"><span>Sem reserva ativa</span></div>`;
      return;
    }

    const nearest = ordered[0];
    nextEl.innerHTML = buildReservationRow(nearest, today);

    if (ordered.length > 1) {
      expandBtn.style.display = "flex";
      expandBtn.addEventListener("click", () => {
        const isOpen = listEl.style.display !== "none";
        if (isOpen) {
          listEl.style.display = "none";
          expandBtn.classList.remove("expanded");
        } else {
          listEl.innerHTML = ordered
            .slice(1)
            .map(r => buildReservationRow(r, today))
            .join("");
          listEl.style.display = "block";
          expandBtn.classList.add("expanded");
        }
      });
    }
  });
}

function updateCardBadge(card, reservations, today) {
  const state = card.getAttribute("data-state");
  const badge = card.querySelector(".status-badge");
  if (!badge) return;

  // State-based badges take priority
  if (state === "BROKEN") {
    setBadge(badge, "QUEBRADO", "badge-broken");
    return;
  }
  if (state === "MAINTENANCE") {
    setBadge(badge, "EM MANUTENÇÃO", "badge-maintenance");
    return;
  }

  // Check if there's an active reservation for today
  const activeToday = reservations.filter(r =>
    r.status !== "CANCELADO" &&
    r.status !== "DEVOLVIDO" &&
    r.dataInicio <= today &&
    r.dataFim >= today
  );

  if (activeToday.some(r => r.status === "RETIRADO")) {
    setBadge(badge, "EM USO", "badge-in-use");
  } else if (activeToday.some(r => r.status === "AGUARDANDO_ACAUTELAMENTO")) {
    setBadge(badge, "RESERVADO", "badge-reserved");
  } else {
    setBadge(badge, "DISPONÍVEL", "badge-available");
  }
}

function setBadge(badge, label, cssClass) {
  badge.className = "status-badge " + cssClass;
  badge.textContent = label;
}

function buildReservationRow(reservation, today) {
  const status = translateStatus(reservation.status);
  const isPast = reservation.dataFim < today;
  const colorClass = isPast ? "text-muted" : (reservation.status === "RETIRADO" ? "res-active" : "res-pending");

  const inicio = formatDate(reservation.dataInicio);
  const fim = formatDate(reservation.dataFim);

  return `
    <div class="reserved-info ${colorClass}">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>${inicio} → ${fim} &nbsp;<strong>${status}</strong> &nbsp;·&nbsp; ${reservation.requester}</span>
    </div>`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function translateStatus(status) {
  const map = {
    AGUARDANDO_ACAUTELAMENTO: "Aguardando",
    RETIRADO: "Retirado",
    DEVOLVIDO: "Devolvido",
    CANCELADO: "Cancelado",
  };
  return map[status] || status;
}
