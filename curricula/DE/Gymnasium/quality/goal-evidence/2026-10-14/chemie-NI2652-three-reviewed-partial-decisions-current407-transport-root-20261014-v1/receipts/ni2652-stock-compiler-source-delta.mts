import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [hostArg, outArg] = process.argv.slice(2)
if (!hostArg || !outArg) throw new Error('Usage: host output-json')
const host = resolve(hostArg)
const compiler = await import(pathToFileURL(resolve(host, 'app/scripts/applicabilityCompiler.ts')).href)
const coverage = await import(pathToFileURL(resolve(host, 'app/scripts/sourceCoverageEvidence.ts')).href)
const all = compiler.buildApplicabilityCompilation()
const chemistry = all.reports.find((r:any) => r.landscapeId === 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
if (!chemistry) throw new Error('Chemistry report missing')
const target = chemistry.goals.find((g:any) => g.goalId === '2652caef-b557-58b9-9b28-70db62625ce5')
if (!target) throw new Error('Whole 2652 goal missing')
const digest = (value:any) => `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`
const json = {
 schemaVersion: 1,
 checkedAtUTC: new Date().toISOString(),
 stockCompiler: 'unchanged app/scripts/applicabilityCompiler.ts::buildApplicabilityCompilation',
 stockSourceChecker: 'unchanged app/scripts/sourceCoverageEvidence.ts::hasDirectSourceCoverageEvidence',
 privateHost: host,
 wholeSelectedCompiledGoal: target,
 niDirectSourceEvidence: target.evidence.filter((e:any) => e.dimension === 'jurisdiction' && e.value === 'DE-NI' && (e.kind === 'mapping' || e.kind === 'provenance')),
 hasDirectNISourceBacking: coverage.hasDirectSourceCoverageEvidence(target, 'DE-NI'),
 allCompiledReportDigests: all.reports.map((r:any) => ({ landscapeId:r.landscapeId, goalsDigest:digest(r.goals), findingsDigest:digest(r.findings), projectionsDigest:digest(r.projections) })),
 chemistryGoalCount: chemistry.goals.length,
 chemistryFindings: chemistry.findings,
 compilerSummary: all.summary,
 wholeSourceClosureApproval: false,
 wholeMaturityPassClaim: false,
 humanApproval: false,
 activeWrites: false
}
writeFileSync(resolve(outArg), JSON.stringify(json,null,2)+'\n')
console.log(JSON.stringify({hasDirectNISourceBacking:json.hasDirectNISourceBacking, selectedNIReferences:json.niDirectSourceEvidence.length, chemistryGoalCount:json.chemistryGoalCount, compilerSummary:json.compilerSummary}))
