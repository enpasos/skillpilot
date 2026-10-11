from pathlib import Path
import json,copy,hashlib,shutil,tempfile,os
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';CO=Q/'wirtschaft-M4-twelve-foreign-company-current597-status-nav-scope-author-a-v1';FO=Q/'wirtschaft-M4-twelve-foreign-finance-current597-status-nav-scope-author-a-v1';O=Q/'wirtschaft-current621-company-finance24-current597-fieldwise-status-nav-scope-author-a-v1';O.mkdir(exist_ok=False);CC=Path('/tmp/economics-company12-current597-author-a-e3_teq0o/capsule');CAP=Path(tempfile.mkdtemp(prefix='economics-combined621-current597-author-a-'))/'capsule';shutil.copytree(CC,CAP,symlinks=True);Path('/tmp/economics-combined621-current597-author-a-path.txt').write_text(str(CAP)+'\n');R='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def load(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':h(p),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve()) and not p.is_symlink() and not os.path.samefile(p,ROOT/p.relative_to(CAP))
base=load(CO/'whole-current597-before-company-scope.active-exact.json');assert h(ROOT/R)==h(CO/'whole-current597-before-company-scope.active-exact.json');assert len(base['goals'])==597
copyinputs=load(CO/'actual-current597-private-physical-start-readonly-before-foreign-science.freeze.json')['actualWholeBeforeInputs'];guards=[]
for r in copyinputs:
 p=ROOT/r['path'];assert h(p)==r['sha256'];cp=CAP/r['path'];guard(cp);cp.write_bytes(p.read_bytes());guards.append(bind(p))
for name in ['whole-current597-central-registry.readonly.json','whole-current597-semantic-kinds.readonly.json']:shutil.copyfile(CO/name,O/name)
shutil.copyfile(CO/'whole-current597-before-company-scope.active-exact.json',O/'whole-current597-before-combined621.active-exact.json');shutil.copytree(CO/'whole-before35views',O/'whole-before35views')
cBodies=load(CO/'whole-twelve-company-foreign-KEEP-status-only-released.author-candidate.json');fBodies=load(FO/'whole-twelve-finance-foreign-KEEP-status-only-released.author-candidate.json');bodies=cBodies+fBodies;ids={g['id'] for g in bodies};assert len(ids)==24
cNav=load(CO/'actual-three-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json');fNav=load(FO/'actual-four-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json');after=copy.deepcopy(base);after['goals']+=copy.deepcopy(bodies);gm={g['id']:g for g in after['goals']};bm={g['id']:g for g in base['goals']};navs=[]
for nid in dict.fromkeys([n['goalId'] for n in cNav+fNav]):
 rows=[n for n in cNav+fNav if n['goalId']==nid];n=gm[nid];assert all(r['wholeBefore']==bm[nid] for r in rows);appendIds=[]
 for r in rows:
  old=r['wholeBefore'];new=r['wholeAfter'];assert new['contains'][:len(old['contains'])]==old['contains'];appendIds+=new['contains'][len(old['contains']):]
  for field in ['description','descriptionEn']:assert new[field].startswith(old[field]);n[field]+=new[field][len(old[field]):]
  assert r['jurisdictionMetadataChanged']==False
 assert len(set(appendIds))==len(appendIds);n['contains']+=appendIds
 allowed={'contains','description','descriptionEn'};assert {k:v for k,v in n.items() if k not in allowed}=={k:v for k,v in bm[nid].items() if k not in allowed}
 navs.append({'goalId':nid,'wholeBefore':bm[nid],'wholeAfter':n,'boundSeparateAuthorNavRows':rows,'orderedNewMaterialIds':appendIds,'actualSharedEFieldsCombinedByExactPrefixAndTwoPurposefulSuffixes':len(rows)==2,'jurisdictionFieldChanged':False})
assert len(navs)==6 and sum(r['actualSharedEFieldsCombinedByExactPrefixAndTwoPurposefulSuffixes'] for r in navs)==1
for g in base['goals']:
 if g['id'] not in {r['goalId'] for r in navs}:assert gm[g['id']]==g
assert len(after['goals'])==621
body=save('whole-twentyfour-company-finance-foreign-KEEP-status-only-released.author-candidate.json',bodies);can=save('whole-current621-twentyfour-foreign-qualified-materials-sixNav-only.INERT-author-candidate.json',after);nav=save('actual-six-Nav-combined-ordered-child-union-and-shared-E-purposeful-prefix-fields.author.json',navs)
ci=load(CO/'actual-company12-116-material-references-and190-whole-context-bindings.author-index.json');fi=load(FO/'actual-finance12-67-material-references-and108-whole-context-bindings.author-index.json');assert ci['newMaterialIds']==[g['id'] for g in cBodies] and fi['newMaterialIds']==[g['id'] for g in fBodies]
cv={r['activePath']:r for r in ci['viewRows']};fv={r['activePath']:r for r in fi['viewRows']};aft=O/'whole-after35views';aft.mkdir();views=[]
for p in sorted((O/'whole-before35views').glob('*.json')):
 rel='curricula/DE/Gymnasium/composition-views/wirtschaft/'+p.name;b=load(p);n=copy.deepcopy(b);new=[];nids=[]
 for ix in [cv[rel],fv[rel]]:
  whole=load(ROOT/ix['candidate']['path']);old=load(ROOT/ix['before']['path']);assert old==b
  if ix['newReferenceCount']:
   assert whole['rootNodes'][0]['children'][:-1]==old['rootNodes'][0]['children'];new.append(copy.deepcopy(whole['rootNodes'][0]['children'][-1]));nids+=ix['newMaterialIds']
  else:assert whole==old
 if new:n['rootNodes'][0]['children']+=new;n['viewId']='de-gym-economics-'+p.stem+'-company-finance24-current597-20261010-author-v1'
 assert len(n['viewId'])<=255
 path=aft/p.name;path.write_text(json.dumps(n,ensure_ascii=False,indent=2)+'\n');cp=CAP/rel;guard(cp);cp.write_bytes(path.read_bytes());views.append({'activePath':rel,'before':bind(p),'candidate':bind(path),'newMaterialIds':nids,'newReferenceCount':len(nids),'separateCompanyReferenceCount':cv[rel]['newReferenceCount'],'separateFinanceReferenceCount':fv[rel]['newReferenceCount'],'oldOrderedStructureChildrenExactPrefix':True,'ordinarySupportMemoryPOnlyRefsAdded':0})
assert sum(r['newReferenceCount'] for r in views)==183
guard(CAP/R);(CAP/R).write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
helper=(CC/'app/scripts/company12Current597WholeStatusNavScopeAuthorA.mts').read_text().replace('whole-twelve-company-foreign-KEEP-status-only-released.author-candidate.json','whole-twentyfour-company-finance-foreign-KEEP-status-only-released.author-candidate.json').replace('whole768CompanyMaterialContextBindings','whole1536CombinedCompanyFinanceMaterialContextBindings');(CAP/'app/scripts/companyFinance24Current597Combined621ScopeAuthorA.mts').write_text(helper)
ix=save('actual-fieldwise621-twentyfour-foreign-qualified-sixNav183-references-author-index.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_COMBINED_SCOPE_QS','activeCanonicalPath':R,'wholeBeforeCAN':bind(O/'whole-current597-before-combined621.active-exact.json'),'wholeAfterCAN':can,'whole24ForeignQualifiedStatusOnlyBodies':body,'wholeSixNavFieldDeltas':nav,'companyAuthorHandoff':bind(CO/'actual-final-company12-116-accesses-threeNav-current597-foreign-science-reuse.author-handoff.json'),'companyReferenceIndex':bind(CO/'actual-company12-116-material-references-and190-whole-context-bindings.author-index.json'),'financeReferenceIndex':bind(FO/'actual-finance12-67-material-references-and108-whole-context-bindings.author-index.json'),'companyScienceReceipt':load(CO/'actual-final-company12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json')['foreignScienceReceipt'],'financeScienceReceipt':load(FO/'actual-final-finance12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json')['foreignScienceReceipt'],'newMaterialIds':[g['id'] for g in bodies],'viewRows':views,'companyWholePerReferenceBindings':ci['perReferenceWholeBindings'],'financeWholePerReferenceBindings':fi['perReferenceWholeBindings'],'actual183ExplicitNewMaterialReferences':183,'actual149CountryReferences':149,'actual34NationalReferences':34,'actualCombinedChangedViews':sum(bool(r['newReferenceCount']) for r in views),'twoFinancePracticeContextsOverExistingF90POnlyAuthorisedByRoot':True,'all18FinanceGKWholeClosureContextsHeld':True,'old597SourceAndTargetUniverseExact':True,'originalP336Cases685Exact':True,'activeWrites':0,'humanApproval':False,'ownScopeKEEP':False})
save('actual-combined621-private-physical-current597-input-start.freeze.json',{'role':'AUTHOR_PRIVATE_WHOLE_CURRENT597','privateCapsule':str(CAP),'actualWholeBeforeInputs81':guards,'privateResolveAndSamefileBeforeEveryWrite':True,'privateConfigSourceSEMViewsPhysical':True,'activeWrites':0})
print(json.dumps({'privateCAP':str(CAP),'candidate':can,'index':ix,'changedViews':sum(bool(r['newReferenceCount']) for r in views)}))
