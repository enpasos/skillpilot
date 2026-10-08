# SPDX-License-Identifier: Apache-2.0
"""Inactive adoption of genuinely read bounded source-role pairs; no goal completion."""
import copy
import datetime
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
V2 = BASE / 'chemie-b014-b477-nine-source-role-continuation-author-v2'
V4 = BASE / 'chemie-b014-b477-four-ion-intentions-targeted-author-20261008-v4'
A6 = BASE / 'chemie-b014-b477-nine-source-role-independent-a-20261008-v1'
B6 = BASE / 'chemie-b014-b477-nine-source-role-whole-four-case-independent-b-20261008-v3'
A2 = BASE / 'chemie-b014-b477-four-ion-intentions-targeted-independent-a-20261008-v4'
B2 = BASE / 'chemie-b014-b477-four-ion-intentions-whole-source-independent-b-20261008-v4'
DECLARED = {}
def rel(p): return str(p.relative_to(ROOT))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):
    out = {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}; DECLARED[out['path']] = out; return out
def read(p): bind(p); return json.loads(p.read_text())
def put(name, x):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    data = x if isinstance(x, bytes) else (json.dumps(x, ensure_ascii=False, indent=2)+'\n').encode()
    if p.exists(): assert p.read_bytes() == data, p
    else: p.write_bytes(data)
    return p
def verify(b):
    p = Path(b['path']); p = p if p.is_absolute() else ROOT / p
    assert p.exists() and sha(p) == b['sha256'].removeprefix('sha256:'), p
    if 'bytes' in b: assert p.stat().st_size == b['bytes'], p
    if p.is_relative_to(ROOT) and p.suffix not in ['.pdf','.html']: bind(p)
    return p

seals = {}
for label, folder, name, expected in [
    ('author2',V2,'candidate-freeze.manifest.json','ca7fa1072c9a805b5046a8e242d63fcd25dde711477a685dad54e9f4c65dec0e'),
    ('A6',A6,'first-source-role-and-whole-case.independent-a.exact.freeze.json','c38d097a532edcc4fe51e24a193c965384c7b32bba9f177c2f897c8e1159a069'),
    ('B6',B6,'independent-b-original-nine-role-four-case.first-verdict.freeze.json','7b830bd5b0024d2048728c10c01440c3cffd2d0097a5c171912289b4f6736cb5'),
    ('author4',V4,'four-ion-intentions-whole-source-author-v4.first.freeze.json','92a4a4d6e6d89b5862181a8ed8659a1728cbd1bf289d56f77afe512d6d62032a'),
    ('A2',A2,'four-ion-three-whole-cases-two-source-unions.independent-a.first-verdict.freeze.json','75fb6546c588aec16528fd809bc4a38478c4107ec7cbc87c916c3ff211ad7ce9'),
    ('B2',B2,'independent-b-four-ion-intentions.first-verdict.freeze.json','80f364c60b0bf97fbe9bbeaaf4a02c83ababb756a7bad74bc0b5deb8577164f8')]:
    p = folder / name; assert sha(p) == expected; s = read(p)
    rows = s.get('files', s.get('entries', []))
    if not rows:
        rows = [b for key in ['exactInputs','exactOwnOutputs','exactInputBindings','exactOwnOutputBindings'] for b in s.get(key, [])]
    actual = []
    for b in rows:
        path = b.get('path',b.get('inputPath')); assert path, b
        if path == 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json' and sha(ROOT / path) != b['sha256'].removeprefix('sha256:'):
            actual.append({'historicalInput':b,'liveChangedOnlyBySeparatelyRecordedBiologyIntegration':True}); continue
        verify(b); actual.append({'exact':True,'path':path})
    seals[label] = {'seal':bind(p),'actualEntriesVerified':len(actual),'historicalRegistryExceptions':[x for x in actual if 'historicalInput' in x]}
