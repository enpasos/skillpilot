#!/usr/bin/env python3
"""Assemble exact inactive author inputs. No scientific approval is produced."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[7]
package = Path(__file__).resolve().parent
assert (root / 'AGENTS.md').is_file(), root
def load(path):
    return json.loads((root / path).read_text())
def rel(path):
    return str(Path(path).resolve().relative_to(root))
def bind(path):
    path = root / path
    assert path.is_file() and not path.is_symlink(), path
    return {'path': rel(path), 'bytes': path.stat().st_size, 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()}
def write(name, value):
    dest = package / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(rel(dest))

prefix = rel(package)
canonical = load(prefix + '/candidate/whole484-current397.author.inactive.json')
goals = {g['id']: g for g in canonical['goals']}
profiles = load(prefix + '/positive/P8.author.candidates.json')['goals']
ids = {p['goalId'] for p in profiles}
config = load(prefix + '/sources/normal397.author.inputs.json')
rows, pairs, partners = [], [], {}
for mapping_path in config['mappingPaths']:
    mapping = load(mapping_path)
    extraction_path = mapping['sourceExtractionPath']
    extraction = load(extraction_path)
    source_goals = {g['id']: g for g in extraction['sourceGoals']}
    decisions = {d['sourceGoalId']: d for d in mapping['decisions']}
    pairs.append({'mapping': bind(mapping_path), 'extraction': bind(extraction_path)})
    for edge in mapping['mappings']:
        if edge['canonicalGoalId'] not in ids:
            continue
        sid = edge['legacyGoalId']
        decision = decisions[sid]
        assert edge['canonicalGoalId'] in decision['canonicalGoalIds'], edge
        partner_ids = decision['canonicalGoalIds']
        for pid in partner_ids:
            assert pid in goals, pid
            partners[pid] = goals[pid]
        rows.append({'mappingPath': mapping_path, 'sourceExtractionPath': extraction_path,
                     'wholeMappingEdge': edge, 'wholeSourceGoal': source_goals[sid],
                     'wholeActualDecision': decision, 'wholePartnerGoalIds': partner_ids,
                     'wholeCurrentTarget': goals[edge['canonicalGoalId']]})
assert len(rows) == 67, len(rows)
source_rows = write('sources/whole-current67-source-decisions-targets-and-partners.neutral.json',
                    {'role': 'Whole current raw source inputs, not SourceUnion approval', 'rows': rows,
                     'wholeCanonicalPartnerGoals': partners, 'sourceUnionApproval': False, 'humanApproval': False})
source_pairs = write('sources/whole31-current-mapping-extraction-inputs.neutral.json',
                     {'role': 'Exact whole current source pairs', 'pairs': pairs, 'snapshots': config['sourceDocumentSnapshots']})
cases = []
for profile in profiles:
    gid = profile['goalId']
    cases.append({'goalId': gid, 'wholeCurrentGoal': goals[gid], 'wholeCurrentProfile': profile,
                  'wholeCurrentTwoBilingualCases': load(prefix + '/positive/cases/' + gid + '.whole-two-cases.de-en.json')})
profile_inputs = write('inputs/eight-whole-current-goals-profiles-and-sixteen-cases.neutral.json',
                       {'role': 'Whole fictional teaching inputs, not actual learner performance', 'records': cases,
                        'actualLearnerPerformance': False, 'humanApproval': False})
original = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-nature-everyday-responsibility-eight-current369-root-author-20261011-v1'
provenance = write('inputs/original-image-generation-provenance.neutral.json',
                   {'role': 'Generation and exact candidate raster provenance; no independent visual approval',
                    'originalReceipts': [bind(rel(f)) for f in sorted((original / 'images').glob('*.json'))],
                    'actualCandidateRasters': [bind(prefix + '/candidate/source/visualizations/biologie/' + gid + '/' + gid + '.png') for gid in sorted(ids)],
                    'actualPromptHistory': [bind(prefix + '/candidate/source/visualizations/biologie/' + gid + '/prompt.de.md') for gid in sorted(ids)],
                    'generationIsApproval': False})

raw = {'wholeCurrentGoals': prefix + '/candidate/whole484-current397.author.inactive.json',
       'wholeCurrentKinds': prefix + '/candidate/kinds484-current397.author-classification-only.json',
       'wholeCurrentProfiles': prefix + '/positive/P8.author.candidates.json',
       'normalPConfig': prefix + '/positive/P8.author-candidates.normal.config.json',
       'normalPRecords': prefix + '/positive/P8.author-candidates.normal.records.jsonl',
       'whole397Model': prefix + '/native/whole397.author.normal-model.actual.json',
       'normalWholeBookConfig': prefix + '/native/whole397.author.normal.config.json',
       'normalD11Batch': prefix + '/native/current397-native-targeted.author.batch.config.json',
       'wholeD11Input': prefix + '/native/current397-native-targeted/bundle/review-input.json',
       'wholeD11RoundA': prefix + '/native/current397-native-targeted/round-a/description-review-input.json',
       'wholeD11RoundB': prefix + '/native/current397-native-targeted/round-b/description-review-input.json',
       'wholeNativeHTML': prefix + '/native/current397-native-targeted/bundle/book.html',
       'wholeNativePDF': prefix + '/native/current397-native-targeted/bundle/book.pdf',
       'portableHTML': prefix + '/native/portable-current397-native-targeted/bundle/book.html',
       'actualHTMLCaptures': prefix + '/checks/current397-native-targeted-HTML-whole-page-captures.actual.json',
       'actualPDFCaptures': prefix + '/checks/current397-native-targeted-PDF-whole-page-captures.actual.json',
       'actualPageDelta': prefix + '/checks/whole397-current-Bio8-to-Root8-actual-page-delta.json',
       'normalAtlasInputs': prefix + '/sources/normal397.author.inputs.json'}
raw_bindings = {name: bind(path) for name, path in raw.items()}
raw_bindings.update(wholeSource67=source_rows, wholeSourcePairs31=source_pairs,
                    wholeP8Cases16=profile_inputs, generationProvenance=provenance)
external = {}
def scan(value):
    if isinstance(value, dict):
        for v in value.values(): scan(v)
    elif isinstance(value, list):
        for v in value: scan(v)
    elif isinstance(value, str) and value.startswith(('curricula/', 'app/', 'docs/')):
        path = root / value
        if path.is_file() and not path.is_symlink() and not str(path).startswith(str(package) + '/'):
            external[value] = bind(value)
for name in raw.values():
    if name.endswith('.json'):
        scan(load(name))
for pair in pairs:
    scan(load(pair['mapping']['path']))
    scan(load(pair['extraction']['path']))
booklocal = root / 'app/scripts/config/goal-books/inactive/biologie-root8-current397-author-v2'
for path in sorted(booklocal.rglob('*')):
    if path.is_file(): external[rel(path)] = bind(rel(path))
external_manifest = write('inputs/full-external-source-profile-and-normal-bindings.neutral.json',
                          {'role': 'Exact external input preservation, not a new scientific review',
                           'bindings': list(external.values())})
raw_bindings['externalInputs'] = external_manifest
first = write('RAW-FIRST.neutral-current397-root8-complete-input-manifest.json',
              {'role': 'Neutral complete AUTHOR inputs for genuine independent first passes',
               'wholeGoals': 484, 'curricularAtomic': 397, 'newP': 8, 'wholeCases': 16,
               'normalNativeDescriptionUnion': 11, 'inputs': raw_bindings,
               'independentReview': False, 'sourceUnionApproval': False, 'humanApproval': False})
join = write('FINAL.neutral-root8-current397-author.join.json',
             {'role': 'Inactive targeted author successor; no reviewer vote', 'FIRST': first,
              'rawInputs': raw_bindings, 'inputFreezePath': prefix + '/FINAL.author-package.freeze.json',
              'strictGainClaimed': 0, 'independentQARequired': True, 'humanApproval': False})
bindings = [bind(rel(f)) for f in sorted(package.rglob('*')) if f.is_file() and f.name != 'FINAL.author-package.freeze.json']
freeze = write('FINAL.author-package.freeze.json',
               {'role': 'Immutable complete author inputs', 'files': bindings,
                'externalBindings': list(external.values()), 'scientificApproval': False, 'humanApproval': False})
for binding in bindings + list(external.values()):
    assert bind(binding['path']) == binding, binding['path']
for binding in bindings + [freeze]: (root / binding['path']).chmod(0o444)
print(json.dumps({'FIRST': first, 'FINAL': join, 'freeze': freeze, 'files': len(bindings),
                  'external': len(external), 'sourceRows': len(rows), 'current397': True}, ensure_ascii=False))
