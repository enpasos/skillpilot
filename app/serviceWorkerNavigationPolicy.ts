/**
 * Browser navigations to machine endpoints and learner cockpits must always
 * reach the network.
 *
 * Workbox otherwise serves the cached SPA shell for navigation requests. That
 * would turn OAuth, MCP, and discovery endpoints into React routes whenever an
 * installed SkillPilot service worker controls the browser tab. For learner
 * routes it would also keep a newly opened cockpit on an outdated frontend
 * while another tab still uses the previous application version.
 */
export const serviceWorkerNavigationFallbackDenylist = [
  /^\/\.well-known(?:\/|$)/,
  /^\/api(?:\/|$)/,
  /^\/internal(?:\/|$)/,
  /^\/learner(?:\/|\?|$)/,
  /^\/.*\.pdf$/,
  /^\/openai\/custom-gpt-action-regression(?:\/|$)/,
  /^\/claude\/mcp-regression(?:\/|$)/,
  /^\/curricula\?auth_success/,
  /^\/oauth2/,
  /^\/login/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
]
