import fs from 'node:fs'
import Module, { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-source-bound-duration-policy-and-QAalias-independent-a-READONLY-v1'
const [candidateCodePath, candidateSourcePath, candidatePolicyPath] = process.argv.slice(2)
if (!candidateCodePath || !candidateSourcePath || !candidatePolicyPath) throw new Error('Actual independently authored alias, whole source, whole policy paths required')
const codePath = 'app/scripts/reportGymnasiumDurationModelReadiness.ts'
const sourcePath = 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_WBS_SEKI_BP2016.source-extraction.json'
const policyPath = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
const statusPath = 'docs/qa-ci/status/curriculum-quality-status.json'
const reportPath = 'docs/qa-ci/status/gymnasium-duration-model-readiness.md'
const read = (path: string) => JSON.parse(fs.readFileSync(resolve(root, path), 'utf8'))
const artifact = (path: string) => { const bytes = fs.readFileSync(resolve(root, path)); return { path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const originalCode = fs.readFileSync(resolve(root, own, 'originalNativeReadiness.before.EXACT.ts'), 'utf8')
const aliasCode = fs.readFileSync(resolve(root, candidateCodePath), 'utf8')
const sourceBefore = read(own + '/whole43Source.before.EXACT.json')
const policyBefore = read(own + '/wholeDurationPolicy.before.EXACT.json')
const sourceCandidate = read(candidateSourcePath)
const policyCandidate = read(candidatePolicyPath)
const require = createRequire(resolve(root, 'app/package.json'))
const esbuild = require('esbuild')
const checks: any[] = []
const check = (name: string, passed: boolean) => { checks.push({ name, passed }); if (!passed) throw new Error(name) }
const clone = (obj: any) => JSON.parse(JSON.stringify(obj))
const absoluteScriptPath = resolve(root, codePath)
const paths = [codePath, sourcePath, policyPath, statusPath, reportPath, candidateCodePath, candidateSourcePath, candidatePolicyPath, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_wbs_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json']
const beforeInputs = paths.map(artifact)
const economics = read(statusPath).curricula.find((c: any) => c.subject === 'Wirtschaftswissenschaften')
check('actual current status contains Economics as M6 or M7, no status fixture invented', !!economics && ['M6', 'M7'].includes(economics.maturity))
check('whole43 source original bodies remain exactly retained', sourceBefore.sourceGoals.length === 43 && JSON.stringify(sourceBefore.sourceGoals) === JSON.stringify(sourceCandidate.sourceGoals) && JSON.stringify(sourceBefore.passages) === JSON.stringify(sourceCandidate.passages))
const newDecision = policyCandidate.decisions.find((d: any) => d.sourceExtractionPath === sourcePath)
check('one exact source-bound reviewed G8 policy exists', !!newDecision && newDecision.subject === 'Wirtschaftswissenschaften' && newDecision.jurisdiction === 'DE-BW' && newDecision.stage === 'SekI' && newDecision.status === 'reviewed' && newDecision.decision === 'single-duration-source' && JSON.stringify(newDecision.durationModels) === JSON.stringify(['G8']))
check('no original policy decision body rewritten or removed', JSON.stringify(policyCandidate.decisions.filter((d: any) => d.sourceExtractionPath !== sourcePath)) === JSON.stringify(policyBefore.decisions))

function executeNative(name: string, codeSource: string, wholeSource: any, wholePolicy: any) {
  const savedRead = fs.readFileSync
  const savedWrite = fs.writeFileSync
  const savedLog = console.log
  const savedError = console.error
  const savedArgv = process.argv
  const savedExit = process.exitCode
  const stdout: string[] = []
  const stderr: string[] = []
  let capturedReport = ''
  let reportWriteRequestsCapturedWithoutWriting = 0
  const overlays = new Map([[resolve(root, sourcePath), JSON.stringify(wholeSource)], [resolve(root, policyPath), JSON.stringify(wholePolicy)]])
  const transformed = esbuild.transformSync(codeSource, { loader: 'ts', format: 'cjs', target: 'node20', define: { 'import.meta.url': JSON.stringify(pathToFileURL(absoluteScriptPath).href) } }).code
  try {
    ;(fs as any).readFileSync = (path: any, options: any) => {
      const candidate = typeof path === 'string' ? overlays.get(resolve(path)) : undefined
      if (candidate === undefined) return savedRead(path, options)
      return typeof options === 'string' || options?.encoding ? candidate : Buffer.from(candidate)
    }
    ;(fs as any).writeFileSync = (path: any, data: any) => {
      if (typeof path !== 'string' || resolve(path) !== resolve(root, reportPath)) throw new Error('Unexpected native write attempted: ' + String(path))
      capturedReport = String(data)
      reportWriteRequestsCapturedWithoutWriting++
    }
    console.log = (...args: any[]) => stdout.push(args.map(String).join(' '))
    console.error = (...args: any[]) => stderr.push(args.map(String).join(' '))
    process.argv = [process.execPath, absoluteScriptPath, '--write', '--require-reviewed-subject=Wirtschaftswissenschaften']
    process.exitCode = 0
    const module: any = new (Module as any)(absoluteScriptPath)
    module.filename = absoluteScriptPath
    module.paths = (Module as any)._nodeModulePaths(dirname(absoluteScriptPath))
    module._compile(transformed, absoluteScriptPath)
    const exitCode = process.exitCode ?? 0
    return { name, exitCode, stdout, stderr, capturedReport: capturedReport || savedRead(resolve(root, reportPath), 'utf8'), reportWriteRequestsCapturedWithoutWriting, activeWrites: 0 }
  } finally {
    ;(fs as any).readFileSync = savedRead
    ;(fs as any).writeFileSync = savedWrite
    console.log = savedLog
    console.error = savedError
    process.argv = savedArgv
    process.exitCode = savedExit
  }
}

const runs = [
  executeNative('original_subject_header_unrecognized_before_fix', originalCode, sourceBefore, policyBefore),
  executeNative('exact_alias_alone_keeps_actual_BW43_unreviewed_fail', aliasCode, sourceBefore, policyBefore),
  executeNative('exact_alias_and_qualified_source_specific_G8_policy', aliasCode, sourceCandidate, policyCandidate),
]
const pendingPolicy = clone(policyCandidate)
pendingPolicy.decisions.find((d: any) => d.sourceExtractionPath === sourcePath).status = 'pending'
runs.push(executeNative('negative_unreviewed_status_cannot_pass', aliasCode, sourceCandidate, pendingPolicy))
const missingPolicy = clone(policyCandidate)
missingPolicy.decisions = missingPolicy.decisions.filter((d: any) => d.sourceExtractionPath !== sourcePath)
runs.push(executeNative('negative_missing_exact_source_decision_cannot_pass', aliasCode, sourceCandidate, missingPolicy))
const duplicatePolicy = clone(policyCandidate)
duplicatePolicy.decisions.push(clone(newDecision))
runs.push(executeNative('negative_duplicate_source_decision_is_fatal', aliasCode, sourceCandidate, duplicatePolicy))
check('exact alias alone fails on real BW43 source with open duration review', runs[1].exitCode === 1 && runs[1].stderr.some(line => line.includes('DE-BW SekI: open:needs-duration-review') && line.includes(sourcePath)))
check('qualified bounded source policy passes actual reviewed subject gate', runs[2].exitCode === 0 && runs[2].stderr.length === 0)
check('unreviewed explicit G8 source policy remains fatal', runs[3].exitCode === 1 && runs[3].stderr.some(line => line.includes('DE-BW SekI: open:single-duration-needs-policy')))
check('missing exact source policy remains fatal', runs[4].exitCode === 1 && runs[4].stderr.some(line => line.includes('DE-BW SekI: open:single-duration-needs-policy')))
check('duplicate exact source policy remains fatal', runs[5].exitCode === 1 && runs[5].stderr.some(line => line.includes('Duplicate duration policy decision')))
const sourceRows = (report: string) => report.split('\n').filter(line => line.startsWith('| Wirtschaftswissenschaften |') && line.includes('/source-extraction/'))
const sourceRowsBefore = sourceRows(runs[0].capturedReport)
const sourceRowsAlias = sourceRows(runs[1].capturedReport)
const sourceRowsCandidate = sourceRows(runs[2].capturedReport)
const countGoals = (rows: string[]) => rows.reduce((sum, line) => { const cells = line.split('|').map(x => x.trim()); return sum + Number(cells[7]) }, 0)
check('original report omits exactly actual BW43 source, 29 sources2092 goals', sourceRowsBefore.length === 29 && countGoals(sourceRowsBefore) === 2092)
check('alias exposes all30 current source rows2135 goals', sourceRowsAlias.length === 30 && countGoals(sourceRowsAlias) === 2135)
check('qualified candidate retains30 source rows2135 goals', sourceRowsCandidate.length === 30 && countGoals(sourceRowsCandidate) === 2135)
const foreignLines = (report: string) => report.split('\n').filter(line => !line.includes('Wirtschaftswissenschaften'))
check('all foreign report lines whole exact after alias and source-specific policy', JSON.stringify(foreignLines(runs[0].capturedReport)) === JSON.stringify(foreignLines(runs[2].capturedReport)))
const bwRow = sourceRowsCandidate.find(line => line.includes(sourcePath))
check('report names source-bound singleG8 decision without false dual duration', !!bwRow && bwRow.includes('single-duration-source (G8)') && !bwRow.includes('G8, G9'))
const endInputs = paths.map(artifact)
check('all active and candidate inputs byte exact before/end', JSON.stringify(beforeInputs) === JSON.stringify(endInputs))
const output = { at: new Date().toISOString(), status: 'PASS_independent_original_native_alias_and_source_specific_G8_policy_with_five_actual_negative_boundaries', originalNativeScriptPath: codePath, sourcePath, nativeExecution: 'Actual original native script bodies evaluated via esbuild module with candidate-source/policy bytes in read overlays; native report write captured in memory only and all global hooks restored in finally.', actualCurrentEconomicsMaturity: economics.maturity, beforeInputs, endInputs, checks, runs, sourceTotals: { before: { files: sourceRowsBefore.length, goals: countGoals(sourceRowsBefore) }, alias: { files: sourceRowsAlias.length, goals: countGoals(sourceRowsAlias) }, candidate: { files: sourceRowsCandidate.length, goals: countGoals(sourceRowsCandidate) } }, candidateBWSourceRow: bwRow, activeWrites: 0, broadBuildOrQSRun: false, noRuntimeCompositionViewChanges: true, noG9SourceCompletionClaim: true, noM7DVorHumanApprovalClaim: true }
fs.writeFileSync(resolve(root, own, 'actual-original-native-alias-only-negative-source-policy-positive-and-unreviewed-duplicate-negative.READONLY.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ checks: checks.length, sources: sourceRowsCandidate.length, sourceGoals: countGoals(sourceRowsCandidate), aliasOnlyExit: runs[1].exitCode, qualifiedCandidateExit: runs[2].exitCode, pendingMissingDuplicateExit: runs.slice(3).map(run => run.exitCode), activeWrites: 0 }))
