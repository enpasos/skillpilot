import {readFileSync,writeFileSync} from 'node:fs';
import {collectWholeMaterialPrerequisiteClosure,routeProfiles} from '/tmp/economics-combined645-current597-author-a-_exxit5_/capsule/app/scripts/generateCurriculumQualityStatus.ts';
const c=JSON.parse(readFileSync('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','utf8'));
const x=JSON.parse(readFileSync('/tmp/economics-policy7-existing-whole-materials.read.json','utf8'));
const q=JSON.parse(readFileSync('/tmp/economics-policy7-current597-whole-goal-P14-read.json','utf8'));
const rows=[...x,...q.map((z:any)=>({...z.wholeGoal,id:'prospective-'+z.wholeGoal.id,requires:[z.wholeGoal.id],contains:[]}))].map(g=>{const model=g.id.startsWith('prospective-')?{...c,goals:[...c.goals,g]}:c;const z=collectWholeMaterialPrerequisiteClosure(model,g.id);return{materialOrProspectiveId:g.id,wholeNativePrerequisiteIds:[...z.atomicGoalIds].sort(),unresolved:[...z.unresolvedReferences]};});
writeFileSync('/tmp/economics-policy7-native-existing-five-and-prospective-seven-whole-closure.actual.json',JSON.stringify(rows,null,2)+'\n'); console.log(JSON.stringify(rows));

writeFileSync('/tmp/economics-policy7-actual-native-route-profile.read.json',JSON.stringify(routeProfiles.find(p=>p.landscapeId===c.landscapeId),(k,v)=>typeof v==='function'?v.toString():v,2)+'\n');
