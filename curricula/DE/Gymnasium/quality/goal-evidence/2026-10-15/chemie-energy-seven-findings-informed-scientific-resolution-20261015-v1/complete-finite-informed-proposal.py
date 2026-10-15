from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil

REPO = Path('/home/enpasos/projects/skillpilot')
E15 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
OWN = Path(__file__).resolve().parent
V3 = E15 / 'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'
AUTHOR = E15 / 'chemie-energy-detergents20-current422-whole-material-author-20261015-v1'
BRO = E15 / 'chemie-energy20-successor-current422-native-fresh-independent-b-20261015-v1'
CRO = E15 / 'chemie-energy20-final-current422-native-fresh-independent-c-20261015-v1'
FIRST = OWN / 'FIRST.original-informed-scientific-resolution-seven-plus-alt.json'


def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def art(path):
    return {'path': str(path.resolve()), 'sha256': sha(path), 'bytes': path.stat().st_size}


def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert sha(FIRST) == 'sha256:42250d5d24658031f470a3cca74f48a17ca71b4a898b1b74e96ac205974ac18d'
science = json.loads(FIRST.read_text())
now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
write(OWN / 'FIRST.original-informed.scientific.seal.json', {
    'schemaVersion': 1, 'sealedAt': now, 'role': 'Original informed scientific proposal; no blind vote',
    'files': [art(FIRST)], 'blindToOtherRuns': False, 'newD': 0, 'newPAMV': 0,
})
ids7 = [r['goalId'] for r in science['sevenFindings']]
extra_id = science['eighthAltContextFinding']['goalId']
ids8 = ids7 + [extra_id]
whole = json.loads((V3 / 'candidate/twenty-whole-current560-goals.exact.json').read_text())
goals = {g['id']: g for g in whole['goals']}
cases = json.loads((V3 / 'materials/forty-two-whole-DE-EN-cases.exact-no-change.json').read_text())['cases']
profiles = [json.loads(line) for line in (V3 / 'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl').read_text().splitlines()]
inputs = OWN / 'inputs-readonly'
write(inputs / 'eight-whole-current-goals.exact.json', {'goalIds': ids8, 'goals': [goals[g] for g in ids8]})
write(inputs / 'sixteen-whole-DE-EN-cases.exact.json', {'cases': [c for c in cases if c['goalId'] in ids8]})
write(inputs / 'eight-whole-E0G0-profiles.exact.json', {'profiles': [p for p in profiles if p['goalId'] in ids8]})
canon = json.loads((V3 / 'candidate/canonical560.current422.only-a338-altText.corrected.json').read_text())
prereq_ids = sorted(set(gid for gid8 in ids8 for gid in goals[gid8]['requires']))
write(inputs / 'whole-direct-prerequisite-bodies.exact.json', {'goals': [g for g in canon['goals'] if g['id'] in prereq_ids]})
for name in ['primary-HE.whole-pages.exact-text.json', 'primary-BY.whole-related-structured-units-and-children.json', 'primary-HB.whole-pages.exact-text.json']:
    target = inputs / name
    assert not target.exists()
    shutil.copyfile(AUTHOR / 'sources' / name, target)
source_pack = json.loads((AUTHOR / 'sources/all-direct-current-source-cells-partner-unions-whole-passages.json').read_text())
selected_lanes = []
source_counts = {gid: 0 for gid in ids8}
empty_count = 0
for lane in source_pack['sources']:
    selected_cells = []
    for cell in lane['wholeExactDirectCellsAndPartnerUnions']:
        present = {g['id'] for g in cell['wholePartnerGoalBodies']} & set(ids8)
        if present:
            selected_cells.append(cell)
            for gid in present:
                source_counts[gid] += 1
            empty_count += sum(not p.get('rawText') for p in cell['wholeRelevantPassages'])
    if selected_cells:
        selected_lanes.append({**{k: v for k, v in lane.items() if k != 'wholeExactDirectCellsAndPartnerUnions'}, 'wholeExactDirectCellsAndPartnerUnions': selected_cells})
