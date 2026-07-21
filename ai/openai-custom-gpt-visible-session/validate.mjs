import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(root, '../..')
const locales = ['de', 'en']
const instructionLimit = 8000
const expectedOperations = [
  'getVisibleState',
  'applyVisibleChoice',
  'setVisibleActiveGoal',
  'setVisibleMastery',
]
const expectedBundles = {
  de: {
    manifest: 'de/gpt-bundle.de.json',
    schema: 'skillpilot-api-4ai.de.json',
    gptId: 'g-693ebdcb2fac8191b3a765ce7f451fb2',
    gptUrl: 'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch',
    pathPrefix: '/api/ai/de/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Visible Session API (DE)',
  },
  en: {
    manifest: 'en/gpt-bundle.en.json',
    schema: 'skillpilot-api-4ai.en.json',
    gptId: 'g-69a565a532008191a3b994e83d20241c',
    gptUrl: 'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english',
    pathPrefix: '/api/ai/en/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Visible Session API (EN)',
  },
}
const expectedKnowledge = [
  'knowledge_docs/visible_session_protocol.md',
  'knowledge_docs/coaching_and_mastery.md',
  'knowledge_docs/errors_and_restart.md',
]

const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8')

const assertDescriptionsWithin = (value, locale, jsonPath = '$') => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDescriptionsWithin(item, locale, `${jsonPath}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'description' && typeof child === 'string') {
      assert.ok(child.length <= 300, `${locale} ${jsonPath}.description exceeds 300 characters`)
    }
    assertDescriptionsWithin(child, locale, `${jsonPath}.${key}`)
  }
}

const collectRefs = (value, refs = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRefs(item, refs))
    return refs
  }
  if (!value || typeof value !== 'object') return refs
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref' && typeof child === 'string') refs.push(child)
    collectRefs(child, refs)
  }
  return refs
}

const normalizeLocalizedSpecShape = (value, parentKey = '') => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLocalizedSpecShape(item, parentKey))
  }
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== 'description'
      && key !== 'summary'
      && !(parentKey === 'info' && key === 'title'))
    .map(([key, child]) => [
      key.replace('/api/ai/de/', '/api/ai/{locale}/').replace('/api/ai/en/', '/api/ai/{locale}/'),
      normalizeLocalizedSpecShape(child, key),
    ]))
}

const specs = new Map()
for (const locale of locales) {
  const expectedBundle = expectedBundles[locale]
  const bundle = JSON.parse(await read(expectedBundle.manifest))
  assert.equal(bundle.variant, 'visible-session', `${locale} bundle has wrong variant`)
  assert.equal(bundle.locale, locale, `${locale} bundle has wrong locale`)
  assert.deepEqual(bundle.existingGpt, {
    id: expectedBundle.gptId,
    url: expectedBundle.gptUrl,
  })
  assert.equal(bundle.instructions, 'system_instructions.md')
  assert.deepEqual(bundle.knowledge, expectedKnowledge)
  assert.deepEqual(bundle.action, {
    schema: expectedBundle.schema,
    pathPrefix: expectedBundle.pathPrefix,
    operationIds: expectedOperations,
  })

  await Promise.all([
    bundle.instructions,
    ...bundle.knowledge,
    bundle.action.schema,
  ].map((bundlePath) => read(`${locale}/${bundlePath}`)))

  const instructions = await read(`${locale}/system_instructions.md`)
  assert.ok(
    [...instructions].length <= instructionLimit,
    `${locale} instructions exceed ${instructionLimit} characters`,
  )
  for (const fragment of [
    'sps_',
    'selectionReference',
    'choiceNumber',
    'getVisibleState',
    'applyVisibleChoice',
    'setVisibleActiveGoal',
    'setVisibleMastery',
    '410',
    'skillpilot.com',
  ]) {
    assert.ok(instructions.includes(fragment), `${locale} instructions miss ${fragment}`)
  }
  assert.ok(!instructions.includes('redeemStartCode'), `${locale} instructions contain redeemStartCode`)

  const expectedAnchor = locale === 'de'
    ? '— SkillPilot · Sitzung:'
    : '— SkillPilot · Session:'
  assert.ok(instructions.includes(expectedAnchor), `${locale} instructions miss exact anchor`)

  const setupGuide = await read(`${locale}/gpt_setup_guide.md`)
  assert.ok(setupGuide.includes(expectedBundle.gptUrl), `${locale} setup guide misses existing GPT URL`)
  assert.ok(setupGuide.includes(expectedBundle.schema), `${locale} setup guide misses its exact API file`)
  const otherLocale = locale === 'de' ? 'en' : 'de'
  assert.ok(
    !setupGuide.includes(expectedBundles[otherLocale].schema),
    `${locale} setup guide references the ${otherLocale} Visible Session API`,
  )
  for (const obsoleteInstruction of [
    'neuer deutscher Custom GPT',
    'eine neue Action anlegen',
    'new English Custom GPT',
    'Create a new Action',
  ]) {
    assert.ok(
      !setupGuide.includes(obsoleteInstruction),
      `${locale} setup guide still contains: ${obsoleteInstruction}`,
    )
  }

  const rawSpec = await read(`${locale}/${expectedBundle.schema}`)
  const spec = JSON.parse(rawSpec)
  specs.set(locale, spec)
  assert.match(spec.openapi, /^3\.1\./, `${locale} schema must use OpenAPI 3.1`)
  assert.equal(spec.info.title, expectedBundle.apiTitle)
  assert.deepEqual(spec.servers, [{ url: 'https://skillpilot.com' }])
  assert.ok(!rawSpec.includes('redeemStartCode'), `${locale} schema contains redeemStartCode`)
  assert.ok(!rawSpec.includes('/chat-start/redeem'), `${locale} schema contains start-code redemption`)
  assert.ok(!rawSpec.includes('skillpilotId'), `${locale} schema exposes permanent SkillPilot ID`)
  assert.ok(!rawSpec.includes('curriculumId'), `${locale} schema exposes an internal curriculum ID`)
  assert.ok(!rawSpec.includes('scopeId'), `${locale} schema exposes an internal scope ID`)
  assert.ok(!rawSpec.includes('"nullable"'), `${locale} schema uses OpenAPI 3.0 nullable in a 3.1 document`)
  assert.equal(
    spec.components.parameters.ChatSessionToken.schema.pattern,
    '^sps_[A-Za-z0-9_-]{43}$',
  )
  assertDescriptionsWithin(spec, locale)

  const refs = collectRefs(spec)
  assert.ok(refs.length > 0, `${locale} API has no component references`)
  for (const ref of refs) {
    assert.ok(ref.startsWith('#/'), `${locale} API contains external or shared reference: ${ref}`)
  }

  const expectedPaths = [
    `${expectedBundle.pathPrefix}/state`,
    `${expectedBundle.pathPrefix}/choice`,
    `${expectedBundle.pathPrefix}/active-goal`,
    `${expectedBundle.pathPrefix}/mastery`,
  ]
  assert.deepEqual(Object.keys(spec.paths).sort(), expectedPaths.sort())

  const operations = []
  for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== 'object' || !operation.operationId) continue
      operations.push(operation.operationId)
      assert.equal(operation['x-openai-isConsequential'], false)
      assert.deepEqual(operation.security, [{ bearerAuth: [] }])
      assert.ok(operation.responses?.['410'], `${operation.operationId} misses 410 response`)
    }
  }
  assert.deepEqual(operations.sort(), [...expectedOperations].sort())

  const schemas = spec.components.schemas
  assert.deepEqual(
    Object.keys(schemas.VisibleCoachStateResponse.properties),
    ['relayFooter', 'learningState', 'requiredAction', 'curriculum', 'activeGoal', 'selection', 'allowedActions', 'instruction'],
  )
  assert.deepEqual(
    schemas.VisibleChoiceRequest.required,
    ['selectionReference', 'choiceNumber'],
  )
  assert.deepEqual(
    Object.keys(schemas.VisibleActiveGoalRequest.properties),
    ['goalId', 'redirect'],
  )
  assert.deepEqual(
    schemas.VisibleCoachStateResponse.properties.allowedActions.items.enum,
    expectedOperations,
  )
  assert.deepEqual(
    schemas.VisibleMasteryRequest.required,
    ['goalId', 'mastery'],
  )
  assert.ok(
    !schemas.VisibleChoiceOption.required.includes('goalId'),
    `${locale} goalId must stay optional for curriculum and scope choices`,
  )
  const referencedSchemas = new Set(refs
    .filter((ref) => ref.startsWith('#/components/schemas/'))
    .map((ref) => ref.slice('#/components/schemas/'.length)))
  assert.deepEqual(
    [...referencedSchemas].sort(),
    Object.keys(schemas).sort(),
    `${locale} API contains an unused or missing schema`,
  )
}

const operationIds = (spec) => Object.values(spec.paths)
  .flatMap((pathItem) => Object.values(pathItem))
  .filter((operation) => operation && typeof operation === 'object' && operation.operationId)
  .map((operation) => operation.operationId)
  .sort()

assert.deepEqual(operationIds(specs.get('de')), operationIds(specs.get('en')))
assert.deepEqual(
  normalizeLocalizedSpecShape(specs.get('de')),
  normalizeLocalizedSpecShape(specs.get('en')),
  'DE and EN API structures drifted beyond intentional localization',
)

const readme = await read('README.md')
for (const forbiddenFragment of [
  'VITE_VISIBLE_SESSION_GPT_URL_DE',
  'VITE_VISIBLE_SESSION_GPT_URL_EN',
  '<new-german-gpt>',
  '<new-english-gpt>',
]) {
  assert.ok(!readme.includes(forbiddenFragment), `README still contains ${forbiddenFragment}`)
}
for (const requiredFragment of [
  'No new GPT is created',
  'No environment variable is required for normal operation',
  expectedBundles.de.gptUrl,
  expectedBundles.en.gptUrl,
  expectedBundles.de.schema,
  expectedBundles.en.schema,
]) {
  assert.ok(readme.includes(requiredFragment), `README misses ${requiredFragment}`)
}

for (const forbiddenRootApi of [
  'ai/skillpilot-api-4ai.de.json',
  'ai/skillpilot-api-4ai.en.json',
]) {
  await assert.rejects(
    readFile(path.join(repositoryRoot, forbiddenRootApi)),
    (error) => error?.code === 'ENOENT',
    `${forbiddenRootApi} must not exist outside a variant package`,
  )
}

const legacyBaseline = await read('legacy-production-baseline.sha256')
for (const line of legacyBaseline.split(/\r?\n/).filter(Boolean)) {
  const match = line.match(/^([0-9a-f]{64}) {2}(.+)$/)
  assert.ok(match, `Invalid legacy baseline line: ${line}`)
  const [, expectedHash, relativePath] = match
  const contents = await readFile(path.join(repositoryRoot, relativePath))
  const actualHash = createHash('sha256').update(contents).digest('hex')
  assert.equal(
    actualHash,
    expectedHash,
    `Legacy coach source changed unexpectedly: ${relativePath}`,
  )
}

console.log('Visible Session GPT source contract is valid.')
