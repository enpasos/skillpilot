import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
const [which, cfg] = process.argv.slice(2);
const root='/home/enpasos/projects/skillpilot';
const host=join(root,'tmp/chemie-resume-20261014',which==='historical'?'NAT9-host':'acid7-integration-v4-host');
const { materializeGoalDescriptionRolloutBatchDualSummary }=await import(join(host,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const { extractGoalDescriptionDualRoundResolutionSource, buildGoalDescriptionDualRoundResolution }=await import(join(host,'app/scripts/validateGoalDescriptionDualRoundResolution.ts'));
const { buildGoalDescriptionRolloutResolutionSynthesis }=await import(join(host,'app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'));
const dual=await materializeGoalDescriptionRolloutBatchDualSummary(cfg,false);
const dir=dual.prepared.outputDirectory;
const bytes=await readFile(join(dir,'synthesis-decisions.json'));const manifest=JSON.parse(bytes.toString());
await mkdir(join(dir,'resolutions'),{recursive:true});
for(const decision of manifest.decisions){
 const gid=decision.goalId;
 const first=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:gid,label:'First'});
 const second=extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:gid,label:'Second'});
 if(first.errors.length||second.errors.length||!first.source||!second.source)throw new Error(JSON.stringify([first.errors,second.errors]));
 const summaryGoal=dual.summary.goals.find((g:any)=>g.goalId===gid);if(!summaryGoal)throw new Error('missing summary');
 const synthesis=buildGoalDescriptionRolloutResolutionSynthesis({batchId:dual.prepared.manifest.batchId,manifest,decision,summaryGoal,firstSource:first.source,secondSource:second.source});
 const resolution=buildGoalDescriptionDualRoundResolution({resolutionId:`acid7-v4-${which}-${gid}`,goalId:gid,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,firstSource:first.source,secondSource:second.source,synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestPath:'synthesis-decisions.json',manifestId:manifest.manifestId,manifestDigest:`sha256:${createHash('sha256').update(bytes).digest('hex')}`,manifestFingerprint:manifest.manifestFingerprint,decisionId:decision.decisionId}});
 if(resolution.status!=='resolved')throw new Error('Not resolved '+gid);
 await writeFile(join(dir,'resolutions',`${gid}.resolution.json`),JSON.stringify(resolution,null,2)+'\n');
}
console.log(JSON.stringify({role:'Informed technical synthesis using unmodified stock helpers; no independent scientific vote',host,decisions:manifest.decisions.length,resolutionsStatus:'resolved',deterministicSynthesisTimestamp:manifest.synthesizedAt,actualExecutionUTC:new Date().toISOString()}));
