#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite technical merge; imports whole authored objects, creates no review votes."""
import copy
import hashlib
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[8]
E = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
O = Path(__file__).resolve().parents[1]
C = E / 'chemie-carbonyl-two-final-wording-and-visual-remediation-author-root-20261015-v1'
Q = E / 'chemie-equilibrium-four-description-bounds-author-20261015-v1'
M = E / 'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1'
N = E / 'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2'
CARB = E / 'chemie-carbonyl-pharmacy15-current422-whole-material-author-20261015-v1'

def sha(data): return 'sha256:' + hashlib.sha256(data).hexdigest()
def rel(p): return str(p.relative_to(REPO))
def read(p): return json.loads(p.read_text())
def bind(p): return {'path': rel(p), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}
def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
def objects(raw, key, idkey):
    start = re.search(r'"' + key + r'"\s*:\s*\[', raw).end()
    dec = json.JSONDecoder()
    out = {}
    while True:
        while raw[start] in ' \n\r\t,': start += 1
        if raw[start] == ']': break
        obj, end = dec.raw_decode(raw, start)
        assert obj[idkey] not in out
        out[obj[idkey]] = (start, end, raw[start:end], obj)
        start = end
    return out

basec = E / 'chemie-pourbaix-one-missing-image-author-root-20261015-v1/candidate/canonical560.current422.one-pourbaix-image.author.json'
bases = E / 'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json'
cc = C / 'candidate/canonical560.current422.two-wording-two-PNG.author.json'
cs = C / 'candidate/semantic560.two-description-source-identities.author.json'
qc = Q / 'candidate/canonical560.current422.four-description-bounds.author-v1.json'
qs = Q / 'candidate/semantic560.four-description-source-bindings.author-v1.json'
pins = [(basec, '52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3'),
        (bases, '597c71f9a9444e7bf8ffd266c3c4de6f826c34a87f438f36a2ce3f358eba76ee'),
        (cc, '3afe07f6c436cdad1f4a2b04c1f77de77a31c95d12fa037096352ca983574e7d'),
        (cs, 'aba097f553d933a6466432ce26b75f3ecd01e9130ebc7d8db7301d4dd7d7c445'),
        (qc, 'b1b97340db45b29af1f67def5a99c5eb59d0067c96ad4a83d3a5bbef92897d88'),
        (qs, 'b31f68ba94185537056ee527c41bd438be00faa9ec27e7360796a352923dadac')]
for p, expected in pins: assert sha(p.read_bytes()) == 'sha256:' + expected, rel(p)
before = read(basec)
sem_before = read(bases)
by = {g['id']: g for g in before['goals']}
sby = {d['goalId']: d for d in sem_before['decisions']}
assert len(by) == len(sby) == 560

def changed(p): return [g['id'] for g in read(p)['goals'] if g != by[g['id']]]
cids, qids = changed(cc), changed(qc)
assert len(cids) == 2 and len(qids) == 4 and not set(cids) & set(qids)
ids = cids + qids
plan = {'role': 'Technical exact import plan, no scientific judgment', 'inputs': [bind(p) for p, _ in pins],
        'carbonylWholeGoalImports': cids, 'equilibriumWholeGoalImports': qids,
        'allowedCanonicalChangedFields': {'carbonyl': ['description', 'descriptionEn', 'resourceLinks'], 'equilibrium': ['description', 'descriptionEn']},
        'allowedSemanticChangedFields': ['sourceFingerprint'],
        'scope': 'One 560-goal candidate; existing classification 422; direct curricularAtomic context; no native build or review'}
write(O / 'PLAN.technical-exact-merge.before-materialization.json', plan)
write(O / 'PLAN.technical-exact-merge.before-materialization.seal.json', bind(O / 'PLAN.technical-exact-merge.before-materialization.json'))

