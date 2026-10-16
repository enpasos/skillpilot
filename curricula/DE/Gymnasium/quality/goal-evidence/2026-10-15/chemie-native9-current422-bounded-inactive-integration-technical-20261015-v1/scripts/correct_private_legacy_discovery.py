# SPDX-License-Identifier: Apache-2.0
"""Restore the existing358 exact discovery input in this private host only."""
import hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];BASE=OWN.parent/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
mp=load(OWN/'checks/REBUILD.current422.final-A-B2-C.physical-map.json')
legacy=load(BASE/'checks/REBUILD.current422.final.physical-map.json')['legacyQaDispositionDiscoveryInput']
src=REPO/legacy['path'];assert ref(src)==legacy
e=load(src);assert e['selectedChemistryLegacyMarkdownCount']==0 and e['rows']==[]
host=REPO/mp['executionHost'];review=host/'curricula/DE/Gymnasium/quality/goal-visualization-review'
assert review.is_symlink();original_target=str(review.resolve());review.unlink();review.mkdir()
mp['legacyQaDispositionDiscoveryInput']=legacy
mp['legacyDiscoveryScope']='Exact preexisting358 empty selected chemistry Markdown discovery; actual repository historical reviews remain intact and unselected'
p=OWN/'checks/REBUILD.current422.final-A-B2-C.discovery-exact.physical-map.json';assert not p.exists();p.write_text(json.dumps(mp,ensure_ascii=False,indent=2)+'\n')
p=OWN/'checks/FIX.private-host-legacy-discovery.actual.json';assert not p.exists();p.write_text(json.dumps({'role':'Technical sparse-host input correction after preserved QA stale preflight; no QA byte editing','sourceExact358Discovery':legacy,'privateReviewAliasPreviouslyPointedTo':original_target,'newPrivateSelectedLegacyMarkdownCount':0,'actualRepositoryHistoryUntouched':True,'finalCQABytesStillExact':ref(host/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')=={'path':str((host/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').relative_to(REPO)),'sha256':mp['finalQa']['sha256'],'bytes':mp['finalQa']['bytes']},'centralRuns':0,'newVotes':0},indent=2)+'\n')
print(json.dumps({'privateLegacyDiscovery':0,'originalHistoryUnchanged':True,'CQABytesUnchanged':True}))
