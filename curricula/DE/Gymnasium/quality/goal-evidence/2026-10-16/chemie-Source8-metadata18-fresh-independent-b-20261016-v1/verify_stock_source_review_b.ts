import fs from 'node:fs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-CQR004-HE-buffer-SH-synthesis-and-Source13-atlas-metadata-targeted-author-successor-20261016-v1'
const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-Source8-metadata18-fresh-independent-b-20261016-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const sha = (p: string) => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const sciencePath = `${out}/E16.source-review-b.science-first.frozen.md`
assert.ok(fs.existsSync(sciencePath))
const frozenScienceSha256 = sha(sciencePath)
const context = read(`${out}/E16.current-context.five-whole-goal-delta.actual.json`)
assert.equal(sha(context.baseCanonicalPath), context.baseCanonicalSha256)
const canonical = read(context.baseCanonicalPath)
for (const g of context.wholeCurrentGoalObjects) {
  const index = canonical.goals.findIndex((x: any) => x.id === g.id)
  assert.ok(index >= 0)
  canonical.goals[index] = g
}
const byId = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const cas = read(`${author}/CAS.finite-seventeen-whole-files-author-candidate.json`).items
const replacements = new Map<string, any>(cas.map((c: any) => [c.normalPath, c]))
const normal = read(`${author}/INPUTS.actual-normal-mapping-and-source-pins-for-bounded-CQR.json`)
const checkPin = (p: any) => {
  assert.equal(sha(p.path), p.sha256)
  assert.equal(fs.statSync(p.path).size,p.bytes)
}
const beforeMapping = normal.mappingFiles.map((m: any) => {
  checkPin(m.actualWhole)
  return {...read(m.actualWhole.path), file:m.normalPath}
})
const afterMapping = normal.mappingFiles.map((m: any) => ({...read(replacements.get(m.normalPath)?.after.path ?? m.actualWhole.path),file:m.normalPath}))
const beforeSources = new Map<string,any>(), afterSources = new Map<string,any>()
for (const [normalPath,pin] of Object.entries(normal.sourceExtractions) as any) {
  checkPin(pin)
  beforeSources.set(normalPath,read(pin.path))
  afterSources.set(normalPath,read(replacements.get(normalPath)?.after.path ?? pin.path))
}
const cqrBefore = evaluateCourseLevelMappingConsistency(canonical,beforeMapping,beforeSources)
const cqrAfter = evaluateCourseLevelMappingConsistency(canonical,afterMapping,afterSources)
assert.equal(cqrBefore.metrics.mismatches,8)
assert.equal(cqrAfter.status,'pass')
assert.equal(cqrAfter.metrics.mismatches,0)
assert.equal(cqrAfter.metrics.sourceGoals,cqrBefore.metrics.sourceGoals)
const explicitCourseChecks:any[] = []
for (const c of cas.slice(0,8)) {
  const mapping = read(c.after.path)
  for (const delta of c.wholeObjectDeltas.filter((x:any) => x.pointerBefore.startsWith('/mappings/'))) {
    for (const edge of delta.wholeAfterItems ?? [delta.wholeAfter]) {
      const source = afterSources.get(mapping.sourceExtractionPath).sourceGoals.find((x:any) => x.id===edge.legacyGoalId)
      const target = byId.get(edge.canonicalGoalId)
      const tags = source.courseLevel==='GK_LK' ? ['GK','LK'] : [source.courseLevel]
      const jurisdiction = edge.legacyGoalId.startsWith('he-') ? 'DE-HE' : 'DE-SH'
      assert.ok(tags.every((tag:string) => target.tags.includes(tag)))
      assert.ok(target.applicability.jurisdiction.includes(jurisdiction))
      assert.equal(edge.matchType,'partial')
      explicitCourseChecks.push({file:c.normalPath,sourceId:source.id,sourceCourse:source.courseLevel,targetId:target.id,tags:target.tags,jurisdiction,compatibleWithoutStockPartialSkip:true})
    }
  }
}
assert.equal(explicitCourseChecks.length,14)
const idsets = read(`${out}/E16.current435-ordinary57-memory.id-sets.actual.json`)
const ordinary = new Set<string>(idsets.ordinaryIds), memory = new Set<string>(idsets.memoryIds)
assert.equal(ordinary.size,435)
assert.equal(memory.size,57)
const ajv = new Ajv2020({allErrors:true,strict:false})
const validate = ajv.compile(read('contracts/curriculum-package/v1/composition-view.schema.json'))
const sorted = (s:Set<string>) => [...s].sort()
const subset = (s:Set<string>, ids:Set<string>) => new Set([...s].filter(x => ids.has(x)))
const views:any[]=[]
for (const c of cas.slice(15,17)) {
  const before=read(c.before.path),after=read(c.after.path)
  assert.ok(validate(after),JSON.stringify(validate.errors))
  const cb=compileCompositionView(before,canonical), ca=compileCompositionView(after,canonical)
  const beforeErrors=cb.findings.filter(x => x.severity==='error'),afterErrors=ca.findings.filter(x => x.severity==='error')
  assert.equal(beforeErrors.length,0);assert.equal(afterErrors.length,0)
  const a=collectCompositionProjectionRoleGoalIds(before.rootNodes,byId),b=collectCompositionProjectionRoleGoalIds(after.rootNodes,byId)
  const roles:any={}
  for (const [label,field] of [['target','targetGoalIds'],['prerequisiteOnly','prerequisiteOnlyGoalIds']] as const) {
    for (const [kind,ids] of [['ordinary',ordinary],['memory',memory]] as const) {
      const aa=sorted(subset(a[field],ids)),bb=sorted(subset(b[field],ids))
      assert.deepEqual(bb,aa)
      roles[`${kind}-${label}`]={before:aa,after:bb,exact:true}
    }
  }
  assert.ok(a.targetGoalIds.has('539476ee-f9cd-5b66-9b2e-ab42c4ea7cf4') && b.targetGoalIds.has('539476ee-f9cd-5b66-9b2e-ab42c4ea7cf4'))
  assert.deepEqual(sorted(a.prerequisiteOnlyGoalIds),sorted(b.prerequisiteOnlyGoalIds))
  assert.deepEqual(sorted(new Set([...a.targetGoalIds].filter(x => x!=='cf2631d9-da24-50e8-9e50-db625e6efaad'))),sorted(b.targetGoalIds))
  views.push({path:c.normalPath,schemaErrors:0,stockCompilerErrorsBefore:0,stockCompilerErrorsAfter:0,roles,onlyRemovedTarget:'cf2631d9-da24-50e8-9e50-db625e6efaad',retrosynthesisRetained:true})
}
assert.equal(sha(sciencePath),frozenScienceSha256)
const report={role:'Independent bounded stock execution after frozen science; no whole source/course approval',frozenScienceSha256,observedCurrentCanonicalSha256:context.observedHCanonicalSha256,portableCanonicalReconstruction:'Pinned committable author canonical plus exact five whole description successors',cqrBefore,cqrAfter,explicitCourseChecks,views,wholeCanonicalNodes:canonical.goals.length,currentOrdinaryIds:ordinary.size,currentMemoryIds:memory.size,partialEdgesSkippedByStockCQR:true,fullAtlasExecuted:false,fullBuildExecuted:false,newD_P_A_M_VVotes:0,newFachlicheClosures:0,netStrictGain:0,normalWrites:0,HWrites:0,RWrites:0,HumanApproval:false,HumanTrial:false}
const reportPath=`${out}/E16.source-review-b.stock-CQR004-and-SH-role-compiler.actual.json`
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n')
assert.deepEqual(read(reportPath),report)
console.log(JSON.stringify({status:'PASS',beforeMismatches:cqrBefore.metrics.mismatches,afterMismatches:cqrAfter.metrics.mismatches,sourceGoals:cqrAfter.metrics.sourceGoals,explicitPartialEdgeChecks:explicitCourseChecks.length,SHViews:views.length,ordinaryIds:ordinary.size,memoryIds:memory.size,viewCounts:views.map(x=>({path:x.path,ordinary:x.roles['ordinary-target'].after.length,memory:x.roles['memory-target'].after.length}))}))
