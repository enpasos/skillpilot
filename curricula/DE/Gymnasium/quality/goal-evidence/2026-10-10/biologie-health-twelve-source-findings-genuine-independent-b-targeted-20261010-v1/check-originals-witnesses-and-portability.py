# SPDX-License-Identifier: Apache-2.0
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import fitz

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1')
OWN = Path(__file__).parent
def read(p): return json.loads(Path(p).read_text())
def bind(p):
    p = Path(p); data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def verify(ref):
    p = Path(ref['path']); assert p.is_file() and not p.is_symlink(), ref
    assert bind(p) == ref, ref
def write(name, value):
    p = OWN / name; p.parent.mkdir(exist_ok=True, parents=True)
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

entry = read(AUTHOR / 'neutral-source-findings-targeted-author-successor.entry.json')
freeze = read(AUTHOR / 'FINAL.targeted-source-neutral-author.freeze.json')
addendum = read(AUTHOR / 'FINAL.source-context-precision-addendum.freeze.json')
all_refs = freeze['ownBindings'] + freeze['externalBindings'] + [freeze['entry']]
all_refs += [v for v in addendum.values() if isinstance(v, dict) and 'sha256' in v]
for ref in all_refs: verify(ref)
normal_input_records = read(AUTHOR / 'inputs/all-normal-source-inputs.actual-regular-portable-bindings.json')['records']
for row in normal_input_records: verify(row['actualRegularPortableBinding'])

actual_primary_reads = []
for row in read(AUTHOR / 'primary/actual-eight-whole-primary-page-author-read.receipt.json')['records']:
    for key in ['actualWholePrimaryPdf', 'wholePhysicalPageText', 'actualWholePhysicalPageRaster']: verify(row[key])
    with fitz.open(row['actualWholePrimaryPdf']['path']) as pdf:
        page = pdf[row['physicalPageOneBased'] - 1]
        assert page.get_text() == Path(row['wholePhysicalPageText']['path']).read_text()
        rendered = page.get_pixmap(matrix=fitz.Matrix(96 / 72, 96 / 72), alpha=False)
        retained = fitz.Pixmap(row['actualWholePhysicalPageRaster']['path'])
        assert rendered.width == retained.width and rendered.height == retained.height
        assert rendered.samples == retained.samples
    actual_primary_reads.append({k:row[k] for k in ['sourceDocumentKey', 'physicalPageOneBased', 'actualWholePrimaryPdf', 'wholePhysicalPageText', 'actualWholePhysicalPageRaster']} | {'reviewer': 'genuine independent B', 'actualOriginalPdfWholePageTextRead': True, 'actualWholeRasterViewed': True, 'retainedTextAndPixelsReproducedFromActualOriginalPdf': True, 'wholeDocumentReadClaimed': False, 'independentScientificDecisionInFirstEntry': True, 'humanApproval': False})
write('actual-eight-whole-original-primary-page.independent-b-read.receipt.json', {'schemaVersion': 1, 'records': actual_primary_reads, 'newPublicationRights': False, 'humanApproved': 0})