write(inputs / 'all-eight-source-cell-unions-and-whole-passages.exact.json', {
    'role': 'Exact current source/partner context extraction; mappings are assertions, not fresh national/course approval',
    'sources': selected_lanes,
})
normal_input = json.loads((V3 / 'native-twenty/round-b/description-review-input.json').read_text())
current_bindings = {g['goalId']: g for g in normal_input['goals']}
native = json.loads((V3 / 'native-twenty/bundle/book-model.json').read_text())
native_pages = {p['goalId']: p for p in native['pages']}
cards = []
for deck in (REPO / 'curricula/DE/Gymnasium/memory-decks').glob('*chemistry*.json'):
    d = json.loads(deck.read_text())
    for card in d.get('cards', []):
        if {t[5:] for t in card.get('tags', []) if t.startswith('goal:')} & set(ids8):
            cards.append({'deck': art(deck), 'deckId': d['deckId'], 'card': card})
m_path = E15 / 'chemie-bw-lk-six-card-corrections-targeted-independent-20261015-v1/records/M422.original416-plus-six-new.review.jsonl'
m_rows = [json.loads(line) for line in m_path.read_text().splitlines() if json.loads(line).get('goalId') in ids8]
write(inputs / 'existing-memory-contexts-and-cards.exact.json', {
    'role': 'Existing M rows/cards for context and impact only; no inherited or fresh M verdict',
    'originalMFile': art(m_path), 'rows': m_rows, 'cards': cards,
})
holds_path = E15 / 'chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/HOLDS.original-all-plus-six-M-text-stales.author-successor.json'
holds = json.loads(holds_path.read_text())
shutil.copyfile(holds_path, inputs / 'all-existing-holds.exact.json')
description_patches = []
alt_patches = []
contexts = []
current_notes = []
image_sources = []
for row in science['sevenFindings']:
    gid = row['goalId']
    if row['descriptionChangeRecommended']:
        g = goals[gid]
        description_patches.append({'goalId': gid, 'fields': [
            {'field': 'description', 'before': g['description'], 'after': row['recommendedAfter']['descriptionDe']},
            {'field': 'descriptionEn', 'before': g['descriptionEn'], 'after': row['recommendedAfter']['descriptionEn']},
        ], 'scientificBasis': row['ownScientificReason']})
        after_alt = 'Didaktische Visualisierung zum Lernziel "' + g['title'] + '". ' + row['recommendedAfter']['descriptionDe']
        alt_patches.append({'goalId': gid, 'field': 'resourceLinks[0].altText', 'before': g['resourceLinks'][0]['altText'], 'after': after_alt, 'purpose': 'Current metadata follows the same existing scientific goal with a clearer operator; image bytes and historical prompt remain unchanged'})
