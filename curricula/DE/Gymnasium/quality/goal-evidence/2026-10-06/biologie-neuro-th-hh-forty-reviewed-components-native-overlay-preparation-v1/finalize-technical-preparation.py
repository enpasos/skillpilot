#!/usr/bin/env python3
"""Seal the existing native results; no native compiler, PDF build or active writes."""
import collections
import datetime
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
DAY = OUT.parent
AUTHOR = DAY / 'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
IDS = [
    '4f631f78-e13a-58e5-9092-f4db0b8d377a',
    '8b23f8fb-555d-5720-b5f2-dd6f28a0e786',
    '97b24279-def0-5ce6-8726-a1cac9cd38ad',
    '9b966664-906b-5a5d-8008-cae18de043aa',
    'a46cafde-7359-5249-8754-19aaa3174ba4',
    'c9a06264-cce2-54dd-9604-46dd5949f02e',
    'f6280154-d57c-599c-94bf-73313005a6df',
    'ff1bf88f-2413-5668-a071-ce9fc499cba3',
]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    return json.loads(p.read_text())

def rel(p):
    return str(p.relative_to(ROOT))

def write(name, value):
    path = OUT / name
    assert not path.exists(), f'new artifacts only: {path}'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

receipt_path = ROOT / 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
receipt = read(receipt_path)
delta = read(OUT / 'all22-ordered-target-lists-and-actual-overlay-deltas.json')
current_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current = {g['id']: g for g in read(current_path)['goals']}
candidate = {g['id']: g for g in read(OUT / 'current472-neuro21-overlay.canonical.candidate.json')['goals']}
after = read(OUT / 'neuro21-hold-plus-reviewed40.source-atlas.actual.receipt.json')
assert {g['goalId'] for g in after['omittedGoals']} == set(IDS)
migration = read(AUTHOR / 'he43.original-ten.actual.migration-and-preservation.json')
old = {x['canonicalGoalId']: x for x in migration['oldSixteenAuthoredSourceGoals']}
successors = {x['originalBulletKey']: x for x in migration['successors']}
debt = read(AUTHOR / 'source71.actual.open-debt.json')['debts']
he_path = ROOT / migration['primaryDocument']['path']
he_text = subprocess.run(['pdftotext', '-f', '43', '-l', '43', '-layout', str(he_path), '-'], check=True, capture_output=True).stdout.decode()
assert 'Q2.4' in he_text and 'ein Sinnesorgan: Aufbau und Signaltransduktion' in he_text
(OUT / 'HE43.actual-local-text-next-locators.txt').write_text(he_text)

he_url = migration['primaryDocument']['url']
def he_locator(key, status, limit):
    s = successors.get(key)
    return {
        'jurisdiction': 'DE-HE', 'stage': 'SekII', 'phase': 'Q2',
        'physicalPage': 43, 'printedPage': 43, 'url': he_url,
        'sourceDocumentPath': rel(he_path), 'sourceDocumentSha256': sha(he_path),
        'componentKeyIsAuthorLocatorNotOfficialBulletNumber': key,
        'officialSourceGoalId': s['sourceGoalId'] if s else None,
        'courseProfile': s['courseLevel'] if s else 'GK_LK',
        'originalText': s['originalText'] if s else 'ein Sinnesorgan: Aufbau und Signaltransduktion (von der Sinneswahrnehmung über die Erregungsleitung zur Reaktion)',
        'nextCandidateStatus': status, 'retainedLimit': limit,
        'scientificApproval': False, 'wholeGoalSupported': False,
        'wholeSourceSupported': False, 'actualRasterViewedInThisTechnicalTask': False,
        'readingBasis': 'frozen original-bullet migration plus actual local PDF text locator; no new independent science review',
    }

