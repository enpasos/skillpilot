#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Transport an already independently reviewed film-fixing duty to its real goal."""
import copy
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
OUT = BASE / 'chemie-current450-SN-film-source-binding-normal-integration-technical-20261018-v1'
MAPPING = Path('curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_chemistry_upper_secondary_to_canonical_chemistry.json')
REVIEW = MAPPING.with_name('sn_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')
CANONICAL = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
FACTS = BASE / 'chemie-current450-five-terminal-target-placements-author-20261018-v1/INPUT.four-source-facts-and-existing-review-boundaries.json'
INDEPENDENT_A = BASE / 'chemie-current450-T3-photometry-material-independent-a-20261018-v1/REVIEW.SN-paired-source-course-prerequisite-placement.independent-a.json'
SOURCE = 'sn-chem-sekii-sn-ch-jahrgangsstufe-11-grundkurs-wb1-011-01-81755658'
TARGET = 'f4f7f028-10db-53f9-bdae-456e0c6d0896'
WRONG = 'afa7dae7-9378-5687-aa8d-69a04afaa0d8'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    b = p.read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))

def dump(x):
    return json.dumps(x, ensure_ascii=False, indent=2) + '\n'

assert not OUT.exists(), 'Never overwrite an integration receipt'
inputs = [pin(p) for p in (MAPPING, REVIEW, CANONICAL, FACTS, INDEPENDENT_A)]
fact = next(r for r in read(FACTS)['records'] if r['goalId'] == TARGET)
a = read(INDEPENDENT_A)
assert a['verdict'] == 'accept_exact_SN_GK_optional_ordinary_and_assessment_pair_placement'
assert a['findings'] == []
prior = fact['reusedOriginalCompleteSourceContentFit']
assert prior['boundOriginalAContentDecision'] == 'ACCEPT_FULL_FILM_FIXING_COMPLEXATION_DUTY_IN_NEW_F4F7_BODY'
assert prior['boundOriginalBResult']['sourceDutyConservation'] == 'pass_full_fixing_complexation_duty'
assert prior['boundOriginalBResult']['componentSourceFit'] == 'accept_full_bounded_fixing_explanation_body'
assert fact['canonicalWholeGoal'] == next(g for g in read(CANONICAL)['goals'] if g['id'] == TARGET)
assert pin(fact['primaryPDF']['path']) == fact['primaryPDF']
assert pin(fact['primaryPageText']['path']) == fact['primaryPageText']
assert Path('tmp/chemie450-SN-source-binding/SN.physical41.actual.txt').read_bytes() == Path(fact['primaryPageText']['path']).read_bytes()
before = {p: (p.read_bytes(), read(p)) for p in (MAPPING, REVIEW)}
after = {p: copy.deepcopy(j) for p, (_, j) in before.items()}
changed = []
for p, j in after.items():
    rows = [r for r in j['mappings'] if r['legacyGoalId'] == SOURCE]
    assert len(rows) == 1 and rows[0]['canonicalGoalId'] == WRONG
    old = copy.deepcopy(rows[0])
    assert rows[0]['matchType'] == 'exact'
    rows[0]['canonicalGoalId'] = TARGET
    changed.append(dict(path=str(p), before=old, after=copy.deepcopy(rows[0])))

