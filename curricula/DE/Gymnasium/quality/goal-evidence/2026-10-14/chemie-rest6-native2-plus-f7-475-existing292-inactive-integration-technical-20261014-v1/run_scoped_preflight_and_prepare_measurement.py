# SPDX-License-Identifier: Apache-2.0
"""Bounded changed-address checks only; never starts a central run."""
import concurrent.futures
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
H = R / 'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
O = B / 'chemie-rest6-native2-plus-f7-475-existing292-inactive-integration-technical-20261014-v1'
T1 = B / 'chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1'
RET = B / 'chemie-f7-475-original-D11-D15-whole-container-current-selection-retention-technical-20261014-v1'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def now(): return datetime.now(timezone.utc).isoformat()
def dump(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_name(p.name+'.tmp')
    tmp.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
    os.replace(tmp,p)

def main():
    # Mirror only generated own outputs; never write sealed common/peer files.
    for source in (H/O/'native-two').rglob('*'):
        if source.is_file():
            target=R/O/'native-two'/source.relative_to(H/O/'native-two')
            if target.exists(): assert sha(target)==sha(source), target
            else:
                target.parent.mkdir(parents=True,exist_ok=True)
                os.link(source,target)
    canonical=read(H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
    qa=read(H/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
    by_id={r['goalId']:r for r in qa['records']}
    rows=[]
    for g in canonical['goals']:
        links=[r for r in g.get('resourceLinks',[]) if r.get('type')=='goal-visualization' and r.get('role')=='primary']
        if not links: continue
        assert len(links)==1,g['id']
        q=by_id[g['id']]
        expected=q['assetSha256'].removeprefix('sha256:')
        if q.get('aiApproved')=='yes': assert q['aiApprovedAssetSha256'].removeprefix('sha256:')==expected,g['id']
        paths={q['canonicalAssetPath'],q['publicAssetPath'],'app/public'+links[0]['url']}
        actual={p:sha(H/p) for p in sorted(paths)}
        assert all(v==expected for v in actual.values()),g['id']
        rows.append({'goalId':g['id'],'expectedActualAndApprovedIfApprovedSHA256':expected,'actualPaths':actual,'AIStatusUnchanged':q.get('aiApproved')})
    prior=read(R/T1/'checks/PREFLIGHT.all-current-selected-QA-canonical-and-public-aliases-against-same-approved-bytes.actual.json')
    assert [r['goalId'] for r in rows]==[r['goalId'] for r in prior['rows']]
    dump(R/O/'checks/PREFLIGHT.all-selected-QA-canonical-and-public-alias-exact-approved-bytes.before-central.actual.json',{'schemaVersion':1,'checkedAtUTC':now(),'status':'PASS','selectedCurrentResourceRowsChecked':len(rows),'rows':rows,'failures':[],'beforeAnyCentralRun':True,'noQAStatusChanged':True})
    central=read(R/O/'config/chemie-current414-rest2-native2-and-f7-475-on-existing292.inactive.config.json')
    subject=central['subjects'][0]
    jobs=[('P2', 'positiveGoalEvidenceReview.ts', O/'config/P2.actual-final-material-images.original-a.normal-alias.config.json'),('A2','semanticAtomicityReview.ts',O/'config/A2.original-genuine-a.normal-alias.config.json')]
    for stem in ['P1-f7','A1-f7','P1-475','A1-475']:
        jobs.append((stem,'positiveGoalEvidenceReview.ts' if stem.startswith('P') else 'semanticAtomicityReview.ts',RET/'config'/f'{stem}.normal-address.future-inactive.config.json'))
    def run(job):
        name,script,config=job
        argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/'+script,'--config='+str(config),'--mode=check']
        start=now();p=subprocess.run(argv,cwd=H,capture_output=True,text=True);end=now()
        out=O/'receipts'/('PREFLIGHT.'+name+'.stock.stdout.txt');err=O/'receipts'/('PREFLIGHT.'+name+'.stock.stderr.txt')
        (R/out).parent.mkdir(parents=True,exist_ok=True);(R/out).write_text(p.stdout);(R/err).write_text(p.stderr)
        receipt={'name':name,'startedAtUTC':start,'completedAtUTC':end,'argv':argv,'cwd':str(H),'exitCode':p.returncode,'stdoutPath':str(out),'stderrPath':str(err),'stdoutSHA256':sha(R/out),'stderrSHA256':sha(R/err)}
        dump(R/O/'receipts'/('PREFLIGHT.'+name+'.actual.json'),receipt)
        return receipt
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(run,jobs))
    dump(R/O/'checks/PREFLIGHT.only-six-new-normal-address-P-A-configs.stock.actual.json',{'schemaVersion':1,'createdAtUTC':now(),'results':results,'allPassed':all(r['exitCode']==0 for r in results),'unchangedM414QA426AndWhole414ModelReceiptsReused':True,'centralRunStarted':False})
    print(json.dumps({'selectedAssets':len(rows),'checks':[{k:r[k] for k in ['name','exitCode']} for r in results],'centralRunStarted':False}))
    assert all(r['exitCode']==0 for r in results)

if __name__=='__main__': main()
