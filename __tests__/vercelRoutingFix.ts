// vercelRoutingFix.ts
/**
 * Vercel Routing Configuration Fix for QR Code Scanning Issue
 * 
 * Problem: QR codes with query parameters like ?page=customer&id=8201
 * are not properly handled by Vercel's routing system, causing the
 * CustomerOrder interface not to appear.
 * 
 * Root Cause: Vercel's vercel.json rewrites configuration sends all
 * requests to index.html, but doesn't preserve query parameters
 * properly for client-side routing.
 * 
 * Solution: Modify the vercel.json to properly handle client-side routing
 * while preserving query parameters.
 */

// Current problematic vercel.json configuration:
/*
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
*/

// Fixed vercel.json configuration:
const fixedVercelConfig = {
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ],
  // Add headers to ensure proper caching and security
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
};

/**
 * Additional Fix: Enhance App.tsx to better handle URL parameters
 * 
 * The issue might also be in how the App component parses URL parameters.
 * Let's enhance it to be more robust.
 */

// Enhanced URL parameter parsing function
function enhancedUrlParamParser(): { page: string | null; id: string | null } {
  try {
    // For client-side rendering, use window.location
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      return {
        page: params.get('page'),
        id: params.get('id')
      };
    }
    
    // For server-side rendering (if needed), we could use a request object
    // This is just for completeness, as React apps typically run client-side
    return { page: null, id: null };
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return { page: null, id: null };
  }
}

/**
 * Testing URLs for verification:
 * 
 * 1. Dashboard (default): https://jiangxijiudian.store/
 * 2. Customer order page: https://jiangxijiudian.store/?page=customer&id=8201
 * 3. Kitchen display: https://jiangxijiudian.store/?page=kitchen
 * 4. Lobby order: https://jiangxijiudian.store/?page=customer&id=LOBBY
 */

// Test function to verify URL parsing
function testUrlParsing() {
  // Mock different URL scenarios
  const testUrls = [
    'https://jiangxijiudian.store/',
    'https://jiangxijiudian.store/?page=customer&id=8201',
    'https://jiangxijiudian.store/?page=kitchen',
    'https://jiangxijiudian.store/?page=customer&id=LOBBY&lang=fil'
  ];

  testUrls.forEach(url => {
    // Simulate window.location for testing
    const originalLocation = window.location;
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: url.includes('?') ? url.substring(url.indexOf('?')) : '',
        href: url
      },
      writable: true
    });

    const params = enhancedUrlParamParser();
    console.log(`URL: ${url}`);
    console.log(`Parsed params:`, params);
    
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });
}

/**
 * Additional recommendation: Add error boundaries and logging
 * 
 * To better diagnose issues in production, add error boundaries
 * and logging to the App component.
 */

// Export for testing
export { 
  fixedVercelConfig, 
  enhancedUrlParamParser, 
  testUrlParsing 
};