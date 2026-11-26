#!/usr/bin/env python3
"""Authoring source. Do not supply this file to blind markers."""
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
REL = "curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/k3/v1"
GOAL = "2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b"

task_de = """Ein Körper mit konstanter Masse m wird als Massepunkt betrachtet. In einem Inertialsystem beschleunigt ihn eine konstante resultierende Kraft F aus der Ruhe geradlinig. Nach der Zeit T > 0 hat er den Geschwindigkeitsbetrag V > 0 und den Weg Δs zurückgelegt.

Leite die Formel seiner kinetischen Energie bei V aus der Beschleunigungsarbeit her. Zeige den Arbeitsansatz, den Zusammenhang mit Newtons zweitem Axiom und den Bewegungsgesetzen sowie das Umformen bis zur Energieformel.

Begründe den Faktor ½ mit einem beschrifteten Zeit-Geschwindigkeits-Diagramm. Eine eindeutige Beschreibung mit Achsen, Einheiten, Verlauf, Endpunkt und Flächenbedeutung ist gleichwertig.

Erkläre aus deiner Herleitung, wie die Energie bei gleicher Masse vom Geschwindigkeitsbetrag abhängt. Welcher Energiefaktor folgt bei doppeltem Geschwindigkeitsbetrag? Eine Zahlenrechnung mit einer schon bekannten Energieformel ersetzt die Herleitung nicht."""

task_en = """A constant-mass object of mass m is modelled as a particle. In an inertial frame, a constant net force F accelerates it from rest in a straight line. After a time T > 0 it has speed V > 0 and has travelled a distance Δs.

Derive the formula for its kinetic energy at V from the work done by the net force. Show the work approach, its connection to Newton's second law and the equations of motion, and the rearrangement leading to the energy formula.

Justify the factor ½ using a labelled velocity–time graph. An unambiguous description giving the axes, units, line, endpoint and area meaning is equally acceptable.

Use your derivation to explain how the energy depends on speed at fixed mass. By what factor does the energy change when speed doubles? A numerical calculation using an already known energy formula does not replace the derivation."""

answer_de = """W = F·Δs = ΔEₖᵢₙ. Wegen des Starts aus der Ruhe gilt Eₖᵢₙ = W. Newton II und die konstante Beschleunigung liefern F = ma und V = aT, also F = mV/T.

Im Diagramm steht t in s waagerecht und die Geschwindigkeit u in m/s senkrecht. Die Gerade führt von (0, 0) nach (T, V). Ihre Dreiecksfläche ist der Weg: Δs = TV/2. Der Faktor ½ stammt aus dem halben Rechteck mit Grundseite T und Höhe V.

Einsetzen: Eₖᵢₙ = (mV/T)(TV/2) = ½mV². Bei gleicher Masse gilt Eₖᵢₙ(kV)/Eₖᵢₙ(V) = k², da beide Geschwindigkeitsfaktoren mit k wachsen. Für k = 2 ist der Energiefaktor 4. Gleichwertig ist der Weg über Δs = ½aT² und V = aT, ergänzt um die grafische Begründung."""

answer_en = """W = F·Δs = ΔEₖ. Since the object starts at rest, Eₖ = W. Newton's second law and constant acceleration give F = ma and V = aT, hence F = mV/T.

The graph has time t in s horizontally and velocity u in m/s vertically. Its straight line runs from (0, 0) to (T, V). The triangular area is the distance: Δs = TV/2. The factor ½ comes from half the rectangle of base T and height V.

Substitution gives Eₖ = (mV/T)(TV/2) = ½mV². At fixed mass Eₖ(kV)/Eₖ(V) = k² because both speed factors grow by k. For k = 2 the energy factor is 4. Deriving the result using Δs = ½aT² and V = aT, together with the graphical justification, is equally valid."""

