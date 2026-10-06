import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
base = root / 'chemie-b008-nine-twenty-six-operator-and-prerequisite-author-v6'
out = root / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7'
out.mkdir(exist_ok=True)
now = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def put(name, data):
    path = out / name
    assert not path.exists(), path
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


freeze = base / 'author-v6.with-exact-K11-reference.final.freeze.json'
assert bind(freeze)['sha256'] == 'a8adb6cc44d4fc908820dc79cf0036fef6ab0897c648c2cfd55d667035e057ef'
for row in read(freeze)['files']:
    assert bind(row['path']) == row
a_freeze = root / 'chemie-b008-twenty-six-operator-v6-independent-a-v1/independent-a.complete.final.freeze.json'
b_freeze = root / 'chemie-b008-twenty-six-operator-v6-independent-b-v1/independent-b.actual.final.freeze.json'
if not b_freeze.exists():
    candidates = list((root / 'chemie-b008-twenty-six-operator-v6-independent-b-v1').glob('*freeze.json'))
    assert len(candidates) == 1
    b_freeze = candidates[0]
assert bind(a_freeze)['sha256'] == '276d106acc12fbaea861e16cf04bf7ec9d48bdde851161d83b56c84552a40d98'
assert bind(b_freeze)['sha256'] == '5cbc5c8b6403f221c8b469dfd8533f64f4979168c9dd765e6a8d7a72d95563b5'
findings_path = root / 'chemie-b008-twenty-six-operator-v6-independent-b-v1/literal-scientific-findings-and-unadopted-corrections.actual.json'
findings = read(findings_path)
primary_bindings = {}
for finding in findings['findings']:
    for source in finding['primarySources']:
        actual = bind(source['path'])
        assert actual['sha256'] == source['sha256']
        primary_bindings[actual['path']] = actual
before = read(base / 'twenty-six-atomic-boundaries.de-en.author-proposal.json')
after = copy.deepcopy(before)
after['authoredAt'] = now
after['operatorAndPrerequisiteAuthorRemediationVersion'] = 7
after['priorIndependentReviewsResolvedByAuthorProposalOnly'] = True
by_key = {row['candidateKey']: row for row in after['atoms']}
model = by_key['sek1-model-use-criticism']
model['titleDe'] = 'Chemische Modelle nutzen und kritisch vergleichen'
model['titleEn'] = 'Use and critically compare chemistry models'
model['descriptionDe'] = 'Die lernende Person kann für eine chemische Fragestellung hypothesengeleitet geeignete analoge oder digitale Modelle und Simulationen zu Materie, chemischen Reaktionen, Bindungen und Wechselwirkungen auswählen und nutzen, ihre Aussagen mit Beobachtungen und miteinander vergleichen, Grenzen benennen und begründen, weshalb ein Modell hinterfragt oder weiterentwickelt werden muss.'
model['descriptionEn'] = 'The learner can select and use suitable analogue or digital models and simulations of matter, chemical reactions, bonding and interactions in a hypothesis-guided investigation of a chemical question, compare their predictions with observations and with each other, identify limitations and justify why a model should be questioned or developed further.'
model['sourceOperatorScopeContractDe'] += ' Hypothesengeleitete Nutzung ist im abschließenden Erfolgsprodukt verbindlich; ein bloßer Fragestellungsfall ohne Hypothese belegt nur eine Teilkompetenz. Einfachere BY-C8/C9-Beiträge bleiben ausdrücklich quellenspezifische Teilbeiträge und erhalten erst nach geprüfter Stufen-/target-Entscheidung ihre tatsächliche Route. Der Titel verlangt die begründete Modellkritik und keine bereits ausgeführte Modellweiterentwicklung.'
lower = by_key['lower-independently-planned-hypothesis-investigation']
lower['prerequisiteProposalKeysOrExistingIds'] = ['lower-guided-hypothesis-investigation']
lower['sourceOperatorScopeContractDe'] += ' Die Frage/Hypothese darf bereitgestellt sein; eigene Formulierung ist keine universelle Voraussetzung selbstständiger Planung und Ausführung. Wo ein Originalquellenweg eigene Formulierung und Untersuchung gemeinsam verlangt, bleiben beide getrennten Leistungsprodukte auf dieser geprüften Route verbindlich.'
upper = by_key['upper-hypothesis-investigation']
upper['prerequisiteProposalKeysOrExistingIds'] = ['lower-independently-planned-hypothesis-investigation']
upper['sourceOperatorScopeContractDe'] += ' Auch eine bereitgestellte theoriegestützte Hypothese erlaubt die selbstständige praktische Planungs-/Durchführungsleistung. Eigene theoriegestützte Hypothesengenerierung wird nur im sie tatsächlich verlangenden integrierten Quellenweg, etwa C11.1.3, zusätzlich gebunden und bleibt am unveränderten upper-theory-based-question-hypothesis verpflichtend. Sie ist keine universelle prerequisite-Kante des experimentellen Erfolgsprodukts.'
reflection = by_key['own-inquiry-process-reflection']
reflection['descriptionDe'] = reflection['descriptionDe'].replace('die eigenen Methoden- und Vorgehensentscheidungen begründen', 'die angewandten Methoden und Vorgehensweisen begründen')
reflection['descriptionEn'] = reflection['descriptionEn'].replace('justify their own methodological and procedural decisions', 'justify the methods and procedures used')
reflection['sourceOperatorScopeContractDe'] += ' Bei einer angeleiteten eigenen Durchführung wird die Anwendung der vorgegebenen Verfahren begründet; nicht selbst getroffene Planungsentscheidungen werden nicht als eigene behauptet.'
delta = []
for old, new in zip(before['atoms'], after['atoms']):
    assert old['candidateKey'] == new['candidateKey']
    if old != new:
        delta.append({'candidateKey': old['candidateKey'], 'fields': [{'field': k, 'before': old.get(k), 'after': new.get(k)} for k in new if old.get(k) != new.get(k)]})
