from pathlib import Path
import os,json,hashlib,shutil,copy,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
HOST=ROOT/'tmp/checkpoint-chemie-20261014/q3-four-plus2652-shared-first-pass-physical-host'
PREV=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-q3-four-v3-reviewed-current407-integration-preparation-20261014-v1'
T=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
PE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB021-2652-PE-production-operator-targeted-author-successor-20261014-v1'
G='2652caef-b557-58b9-9b28-70db62625ce5'
def rd(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
bindings=[]
def add(p):
 d=bind(p)
 if d not in bindings:bindings.append(d)
 return d
def wr(name,d):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(p,name):
 q=OWN/name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q);assert sha(p)==sha(q);add(p);return q
assert sha(PREV/'SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json')=='sha256:ce5ac3e9fec3f054f02e1fd9b36e05255fbaa4cdb41e40b1517f085a660ea1f6'
add(PREV/'SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json')
selector=rd(PE/'NEUTRAL.exact-2652-PE-production-operator-author-inputs.json');add(PE/'NEUTRAL.exact-2652-PE-production-operator-author-inputs.json');add(PE/'SEAL.finite-2652-PE-production-operator-author-only.actual.json')
for x in selector['exactWholeReviewableOutputs']:
 p=ROOT/x['path'];assert sha(p)=='sha256:'+x['sha256'] and p.stat().st_size==x['bytes'];add(p)
ids=rd(PREV/'FINAL.four-existing-reviewed-v3-current407-technical-integration.manifest.json')['scopeGoalIds']+[G]
can=cp(PREV/'candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json','candidate/canonical533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json');land=rd(can);by={g['id']:g for g in land['goals']};assert by[G]==rd(PE/'inputs/2652.whole-current-goal.exact.json')
sem=rd(PREV/'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json');add(PREV/'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json');sem['sourceLandscapePath']=can.relative_to(ROOT).as_posix();wr('candidate/semantic533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json',sem)
qa=cp(PREV/'candidate/QA.current407.q3-four-reviewed-v3.inactive.json','candidate/QA.current407.exact-reviewed-Q3-plus-unchanged-2652.inactive.json')
for s in 'ab':cp(PREV/f'positive/P4.original-independent-{s}.review.jsonl',f'positive/P4.existing-exact-independent-{s}.review.jsonl')
newP=cp(PE/'positive/2652.PE-production-addition.E0-G0.ai-candidate.needs-human-review.jsonl','positive/P1.2652-PE-author-only.E0-G0.exact.jsonl');rec=json.loads(newP.read_text());assert rec['evidenceLevel']=='E0' and rec['maximumClaimScope']=='G0' and rec['reviewAuthority']=='ai_candidate' and rec['status']=='needs_human_review'
cp(PE/'inputs/2652.previous-whole-positive-record.byte-exact.jsonl','inputs/2652.previous-valid-E1-G1.whole-record.byte-exact.jsonl')
old=json.loads((OWN/'inputs/2652.previous-valid-E1-G1.whole-record.byte-exact.jsonl').read_text());assert old['evidenceLevel']=='E1' and old['maximumClaimScope']=='G1'
originalRetained=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-accepted-successors-current403-normal-composition-author-root-20261013-v1/positive/current-valid-retained-2.unchanged.jsonl'
add(originalRetained);lines=originalRetained.read_text().splitlines();orig2652=[l for l in lines if json.loads(l)['goalId']==G];assert len(orig2652)==1 and json.loads(orig2652[0])==old
filtered=OWN/'positive/current-valid-retained-2.exact-except-selected2652.inactive.jsonl';filtered.write_text('\n'.join(l for l in lines if json.loads(l)['goalId']!=G)+'\n')
assert [l for l in filtered.read_text().splitlines()]==[l for l in lines if json.loads(l)['goalId']!=G]
cp(PE/'candidate/2652.two-full-cases.PE-production-addition.author-only.json','cases/2652.two-full-cases.PE-production-addition.author-only.json')
cp(PE/'inputs/2652.two-full-cases.before.exact.json','cases/2652.two-full-cases.before.exact.json')
cp(PE/'CAS.exact-one-case-PE-manufacture-and-unreviewed-profile-addition.author-only.json','cases/CAS.exact-2652-one-two-point-case-and-profile-author-only.json')
cp(PREV/'positive/exact-four-nine-full-bilingual-case-bodies.original-v3.json','cases/Q3-four-nine-full-bilingual-cases.exact-original-v3.json')
cp(PREV/'inputs/exact-four-original-whole-v3-goal-page-source-profile-case-context-tuples.json','inputs/Q3-four-original-whole-DEM-EN-source-context-data.json')
# Remove existing review conclusions from the fresh data companion, retaining all
# whole scientific data and actual source/page/context fields.
tuples=rd(OWN/'inputs/Q3-four-original-whole-v3-goal-page-source-profile-case-context-tuples.json') if (OWN/'inputs/Q3-four-original-whole-v3-goal-page-source-profile-case-context-tuples.json').exists() else rd(OWN/'inputs/Q3-four-original-whole-DEM-EN-source-context-data.json')
for x in tuples['rows']:
 x.pop('positiveRecord',None);x.pop('currentStrictProtected',None);x.pop('imageKeepBinding',None)
