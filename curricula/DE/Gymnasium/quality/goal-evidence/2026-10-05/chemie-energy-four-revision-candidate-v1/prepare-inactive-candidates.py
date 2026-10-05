"""Prepare inactive Chemistry candidates; writes are restricted to this directory."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent
REPO = OUT.parents[6]
assert (REPO / 'AGENTS.md').is_file(), REPO

def read(rel):
    return json.loads((REPO / rel).read_text())

def dump(name, value):
    p = OUT / name
    assert p.resolve().is_relative_to(OUT)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def inner_digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

P_ORIGINAL = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy13-current-p-v1/positive-evidence.candidates.json'
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
BATCH = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-04/batch-011-ephase-fuels-energy-current-13-v1'
ids = [g['goalId'] for g in read(str(OUT.relative_to(REPO) / 'description-decisions.candidates.json'))['goals']]
original = read(P_ORIGINAL)
candidate = {k:copy.deepcopy(v) for k,v in original.items() if k != 'goals'}
candidate['reviewId'] = 'chemie-energy-four-revision-candidate-v2'
candidate['reviewedAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
candidate['reviewer'] = 'codex-inactive-author-candidate'
candidate['goals'] = [copy.deepcopy(g) for g in original['goals'] if g['goalId'] in ids]
byid = {g['goalId']:g for g in candidate['goals']}

# Preserve the two profiles that both reviewers passed, including their metadata.
g = byid['4928d5d1-e790-5883-9349-3b03a1c63b99']
g['reason'] = 'Eng begrenzter P-v2-Kandidat nach beiden HOLD-Befunden: Die frische isolierte Systemgrenze schließt Stoff, Wärme UND Arbeit ausdrücklich aus. Alle übrigen inneren Profildaten bleiben unverändert. Keine unabhängige Nachfolgerprüfung, Registrierung oder menschliche Freigabe.'
c = g['profile']['applicationCaseBriefs'][1]
c['taskDemandDe'] = 'Ein unabhängiges Papierprotokoll zeigt dieselbe Reaktion in einem starren gasdichten Kalorimeter, einem offenen Becher und einem ideal gegen sämtlichen Energie- und Stoffaustausch isolierten Gesamtsystem. Dessen starre Außengrenze lässt weder Wärme noch Arbeit noch Stoff passieren; auch elektrische oder andere Arbeitsübertragung ist ausgeschlossen. Beim starren Kalorimeter werden 800 J Wärme nach außen übertragen, ohne andere Arbeit. Klassifiziere alle drei Grenzen, deute ΔU im Kalorimeter und erkläre, warum daraus ohne Zusatzdaten nicht ΔH = −800 J folgt. Welche Aussage über die gesamte innere Energie erlaubt die ausdrücklich vollständig isolierte Grenze?'
c['taskDemandEn'] = 'An independent paper protocol shows the same reaction in a rigid gas-tight calorimeter, an open beaker and a total system ideally isolated against every exchange of energy and matter. Its rigid outer boundary admits neither heat nor work nor matter; electrical and other work transfer are also excluded. The rigid calorimeter releases 800 J of heat with no other work. Classify all three boundaries, interpret ΔU in the calorimeter and explain why this alone does not establish ΔH = −800 J. What statement about total internal energy follows from the explicitly fully isolated boundary?'
c['expectedPerformanceDe'] = 'Die lernende Person unterscheidet geschlossen/offen/isoliert, erhält im starren Kalorimeter w = 0 und ΔU = q_V = −800 J und nennt Δ(pV) als fehlenden Zusammenhang zu ΔH. Für das ausdrücklich vollständig isolierte Gesamtsystem begründet sie q = 0, w = 0 und keinen Stoffaustausch: Die gesamte innere Energie bleibt unverändert, obwohl innerhalb Reaktion und Temperaturänderung stattfinden können. Sie wendet diese Aussage auf das gewählte Gesamtsystem an, nicht auf jeden inneren Teilbereich; eine nur wärme- und stoffdichte bewegliche Grenze wäre dafür unzureichend, weil noch Arbeit übertragen werden könnte.'
c['expectedPerformanceEn'] = 'The learner distinguishes closed/open/isolated, obtains w = 0 and ΔU = q_V = −800 J for the rigid calorimeter and identifies Δ(pV) as the missing link to ΔH. For the explicitly fully isolated total system they justify q = 0, w = 0 and no matter exchange: total internal energy stays constant even though reaction and temperature changes can occur internally. They apply this claim to the chosen total system, not every internal part; a boundary that blocked heat and matter but could move would be insufficient because it could still transfer work.'

g = byid['3e433dae-99f9-5a95-ad63-d5fa0b5f6836']
g['reason'] = 'Eng begrenzter P-v2-Kandidat nach beiden HOLD-Befunden: Bereits ausgewertete Bindungsbudgets sind ausdrücklich gegebene Hilfe; Pflichtleistung ist deren qualitative kausale Erklärung mit relativem Energiestatus. Keine verpflichtenden Bindungsenergiesummen und keine zusätzliche Rechenroutine über BY C12 GA/EA.5 hinaus. Keine unabhängige Nachfolgerprüfung, Registrierung oder menschliche Freigabe.'
e = g['profile']['expectations'][0]
e['essentialUnderstandingDe'] = 'Bindungsspaltung benötigt Energie, Bindungsbildung setzt Energie frei. Bei vergleichbaren Stoffmengen und Zuständen erklärt das Verhältnis des benötigten zum freiwerdenden Beitrag Vorzeichen und qualitative Unterschiede der Reaktionsenthalpie. Bereits ausgewertete Budgets dürfen diese Beiträge als Daten liefern; eine eigene Berechnung von Bindungsenergiesummen ist keine Pflichtleistung dieses Ziels. Energiereich/energiearm bezeichnet die relative Lage der verglichenen Edukt- und Produktsysteme. Mittlere gasförmige Bindungsenergien liefern ein vereinfachtes Modell; Phase und zwischenmolekulare Wechselwirkungen können zusätzlich beitragen.'
e['essentialUnderstandingEn'] = 'Breaking bonds requires energy and forming bonds releases energy. For comparable amounts and states, the relation between required and released contributions explains the sign and qualitative differences of reaction enthalpy. Already evaluated budgets may supply these contributions as data; independently calculating sums of bond energies is not a mandatory performance for this goal. Energy-rich/energy-poor describes the relative positions of the compared reactant and product systems. Average gas-phase bond energies provide a simplified model; physical state and intermolecular interactions can add contributions.'
e['observablePerformanceDe'] = 'Die lernende Person erklärt mit vorgegebenen Reaktionsenthalpien und bereits ausgewerteten Bindungsbudgets qualitativ, welcher Beitrag überwiegt, warum sich die Energieabgabe unterscheidet und welche Edukt-/Produktsysteme relativ energieärmer liegen. Sie weist eine Begründung nur mit einem einzelnen Eduktband zurück und benennt die Grenze des vereinfachten Bindungsmodells. Nachrechnen vorgegebener Summen ist weder notwendig noch allein hinreichend.'
e['observablePerformanceEn'] = 'Using supplied reaction enthalpies and already evaluated bond budgets, the learner qualitatively explains which contribution dominates, why energy release differs and which reactant/product systems lie lower in relative energy. They reject an explanation based on a single reactant bond and identify the limit of the simplified bond model. Recalculating supplied sums is neither necessary nor sufficient on its own.'
c = g['profile']['applicationCaseBriefs'][0]
c['taskDemandDe'] = 'Für H2(g) + Cl2(g) → 2 HCl(g) und H2(g) + Br2(g) → 2 HBr(g) sind für die gleiche stöchiometrische Reaktionsmenge bereits ausgewertete Modellbudgets gegeben: Chlorfall: Bindungsbruch benötigt 679 kJ, Bindungsbildung setzt 862 kJ frei, Reaktionsenthalpie ungefähr −183 kJ; Bromfall: Bindungsbruch benötigt 629 kJ, Bindungsbildung setzt 732 kJ frei, Reaktionsenthalpie ungefähr −103 kJ. Die Budgets und Enthalpien sind bereitgestellte Ergebnisse, keine zu berechnenden Summen. Begründe qualitativ Vorzeichen und unterschiedliche Energieabgabe; ordne jeweils Edukte und Produkte relativ ein. Prüfe „Der kleinere Aufwand für Bindungsbruch im Bromfall muss zur größeren Energieabgabe führen“. Nur Papierdaten, keine Durchführung.'
c['taskDemandEn'] = 'For H2(g) + Cl2(g) → 2 HCl(g) and H2(g) + Br2(g) → 2 HBr(g), already evaluated model budgets are supplied for the same stoichiometric reaction amount: chlorine case: bond breaking requires 679 kJ, bond formation releases 862 kJ, reaction enthalpy about −183 kJ; bromine case: bond breaking requires 629 kJ, bond formation releases 732 kJ, reaction enthalpy about −103 kJ. Budgets and enthalpies are supplied results, not sums to calculate. Qualitatively explain the signs and differing energy release; compare reactants and products relatively within each reaction. Assess “the smaller bond-breaking input in the bromine case must cause greater energy release”. Paper data only; no experiment.'
c['expectedPerformanceDe'] = 'Die lernende Person erklärt, dass in beiden Fällen die Bindungsbildung mehr Energie freisetzt, als der Bindungsbruch benötigt: Die Reaktion gibt netto Energie ab und die jeweiligen Produkte liegen relativ zu ihren Edukten tiefer. Im Chlorfall ist der Überschuss des freiwerdenden Beitrags größer. Der geringere Bindungsbruchaufwand des Bromfalls reicht als Erklärung nicht, weil gleichzeitig wesentlich weniger Energie durch die H–Br-Bildung frei wird. Die Person bezieht beide Beiträge auf dieselbe stöchiometrische Basis und kennzeichnet die Zahlen als gegebenes vereinfachtes gasförmiges Bindungsmodell. Sie muss keine Bindungsenergiesummen oder Differenzen berechnen; bloßes Ablesen „−183 ist negativer“ ersetzt die kausale Erklärung nicht.'
c['expectedPerformanceEn'] = 'The learner explains that bond formation releases more energy than bond breaking requires in both cases: energy is released overall and each product system lies lower relative to its own reactants. The chlorine case has the greater excess of released contribution. The smaller bond-breaking input in the bromine case is insufficient as an explanation because substantially less energy is also released by H–Br formation. They relate both contributions to the same stoichiometric basis and identify the numbers as a supplied simplified gas-phase bond model. They need not calculate bond-energy sums or differences; merely reading that −183 is more negative does not replace the causal explanation.'
c = g['profile']['applicationCaseBriefs'][1]
c['taskDemandDe'] = 'Für H2(g) + 1/2 O2(g) → H2O sind bei gleicher Temperatur die bereits ausgewerteten Reaktionsenthalpien gegeben: −241,8 kJ/mol für H2O(g), −285,8 kJ/mol für H2O(l). Eine Datennotiz benennt zusätzlich, dass der flüssige Produktzustand relativ zum gasförmigen um 44,0 kJ/mol tiefer liegt. Beide Produkte haben O–H-Bindungen. Erkläre qualitativ, weshalb die Daten trotzdem differieren, welcher Produktzustand relativ energieärmer ist und warum mittlere gasförmige Bindungsenergien allein den Flüssigwert nicht liefern. Die bereitgestellten Werte sind Hilfe; eine Rechnung ist nicht gefordert.'
c['taskDemandEn'] = 'For H2(g) + 1/2 O2(g) → H2O, already evaluated reaction enthalpies at the same temperature are supplied: −241.8 kJ/mol for H2O(g), −285.8 kJ/mol for H2O(l). A data note additionally states that the liquid product state lies 44.0 kJ/mol below the gaseous one. Both products have O–H bonds. Qualitatively explain why values still differ, which product state has lower relative energy and why average gas-phase bond energies alone cannot yield the liquid value. Supplied values are assistance; no calculation is required.'
# The second expected response stays unchanged: the energy gap is now given.
dump('positive-evidence.candidates.json', candidate)
comparison=[]
for g in candidate['goals']:
    old=next(x for x in original['goals'] if x['goalId']==g['goalId'])
    comparison.append({'goalId':g['goalId'], 'originalProfileDigest':inner_digest(old['profile']), 'candidateProfileDigest':inner_digest(g['profile']), 'innerProfileUnchanged':old['profile']==g['profile'], 'wholeGoalCandidateUnchanged':old==g, 'independentSuccessorReview':'pending'})
dump('profile-delta-receipt.json', {'schemaVersion':1,'status':'inactive_author_preparation','sourcePath':P_ORIGINAL,'sourceFileDigest':digest(REPO/P_ORIGINAL),'serialization':'UTF-8 JSON; sorted keys; compact separators; Unicode unescaped','profiles':comparison,'coverageInterpretation':'Existing minimumIndependentDemonstrations:2 is a coverage descriptor, never an unconditional extra-task quota after sufficient independent evidence. Supplied images, equations, budgets and facts do not count as independently constructed learner performance.'})

canonical=read(CANONICAL)
goals={g['id']:g for g in canonical['goals']}
review_input=read(BATCH+'/bundle/review-input.json')
dump('snapshots/current-five-goals.json.snapshot',{'canonicalPath':CANONICAL,'canonicalDigest':digest(REPO/CANONICAL),'goals':[goals[g] for g in ids+['8ceb1749-fce0-584f-a2b8-0a309282329a']]})
dump('snapshots/four-original-p-profiles.json.snapshot',{'sourcePath':P_ORIGINAL,'sourceDigest':digest(REPO/P_ORIGINAL),'goals':[g for g in original['goals'] if g['goalId'] in ids]})
dump('snapshots/five-current-review-pages.json.snapshot',{'sourcePath':BATCH+'/bundle/review-input.json','sourceDigest':digest(REPO/(BATCH+'/bundle/review-input.json')),'pages':[p for p in review_input['pages'] if p['page']['goalId'] in ids+['8ceb1749-fce0-584f-a2b8-0a309282329a']]})
print(json.dumps({'candidate':str((OUT/'positive-evidence.candidates.json').relative_to(REPO)),'profileCount':len(candidate['goals']),'comparison':comparison},ensure_ascii=False,indent=2))
