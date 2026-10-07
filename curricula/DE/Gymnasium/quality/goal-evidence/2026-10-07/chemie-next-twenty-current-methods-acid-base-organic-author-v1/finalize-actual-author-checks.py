"""Targeted candidate proof only. Does not change active files or review history."""
import json, pathlib, hashlib, datetime, shutil, unicodedata, re
from jsonschema import Draft202012Validator, FormatChecker

R=pathlib.Path.cwd()
B=pathlib.Path(__file__).resolve().parent
def digest(p):
    p=pathlib.Path(p)
    return dict(path=p.relative_to(R).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def atomic_json(name,obj):
    p=B/name;t=p.with_name(p.name+'.tmp')
    t.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s)).strip()

selection=json.loads((B/'exact-twenty-whole-goals-current-author-selection.json').read_text())
routing=json.loads((B/'twenty-current-whole-source-image-context-routing.author.json').read_text())
material=json.loads((B/'forty-complete-bilingual-material-cases.author.json').read_text())
canon=json.loads((R/routing['currentWholeCanonical']['path']).read_text())
current={g['id']:g for g in canon['goals']}
assert digest(R/routing['currentWholeCanonical']['path'])['sha256']==routing['currentWholeCanonical']['sha256'].removeprefix('sha256:')
assert all(current[g['id']]==g for g in selection['wholeGoals'])
ids=routing['prerequisiteSafeOrderedGoalIds']
assert not(set(ids)&set(selection['currentStrictCompleteGoalIds']))
assert not(set(ids)&set(selection['excludedReservedCurrentGoalIds']))
assert len(selection['currentStrictCompleteGoalIds'])==152
assert len(material['cases'])==40
for c in material['cases']:
    for k in ['material','taskDemand','expectedPerformance','specificBoundaryOrCounterexample']:
        assert set(c[k])=={'de','en'} and all(norm(v) for v in c[k].values())

