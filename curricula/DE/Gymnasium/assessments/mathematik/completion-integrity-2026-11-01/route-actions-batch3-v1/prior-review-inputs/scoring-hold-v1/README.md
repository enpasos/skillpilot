# Drei tatsächliche Aufgabenhandlungen – begrenzter Autorenkandidat

Stand: 1. November 2026. **DRAFT; nicht aktiviert und nicht unabhängig inhaltlich angenommen.**

Der Kandidat bindet den tatsächlich gelesenen Originalkanon `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`, SHA-256 `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`. Er ersetzt genau vier vorhandene Goalobjekte. Es gibt keine neue Prüfungs-ID, keine neue Pflichtprüfung, keine Änderung an Mastery und keine zusätzliche Ergebnisentscheidung.

[TASKS.md](TASKS.md) enthält die vollständigen Aufgaben, Lösungen und detaillierten Rubriken auf Deutsch und Englisch. [before-goals.json](before-goals.json) und [after-goals.json](after-goals.json) enthalten nur die vier vollständigen Vorher-/Nachher-Objekte. [context-goals.json](context-goals.json) enthält die vollständigen unmittelbaren alten und neuen Vorbereitungskontrakte sowie die im visuellen Support entfallenden indirekten Rechenkontrakte. [manifest.json](manifest.json) bindet die ursprünglichen Goal-, Aufgaben-, Lösungs- und Rubrikstände und die konkreten Nachher-Bytes. Vorgesehene endgültige Ablagepfade sind dort nur eine Materialisierungsliste; dieser Kandidat schreibt ausschließlich in diesen temporären Ordner.

## Drei Ergänzungen an vorhandenen eigenen Prüfungen

| Fehlende Handlung | Gewählte bestehende eigene Prüfung | Konkrete Ergänzung und Begründung |
|---|---|---|
| `a9fde754-51b4-58d7-85e5-5e36160581e6`: Gerade mit Koordinatenebenen schneiden, als Spurpunkte deuten und prüfen | `bc244d82-bac0-5b13-8a33-d7b101835480`: Geradenschnitt mit einer Ebene deuten (Q2) | Derselbe ursprüngliche Geradenvertrag bekommt einen dritten Teil: alle drei Koordinatenebenen, Nullkoordinatenbedingungen, Parameter und Punkte, jeweils zwei Proben sowie Spurpunkt-/Parameterdeutung. Die ursprüngliche allgemeine Messfläche bleibt vollständig erhalten. Die Gerade wird ausdrücklich vollständig über reellem Parameterbereich betrachtet, damit der Spurpunkt bei negativem Parameter nicht irrtümlich als negative Flugzeit ausgelegt wird. |
| `21fa0c22-976e-59b3-a871-899f0c0177f3`: zu einem Term ein Experiment und Ereignis formulieren und Termbestandteile zuordnen | `77940875-ad1e-5272-9002-3ca9db810a18`: Zufallsexperimente und Modelle vergleichen (Q3) | Nach dem unveränderten Vergleich der Campverlosung wird eine weitere Ziehlosaktion aus einem gegebenen Binomialsummterm konstruiert. Urneninhalt, Anzahl und Zurücklegen sind selbst festzulegen; dazu ein passendes Ereignis und die Zuordnung von Parametern, Potenzen, Anordnungsfaktor und Summe. Die Urnenmodellierung liegt innerhalb des bestehenden stabilen Aufgabenvertrags. Titel und Beschreibung bleiben unverändert. |
| `1675fdde-cba7-5456-ae70-a846e1924a68`: anhand eines gegebenen Graphen Schnittanzahlen mit Geraden einschließlich einer Tangente anschaulich begründen | `7337049a-c85c-5b94-adaa-81dc93528bf8`: Darstellungen sicher wechseln und bewerten (Q4) | Ein zusätzliches tatsächlich gegebenes Schaubild derselben ursprünglichen Parabel `p(x)=−0,5x²+12x` zeigt drei horizontale Geraden. Die Lernenden müssen für jede die Anzahl samt anschaulichem Ausschluss weiterer gemeinsamer Punkte begründen und die Scheiteltangente erkennen. Handtabelle, eigene Skizze, Übersetzungs-/Konsistenzprüfung, Toleranzentscheidung und tatsächliche digitale Kontrollen der bisherigen vier Teile bleiben als Text und in der Rubrik erhalten. Titel und Beschreibung bleiben unverändert. |