mark_de = """**Bewertung**

Vier Leistungen zu je 3 P; bestanden allein ab 10 von 12 P. Belege zählen überall; gleichwertige Herleitungen und die verlangte eindeutige Diagrammbeschreibung zählen voll. Die grafische Begründung bleibt erforderlich, auch bei einem anderen Rechenweg. Die bekannte Endformel allein belegt keine Herleitung.

Ein nachweislich kleiner isolierter Form-/Ausführungsfehler bei sichtbar richtigem Kern kostet 0,5 P einmal an seinem Ursprung, höchstens die dort vorhandenen Punkte. Für seine konsistenten Folgen nichts erneut abziehen. Verschiedene unabhängige kleine Fehler dürfen je 0,5 P kosten. Fehlende Graph-Einheiten als gemeinsame Formangabe kosten insgesamt einmal 0,5 P in C. Fehlende fachliche Belege erhalten die angegebenen Teilpunkte, keinen zusätzlichen Fehlerabzug.

Eine ausdrücklich beibehaltene fachliche Fehlvorstellung setzt die betroffene tragende Leistung auf 0, auch neben einer richtigen Formel. Eine ausdrückliche Rücknahme im selben Text hebt den Widerspruch auf. Einmal bewertete falsche Prämissen kosten in anderen Leistungen keine Folgepunkte; dort zählt die tatsächlich gezeigte Weiterarbeit. Keine fehlenden Belege aus dem Endergebnis ergänzen. Keine zusätzliche Sperre neben der Summe."""

mark_en = """**Scoring**

Four performances carry 3 points each; 10 out of 12 passes by the total alone. Credit evidence wherever it occurs, equivalent derivations and the required unambiguous graph description. The graphical justification remains required with another calculation method. The known final formula alone does not establish derivation.

A demonstrably isolated minor formal/execution slip with visibly sound core reasoning costs 0.5 once at its origin, capped by the points available there. Do not deduct again for consistent consequences. Distinct independent minor slips may each cost 0.5. Missing graph units, as a common reporting omission, cost 0.5 once altogether in C. Missing subject evidence receives the specified partial credit with no extra error deduction.

An explicit maintained misconception sets its carrying performance to 0, even alongside a correct formula. Explicit retraction in the same response resolves the contradiction. A wrong premise already scored causes no consequential losses in other performances; credit the actual follow-through there. Do not reconstruct absent evidence from a final answer. There is no additional condition beyond the total."""

