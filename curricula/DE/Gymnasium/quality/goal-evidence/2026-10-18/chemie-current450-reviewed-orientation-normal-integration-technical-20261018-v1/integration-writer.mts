import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const out = base+'chemie-current450-reviewed-orientation-normal-integration-technical-20261018-v1'
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semantic = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registry = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const proposal = base+'chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json'
const language = base+'chemie-current450-orientation-anchor-language-author-20261018-v2/AUTHOR.whole-orientation-before-and-candidate.pending.json'
const reviewA = base+'chemie-current450-orientation-entry-independent-a-20261018-v1/REVIEW.independent-a.27-deltas-and-anchor-v2.json'
const reviewB = base+'chemie-current450-orientation-entry-informed-independent-b-20261018-v1/FIRST.independent-B.json'
const original = 'app/scripts/generateCurriculumQualityStatus.ts'
const probe = 'app/scripts/.__chemie450_reviewed_orientation_route_probe.ts'
const json = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const sha = (b:any) => createHash('sha256').update(b).digest('hex')
const pin = (p:string) => { const b=readFileSync(p); return {path:p,sha256:sha(b),bytes:b.length} }
const assert = (v:any,m:string) => { if(!v) throw Error(m) }
assert(!existsSync(out),'Never overwrite a completed integration')
const raw=readFileSync(canonical,'utf8'), semRaw=readFileSync(semantic,'utf8')
const before=JSON.parse(raw), sem=JSON.parse(semRaw), author=json(proposal), anchor=json(language)
const a=json(reviewA), b=json(reviewB)
assert(pin(canonical).sha256==='4788d9034bc977b7f93681720a61efdba573a1550268e27973a507d72e26d575','Current450 graph drift')
assert(author.records.length===27&&a.perGoalDecisions.length===27,'Wrong finite27scope')
assert(a.perGoalDecisions.every((r:any)=>r.verdict==='accept_requires_only_delta_with_exact_reviewed_nonassessing_anchor_v2'),'Missing actual A acceptance')
assert(b.entryProposalVerdict==='KEEP_ALL_27_EXACT_REQUIRES_APPENDS'&&b.englishAnchorDescriptionVerdict==='KEEP_EXACT_DESCRIPTION_EN_CORRECTION','Missing actual B acceptance')
assert(b.requiredNewContentFindings.length===0&&b.otherCurrentIndependentVerdictReadBeforeFirst===false,'Unresolved B or missing independence')
assert(isDeepStrictEqual(a.acceptedComposition.requiresCandidate,pin(proposal))&&isDeepStrictEqual(a.acceptedComposition.requiredAnchorLanguageCandidate,pin(language)),'A accepted different bytes')
const inputs=[canonical,semantic,registry,proposal,language,reviewA,reviewB].map(pin)
const protectedPaths=json(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath])
const protectedBefore=protectedPaths.map(pin)
const after=structuredClone(before), byId=new Map(after.goals.map((g:any)=>[g.id,g]))
const changedIds=author.records.map((r:any)=>r.goalId)
for(const r of author.records){
 assert(isDeepStrictEqual(byId.get(r.goalId),r.beforeWholeGoal),'Whole before goal changed: '+r.goalId)
 const withoutRequires=structuredClone(r.proposedWholeGoal);withoutRequires.requires=r.beforeWholeGoal.requires
 assert(isDeepStrictEqual(withoutRequires,r.beforeWholeGoal),'Nonrequires delta: '+r.goalId)
 assert(isDeepStrictEqual(r.proposedWholeGoal.requires,[...r.beforeWholeGoal.requires,anchor.goalId]),'Unexpected prerequisite replacement')
 byId.set(r.goalId,r.proposedWholeGoal)
}
assert(isDeepStrictEqual(byId.get(anchor.goalId),anchor.before),'Anchor drift')
const oldLanguage=structuredClone(anchor.candidate);oldLanguage.descriptionEn=anchor.before.descriptionEn
assert(isDeepStrictEqual(oldLanguage,anchor.before),'Nonlanguage anchor change')
byId.set(anchor.goalId,anchor.candidate);changedIds.push(anchor.goalId)
after.goals=after.goals.map((g:any)=>byId.get(g.id))
// Preserve every unaffected raw goal block and all graph metadata.
const marker='\n  "goals": [\n',start=raw.indexOf(marker)+marker.length,end=raw.lastIndexOf('\n  ]')
assert(start>=marker.length&&end>start,'Unexpected canonical layout')
const body=raw.slice(start,end), starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!)
assert(starts.length===before.goals.length,'Unexpected goal block layout')
let patched=''
for(let i=0;i<starts.length;i++){
 const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''))
 assert(g.id===before.goals[i].id,'Unexpected goal order')
 patched+=changedIds.includes(g.id)?'    '+JSON.stringify(byId.get(g.id),null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part
}
const afterRaw=raw.slice(0,start)+patched+raw.slice(end)
assert(isDeepStrictEqual(JSON.parse(afterRaw),after),'Patch differs from reviewed candidate')
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
let afterSem=semRaw;const semanticBindings=[]
for(const id of changedIds){
 const row=sem.decisions.find((r:any)=>r.goalId===id);assert(row,'Missing existing kind decision')
 const current=fingerprintSemanticKindSourceGoal(byId.get(id));semanticBindings.push({goalId:id,before:row.sourceFingerprint,after:current,semanticKindUnchanged:row.semanticKind})
 if(row.sourceFingerprint===current)continue
 assert(afterSem.split(JSON.stringify(row.sourceFingerprint)).length===2,'Ambiguous kind-source fingerprint')
 afterSem=afterSem.replace(JSON.stringify(row.sourceFingerprint),JSON.stringify(current))
}
const originalPin=pin(original);let beforeRoute:any,candidateRoute:any,actualRoute:any
try{
 writeFileSync(probe,readFileSync(original,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'})
 const module:any=await import(pathToFileURL(resolve(probe)).href)
 const profile=module.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2')
 beforeRoute=module.evaluateRouteProfile(before,profile,{reports:[]});candidateRoute=module.evaluateRouteProfile(after,profile,{reports:[]})
 const oldRule=beforeRoute.rules.find((r:any)=>r.id==='CQR-101'),newRule=candidateRoute.rules.find((r:any)=>r.id==='CQR-101')
 assert(oldRule.metrics.missingMotivationPath===77&&newRule.metrics.missingMotivationPath===0,'Motivation repair not verified')
 assert(oldRule.metrics.missingTerminalPath===103&&newRule.metrics.missingTerminalPath===103,'Unexpected terminal change')
 assert(isDeepStrictEqual(pin(canonical),inputs[0])&&isDeepStrictEqual(pin(semantic),inputs[1]),'Normal drift before write')
 mkdirSync(out);writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',raw,{flag:'wx'});writeFileSync(out+'/BEFORE.semantic-kind.exact.json.snapshot',semRaw,{flag:'wx'})
 writeFileSync(canonical,afterRaw);writeFileSync(semantic,afterSem)
 actualRoute=module.evaluateRouteProfile(json(canonical),profile,{reports:[]})
 assert(isDeepStrictEqual(actualRoute,candidateRoute),'Actual normal route differs from reviewed memory candidate')
}finally{unlinkSync(probe)}
assert(isDeepStrictEqual(pin(original),originalPin),'Original evaluator changed')
assert(isDeepStrictEqual(protectedPaths.map(pin),protectedBefore),'Protected nonchemistry inputs changed')
assert(isDeepStrictEqual(pin(registry),inputs[2]),'Central registry altered')
writeFileSync(out+'/integration-writer.mts',readFileSync('tmp/integrate_chemie450_reviewed_orientation.mts'),{flag:'wx'})
writeFileSync(out+'/RECEIPT.actual-reviewed-orientation-normal-integration.json',JSON.stringify({
 role:'REVIEWED_REQUIRES_AND_BILINGUAL_ANCHOR_INTEGRATION_NOT_NEW_SCIENTIFIC_FIRST_APPROVAL',
 inputs,changedOrdinaryRequires:27,changedAnchorEnglishFields:1,semanticBindings,
 beforeRoute,actualRoute,actualEvaluator:originalPin,protectedInputs:protectedBefore,
 outputs:[pin(canonical),pin(semantic)],registryUnchanged:true,oldScientificPrerequisitesExact:true,
 progress:{motivationPathsRecovered:77,missingMotivation:0,missingTerminal:103,newScientificFirstCompletions:0,newNativeDOrPBindings:0},
 limits:{fullCentralReportRerun:false,compiledApplicabilityAndViewGatesNotClaimed:true,finalNativePageAndProfileBindingsPending:true,M7Claim:false,CIPassForNewStand:false,humanApproval:false,actualLearnerPerformance:false},
},null,2)+'\n',{flag:'wx'})
const files=['BEFORE.canonical.exact.json.snapshot','BEFORE.semantic-kind.exact.json.snapshot','integration-writer.mts','RECEIPT.actual-reviewed-orientation-normal-integration.json'].map(n=>pin(out+'/'+n))
writeFileSync(out+'/SEAL.reviewed-orientation-normal-integration.json',JSON.stringify({role:'TECHNICAL_INTEGRATION_NOT_REVIEW_VOTE',files,outputs:[pin(canonical),pin(semantic)],historicalReviewsUnmodified:true},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({output:out,motivation77to0:true,missingTerminal:103,newScientificFirstCompletions:0,finalNativeBindings:'pending',protectedInputsUnchanged:true}))