Die unabhängige Kohorte-30-Bewertung hatte `f85d225d-9441-5479-b798-661e3ae9bdfa` und `629b1ce0-b604-594a-8113-8e0af351dbb1` als fachlich nahe Kontexte benannt. Beide sind historische feste Abituraufgaben mit je 5 BE. Sie werden hier **überhaupt nicht verändert**, einschließlich Titel, Aufgaben, Lösung, Punkten und Anforderungen. Ihre vollständigen Goalhashes sind im Manifest gebunden. Auch alte Aufgaben-, Review- und Bildartefakte bleiben unverändert.

Vor Auswahl der beiden Alternativen wurde das aktuelle Inventar aller 138 eigenen Prüfungen außerhalb der 27 historischen Abituraufgaben nach den relevanten tatsächlichen Handlungen durchsucht. Die vollständigen Gegenverträge von `77940875`, `9cf020ee`, `e7013f6e` und `7337049a` wurden gelesen. `9cf020ee` setzt den Versandkontext bereits vollständig voraus und prüft vor allem Normalapproximation; `e7013f6e` würde den eigenständigen Q4-Visualisierungsvertrag in eine E-Phasenaufgabe ziehen. Die gewählten eigenen Q3-/Q4-Aufgaben passen ohne neue IDs und ohne Änderung ihres stabilen Bedeutungsvertrags. Diese Auswahl ist eine begrenzte Autorenbegründung, keine allgemeine Stufen- oder Platzierungsabnahme.

## Vorbereitung und Coverage bleiben fachlich getrennt

Je Prüfung kommt genau eine Vorbereitung hinzu: `bc244d82 → a9fde754`, `77940875 → 21fa0c22`, `7337049a → 1675fdde`. Jede neue Vorbereitung besitzt eine echte bepunktete Handlung in der jeweiligen Ergänzung. Die bisherigen echten direkten Anforderungen bleiben vollständig erhalten.

Die vorhandenen `coveredGoalIds` bleiben erhalten; je Prüfung kommt nur das tatsächlich neu bewertete Ziel hinzu. Es wird weder die Vorbereitungshülle als Coverage kopiert noch durch diese drei Handlungen eine pauschale fachliche Abdeckung anderer Ziele behauptet. Die vollständigen Einzelverträge liegen für die getrennte Prüfung im Kontextsnapshot vor.

## Lokale Korrektur des Consumers `1675fdde`

Der vollständige unveränderte Zieltext verlangt eine **anschauliche Begründung an einem vorgegebenen Graphen**. Dafür ist das Lesen der Graphen, das Erkennen von Kreuzen und Berühren sowie die Begründung durch Verlauf und Lage nötig. Der Zieltext verlangt weder die Berechnung einer Tangentengleichung noch Ableitungs-, Normalen- oder Winkelrechnung. Bei einer gegebenen Scheiteltangente kann man die Berührung und die Lage aller anderen Graphpunkte anschaulich begründen, ohne solche Rechnungen auszuführen. Tangenten können in anderen Situationen weitere gemeinsame Punkte haben; eine allgemeine falsche Regel „jede Tangente hat genau einen Schnittpunkt“ wird hier nicht gelehrt oder bewertet.

| Beziehung | Vollständiger unveränderter Zielvertrag als referenziertes Objekt | Lokaler fachlicher Grund |
|---|---|---|
| Behalten | `0b23413e-a334-5dd3-98e5-de067208819e`: Achsenschnittpunkte und Schnittpunkte von Graphen bestimmen | Ein gemeinsamer Punkt muss grafisch erkannt werden; der bestehende vollständige graphische und rechnerische Grundlagenvertrag bleibt bestehen. |
| Behalten | `cf4fe700-dec2-502f-888b-90acefa307bb`: Informationen aus Darstellungen entnehmen | Lage, Verlauf, Steigungen und Schnittpunkte aus der gegebenen Darstellung entnehmen und formulieren. |
| Lokal entfernen | `0264591c-fdd7-41c6-9fb9-7cb3a03f7658`: Tangentengleichungen und Steigungswinkel bestimmen | Die eigene Berechnung von Tangentengleichung und Steigungswinkel ist für den vollständigen rein visuellen Zielvertrag nicht erforderlich. |
| Lokal entfernen | `f042385e-f772-42db-9c96-f21a792ac5ea`: Tangenten- und Normalengleichungen bestimmen | Insbesondere eine Normalengleichung ist keine Vorbereitung zum visuellen Zählen/Begründen gegebener Graph-Geraden-Schnitte. |
| Lokal entfernen | `6aed5be9-f62f-482a-9b98-4253c3275e6e`: Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen | Der visuelle Auftrag setzt weder numerische Steigungen noch deren Winkelberechnung voraus. |
| Lokal entfernen | `56b4acb5-6024-573f-9890-35fbd21ee343`: Schnittwinkel zwischen Funktionsgraphen deuten | Die Größe eines Schnittwinkels entscheidet nicht darüber, ob ein gegebener gemeinsamer Punkt erkannt und die Anzahl aus dem vollständigen Verlauf begründet werden kann. |

