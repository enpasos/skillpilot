// SPDX-License-Identifier: Apache-2.0
// Stop immediately after the unchanged stock kind parser; no rendering or host writes.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/'
const out = `${prefix}chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1/`
const t = `${prefix}chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1/`
const canonicalPath = `${out}candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json`
const ledgerPath = `${out}candidate/semantic542.prospective414.paired-existing-science.closed-enum.json`
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const { buildGoalBookModel } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
const landscape = json(canonicalPath)
const ledger = json(ledgerPath)
const baseConfig = json(`${t}configs/whole412.stock-base.config.json`)
const config = { ...baseConfig, landscapePath: canonicalPath, semanticKindLedgerPath: ledgerPath, evidenceReviewPaths: [] }
const execute = (value: any) => {
  try {
    buildGoalBookModel({ landscape, semanticKindLedger: value, goalVisualizationQa: {}, goalVisualizationAssetDigests: {}, evidenceReviewSources: [], config })
    throw new Error('Unexpected whole-model completion in bounded preflight')
  } catch (error) { return String(error instanceof Error ? error.message : error) }
}
const positive = execute(ledger)
if (positive !== 'Goal-book model: compositionView must be provided for a single-view build.') throw new Error(positive)
const invalidBasis = structuredClone(ledger)
invalidBasis.decisions.at(-1).decisionBasis = 'technical-unreviewed-freeform-not-in-stock-enum'
const staleFP = structuredClone(ledger)
staleFP.decisions.at(-1).sourceFingerprint = `sha256:${'0'.repeat(64)}`
const wrongPath = structuredClone(ledger)
wrongPath.sourceLandscapePath = `${out}candidate/not-the-configured-source.json`
const negatives = [
  { name: 'closed decisionBasis enum', error: execute(invalidBasis), expected: /closed JSON Schema/ },
  { name: 'actual raw source fingerprint', error: execute(staleFP), expected: /stale/ },
  { name: 'own exact source address', error: execute(wrongPath), expected: /sourceLandscapePath|landscapePath|configured/ },
]
for (const result of negatives) if (!result.expected.test(result.error)) throw new Error(`${result.name}: ${result.error}`)
const receipt = { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), status: 'PASS', scope: 'only unchanged stock private semantic-kind parser; no whole-book/model or PDF PASS claimed',
  stockEntryPoint: 'goalBookModel.buildGoalBookModel -> parseSemanticKindLedger', canonicalPath, ledgerPath,
  parsedCurrentDecisions: 542, exactNextStageStop: positive,
  negativeControlsInMemoryOnly: negatives.map(({ name, error }) => ({ name, rejected: true, stockError: error })),
  assetsRead: 0, hostsWritten: 0, scienceVotesCreated: 0 }
writeFileSync(`${out}checks/STOCK.actual-private-kind-parser-542.closed-enum-FP-own-address.actual.json`, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