locators = {
    IDS[0]: he_locator('LK5', 'AUTHOR_SPECIALISATION_RATIONALE_REQUIRED', 'Cellular learning is an exact parent clause; Hebb rules, network application and discussing limits are not named separate compulsory duties.'),
    IDS[1]: he_locator('Q2.4.GK1', 'BOUNDED_SIGNAL_TRANSDUCTION_COMPONENT_REQUIRES_INDEPENDENT_REVIEW', 'One sense organ with signal transduction is named. Frequency, place and population coding are not thereby established as the complete three-code duty.'),
    IDS[2]: he_locator('LK4', 'BOUNDED_TOPOLOGY_APPLICATION_RATIONALE_REQUIRED', 'Preserve EPSP/IPSP, spatial/temporal summation and inhibition. Named convergence/divergence and separate model-network analysis are not an original list item.'),
    IDS[3]: he_locator('LK3', 'WEAK_CONTEXT_ONLY_NOT_A_RESTORATION_COMPONENT', 'The exact duty is hormone action and hormonal/neural interplay. It does not establish dopamine/serotonin modulation systems.'),
    IDS[4]: he_locator('LK5', 'AUTHOR_SPECIALISATION_RATIONALE_REQUIRED', 'The candidate changes the active integration/learning/network routine to supplied network-model connection changes. This model specialisation is not an exact independent original bullet or GK duty.'),
    IDS[5]: he_locator('LK5', 'AUTHOR_SPECIALISATION_RATIONALE_REQUIRED', 'Cellular learning is the exact parent. Neither LTP/LTD names nor experimental classification is thereby an independently named compulsory list item.'),
    IDS[6]: he_locator('GK2', 'BOUNDED_ONE_EXAMPLE_ACH_SUBSTANCE_COMPONENT_REQUIRES_INDEPENDENT_REVIEW', 'Common GK/LK source requires one example at ACh synapses, channels and neuromuscular synapse. It does not require every psychoactive mechanism or support an exclusively LK placement.'),
    IDS[7]: he_locator('GK2', 'BOUNDED_EXCITATORY_CHEMICAL_ACH_COMPONENT_REQUIRES_INDEPENDENT_REVIEW', 'Preserve excitatory ACh chemical synapse, ligand-/voltage-dependent channels, substance example and neuromuscular synapse. Electrical synapses are not established by this clause.'),
}

# Mechanical decoding of the stored active baseline receipt. No new native run.
decoded = collections.defaultdict(list)
for scope in receipt['scopes']:
    for index in scope['witnessGroupRefs']:
        group = receipt['witnessGroups'][index]
        for gid in set(group['goalIds']) & set(IDS):
            decoded[gid].append({
                'scopeKey': scope['key'], 'coverage': group['coverage'],
                'sourceGoalId': group['sourceGoalId'],
                'mappedTargetGoalId': group['mappedTargetGoalId'],
                'profileBasis': group['profileBasis'],
                'mapping': receipt['inputBindings'][group['mappingInput']],
                'extraction': receipt['inputBindings'][group['extractionInput']],
                'storedBaselineReceiptIsNotFreshScientificEvidence': True,
            })
records = []
for gid in IDS:
    assert decoded[gid], gid
    o = old[gid]
    assert o['isOfficialBullet'] is False
    records.append({
        'goalId': gid, 'fullCurrentTitle': current[gid]['title'],
        'wholeCurrentGoal': current[gid], 'wholeTechnicalOverlayGoal': candidate[gid],
        'status': 'CURRENT390_ATLAS_GOAL_OMITTED_SOURCE_HOLD',
        'originalCurrent390GateStillFail': True,
        'previousBaselineWitnesses': decoded[gid],
        'previousAuthoredHEWitness': o,
        'previousHEParaphraseIsOfficialBullet': False,
        'preservedDebtRelations': [x for x in debt if x['canonicalGoalId'] == gid],
        'nextExactPrimaryLocator': locators[gid],
        'wholeGoalClosureFromLocator': False,
    })
write('eight-current-omitted-goals-full-witnesses-and-bounded-next-locators.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'technical source-gap handoff, no new science decision',
    'actualCurrentAtomicDenominator': 390, 'actualSourceSupportedUnion': 382,
    'actualEightOmittedIds': IDS, 'records': records,
    'localHETextExtractionIsNotRasterInspection': True,
    'newScientificReview': False, 'activeWrites': False, 'integrationApproved': False,
})

# Drafts remain descriptive preparation. They are not extraction/mapping inputs.
drafts = []
for gid in IDS:
    drafts.append({
        'draftCandidateId': 'next-bounded-' + gid,
        'canonicalGoalId': gid, 'fullCurrentTitle': current[gid]['title'],
        'currentRoutineMustRemainPreserved': True,
        'locator': locators[gid],
        'candidateKind': locators[gid]['nextCandidateStatus'],
        'proposedNextWork': 'Read the actual primary span and operator/course boundary independently, then decide an explicitly bounded component or declared authored specialisation; preserve original source obligations and unresolved whole-goal/source debt.',
        'noNewExtractionOrMappingDecisionCreated': True,
        'nativeVisibilityRestored': False, 'scientificApproval': False,
        'wholeGoalClosure': False, 'wholeSourceClosure': False,
    })