steps = [
    {"id": "A", "points": 3, "description": "Arbeit und Energie: 1,5 P für W = F·Δs mit der resultierenden Kraft in Bewegungsrichtung; 1,5 P für W = ΔEₖᵢₙ und Eₖᵢₙ = W beim Start aus der Ruhe, auch eindeutig in einer Gleichungskette. Beide Anteile unabhängig; bloßes Nennen von „Arbeit“/„Energie“ genügt nicht. Eine Herleitung nur von W = ½mV² ohne Zuordnung zur kinetischen Energie erhält hier nur den Arbeitsanteil. Aufrechterhaltene gegenteilige Aussage (etwa: stets genügt die Arbeit irgendeiner Einzelkraft statt der resultierenden) setzt A auf 0. Gemeinsame Fehlerregel anwenden. / EN: Work and energy: 1.5 for W = F·Δs using the net force along the motion; 1.5 for W = ΔEₖ and Eₖ = W from rest, including an unambiguous equation chain. The allocations are independent; merely naming 'work'/'energy' is insufficient. Deriving only W = ½mV² without identifying it as kinetic energy earns only the work allocation here. A maintained contrary assertion (e.g. the work of any one force always suffices instead of net-force work) sets A to 0. Apply the shared slip policy."},
    {"id": "B", "points": 3, "description": "Verknüpfung der Gesetze: je 1 P für (i) angewandtes Newton II und Bewegungsgesetz derselben Bewegung, z.B. F = ma, V = aT bzw. F = mV/T; (ii) Verknüpfen mit einem passenden Weggesetz, z.B. W = (mV/T)(TV/2) oder W = ma·½aT²; (iii) daraus nachvollziehbares Eliminieren von a/T zu ½mV² als Arbeit oder Energie. Algebraisch gleichwertige Ketten zählen; keine vorgeschriebene Zahl von Zwischenzeilen. Eine bloß hingeschriebene Energieformel erhält hier 0. Fehlt allein die Energiezuordnung, nur A belasten. Eine eigene bereits bewertete falsche Weg-/Arbeitsprämisse darf hier konsistent weiterverarbeitet werden; sie ersetzt keine fehlende Verknüpfung. Aufrechterhaltene falsche Dynamik oder Umformungsregel setzt B auf 0; ein nachweislich lokaler Aussetzer folgt der gemeinsamen Fehlerregel. / EN: Connecting the laws: 1 each for (i) applied Newton II and a motion law for the same motion, e.g. F = ma, V = aT or F = mV/T; (ii) combining with an appropriate distance law, e.g. W = (mV/T)(TV/2) or W = ma·½aT²; (iii) checkably eliminating a/T to obtain ½mV² as work or energy. Equivalent chains count; no fixed number of intermediate lines is required. A merely stated energy formula earns 0 here. Charge a missing energy identification only in A. Consistent follow-through with a previously scored wrong distance/work premise counts here but cannot supply a missing connection. A maintained false dynamics/rearrangement rule sets B to 0; a demonstrably local slip uses the shared policy."},
    {"id": "C", "points": 3, "description": "Grafische Begründung: je 1 P für (i) zugeordnete Zeit-/Geschwindigkeitsachsen mit t in s und u in m/s; (ii) die Gerade von (0,0) bis (T,V) samt zugehöriger Dreiecksfläche; (iii) Deuten dieser Fläche als Weg Δs = TV/2 und des halben Faktors als Dreieck gegenüber Rechteck. Eine eindeutige Beschreibung ist gleichwertig. Bloßes Δs = TV/2 ohne Bezug auf eine Darstellung belegt nichts in C. Nur fehlende/falsch geschriebene Einheiten bei klaren Größen: gemeinsamer Formfehler −0,5 hier, kein weiterer Verlust von (i). Ein bloßer fehlender Achsenpfeil kostet nichts. Eine aufrechterhaltene falsche Flächenbedeutung oder rechteckige Wegfläche trotz Start aus der Ruhe setzt C auf 0, auch bei sonst richtigem Bild/Endergebnis. Formelherleitung in B bleibt eigenständig bewertet. / EN: Graphical justification: 1 each for (i) assigned time/velocity axes with t in s and u in m/s; (ii) the straight line from (0,0) to (T,V) and its triangle; (iii) interpreting that area as distance Δs = TV/2 and the half factor as triangle versus rectangle. An unambiguous description is equivalent. Bare Δs = TV/2 without reference to a representation establishes nothing in C. Units alone missing/miswritten with clear quantities: shared formal slip of −0.5 here, with no further loss of (i). Missing axis arrowheads alone cost nothing. A maintained false area meaning or rectangular distance area despite starting from rest sets C to 0, even beside an otherwise correct graph/final result. Assess B's derivation independently."},
    {"id": "D", "points": 3, "description": "Abhängigkeit von der Geschwindigkeit: Die Energieformel allein ohne Abhängigkeitsaussage erhält hier 0. Je 1 P für (i) Eₖᵢₙ proportional V² bei gleicher Masse; (ii) die Erklärung mit beiden Geschwindigkeitsfaktoren oder dem allgemeinen Verhältnis Eₖᵢₙ(kV)/Eₖᵢₙ(V) = k²; (iii) den konkreten Faktor 4 bei doppeltem Geschwindigkeitsbetrag. Ein nur behauptetes „quadratisch, doppelt ergibt vierfach“ belegt (i) und (iii), keine Erklärung in (ii). Begründeter konkreter Quotient (2V)²/V² = 4 belegt alle drei Anteile. Eine fehlerhafte vorangegangene Konstante nicht erneut abziehen: bei konsistenter Quadratabhängigkeit D voll anerkennen. Eine ausdrücklich aufrechterhaltene lineare Abhängigkeit setzt D auf 0, auch neben der richtigen Energieformel oder dem Faktor 4. Rücknahme und lokale Fehler nach gemeinsamer Regel. / EN: Speed dependence: The energy formula alone without a dependence statement earns 0 here. 1 each for (i) kinetic energy proportional to V² at fixed mass; (ii) explaining this using both speed factors or the general ratio Eₖ(kV)/Eₖ(V) = k²; (iii) the specific factor 4 when speed doubles. Merely asserting 'quadratic, double means fourfold' establishes (i) and (iii), not the explanation in (ii). A reasoned specific quotient (2V)²/V² = 4 establishes all three. Do not penalise a wrong preceding constant again: fully credit consistent square dependence. An explicit maintained linear dependence sets D to 0, even beside the correct energy formula or factor 4. Apply the shared retraction and local-slip policy."},
]

