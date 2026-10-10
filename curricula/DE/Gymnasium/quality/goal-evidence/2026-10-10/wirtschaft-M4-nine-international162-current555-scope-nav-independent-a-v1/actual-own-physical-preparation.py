from pathlib import Path
import os,json,shutil,tempfile,hashlib,copy
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot').resolve();A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-foreign-qualified-international-current555-status-nav-scope-author-b-v1';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-international162-current555-scope-nav-independent-a-v1';O.mkdir(exist_ok=True)
def rec(p):b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return rec(p)
ixp=A/'actual-final-nine-status-three-existingNav162-view-fields.portable-author-index.json';ix=json.loads(ixp.read_text());hp=A/'actual-final-nine-international162-current555-accesses.optional-template-path-only-author-handoff-v2.json';assert rec(hp)['sha256']=='f6c9814a3a26eaa79d62d1a552b99dd1b8dcd78911f4e634c8677ee1b3169ffe'
for x in [ix['canonicalBefore'],ix['canonicalCandidate'],ix['newNineStatusOnlyBodies'],ix['foreignScientificReceipt']]:assert rec(R/x['path'])==x
before=json.loads((R/ix['canonicalBefore']['path']).read_text());after=json.loads((R/ix['canonicalCandidate']['path']).read_text());assert len(before['goals'])==555 and len(after['goals'])==564;assert rec(R/ix['activeCanonicalPath'])=={'path':ix['activeCanonicalPath'],'sha256':ix['canonicalBefore']['sha256'],'bytes':ix['canonicalBefore']['bytes']}
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};navs={r['navGoalId']:r for r in ix['exactThreeOldNavFieldChanges']};assert set(ag)-set(bg)==set(ix['newMaterialIds']);assert {k:v for k,v in before.items()if k!='goals'}=={k:v for k,v in after.items()if k!='goals'}
for gid,g in bg.items():
 if gid in navs:assert g==navs[gid]['wholeBefore'] and ag[gid]==navs[gid]['wholeFinalAfter']
 else:assert g==ag[gid]
science=json.loads((R/ix['foreignScientificReceipt']['path']).read_text());print('Science keys',science.keys())
# Identify the whole original reviewed author body solely from the immutable own science receipt.
for k,v in science.items():
 if isinstance(v,dict)and'path'in v and ('Body'in k or 'body'in k):print(k,v)
# Exact reviewed original Body locator is known from the final scientific receipt/history.
original=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-international-trade-finance-one-contract-local-author-v1/distinct-four-actor-and-fair-partial-author-successor-v3/whole-nine-one-contract-two-case-DEEN24-15.DRAFT-author-candidates.json';orig=json.loads(original.read_text());orig=orig['materials']if isinstance(orig,dict)else orig;og={g['id']:g for g in orig};bodyDeltas=[]
for gid in ix['newMaterialIds']:
 old=copy.deepcopy(og[gid]);new=copy.deepcopy(ag[gid]);sd={k:[old['examData'].get(k),new['examData'].get(k)]for k in set(old['examData'])|set(new['examData'])if old['examData'].get(k)!=new['examData'].get(k)};assert set(sd)<= {'reviewStatus','reviewNote'},sd;assert sd['reviewStatus']==['draft','released'];old['examData'].pop('reviewStatus',None);new['examData'].pop('reviewStatus',None);old['examData'].pop('reviewNote',None);new['examData'].pop('reviewNote',None);assert old==new;bodyDeltas.append({'materialId':gid,'wholeScientificFieldsExact':True,'actualStatusNoteDeltas':sd})
vs=Draft202012Validator(json.loads((R/'contracts/curriculum-package/v1/composition-view.schema.json').read_text()));vresults=[];tot=nat=country=0
for v in ix['views']:
 assert rec(R/v['before']['path'])==v['before'];assert rec(R/v['candidate']['path'])==v['candidate'];assert rec(R/v['activePath'])=={'path':v['activePath'],'sha256':v['before']['sha256'],'bytes':v['before']['bytes']};b=json.loads((R/v['before']['path']).read_text());a=json.loads((R/v['candidate']['path']).read_text());br=copy.deepcopy(b);ar=copy.deepcopy(a)
 if v['wholeActualAddedReferences']:
  assert b['scope']['stage']=='CrossStage';assert not list(vs.iter_errors(a));added=v['wholeActualAddedReferences'];assert len(added)==len(v['actualAddedPracticeTargetIds']);assert a['rootNodes'][0]['children'][:len(b['rootNodes'][0]['children'])]==b['rootNodes'][0]['children'];assert a['rootNodes'][0]['children'][len(b['rootNodes'][0]['children']):]==added;ar['rootNodes'][0]['children']=ar['rootNodes'][0]['children'][:len(br['rootNodes'][0]['children'])];ar['viewId']=br['viewId'];assert ar==br;assert all(x['projectionRole']=='target'and x['goalId']in ix['newMaterialIds']for x in added);tot+=len(added)
  if a['scope'].get('jurisdiction'):country+=len(added)
  else:nat+=len(added)
 else:assert a==b
 vresults.append({'activePath':v['activePath'],'before':v['before'],'candidate':v['candidate'],'addedRefs':v['wholeActualAddedReferences'],'closedSchemaQualified':bool(v['wholeActualAddedReferences']),'unchangedSekIHistoricalSchemaNotClaimed':b['scope']['stage']!='CrossStage','exactAppendAndAllOtherFields':True})
