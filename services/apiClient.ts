// Enhanced API Client with Full CRUD Support
export const apiClient = {
  // Generic GET request
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic POST request
  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to post to ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic PUT request
  put: async (endpoint: string, id: string, data: any) => {
    try {
      const response = await fetch(`/api/${endpoint}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to update ${endpoint} with id ${id}:`, error);
      throw error;
    }
  },

  // Generic DELETE request
  delete: async (endpoint: string, id: string) => {
    try {
      const response = await fetch(`/api/${endpoint}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete ${endpoint} with id ${id}:`, error);
      throw error;
    }
  },

  // Fetch all data with fallback protection
  fetchAll: async () => {
    try {
      // Parallel fetch for better performance
      const [
        dishesRes,
        ordersRes,
        expensesRes,
        inventoryRes,
        ktvRoomsRes,
        signBillAccountsRes,
        hotelRoomsRes,
        paymentMethodsRes
      ] = await Promise.allSettled([
        apiClient.get('dishes'),
        apiClient.get('orders'),
        apiClient.get('expenses'),
        apiClient.get('inventory'),
        apiClient.get('ktv_rooms'),
        apiClient.get('sign_bill_accounts'),
        apiClient.get('hotel_rooms'),
        apiClient.get('payment_methods')
      ]);

      return {
        dishes: dishesRes.status === 'fulfilled' ? dishesRes.value.data : [],
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data : [],
        expenses: expensesRes.status === 'fulfilled' ? expensesRes.value.data : [],
        inventory: inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : [],
        ktvRooms: ktvRoomsRes.status === 'fulfilled' ? ktvRoomsRes.value.data : [],
        signBillAccounts: signBillAccountsRes.status === 'fulfilled' ? signBillAccountsRes.value.data : [],
        hotelRooms: hotelRoomsRes.status === 'fulfilled' ? hotelRoomsRes.value.data : [],
        paymentMethods: paymentMethodsRes.status === 'fulfilled' ? paymentMethodsRes.value.data : []
      };
    } catch (error) {
      console.error("Critical failure in fetchAll:", error);
      throw error;
    }
  },

  // Create new record
  create: async (table: string, data: any) => {
    return await apiClient.post(table, data);
  },

  // Update existing record
  update: async (table: string, id: string, data: any) => {
    return await apiClient.put(table, id, data);
  },

  // Delete record
  remove: async (table: string, id: string) => {
    return await apiClient.delete(table, id);
  }
};