"""Serialize the already frozen Source9 science; do not modify any review input."""
import collections
import datetime
import hashlib
import json
import pathlib
import shutil
import sys

OUT = pathlib.Path(__file__).resolve().parent
BASE = OUT.parent / 'current439-source9-HB97-whole-union-neutral-review-preparation-technical-v1'
SELECTOR = BASE / 'SELECTOR.clean-current-Source9-HB97-with-whole-target-subtrees-real-assets-materials.sealed.json'
RAW = OUT / 'FIRST.independent-Source9-HB97.scientific.frozen.md'
FIRST_SHA = 'b577d5418ad784c6c0f2fd2a7a26e1b90ffea34cfc935034f1f308e7e3d920d3'
RUN_ID = 'chemie-current439-source9-HB97-independent-b-20261017-v1'

def pin(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()

def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

assert pin(RAW)['sha256'] == FIRST_SHA
assert pin(SELECTOR)['sha256'] == '3e459d001f5f7b067b46f8c61908a798f33a5927b24243c994bc7a6a9270cd33'
s = json.loads(SELECTOR.read_text())
science_path = pathlib.Path(s['view']['path'])
science = json.loads(science_path.read_text())
context_path = BASE / 'CONTEXT.complete-41-current-mapped-target-subtrees-P-profiles-and-real-assets.no-old-verdicts.json'
context = json.loads(context_path.read_text())
targets = {c['goalId']: c for c in context['wholeTargetContexts']}
first = RAW.read_text()
sections = {}
for i in range(1, 10):
    start = first.index(f'## CURRENT-SOURCE-{i:02d} ')
    end = first.index('\n## ', start + 4)
    sections[i] = first[start:end]
hb_section = first[first.index('## HB97 —'):first.index('\n## Frozen outcome')]

def closure(ids):
    seen = set()
    def visit(gid):
        if gid in seen:
            return
        assert gid in targets, gid
        seen.add(gid)
        for child in targets[gid]['wholeCurrentScientificCanonicalGoal'].get('contains', []):
            visit(child)
    for gid in ids:
        visit(gid)
    return sorted(seen)

bindings = []
for gid, c in targets.items():
    bindings.append({'goalId': gid, 'directMappedTarget': c['isDirectMappedTarget'],
        'goalBodyDigest': digest(c['wholeCurrentScientificCanonicalGoal']),
        'currentProfileBodyDigest': digest(c['wholeCurrentEvidenceProfile']),
        'wholeContextDigest': digest(c), 'profileJsonPointer': c['profileJsonPointer'],
        'sourceContextPin': pin(context_path)})

pages = json.loads((OUT / 'viewed/PDF-pages-rendered.json').read_text())
assets = context['actualBoundAssets']
viewed = write('VIEWED.actual-artifacts.pins.json', {
    'role': 'Actual read/view log, no asset or source approval',
    'officialPdfPhysicalPagesVisuallyInspected': pages,
    'officialPdfPartnersReadForSource9': [p['reviewCopyPin'] for p in s['primaryPartners']],
    'HBWholeActualTextRead': pin(OUT / 'viewed/HB-whole-41-pages.actual-text.txt'),
    'HBPhysicalPagesTextRead': list(range(1, 42)),
    'originalImageFilesVisuallyInspected': [dict(goalId=a['goalId'], **a['reviewCopyPin']) for a in assets],
    'originalImageFileCount': len(assets),
    'distinctOriginalImageDigests': len({a['reviewCopyPin']['sha256'] for a in assets}),
    'imageGeneration': False, 'imageEditing': False, 'humanVisualReviewClaim': False})

material = OUT.parent / 'current439-remediation14-guarded-root-integration-technical-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json'
assert pin(material)['sha256'] == 'a2587f052db8c85bcd234e4aefacd65a99e18702b14b0654b37d003520787e07'
copy = OUT / 'viewed/eleven-complete-cases.remediated.author.byte-exact.json'
shutil.copyfile(material, copy)
material_pin = pin(copy)

qualifiers = {
    1: 'Additional LK column in shared BE/BB official PDF30; current row unspecified requires revision. Specific new carrier is LK-only.',
    2: 'Additional LK column in shared BE/BB official PDF30; current row unspecified requires revision. Specific new carrier is LK-only.',
    3: 'BW Leistungsfach; one further selected family. Dyes carry complete historical/current/future research duty; other listed families are examples, and extra target duties remain broader SkillPilot scope. No learner selection inferred.',
    4: 'HB theme4.3 common bullet4; theme compulsory in LK by official37. No universal GK duty inferred.',
    5: 'HB theme4.3 common bullet5; theme compulsory in LK by official37. No universal GK duty inferred.',
    6: 'HH common basic/elevated nominal topic; assessment verb is explicitly derived from BNE context, not quoted as an original verb.',
    7: 'MV common unshaded GK/LK implementation/depth guidance; official rare-metals extraction/disposal/recycling sentence retained separately from editorial short source text.',
    8: 'NW first-stage SekI. GK/LK are only technical CrossStage view packaging; own hypothetical decision is prospective, not observed household conduct.',
    9: 'SN grade8 LB5; binding left-cell introduction and indicator SE differ from recommended right-cell remarks; technical GK_LK is not an official grade8 course system.'}
finding_ids = {1: ['SB-S01'], 2: ['SB-S02'], 9: ['SB-S09a', 'SB-S09b']}
records = []
for i, c in enumerate(science['cases'], 1):
    ids = c['currentMappedTargetIds']
    union = closure(ids)
    relevant_asset_pins = [a['reviewCopyPin'] for a in assets if a['goalId'] in union]
    records.append({'recordFormat': 'standalone-source-scientific-candidate-v1',
        'recordId': f'{RUN_ID}.source-{i:02d}', 'runId': RUN_ID,
        'caseId': c['caseId'], 'sourceGoalId': c['sourceGoalId'],
        'jurisdiction': c['jurisdiction'],
        'verdict': 'revise' if i in finding_ids else 'accepted',
        'verdictScope': 'Only this exact current operative source row, with the complete mapped current target closure and explicit official qualifiers; machine candidate only',
        'findingIds': finding_ids.get(i, []), 'qualifierAndBroaderTargetBoundary': qualifiers[i],
        'frozenScientificReasoning': sections[i], 'rawFirstPin': pin(RAW),
        'wholeOperativeSourceGoalDigest': digest(c['wholeCurrentOperativeScientificSourceGoal']),
        'wholePassagesDigest': digest(c['wholeCurrentPassageBodies']),
        'currentMappingInputDigest': digest(c['mappingInputs']),
        'wholeCaseInputDigest': digest(c), 'scienceProjectionPin': pin(science_path),
        'sourceExtractionPins': [x['sourceExtractionPin'] for x in c['mappingInputs']],
        'currentMappingFilePins': [x['mappingFilePin'] for x in c['mappingInputs'] if 'mappingFilePin' in x],
        'directMappedTargetIds': ids, 'wholeMappedTargetClosureIds': union,
        'wholeTargetBindings': [x for x in bindings if x['goalId'] in union],
        'actualPrimaryPdfCopies': c['actualPrimaryPdfCopies'],
        'primaryPhysicalPageLocators': c['primaryPhysicalPageLocators'],
        'actualWholeMaterialAdditionalPin': material_pin if i in [3,4,5] else None,
        'actualViewedTargetAssetPins': relevant_asset_pins, 'viewedArtifactLogPin': viewed,
        'evidenceLevel': 'E1', 'gateClaim': 'G1-machine-candidate-only',
        'humanApproval': False, 'learnerPerformance': False, 'practicalAuthorization': False,
        'newDPAMVApproval': False, 'wholeJurisdictionSourceApproval': False})
records_path = OUT / 'SOURCE9.independent-b.result-records.jsonl'
assert not records_path.exists()
records_path.write_text(''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in records))
hb = write('HB97.independent-b.count-granularity.result.json', {
    'recordFormat': 'standalone-source-scientific-candidate-v1', 'recordId': f'{RUN_ID}.HB97',
    'runId': RUN_ID, 'verdict': 'HOLD', 'currentSourceRecordCount': 97, 'currentPassageCount': 20,
    'countIsUniqueOfficialCompetencyCount': False, 'replacementOfficialCount': None,
    'findingIds': [f'HB-C{i:02d}' for i in range(1,7)],
    'frozenScientificReasoning': hb_section,
    'rawFirstPin': pin(RAW), 'sourceExtractionPin': science['HB97CountGranularityInputs']['sourceExtractionPin'],
    'whole97SourceBodiesDigest': digest(science['HB97CountGranularityInputs']['wholeCurrentScientific97SourceGoalBodies']),
    'whole20PassagesDigest': digest(science['HB97CountGranularityInputs']['wholeCurrent20PassageBodies']),
    'scienceProjectionPin': pin(science_path), 'viewedArtifactLogPin': viewed,
    'evidenceLevel': 'E1', 'gateClaim': 'G1-machine-candidate-only', 'humanApproval': False,
    'wholeHBSourceApproval': False, 'authorChangesPerformed': False})

