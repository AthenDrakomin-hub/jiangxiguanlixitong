// lib/storage-manager.ts
/**
 * Storage Manager for handling KV storage backend
 *
 * This module provides a unified interface for data storage that uses
 * Vercel KV (Upstash Redis) as the storage backend.
 */

import { kvClient } from './kv-client';

/**
 * Storage Manager with KV backend support
 */
export const storageManager = {
  /**
   * Get all items for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @returns Array of all items
   */
  async getAll<T>(entityType: string): Promise<T[]> {
    // Use KV storage
    return await kvClient.getAll<T>(entityType);
  },

  /**
   * Create a new item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param itemData The data to store
   * @returns The created item with ID
   */
  async create<T extends { id?: string }>(
    entityType: string,
    itemData: Omit<T, 'id'>
  ): Promise<T & { id: string }> {
    // Use KV storage
    return await kvClient.create<T>(entityType, itemData);
  },

  /**
   * Update an existing item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID of the item to update
   * @param itemData The data to update
   * @returns The updated item
   */
  async update<T>(
    entityType: string,
    id: string,
    itemData: Partial<T>
  ): Promise<T | null> {
    // Use KV storage
    return await kvClient.update<T>(entityType, id, itemData);
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
