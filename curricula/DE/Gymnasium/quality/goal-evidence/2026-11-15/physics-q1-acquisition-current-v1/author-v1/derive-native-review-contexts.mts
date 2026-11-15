import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadCanonicalCatalog} from '../../app/scripts/deriveKnowledgeContext';
import {KnowledgeContextIndex} from '../../app/scripts/lib/knowledgeContext';
const B='tmp/physics-q1-current-acquisition-20261115-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const priorities=read('tmp/physics-release809-20261115/q1-whole-goal-review-priorities.actual.json');
const candidate=read(B+'/content-candidate.json');
const catalog=loadCanonicalCatalog();
const ordinaryIndex=new KnowledgeContextIndex(catalog);
const modified=structuredClone(catalog);
const physics:any=modified.find((l:any)=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a');
physics.goals.push(...candidate.tasks);
const taskIndex=new KnowledgeContextIndex(modified);
const ordinaryContexts=priorities.rows.map((r:any)=>ordinaryIndex.context(r.ordinaryGoal.id));
const taskContexts=candidate.tasks.map((t:any)=>taskIndex.context(t.id));
const needed=new Set<string>();
for(const c of [...ordinaryContexts,...taskContexts]){
 needed.add(c.goal.key);
 for(const group of c.secured)for(const g of group.goals)needed.add(g.key);
}
const goalTexts=[...needed].sort().map(key=>{
 const goal:any=taskIndex.graph.goal(key);
 return {key,id:goal.id,title:goal.title,titleEn:goal.titleEn,description:goal.description,descriptionEn:goal.descriptionEn,requires:goal.requires??[],kind:taskIndex.graph.kind(key)};
});
const sourcePins=['app/scripts/deriveKnowledgeContext.ts','app/scripts/lib/knowledgeContext.ts','app/scripts/lib/learningUnitContracts.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
writeFileSync(B+'/native-review-contexts.json',JSON.stringify({status:'read-only-native-knowledge-context-projection-not-content-approval',
 at:new Date().toISOString(),sourcePins,actualCurrentOrdinaryContexts:ordinaryContexts,
 candidateTaskContexts:taskContexts,fullGoalTextsForEveryCurrentSecuredOrdinaryAndCandidate:goalTexts,
 caveat:'Candidate tasks were added only in memory for native context calculation. Native classification is assessment, not ordinary. No canonical/catalog/view/review/result write. All 35 complete whole-P profiles and case briefs remain in the pinned priority input; do not infer native P acceptance from those authoring profiles.'},null,2)+'\n');
console.log(JSON.stringify({ordinaryContexts:ordinaryContexts.length,candidateContexts:taskContexts.length,fullGoalTexts:goalTexts.length,allCandidatesAssessment:taskContexts.every(c=>c.goal.kind==='assessment')}));
