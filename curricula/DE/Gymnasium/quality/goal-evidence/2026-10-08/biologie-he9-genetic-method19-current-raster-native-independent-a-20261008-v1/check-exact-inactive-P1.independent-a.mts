// SPDX-License-Identifier: Apache-2.0
// Actual native schema/semantic API check; selected raster candidates uninstalled.
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
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-genetic-method19-current-raster-native-author-root-v3')
const entry=read(resolve(author,'neutral-one-current-raster-native-independent-review.entry.json'))
const rows=readFileSync(resolve(author,entry.actualPositiveProfile),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const images=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-nineteen-image-author-root-20261008-v1/selected-eighteen-author-images.exact.json')).images.filter((i:any)=>i.goalId===entry.goalId)
const candidate=read(resolve(author,'candidate/canonical.current474-one-new-raster-author.json'))
const by=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const kinds=read(resolve(author,'candidate/semantic-kinds.current474-one-raster-inert.json'))
const semanticBy=new Map<string,string>(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const config=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-current391-science-author-root-v1/P19.current-text-preimage.author.config.json'))
const criteria='sha256:'+hash(resolve(root,config.reviewCriteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:true}); addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(rows.length,1); assert.equal(images.length,1)
assert.equal(rows[0].goalId,entry.goalId)
const checked=[]
for(const row of rows){
 const goal=by.get(row.goalId); assert.ok(goal)
 const selected=images.find((i:any)=>i.goalId===row.goalId); assert.ok(selected)
 assert.equal(hash(resolve(root,selected.path)),selected.sha256)
 const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization'); assert.equal(links.length,1)
 const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(resolve(root,selected.path))}
 assert.equal(row.reviewCriteriaFingerprint,criteria)
 assert.equal(row.status,'needs_human_review'); assert.equal(row.reviewAuthority,'ai_candidate')
 assert.equal(row.evidenceLevel,'E1'); assert.equal(row.maximumClaimScope,'G1')
 assert.equal(semanticBy.get(row.goalId),'curricularAtomic')
 assert.ok(validate(row),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,semanticBy.get(row.goalId)),[])
 checked.push({goalId:row.goalId,exactSelectedRasterPath:selected.path,exactActualImageDigest:actualDigests[links[0].url],goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,schemaErrors:0,semanticErrors:0})
}
const receipt={schemaVersion:1,artifactKind:'independent A actual exact inactive native P1 API check',recordedAt:new Date().toISOString(),
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:resolve(author,entry.actualPositiveProfile).slice(root.length+1),exactPositiveInputDigest:hash(resolve(author,entry.actualPositiveProfile)),checked,
 configuredGoals:1,needsHumanReview:1,approved:0,schemaErrors:0,semanticErrors:0,actualSelectedRasterBytesRead:true,
 ordinaryPublicCLIStillPendingIntegration:true,why:'The ordinary CLI resolves installed app/public image resources. These candidates remain uninstalled; native API checks actual selected PNG bytes without changing or weakening that CLI.',
 sciencePassBasis:'current-one-whole-source-cases-class-AM-D-P-V.independent-a.first.json',noHashOnlyScienceClaim:true,
 peerFinalBReadBeforeSeal:false,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false}
writeFileSync(resolve(own,'P1.exact-inactive-native-api.independent-a.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('Native inactive P1 closed-schema and current-raster semantic API passed:1needs_human_review/0approved/0errors. Public CLI awaits integration.')
