"""Serialize an already frozen informed scientific review; no input mutation."""
import collections
import datetime
import hashlib
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent
BASE = OUT.parent / 'current439-HB-primary232-neutral-scientific-review-preparation-root-v1'
SELECTOR = BASE / 'SELECTOR.clean-HB-primary232-whole-science-for-independent-source-review.sealed.json'
FIRST = OUT / 'FIRST.HB-primary232.informed-B.scientific.frozen.md'
FIRST_SHA = 'd1e275babfd2a2d0c462e287c523d70add5083d2cb44870a98b9b18e1d6d70e3'
RUN = 'chemie-current439-HB-primary232-informed-independent-b-20261017-v1'

def pin(path):
    p = pathlib.Path(path)
    raw = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return 'sha256:' + hashlib.sha256(raw).hexdigest()

def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

assert pin(FIRST)['sha256'] == FIRST_SHA
assert pin(SELECTOR)['sha256'] == 'b9f2f2ccff32143eb4e07b2b8c21b07c6c59bdf4db0d93f93efa0d5f3c10798e'
s = json.loads(SELECTOR.read_text())
d = json.loads(pathlib.Path(s['scientificView']['path']).read_text())
previous = json.loads(pathlib.Path(s['previousScientific97']['path']).read_text())
raw_first = FIRST.read_text()
prov = {p['sourceGoalId']: p for p in d['sourceGoalProvenance']}
goals = {g['id']: g for g in d['sourceGoals']}

findings = {}
for num in range(1,4):
    label = f'HB232-B-{num:02d}'
    start = raw_first.index('### ' + label)
    end = raw_first.find('\n### ', start + 5)
    if end < 0:
        end = raw_first.index('\nAll other 229', start)
    findings[label] = raw_first[start:end]
revise = {
 'hb-chemistry-sekii-gyo2022-clause-p09-std-e-standard-e1-e12-gk_lk-04': 'HB232-B-01',
 'hb-chemistry-sekii-gyo2022-clause-p09-std-e-standard-e1-e12-gk_lk-12': 'HB232-B-02',
 'hb-chemistry-sekii-gyo2022-clause-p12-std-b-standard-b2-b14-gk_lk-12': 'HB232-B-03'}

new_pages = json.loads((OUT/'viewed/new-rendered-pages.pins.json').read_text())
old_out = OUT.parent / 'current439-source9-HB97-fresh-independent-b-v1'
reused_pages = []
for page in [15,21,24,27,30,31,34,35,36,37]:
    reused_pages.append({'physicalPage': page, 'pin': pin(old_out/'viewed'/f'HB-physical-{page}.png'),
        'role': 'Own earlier actual visual inspection reused against byte-identical primary PDF; not another review opinion'})
viewed = write('VIEWED.HB232.actual-primary-materials.json', {
    'actualCurrentPrimaryPdf': s['actualPrimary'],
    'newPhysicalPagesActuallyViewed': new_pages,
    'ownPreviousPhysicalPageViewsReused': reused_pages,
    'ownPreviousWhole41PageActualTextRead': pin(old_out/'viewed/HB-whole-41-pages.actual-text.txt'),
    'allPrimaryPhysicalPagesReadAsText': list(range(1,42)),
    'newVisuallyViewedPageCount': 16, 'ownReusedVisualPageCount': 10,
    'imageGeneration': False, 'imageEditing': False, 'humanVisualReviewClaim': False})

records = []
for i,g in enumerate(d['sourceGoals']):
    p = prov[g['id']]
    finding = revise.get(g['id'])
    page = 36 if g['id'].startswith('hb-chemistry-sekii-gyo2022-primary-active-ingredient') else int(g['sourceSpan'].split('physical PDF')[1].split(',')[0])
    records.append({
        'recordFormat': 'standalone-informed-source-inventory-candidate-v1',
        'recordId': f'{RUN}.clause-{i+1:03d}', 'runId': RUN,
        'sourceGoalId': g['id'], 'sourceClauseIds': p['sourceClauseIds'],
        'verdict': 'revise' if finding else 'accepted',
        'scope': 'Exact clause body plus its provenance/operator/course/topic record, as inactive source inventory only; no canonical credit',
        'findingId': finding, 'frozenScientificReasoning': findings[finding] if finding else 'Bounded positive source-inventory finding in the frozen FIRST: this whole current authored paraphrase or retained primary clause and its operator/scope provenance match the inspected original clause. Counts are clause records, not independent unique duties. No canonical mapping accepted.',
        'physicalPage': page, 'currentCourseLevel': g['courseLevel'],
        'currentSourceScope': p['sourceScope'], 'requiredOperators': p['requiredOperators'],
        'scientificViewPin': s['scientificView'],
        'sourceGoalJsonPointer': f'/sourceGoals/{i}',
        'wholeSourceGoalDigest': digest(g), 'wholeProvenanceDigest': digest(p),
        'sourcePrimaryPin': s['actualPrimary'], 'rawFIRST': pin(FIRST), 'viewedArtifactLogPin': viewed,
        'evidenceLevel': 'E1', 'gateClaim': 'G1-machine-candidate-only',
        'humanApproval': False, 'canonicalCarrierBinding': None, 'mappingTransferAllowed': False,
        'activeOfficialSourceEntryCreated': False, 'learnerOrLabEvidence': False})
