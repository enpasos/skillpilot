import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import{pathToFileURL}from'node:url';
const M='/home/enpasos/projects/skillpilot';
const K='/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/capsule';
const O='/mnt/e/skillpilot-chemie-L7-20261017/current439-main-portable-integration-plan-technical-v1/remaining-lower-layer-cause-and-remediation-plan-v1';
const imp=p=>import(pathToFileURL(K+'/'+p).href);
const {convertLearningGoal}=await imp('app/src/goalTypes.ts');
const {normalizeCompositionView}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts');
const {applyCompositionViewProjection}=await imp('app/src/utils/compositionViewRuntime.ts');
const {buildDirectChildrenMap,getRenderedChildIds}=await imp('app/src/utils/treeProjectionRuntime.ts');
const raw=JSON.parse(readFileSync(M+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8'));
const sourceDir='curricula/DE/Gymnasium/composition-views/chemie';
const entry={meta:raw,goals:raw.goals.map(g=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};
const perView=[];
for(const name of readdirSync(M+'/'+sourceDir).filter(n=>n.endsWith('.view.json'))){
 const p=sourceDir+'/'+name;
 const view=normalizeCompositionView(JSON.parse(readFileSync(M+'/'+p,'utf8')));
 const projected=applyCompositionViewProjection([entry],view)[0];
 const byId=new Map(projected.goals.map(g=>[g.id,g]));
 const children=buildDirectChildrenMap(byId);
 const stack=projected.goals.filter(g=>(g.tags??[]).includes('root')).map(g=>g.id), seen=new Set();
 while(stack.length){const id=stack.pop();if(!id||seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,byId,children));}
 const atoms=[...seen].filter(id=>!id.startsWith('composition:')&&byId.has(id)&&(byId.get(id).contains??[]).length===0);
 perView.push({path:p,viewId:view.viewId,goalIds:atoms});
}
writeFileSync(O+'/RAW.existing-Main-37-rendered-views-no-compiler.json',JSON.stringify({role:'Stock renderer traversal only; no compiler or full check',canonicalGoalCount:raw.goals.length,perView},null,2)+'\n');
console.log(JSON.stringify({views:perView.length}));
