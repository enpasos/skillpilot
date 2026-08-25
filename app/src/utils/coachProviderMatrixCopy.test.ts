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
  (['chatgpt-free-go', 'chatgpt-plus-pro', 'chatgpt-business', 'chatgpt-enterprise-edu'] as const)
    .every(variantId => row(de, 'current-access').cells[variantId].status === 'planned')
    && row(de, 'current-access').cells['claude-free'].status === 'unavailable'
    && row(de, 'current-access').cells['claude-pro-max'].status === 'tested'
    && row(de, 'current-access').cells['claude-team-enterprise'].status === 'planned',
  'only the controlled Claude Pro direct-install beta is presented as currently tested',
)
for (const chatGptVariant of ['chatgpt-free-go', 'chatgpt-plus-pro', 'chatgpt-business', 'chatgpt-enterprise-edu'] as const) {
  const deCurrentAccess = row(de, 'current-access').cells[chatGptVariant]
  const enCurrentAccess = row(en, 'current-access').cells[chatGptVariant]
  assert(
    deCurrentAccess.value.includes('Freigabe ausstehend')
      && deCurrentAccess.note?.includes('funktioniert derzeit noch nicht')
      && enCurrentAccess.value.includes('approval pending')
      && enCurrentAccess.note?.includes('does not currently work'),
    `${chatGptVariant} states that ChatGPT approval is pending and access does not work yet`,
  )
}
assert(
  !JSON.stringify({ de, en }).includes('freigeschaltete Testpersonen')
    && !JSON.stringify({ de, en }).includes('already have test access'),
  'the current-access matrix does not imply that a working ChatGPT test route already exists',
)
assert(
  row(de, 'provider-plan').cells['chatgpt-free-go'].status === 'conditional',
  'ChatGPT Free/Go is not presented as guaranteed',
)
assert(
  row(de, 'provider-plan').cells['claude-free'].status === 'unavailable'
    && row(de, 'provider-plan').cells['claude-free'].value.includes('Plugin-Zugang')
    && row(de, 'provider-plan').cells['claude-free'].note?.includes('Claude Pro')
    && row(en, 'provider-plan').cells['claude-free'].status === 'unavailable'
    && row(en, 'provider-plan').cells['claude-free'].value.includes('plugin access')
    && row(en, 'provider-plan').cells['claude-free'].note?.includes('Claude Pro'),
  'Claude Free is never presented as complete plugin access and the supported Pro requirement is explicit',
)
assert(
  !/Connector|Konnektor|OAuth/u.test(JSON.stringify({ de, en })),
  'the learner-facing setup matrix stays focused on the plugin route without connector terminology',
)
assert(
  de.variants.find(variant => variant.id === 'claude-free')?.summary.includes('bezahlten')
    && en.variants.find(variant => variant.id === 'claude-free')?.summary.includes('paid')
    && de.variants.find(variant => variant.id === 'claude-pro-max')?.summary.includes('Claude Web')
    && en.variants.find(variant => variant.id === 'claude-pro-max')?.summary.includes('Claude Web')
    && de.variants.find(variant => variant.id === 'claude-pro-max')?.badge?.includes('Beta')
    && en.variants.find(variant => variant.id === 'claude-pro-max')?.badge?.includes('beta'),
  'Claude variants distinguish the paid-plan requirement from the supported Claude Pro beta route',
)
assert(
  !row(de, 'browser-devices').cells['claude-pro-max'].value.includes('Smartphone')
    && !row(de, 'browser-devices').cells['claude-pro-max'].value.includes('Tablet')
    && !row(en, 'browser-devices').cells['claude-pro-max'].value.includes('smartphone')
    && !row(en, 'browser-devices').cells['claude-pro-max'].value.includes('tablet')
    && row(de, 'browser-devices').cells['claude-pro-max'].value.includes('Claude Web')
    && row(en, 'browser-devices').cells['claude-pro-max'].value.includes('Claude Web')
    && row(de, 'browser-devices').cells['claude-pro-max'].value.includes('Android')
    && row(en, 'browser-devices').cells['claude-pro-max'].value.includes('Android'),
  'Claude device copy states only the tested Web and Android route',
)
for (const fullPluginRow of ['current-access', 'provider-plan', 'cost', 'start-path', 'session-duration', 'learning-features', 'photo-upload', 'browser-devices', 'dictation']) {
  assert(
    row(de, fullPluginRow).cells['claude-free'].status === 'unavailable'
      && row(en, fullPluginRow).cells['claude-free'].status === 'unavailable',
    `${fullPluginRow} does not advertise the complete plugin on Claude Free`,
  )
}
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
  row(de, 'native-mobile-app').cells['claude-pro-max'].status === 'tested'
    && row(en, 'native-mobile-app').cells['claude-pro-max'].status === 'tested'
    && row(de, 'native-mobile-app').cells['claude-pro-max'].note?.includes('keine Installation direkt')
    && row(en, 'native-mobile-app').cells['claude-pro-max'].note?.includes('no installation from inside'),
  'the native Android route is limited to the observed post-Web-install beta path',
)
assert(
  row(de, 'voice-mode').cells['claude-pro-max'].status === 'tested'
    && row(en, 'voice-mode').cells['claude-pro-max'].status === 'tested'
    && row(de, 'voice-mode').cells['claude-pro-max'].note?.includes('nicht garantiert')
    && row(en, 'voice-mode').cells['claude-pro-max'].note?.includes('not guaranteed'),
  'Claude Pro voice mode is presented as beta-tested without a UI-display guarantee',
)
for (const managedVariant of ['chatgpt-business', 'chatgpt-enterprise-edu'] as const) {
  assert(
    deRows.every(matrixRow => matrixRow.cells[managedVariant].status !== 'tested')
      && enRows.every(matrixRow => matrixRow.cells[managedVariant].status !== 'tested'),
    `${managedVariant} does not inherit evidence from a personal ChatGPT account`,
  )
}

for (const copy of [de, en]) {
  assert(copy.asOf.includes('25') && copy.asOf.includes('2026'), 'the matrix has an explicit status date')
  assert(copy.sources.length === 5, 'the matrix links only learner-relevant access, voice, and age sources')
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
