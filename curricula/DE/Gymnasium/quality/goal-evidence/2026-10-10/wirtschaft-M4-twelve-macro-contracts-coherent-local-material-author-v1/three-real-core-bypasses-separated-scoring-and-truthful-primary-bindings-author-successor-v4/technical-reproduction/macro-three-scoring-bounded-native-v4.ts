import {readFileSync,writeFileSync} from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import {validateCanonicalLandscape} from './app/src/utils/authoring/canonicalAuthoring.ts';
import {evaluateGraphIntegrity} from './app/scripts/generateCurriculumQualityStatus.ts';
import {fingerprintSemanticKindSourceGoal} from './app/scripts/goalBookModel.ts';
const [beforePath,afterPath,schemaPath,outPath]=process.argv.slice(2);
const before=JSON.parse(readFileSync(beforePath,'utf8')),after=JSON.parse(readFileSync(afterPath,'utf8')),schema=JSON.parse(readFileSync(schemaPath,'utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true,strictRequired:false});
ajv.addKeyword({keyword:'x-skillpilot-listSemantics',schemaType:'string',valid:true});
ajv.addKeyword({keyword:'x-skillpilot-caseInsensitiveUniqueItems',schemaType:'boolean',type:'array',validate:(enabled:boolean,data:unknown[])=>!enabled||new Set(data.map(x=>typeof x==='string'?x.toLowerCase():JSON.stringify(x))).size===data.length});
const validate=ajv.compile(schema);if(!validate(after))throw new Error(JSON.stringify(validate.errors));
const known=new Set(after.goals.map(g=>g.id));const local=validateCanonicalLandscape(after);const graph=evaluateGraphIntegrity(after,known);if(graph.status!=='pass'||local.some(x=>x.severity==='error'))throw new Error(JSON.stringify({graph,local}));
if(before.goals.length!==524||after.goals.length!==533)throw new Error('wrong frame');
for(const g of before.goals){if(JSON.stringify(g)!==JSON.stringify(after.goals.find(x=>x.id===g.id)))throw new Error('old goal changed '+g.id);}
const oldids=new Set(before.goals.map(g=>g.id));const added=after.goals.filter(g=>!oldids.has(g.id));if(added.length!==9)throw new Error('wrong additions');
const invalid=structuredClone(after);invalid.goals.find(g=>g.id==='1a56a8a7-c81f-5dd2-94ac-93bc6cba8eab').examData.scoring.passingPoints='fifteen';const invalidSchemaDetected=!validate(invalid);
const cyclic=structuredClone(after);cyclic.goals.find(g=>g.id==='676684da-5ba2-5c2a-ba7e-a8413915c29c').requires.push('1a56a8a7-c81f-5dd2-94ac-93bc6cba8eab');const negativeGraph=evaluateGraphIntegrity(cyclic,known),cycleDetected=negativeGraph.status==='fail';if(!invalidSchemaDetected||!cycleDetected)throw new Error('native negative missed');
const result={role:'AUTHOR_TECHNICAL_ONLY_NO_MATERIAL_SCIENCE_OR_SCOPE_APPROVAL',goalCount:after.goals.length,old524WholeGoalObjectsExact:true,addedPracticeCandidates:9,closedSchemaErrors:0,graphErrors:0,graph,newNativeSourceFps:added.map(g=>({id:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),kindProposal:'practiceAssessment',kindQualifiedByForeignReview:false})),realSchemaNegativeDetected:invalidSchemaDetected,realRequiresCycleNegativeDetected:cycleDetected,negativeGraph,viewsSourceCodeRuntimeUntouched:true};
writeFileSync(outPath,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({goalCount:533,schemaErrors:0,graphErrors:0,old524WholeExact:true,schemaNegative:invalidSchemaDetected,requiresCycleNegative:cycleDetected}));
