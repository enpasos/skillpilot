import fs from 'node:fs'
import crypto from 'node:crypto'
import {getSrsFilterTags} from '/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts'
import {collectCompositionProjectionRoleGoalIds} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
const B='/mnt/e/skillpilot-chemie-L7-20261017/'
const O=B+'nano-aromatics-and-methods-retained-target-scope-author-v1/'
const C=B+'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json'
const V=B+'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.whole39views.paired48-plus20-foundations.private.json'
const P=B+'current650-post20-P439-SEM-paired-context-final-technical-b-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-post20-final-363-one-record-technical-v1/P439.current.exact438-plus-one-paired-363-context.jsonl'
const I=B+'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/INVENTORY.root-current149-seven-finite-packages.json'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const pin=(p:string)=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size})
const c=read(C),v=read(V),inv=read(I),goals=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]))
const profiles=new Map(fs.readFileSync(P,'utf8').trim().split('\n').map((s:string,i:number)=>{const x=JSON.parse(s);return [x.goalId,{wholeProfile:x.profile,sourceLine:i+1}]}))
const plans=inv.goals.filter((g:any)=>g.packageId.startsWith('06-')||g.packageId.startsWith('07-'))
const allViews=Array.isArray(v)?v:(v.views??v.compositionViews)
if(!allViews)throw Error('unknown views shape '+Object.keys(v))
const neededViews=new Set(plans.flatMap((g:any)=>g.viewIds)),selectedViews=allViews.filter((x:any)=>neededViews.has(x.viewId))
const roles=new Map(selectedViews.map((x:any)=>[x.viewId,collectCompositionProjectionRoleGoalIds(x.rootNodes,goals)]))
const role=(v:string,id:string)=>{const r:any=roles.get(v);return r.targetGoalIds.has(id)?'target':r.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'}
const closure=(id:string)=>{const seen=new Set<string>();const walk=(i:string)=>{if(seen.has(i))return;seen.add(i);for(const r of goals.get(i)?.requires??[])walk(r)};walk(id);return [...seen]}
const union=new Set<string>()
const rows=plans.flatMap((g:any)=>g.viewIds.map((viewId:string)=>{const ids=closure(g.goalId);ids.forEach(id=>union.add(id));return {packageId:g.packageId,goalId:g.goalId,viewId,currentRole:role(viewId,g.goalId),scope:selectedViews.find((v:any)=>v.viewId===viewId).scope,currentCompiledApplicability:g.currentActualCompiledApplicability,requiresClosure:ids.map(id=>({goalId:id,title:goals.get(id)?.title,role:role(viewId,id)}))}}))
const memoryGoals=c.goals.filter((g:any)=>g.nodeKind==='memory'||g.tags?.includes('memorization')||g.tags?.some((t:string)=>t.startsWith('srs-deck:')))
const deckRoot=B+'current650-post20-P439-SEM-paired-context-final-technical-b-v1/capsule/curricula/DE/Gymnasium/memory-decks/'
const deckFiles=fs.readdirSync(deckRoot).filter(x=>x.endsWith('.json')).map(x=>deckRoot+x)
const decks=deckFiles.map(p=>({pin:pin(p),wholeDeck:read(p)}))
const selectors=memoryGoals.map((g:any)=>{const source=g.extendedData?.vocabularySource?.split('/').pop();const deckId=g.tags.find((t:string)=>t.startsWith('srs-deck:'))?.slice(9);const d=decks.find(d=>d.pin.path.endsWith('/'+source))??decks.find(d=>d.wholeDeck.deckId===deckId);if(!d)throw Error('deck missing '+g.id);const tags=getSrsFilterTags(g.tags);const cards=tags.length?d.wholeDeck.cards.filter((x:any)=>x.tags?.some((t:string)=>tags.includes(t))):d.wholeDeck.cards;return {goalId:g.id,wholeMemoryGoal:g,filterTags:tags,cardIds:cards.map((x:any)=>x.id),deckPin:d.pin,deckContextBoundary:'Canonical deck selected by source basename or explicit srs-deck ID; this does not rewrite or certify legacy vocabularySource transport paths. Package01 owns Arrhenius separately.',roles:selectedViews.map((v:any)=>({viewId:v.viewId,role:role(v.viewId,g.id)}))}})
const clean={role:'CONTENT_ONLY_CURRENT_CONTEXT_FOR_AUTHOR_PREPARATION_NO_REVIEW_VERDICTS',baseCanonical:pin(C),base39Views:pin(V),currentWholeP439:pin(P),inventory:pin(I),packages:inv.packages.filter((g:any)=>g.packageId.startsWith('06-')||g.packageId.startsWith('07-')),wholeTenGoalsAndProfiles:plans.map((p:any)=>({packageId:p.packageId,goalId:p.goalId,wholeGoal:goals.get(p.goalId),...profiles.get(p.goalId),existingExcludedTargetViewIds:p.viewIds,missingJurisdictions:p.missingJurisdictions})),wholeTransitiveGoalsAndProfiles:[...union].map(id=>({wholeGoal:goals.get(id),...(profiles.get(id)??{wholeProfile:null})})),wholeAffectedViews:selectedViews,rows,all67MemorySelections:selectors,wholeSevenDecks:decks,newAfterCompilerObserved:false,M7:false,HumanApproval:false,actualLearnerPerformance:false}
fs.mkdirSync(O,{recursive:true});fs.writeFileSync(O+'CONTEXT.actual-targeted25pairs-whole-content-and-stock-roles.json',JSON.stringify(clean,null,2)+'\n')
console.log(JSON.stringify({tenGoals:plans.length,pairs:rows.length,views:selectedViews.length,closureGoals:union.size,memoryGoals:memoryGoals.length,decks:decks.length,nonTargetClosure:rows.flatMap((r:any)=>r.requiresClosure.filter((x:any)=>x.role!=='target').map((x:any)=>({consumer:r.goalId,viewId:r.viewId,...x})))},null,2))
