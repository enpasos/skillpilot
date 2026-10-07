// Apache-2.0. Scoped verification of the applied, independently reviewed inputs.
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const root=process.cwd(), base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-b007-bw-reviewed-metadata-active-application-v6'
const author=base+'chemie-b007-bw-reviewed-metadata-native-binding-preparation-author-v6'
const load=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const model=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const atlas=await import(pathToFileURL(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const originals=await import(pathToFileURL(resolve(root,'app/scripts/goalBookOriginalSources.ts')).href)
const stable=(a:any,b:any)=>assert.equal(model.stableGoalBookJson(a),model.stableGoalBookJson(b))
const canon=load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const kinds=load('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const goals=new Map(canon.goals.map((g:any)=>[g.id,g]))
assert.equal(goals.size,479)
for(const row of kinds.decisions) assert.equal(row.sourceFingerprint,model.fingerprintSemanticKindSourceGoal(goals.get(row.goalId)))
assert.equal(kinds.decisions.length,479)
const config='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const checked=atlas.checkGoalBookSourceAtlasInputs(config,root)
stable(checked.receipt,load(author+'/future-metadata-only/native-artifacts/source-atlas.receipt.json'))
const full=await model.loadGoalBookBuildInputs('curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json',root)
assert.equal(full.model.pages.length,378)
stable(full.model,load(author+'/future-metadata-only/native-artifacts/current378.full.book-model.json'))
const national=await model.loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',root)
assert.equal(national.model.pages.length,359)
stable(national.model,load(author+'/future-metadata-only/native-artifacts/national359.book-model.json'))
const sourceIndex=originals.buildGoalBookOriginalSources(national.model,root,atlas.readGoalBookSourceAtlasInputConfig(config,root).mappingPaths)
stable(sourceIndex,load(author+'/future-metadata-only/native-artifacts/national359.original-sources.json'))
const receipt={schemaVersion:1,documentType:'actual active scoped native check after reviewed BW metadata application',checkedAtUTC:new Date().toISOString(),semanticKindBindings:479,allClassificationStatusBasisUnchanged:true,nativeSourceAtlas:'PASS',counts:checked.receipt.counts,activeComplete378ModelExactlyReviewed:true,activeNational359ModelExactlyReviewed:true,activeOriginalSourcesExactlyReviewed:true,changedAttributions:186,changedProtectedAttributions:68,newScientificClosures:0,restoredStrictClosures:0,strictNetGain:0,newCentralOrM7Claim:false,humanApproval:false,humanTrial:false,activeCanonicalSha256:digest('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')}
writeFileSync(resolve(root,own,'active-native-scoped-verification.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt))
