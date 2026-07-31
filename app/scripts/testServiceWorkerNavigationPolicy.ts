import assert from 'node:assert/strict'

import {
  serviceWorkerLifecyclePolicy,
  serviceWorkerRegisterType,
} from '../serviceWorkerLifecyclePolicy'
import { serviceWorkerNavigationFallbackDenylist } from '../serviceWorkerNavigationPolicy'

const isDenied = (urlPath: string) =>
  serviceWorkerNavigationFallbackDenylist.some(pattern => pattern.test(urlPath))

const machineEndpointNavigations = [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-authorization-server/api/openai/de',
  '/api/openai/de/oauth2/authorize',
  '/api/openai/de/oauth2/token',
  '/api/openai/de/mcp',
  '/api/openai/de/v1/mcp',
  '/internal/openai/de/v1/mcp',
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

assert.equal(
  serviceWorkerRegisterType,
  'prompt',
  'a new service worker must wait for a coherent client-version transition',
)
assert.equal(
  serviceWorkerLifecyclePolicy.skipWaiting,
  false,
  'a new service worker must not activate while an old frontend is loading',
)
assert.equal(
  serviceWorkerLifecyclePolicy.clientsClaim,
  false,
  'a new service worker must not take over an existing frontend mid-load',
)
assert.equal(
  serviceWorkerLifecyclePolicy.cleanupOutdatedCaches,
  true,
  'old precaches are cleaned only after the coherent worker activation',
)

console.log('Service-worker navigation and lifecycle policy passed.')
