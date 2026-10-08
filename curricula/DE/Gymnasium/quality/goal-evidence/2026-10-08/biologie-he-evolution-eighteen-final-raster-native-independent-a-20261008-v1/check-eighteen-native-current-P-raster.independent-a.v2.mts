// SPDX-License-Identifier: Apache-2.0
// Actual unchanged closed-v2 P schema and native semantic API, full image filter.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,realpathSync,lstatSync} from 'node:fs'
import {dirname,resolve,relative,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(s=>JSON.parse(s))
assert.equal(hash(resolve(own,'eighteen-genuine-current-D-P-V.independent-a.first.freeze.json')),'a9e42e81610873f28387231def05e2424be310d2a20788b930d1dfde813a7e1b')
const entry=read(resolve(author,'neutral-eighteen-current-raster-native-author-review.entry.json'))
const cfg=read(resolve(author,'positive/P18.current-whole.actual-raster-author.inactive.config.json'))
assert.deepEqual(cfg.reviewedResourceTypes,['goal-visualization'])
assert.equal(cfg.reviewPath,entry.wholeP18CurrentRasterAIProfiles)
const rows=lines(resolve(root,cfg.reviewPath)),candidate=read(resolve(root,cfg.landscapePath))
const by=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const kinds=read(resolve(root,cfg.semanticKindLedgerPath))
const semanticBy=new Map<string,string>(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const images=read(resolve(author,'selected-eighteen-images.current-whole-exact.json')).images
const criteria='sha256:'+hash(resolve(root,cfg.reviewCriteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(rows.length,18);assert.equal(images.length,18);assert.equal(candidate.goals.length,476)
const checked=[]
for(const r of rows){
 const g=by.get(r.goalId);assert.ok(g)
 const image=images.find((i:any)=>i.goalId===r.goalId);assert.ok(image)
 const links=g.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
 assert.equal(links[0].url,`/assets/goal-visualizations/biologie/${g.id}/${g.id}.png`)
 const alias=resolve(author,links[0].url.replace(/^\//,'')),real=realpathSync(alias)
 const rel=relative(realpathSync(author),real)
 assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel),'Actual alias escapes declared public-root')
 assert.ok(lstatSync(alias).isFile()||lstatSync(alias).isSymbolicLink())
 assert.equal(hash(alias),image.sha256);assert.equal(hash(resolve(root,image.selectedPath)),image.sha256)
 const digests:Record<string,string>={[links[0].url]:'sha256:'+hash(alias)}
 assert.equal(r.reviewId,cfg.reviewId);assert.equal(r.reviewCriteriaFingerprint,criteria)
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
 assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
 assert.equal(semanticBy.get(r.goalId),'curricularAtomic')
 assert.ok(validate(r),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,g,digests,semanticBy.get(r.goalId)),[])
 checked.push({goalId:r.goalId,goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,
 reviewInputFingerprint:r.reviewInputFingerprint,actualPortablePNG:image.selectedPath,actualContainedAlias:relative(root,alias),
 actualRasterDigest:digests[links[0].url],schemaErrors:0,semanticErrors:0})
}
const future=read(resolve(author,'positive/P18.current-whole.actual-raster-author.future-active.config.json'))
assert.equal(future.landscapePath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert.equal(future.semanticKindLedgerPath,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
assert.deepEqual(future.reviewedResourceTypes,['goal-visualization'])
assert.equal(future.reviewPath,cfg.reviewPath);assert.equal(future.reviewCriteriaPath,cfg.reviewCriteriaPath)
const receipt={schemaVersion:1,recordedAt:new Date().toISOString(),role:'Own actual native closed P18 current raster semantics',
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 inputRecordPath:cfg.reviewPath,inputRecordSHA256:hash(resolve(root,cfg.reviewPath)),configuredGoals:18,
 needsHumanReview:18,approved:0,schemaErrors:0,semanticErrors:0,actualSelectedPNGBytesRead:true,
 actualContainedAliasesChecked:18,emptyResourceFilterUsed:false,futureActiveConfigCurrentPathsAndActualRasterRequired:true,
 ownFirstScienceSealPrecedesCheck:true,peerCurrentFinalBFilesRead:0,checked,
 ordinaryRasterPCLI:'pending_installation_after_paired_review_and_guarded_apply',
 why:'The unchanged standard CLI resolves installed app/public PNGs; scoped native API verifies exact uninstalled selected PNGs without weakening that CLI.',
 humanApproval:false,humanTrial:false,realLearnerEvidence:false,performedExperiments:0,activeWrites:0,strictGainClaimed:0}
writeFileSync(resolve(own,'P18.current-raster-native-closed-semantic.independent-a.v2.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('Actual closed P18 schema and unchanged native actual-PNG semantic API0;18needs_human_review/0approved;18contained aliases; ordinary raster CLI pending installation.')