by_text_path = DAY / 'biologie-q2-neurobiology-twenty-one-current-independent-b-v1/source-inspection/BY13-EA.actual.txt'
by_text = by_text_path.read_text()
by_extraction_path = ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
by_goals = {x['id']: x for x in read(by_extraction_path)['sourceGoals']}
for gid, by_id, pointer, limit in [
    (IDS[1], '0a6b6a3f-47a1-5a90-bc23-75417cfecdd6', 'B13-EA Lernbereich 2: receptor-potential competence and contents: primary/secondary sense cell, eye transduction, optical phenomena', 'Retain particle-level receptor/eye and sensory-phenomenon application. Do not infer mandatory frequency/place/population-code completeness.'),
    (IDS[3], '8832a55d-988a-5848-81d4-1dc529f7b6e9', 'B13-EA Lernbereich 2: depression competence and contents: monoamine hypothesis, vulnerability-stress model, serotonin reuptake inhibitors', 'Serotonin treatment is one bounded component. Preserve depression symptoms, multifactorial model, clinical and social duties; do not turn this into full dopamine/serotonin-systems support.'),
    (IDS[6], '1ab76608-e31b-5f03-822a-962c02ee922d', 'B13-EA/B13-GA Lernbereich 2: derive substance influence on excitatory chemical synaptic information transfer', 'Preserve the derive-from-processes operator; no general two-mode synapse or all psychoactive-mechanism whole duty follows.'),
]:
    drafts.append({
        'draftCandidateId': 'next-bounded-by-' + gid, 'canonicalGoalId': gid,
        'fullCurrentTitle': current[gid]['title'], 'sourceGoal': by_goals[by_id],
        'primaryUrl': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht',
        'pointer': pointer, 'physicalAndPrintedPage': None,
        'locatorsAreSourcePositionsNotOfficialNumberedBullets': True,
        'previousOfficialHTMLTextSnapshot': rel(by_text_path),
        'snapshotSha256': sha(by_text_path), 'extractionSha256': sha(by_extraction_path),
        'retainedLimit': limit, 'candidateStatus': 'PREPARED_LOCATOR_ONLY_INDEPENDENT_COMPONENT_REVIEW_REQUIRED',
        'freshOfficialRetrievalInThisTechnicalTask': False,
        'nativeVisibilityRestored': False, 'scientificApproval': False,
        'wholeGoalClosure': False, 'wholeSourceClosure': False,
    })
assert 'Therapie durch Serotonin-Wiederaufnahmehemmer' in by_text
write('next-bounded-component-and-specialisation-candidates.preparation-only.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'status': 'DESCRIPTIVE_NEXT_LOCATORS_ONLY_NO_NEW_SCIENCE_OR_MAPPING_DECISIONS',
    'drafts': drafts, 'newScientificReview': False, 'newSourceComponentDecisions': 0,
    'activeWrites': False, 'integrationApproved': False,
})

extra = [receipt_path, current_path, he_path, by_text_path, by_extraction_path,
         AUTHOR / 'he43.original-ten.actual.migration-and-preservation.json',
         AUTHOR / 'source71.actual.open-debt.json',
         AUTHOR / 'author-primary-reading.actual.receipt.json']
guard = read(OUT / 'actual-current-inputs-and-protected74-127-807-478.guard.json')
checks = []
for binding in guard['inputBindings']:
    p = ROOT / binding['path']
    actual = sha(p)
    checks.append({'path': binding['path'], 'expectedSha256': binding['sha256'], 'actualSha256': actual, 'exact': actual == binding['sha256']})
assert all(x['exact'] for x in checks), 'input drift after completed native probe'
receipt_inputs = []
for scope in receipt['scopes']:
    for index in scope['witnessGroupRefs']:
        group = receipt['witnessGroups'][index]
        if not (set(group['goalIds']) & set(IDS)):
            continue
        for key in ['mappingInput', 'extractionInput']:
            b = receipt['inputBindings'][group[key]]
            actual = sha(ROOT / b['path'])
            receipt_inputs.append({'path': b['path'], 'receiptSha256': b['sha256'], 'actualSha256': actual, 'exact': actual == b['sha256']})