run = write('RUN.independent-b.truthful-native-availability.json', {
    'runFormat': 'standalone-source-scientific-candidate-run-v1', 'runId': RUN_ID,
    'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'startedAtUTC': None, 'startedAtExplanation': 'Exact task start was not separately recorded; no fabricated start timestamp.',
    'reviewer': 'Codex native conversational AI reviewer B',
    'model': {'environmentDescribedFamily': 'GPT-6', 'exactServedModelBuild': None,
        'externalModelInvocation': False, 'crossFamilyIndependenceClaim': False},
    'toolsActuallyUsed': ['exec_command: Python3/json/hashlib/PyMuPDF source reading and rendering', 'view_image: actual original images and rendered official PDF pages', 'apply_patch: own findings and serializer'],
    'independence': {'otherReviewerScientificOutputsRead': False, 'ownPriorD12AndInformedP1Known': True,
        'independentSourceJudgmentAuthored': True, 'blindToOtherRuns': False,
        'explanation': 'No other source reviewer opinion read; own prior D/P work is known. Neither is source-approval evidence. No blind native D campaign is claimed.'},
    'rawFirstPin': pin(RAW), 'inputSelectorPin': pin(SELECTOR), 'sourceRecordsPin': pin(records_path),
    'HB97ResultPin': hb, 'actualViewedArtifactsPin': viewed,
    'nativeDCampaignOrBatchClaimed': False,
    'stockSourceReviewContractUsed': False,
    'contractBoundary': 'Existing source-verification-review.schema.json is a Mathematics-specific verbatim/projection and human ledger. These are Chemistry scientific union decisions, not synthetic human ledger entries or a native D run. Bounded output syntax/bindings are checked separately.',
    'pairedSynthesis': False, 'humanApproval': False, 'learnerPerformance': False,
    'practicalOrSafetyApproval': False, 'sourceOrMainOrKWrites': False,
    'fullCentralOrBuildRun': False})

