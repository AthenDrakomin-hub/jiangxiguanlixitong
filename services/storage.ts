// services/storage.ts
// Storage service for handling localStorage operations

import { StorageSettings } from '../types';


export const getStorageSettings = (): StorageSettings | null => {
  try {
    const settings = localStorage.getItem('storage-settings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error reading storage settings:', error);
    return null;
  }
};

export const saveStorageSettings = (settings: StorageSettings) => {
  try {
    localStorage.setItem('storage-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving storage settings:', error);
    return false;
  }
};