def merge(base, sources, arraykey, idkey):
    raw = base.read_text()
    original = objects(raw, arraykey, idkey)
    replacements = {}
    for path, targets in sources:
        imported = objects(path.read_text(), arraykey, idkey)
        for gid in targets: replacements[gid] = imported[gid][2]
    for gid in sorted(replacements, key=lambda g: original[g][0], reverse=True):
        a, b, _, _ = original[gid]
        raw = raw[:a] + replacements[gid] + raw[b:]
    final = objects(raw, arraykey, idkey)
    assert list(original) == list(final)
    assert sum(a[2] == final[g][2] for g, a in original.items()) == 554
    for g in ids: assert final[g][2] == replacements[g]
    return raw, original, final

canonical_raw, original, final = merge(basec, [(cc, cids), (qc, qids)], 'goals', 'id')
semantic_raw, soriginal, sfinal = merge(bases, [(cs, cids), (qs, qids)], 'decisions', 'goalId')
after = json.loads(canonical_raw)
sem_after = json.loads(semantic_raw)
current = {g['id']: g for g in after['goals']}
sem = {d['goalId']: d for d in sem_after['decisions']}
for key in before:
    if key != 'goals': assert before[key] == after[key]
for key in sem_before:
    if key != 'decisions': assert sem_before[key] == sem_after[key]
changes = []
for gid in ids:
    keys = [k for k in by[gid] if by[gid][k] != current[gid].get(k)]
    assert keys == (['description', 'descriptionEn', 'resourceLinks'] if gid in cids else ['description', 'descriptionEn'])
    assert [k for k in sby[gid] if sby[gid][k] != sem[gid].get(k)] == ['sourceFingerprint']
    changes.append({'goalId': gid, 'changedKeys': keys, 'importedWholeGoalBytesSha256': sha(final[gid][2].encode()),
                    'beforeWholeGoalBytesSha256': sha(original[gid][2].encode()),
                    'beforeSourceFingerprint': sby[gid]['sourceFingerprint'], 'afterSourceFingerprint': sem[gid]['sourceFingerprint']})
for g in before['goals']:
    for key in ['id', 'requires', 'contains', 'applicability', 'tags', 'weight', 'dimensionTags']:
        assert g.get(key) == current[g['id']].get(key)
assert sum(d['semanticKind'] == 'curricularAtomic' and d['decisionStatus'] == 'authoritative' for d in sem.values()) == 422
outc = O / 'candidate/canonical560.current422.six-wording-two-PNG.combined-author.json'
outs = O / 'candidate/semantic560.six-description-source-identities.combined-author.json'
outc.parent.mkdir(parents=True, exist_ok=True)
outc.write_text(canonical_raw)
outs.write_text(semantic_raw)

def parents(gid): return [g['id'] for g in after['goals'] if gid in g.get('contains', [])]
def dependents(gid): return [g['id'] for g in after['goals'] if gid in g.get('requires', [])]
neighbors = sorted({h for gid in ids for h in dependents(gid) if sem[h]['semanticKind'] == 'curricularAtomic'} - set(ids))
expected_prefixes = ['539476ee', '96d3f50b', '1654b644', 'a853069e', '3eada74b', 'b8c8f70f', '8edee6b6']
assert len(neighbors) == 7 and {x[:8] for x in neighbors} == set(expected_prefixes)
radius = ids + neighbors
context_ids = set(radius)
for gid in radius: context_ids.update(current[gid].get('requires', [])); context_ids.update(parents(gid))
context = {'schemaVersion': 1, 'role': 'Current whole canonical scientific bodies and actual direct relations; no reviewer judgments',
           'canonical': bind(outc), 'semanticSourceIdentity': bind(outs), 'changedGoalIds': ids,
           'directCurricularAtomicNeighborIds': neighbors, 'radiusGoalIds': radius, 'radiusCount': len(radius),
           'relations': [{'goalId': gid, 'requires': current[gid].get('requires', []), 'parents': parents(gid),
                          'allDirectDependents': [{'goalId': h, 'existingSemanticKind': sem[h]['semanticKind']} for h in dependents(gid)]} for gid in radius],
           'wholeRadiusGoals': [current[g] for g in radius],
           'wholeDirectPrerequisiteAndParentGoals': [g for g in after['goals'] if g['id'] in context_ids - set(radius)],
           'currentBodyRule': 'These imported current goal bodies and combined canonical govern wording; any retained material/source snapshot embeds its original base context only.'}
