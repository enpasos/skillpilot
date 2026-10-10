"""Read-only baseline / inert technical followers; combined foreign scope pending."""
import pathlib,copy,json,hashlib,shutil,tempfile
R=pathlib.Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-SEM-P43-book-technical-author-b-followers-v1';O.mkdir(exist_ok=True)
V=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current678-international-operations-policy33-20261010-v17'
I=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1'
def rd(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return dict(path=str(p.relative_to(R)),sha256=h(p),bytes=p.stat().st_size)
def ck(x):p=R/x['path'];assert h(p)==x['sha256'] and p.stat().st_size==x['bytes'];return p
def save(n,a):p=O/n;assert not p.exists();p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');return b(p)
ip=I/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json';ix=rd(ip);bp=ck(ix['wholeBeforeCAN']);ap=ck(ix['wholeAfterCAN']);assert h(bp)=='94898ce66c1fca3d7cdbfbd36a7cd1172cf67fd0c71a46a104fff92254806bae';assert h(ap)=='8bd9f088a0c1d3e6231929112b9f8ed8d9028c814d1729e6cf35661f6502fa38'
before=rd(bp);after=rd(ap);assert len(before['goals'])==645 and len(after['goals'])==678;bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']}
nav=rd(ck(ix['fiveWholeNavDeltas']));allowed={x['goalId'] for x in nav};assert len(allowed)==5;assert {id for id in bg if bg[id]!=ag[id]}==allowed
materials=rd(ck(ix['wholeForeign33StatusOnlyBodies']));assert len(materials)==33 and set(ix['newMaterialIds'])=={g['id']for g in materials};foreign=[];drafts={}
for key,field,num in [('internationalScienceReceipt','actualReviewedWhole12Body',12),('operationsScienceReceipt','actualReviewedWhole14FinalBody',14),('policyScienceReceipt','wholeFinalReviewedSevenDRAFT',7)]:
 p=ck(ix[key]);s=rd(p);q=ck(s[field]);rows=rd(q);rows=rows['materials']if isinstance(rows,dict)else rows;assert len(rows)==num
 for g in rows:assert g['id']not in drafts;drafts[g['id']]=g
 foreign.append({'package':key,'wholeForeignScientificReceipt':b(p),'wholeQualifiedDraftInput':b(q),'materialIds':[g['id']for g in rows]})
kindbindings=[]
for g in materials:
 id=g['id'];assert id not in bg and ag[id]==g;d=copy.deepcopy(g);assert d['examData']['reviewStatus']=='released';d['examData']['reviewStatus']='draft';assert isinstance(d['examData']['reviewNote'],str);del d['examData']['reviewNote'];assert d==drafts[id],id
 assert g['requires']==g['examData']['coveredGoalIds'] and g['extendedData']['applicabilityFromRequires'] is True
 kindbindings.append({'materialId':id,'semanticKindCandidate':'practiceAssessment','actualOnlyMachineStatusAndNoteDifference':True,'foreignSciencePackage':next(f['package']for f in foreign if id in f['materialIds']),'decisionBasis':'reviewed-current-pilot-practice-assessment','noNewWholeScienceDecision':True})
rp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=rd(rp);sub=next(s for s in reg['subjects']if s['subject']=='wirtschaftswissenschaften');oldsem=R/sub['semanticKindLedgerPath'];assert rd(oldsem)['counts']['total']==645
book=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json';assert h(book)=='3bf00f3c21adc8b878ab56f4f3bdc591ec5939089d0bac1e7e51ace2732cd3b2'
oldcopies={}
for k,p in [('Registry',rp),('SEM',oldsem),('BookConfig',book)]:
 dst=O/('whole-active645-v16-'+k+'-before-v17.exact.json');assert not dst.exists();shutil.copyfile(p,dst);oldcopies[k]=b(dst)
cap=pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-current678-technical-author-B-'))/'capsule';src=pathlib.Path('/tmp/skillpilot-current645-technical-author-B-126yltz8/capsule');shutil.copytree(src,cap,symlinks=True)
def install(p,rel=None):
 dst=cap/(rel or p.relative_to(R).as_posix());dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.is_symlink();dst.write_bytes(p.read_bytes());assert not dst.samefile(p)and dst.read_bytes()==p.read_bytes();return dst
canrel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';install(ap,canrel);install(bp,bp.relative_to(R).as_posix());install(ap);install(oldsem);install(rp);install(book)
original=[];profiles={}
for rel in sub['positiveEvidenceConfigPaths']:
 p=R/rel;c=rd(p);install(p)
 for key in ['reviewPath','reviewCriteriaPath']:install(R/c[key])
 for rel1 in c.get('reviewRunManifestPaths',[]):install(R/rel1)
 for l in (R/c['reviewPath']).read_text().splitlines():
  if l.strip():r=json.loads(l);assert r['goalId']not in profiles;profiles[r['goalId']]=r
 original.append({'config':b(p),'reviewWholeBytes':b(R/c['reviewPath']),'criteria':b(R/c['reviewCriteriaPath'])})
assert len(original)==43 and len(profiles)==336 and sum(len(r['profile']['applicationCaseBriefs'])for r in profiles.values())==685
assert all(r['status']=='needs_human_review'and r['reviewAuthority']=='ai_candidate'for r in profiles.values())
bridge={'role':'TECHNICAL_AUTHOR_SEM_P_BOOK_ONLY; Root combined678 scope pending; no active integration','canonicalBefore':b(bp),'canonicalCandidate':b(ap),'oldSEM':b(oldsem),'oldRegistry':b(rp),'oldBookConfig':b(book),'immutableOldInputCopies':oldcopies,'wholeFieldwiseAuthorIndex':b(ip),'wholeFiveNavDeltas':b(ck(ix['fiveWholeNavDeltas'])),'allowedChangedOldGoalIds':sorted(allowed),'newQualifiedPracticeGoalIds':ix['newMaterialIds'],'foreignWholeScientificBindings':foreign,'individualKindAuthorBindings':kindbindings,'sourceLandscapePath':canrel,'newSEMPath':str((V/'wirtschaftswissenschaften.semantic-kinds.json').relative_to(R)),'actualOriginalP43ConfigReviewCriteriaBindings':original,'privatePhysicalCapsule':str(cap),'activeCurrent645SourceRegistryBookStillExact':True,'pendingForeign678Scope':True,'strictNetGain':0,'humanApproval':False,'activeWrites':0}
save('actual-current678-five-native-Nav-FPs33-foreign-kind-only-author-inputs.json',bridge);shutil.copyfile('/tmp/prepare_678_technical_B.py',O/'prepare_current678_technical_inputs.py')
pathlib.Path('/tmp/economics-current678-technical-B-capsule-path.txt').write_text(str(cap)+'\n');print(json.dumps({'capsule':str(cap),'SEMBefore':645,'SEMAfter':678,'allowedOldNavChanges':5,'newPracticeKinds':33,'ordinary':336,'P43Cases':685,'foreignScopePending':True}))
