// SPDX-License-Identifier: Apache-2.0
// Check existing publication bytes with corrected source sidecars in a temporary output only.
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { goalBookPublicationPaths, verifyPublishedGoalBook } from '../../../../../../../app/scripts/checkGoalBookPublication'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../../../../../../../app/src/utils/goalBookPublicationRegistry'
import type { GoalBookModel } from '../../../../../../../app/scripts/goalBookModel'

async function main() {
  const root = process.cwd()
  const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-original-source-active-mapping-remediation-v3')
  const temporary = await mkdtemp(resolve(tmpdir(), 'skillpilot-original-sources-publication-check-'))
  const terminalResults: unknown[] = []
  try {
    const biology = GOAL_BOOK_PUBLICATION_REGISTRY.find(({ subject }) => subject === 'biology')!
    await assert.rejects(verifyPublishedGoalBook(goalBookPublicationPaths(biology)), /original sources are stale/u,
      'the native publication gate must reject the existing historically contaminated sidecar')
    terminalResults.push({ check: 'existing-biology-sidecar', expectedVerdict: 'rejected as stale', verdict: 'pass' })
    await symlink(resolve(root, 'app/public/lernzielbuch/index.json'), resolve(temporary, 'index.json'))
    for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
      for (const suffix of ['.book-model.json', '.pdf', '.pdf.render-manifest.json']) {
        await symlink(resolve(root, `app/public/lernzielbuch/${definition.artifactStem}${suffix}`),
          resolve(temporary, `${definition.artifactStem}${suffix}`))
      }
      const model = JSON.parse(await readFile(resolve(temporary, `${definition.artifactStem}.book-model.json`), 'utf8')) as GoalBookModel
      await writeFile(resolve(temporary, `${definition.artifactStem}.original-sources.json`),
        serializeGoalBookOriginalSources(buildGoalBookOriginalSources(model)), 'utf8')
      const verified = await verifyPublishedGoalBook(goalBookPublicationPaths(definition, temporary))
      terminalResults.push({ check: 'native-publication-with-current-source-selection', bookId: definition.bookId,
        verdict: 'pass', modelDigest: verified.model.digest, modelSha256: verified.modelSha256,
        pdfSha256: verified.pdfSha256, renderManifestSha256: verified.renderManifestSha256 })
    }
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
  await writeFile(resolve(own, 'native-publication-source-selection.actual.receipt.json'), `${JSON.stringify({
    checkedAtUTC: new Date().toISOString(), terminalResults, rootPublicationWrites: 0,
    pdfOrModelRebuilds: 0, fullApplicationBuilds: 0, temporaryOutputRemoved: true,
    humanApproval: false, browserOrProductionAcceptanceClaimed: false,
  }, null, 2)}\n`, 'utf8')
  console.log('Native publication verification passed for all four books with current source selection; stale Biology sidecar rejected.')
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
