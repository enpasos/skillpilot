#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Default is read-only verification. Parent must review and explicitly apply."""
from pathlib import Path
from datetime import datetime,timezone
import argparse,hashlib,json,shutil,os
ROOT=Path('/home/enpasos/projects/skillpilot')
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-eighteen-current-reviewed-integration-candidate-v2')
OUT=ROOT/OWN
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def path(rel):
 p=ROOT/rel;p.absolute().relative_to(ROOT);assert '..' not in Path(rel).parts
 return p
def verify(expected):
 freeze=OUT/'reviewed-integration-candidate.final.freeze.json';assert sha(freeze)==expected,'Unexpected reviewed candidate freeze'
 for row in read(freeze)['files']:assert sha(path(row['path']))==row['sha256'],row['path']
 plan=read(OUT/'integration-plan.reviewed.json')
 assert not plan['humanApproval'] and not plan['humanTrial'] and not plan['activeApplicationPerformed']
 for proof in plan['requiredFrozenIndependentScientificInputSets']:
  p=path(proof['manifestPath']);assert sha(p)==proof['manifestSHA256']
  for row in read(p)['files']:
   q=Path(row['path']);q=q if q.is_absolute() else path(row['path'])
   if not q.is_file():q=p.parent/row['path']
   assert sha(q)==row['sha256'].removeprefix('sha256:'),q
 for row in plan['explicitReplaceFiles']:
  assert sha(path(row['prospectiveCopyPath']))==row['sha256']
  assert sha(path(row['futureActivePath']))==row['activeSHA256Before'],'Active input changed: '+row['futureActivePath']
 for row in plan['explicitNewAssetAndPromptFiles']:
  assert sha(path(row['immutableReviewedSourcePath']))==row['sha256']
  dst=path(row['futureActivePath']);assert not dst.exists() and row['activeSHA256Before'] is None,'New asset path already occupied: '+str(dst)
 assert sha(path(plan['floorProtection']['policyPath']))==plan['floorProtection']['policySHA256']
 for row in plan['requiredReviewedCheckerCode']:assert sha(path(row['path']))==row['sha256'],'Reviewed native checker code changed: '+row['path']
 for p in plan['immutableNewConfigurationDependencies']:assert sha(path(p['path']))==p['sha256']
 return plan
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--expected-freeze',required=True);ap.add_argument('--apply',action='store_true');ap.add_argument('--backup-dir');args=ap.parse_args()
 plan=verify(args.expected_freeze)
 if not args.apply:
  print(json.dumps({'status':'PASS_read_only_preflight','reviewedCandidateFreezeSHA256':args.expected_freeze,'replaceFiles':len(plan['explicitReplaceFiles']),'newAssetPromptFiles':len(plan['explicitNewAssetAndPromptFiles']),'currentStrict':49,'futureStrict':67,'activeWrites':0}));return
 assert args.backup_dir,'An unused parent-owned backup directory is required for --apply'
 backup=path(args.backup_dir);assert not backup.exists();backup.mkdir(parents=True)
 incoming=[]
 for row in plan['explicitReplaceFiles']:
  dst=path(row['futureActivePath']);saved=backup/'preserved-before'/row['futureActivePath'];saved.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dst,saved)
  assert sha(saved)==row['activeSHA256Before']
  incoming.append((row,path(row['prospectiveCopyPath']),False))
 incoming=[(row,path(row['immutableReviewedSourcePath']),True) for row in plan['explicitNewAssetAndPromptFiles']]+incoming
 # Recheck the entire reviewed input set after backups, before changing any
 # active input. Registry is last in the replacement list.
 verify(args.expected_freeze);applied=[]
 try:
  for row,src,is_new in incoming:
   dst=path(row['futureActivePath']);dst.parent.mkdir(parents=True,exist_ok=True)
   temporary=dst.with_name('.'+dst.name+'.ni-reviewed-integration.tmp');assert not temporary.exists()
   temporary.write_bytes(src.read_bytes());assert sha(temporary)==row['sha256'];os.replace(temporary,dst)
   applied.append({'path':row['futureActivePath'],'sha256':sha(dst),'wasNew':is_new})
 except BaseException:
  for row in reversed(applied):
   dst=path(row['path']);assert sha(dst)==row['sha256'],'Concurrent modification prevents safe rollback'
   if row['wasNew']:dst.unlink()
   else:shutil.copy2(backup/'preserved-before'/row['path'],dst)
  raise
 receipt={'schemaVersion':1,'appliedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewedCandidateFreezeSHA256':args.expected_freeze,'planPath':str(OWN/'integration-plan.reviewed.json'),'planSHA256':sha(OUT/'integration-plan.reviewed.json'),'appliedFiles':applied,'nativeActiveIntegratedReportRequiredBeforeClaimingNetIncrease':True,'fullStatusAndNineFloorsAndLayerAStillRequired':True,'humanApproval':False,'humanTrial':False}
 (backup/'application.actual.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps({'status':'applied_local_inputs_requires_actual_native_integration_checks','appliedFiles':len(applied),'backupDirectory':str(backup.relative_to(ROOT)),'newStrictClosuresClaimed':0}))
if __name__=='__main__':main()
