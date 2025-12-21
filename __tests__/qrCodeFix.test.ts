// qrCodeFix.test.ts
/**
 * Test file for QR code scanning issue fixes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { enhancedUrlParser, generateEnhancedQRUrl } from './qrCodeFix';

// Set up JSDOM for DOM manipulation
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;

// Mock console.error to avoid noisy output
console.error = vi.fn();

describe('QR Code Fix Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should parse URL parameters correctly', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '?page=customer&id=8201&lang=fil',
        href: 'https://jiangxijiudian.store/?page=customer&id=8201&lang=fil',
      },
      writable: true,
    });

    const params = enhancedUrlParser();

    expect(params.page).toBe('customer');
    expect(params.id).toBe('8201');
    expect(params.lang).toBe('fil');
  });

  it('should handle missing URL parameters gracefully', () => {
    // Mock window.location with no parameters
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://jiangxijiudian.store/',
      },
      writable: true,
    });

    const params = enhancedUrlParser();

    expect(params.page).toBeNull();
    expect(params.id).toBeNull();
    expect(params.lang).toBeNull();
  });

  it('should handle invalid URLs gracefully', () => {
    // Mock window.location with invalid URL
    Object.defineProperty(window, 'location', {
      value: {
        search: 'invalid-search',
        href: 'not-a-valid-url',
      },
      writable: true,
    });

    const params = enhancedUrlParser();

    expect(params.page).toBeNull();
    expect(params.id).toBeNull();
    expect(params.lang).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should generate QR code URLs correctly', () => {
    const qrUrl = generateEnhancedQRUrl(
      'https://jiangxijiudian.store',
      'customer',
      '8201'
    );

    expect(qrUrl).toContain('api.qrserver.com');
    expect(qrUrl).toContain('size=200x200');
    expect(qrUrl).toContain(
      'data=https%3A%2F%2Fjiangxijiudian.store%2F%3Fpage%3Dcustomer%26id%3D8201'
    );
  });

  it('should handle QR code URL generation errors gracefully', () => {
    // Pass an invalid base path
    const qrUrl = generateEnhancedQRUrl('invalid-url', 'customer', '8201');

    expect(qrUrl).toContain('api.qrserver.com');
    expect(qrUrl).toContain('data=ERROR');
    expect(console.error).toHaveBeenCalled();
  });
});
