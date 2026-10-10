from pathlib import Path
import json,gzip,copy,os,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-M4-twelve-foreign-finance-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-finance12-current597-author-a-lfsczlp3/capsule');VR=Path('curricula/DE/Gymnasium/composition-views/wirtschaft')
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(p,x):assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve());assert not p.is_symlink();assert not os.path.samefile(p,ROOT/p.relative_to(CAP))
x=json.loads(gzip.decompress((O/'own-initial609-finance12-statusNav-whole-scope-author-A.actual-native.json.gz').read_bytes()));assert x['compiler']['summary']['errors']==x['compiler']['summary']['warnings']==0;matrix=x['whole768FinanceMaterialContextBindings'];eligible=[r for r in matrix if r['actualWholeClosureEligible']];assert len(eligible)==108 and sum(not r['allCoveredOrdinaryTargets'] for r in eligible)==2
assert all(r['allCoveredOrdinaryTargets'] or (r['materialId']=='beeba149-789d-55ff-a295-e02c68629998' and r['jurisdiction']=='DE-BB' and r['courseProfile']=='GK' and r['allCoveredExistingPrerequisiteOnly'] and len(r['wholeTransitivePrerequisiteIds'])==10) for r in eligible)
mats=read(O/'whole-twelve-finance-foreign-KEEP-status-only-released.author-candidate.json');mm={g['id']:g for g in mats};refmap={}
for r in eligible:refmap.setdefault((r['viewPath'],r['materialId']),[]).append(r)
assert len(refmap)==67;aft=O/'whole-after35views';aft.mkdir(exist_ok=False);rows=[];perrefs=[]
for p in sorted((O/'whole-before35views').glob('*.json')):
 v=read(p);n=copy.deepcopy(v);rel=str(VR/p.name);ids=[g['id'] for g in mats if (rel,g['id']) in refmap];root=n['rootNodes'][0];assert root['kind']=='structure'
 if ids:
  children=[]
  for phase,label in [('E','Innovation: vollständige E-Fallübungen'),('Q1','Strategische Entscheidungen und Ordnungsvergleich: Q1-Fallübungen'),('Q2','Wettbewerbsprüfung: vollständige LK-Fallübungen'),('Q3','Finanzsystem und Integration: vollständige LK-Fallübungen')]:
   ps=[i for i in ids if mm[i]['phase']==phase]
   if ps:children.append({'kind':'structure','id':'finance12-'+phase.lower()+'-'+p.stem,'label':label,'children':[{'kind':'goalEntry','goalId':i,'displayLabel':mm[i]['title'],'projectionRole':'target'} for i in ps]})
  root['children'].append({'kind':'structure','id':'finance12-whole-'+p.stem,'label':'Weitere Wirtschafts- und Finanzfallübungen','children':children})
  n['viewId']='de-gym-economics-'+p.stem+'-finance12-current597-20261010-author-v1';assert len(n['viewId'])<=255
  for i in ids:perrefs.append({'viewPath':rel,'materialId':i,'projectionRole':'target','wholeActualCountryCourseClosureBindings':refmap[(rel,i)],'scientificBodyUnchanged':True,'sourceClaimAdded':False,'existingPOnlyPracticeException':any(not b['allCoveredOrdinaryTargets'] for b in refmap[(rel,i)]), 'rootAuthorPolicy': 'Genau beeba149 für BB-GK und nationalen BB-GK-Kontext als PracticeTarget über bestehendem f90 prerequisiteOnly; keine Scope-, Source-, Support- oder gewöhnliche Zielerweiterung.' if any(not b['allCoveredOrdinaryTargets'] for b in refmap[(rel,i)]) else None})
 before=bind(p);after=save(aft/p.name,n);rows.append({'activePath':rel,'before':before,'candidate':after,'newMaterialIds':ids,'newReferenceCount':len(ids),'oldRootStructureFieldsAndOrderedChildrenPreserved':True,'newOrdinaryOrSupportReferences':0})
 cp=CAP/rel;guard(cp);cp.write_text(json.dumps(n,ensure_ascii=False,indent=2)+'\n')
assert sum(r['newReferenceCount'] for r in rows)==67
save(O/'actual-finance12-116-material-references-and190-whole-context-bindings.author-index.json',{'role':'AUTHOR_ACCESS_ONLY_PENDING_INDEPENDENT_SCOPE_QS','activeCanonicalPath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','canonicalBefore':bind(O/'whole-current597-before-finance-scope.active-exact.json'),'canonicalCandidate':bind(O/'whole-current609-finance12-threeNav-actual-child-union.INERT-author-candidate.json'),'foreignScienceIntake':bind(O/'actual-final-finance12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json'),'newMaterialIds':[g['id'] for g in mats],'viewRows':rows,'perReferenceWholeBindings':perrefs,'actualReferences':67,'actualCountryReferences':54,'actualNationalReferences':13,'actualChangedViews':sum(bool(r['newMaterialIds']) for r in rows),'actualWholeVisibleBindings':108, 'actualTwoRootAuthorisedPracticeContextsAboveExistingF90POnly':2, 'actual18CountryCourseWholeClosureHeld':18,'explicitOrdinarySupportMemoryOrPOnlyAdditions':0,'all768ActualPreAccessCountryCourseClosureRows':matrix,'scopeApproval':False,'humanApproval':False,'activeWrites':0})
print(json.dumps({'refs':67,'country':54,'national':13,'wholeBindings':108,'changedViews':sum(bool(r['newMaterialIds']) for r in rows)}))
