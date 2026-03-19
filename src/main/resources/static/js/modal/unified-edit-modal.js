document.addEventListener('DOMContentLoaded', () => {
    window.api = window.api || {
        getItem: async (id) => { const res = await fetch(`/api/items/${id}`); if (!res.ok) throw await res.json(); return res.json(); },
        getReservation: async (id) => { const res = await fetch(`/api/reservations/${id}`); if (!res.ok) throw await res.json(); return res.json(); },
        getItems: async () => { const res = await fetch('/api/items'); if (!res.ok) throw await res.json(); return res.json(); },
        updateItem: async (id, payload) => {
            const res = await fetch(`/api/items/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || err.message || 'Failed to update item'); }
            return res.json();
        },
        updateReservation: async (id, payload) => {
            const res = await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || err.message || 'Failed to update reservation'); }
            return res.json();
        }
    };

    const modal = document.getElementById('unifiedEditModal');
    if (!modal) return; // Modal not on this page

    const closeBtn = document.getElementById('closeUnifiedEditModal');
    const cancelBtn = document.getElementById('cancelUnifiedEdit');
    const submitBtn = document.getElementById('submitUnifiedEdit');
    const form = document.getElementById('unifiedEditForm');
    
    const itemContainer = document.getElementById('itemFieldsContainer');
    const reserveContainer = document.getElementById('reserveFieldsContainer');
    const title = document.getElementById('unifiedEditModalTitle');
    
    const tombamentosSelect = document.getElementById('editReserveTombamentos');

    // Make functions globally available for buttons in tables to call
    window.openUnifiedEditModal = function(entityType, entityId) {
        document.getElementById('editEntityType').value = entityType;
        document.getElementById('editEntityId').value = entityId;

        // Reset display
        itemContainer.style.display = 'none';
        reserveContainer.style.display = 'none';
        
        // Remove 'required' attribute dynamically to avoid validation issues
        document.querySelectorAll('#unifiedEditForm input, #unifiedEditForm select').forEach(el => el.required = false);

        if (entityType === 'item') {
            title.textContent = 'Edit Item';
            itemContainer.style.display = 'block';
            
            document.getElementById('editItemName').required = true;
            document.getElementById('editItemTombamento').required = true;
            document.getElementById('editItemStatus').required = true;

            fetchItemDetails(entityId);
        } else if (entityType === 'reserve') {
            title.textContent = 'Editar Reserva';
            reserveContainer.style.display = 'block';

            document.getElementById('editReserveResponsible').required = true;
            document.getElementById('editReserveRequester').required = true;
            document.getElementById('editReserveDate').required = true;
            document.getElementById('editReserveStatus').required = true;

            // Auto-fill logged-in user fields
            const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
            if (currentUser) {
                document.getElementById('editReserveRequester').value = currentUser;
                document.getElementById('editReserveStatusUpdatedByName').value = currentUser;
            }

            // Pre-load all items for the multi-select
            loadItemsForSelect().then(() => {
                fetchReserveDetails(entityId);
            });
        }
        
        modal.style.display = 'flex';
    };

    function fetchItemDetails(id) {
        window.api.getItem(id).then(item => {
            document.getElementById('editItemName').value = item.name || '';
            document.getElementById('editItemTombamento').value = item.tombamento || '';
            document.getElementById('editItemDescription').value = item.description || '';
            document.getElementById('editItemStatus').value = item.status || 'AVAILABLE';
            document.getElementById('editItemReservedDate').value = item.reservedDate || '';
        }).catch(err => {
            console.error('Failed to load item:', err);
            alert('Failed to load item details.');
        });
    }

    function fetchReserveDetails(id) {
        window.api.getReservation(id).then(reserve => {
            document.getElementById('editReserveResponsible').value = reserve.responsible || '';
            // Requester and statusUpdatedByName are always the logged-in user — do not overwrite
            document.getElementById('editReserveDate').value = reserve.dataInicio || '';
            document.getElementById('editReserveStatus').value = reserve.status || 'AGUARDANDO_ACAUTELAMENTO';

            // Select the options
            const currentTombos = reserve.items ? reserve.items.map(i => i.tombamento) : [];
            Array.from(tombamentosSelect.options).forEach(opt => {
                opt.selected = currentTombos.includes(opt.value);
            });

        }).catch(err => {
            console.error('Falha ao carregar reserva:', err);
            alert('Falha ao carregar detalhes da reserva.');
        });
    }

    async function loadItemsForSelect() {
        try {
            const items = await window.api.getItems();
            tombamentosSelect.innerHTML = '';
            items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.tombamento;
                opt.textContent = `${item.name} (${item.tombamento})`;
                tombamentosSelect.appendChild(opt);
            });
        } catch(e) {
            console.error('Failed to load items for select', e);
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        form.reset();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    submitBtn.addEventListener('click', () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const entityType = document.getElementById('editEntityType').value;
        const entityId = document.getElementById('editEntityId').value;

        let payload, promise;

        if (entityType === 'item') {
            payload = {
                name: document.getElementById('editItemName').value,
                tombamento: document.getElementById('editItemTombamento').value,
                description: document.getElementById('editItemDescription').value,
                status: document.getElementById('editItemStatus').value,
                reservedDate: document.getElementById('editItemReservedDate').value || null
            };
            promise = window.api.updateItem(entityId, payload);
        } else if (entityType === 'reserve') {
            // Get selected tombamentos
            const selectedTombos = Array.from(tombamentosSelect.selectedOptions).map(opt => opt.value);
            
            payload = {
                tombamentos: selectedTombos,
                responsible: document.getElementById('editReserveResponsible').value,
                requester: document.getElementById('editReserveRequester').value,
                reservationDate: document.getElementById('editReserveDate').value,
                status: document.getElementById('editReserveStatus').value,
                statusUpdatedByName: document.getElementById('editReserveStatusUpdatedByName').value
            };
            promise = window.api.updateReservation(entityId, payload);
        }

        submitBtn.disabled = true;
        promise.then((updatedData) => {
            closeModal();
            // Dynamically update UI
            if (entityType === 'item') {
                updateItemUI(entityId, updatedData);
            } else if (entityType === 'reserve') {
                updateReserveUI(entityId, updatedData);
            }
        }).catch(err => {
            console.error('Error updating:', err);
            alert(err.message || 'Error updating. See console for details.');
        }).finally(() => {
            submitBtn.disabled = false;
        });
    });

    function updateItemUI(id, item) {
        const editBtn = document.querySelector(`.edit-item-btn[data-id="${id}"]`);
        if (!editBtn) return;
        const card = editBtn.closest('.item-card');
        if (!card) return;

        card.querySelector('h3').textContent = item.name;
        const descriptions = card.querySelectorAll('.description');
        if (descriptions.length >= 1) descriptions[0].textContent = item.description || '';
        if (descriptions.length >= 2) descriptions[1].textContent = item.tombamento || '';
        
        card.setAttribute('data-status', item.status);
        if (item.state) card.setAttribute('data-state', item.state);
        card.setAttribute('data-tombamento', item.tombamento);

        const badge = card.querySelector('.status-badge');
        if (badge) {
            badge.className = 'status-badge'; 
            const state = item.state || '';
            const status = item.status || '';
            if (state === 'BROKEN')      { badge.classList.add('badge-broken'); badge.textContent = 'QUEBRADO'; }
            else if (status === 'LOANED')     { badge.classList.add('badge-in-use'); badge.textContent = 'EM USO'; }
            else if (state === 'MAINTENANCE') { badge.classList.add('badge-maintenance'); badge.textContent = 'EM MANUTENÇÃO'; }
            else if (status === 'ON_ROOM')    { badge.classList.add('badge-available'); badge.textContent = 'DISPONÍVEL'; }
        }
    }

    function updateReserveUI(id, reserve) {
        const editBtn = document.querySelector(`.edit-btn[data-id="${id}"]`);
        if (!editBtn) return;
        const row = editBtn.closest('tr');
        if (!row) return;

        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
        
        let itemsStr = '';
        if (reserve.items && reserve.items.length > 0) {
            itemsStr = reserve.items.map(i => i.tombamento).join(', ');
        }
        cells[1].innerHTML = `<span>${itemsStr}</span>`;
        cells[2].textContent = reserve.responsible;
        cells[3].textContent = reserve.requester;
        // The API returns reservationDate as YYYY-MM-DD generally or ISO. Just use substring.
        const dateStr = reserve.reservationDate ? reserve.reservationDate.substring(0,10) : '';
        cells[4].textContent = dateStr;
        
        const badge = cells[5].querySelector('.status-badge');
        if (badge) badge.textContent = reserve.status;

        row.setAttribute('data-tombamentos', itemsStr);
        row.setAttribute('data-responsible', reserve.responsible);
        row.setAttribute('data-requester', reserve.requester);
        row.setAttribute('data-date', dateStr);
    }
});
