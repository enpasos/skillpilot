import ast
import datetime
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
REPO = next(p for p in OUT.parents if (p/'AGENTS.md').is_file())

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def bind(p):
    return {'path':p.relative_to(REPO).as_posix(),'sha256':digest(p),'bytes':p.stat().st_size}

def write(p,x):
    with p.open('x') as f:
        f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

s=json.loads((OUT/'NORMAL.assigned-round-a.selector.json').read_text())
common=['--bundle',s['bundle']['path'],'--input',s['input']['path'],'--campaign',s['campaign']['path']]
commands=[('stock-round-a-batch',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaign.ts',*common,
    '--run',s['run']['path'],'--batch-input',s['batchInput']['path'],'--records',s['records']['path']]),
    ('stock-round-a-campaign',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts',*common,
    '--batches-dir',(OUT/'round-a/batches').relative_to(REPO).as_posix(),
    '--results-dir',(OUT/'round-a/results').relative_to(REPO).as_posix()])]
receipts=[]
for name,cmd in commands:
    start=datetime.datetime.now(datetime.timezone.utc).isoformat()
    run=subprocess.run(cmd,cwd=REPO,capture_output=True,text=True)
    (OUT/'checks'/f'{name}.stdout.actual.txt').write_text(run.stdout)
    (OUT/'checks'/f'{name}.stderr.actual.txt').write_text(run.stderr)
    receipts.append({'name':name,'command':cmd,'startedAt':start,
        'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':run.returncode,
        'stdout':bind(OUT/'checks'/f'{name}.stdout.actual.txt'),
        'stderr':bind(OUT/'checks'/f'{name}.stderr.actual.txt')})
    print(name,run.returncode,run.stdout.strip(),run.stderr.strip(),flush=True)
    assert run.returncode==0,name
write(OUT/'checks/VALIDATION.normal-assigned-round-a.actual.json',{'commands':receipts,'normalHelpersUnmodified':True,'onlyAssignedRoundA':True})

spec=importlib.util.spec_from_file_location('normal_schema_portability',REPO/'scripts/validate_schemas.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(REPO)
prefix=OUT.relative_to(REPO).as_posix()+'/'
own_errors=[e for e in errors if e.startswith(prefix)]
write(OUT/'checks/PORTABILITY.normal-curriculum-symlink-gate.actual.json',
    {'normalFunction':'scripts/validate_schemas.py:curriculum_symlink_errors','repositoryErrors':errors,
     'ownErrors':own_errors,'ownSymlinks':[p.relative_to(REPO).as_posix() for p in OUT.rglob('*') if p.is_symlink()]})
assert not own_errors

json_files=[];jsonl_files=[];python_files=[]
for p in sorted(OUT.rglob('*')):
    if p.suffix=='.json':
        json.loads(p.read_text());json_files.append(p.relative_to(REPO).as_posix())
    elif p.suffix=='.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():json.loads(line)
        jsonl_files.append(p.relative_to(REPO).as_posix())
    elif p.suffix=='.py':
        ast.parse(p.read_text());python_files.append(p.relative_to(REPO).as_posix())
write(OUT/'checks/JSON-AST.full-written-files.actual.json',
      {'parsedJSON':json_files,'parsedJSONL':jsonl_files,'parsedPythonAST':python_files,'errors':[]})
first=OUT/'FIRST.original-independent-D13-science.json'
assert digest(first)==s['FIRST']['sha256']
prep=OUT.parent/'chemie-bw-lk-memory-support-current422-native13-context-preparation-technical-root-20261015-v1'
original_seal=json.loads((prep/'FILES.finite-native-preparation.seal.json').read_text())
for z in original_seal['files']:
    p=REPO/z['path'];assert digest(p)==z['sha256'] and p.stat().st_size==z['bytes']
write(OUT/'NEUTRAL.final-independent-a-D13.json',
    {'schemaVersion':1,'role':'Finite independent D13 context review A, normal checks complete',
     'normalSelector':bind(OUT/'NORMAL.assigned-round-a.selector.json'),
     'firstScience':bind(first),'FIRSTSeal':s['FIRSTSeal'],'decisionCounts':{'keep':13},
     'readReceipt':s['readReceipt'],'normalBatchExit':0,'normalCampaignExit':0,
     'ownNormalPortabilityErrors':0,'repositoryNormalPortabilityErrorCount':len(errors),
     'actualSeenPages':list(range(1,16)),'preparationPayload58Unchanged':True,
     'newStrictClosures':0,'newPAMVVotes':0,'sourceCourseHoldsCleared':False,
     'activeIntegration':False,'humanApproval':False,'humanTrial':False})
payload=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
write(OUT/'FILES.finite-independent-a.seal.json',
      {'schemaVersion':1,'role':'Final finite original independent A payload seal; excludes this seal only',
       'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
       'payloadFileCount':len(payload),'payloadBytes':sum(x['bytes'] for x in payload),'files':payload})
print(json.dumps({'finiteFiles':len(payload),'finiteBytes':sum(x['bytes'] for x in payload),
    'normalSelector':digest(OUT/'NORMAL.assigned-round-a.selector.json'),
    'finiteSeal':digest(OUT/'FILES.finite-independent-a.seal.json'),
    'ownPortabilityErrors':len(own_errors),'repositoryPortabilityErrors':len(errors)}),flush=True)