alt_patches.append({'goalId': extra_id, 'field': 'resourceLinks[0].altText', 'before': science['eighthAltContextFinding']['beforeAltText'], 'after': science['eighthAltContextFinding']['recommendedAfterAltText'], 'purpose': 'Remove actual reaction/formulation method mismatch; declare independent numerical examples'})
changed_ids = {p['goalId'] for p in description_patches}
alt_ids = {p['goalId'] for p in alt_patches}
for gid in ids8:
    g = goals[gid]
    prompt = REPO / 'curricula/DE/Gymnasium/visualizations/chemie' / gid / 'prompt.de.md'
    image = REPO / 'curricula/DE/Gymnasium/visualizations/chemie' / gid / (gid + '.jpg')
    public = REPO / 'app/public/assets/goal-visualizations/chemie' / gid / (gid + '.jpg')
    assert image.read_bytes() == public.read_bytes()
    assert sha(image) == native_pages[gid]['visualization']['originalDigest']
    image_sources += [art(image), art(public), art(prompt)]
    gid_cases = [c for c in cases if c['goalId'] == gid]
    p = next(p for p in profiles if p['goalId'] == gid)
    for c in gid_cases:
        brief = next(x for x in p['profile']['applicationCaseBriefs'] if x['id'] == c['id'])
        assert brief['taskDemandDe'].endswith(c['taskDe'])
        assert brief['taskDemandEn'].endswith(c['taskEn'])
        assert brief['expectedPerformanceDe'] == c['workedReasoningDe']
        assert brief['expectedPerformanceEn'] == c['workedReasoningEn']
        assert brief['understandingFocusDe'] == c['freshIndependentTransferDe']
        assert brief['understandingFocusEn'] == c['freshIndependentTransferEn']
    contexts.append({
        'goalId': gid, 'wholeGoalSnapshot': str(inputs / 'eight-whole-current-goals.exact.json'),
        'caseIds': [c['id'] for c in gid_cases],
        'caseTasksDataSolutionsTransferRubricsProposedChanges': 0,
        'profileRule': 'All e1-e3,positive evidence,required coverage,variation,transfer and future research/performance remain exactly the same; E0/G0 is not a P acceptance',
        'innerProfileProposedChanges': 0,
        'rawProfileInputBindingImpactIfAdopted': 'Recompute exact reviewInputFingerprint for the actually changed whole-goal/page context, without changing scientific profile body or inheriting P acceptance' if gid in alt_ids else 'No proposed current description/ALT change for this goal',
        'currentBinding': {k: current_bindings[gid][k] for k in ['goalFingerprint', 'pageFingerprint']},
        'currentProfileFingerprint': p['profileFingerprint'],
        'imageAndPrompt': {'image': art(image), 'publicAsset': art(public), 'historicalPrompt': art(prompt), 'bytesChanged': False, 'newVVote': False},
        'vContextImpactIfAdopted': 'Exact final description/ALT/current-note context needs actual targeted independent V evaluation; do not copy a previous positive result' if gid in alt_ids else 'Current v3 description/ALT/pixel context stays exact in this proposal; no new V result',
        'mContext': {
            'existingRow': next(m for m in m_rows if m['goalId'] == gid),
            'matchingCardIds': [c['card']['id'] for c in cards if 'goal:' + gid in c['card'].get('tags', [])],
            'alreadyInSixTextStales': gid in holds['sixCurrentMTextStales'],
            'prospectiveTextStaleIfAdoptedAgainstLatestRootReportedCurrentV3M': gid in changed_ids,
            'latestRootReportedCurrentV3MStatus': 'Root reports actual whole422 and all10 views PASS after real M6 repair and two historical deck-input repairs; this informed D task does not generate or independently reapprove that M evidence',
            'altOnlyChangesAffectMemoryGoalTextFingerprint': False,
            'requiredFutureAction': 'Actual scientific M context re-evaluation where required by the changed goal text; no write-fingerprints, no automatic renewal, no card invention from an explanatory goal',
        },
        'sourceCellReferences': source_counts[gid],
    })
    if gid in alt_ids:
        patch = next(a for a in alt_patches if a['goalId'] == gid)
        description = next((a['fields'][0]['after'] for a in description_patches if a['goalId'] == gid), g['description'])
        note = {
            'goalId': gid, 'status': 'PROPOSAL FOR FUTURE AUTHOR ADOPTION; not current/frozen candidate content', 'preparedAt': now,
            'historicalPrompt': art(prompt), 'imageBytesToRetain': art(image),
            'proposedCurrentDescriptionDe': description, 'proposedCurrentAltText': patch['after'],
            'currentContextExplanation': science['eighthAltContextFinding']['datedContextRequirements'] if gid == extra_id else [
                'Historical prompt and image bytes remain their actual generation provenance.',
                'The current note states the revised public operator without pretending that the historical image was generated from the successor wording.',
                'The existing cases and positive-understanding profile supply explanation,application and transfer. An image alone does not demonstrate mastery.',
                'Targeted independent evaluation must use the actual successor whole goal,ALT,pixels and current note together.',
            ],
            'newVVote': False, 'humanApproval': False,
        }
        current_notes.append(note)
