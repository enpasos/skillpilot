"""Apache-2.0: inactive, explicit author proposals; no operative writes."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import uuid

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
BASE_SHA = '0fd3c538b5b554606ea8b073fa8c4cd3e27c376599cc416f0e8d2452b70be3be'
def write(name, value):
    p = OWN / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

baseline = json.loads((OWN / 'six-current-goals.before.snapshot.json').read_text())
assert baseline['canonicalSHA256'] == BASE_SHA
current = json.loads((ROOT / CAN).read_text())
before = {g['id']: g for g in baseline['goals']}
actual = {g['id']: g for g in current['goals']}
assert all(actual[gid] == goal for gid, goal in before.items())
after = copy.deepcopy(before)
def change(prefix, **fields):
    gid = next(g for g in after if g.startswith(prefix))
    after[gid].update(fields)
    return gid

ACYL = change('057a',
    description='Die lernende Person kann die Reaktivität von Carbonsäurechloriden, Carbonsäureanhydriden und Carbonsäureestern bei vergleichbaren nucleophilen Acylsubstitutionen ordnen und die Unterschiede anhand von Carbonylgruppe und Abgangsgruppe begründen.',
    descriptionEn='The learner can rank the reactivity of carboxylic acid chlorides, carboxylic acid anhydrides, and carboxylic esters in comparable nucleophilic acyl substitutions and justify the differences using the carbonyl group and leaving group.')
LACTONE = change('39c8',
    description='Die lernende Person kann die intramolekulare Esterbildung aus vorgegebenen Hydroxycarbonsäuren anhand von Strukturformeln erklären und Bildungstendenz sowie relative Stabilität der entstehenden Lactone unter angegebenen Bedingungen anhand von Ringstruktur und Vergleichsdaten begründen.',
    descriptionEn='The learner can explain intramolecular ester formation from specified hydroxycarboxylic acids using structural formulas and justify the formation tendency and relative stability of the resulting lactones under stated conditions using ring structure and comparative data.')
TENSID = change('d742',
    description='Die lernende Person kann einen kontrollierten Vergleich von Tensidlösungen planen und durchführen, dabei die kritische Micellbildungskonzentration aus einer Oberflächenspannungs-Messreihe ermitteln sowie Schaumbildung und Schmutztragevermögen unter definierten Bedingungen quantifizieren und die Ergebnisse und Grenzen des Vergleichs begründen.',
    descriptionEn='The learner can plan and carry out a controlled comparison of surfactant solutions, determine the critical micelle concentration from a surface-tension measurement series, quantify foaming and dirt carrying capacity under defined conditions, and justify the results and limitations of the comparison.')
SORBIC = change('d76b',
    description='Die lernende Person kann die Wirkweise von Sorbinsäure als Konservierungsstoff anhand bereitgestellter Reaktions- und Wirkungsdaten erläutern, Dosierungen mithilfe datierter lebensmittelkategoriespezifischer rechtlicher Verwendungsbedingungen begründet beurteilen und die Aussagegrenzen dieser Materialien benennen.',
    descriptionEn='The learner can explain how sorbic acid acts as a preservative using supplied reaction and efficacy data, evaluate dosages with reasons using dated food-category-specific legal conditions of use, and identify the limits of these materials.')
QUANT = change('d3cd',
    title='Ascorbinsäure und Parabene quantitativ bestimmen (LK)',
    titleEn='Determine ascorbic acid and parabens quantitatively (LK)',
    description='Die lernende Person kann geeignete quantitative Bestimmungen von Ascorbinsäure und eines vorgegebenen p-Hydroxybenzoesäureesters anhand ihrer Molekülstrukturen auswählen, mit Kontrollproben planen und durchführen und den jeweiligen Gehalt unter Berücksichtigung von Kalibrierung oder Reaktionsstöchiometrie, Verdünnung und Verfahrensgrenzen bestimmen.',
    descriptionEn='The learner can select suitable quantitative determinations of ascorbic acid and a specified p-hydroxybenzoic acid ester using their molecular structures, plan and carry them out with control samples, and determine each content while accounting for calibration or reaction stoichiometry, dilution, and method limitations.')
REDOX = change('10f6',
    description='Die lernende Person kann redoxaktive Konservierungsstrategien am Beispiel von Ascorbinsäure anhand bereitgestellter Reaktions- und Vergleichsdaten bewerten und dabei antioxidative Wirkung von antimikrobieller Konservierung unterscheiden.',
    descriptionEn='The learner can evaluate redox-active preservation strategies using ascorbic acid as an example and supplied reaction and comparison data, and distinguish antioxidant action from antimicrobial preservation.')

seed = 'https://skillpilot.com/curriculum/de/gymnasium/chemistry/competence/paraben-preservative-use-lk'
PARABEN = str(uuid.uuid5(uuid.NAMESPACE_URL, seed))
assert PARABEN not in actual
matches = [g for g in current['goals'] if any(t in (g.get('title','') + ' ' + g.get('description','')).lower() for t in ['paraben','hydroxybenzo','konserv','zusatzstoff','haltbar'])]
new = {
    'id': PARABEN, 'title': 'Verwendung von Parabenen beurteilen (LK)',
    'titleEn': 'Evaluate the use of parabens (LK)',
    'description': 'Die lernende Person kann den Einsatz vorgegebener p-Hydroxybenzoesäureester als Konservierungsstoffe anhand ihrer Molekülstruktur, bereitgestellter Wirkungs- und Löslichkeitsdaten sowie datierter produktbezogener Verwendungsbedingungen beurteilen und die Grenzen des Materials benennen.',
    'descriptionEn': 'The learner can evaluate the use of specified p-hydroxybenzoic acid esters as preservatives using their molecular structures, supplied efficacy and solubility data, and dated product-specific conditions of use, and identify the limits of the material.',
    'weight': 1, 'tags': ['LK'], 'contains': [],
    'requires': ['70b34ae7-4481-590c-9a02-516464750832', SORBIC],
    'dimensionTags': {'framework': 'hessen-kc-2024-chemistry', 'demandLevel': 'AB3', 'processCompetencies': [], 'guidingIdeas': ['BC_AUFBAU','BC_REAKTION'], 'phase': 'Q1'},
    'applicability': {'jurisdiction': ['DE-HE']}, 'type': 'atomic', 'examples': [],
}
source_file = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json'
source_sha = hashlib.sha256((ROOT / source_file).read_bytes()).hexdigest()
sources = {g['id']: g for g in json.loads((ROOT / source_file).read_text())['sourceGoals']}
source_id = 'he-chem-sekii-q1-5-b05-a01-e1183390'
assert sources[source_id]['courseLevel'] == 'LK'
new['extendedData'] = {'provenance': {
    'sourceLandscapeId': '2f391ba2-ba1e-40e4-a8d2-dff049516c13',
    'sourceLandscapeTitle': 'Chemie Oberstufe (Hessen, KC 2024 Source-Extraction)',
    'sourceGoalId': source_id, 'sourceExtractionPath': source_file,
    'sourceExtractionSHA256': 'sha256:' + source_sha, 'sourceSpan': 'Q1.5#B05A01',
    'sourceDocumentEdition': 'Ausgabe 2024; actual current official Stand 21.04.2026 page 40 read',
    'sourceBindingStatus': 'ai_candidate_independent_source_and_scope_review_pending',
    'sourceBindingRole': 'own_LK_paraben_use_component_not_GK_sorbic_or_quantitative_analysis',
    'sourceBindingReviewPath': str(REL / 'seventh-lk-paraben-use.scope-proposal.json'),
}}
write('six-explicit-scientific-field-deltas.candidate.json', {
    'authority': 'informed_author_candidate_not_independent_review',
    'baseCanonicalSHA256': BASE_SHA,
    'rows': [{'goalId': gid, 'before': before[gid], 'afterScientificText': goal,
              'changedFields': [k for k in goal if before[gid].get(k) != goal[k]],
              'independentD_P_A_M_VPending': True} for gid, goal in after.items()],
    'currentStrictDelta': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
})
write('seventh-lk-paraben-use.scope-proposal.json', {
    'authority': 'source_grounded_inactive_scope_proposal',
    'identitySeed': seed, 'uuidVersion': 5, 'namespace': str(uuid.NAMESPACE_URL),
    'newGoal': new, 'prospectiveCurrentAtomicDenominator': 377,
    'duplicateSearch': {'wholeCanonicalExamined': True, 'goalCount': len(current['goals']),
                        'relatedGoals': [{'id': g['id'], 'title': g['title'], 'description': g['description'], 'type': g.get('type')} for g in matches],
                        'equivalentParabenUseAtomicGoalFound': False,
                        'excludedReasons': 'Quantitative analyte determination is not preservative-use evaluation; general preservation comparison is not the LK para-hydroxybenzoate case; terminal multi-content tasks are not curricular content atoms.'},
    'reason': 'Actual HE page 40 separates Sorbinsäure addition for GK/LK, Ascorbinsäure structure and quantitative determination for LK, and Paraben use for LK. Adding unconditional paraben use to current GK+LK d76 would extend GK; appending use evaluation to d3cd would mix separate competences. This additional LK-only proposal preserves every current operator without imposing an LK obligation on GK.',
    'source': {'path': source_file, 'sha256': source_sha, 'sourceGoal': sources[source_id], 'actualCurrentPrimaryPage': 40},
    'placementProposal': {'existingParentId': next(g['id'] for g in current['goals'] if g.get('contains') and QUANT in g['contains']),
                          'keepAllExistingChildrenAndOrder': True, 'appendNewChildAdjacentTo': QUANT},
    'noNewJurisdictionClaimBeyondActualHE': True,
    'independentSourceApplicabilityAtomicityMemoryD_P_VPending': True,
    'operativeAdoptionAuthorizedByThisFile': False,
    'currentStrictDelta': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
})
print(json.dumps({'scientificCandidates': 6, 'additionalInactiveProposal': PARABEN, 'currentAtomic': 376, 'prospectiveAtomicIfAccepted': 377, 'activeWrites': 0}))
