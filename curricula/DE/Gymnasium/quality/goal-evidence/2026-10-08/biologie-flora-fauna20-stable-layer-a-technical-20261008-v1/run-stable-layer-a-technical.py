# SPDX-License-Identifier: Apache-2.0
"""Capture standard technical checks; only generated QA status/inventory may change."""
from pathlib import Path
from datetime import datetime,timezone
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,subprocess,sys,time

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
ACTIVE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-reviewed-active-integration-root-v1'
PREP=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-reviewed-integration-preparation-technical-20261008-v1'
EXPECTED='ac2c3a825e48c4392364e9f3bd6abc9c0bbbf7040880f746c7fa49bd16426493'
read=lambda p:json.loads(p.read_text())
rel=lambda p:str(p.relative_to(ROOT))
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
bind=lambda p:{'path':rel(p),'sha256':hashfile(p),'bytes':p.stat().st_size}
now=lambda:datetime.now(timezone.utc).isoformat()
def write(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def copy(p,name):
    q=OWN/'exact-inputs'/name;q.parent.mkdir(parents=True,exist_ok=True)
    if q.exists():
        assert q.read_bytes()==p.read_bytes(),name
        return q
    with q.open('xb') as f:f.write(p.read_bytes())
    return q
def run(label,argv):
    print('START '+label,flush=True);start=now();clock=time.monotonic()
    result=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True)
    for suffix,data in [('stdout',result.stdout),('stderr',result.stderr)]:
        with (OWN/(label+'.'+suffix+'.actual.txt')).open('x') as f:f.write(data)
    receipt={'label':label,'argv':argv,'cwd':'.','startedAt':start,'completedAt':now(),'elapsedSeconds':time.monotonic()-clock,'exitCode':result.returncode,
        'stdout':bind(OWN/(label+'.stdout.actual.txt')),'stderr':bind(OWN/(label+'.stderr.actual.txt')),'newScientificReview':False,'humanApproval':False}
    write(OWN/(label+'.terminal.actual.json'),receipt)
    print('END '+label+' exit='+str(result.returncode),flush=True)
    return result

canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert hashfile(canonical)==EXPECTED
phase=sys.argv[1]
if phase=='prepare':
    canon_snapshot=copy(canonical,'active-biology-canonical.exact.json')
    delta=read(ACTIVE/'exact-current-strict-plus20-delta.actual.json')
    report_path=ACTIVE/'active-after-flora20-central.actual.json';report=read(report_path)
    assert delta['centralExitCode']==0 and delta['blockingIssueCount']==report['blockingIssueCount']==0
    assert hashfile(report_path)==delta['centralReportSha256']
    assert delta['afterStrict']==174 and delta['currentDenominator']==391 and delta['netStrictGain']==20
    assert delta['newScientificClosures']==20 and delta['restoredBindingsOnlyClosures']==0 and delta['lostStrictGoalIds']==[]
    copy(report_path,'completed-central-report.exact.json');copy(ACTIVE/'exact-current-strict-plus20-delta.actual.json','completed-current-ID-delta.exact.json')
    copy(ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json','nine-maturity-floors-before.exact.json')
    copy(ROOT/'docs/legal/ai-transparency-inventory.json','inventory-before.exact.json')
    copy(ROOT/'docs/qa-ci/status/curriculum-quality-status.json','curriculum-status-before.exact.json')
    qa=read(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');by_qa={r['goalId']:r for r in qa['records']}
    asset_rows=read(PREP/'candidate/exact-selected-asset-provenance-and-paired-machine-approval.technical.json')['rows']
    ids=set(delta['newStrictGoalIds']);assert len(ids)==20 and {r['goalId'] for r in asset_rows}==ids
    by_goal={g['id']:g for g in read(canon_snapshot)['goals']};bindings=[]
    for row in asset_rows:
        gid=row['goalId'];expected=row['selectedRaster']['sha256'].removeprefix('sha256:')
        selected=ROOT/row['selectedRaster']['path'];assert hashfile(selected)==expected
        url=next(r['url'] for r in by_goal[gid]['resourceLinks'] if r['type']=='goal-visualization')
        front=ROOT/row['targetPublicPath'];source=ROOT/row['targetCanonicalPath']
        backend=ROOT/'backend/src/main/resources/static'/url.lstrip('/')
        for p in [source,front,backend]:assert hashfile(p)==expected
        q=by_qa[gid];assert q['assetSha256'].removeprefix('sha256:')==expected
        assert q['aiApproved']=='yes' and q['aiApprovedAssetSha256'].removeprefix('sha256:')==expected
        bindings.append({'goalId':gid,'url':url,'exactHistoricalSelectedImage':bind(selected),'currentCanonicalImage':bind(source),'currentFrontendImage':bind(front),'currentBackendImage':bind(backend),'sameBytes':True,'existingMachineApprovalBound':True,'newScienceJudgement':False})
    old_by={g['id']:g for g in read(ACTIVE/'before/canonical.json')['goals']}
    old_urls={r['url'] for g in old_by.values() for r in g.get('resourceLinks',[]) if r['type']=='goal-visualization'}
    current_urls={r['url'] for g in by_goal.values() for r in g.get('resourceLinks',[]) if r['type']=='goal-visualization'}
    assert current_urls-old_urls=={r['url'] for r in bindings} and not old_urls-current_urls
    write(OWN/'actual-exact-new20-triple-copy-and-approval-bindings.technical.json',{'recordedAt':now(),'rows':bindings,'exactNewActiveUrls':20,'lostOldUrls':0,'newScientificReviews':0,'machineOnly':True,'humanApproval':False})
    result=run('inventory-standard-emit-layer-a-patch',['node','scripts/check_ai_transparency_inventory.mjs','--emit-layer-a-patch'])
    assert result.returncode==0,result.stderr
    plus=[line[1:] for line in result.stdout.splitlines() if line.startswith('+')]
    patched=json.loads('\n'.join(plus))
    before=read(OWN/'exact-inputs/inventory-before.exact.json')
    allowed={'goalVisualizations.count','goalVisualizations.fileExtensions.png','goalVisualizations.providerCounts','goalVisualizations.c2paStructure.detected','goalVisualizations.c2paStructure.notDetectedUrls'}
    def differences(a,b,prefix=''):
        if isinstance(a,dict) and isinstance(b,dict):
            out=[]
            for k in sorted(set(a)|set(b)):
                label=prefix+'.'+k if prefix else k
                if k not in a or k not in b:out.append(label)
                else:out.extend(differences(a[k],b[k],label))
            return out
        return [] if a==b else [prefix]
    fields=differences(before,patched)
    assert all(f.startswith('artifactClasses.') and any(f.removeprefix('artifactClasses.')==k or f.removeprefix('artifactClasses.').startswith(k+'.') for k in allowed) for f in fields),fields
    a=before['artifactClasses']['goalVisualizations'];b=patched['artifactClasses']['goalVisualizations']
    assert a['count']==1863 and b['count']==1883 and b['fileExtensions']['png']-a['fileExtensions']['png']==20
    assert b['fileExtensions']['jpg']==a['fileExtensions']['jpg']
    provider_delta={k:b['providerCounts'].get(k,0)-a['providerCounts'].get(k,0) for k in set(a['providerCounts'])|set(b['providerCounts'])}
    assert sum(provider_delta.values())==20 and all(v>=0 for v in provider_delta.values())
    without_before=set(a['c2paStructure']['notDetectedUrls']);without_after=set(b['c2paStructure']['notDetectedUrls'])
    assert not without_before-without_after and without_after-without_before <= {r['url'] for r in bindings}
    write(OWN/'reviewed-standard-layer-a-patch.exact-delta.json',{'recordedAt':now(),'patch':bind(OWN/'inventory-standard-emit-layer-a-patch.stdout.actual.txt'),
        'inventoryBefore':bind(OWN/'exact-inputs/inventory-before.exact.json'),'changedFields':fields,'goalVisualizationsBefore':1863,'goalVisualizationsAfter':1883,
        'exactNew20PngUrls':[r['url'] for r in bindings],'providerDeltas':{k:v for k,v in provider_delta.items() if v},'notDetectedUrlAdditions':sorted(without_after-without_before),
        'canonicalGoalAndLandscapeCountsUnchanged':True,'policiesRightsAndHumanReviewsUnchanged':True,'applyStillPending':True,'humanApproval':False})
elif phase=='status':
    result=run('regenerate-current-curriculum-status',['app/node_modules/.bin/tsx','app/scripts/generateCurriculumQualityStatus.ts'])
    assert result.returncode==0,result.stdout+result.stderr
    result=run('nine-protected-maturity-floors',['app/node_modules/.bin/tsx','app/scripts/checkCurriculumMaturityFloors.ts'])
    assert result.returncode==0,result.stdout+result.stderr
elif phase=='remaining':
    checks=[('normal-ai-transparency-inventory',['node','scripts/check_ai_transparency_inventory.mjs']),
        ('full-validate-schemas',['python','scripts/validate_schemas.py']),
        ('portable-symlink-regression-fixtures',['python','scripts/test_validate_schemas_symlinks.py']),
        ('actual-committable-curriculum-symlinks',['python','-c',"import sys,json;sys.path.insert(0,'scripts');import validate_schemas;e=validate_schemas.curriculum_symlink_errors();print(json.dumps({'errors':e,'errorCount':len(e),'standardAPI':'curriculum_symlink_errors'}));sys.exit(bool(e))"]),
        ('existing-local-ai-transparency-artifact',['node','scripts/verify_ai_transparency_artifact.mjs','backend/src/main/resources/static'])]
    with ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(lambda item:run(*item),checks))
    assert all(r.returncode==0 for r in results),[(label,r.returncode) for (label,_),r in zip(checks,results)]
else:raise ValueError(phase)
