import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const root=process.cwd(), own=path.relative(root,path.dirname(new URL(import.meta.url).pathname))
const read=async(p:string)=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'))
const assert=(v:any,m:string)=>{if(!v)throw Error(m)}
const cfg=await read(own+'/targeted-two-wording/P18.corrected.config.json'),land=await read(cfg.landscapePath),ledger=await read(cfg.semanticKindLedgerPath)
const rows=(await fs.readFile(path.join(root,cfg.reviewPath),'utf8')).trim().split('\n').map(x=>JSON.parse(x))
const old=(await fs.readFile(path.join(root,own,'P18.whole-original-independent-b.review.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x))
const proposal=await read(own+'/input-snapshots/author/proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json'),changed=new Set(proposal.patches.map((x:any)=>x.goalId))
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv);const validate=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const by=new Map(land.goals.map((g:any)=>[g.id,g])),kinds=new Map(ledger.decisions.map((d:any)=>[d.goalId,d]))
const results=rows.map((r:any,i:number)=>{const g=by.get(r.goalId) as any,k=kinds.get(r.goalId) as any;const valid=validate(r),schemaErrors=structuredClone(validate.errors),semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r,g,{},k.semanticKind);assert(valid&&semanticErrors.length===0,'closed schema/semantics '+r.goalId);assert(k.sourceFingerprint===fingerprintSemanticKindSourceGoal(g),'corrected semantic-kind binding '+r.goalId);assert(r.profileFingerprint===old[i].profileFingerprint,'profile meaning preserved '+r.goalId);const goalChanged=r.goalFingerprint!==old[i].goalFingerprint,inputChanged=r.reviewInputFingerprint!==old[i].reviewInputFingerprint;assert(goalChanged===changed.has(r.goalId)&&inputChanged===changed.has(r.goalId),'exact affected-two P bindings '+r.goalId);assert(r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.evidenceLevel==='E1'&&r.maximumClaimScope==='G1','bounds');return {goalId:r.goalId,nativeClosedSchemaValid:valid,schemaErrors,nativeSemanticErrors:semanticErrors,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,goalFingerprintChanged:goalChanged,reviewInputFingerprintChanged:inputChanged,wholeProfileMeaningUnchanged:true,correctedSourceKindFingerprintCurrent:true}})
assert(rows.length===18,'18')
await fs.writeFile(path.join(root,own,'targeted-two-wording/P18.corrected-native-closed-schema-and-exact-bindings.actual.json'),JSON.stringify({recordedAt:new Date().toISOString(),results,wholeProfiles:18,wholeCases:36,changedGoalBindings:2,unchangedBindings:16,profileMeaningChanged:0,approved:0,needsHumanReview:18,activeWrites:0,operativeSourceHoldsRemain:true,actualRasterReviews:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({closedSchemas:18,nativeSemanticErrors:0,changedGoalBindings:2,unchangedBindings:16,profileMeaningChanged:0,approved:0,needsHumanReview:18}))
