# SPDX-License-Identifier: Apache-2.0
"""Exactly one stock central report after finite independent scientific selections."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import time

REPO=Path.cwd();R=Path(__file__).resolve().parents[1].relative_to(REPO);E=R.parent
D15=E/'chemie-carbonyl15-native-paired12-with-three-open-technical-20261015-v1'
D16=E/'chemie-equilibrium16-final-native-original-pair-technical-20261015-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def put(p,d):
    assert not p.exists(),p
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert not (R/'checks/CENTRAL.exactly-one.started-marker.json').exists()
inputs={
    'D15Selector':D15/'SELECTION.finite-original-D15-paired12.json',
    'D15Seal':D15/'FILES.finite-paired12-technical.seal.json',
    'D16Selector':D16/'SELECTION.final-original-independent-D16-pair.technical.json',
    'D16Seal':D16/'FILES.finite-original-D16-pair-technical.seal.json',
}
for k,p in inputs.items():
    if k.endswith('Seal'):
        for f in read(p)['files']:
            assert sha(f['path'])==f['sha256'] and Path(f['path']).stat().st_size==f['bytes'],f['path']
source15=read(inputs['D15Selector']);source16=read(inputs['D16Selector'])
assert len(source15['resolvedGoalIds'])==12 and len(source15['deferredGoalIds'])==3
assert source16['keepCurrent']==10 and source16['deferred']==6
for f in source15['successfulActualCommands']+source16['actualSixStockCommands']+[source16['actualPortableCheck']]:
    assert sha(f['path'])==f['sha256'] and read(f['path'])['exitCode']==0
pf=read(R/'checks/PREFLIGHT.affected-normal-P27-A31-M422-QA438.actual.json')
assert len(pf['results'])==9 and all(x['exitCode']==0 for x in pf['results'] if not x['name'].startswith('QA438'))
assert read(R/'checks/QA.normalized-recheck.command.actual.json')['exitCode']==0
sel=read(R/'checks/SELECTION.actual-conservative-P-and-A.json')
assert len(sel['PExplicitlyNotSelectedGoalIds'])==4
cfg=read(R/'config/central.current422.prepared-awaiting-D16.inactive.config.json')
cfg['subjects'][0]['resolutionIndexPaths'] += [str(D15/'native15/resolution-index.json'),str(D16/'native16/resolution-index.json')]
final=R/'config/central.current422.carbonyl15-equilibrium16.inactive.final.config.json';put(final,cfg)
mp=read(R/'checks/REBUILD.current422.prepared.physical-map.json')
mp['fullCentralAllowed']=True;mp['finalCentralConfig']=bind(final)
mp['actualReadyInputs']={k:bind(p) for k,p in inputs.items()}
finalMap=R/'checks/REBUILD.current422.final.physical-map.json';put(finalMap,mp)
host=REPO/mp['executionHost']
for f in mp['stockPhysicalModules']:assert sha(host/f['path'])==f['sha256']
for a in mp['aliases']:assert sha(host/a['normalHostAlias'])==a['physicalRepositorySource']['sha256']
for f in read(R/'checks/PROTECTED697.actual-before.json')['files']:assert sha(f['path'])==f['sha256']
ready=R/'checks/READY.actual-final-inputs.one-central.json'
put(ready,{'schemaVersion':1,'role':'Actual final finite scientific selections and completed affected checks; authorize exactly one central run',
    'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputs':{k:bind(p) for k,p in inputs.items()},
    'finalCentralConfig':bind(final),'physicalMap':bind(finalMap),'DResolvedSelected':22,'DDeferredPreserved':9,
    'genuinePSelected':27,'genuineASelected':31,'genuinePDesignHoldsPreserved':sel['PExplicitlyNotSelectedGoalIds'],
    'M':'Genuine final138 M1 plus exact421 prior rows, whole422/10views pass',
    'V':'Existing current final138 and new Pourbaix V approvals,438 whole rows unchanged through stock sorting',
    'allAffectedChecksPass':True,'protected697BeforeExact':True,'allowedFullCentralRuns':1,'newScientificVotes':0,
    'activeIntegration':False,'HumanApproval':False,'M7Grant':False})
out=R/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json'
err=R/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stderr.actual.txt'
receipt=R/'checks/CENTRAL.exactly-one.command.actual.json'
assert not any(p.exists() for p in (out,err,receipt))
argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+str(final),'--format=json']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
put(R/'checks/CENTRAL.exactly-one.started-marker.json',{'argv':argv,'cwd':str(host.relative_to(REPO)),'startedAtUTC':start,'actualFullCentralRunNumber':1,'maxAuthorizedRuns':1,'ready':bind(ready)})
with out.open('wb') as o,err.open('wb') as e:p=subprocess.run(argv,cwd=host,stdout=o,stderr=e)
put(receipt,{'argv':argv,'cwd':str(host.relative_to(REPO)),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'actualFullCentralRunCountThisPacket':1,
    'stdoutJsonPath':str(out),'stdoutSha256':sha(out),'stderrRawPath':str(err),'stderrSha256':sha(err),
    'unmodifiedStockFullCentral':True,'newScientificVotes':0,'activeIntegration':False,'M7Grant':False})
print(json.dumps(read(receipt)),flush=True)
s=read(out)['subjects'][0]
print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
assert p.returncode==0 and len(s['requiredChecks'])==6 and all(c['status']=='pass' for c in s['requiredChecks']) and not s['issues']