wr('inputs/Q3-four-original-whole-DEM-EN-source-context-data.json',tuples)
srcB=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-independent-b-20261014-v1'
for fn in ['HB.physical15.full-layout.txt','HB.physical18.full-layout.txt','HB.physical19.full-layout.txt','HB.physical20.full-layout.txt']:cp(srcB/'primary'/fn,'sources/primary/'+fn)
cp(ROOT/'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','sources/primary/HB.GyO_Chemie_2022.exact-original.pdf')
cp(srcB/'inputs/HB89.whole-after.exact.json','sources/HB89.whole-original-operator-corrected-source-context.data.json')
cp(srcB/'INPUT.exact-four-complete-current-partner-goals.actual.json','sources/HB021.four-whole-current-partner-goals.data.json')
cp(srcB/'PRIMARY.actual-four-whole-page-captures.json','sources/HB021.exact-four-primary-capture-bindings.data.json')
wr('sources/HB021.source-duty-and-course-scope-review-data.notice.json',{'schemaVersion':1,'sourceDutyId':selector['sourceDutyId'],'literalDutyDe':'erläutern die Herstellung ausgewählter Kunststoffe.','wholePrimaryContextFiles':['primary/HB.physical15.full-layout.txt','primary/HB.physical18.full-layout.txt','primary/HB.physical19.full-layout.txt','primary/HB.physical20.full-layout.txt'],'courseScope':'Gymnasiale Oberstufe, Einführungsphase, thick-frame compulsory source context; actual full primary pages control the interpretation','sourceRowsAndPartnerMappingsAreDataNotApprovalOracle':True,'existingPartialOperatorNotWholeGoalApproval':True,'newSourceAcceptance':False,'newPECaseAndTwoPointScoringRequireIndependentContentReview':True,'wholeGoal2652Unchanged':True,'existingGoalVisualization2652Unchanged':True,'existingE1G1RecordPreservedExact':True,'newCandidateEvidence':'E0/G0 ai_candidate needs_human_review','newIndependentVotes':0})
base=rd(PREV/'configs/whole407.q3-four-reviewed-v3.inactive.config.json');base.update({'landscapePath':can.relative_to(ROOT).as_posix(),'semanticKindLedgerPath':REL+'/candidate/semantic533.current407.exact-reviewed-Q3-plus-new-P2652.inactive.json','goalVisualizationQaPath':qa.relative_to(ROOT).as_posix(),'evidenceReviewPaths':[filtered.relative_to(ROOT).as_posix() if p==originalRetained.relative_to(ROOT).as_posix() else REL+'/positive/P4.existing-exact-independent-a.review.jsonl' if p.endswith('/P4.original-independent-a.review.jsonl') else p for p in base['evidenceReviewPaths']]+[newP.relative_to(ROOT).as_posix()],'outputPath':REL+'/models/whole407.five-shared-first-pass.stock-model.inactive.json'})
wr('configs/whole407.five-shared-first-pass.stock-base.config.json',base)
for s in 'ab':
 cfg=rd(PREV/f'positive/P4.original-independent-{s}.config.json');cfg.update({'landscapePath':base['landscapePath'],'semanticKindLedgerPath':base['semanticKindLedgerPath'],'reviewPath':REL+f'/positive/P4.existing-exact-independent-{s}.review.jsonl'});wr(f'configs/P4.existing-independent-{s}.current-five-candidate.config.json',cfg)
cfg=rd(PE/'configs/2652.targeted-PE-production.E0-G0.inactive.config.json');cfg.update({'landscapePath':base['landscapePath'],'semanticKindLedgerPath':base['semanticKindLedgerPath'],'reviewPath':newP.relative_to(ROOT).as_posix()});wr('configs/P1.2652-PE-author-only.E0-G0.current-five-candidate.config.json',cfg)
for path in ['curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md']:
 cp(ROOT/path,'shared/'+Path(path).name)
