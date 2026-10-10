# SPDX-License-Identifier: Apache-2.0
"""Serialize this reviewer's actual independent scientific/context judgments."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'chemie-q3-three-BW-practical-terminal-route-author-candidate-v1'
C = AUTHOR / 'native/three-current-route-context/round-b'
campaign = json.loads((C / 'description-review-campaign.json').read_text())
inputs = json.loads((C / 'description-review-input.json').read_text())
bundle = json.loads((C / 'review-bundle-manifest.json').read_text())
run_id = 'chemie-three-BW-practical-terminal-native-independent-b-20261010-v1'
batch = campaign['batches'][0]
ROOT = OWN.parents[6]
def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()
def bound(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'bytes': path.stat().st_size}

# These are goal-specific manual judgments after reading all current full
# descriptions, original cases, new whole bilingual tasks and actual pages.
evidence = [
    {
        'essentialUnderstandingDe': 'Eine einzelne Konzentrationsänderung kann die Lage eines homogenen Gleichgewichts verändern; Beobachtung, optische Verdünnung und vereinfachte Q-/Le-Chatelier-Deutung bleiben getrennt. Bei unveränderter Temperatur wird K nicht durch die Zugabe geändert.',
        'essentialUnderstandingEn': 'A single concentration change can alter the position of a homogeneous equilibrium; observation, optical dilution and the simplified Q/Le Chatelier interpretation remain distinct. At unchanged temperature the addition does not change K.',
        'observablePerformanceDe': 'Die lernende Person führt den vorgegebenen sicheren Ein-Faktor-Vergleich tatsächlich durch, protokolliert eigene Referenz-, Carrier- und Variationsbeobachtungen samt passenden Blindwerten und begründet die Verschiebung einschließlich Modellgrenzen.',
        'observablePerformanceEn': 'The learner actually performs the specified safe single-factor comparison, records their own reference, carrier and variation observations with suitable blanks, and justifies the shift while stating model limits.',
        'transferExpectationDe': 'Bei einer frischen reinen Carrier-Verdünnung trennt die lernende Person die sofortige optische Verdünnung von einer möglichen chemischen Verschiebung und erklärt, welche kontrollierten Vergleichsbeobachtungen zur Unterscheidung nötig sind.',
        'transferExpectationEn': 'For a fresh carrier-only dilution the learner distinguishes immediate optical dilution from a possible chemical shift and explains which controlled comparison observations are needed to distinguish them.',
    },
    {
        'essentialUnderstandingDe': 'Im reversiblen Austauschmodell können ungleiche Mengen bei weiterhin positiven annähernd gleichen Transfers stationär werden. Beide Raten beziehen sich auf denselben Rundenanfang; Wassermengen und Transfers sind nur eine begrenzte Analogie chemischer Stoffmengen und Reaktionsraten.',
        'essentialUnderstandingEn': 'In the reversible exchange model unequal amounts can become stationary while approximately equal positive transfers continue. Both rates use the same start of the round; water amounts and transfers are only a limited analogy for chemical amounts and reaction rates.',
        'observablePerformanceDe': 'Die lernende Person führt beide gleichzeitigen Modelltransfers regelgetreu aus, erhebt ein eigenes Zeitprotokoll beider Mengen und Richtungen und erklärt Massenerhaltung, stationäre Mengen und fortbestehenden dynamischen Austausch.',
        'observablePerformanceEn': 'The learner performs both simultaneous model transfers according to the rules, records their own time course of both amounts and directions, and explains conservation, stationary amounts and continuing dynamic exchange.',
        'transferExpectationDe': 'Eine frische Gruppe berechnet den Rücktransfer erst nach der Hinzugabe. Die lernende Person weist selbständig die veränderte Rundenregel nach und begründet die andere Zeitentwicklung und den anderen stationären Mengenanteil.',
        'transferExpectationEn': 'A fresh group computes reverse transfer only after adding the forward amount. The learner independently identifies the changed round rule and justifies the different time course and stationary amount ratio.',
    },
    {
        'essentialUnderstandingDe': 'Eine galvanische Zelle braucht zugehörige Halbzellen und getrennte elektronische und ionische Leitwege. Ein hochohmiges Voltmeter misst die Spannung nur näherungsweise im Leerlauf; Polung, reale Messbedingungen und bedingungsspezifische Referenz sind von Last- und Standardwerten zu unterscheiden.',
        'essentialUnderstandingEn': 'A galvanic cell requires corresponding half-cells and separate electronic and ionic paths. A high-impedance voltmeter measures only an approximate open-circuit voltage; polarity, actual conditions and a condition-specific reference must be distinguished from loaded and standard values.',
        'observablePerformanceDe': 'Die lernende Person baut die vorgegebene Zelle sicher auf, dokumentiert tatsächliche Messung, Polung und Bedingungen, wertet eigene Messwerte mit Streuung aus und begründet den Vergleich mit der ausdrücklich passenden Referenz.',
        'observablePerformanceEn': 'The learner safely assembles the specified cell, documents actual measurement, polarity and conditions, evaluates their own readings with their spread, and justifies comparison with the explicitly suitable reference.',
        'transferExpectationDe': 'Bei einem frischen Vertauschen der Messleitungen erklärt die lernende Person das geänderte Vorzeichen ohne eine Umkehr der chemischen Elektrodenrollen zu behaupten; eine fehlende Brücke oder ein belastetes Messgerät wird als veränderte Messbedingung beurteilt.',
        'transferExpectationEn': 'For a fresh swap of the measuring leads the learner explains the sign change without claiming a reversal of chemical electrode roles; a missing bridge or loaded measuring device is assessed as a changed measurement condition.',
    },
]
rationales = [
    'Die vollständigen aktuellen DE/EN-Texte verlangen genau den kontrollierten experimentellen Konzentrationsvergleich und eine begrenzte Erklärung. Die real angesehenen Original-HTML- und PDF-Seiten verbinden ihn nun mit einem tatsächlichen BW-Praxisendpunkt; das PNG zeigt passende Referenz/Carrier/Fe3+-Variation. Ganze aktuelle Profile und beide Sprachfassungen der Aufgabe/Lösung trennen reale Durchführung, synthetische Beispielwerte, optische Verdünnung und vereinfachte Speziation. SOURCE002 deckt hier nur den Konzentrationsanteil partial ab; Temperatur/Druck oder ganze Kurse werden nicht freigegeben.',
    'Die vollständigen aktuellen DE/EN-Texte sind als regelgetreue Durchführung und Auswertung genau dieses reversiblen Modells klar und atomar. Tatsächliche HTML/PDF-Seite, unverändertes PNG und neuer externer Praxisendpunkt sind kohärent. Ich rekonstruierte alle 13 Runden selbst: stationär etwa A30/B60 bei weiterhin je10mL Transfer. Der neue unabhängige Transfer mit veränderter Reihenfolge prüft eine andere Modellregel; er erweitert die Beschreibung nicht zu echter Reaktionskinetik oder einer experimentell bestimmten chemischen Gleichgewichtskonstante.',
    'Die vollständigen aktuellen DE/EN-Texte passen zum sicheren realen Zellaufbau und der näherungsweisen hochohmigen Leerlaufmessung. Die tatsächlich angesehenen HTML/PDF-Seiten samt unverändertem Zn/Cu-PNG verbinden nun den passenden Praxisendpunkt. Vollständige aktuelle Profile und Aufgaben in beiden Sprachen verlangen überprüfbare Ausführung, eigenes Protokoll und eine bedingungsspezifische statt universeller Standardreferenz. Eigene Rechnung bestätigt Beispielmittelwert/Streuung; vertauschte Leitungen ändern die Bezugsrichtung, nicht die Reaktionsrollen.',
]
records = []
for index, g in enumerate(inputs['goals']):
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': run_id + '.' + g['goalId'], 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn',
                              'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': evidence[index], 'rationale': rationales[index],
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
assert [r['goalId'] for r in records] == batch['goalIds']
results = OWN / 'results'
results.mkdir(exist_ok=True)
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
generation = {'role': 'actual independent targeted whole task science and current native context review',
              'reviewer': '/root/ci_current_run', 'currentPeerJudgmentsRead': False,
              'historicalOwnChemistryAReviewDisclosed': True, 'noSamplingParametersFabricated': True}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex active model; exact version not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(json.dumps(generation, sort_keys=True).encode()).hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [
        {'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': datetime.fromtimestamp((OWN / 'author-actual-final-freeze.independent-verification.json').stat().st_mtime,
                                      timezone.utc).isoformat(),
    'completedAt': datetime.now(timezone.utc).isoformat(), 'status': 'completed', 'outputDigest': sha(record_path),
    'toolchainVersion': 'skillpilot-normal-native-review-v1',
}
run_path = results / (batch['batchId'] + '.run.json')
run_path.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')

task_reviews = [
    {
        'assessmentGoalId': '3259bf7f-4af4-58ae-8190-9aec07ec476f', 'decision': 'KEEP',
        'chemistryJudgment': 'The full DE/EN task, solution and five rubric steps consistently demand the actual supervised matched reference/carrier/Fe3+ variation. Equal added volume, acid matrix, matched blank, constant temperature/path length and observation timing delimit the colour comparison. Within the stated simplified Fe3+ + SCN- ⇌ FeSCN2+ model, Fe3+ addition lowers Q and allows net complex formation at unchanged K. Dilution and Fe3+ optical contribution are addressed; turbidity/temperature/blank faults invalidate the simple inference. A carrier-only fresh dilution is a meaningful chemically and optically changed test, not a number swap.',
        'practicalPerformanceJudgment': 'Own immediate execution record and verifiable setup/dosing/safety are mandatory. Supplied synthetic absorbances cannot satisfy the first two actual-performance criteria; without these, at most 6/10 is possible and passingPoints10 prevents a purely verbal or synthetic-data pass. Actual differing readings are acceptable when honestly analysed with relevant limits.',
        'finiteCheck': 'Carrier-only 0.30×5.00/5.10 = 0.294117647 agrees with rounded0.294. V0.50/0.51/0.51 exceeds matchedK0.294 and does not alone prove a complete real-speciation model.',
        'scope': 'DE-BW SekII concentration practical; GK and LK. SOURCE002 contribution partial only; no temperature/pressure/whole-course release.',
    },
    {
        'assessmentGoalId': 'e6196381-eab5-5a3e-bb6e-56c6e6e3617f', 'decision': 'KEEP',
        'chemistryJudgment': 'Whole DE/EN procedure requires calculating and withdrawing both opposed transfers from the same beginning-of-round amounts before cross-addition. The solution and rubric distinguish conservation, unequal stationary amounts and continuing positive approximately equal transfer rates. Water movement is explicitly a limited analogy, without chemical conversion, true kinetic law or measured chemical K. Continued actual exchange at the plateau is required. The fresh sequential-reverse error changes the model itself and meaningfully tests the distinction.',
        'practicalPerformanceJudgment': 'Learner must really perform the syringe model and supply an independently verifiable own two-direction time protocol. Thirteen supplied ideal rows cannot earn practical credit. Both actual criteria are indispensable to the10/10 pass; finite simulation is supplementary explanation rather than actual practical evidence.',
        'finiteCheck': 'All13 ideal rounds independently reconstructed, conservation90mL every round, maximal printed rounding error below0.00000051mL. Simultaneous stationaryA30/B60, positive10/10mL transfers. Wrong sequential reverse gives first round65/25 and stationary33.75/56.25, so the fresh transfer answer is substantively correct.',
        'scope': 'DE-BW SekII LK only; actual model execution. Not a general source/programme approval or chemical kinetics experiment.',
    },
    {
        'assessmentGoalId': '563f69ed-562f-5544-ab0c-bf0e481928d8', 'decision': 'KEEP',
        'chemistryJudgment': 'Whole DE/EN task and solution specify corresponding Zn/ZnSO4 and Cu/CuSO4 half-cells, compatible ionic bridge, blackZn/redCu polarity, high-impedance DC measurement, stated salt conditions and no external supply/load. Electronic and ionic paths are distinguished. A10MΩ voltmeter draws a small current, so approximate open-circuit is the correct claim. Reference1.100±0.025V is explicitly supplied for these conditions;0.100M solutions are not silently treated as standard unit activity. Lead reversal changes sign but not chemical electrode roles.',
        'practicalPerformanceJudgment': 'Actual safe assembly, own verified voltage/polarity/conditions record and appropriate waste handling are mandatory. A synthetic voltage list cannot earn the first two practice criteria.10/10 pass requires those actual performances plus interpretation and changed-case reasoning; actual condition-related deviation is not forced to equal a fabricated example.',
        'finiteCheck': 'Mean(1.082,1.086,1.085)=1.084333333V; range0.004V; distance from1.100V=0.015666667V<0.025V. Reversed leads would read approximately-1.084V with chemicalZn anode/Cu cathode retained.',
        'scope': 'DE-BW SekII LK only; approximate condition-bound measurement. No loaded-voltage, universal standard-value, corrosion-source or whole-course approval.',
    },
]
science = {
    'schemaVersion': 1, 'reviewedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root/ci_current_run', 'role': 'Independent whole bilingual new practical-task content FIRST-B',
    'wholeTaskOriginalCasePairings': bound(AUTHOR / 'tasks/whole-three-task-and-original-case-pairings.author.json'),
    'taskAssessments': task_reviews,
    'currentPeerJudgmentsReadBeforeFIRST': False, 'previousOwnScienceReviewOfUnchangedOriginalCasesDisclosed': True,
    'actualHTMLandPDFCurrentThreePagesSeen': True,
    'normalDescriptionContextRecordDecisions': ['keep', 'keep', 'keep'],
    'currentAuthorNeedsReviewStatusDoesNotGrantApproval': True,
    'thisReviewDoesNotWriteReleasedStatus': True, 'newIndependentCurrentTaskReviewCountByThisReviewer': 1,
    'twoActualTaskReviewsStillNeededForRootMachineContentAdoption': True,
    'mandatorySchoolSupervisionAndActualApprovedLocalSafetyPlanRemain': True,
    'generationIsNotApproval': True, 'humanRelease': False, 'humanApproval': False,
    'actualLearnerPerformance': False, 'actualStudentPerformanceEvidence': [],
    'sourceConcentrationOnlyPartial': True, 'wholeSourceCourseOrProgrammeApproval': False,
    'noNewCurricularAtomicGoals': True, 'protected177Unchanged': True,
    'fullMaturityOrProtectedFloorPassClaimed': False, 'strictGain': 0, 'activeWrites': 0,
    'findings': [],
    'technicalSummaryPrecision': {
        'actualOldQ3ClusterChangedFields': ['contains', 'applicability'],
        'scopeJudgment': 'The BW addition to the Q3 practice cluster is necessary for the actual new BW-only descendants and does not widen its unchanged HE/BY practice children. Own normal projection checks prove GK1/LK3 and preserve every original ordinary target.',
        'authorReceiptLimit': 'Two author technical-summary booleans abbreviate the actual old-node change as ExceptQ3Contains. The executable author guard and this independent actual proof expressly include applicability. Root adoption must name both fields; those abbreviated booleans are not proof of a contains-only change.',
    },
}
(OWN / 'FIRST.whole-practical-tasks.independent.assessments.json').write_text(
    json.dumps(science, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'normalRecords': str(record_path.relative_to(ROOT)), 'normalRun': str(run_path.relative_to(ROOT)),
                  'wholeBilingualTaskJudgmentsWritten': 3, 'peerJudgmentsRead': False}))
