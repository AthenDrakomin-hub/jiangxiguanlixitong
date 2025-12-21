// lib/storage-manager.ts
/**
 * Storage Manager for handling KV storage backend
 *
 * This module provides a unified interface for data storage that uses
 * Vercel KV (Upstash Redis) as the storage backend.
 */

import { kvClient } from './kv-client.js';

/**
 * Storage Manager with KV backend support
 */
export const storageManager = {
  /**
   * Get all items for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @returns Array of all items
   */
  async getAll(entityType: string) {
    // Use KV storage
    return await kvClient.getAll(entityType);
  },

  /**
   * Create a new item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param itemData The data to store
   * @returns The created item with ID
   */
  async create(entityType: string, itemData: Record<string, unknown>) {
    // Use KV storage
    return await kvClient.create(entityType, itemData);
  },

  /**
   * Update an existing item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID of the item to update
   * @param itemData The data to update
   * @returns The updated item
   */
  async update(
    entityType: string,
    id: string,
    itemData: Record<string, unknown>
  ) {
    // Use KV storage
    return await kvClient.update(entityType, id, itemData);
  },

  /**
   * Delete an item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID of the item to delete
   * @returns True if deleted, false otherwise
   */
  async delete(entityType: string, id: string): Promise<boolean> {
    // Use KV storage
    return await kvClient.delete(entityType, id);
  },

  /**
   * Generate a unique ID
   * @returns A unique string ID
   */
  generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },

  /**
   * Get current storage backend info
   * @returns Information about the current storage backend
   */
  getBackendInfo(): { type: string; description: string } {
    return {
      type: 'KV',
      description: 'Vercel KV (Upstash Redis) Storage',
    };
  },
};