candidate = {
    "id": "e0085acf-af64-5c73-8abf-85a5bbfbdaa6",
    "shortKey": "canonical_physics_e2_assessment_kinetic_energy_derivation",
    "title": "Prüfungsaufgabe: Die Formel der kinetischen Energie herleiten",
    "titleEn": "Assessment Task: Derive the Kinetic Energy Formula",
    "description": "Die lernende Person kann die Formel der kinetischen Energie aus der Beschleunigungsarbeit und den Bewegungsgesetzen herleiten, den Faktor ½ grafisch begründen und die Quadratabhängigkeit vom Geschwindigkeitsbetrag erklären.",
    "descriptionEn": "The learner can derive the kinetic energy formula from net-force work and the equations of motion, justify the factor ½ graphically and explain the square dependence on speed.",
    "weight": 0.9,
    "tags": ["GK", "LK", "Practice", "Assessment", "canonical"],
    "type": "atomic",
    "contains": [],
    "requires": [GOAL],
    "dimensionTags": {
        "framework": "canonical-gymnasium-physics", "demandLevel": "AB2",
        "processCompetencies": ["PK3_MATHEMATISIEREN", "PK4_KOMMUNIZIEREN"],
        "guidingIdeas": ["LI_ENERGIE"], "phase": "E", "area": "Mechanik und Energie",
        "topicCode": "CANONICAL.PHYSICS.E2.PRACTICE.KINETIC_ENERGY_DERIVATION"
    },
    "applicability": {"jurisdiction": ["DE-HE", "DE-SL", "DE-SN"]},
    "extendedData": {
        "applicabilityMappingInheritance": "boundary",
        "applicabilityOverrides": {"jurisdiction": ["DE-HE", "DE-SL", "DE-SN"]}
    },
    "examData": {
        "reviewStatus": "needs_review", "coveredGoalIds": [GOAL],
        "coveredStrands": ["LI_ENERGIE"], "demandLevels": ["AB2"],
        "sourceArtifactPath": REL + "/task-and-marking.md",
        "taskContent": task_de, "taskContentEn": task_en,
        "solutionContent": answer_de + "\n\n" + mark_de,
        "solutionContentEn": answer_en + "\n\n" + mark_en,
        "scoring": {"maxPoints": 12, "passingPoints": 10, "steps": steps}
    }
}

def save_json(path, obj):
    (BASE / path).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

save_json("candidate.goal.json", candidate)
save_json("rubric.json", candidate["examData"]["scoring"])
(BASE / "task-and-marking.md").write_text(
    "# Prüfungsaufgabe: Die Formel der kinetischen Energie herleiten\n\n"
    "## Aufgabe\n\n" + task_de + "\n\n## Lösung und Bewertung\n\n" + answer_de + "\n\n" + mark_de
    + "\n\n" + "\n\n".join("**" + s["id"] + " · " + str(s["points"]) + " P**\n\n" + s["description"].split(" / EN: ")[0] for s in steps)
    + "\n\n# Assessment Task: Derive the Kinetic Energy Formula\n\n## Task\n\n" + task_en
    + "\n\n## Solution and scoring\n\n" + answer_en + "\n\n" + mark_en
    + "\n\n" + "\n\n".join("**" + s["id"] + " · " + str(s["points"]) + " points**\n\n" + s["description"].split(" / EN: ")[1] for s in steps) + "\n"
)

# Fully written submissions; all content below is material a learner might submit.
# Case IDs deliberately carry no judgement. Expected results stay in author/.
A_DE = "Die Arbeit der resultierenden Kraft ist W = F·Δs. Sie ist die Änderung der kinetischen Energie. Wegen des Starts aus der Ruhe gilt Eₖᵢₙ = W."
A_EN = "The net-force work is W = F·Δs. It is the change in kinetic energy. Since the object starts at rest, Eₖ = W."
B_DE = "Newton II liefert F = ma; wegen konstanter Beschleunigung aus der Ruhe gilt V = aT, also F = mV/T. Damit Eₖᵢₙ = W = (mV/T)(TV/2) = mV·V/2 = ½mV²."
B_EN = "Newton's second law gives F = ma; constant acceleration from rest gives V = aT, so F = mV/T. Thus Eₖ = W = (mV/T)(TV/2) = mV·V/2 = ½mV²."
C_DE = "Mein Diagramm: waagerecht t in s, senkrecht u in m/s. Die Gerade verläuft von (0,0) bis (T,V). Unter ihr liegt ein Dreieck mit Grundseite T und Höhe V. Seine Fläche ist der Weg Δs = TV/2; die Hälfte stammt vom halben Rechteck, nicht von einer halben Kraft."
C_EN = "My graph: horizontal t in s, vertical u in m/s. The straight line runs from (0,0) to (T,V). Below it is a triangle of base T and height V. Its area is the distance Δs = TV/2; the half comes from half the rectangle, not half a force."
D_DE = "Bei gleicher Masse ist Eₖᵢₙ proportional V². Im Verhältnis Eₖᵢₙ(kV)/Eₖᵢₙ(V) = k² tragen die beiden Geschwindigkeitsfaktoren jeweils k bei. Doppelte Geschwindigkeit gibt vierfache Energie."
D_EN = "At fixed mass Eₖ is proportional to V². In the ratio Eₖ(kV)/Eₖ(V) = k² each of the two speed factors contributes k. Double speed gives four times the energy."

