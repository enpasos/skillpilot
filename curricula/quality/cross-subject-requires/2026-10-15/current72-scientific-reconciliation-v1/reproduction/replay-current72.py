# SPDX-License-Identifier: Apache-2.0
"""Replay in a new private work directory. Caller supplies OS-enforced Root RO."""
from pathlib import Path
import argparse,os,subprocess,shutil,json,hashlib
p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--packet',type=Path,required=True);p.add_argument('--work',type=Path,required=True);p.add_argument('--node',type=Path,required=True);a=p.parse_args();R=a.root.resolve();P=a.packet.resolve();W=a.work.resolve();assert not W.exists();W.mkdir(parents=True);C=W/'packet';shutil.copytree(P,C);env={**os.environ,'SCIENCE_REPLAY_ROOT':str(R),'SCIENCE_REPLAY_PACKET':str(C),'SCIENCE_REPLAY_WORK':str(W),'TSX_DISABLE_CACHE':'1','GIT_OPTIONAL_LOCKS':'0'}
shutil.copyfile(C/'ACTUAL-ROOT72-ADOPTION-BINDING.actual.json',W/'ACTUAL-ROOT72-ADOPTION-BINDING.actual.json')
results=[]
for name in ['qualify-and-export.mts','verify-original-native-snapshots.mts','derive-reconciliation.mts']:
 cmd=[str(a.node),'--import',str(R/'app/node_modules/tsx/dist/loader.mjs'),str(C/'reproduction'/name)];r=subprocess.run(cmd,cwd=R/'app',env=env,capture_output=True);(W/(name+'.stdout.txt')).write_bytes(r.stdout);(W/(name+'.stderr.txt')).write_bytes(r.stderr);results.append({'command':cmd,'exitCode':r.returncode});print(name,r.returncode,r.stdout.decode()[:2200],r.stderr.decode()[:2200]);assert r.returncode==0,name
report=json.loads((W/'RECONCILIATION.current72.actual.json').read_text());original=json.loads((P/'RECONCILIATION.current72.actual.json').read_text())
for key in ['all1285CurrentInventoryReviewBindings','qualifiedCurrentAccepted','qualifiedCurrentPending','acceptedUnintegratedGoals','acceptedVsGraphMissingSets','genuineCurrentApprovedPairs','genuineCurrentRejectedPairs']:
 assert report[key]==original[key],key
(W/'REPLAY.actual.json').write_text(json.dumps({'results':results,'exactCurrentBindingsReproduced':1285,'qualifiedAccepted':report['qualifiedCurrentAccepted'],'qualifiedPending':report['qualifiedCurrentPending'],'acceptedUnintegrated':report['acceptedUnintegratedGoals'],'proposedIndexReemitted':False,'RootSelectedUnchanged':True},indent=2)+'\n');print('All current binding and original snapshot replays passed')
