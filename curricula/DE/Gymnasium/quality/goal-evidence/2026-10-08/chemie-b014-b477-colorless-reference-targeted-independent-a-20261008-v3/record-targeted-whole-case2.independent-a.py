# SPDX-License-Identifier: Apache-2.0
"""Append-only targeted A science recheck of its original COLORLESS-Z finding.

The same reviewer must not be relabelled as an independent B reviewer.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'chemie-b014-b477-colorless-reference-targeted-author-root-v3'
PRIOR_AUTHOR = OWN.parent / 'chemie-b014-b477-nine-source-role-continuation-author-v2'
PRIOR = OWN.parent / 'chemie-b014-b477-nine-source-role-independent-a-20261008-v1'
KEY = 'fresh-bromothymol-proton-reaction-and-interference-v2'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

entry = read(AUTHOR / 'neutral-original-nine-source-roles-and-current-four-cases.review.entry.json')
author_seal = AUTHOR / 'whole-nine-source-role-current-four-case-author-v3.first.freeze.json'
assert sha(author_seal) == 'ed0aa80fa97eb787d0383508c201d7eaf159b9149cf64342631f4587dba49261'
for b in read(author_seal)['frozenFiles']: assert bind(ROOT / b['path']) == b
prior_seal = PRIOR / 'first-source-role-and-whole-case.independent-a.exact.freeze.json'
for b in read(prior_seal)['files']: assert bind(ROOT / b['path']) == b
before = read(ROOT / entry['supersededWholeCaseFileKeptAsHistory'])
current = read(ROOT / entry['operativeWholeCasesPath'])
before_by_key = {c['caseLocalKey']: c for c in before['cases']}
current_by_key = {c['caseLocalKey']: c for c in current['cases']}
assert len(current_by_key) == len(before_by_key) == 4 and current_by_key.keys() == before_by_key.keys()
delta = read(AUTHOR / 'two-exact-material-text-deltas.author-v3.json')
assert len(delta['changes']) == 2
patched = json.loads(json.dumps(before_by_key[KEY]))
for d in delta['changes']:
    assert d['caseLocalKey'] == KEY
    a, lang, index = d['path']; assert a == 'material' and lang in ['de', 'en'] and index == 0
    assert patched[a][lang][index] == d['old']
    patched[a][lang][index] = d['new']
assert patched == current_by_key[KEY]
for k in before_by_key:
    if k != KEY: assert before_by_key[k] == current_by_key[k]
prior_verdict = read(PRIOR / 'first-nine-source-role-and-four-whole-case.independent-a.verdicts.json')
assert len(prior_verdict['boundedSourceRoleVerdicts']) == 6
assert all(r['status'] == 'PASS_BOUNDED_SOURCE_ROLE_REMOVAL' for r in prior_verdict['boundedSourceRoleVerdicts'])
write(OWN / 'actual-corrected-whole-case2-DEEN.independent-a.snapshot.json', {
    'artifactKind': 'exact-whole-corrected-two-language-case2-reviewed-by-original-A', 'case': current_by_key[KEY],
    'actualFullMaterialTaskModelAnswerTransferAndLimitsRead': True, 'peerBOutputsRead': False, 'humanApproval': False})
write(OWN / 'exact-v3-input-and-three-case-nine-role-retention.independent-a.actual.json', {
    'artifactKind': 'actual-targeted-independent-A-frozen-input-and-unchanged-history-binding-verification',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorExactSeal': bind(author_seal), 'actualAuthorFrozenFilesVerified': 19,
    'priorOwnOriginalFirstSeal': bind(prior_seal), 'priorOwnOriginalVerdict': bind(PRIOR / 'first-nine-source-role-and-four-whole-case.independent-a.verdicts.json'),
    'wholeOriginalNineSourceRoleInputsUnchanged': True, 'alreadyGenuinelyReviewedBoundedSourceRoleDeltasRetained': 6,
    'threeOtherWholeCasesByteEquivalent': True, 'onlyTwoCaseContentDeltas': delta['changes'],
    'case2TaskModelAnswerPositiveUnderstandingTransferSourceIdsStatusLimitsUnchanged': True,
    'originalD2Fd1cValidWholeGoalEvidenceRestarted': False, 'wholeB477CompletionStillOpen': True,
    'thisIsSameIndependentAContinuation': True, 'thisIsIndependentBReview': False,
    'hashMatchAloneIsScience': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
verdict = {
    'schemaVersion': 1, 'artifactKind': 'genuine-targeted-A-COLORLESS-Z-v3-whole-two-language-science-verdict',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'reviewer': '/root/flora_fauna_independent_a',
    'assignedReviewRole': 'original independent A continuation', 'caseLocalKey': KEY,
    'oldFindingId': 'A-SRC-CASE2-COLORLESS-Z', 'oldActualFirstHOLDHistoryPreserved': True,
    'currentWholeCaseScienceVerdict': 'PASS_BOUNDED_WHOLE_SOURCE_WITNESS', 'oldFindingCurrentCandidateResolution': 'RESOLVED by actually read two bilingual material corrections',
    'actualReadScope': {'wholeCorrectedMaterialDeEn': True, 'wholeLearnerTaskDeEn': True, 'wholeModelAnswerDeEn': True,
        'wholePositiveUnderstandingEdgeDeEn': True, 'wholeFreshTransferTaskAndAnswerDeEn': True, 'wholeMaterialAndSourceLimits': True},
    'substantiveIndependentScientificObservations': [
        'Die neue ganze Materialfassung begrenzt farblos ausdrücklich auf die wässrigen X-/Y-Proben und Referenzen. Z ist die zusätzliche bereits vor Zugabe gelbe Störprobe und wird nicht mehr logisch zugleich als farblos und eigenfarbig definiert. Deutsch und Englisch setzen dieselbe Grenze; die ursprüngliche konkrete Bedingungskollision ist tatsächlich beseitigt.',
        'Die eigene Bromthymolblau-Referenz definiert gelb/sauer, grün/neutral und blau/basisch; X/Y werden nur innerhalb dieser gültigen farblosen Vergleichsbedingung zugeordnet. Wasserblindprobe dient der Kontrolle. Keine Farbe wird ungeprüft aus dem anderen Indikatorfall übertragen.',
        'Die saure Protonenreaktion In−+H₃O⁺ ⇌ HIn+H₂O und die basische HIn+OH− ⇌ In−+H₂O sind atomar und ladungsmäßig ausgeglichen. Die gelbe beziehungsweise blaue Form folgt dem ausdrücklich vereinfachten gegebenen HIn/In−-Modell, nicht einer behaupteten vollständigen Struktur des realen mehrprotonigen Farbstoffs.',
        'Z kann wegen seiner Eigenfarbe trotz gelber Sichtfarbe nicht aus dem Indikator allein als sauer klassifiziert werden. Die separat gegebene geeignete pH-Meter-Prüfung trägt die basische Aussage und im qualitativen Schulmodell c(OH−)>c(H₃O⁺). Die jeweils andere Wasserionenart ist nicht abwesend; kein exakter pH-Wert oder Nachweis des gelösten Stoffes folgt aus den Daten.',
        'Die Eigenfarbenstörung ist ein bewusst gegebenes Beobachtungs-/Messmodell, keine behauptete tatsächliche Durchführung. Kleine Indikatormenge und Eigenfarbe können das äußere Farbbild als pH-Nachweis unbrauchbar machen; unabhängige geeignete Messung und Blindprobe sind wissenschaftlich passende Grenzen. Keine spezifische reale Farbstoffchemie oder gemessene Konzentration von Z wird erfunden.',
        'Der gesamte frische Transfer unterscheidet gleiche formale Protonenlogik von indikatorspezifischer Farbe: rotes HIn aus Fall1 darf nicht als Farbe von Bromthymolblau eingesetzt werden. Neue eigene Referenz und Blindprobe sind erforderlich. Die Modellantwort trennt Teilchenrelation, begrenzte Stoffklassifikation und keinen sicheren funktionellen Gruppen- oder Einzelstoffnachweis.'
    ],
    'retainedGenuineOriginalAReview': {'nineWholeOriginalSourceRowsAndPartners': 9, 'sixBoundedRoleRemovalPasses': 6,
        'threeOtherWholeCaseSciencePasses': 3, 'actualPriorWholePrimaryReading': bind(PRIOR / 'actual-whole-primary-reading.independent-a.receipt.json'),
        'noHistoricalScienceReviewRestart': True},
    'wholeCurrentFourSourceWitnessCasesAfterThisTargetedRecheck': {'scientificPass': 4, 'hold': 0,
        'basis': 'Three unchanged cases retain genuine original A science; only the one corrected whole bilingual case has new actual science review.'},
    'remainingBBBEDutyBoundary': 'The case-condition HOLD is resolved for this corrected candidate. Exact versioned operative original-source-role reassignment to the retained d2/fd/1c union still requires separate review/adoption; two distinct BB/BE source identities and full source clauses must remain. This case PASS is not an adopted mapping or whole goal approval.',
    'remainingHBQDutyBoundary': 'Original A MWG/acid-AND-conjugate-base-strength witness decisions retained unchanged; full current481 and exact carrier/reuse decision remain open. No Q/K-versus-speed or model-reflection boundary was altered by this material edit.',
    'wholeB477Status': 'OPEN: bundled direction/detection/model-reflection goal requires scope-preserving reuse/atomicity decision, not closed by this case correction',
    'existingGoodImages': 'KEEP unchanged; no new visual review claimed', 'originalAcceptedD2Fd1cScientificReviewRestarted': False,
    'independentBReviewPerformedByThisReviewer': False, 'peerBOutputsReadBeforeOwnTargetedFirstSeal': False,
    'activeWrites': 0, 'newWholeGoalScientificClosures': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'actualLearnerOrExperimentEvidence': False, 'humanApproval': False, 'humanTrial': False}
write(OWN / 'targeted-whole-case2-COLORLESS-Z.independent-a.scientific-first.verdict.json', verdict)
files = [p for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN / 'targeted-COLORLESS-Z-v3.independent-a.exact.first.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'append-only-targeted-original-A-COLORLESS-Z-v3-exact-whole-science-first-freeze',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorExactInputSeal': bind(author_seal),
    'retainedOwnOriginalFirstSeal': bind(prior_seal), 'frozenFiles': [bind(p) for p in files],
    'currentTargetedWholeCaseScienceVerdict': 'PASS_BOUNDED_WHOLE_SOURCE_WITNESS', 'closedScopedCandidateFinding': 'A-SRC-CASE2-COLORLESS-Z',
    'allFourScopedWitnessesCurrentSciencePASS': 4, 'oldHOLDOverwritten': False, 'independentBReviewClaimed': False,
    'sourceRoleAdoptionClaimed': False, 'wholeB477ClosureClaimed': False, 'activeWrites': 0, 'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False})
print('Targeted original independent A: corrected whole DE/EN case2 PASS; actual COLORLESS-Z conflict resolved. Retain nine source rows/six bounded source-role passes/three other cases; no B role, active adoption, whole B477 completion or human approval.')
