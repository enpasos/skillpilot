// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),base=resolve(own,'..')
const native=resolve(base,'biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const bind=(p:string)=>({path:relative(root,p),sha256:sha(p),bytes:readFileSync(p).length})
const put=(p:string,v:any)=>writeFileSync(p,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const entry=read(resolve(native,'neutral-sixteen-native-independent-review.entry.json'))
const canonical=read(resolve(root,entry.candidateCanonicalPath)),gid='cb218858-a468-5d3f-83e0-b60f83368af7'
const g=canonical.goals.find((g:any)=>g.id===gid)
const original=readFileSync(resolve(root,entry.positiveRecordPath),'utf8').trim().split('\n').map(s=>JSON.parse(s)).find(r=>r.goalId===gid)
const body=read(resolve(own,'corrected-one-positive-profile.body.author-candidate.json'))
assert.deepEqual(body.expectations,original.profile.expectations)
assert.deepEqual(body.coverageExpectations,original.profile.coverageExpectations)
const row={...original,reviewId:'biologie-upper-citation-one-targeted-whole-material-correction-root-v2',profile:body,profileFingerprint:fingerprintPositiveGoalEvidenceProfile(body),reviewedAt:new Date().toISOString(),reviewer:'Codex material correction author; independent targeted P followups pending',reason:'Actual corrected exact original source sentence and whole bilingual second quotation/paraphrase/ratio performance. Unchanged whole goal/image/native source frame; genuine independent P followups required. No actual learner performance or human approval.'}
const raster=entry.rasterBindings.find((r:any)=>r.goalId===gid)
const asset=resolve(root,raster.actualOriginalImage.path)
assert.equal(sha(asset),raster.actualOriginalImage.sha256)
const resources={[raster.resourceLinkCandidate.url]:sha(asset)}
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const check=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.ok(check(row),ajv.errorsText(check.errors))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,g,resources,'curricularAtomic'),[])
for(const k of ['goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint'])assert.equal(row[k],original[k])
assert.notEqual(row.profileFingerprint,original.profileFingerprint)
const recordPath=resolve(own,'P1.actual-corrected-whole-material.author-candidate.review.jsonl')
put(recordPath,JSON.stringify(row)+'\n')
const config={...read(resolve(root,entry.positiveConfigPath)),reviewId:row.reviewId,reviewPath:relative(root,recordPath),scope:{label:'One actual corrected whole citation material/profile; independent P followups pending',goalIds:[gid]}}
put(resolve(own,'P1.actual-corrected-whole-material.author-candidate.config.json'),config)
put(resolve(own,'neutral-one-corrected-whole-material-targeted-P-review.entry.json'),{schemaVersion:1,role:'Neutral actual targeted corrected material and unchanged native goal/frame inputs; no author/peer verdict',goalId:gid,correctedWholeTwoCases:bind(resolve(own,'corrected-one-whole-goal-two-bilingual-cases.author-candidate.json')),actualCorrectedOriginalHTML:bind(resolve(own,'media/citation-original-model-cards.corrected-v2.html')),correctedWholeProfileBody:bind(resolve(own,'corrected-one-positive-profile.body.author-candidate.json')),correctedProfileCandidateRecord:bind(recordPath),positiveConfig:bind(resolve(own,'P1.actual-corrected-whole-material.author-candidate.config.json')),unchangedNativeInput:bind(resolve(root,entry.campaigns[0].inputPath)),unchangedFullNativeEntry:bind(resolve(native,'neutral-sixteen-native-independent-review.entry.json')),unchangedRaster:raster.actualOriginalImage,unchangedWholeGoal:g,sourceScopeReviewRestart:false,unchangedNativeDandVReReviewRequired:false,independentTargetedPReviewsPending:2,activeWrites:0,strictNetGain:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({normalRecordSchema:'PASS',normalWholeProfileSemantic:'PASS',genuineProfileContentChanged:true,goalImagePageInputExact:true,activeWrites:0,independentApproval:false}))
