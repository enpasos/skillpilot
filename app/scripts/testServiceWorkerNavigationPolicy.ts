import assert from 'node:assert/strict'

import { serviceWorkerNavigationFallbackDenylist } from '../serviceWorkerNavigationPolicy'

const isDenied = (urlPath: string) =>
  serviceWorkerNavigationFallbackDenylist.some(pattern => pattern.test(urlPath))

const machineEndpointNavigations = [
  '/.well-known/oauth-protected-resource/api/openai/de/mcp',
  '/.well-known/oauth-authorization-server/api/openai/de',
  '/api/openai/de/oauth2/authorize',
  '/api/openai/de/oauth2/token',
  '/api/openai/de/mcp',
  '/api/ui/learners/example',
]

for (const urlPath of machineEndpointNavigations) {
  assert.equal(
    isDenied(urlPath),
    true,
    `${urlPath} must never fall back to the cached SPA shell`,
  )
}

const applicationNavigations = [
  '/',
  '/learner/example-goal',
  '/explorer',
]

for (const urlPath of applicationNavigations) {
  assert.equal(
    isDenied(urlPath),
    false,
    `${urlPath} must remain eligible for the SPA navigation fallback`,
  )
}

console.log('Service-worker navigation policy passed: 9 routes checked.')
