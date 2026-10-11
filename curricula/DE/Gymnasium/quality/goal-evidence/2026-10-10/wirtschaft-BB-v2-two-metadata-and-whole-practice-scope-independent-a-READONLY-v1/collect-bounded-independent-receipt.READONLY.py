import collections
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
AUTHOR = Q / 'wirtschaft-BB-personal21-two-partial-union-and-full-existing-practice-scope-ADDENDUM-AUTHOR-INERT-v2'
COMMON = Q / 'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1'
SID = 'bb-wirtschaft-sekii-q-lk-personal-g02-e3dcd4a1'
IDS = ['776457c2-8bb3-53b9-838b-a028319175fb', 'fab48742-756b-564d-87ef-cd6f3c75f348', '912ab267-ee00-581b-a31c-dfc0b3587184', '81dfe82c-508b-51ba-829e-3f9e4d4a27a1']
started = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p):
    return json.loads(p.read_text())

def binding(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

seal_path = AUTHOR / 'SEALED-one-BB-source-union-two-LK-targets-two-metadata-fixes.AUTHOR-INERT.json'
seal = read(seal_path)
assert binding(seal_path)['sha256'] == 'sha256:a1de0013381039a65a237d7dabf57bcfd3542dc46a6cac45d2329236202801f7'
inputs = [ROOT / a['path'] for a in seal['artifacts']] + [seal_path,
    COMMON / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',
    COMMON / 'semantic689.candidate-bound.INERT.json',
    COMMON / 'SEALED-common689-343-final72-source-scope-native-A-M-root-handoff.INERT.json',
    ROOT / 'app/scripts/sourceCoverageEvidence.ts', ROOT / 'app/scripts/generateCurriculumQualityStatus.ts',
    ROOT / 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2018_Wirtschaftswissenschaft.pdf',
    Q / 'wirtschaft-BB101-bounded-source-pipeline-metadata-independent-a-READONLY-v1/actual-BB101-original-metadata-proposal-independent-REVISE-two-counter-status-findings.SEALED.receipt.json',
    Q / 'wirtschaft-common343-native-P44-Book343-binding-technical-a-INERT-v1/actual-native-P343-Book343-44configs-after-main-a866-all-exact.SEALED.receipt.json',
    Q / 'wirtschaft-common343-native-P44-Book343-binding-technical-a-INERT-v1/whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl']
inputs = sorted(set(inputs))
before = [binding(p) for p in inputs]
for a in seal['artifacts']:
    assert binding(ROOT / a['path']) == a

source_path = next((AUTHOR / 'candidates').rglob('*.source-extraction.json'))
mapping_path = next((AUTHOR / 'candidates').rglob('*.review.json'))
view_path = next((AUTHOR / 'candidates').rglob('*.view.json'))
old_source_path = next((AUTHOR / 'history').rglob('*.ready.source-extraction.json'))
old_mapping_path = next((AUTHOR / 'history').rglob('*.ready.review.json'))
source, mapping, view = map(read, [source_path, mapping_path, view_path])
old_source, old_mapping = map(read, [old_source_path, old_mapping_path])
core = read(COMMON / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
goals = {g['id']: g for g in core['goals']}
bound = read(AUTHOR / 'bound-inputs/four-whole-unchanged-existing-contracts.EXACT.json')
assert bound == [goals[i] for i in IDS]
assert source['sourceGoals'] == old_source['sourceGoals'] and source['passages'] == old_source['passages']
assert source['qualityReview']['historicalAuthorOpenOriginalCoverage'] == old_source['qualityReview']['boundedAuthorOpenOriginalCoverage']
assert 'boundedAuthorOpenOriginalCoverage' not in source['qualityReview']
old_decisions = {d['sourceGoalId']: d for d in old_mapping['decisions']}
assert all(d == old_decisions[d['sourceGoalId']] for d in mapping['decisions'] if d['sourceGoalId'] != SID)
assert mapping['mappings'][:178] == old_mapping['mappings']
edge_counts = dict(collections.Counter(e['matchType'] for e in mapping['mappings']))
decision_counts = dict(collections.Counter(d['matchType'] for d in mapping['decisions']))
assert edge_counts == {'exact': 30, 'partial': 149}
assert decision_counts == {'exact': 30, 'partial': 71}
assert len(source['sourceGoals']) == len(mapping['decisions']) == 101
assert mapping['summary']['exactMappings'] == decision_counts['exact']
assert mapping['summary']['partialMappings'] == decision_counts['partial']
assert all(e['canonicalGoalId'] in goals for e in mapping['mappings'])
assert all(g in goals for d in mapping['decisions'] for g in d['canonicalGoalIds'])
personal = next(d for d in mapping['decisions'] if d['sourceGoalId'] == SID)
assert personal['canonicalGoalIds'] == IDS[:2] and personal['matchType'] == 'partial'
assert mapping['mappings'][-1]['canonicalGoalId'] == IDS[1]
native = read(AUTHOR / 'actual-native35-views-and-full-BB-existing-practice-closure.READONLY.json')
assert native['summary']['viewErrors'] == native['summary']['duplicates'] == 0
assert native['summary']['views'] == 35
lk = next(r for r in native['rows'] if r['name'] == 'de-bb-gym-economics-lk.view.json')
assert lk['addedTargets'] == IDS[1:3]
assert lk['wholePractice']['target'] is True
assert all(c['target'] for c in lk['wholePractice']['coveredGoalIds'])
assert goals[IDS[3]]['requires'] == goals[IDS[3]]['examData']['coveredGoalIds'] == IDS[1:3]
assert IDS[2] not in goals[IDS[1]]['requires']

from pypdf import PdfReader
pdf = ROOT / 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2018_Wirtschaftswissenschaft.pdf'
reader = PdfReader(pdf)
texts = [reader.pages[n].extract_text() for n in [19, 20]]
assert 'Wahlobligatorisch' in texts[0] and 'Personal' in texts[0]
assert 'BetrVG' in texts[1] and 'MitbestG' in texts[1]
assert 'Montan' not in texts[1] and 'Arbeitsdirektor' not in texts[1]

record = {
    'role': 'BOUNDED_INDEPENDENT_REVIEW_OF_ROOT_PLANER_AUTHORED_V2_NOT_BLIND_D',
    'reviewer': '/root/economics_final56_current_round_a', 'verificationStartedAt': started,
    'authorPackage': binding(seal_path), 'activeWrites': 0, 'newHistoricalWhole101ScienceReview': False,
    'disclosedPriorAuthorship': ['7c NAIRU goal/P authoring', '7c/121/b84 scope-practice authoring; unrelated to this BB successor'],
    'generationMetadata': {'provider': 'OpenAI', 'model': 'GPT-6', 'runtime': 'Codex', 'exactModelRevision': 'not_exposed', 'samplingParameters': 'not_exposed'},
    'actualRead': {'wholeUnchangedContractsDEEN': IDS, 'wholePracticeMaterialSolutionRubricDEEN': IDS[3],
                  'primaryPDFPages': [20, 21], 'primaryExtractedTextHashes': ['sha256:' + hashlib.sha256(t.encode()).hexdigest() for t in texts],
                  'source21AndParent': True, 'other100DecisionsOnlyMechanicalReuse': True,
                  'source101RowsAndPassagesOnlyExactComparison': True, 'native35ResultAndActualMethod': True,
                  'nativeSURCodePredicate': True, 'CSourceReviewResultsReadOrReplaced': False},
    'checks': {'sourceRows': 101, 'sourceRowsWholeExactVsPriorQualifiedCandidate': True,
               'passagesWholeExact': True, 'other100DecisionsExact': True, 'all178PreexistingEdgesExactInOrder': True,
               'currentEdges': 179, 'edgeMatchTypes': edge_counts, 'decisionMatchTypes': decision_counts,
               'allMappedIDsExistInActual689': True, 'fourWholeContractsExactVsActual689': True,
               'oldOpenAuthorStatusWholeExactInHistory': True, 'source21BothRoutesPartial': True,
               'native35CompilerErrors': 0, 'native35Duplicates': 0,
               'technicalCompilerPassIsNotSourceScopeQualification': True},
    'decisions': [
        {'id': 'BB101-META1', 'decision': 'KEEP', 'reason': '30 exact/71 partial are now the actual101 row classifications. The distinct179 edge denominator is30 exact/149 partial; neither counter is substituted for the other.'},
        {'id': 'BB101-META2', 'decision': 'KEEP', 'reason': 'The pending author-coverage object has been moved whole and exact to historicalAuthorOpenOriginalCoverage. The current candidate no longer presents it as a current unresolved judgement. Original v1 REVISE history remains unchanged.'},
        {'id': 'BB-SOURCE21-UNION', 'decision': 'KEEP_BOUNDED_SOURCE_FACETS',
         'reasonDe': 'Im ausdrücklich gewählten LK-Personalbereich fordert S21 die Prüfung betrieblicher demokratischer Mitbestimmung und Grundlagen von BetrVG sowie MitbestG. 776 trägt die Betriebsratsebene und Fallbeurteilung; fab trägt die gewöhnliche unternehmensbezogene Aufsichtsratsbeteiligung und deren Abgrenzung zum Betriebsrat. Beide Zuordnungen bleiben partial. Die zusätzliche Montanvergleichsleistung im ganzen fab-Ziel ist eine ausdrücklich deklarierte didaktische Erweiterung und keine aus S21 abgeleitete Normpflicht.',
         'reasonEn': 'In the expressly selected elective LK Personal unit, page21 addresses workplace democratic participation plus basic BetrVG and MitbestG rules. The776 workplace/works-council performance and fab ordinary supervisory-board performance cover distinct facets. Both routes remain partial; the whole fab Montan comparison is a disclosed didactic extension, not a page21 mandate.',
         'freshNegativeCase': 'Correctly explaining an ordinary company supervisory board and its difference from the works council does not demonstrate §13 labour-director appointment, revocation or executive-role competence.'},
        {'id': 'BB-V2-WHOLE-PRACTICE-SCOPE', 'decision': 'REVISE',
         'reasonDe': 'Die ganze81d-Praxis prüft in Aufgabe2 K/L/W2 die eigenständige912-Leistung: besondere Bestellungs- und Widerrufsgrenze, geschützte Gruppenzählung und gleichberechtigte Leitungsrolle. S21 nennt diese Leistung nicht; sie ist auch keine Voraussetzung des fab-Aufsichtsratsvergleichs. Dass81d bereits in einem alten View target war, begründet ihre BB-Scopepflicht nicht. Die zusätzliche912-target-Rolle repariert nur die technische Geschlossenheit einer fachlich nicht begründeten Praxisrolle. 81d und912 dürfen deshalb nicht als BB-Personalpflicht aus Source21 oder aus der alten Sichtbarkeit fortgeschrieben werden.',
         'reasonEn': 'Whole81d Task2 requires the separate912 appointment/revocation constraint, protected-group count and equal executive-role performance. Page21 does not require it, and fab does not depend on it. A pre-existing view target does not establish this BB curriculum obligation. Adding912 only closes an unjustified practice scope technically.',
         'ownConcreteCounterAnswer': 'K and L each have7 yes/4 no overall, but3 of5 protected members oppose, so the supplied §13 special constraint blocks both. W2 has8/3 overall and only2 of5 oppose: the special barrier is absent, while other validity remains unresolved. These answers assess912, not the Source21 ordinary MitbestG facet.',
         'requiredRemedyBoundary': 'Remove unsupported81d BB-LK target and do not add912. Retain the independently justified776+fab partial source union and explicitly authored fab whole-goal didactic extension. No source claim for912 or new practice may be manufactured merely to keep old targets.'}
    ],
    'overallDecision': 'REVISE_V2_SCOPE_ONLY_METADATA_AND_SOURCE_UNION_KEEP',
    'formalGates': {'nativeCQR003SourceSUR912': 'NOT_ACCEPTED_AND_NOT_CLAIMED',
                    'nativeCIExecuted': False, 'wholeSourceCountryReviewClaimed': False,
                    'allPartialMappingsClaimedWhole': False, 'humanApproval': False,
                    'blindD': False, 'M6M7FinalApproval': False,
                    'pipelineCompletionActivation': 'conditional_on_actual_corrected_scope_and_independent_C_source_closure'}
}
after = [binding(p) for p in inputs]
assert after == before
record['endGuards'] = after
record['allInputBytesExactAtEnd'] = True
record['verificationCompletedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
out_file = OUT / 'actual-independent-BB-v2-two-metadata-KEEP-source21-partial-union-KEEP-whole-practice-scope-REVISE.SEALED.receipt.json'
assert not out_file.exists()
out_file.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': binding(out_file), 'guardCount': len(after), 'decision': record['overallDecision']}, ensure_ascii=False))
