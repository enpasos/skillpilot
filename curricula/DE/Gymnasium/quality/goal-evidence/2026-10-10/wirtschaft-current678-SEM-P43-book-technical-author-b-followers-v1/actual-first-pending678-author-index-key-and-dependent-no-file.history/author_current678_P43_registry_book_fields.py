"""Only SEM pointers change in profiles; original evidence bytes stay original."""
from pathlib import Path
import json,hashlib,copy,shutil
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
V=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current678-international-operations-policy33-20261010-v17'
C=Path(Path('/tmp/economics-current678-technical-B-capsule-path.txt').read_text().strip())
def rd(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return dict(path=str(p.relative_to(R)),sha256=h(p),bytes=p.stat().st_size)
def wr(p,x):assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return b(p)
i=rd(O/'actual-current678-five-native-Nav-FPs33-foreign-kind-only-author-inputs.json');rp=R/i['oldRegistry']['path'];assert h(rp)==i['oldRegistry']['sha256'];reg=rd(rp);sub=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften');assert len(sub['positiveEvidenceConfigPaths'])==43
V.mkdir(exist_ok=False);(V/'configs').mkdir()
src=O/'whole-current678-original640-kind-rows-five-Nav-FPs33-foreign-practice.SEM-v17-INERT.json';sem=V/'wirtschaftswissenschaften.semantic-kinds.json';shutil.copyfile(src,sem);assert len(rd(sem)['decisions'])==678
records={};cfgs=[];newpaths=[]
for n,path in enumerate(sub['positiveEvidenceConfigPaths'],1):
 p=R/path;old=rd(p);new=copy.deepcopy(old);new['semanticKindLedgerPath']=str(sem.relative_to(R));assert {k for k in new if new[k]!=old[k]}=={'semanticKindLedgerPath'}
 cp=V/'configs'/f'{n:02d}.positive.config.json';wr(cp,new);newpaths.append(str(cp.relative_to(R)))
 review=R/old['reviewPath']
 for l in review.read_text().splitlines():
  if l.strip():q=json.loads(l);assert q['goalId'] not in records;records[q['goalId']]=q
 cfgs.append(dict(old=b(p),new=b(cp),reviewWholeBytesUnchanged=b(review),onlyFieldChanged='semanticKindLedgerPath'))
assert len(records)==336 and sum(len(q['profile']['applicationCaseBriefs']) for q in records.values())==685
assert all(q['status']=='needs_human_review' and q['reviewAuthority']=='ai_candidate' for q in records.values())
book=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json';ob=rd(book);assert len(ob['evidenceReviewPaths'])==1
oldagg=R/ob['evidenceReviewPaths'][0];oldrecords={q['goalId']:q for q in map(json.loads,oldagg.read_text().splitlines())};assert oldrecords==records
agg=V/'whole-current336-original-positive-profiles685cases-no-profile-or-input-change.jsonl';assert not agg.exists();shutil.copyfile(oldagg,agg);assert agg.read_bytes()==oldagg.read_bytes()
nr=copy.deepcopy(reg);ns=next(x for x in nr['subjects'] if x['subject']=='wirtschaftswissenschaften');ns['semanticKindLedgerPath']=str(sem.relative_to(R));ns['positiveEvidenceConfigPaths']=newpaths
assert {k for k in ns if ns[k]!=sub[k]}=={'semanticKindLedgerPath','positiveEvidenceConfigPaths'}
assert [x for x in nr['subjects'] if x['subject']!='wirtschaftswissenschaften']==[x for x in reg['subjects'] if x['subject']!='wirtschaftswissenschaften']
regcandidate=O/'whole-central-registry-only-Economics-v17-SEM-P43-pointers.INERT.json';wr(regcandidate,nr)
nb=copy.deepcopy(ob);nb['semanticKindLedgerPath']=str(sem.relative_to(R));nb['evidenceReviewPaths']=[str(agg.relative_to(R))];assert {k for k in nb if nb[k]!=ob[k]}=={'semanticKindLedgerPath','evidenceReviewPaths'}
bookcandidate=O/'whole-economics-book-config-current678-v17-SEM-P336.INERT.json';wr(bookcandidate,nb)
scope='pending Root independent combined678 Scope KEEP; machine profile checks do not grant scope approval'
f=dict(role='TECHNICAL_AUTHOR_FOLLOWERS_OF_THREE_FOREIGN_WHOLE_SCIENCE_COMBINED678_SCOPE_PENDING; no own scope/science KEEP',wholeBeforeCAN=i['canonicalBefore'],wholeAfterCAN=i['canonicalCandidate'],wholeAuthorHandoff=i['authorHandoff'],foreignWholeScientificBindings=i['foreignWholeScientificBindings'],foreignCombined678ScopePending=scope,oldRegistry=b(rp),oldBookConfig=b(book),oldKindLedger=i['oldSEM'],newSEM=b(sem),newPconfigs=newpaths,all43ConfigChanges=cfgs,all336OriginalWholeRecordsProfiles685CasesStatusesAuthorityAndInputFingerprintsExact=True,newWholeP336=b(agg),oldWholeP336Aggregate=b(oldagg),newWholeP336AggregateByteExact=True,candidateRegistry=b(regcandidate),candidateBookConfig=b(bookcandidate),allOtherRegistrySubjectsWholeExact=True,onlyEconomicRegistrySEMAndP43PointersChanged=True,onlyEconomicBookSEMAndAggregatePPointersChanged=True,newCurricularAtomicScientificClosures=0,strictNetGain=0,humanApproval=False,activeWrites=0)
wr(O/'actual-v17-SEM678-P336685-book678-technical-only-freeze.json',f)
for p in [sem,agg]+[R/p for p in newpaths]:
 q=C/p.relative_to(R);q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q);assert not q.samefile(p) and q.read_bytes()==p.read_bytes()
print(json.dumps(dict(newSEM=b(sem),configs=43,profiles336=True,cases685=True,aggregateBytesExact=True,foreign678ScopePending=scope)))
