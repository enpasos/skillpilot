from pathlib import Path
import json,copy,hashlib,shutil,tempfile,os
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';CF=Q/'wirtschaft-current621-company-finance24-current597-fieldwise-status-nav-scope-author-a-v1';CU=Q/'wirtschaft-M4-twelve-foreign-consumer-current597-status-nav-scope-author-a-v1';O=Q/'wirtschaft-current633-company-finance-consumer36-current597-fieldwise-status-nav-scope-author-a-v1';O.mkdir(exist_ok=False);OLD=Path('/tmp/economics-combined621-current597-author-a-1x_myxfp/capsule');CAP=Path(tempfile.mkdtemp(prefix='economics-combined633-current597-author-a-'))/'capsule';shutil.copytree(OLD,CAP,symlinks=True);Path('/tmp/economics-combined633-current597-author-a-path.txt').write_text(str(CAP)+'\n');R='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def load(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':h(p),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve()) and not p.is_symlink() and not os.path.samefile(p,ROOT/p.relative_to(CAP))
fh=CF/'actual-final-current621-company-finance24-sixNav183-foreign-whole-science-bound.author-handoff.json';ch=CU/'actual-final-consumer12-155-accesses-threeNav-current597-foreign-science-reuse.author-handoff.json';assert h(fh)=='dad73f686f226a208365ea3a60b871b6cc0dfaf4f6c1d29ab4cc13f578e7608a' and h(ch)=='5eb52e493a86453d935419c2d3785b157b5b0ae25ac2f18fb6f0add843eae909';fr=load(fh);cr=load(ch)
base=load(ROOT/fr['wholeBeforeCAN']['path']);assert h(ROOT/R)==fr['wholeBeforeCAN']['sha256']==cr['wholeBeforeCAN']['sha256'];assert len(base['goals'])==597
inputs=load(CF/'actual-combined621-private-physical-current597-input-start.freeze.json')['actualWholeBeforeInputs81'];guards=[]
for r in inputs:
 p=ROOT/r['path'];assert h(p)==r['sha256'];cp=CAP/r['path'];guard(cp);cp.write_bytes(p.read_bytes());guards.append(bind(p))
for name in ['whole-current597-central-registry.readonly.json','whole-current597-semantic-kinds.readonly.json']:shutil.copyfile(CF/name,O/name)
shutil.copyfile(ROOT/fr['wholeBeforeCAN']['path'],O/'whole-current597-before-combined633.active-exact.json');shutil.copytree(CF/'whole-before35views',O/'whole-before35views')
fBodies=load(ROOT/fr['whole24StatusOnlyReleasedBodies']['path']);cBodies=load(CU/'whole-twelve-consumer-foreign-KEEP-status-only-released.author-candidate.json');bodies=fBodies+cBodies;ids={g['id'] for g in bodies};assert len(ids)==36
fnav=load(ROOT/fr['sixWholeNavDeltasWithSharedEUnion']['path']);cnav=load(ROOT/cr['threePurposefulPrefixNavs']['path']);after=copy.deepcopy(base);after['goals']+=copy.deepcopy(bodies);gm={g['id']:g for g in after['goals']};bm={g['id']:g for g in base['goals']};navs=[]
for nid in dict.fromkeys([r['goalId'] for r in fnav+cnav]):
 rows=[r for r in fnav+cnav if r['goalId']==nid];n=gm[nid];assert all(r['wholeBefore']==bm[nid] for r in rows);added=[]
 for r in rows:
  old=r['wholeBefore'];new=r['wholeAfter'];assert new['contains'][:len(old['contains'])]==old['contains'];added+=new['contains'][len(old['contains']):]
  for field in ['description','descriptionEn']:assert new[field].startswith(old[field]);n[field]+=new[field][len(old[field]):]
  assert {k:v for k,v in new.items() if k not in {'contains','description','descriptionEn'}}=={k:v for k,v in old.items() if k not in {'contains','description','descriptionEn'}}
 assert len(set(added))==len(added) and set(added)<=ids;n['contains']+=added
 navs.append({'goalId':nid,'wholeBefore':bm[nid],'wholeAfter':n,'boundSeparateWholeNavRows':rows,'orderedNewMaterialIds':added,'sharedNavExactPrefixAndTwoPurposefulPackageSuffixes':len(rows)==2,'jurisdictionFieldChanged':False})
assert len(navs)==6 and sum(r['sharedNavExactPrefixAndTwoPurposefulPackageSuffixes'] for r in navs)==3;assert sum(len(r['orderedNewMaterialIds']) for r in navs)==36
assert {r['goalId']:len(r['orderedNewMaterialIds']) for r in navs}=={'14c05eec-87af-5fd6-832a-4f5d9d280e66':13,'5317d078-413b-58bb-9262-d57387d51655':5,'5113c64b-405d-5f4b-bae9-70fe530b5e69':5,'1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc':5,'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3':1,'0fb8833c-4017-5052-819a-ecb5f6ebb36f':7}
for g in base['goals']:
 if g['id'] not in {r['goalId'] for r in navs}:assert gm[g['id']]==g
assert len(after['goals'])==633
body=save('whole-thirtysix-company-finance-consumer-foreign-KEEP-status-only-released.author-candidate.json',bodies);can=save('whole-current633-thirtysix-foreign-qualified-materials-sixNav-only.INERT-author-candidate.json',after);nav=save('actual-six-Nav-combined-ordered-child-union-and-three-shared-purposeful-prefix-fields.author.json',navs)
fi=load(ROOT/fr['full183ReferenceAndIndividualCountryCourseClosureIndex']['path']);ci=load(ROOT/cr['fullReferenceIndex']['path']);frows={r['activePath']:r for r in fi['viewRows']};crows={r['activePath']:r for r in ci['viewRows']};aft=O/'whole-after35views';aft.mkdir();views=[]
for p in sorted((O/'whole-before35views').glob('*.json')):
 rel='curricula/DE/Gymnasium/composition-views/wirtschaft/'+p.name;b=load(p);n=copy.deepcopy(b);add=[];nids=[]
 for ix in [frows[rel],crows[rel]]:
  old=load(ROOT/ix['before']['path']);whole=load(ROOT/ix['candidate']['path']);assert old==b
  if ix['newReferenceCount']:
   beforeChildren=old['rootNodes'][0]['children'];assert whole['rootNodes'][0]['children'][:len(beforeChildren)]==beforeChildren;add+=copy.deepcopy(whole['rootNodes'][0]['children'][len(beforeChildren):]);nids+=ix['newMaterialIds']
  else:assert whole==old
 if add:n['rootNodes'][0]['children']+=add;n['viewId']='de-gym-economics-'+p.stem+'-company-finance-consumer36-current597-20261010-author-v1'
 assert len(n['viewId'])<=255 and len(nids)==len(set(nids));path=aft/p.name;path.write_text(json.dumps(n,ensure_ascii=False,indent=2)+'\n');cp=CAP/rel;guard(cp);cp.write_bytes(path.read_bytes());views.append({'activePath':rel,'before':bind(p),'candidate':bind(path),'newMaterialIds':nids,'newReferenceCount':len(nids),'companyFinanceReferenceCount':frows[rel]['newReferenceCount'],'consumerReferenceCount':crows[rel]['newReferenceCount'],'oldOrderedStructureChildrenExactPrefix':True,'ordinarySupportMemoryPOnlyRefsAdded':0})
assert sum(r['newReferenceCount'] for r in views)==338;assert sum(bool(r['newReferenceCount']) for r in views)==34
guard(CAP/R);(CAP/R).write_bytes((ROOT/can['path']).read_bytes())
helper=(OLD/'app/scripts/companyFinance24Current597Combined621ScopeAuthorA.mts').read_text().replace('whole-twentyfour-company-finance-foreign-KEEP-status-only-released.author-candidate.json','whole-thirtysix-company-finance-consumer-foreign-KEEP-status-only-released.author-candidate.json').replace('whole1536CombinedCompanyFinanceMaterialContextBindings','whole2304CombinedCompanyFinanceConsumerMaterialContextBindings');hp=CAP/'app/scripts/companyFinanceConsumer36Current597Combined633ScopeAuthorA.mts';assert hp.resolve().is_relative_to(CAP.resolve()) and not hp.is_symlink();hp.write_text(helper)
refrows=fi['companyWholePerReferenceBindings']+fi['financeWholePerReferenceBindings']+ci['perReferenceWholeBindings'];assert len(refrows)==338
index=save('actual-fieldwise633-thirtysix-foreign-qualified-sixNav338-references-author-index.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_COMBINED_SCOPE_QS','activeCanonicalPath':R,'wholeBeforeCAN':bind(O/'whole-current597-before-combined633.active-exact.json'),'wholeAfterCAN':can,'whole36ForeignQualifiedStatusOnlyBodies':body,'wholeSixNavFieldDeltas':nav,'companyFinanceAuthorHandoff':bind(fh),'consumerAuthorHandoff':bind(ch),'companyFinanceReferenceIndex':fr['full183ReferenceAndIndividualCountryCourseClosureIndex'],'consumerReferenceIndex':cr['fullReferenceIndex'],'companyScienceReceipt':fr['companyForeignScienceReceipt'],'financeScienceReceipt':fr['financeForeignScienceReceipt'],'consumerScienceReceipt':cr['wholeQualifiedScienceReceipt'],'newMaterialIds':[g['id'] for g in bodies],'viewRows':views,'perReferenceWholeBindings':refrows,'actual338ExplicitNewMaterialReferences':338,'actual280CountryReferences':280,'actual58NationalReferences':58,'actualCombinedChangedViews':34,'actualWholeVisibleBindings560':560,'twoFinancePracticeContextsOverExistingF90POnlyAuthorisedByRoot':True,'all18FinanceAnd14ConsumerClosureContextsHeld':True,'old597SourceAndTargetUniverseExact':True,'originalP336Cases685Exact':True,'activeWrites':0,'humanApproval':False,'ownScopeKEEP':False})
save('actual-combined633-private-physical-current597-input-start.freeze.json',{'role':'AUTHOR_PRIVATE_WHOLE_CURRENT597','privateCapsule':str(CAP),'actualWholeBeforeInputs81':guards,'privateResolveAndSamefileBeforeEveryWrite':True,'privateConfigSourceSEMViewsPhysical':True,'activeWrites':0})
print(json.dumps({'privateCAP':str(CAP),'candidate':can,'index':index,'refs338':338,'sharedNavs':3}))
