from pathlib import Path
import json,copy,hashlib,os,gzip,shutil,tempfile
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';CO=Q/'wirtschaft-M4-twelve-foreign-company-current597-status-nav-scope-author-a-v1';O=Q/'wirtschaft-M4-twelve-foreign-finance-current597-status-nav-scope-author-a-v1';O.mkdir(exist_ok=False);CC=Path('/tmp/economics-company12-current597-author-a-e3_teq0o/capsule');CAP=Path(tempfile.mkdtemp(prefix='economics-finance12-current597-author-a-'))/'capsule';shutil.copytree(CC,CAP,symlinks=True);Path('/tmp/economics-finance12-current597-author-a-path.txt').write_text(str(CAP)+'\n');R='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def load(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':h(p),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve());assert not p.is_symlink();assert not os.path.samefile(p,ROOT/p.relative_to(CAP))
inputs=load(CO/'actual-current597-private-physical-start-readonly-before-foreign-science.freeze.json')['actualWholeBeforeInputs'];copies=[]
for r in inputs:
 src=ROOT/r['path'];assert h(src)==r['sha256'];p=CAP/r['path'];guard(p);p.write_bytes(src.read_bytes());copies.append({**bind(src),'privateResolveSamefileGuarded':True})
for src,name in [(CO/'whole-current597-before-company-scope.active-exact.json','whole-current597-before-finance-scope.active-exact.json'),(CO/'whole-current597-central-registry.readonly.json','whole-current597-central-registry.readonly.json'),(CO/'whole-current597-semantic-kinds.readonly.json','whole-current597-semantic-kinds.readonly.json')]:shutil.copyfile(src,O/name)
shutil.copytree(CO/'whole-before35views',O/'whole-before35views')
receipt=Q/'wirtschaft-M4-twelve-finance-whole-science-independent-root-v1/actual-final-twelve-finance-whole-DEEN-science-two-real-remedies-independent-KEEP.handoff.receipt.json';assert h(receipt)=='4f98d06d4e0bd6e2b750961e97470caf458b9a440ab2fdfb105a8f9d281d2e18';rc=load(receipt);assert rc['finalIndependentKEEP']==12
for k in ['wholeFinalAuthorInput','authorFinalHandoff','wholeIndividualScientificDecisions','actualWholeEndguard']:
 assert h(ROOT/rc[k]['path'])==rc[k]['sha256'];assert (ROOT/rc[k]['path']).stat().st_size==rc[k]['bytes']
bodies=load(ROOT/rc['wholeFinalAuthorInput']['path']);assert len(bodies)==12
base=load(O/'whole-current597-before-finance-scope.active-exact.json');assert h(ROOT/R)==h(O/'whole-current597-before-finance-scope.active-exact.json')=='6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3'
bn=json.loads(gzip.decompress((Q/'wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1/own-before-current597-consumer12-author-A.actual-native.json.gz').read_bytes()));compiled={g['goalId']:g for g in bn['compiler']['goals']}
navs={'E':'14c05eec-87af-5fd6-832a-4f5d9d280e66','Q1':'1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc','Q2':'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3','Q3':'0fb8833c-4017-5052-819a-ecb5f6ebb36f'}
desc={
'E':(' Eine weitere eigenständige E-Fallübung unterscheidet betriebliche Innovationsbefunde von gesellschaftlichen Wirkungen.',' An additional standalone E-phase case distinguishes business innovation findings from societal effects.'),
'Q1':(' Weitere eigenständige Q1-Fälle modellieren unterschiedliche strategische Konflikte, prüfen wiederholte Handlungspläne und vergleichen Gemeinwohlregeln mit freiwilligen Unternehmensberichten.',' Further standalone Q1 cases model different strategic conflicts, examine repeated action plans, and compare common-good rules with voluntary business reporting.'),
'Q2':(' Eine weitere eigenständige LK-Fallübung prüft Wettbewerbsabsprachen und Zusammenschlüsse anhand der bereitgestellten Kriterien.',' An additional standalone LK case evaluates restrictive agreements and mergers using the supplied criteria.'),
'Q3':(' Weitere eigenständige LK-Fälle behandeln Finanzstress, Bankenaufsicht und Systemrisiken, Derivate sowie Kohäsion und institutionelle Integration. Sie behalten ihre vollständigen Voraussetzungen und ausschließliche LK-Kursgrenze.',' Further standalone LK cases address financial stress, banking supervision and systemic risks, derivatives, cohesion, and institutional integration. They retain their complete prerequisites and exclusive LK course limits.')}
after=copy.deepcopy(base);am={g['id']:g for g in after['goals']};released=[];rows=[]
for g in bodies:
 assert g['id'] not in am;assert g['examData']['reviewStatus']=='draft';assert g['requires']==g['examData']['coveredGoalIds'] and len(g['requires'])==1
 n=copy.deepcopy(g);n['examData']['reviewStatus']='released';n['examData']['reviewNote']='Maschinelle fachliche Curriculum-QS durch unabhängige KI-Prüfung abgeschlossen: '+str(receipt.relative_to(ROOT))+'. Menschliche Prüfung, Freigabe und Erprobung bleiben getrennt; keine menschliche Freigabe behauptet.';released.append(n);after['goals'].append(n);am[n['id']]=n
 e=copy.deepcopy(n['examData']);e.pop('reviewNote');e['reviewStatus']='draft';assert e==g['examData'];assert all(n[k]==g[k] for k in g if k!='examData')
for phase,nid in navs.items():
 old=next(g for g in base['goals'] if g['id']==nid);n=am[nid];ids=[g['id'] for g in released if g['phase']==phase];assert len(ids)=={'E':1,'Q1':3,'Q2':1,'Q3':7}[phase];n['contains']+=ids;n['description']+=desc[phase][0];n['descriptionEn']+=desc[phase][1]
 union=sorted(set(c for child in n['contains'] for c in (compiled[child] if child in compiled else compiled[am[child]['requires'][0]])['compiledApplicability'].get('jurisdiction',[])));previous=n.get('applicability',{}).get('jurisdiction')
 if isinstance(previous,list) and sorted(previous)!=union:n['applicability']['jurisdiction']=union
 rows.append({'goalId':nid,'phase':phase,'newMaterialIds':ids,'wholeBefore':old,'wholeAfter':n,'actualChildJurisdictionUnion':union,'jurisdictionMetadataChanged':previous!=n.get('applicability',{}).get('jurisdiction'),'sourceClaimAdded':False})
for g in base['goals']:
 if g['id'] not in navs.values():assert am[g['id']]==g
assert len(after['goals'])==609
body=save('whole-twelve-finance-foreign-KEEP-status-only-released.author-candidate.json',released);can=save('whole-current609-finance12-fourNav-actual-child-union.INERT-author-candidate.json',after);nav=save('actual-four-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json',rows)
intake=save('actual-final-finance12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json',{'role':'AUTHOR_STATUS_NAV_SCOPE_ONLY_NO_OWN_FOREIGN_KEEP','foreignScienceReceipt':bind(receipt),'qualifiedFinalAuthorHandoff':rc['authorFinalHandoff'],'qualifiedWhole12':rc['wholeFinalAuthorInput'],'foreignScientificIndividualWholeDecisions':rc['wholeIndividualScientificDecisions'],'foreignWholeCurrent12GoalP24Endguard':rc['actualWholeEndguard'],'wholeTaskSolutionScoringTagsRequiresAndCoveredExact':True,'statusOnly12WithExplicitAIReviewNote':body,'actualPurposefulNavAndDerivedFieldRows':nav,'wholeBeforeCanonical':bind(O/'whole-current597-before-finance-scope.active-exact.json'),'wholeAfterCanonical':can,'navPhaseCounts':{'E':1,'Q1':3,'Q2':1,'Q3':7},'LKOnlyMaterials':[g['id'] for g in released if 'GK' not in g['tags']],'humanApproval':False,'activeWrites':0})
save('actual-current597-finance-private-physical-start-after-foreign-science.freeze.json',{'role':'AUTHOR_PHYSICAL_COPY_CURRENT597','privateCapsule':str(CAP),'actualWholeBeforeInputs':copies,'allPrivateCopiesResolveAndSamefileGuarded':True,'activeWrites':0})
guard(CAP/R);(CAP/R).write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
helper=(CC/'app/scripts/company12Current597WholeStatusNavScopeAuthorA.mts').read_text().replace('whole-twelve-company-foreign-KEEP-status-only-released.author-candidate.json','whole-twelve-finance-foreign-KEEP-status-only-released.author-candidate.json').replace('whole768CompanyMaterialContextBindings','whole768FinanceMaterialContextBindings');(CAP/'app/scripts/finance12Current597WholeStatusNavScopeAuthorA.mts').write_text(helper)
print(json.dumps({'privateCAP':str(CAP),'candidate':can,'body':body,'intake':intake,'navMetadataChanged':[r['goalId'] for r in rows if r['jurisdictionMetadataChanged']]}))
