import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(root, '../..')
const locales = ['de', 'en']
const inheritedManifestKey = ['existing', 'Gpt'].join('')
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
const expectedSessionOperations = [
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
const expectedOperations = ['redeemStartCode', ...expectedSessionOperations]
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
    gptName: 'SkillPilot GPT Coach (de)',
    cleanCreation: 'neuen deutschen Custom GPT von Grund auf',
    pathPrefix: '/api/ai/de/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Action Session API (DE)',
    redeemPath: '/api/ai/de/chat-start/redeem',
    tokenDescription: 'Exaktes temporäres Sitzungstoken aus dem letzten Action-Response oder dem ausdrücklich sichtbaren Notfallstart; beginnt mit sps_.',
    anchor: '— SkillPilot · Sitzung:',
    refreshRule: 'Vor jeder substantiellen Antwort',
  },
  en: {
    manifest: 'en/gpt-bundle.en.json',
    schema: 'skillpilot-api-4ai.en.json',
    gptName: 'SkillPilot GPT Coach (en)',
    cleanCreation: 'new English Custom GPT from scratch',
    pathPrefix: '/api/ai/en/sessions/{chatSessionToken}/visible',
    apiTitle: 'SkillPilot Action Session API (EN)',
    redeemPath: '/api/ai/en/chat-start/redeem',
    tokenDescription: 'Exact temporary session token from the latest Action response or explicitly visible emergency startup; begins with sps_.',
    anchor: '— SkillPilot · Session:',
    refreshRule: 'Before every substantive answer',
  },
}
const expectedExamFairness = {
  de: {
    system: 'Gleichwertige Wege zählen voll',
    requiredForm: 'explizite Antwortformen gelten',
    reference: 'Referenzlösung',
    docRequiredForm: 'Aufgabe oder Raster sie ausdrücklich bewertet',
    noQuestions: 'ohne Rückfragen',
    schemaReference: 'Referenzlösung',
  },
  en: {
    system: 'Equivalent correct routes earn full credit',
    requiredForm: 'explicit answer forms remain binding',
    reference: 'reference solution',
    docRequiredForm: 'task or rubric explicitly assesses it',
    noQuestions: 'without follow-up questions',
    schemaReference: 'reference solution',
  },
}
const expectedNaturalIntake = {
  de: {
    system: 'fortgeltende Absicht',
    protocol: 'frischen Folgezustand',
    state: 'im selben Assistententurn durchlaufen',
    schema: 'jüngsten Action-Response',
    guide: 'Ich möchte Mathe in der Oberstufe in Hessen lernen.',
    numberGuard: 'reine Nummernantwort gilt nur einmal',
  },
  en: {
    system: 'standing intent',
    protocol: 'fresh next state',
    state: 'within one assistant turn',
    schema: 'latest Action response',
    guide: 'I want to learn maths at upper-secondary level in Hesse.',
    numberGuard: 'A numbers-only reply is consumed by one choice',
  },
}
const expectedFirstContactTransparency = {
  de: [
    'Erstkontakt',
    'Ich bin KI-Assistent und kann mich irren.',
    'Hinweis später nicht wiederholen.',
  ],
  en: [
    'At first contact',
    'I am an AI assistant and can make mistakes.',
    'Do not routinely repeat this later.',
  ],
}
const knowledgeFragments = {
  'knowledge_docs/visible_session_protocol.md': [
    'redeemStartCode',
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
    'Personal Curriculum',
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
  assert.equal(bundle.variant, 'action-session-with-visible-fallback', `${locale} bundle has wrong variant`)
  assert.equal(bundle.locale, locale, `${locale} bundle has wrong locale`)
  assert.deepEqual(bundle.gpt, {
    creation: 'new',
    name: expectedBundle.gptName,
    initialVisibility: 'private',
  })
  assert.ok(!(inheritedManifestKey in bundle), `${locale} bundle still assumes an inherited GPT identity`)
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
    'SP-....-....',
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
  assert.ok(
    instructions.replace(/\s+/g, ' ').includes(expectedExamFairness[locale].system),
    `${locale} instructions miss fair exam grading rule`,
  )
  assert.ok(
    instructions.replace(/\s+/g, ' ').includes(expectedExamFairness[locale].requiredForm),
    `${locale} instructions miss explicitly-required-form rule`,
  )
  assert.ok(
    instructions.replace(/\s+/g, ' ').includes(expectedNaturalIntake[locale].system),
    `${locale} instructions miss same-turn natural-intent chaining`,
  )
  assert.ok(
    instructions.replace(/\s+/g, ' ').includes(expectedNaturalIntake[locale].numberGuard),
    `${locale} instructions might incorrectly relay a numbers-only reply`,
  )
  for (const fragment of expectedFirstContactTransparency[locale]) {
    assert.ok(
      instructions.replace(/\s+/g, ' ').includes(fragment),
      `${locale} instructions miss first-contact transparency fragment: ${fragment}`,
    )
  }
  assert.doesNotMatch(instructions, /banner|disclaimer|haftung|liabilit/i)
  assert.ok(instructions.includes('private') || instructions.includes('privaten'), `${locale} instructions miss private mode`)
  assert.ok(instructions.includes('emergency mode') || instructions.includes('Notfallmodus'), `${locale} instructions miss visible fallback`)
  assert.ok(!/\buuid\b/i.test(instructions), `${locale} instructions incorrectly require UUID goal IDs`)

  for (const [knowledgePath, fragments] of Object.entries(knowledgeFragments)) {
    const knowledge = await read(`${locale}/${knowledgePath}`)
    for (const fragment of fragments) {
      assert.ok(knowledge.includes(fragment), `${locale} ${knowledgePath} misses ${fragment}`)
    }
  }
  const visibleProtocol = await read(`${locale}/knowledge_docs/visible_session_protocol.md`)
  const stateAndPersonalization = await read(`${locale}/knowledge_docs/state_personalization_and_progress.md`)
  assert.ok(visibleProtocol.includes('chatSessionToken'), `${locale} session protocol misses retained token`)
  assert.ok(visibleProtocol.includes('skillpilot.com'), `${locale} session protocol misses fail-closed restart`)
  assert.ok(
    stateAndPersonalization.includes('WebGUI'),
    `${locale} state protocol misses first-party Personal Curriculum boundary`,
  )
  assert.ok(
    visibleProtocol.replace(/\s+/g, ' ').includes(expectedNaturalIntake[locale].protocol),
    `${locale} visible-session protocol misses fresh same-turn chaining`,
  )
  assert.ok(
    stateAndPersonalization.replace(/\s+/g, ' ').includes(expectedNaturalIntake[locale].state),
    `${locale} state protocol misses compound natural-intent handling`,
  )
  const examProctor = await read(`${locale}/knowledge_docs/exam_proctor.md`)
  const normalizedExamProctor = examProctor.replace(/\s+/g, ' ')
  assert.ok(normalizedExamProctor.includes(expectedExamFairness[locale].reference), `${locale} exam proctor misses reference-solution rule`)
  assert.ok(normalizedExamProctor.includes(expectedExamFairness[locale].docRequiredForm), `${locale} exam proctor misses explicitly-required-form rule`)
  assert.ok(examProctor.includes(expectedExamFairness[locale].noQuestions), `${locale} exam proctor misses no-question exam rule`)

  const setupGuide = await read(`${locale}/gpt_setup_guide.md`)
  assert.ok(setupGuide.includes(expectedBundle.cleanCreation), `${locale} setup guide misses clean creation rule`)
  assert.ok(setupGuide.includes(expectedBundle.gptName), `${locale} setup guide misses the new GPT name`)
  assert.ok(!setupGuide.includes('https://chatgpt.com/g/'), `${locale} setup guide contains a pre-existing GPT URL`)
  assert.ok(
    setupGuide.replace(/\s+/g, ' ').includes(expectedNaturalIntake[locale].guide),
    `${locale} setup guide misses the natural onboarding acceptance case`,
  )
  assert.ok(setupGuide.includes(expectedBundle.schema), `${locale} setup guide misses its exact API file`)
  for (const operationId of expectedOperations) {
    assert.ok(setupGuide.includes(operationId), `${locale} setup guide misses ${operationId}`)
  }
  for (const knowledgePath of expectedKnowledge) {
    assert.ok(setupGuide.includes(knowledgePath), `${locale} setup guide misses ${knowledgePath}`)
  }
  assert.ok(setupGuide.includes('choiceNumbers'), `${locale} setup guide misses multi-scope acceptance`)
  assert.ok(setupGuide.includes('retention') || setupGuide.includes('Retention'), `${locale} setup guide misses cross-turn canary`)
  const otherLocale = locale === 'de' ? 'en' : 'de'
  assert.ok(!setupGuide.includes(expectedBundles[otherLocale].schema), `${locale} setup guide references the ${otherLocale} API`)

  const rawSpec = await read(`${locale}/${expectedBundle.schema}`)
  const spec = JSON.parse(rawSpec)
  specs.set(locale, spec)
  assert.match(spec.openapi, /^3\.1\./, `${locale} schema must use OpenAPI 3.1`)
  assert.equal(spec.info.title, expectedBundle.apiTitle)
  assert.deepEqual(spec.servers, [{ url: 'https://skillpilot.com' }])
  assert.ok(rawSpec.includes('redeemStartCode'), `${locale} schema misses redeemStartCode`)
  assert.ok(rawSpec.includes(expectedBundle.redeemPath), `${locale} schema misses start-code redemption path`)
  assert.ok(!rawSpec.includes('skillpilotId'), `${locale} schema exposes permanent SkillPilot ID`)
  assert.ok(!rawSpec.includes('curriculumId'), `${locale} schema exposes an internal curriculum ID`)
  assert.ok(!rawSpec.includes('scopeId'), `${locale} schema exposes an internal scope ID`)
  assert.ok(
    rawSpec.includes(expectedNaturalIntake[locale].schema),
    `${locale} schema incorrectly limits choices to a prior visible user turn`,
  )
  assert.ok(!rawSpec.includes('"nullable"'), `${locale} schema uses OpenAPI 3.0 nullable`)
  assert.ok(!rawSpec.includes('"oneOf"'), `${locale} schema uses Builder-problematic oneOf`)
  assert.ok(!/"format"\s*:\s*"uuid"/i.test(rawSpec), `${locale} schema rejects stable non-UUID goal IDs`)
  assert.ok(!spec.components.parameters, `${locale} API must not use reusable parameters`)
  assertDescriptionsWithin(spec, locale)

  const refs = collectRefs(spec)
  assert.ok(refs.length > 0, `${locale} API has no component references`)
  for (const ref of refs) assert.ok(ref.startsWith('#/'), `${locale} API contains external/shared reference: ${ref}`)

  const expectedPaths = [
    expectedBundle.redeemPath,
    ...expectedPathSuffixes.map((suffix) => `${expectedBundle.pathPrefix}${suffix}`),
  ]
  assert.deepEqual(Object.keys(spec.paths).sort(), expectedPaths.sort())

  const operations = []
  for (const pathItem of Object.values(spec.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (!operation || typeof operation !== 'object' || !operation.operationId) continue
      operations.push(operation.operationId)
      assert.equal(operation['x-openai-isConsequential'], false, `${locale} ${operation.operationId} must be non-consequential`)
      assert.deepEqual(operation.security, [{ bearerAuth: [] }])
      assert.ok(operation.responses?.['410'], `${locale} ${operation.operationId} misses 410 response`)
      if (operation.operationId === 'redeemStartCode') {
        assert.ok(!operation.parameters, `${locale} redeemStartCode must not accept a session token`)
        assert.equal(
          operation.requestBody.content['application/json'].schema.$ref,
          '#/components/schemas/RedeemStartCodeRequest',
        )
      } else {
        assert.deepEqual(operation.parameters, [{
          name: 'chatSessionToken',
          in: 'path',
          required: true,
          description: expectedBundle.tokenDescription,
          schema: { type: 'string', pattern: '^sps_[A-Za-z0-9_-]{43}$' },
        }], `${locale} ${operation.operationId} must inline the Builder-visible path parameter`)
      }
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
  assert.deepEqual(schemas.VisibleCoachStateResponse.properties.allowedActions.items.enum, expectedSessionOperations)
  assert.deepEqual(schemas.RedeemStartCodeRequest.required, ['startCode'])
  assert.equal(
    schemas.RedeemStartCodeRequest.properties.startCode.pattern,
    '^SP-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$',
  )
  assert.deepEqual(schemas.RedeemStartCodeResponse.required, ['chatSessionToken', 'expiresAt'])
  assert.equal(
    schemas.RedeemStartCodeResponse.properties.chatSessionToken.pattern,
    '^sps_[A-Za-z0-9_-]{43}$',
  )
  assert.deepEqual(schemas.VisibleChoiceRequest.required, ['selectionReference'])
  assert.deepEqual(Object.keys(schemas.VisibleChoiceRequest.properties), ['selectionReference', 'choiceNumber', 'choiceNumbers'])
  assert.equal(schemas.VisibleChoiceRequest.properties.choiceNumbers.minItems, 1)
  assert.equal(schemas.VisibleChoiceRequest.properties.choiceNumbers.uniqueItems, true)
  assert.deepEqual(schemas.VisibleNavigationRequest.properties.target.enum, ['scope', 'goal'])
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
  assert.ok(
    schemas.VisibleExamEvaluationResponse.properties.solutionContent.description
      .includes(expectedExamFairness[locale].schemaReference),
    `${locale} evaluation schema misses reference-solution semantics`,
  )

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
  'two **new** SkillPilot',
  'There is no previous GPT to update, clone, or preserve',
  'No environment variable is required for package validation',
  'exactly ten operations',
  expectedBundles.de.gptName,
  expectedBundles.en.gptName,
  expectedBundles.de.schema,
  expectedBundles.en.schema,
  ...expectedOperations,
]) {
  assert.ok(readme.includes(requiredFragment), `README misses ${requiredFragment}`)
}

const sourceFiles = []
const collectSourceFiles = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'package-lock.json') continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await collectSourceFiles(absolutePath)
    } else {
      sourceFiles.push(absolutePath)
    }
  }
}
await collectSourceFiles(root)

