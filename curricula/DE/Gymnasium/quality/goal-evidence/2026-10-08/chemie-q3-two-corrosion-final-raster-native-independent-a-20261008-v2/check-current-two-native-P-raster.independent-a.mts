// SPDX-License-Identifier: Apache-2.0
// Own actual closed-schema and native P binding check; scientific decisions were sealed first.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,realpathSync} from 'node:fs'
import {dirname,resolve,relative,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const tech=resolve(own,'../chemie-q3-whole-twenty-raster-native-remediation-technical-20261008-v2')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(s=>JSON.parse(s))
assert.equal(hash(resolve(own,'two-genuine-current-D-P-V.independent-a.first.freeze.json')),'73e6f74c19c96001e545adc7635f3f1f809b8ae88e87f22562bdb93c01191f71')
const ids=['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3','c95f6059-d7c2-5bcd-b61e-95e3577efdb2']
const config=read(resolve(tech,'positive/P2.actual-current-raster.inactive.config.json'))
assert.deepEqual(config.reviewedResourceTypes,['goal-visualization'])
assert.deepEqual(config.scope.goalIds,ids)
const records=lines(resolve(root,config.reviewPath));assert.equal(records.length,2)
assert.deepEqual(records.map(r=>r.goalId),ids)
const canonical=read(resolve(root,config.landscapePath));assert.equal(canonical.goals.length,480)
const kinds=read(resolve(root,config.semanticKindLedgerPath))
const first=read(resolve(own,'two-genuine-current-D-P-V.independent-a.first.verdicts.json'))
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const checked=[]
for(const [index,r] of records.entries()) {
 const goal=canonical.goals.find((g:any)=>g.id===r.goalId);assert.ok(goal)
 const kind=kinds.decisions.find((g:any)=>g.goalId===r.goalId)?.semanticKind;assert.equal(kind,'curricularAtomic')
 const verdict=first.records.find((g:any)=>g.goalId===r.goalId);assert.ok(verdict)
 assert.deepEqual(goal,verdict.wholeCurrentGoal);assert.deepEqual(r,verdict.wholePRecord)
 assert.equal(verdict.blockingFindings.length,0);assert.equal(verdict.D,'KEEP');assert.equal(verdict.V,'KEEP actual raster')
 const image=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(image.length,1)
 const expected=index===0?'a8b823f1c3d3406888bf7aea217339ca984e42c5c8e7cee8e1e8113f105c5c67':'c2b9f04acd7d2f3fe8bfa2cde3d152e16803c364ba6d420e0d9b386ca090f35b'
 assert.equal(image[0].url,`/assets/goal-visualizations/chemie/${r.goalId}/${r.goalId}.${index===0?'jpg':'png'}`)
 const alias=resolve(tech,image[0].url.replace(/^\//,'')),rel=relative(realpathSync(tech),realpathSync(alias))
 assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel));assert.equal(hash(alias),expected)
 const digests:Record<string,string>={[image[0].url]:'sha256:'+hash(alias)}
 assert.equal(r.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
 assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
 assert.ok(validate(r),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,digests,kind),[])
 checked.push({goalId:r.goalId,actualContainedAlias:relative(root,alias),actualRasterSHA256:expected,
  originalJPGKEEP:index===0,actualCorrectedPNG:index===1,closedSchemaErrors:0,nativeSemanticErrors:0,
  goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,
  profileBodyExactToOwnGenuineFirstReview:true,status:r.status,reviewAuthority:r.reviewAuthority})
}
const future=read(resolve(tech,'positive/P2.actual-current-raster.future-active.config.json'))
assert.equal(future.landscapePath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
assert.equal(future.semanticKindLedgerPath,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
assert.deepEqual(future.reviewedResourceTypes,['goal-visualization'])
writeFileSync(resolve(own,'P2.current-corrected-raster-native-api.independent-a.actual.json'),JSON.stringify({
 schemaVersion:1,recordedAt:new Date().toISOString(),role:'Own actual P2 closed v2 and native real JPG15/PNG16 bindings, after first whole scientific judgment',
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',configuredCheckedGoals:2,wholeCurrentCanonicalCount:480,
 actualCurricularAtomicCount:378,nationalActiveAtlas359:'unchanged separate view, no denominator substitution',
 closedSchemaErrors:0,nativeSemanticErrors:0,checked,needsHumanReview:2,approved:0,
 genuineWholeScienceFirstSeal:'two-genuine-current-D-P-V.independent-a.first.freeze.json',
 currentPeerFinalBFilesRead:0,ordinaryCorrectedRasterPCLI:'pending installation',
 other18ScienceOrSourceHoldsRetained:true,humanApproval:false,humanTrial:false,activeWrites:0,strictGainClaimed:0},null,2)+'\n',{flag:'wx'})
console.log('Own actual P2 closed schema/native semantics0; original JPG15 and corrected PNG16 exact,2needsHuman/0approved; ordinary corrected raster CLI pending installation.')
