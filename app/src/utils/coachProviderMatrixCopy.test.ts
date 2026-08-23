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
  'the ChatGPT provider view contains exactly four plan variants in both languages',
)
assert(
  de.variants.filter(variant => variant.provider === 'Claude').length === 3
    && en.variants.filter(variant => variant.provider === 'Claude').length === 3,
  'the Claude provider view contains exactly three plan variants in both languages',
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
  'ChatGPT Plus/Pro is visibly recommended for individuals in both languages',
)
assert(
  row(de, 'provider-plan').cells['chatgpt-free-go'].status === 'conditional',
  'ChatGPT Free/Go availability is not presented as guaranteed',
)
assert(
  row(de, 'provider-plan').cells['claude-free'].status === 'unavailable',
  'Claude Free is not presented as plugin-capable',
)
assert(
  row(de, 'minimum-age').cells['chatgpt-plus-pro'].value.includes('13')
    && row(de, 'minimum-age').cells['chatgpt-plus-pro'].note?.includes('18'),
  'the ChatGPT consumer age and guardian-consent boundary is visible',
)
assert(
  row(de, 'minimum-age').cells['claude-pro-max'].value.includes('18'),
  'the Claude account age boundary is visible',
)
assert(
  row(de, 'rollout-status').cells['claude-pro-max'].status === 'planned'
    && row(de, 'rollout-status').cells['claude-team-enterprise'].status === 'planned',
  'paid Claude plans remain a paused SkillPilot rollout',
)
assert(
  row(de, 'permanent-id-boundary').cells['chatgpt-plus-pro'].status === 'tested'
    && row(de, 'absolute-session').cells['chatgpt-plus-pro'].status === 'tested',
  'the tested ChatGPT path keeps the permanent ID at SkillPilot and uses an absolute session',
)
assert(
  row(de, 'permanent-id-boundary').cells['claude-pro-max'].status === 'planned'
    && row(de, 'absolute-session').cells['claude-pro-max'].status === 'planned',
  'the secure Claude identity and session boundary is not shown as released',
)
assert(
  row(de, 'mobile-browser').cells['claude-pro-max'].status === 'planned'
    && row(de, 'mobile-browser').cells['claude-pro-max'].value.includes('Vorläufer'),
  'the manual Claude mobile test is caveated as predecessor evidence, not a release',
)
assert(
  variantIds.every(variantId => row(de, 'native-mobile-app').cells[variantId].status === 'unavailable'),
  'native mobile apps are not advertised as a supported SkillPilot path',
)
assert(
  variantIds.every(variantId => row(de, 'voice-mode').cells[variantId].status === 'unavailable'),
  'continuous voice mode is not advertised as a supported SkillPilot path',
)
assert(
  deRows.every(matrixRow => matrixRow.cells['chatgpt-business'].status !== 'tested'),
  'personal ChatGPT evidence is not presented as a plan-specific Business test',
)
assert(
  deRows.every(matrixRow => matrixRow.cells['chatgpt-enterprise-edu'].status !== 'tested'),
  'personal ChatGPT evidence is not presented as a plan-specific Enterprise/Edu test',
)

for (const copy of [de, en]) {
  assert(copy.asOf.includes('23') && copy.asOf.includes('2026'), 'the matrix has an explicit review date')
  assert(copy.sources.length >= 6, 'the matrix links provider feature and minimum-age sources')
  assert(
    copy.sources.every(source => source.href.startsWith('https://')
      && (source.href.includes('openai.com') || source.href.includes('claude.com'))),
    'every matrix source is an official HTTPS provider URL',
  )
  const serialized = JSON.stringify(copy)
  for (const forbidden of ['skillpilotId', 'stateVersion', 'expectedStateVersion', 'clientRequestId']) {
    assert(!serialized.includes(forbidden), `learner-facing matrix copy does not expose ${forbidden}`)
  }
}

console.log('Coach provider matrix copy tests passed')
