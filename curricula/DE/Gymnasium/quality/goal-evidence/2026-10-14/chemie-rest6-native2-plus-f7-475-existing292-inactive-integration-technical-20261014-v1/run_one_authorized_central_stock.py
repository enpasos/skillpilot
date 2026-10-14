# SPDX-License-Identifier: Apache-2.0
"""One genuine central run after bounded preflight; immutable named receipt."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
O=Path(__file__).resolve().parent
REL=O.relative_to(R)
def now(): return datetime.now(timezone.utc).isoformat()
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

def main():
    receipts=O/'receipts';receipts.mkdir(exist_ok=True)
    lock=receipts/'ACTUAL.current414-rest2-plus-f7-475.central.one-run-started.json'
    config=REL/'config/chemie-current414-rest2-native2-and-f7-475-on-existing292.inactive.config.json'
    assert sha(R/config)==sha(H/config)
    check=json.loads((O/'checks/PREFLIGHT.only-six-new-normal-address-P-A-configs.stock.actual.json').read_text())
    assert check['allPassed']
    assert json.loads((O/'checks/READONLY.exact-preservation-and-additive-selection.peer-technical.json').read_text())['errors']==[]
    argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(config),'--mode=check','--format=json']
    before={str(p):sha(H/p) for p in [Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')]}
    start=now()
    with lock.open('x') as f: json.dump({'startedAtUTC':start,'argv':argv,'cwd':str(H),'configSHA256':sha(R/config),'privateNormalAliasesAtStart':before,'centralRunOrdinalInThisPackage':1},f,indent=2);f.write('\n')
    stdout=receipts/'ACTUAL.current414-rest2-plus-f7-475.central.stock-report.json'
    stderr=receipts/'ACTUAL.current414-rest2-plus-f7-475.central.stderr.txt'
    with stdout.open('xb') as out,stderr.open('xb') as err: p=subprocess.run(argv,cwd=H,stdout=out,stderr=err)
    end=now();after={name:sha(H/name) for name in before}
    receipt={'schemaVersion':1,'startedAtUTC':start,'completedAtUTC':end,'argv':argv,'cwd':str(H),'exitCode':p.returncode,'configPath':str(config),'configSHA256':sha(R/config),'stdoutPath':str(stdout.relative_to(R)),'stdoutSHA256':sha(stdout),'stdoutBytes':stdout.stat().st_size,'stderrPath':str(stderr.relative_to(R)),'stderrSHA256':sha(stderr),'stderrBytes':stderr.stat().st_size,'privateNormalAliasesAtStart':before,'privateNormalAliasesAfter':after,'readOnlyStockRunAliasBytesUnchanged':before==after,'centralRunOrdinalInThisPackage':1,'activeSourceViewRegistryOrGitAdoption':False}
    dump(receipts/'ACTUAL.current414-rest2-plus-f7-475.central.completed-run.json',receipt)
    print(json.dumps(receipt))
    raise SystemExit(p.returncode)

if __name__=='__main__':main()
