import { config, safeConstructUrl } from "./lib/config";
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Generate login URL at runtime so redirect URI reflects the current origin.
 * Uses robust URL construction to prevent crashes if environment variables are missing.
 */
export const getLoginUrl = () => {
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const urlStr = safeConstructUrl(config.oauthPortalUrl, "app-auth");
    
    // If safeConstructUrl returned the fallback "#", we should handle it
    if (urlStr === "#") return "#";

    const url = new URL(urlStr);
    url.searchParams.set("appId", config.appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("[Auth Error] Failed to generate login URL", error);
    return "#";
  }
};
