import assert from 'node:assert/strict'

import {
  serviceWorkerActivationTimeoutMs,
  serviceWorkerInjectRegister,
  serviceWorkerLifecyclePolicy,
  serviceWorkerRegisterType,
  serviceWorkerUpdateCheckIntervalMs,
  serviceWorkerUpdatePreparationTimeoutMs,
} from '../serviceWorkerLifecyclePolicy'
import { serviceWorkerNavigationFallbackDenylist } from '../serviceWorkerNavigationPolicy'
import {
  activatePreparedServiceWorker,
  prepareLatestWaitingServiceWorker,
} from '../src/utils/serviceWorkerUpdatePreparation'

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
  'a new service worker must wait for a coherent client-version transition',
)
assert.equal(
  serviceWorkerInjectRegister,
  false,
  'the React update coordinator must own the only service-worker registration',
)
assert.equal(
  serviceWorkerUpdateCheckIntervalMs,
  5 * 60 * 1000,
  'visible clients should periodically ask the registered worker for updates',
)
assert.equal(
  serviceWorkerUpdatePreparationTimeoutMs,
  90 * 1000,
  'slow installations get time to finish without leaving the button pending forever',
)
assert.equal(
  serviceWorkerActivationTimeoutMs,
  20 * 1000,
  'a failed activation must become retryable instead of spinning forever',
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

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installed'
}

class FakeRegistration {
  installing: FakeWorker | null = null
  waiting: FakeWorker | null = null
  updateCalls = 0
  updateAction: (() => void) | null = null

  async update() {
    this.updateCalls += 1
    this.updateAction?.()
    return this as unknown as ServiceWorkerRegistration
  }
}

const asRegistration = (registration: FakeRegistration) =>
  registration as unknown as ServiceWorkerRegistration

{
  const waitingWorker = new FakeWorker()
  const registration = new FakeRegistration()
  registration.waiting = waitingWorker

  const preparedWorker = await prepareLatestWaitingServiceWorker(asRegistration(registration), 100)

  assert.equal(registration.updateCalls, 1, 'the click rechecks the server even when a worker is waiting')
  assert.equal(preparedWorker, waitingWorker)
}

{
  const oldWaitingWorker = new FakeWorker()
  const latestWorker = new FakeWorker()
  latestWorker.state = 'installing'
  const registration = new FakeRegistration()
  registration.waiting = oldWaitingWorker
  registration.updateAction = () => {
    registration.installing = latestWorker
    globalThis.setTimeout(() => {
      registration.waiting = latestWorker
      registration.installing = null
      latestWorker.state = 'installed'
      latestWorker.dispatchEvent(new Event('statechange'))
    }, 0)
  }

  const preparedWorker = await prepareLatestWaitingServiceWorker(asRegistration(registration), 100)

  assert.equal(preparedWorker, latestWorker, 'a newer worker replaces an older waiting version before activation')
}

{
  const registration = new FakeRegistration()

  assert.equal(
    await prepareLatestWaitingServiceWorker(asRegistration(registration), 100),
    null,
    'a stale prompt without a waiting worker must not trigger a blind activation',
  )
}

{
  const redundantWorker = new FakeWorker()
  redundantWorker.state = 'installing'
  const registration = new FakeRegistration()
  registration.updateAction = () => {
    registration.installing = redundantWorker
    globalThis.setTimeout(() => {
      redundantWorker.state = 'redundant'
      redundantWorker.dispatchEvent(new Event('statechange'))
    }, 0)
  }

  await assert.rejects(
    prepareLatestWaitingServiceWorker(asRegistration(registration), 100),
    /became redundant/,
  )
}

class FakeServiceWorkerContainer extends EventTarget {
  controller: ServiceWorker | null = null
}

{
  const worker = new FakeWorker()
  let postedMessage: unknown
  Object.assign(worker, {
    postMessage: (message: unknown) => {
      postedMessage = message
      globalThis.setTimeout(() => {
        worker.state = 'activated'
        worker.dispatchEvent(new Event('statechange'))
      }, 0)
    },
  })
  const serviceWorker = new FakeServiceWorkerContainer()

  await activatePreparedServiceWorker(
    serviceWorker as unknown as ServiceWorkerContainer,
    worker as unknown as ServiceWorker,
    100,
  )

  assert.deepEqual(postedMessage, { type: 'SKIP_WAITING' })
  assert.equal(worker.state, 'activated')
}

console.log('Service-worker navigation and lifecycle policy passed.')
