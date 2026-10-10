from pathlib import Path
import json,gzip,copy,os,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-M4-twelve-foreign-company-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-company12-current597-author-a-e3_teq0o/capsule');VR=Path('curricula/DE/Gymnasium/composition-views/wirtschaft')
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(p,x):assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve());assert not p.is_symlink();assert not os.path.samefile(p,ROOT/p.relative_to(CAP))
x=json.loads(gzip.decompress((O/'own-initial609-company12-statusNav-whole-scope-author-A.actual-native.json.gz').read_bytes()));assert x['compiler']['summary']['errors']==x['compiler']['summary']['warnings']==0;matrix=x['whole768CompanyMaterialContextBindings'];eligible=[r for r in matrix if r['actualWholeClosureEligible']];assert len(eligible)==190 and all(r['allCoveredOrdinaryTargets'] for r in eligible)
mats=read(O/'whole-twelve-company-foreign-KEEP-status-only-released.author-candidate.json');mm={g['id']:g for g in mats};refmap={}
for r in eligible:refmap.setdefault((r['viewPath'],r['materialId']),[]).append(r)
assert len(refmap)==116;aft=O/'whole-after35views';aft.mkdir(exist_ok=False);rows=[];perrefs=[]
for p in sorted((O/'whole-before35views').glob('*.json')):
 v=read(p);n=copy.deepcopy(v);rel=str(VR/p.name);ids=[g['id'] for g in mats if (rel,g['id']) in refmap];root=n['rootNodes'][0];assert root['kind']=='structure'
 if ids:
  children=[]
  for phase,label in [('E','Unternehmen: vollständige E-Fallübungen'),('Katalog','Unternehmensstrategien und Prozessorganisation: Fallübungen'),('Q4','Unternehmensverantwortung: vollständige Q4-Fallübungen')]:
   ps=[i for i in ids if mm[i]['phase']==phase]
   if ps:children.append({'kind':'structure','id':'company12-'+phase.lower()+'-'+p.stem,'label':label,'children':[{'kind':'goalEntry','goalId':i,'displayLabel':mm[i]['title'],'projectionRole':'target'} for i in ps]})
  root['children'].append({'kind':'structure','id':'company12-whole-'+p.stem,'label':'Weitere Unternehmensfallübungen','children':children})
  n['viewId']='de-gym-economics-'+p.stem+'-company12-current597-20261010-author-v1';assert len(n['viewId'])<=255
  for i in ids:perrefs.append({'viewPath':rel,'materialId':i,'projectionRole':'target','wholeActualCountryCourseClosureBindings':refmap[(rel,i)],'scientificBodyUnchanged':True,'sourceClaimAdded':False,'existingPOnlyPracticeException':False})
 before=bind(p);after=save(aft/p.name,n);rows.append({'activePath':rel,'before':before,'candidate':after,'newMaterialIds':ids,'newReferenceCount':len(ids),'oldRootStructureFieldsAndOrderedChildrenPreserved':True,'newOrdinaryOrSupportReferences':0})
 cp=CAP/rel;guard(cp);cp.write_text(json.dumps(n,ensure_ascii=False,indent=2)+'\n')
assert sum(r['newReferenceCount'] for r in rows)==116
save(O/'actual-company12-116-material-references-and190-whole-context-bindings.author-index.json',{'role':'AUTHOR_ACCESS_ONLY_PENDING_INDEPENDENT_SCOPE_QS','activeCanonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','canonicalBefore':bind(O/'whole-current597-before-company-scope.active-exact.json'),'canonicalCandidate':bind(O/'whole-current609-company12-threeNav-actual-child-union.INERT-author-candidate.json'),'foreignScienceIntake':bind(O/'actual-final-company12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json'),'newMaterialIds':[g['id'] for g in mats],'viewRows':rows,'perReferenceWholeBindings':perrefs,'actualReferences':116,'actualCountryReferences':95,'actualNationalReferences':21,'actualChangedViews':sum(bool(r['newMaterialIds']) for r in rows),'actualWholeVisibleBindings':190,'explicitOrdinarySupportMemoryOrPOnlyAdditions':0,'all768ActualPreAccessCountryCourseClosureRows':matrix,'scopeApproval':False,'humanApproval':False,'activeWrites':0})
print(json.dumps({'refs':116,'country':95,'national':21,'wholeBindings':190,'changedViews':sum(bool(r['newMaterialIds']) for r in rows)}))
