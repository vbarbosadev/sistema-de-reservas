document.addEventListener("DOMContentLoaded", () => {
  // Modal elements
  const modal = document.getElementById("addItemModal");
  const openModalBtn = document.getElementById("openAddItemModal");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelAddItem");
  const submitBtn = document.getElementById("submitAddItem");
  const form = document.getElementById("addItemForm");
  
  // Form fields
  const nameInput = document.getElementById("itemName");
  const tombamentoInput = document.getElementById("itemTombamento");
  const descriptionInput = document.getElementById("itemDescription");
  const statusSelect = document.getElementById("itemStatus");
  
  // Open modal handler
  function openModal() {
    modal.classList.add("active");
    // Focus the first input field
    setTimeout(() => {
      nameInput.focus();
    }, 100);
    // Trap focus inside modal
    trapFocus();
  }
  
  // Close modal handler
  function closeModal() {
    modal.classList.remove("active");
    // Reset form
    form.reset();
    // Reset validation styles
    resetValidation();
    // Hide success animation if visible
    document.querySelector(".success-checkmark").style.display = "none";
    // Ensure form is visible (in case it was hidden for success animation)
    form.style.display = "block";
    // Remove any error message container
    const errorContainer = document.querySelector(".error-container");
    if (errorContainer) {
      errorContainer.remove();
    }
  }
  
  // Validate form
  function validateForm() {
    let isValid = true;
    
    // Reset validation
    resetValidation();
    
    // Validate name
    if (!nameInput.value.trim()) {
      setError(nameInput, "Name is required");
      isValid = false;
    }
    
    // Validate tombamento
    if (!tombamentoInput.value.trim()) {
      setError(tombamentoInput, "Tombamento is required");
      isValid = false;
    }
    
    // Validate status
    if (!statusSelect.value) {
      setError(statusSelect, "Status is required");
      isValid = false;
    }
    
    return isValid;
  }
  
  // Set error state for a field
  function setError(input, message) {
    const formGroup = input.closest(".form-group");
    formGroup.classList.add("error");
    const errorDiv = formGroup.querySelector(".form-error");
    if (errorDiv) {
      errorDiv.textContent = message;
    }
  }
  
  // Set a global error message
  function setGlobalError(message) {
    // Remove existing error container if present
    const existingError = document.querySelector(".error-container");
    if (existingError) {
      existingError.remove();
    }
    
    // Create error container
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-container";
    errorContainer.style.color = "#e11d48";
    errorContainer.style.padding = "10px";
    errorContainer.style.marginBottom = "15px";
    errorContainer.style.backgroundColor = "#ffe4e6";
    errorContainer.style.borderRadius = "8px";
    errorContainer.style.fontWeight = "500";
    errorContainer.style.fontSize = "0.95rem";
    errorContainer.textContent = message;
    
    // Insert at top of form
    form.insertBefore(errorContainer, form.firstChild);
  }
  
  // Reset validation state
  function resetValidation() {
    const errorGroups = form.querySelectorAll(".form-group.error");
    errorGroups.forEach(group => {
      group.classList.remove("error");
    });
    
    // Remove global error message if present
    const errorContainer = document.querySelector(".error-container");
    if (errorContainer) {
      errorContainer.remove();
    }
  }
  
  // Focus trap for accessibility
  function trapFocus() {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener("keydown", function(e) {
      // If Tab key is pressed
      if (e.key === "Tab") {
        // Shift + Tab
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        // Tab without shift
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      
      // If Escape key is pressed
      if (e.key === "Escape") {
        closeModal();
      }
    });
  }
  
  // Create an item card and add it to the grid
  function addItemToGrid(item) {
    const itemGrid = document.getElementById("itemGrid");
    const emptyState = document.querySelector(".empty-state");
    
    // If there was an empty state message, remove it
    if (emptyState) {
      emptyState.remove();
    }
    
    // Create a new card element
    const itemCard = document.createElement("div");
    itemCard.className = "item-card";
    itemCard.setAttribute("data-status", item.status);
    itemCard.setAttribute("data-tombamento", item.tombamento);
    
    // Set the inner HTML of the card
    itemCard.innerHTML = `
      <div class="card-header">
        <h3>${item.name}</h3>
        <span class="status-badge badge-${item.status.toLowerCase()}">${item.status}</span>
      </div>
      <div class="card-body">
        <p class="description">${item.description || 'No description provided.'}</p>
      </div>
      <div class="card-footer">
        <div class="reserved-info ${!formattedDate ? 'text-muted' : ''}">
          ${formattedDate 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>Reserved: ${formattedDate}</span>`
            : '<span>No active reservation</span>'
          }
        </div>
        <button class="action-btn">Edit</button>
      </div>
    `;
    
    // Add to the beginning of the grid
    if (itemGrid.firstChild) {
      itemGrid.insertBefore(itemCard, itemGrid.firstChild);
    } else {
      itemGrid.appendChild(itemCard);
    }
    
    // Add appear animation
    itemCard.style.opacity = "0";
    itemCard.style.transform = "translateY(20px)";
    setTimeout(() => {
      itemCard.style.opacity = "1";
      itemCard.style.transform = "translateY(0)";
    }, 10);
  }
  
  // Event listeners
  openModalBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  
  // Close modal if clicking outside content area
  modal.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Form submission with API integration
  submitBtn.addEventListener("click", async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Set loading state
      submitBtn.classList.add("btn-loading");
      
      // Prepare item data from form
      const itemData = {
        name: nameInput.value.trim(),
        tombamento: tombamentoInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusSelect.value
      };
      
      // Send the request to the API
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      // Handle API response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
      }
      
      // Get the created item data
      const createdItem = await response.json();
      
      // Show success animation
      form.style.display = "none";
      const successCheckmark = document.querySelector(".success-checkmark");
      successCheckmark.style.display = "block";
      
      // Add the new item to the grid
      addItemToGrid(createdItem);
      
      // Close modal after success
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setGlobalError(error.message || 'An error occurred while creating the item. Please try again.');
      submitBtn.classList.remove("btn-loading");
    } finally {
      // Only remove loading state if there was an error
      // For success case, the modal will be closed and reset
    }
  });
});