assert len(delta) == 4
assert all(row['candidateId'] is None for row in after['atoms'])
current = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
edges = {row['id']: row.get('requires', []) for row in current['goals']}
edges.update({row['candidateKey']: row['prerequisiteProposalKeysOrExistingIds'] for row in after['atoms']})
done, visiting = set(), set()
def visit(key):
    assert key in edges, key
    assert key not in visiting, key
    if key in done: return
    visiting.add(key)
    for nxt in edges[key]: visit(nxt)
    visiting.remove(key); done.add(key)
for key in edges: visit(key)
put('twenty-six-atomic-boundaries.de-en.author-proposal.json', after)
put('actual-four-prototype-literal-deltas.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'kind': 'author corrections after sealed independent v6 A/B; review dissents not overwritten',
    'frozenPriorInputs': [bind(freeze), bind(a_freeze), bind(b_freeze), bind(findings_path)],
    'primaryBindingsPersonallyReadAndChecked': list(primary_bindings.values()),
    'changedPrototypeCount': 4, 'unchangedWholePrototypeCount': 22, 'proposedAtomCount': 26,
    'deltas': delta, 'actualDAGResolvableAndAcyclic': True,
    'fourMandatoryBFindingsAddressedByAuthorOnly': ['B-v6-01', 'B-v6-02', 'B-v6-03', 'B-v6-04'],
    'boundedClarificationAddressed': 'B-v6-05',
    'ownFormulationProductsRetainedExact': ['lower-chemical-question-hypothesis', 'upper-theory-based-question-hypothesis'],
    'sourceOperatorsRemainRequiredOnRealReviewedSourceRoutes': True,
    'sourceRouteAdoptionIsNotApproved': True, 'all1646OriginalSourceObligationsRetainedButNotCleared': True,
    'independentCurrentV7ReviewsPending': True, 'candidateIdsAllNull': True,
    'nativeDOrPApproval': False, 'activeWrites': False, 'strictCompletionsAdded': 0, 'humanApproval': False, 'humanTrial': False,
})
put('effective-source-input-controls.json', {
    'schemaVersion': 1, 'frozenV6Controls': bind(base / 'actual-current-inputs-and-source-controls.json'),
    'effectiveK11Override': bind(base / 'actual-K11-primary-line-reference.correction.json'),
    'K11ActualLineRange': [138, 140], 'allSourceInputsUnchanged': True,
    'actualCurrentWholeChemistryBinding': bind('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),
    'currentStrict': {'chemie': {'complete': 112, 'denominator': 378}, 'biologie': {'complete': 67, 'denominator': 383}},
    'nativeProfilesIdsSourcePlacementsCardsVisibilityImagesPending': True,
})
print(json.dumps({'out': out.as_posix(), 'atoms': 26, 'changed': 4, 'wholeUnchanged': 22, 'DAGActual': 'acyclic/resolvable', 'activeWrites': False, 'strictGain': 0}))
