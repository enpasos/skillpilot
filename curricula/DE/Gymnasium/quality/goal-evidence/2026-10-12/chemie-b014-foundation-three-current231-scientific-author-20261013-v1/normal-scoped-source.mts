import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const repo=process.cwd();
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-b014-foundation-three-current231-scientific-author-20261013-v1';
const cap=resolve(repo,'tmp/chemie-q4-current220-prep/execution/app/scripts');
const rd=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'));
const wr=(p:string,v:unknown)=>writeFileSync(resolve(repo,base,p),JSON.stringify(v,null,2)+'\n');
for(const name of ['goalBookModel.ts','goalBookOriginalSources.ts']) {
  if(!readFileSync(resolve(cap,name)).equals(readFileSync(resolve(repo,'app/scripts',name)))) throw Error('Private source API differs: '+name);
}
const {loadGoalBookBuildInputs}=await import(resolve(cap,'goalBookModel.ts'));
const {buildGoalBookOriginalSources}=await import(resolve(cap,'goalBookOriginalSources.ts'));
const loaded=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',repo);
const wanted=new Set(rd(base+'/configs/P3.inactive.config.json').scope.goalIds);
const pages=loaded.model.pages.filter((p:any)=>wanted.has(p.goalId));
if(pages.length!==3)throw Error('Expected three selected atlas pages');
const mappingPaths=rd('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json').mappingPaths;
const source=buildGoalBookOriginalSources({...loaded.model,pages},repo,mappingPaths);
wr('current-source3.normal.original-sources.actual.json',source);
wr('current-source3.normal.selected-pages.actual.json',{schemaVersion:1,role:'Exact selected normal current source-atlas page and applicability tuples only; not a complete book or national scientific coverage approval',canonicalByteSha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,loaded.model.source.landscapePath))).digest('hex'),wholeSourceAtlasPages:loaded.model.pages.length,wholeSourceAtlasDigest:loaded.model.digest,source:loaded.model.source,pages,mappingPaths,selectedGoals:3,strictGain:0,activeWrites:false});
console.log(JSON.stringify({selectedGoals:3,currentAtlasPages:loaded.model.pages.length,counts:pages.map((p:any)=>({goalId:p.goalId,tupleCount:source.goals[p.goalId].length,evidenceCount:new Set(source.goals[p.goalId].flatMap((r:any)=>r.evidenceIds)).size})),strictGain:0}));
