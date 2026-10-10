// SPDX-License-Identifier: Apache-2.0
// Read-only ordinary whole-source attempt: all normal assertions stay enabled.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve('.')
const { buildGoalBookSourceAtlasInputs } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1/source-atlas/whole398-source24.normal-probe.inputs.json'
const config = JSON.parse(readFileSync(resolve(root, path), 'utf8'))
try {
  const result = buildGoalBookSourceAtlasInputs(config, root)
  console.log(JSON.stringify({ actualTerminal: 'PASS', normalExpectedAtomicCount: config.expectedCurricularAtomicGoalCount, receipt: result.receipt }))
} catch (error) {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
}