def response(a=A_DE, b=B_DE, c=C_DE, d=D_DE):
    return "\n\n".join(x for x in (a, b, c, d) if x)

def response_en(a=A_EN, b=B_EN, c=C_EN, d=D_EN):
    return "\n\n".join(x for x in (a, b, c, d) if x)

scripts = []
expectations = []

def add(case_id, de, en, scores, rationale, purpose):
    scripts.append({"id": case_id, "responseDe": de, "responseEn": en})
    total = sum(scores)
    expectations.append({"id": case_id, "expectedPoints": dict(zip("ABCD", scores)), "expectedTotal": total,
                         "expectedPass": total >= 10, "rationale": rationale, "purpose": purpose})

work_only_de = "Die Arbeit der resultierenden Kraft ist W = F·Δs."
work_only_en = "The work of the net force is W = F·Δs."
work_chain_de = "F = ma und V = aT, also F = mV/T. Für die Arbeit folgt W = (mV/T)(TV/2) = ½mV². Eine Zuordnung dieser Arbeit zu einer Energie nehme ich hier nicht vor."
work_chain_en = "F = ma and V = aT, so F = mV/T. For the work, W = (mV/T)(TV/2) = ½mV². I do not identify this work with an energy here."
independent_d_de = "Unabhängig von der Arbeitsrechnung verwende ich für die Energie die mir bekannte Formel Eₖᵢₙ = ½mV². Bei gleicher Masse folgt Eₖᵢₙ(kV)/Eₖᵢₙ(V) = k² aus den beiden Geschwindigkeitsfaktoren. Doppelte Geschwindigkeit gibt vierfache Energie."
independent_d_en = "Independently of the work calculation I use the kinetic energy formula I know, Eₖ = ½mV². At fixed mass Eₖ(kV)/Eₖ(V) = k² follows from the two speed factors. Double speed gives four times the energy."
graph_unit_de = C_DE.replace("senkrecht u in m/s.", "senkrecht u in m/s².") + " Der Endwert V ist ein Geschwindigkeitsbetrag in m/s."
graph_unit_en = C_EN.replace("vertical u in m/s.", "vertical u in m/s².") + " The endpoint V is a speed in m/s."
work_unit_de = work_chain_de + " Die Einheit aus F·Δs ist N·m; an mein Endergebnis schreibe ich W = ½mV² [N]."
work_unit_en = work_chain_en + " The unit from F·Δs is N·m; I label my final result W = ½mV² [N]."

