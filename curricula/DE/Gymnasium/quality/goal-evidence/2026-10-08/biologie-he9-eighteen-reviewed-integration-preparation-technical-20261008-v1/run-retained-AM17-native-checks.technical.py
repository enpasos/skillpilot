"""Actual scoped native A/M checks of retained rows; no scientific review."""
from pathlib import Path
import json, subprocess, datetime
from concurrent.futures import ThreadPoolExecutor
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def run(job):
 name,script,config,extra=job
 argv=['node','app/node_modules/tsx/dist/cli.mjs',script,'--config='+str((OWN/'retained-AM'/config).relative_to(ROOT)),'--mode=check']+extra
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(argv,capture_output=True,text=True)
 receipt={'role':'actual retained scoped standard native check','argv':argv,'startedAt':start,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualTerminalExitCode':r.returncode,'actualStdout':r.stdout,'actualStderr':r.stderr,'newScienceReview':False,'activeWrites':0,'strictGain':0}
 p=OWN/'checks'/f'{name}.native-terminal.actual.json';assert not p.exists();p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');return receipt
jobs=[('A17','app/scripts/semanticAtomicityReview.ts','A17.exact-native.config.json',[]),('M23-cards17-views8','app/scripts/memoryCardReview.ts','M23-cards17-views8.exact-native.config.json',['--write-report'])]
with ThreadPoolExecutor(max_workers=2) as pool:receipts=list(pool.map(run,jobs))
print(json.dumps({'actualExitCodes':{r['argv'][2]:r['actualTerminalExitCode'] for r in receipts},'newScienceReview':False,'activeWrites':0}));raise SystemExit(0 if all(r['actualTerminalExitCode']==0 for r in receipts) else 1)