snapshot = read(V4 / 'exact-current-repository-input-snapshots.manifest.json')
for row in snapshot['snapshots']:
    verify(row['exactSnapshot']); old = row['originalInput']; p = ROOT / old['path']
    if old['path'].endswith('de-gymnasium-math-physics.config.json'):
        frozen = read(ROOT / row['exactSnapshot']['path']); current = read(p)
        assert {k:v for k,v in frozen.items() if k!='subjects'} == {k:v for k,v in current.items() if k!='subjects'}
        assert {s['subject']:s for s in frozen['subjects'] if s['subject']!='biologie'} == {s['subject']:s for s in current['subjects'] if s['subject']!='biologie'}
    else: verify(old)
whole_a6 = read(A6 / 'first-nine-source-role-and-four-whole-case.independent-a.verdicts.json')
whole_b6 = read(B6 / 'nine-whole-original-source-role-first-verdicts.independent-b.json')
whole_a2 = read(A2 / 'two-original-source-unions-and-six-ion-intentions.independent-a.first-science-verdict.json')
whole_b2 = read(B2 / 'independent-b-three-new-cases-six-intention-union.first-whole-judgment.json')
six = read(V2 / 'six-limited-operative-source-role-deltas.inactive.json')['entries']
two = read(V4 / 'two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json')['rows']
assert len(six) == 6 and len(two) == 2
assert whole_b2['operativeUnion']['judgment'] == 'accept_exact_bounded_source_role_union'
assert whole_b2['newConcreteHoldCount'] == 0 and whole_b2['newWholeGoalApprovals'] == 0
mappingpaths = sorted(set(x['mappingPath'] for x in six+two))
mappingobjects = {p:read(ROOT / p) for p in mappingpaths}; before = copy.deepcopy(mappingobjects)
adopted = []
for x in six:
    a = next(r for r in whole_a6['boundedSourceRoleVerdicts'] if r['sourceGoalId'] == x['sourceGoalId'])
    b = next(r for r in whole_b6['records'] if r['sourceGoalId'] == x['sourceGoalId'])
    assert a['status'] == 'PASS_BOUNDED_SOURCE_ROLE_REMOVAL' and b['verdict'] == 'KEEP_BOUNDED_B477_ROLE_REMOVAL'
    assert a['approvedExactBoundedFieldDeltas'] == x['fieldDeltas'] and a['approvedExactBoundedRemovedMappingEdges'] == x['removeOnlyMappingEdges']
    m = mappingobjects[x['mappingPath']]; r = m['decisions'][x['decisionIndex']]; assert r == x['wholeOriginalDecision']
    original = copy.deepcopy(r); r['canonicalGoalIds'] = x['fieldDeltas'][0]['afterCandidate']
    r['rationale'] = 'Bounded source-role machine adoption from genuine independently first-sealed A6/B6 whole-source decisions; only the overbroad B477 edge is removed. Existing accepted current Brønsted whole goal and cases retained without new historical science review. A: '+a['actualPrimaryReadingFinding']+' B: '+b['scienceFindings']+' Exact original source text, identity, course/stage and every other partner duty retained; no whole B477/481/cluster approval, practical performance or human approval. Seals: '+seals['A6']['seal']['path']+'; '+seals['B6']['seal']['path']
    r['reviewedAt'] = max(a['reviewedAt'],b['reviewedAtUTC']); r['reviewer'] = 'Technical integrator of genuine independent source A6/B6; ai_candidate E1/G1, no new scientific review'
    for edge in x['removeOnlyMappingEdges']: assert m['mappings'].count(edge) == 1; m['mappings'].remove(edge)
    assert [e for e in m['mappings'] if e['legacyGoalId']==x['sourceGoalId']] == x['retainedMappingEdges']
    adopted.append({'sourceGoalId':x['sourceGoalId'],'mappingPath':x['mappingPath'],'beforeDecision':original,'afterDecision':copy.deepcopy(r),'beforeEdges':x['removeOnlyMappingEdges']+x['retainedMappingEdges'],'afterEdges':x['retainedMappingEdges'],'actualA':a,'actualB':b,'scope':'bounded_role_drop_only'})