rp = OUT / 'HB232.informed-B.clause-records.jsonl'
assert not rp.exists()
rp.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))+'\n' for r in records))

component_specs = [
 ('primary-clauses', 'sourceGoals', 'revise', '229 accepted /3 revise; findings HB232-B-01..03'),
 ('provenance', 'sourceGoalProvenance', 'accepted', 'Required operator and course/topic provenance retained; must accompany source-body shorthand. Does not erase the three body findings.'),
 ('passages', 'passages', 'revise', '26 accepted /2 revise: page9 and page12 authored passage carriers must reflect the three body corrections.'),
 ('mandatory-vocabulary', 'mandatoryTermSets', 'accepted', '27 thick-frame term sets, scoped by course and applicable theme; no unprinted performance operator inferred.'),
 ('optional-status', 'optionalSourceSuggestions', 'accepted', '113 thin-frame suggestions; no universal obligation, source credit, learner selection or experiment authorization inferred.'),
 ('derived-authority-boundary', 'derivedTeachingEntries', 'accepted', '40 historical bodies retained without official source credit; discovery links are not equivalence or coverage.'),
 ('overlap-counting', 'section2Section3_1SourceOverlaps', 'accepted', '14 partial/contextual non-equivalence records; no duplicate canonical atoms or 232-minus14 unique-duty claim.'),
 ('cross-cutting-framework', 'crossCuttingFrameworkRequirements', 'accepted', 'Framework, safety constraints, base concepts, digital context and assessment/operator interpretation retained as context; no implementation or acceptance inferred.')]
components = []
for name,key,verdict,reason in component_specs:
    components.append({'componentId': name, 'verdict': verdict, 'recordCount': len(d[key]),
        'wholeComponentDigest': digest(d[key]), 'scientificViewJsonPointer': '/'+key,
        'reason': reason, 'rawFIRST': pin(FIRST)})
inventory = write('HB232.informed-B.inventory-result.json', {
    'recordId': RUN+'.inventory', 'runId': RUN, 'verdict': 'revise',
    'findings': [{'findingId': key, 'frozenReasoning': val} for key,val in findings.items()],
    'components': components, 'scopeRulesVerdict': 'accepted with course and topic qualification conjoined',
    'scopeRulesDigest': digest(d['scopeRules']),
    'countingDecision': {'verdict': 'accepted-as-clause-ledger-count',
        'section2Standards': 56, 'section3_1ProcessDigital': 14, 'introductory': 42, 'qualification': 120,
        'clauseRecords': 232, 'independentUniqueDutyCount': None,
        'independentCanonicalAtomCount': None,
        'explanation': 'One numbered standard/content/process bullet per record except explicit inline LK conformation split on26; source overlaps and broader standards remain non-additive.'},
    'previousHB97ConcernResolution': 'HB-C01..C06 substantively addressed by new inventory; three new limited paraphrase findings remain. No retroactive old97 acceptance.',
    'retainedExactScientificPrimaryRows': [g['id'] for g in d['sourceGoals'] if g['id'].startswith('hb-chemistry-sekii-gyo2022-primary-active-ingredient')],
    'retainedPrimaryEqualityBoundary': 'Scientific texts/locators/course/scope are equal in the differently redacted scientific projections. Whole-object equality differs only in old author status/approval-like metadata; no raw-byte equality inferred from these projections.',
    'rawFIRST': pin(FIRST), 'scienceProjectionPin': s['scientificView'], 'actualPrimaryPin': s['actualPrimary'],
    'canonicalMappingStatus': 'OPEN', 'sourceM7Status': 'OPEN',
    'activeOfficialSourceEntriesCreated': 0, 'canonicalCarrierBindingsCreated': 0,
    'humanApproval': False, 'newPAMVApproval': False, 'universalSourceApproval': False})

author = json.loads(pathlib.Path(s['authorCandidateSourceBinding']['path']).read_text())
run = write('RUN.HB232.truthful-informed-availability.json', {
    'runFormat': 'standalone-informed-source-inventory-candidate-run-v1', 'runId': RUN,
    'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'startedAtUTC': None, 'startExplanation': 'Exact source-task start not separately recorded; no fabricated timestamp.',
    'reviewer': 'Codex native AI reviewer B', 'environmentDescribedModelFamily': 'GPT-6',
    'exactServedModelBuild': None, 'externalModelInvocation': False, 'crossFamilyIndependenceClaim': False,
    'informedFollowup': True, 'blindToOtherRuns': False,
    'independence': {'ownPriorHB97FindingsAndPrimaryReadKnown': True, 'otherABOpinionsRead': False,
        'authorErrorChecklistsRead': False, 'independentScientificJudgment': True},
    'toolsActuallyUsed': ['exec_command: Python/json/PyMuPDF source reading and page rendering', 'view_image: actual rendered primary pages', 'apply_patch: own frozen findings and serializer'],
    'rawFIRST': pin(FIRST), 'inputSelector': pin(SELECTOR), 'clauseRecords': pin(rp), 'inventoryResult': inventory,
    'actualViewedArtifacts': viewed, 'nativeBlindDCampaignClaim': False,
    'technicalValidationScope': 'Own finite JSON records, frozen exact bindings, clause identities/counts, retained bodies, activation boundary and viewed artifacts; no full central check or build.',
    'stockDOrHumanSourceLedgerClaim': False, 'humanApproval': False,
    'PAMVOrLaboratoryOrSafetyApproval': False, 'MainKSourceWrites': False})

