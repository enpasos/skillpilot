import pathlib,json,hashlib,copy
R=pathlib.Path(__file__).resolve().parents[7];P=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-6482-bounded-grammar-and79d-demand-ADDENDUM-INERT-round-b-v1';B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-6482-integration-risks-AUTHOR-INERT-round-b-v1';O=pathlib.Path(__file__).resolve().parent
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def put(n,j):(O/n).write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def rel(p):return str(pathlib.Path(p).relative_to(R))
CAN=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';REG=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
G='79d244e0-049e-59e9-a2fb-b8f8670b315a';budget='5aaf5abf-5e70-57c6-b030-1d08a35d17b8'
files=[p for p in P.rglob('*') if p.is_file()]+[p for p in B.rglob('*') if p.is_file()]+[CAN,REG,R/'AGENTS.md',R/'app/scripts/positiveGoalEvidenceProfileModel.ts',R/'app/scripts/goalEvidenceProfileModel.ts',R/'app/package.json',R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',R/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf']
floor=[]
def strings(j):
 if isinstance(j,str):yield j
 elif isinstance(j,list):
  for v in j:yield from strings(v)
 elif isinstance(j,dict):
  for v in j.values():yield from strings(v)
for sub in read(REG)['subjects']:
 if sub['subject'] not in ['mathematik','physik']:continue
 paths=sorted(set(s for s in strings(sub) if s.startswith(('curricula/','app/')) and (R/s).is_file()));files += [R/s for s in paths];floor.append(dict(subject=sub['subject'],registrySubjectFields=list(sub),directRegistryReferencedFilesHashOnly=paths,noContentReviewOrGateRerun=True))
config=read(B/'history/79d244e0-049e-59e9-a2fb-b8f8670b315a.current-config.exact.json');files += [R/config[k] for k in ['reviewCriteriaPath','reviewPath','semanticKindLedgerPath']]
can=read(CAN);whole=next(g for g in can['goals'] if g['id']==G);image=R/'app/public'/whole['resourceLinks'][0]['url'].lstrip('/');files.append(image)
files=list(dict.fromkeys(files));bindings=[dict(path=rel(p),sha256=sha(p),bytes=p.stat().st_size) for p in files];put('actual-bound-inputs.before.READONLY.json',bindings)
seal=read(P/'SEALED-additive-INERT-handoff.json');assert sha(P/'SEALED-additive-INERT-handoff.json').startswith('sha256:9940a096'),sha(P/'SEALED-additive-INERT-handoff.json')
for a in seal['artifacts']:assert sha(P/a['path'])==a['digest'],a['path']
parentseal=read(B/'SEALED-unreviewed-INERT-handoff.json');assert sha(B/'SEALED-unreviewed-INERT-handoff.json')==seal['parentSealDigest']
for a in parentseal['artifacts']:assert sha(B/a['path'])==a['digest'],a['path']
assert (P/'history/SEALED-unreviewed-INERT-handoff.json').read_bytes()==(B/'SEALED-unreviewed-INERT-handoff.json').read_bytes()
snapshot_pairs={'history/history__79d244e0-049e-59e9-a2fb-b8f8670b315a.whole-goal.exact-object.json':'history/79d244e0-049e-59e9-a2fb-b8f8670b315a.whole-goal.exact-object.json','history/history__79d244e0-049e-59e9-a2fb-b8f8670b315a.current-positive.exact-line.jsonl':'history/79d244e0-049e-59e9-a2fb-b8f8670b315a.current-positive.exact-line.jsonl','history/candidates__positive-profiles.native-bound.INERT.json':'candidates/positive-profiles.native-bound.INERT.json','history/candidates__three-semantic-destinations.whole-goals.INERT.json':'candidates/three-semantic-destinations.whole-goals.INERT.json','history/author-criteria.txt':'author-criteria.txt','history/generation-metadata.actual.json':'generation-metadata.actual.json'}
for a,b in snapshot_pairs.items():assert (P/a).read_bytes()==(B/b).read_bytes()
assert read(P/'history/history__79d244e0-049e-59e9-a2fb-b8f8670b315a.whole-goal.exact-object.json')==whole
assert (B/'history/canonical-landscape.exact.json').read_bytes()==CAN.read_bytes()
assert (B/'history/current-book-config.exact.json').read_bytes()==(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json').read_bytes()
lines=(R/config['reviewPath']).read_bytes().splitlines(keepends=True);currentline=next(l for l in lines if json.loads(l)['goalId']==G)
assert currentline==(P/'history/history__79d244e0-049e-59e9-a2fb-b8f8670b315a.current-positive.exact-line.jsonl').read_bytes()
oldrecords=read(P/'history/candidates__positive-profiles.native-bound.INERT.json');new=read(P/'candidates/positive.native-bound.INERT.json')[0];old=next(r for r in oldrecords if r['goalId']==budget)
def dif(a,b,path=''):
 if type(a)!=type(b):return [dict(path=path,before=a,after=b)]
 if isinstance(a,dict):return sum([dif(a.get(k),b.get(k),path+'/'+k) for k in sorted(set(a)|set(b))],[])
 if isinstance(a,list):
  if len(a)!=len(b):return [dict(path=path,before=a,after=b)]
  return sum([dif(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))],[])
 return [dict(path=path,before=a,after=b)] if a!=b else []
