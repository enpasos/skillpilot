# SPDX-License-Identifier: Apache-2.0
"""Write a private native synthesis authoring spec from the sealed review bytes."""
from pathlib import Path
import hashlib
import json

P = Path(__file__).resolve().parent
R = P.parents[3]
A = [json.loads(x) for x in next((P / 'packet/round-a/results').glob('*.records.jsonl')).read_text().splitlines()]
B = [json.loads(x) for x in next((P / 'packet/round-b/results').glob('*.records.jsonl')).read_text().splitlines()]

# Each rationale addresses this pair of records, rather than applying a generic
# keep bias. Deferred pairs are not passed to the strict resolution builder.
ROWS = [
('second', 'keep_current',
 'Erklären, Begründen und Hervorheben zentraler Schritte sind bereits ausdrücklich beansprucht. Beide Runden bestätigen eine Kommunikationsleistung. B wird gewählt, weil der Transfer eine andere vertraute Strategie nutzt, ohne eine neue Fallunterscheidung vorauszusetzen. Die Einsetzprobe kontrolliert ein Ergebnis und ersetzt keine Schrittbegründung; zusätzliche Darstellungswahl bleibt beim Nachfolger.',
 'Explaining, justifying and highlighting key steps are already explicit. Both rounds identify one communication competence. B is selected because transfer uses another familiar strategy without requiring a new case distinction. A substitution check checks the result rather than replacing reasons for the steps; choosing additional representations remains a successor competence.'),
('second', 'keep_current',
 'Orts-, Verschiebungs- und Richtungsvektor bezeichnen Rollen desselben Vektorbegriffs. Komponenten und geometrische Deutung gehören zu dieser Darstellung. B konkretisiert den Unterschied zwischen Zielpunkt und Verschiebung mit versetztem Ausgangspunkt; Betrag, Skalarprodukt und Geradengleichung werden nicht ergänzt. Drei Begriffe allein begründen keinen Split.',
 'Position, displacement and direction vectors are roles of the same vector concept. Components and geometric interpretation belong to that representation. B makes endpoint versus displacement observable through a shifted starting point; magnitude, dot product and line equations are not added. Three terms alone do not justify a split.'),
('second', 'keep_current',
 'Die Beschreibung enthält Parameter, Null-/Alternativhypothese und alle drei Testrichtungen. B bindet den Wechsel von Trefferereignis beziehungsweise Fragestellung an passende Hypothesen. Keine bestimmte schulische H0-Grenzwertkonvention wird nachträglich vorgeschrieben; Testentscheidungen und Fehlerwahrscheinlichkeiten bleiben außerhalb des Ziels.',
 'The description contains the parameter, null and alternative hypotheses, and all three test directions. B connects a changed success event or question to corresponding hypotheses. No specific school convention for boundary-value H0 is imposed; test decisions and error probabilities remain outside the goal.'),
('first', 'keep_current',
 'Die beiden Linearitätsbedingungen sind bereits vollständig benannt. A macht allgemeine Begründung gegenüber bloßen Zahlenbeispielen sichtbar und nutzt eine Streckung um ein anderes Zentrum als Transfer. Ein Ursprungstest allein genügt nicht. Weder allgemeine Vektorraumtheorie noch die separate Matrixdarstellung werden verlangt.',
 'Both linearity conditions are already named. A distinguishes a general justification from isolated numerical examples and uses scaling about another centre for transfer. Fixing the origin alone is insufficient. Neither general vector-space theory nor the separate matrix representation is required.'),
(None, 'deferred_structure',
 'SPLIT/SPLIT bleibt offen. Bedingte Anteile und Basisraten, Erhebungs-/Stichprobenkritik sowie Kausalitätsurteile sind konkret unabhängig fehlbar: sichere Teilgruppenrechnung kann mit einer übersehenen Suggestivfrage oder unbelegtem Kausalschluss zusammentreffen. Ein gemeinsamer AB3-Zweck beweist keine atomare Einheit. Q3.1 des gelieferten HMKB-Textes trägt die bedingten Wahrscheinlichkeiten, belegt aber nicht sämtliche weiteren Facetten dieses atomaren Ziels. Der volle beanspruchte Umfang bleibt erhalten; keine automatische Zerlegung, Kürzung oder Mastery-Rücknahme.',
 'SPLIT/SPLIT remains open. Conditional proportions and base rates, collection/sampling critique and causal judgments can concretely fail independently: correct subgroup calculation may coexist with a missed leading question or unsupported causal inference. A shared AB3 purpose does not prove atomic unity. Supplied HMKB Q3.1 supports conditional probabilities but does not establish every further facet of this atomic goal. Preserve the full claimed scope; no automatic decomposition, narrowing or withdrawal of mastery.'),
(None, 'deferred_structure_and_wording',
 'SPLIT/REVISE bleibt offen. A benennt die Überschneidung mit d711…; B verteidigt plausibel die Kette Zufallsgröße → Werte → Verteilung. Getrennte Prüfbarkeit allein beweist keinen notwendigen Split einer Darstellungsleistung, aber die doppelte Begriffsbeanspruchung verlangt eine explizite Abgrenzung. Die fehlende Zielmenge in „Zuordnungen von Ergebnissen“ ist eine echte lokale Präzisierung; ihre Ergänzung löst die Strukturfrage nicht. Q3.2 nennt beide Inhalte, legt ihre Atomisierung nicht fest. Keine Überstimmung des SPLIT durch die Synthese.',
 'SPLIT/REVISE remains open. A identifies overlap with d711…; B plausibly defends the chain random variable → values → distribution. Separate assessability alone does not prove that a representational competence must be split, but the duplicated conceptual claim requires explicit delimitation. The missing codomain in “assignments of outcomes” is a real local clarification; adding it does not settle structure. Q3.2 names both contents without deciding their atomization. Synthesis cannot override SPLIT.'),
('second', 'keep_current',
 'Das engere Begriffslernziel nennt Ausgangs- und Zahlenzielbereich und einfache diskrete Kontexte bereits ausdrücklich. B zeigt eine eigenständige Zuordnungsregel auch für nichtnumerische Versuchsergebnisse. Die Überschneidung des breiteren 5927… wird dort offengehalten; sie entwertet diese klare Beschreibung nicht. Verteilungen und Kenngrößen werden nicht zusätzlich verlangt.',
 'The narrower conceptual goal already names the outcome domain, numerical codomain and simple discrete settings. B demonstrates an independent assignment rule for nonnumerical outcomes as well. The overlap of broader goal 5927… remains open there and does not invalidate this clear description. Distributions and summary measures are not added.'),
('second', 'reject_optional_revision',
 'A schlägt die explizite Nennung innerer und äußerer Funktion vor; B behält den Text. „Eine verkettete Funktion untersuchen und ihr Verhalten argumentativ begründen“ fordert bereits einen mathematischen Zusammenhang: bloßes Aufzählen von Kurveneigenschaften erfüllt das Wort „begründen“ nicht. Die vorgeschlagene Explizierung ist sachlich brauchbar, beseitigt aber keine belegte Mehrdeutigkeit. Die unveränderte B-Evidenz macht Definitionsbedingungen und tragende Eigenschaften beider Funktionen beobachtbar, ohne einen starren Begründungsweg vorzuschreiben. Deshalb wird exakt As Ersatztext zurückgewiesen, nicht seine mathematische Einsicht.',
 'A proposes explicitly naming the inner and outer functions; B retains the text. Investigating a composed function and justifying its behavior with mathematical arguments already requires mathematical connections: merely listing curve properties does not meet “justify.” The proposed clarification is sound but removes no demonstrated ambiguity. Unchanged B evidence makes domain conditions and relevant component-function properties observable without prescribing one rigid argument. Accordingly, A’s exact replacement is rejected, not its mathematical insight.'),
('first', 'keep_current',
 'Beide Runden bestätigen die kohärente Verbindung von Parameterdeutung und Untersuchung seiner Wirkung. A wird gewählt: Der Wechsel der Parameterposition ist ein struktureller Transfer innerhalb derselben Kompetenz. Parameterbestimmung aus Bedingungen und Auswahl einer Funktionsklasse werden nicht erneut aufgenommen. Das Brückenbild trägt Aussagen für die gezeigten positiven Faktoren; daraus folgt keine allgemeine Regel für beliebige Parameter.',
 'Both rounds confirm that parameter interpretation and investigating its effects form one competence. A is selected: changing the parameter position is structural transfer within that competence. Determining parameters from constraints and selecting a function class are not added. The bridge illustration supports statements for its shown positive factors, not a universal rule for arbitrary parameters.'),
('second', 'keep_current',
 '„Alle Einträge“ nennt bereits die definierende Struktur der skalaren Multiplikation. B verbindet korrektes Rechnen mit Form-, Vorzeichen- und Nullfaktorverständnis und verlässt im Transfer die positive quadratische Beispielmatrix. Das ist eine Operation, keine zusätzliche Modellierungsleistung und kein Anlass für längeres Wording.',
 '“All entries” already names the defining structure of scalar multiplication. B connects calculation to shape, sign and zero-factor understanding and transfers beyond the positive square example. This is one operation, not additional modeling or a reason to lengthen the wording.'),
('second', 'reject_optional_revision',
 'A ersetzt die teilweise redundante Formulierung durch „gleiche Zeilen- und Spaltenzahl“ und „eintragsweise“; dies ist kürzer und stilistisch gut, aber nicht notwendig. „Gleich große Matrizen“/“matrices of the same size” bezeichnet im gebundenen Zeilen-/Spaltenkontext gleiche Dimensionen, nicht gleiche Anzahl beliebig angeordneter Einträge. Addition/Subtraktion sind bereits definierte Positionsoperationen. B prüft den kritischen rechteckigen Gegenfall ausdrücklich in der Evidenz. Deshalb wird As exakter Ersatz als optionale Redaktionsvariante zurückgewiesen; es wird nicht behauptet, längerer Text sei grundsätzlich schlechter.',
 'A replaces partly redundant wording with “same numbers of rows and columns” and “entry by entry”; it is shorter and stylistically useful, but unnecessary. “Matrices of the same size” denotes matching dimensions in the bound row/column context, not equal counts of arbitrarily arranged entries. Addition and subtraction already denote positional operations. B explicitly tests the crucial rectangular countercase in its evidence. A’s exact replacement is therefore rejected as an optional editorial variant; this is not a general claim that longer wording is worse.'),
('second', 'reject_optional_revision',
 'A möchte Fehlervermeidung positiv als Erläuterung der Faktorenreihenfolge fassen. Der aktuelle Text benennt Produktberechnung, Dimensionsbedingungen und Reihenfolge bereits; ein falsches Vertauschen wird dadurch nicht zulässig. B liefert den positiven Nachweis mit Zeilen-/Spaltenbeiträgen und einem neuen Paar, bei dem nur eine Reihenfolge definiert ist. Diese didaktisch wichtige Erklärung gehört in die Evidenzkette und muss nicht zusätzlich zum vorhandenen Kompetenztext verdoppelt werden. As exakter Ersatz wird deshalb begründet zurückgewiesen; keine Reduktion auf bloße Routine.',
 'A would recast error avoidance positively as explaining factor order. The current text already names product calculation, dimensional conditions and order; it does not permit an incorrect reversal. B supplies positive evidence through row/column contributions and a new pair with only one defined order. This important explanation belongs in the evidence chain and need not duplicate the existing competence wording. A’s exact replacement is therefore rejected with reasons, without reducing competence to routine calculation.'),
(None, 'deferred_model_condition',
 'KEEP/REVISE wird hier nicht zugunsten eines schnellen Abschlusses aufgelöst. Das allgemeine Rechenziel und die Q2.5-/Geometrienachfolger tragen keine automatische Zustandssemantik jedes Produkts. A liest implizit ein vorgegebenes Zustandssystem mit; B macht genau diese Voraussetzung im Text sichtbar. Das Bild benennt nur Zustand 0/1 und Zahlenkomponenten, keine Sachgrößen, und schließt die Lücke deshalb nicht. Die kurze B-Ergänzung „in einem gegebenen Zustandsmodell“ wird als geeigneter, noch nicht übernommener Wortlaut empfohlen. Keine neue Modellwahl-, Markov- oder Bildpunktleistung; Berechnen und Deuten bleiben zusammen.',
 'KEEP/REVISE is not resolved in favor of quick closure here. The general calculation goal and Q2.5/geometric successors do not supply automatic state semantics for every product. A implicitly assumes a given state system; B makes exactly that condition explicit. The image only labels states 0/1 and numerical components, not real-world quantities, so it does not resolve the gap. B’s brief addition “in a given state model” is recommended as suitable wording, not adopted. No new model-selection, Markov or image-point performance; calculation and interpretation remain together.'),
('first', 'keep_current',
 'Beide Runden bestätigen das gemeinsame Erstellen und Deuten gerichteter Graphen. A wird gewählt, weil der Transfer auf mögliche Ein-Schritt-Übergänge begrenzt bleibt. Zustände, Richtung, Schleifen und kontextabhängige Gewichte sind die nötigen Inhalte; Matrixerstellung, Potenzen und Grenzprozesse bleiben getrennt. Die zusätzlich gezeigte Matrix und stochastische Normierung erweitern diese Beschreibung nicht.',
 'Both rounds confirm the joint construction and interpretation of directed graphs. A is selected because its transfer stays within possible one-step transitions. States, direction, loops and contextual weights are the necessary content; constructing matrices, powers and limiting processes remain separate. The extra matrix and stochastic normalization shown do not expand this description.'),
(None, 'deferred_wording_and_material',
 'REVISE/REVISE kann nativ nicht geschlossen werden. Beide Runden identifizieren dieselbe konkrete Unbestimmtheit: Winkel oder Zeit und welcher Kreis. Für eine beliebige Winkelzeitfunktion theta(t) lauten Koordinaten r cos(theta(t)), r sin(theta(t)); die Grundfunktionen folgen nicht als Funktionen einer unbestimmten Zeit. Die B-Fassung bindet knapp Einheitskreis und Drehwinkel, ohne Parameteranpassung oder Ableitungen zu ergänzen, und wird als Kandidat empfohlen. Die clockwise wirkenden Umlaufpfeile im Bild bleiben gesondert offen: Sie sind bei abnehmendem Winkel denkbar, aber als Erklärung des zunehmenden positiven Winkelgraphen ohne Erläuterung missverständlich. Keine pauschale Behauptung, die gezeichneten Grundgraphen seien falsch.',
 'REVISE/REVISE cannot close natively. Both rounds identify the same concrete underspecification: angle versus time and the choice of circle. For an arbitrary angle-time function theta(t), coordinates are r cos(theta(t)), r sin(theta(t)); the basic functions do not follow as functions of unspecified time. B briefly binds unit circle and rotation angle without adding parameter fitting or differentiation and is recommended as a candidate. The apparently clockwise arrows remain a separate material issue: decreasing angle could make them valid, but they are misleading without explanation alongside increasing-positive-angle graphs. This does not claim that the depicted basic graphs are mathematically wrong.'),
]

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def main():
    assert len(ROWS) == len(A) == len(B) == 15
    decisions, deferred, comparisons = [], [], []
    for index, ((evidence, status, de, en), a, b) in enumerate(zip(ROWS, A, B), 1):
        assert a['goalId'] == b['goalId']
        row = {'order': index, 'goalId': a['goalId'], 'titleDe': a['currentTitleDe'],
               'currentDescriptionDe': a['currentDescriptionDe'], 'currentDescriptionEn': a['currentDescriptionEn'],
               'roundA': {'decision': a['decision'], 'recordId': a['recordId']},
               'roundB': {'decision': b['decision'], 'recordId': b['recordId']},
               'disposition': status, 'evidenceRound': evidence, 'rationaleDe': de, 'rationaleEn': en}
        comparisons.append(row)
        if evidence is None:
            deferred.append({'goalId': a['goalId'], 'rationaleDe': de, 'rationaleEn': en})
            continue
        decision = {'goalId': a['goalId'], 'resolutionDecision': 'keep_current', 'evidenceRound': evidence,
                    'rationaleDe': de, 'rationaleEn': en}
        if status == 'reject_optional_revision':
            assert a['decision'] == 'revise' and b['decision'] == 'keep'
            decision['revisionDissent'] = {'sourceRound': 'first', 'disposition': 'rejected_keep_current',
                'proposedDescriptionDe': a['proposedDescriptionDe'], 'proposedDescriptionEn': a['proposedDescriptionEn'],
                'rationaleDe': de, 'rationaleEn': en}
        else:
            assert a['decision'] == b['decision'] == 'keep'
        decisions.append(decision)
    assert len(decisions) == 11 and len(deferred) == 4
    write(P / 'packet/synthesis-authoring.json', {'schemaVersion': 1,
       'manifestId': 'math-g17-fifteen-description-independent-synthesis-20261107-v1',
       'synthesizedBy': '/root/math15_description_synthesis; independent AI post-review synthesis; actual time in review-receipt.json',
       'decisions': decisions, 'deferredGoals': deferred})
    write(P / 'review-comparison.json', {'schemaVersion': 1, 'authority': 'ai_synthesis',
       'status': 'HOLD_D15_WITH_11_ELIGIBLE_RESOLUTIONS_AND_4_DEFERRED_GOALS',
       'allAssignedGoalsRetained': True, 'rows': comparisons,
       'scope': 'Private Source15 context only; no active D807, registry, curriculum, mastery, unit, P or V approval.'})
    print('Authored 15 dispositions: 11 resolution decisions, 4 explicit deferrals.')

if __name__ == '__main__':
    main()
