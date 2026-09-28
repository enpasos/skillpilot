# BW-Kandidat: vom Stammfunktionsgraphen zum Funktionsgraphen

Stand: 2026-09-28. **Im Kanon integrierter, nicht freigegebener Kandidat** (`examData.reviewStatus: needs_review`); diese Kandidatennotiz und die Integration sind kein D-/P-/V-Nachweis und keine menschliche Freigabe.

## Quellbindung und fachliche Grenze

- [BW Bildungsplan Gymnasium 2016, Basisfach 3.5.4(12)](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M.V2_IK_11-12-BF_04): „vom Graphen der Funktion auf den Graphen einer Stammfunktion schließen und umgekehrt“; Source-ID `bw-math-sekii-bp2016-3-5-4-12`.
- [BW Bildungsplan Gymnasium 2016, Leistungsfach 3.4.4(17)](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M_IK_11-12-LF_04): dieselbe beidseitige Graphkompetenz; Source-ID `bw-math-sekii-bp2016-3-4-4-17`.
- `21676dae-8619-59d1-89e3-a35bb2297e2c` modelliert bereits die Richtung **f-Graph → möglicher F-Graph**, bislang jedoch nur mit BY/HE-Geltung. Für BW-GK/LK muss dessen Geltung gesondert übernommen werden; das vorliegende Kandidatenziel bearbeitet ausschließlich **gegebener F-Graph → f = F′-Graph**.
- `845440ce-f63f-5835-903f-739145ca27bd` beschreibt Vorzeichen/Verlauf von Ableitungsgraphen allgemein, verlangt aber keine selbst gezeichnete Ableitungsfunktion zu einem vorgelegten Stammfunktionsgraphen. `0404f20e…` ist Begriffsverständnis; `5042fd2b…` behandelt die anders definierte Integralfunktion. Diese Ziele allein belegen die BW-Gegenrichtung nicht.

## Vorschlag für genau ein kanonisches Inhaltsatom

- ShortKey-Vorschlag: `canonical_math_sek2_function_graph_from_antiderivative_graph` (stabile ID erst bei Integration nach Projektregel erzeugen).
- Titel DE: **Aus einem Stammfunktionsgraphen den Funktionsgraphen skizzieren**.
- Title EN: **Sketch a function graph from an antiderivative graph**.
- Beschreibung DE: **Die lernende Person kann aus dem Graphen einer Stammfunktion F den Graphen der zugehörigen Funktion f = F′ skizzieren, indem sie Tangentensteigungen, Vorzeichen und Nullstellen von f aus dem Verlauf von F begründet.**
- Description EN: **The learner can sketch the graph of the corresponding function f = F′ from an antiderivative graph F, justifying the slopes, signs, and zeros of f from the course of F.**
- Unmittelbare Voraussetzung: `0404f20e-34cc-5c9b-ae6a-62cc9cf02bae` (F′ = f); dadurch ist `845440ce…` bereits geerbt. Keine künstliche `requires`-Kante von `21676…`: die zwei Umkehrrichtungen sind fachlich verwandt, aber eine muss nicht erst beherrscht sein, um die andere zu lernen.
- Scope-Kandidat: `DE-BW`, GK und LK; keine pauschale Geltung für andere Länder ohne gesonderten Quellenbeleg. Die beiden genannten BW-Quellen sollten je eine `partial`-Kante auf dieses Reverse-Atom und eine `partial`-Kante auf das vorwärts gerichtete `21676…` erhalten. Der heutige GK-Eintrag nur auf `0404…` und der LK-Eintrag nur auf den breiten Cluster `93ac7fc8…` sind keine vollständige Inhaltsabdeckung.
- Mögliche Platzierung: neben `21676…` im kanonischen Analysis-Teilbaum, in BW-GK/LK-Views als zwei getrennte Targets unter dem Bereich Integralrechnung. Eine spätere Integration muss die Einmaligkeit in allen vier BW-Views sowie die nationale Atlas-Navigation prüfen.

## Eigenständige Prüfungsaufgabe: Kandidat, 12 Punkte

Der Lernende erhält **zwei tatsächlich gezeichnete Stammfunktionsgraphen ohne Funktionsterme**: [Graph A](assets/graph-a-antiderivative.svg) und [Graph B](assets/graph-b-antiderivative.svg). Die SVGs wurden aus den folgenden präzisen Plot-Spezifikationen gerendert und visuell gesichtet; eine unabhängige fachliche Bildprüfung für eine Freigabe steht noch aus. Die Kurvenbögen werden an den sichtbaren Intervallrändern entsprechend ihrer Parabeln fortgesetzt, damit die Randsteigungen definiert sind.

**Graph A.** Auf `−2 ≤ x ≤ 4` besteht F aus zwei **parabolischen Bögen**, die bei `(0|4)` mit gemeinsamer Tangente zusammentreffen: links ein nach oben geöffneter Bogen mit Scheitel `(-2|0)` durch `(0|4)`; rechts ein nach unten geöffneter Bogen mit Scheitel `(2|8)` durch `(0|4)` und `(4|4)`. Sichtbare Stützpunkte sind `(-2|0), (-1|1), (0|4), (1|7), (2|8), (3|7), (4|4)`. Zwischen ihnen verlaufen **keine Geraden**, sondern die angegebenen glatten Parabelbögen. Kein Term ist auf der Aufgabenabbildung angegeben.

**Graph B (Transfer).** Ein anderer, nach unten geöffneter Parabelgraph H auf `0 ≤ x ≤ 2` hat den Scheitel `(1|3)` und verläuft durch `(0|2)` und `(2|2)`. Sein Graph wird getrennt von A gezeigt. Auch hier ist kein Term angegeben.

