// SPDX-License-Identifier: Apache-2.0
// PRIVATE RAM-only original file mutation checks. The Git object store is read only.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createVisualizationContextVerifier } from './goalVisualizationReviewedContext.private'
const out = dirname(fileURLToPath(import.meta.url)), root = resolve(out, '../../../..')
const index = JSON.parse(readFileSync(resolve(out, 'candidate-index.json'), 'utf8'))
const temporary = mkdtempSync('/dev/shm/skillpilot-econ-q2-original-negative-')
const current = resolve(temporary, 'current'), originals = resolve(temporary, 'originals')
mkdirSync(current); mkdirSync(originals)
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const actualGitDir = spawnSync('git', ['-C', root, 'rev-parse', '--absolute-git-dir'], { encoding: 'utf8' })
if (actualGitDir.status !== 0) throw new Error('Actual object store path unavailable')
writeFileSync(resolve(originals, '.git'), 'gitdir: ' + actualGitDir.stdout.trim() + '\n')
const copy = (base: string, path: string) => {
  const target = resolve(base, path); mkdirSync(dirname(target), { recursive: true }); copyFileSync(resolve(root, path), target)
}
const results: unknown[] = []
try {
  const positions = [0, index.rows.findIndex((row: any) => row.corrected)]
  for (const position of positions) {
    const row = index.rows[position], reference = index.candidateReceipts[position]
    for (const dependency of row.originalDependencies) copy(originals, dependency.path)
    for (const path of [row.current.publicAssetPath, row.current.canonicalAssetPath]) copy(current, path)
    const receiptRaw = readFileSync(resolve(root, reference.path))
    writeFileSync(resolve(current, 'receipt.json'), receiptRaw)
    const ref = { path: 'receipt.json', sha256: sha(receiptRaw) }
    const verify = createVisualizationContextVerifier({ repositoryRoot: current,
      originalEvidenceRepositoryRoot: originals, acceptedRepositoryCommit: index.acceptedRepositoryCommit })
    const control = verify(ref, row.current)
    if (!control.ok) throw new Error('RAM originals positive control failed: ' + JSON.stringify(control))
    results.push({ goalId: row.goalId, case: 'RAM original files and actual read-only Git objects positive control', expected: 'ok', actual: 'ok' })
    const mutationRoles = row.corrected
      ? [row.originalReview.path, row.originalDependencies.find((dep: any) => dep.path.endsWith('/independent-image-review.receipt.json') && !dep.path.includes('/correction-v2/')).path,
        row.originalDependencies.find((dep: any) => dep.path.endsWith('/native-preparation/metadata.json')).path,
        row.originalDependencies.find((dep: any) => dep.path.endsWith('/prompt.actual.txt')).path]
      : [row.originalReview.path, row.originalDependencies.find((dep: any) => dep.path.endsWith('/whole-goals.candidate.json')).path,
        row.originalDependencies.find((dep: any) => dep.path.endsWith('/metadata.json')).path,
        row.originalDependencies.find((dep: any) => dep.path.endsWith('/nano-banana-prompt.de.md')).path,
        row.originalDependencies.find((dep: any) => dep.path.endsWith('.width-360.png')).path]
    for (const path of mutationRoles) {
      const target = resolve(originals, path), before = readFileSync(target)
      writeFileSync(target, Buffer.concat([before, Buffer.from('\nchanged RAM-only evidence bytes')]))
      const checked = verify(ref, row.current)
      results.push({ goalId: row.goalId, case: 'actual current-copy original file mutated', path,
        expected: 'invalid', actual: checked.ok ? 'ok' : checked.status, issues: checked.ok ? [] : checked.issues })
      if (checked.ok || checked.status !== 'invalid' || !checked.issues.some(issue => issue.includes('Original input bytes changed'))) {
        throw new Error('Actual original input mutation escaped: ' + path + ' ' + JSON.stringify(checked))
      }
      writeFileSync(target, before)
    }
  }
  writeFileSync(resolve(out, 'original-input-negative-results.json'), JSON.stringify({ isolatedInRam: true,
    originalGitObjectStoreReadOnly: true, actualSourceFilesMutated: false, cases: results.length, results }, null, 2) + '\n')
  console.log(JSON.stringify({ ramOriginalInputCases: results.length, actualActiveWrites: 0 }))
} finally { rmSync(temporary, { recursive: true, force: true }) }
