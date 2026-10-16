import { readFileSync,writeFileSync,mkdirSync,copyFileSync,symlinkSync,existsSync } from 'node:fs'
import { resolve,dirname,relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fingerprintPositiveGoalEvidenceProfile } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root=dirname(fileURLToPath(import.meta.url))
const repo=resolve(root,'../../../../../../..')
const prep=resolve(root,'../chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2')
const canonical=resolve(root,'../chemie-pourbaix-one-missing-image-author-root-20261015-v1/candidate/canonical560.current422.one-pourbaix-image.author.json')
const semantic=resolve(root,'../chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json')
const hash=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
if(hash(readFileSync(canonical))!=='sha256:52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3')throw Error('canonical mismatch')
if(hash(readFileSync(semantic))!=='sha256:597c71f9a9444e7bf8ffd266c3c4de6f826c34a87f438f36a2ce3f358eba76ee')throw Error('semantic input mismatch')
for(const lane of ['P','A']){
 const seal=JSON.parse(readFileSync(resolve(root,`${lane}-FIRST.seal.json`),'utf8'))
 if(hash(readFileSync(resolve(root,`${lane}-FIRST.independent-science.md`)))!==`sha256:${seal.sha256}`)throw Error(`${lane} FIRST seal`)
}
const raw=readFileSync(resolve(prep,'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const cases=JSON.parse(readFileSync(resolve(prep,'blind-inputs/thirty-two-whole-DE-EN-cases.raw-author.json'),'utf8'))
if(cases.cases.length!==32)throw Error('cases')
const pfirst=readFileSync(resolve(root,'P-FIRST.independent-science.md'),'utf8')
const afirst=readFileSync(resolve(root,'A-FIRST.independent-science.md'),'utf8')
const pparas=pfirst.split(/\n\d+\. \*\*/).slice(1).map(s=>s.split('\n\n')[0])
const aparas=afirst.split(/\n\d+\. \*\*/).slice(1).map(s=>s.split('\n\n')[0])
if(pparas.length!==16||aparas.length!==16)throw Error('FIRST cardinality')
const now=new Date().toISOString()
const pId='chemie-equilibrium16-final-native-independent-a-p-20261015-v1'
const pRun='chemie-equilibrium16-final-native-independent-a-p-run-20261015-v1'
const pRecords=raw.map((s,i)=>{
 // Only whitelisted bindings and the exact scientific profile body are selected.
 // Original author reason, dissent, reviewer, status and evidence fields are never consulted.
 const unresolved=[3,8,10].includes(i)
 const reason=(pparas[i].split('**. ')[1]??pparas[i]).trim()
 return {
  $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:pId,
  goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint:s.reviewCriteriaFingerprint,landscapeId:s.landscapeId,goalId:s.goalId,
  goalFingerprint:s.goalFingerprint,reviewInputFingerprint:s.reviewInputFingerprint,
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(s.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',
  reviewedAt:now,reviewer:'Independent reviewer A, separate P role, Codex GPT-6 (runtime snapshot not exposed)',
  reason:reason.slice(0,1950),evidenceLevel:unresolved?'E0':'E1',maximumClaimScope:unresolved?'G0':'G1',
  reviewRunIds:[pRun],dissent:unresolved?[reason.slice(0,1950)]:[],profile:s.profile,
 }
})
writeFileSync(resolve(root,'P.records.jsonl'),pRecords.map(x=>JSON.stringify(x)).join('\n')+'\n')
const aId='chemie-equilibrium16-final-native-independent-a-a-20261015-v1'
const aRecords=raw.map((s,i)=>({schemaVersion:1,reviewId:aId,ruleVersion:'semantic-atomicity-v1',landscapeId:s.landscapeId,
 goalId:s.goalId,fingerprint:'sha256:'+ '0'.repeat(64),status:'atomic',semanticAtomic:true,reviewedAt:now,
 reviewer:'Independent reviewer A, separate semantic A role, AI candidate',reason:(aparas[i].split('**. ')[1]??aparas[i])+' AI candidate only; no human approval.'}))
writeFileSync(resolve(root,'A.records.jsonl'),aRecords.map(x=>JSON.stringify(x)).join('\n')+'\n')
const rel=(p:string)=>relative(repo,p)
writeFileSync(resolve(root,'A.config.json'),JSON.stringify({schemaVersion:1,reviewId:aId,ruleVersion:'semantic-atomicity-v1',
 landscapeId:raw[0].landscapeId,landscapePath:rel(canonical),reviewPath:rel(resolve(root,'A.records.jsonl')),
 scope:{label:'Sixteen final native-v2 chemistry competences, independent A semantic review',leafGoalIds:raw.map(s=>s.goalId)}},null,2)+'\n')

// Exact unmodified stock host: only the asset destinations are transported locally.
// Active app/public, runtime, canonical files and original technical prep are untouched.
const host=resolve(root,'stock-host')
mkdirSync(resolve(host,'app/scripts'),{recursive:true});mkdirSync(resolve(host,'inputs'),{recursive:true})
writeFileSync(resolve(host,'package.json'),JSON.stringify({type:'module'})+'\n')
const copied=[]
for(const name of ['positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']){
 const src=resolve(repo,'app/scripts',name),dst=resolve(host,'app/scripts',name)
 copyFileSync(src,dst);if(hash(readFileSync(src))!==hash(readFileSync(dst)))throw Error('stock copy mismatch')
 copied.push({source:rel(src),copy:rel(dst),sha256:hash(readFileSync(src))})
}
const link=(source:string,destination:string)=>{mkdirSync(dirname(destination),{recursive:true});if(!existsSync(destination))symlinkSync(source,destination)}
link(resolve(repo,'contracts'),resolve(host,'contracts'));link(resolve(repo,'app/node_modules'),resolve(host,'app/node_modules'))
link(canonical,resolve(host,'inputs/canonical.json'));link(semantic,resolve(host,'inputs/semantic.json'))
link(resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'),resolve(host,'inputs/criteria.md'))
link(resolve(root,'P.records.jsonl'),resolve(host,'inputs/P.records.jsonl'))
const img=JSON.parse(readFileSync(resolve(prep,'blind-inputs/sixteen-current-exact-physical-image-bodies.json'),'utf8'))
for(const im of img.images){
 const src=resolve(repo,im.physicalRepositorySource.path)
 if(hash(readFileSync(src))!==im.physicalRepositorySource.sha256)throw Error('physical source mismatch')
 link(src,resolve(host,im.normalPublicDestination))
}
const nativeManifest=JSON.parse(readFileSync(resolve(prep,'native-sixteen/bundle/manifest.json'),'utf8'))
const bookPdf=resolve(prep,'native-sixteen/bundle/book.pdf')
const prompt=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md')
const criteria=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const pseal=JSON.parse(readFileSync(resolve(root,'P-FIRST.seal.json'),'utf8'))
const gen={role:'separate independent P first review',FIRST:pseal.sha256,profileBodies:'adopted verbatim only after independent scientific review',generationParameters:'not exposed',sourceNativeBundleFingerprint:nativeManifest.bundleFingerprint}
writeFileSync(resolve(root,'P-generation-parameters.json'),JSON.stringify(gen,null,2)+'\n')
const run={
 $schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId:pRun,
 bundleFingerprint:nativeManifest.bundleFingerprint,bookDigest:nativeManifest.bookModelDigest,provider:'OpenAI Codex',model:'GPT-6 (exact runtime snapshot not exposed)',
 role:'assessment_adversarial_reviewer',promptFamilyId:'positive-understanding-evidence-profile-authoring-v2',promptFingerprint:hash(readFileSync(prompt)),criteriaFingerprint:hash(readFileSync(criteria)),
 generationParametersFingerprint:hash(readFileSync(resolve(root,'P-generation-parameters.json'))),independenceGroupId:pId,blindToOtherRuns:true,
 goalIds:raw.map(s=>s.goalId),inputArtifacts:[{role:'book_pdf',digest:hash(readFileSync(bookPdf))},{role:'review_prompt',digest:hash(readFileSync(prompt))},{role:'review_criteria',digest:hash(readFileSync(criteria))}],
 startedAt:pseal.sealedAtUTC,completedAt:new Date().toISOString(),status:'completed',outputDigest:hash(readFileSync(resolve(root,'P.records.jsonl'))),toolchainVersion:'skillpilot-stock-positive-goal-evidence-v2',
}
writeFileSync(resolve(root,'P.run.json'),JSON.stringify(run,null,2)+'\n');link(resolve(root,'P.run.json'),resolve(host,'inputs/P.run.json'))
writeFileSync(resolve(host,'inputs/P.config.json'),JSON.stringify({
 $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:pId,
 goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:raw[0].landscapeId,
 landscapePath:'inputs/canonical.json',semanticKindLedgerPath:'inputs/semantic.json',reviewCriteriaPath:'inputs/criteria.md',reviewPath:'inputs/P.records.jsonl',reviewRunManifestPaths:['inputs/P.run.json'],
 reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Final native16 exact current scientific profiles and physical images; independent machine candidates only',goalIds:raw.map(s=>s.goalId)},
},null,2)+'\n')
writeFileSync(resolve(root,'BINDING.stock-host-and-source-manifest.json'),JSON.stringify({unmodifiedStockScripts:copied,canonical:{path:rel(canonical),sha256:hash(readFileSync(canonical))},semantic:{path:rel(semantic),sha256:hash(readFileSync(semantic))},physicalImages:img.images,scope:'No canonical/runtime/registry/ledger/other reviewer files changed; local stock host only.'},null,2)+'\n')
console.log(JSON.stringify({P:pRecords.length,E1G1:pRecords.filter(x=>x.evidenceLevel==='E1').length,E0G0:pRecords.filter(x=>x.evidenceLevel==='E0').length,A:aRecords.length,host:rel(host)}))
