"""Finite transport verification only; no review/gate execution and no writes."""
import sys
sys.dont_write_bytecode=True
import json,hashlib
from pathlib import Path
O=Path(__file__).resolve().parent;R=next(p for p in O.parents if (p/'AGENTS.md').is_file());S='FILES.finite-carbonyl15-native-technical.seal.json'
def read(p):return json.loads(p.read_text())
def check(a,base):
 p=base/a['path'];assert not Path(a['path']).is_absolute() and p.resolve().is_relative_to(R);assert p.is_file() and p.stat().st_size==a['bytes'];assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],str(p)
seal=read(O/S);actual={p.relative_to(O).as_posix() for p in O.rglob('*') if p.is_file() and p.name!=S};assert actual=={a['path'] for a in seal['files']}
for a in seal['files']:check(a,O)
technical=read(O/'FINAL.carbonyl15-native-preparation.technical.json')
for a in technical['immutableCoreRepositoryInputs']:check(a,R)
json_files=0;jsonl_rows=0
for p in O.rglob('*'):
 if p.is_file() and p.suffix=='.json':read(p);json_files+=1
 elif p.is_file() and p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l);jsonl_rows+=1
commands=read(O/'checks/COMMANDS.normal-native15-prepare-check.json');assert [(c['name'],c['exitCode']) for c in commands['commands']]==[('native15-stock-prepare',0),('native15-stock-check',0)]
for round_ in ['a','b']:
 campaign=read(O/f'native15/round-{round_}/description-review-campaign.json');assert campaign['goalCount']==15 and campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews']
 assert not list((O/f'native15/round-{round_}').rglob('*.results.jsonl')) and not list((O/f'native15/round-{round_}').rglob('*run-manifest*'))
views=read(O/'checks/PDF.actual-render-inspection.technical.json');assert views['physicalPagesActuallySeen']==list(range(1,18))
print(json.dumps({'status':'PASS','role':'Finite transport check only','ownSealedPayloadFiles':len(actual),'ownJSONParsed':json_files,'ownJSONLRowsParsed':jsonl_rows,'immutableCoreInputsExact':len(technical['immutableCoreRepositoryInputs']),'normalPrepareExit':0,'normalCheckExit':0,'actualPDFPagesSeen':17,'blankRounds':2,'newScientificVotes':0,'activeWrites':0}))
