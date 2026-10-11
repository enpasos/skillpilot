"""Own inert access-author package over actual active645, foreign science reused."""
from pathlib import Path
import copy,json,hashlib,shutil,tempfile
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
def rd(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return dict(path=str(p.relative_to(R)),sha256=h(p),bytes=p.stat().st_size)
def ck(x):p=R/x['path'];assert h(p)==x['sha256'] and p.stat().st_size==x['bytes'];return p
def wr(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return b(p)
sp=Q/'wirtschaft-M4-twelve-international-whole-science-independent-merge-audit-v1/actual-final-international12-whole-DEEN-science-nine-real-string-remedies-independent-KEEP.handoff.receipt.json';assert h(sp)=='20266afeb1524c30ffd0a2d6e021ac6bd9d481365373d3399ff844388ffe6545';s=rd(sp);draft=rd(ck(s['actualReviewedWhole12Body']));assert len(draft)==12
can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';assert h(can)=='94898ce66c1fca3d7cdbfbd36a7cd1172cf67fd0c71a46a104fff92254806bae';before=rd(can);assert len(before['goals'])==645;by={g['id']:g for g in before['goals']}
bp=O/'whole-active645-before-international12.exact.json';assert not bp.exists();shutil.copyfile(can,bp)
activeReceipt=Q/'wirtschaft-current645-company-finance-consumer-labour48-active-root-v1/actual-current645-fortyeight-qualified-materials506-accesses-active.receipt.json';assert h(activeReceipt)=='8e54e8edd0f5b4bd0892ee48855609e03c054d4023deb93095f8dd94b1f5d5c6'
released=copy.deepcopy(draft)
for g in released:
 assert g['id'] not in by and g['examData']['reviewStatus']=='draft';g['examData']['reviewStatus']='released';g['examData']['reviewNote']='Maschinelle Curriculum-QS: vollständige DE/EN-Aufgaben, Lösungen und Rubrik unabhängig fachlich KEEP (20266afeb1524c30). Keine menschliche Freigabe oder Erprobung; Länder-/Kurszugänge werden getrennt geprüft.'
 assert g['requires']==g['examData']['coveredGoalIds'] and g['extendedData']['applicabilityFromRequires'] is True
wr('whole-twelve-international-foreign-KEEP-only-machine-status-note.released-INERT.json',released)
after=copy.deepcopy(before);after['goals']+=released;am={g['id']:g for g in after['goals']};navs=[]
for phase,id in [('Q3','0fb8833c-4017-5052-819a-ecb5f6ebb36f'),('Q4','5113c64b-405d-5f4b-bae9-70fe530b5e69')]:
 g=am[id];old=copy.deepcopy(g);new=[x['id'] for x in released if x['phase']==phase];assert len(new)==6;g['contains']+=new
 g['description']+=' Weitere eigenständige '+phase+'-Materialien behandeln '+('Lieferketten, aktuelle Handelsbelege, Handelsoptionen, Wechselkursregime, Verteilungsfolgen und Sanktionen.' if phase=='Q3' else 'internationale Institutionen, SDGs und Klimafinanzierung, Entwicklungsdimensionen, Handelsöffnung, HDI/Gini und die Prüfung von Entwicklungsprogrammen.')+' Jedes Material behält seinen ganzen Kompetenzvertrag, seine Kursgrenze und vollständigen Voraussetzungen.'
 g['descriptionEn']+=' Further standalone '+phase+' materials cover '+('supply chains, current trade evidence, trade options, exchange-rate regimes, distribution effects and sanctions.' if phase=='Q3' else 'international institutions, SDGs and climate finance, development dimensions, trade opening, HDI/Gini and evaluating development programmes.')+' Each material retains its whole competence contract, course limit and complete prerequisites.'
 navs.append(dict(goalId=id,wholeBefore=old,wholeAfter=copy.deepcopy(g),orderedNewMaterialIds=new,actualOldContainsExactPrefix=True))
wr('whole-inert657-twelve-qualified-status-and-two-phase-local-navigation.prederived.json',after);wr('actual-two-Q3-Q4-child-prefix-and-purposeful-DEEN-nav.prederived-author.json',navs)
views=[];vp=R/'curricula/DE/Gymnasium/composition-views/wirtschaft';(O/'whole-before35views').mkdir()
for p in sorted(vp.glob('*.json')):
 q=O/'whole-before35views'/p.name;shutil.copyfile(p,q);views.append(dict(activePath=str(p.relative_to(R)),before=b(q)))
assert len(views)==35
rp=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=rd(rp);sub=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften');sem=R/sub['semanticKindLedgerPath'];assert rd(sem)['counts']['total']==645
cap=Path(tempfile.mkdtemp(prefix='skillpilot-international12-current645-author-B-'))/'capsule';source=Path('/tmp/economics-combined645-current597-author-a-_exxit5_/capsule');shutil.copytree(source,cap,symlinks=True)
def install(src,rel=None):
 dst=cap/(rel or str(src.relative_to(R)));dst.parent.mkdir(parents=True,exist_ok=True)
 assert not dst.is_symlink();dst.write_bytes(src.read_bytes());assert not dst.samefile(src) and dst.read_bytes()==src.read_bytes();return dst
install(bp,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');install(rp);install(sem)
for path in sub['positiveEvidenceConfigPaths']:
 cfg=R/path;install(cfg);c=rd(cfg)
 for key in ['reviewPath','reviewCriteriaPath']:install(R/c[key])
 for z in c.get('reviewRunManifestPaths',[]):install(R/z)
for x in views:install(ck(x['before']),x['activePath'])
inputs=dict(role='AUTHOR actual current645 physical source/scope intake; foreign science reused, no self scope KEEP',activeBeforeCAN=b(can),wholeBeforeCAN=b(bp),wholePrederivedCandidate=b(O/'whole-inert657-twelve-qualified-status-and-two-phase-local-navigation.prederived.json'),foreignScience=b(sp),wholeForeignQualifiedDraft=s['actualReviewedWhole12Body'],machineStatusOnlyBodies=b(O/'whole-twelve-international-foreign-KEEP-only-machine-status-note.released-INERT.json'),active645Receipt=b(activeReceipt),oldRegistry=b(rp),oldSEM=b(sem),all35BeforeViews=views,newMaterialIds=[g['id'] for g in released],newMaterialWholeCourseTags={g['id']:g['tags'] for g in released},actualSevenLKOnlyPreserved=sum(g['tags'][0]=='LK' for g in released),noNewOrdinaryOrSupportRefs=True,privatePhysicalCapsule=str(cap),activeWrites=0,strictNetGain=0,humanApproval=False)
wr('actual-international12-current645-frozen-foreign-science-physical-before-inputs.AUTHOR.json',inputs)
Path('/tmp/economics-international12-current645-author-B-capsule-path.txt').write_text(str(cap)+'\n');print(json.dumps(dict(capsule=str(cap),before=645,candidate=657,whole12=12,LKOnly=7,oldViews=35)))
