import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js';
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js';
const R='/home/enpasos/projects/skillpilot',O=R+'/'+readFileSync('/tmp/economics-ops14-independent-own-path.txt','utf8').trim();
const schemaPath=R+'/docs/landscape-runtime.schema.json',raw=readFileSync(schemaPath);
const ajv=new Ajv2020({strict:true,strictRequired:false,allErrors:true});addFormats(ajv);ajv.addKeyword({keyword:'x-skillpilot-listSemantics',schemaType:'string',valid:true});ajv.addKeyword({keyword:'x-skillpilot-caseInsensitiveUniqueItems',schemaType:'boolean',type:'array',validate:(enabled,data)=>!enabled||new Set(data.map(x=>typeof x==='string'?x.toLowerCase():JSON.stringify(x))).size===data.length});
const validate=ajv.compile(JSON.parse(raw));let rows=[];
for(const label of ['611-historical597','659-current645']){
 const p=O+'/whole-'+label+'-plus-final-fourteen-DRAFT-only-independent-runtime-schema.inert.json',can=JSON.parse(readFileSync(p));if(!validate(can))throw Error(JSON.stringify(validate.errors));
 const ids=new Set(can.goals.map(g=>g.id));if(ids.size!==can.goals.length)throw Error('duplicate goal');
 for(const kind of ['requires','contains']){
  const lookup=new Map(can.goals.map(g=>[g.id,g])),done=new Set(),visiting=new Set();
  function walk(id){if(done.has(id))return;if(visiting.has(id))throw Error('cycle '+kind+' '+id);visiting.add(id);const goal=lookup.get(id);for(const r of goal[kind]??[]){if(!ids.has(r))throw Error('unresolved '+kind+' '+r);walk(r);}visiting.delete(id);done.add(id);}
  for(const id of ids)walk(id);
 }
 const neg=structuredClone(can),m=neg.goals.find(g=>g.id==='a626fb8c-5eda-55b6-8b21-b757fec3cf80');delete m.examData.taskContent;if(validate(neg))throw Error('real task omission passed');
 rows.push({input:p.slice(R.length+1),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),count:can.goals.length,newDrafts14:true,actualClosedRuntimeSchemaPass:true,requiresAndContainsDAGPass:true,actualGermanTaskOmissionRejected:true,negativeErrors:structuredClone(validate.errors)});
}
const out={role:'independent actual unchanged production runtime schema and real required-task-negative; separate historical/current frames','actualRuntimeSchemaPath':schemaPath.slice(R.length+1),runtimeSchemaSHA:createHash('sha256').update(raw).digest('hex'),frames:rows,sourceOrScopeCompilerApproval:false,metadataClosedSchemaClaim:false,activeWrites:0};writeFileSync(O+'/actual-historical611-current659-production-runtime-schema-DAG-and-two-real-task-negatives.independent.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({frames:rows.map(r=>({count:r.count,schema:true,DAG:true,negativeDetected:true}))}));
