"""Physical native capsule and field-only metadata followers, no active writes."""
import copy,json,hashlib,shutil,tempfile
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';I=Q/'wirtschaft-current645-company-finance-consumer-labour48-current597-fieldwise-status-nav-scope-author-a-v1'
V=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current645-company-finance-consumer-labour48-20261010-v16'
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return dict(path=str(p.relative_to(ROOT)),sha256=h(p),bytes=p.stat().st_size)
def rd(p):return json.loads(p.read_text())
def ck(x):p=ROOT/x['path'];assert h(p)==x['sha256'] and p.stat().st_size==x['bytes'];return p
def wr(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return b(p)
hp=I/'actual-final-current645-company-finance-consumer-labour48-sixNav506-foreign-whole-science-bound.author-handoff.json';H=rd(hp);assert h(hp)=='6b42723c10fd31008826d19965c53a1dafc3ead85c648401d8fc49a9a0689700'
bp=ck(H['wholeBeforeCAN']);ap=ck(H['wholeAfterCAN']);before=rd(bp);after=rd(ap);assert len(before['goals'])==597 and len(after['goals'])==645
active=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert active.read_bytes()==bp.read_bytes()
rp=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=rd(rp);sub=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');oldsem=ROOT/sub['semanticKindLedgerPath'];assert len(rd(oldsem)['decisions'])==597
nav=rd(ck(H['sixWholeNavDeltasWithThreeSharedUnions']));assert len(nav)==6
bm={g['id']:g for g in before['goals']};am={g['id']:g for g in after['goals']};allowed={x['goalId'] for x in nav}
for x in nav:assert x['wholeBefore']==bm[x['goalId']] and x['wholeAfter']==am[x['goalId']]
assert {id for id in bm if bm[id]!=am[id]}==allowed
materials=rd(ck(H['whole48StatusOnlyReleasedBodies']));assert len(materials)==48
sourceKeys=[('companyForeignScienceReceipt','qualifiedFinalWhole12'),('financeForeignScienceReceipt','wholeFinalAuthorInput'),('consumerForeignScienceReceipt','wholeFinalReviewedDraftBody'),('labourForeignScienceReceipt','wholeFinalTwelveDRAFT')]
foreign=[];draft={}
for key,field in sourceKeys:
 p=ck(H[key]);r=rd(p);w=ck(r[field]);m=rd(w);m=m['materials'] if isinstance(m,dict) else m;assert len(m)==12
 for g in m:assert g['id'] not in draft;draft[g['id']]=g
 foreign.append(dict(package=key,wholeForeignScientificReceipt=b(p),wholeQualifiedDraftInput=b(w),materialIds=[g['id'] for g in m]))
rows=[]
for g in materials:
 id=g['id'];assert id not in bm and am[id]==g
 d=copy.deepcopy(g);e=d['examData'];assert e['reviewStatus']=='released';assert isinstance(e['reviewNote'],str)
 e['reviewStatus']='draft';del e['reviewNote'];assert d==draft[id],id
 assert g['requires']==g['examData']['coveredGoalIds'] and g['extendedData']['applicabilityFromRequires'] is True
 rows.append(dict(materialId=id,semanticKindCandidate='practiceAssessment',decisionBasis='reviewed-current-pilot-practice-assessment',foreignSciencePackage=next(x['package'] for x in foreign if id in x['materialIds']),actualOnlyMachineStatusAndNoteDifference=True,noNewWholeScienceDecision=True))
scope633=Q/'wirtschaft-current633-company-finance-consumer-independent-combined-scope-root-v1/actual-final-current633-company-finance-consumer36-combined-scope-nav-independent-KEEP.handoff.receipt.json';assert h(scope633).startswith('b0188478')
bridge=dict(role='TECHNICAL_AUTHOR_SEM_P_BOOK_ONLY; combined645 independent scope remains separate',authorHandoff=b(hp),canonicalBefore=b(bp),canonicalCandidate=b(ap),oldSEM=b(oldsem),oldRegistry=b(rp),sixWholeNavDeltas=b(ck(H['sixWholeNavDeltasWithThreeSharedUnions'])),allowedChangedOldGoalIds=sorted(allowed),newQualifiedPracticeGoalIds=[g['id'] for g in materials],foreignWholeScientificBindings=foreign,individualKindAuthorBindings=rows,existingForeign633Scope=b(scope633),foreign645ScopeStillRequired=True,sourceLandscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',newSEMPath=str((V/'wirtschaftswissenschaften.semantic-kinds.json').relative_to(ROOT)),activeWrites=0,strictNetGain=0,humanApproval=False)
wr('actual-current645-six-native-Nav-FPs48-foreign-kind-only-author-inputs.json',bridge)
cap=Path(tempfile.mkdtemp(prefix='skillpilot-current645-technical-author-B-'))/'capsule';cap.mkdir();(cap/'app').mkdir()
shutil.copytree(ROOT/'app/scripts',cap/'app/scripts',symlinks=False);shutil.copytree(ROOT/'app/src',cap/'app/src',symlinks=False);shutil.copytree(ROOT/'contracts',cap/'contracts',symlinks=False)
(cap/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True);(cap/'app/public').symlink_to(ROOT/'app/public',target_is_directory=True)
def cp(p,path=None):
 q=cap/(path or str(p.relative_to(ROOT)));q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes()
 else:shutil.copyfile(p,q)
 assert not q.samefile(p) and q.read_bytes()==p.read_bytes();return q
cp(ap,bridge['sourceLandscapePath']);cp(oldsem);cp(rp)
positive=[];profiles={}
for path in sub['positiveEvidenceConfigPaths']:
 p=ROOT/path;cfg=rd(p);cp(p)
 for key in ['reviewPath','reviewCriteriaPath']:cp(ROOT/cfg[key])
 for path1 in cfg.get('reviewRunManifestPaths',[]):cp(ROOT/path1)
 for l in (ROOT/cfg['reviewPath']).read_text().splitlines():
  if l.strip():
   r=json.loads(l);assert r['goalId'] not in profiles;profiles[r['goalId']]=r
 positive.append(dict(config=b(p),reviewWholeBytes=b(ROOT/cfg['reviewPath']),criteria=b(ROOT/cfg['reviewCriteriaPath'])))
assert len(positive)==43 and len(profiles)==336 and sum(len(r['profile']['applicationCaseBriefs']) for r in profiles.values())==685
assert all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' for r in profiles.values())
wr('actual-private645-physical-canonical-SEM-config-P43-source-receipt-bindings.json',dict(role='AUTHOR isolated physical645 capsule setup',capsule=str(cap),canonicalPrivate=str(cap/bridge['sourceLandscapePath']),canonicalPrivateSamefileActive=False,oldPConfigReviewCriteriaPhysicalCopiesExact=positive,original336RecordStatusesAuthorityExact=True,actualOriginalCases685=True,wholeNodeModulesAndVisualizationAssetsReadonlyShared=True,wholeVisualizationImagesUnchanged=True,foreignScienceReceipts=foreign,productionCodeBindings=[b(ROOT/'app/scripts'/f) for f in ['goalBookModel.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','generateCurriculumQualityStatus.ts','applicabilityCompiler.ts']],activeWrites=0))
Path('/tmp/economics-current645-technical-B-capsule-path.txt').write_text(str(cap)+'\n');print(json.dumps(dict(capsule=str(cap),oldNonNavGoals=591,changedNav=6,newKinds=48,originalProfiles=336,cases=685)))
