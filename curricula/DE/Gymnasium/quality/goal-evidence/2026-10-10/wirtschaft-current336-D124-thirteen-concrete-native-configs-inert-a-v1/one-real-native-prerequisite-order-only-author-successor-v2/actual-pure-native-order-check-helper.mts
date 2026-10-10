import { readFile } from 'node:fs/promises';
import { loadGoalBookBuildInputs } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts';
import { buildGoalDescriptionRolloutSubsetModel } from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch.ts';
const root='/home/enpasos/projects/skillpilot/';
const folder='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current336-D124-thirteen-concrete-native-configs-inert-a-v1/';
const index=JSON.parse(await readFile(root+folder+'actual-thirteen-concrete-current-ID-config-index.INERT.json','utf8'));
const base=await loadGoalBookBuildInputs(index.baseGoalBookConfigPath);
const pages=new Map(base.model.pages.map(p=>[p.goalId,p]));
const rows=[];
for(const row of index.configurations){
 const config=JSON.parse(await readFile(root+row.config.path,'utf8'));let before;
 try{buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:config.goalIds,bookId:config.bookId,title:config.title});before={pass:true};}
 catch(error){before={pass:false,error:error instanceof Error?error.message:String(error)};}
 const remaining=new Set<string>(config.goalIds);const after:string[]=[];
 while(remaining.size){
  const ready=config.goalIds.find((id:string)=>remaining.has(id)&&!(pages.get(id)?.requires??[]).some(p=>remaining.has(p.goalId)));
  if(!ready)throw new Error('No acyclic prerequisite-safe remainder');remaining.delete(ready);after.push(ready);
 }
 const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:after,bookId:config.bookId,title:config.title});
 rows.push({packageNumber:row.packageNumber,configPath:row.config.path,beforeNative:before,beforeGoalIds:config.goalIds,afterGoalIds:after,afterNativePass:true,orderChangeRequired:JSON.stringify(after)!==JSON.stringify(config.goalIds),exactSameIDSet:after.length===config.goalIds.length&&after.every(id=>config.goalIds.includes(id)),wholeCurrentBaseModelDigest:base.model.digest,afterSubsetModelDigest:model.digest});
}
console.log(JSON.stringify({role:'Actual pure production subset-model ordering check; no native preparation writes or scientific review',currentFullBaseModelDigest:base.model.digest,currentBasePages:base.model.pages.length,rows},null,2));
