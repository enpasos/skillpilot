from pathlib import Path
from datetime import datetime,timezone
import argparse,json,hashlib,shutil,subprocess,time

def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 O=Path(__file__).resolve().parents[1];R=next(p for p in O.parents if (p/'AGENTS.md').is_file() and (p/'app').is_dir());config=json.loads((O/'CONFIG.bounded-current4-normal-QA.json').read_text());parser=argparse.ArgumentParser();parser.add_argument('--host',type=Path,default=R/'tmp/chemie-m7-resumed-20261015/energy-four-current-context-independent-V4-normal-host-v1');a=parser.parse_args();H=a.host.resolve();assert H.is_relative_to(R/'tmp');H.mkdir(parents=True,exist_ok=False)
 def verified(entry):
  p=R/entry['path'];assert digest(p)==entry['sha256'];assert p.stat().st_size==entry['bytes'];return p
 def copy(entry,alias):
  source=verified(entry);p=H/alias;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,p)
 for e in config['stockSourceFiles']:copy(e,e['path'])
 (H/'app/node_modules').symlink_to(R/'app/node_modules')
 copy(config['boundedWholeGoals'],config['normalLandscapePath']);copy(config['normalQaCandidate'],config['normalQaPath'])
 for e in config['images']:
  src=verified(e);public=H/'app/public'/e['publicUrl'].lstrip('/');public.parent.mkdir(parents=True,exist_ok=True);public.symlink_to(src);canonical=H/e['path'];canonical.parent.mkdir(parents=True,exist_ok=True);canonical.symlink_to(src)
 probe=H/'current4-hash-and-portable-probe.mts';probe.write_text('''import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {isAiApprovedForCurrentAsset} from './app/src/utils/goalVisualizationQaStatus.ts';
const qa=JSON.parse(readFileSync(process.argv[2],'utf8'));
const portable=JSON.parse(readFileSync(process.argv[3],'utf8'));
const conf=JSON.parse(readFileSync(process.argv[4],'utf8'));
assert.equal(qa.records.length,4);assert.deepEqual(qa.records.map((r:any)=>r.goalId).sort(),[...conf.expectedCurrentApprovedIds].sort());
for(const r of qa.records){assert.equal(isAiApprovedForCurrentAsset(r),true);assert.equal(isAiApprovedForCurrentAsset({...r,assetSha256:'sha256:'+'0'.repeat(64)}),false);assert.equal(r.humanApproved,'no');assert.equal(r.humanReviewedAt,null);assert.equal(r.humanReviewer,'');}
assert.equal(portable.source.canonicalRoot,conf.wholeCurrentCanonical560.path.split('/').slice(0,-1).join('/'));
assert.equal(portable.source.publicAssetRoot,qa.source.publicAssetRoot);
portable.source.canonicalRoot=qa.source.canonicalRoot;
for(const r of portable.records){assert.equal(r.landscapePath,conf.wholeCurrentCanonical560.path);r.landscapePath=conf.normalLandscapePath;}
assert.deepEqual(portable,qa);
console.log('V4 current4: exact asset-hash approvals, changed hashes rejected, no human approval, portable/source-root CAS exact.');
''')
 commands=[[str(R/'app/node_modules/.bin/tsx'),str(H/'app/scripts/generateGoalVisualizationQaLedgers.ts'),'--subject=chemie','--check'],[str(R/'app/node_modules/.bin/tsx'),str(probe),str(R/config['normalQaCandidate']['path']),str(R/config['portableQaCandidate']['path']),str(O/'CONFIG.bounded-current4-normal-QA.json')]];receipts=[]
 for i,cmd in enumerate(commands,1):
  started=datetime.now(timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(cmd,cwd=H,capture_output=True,text=True);log=O/'checks'/('COMMAND.'+str(i)+'.normal-V4.actual.txt');log.write_text('argv: '+json.dumps(cmd)+'\ncwd: '+str(H)+'\nexitCode: '+str(p.returncode)+'\nstdout:\n'+p.stdout+'\nstderr:\n'+p.stderr);receipts.append({'argv':cmd,'cwd':str(H.relative_to(R)),'startedAtUTC':started,'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'output':{'path':str(log.relative_to(R)),'sha256':digest(log)}});print(p.stdout,end='');print(p.stderr,end='')
  if p.returncode:
   (O/'checks/COMMANDS.normal-V4.actual.json').write_text(json.dumps({'commands':receipts},indent=2)+'\n');raise SystemExit(p.returncode)
 size=sum(p.stat().st_size for p in H.rglob('*') if p.is_file() and not p.is_symlink());assert size<config['maxRegularHostBytes'];receipt={'commands':receipts,'regularHostBytes':size,'stockSourceFilesVerified':len(config['stockSourceFiles']),'canonicalAndPublicInputsUnchanged':True,'ordinaryGoalScope':4,'extraTests':0,'centralExecuted':False,'activeIntegration':False,'role':'Required normal V4 stock ledger and AI-hash/portable CAS checks only'};(O/'checks/COMMANDS.normal-V4.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'regularHostBytes':size,'exitCodes':[r['exitCode'] for r in receipts]}))
if __name__=='__main__':main()
