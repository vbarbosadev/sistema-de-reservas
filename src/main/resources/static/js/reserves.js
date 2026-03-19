document.addEventListener('DOMContentLoaded', () => {
    const reservesTable = document.getElementById('reservesTable');
    if (!reservesTable) return;

    const searchInput = document.getElementById('reserveSearchInput');
    const dateStartFilter = document.getElementById('dateStartFilter');
    const dateEndFilter = document.getElementById('dateEndFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    const reserveDetailsModal = document.getElementById('reserveDetailsModal');
    const closeReserveDetailsModal = document.getElementById('closeReserveDetailsModal');
    const reserveDetailsContent = document.getElementById('reserveDetailsContent');

    // Filter functionality
    function filterReserves() {
        const searchTerm = searchInput.value.toLowerCase();
        const startDate = dateStartFilter.value ? new Date(dateStartFilter.value) : null;
        const endDate = dateEndFilter.value ? new Date(dateEndFilter.value) : null;
        
        // Ensure end date includes the full day if specified
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        const rows = document.querySelectorAll('#reservesTable tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const tombamentos = row.getAttribute('data-tombamentos') ? row.getAttribute('data-tombamentos').toLowerCase() : '';
            const responsible = row.getAttribute('data-responsible') ? row.getAttribute('data-responsible').toLowerCase() : '';
            const requester = row.getAttribute('data-requester') ? row.getAttribute('data-requester').toLowerCase() : '';
            const dateStr = row.getAttribute('data-date');
            const reserveDate = new Date(dateStr);

            // Search filter
            const matchesSearch = !searchTerm || 
                                tombamentos.includes(searchTerm) || 
                                responsible.includes(searchTerm) || 
                                requester.includes(searchTerm);

            // Date range filter
            let matchesDate = true;
            if (startDate && reserveDate < startDate) matchesDate = false;
            if (endDate && reserveDate > endDate) matchesDate = false;

            if (matchesSearch && matchesDate) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Toggle empty state visibility if no rows are visible
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            if (visibleCount === 0 && rows.length > 0) {
                emptyState.style.display = 'block';
                emptyState.querySelector('p').textContent = 'Nenhuma reserva encontrada para os filtros aplicados.';
            } else if (rows.length > 0) {
                emptyState.style.display = 'none';
            }
        }
    }

    // Reset filters
    function resetFilters() {
        searchInput.value = '';
        dateStartFilter.value = '';
        dateEndFilter.value = '';
        filterReserves();
    }

    function openDetailsModal(id) {
        ApiService.getReserve(id).then(reserve => {
            const fmtDate = (d) => d ? d.substring(0, 10).split('-').reverse().join('/') : '-';
            document.getElementById('viewReserveId').textContent = reserve.id || '';
            document.getElementById('viewReserveDataInicio').textContent = fmtDate(reserve.dataInicio);
            document.getElementById('viewReserveDataFim').textContent = fmtDate(reserve.dataFim);
            document.getElementById('viewReserveRequester').textContent = reserve.requester || '';
            document.getElementById('viewReserveResponsible').textContent = reserve.responsible || '';
            document.getElementById('viewReserveStatus').textContent = reserve.status || '';
            document.getElementById('viewReserveUpdatedBy').textContent = reserve.statusUpdatedByName || 'N/A';

            const ul = document.getElementById('viewReserveItemsList');
            ul.innerHTML = '';
            if (reserve.items && reserve.items.length > 0) {
                reserve.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.name || 'Item'} (${item.tombamento})`;
                    ul.appendChild(li);
                });
            } else {
                ul.innerHTML = '<li>Nenhum item</li>';
            }
            
            reserveDetailsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Allow animation
            setTimeout(() => reserveDetailsModal.classList.add('active'), 10);
        }).catch(err => {
            console.error('Failed to load reserve details:', err);
            alert('Failed to load reservation details.');
        });
    }

    function closeDetailsModal() {
        reserveDetailsModal.classList.remove('active');
        setTimeout(() => {
            reserveDetailsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    function deleteReserve(id) {
        if(confirm(`Tem certeza que deseja apagar a reserva #${id}?`)) {
            fetch(`/api/reservations/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    const row = document.querySelector(`tr:has(button.delete-btn[data-id="${id}"])`);
                    if (row) row.remove();
                } else {
                    alert('Falha ao apagar reserva');
                }
            })
            .catch(error => {
                console.error('Erro ao apagar reserva:', error);
                alert('Ocorreu um erro ao apagar a reserva');
            });
        }
    }

    // Event listeners
    if (searchInput) searchInput.addEventListener('input', filterReserves);
    if (dateStartFilter) dateStartFilter.addEventListener('change', filterReserves);
    if (dateEndFilter) dateEndFilter.addEventListener('change', filterReserves);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    
    if (closeReserveDetailsModal) closeReserveDetailsModal.addEventListener('click', closeDetailsModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === reserveDetailsModal) {
            closeDetailsModal();
        }
    });

    // Action button listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-btn')) {
            openDetailsModal(e.target.getAttribute('data-id'));
        } else if (e.target.classList.contains('delete-btn')) {
            deleteReserve(e.target.getAttribute('data-id'));
        } else if (e.target.classList.contains('open-edit-reserve-btn')) {
            if (window.openEditReserveModal) window.openEditReserveModal(e.target.getAttribute('data-id'));
        }
    });
});
