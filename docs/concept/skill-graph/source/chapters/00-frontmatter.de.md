:::titlebox {title="Geltung dieser Fassung"}
**Stand 19. November 2026.** Die am 4. und 11. November bestätigte Anerkennungsregel gilt. Sie bestimmt, wie Lernergebnisse und gültig anerkannte Kompetenzen die nächsten Lernziele und den Abschluss beeinflussen. Die Abschnitte~@ref{sec:state}, @ref{sec:unit-completion} und~@ref{sec:assessment} enthalten die Formeln. Anhang~@ref{sec:implementation} beschreibt den Stand der Software.

**Vorschlag für die Fachrunde vom 19. November.** Eine bestandene Einheit könnte ein Gesamturteil auf dem ausgewiesenen Niveau tragen. Für die weitere Planung würde die zuständige Einheit nur ihre fachlich belegten eigenen Inhaltsziele freigeben. Die gesondert gekennzeichneten Abschnitte~@ref{sec:proposal-unit-completion} und~@ref{sec:proposal-unit-assessment} stellen diesen Entwurf zur Diskussion.
:::

## Leserführung und Geltungsbereich {#sec:readers-guide unnumbered=true}

Die ersten Kapitel erklären den Graphen und seine Auswertung für eine Person. Darauf bauen Lerneinheiten, Zeitplanung und die Anerkennung durch Prüfungen auf. Die Beispiele veranschaulichen das Modell. Die verbindlichen Inhalte eines Fachs stehen im jeweiligen Curriculum.

### Das Modell in sieben Schritten {#sec:seven-steps unnumbered=true}

Die Schritte nehmen den Gedankengang des Dokuments vorweg. Die englischen Zielnamen stammen aus dem Mechanik-Beispiel der englischen Originalabbildungen, erstmals in Abbildung~@ref{fig:overview}.

1. **Ziele und zwei Kantenarten.** Ein Lernziel hat eine stabile Identität. `contains` gliedert: *Kinematics* enthält *Velocity*. `requires` nennt die nötige Vorbereitung: *Velocity* setzt *Vectors* voraus. Gliederung allein begründet keine Voraussetzung (Abschnitte~@ref{sec:core} und~@ref{sec:relations}).
2. **Atome und Cluster.** Ziele ohne Kinder sind atomar; nur für sie wird ein Ergebnis gespeichert. Cluster gliedern. Im Zielzustand verbindet jede verfasste Anforderung ein Atom mit einem Atom, und keine ist überflüssig. Ältere Anforderungen an oder von Clustern bleiben als Übergangsbestand lesbar (Abschnitte~@ref{sec:relations} und~@ref{sec:validity}).
3. **Lernzustand und Frontier.** Ein ausdrückliches Ergebnis gehört zu einem atomaren Ziel. Die *Frontier* enthält die offenen Ziele, für die im betrachteten Bereich alle nötigen Voraussetzungen erfüllt sind (Abschnitt~@ref{sec:state}).
4. **Ausschnitte.** Das Personal Curriculum legt den längerfristigen persönlichen Umfang fest, der Fokus den vorübergehenden Arbeitsbereich. Abgeleitet wird stets im ganzen Graphen und erst danach eingeschränkt. Der Normalmodus prüft die Voraussetzungen innerhalb des Ausschnitts, der strikte Modus alle (Abschnitte~@ref{sec:filters} bis~@ref{sec:personal-scope}).
5. **Zieltypen.** Ein Fachziel kann Verstehen, Anwendung oder eigenes Handeln verlangen. Der Einzelbeleg muss diesen Anspruch erfüllen. Orientierung, Memorierung und Prüfungen haben jeweils einen eigenen Ergebnisvertrag (Abschnitt~@ref{sec:goal-types}).
6. **Lerneinheiten.** Der geltende Abschluss umfasst die effektiv beherrschten eigenen Ziele und abgeschlossene Kinder (Abschnitt~@ref{sec:unit-completion}). Einen repräsentativen Abschluss über erklärte Pflichtleistungen schlägt Abschnitt~@ref{sec:proposal-unit-completion} vor.
7. **Anerkennung durch Prüfungen.** Unter R1–R5 kann ein eigenes gewöhnliches Ziel bereits vor dem ganzen Einheitenabschluss anerkannt werden. Diese Anerkennung gilt fachübergreifend (Abschnitt~@ref{sec:assessment}). Welche spätere Planungsfreigabe stattdessen zur Diskussion steht, erklärt Abschnitt~@ref{sec:proposal-planning-release}.

### Aufbau, Status und Regelkennungen {#sec:structure-and-status unnumbered=true}

Das Register in Anhang~@ref{sec:rule-milestones} dokumentiert die geltenden Prüfpflichten. Die Vorschläge in den Abschnitten~@ref{sec:proposal-unit-completion} und~@ref{sec:proposal-unit-assessment} ändern diese Pflichten erst nach einer ausdrücklichen Entscheidung.

