import assert from 'node:assert/strict'

import {
  serviceWorkerLifecyclePolicy,
  serviceWorkerRegisterType,
} from '../serviceWorkerLifecyclePolicy'
import { serviceWorkerNavigationFallbackDenylist } from '../serviceWorkerNavigationPolicy'
import { activateWaitingServiceWorkerAndReload } from '../src/utils/serviceWorkerUpdate'

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
  postedMessages: unknown[] = []
  activateOnPostMessage = true

  postMessage(message: unknown) {
    this.postedMessages.push(message)
    if (this.activateOnPostMessage) {
      this.state = 'activated'
      this.dispatchEvent(new Event('statechange'))
    }
  }
}

const nextMicrotask = async () => await Promise.resolve()

class FakeRegistration extends EventTarget {
  waiting: FakeWorker | null = null
  installing: FakeWorker | null = null
  updateCalls = 0
  updateAction: (() => void) | null = null

  async update() {
    this.updateCalls += 1
    this.updateAction?.()
    return this as unknown as ServiceWorkerRegistration
  }
}

class FakeServiceWorkerContainer extends EventTarget {
  controller: FakeWorker | null = new FakeWorker()
  registration: FakeRegistration | null = null

  async getRegistration() {
    return this.registration as unknown as ServiceWorkerRegistration | undefined
  }
}

const asServiceWorkerContainer = (container: FakeServiceWorkerContainer) =>
  container as unknown as ServiceWorkerContainer

{
  const worker = new FakeWorker()
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  registration.waiting = worker
  serviceWorker.registration = registration
  let reloads = 0

  await activateWaitingServiceWorkerAndReload({
    serviceWorker: asServiceWorkerContainer(serviceWorker),
    reload: () => { reloads += 1 },
    timeoutMs: 100,
  })

  assert.deepEqual(worker.postedMessages, [{ type: 'SKIP_WAITING' }])
  assert.equal(registration.updateCalls, 0, 'an already waiting worker is activated directly')
  assert.equal(reloads, 1, 'activation reloads exactly once')
}

{
  const worker = new FakeWorker()
  worker.state = 'installing'
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  serviceWorker.registration = registration
  registration.updateAction = () => {
    registration.installing = worker
    registration.dispatchEvent(new Event('updatefound'))
    worker.state = 'installed'
    worker.dispatchEvent(new Event('statechange'))
  }
  let reloads = 0

  await activateWaitingServiceWorkerAndReload({
    serviceWorker: asServiceWorkerContainer(serviceWorker),
    reload: () => { reloads += 1 },
    timeoutMs: 100,
  })

  assert.equal(registration.updateCalls, 1, 'the registration is checked for an update')
  assert.deepEqual(worker.postedMessages, [{ type: 'SKIP_WAITING' }])
  assert.equal(reloads, 1, 'a newly installed worker is activated before reloading')
}

{
  const serviceWorker = new FakeServiceWorkerContainer()
  let reloads = 0

  await activateWaitingServiceWorkerAndReload({
    serviceWorker: asServiceWorkerContainer(serviceWorker),
    reload: () => { reloads += 1 },
    timeoutMs: 100,
  })

  assert.equal(reloads, 1, 'a non-PWA page still falls back to a normal reload')
}

{
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  serviceWorker.registration = registration
  let reloads = 0

  await activateWaitingServiceWorkerAndReload({
    serviceWorker: asServiceWorkerContainer(serviceWorker),
    reload: () => { reloads += 1 },
    timeoutMs: 100,
  })

  assert.equal(registration.updateCalls, 1)
  assert.equal(reloads, 1, 'a completed update check with a current active worker reloads normally')
}

{
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  serviceWorker.registration = registration
  registration.updateAction = () => {
    throw new Error('network update failed')
  }
  let reloads = 0

  await assert.rejects(
    activateWaitingServiceWorkerAndReload({
      serviceWorker: asServiceWorkerContainer(serviceWorker),
      reload: () => { reloads += 1 },
      timeoutMs: 100,
    }),
    /network update failed/,
  )

  assert.equal(reloads, 0, 'a failed update check remains retryable instead of reloading stale HTML')
}

{
  const worker = new FakeWorker()
  worker.activateOnPostMessage = false
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  registration.waiting = worker
  serviceWorker.registration = registration
  let reloads = 0

  const activation = activateWaitingServiceWorkerAndReload({
    serviceWorker: asServiceWorkerContainer(serviceWorker),
    reload: () => { reloads += 1 },
    timeoutMs: 100,
  })

  await nextMicrotask()
  assert.equal(reloads, 0, 'posting SKIP_WAITING must not reload before activation')
  serviceWorker.dispatchEvent(new Event('controllerchange'))
  await activation
  assert.equal(reloads, 1, 'controllerchange completes the coherent reload')
}

{
  const worker = new FakeWorker()
  worker.activateOnPostMessage = false
  const registration = new FakeRegistration()
  const serviceWorker = new FakeServiceWorkerContainer()
  registration.waiting = worker
  serviceWorker.registration = registration
  let reloads = 0

  await assert.rejects(
    activateWaitingServiceWorkerAndReload({
      serviceWorker: asServiceWorkerContainer(serviceWorker),
      reload: () => { reloads += 1 },
      timeoutMs: 5,
    }),
    /Timed out while activating/,
  )

  assert.equal(reloads, 0, 'activation timeout remains retryable without serving the old shell')
}

console.log('Service-worker navigation and lifecycle policy passed.')
