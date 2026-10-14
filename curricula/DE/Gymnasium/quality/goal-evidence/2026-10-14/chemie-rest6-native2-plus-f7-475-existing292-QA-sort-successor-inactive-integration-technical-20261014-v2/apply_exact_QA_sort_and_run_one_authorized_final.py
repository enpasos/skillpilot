# SPDX-License-Identifier: Apache-2.0
"""Apply only genuine stock QA ordering, then one explicitly authorized final run."""
import copy
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
O=Path(__file__).resolve().parent
REL=O.relative_to(R)
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OLD=B/'chemie-rest6-native2-plus-f7-475-existing292-inactive-integration-technical-20261014-v1'
QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
def now(): return datetime.now(timezone.utc).isoformat()
def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def dump(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_name(p.name+'.tmp');tmp.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');os.replace(tmp,p)
def immutable_link(source,target):
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists(): assert sha(source)==sha(target),target
    else: os.link(source,target)

def main():
    fail=read(R/OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.completed-run.json')
    assert fail['exitCode']==1
    first=read(R/OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.stock-report.json')
    assert first['blockingIssueCount']==1 and first['subjects'][0]['strictComplete']==0
    assert read(R/OLD/'checks/PREFLIGHT.only-six-new-normal-address-P-A-configs.stock.actual.json')['allPassed']
    oldqa=read(H/QA)
    expected=R/OLD/'checks/EXPECTED.unmodified-stock-QA426.sorted-current-candidate.NOT-APPLIED.json'
    assert sha(expected)=='sha256:4a35c8b90f92463cbe643259b2a3b72cb555cb2036ea04703ffc44d1e159156f'
    newqa=read(expected)
    assert {k:v for k,v in oldqa.items() if k!='records'}=={k:v for k,v in newqa.items() if k!='records'}
    assert {r['goalId']:r for r in oldqa['records']}=={r['goalId']:r for r in newqa['records']}
    assert len(oldqa['records'])==len(newqa['records'])==426
    immutable_link(H/QA,O/'before/QA426.unsorted-first-central-fail.byte-exact.json')
    immutable_link(expected,O/'candidate/QA426.unmodified-stock-sorted-same-whole-records.inactive.json')
    priorconfig=R/OLD/'config/chemie-current414-rest2-native2-and-f7-475-on-existing292.inactive.config.json'
    config=copy.deepcopy(read(priorconfig));config['reportId']='chemie-current414-rest2-native2-f7-475-existing292-qa-sort-final-20261014-v2'
    configpath=REL/'config/chemie-current414-rest2-native2-f7-475-existing292.QA-sort-final.inactive.config.json'
    assert config['subjects']==read(priorconfig)['subjects']
    dump(R/configpath,config)
    immutable_link(R/configpath,H/configpath)
    # Detach private alias with atomic replacement, never write a shared inode.
    alias_tmp=(H/QA).with_name('chemie.qa.rest2-stock-sort.tmp')
    alias_tmp.write_bytes(expected.read_bytes());os.replace(alias_tmp,H/QA)
    delta={'schemaVersion':1,'createdAtUTC':now(),'role':'explicitly-authorized technical successor after exact first central freshness failure','firstGenuineFailRun':bind(R/OLD/'receipts/ACTUAL.current414-rest2-plus-f7-475.central.completed-run.json'),'stockGeneratorSource':bind(H/'app/scripts/generateGoalVisualizationQaLedgers.ts'),'capturedUnmodifiedStockOutput':bind(expected),'beforeQA':bind(O/'before/QA426.unsorted-first-central-fail.byte-exact.json'),'afterQA':bind(O/'candidate/QA426.unmodified-stock-sorted-same-whole-records.inactive.json'),'changedRecordBodies':[],'wholeRecordsPreserved':426,'onlyGoalOrderChanged':True,'allHumanAIApprovalAndScientificFieldsPreserved':True,'allAssetBytesUnchanged':True,'configSubjectsExactPrevious':True,'priorConfig':bind(priorconfig),'newConfig':bind(R/configpath),'newScientificVotes':0,'newReviewsBySorting':0,'activeSourceViewRegistryGitWrites':False}
    dump(O/'CAS.exact-unmodified-stock-QA-order-only.after-first-genuine-fail.json',delta)
    argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie','--check']
    start=now();p=subprocess.run(argv,cwd=H,capture_output=True,text=True);end=now()
    receipts=O/'receipts';receipts.mkdir(exist_ok=True)
    (receipts/'PREFLIGHT.stock-QA-freshness.stdout.txt').write_text(p.stdout)
    (receipts/'PREFLIGHT.stock-QA-freshness.stderr.txt').write_text(p.stderr)
    dump(receipts/'PREFLIGHT.stock-QA-freshness.completed-run.json',{'startedAtUTC':start,'completedAtUTC':end,'argv':argv,'cwd':str(H),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'currentPrivateQA':bind(H/QA)})
    assert p.returncode==0,(p.stdout,p.stderr)
    # Recheck every selected canonical/public file against actual and approved
    # bytes before this final central run. No approval flags are changed.
    byid={r['goalId']:r for r in newqa['records']};rows=[]
    for g in read(H/CAN)['goals']:
        links=[r for r in g.get('resourceLinks',[]) if r.get('type')=='goal-visualization' and r.get('role')=='primary']
        if not links: continue
        assert len(links)==1
        q=byid[g['id']];expected_sha=q['assetSha256']
        if q.get('aiApproved')=='yes': assert q['aiApprovedAssetSha256']==expected_sha
        paths={q['canonicalAssetPath'],q['publicAssetPath'],'app/public'+links[0]['url']}
        actual={x:sha(H/x) for x in sorted(paths)}
        assert all(v==expected_sha for v in actual.values()),g['id']
        rows.append({'goalId':g['id'],'expectedActualAndApprovedIfApprovedSHA256':expected_sha,'actualPaths':actual})
    assert len(rows)==416
    dump(O/'checks/PREFLIGHT.all416-selected-canonical-public-exact-approved-bytes.before-final-central.actual.json',{'schemaVersion':1,'checkedAtUTC':now(),'status':'PASS','selectedCurrentResourceRowsChecked':416,'rows':rows,'failures':[],'noApprovalStatusChanged':True})
    finalargv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(configpath),'--mode=check','--format=json']
    before={str(x):sha(H/x) for x in [CAN,SEM,QA]}
    start=now()
    lock=receipts/'ACTUAL.current414-QA-sort-final.central.one-final-run-started.json'
    with lock.open('x') as f: json.dump({'startedAtUTC':start,'argv':finalargv,'cwd':str(H),'config':bind(R/configpath),'privateNormalAliasesAtStart':before,'originalFailPreserved':True,'centralRunOrdinalInThisSuccessor':1,'centralRunsAcrossOriginalAndAuthorizedSuccessor':2},f,indent=2);f.write('\n')
    stdout=receipts/'ACTUAL.current414-QA-sort-final.central.stock-report.json';stderr=receipts/'ACTUAL.current414-QA-sort-final.central.stderr.txt'
    with stdout.open('xb') as a,stderr.open('xb') as b: p=subprocess.run(finalargv,cwd=H,stdout=a,stderr=b)
    end=now();after={str(x):sha(H/x) for x in [CAN,SEM,QA]}
    receipt={'schemaVersion':1,'startedAtUTC':start,'completedAtUTC':end,'argv':finalargv,'cwd':str(H),'exitCode':p.returncode,'config':bind(R/configpath),'stdout':bind(stdout),'stderr':bind(stderr),'privateNormalAliasesAtStart':before,'privateNormalAliasesAfter':after,'readOnlyStockRunAliasBytesUnchanged':before==after,'centralRunOrdinalInThisSuccessor':1,'centralRunsAcrossOriginalAndAuthorizedSuccessor':2,'activeSourceViewRegistryOrGitAdoption':False}
    dump(receipts/'ACTUAL.current414-QA-sort-final.central.completed-run.json',receipt)
    print(json.dumps(receipt))
    raise SystemExit(p.returncode)

if __name__=='__main__':main()
