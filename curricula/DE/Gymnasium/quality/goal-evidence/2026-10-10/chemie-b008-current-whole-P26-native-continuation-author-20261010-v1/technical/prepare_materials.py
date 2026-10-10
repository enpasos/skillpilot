# SPDX-License-Identifier: Apache-2.0
"""Exact material preservation for a new inactive whole Chemistry P26 frame."""
from pathlib import Path
from copy import deepcopy
import hashlib,json,shutil,datetime
R=Path('/home/enpasos/projects/skillpilot')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence')
OLD=B/'2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1'
P=B/'2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
D=R/P
assert not (D/'author.final.freeze.json').exists()
D.mkdir(parents=True,exist_ok=True)
bindings=[]
def ref(p):
 p=Path(p);b=(R/p).read_bytes();assert not (R/p).is_symlink()
 return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,d):
 p=P/p;f=R/p;f.parent.mkdir(parents=True,exist_ok=True)
 b=d if isinstance(d,bytes) else (json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()
 if f.exists():assert f.read_bytes()==b,p
 else:f.write_bytes(b)
 return ref(p)
def exact(src,dest):
 src=Path(src);r=ref(src);o=put(Path('inputs')/dest,(R/src).read_bytes())
 assert r['sha256']==o['sha256'];bindings.append({'original':r,'ownExactCopy':o});return o
def verify(x):
 r=ref(x['path']);assert r['sha256']=='sha256:'+x['sha256'].removeprefix('sha256:'),x['path']
 if 'bytes' in x:assert r['bytes']==x['bytes']
 return r
def read(p):return json.loads((R/p).read_text())
def walk(x):
 if isinstance(x,dict):
  if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):yield x
  for v in x.values():yield from walk(v)
 elif isinstance(x,list):
  for v in x:yield from walk(v)
material_refs=[];allentries=[];specs=[];oldrecords=[];finite=[]
for word,n in [('nineteen',19),('seven',7)]:
 sub=OLD/f'{word}-operative-native-preparation-v2'
 materialname={'nineteen':'current-nineteen-thirty-eight-operative-cases-and-whole-profiles.neutral-input.json','seven':'current-seven-fourteen-operative-cases-and-whole-profiles.neutral-input.json'}[word]
 m=read(sub/materialname);assert len(m['entries'])==n
 material_refs.append(exact(sub/materialname,f'{word}-whole-operative-materials.exact.json'))
 allentries.extend(deepcopy(m['entries']))
 s=read(sub/f'P{n}.actual-operative-v2.normal-author-candidate-set.json');assert len(s['goals'])==n
 spec=exact(sub/f'P{n}.actual-operative-v2.normal-author-candidate-set.json',f'{word}-normal-P-candidate-set.exact.json');specs.extend(deepcopy(s['goals']))
 pr=sub/f'P{n}.actual-current-raster.ordinary-author-candidate.review.jsonl'
 exact(pr,f'{word}-normal-P-records.exact.jsonl')
 oldrecords.extend(json.loads(x) for x in (R/pr).read_text().splitlines() if x)
 for k in ['actualElevenFiniteMaterials','finiteElevenOperativeMaterials']:
  if k in m:
   verify(m[k]);index=read(m[k]['path']);exact(m[k]['path'],f'{word}-finite-material-index.exact.json')
   for i,x in enumerate(index['files']):
    verify(x);d=exact(x['path'],Path('finite-materials')/word/Path(x['path']).name)
    finite.append({'wholeOriginal':x,'ownExactCopy':d,'group':word})
 # Whole source archives are normal immutable references; verify every existing
 # binding in these material bodies, without replacing it or re-reviewing it.
 for x in walk(m):
  if (R/x['path']).is_file():verify(x)
ids=[x['goalId'] for x in specs]
assert len(set(ids))==26 and [x['goalId'] for x in allentries]==ids
for m,s,r in zip(allentries,specs,oldrecords):
 assert m['wholePairedNormalV2Profile']==s['profile']==r['profile']
 assert len(m['wholeOperativeCases'])==2
 assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate'
 assert r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1'