unique_receipt_inputs = list({x['path']: x for x in receipt_inputs}.values())
assert all(x['exact'] for x in unique_receipt_inputs), 'stored baseline witness receipt no longer matches actual inputs'
write('final-local-reading-and-unchanged-inputs.actual.receipt.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'actualOriginal1241InputsRechecked': checks,
    'allOriginal1241Exact': True,
    'additionalActuallyReadInputBindings': [{'path': rel(p), 'sha256': sha(p)} for p in extra],
    'storedBaselineMissingEightWitnessInputsActuallyRechecked': unique_receipt_inputs,
    'allStoredBaselineWitnessInputsCurrentExact': True,
    'actualLocalPDFTextCommand': ['pdftotext', '-f', '43', '-l', '43', '-layout', rel(he_path), '-'],
    'HE43AndQ24SamePageTextActuallyRead': True,
    'PDFRasterViewInThisTechnicalTask': False,
    'freshOfficialRetrievalInThisTechnicalTask': False,
    'previousHHIndependentBReviewUnchanged': True,
    'importedTHHHScienceDecisionsAreHistoricalCompletedAAndB': True,
    'newScientificReview': False, 'activeWrites': False, 'integrationApproved': False,
})

lines = ['# Acht tatsächlich fehlende aktuelle Quellenatlas-Ziele', '',
         'Stand: 390 aktuelle atomare Ziele; vollständiger HOLD+40-Quellenatlas 382. Alle acht bleiben Source HOLD. Die erhaltenen bisherigen HE-„Q2.3.x“-Zeugen sind Zielparaphrasen, keine amtlichen Einzelbullets. Die folgenden nächsten Primärstellen sind begrenzte Locator-Kandidaten, keine neue fachliche Freigabe.', '',
         'HE-Locators: amtliches PDF, physische und gedruckte Seite 43; Q2.3 und Q2.4 stehen auf derselben Seite. GK/LK bezeichnet die dortige gemeinsame grundlegende Ebene. LK-Anker gelten nur zusätzlich im Leistungskurs.', '']
for r in records:
    gid = r['goalId']; prev = r['previousAuthoredHEWitness']; loc = r['nextExactPrimaryLocator']
    lines.extend([
        f"## {r['fullCurrentTitle']}", '', f"`{gid}`", '',
        f"- Aktuelles ganzes Ziel: {current[gid]['description']}",
        f"- Bisheriger HE-Zeuge: `{prev['oldSourceGoalId']}`, etikettiert `{prev['previousSourceGoal']['sourceSpan']}`; `isOfficialBullet=false`.",
        f"- Nächste exakte Primärstelle: Seite 43, {loc['componentKeyIsAuthorLocatorNotOfficialBulletNumber']} ({loc['courseProfile']}): {loc['originalText']}.",
        f"- Grenze: {loc['retainedLimit']}",
        f"- Status: {loc['nextCandidateStatus']}; ganze Quellen-/Zielabdeckung offen.", '',
    ])
lines.extend(['## Weitere erhaltene Zeugen und nächste Teilaufgaben', '',
              'Das JSON-Einzelblatt enthält die vollständig dekodierten vorherigen Landeszeugen, ihre tatsächlichen Mapping-/Extraction-Pfade und erhaltenen Schuldobjekte. Bei Synaptischer Übertragung betrifft dies zusätzlich BB, BE, BY, HH, MV, NW, RP, SH, SN, ST und TH. Keiner dieser Makro- oder Chemiesynapsen-Zeugen schließt im Kandidaten die volle chemische UND elektrische Routine.', '',
              'Die vorbereiteten BY-Locators begrenzen Rezeptor-/Augentransduktion, Serotonin-Wiederaufnahmehemmer innerhalb der vollständigen Depressionskompetenz sowie das Ableiten von Stoffeinwirkungen auf erregende chemische Synapsen. Sie enthalten keine neue Mappingentscheidung.', '',
              'Alle bisherigen Source-HOLDs und Partnerpflichten bleiben erhalten. Keine Tier-, Atmungs-, Kreislauf- oder Sinnesorgan-Unteransprüche werden aus allgemeineren Aussagen erfunden.', ''])
(OUT / 'eight-current-omitted-goals-and-next-primary-locators.md').write_text('\n'.join(lines))
print(json.dumps({'status': 'FINAL_LOCAL_HANDOFF_PREPARED', 'missingCurrentGoalIds': IDS, 'allOriginal1241InputsExact': True, 'draftLocatorsOnly': len(drafts), 'nativeRuns': 0, 'activeWrites': False}))
