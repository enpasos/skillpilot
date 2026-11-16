from pathlib import Path
import copy
import datetime
import hashlib
import json
import uuid

BASE = Path(__file__).resolve().parent
inputs = json.loads((BASE / 'original-input-goals.json').read_text())
by_id = {g['id']: g for g in inputs}
charge = copy.deepcopy(by_id['28884133-b448-5eb2-a589-8907a78d7687'])
old_voltage_task = by_id['a7972e13-41f9-5f7b-bc43-5fe2699a4823']
rule = old_voltage_task['examData']['scoring']['steps'][0]['description'].split('\nDE-Schrittregel:', 1)[1]
rule = '\nDE-Schrittregel:' + rule
tail_de = '\n\nBewertung: höchstens 16 Punkte, bestanden ab 14. Fehlt ein wesentlicher Kern oder der verlangte unabhängige Transfer, erhält der betreffende Schritt höchstens 1 Punkt: selbst alle anderen vollen Schritte ergeben nur 13. Ein isolierter kleiner Fehler bei vollständig belegten Kernen kann mit 15 Punkten bestehen. Die Schrittregeln im Raster gelten; gleichwertige korrekte Wege und konsistente Folgefehler werden anerkannt.'
tail_en = '\n\nScoring: maximum 16 points, pass at 14. A missing essential core or required independent transfer caps its step at 1 point: even full marks on every other step total only 13. One isolated minor error with all cores evidenced can pass with 15. Apply the step rules; accept equivalent correct methods and consistent follow-through.'

def scoring(cores):
    return {'maxPoints': 16, 'passingPoints': 14,
            'steps': [{'id': f'k{i+1}', 'points': 4, 'description': core + rule}
                      for i, core in enumerate(cores)]}

charge['examData']['taskContent'] = charge['examData']['taskContent'].replace('(10 BE)', '(8 BE)')
charge['examData']['taskContentEn'] = charge['examData']['taskContentEn'].replace('(10 points)', '(8 points)')
charge['examData']['solutionContent'] += tail_de
charge['examData']['solutionContentEn'] += tail_en
charge['examData']['sourceArtifactPath'] = 'curricula/DE/Gymnasium/assessments/physik/by-electrical-acquisition-20261115/charge-pulses-v4.md'
charge['examData']['reviewNote'] = 'Unveröffentlichter aktueller Kandidat mit präziser nicht kompensierbarer Schrittrubrik; unabhängiges Inhaltsreview ausstehend. Der v3-Autorenvorschlag bleibt erhalten. Keine Lernendenresultate.'
charge['examData']['scoring'] = scoring([
    'A: Alle drei benannten Intervalle durch zugehörige Nettoänderung und Zeitdifferenz berechnen; A und C/s korrekt zuordnen. EN: Use the matching net charge change and time difference for all three intervals and identify A with C/s.',
    'A: Querschnitt, Bezugsrichtung, Vorzeichen und Zähleroffset deuten; die fehlerhaften Betrags- und Absolutquotienten widerlegen und die Richtungsumkehr erklären. EN: Interpret cross-section, reference direction, signs and counter offset; reject magnitude addition and absolute-reading quotients, and explain reversal.',
    'B: Für beide unabhängig definierten Geräte Puls- und Zyklusmittel mit ausdrücklich verschiedenen Zeitintervallen bestimmen und den Einfluss der Pause erklären. EN: Determine pulse and cycle averages for both independently defined devices, state their different intervals and explain the pause.',
    'B: Die geforderte Zeit bei P und Ladung bei R mit Einheiten bestimmen, physikalisch umstellen und die Vollzyklenbedingung gegenüber angebrochenen Intervallen erklären. EN: Find the requested time for P and charge for R with units, interpret the inverse relations and explain the complete-cycle restriction versus partial intervals.',
])

