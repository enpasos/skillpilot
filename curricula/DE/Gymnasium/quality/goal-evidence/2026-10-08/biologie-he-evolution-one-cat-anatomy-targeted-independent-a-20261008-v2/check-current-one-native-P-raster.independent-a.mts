// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,realpathSync} from 'node:fs'
import {dirname,resolve,relative,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const tech=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(s=>JSON.parse(s))
const gid='7008979d-7890-5f7b-ad07-27b8bb597cbe'
assert.equal(hash(resolve(own,'current-corrected-one-D-P-V.independent-a.first.freeze.json')),'e85dd2a1cd6fbdc06349192bc467ec265ad11b22aafb7a6bd874b11133a9fe1f')
const cfg=read(resolve(tech,'positive/P18.only-one-cat-current-raster.inactive.config.json'))
assert.deepEqual(cfg.reviewedResourceTypes,['goal-visualization'])
const all=lines(resolve(root,cfg.reviewPath));assert.equal(all.length,18)
const selected=all.filter(r=>r.goalId===gid);assert.equal(selected.length,1)
const candidate=read(resolve(root,cfg.landscapePath));assert.equal(candidate.goals.length,476)
const goal=candidate.goals.find((g:any)=>g.id===gid);assert.ok(goal)
const kinds=read(resolve(root,cfg.semanticKindLedgerPath))
const kind=kinds.decisions.find((r:any)=>r.goalId===gid)?.semanticKind;assert.equal(kind,'curricularAtomic')
const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
assert.equal(links[0].url,`/assets/goal-visualizations/biologie/${gid}/${gid}.png`)
const alias=resolve(tech,links[0].url.replace(/^\//,'')),aliasReal=realpathSync(alias),rel=relative(realpathSync(tech),aliasReal)
assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel))
const expected='cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758';assert.equal(hash(alias),expected)
const r=selected[0],digests:Record<string,string>={[links[0].url]:'sha256:'+hash(alias)}
assert.equal(r.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,cfg.reviewCriteriaPath)))
assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.ok(validate(r),ajv.errorsText(validate.errors))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,digests,kind),[])
writeFileSync(resolve(own,'P1.current-corrected-raster-native-api.independent-a.actual.json'),JSON.stringify({
 schemaVersion:1,recordedAt:new Date().toISOString(),role:'Own actual closed-v2/native semantics targeted corrected P1',
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',goalId:gid,configuredCheckedGoals:1,wholeInputRecordCount18:all.length,
 schemaErrors:0,semanticErrors:0,actualCorrectedPNGRead:true,actualContainedAlias:relative(root,alias),actualPNGSHA256:expected,
 goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,
 needsHumanReview:1,approved:0,ordinaryPublicRasterCLI:'pending_installation',
 currentPeerTargetedBFilesRead:0,other17NewScienceChecksOrRuns:0,humanApproval:false,activeWrites:0,strictGainClaimed:0},null,2)+'\n',{flag:'wx'})
console.log('Own corrected current P1 closed schema/native actual-PNG semantics0;1needs_human_review/0approved; contained actual alias; public raster CLI pending installation.')
