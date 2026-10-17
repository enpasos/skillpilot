import copy,datetime,hashlib,json,os
from pathlib import Path
O=Path(__file__).resolve().parent;B=O.parent
F=B/'current439-AV-and-native-registry-integration-root-v1/capsule';C=O/'capsule'
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-P13-native-preparation-technical-root-v1')
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
base_rel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/base.full439.current-all-seven-HB7f.private.config.json'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(j):return (json.dumps(j,ensure_ascii=False,indent=2)+'\n').encode()
def new(p,b):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists() and not p.is_symlink(),p
 p.write_bytes(b);return pin(p)
def own(p):
 if p==C:return
 own(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in src.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
assert not C.exists();C.mkdir()
for child in F.iterdir():(C/child.name).symlink_to(child,target_is_directory=child.is_dir())
own(C/R);own((C/L).parent)
lists=B/'current439-after-native40-remaining-D-delta-inventory-technical-c-v1/LISTS.disjoint-concrete51-mechanical316-and-next-bounded-charges.json'
assert pin(lists)['sha256']=='ee35c5d93f6ea98dcf3fca8276019a6ea0877c83d63b3ea8c4b45a320f1276aa'
ids=read(lists)['disjointConcreteGoalIds']['existing-P'];assert len(ids)==len(set(ids))==13
base=read(F/base_rel);model_rel=base['outputPath'];model=read(F/model_rel)
position={p['goalId']:n for n,p in enumerate(model['pages'])};assert ids==sorted(ids,key=position.get)
before=(F/L).read_bytes();assert hashlib.sha256(before).hexdigest()=='1269d3db20df75623ea8f73f34f5822bb1d81e0250f2893cd1e069ef1b1bc675'
ledger=json.loads(before);assert len(ledger['activeBatchConfigPaths'])==18
history=C/R/'admin-history';new(history/'in-flight.original18.exact.json',before)
after=copy.deepcopy(ledger);after['activeBatchConfigPaths']=[];changes=[];guard=[pin(F/L),pin(lists),pin(F/base_rel)]
for n,ref in enumerate(ledger['activeBatchConfigPaths'],1):
 raw=(F/ref).read_bytes();cfg=json.loads(raw);guard.append(pin(F/ref))
 taken=[g for g in cfg['goalIds'] if g in ids];rest=[g for g in cfg['goalIds'] if g not in ids]
 if not taken:after['activeBatchConfigPaths'].append(ref);continue
 assert ref not in ledger['activeBatchConfigPaths'][-3:],'Frozen6/20/14 claims are disjoint'
 new(history/'old-configs'/f'{n:02d}.exact.json',raw)
 replacement=copy.deepcopy(cfg);replacement['goalIds']=rest
 newref=str(R/'rest-claims'/f'old-{n:02d}.same-fields-minus-P13.config.json') if rest else None
 if newref:new(C/newref,dump(replacement));after['activeBatchConfigPaths'].append(newref)
 changes.append({'beforeActiveReference':ref,'beforePin':pin(F/ref),'beforeWholeObject':cfg,'removedGoalIds':taken,
   'afterActiveReference':newref,'afterWholeObject':replacement,'emptyActiveReferenceRetired':not rest})
config_ref=str(R/'native13.batch.config.json')
cfg={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
 'schemaVersion':1,'batchId':'chemie-current439-P13-current-profile-context-technical-root-20261017-v1','subject':'chemie','subjectLabel':'Chemie',
 'bookId':'chemie-current439-P13-current-profile-context-technical-root-20261017-v1','title':'Chemie – aktuelle Lernzielseiten und Profile (13 Ziele)',
 'baseGoalBookConfigPath':base_rel,'goalIds':ids,'outputDirectory':str(R/'native13'),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
 'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
 'criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
 'printDerivativeProfile':'bounded-atlas'}
new(C/config_ref,dump(cfg));after['activeBatchConfigPaths'].append(config_ref)
if (C/L).is_symlink():(C/L).unlink()
new(C/L,dump(after))
owners={}
for ref in after['activeBatchConfigPaths']:
 for g in read(C/ref)['goalIds']:
  assert g not in owners,(g,ref,owners.get(g));owners[g]=ref
assert all(owners[g]==config_ref for g in ids)
selection={'selectedGoalIds':ids,'canonicalPin':pin(F/base['landscapePath']),
 'P439Pin':pin(F/base['evidenceReviewPaths'][0]),'SEMPin':pin(F/base['semanticKindLedgerPath']),
 'currentModel':pin(F/model_rel),'baseConfigPin':pin(F/base_rel),'baseConfigPath':base_rel,
 'currentModelDigest':model['digest'],'QARequiredPin':pin(F/base['goalVisualizationQaPath'])}
new(O/'SELECTION.actual13-P-only-current-inputs.json',dump(selection))
for p in [*guard,*[v for k,v in selection.items() if k.endswith('Pin')],selection['currentModel']]:assert pin(p['path'])==p
handoff={'role':'Private technical current-P13 preparation; no predetermined review outcomes','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'sourceCapsule':str(F),'capsule':str(C),'newConfigRelativePath':config_ref,'newConfigPin':pin(C/config_ref),'newConfigWholeObject':cfg,
 'newNativeRelativePath':cfg['outputDirectory'],'sourceLedgerPin':pin(F/L),'beforeWholeLedgerObject':ledger,'afterWholeLedgerObject':after,
 'changedOldClaims':changes,'sourceGuards':guard,'beforeRefsClaims':[18,196],'afterRefsClaims':[len(after['activeBatchConfigPaths']),len(owners)],
 'allCurrentClaimsGloballyUnique':True,'frozen6And20And14Unchanged':True,'appliedToRootOrMain':False,'newScienceVotes':0,'humanApproval':False}
new(O/'HANDOFF.private-P13-preparation-and-conditional-root-ledger-union.json',dump(handoff))
print(json.dumps({'capsule':str(C),'config':config_ref,'claims':len(owners),'oldClaimsRemoved':sum(len(x['removedGoalIds']) for x in changes),'refs':len(after['activeBatchConfigPaths']),'newScienceVotes':0}))
