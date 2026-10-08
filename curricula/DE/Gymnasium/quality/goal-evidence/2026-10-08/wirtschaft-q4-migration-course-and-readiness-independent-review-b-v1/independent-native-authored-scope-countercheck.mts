// Apache-2.0. Read-only targeted native projection countercheck.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {prepareLandscapeEntries} from '../../../../../../../app/src/hooks/useLandscapes.ts';
import {normalizeCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime.ts';
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters.ts';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime.ts';

const iso=process.argv[2], output=process.argv[3];
if(!iso||!output)throw new Error('Usage: <physical isolate> <new own output path>');
const canonicalPath=iso+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
const rawBytes=await readFile(canonicalPath), raw=JSON.parse(rawBytes.toString());
const entries=prepareLandscapeEntries([raw]);
const actualResults=[];
for(const profile of ['GK','LK']){
 const viewPath=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+profile.toLowerCase()+'.view.json';
 const viewBytes=await readFile(viewPath),view=normalizeCompositionView(JSON.parse(viewBytes.toString()));
 if(view.scope.courseProfile!==profile||view.scope.stage!=='CrossStage')throw new Error('Unexpected authored scope');
 const projected=applyCompositionViewProjection(entries,view)[0];
 const all=new Map(projected.goals.map(g=>[g.id,g]));
 const filtered=new Map(projected.goals.filter(g=>goalMatchesFilters(g,['DE-HE',profile])).map(g=>[g.id,g]));
 const children=buildDirectChildrenMap(filtered),root=projected.goals.find(g=>g.tags?.includes('root'));
 if(!root)throw new Error('No authored root');
 const included=new Set<string>();
 function visit(id:string){if(included.has(id)||!filtered.has(id))return;included.add(id);for(const c of getRenderedChildIds(id,filtered,children))visit(c);}
 visit(root.id);
 const target=(id:string)=>included.has(id);
 const assessment=all.get('44fb56bb-7b5a-4b34-9ca4-c4052f94da89')!;
 const migration=all.get('6de44afa-7f91-5fa4-9292-ec06e86e97a4')!;
 const expanded=new Set<string>(), cycles:string[][]=[];
 function expand(id:string,path:string[]){
   if(path.includes(id)){cycles.push([...path,id]);return;}
   if(expanded.has(id))return;expanded.add(id);
   const g=all.get(id);if(!g)return;
   for(const child of g.contains??[])expand(child,[...path,id]);
   for(const prerequisite of g.effectiveRequires??g.requires)expand(prerequisite,[...path,id]);
 }
 for(const prerequisite of assessment.effectiveRequires??assessment.requires)expand(prerequisite,[]);
 const directPrerequisites=assessment.requires.map(id=>{const g=all.get(id);return{goalId:id,title:g?.title,tags:g?.tags,includedInAuthoredTarget:target(id),exists:!!g};});
 actualResults.push({profile,scope:view.scope,authoredViewPath:viewPath,authoredViewSha256:createHash('sha256').update(viewBytes).digest('hex'),rootId:root.id,includedGoalCount:included.size,includedAtomicCount:[...included].filter(id=>all.get(id)?.type==='atomic').length,migration:{goalId:migration.id,tags:migration.tags,includedInAuthoredTarget:target(migration.id),directRequires:migration.requires},assessment:{goalId:assessment.id,tags:assessment.tags,includedInAuthoredTarget:target(assessment.id),directRequires:assessment.requires,effectiveRequires:assessment.effectiveRequires,directPrerequisiteItems:directPrerequisites,missingDirectTargetIds:directPrerequisites.filter(x=>!x.includedInAuthoredTarget).map(x=>x.goalId),transitiveExpandedPrerequisiteCount:expanded.size,missingTransitiveTargetIds:[...expanded].filter(id=>!target(id)),missingAnyPrerequisiteObjectIds:[...expanded].filter(id=>!all.has(id)),cycles},scopeReadinessClaimOnlyWhenAssessmentTarget:target(assessment.id)});
}
await writeFile(output,JSON.stringify({schemaVersion:1,actualExecutedAt:new Date().toISOString(),reviewerAgent:'/root/economics_layer_a',canonicalPath,canonicalSha256:createHash('sha256').update(rawBytes).digest('hex'),nativeFunctionNames:['prepareLandscapeEntries','normalizeCompositionView','applyCompositionViewProjection','goalMatchesFilters','buildDirectChildrenMap','getRenderedChildIds'],actualResults,readOnly:true,humanApprovalClaimed:false,completeAllStateApplicabilityClaimed:false,liveWrites:0},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(actualResults.map(r=>({profile:r.profile,migrationTarget:r.migration.includedInAuthoredTarget,assessmentTarget:r.assessment.includedInAuthoredTarget,missingDirect:r.assessment.missingDirectTargetIds,missingTransitive:r.assessment.missingTransitiveTargetIds,cycles:r.assessment.cycles}))));
