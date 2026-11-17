import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js';
const root='/home/enpasos/projects/skillpilot',out=path.dirname(new URL(import.meta.url).pathname),file='app/scripts/testPhysicsGoalBookInputs.ts',src=fs.readFileSync(root+'/'+file,'utf8');
const expected='511ac8a37cd816796a81718d80502ad16144d8f5bb6458c2b1ae57b549314282';if(crypto.createHash('sha256').update(src).digest('hex')!==expected)throw Error('test drift');
fs.writeFileSync(out+'/reviewed-test.ts',src);
const ast=ts.createSourceFile('test.ts',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const names=['COMPOSITION_VIEW_DIRECTORY','HE_SEKI_UPPER_SUPPORT_LEAK_IDS','compareCodePoints','collectCompositionStructures'];
const selected=names.map(name=>{const s=ast.statements.find(s=>ts.isVariableStatement(s)&&s.declarationList.declarations.some(d=>d.name.getText(ast)===name));if(!s)throw Error(name);return s.getText(ast)}).join('\n');
const start=src.indexOf('      const crossStage = normalizeCompositionView(readJson('),end=src.indexOf('\n    }\n  } else {',start),block=src.slice(start,end);if(!block.includes('added method support must have a real unpruned')||!block.includes('reject loss of necessary'))throw Error('block mismatch');
fs.writeFileSync(out+'/extracted-guard.ts',block);
const setup=`import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import {resolve} from 'node:path';
import {normalizeCanonicalLandscape,normalizeGoalRef} from '${root}/app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,type CompositionViewNode} from '${root}/app/src/utils/authoring/compositionViewAuthoring.ts';
import {collectRenderedAtomicGoalIdsFromCompositionView} from '${root}/app/scripts/generateCurriculumQualityStatus.ts';
import type {SkillLandscape} from '${root}/app/src/landscapeTypes.ts';
const repoRoot='${root}',out='${out}';const readJson=(p:string)=>JSON.parse(fs.readFileSync(resolve(repoRoot,p),'utf8'));const hash=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(resolve(repoRoot,p))).digest('hex');
const paths=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'];
const [rawLandscape,rawMathLandscape,rawChemistryLandscape]=paths.map(readJson);
const normalized=[rawLandscape,rawMathLandscape,rawChemistryLandscape].map(normalizeCanonicalLandscape);
const physicsAndMathGoalById=new Map(normalized.flatMap(x=>x.goals).map(g=>[g.id,g]));
const semanticGoalById=new Map(normalized[0].goals.map(g=>[g.id,g]));
`;
const runner=`
const methodIds=['b378c8b3-5e83-5abf-8243-b0f345037bfc','d3c153b9-e09b-5668-8386-73105546a7c1','da26294f-4316-5bd5-a37a-bd89397b3b8b'];
const rows=[];
for(const durationModel of ['G8','G9']) {
 const sourcePath=COMPOSITION_VIEW_DIRECTORY+'/de-he-seki-'+durationModel.toLowerCase()+'.view.json';const view=normalizeCompositionView(readJson(sourcePath));const durationSpec={durationModel};
 const result=validate(view,durationSpec,sourcePath);assert.equal(result.sourceTargetIds.size,134);
 const mutations=[];
 for(const id of methodIds) {
  const changed=[];for(const [gid,g] of physicsAndMathGoalById){if(g.requires.some(r=>normalizeGoalRef(r)===id)){changed.push([gid,g]);physicsAndMathGoalById.set(gid,{...g,requires:g.requires.filter(r=>normalizeGoalRef(r)!==id)});}}
  assert(changed.length>0);let error='';try{validate(view,durationSpec,sourcePath)}catch(e){error=String(e)}finally{for(const [gid,g] of changed)physicsAndMathGoalById.set(gid,g)}
  assert.match(error,/added method support must have a real unpruned source-seed requirement/);mutations.push({type:'all actual canonical incoming R edges removed in memory',methodId:id,rejected:true,removedEdges:changed.map(([gid])=>[gid,id]),error});
 }
 rows.push({durationModel,sourcePath,sourceTargetCount:result.sourceTargetIds.size,expectedSupport:[...result.expectedSupport].sort(),positive:true,embeddedNegativeCases:HE_SEKI_UPPER_SUPPORT_LEAK_IDS.length+result.expectedSupport.size,mutations});
}
const testHash=hash('app/scripts/testPhysicsGoalBookInputs.ts');assert.equal(testHash,'${expected}');
fs.writeFileSync(out+'/probe.actual.json',JSON.stringify({status:'PASS',testHash,rows,inputs:Object.fromEntries(paths.map(p=>[p,hash(p)])),limits:['Focused exact HE stage-support block; complete GoalBook/CQR execution remains the author run.','Canonical R mutation is in-memory only and deliberately invalidates the demand to verify the guard.']},null,2)+'\\n');console.log(JSON.stringify({status:'PASS',positiveCases:rows.length,embeddedNegativeCases:rows.reduce((s,r)=>s+r.embeddedNegativeCases,0),independentRCutNegatives:rows.reduce((s,r)=>s+r.mutations.length,0),testHash}));
`;
fs.writeFileSync(out+'/probe.mts',setup+'\n'+selected+'\nfunction validate(view:any,durationSpec:any,sourcePath:string){\n'+block+'\nreturn {sourceTargetIds,expectedSupport,required};}\n'+runner);
