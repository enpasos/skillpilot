# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1');D=R/P;T=R/'tmp/m7-resumption-20261010/chemistry-b008-protected-twelve-native-author';C=T/'isolated-normal-capsule'
assert not (D/'author.final.freeze.json').exists()
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(label,args):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=C,capture_output=True,text=True)
 stdout=P/'terminal'/f'{label}.stdout.actual.txt';stderr=P/'terminal'/f'{label}.stderr.actual.txt';(R/stdout).write_text(r.stdout);(R/stderr).write_text(r.stderr)
 proof={'schemaVersion':1,'label':label,'argv':args,'executionCwdDiagnosticOnly':str(C),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdout':ref(stdout),'stderr':ref(stderr),'activeWrites':[],'strictGain':0}
 (D/'terminal'/f'{label}.terminal.actual.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps({'label':label,'actualExitCode':r.returncode,'stdoutTail':r.stdout[-2200:],'stderrTail':r.stderr[-3000:]},ensure_ascii=False),flush=True);assert r.returncode==0,label
tsx=str(R/'app/node_modules/.bin/tsx');deps=[]
for lang in ['de','en']:
 f=Path(f'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1/de_gymnasium_chemistry_arrhenius_names_formulas.{lang}.reviewed.inactive.candidate.json')
 dest=C/f;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/f,dest)
 own=P/'inputs/memory/transitive-decks'/f.name;(R/own).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/f,R/own);deps.append({'wholeOriginal':ref(f),'wholeExactOwnCopy':ref(own),'normalCapsuleFileBytesExact':(R/f).read_bytes()==dest.read_bytes()})
(D/'checks/normal-memory-transitive-dependency-copies.actual.json').write_text(json.dumps({'schemaVersion':1,'wholeDependencyCopies':deps,'noCheckerChange':True,'activeWrites':[]},indent=2)+'\n')
target=json.loads((D/'inputs/whole-existing-A-M-and-normal-target-bindings.actual.json').read_text())
run('normal-targeted-protected12-memory-with-exact-decks',[tsx,'app/scripts/memoryCardReview.ts','--config='+target['normalMemoryConfigPath'],'--mode=check'])
bindings=json.loads((D/'inputs/protected12-P-body-and-profile-bindings.actual.json').read_text())
outputs=json.loads((D/'checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json').read_text())['normalCurrentTechnicalPRecordPaths']
for i,(binding,output)in enumerate(zip(bindings['wholeOriginalOrdinaryPInputs'],outputs),1):
 cfg=json.loads((R/binding['wholeActiveConfigOriginalBinding']['path']).read_text());cfg['landscapePath']=str(P/'inputs/candidate/current-whole511-398-B008.inactive.json');cfg['semanticKindLedgerPath']=str(P/'inputs/candidate/current511.semantic-kinds.inactive.json');cfg['reviewPath']=output
 path=P/f'positive/current-context-technical-candidates-{i}.normal.config.json';(R/path).write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n');dest=C/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/path,dest)
 run(f'normal-current-P12-technical-input-config-{i}',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+str(path),'--mode=check'])
shutil.copytree(C/P/'checks',D/'checks',dirs_exist_ok=True)
print(json.dumps({'normalMemory12Passed':True,'normalExistingPWholeConfigCount':7,'newScientificPApprovals':0,'activeWrites':0,'strictGain':0}))
