import assert from 'node:assert/strict'

import {
  serviceWorkerInjectRegister,
  serviceWorkerLifecyclePolicy,
  serviceWorkerRegisterType,
} from '../serviceWorkerLifecyclePolicy'
import {
  serviceWorkerNavigationFallbackDenylist,
  serviceWorkerPrecacheGlobIgnores,
} from '../serviceWorkerNavigationPolicy'

const isDenied = (urlPath: string) =>
  serviceWorkerNavigationFallbackDenylist.some(pattern => pattern.test(urlPath))

const networkOnlyNavigations = [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-authorization-server/api/openai/v1',
  '/api/openai/v1/oauth2/authorize',
  '/api/openai/v1/oauth2/token',
  '/internal/openai/v1/mcp',
  '/api/ui/learners/example',
  '/learner?l=example-focus',
  '/learner/example-goal',
  '/learner/example-goal?l=example-focus',
  '/api/public/openai/review/skillpilot-coach-v1/1.0.0/example.mp4',
  '/api/public/quickstart/videos/skillpilot-coach-v1/1.0.0/de/example.mp4',
]

for (const urlPath of networkOnlyNavigations) {
  assert.equal(
    isDenied(urlPath),
    true,
    `${urlPath} must always load through the network instead of a cached SPA shell`,
  )
}

const applicationNavigations = [
  '/',
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

assert.ok(
  serviceWorkerPrecacheGlobIgnores.includes('lernzielbuch/**'),
  'large learning-goal publications must stay outside the application-shell precache',
)

console.log('Service-worker navigation and silent lifecycle policy passed.')
