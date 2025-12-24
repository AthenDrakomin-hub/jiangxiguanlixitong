// Cookie utility functions
import { LANGUAGE_COOKIE_NAME } from './i18n';

/**
 * Set a cookie with specified name, value, and expiration days
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration (default: 30)
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 30
): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

/**
 * Set language preference cookie
 * @param lang - Language code
 */
export const setLanguageCookie = (lang: string): void => {
  setCookie(LANGUAGE_COOKIE_NAME, lang, 30);
};

/**
 * Get the value of a cookie by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

/**
 * Delete a cookie by name
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};
