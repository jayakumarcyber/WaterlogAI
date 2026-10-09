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
  // Client-side in browser
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1';

    const configuredUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      '';

    // In production browser: strictly disallow localhost/127.0.0.1 fallbacks.
    // Requests MUST be same-origin relative ('') to route cleanly via Vercel rewrites.
    if (!isLocalhost) {
      if (configuredUrl && !configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1')) {
        return configuredUrl.replace(/\/$/, '');
      }
      return '';
    }

    // In local development browser: allow configured URL or default to empty string (Next.js proxy)
    if (configuredUrl) {
      return configuredUrl.replace(/\/$/, '');
    }
    return '';
  }

  // Server-side execution in Next.js
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }

  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    '';

  const isProd = process.env.NODE_ENV === 'production';
  if (configuredUrl) {
    if (isProd && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
      return '';
    }
    return configuredUrl.replace(/\/$/, '');
  }

  return isProd ? '' : 'http://127.0.0.1:8000';
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
