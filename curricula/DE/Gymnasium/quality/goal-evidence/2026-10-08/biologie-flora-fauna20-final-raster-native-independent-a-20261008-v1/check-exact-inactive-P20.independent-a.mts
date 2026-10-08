// SPDX-License-Identifier: Apache-2.0
// Exact native API checks for uninstalled reviewed candidates; no live file write.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const source=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1')
const entry=read(resolve(source,'neutral-final-flora-fauna20-raster-native-review.entry.json'))
const rows=readFileSync(resolve(root,entry.wholeCurrentP20.path),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const images=read(resolve(root,entry.imageManifest.path)).images
const candidate=read(resolve(root,entry.futureInertCanonical.path)),by=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const config=read(resolve(own,'P20.exact-final-inert.native.config.json'))
const kinds=read(resolve(root,config.semanticKindLedgerPath)),semanticBy=new Map<string,string>(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const criteria='sha256:'+hash(resolve(root,config.reviewCriteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(rows.length,20);assert.equal(images.length,20)
assert.equal(hash(resolve(root,entry.wholeCurrentP20.path)),entry.wholeCurrentP20.sha256)
const checked=[]
for(const row of rows){
 const goal=by.get(row.goalId);assert.ok(goal)
 const selected=images.find((i:any)=>i.goalId===row.goalId);assert.ok(selected)
 assert.equal(hash(resolve(root,selected.path)),selected.sha256)
 const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
 const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(resolve(root,selected.path))}
 assert.equal(row.reviewCriteriaFingerprint,criteria)
 assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate')
 assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
 assert.equal(semanticBy.get(row.goalId),'curricularAtomic')
 assert.ok(validate(row),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,semanticBy.get(row.goalId)),[])
 checked.push({goalId:row.goalId,exactSelectedRasterPath:selected.path,exactActualImageDigest:actualDigests[links[0].url],goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,schemaErrors:0,semanticErrors:0})
}
const receipt={schemaVersion:1,artifactKind:'independent-A-exact-inactive-native-P20-api-check',recordedAt:new Date().toISOString(),
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:entry.wholeCurrentP20.path,checked,configuredGoals:20,needsHumanReview:20,approved:0,schemaErrors:0,semanticErrors:0,
 actualRasterBytesReadFromSelectedCandidateFiles:true,actualPublicCLIStillPendingIntegration:true,
 why:'The ordinary CLI resolves active app/public image paths. These candidates are intentionally not installed yet. This native API check binds actual selected PNG bytes without changing or weakening the CLI.',
 sciencePassBasis:relative(root,resolve(own,'actual-current-D-P-context-source-retention.independent-a.receipt.json')),
 noHashOnlyScienceClaim:true,activeWrites:0,strictGainClaimed:0,humanApproval:false}
writeFileSync(resolve(own,'P20.exact-inactive-native-api.independent-a.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('Exact inactive native P20 API check passed:20 current candidate profiles;0 schema/semantic errors;20 needs_human_review,0 approved. Public CLI awaits integration.')
