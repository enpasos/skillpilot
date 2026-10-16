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
run('11-P2-current-stock-fingerprints',['node',tsx,str(O/'scripts/write_final_neighbor_P2_stock_FPs.mts'),str(O)])
run('12-P2-stock-positive-profile-check',['node',tsx,str(H/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+f['P2Config']['path'],'--mode=check'])
run('13-final-Native8-closed-preflight',['node',tsx,str(O/'scripts/preflight_final_eight_native_actual_config_and_profiles.mts'),str(O)])
for mode in ['prepare','check']:run('14-final-Native8-'+mode,['node',tsx,str(H/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',f['nativeConfig']['path']])
out=C/'RUN.final-P2-and-single-Native8.actual-completion.json';assert not out.exists();out.write_text(json.dumps({'schemaVersion':1,'actualCommandReceipts':receipts,'allPassed':True,'nativePrepareCalls':1,'nativeCheckCalls':1,'actualBoundedPDFRenders':1,'scope':8,'P2':2,'allEightActualPProfilesPresent':True,'newFullModelFiles':0,'newScienceVotes':0,'newDescriptionRecords':0,'centralRuns':0,'rasterByteCopies':0},ensure_ascii=False,indent=2)+'\n')