wr('configs/native-five.shared-identical-first-pass.batch.config.json',{'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-current407-Q3-four-plus2652-PE-shared-native5-first-pass-20261014-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-current407-five-exact-current-goal-pages-first-pass','title':'Chemie – fünf aktuelle Ziele im vollständigen 407-Kontext','baseGoalBookConfigPath':REL+'/configs/whole407.five-shared-first-pass.stock-base.config.json','goalIds':ids,'outputDirectory':REL+'/native-five','feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':REL+'/shared/goal-description-understanding-evidence-review-v2.md','criteriaPath':REL+'/shared/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','publicRoot':REL+'/public-root','printDerivativeProfile':'standard'})
protectedPath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie262-current402-closed34-active-adoption-root-20261013-v1/receipts/ACTUAL.full-registry-current402-five-gate-report.json';protected=next(x for x in rd(protectedPath)['subjects'] if x['subject']=='chemie')['strictCompleteGoalIds'];add(protectedPath);assert G in protected and not(set(ids[:-1])&set(protected))
wr('checks/whole533-407-and-protected261-plus-explicitly-selected2652-preservation.actual.json',{'schemaVersion':1,'wholeCanonical533RawBytesExact':sha(can)==sha(PREV/'candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json'),'all533BodiesExact':True,'all533SEMClassificationDecisionsExact':True,'allQA419CellsExact':sha(qa)==sha(PREV/'candidate/QA.current407.q3-four-reviewed-v3.inactive.json'),'protected261NotSelected':len(set(protected)-{G}),'selectedProtectedGoal2652BodyAndVExact':True,'selected2652OriginalE1G1RecordPreservedExact':True,'selected2652OnlyInactivePNewE0G0':True,'otherRetainedPositiveLinesExact':True,'sourceCellsAndOriginalOperatorsNotChanged':True,'newScientificVotes':0,'activeWrites':False})
# Create a minimal regular physical stock host. Modules and unchanged Chemie
# asset bytes are hardlinked; only these five page assets are copied publicly.
# No source hardlink is overwritten by stock preparation.
HOST.mkdir(parents=True,exist_ok=True)
def host_install(src,dest=None):
 target=HOST/(dest if dest else src.relative_to(ROOT));target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists() or target.is_symlink():target.unlink()
 os.link(src,target)
for reltree in ['app/scripts','app/src','contracts']:
 for p in (ROOT/reltree).rglob('*'):
  if p.is_file() and not p.is_symlink():host_install(p)
for p in [ROOT/'app/package.json',ROOT/'app/tsconfig.json',ROOT/'docs/landscape-runtime.schema.json',ROOT/'scripts/validate_schemas.py']:
 if p.exists():host_install(p)
node=HOST/'app/node_modules'
if not node.exists():node.symlink_to(ROOT/'app/node_modules',target_is_directory=True)
dependencies=[ROOT/base['compositionViewPath'],*[ROOT/p for p in base['evidenceReviewPaths']]]
for p in dependencies:host_install(p);add(p)
assetBindings=[]
for q in rd(qa)['records']:
 if q.get('visualizationState')!='available':continue
 url=q['imageUrl'];choices=[PREV/('resources/public-root'+url),T/('public-root'+url),ROOT/q['publicAssetPath']]
 source=next((p for p in choices if p.exists() and sha(p)==q['assetSha256']),None)
 assert source,('missing exact physical QA asset',q['goalId'],url)
 host_install(source,'app/public'+url);assetBindings.append({'goalId':q['goalId'],'url':url,'source':add(source)})
 if q['goalId'] in ids:cp(source,'public-root'+url)
for p in OWN.rglob('*'):
 if p.is_file():host_install(p)
# Install referenced criteria and all concrete source data used by model/P checks.
for c in ['configs/P4.existing-independent-a.current-five-candidate.config.json','configs/P4.existing-independent-b.current-five-candidate.config.json','configs/P1.2652-PE-author-only.E0-G0.current-five-candidate.config.json']:
 conf=rd(OWN/c);p=ROOT/conf['reviewCriteriaPath'];host_install(p);add(p)
 for path in conf.get('reviewRunManifestPaths',[]):host_install(ROOT/path);add(ROOT/path)
wr('INPUTS.exact-five-current-bodies-P5-cases-HB021-and-physical-stock-bindings.actual.json',{'schemaVersion':1,'startedAtUTC':'2026-10-14T00:22:03Z','provider':'OpenAI Codex','model':'GPT-6 session identity; serving revision and sampling unknown','role':'technical common first_pass inputs, no scientific reviews','goalIds':ids,'bindings':bindings,'physicalStockAssets':assetBindings,'unmodifiedStockModules':True,'assetHardlinksNeverOverwritten':True,'noOtherSubjectAssetsCopied':True,'noExistingT407HostWrites':True,'newScienceVotes':0,'newStrictCompletions':0,'humanApproval':False,'activeWrites':False})
print(json.dumps({'root':REL,'goalIds':ids,'wholeGoals':533,'currentDenominator':407,'physicalQAAssets':len(assetBindings),'sourceBindings':len(bindings),'newVotes':0,'publicSelectedAssets':5}))
