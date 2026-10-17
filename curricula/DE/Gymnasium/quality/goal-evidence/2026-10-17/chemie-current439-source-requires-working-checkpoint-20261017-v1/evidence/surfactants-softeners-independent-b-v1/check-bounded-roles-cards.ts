import fs from 'node:fs';
import crypto from 'node:crypto';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {getSrsFilterTags} from '/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts';
const dir='/mnt/e/skillpilot-chemie-L7-20261017/surfactants-softeners-independent-b-v1';
const d=JSON.parse(fs.readFileSync('/mnt/e/skillpilot-chemie-L7-20261017/surfactants-softeners-retained-target-scope-author-v1/REVIEW-INPUT.clean-package03-whole-content.json','utf8'));
const c=JSON.parse(fs.readFileSync(d.baseCanonical.path,'utf8'));
const universe=new Map(c.goals.map((g:any)=>[g.id,g]));
const targetFour=['2d16528c-1424-5999-b3d2-af4593a147fc','cc5a626a-dc85-57e2-b422-259f92901545','c21d430b-424d-5b13-adf6-999f2490d2dc','21066929-2b7f-5d31-924b-338677053238'];
const supportIds=['1a0eab44-b0b2-534b-a3db-988a1bb76a87','1e372b97-6f1c-596c-8a8b-fc03193d784a','98781dda-8049-5173-899b-42a5c2902b86','e3e8582a-976b-5f0f-b31b-3cf59a4fff24'];
function closure(id:string,out=new Set<string>()){for(const r of (universe.get(id) as any)?.requires??[]){if(out.has(r))continue;out.add(r);closure(r,out)}return out;}
const ordinaryClosure=[...closure(targetFour[0])].filter(id=> !(universe.get(id) as any)?.tags?.includes('memorization'));
const viewChecks=d.wholeEightUnchangedViews.map((v:any)=>{
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,universe as any);
 const role=(id:string)=>roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent';
 return {viewId:v.viewId,scope:v.scope,targetFour:targetFour.map(goalId=>({goalId,role:role(goalId)})),directTeacher:role('a78aacf9-92ea-5627-8776-a595111f754c'),supportRoles:supportIds.map(goalId=>({goalId,role:role(goalId)})),ordinaryRequiresClosure:ordinaryClosure.map(goalId=>({goalId,role:role(goalId)})),missingOrdinaryTargetTeachers:ordinaryClosure.filter(id=>role(id)!=='target'),compositionFindings:compileCompositionView(v,c,c).findings};
});
const decks=d.allSevenUnchangedActualDeckPins.map((p:any)=>JSON.parse(fs.readFileSync(p.path,'utf8')));
const selectedChecks=d.all67UnchangedActualMemorySelections.map((s:any)=>{
 const g:any=universe.get(s.goalId),deck=decks.find((z:any)=>z.deckId===s.deckId),tags=getSrsFilterTags(g.tags);
 const cards=deck.cards.filter((a:any)=>a.tags?.some((tag:string)=>tags.includes(tag)));
 return {goalId:s.goalId,deckId:s.deckId,actualFilterTags:tags,selectedCardIds:cards.map((a:any)=>a.id),matchesDeclaredSelection:JSON.stringify(cards.map((a:any)=>a.id))===JSON.stringify(s.selectedCardIds),matchesDeclaredFilter:JSON.stringify(tags)===JSON.stringify(s.actualFilterTags)};
});
const selectedWholeCards=d.actualSelectedRelevantWholeCards.map((a:any)=>({cardId:a.id,exactMatchesPhysicalDeck:decks.some((deck:any)=>deck.cards.some((c:any)=>c.id===a.id&&JSON.stringify(c)===JSON.stringify(a)))}));
const cardOrigins=d.actualCurrentCardOriginInputs;
const out={scope:'Bounded content/roles/selectors helper only; no applicability compiler invocation or gate acceptance',helperPins:['/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts','/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts'].map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),viewChecks,selectedChecks,selectedWholeCards,cardOriginInputsCount:cardOrigins.length,targetViewPairs:viewChecks.reduce((n:any,v:any)=>n+v.targetFour.filter((a:any)=>a.role==='target').length,0)};
fs.writeFileSync(dir+'/MEASUREMENT.bounded-stock-roles-and-actual-card-selections.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({views:viewChecks.length,targetViewPairs:out.targetViewPairs,missingTeachers:viewChecks.map((v:any)=>({viewId:v.viewId,missing:v.missingOrdinaryTargetTeachers,findings:v.compositionFindings.length})),selections: selectedChecks.length,selectionMismatches:selectedChecks.filter((a:any)=>!a.matchesDeclaredSelection||!a.matchesDeclaredFilter),cardMismatches:selectedWholeCards.filter((a:any)=>!a.exactMatchesPhysicalDeck),narrow: selectedChecks.filter((a:any)=>targetFour.includes(a.goalId)||supportIds.includes(a.goalId))},null,2));
