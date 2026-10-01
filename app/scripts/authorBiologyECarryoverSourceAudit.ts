/** Targeted source/content audit for the 15 unchanged Biology E-phase D carryovers.
 *
 * The findings below were checked against the retained HE KCGO Biology PDF,
 * printed pages 35-36. Historical A/B reviews and mapping decisions are inputs,
 * not edited or represented as a fresh description review by this script.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { stableGoalBookJson } from './goalBookModel'
import { expandGoalBookSourceAtlasReceipt } from './goalBookSourceAtlasInputs'

const root = resolve(import.meta.dirname, '../..')
const load = (path: string): any => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const digest = (value: unknown): string => `sha256:${createHash('sha256').update(stableGoalBookJson(value)).digest('hex')}`
const fileDigest = (path: string): string => `sha256:${createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')}`

const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-20260930-v2.review.json'
const sourceExtractionPath = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json'
const sourceDocumentPath = 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
const sourceAtlasReceiptPath = 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
const auditPath = 'curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-09-30/m7-ephase-fifteen-current-canonical-binding-audit-20260930-v1.json'
const batchBase = 'curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-09-30/'
const indexPaths = [
  `${batchBase}m7-ephase-e1-nine-after-split-current-20260930-v2/resolution-index.json`,
  `${batchBase}m7-ephase-e2-e4-nine-after-split-current-20260930-v2/resolution-index.json`,
]

// Official topic facts and the reason why each current atom stays inside it.
const findings: Record<string, [number, string, string]> = {
  '11e90f71': [35, 'E.1 Organisationsstufen und Kennzeichen des Lebens', 'Beobachtbare Lebenskennzeichen decken den Kennzeichen-Teil des amtlichen E.1-Punkts ab; Organisationsstufen sind separat bei d71e2310.'],
  'd71e2310': [35, 'E.1 Organisationsstufen und Kennzeichen des Lebens', 'Zelle–Gewebe–Organ–Organismus deckt den Organisationsstufen-Teil desselben amtlichen Punkts ab; Lebenskennzeichen sind separat bei 11e90f71.'],
  '7c6bf0cc': [35, 'E.1 Zelltypen mit lichtmikroskopischen Untersuchungen', 'Pro-/Eukaryoten sowie Pflanzen-/Tierzellen entsprechen dem Zelltypenpunkt; Lichtmikroskopbefund und ergänzendes Zellmodell werden im Zieltext unterschieden.'],
  'fc8c4b02': [36, 'E.1 Bau und Funktion der Zellorganellen im elektronenmikroskopischen Bild', 'Organellenbau und ausgewählte Funktionen liegen im amtlichen Übersichtspunkt; die alte Extraction vermischte zusätzlich Endosymbiose, die im aktuellen Kanon eigenständig ist.'],
  '1042bb24': [36, 'E.1 Endosymbiontentheorie (Evolution der Eucyten)', 'Die aktuelle Erklärung zu Mitochondrien und Chloroplasten belegt den Endosymbiose-Aspekt; die alte Extraction koppelte ihn fälschlich an Vielzelligkeit.'],
  '6199e4c7': [36, 'E.1 Organisationsstufen vom Einzeller zum Vielzeller (Übersicht)', 'Einzeller, Zellverbände und Vielzeller werden als Organisationsformen verglichen; Endosymbiose wird nicht als Ursache der Vielzelligkeit behauptet.'],
  'e063b97d': [36, 'E.1 Biomembran (Schema), Membranmodelle und selektive Permeabilität', 'Das schematische Lipiddoppelschichtmodell mit Transportproteinen und selektiver Durchlässigkeit liegt innerhalb der getrennten amtlichen Membranpunkte.'],
  'e76315b1': [36, 'E.1 Diffusion, Osmose und Plasmolyse (experimentell)', 'Die Richtungsbegründung für Diffusion und osmotischen Wasserfluss bleibt ein erklärendes Teilziel des amtlichen Transportpunkts; experimentelle Durchführung ist gesondert.'],
  '28850d2e': [36, 'E.2 Aufbau von Proteinen: Aminosäuren, Peptide, vier Strukturebenen', 'Polypeptidmodell und vier Strukturebenen entsprechen dem amtlichen Proteinpunkt; ein eigener P-v2-Fall ist wegen Tetrapeptid-Helix separat HOLD, ohne die D-/Quellenbindung zu ändern.'],
  '0dbe758c': [36, 'E.2 Mechanismus der Enzymwirkung an ausgewähltem Beispiel', 'Der zielbegrenzte Katalysemechanismus entspricht diesem amtlichen Punkt; experimentelle Durchführung und Enzyme im Alltag sind andere Punkte.'],
  'f539fe51': [36, 'E.2 Abhängigkeit der Enzymaktivität von Temperatur, pH-Wert und Substratkonzentration', 'Temperaturdeutung ist eine eigenständig prüfbare Achse des gemeinsamen amtlichen Faktorpunkts; pH und Konzentration haben eigene Atome.'],
  'd06adc48': [36, 'E.2 Abhängigkeit der Enzymaktivität von Temperatur, pH-Wert und Substratkonzentration', 'pH-Datendeutung ist eine eigenständig prüfbare Achse des gemeinsamen amtlichen Faktorpunkts; Temperatur und Konzentration haben eigene Atome.'],
  'e1484671': [36, 'E.3 Vergleich von Mitose und Meiose, Zellzyklus', 'G1/S/G2/M und DNA-Verdopplung konkretisieren den Zellzyklusanteil; Mitose/Meiose-Vergleich wird separat geprüft.'],
  'ec88fc1d': [36, 'E.3 Vergleich von Mitose und Meiose, Zellzyklus', 'Teilungszahl, Tochterzellzahl und Chromosomensatz konkretisieren den Mitose/Meiose-Vergleich; Zellzyklusphasen werden separat geprüft.'],
  '9344c5ce': [36, 'E.4 Bedeutung von Drosophila und Caenorhabditis elegans als Modellorganismen', 'Eine fallbezogene Wahl mit Übertragungsgrenze bleibt innerhalb des amtlichen Modellorganismenpunkts; keine identische Entwicklung des Menschen wird behauptet.'],
}

const canonical = load(landscapePath)
const source = load(sourceExtractionPath)
const mapping = load(mappingPath)
const atlas = expandGoalBookSourceAtlasReceipt(load(sourceAtlasReceiptPath))
const byGoal = new Map(canonical.goals.map((goal: any) => [goal.id, goal]))
const bySource = new Map(source.sourceGoals.map((goal: any) => [goal.id, goal]))
const byDecision = new Map(mapping.decisions.map((decision: any) => [decision.sourceGoalId, decision]))
const ids = indexPaths.flatMap(path => load(path).resolutions.map((item: any) => item.goalId))
if (ids.length !== 15 || new Set(ids).size !== 15) throw new Error('Expected exactly 15 distinct unchanged E carryover goals')
if (Object.keys(findings).length !== ids.length) throw new Error('Finding count mismatch')
const heKeys = ['DE-HE/SekII/GK', 'DE-HE/SekII/LK']
const records = ids.map((goalId: string) => {
  const goal: any = byGoal.get(goalId)
  if (!goal) throw new Error(`Missing canonical goal ${goalId}`)
  const [printedPage, officialSourcePoint, findingDe] = findings[goalId.slice(0, 8)] ?? []
  if (!findingDe) throw new Error(`Missing subject finding ${goalId}`)
  const sourceGoalId = goal.extendedData?.provenance?.sourceGoalId
  const sourceGoal: any = bySource.get(sourceGoalId)
  const decision: any = byDecision.get(sourceGoalId)
  if (!sourceGoal || !decision || decision.decision !== 'mapped' || !decision.canonicalGoalIds.includes(goalId)) {
    throw new Error(`No exact reviewed HE source decision for ${goalId}`)
  }
  const directWitnesses = heKeys.map(key => {
    const scope = atlas.scopes.find((item: any) => item.key === key)
    const witness = scope?.witnesses.find((item: any) => item.goalId === goalId && item.sourceGoalId === sourceGoalId && item.mappingPath === mappingPath && item.coverage === 'direct')
    if (!witness) throw new Error(`Missing direct HE source witness for ${goalId} in ${key}`)
    return key
  })
  return {
    goalId,
    canonicalGoalDigest: digest(goal),
    sourceGoalId,
    mappingPath,
    sourceDecisionDigest: digest(decision),
    sourceExtractionPath,
    sourceGoalDigest: digest(sourceGoal),
    sourceDocumentPath,
    sourceDocumentDigest: fileDigest(sourceDocumentPath),
    printedPdfPage: printedPage,
    officialSourcePoint,
    directSourceScopeKeys: directWitnesses,
    decision: 'pass',
    findingDe,
  }
})
const result = {
  schemaVersion: 1,
  auditContract: 'current-canonical-binding-audit-v1',
  subject: 'Biologie',
  landscapePath,
  reviewAuthority: 'ai_targeted_revalidation',
  humanApprovalClaim: false,
  sourceDocumentNoteDe: 'Lokale amtliche PDF-Fassung, Druckseiten 35–36. Ältere Mapping-Begründungen nennen teils 33/34; maßgeblich ist hier der geprüfte PDF-Inhalt. Historische Mapping-/D-Review-Bytes bleiben unverändert.',
  atlasScopeComparisonDe: 'Nach den vier Q1-Bildimporten: 362/362 curricularAtomic, 20 Views, 0 unresolved/omitted; alle 20 Scope-Zielmengen vor/nach dem Bildimport identisch.',
  records,
}
writeFileSync(resolve(root, auditPath), `${JSON.stringify(result, null, 2)}\n`)
console.log(`Wrote ${auditPath}: ${records.length} targeted source bindings, PDF ${fileDigest(sourceDocumentPath)}`)
