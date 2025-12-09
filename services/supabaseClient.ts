import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStorageSettings } from './storage';

let client: SupabaseClient | undefined;
let lastUrl: string | undefined;
let lastKey: string | undefined;

/**
 * Get a Supabase client instance.
 * Dynamically switches based on Settings or Env Variables.
 */
export const getSupabase = (): SupabaseClient => {
  const settings = getStorageSettings();
  
  // Safely access environment variables to prevent runtime errors
  // Cast to 'any' to avoid TypeScript errors if types aren't explicitly defined
  const env = (import.meta as any).env || {};
  
  // Try all common naming conventions for Supabase variables
  const envUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const envKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  // 1. Try Settings from LocalStorage (User Input via Settings Page)
  let url = settings.supabaseConfig?.url;
  let key = settings.supabaseConfig?.key;

  // 2. Fallback to Environment Variables if Settings are empty
  if (!url) url = envUrl;
  if (!key) key = envKey;

  // 3. Fallback to Placeholder to avoid crash if absolutely nothing is configured
  // This ensures the app can at least boot up to the Settings screen
  if (!url) url = 'https://placeholder.supabase.co';
  if (!key) key = 'placeholder-key';

  // DISABLE DATABASE CONNECTION TEMPORARILY
  // Create new client if config changed or not exists
  if (!client || url !== lastUrl || key !== lastKey) {
    // Temporarily disable database connection
    console.log("⚠️ Database connection temporarily disabled - waiting for new cloud database setup");
    client = createClient(url, key, {
      db: {
        schema: 'public'
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    lastUrl = url;
    lastKey = key;
    console.log(`🔌 Supabase Client Re-initialized with URL: ${url}`);
  }
  
  return client;
};

// Export a default instance for backward compatibility imports
export const supabase = getSupabase();