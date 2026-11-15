import hashlib
import json
import re
from pathlib import Path

root = Path.cwd()
source = root / 'app/scripts/generateCurriculumQualityStatus.ts'
out = root / 'tmp/math-task43-metadata-final-20261115'
text = source.read_text()
changes = []
def change(old, new):
    global text
    assert text.count(old) == 1, old
    text = text.replace(old, new)
    changes.append({'before': old, 'after': new})

text = re.sub(r"from '([.][^']+)'", lambda m: "from '" + str((source.parent / m.group(1)).resolve()) + "'", text)
change('const scriptDir = dirname(fileURLToPath(import.meta.url))', 'const scriptDir = ' + json.dumps(str(source.parent)))
change("const statusDir = resolve(repoRoot, 'docs/qa-ci/status')", "const statusDir = resolve(repoRoot, 'tmp/math-task43-metadata-final-20261115/cqr-current-math')")
change('await generateDeepUnderstandingRollout(undefined, prerequisiteReductionContext)', "await generateDeepUnderstandingRollout('tmp/math-task43-metadata-final-20261115/math-deep-current.config.json', prerequisiteReductionContext)")
change("  const deepUnderstandingReport = await generateDeepUnderstandingRollout('tmp/math-task43-metadata-final-20261115/math-deep-current.config.json', prerequisiteReductionContext)", "  const deepUnderstandingReport = await generateDeepUnderstandingRollout('tmp/math-task43-metadata-final-20261115/math-deep-current.config.json', prerequisiteReductionContext)\n  writeFileSync(resolve(repoRoot, 'tmp/math-task43-metadata-final-20261115/math-deep-current.actual.json'), JSON.stringify(deepUnderstandingReport, null, 2) + '\\n')")
change('const curricula = loadedLandscapes\n    .map', 'const curricula = loadedLandscapes\n    .filter(({ landscape }) => landscape.landscapeId === CANONICAL_GYM_MATH_LANDSCAPE_ID)\n    .map')
change('await withVerificationInputSnapshot(generateStatus)', 'await runMathProbe()')
marker = '\nconst main = async () => {'
assert text.count(marker) == 1
helper = r'''
async function runMathProbe() {
  const out = resolve(repoRoot, 'tmp/math-task43-metadata-final-20261115')
  const mathConfig = JSON.parse(readFileSync(join(out, 'math-deep-current.config.json'), 'utf8'))
  const registryMath = () => JSON.parse(readFileSync(deepUnderstandingRegistryPath, 'utf8')).subjects.find((s: any) => s.subject === 'mathematik')
  if (JSON.stringify(mathConfig.subjects[0]) !== JSON.stringify(registryMath())) throw Error('Focused Math config differs from active subject registry')
  const files = new Set<string>([
    join(scriptDir, 'generateCurriculumQualityStatus.ts'), join(scriptDir, 'lib/routeCatalogContext.ts'),
    join(scriptDir, 'lib/directAtomicRouteCoverage.ts'), join(scriptDir, 'applicabilityCompiler.ts'),
    join(scriptDir, 'curriculumGraphIntegrity.ts'), join(out, 'math-deep-current.config.json'),
    sourceLandscapeRegistryPath, sourceGoalMembershipRegistryPath, sourceGoalClosureRegistryPath,
    surrogateEvidencePath, acceptedWarningsPath,
  ])
  for (const directory of [canonicalRoot, join(compositionViewRoot, 'mathematik')]) {
    for (const file of readdirSync(directory)) if (file.endsWith('.json')) files.add(join(directory, file))
  }
  const visit = (value: unknown) => {
    if (typeof value === 'string' && value.startsWith('curricula/') && existsSync(resolve(repoRoot, value))) files.add(resolve(repoRoot, value))
    else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(mathConfig.subjects[0])
  const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
  const pins = [...files].sort().map(path => ({path:relative(repoRoot,path),sha256:sha(path)}))
  writeFileSync(join(out,'math-cqr-input-pins.actual.json'),JSON.stringify({at:new Date().toISOString(),pins},null,2)+'\n')
  await withVerificationInputSnapshot(generateStatus)
  for (const pin of pins) if (sha(resolve(repoRoot,pin.path)) !== pin.sha256) throw Error('Math CQR input drift: '+pin.path)
  if (JSON.stringify(mathConfig.subjects[0]) !== JSON.stringify(registryMath())) throw Error('Active Math registry changed during CQR')
  const report = JSON.parse(readFileSync(statusJsonPath,'utf8'))
  const subject = report.curricula[0]
  if(report.curricula.length !== 1 || subject.landscapeId !== CANONICAL_GYM_MATH_LANDSCAPE_ID) throw Error('Unexpected probe result domain')
  const result = {at:new Date().toISOString(),subject:subject.title,maturity:subject.maturity,
    goals:subject.goals,atomicGoals:subject.atomicGoals,checkedCurrentCatalogRoots:21,pinnedInputs:pins.length,
    curriculumRules:subject.rules,scopes:subject.scopes,allPinnedInputsStillCurrent:true,
    boundary:'Actual current generator rule bodies, one-subject report selection and focused native Math deep check; no Physics readiness or main CI claim.'}
  writeFileSync(join(out,'math-cqr-summary.actual.json'),JSON.stringify(result,null,2)+'\n')
  console.log(JSON.stringify({maturity:subject.maturity,goals:subject.goals,pinnedInputs:pins.length,scopes:subject.scopes.map((s:any)=>({id:s.scopeId,maturity:s.maturity})),failed:[...subject.rules,...subject.scopes.flatMap((s:any)=>s.rules)].filter((r:any)=>r.status==='fail')}))
}
'''
text = text.replace(marker, '\n'+helper+marker)
probe = out/'native-current-math-cqr-probe.mts'
probe.write_text(text)
receipt = {'source':str(source.relative_to(root)), 'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
           'probe':str(probe.relative_to(root)), 'probeSha256':hashlib.sha256(probe.read_bytes()).hexdigest(),
           'changes':changes, 'additionalInstrumentation':'Absolute imports, unchanged original repo root, exact active Math config equality, before/after21catalog+Mathviews+config input pins, no production writes.',
           'ruleBodiesChanged':False, 'all21CanonicalGraphChecksRetained':True}
(out/'native-current-math-cqr-probe-construction.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False))
