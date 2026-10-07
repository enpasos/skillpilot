import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import {createGoalVisualizationLink,createPromptMetadataMarkdown,extractPromptText,isGoalVisualizationLink} from '/home/enpasos/projects/skillpilot/scripts/goal_visualization_common.mjs';
const ROOT='/home/enpasos/projects/skillpilot';const OUT=path.dirname(fileURLToPath(import.meta.url));
const bind=p=>({path:path.relative(ROOT,p),sha256:'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
const inputs=JSON.parse(fs.readFileSync(path.join(OUT,'seven-whole-current-goal-resource-only.authoring-inputs.json'),'utf8'));
const jobs=JSON.parse(fs.readFileSync(path.join(OUT,'seven-native-helper-prompt-and-resource-jobs.json'),'utf8')).jobs;
const rows=[]; const promptRouting=[]; const imports=[];
for(const input of inputs.rows){
 const job=jobs.find(x=>x.goalId===input.goalId); const goal=structuredClone(input.wholeCurrentGoalBefore);
 const link=createGoalVisualizationLink(goal,{provider:job.provider,description:`Visualisierung zum Lernziel: ${goal.title}.`,altText:job.altText,lang:'de',license:job.license,reviewStatus:job.reviewStatus,publicUrl:job.publicUrl});
 const remaining=(goal.resourceLinks??[]).filter(x=>!(isGoalVisualizationLink(x)&&x.role==='primary'&&(x.lang??'de')==='de'));
 goal.resourceLinks=[link,...remaining];
 const changed=Object.keys(goal).filter(k=>JSON.stringify(goal[k])!==JSON.stringify(input.wholeCurrentGoalBefore[k]));
 if(changed.join()!=='resourceLinks')throw Error(JSON.stringify(changed));
 const nativePrompt=createPromptMetadataMarkdown(goal,{provider:job.provider,reviewStatus:job.reviewStatus,fileName:job.goalId+'.png',publicUrl:job.publicUrl,rawPrompt:extractPromptText(job.rawPrompt)});
 if(extractPromptText(nativePrompt)!==extractPromptText(job.rawPrompt))throw Error('Prompt extraction mismatch');
 const promptCandidate=path.join(OUT,'prospective-install-tree',job.promptTarget);fs.mkdirSync(path.dirname(promptCandidate),{recursive:true});fs.writeFileSync(promptCandidate,nativePrompt);
 const template={...input,wholeCurrentGoalAfterResourceOnly:goal,changedWholeGoalTopLevelFields:changed,approvedResourceLinkCandidate:link,actualModelId:'unknown; not separately exposed',promptCandidate:bind(promptCandidate)};
 const filepath=path.join(OUT,'whole-goal-resource-only-templates',goal.id+'.json');fs.mkdirSync(path.dirname(filepath),{recursive:true});fs.writeFileSync(filepath,JSON.stringify(template,null,2)+'\n');
 rows.push({goalId:goal.id,template:bind(filepath),beforeGoal:input.wholeCurrentGoalBefore,afterGoal:goal,QAReplacement:input.requiredNewQARecord});
 promptRouting.push({goalId:goal.id,actualGeneratorPrompt:job.actualPrompt,preparedNativeHelperPrompt:bind(promptCandidate),finalActiveDestination:job.promptTarget,provider:job.provider,actualTool:job.actualTool,imageModel:job.imageModel,license:job.license});
 imports.push({goalId:goal.id,nativeImportMustRunByRootOnlyAfterFinalSignal:true,argv:['node','scripts/import_goal_visualization.mjs',goal.id,job.selectedPNG.path,'--landscape=curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','--subject=chemie',`--provider=${job.provider}`,'--review-status=pilot','--license=CC-BY-4.0',`--alt-text=${job.altText}`,`--prompt=${job.actualPrompt.path}`],expectedNativeResourceLink:link,expectedNativePrompt:bind(promptCandidate),currentWholeGoalGuard:input.beforeWholeGoalObjectSha256});
}
fs.writeFileSync(path.join(OUT,'seven-current-whole-resource-only-templates.index.json'),JSON.stringify({schemaVersion:1,currentWholeGoalCount:479,currentCanonicalBinding:inputs.canonicalAtPreparation,neverReplaceFullCanonical:true,onlySevenResourceLinksChanged:true,rows},null,2)+'\n');
fs.writeFileSync(path.join(OUT,'seven-source-prompt-native-helper-and-import-argv.routing.json'),JSON.stringify({schemaVersion:1,helper:bind(path.join(ROOT,'scripts/goal_visualization_common.mjs')),nativeImporter:bind(path.join(ROOT,'scripts/import_goal_visualization.mjs')),promptRouting,nativeImportCallsForRootOnly:imports,actualNativeImportPerformed:false,activeWrites:false},null,2)+'\n');
process.stdout.write(JSON.stringify({actualPureHelperResourceLinks:rows.length,actualPureHelperPromptCandidates:promptRouting.length,fullCanonicalCopied:false,activeNativeImportPerformed:false})+'\n');