write(OWN / 'CONTEXT.all-eight-cases-profiles-V-M-and-sources.json', {'schemaVersion': 1, 'informed': True, 'contexts': contexts, 'imageOrPromptBytesChanged': 0, 'newPAMV': 0})
write(OWN / 'PROPOSAL.four-dated-current-context-notes.json', {'schemaVersion': 1, 'notes': current_notes, 'candidateChanged': False})
new_stales = [gid for gid in ids8 if gid in changed_ids]
plan = {
    'schemaVersion': 1, 'role': 'Final minimum implementation proposal after actual context-radius analysis; no candidate mutation',
    'preparedAt': now, 'informedScience': art(FIRST), 'blindToOtherRuns': False,
    'descriptionChanges': description_patches, 'currentAltChanges': alt_patches,
    'dateCurrentContextNotes': str(OWN / 'PROPOSAL.four-dated-current-context-notes.json'),
    'requiredCaseBodyChangesForTheSevenDResolutions': [], 'requiredInnerProfileBodyChangesForTheSevenDResolutions': [],
    'optionalTargetedPDesignFollowupsFromTheOriginalProposal': [
        {'caseId': 'energy20-02-a', 'goalId': '16b24dc5-0e48-5e3b-8307-01289db8d1a9', 'change': 'In a separate complete case successor, replace Beschreibe Laden/Entladen by Erläutere Laden/Entladen in taskDe and Describe charging/discharging by Explain charging/discharging in taskEn; mirror only this case task in this goal applicationCaseBrief. Explanation was already scientifically required; this aligns the visible verb without adding content.'},
        {'caseId': 'energy20-05-b', 'goalId': '7a5a8e37-7078-5974-a4d8-edf7d4cbbfc3', 'change': 'In a separate complete case successor, align e1 with the existing kinetic-operating-limit versus redox explanation and e2 with the existing48kWh/200km calculation. Exchange the two rubric observableDe/En pairs and align only the corresponding05b e1/e2 references in this goal profile; keep task,data,solution,transfer and remaining criteria exact.'},
    ],
    'refinesEarlierImplementationSuggestions': {
        'originalScienceUnchanged': True,
        'originalFirstSuggested02aVerbAnd05bCriterionAlignment': True,
        'finalPlanDistinguishesDRequirementsAndTargetedPDesign': '02a already demands causal explanation through required e1 and its complete worked reasoning. The05b e1/e2 cross-assignment concerns the criterion labels; both scientific performances are already required. Neither creates a missing seventh-findings D competency. The two small design refinements may be implemented as separate complete targeted successors, as authorized by root, without a broad42-case edition.',
        'actualTechnicalRadiusAndBoundedSolution': 'All42 applicationCaseBriefs embed the complete42-case file path/SHA. Do not broadcast a replacement whole-file SHA. For optional02a/05b refinements create two separate complete case successors and update only their actual P briefs/profiles. Preserve the original42-case file and18 other E0 inner profile bodies exactly.',
        '05bLabelAlignmentRemainsVisibleForSeparatePDesignAssessment': True,
    },
    'bindingWorkForFutureActualAuthor': [
        'Apply exactly the six selected description scalar fields and four current ALT scalar fields in one separate successor; do not edit frozen v3.',
        'Keep original42 case bodies exact. If the two optional P design refinements are adopted, bind separate complete02a/05b successors only to their own briefs and preserve18 other inner profiles; do not broadcast a whole42-file SHA. Otherwise keep all20 inner profiles exact. Update actual raw input bindings without fabricating profile approval.',
        'Add four truthful dated current context notes, retaining historical prompts and image bytes.',
        'Rebuild actual affected native contexts once and use required exact final input contracts. Do not rewrite historical D/P/V/M run artifacts or turn hash transport into science.',
        'Review the actual changed contexts and remaining source/course/atomicity holds scientifically; this proposal supplies no normal D votes or automatic gate clearance.',
    ],
    'historicalSixMTextStalesAtOriginalScienceTime': holds['sixCurrentMTextStales'],
    'latestRootReportedMUpdate': 'Root subsequently reports actual current-v3 M6 repair, whole422 and all10 views PASS, with the two absent historical deck inputs of the Minihost actually repaired. No source/course approval follows. This task has not opened that separate new M evidence and supplies no M vote.',
    'prospectiveThreeMTextStalesIfDescriptionsAdoptedAgainstThatCurrentM': new_stales,
    'expectedProspectiveMTextStaleCountAgainstLatestReportedCurrentV3': len(new_stales),
    'separateCInformedPAWork': 'Root reports actual scientific22 complete case successors for11 C-KEEP goals, covering glucose structure,three-class surfactant core,expectation alignment,comparable energy data and15-degree washing conditions. That separate P/A work is legitimate and was not read or judged by this seven-D-findings task. The minimal-verb discussion here refers only to this tasks own02a suggestion, not to those substantive C material repairs.',
    'memoryFingerprintSource': {'path': str(REPO / 'app/scripts/memoryCardReview.ts'), 'fields': 'ruleVersion,id,shortKey,title,titleEn,description,descriptionEn,phase,area,topicCode,nodeKind; no resourceLink/altText'},
    'candidateWritten': False, 'imageByteChanges': 0, 'historicalPromptChanges': 0,
    'newD': 0, 'newP': 0, 'newA': 0, 'newM': 0, 'newV': 0, 'newStrict': 0,
}
write(OWN / 'PROPOSAL.final-minimum-one-author-batch.json', plan)
protected = [FIRST, BRO / 'FILES.finite-independent-b.seal.json', BRO / 'NEUTRAL.final-native20-v3-independent-b.json', CRO / 'FIRST.original-independent-scientific-judgments20.json', CRO / 'FIRST.original.seal.json']
assert sha(BRO / 'FILES.finite-independent-b.seal.json') == 'sha256:aca09df3cc1a66977cc46b96827d79afca137264c64e88bb3eb8d6edca244999'
assert sha(BRO / 'NEUTRAL.final-native20-v3-independent-b.json') == 'sha256:23de72d2d2381bca4ff9fbab107324d37f9a051ac1a4794ff513a3db68594c2d'
v3_seal = V3 / 'FILES.finite-alt-author-native-preparation.seal.json'
assert sha(v3_seal) == 'sha256:f739e9d80555c5c9421078249593be7ae963448668949523e7b489a3a7a99d77'
seal = json.loads(v3_seal.read_text())
for item in seal['files']:
    p = REPO / item['path']
    assert sha(p) == item['sha256'], p
    assert p.stat().st_size == item['bytes'], p
