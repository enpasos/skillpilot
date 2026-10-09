#!/usr/bin/env python3
"""Prepare immutable source-review inputs without approving or integrating them."""
# SPDX-License-Identifier: Apache-2.0
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import subprocess
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
PLAN = BASE / 'chemie-b008-source-atlas-rest-twenty-neutral-planning-a-v1/next-source-atlas-rest20-whole-source-context.planning-candidate.input.json'
CONFIG = BASE / 'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1/technical-v2-pairing-and-source-metadata-v1/whole395-source22-reviewed-metadata.ordinary-inputs.candidate-only.json'


def read(path):
    return json.loads(path.read_text())


def binding(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


def text_file(name, text):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8') as stream:
        stream.write(text)
    return binding(path)


def main():
    assert (ROOT / 'AGENTS.md').is_file(), ROOT
    plan, config = read(PLAN), read(CONFIG)
    assert config['expectedCurricularAtomicGoalCount'] == 395
    assert config['expectedUnresolvedScopeDecisionCount'] == 496
    landscape = read(ROOT / config['landscapePath'])
    current = {g['id']: g for g in landscape['goals']}
    pdfs = {}
    for key, path, pages in [
        ('HE-current-2026', 'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf', [38, 39, 40]),
        ('RP-2022', 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf', [40]),
    ]:
        primary = ROOT / path
        texts = []
        for page in pages:
            actual = subprocess.check_output(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(primary), '-']).decode()
            texts.append({'physicalPage': page, 'actualFullPageText': actual,
                          'textBinding': text_file(f'primary/{key}-physical-page-{page:03d}.txt', actual)})
        pdfs[key] = {'originalPDF': binding(primary), 'pages': texts}

    websites = []
    for key, url in [
        ('BY-BcP12-13', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biolog-chem-praktikum'),
        ('BY-optional-additional-subjects', 'https://www.gymnasiale-oberstufe.bayern.de/faecherwahl-und-belegung/individuelle-schwerpunktsetzung/faecher-des-zusatzangebots'),
        ('BY-C11-NTG', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie'),
    ]:
        with urlopen(Request(url, headers={'User-Agent': 'SkillPilot curriculum source verification'}), timeout=40) as response:
            data, status, final_url = response.read(), response.status, response.url
        assert status == 200
        path = OUT / f'primary/{key}.actual-official.html'
        with path.open('xb') as stream:
            stream.write(data)
        soup = BeautifulSoup(data, 'html.parser')
        for node in soup(['script', 'style', 'noscript']):
            node.decompose()
        text = soup.get_text('\n', strip=True)
        websites.append({'key': key, 'requestedURL': url, 'actualURL': final_url, 'httpStatus': status,
                         'retrievedAt': datetime.now(timezone.utc).isoformat(), 'originalHTML': binding(path),
                         'actualFullText': text_file(f'primary/{key}.actual-official.txt', text)})

    specs = [
        ('cdd4ee76-5b37-54ee-b238-63db71205af0', 'DE-HE', 'he-chem-sekii-q1-2-b08-a01-04d6e698', 'HE-current-2026', 39,
         'Direct mechanism component; current goal also asks kinetics and solvent. The actual LK clause names SN1/SN2, primary/tertiary substrates and inductive/steric effects. It does not literally enumerate kinetic orders or a universal solvent rule.',
         'Keep the whole original SN1/SN2 obligation and all partners. Candidate transfer uses unimolecular ionisation versus bimolecular concerted attack to explain kinetic dependence, and supplied solvent/substrate conditions. No claim that every primary substrate or solvent makes exactly one mechanism compulsory.'),
        ('057a6826-f599-53b1-bdd1-5a83037a1494', 'DE-RP', 'rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-005-7618f43f', 'RP-2022', 40,
         'Authored comparative transfer of optional derivative examples; not a mandatory RP LK additum or a literal Hessian clause. The whole physical page explicitly separates Fundamentum, Additum and optional deepening.',
         'Compare acid chloride, anhydride and ester for comparable nucleophilic acyl substitution using the carbonyl and leaving group. The original amide and every original mapped partner remain; this new target does not cover all original derivative examples.'),
        ('39c85aa0-b01f-56ec-a148-b8009bf650f5', 'DE-HE', 'he-chem-sekii-q1-3-b04-a01-d23d5886', 'HE-current-2026', 39,
         'Authored intramolecular transfer from ester formation; lactone stability is not a literal mandatory source clause. Hydroxyacid structure and supplied comparison conditions are required.',
         'Preserve all ester nomenclature, structure, formation and mechanism partners. Explain intramolecular ester formation; compare ring effects only with specified conditions/data, never an unconditional ring-size stability rule.'),
        ('10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5', 'DE-HE', 'he-chem-sekii-q1-5-b02-a01-bd10754f', 'HE-current-2026', 40,
         'Authored redox evaluation transfer from the qualitative ascorbic antioxidant context; the source experiment is not replaced by supplied data, and the transfer is not a literal universal LK obligation.',
         'Preserve the whole qualitative detection duty and all partners. Evaluate provided reaction/comparison data; distinguish antioxidant action from antimicrobial preservation. No actual learner experiment, antimicrobial efficacy, safety or legal approval is claimed.'),
        ('18819a59-2442-530f-a7c3-26755398ec66', 'DE-HE', 'he-chem-sekii-q1-5-b05-a01-e1183390', 'HE-current-2026', 40,
         'Authored analytical transfer for a specified paraben ester, combining the paraben-use context with general quantitative analytical competencies. Paraben use alone does not establish quantitative method selection, controls, execution or calibration.',
         'Do not map the ascorbic-specific quantitative bullet as literal paraben determination. Preserve both quantitative child goals and all actual practical duties; assess method suitability, planning AND execution, controls, calibration/stoichiometry, dilution and limitations separately. No new whole-source approval or current source route is asserted.'),
    ]
    rows = []
    for goal_id, jurisdiction, source_id, pdf_key, page, role, rationale in specs:
        metadata = next(m for m in plan['actual34MappingAndExtractionBindingMetadata']
                        if f'/{jurisdiction[3:]}/upper-secondary/' in m['sourceExtraction']['path'])
        extraction_path = ROOT / metadata['sourceExtraction']['path']
        mapping_path = ROOT / metadata['mapping']['path']
        extraction, mapping = read(extraction_path), read(mapping_path)
        source = next(g for g in extraction['sourceGoals'] if g['id'] == source_id)
        original_decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source_id)
        passage = next(p for p in extraction['passages'] if p['id'] == source['passageId'])
        old_edges = [e for e in mapping['mappings'] if e.get('reviewDecisionId') == source_id or e.get('legacyGoalId') == source_id]
        partner_ids = set(original_decision['canonicalGoalIds'])
        partner_ids.update(e['canonicalGoalId'] for e in old_edges)
        partner_ids = {i.removeprefix(landscape['landscapeId'] + ':') for i in partner_ids}
        partners = []
        seen = set()
        def include(gid):
            if gid in seen:
                return
            seen.add(gid)
            assert gid in current, gid
            goal = current[gid]
            partners.append(copy.deepcopy(goal))
            for child in goal.get('contains', []):
                include(child.removeprefix(landscape['landscapeId'] + ':'))
        for gid in sorted(partner_ids):
            include(gid)
        rows.append({'goalId': goal_id, 'wholeCurrentTarget': copy.deepcopy(current[goal_id]),
                     'sourceExtraction': binding(extraction_path), 'mapping': binding(mapping_path),
                     'wholeOriginalSourceGoal': source, 'wholeOriginalPassage': passage,
                     'originalDecisionUnchanged': original_decision, 'originalMappingEdgesUnchanged': old_edges,
                     'wholeOriginalCurrentPartnersAndDescendants': partners,
                     'actualPrimary': pdfs[pdf_key]['originalPDF'], 'actualPhysicalPage': page,
                     'proposedBindingRole': role, 'proposedBoundedRationale': rationale,
                     'reviewStatus': 'ai_candidate', 'independentReviewPending': True,
                     'newNormalMappingDecisionWritten': False, 'wholeSourceCoverageClaimed': False})

    program_rows = [copy.deepcopy(g) for g in plan['nextRest20WholeGoals'] if g['category'] != 'ELEVEN_CONTENT_WITHOUT_CURRENT_MAPPING_ROUTE']
    program = write('nine-whole-goals.actual-official-program-boundaries.author-input.json', {
        'schemaVersion': 1, 'role': 'Actual official program/source boundary inputs; no inferred course assignment',
        'items': program_rows, 'actualOfficialSources': websites,
        'BcPBoundary': {'subject': 'Biologisch-chemisches Praktikum', 'year': '12/13',
                       'additionalSubjectChosenSeparately': True, 'allSixContentAreasMandatory': False,
                       'atLeastThreeOfSixContentAreasPerSchoolYear': True, 'balancedBiologyChemistryRequired': True,
                       'allEnumeratedContentAndCompetenciesMandatory': False, 'generalArea1MustBeConsidered': True,
                       'GKOrLKInferred': False, 'normalCourseProfileMetadataChanged': False},
        'C11Boundary': {'actualPageHeading': 'Chemie 11 (NTG)', 'separateLaterGAEAProfileNotClaimed': True,
                       'sourceCourseProfileStillUnspecified': True, 'GKOrLKInferred': False},
        'expected395Lowered': False, 'expected496Changed': False, 'current497ConflictResolved': False,
        'wholeSourceOrCourseApproval': False, 'activeWrites': False, 'newStrictClosures': 0,
        'humanApproval': False, 'humanTrial': False})
    content = write('five-whole-content-source-candidates.with-original-partners.author-input.json', {
        'schemaVersion': 1, 'role': 'Five bounded current source-binding author candidates; original clauses and partners preserved',
        'author': '/root', 'items': rows, 'currentProspectiveLandscape': binding(ROOT / config['landscapePath']),
        'rest20NeutralPlan': binding(PLAN), 'ordinary395ConfigUnchanged': binding(CONFIG),
        'actualPrimaryPages': pdfs, 'independentReviews': [], 'activeWrites': False,
        'wholeSourceCoverage': False, 'wholeCourseCoverage': False, 'newStrictClosures': 0,
        'sixOtherMissingContentRoutesStillOpen': [g['goalId'] for g in plan['nextRest20WholeGoals']
                                                if g['category'] == 'ELEVEN_CONTENT_WITHOUT_CURRENT_MAPPING_ROUTE'
                                                and g['goalId'] not in {r['goalId'] for r in rows}],
        'historicalReviewRestarted': False, 'humanApproval': False, 'humanTrial': False})
    entry = write('neutral-five-content-and-nine-program-boundaries.author-review.entry.json', {
        'schemaVersion': 1, 'role': 'Neutral bounded source-review intake; inactive and unapproved',
        'preparedAt': datetime.now(timezone.utc).isoformat(), 'preparedBy': '/root',
        'contentCandidate': content, 'programBoundaryInput': program,
        'fiveCurrentTargetBodies': True, 'originalClausesAndMappingPartnersPreserved': True,
        'newIndependentScienceApprovals': 0, 'newNormalSourceApprovals': 0,
        'strictBaseline': {'chemistry': '177/378', 'biology': '276/394', 'mathematics': '807/807', 'physics': '478/478'},
        'strictNetGain': 0, 'rest20Finished': False, 'sourceAtlas395Approved': False,
        'humanApproval': False, 'humanTrial': False, 'activeWrites': False})
    write('author-input.first.freeze.json', {'schemaVersion': 1, 'role': 'Author intake FIRST, not an independent review',
          'createdAt': datetime.now(timezone.utc).isoformat(), 'outputs': [content, program, entry],
          'script': binding(Path(__file__)), 'historicalInputsUnchanged': True, 'newApproval': False})
    print(json.dumps(entry))


if __name__ == '__main__':
    main()
