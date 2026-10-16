# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from pathlib import Path
import subprocess

E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
O = E / 'chemie-HE145-327-current-admission-informed-independent-b-20261016-v1'
K = Path('tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1')
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def save(name, obj):
    with (O / name).open('x') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

first_path = O / 'science.FIRST.two-current-primary-admissions.independent-b.json'
assert pin(first_path)['sha256'] == 'sha256:776779bf3aaefd88be152bd68120aa9f95d3fa9e207890c64bda60a10f43174e'
first = read(first_path)
check_path = O / 'CHECK.two-current-primary-content-roles-sources-and-calculations.independent-b.json'
check = read(check_path)
landscape = read(K / C)
by = {g['id']: g for g in landscape['goals']}

sources = []
for path, pages, printed in [
    (Path('curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'), [43, 46, 47, 50], [43, 46, 47, 50]),
    (Path('curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'), [12], [11]),
]:
    texts = []
    for physical_page, printed_page in zip(pages, printed):
        text = subprocess.check_output(['pdftotext', '-layout', '-f', str(physical_page), '-l', str(physical_page), str(path), '-'], text=True)
        texts.append({'physicalPage': physical_page, 'printedPage': printed_page, 'actualLocalPageText': text})
    sources.append({'source': pin(path), 'pages': texts})
save('SOURCE.actual-local-HE-primary-page-texts.independent-b.json', {
    'role': 'Actual local official source page text inspected for the finite source/course findings',
    'sources': sources,
    'boundary': 'General SekI solubility clause is a prior-science rationale, not an invented exact approved source mapping for canonical413. Local page11 was initially an overview; actual required source passage is physical12/printed11.',
    'HumanApproval': False, 'M7Claim': False,
})

silicone = first['admissionFindings']['siliconePair']['goalIds']
carrier_id = 'e56040b5-1da8-5080-b358-086d04922339'
incoming = {id: [{'goalId': g['id'], 'title': g['title']} for g in by.values() if id in g.get('requires', [])] for id in silicone}
assert {g['goalId'] for g in incoming[silicone[0]]} == set(first['scope'])
assert {g['goalId'] for g in incoming[silicone[1]]} == set(first['scope'] + [silicone[0]])
assert not any(carrier_id in g.get('requires', []) for g in by.values())
save('ADDENDUM.finite-silicone-incoming-edges-and-mixed-goal-boundary.independent-b.json', {
    'role': 'Additive exact structural witness after immutable scienceFIRST; no author change',
    'siliconeDirectIncomingRequires': incoming,
    'siliconeCarrier': {k: by[carrier_id].get(k) for k in ['id', 'title', 'contains', 'requires', 'applicability']},
    'carrierRequiredByAnyCurrentGoal': False,
    'interpretation': 'Current direct silicon admission edges are confined to the two primary assessments and the specific nanosurface-to-silicone foundation. The generic warning in FIRST about retained required carriers is conditional: this particular carrier is not itself required. Actual HE target placement and closure-derived source claims still need correction.',
    'mixedAromaticExistingAlternative': {k: by['17ab1148-7383-5cab-8b91-73aff795f1e4'].get(k) for k in ['id', 'title', 'description', 'tags', 'requires', 'applicability']},
    'mixedBoundary': 'This existing general aromatic-substitution goal is currently LK-tagged and has its own foundation. This reviewer has not approved it as an exact HE-GK halogenation counterpart. Removing the full mixed halogenation/nitration goal cannot erase the true common halogenation duty. Author must show an existing suitable reviewed counterpart or make a bounded source-preserving split/counterpart.',
    'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False,
})

