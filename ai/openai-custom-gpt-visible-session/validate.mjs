import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(root, '../..')
const locales = ['de', 'en']
const legacyTextExtensions = new Set(['.json', '.md', '.ts'])
const instructionLimit = 8000
const instructionByteLimit = 7900
const goalIdPattern = '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'
const interactionModes = [
  'selection',
  'chat',
  'cockpit',
  'exam',
  'verifiedRecall',
  'complete',
]
const expectedOperations = [
  'getVisibleState',
  'applyVisibleChoice',
  'requestVisibleNavigation',
  'setVisibleActiveGoal',
  'setVisibleMastery',
  'startVisibleVerifiedRecall',
  'getVisibleVerifiedRecallAnswer',
  'recordVisibleVerifiedRecallResult',
  'getVisibleExamEvaluation',
]
const expectedPathSuffixes = [
  '/state',
  '/choice',
  '/navigation',
  '/active-goal',
  '/mastery',
  '/verified-recall/start',
  '/verified-recall/answer',
  '/verified-recall/result',
  '/exam/evaluation',
]
const expectedKnowledge = [
  'knowledge_docs/visible_session_protocol.md',
  'knowledge_docs/state_personalization_and_progress.md',
  'knowledge_docs/coaching_and_mastery.md',
  'knowledge_docs/deep_linking_and_resources.md',
  'knowledge_docs/verified_recall.md',
  'knowledge_docs/exam_proctor.md',
  'knowledge_docs/errors_and_restart.md',
]
const expectedBundles = {
  de: {
    manifest: 'de/gpt-bundle.de.json',
    schema: 'skillpilot-api-4ai.de.json',
    gptId: 'g-693ebdcb2fac8191b3a765ce7f451fb2',
    gptUrl: 'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch',
    pathPrefix: '/api/ai/de/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Visible Session API (DE)',
    tokenDescription: 'Exaktes sichtbares temporäres Sitzungstoken aus dem aktuellen Chat; beginnt mit sps_.',
    anchor: '— SkillPilot · Sitzung:',
    refreshRule: 'Vor jeder substantiellen Antwort',
  },
  en: {
    manifest: 'en/gpt-bundle.en.json',
    schema: 'skillpilot-api-4ai.en.json',
    gptId: 'g-69a565a532008191a3b994e83d20241c',
    gptUrl: 'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english',
    pathPrefix: '/api/ai/en/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Visible Session API (EN)',
    tokenDescription: 'Exact visible temporary session token from the current chat; begins with sps_.',
    anchor: '— SkillPilot · Session:',
    refreshRule: 'Before every substantive answer',
  },
}
const knowledgeFragments = {
  'knowledge_docs/visible_session_protocol.md': [
    'getVisibleState',
    'applyVisibleChoice',
    'choiceNumber',
    'choiceNumbers',
    'requestVisibleNavigation',
    'getVisibleExamEvaluation',
    'getVisibleVerifiedRecallAnswer',
  ],
  'knowledge_docs/state_personalization_and_progress.md': [
    'requestVisibleNavigation',
    'personalization',
    'choiceNumbers',
    'progress.scope',
    'completion.scopeComplete',
    'completion.curriculumComplete',
  ],
  'knowledge_docs/coaching_and_mastery.md': [
    'setVisibleMastery',
    '1.0',
  ],
  'knowledge_docs/deep_linking_and_resources.md': [
    'interactionMode',
    'requiresCockpit',
    'IMAGE_PATH',
    'getVisibleState',
  ],
  'knowledge_docs/verified_recall.md': [
    'startVisibleVerifiedRecall',
    'getVisibleVerifiedRecallAnswer',
    'recordVisibleVerifiedRecallResult',
    'expectedAnswer',
    'cardId',
    'masterySaved',
  ],
  'knowledge_docs/exam_proctor.md': [
    'getVisibleExamEvaluation',
    'solutionContent',
    'passingPoints',
    'setVisibleMastery',
    'IMAGE_PATH',
  ],
  'knowledge_docs/errors_and_restart.md': [
    '409',
    '410',
    '401',
    'skillpilot.com',
  ],
}

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

const collectPropertiesNamed = (value, propertyName, matches = [], jsonPath = '$') => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPropertiesNamed(item, propertyName, matches, `${jsonPath}[${index}]`))
    return matches
  }
  if (!value || typeof value !== 'object') return matches
  if (value.properties?.[propertyName]) {
    matches.push({ path: `${jsonPath}.properties.${propertyName}`, schema: value.properties[propertyName] })
  }
  for (const [key, child] of Object.entries(value)) {
    collectPropertiesNamed(child, propertyName, matches, `${jsonPath}.${key}`)
  }
  return matches
}

