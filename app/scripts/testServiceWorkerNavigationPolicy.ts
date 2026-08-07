import assert from 'node:assert/strict'

import {
  serviceWorkerInjectRegister,
  serviceWorkerLifecyclePolicy,
  serviceWorkerRegisterType,
} from '../serviceWorkerLifecyclePolicy'
import { serviceWorkerNavigationFallbackDenylist } from '../serviceWorkerNavigationPolicy'

const isDenied = (urlPath: string) =>
  serviceWorkerNavigationFallbackDenylist.some(pattern => pattern.test(urlPath))

const machineEndpointNavigations = [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-authorization-server/api/openai/v1',
  '/api/openai/v1/oauth2/authorize',
  '/api/openai/v1/oauth2/token',
  '/internal/openai/v1/mcp',
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
  'a new service worker must wait until all clients using the old version are closed',
)
assert.equal(
  serviceWorkerInjectRegister,
  false,
  'the application entry point must own the only service-worker registration',
)
assert.equal(
  serviceWorkerLifecyclePolicy.skipWaiting,
  false,
  'a new service worker must not activate while an old frontend is open',
)
assert.equal(
  serviceWorkerLifecyclePolicy.clientsClaim,
  false,
  'a new service worker must not take over an existing frontend mid-session',
)
assert.equal(
  serviceWorkerLifecyclePolicy.cleanupOutdatedCaches,
  true,
  'old precaches are cleaned only after a coherent worker activation',
)

console.log('Service-worker navigation and silent lifecycle policy passed.')