const forbiddenInheritedSource = [
  /g-[0-9a-f]{32}/u,
  /https:\/\/chatgpt\.com\/g\/g-/u,
  new RegExp(`"${inheritedManifestKey}"`, 'u'),
]
for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, 'utf8')
  for (const forbiddenPattern of forbiddenInheritedSource) {
    assert.doesNotMatch(
      source,
      forbiddenPattern,
      `${path.relative(root, sourceFile)} retains inherited GPT identity or configuration`,
    )
  }
}

for (const removedLegacySource of [
  'api_key_config.png',
  'gpt_setup_guide.de.md',
  'gpt_setup_guide.en.md',
  'guidelines.md',
  'skillpilot-api-4ai.de.json',
  'skillpilot-api-4ai.en.json',
  'system_instructions.de.md',
  'system_instructions.en.md',
  'knowledge_docs',
  'current',
]) {
  await assert.rejects(
    stat(path.join(root, removedLegacySource)),
    (error) => error?.code === 'ENOENT',
    `${removedLegacySource} must not survive beside the clean locale bundles`,
  )
}

for (const forbiddenRootApi of ['ai/skillpilot-api-4ai.de.json', 'ai/skillpilot-api-4ai.en.json']) {
  await assert.rejects(
    readFile(path.join(repositoryRoot, forbiddenRootApi)),
    (error) => error?.code === 'ENOENT',
    `${forbiddenRootApi} must not exist outside a variant package`,
  )
}

console.log('Custom GPT Action Session contract is valid and DE/EN workflow-parallel.')