write(O / 'inputs/thirteen-current-whole-goals-requires-parents.scientific.json', context)
write(O / 'inputs/six-final-whole-DE-EN-goals.scientific.json', {'schemaVersion': 1, 'role': 'Six whole final author goal bodies; no vote', 'goals': [current[g] for g in ids]})
write(O / 'inputs/six-final-DE-EN-descriptions.scientific.json', {'schemaVersion': 1, 'goals': [{'goalId': g, 'title': current[g]['title'], 'titleEn': current[g]['titleEn'], 'description': current[g]['description'], 'descriptionEn': current[g]['descriptionEn']} for g in ids]})

# Resource inventory is references only, all currently linked rasters physically hashed.
assetmap = E / 'chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1/checks/REBUILD.energy18-final.physical-exact-map.v3.json'
equilimages = N / 'blind-inputs/sixteen-current-exact-physical-image-bodies.json'
carbimages = CARB / 'inputs/ASSETS.current15.exact-existing-physical-body-bindings.json'
newimages = C / 'GENERATION.actual-two-native-PNGs-and-bounded-contexts.json'
rows = {r['goalId']: r for r in read(assetmap)['selectedCurrentAssetRows']}
for p, key in [(equilimages, 'images'), (carbimages, 'assets')]:
    for r in read(p)[key]: rows[r['goalId']] = r
for r in read(newimages)['outputs']:
    gid = r['goalId']
    url = next(x['url'] for x in current[gid]['resourceLinks'] if x.get('resourceType') == 'image')
    rows[gid] = {'goalId': gid, 'physicalRepositorySource': r['image'], 'normalCanonicalDestination': 'curricula/DE/Gymnasium/visualizations/chemie/' + url.split('/chemie/')[1], 'normalPublicDestination': 'app/public' + url}
images = []
for g in after['goals']:
    for resource in g.get('resourceLinks', []):
        if resource.get('resourceType') != 'image': continue
        url = resource['url']
        assert url.lower().endswith(('.png', '.jpg', '.jpeg')), url
        row = rows[g['id']]
        assert row['normalPublicDestination'] == 'app/public' + url, (g['id'], url)
        p = REPO / row['physicalRepositorySource']['path']
        actual = bind(p)
        assert actual == row['physicalRepositorySource'], (g['id'], actual, row['physicalRepositorySource'])
        images.append({'goalId': g['id'], 'url': url, 'physicalRepositorySource': actual,
                       'normalCanonicalDestination': row['normalCanonicalDestination'], 'normalPublicDestination': row['normalPublicDestination'],
                       'inThirteenContext': g['id'] in radius, 'imageCopied': False})
assert len(images) == 435 and sum(r['inThirteenContext'] for r in images) == 13
write(O / 'inputs/all435-current-final-raster-byte-references.actual.json', {'schemaVersion': 1, 'role': 'Technical byte identity and path inventory only; no visual inspection or vote', 'inventorySources': [bind(p) for p in [assetmap, equilimages, carbimages, newimages]], 'images': images, 'rasterBodiesActuallyHashed': len(images), 'imageCopies': 0})

# Material corrections remain referenced as raw author candidates, never rebound/approved here.
material_selector = M / 'REVIEW-INPUTS.scientific-successor.selector.json'
material_inputs = [M / 'materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json', M / 'sixteen-profile-bodies.scientific-successor.jsonl', M / 'sixteen-profiles.raw-E0G0.four-gap-successor.author.jsonl']
for p, expected in zip([material_inputs[0], material_inputs[2]], ['c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e', '4534847eba3ffefe6c34ba700df3875a07a4ba3c4090bd3f1aa01f7cc65fc75f']):
    assert sha(p.read_bytes()) == 'sha256:' + expected
