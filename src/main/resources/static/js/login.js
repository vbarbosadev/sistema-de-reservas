/**
 * login.js
 * - Usuários carregados do banco via GET /api/users
 * - Sem senha — apenas seleciona o usuário
 * - Sessão salva no localStorage, válida por 1 dia
 * - Expõe: getCurrentUser(), loadUsers(), populateUserSelect(el), INVENTORIO_USERS
 */
(function () {
  const SESSION_KEY = "inventorio_session";

  window.INVENTORIO_USERS = []; // preenchido após loadUsers()

  // ── Session helpers ────────────────────────────────────────────────────────

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  }

  function saveSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, date: todayStr() }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  window.getCurrentUser = function () {
    const s = getSession();
    if (!s || s.date !== todayStr()) return null;
    return s.username;
  };

  window.switchUser = function (username) {
    saveSession(username);
    updateUserProfile(username);
    // Re-fill readonly requester fields across open modals
    document.querySelectorAll("[data-autofill-user]").forEach(el => {
      el.value = username;
    });
  };

  /** Fetch users from API, cache in window.INVENTORIO_USERS, populate all selects */
  window.loadUsers = async function () {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      const users = await res.json();
      window.INVENTORIO_USERS = users.map(u => u.name);
    } catch {
      window.INVENTORIO_USERS = [];
    }
    document.querySelectorAll("[data-user-select]").forEach(window.populateUserSelect);
    return window.INVENTORIO_USERS;
  };

  /** Fill a <select data-user-select> with current INVENTORIO_USERS */
  window.populateUserSelect = function (selectEl) {
    if (!selectEl) return;
    const currentVal = selectEl.value;
    // Preserve placeholder text if defined on the element
    const placeholder = selectEl.dataset.placeholder || "Selecione o usuário...";
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    window.INVENTORIO_USERS.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (name === currentVal) opt.selected = true;
      selectEl.appendChild(opt);
    });
  };

  /** Create a new user via API and refresh the list */
  window.createUser = async function (name) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Erro ao criar usuário");
    }
    await window.loadUsers();
    return name;
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────

  function updateUserProfile(username) {
    document.querySelectorAll("[data-user-avatar]").forEach(el => {
      el.textContent = username ? username.charAt(0).toUpperCase() : "?";
    });
    document.querySelectorAll("[data-user-name]").forEach(el => {
      el.textContent = username || "...";
    });
    // Auto-fill readonly requester fields
    document.querySelectorAll("[data-autofill-user]").forEach(el => {
      el.value = username || "";
    });
  }

  // ── Login modal ────────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", async () => {
    // Load users from DB (runs on every page)
    await window.loadUsers();

    const modal = document.getElementById("loginModal");
    if (!modal) {
      const user = window.getCurrentUser();
      if (user) updateUserProfile(user);
      setupProfileDropdown();
      return;
    }

    const submitBtn = document.getElementById("loginSubmitBtn");
    const usernameSelect = document.getElementById("loginUsername");
    const errorMsg = document.getElementById("loginErrorMsg");
    const subtitle = document.getElementById("loginSubtitle");
    const createUserBtn = document.getElementById("loginCreateUserBtn");
    const createUserInput = document.getElementById("loginCreateUserInput");
    const createUserSection = document.getElementById("loginCreateUserSection");

    // Populate the login select
    window.populateUserSelect(usernameSelect);

    function getGreeting() {
      const h = new Date().getHours();
      if (h < 12) return "Bom dia";
      if (h < 18) return "Boa tarde";
      return "Boa noite";
    }

    function showError(msg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
    }

    function clearError() {
      errorMsg.style.display = "none";
    }

    if (subtitle) subtitle.textContent = `${getGreeting()}! Selecione seu usuário para continuar.`;

    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      modal.classList.add("active");
      setTimeout(() => usernameSelect && usernameSelect.focus(), 150);
    } else {
      updateUserProfile(currentUser);
    }

    submitBtn && submitBtn.addEventListener("click", () => {
      clearError();
      const username = usernameSelect.value;
      if (!username) {
        usernameSelect.closest(".form-group").classList.add("error");
        return;
      }
      usernameSelect.closest(".form-group").classList.remove("error");
      saveSession(username);
      updateUserProfile(username);
      modal.classList.remove("active");
      setupProfileDropdown();
    });

    usernameSelect && usernameSelect.addEventListener("keydown", e => {
      if (e.key === "Enter") submitBtn.click();
    });

    // Prevent backdrop close
    modal.addEventListener("click", e => {
      if (e.target === modal) usernameSelect && usernameSelect.focus();
    });

    // ── Criar usuário no modal de login ─────────────────────────────────────
    if (createUserBtn && createUserSection && createUserInput) {
      createUserBtn.addEventListener("click", () => {
        const isOpen = createUserSection.style.display !== "none";
        createUserSection.style.display = isOpen ? "none" : "block";
        if (!isOpen) setTimeout(() => createUserInput.focus(), 50);
      });

      document.getElementById("loginCreateUserConfirm") &&
        document.getElementById("loginCreateUserConfirm").addEventListener("click", async () => {
          const name = createUserInput.value.trim();
          if (!name) return;
          try {
            await window.createUser(name);
            window.populateUserSelect(usernameSelect);
            usernameSelect.value = name;
            createUserInput.value = "";
            createUserSection.style.display = "none";
            clearError();
          } catch (err) {
            showError(err.message);
          }
        });
    }

    setupProfileDropdown();
  });

  // ── User profile dropdown (header) ────────────────────────────────────────

  function setupProfileDropdown() {
    const trigger = document.getElementById("userProfileTrigger");
    const dropdown = document.getElementById("userProfileDropdown");
    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      dropdown.classList.toggle("open", !isOpen);
      if (!isOpen) renderProfileDropdown();
    });

    document.addEventListener("click", () => dropdown.classList.remove("open"));
    dropdown.addEventListener("click", e => e.stopPropagation());
  }

  function renderProfileDropdown() {
    const dropdown = document.getElementById("userProfileDropdown");
    if (!dropdown) return;
    const current = window.getCurrentUser();
    dropdown.innerHTML = "";

    // User list
    window.INVENTORIO_USERS.forEach(name => {
      const item = document.createElement("div");
      item.className = "profile-dropdown-item" + (name === current ? " active" : "");
      item.innerHTML = `<span class="profile-dropdown-avatar">${name.charAt(0).toUpperCase()}</span><span>${name}</span>`;
      item.addEventListener("click", () => {
        window.switchUser(name);
        dropdown.classList.remove("open");
        document.querySelectorAll("[data-user-avatar]").forEach(el => {
          el.textContent = name.charAt(0).toUpperCase();
        });
        document.querySelectorAll("[data-user-name]").forEach(el => {
          el.textContent = name;
        });
      });
      dropdown.appendChild(item);
    });

    // Divider
    const divider = document.createElement("div");
    divider.className = "profile-dropdown-divider";
    dropdown.appendChild(divider);

    // Criar usuário
    const createItem = document.createElement("div");
    createItem.className = "profile-dropdown-item profile-dropdown-create";
    createItem.innerHTML = `<span style="font-size:1.1rem;line-height:1;">+</span><span>Criar usuário</span>`;
    dropdown.appendChild(createItem);

    // Inline create form
    const createForm = document.createElement("div");
    createForm.className = "profile-dropdown-create-form";
    createForm.style.display = "none";
    createForm.innerHTML = `
      <input type="text" class="profile-create-input" placeholder="Nome do usuário" />
      <button class="profile-create-confirm btn btn-primary" style="padding:0.3rem 0.6rem;font-size:0.8rem;">Criar</button>
      <div class="profile-create-error" style="display:none;color:#e11d48;font-size:0.8rem;margin-top:4px;"></div>
    `;
    dropdown.appendChild(createForm);

    createItem.addEventListener("click", () => {
      const isOpen = createForm.style.display !== "none";
      createForm.style.display = isOpen ? "none" : "block";
      if (!isOpen) setTimeout(() => createForm.querySelector("input").focus(), 50);
    });

    const confirmBtn = createForm.querySelector(".profile-create-confirm");
    const nameInput = createForm.querySelector(".profile-create-input");
    const errEl = createForm.querySelector(".profile-create-error");

    async function doCreate() {
      const name = nameInput.value.trim();
      if (!name) return;
      errEl.style.display = "none";
      try {
        await window.createUser(name);
        nameInput.value = "";
        createForm.style.display = "none";
        renderProfileDropdown(); // refresh list
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = "block";
      }
    }

    confirmBtn.addEventListener("click", doCreate);
    nameInput.addEventListener("keydown", e => { if (e.key === "Enter") doCreate(); });
  }
})();
