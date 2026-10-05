#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded primary-source triage for existing 8ceb scope holds, inactive only."""
import copy
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

OUT = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[7]
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
read = lambda p: json.loads((ROOT / p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
cfg = read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
inventory = read(str((OUT / 'current-source-bindings.inventory.json').relative_to(ROOT)))
canonical = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
by = {g['id']: g for g in canonical['goals']}
dist = '5db9ba57-6a80-56db-8b9d-e8ca4ac41855'
crack = '7c22f436-e550-5b0b-85ae-a073b0c50418'

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

sources, mappings, documents = {}, {}, {}
for path in cfg['mappingPaths']:
    mapping = read(path)
    mappings[path] = mapping
    sp = mapping['sourceExtractionPath']; source = sources.setdefault(sp, read(sp))
    for doc in source.get('sourceDocuments', []) + ([source['sourceDocument']] if source.get('sourceDocument') else []):
        if doc.get('path') and (ROOT / doc['path']).is_file():
            documents[doc['path']] = dict(doc, sha256Actual=sha(doc['path']), jurisdiction=source.get('jurisdiction'))

receipts = []
for path, doc in documents.items():
    if not path.endswith('.pdf') or doc['jurisdiction'] in ['DE-HE', 'DE-NI', 'DE-SL', 'DE-SN']:
        continue
    pdf_text = subprocess.run(['pdftotext', '-layout', str(ROOT / path), '-'], check=True, capture_output=True, text=True).stdout
    hits = []
    for page, body in enumerate(pdf_text.split('\f'), 1):
        # Only route discovery. A negative keyword result is not source absence.
        for line in body.splitlines():
            if re.search(r'crack|fraktionier.{0,18}destill|erdölfraktion|raffiner|erdöl|destillation', line, re.I):
                hits.append({'pdfPageOneBased': page, 'line': line.strip()})
    receipts.append({'document': doc, 'topicRouteHits': hits,
                     'meaning': 'Bounded primary-source route discovery for this split only; no full curriculum review, no all-state absence conclusion, no independent approval.'})

selected = []
selectors = {
    'DE-BB': ['bb-chemistry-seki-rlp2015-3-9-044-4125ea7e', 'bb-chemistry-sekii-rlp-3-2-2-inhalte-006-'],
    'DE-BE': ['be-chemistry-seki-rlp2015-3-9-044-4125ea7e', 'be-chemistry-sekii-rlp-3-2-2-inhalte-006-'],
    'DE-HB': ['verarbeitung'],
    'DE-RP': ['rp-chem-sekii-rp-ch-sekii-2022-baustein-8-5'],
    'DE-MV': ['mv-chem-seki-mv-ch-seki-2021-j10-organische-chemie-015'],
    'DE-ST': ['st-chem-seki-st-schuljahrgang-9-kohlenstoff-und-die-vielfalt-seiner-verbindungen-beschreiben-170'],
}
for path, mapping in mappings.items():
    source = sources[mapping['sourceExtractionPath']]
    state = source.get('jurisdiction')
    for goal in source['sourceGoals']:
        keys = selectors.get(state, [])
        if not any(key in goal['id'] or (key == 'verarbeitung' and re.search(r'Verarbeitung von Erd(?:ö|oe)l', goal['sourceText'])) for key in keys):
            continue
        selected.append({'jurisdiction': state, 'mappingPathBefore': path, 'mappingSha256Before': sha(path),
                         'sourceExtractionPathBefore': mapping['sourceExtractionPath'],
                         'sourceExtractionSha256Before': sha(mapping['sourceExtractionPath']),
                         'sourceGoalBefore': goal,
                         'existingEdgesBefore': [e for e in mapping['mappings'] if e['legacyGoalId'] == goal['id']],
                         'decisionBefore': next(d for d in mapping['decisions'] if d['sourceGoalId'] == goal['id'])})

alternative_deltas = []
for row in selected:
    state = row['jurisdiction']; goal = row['sourceGoalBefore']
    if state == 'DE-HB':
        alternative_deltas.append(dict(row, status='partial-route-author-proposal-independent-review-required',
          proposedAdditionalEdges=[{'legacyGoalId': goal['id'], 'canonicalGoalId': dist, 'matchType': 'partial',
             'rationale': 'A supplied fractional-distillation diagram provides one petroleum-to-fuels processing route. The source requires explaining a diagram route, not expressly both distillation and thermal cracking.'}],
          restriction='Actual Gymnasium standard end of grade 8, primary page 41; 2022 restriction page 3 retains this grade-8 theme. Grade and frontier must be checked independently.',
          crackingDecision='No direct thermal-cracking proof from this general diagram clause. Do not add an exact or automatic second child.',
          unchangedSourceRequirement='Petroleum processing via diagrams remains required; the genuine clause is not deleted.'))
    if state == 'DE-RP':
        source_after = copy.deepcopy(goal)
        source_after['courseLevel'] = 'GK_LK'
        source_after['tags'] = [tag for tag in source_after.get('tags', []) if not tag.startswith(('course:', 'courseLevel:'))] + ['courseLevel:GK_LK']
        source_after['sourceRef'] = 'RP-CH-SEKII-2022 S. 55, Wahlbaustein 8.5 für Grund- und Leistungsfach'
        source_after.setdefault('metadata', {})['normativeScopeReviewCandidate'] = {
            'obligation': 'Wahlbaustein W, not universal compulsory content', 'printedPage': 55,
            'choiceTables': {'GK': 26, 'LK': 29}, 'courseProfiles': ['GK', 'LK'],
            'crackingRestriction': 'Suggested teaching sequences pages 93/98 mention cracking in connection with catalysis, not explicitly thermal cracking.'}
        alternative_deltas.append(dict(row, status='source-location-and-optional-scope-correction-author-proposal',
          sourceGoalAfterCandidate=source_after,
          sourceTextUnchanged=True,
          proposedAdditionalEdges=([{'legacyGoalId': goal['id'], 'canonicalGoalId': dist, 'matchType': 'partial',
            'rationale': 'Fractionation and product assignment contribute to the optional refinery/product-palette clause. Source names Raffination generally, not this process exclusively.'}] if '-003-' in goal['id'] else []),
          thermalCrackingDecision='No exact new thermal-cracking claim. Preserve the existing optional refinery requirement; the catalytic teaching context is different and needs its own genuine evidence if activated.',
          unsupportedCurrentSpecificTargets=([e for e in row['existingEdgesBefore'] if e['canonicalGoalId'] in ['0aaf0cc6-b059-56ef-9284-4cb7a0c5bff5']] if '-003-' in goal['id'] else []),
          sourceComponentResidual='Raffination is broader than this two-mechanism split. Existing alkanol classification is not refinery evidence; do not preserve an unsupported source proof solely to protect a count.'))

plans = [
    {'jurisdiction': ['DE-BB', 'DE-BE'], 'actualEvidence': 'Gymnasium-applicable SekI 3.9 page 40: Vorkommen/Verwendung plus optional context Vom Erdöl zum Benzin. Actual Q section 3.2.2 page 33: polymer production/recycling with possible petroleum-to-monomers context.',
     'resolution': 'These genuine Gymnasium contexts permit authoring an optional application/extension placement, but do not establish two compulsory refinery mechanisms. The non-Gymnasium EP italic row must not be presented as obligatory Gym proof.',
     'necessaryDelta': 'Keep required HC/polymer competencies via their actual narrower targets. For the two mechanism children, review a clearly labelled optional application branch or find explicit Gymnasium processing evidence; no automatic replacement by current generic mappings.',
     'stillOpen': 'Default target semantics versus optional selection is not resolved by a label or source metadata. Preserve the existing authored competence in the inactive v1 until a reviewed correct scope is available.'},
    {'jurisdiction': ['DE-HB'], 'actualEvidence': 'Primary Gymnasium page 41 end-of-grade-8 processing-diagram competence; 2022 restriction page 3 explicitly retains Erde als Rohstofflieferant in grade 8.',
     'resolution': 'An explicit supplied fractional-distillation route can be a partial witness for the actual diagram competence. The source does not specify the separate thermal cracking requirement.',
     'necessaryDelta': 'A direct partial distillation mapping can replace false inference from the broad ancestor; preserve the required diagram competence and review grade-8 model demands/frontier. Do not claim mandatory both-child coverage.',
     'stillOpen': 'Thermal-cracking state scope and the suitability of unchanged 2be prerequisite for the grade-8 route.'},
    {'jurisdiction': ['DE-RP'], 'actualEvidence': 'Actual page 55 Baustein8.5 Raffination/product palette; GK W-table page26 and LK W-table page29; teaching proposals93/98 mention catalysis with cracking.',
     'resolution': 'Genuine optional refinery route for both courses, not universal LK-only or compulsory coverage. Thermal-versus-catalytic distinction remains real.',
     'necessaryDelta': 'Correct only five8.5 extraction cell course/page/optional fields, retain stable source IDs/raw text, create a versioned successor and narrow direct partial processing binding. Existing alkanol-classification edge does not support refining.',
     'stillOpen': 'Correct optional target placement and procedure subtype; do not silently add a catalytic atom because the optional module has not been selected.'},
    {'jurisdiction': ['DE-SL'], 'actualEvidence': 'Primary NW EP page31: mandatory distillation; possible cracking experiment.',
     'resolution': 'Mandatory distillation is genuinely preserved in its specific branch. Actual experiment suggestion does not establish both child mechanisms as compulsory.',
     'necessaryDelta': 'Direct partial distillation source binding with NW-branch qualification; preserve separately the optional experiment and do not claim actual execution from model-only P.',
     'stillOpen': 'NW-versus-sprachlich/upper-course authored scope and optional cracking selection.'},
    {'jurisdiction': ['DE-SN'], 'actualEvidence': 'Class9 LB3 page17 petroleum fractions; WB2 page18 optional cracking, experiment/elimination/Olefin-Verbund.',
     'resolution': 'Narrow theoretical chemical conversion contributes to an optional WB2 source component. Required LB3 fraction knowledge must survive via genuine mixture/use/property goals.',
     'necessaryDelta': 'Retain LB3 actual requirements; qualify WB2 partial cracking binding as optional with separate performance residuals. Do not use WB2 to certify a mandatory E-phase industrial mechanism.',
     'stillOpen': 'Experimental execution, application of elimination knowledge, Olefin-Verbund, optional placement and any genuine fractional-distillation competence.'},
    {'jurisdiction': ['DE-HH', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-ST', 'DE-TH'],
     'actualEvidence': 'Bounded primary topic route discovery found general organics/petroleum-mixture/use or polymer sources, not a clear mandatory two-procedure clause. Exact current broad-source snapshots are in the inventory; per-file route hits are retained separately.',
     'resolution': 'Do not invent a full thermal-cracking/destillation source requirement. This is a bounded nonverification, not a claim that all possible curricular evidence is absent.',
     'necessaryDelta': 'Preserve actual named structural/property/use/assessment requirements through their real existing targets and partial/union coverage; do not map the new procedure atoms merely by old e8c/root descent. Keep the authored split scope on hold or review a legitimate optional enrichment placement.',
     'stillOpen': 'Genuine narrow state source witnesses or correct optional scope semantics. No reviewed author-view retirement has been prepared.'},
    {'jurisdiction': ['DE-BY', 'DE-BW'], 'actualEvidence': 'No current direct8ceb source/goalEntry witness. Actual authored reachability checker exposes neither new child in these state views. BY chemical-source JSON and reviewed9/10 pages lack current narrow processing proof.',
     'resolution': 'There is no valid existing state target placement to preserve for this parent; raw compatibility declaration alone is not target visibility or normative coverage.',
     'necessaryDelta': 'No child source clone and no new state placement. Preserve valid petroleum-use/property source targets unchanged; any future extension requires an explicit source/scope review.',
     'stillOpen': 'Raw parent/child compatibility declaration must not be labelled independently source-approved.'},
]
write('remaining-source-scope-preservation.plan.json', {'schemaVersion': 1, 'createdAt': now,
      'status': 'inactive-scoped-author-plan-not-independent-approval', 'primaryRouteReceipts': receipts,
      'selectedCurrentSourceBindings': selected, 'alternativeNarrowDeltas': alternative_deltas, 'statePlans': plans,
      'mandatoryContentPreservation': 'Preserve each genuine required source component on actual assessable targets. Retain authored whole-competence scope as an inactive candidate; no unsupported proof, active retirement or threshold lowering.',
      'humanApproval': False, 'humanTrial': False, 'strictNetIncrease': 0})

image_paths = [
    'curricula/DE/Gymnasium/visualizations/chemie/8ceb1749-fce0-584f-a2b8-0a309282329a/8ceb1749-fce0-584f-a2b8-0a309282329a.jpg',
    'app/public/assets/goal-visualizations/chemie/8ceb1749-fce0-584f-a2b8-0a309282329a/8ceb1749-fce0-584f-a2b8-0a309282329a.jpg',
]
write('image-and-evaluation-preservation.receipt.json', {'schemaVersion': 1, 'status': 'author-inspection-not-independent-approval',
      'parentImage': {'paths': [{'path': path, 'sha256': sha(path)} for path in image_paths],
          'actualNativeDimensions': [2752, 1536], 'visualInspection': 'Actual retained JPEG viewed with image tool; rendered inspection resized to2048x1143.',
          'decision': 'KEEP exact bytes as qualitative two-process cluster overview; no new atomic V approval.',
          'limits': 'Schematized input/output molecules are not a balanced quantitative reaction. Cluster overview retention is not proof that the new child images exist or pass360/680 inspection.'},
      'newChildImages': {'promptPaths': ['distillation.image-prompt.candidate.md', 'cracking.image-prompt.candidate.md'],
          'status': 'No images generated; actual PNG/native/360/680 and source/frontend/backend binding checks remain pending.'},
      'NI_economicJudgment': {'sourceGoalId': 'ni-chemistry-sekii-kc2022-ep-5-kompetenz-014-e33ed5ec',
          'retainedExistingTargetContentBefore': [by[id] for id in ['1df17884-96ae-57d7-9da9-dbebd082596f', 'b95cdf98-fc97-5a94-b133-878922d28156']],
          'meaning': '1df explicitly includes economic criteria and reasoned chemical decisions; b95 covers petroleum-product benefits/ecological consequences. These content scopes preserve assessment routes separately from mechanisms. Actual cracker economic evidence/binding still needs independent review; no full-source economic approval from mechanism P.'},
      'machineApproval': False, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'primaryDocsTriaged': len(receipts), 'selectedSourceCells': len(selected),
                  'alternativeDeltas': len(alternative_deltas), 'strictNetIncrease': 0}))