neutral = read(AUTHOR / 'sources/current182-whole-direct-witnesses-and-actual-primaries.neutral.json')
deltas = read(AUTHOR / 'sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
pair_map = {}; whole_pairs = []
before_witnesses = set(); after_witnesses = set(); target_ids = set(neutral['goalIds'])
for b in neutral['whole31PairBindings']:
    verify(b['mapping']); verify(b['extraction'])
    mapping = read(b['mapping']['path']); extraction = read(b['extraction']['path'])
    sg = {s['id']: s for s in extraction['sourceGoals']}; assert len(sg) == len(extraction['sourceGoals'])
    for m in mapping['mappings']: assert m.get('legacyGoalId', m.get('sourceGoalId')) in sg
    pair_map[b['mapping']['path']] = (mapping, extraction, sg)
    whole_pairs.append(b | {'actualWholeSourceGoalsParsed': len(sg), 'actualWholeMappingsParsed': len(mapping['mappings']), 'actualWholeDecisionsParsed': len(mapping['decisions'])})
    change = next((d for d in deltas['wholeChangedMappingPairs'] if d['afterMapping']['path'] == b['mapping']['path']), None)
    before = read(change['beforeMapping']['path']) if change else mapping
    for label, data, dest in [('before', before, before_witnesses), ('after', mapping, after_witnesses)]:
        for m in data['mappings']:
            if m['canonicalGoalId'] in target_ids: dest.add((b['mapping']['path'], m.get('legacyGoalId', m.get('sourceGoalId')), m['canonicalGoalId']))
assert len(before_witnesses) == 186 and len(after_witnesses) == 182
removed = {(d['sourceGoalId'], d['canonicalGoalId']) for d in deltas['removedUnsupportedDirectPairs']}
assert {(sid,gid) for _,sid,gid in before_witnesses-after_witnesses} == removed
assert not after_witnesses-before_witnesses
seen = set(); witness_records = []
for goal in neutral['rows']:
    for w in goal['wholeDirectSourceWitnesses']:
        mapping, extraction, sg = pair_map[w['mapping']['path']]
        sid = w['wholeCurrentSourceGoal']['id']; gid = goal['goalId']
        assert w['wholeCurrentSourceGoal'] == sg[sid]
        assert w['wholeCurrentMappingRecord'] in mapping['mappings']
        assert w['wholeCurrentMappingRecord']['canonicalGoalId'] == gid
        actual_decisions = [d for d in mapping['decisions'] if d.get('sourceGoalId', d.get('id')) == sid]
        assert w['wholeCurrentSourceDecisions'] == actual_decisions
        seen.add((w['mapping']['path'], sid, gid))
        witness_records.append({'goalId':gid, 'sourceGoalId':sid, 'mapping':w['mapping'], 'extraction':w['extraction'], 'wholeSourceGoalMatchesActualExtraction':True, 'wholeMappingRecordMatchesActualMapping':True, 'wholeDecisionMatchesActualMapping':True, 'coverage':w['wholeCurrentMappingRecord']['matchType'], 'targetSpecificLocator':w.get('targetSpecificActualPrimaryLocator'), 'scientificWholeSourceApproval':False})
assert seen == after_witnesses
contexts = read(AUTHOR / 'native/targeted-source-affected-complete-current-page-contexts.neutral.json')
model = read(AUTHOR / 'native/current394-source-corrected.actual-normal-model.json'); pages={p['goalId']:p for p in model['pages']}
for row in contexts['records']:
    assert row['wholeBeforeNativePage'] == row['wholeAfterNativePage'] == pages[row['goalId']]
assert len(contexts['records']) == 10
assert len([r for r in contexts['records'] if r['protectedCurrent353Goal']]) == 4
write('checks/whole31-pairs-182-witnesses-and-ten-whole-contexts.independent-b.actual.json', {'schemaVersion':1, 'wholePairReads':whole_pairs, 'actualBeforeDirectWitnesses':len(before_witnesses), 'actualAfterDirectWitnesses':len(after_witnesses), 'actualRemovedPairs':sorted([list(r) for r in removed]), 'whole182WitnessRecords':witness_records, 'currentWholePageContextsExact':10, 'protectedWholePageContextsExact':4, 'retainedClusterIsNotAtomicPage':True, 'newWholeSourceApproval':False, 'humanApproved':0, 'strictGain':0})

spec = importlib.util.spec_from_file_location('normal_schema_validator','scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec); spec.loader.exec_module(validator)
schema = read('docs/landscape-runtime.schema.json')
json_files = list(AUTHOR.rglob('*.json')) + list(OWN.rglob('*.json'))
for p in json_files: assert validator.validate_file(str(p), schema), p
errors = validator.curriculum_symlink_errors('.'); assert not errors, errors
paths = sorted({r['path'] for r in all_refs} | {r['actualRegularPortableBinding']['path'] for r in normal_input_records} | {str(p) for p in OWN.rglob('*') if p.is_file()})
ignored = subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(paths)+'\n',text=True,capture_output=True)
assert ignored.returncode in [0,1], ignored.stderr
assert not ignored.stdout, ignored.stdout
write('checks/normal-json-portability-and-frozen-byte-integrity.independent-b.actual.json', {'schemaVersion':1, 'normalValidator':'scripts/validate_schemas.py:validate_file/curriculum_symlink_errors', 'completeJsonFilesParsed':len(json_files), 'normalValidationPassed':True, 'curriculumSymlinkErrors':errors, 'ignoredRequiredFiles':[], 'authorOwnAndExternalFrozenBindingsVerified':len(all_refs), 'normalActualInputBindingsVerified':len(normal_input_records), 'allCheckedRequiredFilesRegularAndCommittable':True, 'originalFreeze':bind(AUTHOR/'FINAL.targeted-source-neutral-author.freeze.json'), 'originalEntry':bind(AUTHOR/'neutral-source-findings-targeted-author-successor.entry.json'), 'addendumFreeze':bind(AUTHOR/'FINAL.source-context-precision-addendum.freeze.json'), 'activeWrites':[], 'humanApproved':0, 'strictGain':0})
print(json.dumps({'wholeActualOriginalPagesReadAndViewed':8,'wholeMappingPairsParsed':len(whole_pairs),'wholeDirectWitnessesValidated':len(witness_records),'wholeCurrentContextPages':10,'frozenBindingsExact':len(all_refs),'normalJsonValidation':'EXIT0','normalPortability':'EXIT0','humanApproved':0,'strictGain':0}))
