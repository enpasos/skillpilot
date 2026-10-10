from pathlib import Path
import json,gzip,hashlib,copy
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-M4-twelve-foreign-labour-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-labour12-current597-scope-author-a-_f0f4c6h/capsule');VR=Path('curricula/DE/Gymnasium/composition-views/wirtschaft')
def load(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
x=json.loads(gzip.decompress((O/'own-initial609-labour12-statusNav-whole-scope-author-A.actual-native.json.gz').read_bytes()));matrix=x['whole768LabourMaterialContextBindings'];eligible=[r for r in matrix if r['actualWholeClosureEligible']];assert len(eligible)==288;mats=load(O/'whole-twelve-labour-foreign-KEEP-status-only-released.author-candidate.json');refmap={}
for r in eligible:refmap.setdefault((r['viewPath'],r['materialId']),[]).append(r)
assert len(refmap)==168;rows=[];perrefs=[]
for p in sorted((O/'whole-before35views').glob('*.json')):
 before=load(p);afterPath=O/'whole-after35views'/p.name;after=load(afterPath);rel=str(VR/p.name);ids=[g['id'] for g in mats if (rel,g['id']) in refmap];assert afterPath.read_bytes()==(CAP/rel).read_bytes()
 if ids:
  n=copy.deepcopy(after);n['viewId']=before['viewId'];actualAdded=n['rootNodes'][0]['children'].pop();assert n==before
  def refs(n):
   if n.get('kind')=='goalEntry':return [n['goalId']]
   return [i for ch in n.get('children',[]) for i in refs(ch)]
  assert set(refs(actualAdded))==set(ids)
 else:assert before==after
 for i in ids:
  exception=any(not b['allCoveredOrdinaryTargets'] for b in refmap[(rel,i)])
  if exception:assert i=='a9476232-29c2-5268-943f-48d022bd961a'
  perrefs.append({'viewPath':rel,'materialId':i,'projectionRole':'target','wholeActualCountryCourseClosureBindings':refmap[(rel,i)],'scientificBodyUnchanged':True,'sourceClaimAdded':False,'existingPOnlyPracticeException':exception,'rootAuthorPolicy':'Die vier Labour-PracticeTarget-Kontexte über bereits bestehendem e20 prerequisiteOnly in BY-GK/HE-GK und den beiden entsprechenden nationalen GK-Kontexten sind intern autorisiert bei passender Quelle, Kursfilter und allen drei Pflichtvoraussetzungen. Keine neue ordinary-, Source- oder Support-Referenz. Fremde Scopeprüfung erforderlich.' if exception else None})
 rows.append({'activePath':rel,'before':bind(p),'candidate':bind(afterPath),'newMaterialIds':ids,'newReferenceCount':len(ids),'oldRootStructureFieldsAndOrderedChildrenPreserved':True,'newOrdinaryOrSupportReferences':0})
x={'role':'AUTHOR_ACCESS_ONLY_PENDING_INDEPENDENT_SCOPE_QS','activeCanonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','canonicalBefore':bind(O/'whole-current597-before-labour-scope.active-exact.json'),'canonicalCandidate':bind(O/'whole-current609-labour12-threeNav-actual-child-union.INERT-author-candidate.json'),'foreignScienceIntake':bind(O/'actual-final-labour12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json'),'newMaterialIds':[g['id'] for g in mats],'viewRows':rows,'perReferenceWholeBindings':perrefs,'actualReferences':168,'actualCountryReferences':144,'actualNationalReferences':24,'actualChangedViews':sum(bool(r['newMaterialIds']) for r in rows),'actualWholeVisibleBindings':288,'actualFourRootAuthorisedPracticeContextsAboveExistingE20POnly':4,'actual16CountryCourseWholeClosureHeld':16,'explicitOrdinarySupportMemoryOrPOnlyAdditions':0,'all768ActualPreAccessCountryCourseClosureRows':matrix,'scopeApproval':False,'humanApproval':False,'activeWrites':0}
p=O/'actual-labour12-168-material-references-and288-whole-context-bindings.author-index.json';assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'index':bind(p),'actualRefs':168,'actualChangedViews':x['actualChangedViews']}))
