# Prospektiver Eingabeaudit: Physik und Zeitnullpunkt

Datum: 25.11.2026, 04:25 CET (03:25 UTC). Der Audit prüft ausschließlich die Testeingaben. Er vergibt und prognostiziert keine Punkte. Native Bewertungsantworten, Kandidatenrubriken und die Autorennotizen wurden nicht gelesen. Gelesen wurden nur die kanonische Aufgabe, die 14 eingereichten Skripte und ihre koordinierenden Fallbeschreibungen, der Datenerzeugungs-/Graphcode und die angegebenen Vorprüfungen; alle drei Graphdateien wurden tatsächlich bildlich geprüft.

## Befund

**Ja: Es liegt ein zusätzlicher sachlicher gemeinsamer Fehler im Zeitbezug vor.** Bei 240 aufgenommenen Bildern/s dauert ein Frame 1/240 s = 0.0041667 s. Wenn n₀ das erste freie Bild ist und n₀−1 noch Kontakt zeigt, liegt die tatsächliche Freigabe innerhalb des vorangehenden Frameintervalls. Bezogen auf n₀ ist die zulässige geschlossene konservative Grenze deshalb einseitig: Die Freigabe liegt um ein unbekanntes δ mit 0≤δ≤1/240 s davor. Die Zeit t=(n−n₀)/240 s hat diese Freigabe nicht als beobachteten exakten Nullpunkt. ±0.0021 s um n₀ folgt aus den angegebenen Beobachtungen nicht. Ein Mittelpunkt wäre ein neuer anderer Referenzpunkt, für den die ganzen Tabellen geändert werden müssten; er wird hier nicht behauptet.

Dieser Fehler betrifft auch den behaupteten Zusammenhang zwischen dem tatsächlichen Loslasspunkt, dem ersten freien Bild und der Ruhebedingung. Sogar eine Freigabe aus Ruhe führt im Referenzbild zur Geschwindigkeit gδ. Bei den hier bestimmten Größenordnungen kann diese rund 0.04 m/s erreichen. Das bisherige pauschale 0.02-m/s-Narrativ wird daher nicht als gesicherte obere Grenze beibehalten. Der bei Freigabe aus Ruhe zwischen Freigabe und n₀ zurückgelegte Weg beträgt dagegen höchstens rund 0.00009 m und ist gegenüber der angegebenen ±0.001-m-Ortsablesegrenze klein. Beides sind **Modellrechnungen**, keine zusätzlichen Videoablesungen.

Die bereits vorhandenen vollständigen ±Ganzbildrechnungen machen diesen sachlichen Fehler nicht rückwirkend richtig. Sie zeigen jedoch, dass die bisherige grobe Unsicherheitsgröße numerisch bereits eine ausreichend breite Empfindlichkeitshülle enthielt. Aus dem Audit folgt deshalb weder eine Punktänderung noch die Aussage, dass sämtliche experimentellen Ergebnisse unbrauchbar seien. Die Bewertung bleibt den echten blinden Bewertern vorbehalten.

## Prospektive Korrektur

Der neue Panel behält die beobachteten ersten freien Referenzbilder, sämtliche Bildnummern, Tabellenzeiten, Positionen, Diagramme, Steigungen, Reihenschätzer, expliziten numerischen Gesetze und alle 14 Fallunterschiede. Der Zeitbezug wird als nominale Näherung erläutert; ein tatsächlich gemessener Zwischenzeitpunkt wird nicht hinzugefügt. Die ursprünglichen Versuchs- und Abgabeprotokolle sind synthetische Testartefakte, keine Behauptung vorhandener realer Lernerversuche.

Eine physikalisch konsistente tatsächliche Freigabevariation muss bei unverändertem Ortsursprung im ersten freien Bild den kleinen Vorweg abziehen. Mit τ=t+δ folgt aus dem Ruhemodell

```
x(t) = (g/2)[(t+δ)²−δ²] = (g/2)(t²+2δt).
qᵢ = tᵢ²+2δtᵢ
g(δ) = 2 Σ(qᵢxᵢ) / Σ(qᵢ²)
```

Die Anpassung wurde für jeden der drei vollständigen Läufe jeder Reihe neu gerechnet und danach wie zuvor gleich gewichtet gemittelt. Nur in den Skripten, in denen eine A-Grenzvariation bereits vorhanden war, wird auch die neue A-Grenzrechnung geliefert. Die Skripte mit ausdrücklich ausgelassener A-Grenzvariation behalten diese Auslassung. Die ursprünglich vorhandene formale Rechnung allein mit tᵢ±1/240 s bleibt erhalten, wird aber zutreffend als zusätzliche Empfindlichkeitsprüfung eingeordnet; sie berücksichtigt den Ortsursprung nicht vollständig, und die Gegenrichtung liegt außerhalb des beobachteten Freigabeintervalls.

Die einzige numerische Gesetzesbehauptung pro Reihe bleibt die ursprüngliche explizite Gesetzeszeile. Insbesondere werden die abweichenden Koeffizienten in den beiden zusätzlichen Gesetzesfällen weder ersetzt noch durch ein zweites richtiges numerisches Gesetz geheilt.

## Unabhängig nachgerechnete Zahlen

