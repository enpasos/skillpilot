import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const author = resolve(out, '../wirtschaft-Katalog-seventeen-four-coherent-material-author-v1')
const sources = [
  resolve(out, 'whole-two-Katalog-market-culture.independently-reviewed-machine-released.inert.json'),
  resolve(author, 'whole-one-Katalog-prerequisite-free-material-navigation.cluster.author-candidate.json'),
  resolve(root, 'app/scripts/goalBookModel.ts'),
]
const bind = (path: string) => ({ path: relative(root, path), sha256: createHash('sha256').update(readFileSync(path)).digest('hex') })
const guards = sources.map(bind)
const materials = JSON.parse(readFileSync(sources[0], 'utf8')) as Array<Record<string, unknown>>
const nav = JSON.parse(readFileSync(sources[1], 'utf8')) as Record<string, unknown>
assert.deepEqual(nav.requires, [])
assert.equal(nav.type, 'cluster')
assert.deepEqual(nav.contains, [
  'b791c88c-4b8c-53ed-907c-b50c946c3b2d', '248c0ac2-f6cf-5c61-bf62-2fecc83f05aa',
  '30ce4a89-90a6-5cb6-b5e4-db8fc4a66d33', '571c124e-09af-55be-8037-2784a35f02ff',
])
assert.equal(nav.weight, 4)
const output = {
  sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
  reviewedWholeSourceInputs: guards,
  reviewer: '/root',
  decisions: [...materials, nav].map(goal => ({
    goalId: goal.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
    semanticKind: 'practiceAssessment', decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-pilot-practice-assessment',
  })),
  scientificKindReasonDe: 'Zwei ganze unabhängig geprüfte materialgestützte examData-Endpunkte prüfen vorhandene fachliche Zielleistungen mit unveränderten Teilpunkteschwellen. Der ganze vierteilige Katalogordner enthält nur diese Übungsendpunkte und hat keine eigenen Voraussetzungen; er ergänzt keine curricularAtomic- oder Memory-Kompetenz.',
  wholeDEENNavigationDescriptionKEEP: true,
  navigationReasonDe: 'Berufswege, Arbeit, Unternehmensmodelle und Kultur stimmen mit den vier ganzen unabhängig akzeptierten Leistungsaufträgen überein. Die reine Übungsnavigation darf voraussetzungsfrei erreichbar sein; die vier einzelnen Endpunkte behalten ihre minimalen tatsächlichen Leistungs-voraussetzungen. Beide Sprachfassungen bewahren diese Funktion.',
  actualCurrentCourseViewOrQSRegistrationApproved: false,
  currentDualRoundOwnerPageDApproved: false, humanApproval: false,
}
assert.deepEqual(sources.map(bind), guards)
writeFileSync(resolve(out, 'three-individual-independent-two-material-one-navigation-practiceAssessment.native-bindings.json'), JSON.stringify(output, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(output))