voltage_id = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://skillpilot.com/own-assessments/physics/2026-11-15/voltage-without-capacitance-v1'))
voltage = {
    'id': voltage_id,
    'shortKey': 'canonical_physics_voltage_work_field_geometry_without_capacitance',
    'title': 'Spannung und Feldarbeit an geordneten Punkten bestimmen',
    'titleEn': 'Determine voltage and field work between ordered points',
    'description': 'Die lernende Person kann in zwei unabhängigen vorgegebenen homogenen Feldmodellen Potenzialdifferenz, Energieänderung und Feldarbeit mit eindeutigen Vorzeichen bestimmen und bei veränderter Geometrie die feldparallele Strecke begründet wählen.',
    'descriptionEn': 'The learner can determine potential difference, energy change and field work with explicit signs in two independent supplied uniform-field models, and justify the field-parallel distance when the geometry changes.',
    'weight': 1, 'tags': ['GK', 'LK', 'Practice', 'Assessment', 'canonical'],
    'contains': [], 'requires': ['1730c01d-8c85-57df-b031-c11e2a0511b1'],
    'dimensionTags': {'framework': 'canonical-gymnasium-physics', 'demandLevel': 'AB3',
                      'processCompetencies': ['PK2_MODELLIEREN', 'PK3_MATHEMATISIEREN', 'PK4_KOMMUNIZIEREN'],
                      'guidingIdeas': ['LI_FELDER', 'LI_ENERGIE'], 'phase': 'GLOBAL'},
    'phase': 'GLOBAL', 'type': 'atomic',
    'applicability': copy.deepcopy(by_id['1730c01d-8c85-57df-b031-c11e2a0511b1']['applicability']),
    'extendedData': {'applicabilityFromRequires': True, 'applicabilityMappingInheritance': 'boundary'},
}
task_de = '''Zwei unabhängige idealisierte elektrostatische Feldmodelle sind vorgegeben. Die Probeladungen verändern die Felder nicht. Beschreibe jeweils das Modell mit einer eigenen Skizze. Verwende ausdrücklich U_BA = φ_B − φ_A für eine Bewegung A→B und entsprechend für andere Punktnamen. Lege deine Beziehungen zwischen Spannung, potenzieller Energie und Arbeit des elektrischen Felds offen.

A. Ein räumlich homogenes Feld der Stärke 240 V/m zeigt nach rechts. A liegt bei x=0, B bei x=0,25 m; φ_A=10 V. Bestimme φ_B, U_BA sowie für q=+2,0 μC und q=−2,0 μC jeweils die Änderung der potenziellen Energie und die Feldarbeit bei A→B. Begründe die Vorzeichen, die Bedeutung von 1 V=1 J/C und warum die Spannung nicht mit dem Vorzeichen der Probeladung wechselt. Bestimme anschließend die entsprechenden Änderungen für B→A mit positiver Ladung. Was ändert sich an den Potenzialwerten, der Spannung und der Feldarbeit, wenn der gemeinsame Potenzialnullpunkt so verschoben wird, dass zu allen Potenzialwerten 80 V addiert werden? (8 BE)

B. Ein anderes homogenes Feld zeigt ebenfalls nach rechts und hat die Stärke 1,50 kV/m. P liegt bei (0 cm,0 cm), Q bei (6,0 cm,8,0 cm); die gerade Verbindung ist 10,0 cm lang. φ_P=0. Zeichne Feldrichtung und Punkte. Wähle und begründe die Strecke für die Spannungsberechnung, bestimme φ_Q und U_QP sowie Energieänderung und Feldarbeit für q=−4,0 μC bei P→Q. Prüfe die Behauptung, der Spannungsbetrag sei 150 V, weil die volle Verbindungsstrecke einzusetzen sei. Verschiebe dann nur den Endpunkt auf Q′=(0 cm,8,0 cm): Was folgt jetzt für Spannung und Feldarbeit? Benenne die Voraussetzung für den verwendeten konstanten Feldwert und begründe, warum du E·d nicht unverändert mit einem einzigen Feldwert auf ein räumlich inhomogenes Feld übertragen darfst. (8 BE)'''
task_en = '''Two independent idealised electrostatic field models are supplied. The test charges do not change the fields. Sketch each model yourself. Explicitly use U_BA = φ_B − φ_A for motion A→B, and the corresponding order for other point names. State your relations between voltage, potential energy and work done by the electric field.

A. A spatially uniform field of 240 V/m points rightward. A is at x=0 and B at x=0.25 m; φ_A=10 V. Determine φ_B and U_BA, and the potential-energy change and field work for q=+2.0 μC and q=−2.0 μC moving A→B. Explain the signs, the meaning of 1 V=1 J/C, and why changing the test-charge sign does not change the voltage. Then find the corresponding changes for positive charge moving B→A. What happens to the potential values, voltage and field work if the common potential reference is shifted so that 80 V is added to every potential value? (8 points)

B. A different uniform field points rightward with strength 1.50 kV/m. P is at (0 cm,0 cm), Q at (6.0 cm,8.0 cm); the straight connection is 10.0 cm long. φ_P=0. Draw the field and points. Choose and justify the distance for calculating voltage, then find φ_Q and U_QP, energy change and field work for q=−4.0 μC moving P→Q. Assess the claim that the voltage magnitude is 150 V because the whole connecting distance must be used. Move only the endpoint to Q′=(0 cm,8.0 cm): what are the voltage and field work now? State the assumption behind the constant field value and explain why E·d with one field value cannot be transferred unchanged to a spatially non-uniform field. (8 points)'''
solution_de = '''Für jede geordnete Bewegung gilt ΔE_pot=q·U und W_Feld=−ΔE_pot. Das Potenzial fällt in Feldrichtung; eine gemeinsame Verschiebung des Referenzwerts ändert keine Differenz.
A: U_BA=−240 V/m·0,25 m=−60 V; φ_B=−50 V. Positive Ladung: ΔE_pot=−120 μJ, W_Feld=+120 μJ. Negative Ladung: ΔE_pot=+120 μJ, W_Feld=−120 μJ. Die Feldarbeit auf die negative Ladung ist bei dieser vorgegebenen Bewegung negativ; die Bewegung muss deshalb nicht ihrer freien Beschleunigungsrichtung entsprechen. Bei B→A und positiver Ladung: U_AB=+60 V, ΔE_pot=+120 μJ, W_Feld=−120 μJ. 1 V bezeichnet 1 J Energieänderung pro Coulomb bei der festgelegten Punktreihenfolge. Die Probeladung beeinflusst im Modell weder Feld noch Spannung. Nach Referenzverschiebung: φ_A=90 V, φ_B=30 V; alle Spannungen, Energieänderungen und Feldarbeiten bleiben gleich.
B: Entscheidend ist die feldparallele Änderung Δx=6,0 cm=0,060 m. Daher U_QP=−1500 V/m·0,060 m=−90 V und φ_Q=−90 V. Bei q=−4,0 μC: ΔE_pot=+360 μJ, W_Feld=−360 μJ. Die 8,0 cm senkrecht zum Feld ändern das Potenzial nicht; 150 V verwendet daher die falsche Strecke. Für Q′ gilt Δx=0, U_Q′P=0 und W_Feld=0. Die Rechnung verwendet das vorgegebene elektrostatische Feld und die Probeladung. Der einfache konstante Faktor E setzt ein homogenes Feld voraus; bei räumlich variablem Feld müssen dessen Änderungen entlang des Wegs berücksichtigt werden. Eine Integralrechnung wird nicht verlangt.'''
solution_en = '''For every ordered displacement, ΔE_pot=q·U and W_field=−ΔE_pot. Potential decreases in the field direction; a common reference shift does not change differences.
A: U_BA=−240 V/m×0.25 m=−60 V; φ_B=−50 V. Positive charge: ΔE_pot=−120 μJ and W_field=+120 μJ. Negative charge: ΔE_pot=+120 μJ and W_field=−120 μJ. Field work on the negative charge is negative for this specified displacement, which need not follow its free acceleration. For positive charge moving B→A: U_AB=+60 V, ΔE_pot=+120 μJ and W_field=−120 μJ. One volt means one joule of energy change per coulomb with the specified point order. The test charge changes neither the supplied field nor voltage. After shifting the reference, φ_A=90 V and φ_B=30 V; all voltages, energy changes and field work stay the same.
B: The field-parallel change is Δx=6.0 cm=0.060 m. Thus U_QP=−1500 V/m×0.060 m=−90 V and φ_Q=−90 V. For q=−4.0 μC, ΔE_pot=+360 μJ and W_field=−360 μJ. The perpendicular 8.0 cm contributes no potential change; 150 V uses the wrong distance. Q′ gives Δx=0, U_Q′P=0 and W_field=0. The calculation uses the supplied electrostatic field and test charge. The simple constant factor E requires a uniform field; spatial field changes must otherwise be considered along the path. No integration is required.'''
voltage['examData'] = {
    'reviewStatus': 'needs_review', 'coveredGoalIds': ['1730c01d-8c85-57df-b031-c11e2a0511b1'],
    'coveredStrands': ['LI_FELDER', 'LI_ENERGIE'], 'demandLevels': ['AB1', 'AB2', 'AB3'],
    'sourceArtifactPath': 'curricula/DE/Gymnasium/assessments/physik/by-electrical-acquisition-20261115/voltage-without-capacitance.md',
    'reviewNote': 'Eigener unveröffentlichter Aufgabenkandidat, CC-BY-4.0. Unabhängige Inhalts- und Abdeckungsprüfung ausstehend; keine offizielle Aufgabenquelle oder Unterrichtswirkung behauptet.',
    'taskContent': task_de, 'taskContentEn': task_en,
    'solutionContent': solution_de + tail_de, 'solutionContentEn': solution_en + tail_en,
    'scoring': scoring([
        'A: Potenzialbezug, geordnete Spannung und Einheit J/C begründen; beide Ladungsvorzeichen mit zugehöriger Energieänderung und entgegengesetzter Feldarbeit konsistent bestimmen. EN: Explain reference, ordered voltage and J/C; consistently determine energy change and opposite field work for both charge signs.',
        'A: Feldrichtung und parallele Strecke zur Potenzialänderung verbinden; Bewegung umkehren und die gemeinsame Referenzverschiebung an Potenzialwerten sowie unveränderten Differenzen und Arbeiten erklären. EN: Connect field direction and parallel distance with potential change; reverse the motion and explain the reference shift, changed potentials and unchanged differences/work.',
        'B: Im unabhängigen schrägen Fall den feldparallelen Abstand selbst wählen, die Rechnung mit der vollen Strecke widerlegen und Spannung, Energieänderung und Feldarbeit der negativen Ladung begründet ermitteln. EN: Independently select the parallel distance in the oblique case, refute use of the full distance, and justify voltage, energy change and work for negative charge.',
        'B: Beim rein senkrechten Endpunktwechsel Spannung und Feldarbeit vorhersagen und begründen; die Voraussetzung eines homogenen gegebenen Felds von einem inhomogenen Feld unterscheiden. EN: Predict and explain voltage and work for the perpendicular endpoint change; distinguish the given uniform-field assumption from a non-uniform field.',
    ]),
}
out = {'status': 'AUTHOR_CANDIDATES_REVIEW_PENDING', 'goals': [charge, voltage]}
(BASE / 'candidate-tasks-v1.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
for goal in out['goals']:
    e = goal['examData']
    md = f"# {goal['title']}\n\nEigene SkillPilot-Aufgabe, CC-BY-4.0. Aktueller Kandidat; unabhängiges Review ausstehend.\n\n## Aufgabe\n\n{e['taskContent']}\n\n## Lösung\n\n{e['solutionContent']}\n\n## English task\n\n{e['taskContentEn']}\n\n## English solution\n\n{e['solutionContentEn']}\n\n## Bewertung / Scoring\n\n"
    md += '\n\n'.join(f"### {s['id']} — {s['points']} Punkte / points\n\n{s['description']}" for s in e['scoring']['steps']) + '\n'
    (BASE / Path(e['sourceArtifactPath']).name).write_text(md)
print(json.dumps({'candidate': str(BASE / 'candidate-tasks-v1.json'), 'newGoalId': voltage_id}))
