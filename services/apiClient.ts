// services/apiClient.ts
// API client for handling HTTP requests

const API_BASE_URL = '/api';

// Define collection names
const COLLECTIONS = [
  'dishes',
  'orders',
  'expenses',
  'inventory',
  'ktv_rooms',
  'sign_bill_accounts',
  'hotel_rooms',
  'payment_methods',
] as const;

type CollectionName = (typeof COLLECTIONS)[number];

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async post<T>(endpoint: string, data: T): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async put<T>(endpoint: string, data: T): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Fetch all data from all collections
   * @returns Object containing all data from all collections
   */
  async fetchAll() {
    try {
      // Fetch all collections in parallel
      const results = await Promise.allSettled(
        COLLECTIONS.map(async (collection) => {
          try {
            const response = await this.get<{
              success: boolean;
              data: unknown[];
            }>(`/${collection}`);
            return { collection, data: response.success ? response.data : [] };
          } catch (error) {
            console.error(`Error fetching ${collection}:`, error);
            return { collection, data: [] };
          }
        })
      );

      // Process results into an object
      const allData: Record<string, unknown[]> = {};

      results.forEach((result, index) => {
        const collection = COLLECTIONS[index];
        if (result.status === 'fulfilled') {
          // Convert collection names to camelCase for the response
          const camelCaseName = collection.replace(/_([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          allData[camelCaseName] = result.value.data;
        } else {
          // Convert collection names to camelCase for the response
          const camelCaseName = collection.replace(/_([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          allData[camelCaseName] = [];
        }
      });

      return allData;
    } catch (error) {
      console.error('Error in fetchAll:', error);
      throw error;
    }
  },

  /**
   * Fetch data from a specific collection
   * @param collection The collection name
   * @returns Array of items from the collection
   */
  async fetchCollection<T>(collection: CollectionName): Promise<T[]> {
    try {
      const response = await this.get<{ success: boolean; data: T[] }>(
        `/${collection}`
      );
      return response.success ? response.data : [];
    } catch (error) {
      console.error(`Error fetching collection ${collection}:`, error);
      return [];
    }
  },
};
