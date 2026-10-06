#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Retain actual current365 terminal receipts in this technical candidate only."""
import json,pathlib,subprocess,sys,time
from datetime import datetime,timezone
ROOT=pathlib.Path.cwd().resolve();OWN=pathlib.Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
tsx=['app/node_modules/.bin/tsx'];step=sys.argv[1]
commands={
 'source-atlas-materialization':tsx+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'],
 'source-atlas-check':tsx+['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','--check'],
 'd-seven-prepare':tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',REL+'/batch.config.json'],
 'd-seven-check':tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',REL+'/batch.config.json'],
 'current42-protection':tsx+['app/scripts/reportDeepUnderstandingRollout.ts','--config='+REL+'/central-current-protection.config.json','--mode=check','--format=json'],
}
commands['d-seven-prepare-physical-images']=commands['d-seven-prepare']
commands['current-original-sources']=tsx+[REL+'/compile-current-original-sources.mts']
commands['current-full-model']=tsx+['app/scripts/buildGoalBookModel.ts',REL+'/book.config.json']
commands['current-original-sources-with-full-model']=commands['current-original-sources']
commands['all365-source-binding-verification']=tsx+[REL+'/verify-source-bindings-365.mts']
assert step in commands and not (OWN/(step+'.actual.receipt.json')).exists(),step
t=time.monotonic();p=subprocess.run(commands[step],cwd=ISO,capture_output=True)
(OWN/(step+'.stdout.txt')).write_bytes(p.stdout);(OWN/(step+'.stderr.txt')).write_bytes(p.stderr)
receipt={'recordedAtUTC':datetime.now(timezone.utc).isoformat(),'argv':commands[step],'cwd':str(ISO),'exitCode':p.returncode,'elapsedSeconds':time.monotonic()-t,'stdoutPath':REL+'/'+step+'.stdout.txt','stderrPath':REL+'/'+step+'.stderr.txt','humanApproval':False,'humanTrial':False,'activeWrites':0,'newScienceApprovalClaimed':False}
(OWN/(step+'.actual.receipt.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'step':step,'exitCode':p.returncode,'elapsedSeconds':receipt['elapsedSeconds']}))
if p.returncode:print(p.stderr.decode()[-3000:]);print(p.stdout.decode()[-3000:])
sys.exit(p.returncode)
