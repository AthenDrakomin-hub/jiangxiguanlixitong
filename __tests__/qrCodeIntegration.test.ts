import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  parseUrlParams,
  validateQRRouting,
  generateQRCodeUrl,
  initializeCustomerOrderParams,
  testCases,
} from './qrCodeIssue';

// Set up JSDOM for DOM manipulation
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;

// Mock console.error to avoid noisy output
console.error = vi.fn();

describe('QR Code Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should parse URL parameters correctly', () => {
    const testUrl = 'http://localhost:5173?page=customer&id=8201&lang=zh-CN';
    const params = parseUrlParams(testUrl);

    expect(params).toEqual({
      page: 'customer',
      id: '8201',
      lang: 'zh-CN',
    });
  });

  it('should handle invalid URLs gracefully', () => {
    const invalidUrl = 'not-a-valid-url';
    const params = parseUrlParams(invalidUrl);

    expect(params).toEqual({});
    expect(console.error).toHaveBeenCalledWith('Invalid URL:', invalidUrl);
  });

  it('should validate QR routing correctly', () => {
    const validTestCase = testCases[0]; // Hotel room QR code
    const result = validateQRRouting(validTestCase);

    expect(result).toBe(true);
  });

  it('should generate QR code URLs correctly', () => {
    const qrUrl = generateQRCodeUrl(
      'http://localhost:5173',
      'customer',
      '8201'
    );

    expect(qrUrl).toContain('api.qrserver.com');
    expect(qrUrl).toContain('size=200x200');
    expect(qrUrl).toContain(
      'data=http%3A%2F%2Flocalhost%3A5173%3Fpage%3Dcustomer%26id%3D8201'
    );
  });

  it('should handle QR code URL generation errors gracefully', () => {
    // Pass an invalid base path
    const qrUrl = generateQRCodeUrl('invalid-url', 'customer', '8201');

    expect(qrUrl).toBe('');
    expect(console.error).toHaveBeenCalled();
  });

  it('should initialize CustomerOrder parameters with URL values', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '?page=customer&id=8201&lang=fil',
        href: 'http://localhost:5173?page=customer&id=8201&lang=fil',
      },
      writable: true,
    });

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    const params = initializeCustomerOrderParams();

    expect(params.tableId).toBe('8201');
    expect(params.language).toBe('fil');
  });

  it('should use default values when URL parameters are missing', () => {
    // Mock window.location with minimal parameters
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'http://localhost:5173',
      },
      writable: true,
    });

    const params = initializeCustomerOrderParams();

    expect(params.tableId).toBe('LOBBY');
    expect(params.language).toBe('zh-CN');
  });

  it('should fall back to cookie language when URL parameter is missing', () => {
    // Mock window.location without lang parameter
    Object.defineProperty(window, 'location', {
      value: {
        search: '?page=customer&id=8201',
        href: 'http://localhost:5173?page=customer&id=8201',
      },
      writable: true,
    });

    // Mock document.cookie with language preference
    Object.defineProperty(document, 'cookie', {
      value: 'language=fil',
      writable: true,
    });

    const params = initializeCustomerOrderParams();

    expect(params.language).toBe('fil');
  });
});
