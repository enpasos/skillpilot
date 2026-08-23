import {
  getCoachProviderMatrixCopy,
  type CoachMatrixVariantId,
} from './coachProviderMatrixCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const de = getCoachProviderMatrixCopy('de')
const en = getCoachProviderMatrixCopy('en')
const ids = <T extends { id: string }>(items: T[]) => items.map(item => item.id)
const flattenRows = (copy: typeof de) => copy.groups.flatMap(group => group.rows)

const variantIds = ids(de.variants) as CoachMatrixVariantId[]
assert(
  JSON.stringify(variantIds) === JSON.stringify(ids(en.variants)),
  'German and English provider variants have identical IDs and ordering',
)
assert(new Set(variantIds).size === variantIds.length, 'provider variant IDs are unique')
assert(
  de.variants.filter(variant => variant.provider === 'ChatGPT').length === 4
    && en.variants.filter(variant => variant.provider === 'ChatGPT').length === 4,
  'the ChatGPT view contains the four plan labels learners may see',
)
assert(
  de.variants.filter(variant => variant.provider === 'Claude').length === 3
    && en.variants.filter(variant => variant.provider === 'Claude').length === 3,
  'the Claude view contains the three plan labels learners may see',
)
assert(
  JSON.stringify(ids(de.groups)) === JSON.stringify(ids(en.groups)),
  'German and English matrix groups have identical IDs and ordering',
)

const deRows = flattenRows(de)
const enRows = flattenRows(en)
assert(
  JSON.stringify(ids(deRows)) === JSON.stringify(ids(enRows)),
  'German and English feature rows have identical IDs and ordering',
)
assert(new Set(ids(deRows)).size === deRows.length, 'feature row IDs are unique')

for (let index = 0; index < deRows.length; index += 1) {
  const deRow = deRows[index]
  const enRow = enRows[index]
  assert(
    JSON.stringify(Object.keys(deRow.cells)) === JSON.stringify(variantIds),
    `German row ${deRow.id} has exactly one ordered cell for every provider variant`,
  )
  assert(
    JSON.stringify(Object.keys(enRow.cells)) === JSON.stringify(variantIds),
    `English row ${enRow.id} has exactly one ordered cell for every provider variant`,
  )
  for (const variantId of variantIds) {
    assert(
      deRow.cells[variantId].status === enRow.cells[variantId].status,
      `status parity holds for ${deRow.id}/${variantId}`,
    )
    assert(Boolean(deRow.cells[variantId].value), `German cell ${deRow.id}/${variantId} is not empty`)
    assert(Boolean(enRow.cells[variantId].value), `English cell ${deRow.id}/${variantId} is not empty`)
  }
}

const row = (copy: typeof de, id: string) => {
  const result = flattenRows(copy).find(candidate => candidate.id === id)
  assert(result, `matrix row ${id} exists`)
  return result
}

