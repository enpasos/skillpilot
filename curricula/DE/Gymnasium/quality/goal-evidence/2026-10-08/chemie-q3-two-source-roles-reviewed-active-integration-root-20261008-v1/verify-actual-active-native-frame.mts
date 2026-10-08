// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const tech = resolve(own, '../chemie-q3-two-source-roles-reviewed-integration-preparation-technical-20261008-v1')
const expectedPath = resolve(tech, 'native/current378.paired-two.actual-model.json')
const expected = JSON.parse(readFileSync(expectedPath, 'utf8'))
const { model } = await loadGoalBookBuildInputs(resolve(root, 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'))
assert.equal(model.pages.length, 378)
assert.equal(stableGoalBookJson(model.pages), stableGoalBookJson(expected.pages), 'Every whole active page must match the actual blind-reviewed native frame')
const output = resolve(own, 'actual-active378-whole-page-frame.proof.json')
writeFileSync(output, JSON.stringify({observedAt: new Date().toISOString(), ordinaryCurrentPublicLoader: true, actualCurrentPageCount: model.pages.length, all378WholePageObjectsExactToActualReviewedNativeFrame: true, originalReviewedModel: {path: relative(root, expectedPath), sha256: createHash('sha256').update(readFileSync(expectedPath)).digest('hex')}, actualActiveModelDigest: model.digest, newScientificReviewByIntegrator: false, humanApproval: false}, null, 2) + '\n', {flag: 'wx'})
console.log('PASS: ordinary active loader; all378 whole native pages equal the actual reviewed frame')