cfg=json.loads((B/'positive-evidence.twenty.author-candidates.config.json').read_text())
records=[json.loads(l) for l in (B/'positive-evidence.twenty.author-candidates.review.jsonl').read_text().splitlines()]
v=Draft202012Validator(json.loads((R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text()),format_checker=FormatChecker())
errs=[]
for r in records:
    errs += [dict(goalId=r['goalId'],path=list(e.absolute_path),message=e.message) for e in v.iter_errors(r)]
cv=Draft202012Validator(json.loads((R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json').read_text()),format_checker=FormatChecker())
errs += [dict(path=list(e.absolute_path),message=e.message) for e in cv.iter_errors(cfg)]
assert not errs,errs
assert [r['goalId'] for r in records]==ids
assert all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and not r['reviewRunIds'] for r in records)
case_map={c['caseId']:c for c in material['cases']}
for r in records:
    for a in r['profile']['applicationCaseBriefs']:
        c=case_map[a['id']];assert c['goalId']==r['goalId']
        for lang,title in [('de','De'),('en','En')]:
            assert a['taskDemand'+title]==c['material'][lang]+' '+c['taskDemand'][lang]
            assert a['expectedPerformance'+title]==c['expectedPerformance'][lang]
            assert a['understandingFocus'+title]==c['specificBoundaryOrCounterexample'][lang]

raw=json.loads((B/'twenty-direct-current-source-mapping-witnesses.author.json').read_text())
actuals={name: (B/'sources'/name).read_text() for name in ['BY-C8-ch-ntg.txt','BY-C9-ch-ntg.txt','BY-C10-ch-ntg.txt','BY-C10-ch.txt','BY-C12-grundlegend.txt','BY-C12-erhoeht.txt']}
def file_for(s):
    code=s.get('topicCode','')
    if code.startswith('C8.'):return 'BY-C8-ch-ntg.txt'
    if code.startswith('C9-NTG.'):return 'BY-C9-ch-ntg.txt'
    if code.startswith('C10-NTG.'):return 'BY-C10-ch-ntg.txt'
    if code.startswith('C10-HG_SG_MUG_WWG_SWG.'):return 'BY-C10-ch.txt'
    if code.startswith('C12-GA.'):return 'BY-C12-grundlegend.txt'
    if code.startswith('C12-EA.'):return 'BY-C12-erhoeht.txt'
    return None
scopes=[]
for gid in ids:
    allrows=[x for x in raw['rows'] if x['wholeMappingRow']['canonicalGoalId']==gid]
    witnesses=[]
    for w in allrows:
        if '/BY/' not in w['sourceExtractionPath']:continue
        s=w['wholeSourceGoal'];f=file_for(s)
        if not f:continue
        literal=norm(s.get('description','')) in norm(actuals[f])
        if literal:
            witnesses.append(dict(sourceGoalId=s['id'],wholeSourceGoal=s,wholeMappingRow=w['wholeMappingRow'],activeMappingPath=w['mappingPath'],primaryText=digest(B/'sources'/f),literalExistingSourceDescriptionContainedInActualOfficialText=True,scope='Only this explicit official competency component; no approval of other broad partial rows or entire curriculum'))
    scopes.append(dict(goalId=gid,title=current[gid]['title'],rawDirectMappingRows=len(allrows),boundedLiteralBYWitnesses=witnesses,wholeOriginalSourceApproval=False,wholeLearnerSourceSupersetApproval=False,status='AUTHOR source inputs, independent reviews pending'))

# Existing split sources remain explicitly separate from a new direct binding.
by_path=R/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
by=json.loads(by_path.read_text())
sourcegoals={g['id']:g for g in by['sourceGoals']}
split_raw=[]
for gid,sid,filename in [('597ac03c-d25f-5c34-a87c-52c059c87295','7b5310e2-3b69-5a45-8966-f8523ea42fb9','BY-C10-ch.txt'),('9751b6d8-cde3-527b-b37c-babb6cee79d2','7c68f201-5b73-5b1f-8576-cc1a23fafb83','BY-C10-ch-ntg.txt')]:
    s=sourcegoals[sid]
    split_raw.append(dict(goalId=gid,wholeCurrentGoal=current[gid],wholeExistingSourceGoal=s,sourceExtraction=digest(by_path),actualOriginalText=digest(B/'sources'/filename),existingSourceTextLiteralInActualPrimary=norm(s['description']) in norm(actuals[filename]),claimScope='Only the selected assessment component; no entire broad original source closure',directCurrentSelectedGoalMappingCount=0,technicalRebindingAndIndependentSourceRoleReviewPending=True))
atomic_json('seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json',dict(documentType='AUTHOR source guide: exact literal components and open split routing, not independent source approval',activeWrites=False,wholeOriginalSourceClosure=False,rows=scopes,splitCurrentSourceInputs=split_raw,rawRows211AreNot211ScientificApprovals=True,sourceThreeNeutralStage=digest(B/'source-three-neutral-raw-author-input.stage.freeze.json')))

fault=dict(documentType='Actual AUTHOR observation of existing reviewed raster; not a replacement V verdict',goalId='466bd2e9-39a5-5221-b620-945934adce00',status='HOLD for targeted independent V/D/P correction',oldVRecordUntouched=True,actualGoal=current['466bd2e9-39a5-5221-b620-945934adce00'],nativePDF=digest(B/'native-d-twenty/bundle/book.pdf'),physicalPage=20,actualViewedRaster=digest(B/'qa-artifacts/actual-native-pdf-physical-020.png'),defect='IR alcohol example: central blue C is bonded to H3C and OH but labelled H3. Two shown heavy-atom single bonds plus three H imply valence five; ethanol requires CH2 at that carbon.',locationInViewedRasterPixels=dict(xApprox=[120,235],yApprox=[255,320]),separateUnconfirmedConcern='The NMR singular -O-CH3 caption/selected drawn fragment also needs targeted review; no final defect count or replacement specification is asserted for this concern.',generationRequested=False,activeChanges=False,strictNetGain=0)
atomic_json('spectroscopy-current-raster-valence-defect.author-actual.json',fault)

for stem in ['native-prepare','native-prepare-2','native-prepare-3','routing']:
    for ext in ['stdout','stderr']:
        src=pathlib.Path('/tmp')/f'skillpilot-next-chem20-{stem}.{ext}.txt'
        if src.exists():shutil.copyfile(src,B/'qa-artifacts'/f'initial-{stem}.{ext}.txt')
atomic_json('qa-artifacts/targeted-schema-complete-material-and-current-input-bindings.actual.json',dict(documentType='Targeted actual native-v2 schema/material/current-input check; technical author candidate proof only',checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),ownRecordSchema=digest(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),ownConfigSchema=digest(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),profileRecords=20,completeCases=40,bilingualCaseBodies=80,exactNativeProfileBriefToFullCasePairs=40,errors=errs,nativeContractStatus='needs_human_review / ai_candidate / E1 / G1, no reviewRun claim',wholeCurrentTwentyGoalsUnchanged=True,existingStrict152Excluded=True,reservedCurrent23Excluded=True,currentCanonical=digest(R/cfg['landscapePath']),currentKinds=digest(R/cfg['semanticKindLedgerPath']),criteria=digest(R/cfg['reviewCriteriaPath']),currentAtomDenominator=378,currentWholeNodes=len(canon['goals']),existingA20M20V20Bindings=routing['existingCurrentAtomicity']==20 and routing['existingCurrentMemory']==20 and routing['existingCurrentAiRasterBindings']==20,actualRasterCopies=60,authorRasterScientificHoldGoalIds=['466bd2e9-39a5-5221-b620-945934adce00'],activeWrites=False,newIndependentDReviews=0,newIndependentPReviews=0,newVisualGrants=0,newStrictClosures=0))
print(json.dumps(dict(schemaRecords=20,fullCases=40,exactProfileBriefs=40,errors=0,primaryLiteralGoalComponents=sum(bool(r['boundedLiteralBYWitnesses']) for r in scopes),splitSourceInputs=len(split_raw),strictNetGain=0)))
