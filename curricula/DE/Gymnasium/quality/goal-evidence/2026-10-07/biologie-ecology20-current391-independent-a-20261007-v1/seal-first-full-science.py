#!/usr/bin/env python3
"""Seal the completed independent scientific pass; never edit author inputs."""
import datetime
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).parent
AUTHOR = OWN.parent / 'biologie-ecology20-current391-author-v2'
ROOT = Path.cwd()


def receipt(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)) if path.is_absolute() else str(path),
            'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


partial = json.loads((OWN / 'first-independent-a-scientific-findings-partial.actual.json').read_text())
materials = json.loads((AUTHOR / 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json').read_text())
profiles = json.loads((AUTHOR / 'P20.current-text-preimage.author.candidates.json').read_text())
assert len(materials['goals']) == len(profiles['goals']) == 20
for goal, candidate in zip(materials['goals'], profiles['goals']):
    assert goal['goalId'] == candidate['goalId']
    for case, brief in zip(goal['cases'], candidate['profile']['applicationCaseBriefs']):
        assert case['id'] == brief['id']
        for language, suffix in [('de', 'De'), ('en', 'En')]:
            assert case['material'][language] + ' ' + case['task'][language] == brief['taskDemand' + suffix]
            assert case['modelAnswer'][language] == brief['expectedPerformance' + suffix]

read_ranges = {
    'HE-G9-official.actual-full-reading.txt': [[737, 784], [1001, 1083]],
    'HE-current-official.actual-full-reading.txt': [[1806, 1860], [1920, 1979]],
    'BY9-official.actual-text.txt': [[534, 595]],
    'BY12-GA-official.actual-text.txt': [[60, 92], [169, 205]],
    'BY13-GA-official.actual-text.txt': [[62, 84], [167, 204], [345, 430]],
    'BY13-EA-official.actual-text.txt': [[62, 84], [171, 211], [400, 498]],
}
sources = []
for source in json.loads((AUTHOR / 'six-actual-primary-full-reading.author.receipt.json').read_text())['sources']:
    p = Path(source['primaryPath'])
    r = Path(source['readingPath'])
    assert receipt(p)['sha256'] == source['primarySha256']
    assert receipt(r)['sha256'] == source['readingSha256']
    sources.append({'url': source['url'], 'primary': receipt(p), 'readableText': receipt(r),
                    'actuallyReadLineRanges': read_ranges[r.name],
                    'wholeDocumentReadClaim': False, 'wholeNationalSourceClosure': False})

findings = partial['findings'] + [
    {
        'findingId': 'BIO20-A-P-15-REQUIRED-NITROGEN-GK',
        'goalId': '8e7c6b98-fb1a-5f08-8531-685a4ffba4ad',
        'caseId': 'ecology20-15-case-2', 'severity': 'must_fix',
        'affectedFields': ['profile.expectations', 'profile.coverageExpectations',
                           'profile.variationAxes', 'completeMaterialCasesAndBriefs'],
        'actualProblem': 'The common profile requires ecology20-15-transfer, whose essential and observable performances require the advanced nitrogen cycle. Its dissent and case label acknowledge that HE GK and BY GA only require the carbon cycle, but the required coverage has no course condition or common transfer alternative. Thus the common candidate imposes the advanced nitrogen duty on a basic-course target.',
        'boundedCorrection': 'Supply a second materially distinct common carbon-cycle transfer with required common expectations. Keep nitrogen as an explicitly optional/course-scoped extension, or use a genuinely supported conditional coverage route. The nitrogen chemistry is scientifically correct; the compulsory common coverage is the defect.',
        'actualSourceEvidence': ['HE current Q3.1 distinguishes carbon GK/LK and nitrogen LK',
                                'BY13 GA 4.1 contains carbon; EA 4.1 adds nitrogen'],
        'nativeSchemaObservation': 'PositiveGoalEvidenceProfile has requiredExpectationIds and alternativeExpectationGroups, but no course-scoping field. Structural validation checks IDs and hashes, not this scientific scope contradiction.',
        'verdict': 'REVISE_P',
    },
    {
        'findingId': 'BIO20-A-P-10-ACTUAL-MAP-INPUT',
        'goalId': 'e4791f8d-ea87-504b-979e-2f976e72e66d',
        'caseIds': ['ecology20-10-case-1', 'ecology20-10-case-2'], 'severity': 'must_fix',
        'affectedFields': ['material.de', 'material.en', 'task.de', 'task.en',
                           'modelAnswer.de', 'modelAnswer.en', 'copiedPApplicationCaseBriefs'],
        'actualProblem': 'Both materials are non-spatial lists of A/B/C or X/Y/Z with factors and records. Neither supplies a spatial arrangement, key or geographic relation to read. They assess factor comparison and bounded inference correctly, but do not yet make the whole operative performance of interpreting a distribution map observable.',
        'boundedCorrection': 'Provide a small unambiguous spatial map or coordinate/grid representation with a clear legend for records and absence of records. Require reading one actual spatial feature before comparing abiotic factors. A simple accessible textual grid is sufficient; no new learning-goal image or detailed cartographic curriculum is needed.',
        'actualSourceEvidence': ['HE G9 6.3 explicitly requires evaluation of distribution maps with abiotic factors'],
        'verdict': 'REVISE_P',
    },
]

report = {
    'role': 'Independent A completed first scientific pass, before reading peer results',
    'reviewerRole': 'independent_reviewer_a',
    'model': 'OpenAI Codex; exact serving revision not exposed',
    'reviewedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'previousPartialFirstSeal': receipt(OWN / 'first-independent-a-scientific-findings-partial.freeze.json'),
    'authorOriginalTextAndPInputSeal': receipt(AUTHOR / 'author.text-and-P-inputs.first.freeze.json'),
    'actualInputsRead': [receipt(AUTHOR / p) for p in [
        'current20-whole-DEEN-goals.actual.json',
        'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json',
        'P20.current-text-preimage.author.candidates.json']],
    'actualWholeDescriptionsRead': 20, 'actualCompleteDEENMaterialCasesRead': 40,
    'actualWholePositiveProfilesRead': 20,
    'copiedBriefBindingsVerified': 'All 40 complete material+task and expected answer pairs equal the corresponding P application briefs in both languages.',
    'actualScopedPrimarySources': sources,
    'peerResultsRead': False, 'newRootImageAuthorFindingsRead': False,
    'actualImageReview': 'Pending actual final image handoff; no V pass claimed',
    'actualFinalNativePageAndContextReview': 'Pending final image/native20 page handoff; no D closure claimed',
    'findings': findings,
    'unaffectedScienceFindings': partial['positiveEarlyChecks'] + [
        'All four evaluation perspectives, fact/value separation and conditional decisions occur in the complete sustainability materials.',
        'Population models distinguish exponential per-capita growth, density feedback, changing carrying capacity and bounded harvesting.',
        'Carbon and nitrogen transformations are scientifically coherent; the finding concerns compulsory course scope.',
        'Succession does not falsely require monotonic local richness; mosaics and species turnover remain distinct.',
        'Conservation, land-use, pollution and resource cases retain causal mechanisms, uncertainty, monitoring and human-use trade-offs.',
        'Actual measurement and actual soil investigation remain required future performances, not E2 learner evidence.',
        'HE excursion, BY genuine field-data/laboratory potency, whole management/service categories and other unassessed source duties remain open.'],
    'scientificFirstPassVerdict': 'REVISE_P_4_BOUNDED_FINDINGS',
    'machineM7ClosureClaim': False, 'humanApproval': False,
}
target = OWN / 'first-independent-a-scientific-findings-full.actual.json'
assert not target.exists(), 'Immutable first full findings already exist'
target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
freeze = OWN / 'first-independent-a-scientific-findings-full.freeze.json'
assert not freeze.exists()
freeze.write_text(json.dumps({'role': 'Immutable independent A first full scientific findings seal',
                             'files': [receipt(target)],
                             'peerResultsReadBeforeSeal': False,
                             'machineM7ClosureClaim': False,
                             'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(receipt(freeze)))
