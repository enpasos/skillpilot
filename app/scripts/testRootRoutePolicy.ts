import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  shouldRunApplicationCore,
  shouldRenderSessionSetup,
  shouldSyncRouteStateToUrl,
} from '../src/utils/rootRoutePolicy'

assert.equal(
  shouldRenderSessionSetup({
    pathname: '/',
    hasActiveSession: true,
    canRenderAnonymousExplorer: false,
  }),
  true,
  'the root URL must remain the setup page when a learner session is stored',
)
assert.equal(
  shouldRenderSessionSetup({
    pathname: '/',
    hasActiveSession: false,
    canRenderAnonymousExplorer: false,
  }),
  true,
  'the root URL must remain the setup page without a stored session',
)
assert.equal(
  shouldSyncRouteStateToUrl('/'),
  false,
  'stored landscape and filter state must not be appended to the root URL',
)
assert.equal(
  shouldRunApplicationCore('/'),
  false,
  'the application core must not issue catalog, profile, or mastery requests on the start page',
)
assert.equal(
  shouldRunApplicationCore('/lernzielbuch'),
  false,
  'the public learning-goal book must not issue catalog, profile, or mastery requests',
)
assert.equal(
  shouldSyncRouteStateToUrl('/lernzielbuch/'),
  false,
  'the learning-goal book must not synchronize stored learner state into its URL',
)
assert.equal(
  shouldRunApplicationCore('/lernziel-feedback'),
  false,
  'the feedback-pilot placeholder must not issue learner or mastery requests',
)
assert.equal(
  shouldRunApplicationCore('/lernen/claude'),
  false,
  'the first-party Claude start page must not issue catalog, profile, or mastery requests',
)
assert.equal(
  shouldSyncRouteStateToUrl('/lernen/claude/'),
  false,
  'the Claude start page must not synchronize permanent learner state into its URL',
)
assert.equal(
  shouldRenderSessionSetup({
    pathname: '/learner',
    hasActiveSession: true,
    canRenderAnonymousExplorer: false,
  }),
  false,
  'an explicit learner URL must open the learner application',
)
assert.equal(
  shouldRenderSessionSetup({
    pathname: '/learner/example-goal',
    hasActiveSession: true,
    canRenderAnonymousExplorer: false,
  }),
  false,
  'an explicit learner goal URL must open the learner application',
)
assert.equal(
  shouldRenderSessionSetup({
    pathname: '/explorer',
    hasActiveSession: false,
    canRenderAnonymousExplorer: true,
  }),
  false,
  'an explicitly scoped anonymous explorer URL must remain available',
)
assert.equal(
  shouldRenderSessionSetup({
    pathname: '/explorer',
    hasActiveSession: false,
    canRenderAnonymousExplorer: false,
  }),
  true,
  'an anonymous explorer URL without a selected landscape must use setup',
)
assert.equal(
  shouldSyncRouteStateToUrl('/learner'),
  true,
  'the learner application may synchronize its selected landscape to the URL',
)
assert.equal(
  shouldRunApplicationCore('/learner'),
  true,
  'an explicit learner URL must activate the application core',
)

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const appCoreSource = readFileSync(new URL('../src/hooks/useAppCore.ts', import.meta.url), 'utf8')

assert.match(
  appSource,
  /enabled:\s*shouldRunApplicationCore\(normalizedPath\)/u,
  'App must disable its core through the tested root-route policy',
)
assert.match(
  appSource,
  /if \(isRootRoute\(normalizedPath\)\) \{\s*return sessionSetupElement\s*\}/u,
  'App must render setup directly for the root route',
)
assert.doesNotMatch(
  appSource,
  /<Route path="\/" element=\{<Navigate/u,
  'App must not contain a fallback root redirect',
)
assert.match(
  appCoreSource,
  /if \(!shouldSyncRouteStateToUrl\(location\.pathname\)\) \{/u,
  'App core must not synchronize stored route state into the root URL',
)

console.log('Root route policy passed: 19 guarantees.')