1. Zeichne zu Graph A in ein Koordinatensystem mit derselben x-Skala den **Funktionsgraphen f = F′**. Markiere seine Nullstelle, positive und negative Bereiche sowie die bei `x = 0` erkennbare Änderung des Steigungsverlaufs.
2. Untersuche das Verhalten von f bei `x = 0` und `x = 2` und begründe deine Skizze mit den Tangentensteigungen von F.
3. Zeichne **unabhängig** zu Graph B den Graphen `h = H′`. Markiere `h(1)` sowie die Steigungen von H bei `x = 0` und `x = 2`.

**Abgabe:** beide abgeleiteten Graphen als Foto oder digitale Zeichnung; textliche Beschreibung allein genügt nicht. Die Aufgabe fordert weder die Rekonstruktion der Funktionsterme noch ein Integral. Für barrierearme Textzugänglichkeit stehen die Plot-Spezifikationen zusätzlich unter den Abbildungen; sie ersetzen die Abbildungen im Release nicht.

### Kontrolllösung und mathematische Prüfung

Aus den Scheitel- und Durchgangspunktbedingungen folgen nur für die interne Kontrolle, nicht als Aufgabe:

| Bereich | F/H zur Kontrolle | abgeleiteter Graph |
| --- | --- | --- |
| A links, `−2 ≤ x ≤ 0` | `F(x) = (x + 2)²` | Gerade `f(x) = 2x + 4`, durch `(-2|0)` und `(0|4)` |
| A rechts, `0 ≤ x ≤ 4` | `F(x) = 8 − (x − 2)²` | Gerade `f(x) = 4 − 2x`, durch `(0|4), (2|0), (4|−4)` |
| B, `0 ≤ x ≤ 2` | `H(x) = 3 − (x − 1)²` | Gerade `h(x) = 2 − 2x`, durch `(0|2), (1|0), (2|−2)` |

Bei `x=0` stimmen in A linke und rechte F-Steigung (`4`) überein, also ist F dort differenzierbar; lediglich die Steigung **von f** springt von `+2` auf `−2`, sodass f einen Knick hat. Bei `x=2` wechselt F von Steigen zu Fallen; entsprechend wechselt f von positiv zu negativ und hat dort die Nullstelle. Graph B ist eine neue, verschobene und gespiegelte Form; seine Ableitung darf nicht aus einer bloßen Erinnerung an Graph A übernommen werden.

| Kriterium | Punkte |
| --- | ---: |
| Graph f zu A wirklich gezeichnet: beide linearen Äste, gemeinsamer Wert bei x=0, Nullstelle bei x=2, passende Vorzeichen und Größenordnung; ohne Zeichnung 0 Punkte | 5 |
| Graph h zu B wirklich gezeichnet: fallende Gerade mit `h(0)=2`, `h(1)=0`, `h(2)=−2`; ohne Zeichnung 0 Punkte | 5 |
| Begründung über `F′=f`, Tangenten, Vorzeichenwechsel und zulässigen Knick von f; ohne nachvollziehbaren Bezug zwischen F-Tangentensteigungen und f-Werten 0 Punkte | 2 |

Der korrigierte numerische Entwurf sieht Bestehen ab **11/12** Punkten vor. Ohne eine der beiden tatsächlichen Zeichnungen sind höchstens 7 Punkte, ohne Begründung höchstens 10 Punkte erreichbar. Ein Bestehen verlangt somit rechnerisch mindestens 4/5 Punkte für **jede** Zeichnung und 1/2 für die fachliche Begründung. Bewertet wird die graphische Leistung, nicht ein auswendig reproduzierter Term. Der erste Begründungspunkt setzt einen korrekten Zusammenhang zwischen F-Tangentensteigung und f-Wert voraus; der zweite bewertet die Begründung des Vorzeichenwechsels bei x = 2 und des zulässigen Knicks von f bei x = 0. Die serverseitige Prüfung kennt nur die Gesamtsumme: Die Erfüllung dieser Teilleistung muss im Coach-Korrekturverhalten mit positiven und negativen Einsendungen end-to-end nachgewiesen werden. **Release-Hold:** Vor `released` sind zudem die Anzeige beider Graphen, die Zeichenpflicht und eine eigenständige finale Assessmentquelle statt dieser Kandidaten-README zu prüfen.

## Offene Integrationspunkte

1. Die beiden SVG-Eingabegraphen wurden bytegleich nach `app/public/assets/assessment-materials/mathematik/22842d80-de9d-5dad-9819-6ae6e9ca61be/` übernommen und separat fachlich sowie bei 360 px gesichtet. Vite kopiert `app/public` beim Release-Build nach `backend/src/main/resources/static`; ein Build-/Cockpit-/MCP-End-to-End-Test dieser konkreten Aufgabe bleibt vor Freigabe nötig.
2. Das eigene BW-Atom `85eda551-cfc1-52c6-a252-4c7394c1f7e6` und der Prüfungsknoten `22842d80-de9d-5dad-9819-6ae6e9ca61be` sind als Kandidaten in Kanon, BW-Mapping und Views modelliert. `examData.reviewStatus` bleibt ausdrücklich `needs_review`: Das Cockpit zeigt Prüfungsdaten in diesem Status nicht an. Die Aufgabe ist derzeit **keine ausgelieferte Terminalprüfung**.
3. Vor `released` sind die neuen Bewertungs-Mindestkriterien, tatsächliche Anzeige beider Graphen, Coach-Verweis auf das Cockpit, Einreichung als Zeichnung und Korrekturverhalten end-to-end zu prüfen. Erst nach eigenem D-/P-/A-/M-/V-Prozess kann das Inhaltsatom zum strikten M7-Zähler beitragen. AI-Kandidatenprüfung ist keine menschliche Einzelabnahme.
