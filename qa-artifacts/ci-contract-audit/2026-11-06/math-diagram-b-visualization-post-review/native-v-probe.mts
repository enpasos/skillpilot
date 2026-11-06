import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { isAiApprovedForCurrentAsset } from '../../../../app/src/utils/goalVisualizationQaStatus'

// Execute the exact native private V consumer and its real freshness subprocess.
// The one-goal scope is deliberate: this is not a complete D/P/A/M/V lane run.
const repoRoot = process.cwd()
const require = createRequire(resolve(repoRoot, 'app/package.json'))
const ts = require('typescript')
const sourcePath = 'app/scripts/reportDeepUnderstandingRollout.ts'
const source = readFileSync(sourcePath, 'utf8')
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')
assert.equal(hash(source), 'a13dff507b0df8e3d78aea16002300ed283ba943a5da184380cc53c818af8e80')
const names = ['sha256', 'normalizeText', 'parseJson', 'loadJson', 'resolveRepoPath',
  'duplicateValues', 'hasCompletedDeepUnderstandingVisualizationReview', 'addIssue',
  'runTsxCheck', 'digestFile', 'loadVisualizationReadyGoals']
const ast = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true)
const statements = ast.statements.filter((statement: any) => ts.isVariableStatement(statement)
  && statement.declarationList.declarations.some((d: any) => names.includes(d.name.text)))
assert.equal(statements.length, names.length)
const extracted = statements.map((s: any) => s.getText(ast).replace(/^export /u, '')).join('\n')
const javascript = ts.transpileModule(extracted, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText
const subprocesses: unknown[] = []
const observedSpawn = (...args: Parameters<typeof spawnSync>) => {
  const result = spawnSync(...args)
  subprocesses.push({ command: args[0], args: args[1], status: result.status,
    stdout: result.stdout?.toString(), stderr: result.stderr?.toString(), error: result.error?.message })
  return result
}
const native = new Function('repoRoot', 'createHash', 'readFileSync', 'existsSync', 'resolve',
  'relative', 'sep', 'spawnSync', 'isAiApprovedForCurrentAsset', javascript
  + '\nreturn {loadVisualizationReadyGoals, normalizeText, hasCompletedDeepUnderstandingVisualizationReview};')(
  repoRoot, createHash, readFileSync, existsSync, resolve, relative, sep, observedSpawn, isAiApprovedForCurrentAsset)
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const visualizationQaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const landscape = JSON.parse(readFileSync(landscapePath, 'utf8'))
const ledger = JSON.parse(readFileSync(visualizationQaPath, 'utf8'))
const goalId = '0c2ddfcd-1399-41ad-aaed-4f061812602a'
const goal = landscape.goals.find((g: any) => g.id === goalId)
const row = ledger.records.find((r: any) => r.goalId === goalId)
const issues: string[] = [], deferred = new Set<string>()
const ready = native.loadVisualizationReadyGoals(
  {subject: 'mathematik', landscapePath, visualizationQaPath},
  {landscape, atomicGoalIds: [goalId], goalById: new Map([[goalId, goal]])}, issues, deferred)
assert.equal(subprocesses.length, 1)
const result = {
  scenario: process.argv[2], sourceSha256: hash(readFileSync(landscapePath)),
  ledgerSha256: hash(readFileSync(visualizationQaPath)), goalId,
  descriptionMatches: native.normalizeText(row.description) === native.normalizeText(goal.description),
  nativeAssetApproval: native.hasCompletedDeepUnderstandingVisualizationReview(row),
  ready: [...ready], issues, deferred: [...deferred], subprocesses,
  nativeSource: {path: sourcePath, sha256: hash(source), extractedDeclarationsSha256: hash(extracted), names},
  scope: 'one-goal V consumer; actual whole-subject visualization-ledger freshness subprocess; no full Deep lane',
}
console.log(JSON.stringify(result, null, 2))
assert.deepEqual([...ready], process.argv[2] === 'b-with-historical-row' ? [] : [goalId])
assert.equal((subprocesses[0] as any).status, process.argv[2] === 'b-with-historical-row' ? 1 : 0)
