// SPDX-License-Identifier: Apache-2.0
// Native closed P4 schema/semantics against actual selected uninstalled PNGs.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(s=>JSON.parse(s))
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-split-four-final-raster-native-author-technical-20261008-v1')
assert.ok(read(resolve(own,'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json')))
const entry=read(resolve(author,'neutral-current-four-raster-native-author-review.entry.json'))
const op=entry.operativeArtifacts
const configPath=resolve(author,'candidate/P4.actual-raster-author.inactive-v2.config.json')
const config=read(configPath)
assert.equal(config.landscapePath,op.currentWholeCanonical)
assert.equal(config.semanticKindLedgerPath,op.genuineScientificClassifications)
assert.equal(config.reviewPath,op.nativeP4ActualRasterBindings)
assert.deepEqual(config.reviewedResourceTypes,['goal-visualization'])
const rows=lines(resolve(root,config.reviewPath)), images=read(resolve(root,op.actualPNGs)).images
const candidate=read(resolve(root,config.landscapePath))
const by=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const kinds=read(resolve(root,config.semanticKindLedgerPath))
const semanticBy=new Map<string,string>(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const criteria='sha256:'+hash(resolve(root,config.reviewCriteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:true}); addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(rows.length,4); assert.equal(images.length,4)
const checked=[]
for(const row of rows){
 const goal=by.get(row.goalId); assert.ok(goal)
 const selected=images.find((i:any)=>i.goalId===row.goalId); assert.ok(selected)
 assert.equal(hash(resolve(root,selected.path)),selected.sha256)
 assert.equal(hash(resolve(root,selected.selectedPath)),selected.sha256)
 const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization'); assert.equal(links.length,1)
 assert.equal(links[0].skillpilotId,goal.id)
 const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(resolve(root,selected.selectedPath))}
 assert.equal(row.reviewId,config.reviewId)
 assert.equal(row.reviewCriteriaFingerprint,criteria)
 assert.equal(row.status,'needs_human_review'); assert.equal(row.reviewAuthority,'ai_candidate')
 assert.equal(row.evidenceLevel,'E1'); assert.equal(row.maximumClaimScope,'G1')
 assert.equal(semanticBy.get(row.goalId),'curricularAtomic')
 assert.ok(validate(row),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,semanticBy.get(row.goalId)),[])
 checked.push({goalId:row.goalId,exactWholeCurrentGoal:goal,exactSelectedRasterPath:selected.selectedPath,
 exactActualImageDigest:actualDigests[links[0].url],goalFingerprint:row.goalFingerprint,
 profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,schemaErrors:0,semanticErrors:0})
}
const future=read(resolve(root,op.nativeP2FutureActiveAuthorConfigActualCurrentCanonicalKindsAndRasterRequired))
assert.equal(future.landscapePath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert.equal(future.semanticKindLedgerPath,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
assert.deepEqual(future.reviewedResourceTypes,['goal-visualization'])
const guards=read(resolve(author,'exact-current-input-snapshots-and-four-author-guards.technical.json'))
const oldAKey=Object.keys(guards.snapshotMap).find(k=>k.endsWith('canonical-biology-full.config.json')&&k.includes('semantic-atomicity'))!
const oldMKey=Object.keys(guards.snapshotMap).find(k=>k.endsWith('canonical-biology-full.config.json')&&k.includes('memory-card-review'))!
assert.ok(oldAKey); assert.ok(oldMKey)
const retained=[]
for(const [kind,originalKey,newConfigPath] of [['A',oldAKey,op.genuineCurrentA392Config],['M',oldMKey,op.genuineCurrentM392Config]]){
 const oldCfg=read(resolve(root,guards.snapshotMap[originalKey]))
 const newCfg=read(resolve(root,newConfigPath))
 const beforePath=guards.snapshotMap[oldCfg.reviewPath]; assert.ok(beforePath)
 const before=lines(resolve(root,beforePath)), after=lines(resolve(root,newCfg.reviewPath))
 const afterBy=new Map<string,any>(after.map(r=>[r.goalId,r]))
 const unchanged=before.filter(r=>r.goalId!=='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8')
 assert.equal(unchanged.length,390)
 for(const row of unchanged) assert.deepEqual(afterBy.get(row.goalId),row)
 for(const gid of entry.newChildGoalIds){
   const row=afterBy.get(gid); assert.ok(row)
   assert.equal(row.status,kind==='A'?'atomic':'no_memory_needed')
 }
 assert.equal(after.length,392)
 retained.push({kind,oldOperativeRecordPath:oldCfg.reviewPath,currentNativeConfigPath:newConfigPath,
 retainedRowsExact:390,genuineReviewedChildRows:2,unchangedRetainedRowsScientificallyRereviewed:0})
}
const receipt={schemaVersion:1,recordedAt:new Date().toISOString(),artifactKind:'Genuine independent A actual native P4/current-PNG and retained A-M bindings check',
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:config.reviewPath,exactPositiveInputDigest:hash(resolve(root,config.reviewPath)),checked,
 configuredGoals:4,needsHumanReview:4,approved:0,schemaErrors:0,semanticErrors:0,actualSelectedRasterBytesRead:true,
 actualFutureActiveConfigHasCurrentLandscapeAndKindPathsAndRequiredRaster:true,retainedAM:retained,
 scopedScienceBasis:'actual-whole-four-D-P-V-first.independent-a.verdict.json',
 ordinaryPublicCLIStillPendingIntegration:true,why:'Standard CLI resolves installed app/public assets. Two new PNGs remain uninstalled; native semantic API checks the actual selected bytes without changing or weakening the CLI.',
 peerCurrentFinalBFilesRead:0,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false}
writeFileSync(resolve(own,'P4.actual-native-current-raster-and-retained-AM.independent-a.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('Actual native P4 closed schema/current raster semantics0;4needs_human_review/0approved; genuine392A/M retain390rows exact. Public CLI awaits integration.')