add("S01", response(), response_en(), [3,3,3,3], "Alle vier Leistungen vollständig; Beschreibung ersetzt ein gezeichnetes Diagramm.", "Vollständiger Referenzfall")
add("S02", response(a=work_only_de, b=work_chain_de, d=independent_d_de), response_en(a=work_only_en, b=work_chain_en, d=independent_d_en), [1.5,3,3,3], "Arbeitsdefinition vorhanden, explizit keine Zuordnung zur kinetischen Energie. B leitet den Arbeitswert vollständig her; D bleibt unabhängig richtig.", "Eine fehlende Facette; 10,5 Punkte")
add("S03", response(b=B_DE + " Als Ergebniseinheit schreibe ich N; aus dem Produkt zuvor folgt N·m."), response_en(b=B_EN + " I write N as the result unit; the preceding product gives N·m."), [3,2.5,3,3], "Ein isolierter Einheitenfehler am Ergebnis in B; richtige Einheit im selben Arbeitsgang belegt den Kern. Nicht erneut in A oder D belasten.", "Kleiner Formfehler allein")
add("S04", response(a=work_only_de, b=work_chain_de, c=graph_unit_de, d=independent_d_de), response_en(a=work_only_en, b=work_chain_en, c=graph_unit_en, d=independent_d_en), [1.5,3,2.5,3], "Wie S02, dazu ein isolierter Achseneinheitenfehler; C einmal −0,5. Genau 10 Punkte, Bestehen allein nach Summe.", "Bestehensgrenze mit kleiner Unachtsamkeit")
add("S05", response(c=""), response_en(c=""), [3,3,0,3], "Korrekte Energieherleitung und Quadratbegründung, aber überhaupt kein Diagramm oder darstellungsbezogener Flächennachweis. Das Weggesetz in B ist keine grafische Begründung.", "Grafische Leistung vollständig ausgelassen")
add("S06", response(a=work_only_de, b=work_unit_de, c=graph_unit_de, d=independent_d_de), response_en(a=work_only_en, b=work_unit_en, c=graph_unit_en, d=independent_d_en), [1.5,2.5,2.5,3], "Fehlende Energiezuordnung wie S02; zwei nachweislich unabhängige lokale Einheitenfehler in B und C jeweils einmal −0,5. 9,5 Punkte.", "Unterhalb der Bestehensgrenze")
add("S07", response(b=B_DE + " Zusätzlich behaupte ich: Newtons zweites Axiom lautet allgemein F = mV, nicht F = ma. Diese Aussage halte ich aufrecht."), response_en(b=B_EN + " I also assert that Newton's second law is generally F = mV, not F = ma. I maintain this assertion."), [3,0,3,3], "Aufrechterhaltene falsche Dynamik widerspricht B und setzt diese Leistung auf null, auch neben der richtigen Kette. A, C, D bleiben belegt.", "Fehlvorstellung neben richtiger Formel")
add("S08", response(d=D_DE + " Trotzdem gilt nach meiner Auffassung bei gleicher Masse eine lineare Energieabhängigkeit; verdoppeln müsste die Energie nur verdoppeln. Ich bleibe bei dieser Aussage."), response_en(d=D_EN + " Nevertheless, I believe energy depends linearly on speed at fixed mass; doubling speed should only double energy. I maintain this assertion."), [3,3,3,0], "Der aufrechterhaltene lineare Zusammenhang setzt D auf null. Die danebenstehende richtige Verhältnisformel ist keine Rücknahme.", "Widerspruch in der Quadratabhängigkeit")
add("S09", response(a=A_DE + " Allgemein darf ich hierfür stets die Arbeit irgendeiner einzelnen Kraft statt der resultierenden einsetzen, auch wenn andere Kräfte ebenfalls Arbeit verrichten. Das halte ich aufrecht."), response_en(a=A_EN + " In general I may always use the work of any single force instead of the net force, even when other forces also do work. I maintain this assertion."), [0,3,3,3], "Aufrechterhaltene falsche Einzelkraftregel setzt A auf null. Die anderen gezeigten Leistungen verwenden den gegebenen resultierenden Wert und bleiben richtig.", "Fehlvorstellung im Arbeitsansatz")
add("S10", response(c=C_DE + " Allerdings bedeutet die Fläche unter dieser Geschwindigkeitsgeraden nach meiner Auffassung Beschleunigung, nicht Weg. Ich halte daran fest."), response_en(c=C_EN + " However, I believe the area below this velocity line means acceleration, not distance. I maintain that assertion."), [3,3,0,3], "Falsche aufrechterhaltene Flächenbedeutung setzt C auf null, ohne bereits korrekte selbstständige Gesetzesverknüpfung B zu entwerten.", "Fehlvorstellung in der Grafik")
add("S11", response(b="", d=independent_d_de), response_en(b="", d=independent_d_en), [3,0,3,3], "A, C und D sind vorhanden. Eine bekannte Energieformel und das Wegdiagramm ersetzen nicht die fehlende Anwendung und Verknüpfung von Newton II und Bewegungsgesetzen.", "Dynamisch-kinematische Herleitung fehlt")
add("S12", response(d=""), response_en(d=""), [3,3,3,0], "Die Energieformel selbst ist kein zusätzlicher Beleg für den nicht beantworteten Erklärungs-/Verdopplungsteil D.", "Geschwindigkeitsabhängigkeit nicht bearbeitet")
add("S13", response(b="Newton II: F = ma, V = aT, also F = mV/T. Einsetzen: Eₖᵢₙ = W = (mV/T)(TV/2). Beim Vereinfachen schreibe ich Eₖᵢₙ = mV²."), response_en(b="Newton II: F = ma, V = aT, so F = mV/T. Substitution: Eₖ = W = (mV/T)(TV/2). On simplifying I write Eₖ = mV²."), [3,2.5,3,3], "Richtiger lokaler Ansatz mit ½ und richtige graphische Erklärung belegen den isolierten algebraischen Aussetzer. Nur B verliert 0,5; unveränderte Quadratabhängigkeit erhält D voll.", "Ein Formfehler mit konsistenten Folgen")
add("S14", "Ich kenne Eₖᵢₙ = ½mV². Für m = 2 kg und V = 3 m/s ergibt Einsetzen 9 J. Bei gleicher Masse ergibt der Quotient (2V)²/V² = 4; die Energie wächst quadratisch mit der Geschwindigkeit.", "I know Eₖ = ½mV². Substituting m = 2 kg and V = 3 m/s gives 9 J. At fixed mass the ratio (2V)²/V² = 4; energy grows quadratically with speed.", [0,0,0,3], "Richtige Zahlenrechnung und richtige Quadratbegründung, aber keine Arbeitsbeziehung, keine dynamische Herleitung und keine Grafik.", "Zahlenlösung darf die Herleitung nicht ersetzen")
add("S15", response(b="Mit F = ma, Δs = ½aT² und V = aT erhalte ich Eₖᵢₙ = W = ma·½aT² = ½m(aT)² = ½mV²."), response_en(b="Using F = ma, Δs = ½aT² and V = aT gives Eₖ = W = ma·½aT² = ½m(aT)² = ½mV²."), [3,3,3,3], "Gleichwertiger algebraischer Weg über die Ortsgleichung; grafischer Nachweis separat vollständig vorhanden.", "Gleichwertige elementare Herleitung")
add("S16", response(c=C_DE + " Zuerst dachte ich, die Fläche bedeute Beschleunigung. Das nehme ich ausdrücklich zurück: Unter der Geschwindigkeitskurve ist die Fläche hier der Weg."), response_en(c=C_EN + " At first I thought the area meant acceleration. I expressly retract that: the area under this velocity curve is the distance here."), [3,3,3,3], "Ausdrückliche Rücknahme beseitigt den Widerspruch; die endgültige Flächenbedeutung ist richtig.", "Selbstkorrektur innerhalb der Abgabe")
add("S17", response(b="Newton II: F = ma und V = aT. Daher Eₖᵢₙ = W = (mV/T)(TV/2) = mV·(V/2)."), response_en(b="Newton II: F = ma and V = aT. Therefore Eₖ = W = (mV/T)(TV/2) = mV·(V/2)."), [3,3,3,3], "Die faktorisierte Endform ist äquivalent; sie eliminiert T und zeigt beide V-Faktoren. Keine bestimmte Schreibform erzwingen.", "Äquivalente symbolische Endform")
add("S18", response(c="Im Zeit-Geschwindigkeits-Diagramm: waagerecht t in s, senkrecht u in m/s; Gerade von (0,0) nach (T,V). Die Fläche ist als Dreieck eingezeichnet. Für den Weg halte ich trotzdem Δs = VT für richtig: Ich zähle das ganze Rechteck, weil die Geschwindigkeit während der gesamten Zeit schon V ist. Diese Begründung halte ich aufrecht."), response_en(c="In the velocity–time graph: horizontal t in s, vertical u in m/s; straight line from (0,0) to (T,V). The area is shown as a triangle. Nevertheless I maintain Δs = VT for the distance: I count the whole rectangle because the velocity is already V throughout the interval. I maintain this explanation."), [3,3,0,3], "Aufrechterhaltenes Rechteck-/Konstantgeschwindigkeitsmodell trotz sonst richtigem Bild setzt C auf null. Die richtige Formel in B hebt den Widerspruch nicht auf.", "Richtiger Formelwert deckt falsches Flächenmodell nicht zu")