guard_results = []
for expected in s['sourceGuards'] + [s['view'], pin(SELECTOR), pin(context_path), pin(material)]:
    got = pin(expected['path'])
    good = got['sha256'] == expected['sha256'].removeprefix('sha256:') and got['bytes'] == expected['bytes']
    guard_results.append({'expected': expected, 'actual': got, 'unchanged': good})
assert all(x['unchanged'] for x in guard_results)
assert len(records) == 9 and [x['caseId'] for x in records] == s['sourceCaseIds']
assert len({x['sourceGoalId'] for x in records}) == 9
assert set().union(*(set(x['directMappedTargetIds']) for x in records)) == set(context['directMappedGoalIds'])
assert set().union(*(set(x['wholeMappedTargetClosureIds']) for x in records)) == set(context['completeTargetClosureIds'])
assert collections.Counter(x['verdict'] for x in records) == {'accepted': 6, 'revise': 3}
assert len(targets) == 41 and len(assets) == 39 and len(pages) == 20
assert len(science['HB97CountGranularityInputs']['wholeCurrentScientific97SourceGoalBodies']) == 97
assert len(science['HB97CountGranularityInputs']['wholeCurrent20PassageBodies']) == 20
assert pin(RAW)['sha256'] == FIRST_SHA
checks = write('CHECKS.bounded-output-and-input-immutability.json', {
    'scope': 'Only own finite Source9/HB97 output syntax, complete exact input bindings, union membership, viewed artifacts and frozen source guards; no scientific acceptance produced by validation',
    'passed': True, 'recordCount': 9, 'acceptedCandidates': 6, 'reviseCandidates': 3, 'HB97': 'HOLD',
    'directTargets': 24, 'closureTargets': 41, 'imageFilesActuallyViewed': 39, 'pdfPagesActuallyViewed': 20,
    'inputGuardChecks': guard_results, 'rawFirstUnchanged': True,
    'stockDCampaignValidation': 'not applicable to Source9/HB97 standalone science candidates',
    'globalValidationOrBuild': False})

sealed = write('SELECTOR.Source9-HB97-independent-b.sealed.json', {
    'schemaVersion': 1, 'role': 'Finite independent scientific Source9/HB97 B candidate selector; no integration or approval',
    'runId': RUN_ID, 'rawFIRST': pin(RAW), 'sourceRecords': pin(records_path), 'HB97Result': hb,
    'truthfulRunManifest': run, 'actualViewedArtifacts': viewed, 'boundedChecks': checks,
    'baseInputSelector': pin(SELECTOR), 'wholeScienceProjection': pin(science_path),
    'complete41ContextProjection': pin(context_path),
    'additionalActualAuthorMaterialOriginal': pin(material), 'additionalActualAuthorMaterialByteExactCopy': material_pin,
    'currentC650SourcePin': context['currentC650SourcePin'], 'currentP439SourcePin': context['currentP439SourcePin'],
    'current39ViewPins': [v['sourcePin'] for v in science['wholeCurrent39CompositionDefinitions']],
    'recordIds': [r['recordId'] for r in records] + [f'{RUN_ID}.HB97'],
    'summary': {'acceptedSourceCandidates': 6, 'reviseSourceCandidates': 3, 'HB97Verdict': 'HOLD',
        'sourceReviseCases': ['CURRENT-SOURCE-01','CURRENT-SOURCE-02','CURRENT-SOURCE-09']},
    'allOriginalInputGuardsUnchanged': True, 'pairedSynthesis': False, 'humanApproval': False,
    'newDPAMVApproval': False, 'wholeJurisdictionSourceApproval': False,
    'MainMutated': False, 'KMutated': False, 'sourceMutated': False})
print(json.dumps({'selector': sealed, 'rawFIRST': pin(RAW), 'records': pin(records_path), 'HB97': hb, 'run': run, 'checks': checks}, indent=2))
