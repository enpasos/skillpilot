# SPDX-License-Identifier: Apache-2.0
"""Ordinary author A/M plus isolated ordinary P3 CLI, no active integration."""
from pathlib import Path
import json, hashlib, shutil, tempfile, subprocess, datetime
ROOT=Path.cwd()
DIR=Path(__file__).resolve().parent
PREFIX=DIR.relative_to(ROOT).as_posix()
def bind(p):
    return {'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def run(label,args,cwd):
    start=datetime.datetime.now(datetime.timezone.utc).isoformat()
    p=subprocess.run(args,cwd=cwd,text=True,capture_output=True)
    (DIR/'terminal').mkdir(exist_ok=True)
    (DIR/f'terminal/{label}.stdout.actual.txt').write_text(p.stdout)
    (DIR/f'terminal/{label}.stderr.actual.txt').write_text(p.stderr)
    result={'label':label,'argv':args,'executionCwdDiagnostic':str(cwd),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdout':bind(DIR/f'terminal/{label}.stdout.actual.txt'),'stderr':bind(DIR/f'terminal/{label}.stderr.actual.txt')}
    if p.returncode: raise RuntimeError(json.dumps(result)+'\n'+p.stderr+'\n'+p.stdout)
    return result
terminals=[]
for key,script in [('atomicity','semanticAtomicityReview.ts'),('memory','memoryCardReview.ts')]:
    args=['app/node_modules/.bin/tsx',f'app/scripts/{script}',f'--config={PREFIX}/{key}/three-whole-practical.author.config.json','--mode=check','--write-fingerprints']
    terminals.append(run(f'{key}-ordinary-author-check',args,ROOT))
capsule=Path(tempfile.mkdtemp(prefix='skillpilot-chemie-BW-source3-P3-'))
target=capsule/PREFIX
shutil.copytree(DIR,target)
for name in ['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:
    p=capsule/'app/scripts'/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/'app/scripts'/name,p)
for name in ['goal-evidence-profile.schema.json','goal-evidence-review-config.schema.json']:
    p=capsule/'contracts/goal-evidence/v2'/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/'contracts/goal-evidence/v2'/name,p)
p=capsule/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json';p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',p)
(capsule/'app/node_modules').symlink_to((ROOT/'app/node_modules').resolve(),target_is_directory=True)
tsx=str((ROOT/'app/node_modules/.bin/tsx').resolve())
terminals.append(run('P3-ordinary-materializer-isolated',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',f'{PREFIX}/positive/three-whole-practical.author.config.json','--candidates',f'{PREFIX}/positive/three-whole-practical-P-materializer.author-candidate.json','--write'],capsule))
terminals.append(run('P3-ordinary-review-isolated',[tsx,'app/scripts/positiveGoalEvidenceReview.ts',f'--config={PREFIX}/positive/three-whole-practical.author.config.json','--mode=check'],capsule))
records=target/'positive/three-whole-practical.author.review.jsonl'
shutil.copy2(records,DIR/'positive/three-whole-practical.author.review.jsonl')
parsed=[json.loads(line) for line in records.read_text().splitlines() if line]
assert len(parsed)==3 and all(p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate' and p['evidenceLevel']=='E1' and p['maximumClaimScope']=='G1' for p in parsed)
report={'schemaVersion':1,'role':'Completed ordinary technical author checks, no independent science approval','terminals':terminals,'P3Records':bind(DIR/'positive/three-whole-practical.author.review.jsonl'),'P3ClosedSchemaAndFingerprintValid':True,'authorA3CheckValid':True,'authorM3CheckValid':True,'actualLearnerExperiments':0,'independentReviewApprovals':0,'humanApproval':False,'activeWrites':0,'strictGain':0,'capsulePathIsExecutionDiagnosticOnly':True,'allOperativeOutputsCopiedToPortableAuthorPackage':True,'rootNodeModulesNeverRemoved':True,'isolatedCopiedOrdinaryToolInputs':[bind(ROOT/'app/scripts'/name) for name in ['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']]+[bind(ROOT/'contracts/goal-evidence/v2'/name) for name in ['goal-evidence-profile.schema.json','goal-evidence-review-config.schema.json']]}
(DIR/'checks/completed-author-A3-M3-and-isolated-ordinary-P3.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualCompletedNormalTerminals':len(terminals),'P3AiCandidatesNeedsHumanReview':3,'wholeA3M3AuthorCandidates':3,'activeWrites':0,'strictGain':0}))
