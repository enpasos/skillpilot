import assert from 'node:assert/strict'
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { materializeCompositionStageMembership } from '/home/enpasos/projects/skillpilot/app/scripts/lib/compositionStageRouteMembership.ts'
import { evaluateRouteProfile, createRouteProfiles } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
import type { SkillLandscape } from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts'
import type { CompositionView, CompositionViewNode } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'

const root = '/home/enpasos/projects/skillpilot'
const out = resolve(process.argv[2]); mkdirSync(out, { recursive: true })
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const files = ['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/lib/compositionStageRouteMembership.ts',
  'app/src/utils/learnerCompositionScopeMatching.ts',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-hb-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/mathematik/de-hb-seki.view.json']
const pins = () => Object.fromEntries(files.map(p => [p, createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')]))
const beforePins = pins()
const ids = ['a','b','c']
const subset = (bits: number) => new Set(ids.filter((_,i) => bits & (1<<i)))
let checked = 0
for(let e=0;e<8;e++) for(let a=0;a<8;a++) {
  const exposure = {targetGoalIds:subset(e),visibleGoalIds:new Set(ids)}
  const authority = {targetGoalIds:subset(a),visibleGoalIds:new Set(ids)}
  const snapshot = structuredClone({exposure,authority})
  const r = materializeCompositionStageMembership(exposure,[authority])
  assert.deepEqual([...r.projection.targetGoalIds].sort(),[...subset(a&e)].sort())
  assert.deepEqual(r.errors,[],'source-stage membership is intersected with the audited course exposure; a neutral stage does not add targets to a narrower full course')
  assert.deepEqual(r.authority?.targetGoalIds,authority.targetGoalIds,'obligations retain source membership independently of exposure')
  assert.deepEqual({exposure,authority},snapshot);checked++
}

const canonicalDir = resolve(root,'curricula/DE/Gymnasium/canonical')
const paths = readdirSync(canonicalDir).filter(p=>p.endsWith('.json')).map(p=>resolve(canonicalDir,p))
const catalog = paths.map(p=>read(p) as SkillLandscape)
const landscape = catalog.find(l=>l.landscapeId==='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
const byId = new Map(catalog.flatMap(l=>l.goals.map(g=>[g.id,g] as const)))
const applicability = buildApplicabilityCompilation(catalog.map((landscape,i)=>({file:paths[i],landscape})))
const profile = createRouteProfiles().find(p=>p.profileId==='canonical-math-sek1')!
const full = read(resolve(root,files[3])) as CompositionView
const stage = read(resolve(root,files[4])) as CompositionView
const exam = 'b1166cc7-dca0-5ac4-b0c4-9a7196186a2a'
const descendants = (id:string,target:string,seen=new Set<string>()):boolean => {
  if(id===target)return true;if(seen.has(id))return false;seen.add(id)
  return byId.get(id)?.contains.some(child=>descendants(child.split(':').at(-1)!,target,seen)) ?? false
}
const remove = (source:CompositionView,id:string) => {
  const candidate=structuredClone(source)
  const visit=(nodes:CompositionViewNode[]) => {
    for(let i=nodes.length-1;i>=0;i--){const n=nodes[i]
      if(n.kind==='structure')visit(n.children)
      else if('goalId' in n && descendants(n.goalId,id))nodes.splice(i,1)
    }
  };visit(candidate.rootNodes);return candidate
}
const records=[]
let seq=0
const invoke = (label:string,candidates:CompositionView[]) => {
  const viewFiles=candidates.map(v=>{const p=resolve(out,`${seq++}.view.json`);writeFileSync(p,JSON.stringify(v));return p})
  const result=evaluateRouteProfile(landscape,profile,applicability,catalog,viewFiles).rules.find(r=>r.id==='CQR-104')!
  records.push({label,result});return result
}
const baseline=invoke('Actual HB GK CrossStage and SekI source authority',[full,stage])
assert.equal(baseline.status,'pass',JSON.stringify(baseline))
for(const [label,views] of [
  ['HB complete view loses required exam',[remove(full,exam),stage]],
  ['HB stage authority loses required exam',[full,remove(stage,exam)]],
] as const){
  const result=invoke(label,[...views]);assert.equal(result.status,'fail',label)
  assert(result.details?.some(d=>d.includes('Missing terminal autonomy goal(s):')&&d.includes(exam)),label)
}
assert.deepEqual(pins(),beforePins,'review input freeze')
writeFileSync(resolve(out,'review.actual.json'),JSON.stringify({at:new Date().toISOString(),reviewer:'root independent of QA helper author he_ephase_source_review',sourcePins:beforePins,checkedSetCases:checked,records,pass:true},null,2)+'\n')
console.log('PASS',checked,'independent set cases and real HB baseline/two endpoint mutations')
