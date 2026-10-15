# SPDX-License-Identifier: Apache-2.0
"""Last mutation: serialize the finite payload seal, then STOP."""
import ast,hashlib,json
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
SEAL='FILES.finite-native-preparation.seal.json';assert not (OWN/SEAL).exists()
def bind(p):
 b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
for name in ['checks/PROFILE20.original-bytes-production-helper-on560.actual.json','checks/BOOK321.isolated-before560-after560-identical-P-selection.actual.json','checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json','checks/M422.exact-original-rows-four-author-text-stales.actual.json','checks/ORIGINALS.full-profiles-materials-sources-V-and-sparse-host.actual.json','checks/FINAL.serialization-AST-normal-portability.actual.json']:
 assert json.loads((OWN/name).read_text())['pass'],name
commands=json.loads((OWN/'checks/COMMANDS.actual-native20-stock.json').read_text())['commands'];assert len(commands)==2 and all(r['exitCode']==0 for r in commands)
files=[]
for p in sorted(OWN.rglob('*')):
 assert not p.is_symlink(),p
 if not p.is_file():continue
 data=p.read_bytes()
 if p.suffix=='.json':assert data.endswith(b'\n'),p;json.loads(data)
 elif p.suffix=='.jsonl':
  assert not data or data.endswith(b'\n'),p
  for row in data.splitlines():json.loads(row)
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p))
 files.append(bind(p))
seal={'schemaVersion':1,'role':'Finite technical Native20 preparation seal; no scientific votes, self excluded; STOP after this write','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'neutralSelector':bind(OWN/'NEUTRAL.final-native20-560-current422-preparation.json'),'physicalInputSelector':bind(OWN/'INPUTS.final-native20.physical-exact-selector.json'),'payloadFiles':len(files),'payloadBytes':sum(r['bytes'] for r in files),'files':files,'wholeGoals':560,'ordinaryAtomic':422,'nativeGoalPages':20,'nativeFrontPages':2,'wholeCases':42,'rawE0G0Profiles':20,'blankUnassignedRounds':2,'newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'newStrictClosures':0,'centralExecuted':False,'activeIntegration':False,'sourceCourseHoldsCleared':False,'M7':False,'STOP':True}
(OWN/SEAL).write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'neutralSelector':bind(OWN/'NEUTRAL.final-native20-560-current422-preparation.json'),'finalSeal':bind(OWN/SEAL),'payloadFiles':len(files),'payloadBytes':seal['payloadBytes'],'STOP':True}))
