/**
 * Centralized configuration utility for the client application.
 * This handles environment variables with safe fallbacks and validation
 * to prevent the application from crashing during deployment if variables are missing.
 */

const getEnv = (key: string, fallback: string = ""): string => {
  return import.meta.env[key] || fallback;
};

export const config = {
  oauthPortalUrl: getEnv("VITE_OAUTH_PORTAL_URL", "https://auth.manus.im"),
  appId: getEnv("VITE_APP_ID", "placeholder-app-id"),
  apiBaseUrl: getEnv("VITE_API_BASE_URL", "/api"),
};

/**
 * Safely constructs a URL. If the base or path is invalid, returns a safe fallback
 * or logs an error instead of crashing the application.
 */
export const safeConstructUrl = (base: string, path: string): string => {
  try {
    // Ensure base doesn't end with slash and path doesn't start with slash for consistency
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // Attempt to construct the URL
    const url = new URL(`${cleanBase}${cleanPath}`);
    return url.toString();
  } catch (error) {
    console.error(`[Config Error] Failed to construct URL with base: "${base}" and path: "${path}"`, error);
    // Return a safe string that won't crash the UI
    return "#";
  }
};
