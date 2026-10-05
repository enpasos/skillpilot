import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const quality = 'curricula/DE/Gymnasium/quality'
const own = `${quality}/semantic-atomicity/chemie-energy-four-current-20261005-v1`
const memoryOwn = `${quality}/memory-card-review/chemie-energy-four-current-20261005-v1`
const priorA = `${quality}/semantic-atomicity/chemie-energy13-current-20261005-v1`
const priorM = `${quality}/memory-card-review/chemie-energy13-current-20261005-v1`
const ids = [
  '8ece9beb-9458-5ea1-8e45-9be04670f464',
  'b95cdf98-fc97-5a94-b133-878922d28156',
  '4928d5d1-e790-5883-9349-3b03a1c63b99',
  '3e433dae-99f9-5a95-ad63-d5fa0b5f6836',
]
const idSet = new Set(ids)
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const save = (path: string, value: unknown) => writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`)
const hashBytes = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const timestamp = new Date().toISOString()
const reviewer = 'Codex Chemistry four scoped substantive source/A/M review'
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (value: any): string => Array.isArray(value)
  ? `[${value.map(stable).join(',')}]`
  : value && typeof value === 'object'
    ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${JSON.stringify(key)}:${stable(val)}`).join(',')}}`
    : JSON.stringify(value)
const semanticFingerprint = (goal: any, ruleVersion: string) => hashBytes(stable({
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '',
  title: normalize(goal.title), titleEn: normalize(goal.titleEn),
  description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn),
  phase: normalize(goal.dimensionTags?.phase), area: normalize(goal.dimensionTags?.area),
  topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind),
}))
const goals = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').goals
const reasoning: Record<string, { atomic: string, memory: string }> = {
  [ids[0]]: {
    atomic: 'Aktuelle DE/EN-Beschreibung und HE E.4#B04A01 geprüft: ein begründeter energetischer Vergleich von Kohlenwasserstoff-Verbrennungen. Reaktionsdarstellung, gemeinsame Stoffmengen-/Massen-/Nutzungsbasis und Einordnung der Kennzahl dienen demselben Vergleichsurteil; sie sind keine unabhängigen Raffinations- oder Thermodynamikroutinen. Unterschiedliche Bezugsmengen dürfen nicht unbemerkt verglichen werden. Keine eigenständige allgemeine Lebenszyklusanalyse, Wirkungsgradlehre oder Stoffklassenkunde wird als Teilziel behauptet.',
    memory: 'Die aktuelle Kompetenz verlangt einen begründeten Vergleich auf gemeinsamer Bezugsbasis. Kennzahlen, molare Massen und gegebenenfalls Wirkungsgrade werden für konkrete Vergleichsaufgaben bereitgestellt; ihre memorierte Rangfolge wäre kein Beleg für Vergleichsverständnis und ist kontextabhängig. Verbrennungsgleichungen werden über die vorausgesetzten Stoff-/Teilchenvorstellungen bilanziert, nicht als zusätzlicher Brennstoffkatalog gelernt. Eine zusätzliche eigenständige Karte für dieses Ziel ist nicht notwendig; der Nachweis liegt in Bezugsmengenwahl, Erklärung und Transfer.',
  },
  [ids[1]]: {
    atomic: 'Aktuelle DE/EN-Beschreibung und BY C9-NTG.5.5 / C10-HG_SG_MUG_WWG_SWG.3.5 geprüft: ein begründetes Einsatzurteil über Erdölprodukte. Die Zuordnung eines Produkts zu einem Einsatzfall liefert den Gegenstand; Nutzen und ökologische Folgen sind verbundene Bewertungskriterien desselben Urteils. Kein unabhängiger Herstellungsmechanismus, vollständiger Stoffkatalog oder quantitativer Oberstufen-Nachweis wird hinzugefügt. Die qualitative Begründung bleibt für die benannten Sek-I-Jahrgänge zugänglich.',
    memory: 'Das Ziel verlangt ein fallbezogenes Urteil über Nutzen und Umweltfolgen, keine freie Reproduktion eines vollständigen Erdölprodukt-/Anwendungskatalogs. Vorgegebene oder recherchierte Produktinformationen tragen Zuordnung und Abwägung. Eine auswendig gelernte Produktliste oder pauschale gut/schlecht-Bewertung würde die Begründung nicht ersetzen. Für diese aktuelle Anwendungskompetenz ist keine zusätzliche Memorycard erforderlich.',
  },
  [ids[2]]: {
    atomic: 'Aktuelle DE/EN-Beschreibung und BY C12 GA/EA.5.3 geprüft: eine zusammenhängende thermodynamische Abgrenzung der Reaktionsenergie ΔU von der Reaktionsenthalpie ΔH. Systemgrenze sowie Wärme-/Arbeitsaustausch erklären diese eine Unterscheidung; die Beschreibung setzt Zustandsgrößen U/H ausdrücklich nicht mit ihren Änderungen gleich. Die zugehörigen Aufgaben nennen ihre Arbeits- und Randbedingungen; Qv=ΔU und Qp=ΔH gelten hier im Modell ohne weitere Arbeit neben Volumenarbeit. Kein unabhängiger Wärmekraftmaschinen- oder Hess-Rechenlehrgang ist eingebettet.',
    memory: 'Für dieses Ziel reicht eine isoliert gelernte Gleichung nicht: Lernende müssen Systemgrenze, Wärme und Arbeit sowie Änderung und Zustandsgröße kausal unterscheiden. Diagramme, gegebene Größen und benannte Arbeitsannahmen unterstützen diese Erklärung. Die gegebenen Beziehungen werden am System angewendet; eine zusätzliche Karte für dieses Ziel würde weder die Modellgrenze noch den Unterschied ΔU/ΔH sichern. Keine neue Karte ist notwendig. Vorhandene eigenständige Formel-/Begriffskarten anderer Ziele bleiben mit ihren eigenen Origin- und Sichtbarkeitsentscheidungen unverändert.',
  },
  [ids[3]]: {
    atomic: 'Aktuelle DE/EN-Beschreibung und BY C12 GA/EA.5.4 geprüft: eine bindungsbezogene Erklärung von Reaktionsenthalpie-Unterschieden. Bindungsbruch benötigt Energie, Bindungsbildung gibt Energie ab; deren Verhältnis erklärt die relative Einordnung der verglichenen Edukt-/Produktsysteme. Diese Einordnung ist die Deutung derselben Reaktionsbetrachtung, kein unabhängiges absolutes Energieetikett. Das genannte qualitative Verhältnis wird durch vorgegebene oder experimentelle Werte erklärt, nicht durch einen obligatorischen Bindungsenergiesummen- oder Standardbildungsenthalpie-Lehrgang. Stoffphase und Modellgrenzen werden bei den Beispielen benannt.',
    memory: 'Das Lernziel verlangt die kausale Interpretation vorgegebener beziehungsweise experimenteller Reaktionsenthalpien. Bindungsenergien oder ausgewertete Energiebudgets werden bereitgestellt; ein Tabellenwert- oder Summenrezept-Deck würde die geforderte qualitative Erklärung verfehlen. Die relative Edukt-/Produktordnung wird aus Bindungsbruch, Bindungsbildung und gegebenem Reaktionsbezug erklärt. Deshalb ist keine zusätzliche Karte erforderlich; vorausgesetzte Bindungsvorstellungen und vorhandene fremde Karten bleiben getrennt.',
  },
}
mkdirSync(resolve(root, own), { recursive: true })
mkdirSync(resolve(root, memoryOwn), { recursive: true })
const lineage: any[] = []
for (const [kind, prior, destination, stem, reasonKey] of [
  ['A', priorA, own, 'canonical-chemistry-ephase-fossil-fuels', 'atomic'],
  ['M', priorM, memoryOwn, 'canonical-chemistry-full', 'memory'],
] as const) {
  const sourcePath = `${prior}/${stem}.review.jsonl`
  const sourceBytes = readFileSync(resolve(root, sourcePath), 'utf8')
  const beforeLines = sourceBytes.trimEnd().split('\n')
  const changes: any[] = []
  const afterLines = beforeLines.map((line) => {
    const priorRecord = JSON.parse(line)
    if (!idSet.has(priorRecord.goalId)) return line
    const goal = goals.find((entry: any) => entry.id === priorRecord.goalId)
    const record = {
      ...priorRecord,
      fingerprint: semanticFingerprint(goal, priorRecord.ruleVersion),
      reviewedAt: timestamp,
      reviewer,
      reason: reasoning[goal.id][reasonKey],
    }
    if (kind === 'A' && (record.status !== 'atomic' || record.semanticAtomic !== true)) throw new Error(`Unexpected A status ${goal.id}`)
    if (kind === 'M' && (record.status !== 'no_memory_needed' || record.memoryUseful !== false)) throw new Error(`Unexpected M status ${goal.id}`)
    changes.push({ goalId: goal.id, beforeFingerprint: priorRecord.fingerprint, afterFingerprint: record.fingerprint, status: record.status, reason: record.reason })
    return JSON.stringify(record)
  })
  if (changes.length !== ids.length) throw new Error(`Expected four ${kind} records, got ${changes.length}`)
  const targetPath = `${destination}/${stem}.review.jsonl`
  writeFileSync(resolve(root, targetPath), `${afterLines.join('\n')}\n`)
  const config = read(`${prior}/${stem}.config.json`)
  config.reviewPath = targetPath
  if (kind === 'M') {
    const oldCardPath = config.cardReviewPath
    config.cardReviewPath = `${destination}/${stem}.cards.review.jsonl`
    config.reportPath = `${destination}/current-review.report.md`
    copyFileSync(resolve(root, oldCardPath), resolve(root, config.cardReviewPath))
    lineage.push({ lane: 'cards', sourcePath: oldCardPath, targetPath: config.cardReviewPath, unchangedBytes: true, sha256: hashBytes(readFileSync(resolve(root, oldCardPath))) })
  }
  save(`${destination}/${stem}.config.json`, config)
  for (let i = 0; i < beforeLines.length; i++) {
    if (!idSet.has(JSON.parse(beforeLines[i]).goalId) && beforeLines[i] !== afterLines[i]) throw new Error(`Unchanged ${kind} line ${i + 1} changed`)
  }
  lineage.push({ lane: kind, sourcePath, targetPath, sourceDigest: hashBytes(sourceBytes), targetDigest: hashBytes(readFileSync(resolve(root, targetPath))), changedRecords: changes, unchangedRecordsByteEquivalent: beforeLines.length - changes.length })
}
const decisions = [
  { path: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-energy13-current-20261005-v1.review.json', goalIds: [ids[0]], rationales: {
    [ids[0]]: 'Aktuelle kanonische DE/EN-Beschreibung gegen HE E.4#B04A01 geprüft: Verbrennungsreaktionen ausgewählter Kohlenwasserstoffe und energetische Kennzahlen werden auf gemeinsamer Bezugsbasis begründet verglichen. Die Basispräzisierung operationalisiert den bestehenden energetischen Vergleich; sie behauptet keine zusätzliche allgemeine Thermodynamik- oder Lebenszykluskompetenz. Klausel im retained Repository-PDF sha256:3461259a623a78f0a18ad14f47eb284b1f29b866722edd5fd20186bbc862bbd1, gedruckte Seite36, und im aktuellen KC2026-PDF sha256:628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e, gedruckte Seite36, inhaltlich gleich geprüft. Das unter der alten URL im Vorreview erhaltene 50-Seiten-Dokument sha256:5952bf6889aff08544dbfb1d872c98884c5ef7f537e66850a6d443afe23a9af4 zeigt dieselbe Klausel auf gedruckter Seite34; diese Fundstellen werden nicht gleichgesetzt. Exakt bezieht sich auf diese normalisierte Vergleichskompetenz in E.4; alle anderen Quell- und Länderzeilen sind unveränderter Review-Trace, keine neue Freigabe.',
  } },
  { path: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.m7-energy13-current-20261005-v1.review.json', goalIds: ids.slice(1), rationales: {
    [ids[1]]: 'Aktuelle kanonische DE/EN-Beschreibung gegen die deduplizierte BY-Kompetenz geprüft: Einsatzzuordnung, Nutzen und ökologische Folgen bilden ein begründetes Urteil über Bedeutung und Verwendung von Erdölprodukten. Die tatsächlich geprüften parallelen LehrplanPLUS-Fundstellen sind C9-NTG.5.5 und C10-HG_SG_MUG_WWG_SWG.3.5 (Lernbereich3, nicht C10.5.5). Das qualitative Niveau bleibt SekI/Jahrgang9 beziehungsweise10; die Position im gemeinsamen E-Reviewkapitel ist keine Jahrgangsfreigabe. Exakt bezieht sich auf diese normalisierte Kompetenz; unveränderte andere Länder-/Quellzeilen werden nicht erneut fachlich freigegeben.',
    [ids[2]]: 'Aktuelle kanonische DE/EN-Beschreibung gegen BY C12-GA.5.3 und C12-EA.5.3 geprüft: Systemunterscheidung sowie Wärme-/Arbeitsaustausch im geschlossenen System mit variablem Volumen erklären die Abgrenzung der Änderung der inneren Energie (Reaktionsenergie) von der Änderung der Enthalpie (Reaktionsenthalpie). U und H werden nicht mit ΔU und ΔH gleichgesetzt. Quantitative Modellbeispiele benennen ihre Arbeitsannahmen; die Wärmegleichheiten behaupten keine Gültigkeit bei zusätzlicher nicht-volumetrischer Arbeit. Exakt bezieht sich auf diese normalisierte Kompetenz in SekII; unveränderte andere Länder-/Quellzeilen bleiben historischer Trace.',
    [ids[3]]: 'Aktuelle kanonische DE/EN-Beschreibung gegen BY C12-GA.5.4 und C12-EA.5.4 geprüft: Reaktionsenthalpie-Unterschiede werden kausal mit Bindungsverhältnissen erklärt; energiereich/energiearm wird relativ auf die verglichenen Edukt-/Produktsysteme bezogen. Die zugehörigen Inhalte verlangen beim Molekülbau-/Verbrennungswärme-Verhältnis qualitative Je-desto-Beziehungen ohne Berechnungen. Ausgewertete Energiebudgets und gegebenes Phasenmodell sind Unterstützung, keine obligatorische Bindungsenergiesummenleistung; die folgende Standardbildungsenthalpie-Berechnung ist ein separates Ziel. Exakt bezieht sich auf diese normalisierte Erklärkompetenz in SekII; keine neue Freigabe unveränderter anderer Länder-/Quellzeilen.',
  } },
]
const atlasPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const atlas = read(atlasPath)
const sourceLineage: any[] = []
for (const source of decisions) {
  const prior = read(source.path)
  const current = structuredClone(prior)
  const targetPath = source.path.replace('.m7-energy13-current-20261005-v1.review.json', '.m7-energy-four-current-20261005-v1.review.json')
  current.reviewId = current.reviewId.replace('.m7-energy13-current-20261005-v1.review', '.m7-energy-four-current-20261005-v1.review')
  const changedDecisions: any[] = []
  for (const goalId of source.goalIds) {
    const matching = current.decisions.filter((entry: any) => entry.canonicalGoalIds.length === 1 && entry.canonicalGoalIds[0] === goalId)
    if (matching.length !== 1) throw new Error(`Expected one named source decision for ${goalId}`)
    const decision = matching[0]
    const priorDecision = structuredClone(decision)
    decision.rationale = source.rationales[goalId]
    decision.reviewedAt = timestamp
    decision.reviewer = reviewer
    changedDecisions.push({ goalId, before: priorDecision, after: decision })
  }
  const affected = new Set(source.goalIds)
  for (let i = 0; i < prior.decisions.length; i++) {
    if (!prior.decisions[i].canonicalGoalIds.some((id: string) => affected.has(id)) && JSON.stringify(prior.decisions[i]) !== JSON.stringify(current.decisions[i])) {
      throw new Error(`Unowned source decision changed ${prior.decisions[i].sourceGoalId}`)
    }
  }
  if (JSON.stringify(prior.mappings) !== JSON.stringify(current.mappings)) throw new Error('Mapping topology or match strength changed')
  save(targetPath, current)
  const index = atlas.mappingPaths.indexOf(source.path)
  if (index < 0) throw new Error(`Active atlas missing ${source.path}`)
  atlas.mappingPaths[index] = targetPath
  sourceLineage.push({ sourcePath: source.path, targetPath, changedDecisions, unchangedDecisions: prior.decisions.length - changedDecisions.length, unchangedMappings: prior.mappings.length, matchStrengthUnchanged: true })
}
save(atlasPath, atlas)
save(`${own}/am-and-named-source-integration.receipt.json`, {
  schemaVersion: 1, timestamp, reviewer, machineReviewOnly: true,
  currentGoalIds: ids, lineage, sourceLineage,
  additionalStateRows: 'Unchanged existing traces, not newly reviewed or promoted to exact coverage',
  cardsChanged: 0, visibilityViewsChanged: 0,
  atlasInputPath: atlasPath,
  atlasScopeBoundary: { expectedCurricularAtomicGoalCount: atlas.expectedCurricularAtomicGoalCount, expectedUnresolvedScopeDecisionCount: atlas.expectedUnresolvedScopeDecisionCount, fullCanonicalAtomicCount: 376, notFullSourceProof: true },
  finalCurrentIndependentDescriptionRoundsPending: true,
  finalPositiveEvidenceBindingsPending: true,
  actualVisualizationSuccessorReviewAndImportOwnedByRoot: true,
  registryAndInflightUnchangedByThisLane: true,
  strictNewCompletionClaim: 0,
})
console.log(JSON.stringify({ fourCurrentGoalIds: ids, sourceSuccessorPaths: sourceLineage.map((entry) => entry.targetPath), unchangedCards: true, amSuccessors: [own, memoryOwn] }, null, 2))
