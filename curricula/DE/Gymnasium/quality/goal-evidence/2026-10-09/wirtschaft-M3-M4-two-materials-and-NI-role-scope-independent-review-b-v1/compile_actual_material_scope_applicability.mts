import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const [capsule, output, label] = process.argv.slice(2)
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const compiler: any = await import(pathToFileURL(join(capsule, 'app/scripts/applicabilityCompiler.ts')).href)
const compilation = compiler.buildApplicabilityCompilation()
const economicId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const report = compilation.reports.find((r: any) => r.landscapeId === economicId)
if (!report) throw new Error('Actual Economics report absent')
const files: any[] = []
const collect = (path: string, relative = 'curricula') => {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const next = join(path, entry.name), rel = `${relative}/${entry.name}`
    if (entry.isSymbolicLink()) throw new Error(`Curriculum source input cannot be a symlink: ${rel}`)
    if (entry.isDirectory()) collect(next, rel)
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push({ path: rel, sha256: sha(next) })
  }
}
collect(join(capsule, 'curricula'))
writeFileSync(output, JSON.stringify({ label, scope: 'Actual Economics report from whole unchanged native compilation over physically bound relevant inputs; other course approval not claimed', nativeCompilerSha256: sha(join(capsule, 'app/scripts/applicabilityCompiler.ts')), report, physicalWholeCurriculumInputs: files, summary: compilation.summary, nativeAlgorithmModified: false, sourceEvidenceFiltered: false, humanApproval: false }, null, 2) + '\n')
console.log(JSON.stringify({ label, goals: report.goals.length, summary: report.summary, findings: report.findings.map((f: any) => ({ code: f.code, severity: f.severity, goalId: f.goalId, message: f.message })) }))
