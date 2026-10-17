import pathlib,json,hashlib,datetime,shutil
O=pathlib.Path(__file__).resolve().parent;E=O.parent;F=O/'capsule';r=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):p=pathlib.Path(p);return dict(path=str(p),sha256=sha(p),bytes=p.stat().st_size)
def dig(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def dump(p,x):p=pathlib.Path(p);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def replace(p,b):p=pathlib.Path(p);assert p.is_relative_to(F);t=p.with_name(p.name+'.new-owned');assert not t.exists();t.write_bytes(b);t.replace(p)
p=r(O/'PLAN.prospective20-and-four-views.pending-final-root-approval.json');B=pathlib.Path(p['baseO']);bm=r(B/'ASSEMBLY.exact-guards-and-inputs.json');bb=r(B/'BINDING.actual439-P-and-fifteen-SEM-source-FPs.json');assert pin(F/p['canonicalRelative'])['sha256']==p['baseCanonical']['sha256'];assert not (O/'ASSEMBLY.exact-guards-and-inputs.json').exists()
confirm={E/'explicit-overlap75e503-combination-informed-root-confirmation-v1/CONFIRMATION.root.exact-two-whole-goals-metadata-union.json':'1e2e5c3f9cf20b3b2be0e2157cf0a6e49b2ad6ef3b38697f1538ce035f370dda',E/'Authorconfirmation.explicit-overlap75e503-package01-02-v1/AUTHORCONFIRMATION.explicit-overlap75e503.metadata-only.json':'5d6e4575a9f8d33de943b23d777c948ab57d4dd993ff2657efc5caa514202f4a',E/'Authorconfirmation.explicit-overlap75e503-package01-02-v1/SEAL.json':'e50328577017ed106b91beb24abfda56578716ae7f891b1b9c628aa056ad93d8',E/'explicit-overlap75e503-combination-preparation-technical-v1/AUTHOR06-07.ADDENDUM.two-whole-goal-combination-compatibility.confirmation.json':'2e8869489d16457544e65efea73521e9cf47f9f053704a414c811aff29404059',E/'explicit-overlap75e503-combination-preparation-technical-v1/SEAL.author06-07.addendum.json':'79e490177b29e762765f715a32b09d976abb9c9d653b78df57bb7a7de6701a39'}
resolved=[]
for q,h in confirm.items():
 if not q.exists():
  found=[s for s in q.parent.iterdir()if s.is_file()and sha(s)==h];assert len(found)==1,(q,h);q=found[0]
 assert sha(q)==h;resolved.append(pin(q))
assert r(resolved[0]['path'])['decision']=='COMPATIBLE_BOUNDED_METADATA_UNION_ONLY';assert r(resolved[1]['path'])['decision']=='COMPATIBLE_METADATA_COMBINATION_ONLY'
c=r(F/p['canonicalRelative']);by={g['id']:g for g in c['goals']};target=r(p['prospectiveCanonical']['path']);assert pin(p['prospectiveCanonical']['path'])==p['prospectiveCanonical'];assert pin(p['prospectiveWhole39Views']['path'])==p['prospectiveWhole39Views'];expected={d['goalId']:d for d in p['wholeGoalChanges']}
for d in p['wholeGoalChanges']:
 assert by[d['goalId']]==d['before']and dig(d['before'])==d['beforeDigest']and dig(d['after'])==d['afterDigest'];by[d['goalId']]=d['after']
assert {**c,'goals':[by[g['id']]for g in c['goals']]}==target
for d in p['wholeViewChanges']:
 rel=next(v['relative']for v in p['currentViewFiles']if v['viewId']==d['viewId']);assert r(F/rel)==d['before'];assert dig(d['before'])==d['beforeDigest']and dig(d['after'])==d['afterDigest']
protected=bm['sourceGuard']+[pin(pathlib.Path(p['baseCapsule'])/p['canonicalRelative']),bb['whole39Views'],bb['P439'],bb['SEM650'],bb['namespaceIndex'],pin(B/'SEAL.PRECOMPILER-guarded-NI05-and-HB7f-handoff.json')]+[pin(pathlib.Path(p['baseCapsule'])/v['relative'])for v in p['currentViewFiles']]
dump(O/'GUARD.protected-inputs.before.json',dict(protected=protected,rootFinalAuthorizationKnown=True,rootMessage='2026-10-17 Root: Finale bounded Integrationsfreigabe; exact20+4; one shared actual compiler/frontend after guarded stock bindings.',compatibilityAndRootPins=resolved))
replace(F/p['canonicalRelative'],pathlib.Path(p['prospectiveCanonical']['path']).read_bytes())
for d in p['wholeViewChanges']:
 rel=next(v['relative']for v in p['currentViewFiles']if v['viewId']==d['viewId']);replace(F/rel,(json.dumps(d['after'],ensure_ascii=False,indent=2)+'\n').encode())
cp=O/'candidate.canonical650.paired-all-seven-and-HB7f.private.json';vp=O/'candidate.whole39views.paired-all-seven-and-HB7f.private.json';shutil.copyfile(p['prospectiveCanonical']['path'],cp);shutil.copyfile(p['prospectiveWhole39Views']['path'],vp)
idir=F/'candidate-inputs/ALL-SEVEN-FINAL';idir.mkdir();inputs=list(bm['inputs'])
for i,q in enumerate(p['inputPins']+resolved):
 assert pin(q['path'])==q;copy=idir/(str(i).zfill(2)+'-'+pathlib.Path(q['path']).name);shutil.copyfile(q['path'],copy);inputs.append({**q,'copyRelative':str(copy.relative_to(F))})
meta=dict(physicalRoot=str(F),outputRoot=str(O),canonicalRelative=p['canonicalRelative'],baseCanonical=p['baseCanonical'],baseViews=p['baseViews'],newCanonical=pin(cp),wholeViewCollection=pin(vp),currentViewFiles=p['currentViewFiles'],baseCapsule=p['baseCapsule'],baseO=p['baseO'],currentP439=p['currentP439'],currentSEM650=p['currentSEM650'],currentNamespaceIndex=p['currentNamespaceIndex'],outputsRelative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-all-seven-HB7f-current650-technical-v1',inputs=inputs,sourceGuard=protected,wholeGoalChanges=p['wholeGoalChanges'],wholeViewChanges=p['wholeViewChanges'],changedGoalIds=[d['goalId']for d in p['wholeGoalChanges']],overlapGoalIds=p['overlapGoalIds'],retainedPrevious15GoalIds=bm['changedGoalIds'],retained03And04GoalIds=bm['retained03And04GoalIds'],earlierActualMeasurement=bm['earlierActualMeasurement'],earlierAPV=bm['earlierAPV'],lastActualO=str(E/'paired-package03-and04-actual-current650-technical-v1'),lastActualCanonical=r(E/'paired-package03-and04-actual-current650-technical-v1/BINDING.actual-two-P-and-thirteen-SEM-source-FPs.json')['canonical'],lastActualWhole39Views=r(E/'paired-package03-and04-actual-current650-technical-v1/BINDING.actual-two-P-and-thirteen-SEM-source-FPs.json')['whole39Views'],rootFinalAuthorization=True,rootAndBothAuthorCompatibilityPins=resolved,unionNotSequentialOverwrite=True,wholePChanges=0,newScientificVotes=0,newFormalRunIds=[],M7=False,HumanApproval=False)
dump(O/'ASSEMBLY.exact-guards-and-inputs.json',meta)
for q in protected:assert sha(q['path'])==q['sha256']
print(json.dumps(dict(canonical=pin(cp),views=pin(vp),actualNewWholeGoalChanges=20,actualNewWholeViewChanges=4,losslessExplicitUnions=2,wholePChanges=0,rootFinalAndBothAuthorPinsVerified=True,compilerInvocations=0),indent=2))
