// SPDX-License-Identifier: Apache-2.0
// Targeted technical binding check, no new scientific or image approval.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,realpathSync} from 'node:fs'
import {dirname,resolve,relative,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {fingerprintGoalForPositiveEvidence,positiveGoalEvidenceReviewInputPayload,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const pack=resolve(own,'../biologie-he-evolution-eighteen-reviewed-integration-preparation-root-20261008-v1')
const original=resolve(own,'../biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1')
const corrected=resolve(own,'../biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const lines=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(s=>JSON.parse(s))
const entryPath=resolve(pack,'neutral-required-link-metadata-and-P18.technical.entry.json')
assert.equal(hash(entryPath),'0eb3b7272464a8718a5235dcbd76c5efa7121fb0b948ae43fc6cf84aed949526')
const freezePath=resolve(pack,'required-link-metadata-P18.technical-first.freeze.json')
assert.equal(hash(freezePath),'68de6451f5b2957dc365a55e618e70c5b2df81015c4422e17add1931afc5540c')
for(const b of read(freezePath).files){assert.equal(hash(resolve(root,b.path)),b.sha256);assert.equal(readFileSync(resolve(root,b.path)).length,b.bytes)}
const entry=read(entryPath),before=read(resolve(root,entry.originalCanonical.path)),after=read(resolve(root,entry.candidateCanonical.path))
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const selected=new Set<string>(entry.actualRequiredLinkMetadataDeltas.map((r:any)=>r.goalId))
assert.equal(before.goals.length,476);assert.equal(after.goals.length,476);assert.equal(selected.size,18)
const oldP=new Map<string,any>(lines(resolve(root,entry.oldCurrentRasterP18.path)).map(r=>[r.goalId,r]))
const newP=lines(resolve(root,entry.currentP18.path));assert.equal(newP.length,18)
const newBy=new Map<string,any>(newP.map(r=>[r.goalId,r]))
const images=read(resolve(original,'selected-eighteen-images.current-whole-exact.json')).images
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const valid=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
function diffs(a:any,b:any,p=''):any[]{
 if(JSON.stringify(a)===JSON.stringify(b))return []
 if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diffs(a[k],b[k],p+'/'+k))
 return [{pointer:p,before:a,after:b}]
}
let otherExact=0;const checked=[]
for(const g of after.goals){
 const prior=beforeBy.get(g.id);assert.ok(prior)
 if(!selected.has(g.id)){assert.deepEqual(g,prior);otherExact++;continue}
 const stripped=structuredClone(g);const link=stripped.resourceLinks[0]
 assert.equal(stripped.resourceLinks.length,1)
 const expected={skillpilotId:g.id,provider:'ChatGPT/Codex builtin image_gen',lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot'}
 for(const [key,value] of Object.entries(expected)){assert.equal(link[key],value);delete link[key]}
 assert.deepEqual(stripped,prior)
 assert.equal(fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),fingerprintGoalForPositiveEvidence(prior,'curricularAtomic'))
 assert.deepEqual(buildGoalDescriptionCanonicalContext(g),buildGoalDescriptionCanonicalContext(prior))
 const im=images.find((i:any)=>i.goalId===g.id);assert.ok(im)
 const provenancePath=g.id==='7008979d-7890-5f7b-ad07-27b8bb597cbe'
 ?resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he-evolution-one-cat-anatomy-correction-author-root-20261008-v2/7008979d-7890-5f7b-ad07-27b8bb597cbe/candidate-v2.provenance.json')
 :resolve(root,im.provenancePath)
 const provenance=read(provenancePath)
 assert.ok((provenance.generator??provenance.provider).includes('ChatGPT/Codex'))
 assert.equal(provenance.license??provenance.contentLicense,'CC-BY-4.0')
 const actualAlias=resolve(corrected,g.resourceLinks[0].url.replace(/^\//,''))
 const rel=relative(realpathSync(corrected),realpathSync(actualAlias));assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel))
 const expectedDigest=g.id==='7008979d-7890-5f7b-ad07-27b8bb597cbe'?'cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758':im.sha256
 assert.equal(hash(actualAlias),expectedDigest)
 const resources:Record<string,string>={[g.resourceLinks[0].url]:'sha256:'+hash(actualAlias)}
 const a=oldP.get(g.id),b=newBy.get(g.id);assert.ok(a&&b)
 for(const key of ['goalFingerprint','profileFingerprint','profile','status','reviewAuthority','evidenceLevel','maximumClaimScope','reviewCriteriaFingerprint','dissent'])assert.deepEqual(b[key],a[key])
 assert.equal(b.status,'needs_human_review');assert.equal(b.reviewAuthority,'ai_candidate');assert.equal(b.evidenceLevel,'E1');assert.equal(b.maximumClaimScope,'G1')
 const differences=diffs(positiveGoalEvidenceReviewInputPayload(prior,b.reviewCriteriaFingerprint,resources,'curricularAtomic'),positiveGoalEvidenceReviewInputPayload(g,b.reviewCriteriaFingerprint,resources,'curricularAtomic'))
 assert.equal(differences.length,1);assert.ok(differences[0].pointer.endsWith('/reviewStatus'))
 assert.equal(differences[0].before,null);assert.equal(differences[0].after,'pilot')
 assert.ok(valid(b),ajv.errorsText(valid.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(b,g,resources,'curricularAtomic'),[])
 checked.push({goalId:g.id,exactOnlyAddedLinkFields:Object.keys(expected),generatorProvenancePath:relative(root,provenancePath),
 actualRasterSHA256:expectedDigest,goalMeaningAndDCanonicalContextExact:true,profileBodyAndFingerprintExact:true,
 actualPInputPayloadOnlyDelta:differences,newReviewInputFingerprint:b.reviewInputFingerprint,closedSchemaErrors:0,nativeSemanticErrors:0})
}
assert.equal(otherExact,458);assert.equal(checked.length,18)
const future=read(resolve(pack,'positive/P18.current-raster-guide-metadata.future-active.config.json'))
assert.equal(future.landscapePath,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
assert.equal(future.semanticKindLedgerPath,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
assert.deepEqual(future.reviewedResourceTypes,['goal-visualization']);assert.equal(future.reviewPath,entry.currentP18.path)
writeFileSync(resolve(own,'required-link-metadata-P18.independent-a.actual-confirmation.json'),JSON.stringify({schemaVersion:1,recordedAt:new Date().toISOString(),
 role:'Actual independent targeted technical confirmation of required link metadata/P18 bindings; zero new science reviews',
 verdict:'PASS targeted technical metadata and actual P binding only',exactMetadataFirstInputSeal:relative(root,freezePath),
 other458WholeGoalsExact:true,all18SemanticGoalsDCanonicalContextsExact:true,all18GenuineWholePProfilesAnd36CasesRetained:true,
 actual18PNGBytesRead:true,required18GuideLinksChecked:true,P18ClosedSchemaErrors:0,P18NativeSemanticErrors:0,
 needsHumanReview:18,approved:0,newScientificReviews:0,newVisualReviewsByThisCheck:0,checked,
 currentOneGenuineReview:'current-corrected-one-D-P-V.independent-a.first.freeze.json',currentPeerTargetedBFilesRead:0,
 normativeReviewStatusPilotMeaning:'Public pilot resource status; neither human approval nor classroom trial. Actual machine D/P/V reviews remain distinct.',
 ordinaryPublicRasterCLI:'pending installation',activeWrites:0,strictGainClaimed:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('Own targeted metadata/P18 technical confirmation0: only five guide fields per link, P payload only reviewStatus null->pilot, whole science/profiles/PNGs exact;18needsHuman/0approved.')
