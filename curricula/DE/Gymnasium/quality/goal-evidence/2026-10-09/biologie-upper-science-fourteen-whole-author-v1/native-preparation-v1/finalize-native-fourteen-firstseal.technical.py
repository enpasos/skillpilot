# SPDX-License-Identifier: Apache-2.0
"""Portable actual native14 first seal; no independent scientific or human approval."""
import hashlib,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(p,x):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
seal=OWN/'fourteen-native-technical-author.first.freeze.json';assert not seal.exists()
entryPath=OWN/'neutral-fourteen-native-independent-review.entry.json';entry=load(entryPath)
for name in ['ordinary-capsule-public-loader.actual.json','ordinary-capsule-positive14.actual-terminal.json','native14-schema-P-and-current-guard.actual-terminal.json']:
 assert load(OWN/'checks'/name)['exitCode']==0
nativepaths=[OWN/'native-fourteen/book.html',OWN/'native-fourteen/book.pdf',OWN/'native-fourteen/bundle/book.html',OWN/'native-fourteen/bundle/book.pdf']
indexproof=[]
for p in nativepaths:
 relative=p.relative_to(ROOT).as_posix();r=subprocess.run(['git','show',':'+relative],cwd=ROOT,capture_output=True)
 assert r.returncode==0 and r.stdout==p.read_bytes(),relative
 indexproof.append(dict(**bind(p),indexSha256='sha256:'+hashlib.sha256(r.stdout).hexdigest(),indexBytes=len(r.stdout)))
write(OWN/'checks/four-native-originals.git-index-bytes.actual.json',dict(schemaVersion=1,role='actual Root-targeted stage and byte equality; no ignore/validator rule change',entries=indexproof,commitPerformed=False,pushPerformed=False,exitCode=0))
requiredPaths=sorted(set([b['path'] for b in entry['inputBindings']]+[p.relative_to(ROOT).as_posix() for p in OWN.rglob('*') if p.is_file()]))
assert all((ROOT/p).is_file() and not (ROOT/p).is_symlink() for p in requiredPaths)
ignored=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input='\n'.join(requiredPaths)+'\n',capture_output=True,text=True)
assert ignored.returncode==1 and not ignored.stdout,ignored.stdout
write(OWN/'checks/required-inputs-and-outputs.portability.actual.json',dict(schemaVersion=1,checkedRequiredPaths=len(requiredPaths),ordinaryCheckIgnoreExitCode=ignored.returncode,ignoredRequiredPaths=[],symlinksCreated=0,gitStagingScope='Root only four genuine actual native original HTML/PDF copies',ignoreOrValidatorRuleChanges=False,exitCode=0))
for b in load(OWN.parent/'whole-fourteen-science-author.first.freeze.json')['files']:assert bind(ROOT/b['path'])==b
for b in load(OWN.parent/'remediation-v2/targeted-whole-remediation.first.freeze.json')['files']:assert bind(ROOT/b['path'])==b
entry.update(dict(firstFreezePath=seal.relative_to(ROOT).as_posix(),technicalChecks=[bind(p) for p in sorted((OWN/'checks').glob('*.json'))],ordinarySourceAtlasOutputArchiveMapPath=REL+'/source-atlas/book-local-output-paths.actual.json',activeStrictBaseline={'biologieStrictCompleted':262,'currentCurricularAtomicGoals':394,'source':'actual current Root-central checkpoint; no central run in this candidate preparation'},currentPStatusCounts={'approved':0,'needs_human_review':14,'rejected':0},currentVIndependentApprovalCount=0,currentDIndependentApprovalCount=0,predictedNetStrictGainAfterActualApprovalAndProtectedIntegration=14,predictionIsActualClosure=False,technicalBlockers=[],genuineTargetedEN1KindAMConfirmation='PENDING',independentScientificBlockers='unknown until genuine independent verdicts',newScientificClosures=0,restoredBindings=0,netStrictGain=0,requiredNextReviews=['two genuine independent whole native D/P reviews including all29 DE/EN cases, exact EN1 fidelity correction, complete69 retained source duties/68 partner roles and precise NI1 original-clause correction','actual full/360/680 scientific and visual PNG reviews of exact selected14 bytes, no approval inferred from generation','genuine targeted semantic-kind/A/M confirmations for EN1 before any current fingerprint adoption','ordinary genuine finding resolution and P/D/V evidence adoption only after independent paired verdicts','protected Root integration and stable complete central/dependent Layer-A checks; separate human gates unchanged']))
entryPath.write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n')
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p!=seal]
write(seal,dict(schemaVersion=1,role='first immutable actual inactive native/source/P technical candidate, not a review',createdAt=datetime.now(timezone.utc).isoformat(),entry=bind(entryPath),fileCount=len(files),files=files,actualIndependentScientificResults=0,actualHumanReviews=0,activeWrites=[],actualNewScientificClosures=0,actualRestoredBindings=0,actualStrictGain=0))
for b in load(seal)['files']:assert bind(ROOT/b['path'])==b
print(json.dumps({'neutralEntry':bind(entryPath),'firstNativeFreeze':bind(seal),'files':len(files),'actualNative14':True,'whole394Frame':True,'independentResults':0,'strictGain':0}))
