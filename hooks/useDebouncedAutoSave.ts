import { useState, useEffect, useRef } from 'react';

// Debounced auto-save hook
export const useDebouncedAutoSave = <T>(
  key: string,
  data: T,
  saveFunction: (data: T) => Promise<any>,
  delay: number = 1000,
  enabled: boolean = true
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (debouncedTimeoutRef.current) {
      clearTimeout(debouncedTimeoutRef.current);
    }

    // Skip if not enabled or data is empty
    if (!enabled || data === undefined || data === null) {
      return;
    }

    // Set new timeout
    debouncedTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFunction(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error(`Failed to auto-save ${key}`, error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
      }
    };
  }, [data, delay, enabled, key, saveFunction]);

  return { isSaving, lastSaved };
};