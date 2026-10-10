import fs from 'node:fs'
import Module, { createRequire, syncBuiltinESMExports } from 'node:module'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-NW2-and26-country-scope17-independent-a-READONLY-v1'
const q = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const scope = q + 'wirtschaft-current693-actual26-unsupported-country-groups-with-two-NW-partial-exceptions-SCOPE-AUTHOR-INERT-c-v2'
const nw = q + 'wirtschaft-NW-actual56-57-79-two-real-partial-source-edges-and-two-locators-AUTHOR-INERT-c-v1'
const market = q + 'wirtschaft-current693-four-market-facet-six-direct-partial-edges-AUTHOR-INERT-a-v1'
const bb = q + 'wirtschaft-current693-six-partial-edges-BB177-counter-ADDENDUM-AUTHOR-INERT-a-v2'
const originalRead = fs.readFileSync
const readJson = (p: string) => JSON.parse(originalRead(resolve(root,p),'utf8'))
const scopeIndex = readJson(scope + '/actual26-country-pairs-exact-whole-reference-removals-six-direct-partial-source-exceptions.AUTHOR-INERT.handoff.json')
const nwIndex = readJson(nw + '/SEALED-two-actualNW-partial-bindings-and-two-locators-one-parent-form.AUTHOR-INERT.json')
const replacements = [...scopeIndex.candidateViewPairs.map((p: any) => ({ activePath: p.activePath, candidatePath:p.candidatePath })), ...nwIndex.pairs.map((p: any) => ({ activePath:p.activePath, candidatePath:p.candidatePath })),
  { activePath:'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json',candidatePath:market+'/BY.whole-mapping-six-edge-successor.AUTHOR-INERT.json' },
  { activePath:'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json',candidatePath:bb+'/BB.whole-mapping-one-new-partial-edge-current177-metadata-correct.AUTHOR-INERT.json' }]
const guardPaths = [...new Set([...replacements.flatMap((p: any) => [p.activePath,p.candidatePath]),'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/sourceCoverageEvidence.ts','app/scripts/compositionViewSourceCoverage.ts'])]
const sha = (p: string) => createHash('sha256').update(originalRead(resolve(root,p))).digest('hex')
const before = guardPaths.map(path => ({ path,sha256:sha(path) }))
const require = createRequire(resolve(root,'app/package.json'))
const esbuild = require('esbuild')
const statusPath = resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')
const statusSource = originalRead(statusPath,'utf8') + '\nexport { readJurisdictionCoverageByLandscapeId };\n'
const compiled = esbuild.transformSync(statusSource,{loader:'ts',format:'cjs',target:'node20',define:{'import.meta.url':JSON.stringify(pathToFileURL(statusPath).href)}}).code
function evaluate(overlays: any[]) {
  const overlay = new Map(overlays.map(p => [resolve(root,p.activePath),resolve(root,p.candidatePath)]))
  ;(fs as any).readFileSync = (path: any,...args: any[]) => {
    const key = typeof path === 'string' ? resolve(path) : path instanceof URL ? resolve(path.pathname) : ''
    return (originalRead as any)(overlay.get(key) ?? path,...args)
  }
  syncBuiltinESMExports()
  try {
    // Original source compiled in memory; only an export is appended. Main argv
    // guard sees this review helper, so no status/report generation is invoked.
    const module: any = new (Module as any)(statusPath)
    module.filename = statusPath
    module.paths = (Module as any)._nodeModulePaths(dirname(statusPath))
    module._compile(compiled,statusPath)
    const { buildApplicabilityCompilation } = require(resolve(root,'app/scripts/applicabilityCompiler.ts'))
    const compilation = buildApplicabilityCompilation()
    const report = compilation.reports.find((r: any) => r.landscapeId === '605bdaf6-32d5-56fd-8d92-5a80c2fd2901')
    const result = module.exports.readJurisdictionCoverageByLandscapeId({ ...compilation,reports:[report] })
    return result.get(report.landscapeId)
  } finally {
    fs.readFileSync = originalRead
    syncBuiltinESMExports()
  }
}
const baseline = evaluate([])
const candidate = evaluate(replacements)
const endGuards = before.map(g => ({ ...g,endSha256:sha(g.path),exact:sha(g.path)===g.sha256 }))
if (!endGuards.every(g=>g.exact)) throw new Error('Inputs changed during actual read-only native probe')
const artifact = { actualAt:new Date().toISOString(),actualNativeMethods:['buildApplicabilityCompilation','readJurisdictionCoverageByLandscapeId (exact private native function exported in memory only)'],originalStatusSourceSha256:sha('app/scripts/generateCurriculumQualityStatus.ts'),originalAppCompilerSha256:sha('app/scripts/applicabilityCompiler.ts'),mainInvoked:false,activeWrites:0,overlays:replacements,baseline,candidate,endGuards,nativePassNotIndependentScienceOrM6M7Claim:true }
fs.writeFileSync(resolve(root,own,'actual-native-before-after21-overlay-Scope17-and-eight-source-partial-edges.READONLY.json'),JSON.stringify(artifact,null,2)+'\n')
console.log(JSON.stringify({ baseline,candidate }))