deltas=dif(old,new);content=dif(old['profile'],new['profile'])
assert len(content)==1 and content[0]['path']=='/applicationCaseBriefs/0/expectedPerformanceDe'
assert content[0]['after']==content[0]['before'].replace('von die Zahlungspflicht','von der Zahlungspflicht')
assert {d['path'] for d in deltas}=={'/profile/applicationCaseBriefs/0/expectedPerformanceDe','/profileFingerprint','/reason','/reviewCriteriaFingerprint','/reviewId','/reviewInputFingerprint','/reviewedAt'}
assert (P/'candidates/whole-goals.unchanged.INERT.json').read_bytes()==(P/'history/candidates__three-semantic-destinations.whole-goals.INERT.json').read_bytes()
put('actual-only-budget-grammar-and-author-binding-metadata-deltas.READONLY.json',dict(wholeRecordDeltas=deltas,onlyProfileContentDelta=content[0],otherWholeProfileContentExact=True,wholeThreeGoalFileExact=True,otherTwoParentProfilesNotChangedByAddendum=True,noNew79dNativeBindingClaimedByOneRecordAddendum=True))
put('actual-whole-current79d-and-existing-and-candidate-P-contracts.READONLY.json',dict(currentWholeGoal=whole,currentWholeP=json.loads(currentline),candidateWholeP=next(r for r in oldrecords if r['goalId']==G),currentConfig=config))
put('actual-history-current-canonical-registry-and-protected-floor-bindings.READONLY.json',dict(addendumSealSha256=sha(P/'SEALED-additive-INERT-handoff.json'),parentSealSha256=sha(B/'SEALED-unreviewed-INERT-handoff.json'),allAddendumArtifactsSealExact=True,all74ParentArtifactsSealExact=True,snapshotPairsAllByteExact=snapshot_pairs,currentCanonicalFullSnapshotByteExact=True,current79dWholeGoalObjectExact=True,current79dPOriginalLineByteExact=True,current79dVisualizationByteExact=((B/'history/79d244e0-049e-59e9-a2fb-b8f8670b315a.visualization.exact.png').read_bytes()==image.read_bytes()),canonicalSha256=sha(CAN),registrySha256=sha(REG),floorPolicy='Hash direct protected mathematics/physics registry inputs before/after only. No science packages, reviewer results or full gates are re-read/re-run.',protectedFloorHashBindings=floor))
print(json.dumps(dict(boundInputs=len(bindings),addendumArtifacts=len(seal['artifacts']),parentArtifacts=len(parentseal['artifacts']),floors=[dict(subject=f['subject'],hashOnlyFileCount=len(f['directRegistryReferencedFilesHashOnly'])) for f in floor])))
