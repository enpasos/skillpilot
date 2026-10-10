# SPDX-License-Identifier: Apache-2.0
"""Inactive, narrowly scoped author preparation; no independent approval."""
import copy, hashlib, json, pathlib, shutil
from datetime import datetime, timezone

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
REL = OUT.relative_to(ROOT)
V4 = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
AUDIT = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-existing-source-operator-partner-triage-author-20261011-v1'
IDS = ['9540a95d-5ca5-527c-918f-d702e99be07a', '5ee0f660-66f1-5aa6-a01d-e3b010db01ff', '0f9318ec-90eb-5381-b670-8fb2f2789c3d']
REG = ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def read(p): return json.loads(pathlib.Path(p).read_text())
def put(p,x):
    p=OUT/p; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return ref(p)
def ref(p):
    p=pathlib.Path(p); p=p if p.is_absolute() else ROOT/p; b=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)), 'sha256':'sha256:'+hashlib.sha256(b).hexdigest(), 'bytes':len(b)}
COPIES=[]
def exact(p,folder='inputs'):
    p=pathlib.Path(p); p=p if p.is_absolute() else ROOT/p
    a=ref(p)
    dest=OUT/folder/a['sha256'][7:19]/'bundle'/'book.pdf' if folder=='primary' and p.suffix=='.pdf' else OUT/folder/(a['sha256'][7:19]+'-'+p.name)
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(p,dest); b=ref(dest); assert a['sha256']==b['sha256']; COPIES.append({'original':a,'regularExactCopy':b}); return b

reg=read(REG); bio=next(s for s in reg['subjects'] if s['subject']=='biologie')
rootpaths=[REG]
for s in reg['subjects']:
    for k in ['landscapePath','semanticKindLedgerPath','visualizationQaPath','semanticAtomicityConfigPath','memoryReviewConfigPath']:
        if s.get(k): rootpaths.append(ROOT/s[k])
if not (OUT/'checks/root-guard.before.json').exists():
    put('checks/root-guard.before.json', {'createdAt':datetime.now(timezone.utc).isoformat(),'bindings':[ref(p) for p in rootpaths]})
for p in [REG,ROOT/bio['landscapePath'],ROOT/bio['semanticKindLedgerPath'],ROOT/bio['visualizationQaPath'],V4/'neutral-Bio8-targeted-text-source-image-author.portable-final.entry.json',V4/'candidate/whole483-final-text-source-image.inactive.json',AUDIT/'neutral-Bio8-source-operator-partner-triage-author.portable-final-v2.entry.json']:
    exact(p)
land=read(V4/'candidate/whole483-final-text-source-image.inactive.json'); gm={g['id']:g for g in land['goals']}
active=read(ROOT/bio['landscapePath']); am={g['id']:g for g in active['goals']}
assert all({k:v for k,v in gm[i].items() if k!='requires'}=={k:v for k,v in am[i].items() if k!='requires'} for i in IDS)
assert gm[IDS[1]]==am[IDS[1]] and gm[IDS[2]]==am[IDS[2]]
assert gm[IDS[0]]['requires']==['528a3cd3-4a4d-550d-939a-8dc8656446e4','2d451684-6e53-565e-a987-f362da919d2c']
put('candidate/whole483-before-three-images.inactive.json',land)
kinds=read(V4/'candidate/kinds396.author-classification-only.json'); put('candidate/kinds396.retained-author-context.json',kinds)
qa=read(V4/'candidate/QA396.author-pending.json'); put('candidate/QA396.before-three-images.json',qa)
context=[]
for i in IDS:
    g=gm[i]; deps=[gm[j.split(':')[-1]] for j in g['requires']]
    context.append({'goalId':i,'wholeCurrentGoalDeEn':g,'wholeActiveGoalDeEn':am[i],'wholeDirectPrerequisites':deps,'textDecision':'KEEP current DE/EN goal, tags, applicability and ID; preserve the previously authored Bio8-v4 requires routing after the vector/transformations split','currentPositiveProfiles':0,'currentDescriptionResolution':0})
put('inputs/three-whole-current-goals-and-prerequisites.exact.json',{'records':context,'currentIdsNoNewIds':True,'allThreeGoalTextsExactToActive':True,'preexistingV4RequiresDeltaGoalId':IDS[0],'preexistingV4RequiresDelta':{'active':am[IDS[0]]['requires'],'v4':gm[IDS[0]]['requires']},'newRequiresEditsInThisTask':0})
for key,fn in [('semanticAtomicityConfigPath','A3.current-exact.jsonl'),('memoryReviewConfigPath','M3.current-exact.jsonl')]:
    cfg=read(ROOT/bio[key]); exact(bio[key],'atomicity-memory'); p=ROOT/cfg['reviewPath']; original=exact(p,'atomicity-memory')
    rows=[json.loads(l) for l in p.read_text().splitlines() if json.loads(l).get('goalId') in IDS]
    assert len(rows)==3
    dst=OUT/'atomicity-memory'/fn; dst.parent.mkdir(parents=True,exist_ok=True); dst.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in rows))
    put('atomicity-memory/'+fn+'.selection.json',{'fullCurrentInput':original,'selectedExactWholeRecords':ref(dst),'goalIds':IDS,'historicalReviewerJudgmentsUnchanged':True,'newApprovals':0})
