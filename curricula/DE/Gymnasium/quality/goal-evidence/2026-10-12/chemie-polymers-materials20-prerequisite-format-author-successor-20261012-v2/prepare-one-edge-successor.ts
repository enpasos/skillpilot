// Apache-2.0 technical helper. Writes this additive successor only.
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const repo=process.cwd(),out=dirname(fileURLToPath(import.meta.url))
const old='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-materials20-current402-current220-scientific-author-20261012-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const rel=(p:string)=>relative(repo,p).split('\\').join('/')
const write=(name:string,x:any)=>writeFileSync(resolve(out,name),JSON.stringify(x,null,2)+'\n')
async function main(){
const m=await import(pathToFileURL(resolve(repo,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const sm=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href)
const em=await import(pathToFileURL(resolve(repo,'app/scripts/goalEvidenceProfileModel.ts')).href)
const Ajv=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv/dist/2020.js')).href)).default
const formats=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv-formats/dist/index.js')).href)).default
const startedAt=new Date().toISOString()
const base=read(old+'/author/current20.base-goal-tuples.json'),cp=base.canonicalBinding.path
const beforeHash=hash(cp);if(beforeHash!==base.canonicalBinding.sha256)throw new Error('Current base drift')
const can=read(cp),by=new Map(can.goals.map((g:any)=>[g.id,g])),id='413c5ee5-7826-549f-ad76-63743c59b188',remove='0278a515-8990-5a1c-8a1b-a03382a144a3',add='9f0d6d4c-f918-5a44-a9a2-7732c4e338f3'
const goal:any=by.get(id),candidate=structuredClone(goal);candidate.requires=[add]
if(JSON.stringify(goal.requires)!==JSON.stringify([remove]))throw new Error('Unexpected original edge')
const parents=new Map<string,string[]>()
for(const g of can.goals)for(const ch of g.contains??[])parents.set(ch,[...(parents.get(ch)??[]),g.id])
const ancestorIds=(gid:string)=>{const seen=new Set<string>();const q=[...(parents.get(gid)??[])];while(q.length){const x=q.shift()!;if(seen.has(x))continue;seen.add(x);q.push(...(parents.get(x)??[]))}return [...seen]}
const effective=(gid:string)=>{const raw:any=gid===id?candidate:by.get(gid);return [...new Set([...(raw.requires??[]),...ancestorIds(gid).flatMap(x=>(by.get(x)as any).requires??[])])]}
const ancestors=ancestorIds(id).map(gid=>({id:gid,title:(by.get(gid)as any).title,requires:(by.get(gid)as any).requires??[]}))
const visiting=new Set<string>(),seen=new Set<string>(),closure:string[]=[]
function visit(x:string){if(visiting.has(x))throw new Error('Proposed effective prerequisite cycle at '+x);if(seen.has(x))return;visiting.add(x);for(const req of effective(x)){if(!by.has(req))throw new Error('Unknown prerequisite '+req);visit(req)}visiting.delete(x);seen.add(x);if(x!==id)closure.push(x)}
visit(id)
const atlasPath='app/public/lernzielbuch/de-gym-chemie-bundesweit.original-sources.json',atlas=read(atlasPath)
const foundation:any=by.get(add),regionalScopes=atlas.goals[add]??[]
const analysis={schemaVersion:1,goalId:id,authorScientificDecision:'replace one direct requires edge; no activation or independent vote',removedPrerequisite:{id:remove,title:(by.get(remove)as any).title},proposedPrerequisite:{id:add,title:foundation.title,description:foundation.description,requires:foundation.requires,applicability:foundation.applicability},oldDirectRequires:goal.requires,proposedDirectRequires:candidate.requires,containsAncestors:ancestors,inheritedRequiresAtTarget:ancestors.flatMap(a=>a.requires),proposedEffectivePrerequisiteClosure:closure.map(gid=>({id:gid,title:(by.get(gid)as any).title,directRequires:(by.get(gid)as any).requires??[],inheritedRequires:ancestorIds(gid).flatMap(a=>(by.get(a)as any).requires??[])})),sourceEvidence:'The literal current413 source receipt has only two broadNI Naturstoffe clauses: identifying functional groups and judging everyday significance. Neither states PLA is a corrosion prerequisite. The current goal asks metal/alloy protection, and both full cases concern electrochemical cells/barriers/passivation, not PLA synthesis, properties or degradation.',scienceReasonDe:'PLA-Synthese und PLA-Eigenschaften sind keine notwendige Grundlage für Korrosionsschutz an Metallen/Legierungen. Kontaktkorrosion liefert das benötigte Lokalelement-,Anoden-/Kathoden- und Elektronenflussmodell; seine bestehenden Voraussetzungen liefern Sauerstoff-/Säurekorrosion und Spannungsreihen. Dies ersetzt die fachfremde PLA-Sperre durch eine vorhandene fachliche Grundlage, ohne Schutzbewertung selbst als Voraussetzung zu verlangen.',alternativesConsidered:[{id:'642d5ea5-b62f-50c8-b0bd-cf132619725f',reason:'Overlaps protection/sacrificial-anode competence and has no currentNI atlas scope; less suitable as the sole common foundation.'},{id:'16da6a4d-8e9c-5f5d-b69d-338d67a2d362',reason:'Simple metal ordering alone does not cover paired local-cell electron flow and lacks currentNI atlas scope.'},{id:'94a62b39-d4a2-5882-99d1-6886ead07726',reason:'Already evaluates active/passive protection; avoid requiring nearly the same assessment competence.'}],foundationActualNIScopes:regionalScopes.filter((s:any)=>s.jurisdiction==='DE-NI'),phaseDecision:'TargetQ2 and foundationQ3 phase labels are source/view compatibility metadata; semantic dependency follows chemical foundation. No phase or composition change proposed.',changedFields:['requires'],allOther19SelectedGoalsUnchanged:true,containsChanges:0,cycleFound:false}
write('413.one-edge-scientific-source-context.author.json',analysis)
write('413.only-goal.requires-corrected.inactive.json',candidate)
const semPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',ledger=read(semPath),row=ledger.decisions.find((r:any)=>r.goalId===id)
const oldSem=m.fingerprintGoalForPositiveEvidence(goal,row.semanticKind),newSem=m.fingerprintGoalForPositiveEvidence(candidate,row.semanticKind)
const oldSource=sm.fingerprintSemanticKindSourceGoal(goal),newSource=sm.fingerprintSemanticKindSourceGoal(candidate)
if(oldSource!==row.sourceFingerprint)throw new Error('Current semantic classification stale')
write('413.semantic-kind.source-fingerprint.future-row.json',{schemaVersion:1,authorProposalOnly:true,inputLedgerBinding:{path:semPath,sha256:hash(semPath)},baseDecisionRow:row,proposedDecisionRow:{...row,sourceFingerprint:newSource},classificationChanged:false,changedOnly:['sourceFingerprint'],approval:'retained semanticKind is a candidate technical rebind; fresh native context review required'})
const lines=readFileSync(resolve(repo,old+'/author/whole20.normal-v2.author-candidates.jsonl'),'utf8').trimEnd().split('\n')
const prev=JSON.parse(lines.find(l=>JSON.parse(l).goalId===id)!),resources:Record<string,string>={}
for(const l of candidate.resourceLinks??[])if(l.type==='goal-visualization')resources[l.url]=hash('app/public'+l.url)
const input=m.fingerprintPositiveGoalEvidenceReviewInput(candidate,prev.reviewCriteriaFingerprint,resources,row.semanticKind)
const next={...prev,reviewInputFingerprint:input,reviewedAt:startedAt,reason:prev.reason+' Additive v2 replaces the unrelated PLA prerequisite by existing contact-corrosion foundation; whole profile/cases unchanged, fresh native/scientific review pending.'}
const ajv=new Ajv({allErrors:true,strict:false});formats(ajv);const validate=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));const errors=m.validatePositiveGoalEvidenceRecordSemantics(next,candidate,resources,row.semanticKind)
if(!validate(next))errors.push(ajv.errorsText(validate.errors))
if(oldSem!==newSem||prev.profileFingerprint!==m.fingerprintPositiveGoalEvidenceProfile(next.profile)||prev.reviewInputFingerprint===input)errors.push('Unexpected semantic/profile/input fingerprint impact')
const nextLines=lines.map(l=>JSON.parse(l).goalId===id?JSON.stringify(next):l)
writeFileSync(resolve(out,'whole20.normal-v2.author-candidates.one-edge-successor.jsonl'),nextLines.join('\n')+'\n')
const joins=read(old+'/author/whole20.exact-profile-case-input-joins.json')
const affected=joins.joins.find((j:any)=>j.goalId===id)
write('413.profile-case-input-join.successor.json',{...affected,reviewInputFingerprint:input,textOrGraphChanged:true,changedFields:['requires'],correctedGoalPath:rel(resolve(out,'413.only-goal.requires-corrected.inactive.json')),fullCasesUnchangedBinding:{path:old+'/author/whole40.expanded-cases.author.json',sha256:hash(old+'/author/whole40.expanded-cases.author.json')},oldReviewInputFingerprint:affected.reviewInputFingerprint,wholeSourceWitnessBinding:{path:old+'/author/current20.literal-source-witness-inventory.json',sha256:hash(old+'/author/current20.literal-source-witness-inventory.json')}})
const normalize=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const amFp=(g:any,ruleVersion:string)=>'sha256:'+createHash('sha256').update(em.stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})).digest('hex')
const mlines=readFileSync(resolve(repo,old+'/author/current20.memory.raw-exact-retained.jsonl'),'utf8'),mr=mlines.split('\n').filter(Boolean).map(l=>JSON.parse(l)).find(r=>r.goalId===id)
const afpOld=amFp(goal,'semantic-atomicity-v1'),afpNew=amFp(candidate,'semantic-atomicity-v1'),mfpOld=amFp(goal,mr.ruleVersion),mfpNew=amFp(candidate,mr.ruleVersion)
if(afpOld!==afpNew||mfpOld!==mfpNew||mfpNew!==mr.fingerprint)errors.push('Unexpected A/M fingerprint change')
write('413.atomicity-memory-binding-impact.author.json',{schemaVersion:1,goalId:id,authorOnly:true,normalAFieldsExcludeRequires:true,normalMFieldsExcludeRequires:true,atomicityFingerprintBefore:afpOld,atomicityFingerprintAfter:afpNew,atomicityCandidateReason:'Still one corrosion-protection evaluation competence. The corrected prerequisite supplies causal local-cell foundations; no body/scope split or newA vote.',memoryFingerprintBefore:mfpOld,memoryFingerprintAfter:mfpNew,rawCurrentMRowRetained:mr,all20RawMFileRetainedBinding:{path:old+'/author/current20.memory.raw-exact-retained.jsonl',sha256:hash(old+'/author/current20.memory.raw-exact-retained.jsonl')},other19RawMRowsExact:true,additionalMemoryCardsOrDecks:0,freshNativeContextReviewNeeded:true,newNativeVotes:0})
const afterHash=hash(cp);if(afterHash!==beforeHash)errors.push('Current canonical drift during check')
write('413.normal-helper-and-affected-context-check.actual.json',{schemaVersion:1,startedAt,completedAt:new Date().toISOString(),changedEdgeCount:1,sourceFingerprintBefore:oldSource,sourceFingerprintAfter:newSource,PgoalFingerprintBefore:oldSem,PgoalFingerprintAfter:newSem,PprofileFingerprint:next.profileFingerprint,PinputFingerprintBefore:prev.reviewInputFingerprint,PinputFingerprintAfter:input,normalV2SchemaAndExportedSemanticValidatorPassed:errors.length===0,other19PJsonlLinesRetainedExactly:nextLines.filter((l,i)=>l===lines[i]).length,other19GoalTuplesUnchanged:true,whole40CasesUnchanged:true,retainedRawM20Unchanged:true,effectivePrerequisiteCycleFound:false,canonicalBefore:beforeHash,canonicalAfter:afterHash,errors,passed:errors.length===0,independentReviews:0,activeOrGitWrites:0})
console.log(JSON.stringify({passed:errors.length===0,changedEdges:1,other19PExact:nextLines.filter((l,i)=>l===lines[i]).length,semanticSourceChanged:oldSource!==newSource,PgoalSame:oldSem===newSem,PinputChanged:prev.reviewInputFingerprint!==input,AandMunchanged:afpOld===afpNew&&mfpOld===mfpNew}))
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
}
main().catch(e=>{console.error(e);process.exitCode=1})