save_json("blind/scripts.json", {"schemaVersion": 1, "cases": scripts})
(BASE / "blind/scripts.md").write_text("# Abgaben / Submissions\n\n" + "\n\n".join("## " + s["id"] + "\n\n### Deutsch\n\n" + s["responseDe"] + "\n\n### English\n\n" + s["responseEn"] for s in scripts) + "\n")
save_json("blind/marking-template.json", {"candidate": "../candidate.goal.json", "cases": [
    {"id": s["id"], "pointsDe": {k: None for k in "ABCD"}, "totalDe": None, "passDe": None,
     "pointsEn": {k: None for k in "ABCD"}, "totalEn": None, "passEn": None,
     "evidenceAndRule": "", "ambiguities": []} for s in scripts],
    "taskAndRubricVerdict": None, "materialIssues": []})
(BASE / "blind/instructions.md").write_text("""# Getrennte Bewertung / Independent marking

Read `../candidate.goal.json`, `../task-and-marking.md` and `scripts.json` only. Do not read `../author/`, this task's other markers, prior reviews or a proposed reconciliation. The case IDs carry no intended judgement.

Grade each fully written submission independently against the exact candidate. Assign A–D points, total and pass/fail separately for German and English; explain any language difference. Use the empty `marking-template.json` if helpful. Cite the decisive evidence and rule, especially at the boundary, for local slips, omissions, contradictions and explicit retractions. Do not invent unstated work.

Also decide whether the task is correct, sufficiently clear and assessable in coach chat, whether all four carrying performances truly matter, whether the score alone implements the stated threshold, whether a small formal slip can pass, and whether equivalent methods are treated fairly. Report any material ambiguity with a specific submission and proposed minimal repair. This is a candidate, not an already released assessment. Do not edit it or provide marks to the other marker.

There is no author score key in this directory. The two language versions of each case represent the same intended submission, not two attempts by a learner.
""")