view_paths = [v['viewPath'] for v in check['currentViewChecks'] if v['scope'].get('jurisdiction') == 'DE-HE']
eight = first['admissionFindings']['definiteGKCourseLevelOverreach']
plan = {
    'role': 'Finite author plan only; not an applied CAS, new approval, or source-hash patch',
    'baseCanonical': check['canonicalL4'],
    'minimumWholeAssessmentRequiresCAS': first['scope'],
    'affectedFourWholeHEViewCAS': view_paths,
    'assessmentBodyInvariant': 'Keep both complete German44BE papers, solutions, 44/27 scoring, seven assessed IDs, titles/endpoint purpose, and historical exact content reviews. No passing-bar weakening or practical/mastery assertion.',
    'sourceMatrix': 'For the two185/265 admission lists, distinguish actual commonHE, additionalHE-LK, and explicitly justified prior foundations using actual official clauses. A goal becoming visible because this endpoint requires it is no source proof.',
    'siliconeCorrection': {'goalIds': silicone, 'action': 'Remove unsupported compulsory HE admission and target placement. Preserve legitimateBY canonical goals, text, P/image/card/review history. Inspect actual residual requires/contains paths, not just a displayed count.'},
    'GKCourseCorrections': eight,
    'mixedGoalGuard': 'Preserve common strong-acid/base pH and common aromatic halogenation performances. Reuse a demonstrably suitable reviewed existing scoped counterpart where available. If none exists, add only the bounded source-preserving counterpart/split and its actual necessary review; six CAS operations alone must not pretend to preserve missing common duties.',
    'retainHELK': 'The eight genuine additionalHE-LK performances remain legitimate LK targets/admission where applicable.',
    'prior413': {'goalId': '413040cd-ba74-5227-948c-a778b0bd0f56', 'action': 'Keep plausible solubility/saturation prior science; explicitly justify its prior role and stage placement. HE G9 printed11 supports general foundation but is not an exact HE-SekII coverage claim. Do not infer mastery or an approved direct mapping.'},
    'preserveGlobalTags': 'No global GK→LK-only tag rewrite: other Bundeslaender can legitimately include these canonical performances at their GK level. Use exact HE authored composition/source-course distinctions.',
    'verification': 'Recompute bounded current two-endpoint direct/effective admission and fourHE view role/source/card visibility against the actual new wholes. Retain required targets and actual unmastered support; independent informed paired followup then decides current whole readiness.',
    'scopeLimit': 'No new ordinary435/nativeD campaign, all152 assessment restart, unrelated proposal review, learner state mutation, or automatic release.',
    'authorWritesPerformed': False, 'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False,
}
save('PLAN.bounded-two-admissions-four-HE-views.author-handoff.independent-b.json', plan)

judgments = []
for row in check['contentChecks']:
    decision = next(x for x in first['currentPrimaryDecisions'] if x['goalId'] == row['goalId'])
    relevant = check['currentViewChecks'][:4]
    judgments.append({
        'reviewId': 'chemie-he145-327-current-admission-informed-independent-b-20261016-v1',
        'reviewer': '/root/chemie_native9_fresh_independent_b_20261016',
        'reviewedAt': '2026-10-16', 'goalId': row['goalId'], 'wholeGoalFingerprint': row['currentWholeFingerprint'],
        'actualWholeCurrentL3L4Equal': True, 'completeGerman44BEContentDecision': 'KEEP',
        'contentFingerprint': row['assessedContentFingerprint'], 'entireHistoricalAssessedContentExact': True,
        'legitimateBoundedCourseEndpointDecision': 'KEEP', 'currentAdmissionDecision': 'REVISE',
        'currentDirectRequires': row['directRequires'], 'currentWholeStatus': 'needs_developer_review',
        'machineContentReleasedReady': False, 'examReviewStatusObserved': 'draft',
        'reason': decision['reason'], 'scienceFIRST': pin(first_path), 'mechanicalEvidence': pin(check_path),
        'finiteCurrentHEMemberships': [{
            'viewPath': v['viewPath'], 'viewSHA256': v['currentL4File']['sha256'], 'scope': v['scope'],
            'samePrimarySelectedInView': v['primaryGoalId'] == row['goalId'],
            'witnesses': v['witnesses'],
        } for v in relevant],
        'officialSourceFilesAndPages': [{'source': s['source'], 'pages': [{'physicalPage': p['physicalPage'], 'printedPage': p['printedPage']} for p in s['pages']]} for s in sources],
        'releaseCondition': 'Actual finite source/course and authored-scope repair plus informed whole-current paired review; contentKEEP does not clear admissionREVISE.',
        'historicalIdentity': 'Preserve original route13 pair as history. This is a new informed B judgment by the named current reviewer, not a forged original reviewer binding.',
        'languageBoundary': 'German full paper only; English metadata does not establish full English exam review.',
        'ordinaryNativeDApplicable': False, 'all265FreshPImageOrFullQualityReviewClaim': False,
        'priorMasteryAssumed': False, 'observedLearnerExecution': False, 'HumanApproval': False,
        'HumanTrial': False, 'M7Claim': False, 'normalWrites': False,
    })
with (O / 'JUDGMENTS.two-current-whole-assessments.informed-independent-b.jsonl').open('x') as f:
    for row in judgments:
        f.write(json.dumps(row, ensure_ascii=False) + '\n')