put(Path('materials/whole26-current-operative-materials-and-profiles.exact-assembly.json'),{
 'schemaVersion':1,'role':'Exact assembly of whole19 and whole7 operative current material bodies; no new scientific review',
 'goalIds':ids,'wholeProfileCount':26,'wholeWholeCaseCount':52,'entries':allentries,
 'wholeSourceOriginals':material_refs,'all26WholeProfilesAnd52OperativeCasesValueExact':True,
 'allArchivedOriginalCasesAndWorkedTransfersPreserved':True,'finiteMaterialFiles':finite,
 'sourceCoursePlacementHoldsPreserved':True,'currentNativeApproval':False,'actualLearnerPerformance':False,
 'humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})
put(Path('positive/whole26-normal-candidate-set.exact-profile-assembly.json'),{
 'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1',
 'reviewId':'chemie-b008-current-whole-P26-technical-native-author-20261010-v1',
 'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'reviewer':'Technical current native assembly; unchanged previously paired scientific profile bodies, no new independent review',
 'goals':specs})
put(Path('inputs/whole26-original-normal-P-records.exact-assembly.jsonl'),
 ('\n'.join(json.dumps(x,ensure_ascii=False,separators=(',',':')) for x in oldrecords)+'\n').encode())
oldframe=read(OLD/'input/current-whole-source-partner-atomicity-memory-frame.neutral.json')
exact(OLD/'input/current-whole-source-partner-atomicity-memory-frame.neutral.json','whole-original-source-partner-AM-frame.exact.json')
inv=oldframe['originalWhole1646B008SourceDutyInventory'];verify(inv)
exact(inv['path'],'whole-original1646-B008-source-duty-inventory.exact.json')
exact(OLD/'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json','whole-original26-raw-profiles-and52-cases.exact.json')
historical=[
 ('2026-10-09/chemie-b008-current-nineteen-targeted-material-pairing-root-v2/nineteen-whole-materials.targeted-three-independent-pair.actual.json','whole19-genuine-material-pair.exact.json'),
 ('2026-10-09/chemie-b008-seven-targeted-positive-materials-pairing-root-v2/seven-current-targeted-independent-material-pair.actual.json','whole7-genuine-material-pair.exact.json'),
 ('2026-10-09/chemie-b008-current-nineteen-native-pairing-root-v1/nineteen-actual-native-D-and-reviewed-P.technical-pair.actual.json','whole19-previous-genuine-native-pair.exact.json'),
 ('2026-10-09/chemie-b008-current-seven-native-pairing-root-v1/seven-actual-native-descriptions.independent-A-B.normal-pair.actual.json','whole7-previous-genuine-native-pair.exact.json'),
 ('2026-10-09/chemie-b008-current-twenty-five-whole-atomicity-memory-independent-a-v1/twenty-five-whole-A-M.first.independent-A.verdict.json','whole25-genuine-AM-a.exact.json'),
 ('2026-10-09/chemie-b008-current-twenty-five-whole-atomicity-memory-independent-b-v1/twenty-five-whole-A-M.independent-b.first-verdict.immutable.json','whole25-genuine-AM-b.exact.json'),
 ('2026-10-09/chemie-b008-twenty-six-current-visual-pairing-technical-v1/all26-actual-role-pairing.current-inactive.v2.json','whole26-genuine-current-raster-pair.exact.json'),
 ('2026-10-06/chemie-b008-nine-current-independent-source-structure-a-v1/source-structure-findings.json','whole9-original-source-structure-a.exact.json'),
 ('2026-10-06/chemie-b008-nine-current-independent-source-structure-b-v1/nine-family-source-structure.verdicts.json','whole9-original-source-structure-b.exact.json'),
 ('2026-10-06/chemie-b008-twenty-six-operator-v6-independent-a-v1/all26-targeted-description-operator-product-semantic-review.actual.json','whole26-historical-v6-operator-a.exact.json'),
 ('2026-10-06/chemie-b008-twenty-six-operator-v6-independent-b-v1/all26.scientific-source-operator-atomicity-prerequisite.actual.verdicts.json','whole26-historical-v6-operator-b.exact.json'),
 ('2026-10-06/chemie-b008-twenty-six-operator-v6-independent-b-v1/nine-families.mandatory-products-and-material.actual.trace.json','whole9-original-mandatory-product-source-trace.exact.json'),
 ('2026-10-09/chemie-b008-source-model-v3-RP-v4-pairing-root-v1/five-source-model-v3-and-two-RP-v4-texts.conservative-independent-pair.actual.json','whole-source-model-v3-RP-v4-conservative-pair.exact.json'),
 ('2026-10-09/chemie-b008-partner-preserving-views-pairing-root-v1/thirty-five-whole-source-view-occurrences.independent-first-pairing.actual.json','whole35-source-view-conservative-pair.exact.json')]
for p,d in historical:exact(B/p,d)
put(Path('checks/actual-whole26-material-preservation-stage.json'),{
 'schemaVersion':1,'role':'Actual exact whole material assembly and immutable evidence binding; not review or current gate clearance',
 'ownExactOriginalCopies':bindings,'materialEntries':26,'wholeCurrentProfiles':26,'wholeOperativeCases':52,
 'allWholeProfileBodiesExactlyEqualBothExistingNormalRecordsAndReviewedMaterials':True,
 'allWholeCasesAndTransferBodiesRetainedWithoutFieldMutation':True,
 'originalSourceDutyInventoryWhole':inv,'ordinaryStatus':'needs_human_review','reviewAuthority':'ai_candidate',
 'evidenceLevel':'E1','maximumClaimScope':'G1','historicalNativePairsAreNotCurrentNativeApproval':True,
 'newWholeCanonicalAndNativeBindingPendingStableRootRouteIntegration':True,'activeWrites':[],'strictGain':0,
 'humanApproval':False,'humanTrial':False,'actualLearnerPerformance':False})
print(json.dumps({'ownPackage':str(P),'wholeProfileCount':26,'wholeOperativeCases':52,'copiedWholeInputs':len(bindings),'ordinaryStatus':'needs_human_review','activeWrites':0,'strictGain':0}))
