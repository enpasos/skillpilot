import fs from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { syncBuiltinESMExports } from 'node:module'

const [capsule, repository, output] = process.argv.slice(2)
const originalRead = fs.readFileSync
const reads = new Map<string, any>()
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
// Observe actual public curriculum reads; return original bytes without filtering.
// Directory aliases remain transparent and are never presented as hashed files.
;(fs as any).readFileSync = (...args: any[]) => {
  const result = (originalRead as any)(...args)
  const path = typeof args[0] === 'string' ? resolve(args[0]) : null
  if (path && path.includes('/curricula/')) {
    const origin = path.startsWith(resolve(capsule) + '/') ? 'privatePhysicalCandidateOrReadOnlyAlias' : 'currentRepositoryPublicCurriculumRead'
    const rel = relative(origin.startsWith('private') ? capsule : repository, path)
    reads.set(path, { path: rel, origin, sha256: sha(result), bytes: Buffer.byteLength(result), actualNativeRead: true })
  }
  return result
}
syncBuiltinESMExports()
const compilerPath = join(capsule, 'app/scripts/applicabilityCompiler.ts')
const compiler: any = await import(pathToFileURL(compilerPath).href)
const compilation = compiler.buildApplicabilityCompilation()
const report = compilation.reports.find((r: any) => r.landscapeId === '605bdaf6-32d5-56fd-8d92-5a80c2fd2901')
if (!report) throw new Error('Actual Economics candidate report absent')
const unchangedActualReadBindings = [...reads.entries()].map(([absolute, entry]) => ({ ...entry, wholeBytesStillExactAfterNativeRead: sha(originalRead(absolute)) === entry.sha256 }))
if (unchangedActualReadBindings.some(entry => !entry.wholeBytesStillExactAfterNativeRead)) throw new Error('Actual native curriculum input changed during compilation')
const diagnosticResult = {
  role: 'AUTHOR_BOUNDED_NATIVE_APPLICABILITY_CHECK_NO_SCIENTIFIC_SELF_APPROVAL',
  candidateCompilerSha256: sha(originalRead(compilerPath)),
  compilerAlgorithmModified: false,
  sourceOrQualityFiltersModified: false,
  readOnlyTraceInstrumentationOnly: true,
  report,
  actualPublicCurriculumReadBindings: unchangedActualReadBindings,
  compilationSummaryForThisPrivateSubset: compilation.summary,
  courseRouteOrMaterialScientificApprovalClaim: false,
  protectedForeignM7ApprovalClaim: false,
  humanApprovalClaim: false,
}
fs.mkdirSync(dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(diagnosticResult, null, 2) + '\n')
console.log(JSON.stringify({ goals: report.goals.length, summary: report.summary, actualWholeCurriculumInputsRead: unchangedActualReadBindings.length, findings: report.findings.filter((f: any) => f.severity !== 'diagnostic') }))
if (report.summary.errors > 0) process.exitCode = 1