for x in two:
    a = next(r for r in whole_a2['sourceUnionVerdicts'] if r['sourceGoalId'] == x['sourceGoalId']); assert a['verdict'] == 'KEEP_BOUNDED_SIX_ION_INTENT_SOURCE_UNION'
    assert a['proposedActualOperativeCurrentGoalIds'] == whole_b2['operativeUnion']['candidateGoalIds'] == x['candidateAfter']
    m = mappingobjects[x['mappingPath']]; r = next(r for r in m['decisions'] if r['sourceGoalId']==x['sourceGoalId']); assert r == x['wholeOriginalDecisionBefore']
    original = copy.deepcopy(r); r['canonicalGoalIds'] = x['candidateAfter']
    r['rationale'] = 'Bounded machine E1/G1 source-role union accepted by genuine independently first-sealed A2/B2 whole original source/case review. Operative current1c/fd/a44 retain proton transfer, water-ion predominance and selected-ion detection; retained chloride/water cases plus three new complete Br/carbonate/ammonium DE/EN synthetic witnesses cover the named six-ion intentions only. A: '+a['reason']+' B: '+whole_b2['wholeA44FiveCaseUnion']['wholeBodyReason']+' Original Q3 source/stage/course and binding practical intent remain unchanged. Not whole a44 P approval, performed experiment, whole Q3 source completion, B477 compound closure, whole481 closure or human approval. Seals: '+seals['A2']['seal']['path']+'; '+seals['B2']['seal']['path']
    r['reviewedAt'] = whole_b2['firstJudgmentAtUTC']; r['reviewer'] = 'Technical integrator of genuine independent source A2/B2; ai_candidate E1/G1, no new scientific review'
    currentedges = [e for e in m['mappings'] if e['legacyGoalId']==x['sourceGoalId']]; assert currentedges == x['wholeOriginalEdgesBefore']
    oldpositions = [i for i,e in enumerate(m['mappings']) if e['legacyGoalId']==x['sourceGoalId']]; first = min(oldpositions)
    remaining = [e for e in m['mappings'] if e['legacyGoalId']!=x['sourceGoalId']]; m['mappings'] = remaining[:first]+x['candidateNewEdges']+remaining[first:]
    adopted.append({'sourceGoalId':x['sourceGoalId'],'mappingPath':x['mappingPath'],'beforeDecision':original,'afterDecision':copy.deepcopy(r),'beforeEdges':currentedges,'afterEdges':x['candidateNewEdges'],'actualA':a,'actualB':whole_b2['operativeUnion'],'scope':'bounded_six_ion_source_union_only'})
selectedsource = {x['sourceGoalId'] for x in adopted}; replacements=[]
for path, m in mappingobjects.items():
    old = before[path]; assert {k:v for k,v in old.items() if k not in ['decisions','mappings']} == {k:v for k,v in m.items() if k not in ['decisions','mappings']}
    assert len(old['decisions']) == len(m['decisions'])
    for oldrow,newrow in zip(old['decisions'],m['decisions']):
        if oldrow['sourceGoalId'] not in selectedsource: assert oldrow == newrow
        else: assert {k:v for k,v in oldrow.items() if k not in ['canonicalGoalIds','rationale','reviewedAt','reviewer']} == {k:v for k,v in newrow.items() if k not in ['canonicalGoalIds','rationale','reviewedAt','reviewer']}
    assert [e for e in old['mappings'] if e['legacyGoalId'] not in selectedsource] == [e for e in m['mappings'] if e['legacyGoalId'] not in selectedsource]
    beforep = put('before-mappings/'+path, (ROOT / path).read_bytes()); afterp = put('candidate-mappings/'+path,m)
    replacements.append({'target':path,'expectedBefore':bind(ROOT / path),'source':bind(afterp),'historicalBeforeSnapshot':bind(beforep)})

inputspath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'; inputs = read(ROOT / inputspath)
requiredpaths = {inputspath,inputs['landscapePath'],inputs['semanticKindLedgerPath'],inputs['durationModelPolicyPath'],*inputs['mappingPaths'],*inputs.get('fallbackViewPaths',[]),'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'}
for p in inputs['mappingPaths']: requiredpaths.add(read(ROOT / p)['sourceExtractionPath'])
for p in requiredpaths:
    original = ROOT / p; bind(original)
    for version in ['before','after']:
        data = (json.dumps(mappingobjects[p],ensure_ascii=False,indent=2)+'\n').encode() if version=='after' and p in mappingobjects else original.read_bytes()
        put('native-isolated-inputs/'+version+'/'+p,data)
