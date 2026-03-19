/**
 * API Service for Item Management
 */
const ApiService = {
  /**
   * Create a new item
   * @param {Object} item - Item data to create
   * @returns {Promise<Object>} - Created item
   */
  createItem: async function(item) {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  /**
   * Fetch all items
   * @returns {Promise<Array>} - List of items
   */
  fetchItems: async function() {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },
  
  /**
   * Fetch a single item by ID
   * @param {number|string} id - Item ID
   * @returns {Promise<Object>} - Item data
   */
  getItem: async function(id) {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  /**
   * Fetch a single reservation by ID
   * @param {number|string} id - Reservation ID
   * @returns {Promise<Object>} - Reservation data
   */
  getReserve: async function(id) {
    try {
      const response = await fetch(`/api/reservations/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reservation ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }
  },

  /**
   * Update an existing reservation
   * @param {number|string} id - Reservation ID
   * @param {Object} payload - Data to update
   * @returns {Promise<Object>} - Updated reservation data
   */
  updateReservation: async function(id, payload) {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Failed to update reservation ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  },
  
  /**
   * Format form data to match the API expected structure
   * @param {HTMLFormElement} form - The form element containing item data
   * @returns {Object} - Formatted item data
   */
  formatItemData: function(form) {
    const formData = new FormData(form);
    const item = {};
    
    // Extract and format each field
    for (let [key, value] of formData.entries()) {
      // Skip empty values except for special cases
      if (value === '' && key !== 'description') {
        continue;
      }
      
      // Handle special data types
      if (key === 'reservedDate' && value) {
        item[key] = value; // Already in YYYY-MM-DD format
      } else {
        item[key] = value;
      }
    }
    
    return item;
  }
};

// Export the service if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}