save_json("author/expectations.json", {"status": "author-expectations-not-independent-review", "maxPoints": 12, "passingPoints": 10, "cases": expectations})
save_json("scope.json", {"status": "intended-placement-not-activation", "goalId": candidate["id"], "requiresAndCoversOnly": GOAL,
    "regularTargetViewCount": 14, "regularTargetViews": [
        "de-he-gym-physics-gk-g8", "de-he-gym-physics-gk-g9", "de-he-gym-physics-gk",
        "de-he-gym-physics-lk-g8", "de-he-gym-physics-lk-g9", "de-he-gym-physics-lk",
        "de-he-gym-sekii-physics-gk", "de-he-gym-sekii-physics-lk",
        "de-sl-gym-physics-gk", "de-sl-gym-physics-lk", "de-sl-gym-sekii-physics-gk", "de-sl-gym-sekii-physics-lk",
        "de-sn-gym-physics-lk", "de-sn-gym-sekii-physics-lk"],
    "sourceBasis": "Task M accepted at 2026-11-26 03:45 CET; scope confirmed in M raw/root/target-views.actual.json",
    "excludedRegularTargets": ["Saxon Grundkurs", "other Länder"],
    "note": "One shared task, one competency endpoint; Land/course visibility must be enforced by reviewed views, not inferred from broad jurisdiction metadata. No unit-check claim."})

for path in ("task-and-marking.md", "candidate.goal.json", "rubric.json", "blind/scripts.json", "blind/scripts.md", "blind/instructions.md", "scope.json"):
    assert (BASE/path).is_file(), path
manifest = {"status": "authored-candidate-v1-awaiting-two-independent-markers", "authorTool": "Codex collaboration agent",
    "authorModel": "gpt-6.1-sol", "authorReasoningEffort": "ultra",
    "rubricVersion": 1, "maximumRubricVersions": 3,
    "files": [{"path": path, "sha256": hashlib.sha256((BASE/path).read_bytes()).hexdigest()} for path in
              ["candidate.goal.json", "task-and-marking.md", "rubric.json", "scope.json", "blind/scripts.json", "blind/scripts.md", "blind/instructions.md", "blind/marking-template.json", "author/expectations.json"]]}
save_json("author/manifest.json", manifest)

print(json.dumps({"candidate": str(BASE/"candidate.goal.json"), "cases": len(scripts),
                  "scores": sorted(set(e["expectedTotal"] for e in expectations)),
                  "utf16Lengths": {k: len(candidate["examData"][k].encode("utf-16-le"))//2 for k in ["taskContent", "taskContentEn", "solutionContent", "solutionContentEn"]},
                  "scoringStepUtf16": {s["id"]: len(s["description"].encode("utf-16-le"))//2 for s in steps}}, ensure_ascii=False, indent=2))
