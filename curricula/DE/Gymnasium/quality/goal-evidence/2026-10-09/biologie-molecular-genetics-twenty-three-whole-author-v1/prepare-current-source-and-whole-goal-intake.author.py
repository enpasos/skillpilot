"""Bounded author intake; never modifies active curriculum or claims reviews."""
import hashlib
import json
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1'

def bind(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, obj):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def main():
    intake = json.loads((PREP / 'next-package.input.json').read_text())
    source = json.loads((PREP / 'open118-whole-source-duty-and-partner-frame.neutral.json').read_text())
    mismatches = []
    for b in intake['allRelevantActualInputBindings']:
        a = bind(b['path'])
        if a['sha256'] != b['sha256'] or a['bytes'] != b['bytes']:
            mismatches.append({'declared': b, 'actual': a})
    assert not mismatches, mismatches
    ids = set(sum([g['currentSourceDutyFrameRows'] for g in intake['selectedWholeGoalRows']], []))
    rows = [r for r in source['rows'] if r['rowId'] in ids]
    partner_ids = set(sum([r['wholeCanonicalPartnerGoalIds'] for r in rows], []))
    partners = [g for g in source['canonicalWholePartnerGoals'] if g['goalId'] in partner_ids]
    assert len(rows) == 38 and len(partners) == 44
    write('input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json', {
        'schemaVersion': 1, 'role': 'Exact whole author inputs, no scientific approval',
        'originalIntake': bind(PREP / 'next-package.input.json'),
        'wholeCurrentGoalRows': intake['selectedWholeGoalRows'],
        'wholeOriginalSourceDutyRows': rows, 'wholeCanonicalPartnerGoals': partners,
        'preserveExactStrict276GoalIds': intake['preserveExactStrict262GoalIds'] + intake['preserveExactReviewed14GoalIds'],
        'wholeSourceApproval': False, 'humanApproval': False, 'humanTrial': False,
        'activeWrites': [], 'strictGain': 0,
    })
    # Physical pages actually read as full original contexts, not extrapolated from legacy source spans.
    page_sets = {
        'BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf': [36, 37],
        'BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf': [36, 37],
        'BW/BP2016BW_ALLG_GYM_BIO_V2.pdf': [16, 24],
        'HB/Naturwissenschaften_Gymnasium_5_10_2006.pdf': [31, 32],
        'HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf': [1, 2, 3, 4, 5, 6],
        'MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf': [28, 29, 30],
        'NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf': [33, 34],
        'RP/Chemie_Sekundarstufe_I_Biologie_Physik_Chemie_2014.pdf': [44, 45],
        'SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf': [42, 43],
        'ST/FLP_Biologie_Gym_01082022_swd.pdf': [42, 43],
        'TH/LP_GY_Biologie_2024.pdf': [28, 29],
    }
    contexts = []
    for rel, numbers in page_sets.items():
        path = ROOT / 'curricula/DE/Gymnasium/input' / rel
        doc = fitz.open(path)
        for number in numbers:
            name = f"source-reading/{rel.split('/')[0]}-{Path(rel).stem}-physical-{number:03d}.txt"
            output = OWN / name
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(doc[number-1].get_text())
            contexts.append({'originalPrimary': bind(path), 'physicalPage': number,
                             'fullPageExtract': bind(output), 'sourceCoverageApproval': False})
    write('input/actual-primary-whole-context-reading.bindings.json', {
        'schemaVersion': 1, 'role': 'Actual original full-page author reading, not an independent source verdict',
        'pdfContexts': contexts, 'officialBavariaWholeContexts': intake['actualPrimaryRoutingContexts'],
        'legacyDescriptionIsNotVerbatimOfficialClause': True,
        'preservedPracticalDuties': ['MV microscopic nuclear-division phases',
            'ST microscopy and mandatory interchromosomal-recombination model experiment',
            'TH microscopy of giant chromosomes and mitotic phases'],
        'practicalOperatorApprovalByConstructedCases': False,
        'sourceAndCourseHoldsPreserved': True,
        'specificCourseBoundary': 'BY EA splice/viral/antisense/antibiotic/repair/levels/crossing/epigenetics extras do not become universal GA or SekI duties.',
        'scientificInterpretationLimits': [
            'Protein diversity is one basis for selection; alternative splicing is not a universal necessary condition for all evolution. Heritable variation and differential reproductive success must be distinguished from somatic isoform plasticity.',
            'Next-generation epigenetic regulation does not by itself establish stable transgenerational inheritance. Direct exposure of offspring/germ cells must be separated from persistence in an unexposed generation.',
            'Human karyograms support chromosome-number inference, not a complete clinical diagnosis, individual prognosis or ranking of persons.',
        ],
        'humanApproval': False, 'humanTrial': False, 'strictGain': 0,
    })
    write('input/all-original-intake-bindings.actual-technical-verification.json', {
        'schemaVersion': 1, 'checkedInputs': len(intake['allRelevantActualInputBindings']),
        'mismatches': mismatches, 'originalIntake': bind(PREP / 'next-package.input.json'),
        'scienceApproval': False, 'activeWrites': [],
    })
    print(json.dumps({'originalInputBindings': len(intake['allRelevantActualInputBindings']), 'selectedWholeGoals': 23,
                      'wholeSourceDuties': len(rows), 'wholePartners': len(partners), 'actualWholePdfPages': len(contexts),
                      'mismatches': len(mismatches), 'strictGain': 0}))

if __name__ == '__main__':
    main()