:::table {cols="33mm,X,35mm,12mm"}
| Abschnitte | Leitfrage | Status | Regeln |
| --- | --- | --- | --- |
| @ref{sec:core}--@ref{sec:filters}: Formaler Kern | Was kann gelernt werden, was setzt es voraus, und was ist als Nächstes verfügbar -- im ganzen Graphen und in einem Ausschnitt? | Normativer Kern | `GD-C` |
| @ref{sec:context-model}--@ref{sec:evidence-context}: Kontext, Sichten, Zieltypen, Qualität | Wo steht ein Ziel in einem Bildungsgang, was gehört zum persönlichen Umfang, wann gilt ein Ziel als geschafft, und woher stammt es? | Angrenzender Vertrag | `GD-X` |
| @ref{sec:learning-units}: Lerneinheiten | Welche Ziele bilden ein fachliches Ganzes, und wann ist es abgeschlossen? | Fachliche Struktur | `GD-U` |
| @ref{sec:levels}: Erwerbs- und Zeitplanung | Lässt sich der Erwerb in eine Reihenfolge und ein Zeitbudget einpassen? | Optionales Profil | `GD-P` |
| @ref{sec:assessment} Anerkennung | Wann gilt eine Kompetenz nach R1–R5 als nachgewiesen? | Geltender Vertrag | `GD-A` |
| Anhänge~@ref{sec:rule-milestones}--@ref{sec:build} | Wie wird welche Regel geprüft, wo weicht die Implementierung ab, und was bedeuten Begriffe und Symbole? | Nachschlageteil | `GD-D` |
:::

Für die Arbeit am Curriculum sind vor allem die Gültigkeit des Graphen, die Zieltypen und die Herkunft der Inhalte wichtig. Wer den Lernablauf entwickelt, findet die Auswahlregeln in den Abschnitten~@ref{sec:state} und~@ref{sec:filters}, die Bedeutung der Ergebnisse in den Abschnitten~@ref{sec:goal-types} und~@ref{sec:assessment}. Zu jeder Regel nennt Anhang~@ref{sec:rule-milestones} die vorhandenen Prüfungen.

### Lesekonventionen {#sec:conventions unnumbered=true}

**Verbindlichkeit.** „Muss“, „darf nicht“ und „verbindlich“ kennzeichnen Regeln des Modells. „Noch nicht implementiert“ heißt: verbindlich beschrieben, aber in der Laufzeit nicht umgesetzt. „Optional“ kennzeichnet ein Zusatzprofil. „Noch nicht entschieden“ kennzeichnet eine unentschiedene Frage; die Ampel OFFEN bezeichnet dagegen eine verbindliche Pflicht ohne belegtes hartes Gate.

**Schreibweisen.** Kursive Großbuchstaben bezeichnen Mengen und Relationen ($G$, $A$, $R$, $M$), kursive Kleinbuchstaben beliebige Ziele ($g$, $p$, $a$). Konkrete Beispielknoten einer Abbildung stehen aufrecht und serifenlos, genau wie im Bild beschriftet: In der Kette $\nd{Q}\to\nd{B}\to\nd{A}$ ist $\nd{A}$ ein einzelnes Ziel, nicht die Menge $A$ der atomaren Ziele. Ausgeschriebene Beispielnamen wie *Velocity* sind kursiv gesetzt. In einem Graphen zeigt ein `contains`-Pfeil vom Cluster zum Kind, ein `requires`-Pfeil vom Ziel zur Voraussetzung. Liest man einen Voraussetzungspfad in Lernreihenfolge, beginnt man am anderen Ende. Schreibmaschinenschrift kennzeichnet Feld- und Bezeichnernamen wie `requires`. Die sieben englisch beschrifteten Abbildungen~@ref{fig:overview} bis~@ref{fig:filters} sind unveränderte Originale der Quellspezifikation; die Bildunterschriften erläutern ihre Beschriftungen.

**Begriffe.** Die folgenden Begriffe werden leicht verwechselt und deshalb durchgehend in genau dieser Bedeutung verwendet. Anhang~@ref{sec:glossary} enthält das vollständige Verzeichnis der Begriffe und Symbole.

::include{block="frontmatter-distinctions"}

### Quellen und Grenzen der Aussagen {#sec:frontmatter-sources unnumbered=true}

Die fachlichen Verträge im Repository bleiben die maßgeblichen Einzelquellen. Anhang~@ref{sec:sources} ordnet alle Kapitel diesen Quellen zu. Anhang~@ref{sec:implementation} stellt die datierten Entscheidungen des Product Owners zusammen, auf die der Text verweist, und nennt die beim Erstellen überprüften Implementierungsabweichungen. Mathematische Beispiele, Bildunterschriften und Plausibilitätsprüfungen ersetzen weder fachliche Aufgabenreviews noch Untersuchungen mit Lernenden.
