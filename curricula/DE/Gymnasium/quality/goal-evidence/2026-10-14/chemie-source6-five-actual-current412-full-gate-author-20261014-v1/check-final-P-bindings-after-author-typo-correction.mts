// Apache-2.0. Final unreviewed-author typo correction and truthful current bindings.
import{createHash}from'node:crypto';import{readFileSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';import{resolve,relative}from'node:path';import{createRequire}from'node:module'
import{fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import{reviewPositiveGoalEvidenceConfig}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const R='/home/enpasos/projects/skillpilot',O=resolve(fileURLToPath(new URL('.',import.meta.url))),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const require=createRequire(R+'/app/package.json'),Ajv=require('ajv/dist/2020').default,ajv=new Ajv({allErrors:true,strict:true});require('ajv-formats')(ajv)
const validate=ajv.compile(read(R+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const current=read(O+'/candidate/canonical539.prospective-current412-on-actual280.author-only.json'),by=new Map(current.goals.map((g:any)=>[g.id,g]))
const path=O+'/P/five-current-whole-goal-author-E0-G0.profiles.jsonl',records=readFileSync(path,'utf8').trim().split('\n').map(s=>JSON.parse(s))
const digest='sha256:'+createHash('sha256').update(readFileSync(O+'/P/criteria.whole-five-author-E0-G0.md')).digest('hex')
for(const r of records){r.reviewCriteriaFingerprint=digest;r.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(r.profile);r.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(by.get(r.goalId)as any,digest,{},'curricularAtomic');if(!validate(r))throw new Error(JSON.stringify(validate.errors));const es=validatePositiveGoalEvidenceRecordSemantics(r,by.get(r.goalId)as any,{},'curricularAtomic');if(es.length)throw new Error(es.join('\n'))}
writeFileSync(path,records.map(r=>JSON.stringify(r)).join('\n')+'\n')
const normal=reviewPositiveGoalEvidenceConfig(relative(R,O+'/config/P5.author-E0-G0.NONOPERATIVE-pending-five-classifications.config.json'))
const errors=(normal as any).errors??[]
const missing=errors.filter((e:string)=>e.includes('no authoritative semantic-kind decision'))
const dependent=errors.filter((e:string)=>e.includes('stale goalFingerprint')||e.includes('stale reviewInputFingerprint'))
if(errors.length!==15||missing.length!==5||dependent.length!==10)throw new Error(JSON.stringify(errors))
writeFileSync(O+'/checks/FINAL.STOCK.P5-current-full-case-fingerprints-schemas-and-five-classification-HOLDs.actual.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),unreviewedAuthorTypoCorrection:'Dichteeignung -> Dichtungseignung only; stable five goals unchanged',lowLevelSchemasAndCurrentStockModelFingerprintSemanticsPass:5,normalStockConfigurationResult:normal,actualMissingAuthoritativeClassifications:5,actualDependentKindlessGoalAndInputFingerprintFailures:10,whyDependentFailures:'The normal configuration uses only the unchanged authoritative407 ledger, which has no entry for the new5. Its fallback computes kindless fingerprints. Candidate fingerprints intentionally bind the explicit prospective curricularAtomic classification and pass all unchanged low-level stock checks with that proposed kind. No authority is manufactured to suppress these15 actual configuration errors.',profileEvidenceLevel:'E0',maximumClaimScope:'G0',newScienceVotes:0,newGateClosures:0},null,2)+'\n')
console.log(JSON.stringify({currentP5SchemasAndProspectiveKindBindings:5,normalClassificationHolds:5,dependentKindlessFingerprintFailures:10,goalTextDeltas:0,newGateClosures:0}))
