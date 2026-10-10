// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

async function main() {
  const root = process.cwd()
  const own = path.relative(root, path.dirname(process.argv[1]))
  const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'
  const baseline = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-two-targeted-metadata-raster-native-technical-successor-20261010-v2'
  const historic = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1'
  const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const ref = (p: string) => {const b=fs.readFileSync(p);return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
  const cfgPath = author + '/sources/after394-atlas.targeted-source.normal.config.json'
  const api = await import(pathToFileURL(path.resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href)
  const models = await import(pathToFileURL(path.resolve('app/scripts/goalBookModel.ts')).href)
  const cfg = read(cfgPath)
  const built = api.buildGoalBookSourceAtlasInputs(cfg, root)
  const capsule = path.resolve('tmp/m7-resumption-20261010/bio12-targeted-source-author-capsule')
  // Existing author capsule is read only. No new files or aliases outside own namespace.
  const checked = api.checkGoalBookSourceAtlasInputs(cfgPath, capsule)
  assert.deepEqual(built.receipt, checked.receipt)
  assert.deepEqual(built.receipt.counts,{canonicalCurricularAtomicGoals:394,publishedCurricularAtomicGoals:394,sourceViews:24,unresolvedSourceScopeDecisions:0,omittedGoals:0})
  for (const [logical, bytes] of Object.entries(built.outputs)) assert.equal(fs.readFileSync(author+'/sources/normal-output/'+path.basename(logical),'utf8'),bytes)
  const before = api.expandGoalBookSourceAtlasReceipt(read(historic+'/sources/after-raw-normal-output/source-projection.final-summary.receipt.json'))
  const protectedIds = new Set(read(historic+'/inputs/current353-protected.ids.json').current353)
  const deltas = read(author+'/sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
  const normalizedPath = (p:string) => deltas.wholeChangedMappingPairs.find((r:any)=>r.afterMapping.path===p)?.beforeMapping.path ?? p
  const key = (w:any) => JSON.stringify([normalizedPath(w.mappingPath),w.sourceGoalId,w.mappedTargetGoalId,w.goalId,w.coverage,w.profileBasis,w.fallbackViewPath ?? null])
  const scopes = before.scopes.map((b:any)=>{
    const a=built.receipt.scopes.find((r:any)=>r.viewId===b.viewId);assert(a);assert.deepEqual(a.goalIds,b.goalIds)
    const old=b.witnesses.map(key).sort(), now=a.witnesses.map(key).sort()
    const removed=old.filter((x:string)=>!now.includes(x)),added=now.filter((x:string)=>!old.includes(x));assert.equal(added.length,0)
    for(const x of removed){const fields=JSON.parse(x);assert(deltas.removedUnsupportedDirectPairs.some((r:any)=>r.sourceGoalId===fields[1]&&r.canonicalGoalId===fields[3]))}
    assert.deepEqual(b.witnesses.filter((w:any)=>protectedIds.has(w.goalId)).map(key).sort(),a.witnesses.filter((w:any)=>protectedIds.has(w.goalId)).map(key).sort())
    return {viewId:b.viewId,goalIdsExact:true,protected353WitnessSemanticsExact:true,removed,added}
  })
  const loaded=await models.loadGoalBookBuildInputs(author+'/native/current394-source-corrected.normal.config.json',capsule)
  const sealed=read(author+'/native/current394-source-corrected.actual-normal-model.json')
  assert.deepEqual(loaded.model,sealed)
  const previous=read(baseline+'/native/current394-two-targeted.actual-normal-model.json')
  assert.deepEqual(loaded.model.pages,previous.pages)
  assert.equal(loaded.model.pages.length,394)
  const proof={schemaVersion:1,reviewer:'genuine-independent-a-fresh-targeted',normalSourceApi:'build/checkGoalBookSourceAtlasInputs',normalBookModelApi:'loadGoalBookBuildInputs',wholeNormalSourceCounts:built.receipt.counts,allNormalSourceOutputsByteExact:true,scopes,wholeCurrentModel:ref(author+'/native/current394-source-corrected.actual-normal-model.json'),modelRebuiltExact:true,whole394PagesExact:true,protected353PagesExact:true,existingReadOnlyCapsuleReceiptPathPolicy:'Transient capsule path is command execution detail only; bound inputs and proof paths remain repository relative regular committable files.',newNativeSightApproval:false,newScienceApproval:false,humanApproved:0,strictGain:0,activeWrites:[]}
  const output=own+'/checks/normal-source-build-check-and-whole-model-independent-a.actual.json';assert(!fs.existsSync(output));fs.writeFileSync(output,JSON.stringify(proof,null,2)+'\n');assert.deepEqual(read(output),proof)
  console.log(JSON.stringify({normalSourceBuildCheckExit0:true,sourceViews:24,whole394ModelExact:true,whole394PagesExact:true,protected353WitnessSemanticsExact:true,humanApproved:0,strictGain:0}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