checks = []
for label,expected in [('selector',pin(SELECTOR)),('science',s['scientificView']),('previous97',s['previousScientific97']),('primary',s['actualPrimary']),('author-source-binding',s['authorCandidateSourceBinding']),('rawFIRST',pin(FIRST))]:
    actual = pin(expected['path'])
    good = actual['sha256'] == expected['sha256'] and actual['bytes'] == expected['bytes']
    checks.append({'label':label,'expected':expected,'actual':actual,'unchanged':good})
assert all(c['unchanged'] for c in checks)
assert pin(FIRST)['sha256'] == FIRST_SHA
assert len(records)==232 and len({r['sourceGoalId'] for r in records})==232
assert collections.Counter(r['verdict'] for r in records)=={'accepted':229,'revise':3}
assert all(g['id'] in prov for g in d['sourceGoals'])
assert len({c for p in d['sourceGoalProvenance'] for c in p['sourceClauseIds']})==232
assert len(d['mandatoryTermSets'])==27 and len(d['optionalSourceSuggestions'])==113
assert len(d['derivedTeachingEntries'])==40 and len(d['section2Section3_1SourceOverlaps'])==14
assert author['activation']['active'] is False
assert all(p['mappingTransferAllowed'] is False for p in d['sourceGoalProvenance'])
assert all(o['officialMandatoryCompetency'] is False for o in d['optionalSourceSuggestions'])
assert all(o['officialMandatorySourceGoal'] is False for o in d['derivedTeachingEntries'])
old={g['id']:g for g in previous['wholeCurrentScientific97SourceGoalBodies']}
assert all(x['historicalSourceGoal']==old[x['id']] for x in d['derivedTeachingEntries'])
retained_scientific=[]
for gid in [g['id'] for g in d['sourceGoals'] if g['id'].startswith('hb-chemistry-sekii-gyo2022-primary-active-ingredient')]:
    a=dict(goals[gid]); b=dict(old[gid]); a.pop('metadata',None); b.pop('metadata',None)
    assert a==b
    retained_scientific.append({'sourceGoalId':gid,'allNonMetadataScientificFieldsEqual':True,'rawWholeObjectEqualityNotClaimed':True})
bounded = write('CHECKS.HB232.bounded-output-and-immutability.json', {
    'passed':True,'rawFIRSTUnchanged':True, 'clauseRecords':232,'acceptedCandidates':229,'reviseCandidates':3,
    'wholeInventoryVerdict':'revise','sourceM7':'OPEN','canonicalMapping':'OPEN',
    'activeOfficialSourceEntriesCreated':0,'canonicalCarrierBindingsCreated':0,
    'inputGuards':checks,'retainedPrimaryScientificEquality':retained_scientific,
    'derived40HistoricalBodiesExactToOldScientificProjection':True,
    'stockDValidation':'not applicable; no D campaign claimed','fullCentralOrBuildRun':False})

sealed=write('SELECTOR.HB-primary232-informed-independent-b.sealed.json', {
    'schemaVersion':1,'role':'Finite informed independent B scientific source-inventory review; no activation or source/canonical approval',
    'runId':RUN,'inputSelector':pin(SELECTOR),'rawFIRST':pin(FIRST),
    'clauseRecords':pin(rp),'inventoryResult':inventory,'truthfulRunManifest':run,
    'actualViewedArtifacts':viewed,'boundedChecks':bounded,
    'exactScienceProjection':s['scientificView'],'exactPrevious97Science':s['previousScientific97'],
    'exactActualPrimaryPdf':s['actualPrimary'],'exactAuthorSourceCandidateBinding':s['authorCandidateSourceBinding'],
    'summary':{'inventoryVerdict':'revise','acceptedClauseCandidates':229,'reviseClauseCandidates':3,
        'findingIds':['HB232-B-01','HB232-B-02','HB232-B-03'],
        'clauseLedgerCountAccepted':232,'independentUniqueDutyCount':None,
        'canonicalMappingStatus':'OPEN','sourceM7Status':'OPEN'},
    'informedFollowup':True,'blindDCampaignClaim':False,'humanApproval':False,
    'newPAMVApproval':False,'learnerOrLaboratoryEvidence':False,'safetyApproval':False,
    'activeOfficialSourceEntriesCreated':0,'canonicalCarrierBindingsCreated':0,
    'MainMutated':False,'KMutated':False,'sourceMutated':False})
print(json.dumps({'selector':sealed,'FIRST':pin(FIRST),'records':pin(rp),'inventory':inventory,'run':run,'checks':bounded},indent=2))