| Größe | A | B |
|---|---:|---:|
| Drei nominale Laufwerte g / m/s² | 9.791291448; 9.796917667; 9.848608555 | 9.695147920; 9.707982767; 9.768816703 |
| Nominaler Mittelwert / m/s² | 9.812272557 | 9.723982463 |
| Konsistente Freigabegrenze δ=1/240 s / m/s² | 9.504443961 | 9.359669873 |
| Änderung durch diese Freigabegrenze / m/s² | −0.307828596 | −0.364312591 |
| Ursprüngliche formale t+1/240-Rechnung / m/s² | 9.501844170 | 9.355978620 |
| Ursprüngliche formale t−1/240-Rechnung / m/s² | 10.136366355 | 10.111419799 |
| Ortsvariation +0.001 m / m/s² | 9.844359587 | 9.770442990 |
| Ortsvariation −0.001 m / m/s² | 9.780185526 | 9.677521937 |
| Konservative ursprüngliche Hüllensumme / m/s² | 0.404463927 | 0.490180219 |
| Weiterhin aufgerundete grobe Unsicherheitsgröße / m/s² | 0.5 | 0.5 |

Die Hüllensumme ist wie zuvor das Maximum der formalen Zeitwirkungen plus größte Ortswirkung plus halbe Laufspannweite plus 0.2 % des nominalen Mittels. Die neue einseitige Freigabevariation ist in beiden Fällen kleiner als die schon verwendete Hülle. Diese Größen sind ausdrücklich keine garantierten Fehler- oder Konfidenzintervalle. Die 42-Punkte-Konsensusrechnung ergibt unabhängig 9.783537537850814 m/s². Der Vergleich der gerundeten Kontrollwerte bleibt |9.81−9.72|=0.09 m/s² bei groben Intervallen [9.31;10.31] und [9.22;10.22] m/s².

Zusätzlich wurden die sechs diagnostischen Zweiparameteranpassungen x=v₀t+(g/2)t² aus den Rohpunkten nachgerechnet; alle angegebenen v₀-Werte stimmen. P6 und T3 zeigen die richtigen Messpunkte und jeweils die angegebenen Ursprungsgeraden. R8 enthält dieselben A-Daten und die absichtlich abweichende Einheit an der t²-Achse; diese Fallabweichung ist erhalten.

## Erhalt der beiden Gesetzesvarianten

Der direkte Textvergleich mit dem korrigierten Kontrollskript L7Q4 ergibt:

- D3Z7 unterscheidet sich weiterhin allein durch A-Koeffizient 8.60 statt 9.81 und B-Koeffizient 10.90 statt 9.72 m/s².
- T9G2 unterscheidet sich weiterhin allein durch B-Koeffizient 10.90 statt 9.72 m/s²; A bleibt 9.81 m/s².

Die unveränderten abweichenden Gesetzeskoeffizienten sind Testeingaben. Ihre Bedeutung für Punkte oder Bestehen wird hier nicht entschieden.

## Weitere gemeinsame Fehler

Im geprüften Kontrollskript wurde kein weiterer sicherer, davon unabhängiger sachlicher Eingabefehler festgestellt. Insbesondere stimmen die Zahlenrechnungen, die Diagrammzuordnungen, die Kalibrierungsgrößenordnung und die Fallhöhen mit den angegebenen Flugpunkten überein. Die Rohdaten erlauben keine unmittelbare Beobachtung einer subframegenauen Freigabe, exakter Anfangsruhe oder fehlenden Luftwiderstands; der neue Panel behauptet solche Beobachtungen nicht.

Die grobe Orts-/Zeit-/Streuungsaddition ist weiterhin eine erläuterte schulische Größenordnung mit explizit beschränkter Aussage, kein vollständiges metrologisches Unsicherheitsbudget. Ein unabhängiger genauer Beleg für Bildbelichtung, Rolling Shutter oder einen beschleunigten Fingerkontakt ist nicht Teil der Testeingaben; aus nicht vorhandenen Angaben wird kein weiterer Fehler erfunden. Die Retention-Erklärung für Originaldateien bleibt Teil der synthetischen Schülerdarstellung, kein Auditbeweis realer Messungen.

## Evidenz und unveränderte Historie

`scripts.json` und `script-intent.json` sind **neue prospektive Eingaben**. Die zugrunde liegenden `scripts-v2-onward.json`, `script-intent-v2-onward.json`, versiegelte v1/v2-Dateien und Repositorydateien wurden nicht geändert. `verification.json` bindet die Eingangsdigests und protokolliert die bestandenen Erhaltungsprüfungen. `recomputation.json` enthält die volle Rechengenauigkeit. `changed-passages.md` zeigt jede gemeinsame Textkorrektur, `scripts.diff` den vollständigen exakten Paneldiff. Die kanonische Aufgabe und alle drei Diagramme sind byteidentisch in diesen Ordner kopiert. `build_panel.py` macht die Transformation und Neuberechnung nachvollziehbar, ohne Bewertungsdateien zu öffnen.

Nur `canonical-task.md`, die jeweilige `submission` aus `scripts.json` und ihre zugehörigen Diagramme sind Eingaben für neue blinde Bewerter. `script-intent.json`, dieser Audit und sonstige Koordinationsdateien bleiben außerhalb der Bewerteransicht. Der alte v2-Durchlauf muss weiterhin ausschließlich auf seinen damaligen unveränderten Eingaben beurteilt werden.
