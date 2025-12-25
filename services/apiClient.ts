
// services/apiClient.ts
// API client for handling HTTP requests

// Determine the base URL based on environment
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return '/api';
  } else {
    // Server-side (Node.js)
    const VERCEL_URL = process.env.VERCEL_URL;
    if (VERCEL_URL) {
      // During Vercel deployment
      return `https://${VERCEL_URL}/api`;
    } else {
      // Local development server
      return `http://localhost:${process.env.PORT || 5173}/api`;
    }
  }
};

const API_BASE_URL = getApiBaseUrl();

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
  'system_settings',
] as const;

type CollectionName = (typeof COLLECTIONS)[number] | string;

export const apiClient = {
  async get<T = any>(endpoint: string): Promise<T> {
    // 在生产环境中，避免在日志中记录可能包含敏感信息的数据
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log(`API GET request to ${endpoint}`);
    } else {
      // 生产环境中只记录端点，减少日志量
      console.log(`API GET: ${endpoint}`);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (!isProduction) {
      console.log(`API GET response from ${endpoint}`, result);
    } else {
      // 生产环境中只记录响应状态，不记录数据内容
      console.log(`API GET response from ${endpoint}: ${response.status}`);
    }
    
    return result;
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    // 在生产环境中，避免在日志中记录可能包含敏感信息的数据
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log(`API POST request to ${endpoint}`, data);
    } else {
      // 生产环境中只记录端点，不记录数据内容，特别是Base64数据
      console.log(`API POST request to ${endpoint}`);
    }
    
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
    // 在生产环境中，避免在日志中记录可能包含敏感信息的数据
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log(`API PUT request to ${endpoint}`, data);
    } else {
      // 生产环境中只记录端点，不记录数据内容
      console.log(`API PUT request to ${endpoint}`);
    }
    
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

  async delete<T = any>(endpoint: string): Promise<T> {
    // 在生产环境中，避免在日志中记录可能包含敏感信息的数据
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log(`API DELETE request to ${endpoint}`);
    } else {
      // 生产环境中只记录端点，减少日志量
      console.log(`API DELETE: ${endpoint}`);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (!isProduction) {
      console.log(`API DELETE response from ${endpoint}`, result);
    } else {
      // 生产环境中只记录响应状态，不记录数据内容
      console.log(`API DELETE response from ${endpoint}: ${response.status}`);
    }
    
    return result;
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
            // Fixed: Avoid untyped function calls by using dot notation
            const response = await apiClient.get<{
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
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.get<{ success: boolean; data: T[] }>(
        `/${collection}`
      );
      return response.success ? response.data : [];
    } catch (error) {
      console.error(`Error fetching collection ${collection}:`, error);
      return [];
    }
  },

  /**
   * Save system settings to the database
   * @param settings The system settings to save
   * @returns The saved settings
   */
  async saveSystemSettings(settings: unknown) {
    try {
      // We'll store system settings as a single item with a fixed ID
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.put<any>(
        `/system_settings?id=settings`,
        settings
      );
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error saving system settings:', error);
      throw error;
    }
  },

  /**
   * Fetch system settings from the database
   * @returns The system settings
   */
  async fetchSystemSettings(): Promise<any> {
    try {
      // We'll fetch the single system settings item with the fixed ID
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.get<any>(
        `/system_settings?id=settings`
      );
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return null;
    }
  },

  /**
   * Create a new item in a specific collection
   * @param collection The collection name
   * @param data The data to create
   * @returns The created item
   */
  async create<T>(collection: CollectionName, data: T): Promise<T> {
    try {
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.post<T>(
        `/${collection}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error creating item in collection ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing item in a specific collection
   * @param collection The collection name
   * @param id The ID of the item to update
   * @param data The data to update
   * @returns The updated item
   */
  async update<T>(collection: CollectionName, id: string, data: T): Promise<T> {
    try {
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.put<T>(
        `/${collection}?id=${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating item id ${id} in collection ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Delete an item from a specific collection
   * @param collection The collection name
   * @param id The ID of the item to delete
   * @returns The response from the delete operation
   */
  async remove<T = any>(collection: CollectionName, id: string): Promise<T> {
    try {
      // Fixed: Avoid untyped function calls by using dot notation
      const response = await apiClient.delete<any>(
        `/${collection}?id=${id}`
      );
      return response;
    } catch (error) {
      console.error(`Error deleting item id ${id} from collection ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Initialize all system data
   * @returns The response from the seed operation
   */
  async seed(): Promise<any> {
    try {
      // Fixed: Use apiClient instead of this to preserve types
      const response = await apiClient.post<Record<string, unknown>>(
        `/seed`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
    }
  },
};