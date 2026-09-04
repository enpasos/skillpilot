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
  shouldRunApplicationCore('/plugins'),
  false,
  'the public plugin guide must not issue catalog, profile, or mastery requests',
)
assert.equal(
  shouldSyncRouteStateToUrl('/plugins/'),
  false,
  'the public plugin guide must not synchronize stored learner state into its URL',
)
assert.equal(
  shouldRunApplicationCore('/betreuung'),
  false,
  'the public teacher-supervision invitation must not issue catalog, profile, or mastery requests',
)
assert.equal(
  shouldSyncRouteStateToUrl('/betreuung/'),
  false,
  'the public teacher-supervision invitation must not synchronize stored learner state into its URL',
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
const coachSetupSource = readFileSync(new URL('../src/views/CoachProviderMatrixView.tsx', import.meta.url), 'utf8')
const germanLocaleSource = readFileSync(new URL('../src/locales/de.ts', import.meta.url), 'utf8')
const englishLocaleSource = readFileSync(new URL('../src/locales/en.ts', import.meta.url), 'utf8')

assert.match(
  appSource,
  /enabled:\s*shouldRunApplicationCore\(normalizedPath\)/u,
  'App must disable its core through the tested root-route policy',
)
assert.equal(
  (appSource.match(/<Route path="\/plugins" element=\{<PluginCatalogView \/>\} \/>/gu) ?? []).length,
  2,
  'App must expose the lazy plugin catalog in both public and authenticated router branches',
)
assert.match(
  appSource,
  /path === '\/plugins'\s*\? 'noindex, nofollow'/u,
  'the controlled plugin beta route must remain excluded from search indexing',
)
assert.match(
  appSource,
  /'Claude Marketplace beta'\s*:\s*'Claude-Marketplace-Beta'/u,
  'the plugin guide metadata must describe the Marketplace beta rather than the retired primary download route',
)
assert.match(
  appSource,
  /Guided setup and updates for the SkillPilot Claude Coach through the SkillPilot Marketplace/u,
  'the English plugin guide description must identify Marketplace setup and updates',
)
assert.match(
  appSource,
  /Geführte Einrichtung und Updates des SkillPilot Claude Coach über den SkillPilot Marketplace/u,
  'the German plugin guide description must identify Marketplace setup and updates',
)
assert.doesNotMatch(
  coachSetupSource,
  /to="\/plugins"/u,
  'the controlled plugin beta route must not be promoted from the public account comparison',
)
assert.match(
  germanLocaleSource,
  /nur die Claude-Beta.*kostenpflichtiger Claude-Tarif erforderlich.*unterstützt und getestet ist derzeit Claude Pro.*ChatGPT-Zugang wartet noch auf Freigabe.*kann derzeit nicht genutzt werden/u,
  'the German start banner must state that only the Claude Pro beta works while ChatGPT awaits approval',
)
assert.match(
  englishLocaleSource,
  /only the Claude beta is available.*paid Claude plan is required.*Claude Pro is the plan currently supported and tested.*ChatGPT access is awaiting approval.*cannot currently be used/u,
  'the English start banner must state that only the Claude Pro beta works while ChatGPT awaits approval',
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
assert.match(
  appCoreSource,
  /allowImplicitRoot:\s*role !== 'trainer'/u,
  'a trainer overview must not acquire the sole package root as a hidden global course context',
)

console.log('Root route policy passed: 25 guarantees.')
