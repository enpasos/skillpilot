# SPDX-License-Identifier: Apache-2.0
"""Own actual P/A/M/V science FIRST, without any normal materialization."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
KP = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
PB = 'f0f2c5f8-06f1-5774-a176-d96505727acf'


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, d):
    assert not p.exists(), p
    temporary = p.with_name(p.name + '.partial')
    temporary.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, p)


context_path = OWN / 'inputs/two-whole-final-contexts-four-profiles-eight-cases.actual.json'
context = read(context_path)
receipt_path = OWN / 'browser/RECEIPT.actual-own-current-316-636-Chromium.json'
receipt = read(receipt_path)
assert len(receipt['records']) == 4 and receipt['normalVBindingsAtCapture'] == 0
for row in receipt['records']:
    assert row['metrics']['imageWidth'] in [316, 636]
    assert row['metrics']['complete'] and row['pageErrors'] == []
    for key in ['screenshot', 'fixture']:
        assert ref(REPO / row[key]['path']) == row[key]
now = datetime.now(timezone.utc).isoformat()
P = [
    {'goalId': KP, 'decision': 'supported_E1_G1_ai_candidate', 'profileBodyChanged': False,
     'reason': 'Der neue vollständige DE/EN-Text verlangt ausdrücklich Herleitung, Umrechnung und begründete Idealmodellgrenzen bei festgelegten Standardzuständen. Das tatsächlich ganze Profil enthält genau diese positive Kette: p_i=c_iRT und Gasstöchiometrie; dimensionslose Standardzustände gegenüber unnormierten Schulprodukten; Nichtidealität und Feststoffabgrenzung. 07-a verlangt die Herleitung p_i/p°=(c_i/c°)(RTc°/p°) und Kp=Kc(RTc°/p°)^Δν, nicht bloß Merken eines Bildsymbols. Mit Δν=1 ergibt sich Kp=0,1238786. 07-b ändert die chemische Struktur zu Δν=0 und zu einem heterogenen System mit nur einem Gas: Kp=4 und Kc=0,00481116. Reaktionsverdopplung und das Versagen von p=cRT bei vorgegebenem nichtidealem CO2 sind echte Transfers. Die neue Forderung ist daher vom ganzen bestehenden Körper getragen; keine bloße Fingerprint-Promotion und kein neuer Körper nötig. Das dichte aktuelle JPG wurde nativ und mobil tatsächlich gesehen. Seine Lesbarkeitsrevision ist im getrennten V-FIRST offen und wird durch dieses P-Design nicht freigegeben. Ich bin ursprünglicher Materialautor; die neue Beschreibung stammt von anderen. E1/G1 betrifft nur zukünftiges Assessmentdesign, keine beobachtete Leistung oder Quellen-/Kurspflicht.',
     'understandingPerformanceTransfer': [
         'Ideales Partialgasgesetz plus festgelegte Standardzustände -> normierten Umrechnungsfaktor herleiten -> verdoppelte Reaktionsgleichung mit K-Quadraten und verdoppeltem Δν.',
         'Gasstöchiometrie und Modellgrenze -> Δν=0 sowie reine Feststoffe abgrenzen -> bei vorgegebenem Nichtidealitätsbefund versagenden Herleitungsschritt benennen.',
     ]},
    {'goalId': PB, 'decision': 'supported_E1_G1_ai_candidate', 'profileBodyChanged': False,
     'reason': 'Der neue begrenzte Text verlangt Konstruktion und Interpretation aus vorgegebenen thermodynamischen Modellen sowie die Trennung von Stabilität, Korrosionsrate und tatsächlicher Passivierung. Alle drei ganzen Profilexpectations und beide ganzen Fälle tragen diese Operatoren. 10-a liefert T, Bezug gegen SHE, Wasserlinien, Cu-Standardpotenzial und Cu2+-Aktivität; daraus werden die horizontale Grenze Eh=0,16252 V beziehungsweise pE≈2,747 und die Punkte P/Q/R konstruiert und interpretiert. 10-b liefert ein ausdrücklich fiktives Drei-Spezies-Modell und verlangt aus KL/Kw die vertikale pH-9,5-Grenze sowie aus der Gleichgewichtsbeziehung die geneigte Metall/Hydroxid-Grenze Eh=−0,05546−0,05916pH. Die Phasenbereiche werden weder zur vollständigen Eisenchemie noch zu gemessenen Schutzschichten erklärt. Hundertfache Cu2+-Aktivität und ein starker Ligand verändern die Grenze beziehungsweise das erforderliche Modell; das ist begründeter Transfer statt Ablesen einer Farbfläche. Das aktuelle PNG ist nur qualitative Unterstützung, beide Fälle stehen unabhängig davon. Körper und Rubriken decken die tatsächlich neue Modell-/Operatorgrenze; kein Körperwechsel nötig. Informed review unter offengelegter ursprünglicher Materialautorenschaft, E1/G1/ai_candidate/needs_human_review; Quellen-/Kurs-/D-Holds bleiben offen.',
     'understandingPerformanceTransfer': [
         'Vorgegebene Aktivitäten und Elektronen-/Protonenbeziehungen -> horizontale, vertikale und geneigte Linien selbst konstruieren -> Aktivitätsänderung und Ligandenwirkung modellbezogen neu einordnen.',
         'Thermodynamisches Feld gegenüber Rate/Schutzwirkung -> Punktklassifikation und ausgeschlossene Spezies begrenzen -> erklären, welche zusätzliche reale Schutz-/Kinetikinformation benötigt würde.',
     ]},
]
A = [
    {'goalId': KP, 'status': 'atomic', 'semanticAtomic': True,
     'competenceCore': 'Die idealgasbezogene Beziehung zweier ausdrücklich definierter Gleichgewichtskonstanten herleiten, anwenden und ihren Geltungsbereich begründen.',
     'prerequisiteApplication': 'Das Massenwirkungsgesetz liefert Produktform und stöchiometrische Exponenten. Das ideale Partialgasgesetz und konsistente Einheiten sind Werkzeuge für den gegebenen Modellfall.',
     'transferBoundary': 'Andere Gasstöchiometrie, Reaktionsskalierung und das Benennen einer Nichtidealitätsgrenze bleiben derselbe Zusammenhang. Kein allgemeiner Realgas-EOS-/Fugazitätssolver und keine experimentelle Konstantenbestimmung wird verlangt.',
     'reason': 'Herleitung, konkrete Umrechnung und Grenze sind zusammen notwendige Teile einer einzigen Modellanwendung. Standardzustände verhindern eine falsche Formelverwendung; sie sind kein unabhängiger Zusatzast. Beide ganzen Fälle variieren denselben Kompetenzkern. Daher atomic/true für den tatsächlich neuen Wortlaut. Source/Course/LK-Deklaration und D-Holds werden damit ausdrücklich nicht entschieden.'},
    {'goalId': PB, 'status': 'atomic', 'semanticAtomic': True,
     'competenceCore': 'Ein begrenztes pE/Eh-pH-Stabilitätsmodell aus vorgegebenen Gleichgewichten konstruieren und chemisch interpretieren.',
     'prerequisiteApplication': 'Relative Standardpotenziale und Redoxrichtung aus der tatsächlichen Spannungsreihen-Prärequisite werden mit den im Modell gegebenen Gleichgewichts-/Aktivitätsbeziehungen angewandt.',
     'transferBoundary': 'Grenztyp, Achsenumrechnung, Aktivitätsänderung und zusätzliche Liganden prüfen dasselbe Diagrammmodell. Reale Korrosionsgeschwindigkeit oder Schutzschichtgüte werden abgegrenzt, nicht als zusätzlich auszuführende Kompetenz hinzugenommen.',
     'reason': 'Konstruktion und Interpretation beziehen sich auf dieselben Modellgrenzen; die Abgrenzung zu Kinetik/Passivierung verhindert unzulässige Folgerungen. Die zwei ganzen Modellfälle liefern explizite Eingangsbeziehungen und werden nicht zu einer offenen Gesamtmetallchemie zusammengefasst. Daher atomic/true. Kein Quellen-/Kurs-/D-/Human- oder M7-Schluss.'},
]
M = [
    {'goalId': KP, 'status': 'no_memory_needed', 'memoryUseful': False,
     'reason': 'Der neue Text verlangt ausdrücklich Herleitung aus dem idealen Gasmodell bei festgelegten Standards. Die Lernleistung ist die Überführung der gegebenen Definitionen über p_i=c_iRT und die stöchiometrischen Gasexponenten, nicht der isolierte Abruf einer unitlosen RT-Merkformel. Die beiden ganzen Fälle liefern Standards, R, T und K-Werte und ändern Gasstöchiometrie, vorhandene Feststoffphasen und Nichtidealitätsinformation. Wer nur Kp=Kc(RT)^Δn auswendig kann, kann die normierte Form, den Einheitengegencheck oder Reaktionsverdopplung gerade verfehlen. Das Massenwirkungsgesetz ist die gelesene Prärequisite; kompakte Grundlagen anderer Ziele können dort Memory tragen, ohne einen neuen Kartenkatalog dieses Ziels zu begründen. Weder Modellzahlen noch ein allgemeiner Fugazitätswert sind zu memorierende Stofflisten. Daher genuine no_memory_needed/false nach neuem ganzen Wortlaut und beiden Fällen; die allgemeine alte konservative Begründung wird durch diese eigene aktuelle ersetzt.',
     'wholePriorMDecision': next(r for r in context['wholePriorM2'] if r['goalId'] == KP)},
    {'goalId': PB, 'status': 'no_memory_needed', 'memoryUseful': False,
     'reason': 'Die Kompetenz ist nun ausdrücklich auf vorgegebene thermodynamische Modelle begrenzt. In 10-a/b werden Temperatur, Referenz, Gleichgewichtsbeziehungen, Aktivitäten und Modellkonstanten geliefert. Gefordert sind daraus selbst erzeugte horizontale/vertikale/geneigte Grenzen, Achsenbedeutung, Punktklassifikation und die begründete Abgrenzung von Rate und realer Passivierung. Ein auswendig gelerntes farbiges Pourbaix-Feld oder Metalltabellenwerte würden diesen modellabhängigen Transfer nicht belegen und könnten die geänderte Aktivitäts-/Ligandengrenze verdecken. Die direkte Prärequisite trägt Standardpotenzial und Redoxrichtung; ihr möglicher Recallbedarf wird hier nicht pauschal verneint. Dieses Ziel legt jedoch keinen eigenen neuen abrufbaren Diagramm-/Materialwerte-Katalog fest. Die Quellen-/Kursfrage kann ebenfalls keine Kartenpflicht spenden. Daher genuine no_memory_needed/false aufgrund des tatsächlichen gegebenen Modell-/Operatorbedarfs, nicht wegen des früheren Status.',
     'wholePriorMDecision': next(r for r in context['wholePriorM2'] if r['goalId'] == PB)},
]
V = [
    {'goalId': KP, 'decision': 'revise',
     'reason': 'Die tatsächlich native Datei ist JPG, nicht PNG. Ihre ausdrücklich unnormierten Partialdruck-/Konzentrationsprodukte machen Kp=Kc(RT)^Δn innerhalb dieser Konvention zulässig; kein Formelfehler wird behauptet. Für dimensionslose Konstanten bei angegebenen Standards ist dagegen der im ganzen Fall hergeleitete Faktor RTc°/p° nötig; die Konvention darf nicht stillschweigend gewechselt werden. Δn braucht die stöchiometrische Gas-Lesart. Nativ und bei636 Bildpixeln sind diese dargestellten Produktdefinitionen und die R/T/Δn-Legenden überwiegend entzifferbar. In der tatsächlich neu gerenderten aktuellen360-GoalCard mit316 Bildpixeln ist die Hauptgleichung noch erkennbar, aber die Produktdefinitionen sowie insbesondere Gasexponent-, Temperatur- und Konstantenzuordnungen sind zu klein, um zuverlässig gelesen zu werden. Diese Beschriftungen tragen die fachliche Bedeutung der Konversion und der Modellgrenze. Druckmesser, Becherglas und Teilchenbilder sind dafür kein Ersatz. Der tatsächliche neue ganze Text und das Profil verlangen gerade Herleitung/Standardzustandsbewusstsein; daher mobile REVISE dieses dichten Bildes, keine Generator-/Formatpräferenz und keine Quellenentscheidung. Originaldatei und alle vier Ansichten bleiben erhalten. Keine neue Bildfreigabe.',
     'nativeFindings': 'Unnormierte Schulprodukt-Konvention fachlich zulässig; Niedrigdruck/Hochtemperatur gegenüber realen Gasen ist als Näherungsgrenze dargestellt, nicht als exakte universelle Grenze. Die n-Notation ist stöchiometrisch zu lesen.',
     'responsiveFindings': '316: große Überschriften und Hauptgleichung vorhanden, entscheidende Definitions-/R/T/Δn-Mikrolegenden nicht zuverlässig lesbar.636: deutlich besser. Keine abgeschnittene Grafik oder Ladefehler.',
     'actualImage': next(r['actualCurrentNativeImage'] for r in context['wholeContexts'] if r['goal']['id'] == KP)},
    {'goalId': PB, 'decision': 'accepted',
     'reason': 'Die tatsächlich native PNG zeigt ausdrücklich ein schematisches Drei-Formen-Modell, pE nach oben, pH nach rechts, Metall unter horizontaler beziehungsweise fallender Grenze, M2+ links oberhalb und M(OH)2 rechts oberhalb. Die drei Grenzen treffen konsistent in einem Punkt. Der Pfeil bei gleichem pE zu größerem pH führt vom Ionen- in den Feststoffbereich. Stabilität≠Tempo bleibt in der tatsächlichen316- und636-GoalCard klar lesbar; M2+, M, M(OH)2, Achsen, Grenzverlauf und qualitative Pfeilrichtung sind erkennbar. Fehlende Zahlen/Wasserlinien und weitere Spezies werden durch den ganzen ALT explizit begrenzt. Das Bild behauptet weder eine vollständige reale Eisenchemie noch eine schützende Schicht; der ganze neue Zieltext und die Fälle behalten genau diese Grenze. Konstruktion aus gelieferten Gleichgewichten wird mit ganzen Aufgaben geprüft, nicht aus einer bunten Fläche als Leistung abgeleitet. Deshalb tatsächliches informed KEEP/accepted im neuen ganzen Kontext. Keine Quellen-/Kurs-/D-/Human-/M7-Freigabe.',
     'nativeFindings': 'Richtige qualitative Feldtopologie im deklarierten Drei-Spezies-Modell und klare Trennung Stabilität/Tempo.',
     'responsiveFindings': '316 und636: kritische Spezies, Achsen, Dreifachpunkt, horizontale/vertikale/fallende Grenzen und Warnbanner sichtbar; kein Zuschnitt, keine Ladefehler.',
     'actualImage': next(r['actualCurrentNativeImage'] for r in context['wholeContexts'] if r['goal']['id'] == PB)},
]
roles = {'P2': {'decisions': P, 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
                'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate',
                'twoDemonstrationsMeaning': 'Independent reasoning and meaningful transfer, not an extra quota of task labels.'},
         'A2': {'decisions': A}, 'M2': {'decisions': M},
         'V2': {'decisions': V, 'accepted': 1, 'revise': 1,
                'actualNativeImagesSeen': 2, 'actualNewCurrentGoalCardViewsSeen': 4,
                'actualBrowserReceipt': ref(receipt_path)}}
for role, value in roles.items():
    first_path = OWN / f'science/FIRST.actual-informed-{role}.original.json'
    write(first_path, {'schemaVersion': 1, 'role': f'Own actual informed {role} before binding; current a698/c443',
                       'completedAtUTC': now, 'wholeActuallyReadInput': ref(context_path),
                       'original16MaterialAuthor': True, 'notAuthorOfCurrentTwoDescriptions': True,
                       'blindToOtherRuns': False, 'normalNewRecordsAtFIRST': 0,
                       'normalNewFingerprintsAtFIRST': 0,
                       'fourSourceCourseHoldsRemainOpen': True, 'newDOrSourceCourseHumanApproval': False,
                       'actualLearnerOrLabTrial': False, **value})
    write(OWN / f'science/FIRST.actual-informed-{role}.seal.json',
          {'schemaVersion': 1, 'role': f'Own original {role} sealed before any normal binding',
           'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'files': [ref(first_path)],
           'normalNewRecordsAtSeal': 0, 'normalNewFingerprintsAtSeal': 0, 'activeWrites': 0})
requirements_path = OWN / 'science/Kp.actual-mobile-reading-requirements.original.json'
write(requirements_path, {
    'role': 'Bounded V reading findings, not an image-generation prompt or expected verdict',
    'wholeCompetence': 'Derive and convert for ideal gas equilibria under specified standards; explain model limits.',
    'necessarySignals': [
        'The chosen Kp/Kc convention must be explicit and coherent. The current raw-product definitions justify their RT formula; normalized standards instead require RTc°/p°.',
        'The exponent denotes the sum of gaseous stoichiometric product coefficients minus the reactant coefficients; it is not an arbitrary instantaneous molar amount difference.',
        'T is absolute temperature and the ideal relation p_i=c_iRT is the operative model link. R and units must agree with the declared standards.',
        'Ideal-gas scope and a readable warning about real-gas/nonideal limits are relevant to the assigned whole profile.',
    ],
    'current316Problem': 'At316 image pixels the small product expressions and R/T/Δn legends cannot reliably communicate these meanings. Main formula/large headings alone do not repair their inaccessible definitions.',
    'notRequiredInSingleImage': [
        'Every full derivation step, both entire cases or all alternatives in one raster.',
        'Pressure gauge, beaker, many particle decorations or repeated title boxes.',
        'A quantitative real-gas solver, universal high/low thresholds or experimental data.',
    ],
    'textAndMaterialsRemainSeparate': 'The whole cases already supply valid definitions and reasoning; image correction must not claim measured learner performance or source/course coverage.',
    'actualBrowserReceipt': ref(receipt_path), 'normalBindings': 0,
})
selector_path = OWN / 'SELECTION.finite-prebinding-original-science-and-actual-V-views.json'
write(selector_path, {
    'schemaVersion': 1, 'role': 'Finite original prebinding science handoff; parent requested normal binding wait',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'goalIds': [KP, PB],
    'currentCanonical': context['finalCanonical'], 'currentSemantic': context['finalSemantic'],
    'wholeInput': ref(context_path),
    'FIRSTSeals': {r: ref(OWN / f'science/FIRST.actual-informed-{r}.seal.json') for r in roles},
    'actualNativeImagesSeen': 2, 'actualCurrentGoalCardViewsSeen': 4,
    'browserReceipt': ref(receipt_path), 'imageWidths': [316, 636],
    'originalVDecisions': {'Kp_JPG': 'revise_mobile_legibility', 'Pourbaix_PNG': 'accepted'},
    'readingRequirements': ref(requirements_path), 'P2BodiesSupportedUnchanged': True,
    'A2Atomic': 2, 'M2GenuineNoMemoryNeeded': 2,
    'normalPAMVMaterializations': 0, 'newFingerprints': 0, 'sourceImageCopies': 0,
    'fullBookOrNativeRenderer': False, 'newDOrSourceCourseHumanApproval': False,
    'fourSourceCourseHoldsRemainOpen': True,
    'pending': 'Parent actual image-only successor; reopen actual new pixels/context, preserve originals, then final normal binding once.',
})
seal_path = OWN / 'FILES.finite-prebinding-science-and-views.seal.json'
files = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != seal_path]
write(seal_path, {'schemaVersion': 1, 'role': 'Finite exact original prebinding science and actual views, no normal votes',
                  'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'selector': ref(selector_path),
                  'files': files, 'regularPayloadFiles': len(files), 'regularPayloadBytes': sum(r['bytes'] for r in files),
                  'sealExcludedFromOwnInventory': True, 'normalBindings': 0, 'activeWrites': 0})
for r in files:
    assert ref(REPO / r['path']) == r
print(json.dumps({'selector': ref(selector_path), 'seal': ref(seal_path),
                  'payloadFiles': len(files), 'normalBindings': 0, 'waitForActualNewImage': True}, indent=2))
