import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const repositoryRoot=process.cwd()
const sourceRoot=resolve(process.argv[2])
const root=resolve(repositoryRoot,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1')
const author=resolve(repositoryRoot,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const rel=(p:string)=>relative(repositoryRoot,p)
const write=(p:string,d:any)=>writeFileSync(p,JSON.stringify(d,null,2)+'\n')
const model=await import(pathToFileURL(resolve(sourceRoot,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const first=load(resolve(root,'science/FIRST.informed-P11-and-A11.original.json'))
const selector=load(resolve(author,'INPUTS.final-native20-v3.physical-selector.json'))
const canonicalPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json'
const semanticPath=selector.semantic560Exact.path
const canonical=load(resolve(repositoryRoot,canonicalPath))
const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const original=readFileSync(resolve(author,'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const prior=new Map(original.map((x:any)=>[x.goalId,x]))
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const promptPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'
const criteria=sha(readFileSync(resolve(repositoryRoot,criteriaPath)))
const group='chemie-energy-eleven-kept-informed-pa-20261015-v1'
const runId=group+'-P11-final-current'
const closure=load(resolve(root,'science/FINAL.ebfa-context-and-current-prerequisites.informed-closure.json'))
const normalStartedAt=new Date().toISOString()
const boundInputPath=resolve(root,'inputs/P11.whole-current-goals-prerequisites-profiles-cases.json')
const currentPrerequisiteIds=[...new Set(first.scopeGoalIds.flatMap((id:string)=>(goals.get(id) as any).requires??[]))]
const boundInput={schemaVersion:1,role:'Complete informed current P11 material input; no independent D/V claim',createdAt:normalStartedAt,canonical:{path:canonicalPath,digest:sha(readFileSync(resolve(repositoryRoot,canonicalPath)))},priorActuallyViewedNativeBook:{path:rel(resolve(author,'native-twenty/bundle/book-model.json')),digest:sha(readFileSync(resolve(author,'native-twenty/bundle/book-model.json'))),scope:'Original final22page native v3 book; its ebfa alt context is superseded only by the whole current goal and dated context closure supplied here. No new20book was built.'},currentWholeGoals:first.scopeGoalIds.map((id:string)=>goals.get(id)),wholeDirectPrerequisites:currentPrerequisiteIds.map(id=>goals.get(id)),wholeProposedProfiles:first.judgments.map((j:any)=>({goalId:j.goalId,profile:j.P.profile})),wholeCases22:load(resolve(root,'materials/eleven-whole-cases22.targeted-informed-successor.json')),scientificFirst:{path:rel(resolve(root,'science/FIRST.informed-P11-and-A11.original.json')),digest:sha(readFileSync(resolve(root,'science/FIRST.informed-P11-and-A11.original.json')))},currentEbfaClosure:closure,sourceBoundary:'Supplied national151cells contain56 unique text bodies outside rawText; neither the partial mappings nor author paraphrases prove whole primary/course approval. Actual supplied official full passages and partner duties were read in the preserved own D source closure. P here is single-goal E1/G1 assessment design, with source/course and0773Source-/Image-Hold retained.',noLearnerOrLabTrial:true,noNewDOrMOrVOrHumanApproval:true}
write(boundInputPath,boundInput)
const inputEvidence=[] as any[]
const records=first.judgments.map((j:any)=>{
 const g:any=goals.get(j.goalId);const resourceDigests:any={}
 for(const link of g.resourceLinks??[]){if(link.type==='goal-visualization'){resourceDigests[link.url]=sha(readFileSync(resolve(sourceRoot,'app/public',link.url.slice(1))))}}
 const goalFingerprint=model.fingerprintGoalForPositiveEvidence(g,'curricularAtomic')
 const reviewInputFingerprint=model.fingerprintPositiveGoalEvidenceReviewInput(g,criteria,resourceDigests,'curricularAtomic')
 const old:any=prior.get(j.goalId)
 if(goalFingerprint!==old.goalFingerprint||(!j.goalId.startsWith('ebfa2c18')&&reviewInputFingerprint!==old.reviewInputFingerprint))throw new Error('Final native/authored input mismatch for '+j.goalId+': '+goalFingerprint+' / '+reviewInputFingerprint+' expected '+old.goalFingerprint+' / '+old.reviewInputFingerprint)
 inputEvidence.push({goalId:j.goalId,goalFingerprint,reviewInputFingerprint,originalNativeE0InputBindingPreserved:reviewInputFingerprint===old.reviewInputFingerprint,currentWholeAltOnlySuccessor:j.goalId.startsWith('ebfa2c18'),resourceDigests,profileBodyChanged:j.P.profileBodyChanged,semanticKind:'curricularAtomic'})
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:group+'-p',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:j.goalId,goalFingerprint,reviewInputFingerprint,profileFingerprint:model.fingerprintPositiveGoalEvidenceProfile(j.P.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:j.goalId.startsWith('ebfa2c18')?closure.observedAndWrittenAt:first.completedAt,reviewer:'Codex reviewer C; informed P/A successor after own D20; no new blind D vote',reason:j.goalId.startsWith('ebfa2c18')?closure.scientificClosure.finalEbfaReason:j.P.reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],dissent:['Informed single-goal AI assessment design; no learner/lab trial, human acceptance, D blind vote or M/V/source/course approval.','Current image bytes and supplied page contexts are input-bound; image recognition is not performance and this P record grants no V vote.','National partial source mappings, optional selections and separately assigned practical source-partner duties remain open.'],profile:j.P.profile}
 if(j.goalId.startsWith('0773a104'))record.dissent.push('0773 has no visualization and no established universal source duty for optimisation; Source-/Image-Hold remains open.')
 const errs=model.validatePositiveGoalEvidenceRecordSemantics(record,g,resourceDigests,'curricularAtomic');if(errs.length)throw new Error(errs.join('\n'))
 return record
})
const recordPath=resolve(root,'normal/P11.final-current.image-bound.candidates.jsonl')
writeFileSync(recordPath,records.map((x:any)=>JSON.stringify(x)).join('\n')+'\n')
write(resolve(root,'checks/P11.final-current-resource-and-input-bindings.json'),{checkedAt:new Date().toISOString(),sourceRoot:rel(sourceRoot),canonicalPath,semanticPath,reviewedResourceTypes:['goal-visualization'],entries:inputEvidence})
const book=load(resolve(author,'native-twenty/bundle/book-model.json'))
const parameters={mode:'Informed author-reviewer C, own prior D findings known; no separate blind P quorum',model:'GPT-6 Codex',exactRevision:'not exposed',samplingParameters:'not exposed',sourceRoot:rel(sourceRoot),originalScientificFirstSha256:sha(readFileSync(resolve(root,'science/FIRST.informed-P11-and-A11.original.json'))),currentContextClosureSha256:sha(readFileSync(resolve(root,'science/FINAL.ebfa-context-and-current-prerequisites.informed-closure.json'))),timestampMeaning:'Run timestamps cover final normal materialization after scientific FIRST and current-context reading; no invented scientific reading duration',nativeBookContext:'Actual viewed v3 book retained, ebfa whole current ALT supplement bound in review_input_json; no new book or V vote'}
const par=resolve(root,'normal/P11.generation-disclosure.json');write(par,parameters)
const run={$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:sha(readFileSync(boundInputPath)),bookDigest:book.digest,provider:'OpenAI',model:'GPT-6 Codex (exact revision and decoding settings not exposed)',role:'synthesizer',promptFamilyId:'positive-understanding-evidence-profile-authoring-v2',promptFingerprint:sha(readFileSync(resolve(repositoryRoot,promptPath))),criteriaFingerprint:criteria,generationParametersFingerprint:sha(readFileSync(par)),independenceGroupId:group+'-informed-not-blind',blindToOtherRuns:false,goalIds:records.map((x:any)=>x.goalId),inputArtifacts:[{role:'book_model',digest:sha(readFileSync(resolve(author,'native-twenty/bundle/book-model.json')))},{role:'book_pdf',digest:sha(readFileSync(resolve(author,'native-twenty/bundle/book.pdf')))},{role:'review_input_json',digest:sha(readFileSync(boundInputPath))},{role:'review_markdown',digest:sha(readFileSync(resolve(root,'science/P11.informed-review-context.md')))},{role:'review_prompt',digest:sha(readFileSync(resolve(repositoryRoot,promptPath)))},{role:'review_criteria',digest:criteria}],startedAt:normalStartedAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:sha(readFileSync(recordPath)),toolchainVersion:'positive-understanding-evidence-v2'}
// The run schema uses bookDigest as the bound model digest; it is the artifact byte digest.
run.bookDigest=sha(readFileSync(resolve(author,'native-twenty/bundle/book-model.json')))
const runPath=resolve(root,'normal/P11.final-informed.run.json');write(runPath,run)
write(resolve(root,'normal/P11.final-current.image-bound.config.json'),{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:group+'-p',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:canonicalPath,semanticKindLedgerPath:semanticPath,reviewCriteriaPath:criteriaPath,reviewPath:rel(recordPath),reviewRunManifestPaths:[rel(runPath)],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Informed11 kept Energy goals; actual final current whole goal/image context, E1/G1 ai_candidate only',goalIds:records.map((x:any)=>x.goalId)}})
console.log('Materialized final informed P11; exact native inputs preserved for10 goals, current ebfa ALT successor bound to actual unchanged JPG bytes.')