scan=[]
for p in bio['positiveEvidenceConfigPaths']:
    cfg=read(ROOT/p); overlap=set(IDS)&set(cfg.get('scope',{}).get('goalIds',[])); assert not overlap
    scan.append({'registryConfig':ref(p),'scopeGoalIds':cfg.get('scope',{}).get('goalIds',[]),'targetedHits':[]})
put('positive/registry-only-scope-P3-absence.actual.json',{'registry':ref(REG),'registryConfigsInspected':len(scan),'configs':scan,'scopeGoalIdsOnly':True,'noBroadEvidenceScan':True,'currentP3Absent':True})
scope=read(V4/'sources/normal-atlas.receipt.compact.json')
scopes=[]
for s in scope['scopes']:
    if s['jurisdiction'] in ['DE-BY','DE-HE','DE-RP']:
        scopes.append({'key':s['key'],'jurisdiction':s['jurisdiction'],'stage':s['stage'],'courseProfile':s.get('courseProfile'),'threeGoalTargetMembership':{i:i in s['goalIds'] for i in IDS},'wholeGoalIds':s['goalIds'],'wholeScopePath':s['path']})
put('sources/current-reviewed-BY-HE-RP-compiled-memberships.exact.json',{'originalReceipt':exact(V4/'sources/normal-atlas.receipt.compact.json','sources'),'scopes':scopes,'unchangedCompiledMembership':True,'ordinaryBYHE0fRequiresLK':True,'RPBookLocalLowerStageSourceProjectionDoesNotRenameLKTag':True,'scopeWideningProposed':False})
src=read(V4/'sources/whole31-pairs-and35-direct-operators.current-author.json'); pair=src['wholePairs'][11]
rp=read(ROOT/pair['extraction']['path']); mapping=read(ROOT/pair['mapping']['path'])
exact(pair['extraction']['path'],'sources'); exact(pair['mapping']['path'],'sources')
sid='rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-003-8927c877'
row=next(g for g in rp['sourceGoals'] if g['id']==sid); before=copy.deepcopy(row)
row['sourceRef']='RP-BIO-SEKI-2014 S. 44 (physische PDF-Seite 46)'
put('sources/RP-whole-extraction-argument-locator44-only.author.json',rp)
mapping['sourceExtractionPath']=str(REL/'sources/RP-whole-extraction-argument-locator44-only.author.json')
put('sources/RP-whole-mapping-retained-partners.author.json',mapping)
decision=next(d for d in mapping['decisions'] if d['sourceGoalId']==sid)
primary=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3/primary/307f5d841072/bundle/book.pdf'
pdf=exact(primary,'primary'); raster=exact(AUDIT/'primary/DE-RP-physical-046.png','primary')
put('sources/RP-literal-operator-current-partners-and-bounded-author-obligation.json',{
    'sourceGoalId':sid,'wholeSourceGoalBeforeLocatorCorrection':before,'wholeSourceGoalWithCorrectLocator':row,'wholeCurrentMappingDecision':decision,
    'literalPrimaryClause':'argumentieren zu Chancen und Risiken biotechnologischer Anwendungen, z. B. Reproduktionsmedizin, Gentechnik, Gendiagnostik',
    'primaryPDF':pdf,'primaryPageRaster':raster,'printedPage':44,'physicalPDFPage':46,
    'sourceLevelQualification':'TF11 SekI: Grundverständnis und Überblick; keine Vertiefung molekularbiologischer Einzelheiten. Die detaillierteren aktuellen Q1/LK-Atome bleiben in ihren bestehenden BY/HE/RP-Projektionen unverändert.',
    'sourceScopeIsBiotechnologyBroadGeneticCasesAreBoundedExamples':True,
    'actualNewPerformanceContractsGoalIds':IDS,'retainedTheoryOnlyPartner':'f53d0a0b-d9b8-5012-92b5-3a021ab6c30b',
    'theoryAloneFulfilsArgumentOperator':False,'f53CurrentValidScienceRetained':True,'f53ProjectionRoleChanged':False,
    'wholeSourceCoverageClaim':False,'mappingMatchTypeKept':'partial','historicalReviewJudgmentsChanged':False,
    'pending':'Independent review of the exact three new material/profile/native/image contracts and this bounded RP source join. No whole-course restart.'})
for p in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','docs/landscape-runtime.schema.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-review-criteria-v2.md']:
    if (ROOT/p).is_file(): exact(p,'contracts')
put('checks/input-exact-copy-manifest.json',{'copies':COPIES,'regularExactCopies':True})
print(json.dumps({'wholeGoalObjectsRetained':483,'newGoalIds':0,'threeWholeCurrentGoalsUnchanged':True,'A3M3Exact':True,'currentP3Absent':True,'sourceLocatorCorrection':'printed44/physical46','strictGain':0,'humanApproval':0}))