assert(tot,country,nat)==(162,149,13)
assert not list(Draft202012Validator(json.loads((R/'docs/landscape-runtime.schema.json').read_text())).iter_errors(after))
# Fresh physical capsule from current source/code, no borrowed author execution output.
CAP=Path(tempfile.mkdtemp(prefix='economics-international162-independent-a-'))/'capsule';CAP.mkdir();(CAP/'app').mkdir();shutil.copytree(R/'app/scripts',CAP/'app/scripts',symlinks=False);shutil.copytree(R/'app/src',CAP/'app/src',symlinks=False);(CAP/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
phys=[]
def cp(p,source=None):
 q=CAP/p;s=source or R/p;q.parent.mkdir(parents=True,exist_ok=True);assert q.parent.resolve().is_relative_to(CAP);q.write_bytes(s.read_bytes());assert not os.path.samefile(q,s);phys.append({'repoPath':p,'sourceWhole':rec(s),'privateSHA256':rec(q)['sha256'],'actualNotSameFile':True,'resolveInsidePrivate':True})
inputs=json.loads((A/'actual-private-physical-current-source-mapping-provenance-and-compiler-collector-inputs.author.json').read_text())['actualPhysicalInputs']
for i in inputs:cp(i['repoPath'])
for v in ix['views']:cp(v['activePath'],R/v['before']['path'])
cp(ix['activeCanonicalPath'],R/ix['canonicalBefore']['path'])
regp=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');reg=json.loads((A/'whole-current555-active-registry.readonly.json').read_text());assert json.loads((R/regp).read_text())==reg;cp(str(regp),A/'whole-current555-active-registry.readonly.json');(O/'whole-current555-active-registry.readonly.json').write_bytes((A/'whole-current555-active-registry.readonly.json').read_bytes());(O/'whole-current555-semantic-kinds.readonly.json').write_bytes((A/'whole-current555-semantic-kinds.readonly.json').read_bytes())
mempaths=set(str(p.relative_to(R))for p in(R/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'))
for s in reg['subjects']:
 cp(s['landscapePath'])
 if s.get('memoryReviewConfigPath'):mempaths.add(s['memoryReviewConfigPath'])
 if s.get('semanticKindLedgerPath'):cp(s['semanticKindLedgerPath'])
for p in sorted(mempaths):
 cp(p);cfg=json.loads((R/p).read_text())
 if cfg.get('reviewPath'):cp(cfg['reviewPath'])
# Independent readonly export adapter exactly preserves the whole production prefix.
prod=R/'app/scripts/generateCurriculumQualityStatus.ts';p=CAP/'app/scripts/generateCurriculumQualityStatus.ts';append="\nexport { routeProfiles, evaluateRouteProfile, readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure };\n";p.write_bytes(prod.read_bytes()+append.encode());assert p.read_bytes()[:prod.stat().st_size]==prod.read_bytes()
check=put('actual-own-current555-inert564-science-reuse-schema-exact162-appends-and-physical-input-freeze.independent.json',{'role':'INDEPENDENT whole actual input/delta check and fresh physical execution freeze; native results pending','wholeForeignAuthorHandoff':rec(hp),'wholeForeignInputIndex':rec(ixp),'wholeForeignScientificKEEP':rec(R/ix['foreignScientificReceipt']['path']),'wholeExactReviewedOriginalBody':rec(original),'actualOnlyStatusNoteNineDeltas':bodyDeltas,'actualAll546OtherWholeGoalObjectsExact':True,'actualThreeNavBeforeAfter':list(navs.values()),'actual35ViewRows':vresults,'actualTargetOnlyRefs':162,'actualCountryRefs':149,'actualNationalRefs':13,'actualNewPrerequisiteOnlyRefs':0,'actualClosed34CrossStageSchemaErrors':0,'sourceRuntime564SchemaErrors':0,'wholeFrozenRegistry':rec(O/'whole-current555-active-registry.readonly.json'),'wholeFrozenSEM':rec(O/'whole-current555-semantic-kinds.readonly.json'),'wholeProductionChecker':rec(prod),'wholePrivateCheckerReadonlyExports':rec(p),'privateCapsule':str(CAP),'actualPhysicalBoundInputs':phys,'activeWrites':0,'wholeM4Claim':False,'humanApprovalClaim':False})
Path('/tmp/economics-international162-independent-a-path.txt').write_text(str(CAP)+'\n');print(json.dumps({'capsule':str(CAP),'freeze':check,'physCount':len(phys)},indent=2))