p_only = ['b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b', '13838147-c26d-54ca-b9be-5f2f0b8e9de5']
write(O / 'inputs/material-four-exact-references-and-two-P-only-boundaries.json', {
    'role': 'Exact reference only; no P approval or input/profile rebinding', 'materialSuccessorSelector': bind(material_selector),
    'materialSuccessorInputs': [bind(p) for p in material_inputs],
    'descriptionAndMaterialBothChanged': ['1a51362e-fd84-5964-89b5-b435772c2149', '0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3'],
    'materialOnlyGoalIds': p_only, 'wholeMaterialOnlyGoals': [current[g] for g in p_only],
    'outsideThirteenDescriptionContext': True,
    'rawAuthorState': 'E0/G0, needs_human_review, ai_candidate, no reviewRunIds',
    'laterDPageDecision': 'A later actual stock review-input fingerprint diff must decide whether material-only b752/138 require fresh D pages. No transport or review claim is made here.',
    'staleRawContextWarning': 'Raw profile bindings retain their original 52e199/597 context. Combined successor technical/native preparation must bind affected inputs before review.'})

# Scientific source companions stay original and pinned; current whole partners come from combined canonical.
source_files = [N / 'blind-inputs/whole-source-cells-and-current-partner-unions.exact.json',
                N / 'blind-inputs/eighty-seven-whole-source-passages.exact.json',
                N / 'blind-inputs/targeted-official-HE-BW-whole-pages.exact.json',
                CARB / 'inputs/INPUTS.coupled479-sourcecells.current560-whole-partners.technical.json',
                CARB / 'inputs/PASSAGES.deduplicated-whole-source-bodies.current.json',
                CARB / 'materials/whole30.current422.bilingual-cases.author.json',
                CARB / 'materials/whole15.current422.profile-payloads.author.json']
write(O / 'inputs/raw-scientific-companions.exact-reference-selector.json', {
    'schemaVersion': 1, 'role': 'Raw whole sources, passages and whole material bodies only; no reviewer/author judgments selected',
    'files': [bind(p) for p in source_files],
    'currentWholePartnerBodyRule': 'Use current whole goal bodies from combined canonical; embedded base goal bodies are historical context and have six superseded wordings.',
    'readTextRule': 'Use rawText OR text and preserve whole operator/course/column facets and actual partner competencies; an empty rawText does not mean absence.',
    'scopeRule': 'Declared finite source companions are evidence inputs, not a claim of complete source coverage or of normative support for any goal. Source/scope questions and existing holds remain open.'})

write(O / 'checks/CAS.six-exact-imports-and-thirteen-actual-context.actual.json', {
    'role': 'Technical merge/CAS only; no scientific approval', 'inputPins': [bind(p) for p, _ in pins],
    'actualWholeGoals': 560, 'changedWholeGoals': 6, 'unchangedWholeGoalRawObjectBytes': 554,
    'sixImportedWholeGoalRawObjectBytesExact': True, 'changes': changes,
    'idsAndOrderEdgesScopesTagsWeightsUnchanged': True, 'landscapeMetadataUnchanged': True,
    'semanticDecisions': 560, 'changedSemanticSourceFingerprints': 6, 'unchangedSemanticRawDecisionBytes': 554,
    'existingSemanticClassificationsAndBasisUnchanged': True, 'ordinaryCurricularAtomic': 422,
    'changedGoalIds': ids, 'directCurricularAtomicNeighborIds': neighbors, 'actualDescriptionContextRadius': radius,
    'radiusCount': 13, 'allDirectDependentsIncludingOtherSemanticKindsEnumerated': True,
    'allCurrentRasterReferences': len(images), 'allCurrentRasterBodiesActuallyHashed': True, 'imageCopies': 0,
    'outputs': [bind(outc), bind(outs)],
    'stockAll560Verification': 'See separate stock source fingerprint receipt; no replacement implementation used',
    'scientificReviewsPerformed': False, 'nativeBuildPerformed': False, 'wholeCheckPerformed': False,
    'M2V2CarbonylState': 'Existing genuinely reviewed pair is not transported, modified or counted by this merge. Four other M/V context checks remain separate.',
    'sourceScopeAndGrignardHold': 'Unchanged/open; merge adds no normative source support or A judgment.'})
for p, expected in pins: assert sha(p.read_bytes()) == 'sha256:' + expected
print(json.dumps({'canonical': bind(outc), 'semantic': bind(outs), 'changed': 6, 'unchangedWholeGoalBytes': 554, 'context': 13, 'imagesReferencedAndHashed': len(images), 'imageCopies': 0}))