assert(
  de.variants.find(variant => variant.id === 'chatgpt-plus-pro')?.badge
    && en.variants.find(variant => variant.id === 'chatgpt-plus-pro')?.badge,
  'ChatGPT Plus/Pro remains visibly recommended for an individual learner',
)
assert(
  variantIds.every(variantId => row(de, 'current-access').cells[variantId].status === 'planned'),
  'no account variant is presented as publicly released for new learners',
)
assert(
  row(de, 'provider-plan').cells['chatgpt-free-go'].status === 'conditional',
  'ChatGPT Free/Go is not presented as guaranteed',
)
assert(
  row(de, 'provider-plan').cells['claude-free'].status === 'planned',
  'Claude Free remains an undecided future option without exposing deployment architecture',
)
assert(
  row(de, 'minimum-age').cells['chatgpt-plus-pro'].value.includes('13')
    && row(de, 'minimum-age').cells['chatgpt-plus-pro'].note?.includes('18'),
  'the ChatGPT learner age and guardian-permission boundary is visible',
)
assert(
  row(de, 'minimum-age').cells['claude-pro-max'].value.includes('18'),
  'the Claude learner age boundary is visible',
)
assert(
  row(de, 'minimum-age').cells['chatgpt-business'].status === 'admin'
    && row(de, 'minimum-age').cells['chatgpt-enterprise-edu'].status === 'admin',
  'managed ChatGPT accounts point learners to their school or organisation rules',
)
assert(
  row(de, 'start-path').cells['chatgpt-plus-pro'].value.includes('Lernen starten')
    && row(en, 'start-path').cells['chatgpt-plus-pro'].value.includes('Start Learning'),
  'both languages direct learners to the first-party start action',
)
assert(
  row(de, 'session-duration').cells['chatgpt-plus-pro'].value.includes('24 Stunden')
    && row(en, 'session-duration').cells['chatgpt-plus-pro'].value.includes('24 hours'),
  'the absolute 24-hour learning-session boundary is visible',
)
assert(
  row(de, 'privacy-boundary').cells['chatgpt-plus-pro'].note?.includes('nicht mit anderen')
    && row(en, 'privacy-boundary').cells['chatgpt-plus-pro'].note?.includes('not share'),
  'the matrix tells learners not to share their prepared start or chat',
)
assert(
  variantIds.every(variantId => row(de, 'native-mobile-app').cells[variantId].status === 'unavailable'),
  'native mobile apps are not advertised as a supported SkillPilot path',
)
assert(
  variantIds.every(variantId => row(de, 'voice-mode').cells[variantId].status === 'unavailable'),
  'continuous voice mode is not advertised as a supported SkillPilot path',
)
for (const managedVariant of ['chatgpt-business', 'chatgpt-enterprise-edu'] as const) {
  assert(
    deRows.every(matrixRow => matrixRow.cells[managedVariant].status !== 'tested')
      && enRows.every(matrixRow => matrixRow.cells[managedVariant].status !== 'tested'),
    `${managedVariant} does not inherit evidence from a personal ChatGPT account`,
  )
}

for (const copy of [de, en]) {
  assert(copy.asOf.includes('23') && copy.asOf.includes('2026'), 'the matrix has an explicit status date')
  assert(copy.sources.length === 4, 'the matrix links only learner-relevant access and age sources')
  assert(
    copy.sources.every(source => source.href.startsWith('https://')
      && (source.href.includes('openai.com') || source.href.includes('claude.com'))),
    'every matrix source is an official HTTPS provider URL',
  )
  const visibleText = [
    copy.title,
    copy.intro,
    copy.asOf,
    copy.featureHeading,
    copy.mobileFeatureHeading,
    copy.providerFilterLabel,
    copy.providerFilterHint,
    copy.legendLabel,
    copy.startTitle,
    copy.startText,
    copy.privacyTitle,
    copy.privacyText,
    copy.caveat,
    copy.sourcesTitle,
    copy.sourcesNote,
    ...Object.values(copy.statusLabels),
    ...copy.variants.flatMap(variant => [variant.provider, variant.plan, variant.badge, variant.summary]),
    ...copy.groups.flatMap(group => [
      group.title,
      ...group.rows.flatMap(matrixRow => [
        matrixRow.feature,
        ...Object.values(matrixRow.cells).flatMap(matrixCell => [matrixCell.value, matrixCell.note]),
      ]),
    ]),
    ...copy.sources.map(source => source.label),
  ].filter(Boolean).join('\n').toLowerCase()
  for (const forbidden of [
    'review',
    'rollout',
    'evidence',
    'connector',
    'mcp',
    'workspace',
    'operator',
    'betreiber',
    'oauth',
    'stateversion',
    'expectedstateversion',
    'clientrequestid',
    'skillpilotid',
    'directory-eintrag',
    'codeausführung',
    'code execution',
  ]) {
    assert(!visibleText.includes(forbidden), `learner-facing matrix copy does not expose ${forbidden}`)
  }
}

console.log('Coach provider matrix copy tests passed')
