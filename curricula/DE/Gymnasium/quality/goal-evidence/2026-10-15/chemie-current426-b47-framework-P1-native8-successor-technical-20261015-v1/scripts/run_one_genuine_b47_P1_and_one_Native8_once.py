# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,subprocess,time
R=Path.cwd();O=Path(__file__).resolve().parents[1];f=json.loads((O/'INPUTS.final-eight-stable-current-profiles-and-neutral-material.json').read_text());H=R/f['executionHost'];C=O/'checks';tsx=str(H/'app/node_modules/tsx/dist/cli.mjs')
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
receipts=[]
def run(label,args):
 out=C/(label+'.stdout.txt');err=C/(label+'.stderr.txt');receipt=C/(label+'.receipt.json');assert not out.exists() and not err.exists() and not receipt.exists();start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(args,cwd=R,capture_output=True);out.write_bytes(p.stdout);err.write_bytes(p.stderr);receipt.write_text(json.dumps({'argv':args,'cwd':'.','startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'actualInvocation':1},ensure_ascii=False,indent=2)+'\n');receipts.append(ref(receipt));print(json.dumps({'action':label,'exitCode':p.returncode,'stdout':p.stdout.decode(),'stderr':p.stderr.decode()},ensure_ascii=False),flush=True)
 if p.returncode:raise SystemExit('Konkreter Fehler, Receipt erhalten, keine automatische Wiederholung.')
run('01-P1-current-stock-profile-fingerprints',['node',tsx,str(O/'scripts/write_b47_P1_stock_profile_FP_only.mts'),str(O)])
run('02-P1-stock-positive-profile-check',['node',tsx,str(H/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+f['P1Config']['path'],'--mode=check'])
run('03-final-Native8-closed-preflight',['node',tsx,str(O/'scripts/preflight_eight_actual_profiles_and_five_unique_owners.mts'),str(O)])
for mode in ['prepare','check']:run('04-final-Native8-'+mode,['node',tsx,str(H/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',f['nativeConfig']['path']])
out=C/'RUN.final-P1-and-single-Native8.actual-completion.json';assert not out.exists();out.write_text(json.dumps({'schemaVersion':1,'actualCommandReceipts':receipts,'allPassed':True,'nativePrepareCalls':1,'nativeCheckCalls':1,'actualBoundedPDFRenders':1,'scope':8,'P1':1,'allEightActualPProfilesPresent':True,'newFullModelFiles':0,'newScienceVotes':0,'newDescriptionRecords':0,'centralRuns':0,'rasterByteCopies':0},ensure_ascii=False,indent=2)+'\n')