decision = next(r for r in after[REVIEW]['decisions'] if r['sourceGoalId'] == SOURCE)
assert decision['canonicalGoalIds'] == [WRONG]
old_decision = copy.deepcopy(decision)
decision['canonicalGoalIds'] = [TARGET]
decision['rationale'] = (
    'Die amtliche Zelle in Sachsen, Jahrgangsstufe 11 Grundkurs, Wahlbereich 1 '
    '(physische PDF-Seite 41, Druckseite 29) benennt das Auflösen von Silberbromid '
    'durch Komplexbildung beim Fixieren eines Films. Das bereits unabhängig '
    'geprüfte f4f7-Ziel erklärt genau diese Stoff- und Teilchenvorgänge und grenzt '
    'sie vom metallischen Silberbild, Belichtung und Entwicklung ab. '
    'Silbernanopartikel in Kunststoffverpackungen sind kein Ersatz für diese Zelle. '
    'Die Korrektur bindet die bereits geprüfte Erklärkomponente operativ; sie '
    'erteilt weder dem benachbarten Experiment noch dem ganzen Wahlbereich '
    'Quellenabdeckung. Der Wahlbereich bleibt amtlich optional und GK-spezifisch. '
    'Vor einer späteren Themenwahl umfasst das SkillPilot-Ziel entsprechend der '
    'Produktentscheidung die vorhandenen anwendbaren Themen; eine tatsächliche '
    'Lernendenwahl oder allgemeine amtliche Pflicht wird nicht behauptet. '
    'Inhaltsnachweise: ' + str(FACTS) + '; aktuelle Quellen-/Kursprüfung: ' + str(INDEPENDENT_A)
)
decision['reviewedAt'] = '2026-10-18'
decision['reviewer'] = 'Codex technical integration of existing independent AI source-fit decisions; no new scientific or human approval'

# Reversibility proof: these two rows and one decision are the entire delta.
for p, j in after.items():
    check = copy.deepcopy(j)
    next(r for r in check['mappings'] if r['legacyGoalId'] == SOURCE)['canonicalGoalId'] = WRONG
    if p == REVIEW:
        i = next(i for i, r in enumerate(check['decisions']) if r['sourceGoalId'] == SOURCE)
        check['decisions'][i] = old_decision
    assert check == before[p][1], str(p)
    json.loads(dump(j))
assert [pin(p) for p in (MAPPING, REVIEW, CANONICAL, FACTS, INDEPENDENT_A)] == inputs
OUT.mkdir()
for p, (raw, _) in before.items():
    (OUT / (p.name + '.before.snapshot')).write_bytes(raw)
for p, j in after.items():
    p.write_text(dump(j))
assert pin(CANONICAL) == inputs[2], 'Ordinary goals must remain exact'
for p in after:
    assert read(p) == after[p]
(OUT / 'integration-writer.py').write_bytes(Path(__file__).read_bytes())
(OUT / 'RECEIPT.actual-existing-source-fit-binding-integration.json').write_text(dump(dict(
    role='TECHNICAL_SOURCE_BINDING_OF_EXISTING_INDEPENDENT_CONTENT_FIT_NOT_A_NEW_SCIENTIFIC_REVIEW',
    inputs=inputs, changedMappingRows=changed, oldSourceDecision=old_decision,
    newSourceDecision=decision, sourcePhysicalPage=41, sourcePrintedPage=29,
    currentOrdinaryGoalAndPNotModified=True,
    allOtherMappingsAndDecisionsExact=True,
    legacyNanoparticleOtherSourceBindingsUnchanged=True,
    optionalGKScopePreserved=True, actualSourcePageReextractedAndRead=True,
    existingFullIndependentSourceFitAandBRetained=True,
    newScientificFirstCompletions=0, newNativeBindings=0,
    limits=dict(CQR003NotClaimedUntilActualAudit=True, wholeWahlbereichCoverage=False,
                experimentalDutyCoverage=False, actualTopicChoice=False,
                humanApproval=False, learnerExecution=False, M7=False),
    outputs=[pin(p) for p in after],
)))
(OUT / 'SEAL.actual-source-binding-integration.json').write_text(dump(dict(
    role='TECHNICAL_RECEIPT_NOT_REVIEW_VOTE',
    files=[pin(p) for p in sorted(OUT.iterdir())],
    outputs=[pin(p) for p in after], historicalEvidenceUnmodified=True,
)))
print(dump(dict(out=str(OUT), mappingRowsCorrected=2, sourceDecisionsCorrected=1,
                newOrdinaryScienceApprovals=0, canonicalUnchanged=True)))
