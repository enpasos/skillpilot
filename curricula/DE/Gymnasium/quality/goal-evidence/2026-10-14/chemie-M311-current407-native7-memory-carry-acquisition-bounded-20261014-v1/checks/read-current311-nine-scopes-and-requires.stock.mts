// Apache-2.0; current acquisition structure only, no NativeD7 votes.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-M311-current407-native7-memory-carry-acquisition-bounded-20261014-v1'
const n7='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-naturstoffe-seven-shared-native-first-pass-technical-20261014-v1'
const imp=(p:string)=>import(pathToFileURL(resolve(p)).href),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const {normalizeCanonicalLandscape}=await imp('app/src/utils/authoring/canonicalAuthoring.ts')
const {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts')
const raw=read(`${n7}/candidate/canonical533.current407.naturstoffe7-reviewed-resources.inactive.json`),landscape=normalizeCanonicalLandscape(raw),byid=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const root='31148286-b8db-57a7-8da2-2e0479240a2c',config=read(`${own}/M407.current-N7-source-address-only.stock.config.json`)
const closure=new Set<string>(),missing:string[]=[],cycles:string[]=[]
const visit=(g:string,path:string[])=>{if(path.includes(g)){cycles.push([...path,g].join(' -> '));return}const goal=byid.get(g);if(!goal){missing.push(g);return}if(closure.has(g))return;closure.add(g);for(const p of goal.requires??[])visit(p,[...path,g])}
visit(root,[])
const deck=read('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_natural_q2.de.json')
const scopes=config.visibilityScopes.map((s:any)=>{
 const bytes=readFileSync(s.viewPath),view=normalizeCompositionView(JSON.parse(bytes.toString())),compiled=compileCompositionView(view,landscape)
 const {targetGoalIds,prerequisiteOnlyGoalIds}=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(landscape.goals.map((g:any)=>[g.id,g])))
 const available=new Set([...targetGoalIds,...prerequisiteOnlyGoalIds])
 return {label:s.label,viewPath:s.viewPath,sha256:`sha256:${createHash('sha256').update(bytes).digest('hex')}`,scope:view.scope,blockingFindings:compiled.findings.filter((f:any)=>f.severity==='error'),memory311Role:targetGoalIds.has(root)?'target':prerequisiteOnlyGoalIds.has(root)?'prerequisiteOnly':'not_visible',directParents:(byid.get(root).requires as string[]).map(g=>({goalId:g,title:byid.get(g).title,role:targetGoalIds.has(g)?'target':prerequisiteOnlyGoalIds.has(g)?'prerequisiteOnly':'not_visible'})),cardOrigins:deck.cards.map((c:any)=>{const ids=c.tags.filter((t:string)=>t.startsWith('goal:')).map((t:string)=>t.slice(5));return {cardId:c.id,originGoalIds:ids,originInActual311RequiresClosure:ids.every((g:string)=>closure.has(g)),originAvailableInCurrentView:ids.every((g:string)=>available.has(g))}})}
})
const result={schemaVersion:1,checkedAtUTC:new Date().toISOString(),unmodifiedStockViewCompilationAndProjectionHelpers:true,current311WholeGoal:byid.get(root),actualRequiresClosure:Array.from(closure).sort().map(g=>byid.get(g)),allFiveCardOriginsInCurrentGlobalRequiresClosure:deck.cards.every((c:any)=>c.tags.filter((t:string)=>t.startsWith('goal:')).every((t:string)=>closure.has(t.slice(5)))),missingRequiresTargets:missing,cycles,scopes,newPrerequisiteEdits:0,D7ScienceRead:false,HHostMutation:false}
writeFileSync(`${own}/checks/current311-exact-whole-requires-closure-and-nine-stock-projection-roles.actual.json`,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({closure:closure.size,cardOriginsAllInClosure:result.allFiveCardOriginsInCurrentGlobalRequiresClosure,missing,cycles,scopes:scopes.map((s:any)=>({label:s.label,memory:s.memory311Role,missingDirectParents:s.directParents.filter((p:any)=>p.role==='not_visible').map((p:any)=>p.goalId),unavailableCardOrigins:s.cardOrigins.filter((c:any)=>!c.originAvailableInCurrentView).map((c:any)=>c.cardId)}))}))
