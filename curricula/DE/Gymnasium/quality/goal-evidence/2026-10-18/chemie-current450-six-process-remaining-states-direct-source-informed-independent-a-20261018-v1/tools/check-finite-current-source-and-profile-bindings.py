# SPDX-License-Identifier: Apache-2.0
"""Finite source/profile/pin checks for exactly six process goals; no broad evaluator."""
import hashlib,importlib.util,json
from pathlib import Path
R=Path.cwd();O=Path(__file__).resolve().parent.parent;A=O.parent/'chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1'
read=lambda p:json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def verify(p):assert pin(p['path'])==p,p
seal=A/'SEAL.inactive-sixty-pair-source-author.json';assert pin(seal)['sha256']=='d68433c1fe8463b108cc0e0c6a2dcd236915e9ff07af41523fdc3455ca624683'
for p in read(seal)['files']:verify(p)
mat=A/'MATRIX.sixty-current-goal-country-direct-source-author.json';assert pin(mat)['sha256']=='5adaefdc2f0e36b3b080f3229de77d812af42ddcac7a5d37e2057fd7ba24db56'
rows=read(mat);whole=read(A/'INPUT.six-whole-current-goals-and-P.exact.json');cells=read(A/'INPUT.whole-selected-operative-and-new-source-cells.json');mapping=read(A/'CANDIDATE.partial-mapping-contributions.pending-independent-review.json')['mappings']
C=read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');goals={g['id']:g for g in C['goals']};regPath=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');subject=next(s for s in read(regPath)['subjects'] if s['subject']=='chemie');cp=[]
for w in whole:
 gid=w['wholeGoal']['id'];assert goals[gid]==w['wholeGoal'];assert w['configPath'] in subject['positiveEvidenceConfigPaths'];c=read(w['configPath']);assert gid in c['scope']['goalIds'] and c['reviewPath']==w['reviewPath'];native=json.loads(Path(w['reviewPath']).read_text().splitlines()[w['line']-1]);assert native['goalId']==gid and native['profile']==w['wholeProfile'];cp.append({'goalId':gid,'wholeGoalSHA256':digest(goals[gid]),'wholeProfileSHA256':digest(w['wholeProfile']),'activeConfig':pin(w['configPath']),'nativeReview':pin(w['reviewPath']),'line':w['line']})
unique={};new=[];old=[]
for i,x in enumerate(cells):
 sid=x['wholeSourceGoal']['id'];assert sid not in unique;unique[sid]=x;verify(x['primaryPdf']);verify(x['baseExtraction'])
 if x['origin']=='NEW_INACTIVE_ADDITION':
  verify(x['newAdditionFile']);d=read(x['newAdditionFile']['path']);assert next(y for y in d['sourceGoalsToAppend'] if y['id']==sid)==x['wholeSourceGoal'];new.append(sid)
 else:
  d=read(x['baseExtraction']['path']);assert next(y for y in d['sourceGoals'] if y['id']==sid)==x['wholeSourceGoal'];old.append(sid)
used={m['legacyGoalId'] for m in mapping};assert len(rows)==60 and len(mapping)==78 and len(cells)==89 and len(new)==70 and len(old)==19
for m in mapping:
 assert m['matchType']=='partial' and m['legacyGoalId'] in unique
 w=next(x for x in whole if x['wholeGoal']['id']==m['canonicalGoalId']);assert digest(w['wholeGoal'])==m['currentGoalSha256'];assert digest(w['wholeProfile'])==m['currentProfileBodySha256']
assert sum(r['authorDisposition']=='HOLD' for r in rows)==4 and all(r['jurisdiction']=='DE-SN' for r in rows if r['authorDisposition']=='HOLD')
transport=[]
for p in sorted((A/'candidate/extraction-additions').glob('*.json')):
 d=read(p);verify(d['baseExtraction']);base=read(d['baseExtraction']['path']);ids={x['id'] for x in base['sourceGoals']};adds=d['sourceGoalsToAppend'];assert len(base['sourceGoals'])==d['originalSourceGoalCount'];assert len(adds)==d['newCompleteSelectedClauseCount'];assert not ids.intersection(x['id'] for x in adds);assert len(ids)+len(adds)==d['proposedUnionSourceGoalCount'];assert not d['pipelineStatus']['allNewSourceGoalsFullyCovered'];transport.append({'candidate':pin(p),'operativeBase':d['baseExtraction'],'newSourceGoals':len(adds),'baseGoalCount':len(ids),'afterGoalCount':len(ids)+len(adds),'sharedExtractionOnlyNoBindingVote':[x['id'] for x in adds if x['id'] not in used]})
extra=[s for s in new if s not in used];assert len(extra)==12 and all(s.startswith(('he-','nw-')) for s in extra)
drifts=[]
for p in read(A/'BEFOREPINS.actual-normal-and-native-inputs.json'):
 now=pin(p['path'])
 if now!=p:
  assert p['path']=='curricula/DE/Gymnasium/composition-views/chemie/de-bw-lk.view.json',now
  expected=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BB-BE-two-foundation-placement-author-successor-20261018-v1/views/de-bw-lk.view.json');assert Path(p['path']).read_bytes()==expected.read_bytes();drifts.append({'historicalAuthorPin':p,'actualCurrentPin':now,'explanation':'Exact already independently accepted NonBY view successor; unrelated additional targets only. All six selected current process roles are independently recomputed unchanged.'})
proj=read(O/'CHECK.independent-sixty-pairs-twenty-six-current-views.json');assert proj['status']=='PASS'
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);e=[x for x in mod.curriculum_symlink_errors(R) if str(O.relative_to(R)) in x];assert not e
out={'status':'PASS','authorSeal':pin(seal),'matrix':pin(mat),'sixExactActiveWholeCurrentCAndP':cp,'wholeSourceCells':len(cells),'newCompleteSourceCells':len(new),'existingWholeSourceCells':len(old),'partialRelations':len(mapping),'heldPairs':4,'unmappedSharedTwelveIdsNoNewScienceVote':extra,'finiteTransportChecks':transport,'actualBeforePinDriftsLimitedToAcceptedUnrelatedViewSuccessor':drifts,'actualCurrentRegistry':pin(regPath),'currentPureViewPairs':'60/26 PASS,117 target appearances; BW three LK-only','scopedStockSymlinkErrors':e,'normalWrites':0,'newDPAMVVotes':0,'APCompilerBuildRuns':0}
print(json.dumps(out,ensure_ascii=False,indent=2))
