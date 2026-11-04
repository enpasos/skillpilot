"""Actual isolated N5 measurement; finite report, never global completion acceptance."""
from pathlib import Path
import gzip
import hashlib
import json
import subprocess
import time

HERE=Path(__file__).resolve().parent
DATA=HERE/'candidate-data'
JAVA=Path('/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1/bin')
CP=(HERE/'classpath-current.txt').read_text().strip()
R=Path('/home/enpasos/projects/skillpilot')
B=R/'tmp/approach-review-20261101/geometry-four-projection-reuse-native-20261104-v1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(path,value):
    with path.open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def load(name):return json.loads((HERE/name).read_text())
def input_paths():return sorted(str(p.relative_to(DATA)) for p in DATA.rglob('*') if p.is_file())

def main():
    started=time.monotonic()
    write(HERE/'supervisor.started.json',{'pid':__import__('os').getpid(),'timestampUtc':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'dataRoot':str(DATA),'cwd':str(DATA/'backend')})
    classes=load('runtime-class-hashes.json');sources=load('main-source-hashes.json')
    test_sources=load('test-support-source-hashes.json');jars=load('dependency-jar-hashes.json');resources=load('runtime-resource-hashes.json')
    external={**classes,**sources,**test_sources,**jars,**resources}
    inputs={rel:sha(DATA/rel) for rel in input_paths()}
    assert all(not (DATA/rel).is_symlink() for rel in inputs)
    write(HERE/'candidate-input-hashes.json',inputs)
    own_names=['run.py','MatrixFiniteNativeProbe.java','decisions.json','classpath-current.txt','runtime-class-hashes.json','runtime-resource-hashes.json','dependency-jar-hashes.json','main-source-hashes.json','test-support-source-hashes.json','runtime-origin.json','preparation.json','input-manifest.json','independent-am-four-leaves.json','independent-am-final-binding.json','current-root-ci-input-hashes.json','root-copy-input-hashes.json','sampler-class-hashes.json','sampler-reuse.actual.json','snapshot-packaging-independent-review.json','prepare.py']
    own={name:sha(HERE/name) for name in own_names}
    preserved={str(B/'candidate.json.gz'):'2017f30338bdc5efea5124241c937d9cb2b60d4fbded84b35ad83aed6491d4d2',str(B/'candidate-input-hashes.json'):'57a94ebcc308cfc05ce01a0452f91e9cafa6febafcc66c40e028b503cf475cca'}
    sampler={}
    def guard():
        assert input_paths()==sorted(inputs),'Candidate file inventory changed'
        for rel,digest in inputs.items():assert sha(DATA/rel)==digest,rel
        for p,digest in {**external,**preserved}.items():assert sha(Path(p))==digest,p
        for rel,digest in own.items():assert sha(HERE/rel)==digest,rel
        if sampler:assert sampler=={str(p.relative_to(HERE/'classes')):sha(p) for p in (HERE/'classes').rglob('*.class')}
    def run(name,command):
        guard();phase_start=time.monotonic()
        with gzip.open(HERE/(name+'.log.gz'),'xb') as log:
            process=subprocess.Popen(list(map(str,command)),cwd=DATA/'backend',stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
            write(HERE/(name+'.started.json'),{'pid':process.pid,'argv':list(map(str,command)),'cwd':str(DATA/'backend')})
            print(json.dumps({'phase':name,'pid':process.pid}),flush=True)
            for block in iter(lambda:process.stdout.read(65536),b''):log.write(block)
            code=process.wait()
        guard()
        result={'exitCode':code,'seconds':round(time.monotonic()-phase_start,2),'inputCount':len(inputs),'inputMapSha256':sha(HERE/'candidate-input-hashes.json'),'dataRoot':str(DATA),'ownSourceHashes':own,'inputsSourcesClassesJarsResourcesAndNative4Unchanged':True,'runtimeClassCount':len(classes),'mainSourceCount':len(sources),'dependencyJarCount':len(jars),'resourceCount':len(resources)}
        write(HERE/(name+'.execution.json'),result);print(json.dumps({'phase':name,'exitCode':code,'seconds':result['seconds']}),flush=True)
        if code:raise RuntimeError(f'{name} exited {code}')
    sampler.update(load('sampler-class-hashes.json'))
    assert sampler=={str(p.relative_to(HERE/'classes')):sha(p) for p in (HERE/'classes').rglob('*.class')}
    archive=HERE/'candidate.json.gz';assert not archive.exists()
    run('candidate',[JAVA/'java','-Xmx1800m','-cp',str(HERE/'classes')+':'+CP,'com.skillpilot.backend.completion.MatrixFiniteNativeProbe',DATA,archive,HERE/'decisions.json',load('runtime-origin.json')['mainClasses']])
    with gzip.open(archive,'rt') as f:report=json.load(f)
    rows=report['scopes'];assert len(rows)==report['actualScopeCount']==161
    assert report['actualUnionCount']==46
    assert report['measurementRepositoryMutationCount']==report['measurementEventCount']==0
    assert report['inertLearnerUnchanged'] and report['publicFocusClaimsExcluded']
    with gzip.open(B/'candidate.json.gz','rt') as f:before=json.load(f)
    assert {row['scope'] for row in rows}=={row['scope'] for row in before['scopes']}
    upairs={(row['scope'],goal) for row in rows for goal in row['uncoveredTargetGoalIds']}
    epairs={(row['scope'],goal) for row in rows for goal in row['uncoveredEndpointGoalIds']}
    before_pairs={(row['scope'],goal) for row in before['scopes'] for goal in row['uncoveredTargetGoalIds']}
    summary={'status':'ACTUAL_NATIVE5_FINITE_MEASUREMENT_COMPLETE_NOT_GLOBAL_COMPLETION_OR_STAGE_ACCEPTANCE','archiveSha256':sha(archive),'inputMapSha256':sha(HERE/'candidate-input-hashes.json'),'inputCount':len(inputs),'scopeCount':161,'unionCount':46,'failedScopes':report['failedScopes'],'uncoveredTargetUniquePairs':[len({goal for _,goal in upairs}),len(upairs)],'uncoveredEndpointUniquePairs':[len({goal for _,goal in epairs}),len(epairs)],'newUncoveredTargetPairsComparedWithActualNative4':len(upairs-before_pairs),'closedUncoveredTargetPairsComparedWithActualNative4':len(before_pairs-upairs),'unreadyAssessmentScopePairs':sum(len(row['unreadyAssessmentGoalIds']) for row in rows),'duplicateVisibleGoalPathScopes':sum(bool(row['duplicateVisibleGoalPaths']) for row in rows),'duplicateStructureScopes':sum(bool(row['duplicateStructureIds']) for row in rows),'missingVisibleGoalScopePairs':sum(len(row['missingVisibleGoalIds']) for row in rows),'unexpectedVisibleGoalScopePairs':sum(len(row['unexpectedVisibleGoalIds']) for row in rows),'measurementRepositoryMutationCount':report['measurementRepositoryMutationCount'],'measurementEventCount':report['measurementEventCount'],'separateInventoryMockSetupSaves':report['separateInventoryMockSetupSaves'],'separateInventoryMockSetupEvents':report['separateInventoryMockSetupEvents'],'inertLearnerUnchanged':report['inertLearnerUnchanged'],'runtimeClassOrigins':report['runtimeClassOrigins'],'samplerClassHashes':sampler,'samplerSourceSha256':sha(HERE/'MatrixFiniteNativeProbe.java'),'runtimeSourceAndAllInputGuardsPassed':True,'genuineIndependentQA4IncludedBeforeFreeze':True,'originalNative4Unchanged':True,'seconds':round(time.monotonic()-started,2),'doesNotClaimM7StageNormalChecksDeploymentOrRemoteCI':True}
    guard();write(HERE/'candidate.summary.json',summary);write(HERE/'result.json',summary);print(json.dumps(summary),flush=True)

try:main()
except BaseException as error:
    path=HERE/'failure.json'
    if not path.exists():write(path,{'status':'FAILED_ACTUAL_RUN_NO_SUCCESS_CLAIM','type':type(error).__name__,'message':str(error)})
    raise
