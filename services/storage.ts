// services/storage.ts
// Storage service for handling localStorage operations

export const getStorageSettings = () => {
  try {
    const settings = localStorage.getItem('app-settings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error reading storage settings:', error);
    return null;
  }
};

export const saveStorageSettings = (settings: any) => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving storage settings:', error);
    return false;
  }
};