canon = read(ROOT / inputs['landscapePath']); assert sha(ROOT / inputs['landscapePath']) == 'f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84'
assert len(canon['goals']) == 480
registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'; registry = read(registry_path)
chem = next(s for s in registry['subjects'] if s['subject']=='chemie'); assert len(read(ROOT / chem['semanticKindLedgerPath'])['decisions']) == 480
beforebindings = {'canonical':bind(ROOT / inputs['landscapePath']),'kinds':bind(ROOT / chem['semanticKindLedgerPath']),'qa':bind(ROOT / chem['visualizationQaPath']),'sourceAtlasInputConfig':bind(ROOT / inputspath)}
protected = []
for subject in registry['subjects']:
    for field in ['landscapePath','semanticKindLedgerPath','visualizationQaPath']:
        if field in subject: protected.append(bind(ROOT / subject[field]))
    if subject['subject']=='chemie':
        for field in ['positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']:
            for path in subject.get(field,[]):
                config = read(ROOT / path); protected.append(bind(ROOT / path)); protected.append(bind(ROOT / config['reviewPath']))
        if 'memoryReviewConfigPath' in subject:
            config = read(ROOT / subject['memoryReviewConfigPath']); protected.append(bind(ROOT / subject['memoryReviewConfigPath']));protected.append(bind(ROOT / config['reviewPath']))
ledgerpath = ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json';ledger=read(ledgerpath);assert len(ledger['activeBatchConfigPaths'])==7
protected.append(bind(ledgerpath));protected.append(bind(ROOT / 'app/scripts/config/curriculum-maturity-floor-policy.json'))
for path in ledger['activeBatchConfigPaths']:protected.append(bind(ROOT / path))
cases = read(V4 / 'three-operative-new-whole-DEEN-ion-source-cases.manifest.author-v4.json'); assert len(cases['wholeCases'])==3
put('supplemental-three-whole-DEEN-cases.retained-exact.json',cases)
put('checks/paired-eight-source-roles-and-current-guard.technical.json',{'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seals':seals,'actualReadBoundedPair':adopted,'mappingReplacements':replacements,'selectedSourceGoalIds':sorted(selectedsource),'canonicalGoalCount':480,'currentCurricularAtomicDenominator':378,'currentWholeCanonicalSha256':beforebindings['canonical']['sha256'],'beforeBindings':beforebindings,'protectedOtherFiles':protected,'chemistryRegistrySubject':chem,'registrySnapshot':bind(registry_path),'allSevenChemistryClaims':ledger['activeBatchConfigPaths'],'sourceAtlasConfigPath':inputspath,'inertInputRoots':{v:rel(OWN / 'native-isolated-inputs' / v) for v in ['before','after']},'historicalRegistryDriftLocalizedToBiology':True,'originalSourceTextCourseStageChanges':0,'wholeGoalOrProfileOrImageChanges':0,'supplementalSourceCases':{'count':3,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','pairedBoundedMachineScience':'PASS','newWholePApproval':False,'newActivePRecords':0},'HBQSourceGoalRemainsOpen':'hb-chemistry-sekii-gyo2022-3-2-q3-1-saeure-base-017-053ed25b','wholeB477RemainsOpen':True,'whole481RemainsOpen':True,'sourceAtlasAndNativeBindingImpact':'pending actual isolated build','newScientificGoalClosures':0,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
put('checks/initial-declared-inputs.technical.json',{'files':list(DECLARED.values()),'rawThirdPartyPDFOrHTMLRequired':False,'originalPrimaryReadReceiptsRetainedAsHistory':True})
print(json.dumps({'genuineBoundedSourceRolePair':8,'mappingFilesPrepared':len(replacements),'sourceRowsChanged':8,'currentCanonicalWholeGoals':480,'currentDenominator':378,'newGoals':0,'newPRecords':0,'activeWrites':0,'strictGainClaimed':0}))