Es wird nur das `requires`-Array dieses einen Consumers geändert. Kein referenziertes Ziel wird gelöscht, inhaltlich beschnitten oder global neu definiert. Die vollständigen vier entfernten und zwei behaltenen Goalobjekte stehen im Kontextsnapshot. Die expandierte/geerbte atomare Vorbereitungshülle des Consumers verkleinert sich von 78 auf 69 Ziele; die neun exakt entfallenden IDs stehen in Manifest und Checks. Das sind die vier genannten direkten Rechenkontrakte und fünf ausschließlich dadurch herangezogene Ableitungs-/Steigungsgrundlagen. Alle vollständigen Grundlagenhüllen der beiden behaltenen Verträge bleiben erhalten; keines der vier entfernten Rechenziele kehrt indirekt zurück.

## Reguläre Bewertung

| Prüfung | Bisherige Teile im neuen Punkteraster | Ergänzung | Gesamt / Schwelle |
|---|---:|---:|---:|
| `bc244d82` | 10 BE | 8 BE | 18 / 11 BE |
| `77940875` | 11 BE | 9 BE | 20 / 12 BE |
| `7337049a` | 11 BE | 9 BE | 20 / 12 BE |

Perfekte alte Teile allein bleiben damit jeweils unter der normalen Gesamtpunktschwelle. Der neue Auftrag wird regulär mit Teilpunkten bewertet. Eine ausdrücklich beschriebene normale **Gesamtpunktkappung** verhindert zusätzlich ein Bestehen ohne die jeweils entscheidende neue Handlung: ohne ermittelten Spurpunkt samt Probe höchstens 10/18, ohne eigenes passendes Experiment oder Ereignis höchstens 11/20, ohne jede anschauliche Begründung am Graphen höchstens 11/20. Das ist eine Regel zur Berechnung derselben einen Gesamtpunktzahl, kein zweiter Passstatus, kein eigener Beleg und keine zusätzliche Persistenz. Die üblichen Regeln für gleichwertige Lösungen, Folgefehler, lesbare Evidenz und abschließende Bewertung bleiben explizit erhalten.

Bereits gültige Mastery bleibt uneingeschränkt gültig. Diese Aufgabenergänzung löst keine Requalifikation aus.

## Gebundenes Material und begrenzte Checks

Die beiden neuen SVGs sind repositorynaher Code mit exakt beschrifteter linearer Achsenprojektion. Der quadratische Bézierpfad mit mathematischen Kontrollpunkten `(0,0),(12,144),(24,0)` ist exakt die gegebene Parabel, keine freie Bildskizze. Die Linien liegen exakt bei 54, 72 und 80. Deutsch und Englisch besitzen identische Geometrie, konsistente Beschriftungen und zugängliche Beschreibungen. Weder Schnittanzahlen noch Begründungen stehen als Lösung im Material. Die PNG-Dateien dienen ausschließlich der lokalen visuellen Kontrolle der SVGs.

`python tmp/approach-review-20261101/route-actions-batch3/check_candidates.py` prüft Original-/Einzelbindungen, genau vier lokale Deltas, die erhaltenen DE-Aufgaben-/Lösungspräfixe, historische Unverändertheit, Punktesummen und IDs, die Grenze beim Auslassen aller neuen Teile, die direkten und expandierten/geerbten DAGs sowie hypothetische Readinessfälle ohne Learner-State-Schreibzugriff. Unabhängige algebraische Prüfungen bestätigen die drei Spurpunkte, den allgemeinen Ebenenschnitt, das inverse Binomialexperiment durch vollständige Enumeration seiner 81 gleichwahrscheinlichen Ziehfolgen und alle drei Graph-Schnittanzahlen. Die SVG-Kurve wird an 17 rationalen Parametern gegen die Funktionsgleichung geprüft; DE-/EN-Geometrie muss identisch sein. [checks.json](checks.json) enthält die Ergebnisse. Beide gerasterten SVGs wurden visuell auf Lesbarkeit und vollständige Labels geprüft.

Root übernimmt die unabhängige Inhaltsprüfung, Integration/Materialisierungsbindung und die tatsächliche Angebotswirkung über Actual154. Insbesondere kann das zusätzliche echte Requires bei `bc244d82` dessen dynamische Applicability beeinflussen. Statische Tags und Geltungsfelder bleiben erhalten; damit wird keine unveränderte oder neue Auswahlwirkung behauptet. Kein Source-, Scope-, M7-, Release- oder Live-PASS wird aus diesen begrenzten Autorenchecks abgeleitet.
