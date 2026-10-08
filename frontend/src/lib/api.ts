/**
 * Resolves the API base URL for CivicPulse Monsoon frontend.
 * 
 * In a multi-service Vercel deployment:
 * 1. Client-side: Both frontend and backend share the domain. Empty string means relative /api/v1/... requests,
 *    routed directly to the backend service via top-level vercel.json rewrites.
 * 2. Server-side: Vercel Service Bindings inject BACKEND_URL into the frontend service.
 * 3. Local fallback: Falls back to NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_API_URL, or http://127.0.0.1:8000.
 */

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Server-side execution in Next.js (uses Vercel service binding)
  if (typeof window === 'undefined') {
    if (process.env.BACKEND_URL) {
      return process.env.BACKEND_URL;
    }
    return 'http://127.0.0.1:8000';
  }
  // Client-side in browser: relative to current host
  return '';
}

/**
 * Builds a full URL or relative path for an API endpoint.
 * Ensures compatibility with browser new URL(...) by providing window.location.origin as base.
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const path = cleanEndpoint.startsWith('api/') ? `/${cleanEndpoint}` : `/api/v1/${cleanEndpoint}`;

  const base = getApiBaseUrl();
  let url: URL;

  if (base) {
    url = new URL(path, base);
  } else if (typeof window !== 'undefined') {
    url = new URL(path, window.location.origin);
  } else {
    url = new URL(path, 'http://127.0.0.1:8000');
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'ALL') {
        url.searchParams.append(key, value);
      }
    });
  }

  // If using relative base on client, return pathname + search
  if (!base && typeof window !== 'undefined') {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}
