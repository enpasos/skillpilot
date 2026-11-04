# Vollständiger Vertragsabgleich — Autorenentwurf

Grundlage sind die zwei unveränderten ganzen aktuellen Lernzielobjekte in `input-whole-contracts.json`, nicht ihre Titel allein. Die sieben dort eingefrorenen passenden Prüfungsobjekte wurden jeweils mit ganzer Aufgabe, Lösung, Rubrik, Requires und Coverage betrachtet. Der neue Entwurf erhält weder eine kanonische ID noch eine Platzierung.

| Ganzer Zielbestandteil | Tatsächlich verlangte Handlung | Bewertung | Absicherung und Grenze |
|---|---|---|---|
| `81527aac`: eine Implikation behandeln | A: allgemeine Aussage über $n\in\mathbb Z$ und deren richtige Kontraposition formulieren | A1, 2 BE | Umkehrung wird nicht als Kontraposition gewertet. |
| `81527aac`: $\neg B\Rightarrow\neg A$ beweisen | A: negierte Voraussetzung allgemein ansetzen und benötigtes Paritätsargument führen | A2/A3, 4 BE | Ein allgemeiner Kontrapositionsbeweis muss erkennbar sein; bloße Zahlenproben und ein bloßer anderer Beweis lösen die normale Gesamtkappung aus. Lokale Rechenfehler nicht automatisch. |
| `81527aac`: logische Äquivalenz begründen | A: sachlicher Grund, warum die Kontraposition die Ausgangsimplikation beweist | A4, 2 BE | Gemeinsame Falschbedingung, Wahrheitstafel, logische Umformung oder gleichwertige Erklärung. Bloßer Methodenname genügt nicht; ganz fehlende/konzeptionell falsche Erklärung löst die Kappung aus. |
| `81527aac`: ursprüngliche Implikation damit beweisen | A: logisch korrekten Schluss zurück auf die Ausgangsaussage ziehen | A5, 2 BE | Natürliche Sprache und im Zusammenhang eindeutiger Schluss genügen. Keine zweite formale Äquivalenzbegründung verlangt. |
| `9ea981ed`: eine Aussage mit Fällen beweisen | B: geeignete allgemeine Fälle wählen | B1, 2 BE | Gerade/ungerade ist eine mögliche Wahl; andere vollständige Überdeckungen werden zugelassen. Keine zusätzliche Forderung paarweiser Disjunktheit. |
| `9ea981ed`: alle Fälle abdecken | B: Vollständigkeit für alle ganzen Zahlen begründen | B2, 2 BE | Null und negative Zahlen dürfen nicht aus dem Bereich verschwinden. Der allgemeine Ganzzahlbeweis braucht keine zusätzlichen Zahlenproben. |
| `9ea981ed`: Aussage in den Fällen beweisen | B: allgemeines Argument in jedem gewählten Fall | B3/B4, 4 BE | Alle Fälle werden erfasst; keine Musterrechnungen für nur einzelne Werte. Andere Fallzahlen erhalten dieselben insgesamt 4 Beweispunkte. |
| `9ea981ed`: vollständige Fallunterscheidung als Beweis nutzen | B: Ergebnisse zum allgemeinen Schluss verbinden | B5, 2 BE | Vollständige Überdeckung mit allgemeinen Fallargumenten muss erkennbar sein; fehlt sie ganz oder ist sie konzeptionell verfehlt, gilt die normale Kappung. Ein redundanter Schlusssatz wird nicht verlangt. |

Die zehn Kriterien ergeben genau 20 BE, davon A = 10 und B = 10. Bestehensschwelle ist 12. Die Grenze von 11 bei vollständig fehlenden oder konzeptionell verfehlten zentralen Handlungen verändert ausschließlich diesen einen Score. Es gibt keine zusätzliche Teilbestehensschwelle, kein zweites Evidence-/Qualifikationsobjekt und keinen neuen Lernzustand. Eine Teilbewertung darf unterhalb voller Kriteriumspunkte bleiben, ohne automatisch die Kappung auszulösen.

## Vorgeschlagene Coverage und echte Vorbereitung

`coveredGoalIds` und die vorgeschlagenen direkten `requires` enthalten jeweils **genau**:

- `81527aac-1abf-588d-acae-b82a86564b06`: Aufgabe A fordert die Methode samt logischer Rechtfertigung tatsächlich.
- `9ea981ed-8b78-502c-b316-01d8cb885814`: Aufgabe B fordert eine vollständige Fallüberdeckung mit Beweis jedes Falls tatsächlich.

Die beiden gleichlautenden Listen haben unterschiedliche Bedeutung: Coverage bezeichnet hier die explizit bewerteten ganzen Methodenverträge; Requires bezeichnet die für die selbstständige Bearbeitung tatsächlich eingesetzten Methoden. Keine dieser Listen wird in Root geschrieben.

Die vier unmittelbaren bestehenden Vorbereitungskompetenzen der Zielobjekte sowie direkte Beweise und Widerspruchsbeweise wurden als ganze Nachbarobjekte gelesen. Der Entwurf ändert deren bisherige Kanten nicht. Er erhebt **keinen** zusätzlichen ganzen Coverageclaim auf `740ab443` (verlangt auch die Umkehrung), `591cb948`, `e2d56885`, `04118376`, `d21a1303`, `c5ea9b97`, vollständige Induktion oder den Vergleich mehrerer Beweisstrategien. Hilfsalgebra bzw. die Nutzung elementarer Parität wird nicht zu einem unüberprüften zusätzlichen Ganzzielclaim.

Die gegenwärtigen zwei Zielobjekte haben keine direkten Requires-Consumer und keine explizite Exam-Coverage. Roots Angabe von je 134 offenen Scope-Enden wird als Auftragskontext behandelt, nicht als in diesem Inhaltsentwurf neu gemessener Angebotsbefund. Die Objekt-Applicability, GK/LK-Tags, Q4-Metadaten und bestehenden Requires bleiben unverändert. Insbesondere wird daraus keine automatische neue Länder-, ALL- oder Stufengeltung der Prüfung abgeleitet. Inhalt, spätere Scopewahl und tatsächliche Laufzeitwirkung sind getrennt zu prüfen.