selector = json.loads((V3 / 'INPUTS.final-native20-v3.physical-selector.json').read_text())
for item in selector['scientificReviewInputs']:
    assert sha(REPO / item['path']) == item['sha256']
write(OWN / 'CHECK.actual-scope-bindings-and-input-closure.json', {
    'checkedAt': now, 'informedNotBlind': True,
    'sevenCFindingsReviewed': len(ids7), 'additionalCurrentAltFinding': 1,
    'wholeAffectedGoals': len(ids8), 'wholeAffectedCasesReread': 16, 'wholeAffectedProfilesWithExactDuplicateCaseFieldsVerified': 8,
    'directPrerequisiteBodiesSnapshot': len(prereq_ids),
    'earlierFullScientificReadingRetained': 'Same reviewer earlier actually read20whole goals,42cases,20profiles,69prerequisites,151cells/22lanes and106partners; exact files were verified unchanged. This new task reread8whole goals,16whole cases,8profile expectation/coverage/variation bodies,complete relevant HE/BY/HB primary blocks and targeted current/historical image contexts. It does not claim a second new whole-national-source reading.',
    'snapshotSourceLanes': len(selected_lanes), 'snapshotUniqueCells': sum(len(l['wholeExactDirectCellsAndPartnerUnions']) for l in selected_lanes),
    'snapshotEmptyPassages': empty_count, 'emptyRawTextCountsAsFullPrimaryReading': False,
    'descriptionsProposed': len(description_patches), 'altsProposed': len(alt_patches),
    'caseAndProfileBodiesProposedChanges': 0,
    'unchangedAll65V3SealedFiles': True, 'unchanged19ScientificSelectorFiles': True,
    'protectedArtifacts': [art(p) for p in protected],
    'wholeImageAndHistoricalPromptInputs': image_sources,
    'noFrozenOrCentralWrites': True, 'newOrdinaryDRecordsOrRunManifests': 0,
})
report = '''# Informierte wissenschaftliche Auflösung

Dies ist ein Vorschlag nach ausdrücklich erlaubter Einsicht in C FIRST. Das frühere B-Siegel bleibt unverändert. Es entsteht keine weitere Blindstimme und kein neuer D/P/A/M/V-Nachweis.

| C-Befund | Auflösung | Endgültiger Vorschlag |
|---|---|---|
| ecce: H2/O2 und Einsatzbezug | Im direkten Prärequisit, erforderlichen Profil und beiden Fällen eindeutig | Beschreibung unverändert |
| 16b: beschreiben statt erläutern | Explizite BY-Operatorverteilung ist im kurzen Text unklar; Erklärungsleistung im Material vorhanden | Bauprinzip beschreiben, Funktion/Energetik erläutern |
| 7a5: Funktionsweise | Gesamtpfad deckt sie bereits ab; lokale Aufbau-Bewertung benennt den angewandten Operator unklar | Aufbau/Funktion erklären, Fahrzeugeinsatz bewerten |
| a338: Aktivitätswirkung begründen | In e1-e3 und12a/b bereits ausdrücklich verpflichtend | Beschreibung und v3-ALT unverändert |
| 3ec: System-/Nutzengrenzen | Definition und Pflichtkriterien sowie13a/b machen sie konkret | Beschreibung unverändert |
| e20: Bezugsgröße/Systemrand | e1-e3 und14a/b enthalten sie ausdrücklich; Klimabilanz bleibt begrenzt | Beschreibung unverändert |
| 551: reflektieren | Die Leistung ist vorhanden; die kurze Beschreibung kann das beobachtbare Abwägen deutlicher benennen | Dieselben drei Aspekte anhand ausgewählter Kriterien abwägen |
| ebfa: alter ALT | Echter Widerspruch zur korrigierten Synthese-/Formulierungsgrenze | ALT und datierten Kontext korrigieren, JPG-Bytes erhalten |

Die vollständigen before/after-Fassungen und Quellenbegründungen stehen in FIRST; der endgültige minimale Änderungsplan steht in PROPOSAL.final-minimum-one-author-batch.json. Er enthält drei DE/EN-Beschreibungsänderungen, vier aktuelle ALT-Änderungen und vier datierte Kontextnotizen. Die vorgeschlagenen Waschmittelwörter vermeiden ein zusätzliches vollständiges Lebensphasenraster.

Die spätere Radiusanalyse präzisiert die erste Implementierungsidee: Die Original42 bleiben exakt. Die bereits erforderlichen Erklärungen erfüllen die D-Leistung. Optionale02a-Verb- und05b-Kriterienpräzisierungen können als zwei vollständige gezielte Fallnachfolger allein an deren eigene P-Briefs gebunden werden;18 andere innere Profile bleiben exakt. Ein Ganz42-SHA-Broadcast ist nicht erforderlich. Dies betrifft ausschließlich die zwei eigenen kleinen Vorschläge. Roots berichtete separate wissenschaftliche22-Fall-P/A-Nachfolger von C für11 KEEP-Ziele sind damit weder verworfen noch als Verbkosmetik beurteilt.

Alle acht betroffenen Fall-/Profil-/V-/M-Kontexte sind vollständig aufgelistet. Nach der ursprünglichen FIRST meldete Root eine tatsächliche current-v3-M6-Reparatur mit whole422 und allen10 Sichten PASS; dieses separate neue M-Paket wurde hier nicht erneut beurteilt. Gegen diesen gemeldeten aktuellen Stand würden die drei vorgeschlagenen Beschreibungsänderungen drei neue Text-Stales erzeugen (16b,7a5,551). Die frühere Sechserliste bleibt als Historie sichtbar. Historische Prompts und JPGs werden nicht geändert. Ein neuer aktueller V-Kontext braucht eine tatsächliche unabhängige Prüfung.

e64, c21 und0773 sowie sämtliche Quellen-/Kurs-/Auswahl- und übrigen Gate-Holds bleiben bestehen. Leere Protokolle und fiktive Daten sind keine ausgeführten Lernenden- oder Laborleistungen. Echte spätere Recherche-/Praxisleistungen bleiben Erwerbskriterien; menschliche Erprobung wird nicht zum maschinellen M7-Prärequisit.

Die zusätzliche Metrikabgrenzung ist mit den aktuellen vollständigen20a/b-Fällen und [ACS Green Chemistry and Engineering Metrics](https://www.acs.org/green-chemistry-sustainability/research-innovation/engineerings-metrics.html) abgeglichen. Atomökonomie gehört zur idealen Reaktions-/Synthesebetrachtung; einzelne Massenkennzahlen belegen keine vollständige Umweltverträglichkeit.
'''
(OWN / 'RESOLUTION.informed-scientific-summary.md').write_text(report)
neutral_path = OWN / 'NEUTRAL.finite-seven-informed-resolution-plus-ebfa-alt.json'
write(neutral_path, {
    'schemaVersion': 1, 'role': 'Finite informed scientific resolution proposal for seven C findings plus one actual current ALT defect; STOP',
    'completedAt': now, 'blindToOtherRuns': False,
    'originalInformedScience': art(FIRST), 'originalScienceSeal': art(OWN / 'FIRST.original-informed.scientific.seal.json'),
    'finalMinimumAuthorProposal': art(OWN / 'PROPOSAL.final-minimum-one-author-batch.json'),
    'allEightContexts': art(OWN / 'CONTEXT.all-eight-cases-profiles-V-M-and-sources.json'),
    'fourCurrentContextNoteProposals': art(OWN / 'PROPOSAL.four-dated-current-context-notes.json'),
    'actualClosure': art(OWN / 'CHECK.actual-scope-bindings-and-input-closure.json'),
    'readableSummary': art(OWN / 'RESOLUTION.informed-scientific-summary.md'),
    'sourceFrozenV3Selector': art(V3 / 'INPUTS.final-native20-v3.physical-selector.json'),
    'oldBFinalSealUnchanged': art(BRO / 'FILES.finite-independent-b.seal.json'),
    'counts': {'CFindings': 7, 'boundedDescriptionProposals': 3, 'existingContextSatisfiedNoDescriptionChange': 4, 'additionalAltDefect': 1, 'totalCurrentAltProposals': 4, 'imageByteChanges': 0, 'caseBodyChangesProposed': 0, 'innerProfileBodyChangesProposed': 0},
    'holds': ['e64 GK/LK course conflict','c21 independent-content atomicity','0773 exact-source/optional selection and absent image','all national source/course/partner/selection holds and56 empty rawText passages'],
    'latestSeparateRootUpdates': {'currentV3M': plan['latestRootReportedMUpdate'], 'CScientificPA': plan['separateCInformedPAWork']},
    'case05bCriterionLabelConcernIsNotSilentlyWaived': True,
    'candidateWritten': False, 'frozenV3Changed': False,
    'newD': 0, 'newP': 0, 'newA': 0, 'newM': 0, 'newV': 0, 'newStrict': 0,
    'centralExecuted': False, 'activeIntegration': False, 'humanApproval': False, 'humanTrial': False, 'M7': False, 'STOP': True,
})
finite_path = OWN / 'FILES.finite-informed-scientific-resolution.seal.json'
files = [art(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != finite_path]
write(finite_path, {
    'schemaVersion': 1, 'role': 'Finite informed proposal seal;self excluded;STOP', 'sealedAt': now,
    'neutral': art(neutral_path), 'payloadFiles': len(files), 'payloadBytes': sum(p['bytes'] for p in files), 'files': files,
    'blindToOtherRuns': False, 'candidateWritten': False, 'newD': 0, 'newPAMV': 0, 'newStrict': 0,
    'frozenV3Unchanged': True, 'oldBSealUnchanged': True, 'centralExecuted': False, 'activeIntegration': False,
    'humanApproval': False, 'humanTrial': False, 'M7': False, 'STOP': True,
})
for file in files:
    assert sha(Path(file['path'])) == file['sha256']
print(json.dumps({'neutral': art(neutral_path), 'seal': art(finite_path), 'counts': json.loads(neutral_path.read_text())['counts'], 'files': len(files), 'STOP': True}, ensure_ascii=False))
