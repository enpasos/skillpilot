import copy
import hashlib
import json
import pathlib
import uuid
from datetime import datetime, timezone

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15')
OLD = BASE / 'chemie-equilibrium-four-source-scope-author-20261015-v1'
ROOT = BASE / 'chemie-equilibrium-four-source-scope-candidate-author-20261015-v1'
CURRENT = BASE / 'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1'
CANON = CURRENT / 'candidate/canonical560.current422.one-rezeptfrei-term.author.json'
SEM = CURRENT / 'candidate/semantic560.one-rezeptfrei-term.source-identity.author.json'
MATERIALS = BASE / 'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json'
PROFILES = BASE / 'chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/sixteen-profile-bodies.scientific-successor.jsonl'
IDS = ['a8ddb351-3501-5b6d-a908-c82a5d2f14d4', 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd', '1a51362e-fd84-5964-89b5-b435772c2149', 'f0f2c5f8-06f1-5774-a176-d96505727acf']
NOW = datetime.now(timezone.utc).isoformat()

def ref(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def write(name, value):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return ref(p)

def object_hash(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert not ROOT.exists(), ROOT
assert ref(CANON)['sha256'] == 'sha256:fccb633f60e264e48470aadf96c66f0aac9d8b4a8e0abbcc15d4ef671926c647'
assert ref(SEM)['sha256'] == 'sha256:3e8f562fc19f177f987d1168718ffb48be3d115c45be63dae59096d909f9f27d'
assert ref(MATERIALS)['sha256'] == 'sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e'
ROOT.mkdir()
before = read(CANON)
before_by_id = {g['id']: g for g in before['goals']}
proposal = read(OLD / 'proposal/two-whole-goals.bounded-DE-EN-model-descriptions.author.json')
components = read(OLD / 'proposal/eight-declared-author-components.source-role-candidate.json')['sourceGoals']
source_plan = read(OLD / 'proposal/four-whole-competence-source-scope-plan.author.json')

inputs = write('INPUTS.current-fccb-3e8f-and-source-plan.neutral-author.selector.json', {
    'schemaVersion': 1,
    'role': 'Inactive informed author continuation, no independent review or approval',
    'createdAtUTC': NOW,
    'canonical': ref(CANON), 'semantic': ref(SEM),
    'historicalSourcePlan': ref(OLD / 'NEUTRAL.finite-four-source-scope-author-plan.json'),
    'historicalSourcePlanSeal': ref(OLD / 'FILES.finite-own-source-scope-author.seal.json'),
    'originalAuthorFIRST': ref(OLD / 'ORIGINAL-FIRST.source-science.before-proposal.author.json'),
    'originalFIRSTSeal': ref(OLD / 'FIRST.source-science.seal.json'),
    'controllingHE2027Addendum': ref(OLD / 'FIRST.supplement-whole-BY13-and-HE2027-author-addendum.json'),
    'addendumSeal': ref(OLD / 'FIRST.supplement-source-science.seal.json'),
    'wholeSourceCellsAndPartnerUnions': ref(OLD / 'context/whole-original-and-additional-source-cells-union-edges.author-reading.json'),
    'wholeBY13AdditionalCellsAndPartners': ref(OLD / 'context/supplement-BY13-whole-acid-base-source-cells-union-partners.exact.json'),
    'wholeOriginalRawUnion': read(OLD / 'context/whole-original-and-additional-source-cells-union-edges.author-reading.json')['allRawCompanionRoutesPreservedAt'],
    'exactCurrent32Cases': ref(MATERIALS), 'exact16ScientificProfiles': ref(PROFILES),
    'selectedGoalIds': IDS, 'descriptionChangeIds': [IDS[0], IDS[3]],
    'noOtherSourceReviewRuns': True, 'newReviewVotes': 0,
})

first = write('FIRST.actual-source-role-and-two-description-continuation.author.json', {
    'schemaVersion': 1, 'role': 'Author science before candidate edit and stock technical binding',
    'createdAtUTC': NOW, 'inputSelector': inputs,
    'historicalFIRSTsUnchanged': True,
    'scientificChanges': [
        {'goalId': IDS[0], 'reasonDe': '07a/b verlangen bereits Herleitung und Umrechnung bei expliziten Standardzuständen, idealem Gasmodell und Einheitenprüfung sowie Transfer zu Nichtidealität. Der ganze DE/EN-Vorschlag aus dem Quellenplan macht diese echte Modellgrenze und Leistung lesbar, ohne Kp zur amtlich benannten BY-/HE-Pflicht zu erklären.', 'fields': ['description', 'descriptionEn']},
        {'goalId': IDS[3], 'reasonDe': '10a/b verlangen bereits Konstruktion und Interpretation aus vorgegebenen Gleichgewichtsbeziehungen und die Trennung von thermodynamischer Stabilität, Korrosionsrate und echter Schutzschicht. Der ganze DE/EN-Vorschlag benennt diese tragende Grenze. Alle Bildbytes, Grenzen, Zahlen und Fallanforderungen bleiben bestehen.', 'fields': ['description', 'descriptionEn']},
    ],
    'otherWholeGoals': 'e0d4f08a und 1a51362e behalten die aktuellen ganzen Texte; sämtliche weiteren 558 ganzen Zielobjekte bleiben exakt.',
    'eightSourceRoleCandidates': [{'goalId': c['canonicalGoalId'], 'jurisdiction': c['jurisdiction'], 'sourceKind': c['sourceKind'], 'wholeOfficialSourceCoverage': False} for c in components],
    'proposedCourseDeclarationDe': 'Die vier vorhandenen Kompetenzen bleiben im bestehenden SkillPilot-LK-Zieluniversum. Sie sind verfasste Erweiterungen; für zwei BY-Komponenten wird eine begrenzte Modelloperationalisierung des mathematischen Quellenoperators vorgeschlagen. Keine Methode wird als amtlich benannte selbständige BY-/HE-Pflicht ausgegeben. Dies ist eine zu prüfende Anwendungs-/Kursdeklaration und keine neue optionale Runtimewahl.',
    'counterevidenceDe': 'HE Q3.3 schließt pH-/Temperaturabhängigkeit der Nernst-Rechnung aus. Der Chemieteil des Abiturerlasses 2027 begrenzt die weitere Komplexbetrachtung bei Fehling; dieser datierte Zuschnitt bleibt sichtbar. Generelle Mathematikoperatoren überschreiben diese Grenzen nicht. RP Kp bleibt im Vertiefungs-/Verzahnungsabschnitt außerhalb der heutigen BY-/HE-Geltung; die vorhandene fehlerverdächtige RP-Kante wird nicht umgeschaltet.',
    'retention': 'Alle 32 ganzen Fälle einschließlich 09-b mit ausdrücklicher verdünnt-idealer Näherung und alle 16 Profile werden exakt referenziert. Ganze amtliche Zellen, Operatoren, Kurs-/Wahlpflichtgrenzen und bestehende Partner/Unionkanten bleiben unverändert.',
    'technicalBoundary': 'sourceKind ist eine belegte Repository-Autorprovenienzkonvention, keine implementierte optionale Laufzeitwahl. Nichtamtliche Autorenkomponenten werden nicht als offizielle Dokumente markiert. M3 bleibt ein unreviewter Vorschlag ohne mapped-Entscheidung. Atlas-Registrierung und Readerbedarf werden nur als isoliertes Delta beschrieben.',
    'newReviewVotes': 0, 'newAtomicityApproval': False, 'activeWrites': False,
})
write('FIRST.author-before-candidate.seal.json', {'schemaVersion': 1, 'sealedAtUTC': NOW, 'first': first, 'inputs': inputs, 'sealedBeforeCanonicalCandidateCreation': True, 'scientificReview': False})

# Replace exactly four description string values, retaining every other input byte.
text = CANON.read_text()
changes = []
for g in proposal['goals']:
    for field in ['description', 'descriptionEn']:
        old_string = json.dumps(before_by_id[g['id']][field], ensure_ascii=False)
        new_string = json.dumps(g[field], ensure_ascii=False)
        assert text.count(old_string) == 1, (g['id'], field)
        text = text.replace(old_string, new_string, 1)
        changes.append({'goalId': g['id'], 'field': field, 'before': before_by_id[g['id']][field], 'after': g[field]})
out = ROOT / 'candidate/canonical560.current422.two-model-bound-descriptions.author.json'
out.parent.mkdir()
with out.open('x') as f:
    f.write(text)
after = read(out)
after_by_id = {g['id']: g for g in after['goals']}
assert len(after_by_id) == len(before_by_id) == 560
assert [g['id'] for g in after['goals']] == [g['id'] for g in before['goals']]
assert {k:v for k,v in before.items() if k != 'goals'} == {k:v for k,v in after.items() if k != 'goals'}
for gid, g in before_by_id.items():
    if gid not in [IDS[0], IDS[3]]:
        assert g == after_by_id[gid]
    else:
        assert {k:v for k,v in g.items() if k not in ['description', 'descriptionEn']} == {k:v for k,v in after_by_id[gid].items() if k not in ['description', 'descriptionEn']}
assert 'rezeptfrei' in after_by_id['f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528']['description']
write('checks/CAS.exact-four-description-values-only.actual.json', {
    'role': 'Object and byte-preservation evidence, not scientific review', 'input': ref(CANON), 'output': ref(out),
    'exactReplacementCount': 4, 'changes': changes, 'other558WholeGoalsExact': True,
    'all560IdsOrderAndGraphExact': True, 'allCourseTagsApplicabilityWeightsAssetsProvenanceExact': True,
    'rezeptfreiWholeGoalExact': True, 'topLevelFieldsExact': True, 'newScientificVotes': 0,
})

whole_context_ids = set(IDS)
for gid in IDS:
    whole_context_ids.update(before_by_id[gid].get('requires', []))
    whole_context_ids.update(g['id'] for g in before['goals'] if gid in g.get('contains', []))
write('context/current-whole-four-goals-direct-prereqs-and-parents.exact.json', {
    'role': 'Whole exact candidate bodies, no review judgments', 'canonical': ref(out),
    'goals': [g for g in after['goals'] if g['id'] in whole_context_ids],
    'additionalWholeNormativePartnersUnchangedAt': ref(OLD / 'context/whole-current-partners-prereqs-and-parents8152.exact.json'),
})

cases = read(MATERIALS)['cases']
profiles = [json.loads(line) for line in PROFILES.read_text().splitlines() if line.strip()]
selected_cases = [c for c in cases if c['goalId'] in IDS]
selected_profiles = [p for p in profiles if p['goalId'] in IDS]
assert len(cases) == 32 and len(profiles) == 16 and len(selected_cases) == 8 and len(selected_profiles) == 4
case09b = next(c for c in cases if c['id'] == 'eqrk16-09-b')
assert 'verdünnt-ideale Näherung' in case09b['materialsDe'] and 'dilute-ideal approximation' in case09b['materialsEn']
write('context/eight-whole-cases-four-profiles.exact-author-selection.json', {
    'role': 'Exact whole scientific author bodies selected by reference; no new P/A claims',
    'all32Cases': ref(MATERIALS), 'all16Profiles': ref(PROFILES),
    'cases': selected_cases, 'profiles': selected_profiles,
    'caseObjectBindings': [{'id':c['id'], 'goalId':c['goalId'], 'objectSha256':object_hash(c)} for c in selected_cases],
    'case09bExplicitIdealAssumptionPresent': True,
    'internalHistoricalBriefReferences': 'Existing profile brief pointers remain byte-exact; the controlling whole32 selection here is c9d14994. Unchanged case bodies can still have their original exact history references.',
})

# Normal source extraction/M3 collection keys; unreviewed and non-official.
# Existing eight component UUIDs and complete constructive role bodies are retained.
for jurisdiction in ['DE-BY', 'DE-HE']:
    selected = [c for c in components if c['jurisdiction'] == jurisdiction]
    source_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f'skillpilot:chemie:scope4:author:{jurisdiction}:20261015'))
    doc_key = f'SKILLPILOT-SCOPE4-AUTHOR-{jurisdiction}'
    source_goals = []
    proposals = []
    for c in selected:
        gid = c['canonicalGoalId']
        source_goals.append({
            'id': c['id'], 'title': c['titleDe'], 'titleEn': c['titleEn'],
            'description': c['description'], 'descriptionEn': c['descriptionEn'],
            'stage': 'SekII', 'courseLevel': 'LK', 'sourceDocumentKey': doc_key,
            'sourceKind': c['sourceKind'], 'authoredComponent': True, 'isOfficialBullet': False,
            'officialNumberingClaim': False, 'granularity': 'declaredAuthoredComponent',
            'sourceRef': 'Own authored role and course-use proposal; not an official curriculum bullet',
            'sourceSpan': f'Authored component for {gid}; own component identifier, no official numbering',
            'canonicalGoalId': gid, 'authorCandidate': True, 'active': False,
            'actualOriginalComponentBody': copy.deepcopy(c),
            'normativeAntecedentReading': {'wholeSourcePlan': ref(OLD / 'proposal/four-whole-competence-source-scope-plan.author.json'), 'wholeSourceCellsAndPartnerUnions': inputs['path'], 'controllingHE2027Addendum': ref(OLD / 'FIRST.supplement-whole-BY13-and-HE2027-author-addendum.json')},
            'parentNormativeAntecedents': copy.deepcopy(c['parentNormativeAntecedents']),
            'authorAddedAssumptions': copy.deepcopy(c['authorAddedAssumptions']),
            'wholeOriginalSourceCoverage': False, 'wholeCanonicalGoalApproval': False,
            'courseDeclarationStatus': 'proposed-existing-SkillPilot-LK-target-use-not-official-named-duty',
            'tags': [f'jurisdiction:{jurisdiction}', 'stage:SekII', 'courseLevel:LK'],
        })
        proposals.append({
            'sourceGoalId': c['id'], 'canonicalGoalIds': [gid], 'matchType': 'partial',
            'sourceKind': c['sourceKind'], 'status': 'unreviewed-author-proposal', 'active': False,
            'rationale': c['description'], 'rationaleEn': c['descriptionEn'],
            'namedOfficialStandaloneDuty': False, 'wholeOriginalSourceCoverage': False,
            'wholeCanonicalGoalApproval': False,
        })
    extraction = write(f'candidate/source-components/{jurisdiction}.scope4.author.source-extraction.json', {
        'schemaVersion': 1, 'sourceLandscapeId': source_id, 'jurisdiction': jurisdiction,
        'subject': 'Chemie', 'stage': 'SekII',
        'sourceDocuments': [{'key': doc_key, 'title': 'SkillPilot authored equilibrium model/extension component declarations', 'path': str(OLD / 'proposal/eight-declared-author-components.source-role-candidate.json'), 'official': False, 'role': 'own-authored-component-declaration', 'license': 'CC-BY-4.0'}],
        'sourceGoals': source_goals, 'passages': [],
        'qualityReview': {'status': 'author_candidate_pending_independent_source_and_course_review', 'active': False},
        'officialAntecedentsAreContextOnly': True,
        'originalOfficialExtractionsAndMappingsUnchanged': True,
        'newReviewVotes': 0,
    })
    write(f'candidate/mappings/{jurisdiction}.scope4.unreviewed-author.mapping-candidate.json', {
        'schemaVersion': 1, 'sourceLandscapeId': source_id, 'targetLandscapeId': before['landscapeId'],
        'sourceExtractionPath': extraction['path'],
        'reviewStatus': 'author_candidate_pending_independent_source_and_course_review',
        'summary': {'sourceGoals':4, 'reviewedSourceGoals':0, 'mappedSourceGoals':0, 'proposedPartialEdges':4},
        'decisions': [],
        'mappings': [{'legacyGoalId':c['id'], 'canonicalGoalId':c['canonicalGoalId'], 'matchType':'partial'} for c in selected],
        'authorProposals': proposals,
        'compatibilityMappingsAreUnreviewedProposalsOnly': True,
        'wholeOriginalSourceCoverage': False, 'wholeCanonicalGoalApproval': False,
        'active': False, 'newScientificVotes': 0,
    })

write('candidate/four-whole-goal-course-role.declaration.author.json', {
    'schemaVersion': 1, 'role': 'Explicit unreviewed application/course declaration, not an optional runtime feature',
    'status': 'author_candidate_pending_independent_source_and_course_review', 'active': False,
    'goalIds': IDS,
    'declarationDe': 'Alle vier vorhandenen Kompetenzen bleiben Ziele des bestehenden SkillPilot-LK-Zieluniversums. Die verfassten Erweiterungen werden transparent von amtlich benannten Pflichten getrennt. Die zwei BY-Modellkomponenten sind begrenzte Autorenoperationalisierungen; auch sie ersetzen keine ganze amtliche Kompetenz. Die HE-Ausschlussklauseln und der Abiturzuschnitt 2027 bleiben vollständig sichtbar. Der Vorschlag schafft keine Wahlmöglichkeit im Runtime-Menü, keine neue Freigabe und keinen verkleinerten Nenner.',
    'declarationEn': 'All four existing competencies remain targets in the current SkillPilot LK target universe. Authored extensions are explicitly distinguished from officially named duties. The two BY model components are bounded authored operationalisations and do not replace an entire official competency. The HE exclusions and 2027 examination scope remain visible. This proposal creates no optional runtime selection, approval or smaller denominator.',
    'sourceRoles': [{'goalId':c['canonicalGoalId'], 'jurisdiction':c['jurisdiction'], 'sourceKind':c['sourceKind'], 'namedOfficialStandaloneDuty':False} for c in components],
    'canonicalFieldsAlteredForThisDeclaration': [], 'all560IdsAnd422ClassificationsPreserved': True,
    'technicalLKTargetEvidence': 'checks/READONLY.existing-LK-compiler-and-provenance.actual.json',
    'newCourseOrSourceApproval': False,
})
print(json.dumps({'root':str(ROOT), 'canonical':ref(out), 'ownBytesSoFar':sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file())}))