lines = [
    '# Zwei aktuelle HE-Abschlussziele: unabhängiges B-Followup', '',
    '**Vollständiger Aufgabeninhalt: KEEP. Aktuelle Zulassung: REVISE. Maschinenfreigabe bleibt offen.**', '',
    'Geprüft wurden genau14577339-9e0c-5b44-8e47-91e1a4947367 (GK,185 direkte Voraussetzungen) und32705a3a-9b7f-5cc0-ba41-881d13d0c45b (LK,265). Die vollständigen deutschen44BE-Aufgaben, Materialien, Lösungen, Rubriken und sieben Abdeckungsziele sind gegenüber den historischen Ganzkörpern exakt unverändert. Eigene Rechnungen bestätigenK=4,Q=2,−1368kJ/mol und−1068,222kJ/mol im Modellkalorimeter;44/27 bleibt unverändert.', '',
    '## Tatsächlicher aktueller Umfang', '',
    'Alle elf folgenden Ziele sind TARGET in allen vier aktuellen HE-Views:de-he-gk,de-he-lk,de-he-sekii-gk,de-he-sekii-lk. Alle stehen sowohl in185GK als auch in265LK. Exakte Dateihashes und Stockrollen stehen im CHECK und in den beiden Urteilzeilen. In allen acht geprüften HE/generischen Kontexten fehlt technisch keine direkte Voraussetzung; dies beweist keine fachliche Angemessenheit.', '',
    '| Ziel-ID | Befund | Tatsächliche HE-Quelle |',
    '|---|---|---|',
]
for x in eight:
    lines.append(f"| {x['goalId']} | Als vollständige Leistung in HE-GK zu weitgehend: {x['duty']} | {x['primaryBoundary']} |")
for id in silicone:
    lines.append(f'| {id} | Spezifische Silikonleistung nicht als universelle HE-Voraussetzung begründet | HE Q2.2 S.43: allgemeine Polymere und Silber-Nanopartikel; kein Silikonbeleg. Aktuelles HE nur requires-closure. |')
lines.append('| 413040cd-ba74-5227-948c-a778b0bd0f56 | Fachlich plausible Sek-I-Grundlage erhalten; pauschale HE-Sek-II-Quellen-/Zielklassifikation berichtigen | HE G9 S.11, physische PDF-Seite12: Lösungen/Löslichkeit; kein erfundener direkter413-Quellenbeleg. |')
lines += ['', '## Begrenztes nächstes Autorpaket', '',
    'Mindestens zwei ganze Assessment-requires-CAS und die vier betroffenen ganzen HE-Views. Ausgewiesene gemeinsame und zusätzliche LK-Pflichten anhand echter HE-Quellen trennen. Globale GK/LK-Tags sowie legitime BY-/LK-Ziele erhalten. Bei gemischten Zielen gemeinsame starke-pH- und Halogenierungsanteile durch einen wirklich passenden vorhandenen Gegenpart oder einen eng begrenzten quellentreuen Gegenpart/Split erhalten. Ein reiner Scopehash-Wechsel oder Löschen des gemeinsamen Anteils genügt nicht.', '',
    '413 benötigt eine ausdrückliche fachliche Vorwissensbegründung und passende Stufenrolle. Bestehende Meisterschaft wird nicht fingiert. Vollständige Kursvoraussetzungen dürfen über sieben geprüfte Ziele hinausreichen, müssen jedoch echte anwendbare Kurspflichten oder sachlich begründete Grundlagen sein.', '',
    'Originale FIRST-Bewertungen und alte Paare bleiben exakt erhalten. Keine Autoränderung, kein NativeD für Assessments, kein Neustart435/all152, keine menschliche Freigabe oder M7-Aussage. Das versiegelte FIRST bleibt unverändert; nachfolgende Mechanik bestätigt Bindungen und tatsächliche Rollen.']
with (O / 'REPORT.two-current-assessments.content-KEEP-admission-REVISE.independent-b.md').open('x') as f:
    f.write('\n'.join(lines) + '\n')

# Every whole written JSON/JSONL is parsed. The output directory contains regular files only.
parsed = []
for p in sorted(O.iterdir()):
    assert p.is_file() and not p.is_symlink(), str(p)
    if p.suffix == '.json':
        read(p)
        parsed.append(p.name)
    elif p.suffix == '.jsonl':
        text = p.read_text()
        assert text.endswith('\n')
        rows = [json.loads(line) for line in text.splitlines()]
        assert len(rows) == 2
        parsed.append(p.name)
assert pin(first_path)['sha256'] == 'sha256:776779bf3aaefd88be152bd68120aa9f95d3fa9e207890c64bda60a10f43174e'
files = [pin(p) for p in sorted(O.iterdir())]
save('MANIFEST.final-two-current-primary-informed-independent-b.sealed.json', {
    'role': 'Final additive independent B seal: exact two current HE primary assessments only',
    'contentDecision': 'KEEP', 'currentAdmissionDecision': 'REVISE', 'releaseReady': False,
    'scienceFIRST': pin(first_path), 'files': files, 'wholeJSONAndJSONLParsed': parsed,
    'regularFilesOnly': True, 'historicalFIRSTPreserved': True, 'noCurrentPeerAScienceRead': True,
    'authorWrites': False, 'normalWrites': False, 'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False,
})
manifest = O / 'MANIFEST.final-two-current-primary-informed-independent-b.sealed.json'
read(manifest)
print(json.dumps({'manifest': pin(manifest), 'files': len(files), 'judgments': len(judgments), 'content': 'KEEP', 'admission': 'REVISE', 'releaseReady': False}))