const normalizeLocalizedSpecShape = (value, parentKey = '') => {
  if (Array.isArray(value)) return value.map((item) => normalizeLocalizedSpecShape(item, parentKey))
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

const operationIds = (spec) => Object.values(spec.paths)
  .flatMap((pathItem) => Object.values(pathItem))
  .filter((operation) => operation && typeof operation === 'object' && operation.operationId)
  .map((operation) => operation.operationId)
  .sort()

const specs = new Map()
for (const locale of locales) {
  const expectedBundle = expectedBundles[locale]
  const bundle = JSON.parse(await read(expectedBundle.manifest))
  assert.equal(bundle.variant, 'visible-session', `${locale} bundle has wrong variant`)
  assert.equal(bundle.locale, locale, `${locale} bundle has wrong locale`)
  assert.deepEqual(bundle.existingGpt, { id: expectedBundle.gptId, url: expectedBundle.gptUrl })
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
  assert.ok([...instructions].length <= instructionLimit, `${locale} instructions exceed ${instructionLimit} characters`)
  assert.ok(
    Buffer.byteLength(instructions, 'utf8') <= instructionByteLimit,
    `${locale} instructions exceed the ${instructionByteLimit}-byte safety limit`,
  )
  for (const fragment of [
    'sps_',
    'selectionReference',
    'choiceNumber',
    'choiceNumbers',
    'interactionMode',
    'requiresCockpit',
    'expectedAnswer',
    'solutionContent',
    'progress',
    'completion',
    'IMAGE_PATH',
    '410',
    'skillpilot.com',
    ...expectedOperations,
  ]) {
    assert.ok(instructions.includes(fragment), `${locale} instructions miss ${fragment}`)
  }
  assert.ok(instructions.includes(expectedBundle.anchor), `${locale} instructions miss exact anchor`)
  assert.ok(instructions.includes(expectedBundle.refreshRule), `${locale} instructions miss normal-turn refresh gate`)
  assert.ok(!instructions.includes('redeemStartCode'), `${locale} instructions contain redeemStartCode`)
  assert.ok(!/\buuid\b/i.test(instructions), `${locale} instructions incorrectly require UUID goal IDs`)

  for (const [knowledgePath, fragments] of Object.entries(knowledgeFragments)) {
    const knowledge = await read(`${locale}/${knowledgePath}`)
    for (const fragment of fragments) {
      assert.ok(knowledge.includes(fragment), `${locale} ${knowledgePath} misses ${fragment}`)
    }
  }

  const setupGuide = await read(`${locale}/gpt_setup_guide.md`)
  assert.ok(setupGuide.includes(expectedBundle.gptUrl), `${locale} setup guide misses existing GPT URL`)
  assert.ok(setupGuide.includes(expectedBundle.schema), `${locale} setup guide misses its exact API file`)
  for (const operationId of expectedOperations) {
    assert.ok(setupGuide.includes(operationId), `${locale} setup guide misses ${operationId}`)
  }
  for (const knowledgePath of expectedKnowledge) {
    assert.ok(setupGuide.includes(knowledgePath), `${locale} setup guide misses ${knowledgePath}`)
  }
  assert.ok(setupGuide.includes('choiceNumbers'), `${locale} setup guide misses multi-scope acceptance`)
  const otherLocale = locale === 'de' ? 'en' : 'de'
  assert.ok(!setupGuide.includes(expectedBundles[otherLocale].schema), `${locale} setup guide references the ${otherLocale} API`)

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
  assert.ok(!rawSpec.includes('"nullable"'), `${locale} schema uses OpenAPI 3.0 nullable`)
  assert.ok(!rawSpec.includes('"oneOf"'), `${locale} schema uses Builder-problematic oneOf`)
  assert.ok(!/"format"\s*:\s*"uuid"/i.test(rawSpec), `${locale} schema rejects stable non-UUID goal IDs`)
  assert.ok(!spec.components.parameters, `${locale} API must not use reusable parameters`)
  assertDescriptionsWithin(spec, locale)

  const refs = collectRefs(spec)
  assert.ok(refs.length > 0, `${locale} API has no component references`)
  for (const ref of refs) assert.ok(ref.startsWith('#/'), `${locale} API contains external/shared reference: ${ref}`)

  const expectedPaths = expectedPathSuffixes.map((suffix) => `${expectedBundle.pathPrefix}${suffix}`)
  assert.deepEqual(Object.keys(spec.paths).sort(), expectedPaths.sort())

  const operations = []
  for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== 'object' || !operation.operationId) continue
      operations.push(operation.operationId)
      assert.equal(operation['x-openai-isConsequential'], false, `${locale} ${operation.operationId} must be non-consequential`)
      assert.deepEqual(operation.security, [{ bearerAuth: [] }])
      assert.ok(operation.responses?.['410'], `${locale} ${operation.operationId} misses 410 response`)
      assert.deepEqual(operation.parameters, [{
        name: 'chatSessionToken',
        in: 'path',
        required: true,
        description: expectedBundle.tokenDescription,
        schema: { type: 'string', pattern: '^sps_[A-Za-z0-9_-]{43}$' },
      }], `${locale} ${operation.operationId} must inline the Builder-visible path parameter`)
    }
  }
  assert.deepEqual(operations.sort(), [...expectedOperations].sort())

  const schemas = spec.components.schemas
  assert.deepEqual(Object.keys(schemas.VisibleCoachStateResponse.properties), [
    'relayFooter',
    'learningState',
    'requiredAction',
    'interactionMode',
    'curriculum',
    'activeGoal',
    'resources',
    'selection',
    'progress',
    'completion',
    'allowedActions',
    'instruction',
  ])
  assert.deepEqual(schemas.VisibleCoachStateResponse.properties.interactionMode.enum, interactionModes)
  assert.deepEqual(schemas.VisibleCoachStateResponse.properties.allowedActions.items.enum, expectedOperations)
  assert.deepEqual(schemas.VisibleChoiceRequest.required, ['selectionReference'])
  assert.deepEqual(Object.keys(schemas.VisibleChoiceRequest.properties), ['selectionReference', 'choiceNumber', 'choiceNumbers'])
  assert.equal(schemas.VisibleChoiceRequest.properties.choiceNumbers.minItems, 1)
  assert.equal(schemas.VisibleChoiceRequest.properties.choiceNumbers.uniqueItems, true)
  assert.deepEqual(schemas.VisibleNavigationRequest.properties.target.enum, ['curriculum', 'personalization', 'scope', 'goal'])
  assert.deepEqual(Object.keys(schemas.VisibleActiveGoalRequest.properties), ['goalId', 'redirect'])
  assert.deepEqual(schemas.VisibleMasteryRequest.required, ['goalId'])
  assert.deepEqual(Object.keys(schemas.VisibleMasteryRequest.properties), ['goalId'])
  assert.ok(!schemas.VisibleChoiceOption.required.includes('goalId'), `${locale} goalId must stay optional for non-goal choices`)

  assert.deepEqual(schemas.VisibleProgress.required, ['masteredAtomic', 'totalAtomic', 'scopeCompleted'])
  assert.ok(schemas.VisibleCoachStateResponse.properties.resources, `${locale} state misses top-level resources`)
  assert.ok(!schemas.PublicActiveGoal.properties.resources, `${locale} resources must not be nested under activeGoal`)
  assert.equal(schemas.PublicActiveGoal.properties.examData.$ref, '#/components/schemas/VisibleExamPresentation')
  assert.deepEqual(Object.keys(schemas.VisibleExamPresentation.properties), ['taskContent', 'maxPoints', 'hasImage'])
  assert.ok(!schemas.VisibleExamPresentation.properties.solutionContent, `${locale} state exam data leaks solutionContent`)
  assert.ok(schemas.VisibleExamEvaluationResponse.properties.solutionContent, `${locale} evaluation misses protected solutionContent`)
  assert.ok(schemas.VisibleExamEvaluationResponse.properties.scoring, `${locale} evaluation misses scoring`)

  const expectedAnswerOwners = Object.entries(schemas)
    .filter(([, schema]) => schema.properties?.expectedAnswer)
    .map(([name]) => name)
  assert.deepEqual(expectedAnswerOwners, ['VisibleVerifiedRecallAnswerResponse'])
  const solutionOwners = Object.entries(schemas)
    .filter(([, schema]) => schema.properties?.solutionContent)
    .map(([name]) => name)
  assert.deepEqual(solutionOwners, ['VisibleExamEvaluationResponse'])
  assert.deepEqual(schemas.VisibleVerifiedRecallCard.required, ['cardId', 'prompt'])
  assert.deepEqual(
    schemas.VisibleVerifiedRecallPromptResponse.required,
    [
      'relayFooter', 'status', 'instruction', 'goalId', 'totalCards',
      'verifiedCards', 'pendingCards', 'eligibleCards', 'blockedCards', 'batchSize', 'cards',
    ],
  )
  assert.deepEqual(
    Object.keys(schemas.VisibleVerifiedRecallPromptResponse.properties),
    [
      'relayFooter', 'status', 'instruction', 'goalId', 'goalTitle',
      'totalCards', 'verifiedCards', 'pendingCards', 'eligibleCards', 'blockedCards',
      'nextEligibleAt', 'batchSize', 'cards',
    ],
  )
  assert.deepEqual(
    Object.keys(schemas.VisibleVerifiedRecallState.properties),
    [
      'status', 'goalId', 'goalTitle', 'totalCards', 'verifiedCards', 'pendingCards',
      'eligibleCards', 'blockedCards', 'nextEligibleAt', 'batchSize', 'cards',
    ],
  )
  assert.deepEqual(
    schemas.VisibleVerifiedRecallState.required,
    [
      'status', 'goalId', 'totalCards', 'verifiedCards', 'pendingCards',
      'eligibleCards', 'blockedCards', 'batchSize', 'cards',
    ],
  )
  assert.ok(!schemas.VisibleVerifiedRecallState.properties.relayFooter)
  assert.ok(!schemas.VisibleVerifiedRecallState.properties.instruction)
  assert.ok(!schemas.VisibleVerifiedRecallPromptResponse.properties.cardId)
  assert.ok(!schemas.VisibleVerifiedRecallPromptResponse.properties.prompt)
  assert.ok(!schemas.VisibleVerifiedRecallPromptResponse.properties.category)
  assert.ok(schemas.VisibleVerifiedRecallAnswerResponse.required.includes('relayFooter'))
  assert.deepEqual(
    Object.keys(schemas.VisibleVerifiedRecallAnswerResponse.properties),
    ['relayFooter', 'instruction', 'goalId', 'cardId', 'prompt', 'expectedAnswer', 'category'],
  )
  assert.ok(schemas.VisibleVerifiedRecallResultResponse.required.includes('relayFooter'))
  assert.deepEqual(
    Object.keys(schemas.VisibleVerifiedRecallResultResponse.properties),
    [
      'relayFooter', 'savedCardId', 'passed', 'verifiedCards', 'pendingCards',
      'masterySaved', 'masteryGoalId', 'instruction', 'next',
    ],
  )
  assert.equal(
    schemas.VisibleVerifiedRecallResultResponse.properties.next.$ref,
    '#/components/schemas/VisibleVerifiedRecallState',
  )

  for (const { path: propertyPath, schema } of [
    ...collectPropertiesNamed(schemas, 'goalId'),
    ...collectPropertiesNamed(schemas, 'masteryGoalId'),
  ]) {
    assert.equal(schema.type, 'string', `${locale} ${propertyPath} must be a string`)
    assert.equal(schema.minLength, 1, `${locale} ${propertyPath} must reject blank IDs`)
    assert.equal(schema.maxLength, 160, `${locale} ${propertyPath} must bound ID length`)
    assert.equal(schema.pattern, goalIdPattern, `${locale} ${propertyPath} has wrong ID pattern`)
    assert.ok(!schema.format, `${locale} ${propertyPath} must not require UUID format`)
  }

  const referencedSchemas = new Set(refs
    .filter((ref) => ref.startsWith('#/components/schemas/'))
    .map((ref) => ref.slice('#/components/schemas/'.length)))
  assert.deepEqual([...referencedSchemas].sort(), Object.keys(schemas).sort(), `${locale} API contains an unused or missing schema`)
}

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
  'Phase 1',
]) {
  assert.ok(!readme.includes(forbiddenFragment), `README still contains ${forbiddenFragment}`)
}
for (const requiredFragment of [
  'No new GPT is created',
  'No environment variable is required for normal operation',
  'exactly nine operations',
  expectedBundles.de.gptUrl,
  expectedBundles.en.gptUrl,
  expectedBundles.de.schema,
  expectedBundles.en.schema,
  ...expectedOperations,
]) {
  assert.ok(readme.includes(requiredFragment), `README misses ${requiredFragment}`)
}

for (const forbiddenRootApi of ['ai/skillpilot-api-4ai.de.json', 'ai/skillpilot-api-4ai.en.json']) {
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
  const canonicalContents = legacyTextExtensions.has(path.extname(relativePath))
    ? Buffer.from(contents.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
    : contents
  const actualHash = createHash('sha256').update(canonicalContents).digest('hex')
  assert.equal(actualHash, expectedHash, `Legacy coach source changed unexpectedly: ${relativePath}`)
}

console.log('Visible Session GPT source contract is valid and DE/EN workflow-parallel.')
