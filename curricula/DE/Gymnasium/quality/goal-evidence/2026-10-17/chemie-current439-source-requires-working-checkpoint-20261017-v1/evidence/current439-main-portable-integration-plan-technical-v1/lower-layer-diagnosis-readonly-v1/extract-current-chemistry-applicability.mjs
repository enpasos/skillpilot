import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const K='/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/capsule';
const O='/mnt/e/skillpilot-chemie-L7-20261017/current439-main-portable-integration-plan-technical-v1/lower-layer-diagnosis-readonly-v1';
const imp=p=>import(pathToFileURL(K+'/'+p).href);
const compiler=await imp('app/scripts/applicabilityCompiler.ts');
const result=compiler.buildApplicabilityCompilation();
const report=result.reports.find(r=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0');
if(!report||report.goals.length!==650)throw Error('Wrong current Chemistry report');
const {convertLearningGoal}=await imp('app/src/goalTypes.ts');
const {normalizeCompositionView}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts');
const {applyCompositionViewProjection}=await imp('app/src/utils/compositionViewRuntime.ts');
const {buildDirectChildrenMap,getRenderedChildIds}=await imp('app/src/utils/treeProjectionRuntime.ts');
const raw=JSON.parse(readFileSync(K+'/'+report.file,'utf8'));
const sourceDir='curricula/DE/Gymnasium/composition-views/chemie';
const entry={meta:raw,goals:raw.goals.map(g=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};
const perView=[];
for(const name of readdirSync(K+'/'+sourceDir).filter(n=>n.endsWith('.view.json'))){
 const p=sourceDir+'/'+name;
 const view=normalizeCompositionView(JSON.parse(readFileSync(K+'/'+p,'utf8')));
 const projected=applyCompositionViewProjection([entry],view)[0];
 const byId=new Map(projected.goals.map(g=>[g.id,g]));
 const children=buildDirectChildrenMap(byId);
 const stack=projected.goals.filter(g=>(g.tags??[]).includes('root')).map(g=>g.id), seen=new Set();
 while(stack.length){const id=stack.pop();if(!id||seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,byId,children));}
 const atoms=[...seen].filter(id=>!id.startsWith('composition:')&&byId.has(id)&&(byId.get(id).contains??[]).length===0);
 perView.push({path:p,viewId:view.viewId,goalIds:atoms});
}
writeFileSync(O+'/RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json',JSON.stringify({role:'Read-only diagnostic data extraction from stock compiler plus the normal source-coverage view traversal; not a gate or approval',report,perView,writeApplicabilityReportsCalled:false,normalGeneratorOrGatesRun:false,MainMutated:false,KMutated:false},null,2)+'\n');
const warnings=report.findings.filter(f=>f.severity==='warning');
console.log(JSON.stringify({goals:report.goals.length,views:perView.length,warnings:warnings.length,codes:Object.fromEntries([...new Set(warnings.map(f=>f.code))].map(code=>[code,warnings.filter(f=>f.code===code).length]))}));
