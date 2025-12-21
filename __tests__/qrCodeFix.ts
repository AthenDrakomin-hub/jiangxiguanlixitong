// qrCodeFix.ts
/**
 * QR Code Scanning Issue Fix
 * 
 * This file contains fixes for the QR code scanning issue where the H5 customer
 * interface was not appearing correctly when scanning QR codes.
 */

/**
 * Fix 1: Enhanced URL Parameter Parser
 * 
 * Improves the reliability of URL parameter parsing in both App.tsx and CustomerOrder.tsx
 */
function enhancedUrlParser() {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const id = params.get('id');
      const lang = params.get('lang');
      
      return {
        page: page || null,
        id: id || null,
        lang: lang || null
      };
    }
    
    // Server-side fallback (for SSR environments)
    return {
      page: null,
      id: null,
      lang: null
    };
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return {
      page: null,
      id: null,
      lang: null
    };
  }
}

/**
 * Fix 2: Enhanced App Component Routing Logic
 * 
 * Improved version of the routing logic in App.tsx
 */
function enhancedAppRouting(): { currentPage: string; tableId: string | null } {
  // Default values
  let currentPage = 'dashboard';
  let tableId = null;
  
  try {
    // Parse URL parameters
    const { page, id } = enhancedUrlParser();
    
    // Determine current page based on URL parameters
    if (page === 'customer') {
      currentPage = 'customer';
      tableId = id || 'LOBBY'; // Default to lobby if no ID provided
    } else if (page === 'kitchen') {
      currentPage = 'kitchen';
    }
    
    return { currentPage, tableId };
  } catch (error) {
    console.error('Error in app routing:', error);
    return { currentPage, tableId };
  }
}

/**
 * Fix 3: Enhanced CustomerOrder Component Initialization
 * 
 * Improved version of the initialization logic in CustomerOrder.tsx
 */
function enhancedCustomerOrderInit() {
  try {
    // Parse URL parameters
    const { id, lang } = enhancedUrlParser();
    
    // Initialize table ID
    const tableId = id || 'LOBBY';
    
    // Initialize language with priority: URL > Cookie > Default
    let initialLang = 'zh-CN'; // Default
    
    if (lang === 'fil' || lang === 'zh-CN') {
      initialLang = lang;
    } else {
      // Check for language preference in cookie
      const cookieLang = getCookieLanguage();
      if (cookieLang === 'fil' || cookieLang === 'zh-CN') {
        initialLang = cookieLang;
      }
    }
    
    return {
      tableId,
      language: initialLang
    };
  } catch (error) {
    console.error('Error initializing CustomerOrder:', error);
    return {
      tableId: 'LOBBY',
      language: 'zh-CN'
    };
  }
}

/**
 * Helper function to get language from cookie
 */
function getCookieLanguage(): string | null {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split('; ');
      for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'language') {
          return decodeURIComponent(value);
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading language cookie:', error);
    return null;
  }
}

/**
 * Fix 4: Enhanced QR Code URL Generation
 * 
 * Improved version of QR code URL generation in QRCodeManager.tsx
 */
function generateEnhancedQRUrl(basePath: string, page: string, id: string): string {
  try {
    // Create the target URL with parameters
    const url = new URL(basePath);
    url.searchParams.set('page', page);
    url.searchParams.set('id', id);
    
    // Generate QR code URL using QR server API
    const qrApiUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
    qrApiUrl.searchParams.set('size', '200x200');
    qrApiUrl.searchParams.set('data', url.toString());
    qrApiUrl.searchParams.set('color', 'ea580c'); // Brand color
    qrApiUrl.searchParams.set('bgcolor', 'ffffff');
    
    return qrApiUrl.toString();
  } catch (error) {
    console.error('Error generating QR code URL:', error);
    // Return a fallback QR code with error indication
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ERROR')}&color=ff0000&bgcolor=ffffff`;
  }
}

/**
 * Test Cases
 */
const testCases = [
  {
    description: 'Hotel room QR code',
    url: 'https://jiangxijiudian.store/?page=customer&id=8201',
    expectedPage: 'customer',
    expectedId: '8201'
  },
  {
    description: 'Lobby QR code',
    url: 'https://jiangxijiudian.store/?page=customer&id=LOBBY',
    expectedPage: 'customer',
    expectedId: 'LOBBY'
  },
  {
    description: 'Kitchen display QR code',
    url: 'https://jiangxijiudian.store/?page=kitchen',
    expectedPage: 'kitchen',
    expectedId: null
  },
  {
    description: 'Default dashboard access',
    url: 'https://jiangxijiudian.store/',
    expectedPage: 'dashboard',
    expectedId: null
  }
];

/**
 * Verification function to test URL parsing
 */
function verifyUrlParsing() {
  console.log('=== QR Code URL Parsing Verification ===');
  
  testCases.forEach((testCase, index) => {
    // Mock window.location for testing
    const originalLocation = window.location;
    
    try {
      // Create a mock location object
      Object.defineProperty(window, 'location', {
        value: {
          search: testCase.url.includes('?') ? testCase.url.substring(testCase.url.indexOf('?')) : '',
          href: testCase.url
        },
        writable: true
      });
      
      // Parse the URL
      const parsed = enhancedUrlParser();
      const routing = enhancedAppRouting();
      
      // Check results
      const pageMatch = parsed.page === testCase.expectedPage;
      const idMatch = parsed.id === testCase.expectedId;
      
      console.log(`${index + 1}. ${testCase.description}: ${pageMatch && idMatch ? 'PASS' : 'FAIL'}`);
      if (!pageMatch || !idMatch) {
        console.log(`   Expected: page=${testCase.expectedPage}, id=${testCase.expectedId}`);
        console.log(`   Got: page=${parsed.page}, id=${parsed.id}`);
        console.log(`   Routing result: currentPage=${routing.currentPage}, tableId=${routing.tableId}`);
      }
    } catch (error) {
      console.log(`${index + 1}. ${testCase.description}: ERROR - ${error}`);
    } finally {
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      });
    }
  });
}

// Export functions for use in components
export {
  enhancedUrlParser,
  enhancedAppRouting,
  enhancedCustomerOrderInit,
  generateEnhancedQRUrl,
  verifyUrlParsing
};