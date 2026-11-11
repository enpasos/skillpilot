:::titlebox {title="Geltung dieser Fassung"}
Deutsche Gesamtdarstellung, Stand **10. November 2026**. SkillPilot beschreibt Lernziele und ihre Beziehungen: `contains` gliedert Ziele, `requires` benennt fachliche Voraussetzungen. Vom kanonischen Zielbestand über das Personal Curriculum bis zum aktuellen Fokus und den gespeicherten Ergebnissen bleiben die Zielidentitäten erhalten. **Lerneinheiten** verbinden ein Lernversprechen mit eigenen Zielen und Kindeinheiten; Zeitpläne ordnen deren Erwerb verfügbarem Kalender und Budget zu. Ausdrücklich festgestelltes Verstehen und durch gültige lokale Prüfungen belegte selbstständige Anwendung zählen beide zur effektiv beherrschten Zielmenge.

**Geltung und Umsetzung.** Die atomare Normalform $R\subseteq A\times A$ und die Migrationsreihenfolge dorthin sind verbindlich. Anhang~@ref{sec:rule-milestones} ordnet die Regeln ihren Prüfgebieten zu, macht die tatsächlich harte Durchsetzung per Ampelschaltung sichtbar und grenzt vorhandene Gates ab. Die neue globale Anwendungsanerkennung ist auf der geprüften Hauptlinie **noch nicht implementiert**; Anhang~@ref{sec:implementation} beschreibt den Unterschied zum bisherigen Modell. Der Abschluss einer Lerneinheit wird aus eigenen Pflichten und Kindern abgeleitet, ohne eine zusätzliche Mastery-Stufe zu speichern.
:::

## Leserführung und Geltungsbereich {#sec:readers-guide unnumbered=true}

Ein Skill-Graph in SkillPilot beschreibt, *was* gelernt werden kann und welche Voraussetzungen dabei gelten. Darauf bauen vier weitere Aussagen auf, die das Modell bewusst getrennt hält:

- **Curriculare Sichten** bestimmen, welche dieser stabilen Ziele für eine Person gelten und wo sie in einem Bildungsgang stehen.
- Der **Lernzustand** hält für jedes atomare Ziel fest, ob es geschafft ist.
- **Lerneinheiten** erklären den fachlichen Zusammenhang vom überschaubaren Thema bis zum größeren Fachgebiet. Ihr Abschluss wird rekursiv aus Kindern und eigenen Pflichten abgeleitet, nicht pauschal gespeichert.
- Die **Planung** verteilt Erwerb und Übung auf verfügbare Zeit.

Die Ableitung impliziter Beherrschung verbindet ausdrückliche Ergebnisse, transitive Voraussetzungen und fachlich geprüfte lokale Verträge der Lerneinheiten. Alle diese Aussagen dürfen sich aufeinander beziehen, aber nicht stillschweigend gegenseitig ersetzen.

Diese Referenz ist für die deutschsprachige gemeinsame Prüfung und Weiterentwicklung des Modells bestimmt. Sie behandelt die Graph-Definition im weiteren Sinne: Identität, Kanten, Vererbung, Gültigkeit, Verfügbarkeit, Projektion, Zieltypen, Fortschritt, Zeitplanung, Abschluss, Quellen und Qualitätssicherung. Fachliche Lehrplaninhalte und konkrete Aufgabenbestände werden nicht vollständig abgedruckt. Die Beispiele sind Veranschaulichungen, keine als Curriculum freigegebenen Teilgraphen.

### Das Modell in sieben Schritten {#sec:seven-steps unnumbered=true}

Die Schritte nehmen den Gedankengang des Dokuments vorweg. Die englischen Zielnamen stammen aus dem Mechanik-Beispiel der englischen Originalabbildungen, erstmals in Abbildung~@ref{fig:overview}.

1. **Ziele und zwei Kantenarten.** Ein Lernziel hat eine stabile Identität. `contains` gliedert: *Kinematics* enthält *Velocity*. `requires` nennt fachliche Voraussetzungen: *Velocity* setzt *Vectors* voraus. Gliederung allein begründet keine Voraussetzung (Abschnitte~@ref{sec:core} und~@ref{sec:relations}).
2. **Atome und Cluster.** Ziele ohne Kinder sind atomar; nur für sie wird ein Ergebnis gespeichert. Cluster gliedern. Im Zielzustand verbindet jede verfasste Anforderung ein Atom mit einem Atom, und keine ist überflüssig. Ältere Anforderungen an oder von Clustern bleiben als Übergangsbestand lesbar (Abschnitte~@ref{sec:relations} und~@ref{sec:validity}).
3. **Lernzustand und Frontier.** Je atomarem Ziel gibt es genau ein gespeichertes binäres Ergebnis. Als Nächstes verfügbar -- in der *Frontier* -- ist ein offenes Atom erst, wenn alle Atome beherrscht sind, die es direkt oder über Ketten voraussetzt (Abschnitt~@ref{sec:state}).
4. **Ausschnitte.** Das Personal Curriculum legt den längerfristigen persönlichen Umfang fest, der Fokus den vorübergehenden Arbeitsbereich. Abgeleitet wird stets im ganzen Graphen und erst danach eingeschränkt. Der Normalmodus prüft die Voraussetzungen innerhalb des Ausschnitts, der strikte Modus alle (Abschnitte~@ref{sec:filters} bis~@ref{sec:personal-scope}).
5. **Zieltypen.** Der Zieltyp bestimmt, wann ein Ziel als geschafft gilt: ein Inhaltsziel durch festgestelltes Verstehen, ein Orientierungsziel durch den abgeschlossenen Einstieg, ein Memorierziel durch verifizierten Abruf, ein Prüfungsziel durch die bestandene Prüfung (Abschnitt~@ref{sec:goal-types}).
6. **Lerneinheiten.** Eine Lerneinheit verbindet ein Lernversprechen mit eigenen Zielen und Kindeinheiten. Ihr Abschluss wird aus diesen Pflichten abgeleitet und nicht zusätzlich gespeichert (Abschnitt~@ref{sec:learning-units}).
7. **Implizite Beherrschung.** Sobald keine offene Prüfung und kein offenes Memorierziel einer Lerneinheit ein eigenes Inhaltsziel mehr benötigt, gilt dieses Ziel als selbstständig angewandt -- vorausgesetzt, der lokale Vertrag der Einheit ist fachlich geprüft und gültig. Ausdrücklich festgestelltes Verstehen und so belegte Anwendung bilden zusammen die effektiv beherrschte Menge; beide erfüllen spätere Voraussetzungen und zählen zum Fortschritt (Abschnitt~@ref{sec:assessment}).

### Aufbau, Status und Regelkennungen {#sec:structure-and-status unnumbered=true}

Jeder Teil beantwortet eine Leitfrage und hat einen eigenen Status. Die letzte Spalte nennt die Kennungen, unter denen Anhang~@ref{sec:rule-milestones} die Regeln des Teils führt, etwa [GD-C07](@rule{GD-C07}) für eine Regel des formalen Kerns.

:::table {cols="33mm,X,35mm,12mm"}
| Abschnitte | Leitfrage | Status | Regeln |
| --- | --- | --- | --- |
| @ref{sec:core}--@ref{sec:filters}: Formaler Kern | Was kann gelernt werden, was setzt es voraus, und was ist als Nächstes verfügbar -- im ganzen Graphen und in einem Ausschnitt? | Normativer Kern | `GD-C` |
| @ref{sec:context-model}--@ref{sec:evidence-context}: Kontext, Sichten, Zieltypen, Qualität | Wo steht ein Ziel in einem Bildungsgang, was gehört zum persönlichen Umfang, wann gilt ein Ziel als geschafft, und woher stammt es? | Angrenzender Vertrag | `GD-X` |
| @ref{sec:learning-units}: Lerneinheiten | Welche Ziele bilden ein fachliches Ganzes, und wann ist es abgeschlossen? | Fachliche Struktur | `GD-U` |
| @ref{sec:levels}: Erwerbs- und Zeitplanung | Lässt sich der Erwerb in eine Reihenfolge und ein Zeitbudget einpassen? | Optionales Profil | `GD-P` |
| @ref{sec:assessment}: Implizite Beherrschung | Wann belegt eine bestandene Prüfung auch die Ziele, auf denen sie aufbaut? | Verbindliches Konzept, noch nicht implementiert | `GD-A` |
| Anhänge~@ref{sec:rule-milestones}--@ref{sec:build} | Wie wird welche Regel geprüft, wo weicht die Implementierung ab, und was bedeuten Begriffe und Symbole? | Nachschlageteil | `GD-D` |
:::

:::table {cols="35mm,X"}
| Status | Bedeutung in dieser Referenz |
| --- | --- |
| Normativer Kern | Verbindliche mathematische Graphsemantik aus `graph-definition.md`; zusätzliche Profile können strengere Regeln setzen. |
| Angrenzender Vertrag | Semantik von Projektion, Zieltypen, Quellen oder Lernablauf; der Implementierungsstand ist jeweils gesondert zu prüfen. |
| Fachliche Struktur | Rekursive Lerneinheiten mit Lernversprechen, eigenen Zielen und abgeleitetem Abschluss; keine behauptete Laufzeitfunktion. |
| Optionales Profil | Zeit- und Budgetplanung sowie bedingte Zugänge zu Lerneinheiten; harte Sperren und der direkte Prüfungszugang sind dafür noch nicht entschieden. |
| Noch nicht implementiert | Die neue Anerkennung impliziter Beherrschung ist verbindlich beschrieben, aber nicht umgesetzt; der bestehende Code folgt einem abweichenden Bedarfsmodell (Anhang~@ref{sec:implementation}). |
:::

Wer Curricula verfasst, braucht vor allem die Abschnitte~@ref{sec:core} bis~@ref{sec:validity}, @ref{sec:goal-types} und~@ref{sec:evidence-context}. Für die Laufzeitlogik sind die Abschnitte~@ref{sec:state}, @ref{sec:filters}, @ref{sec:personal-scope} und~@ref{sec:assessment} maßgeblich, für Qualitätssicherung und Review zusätzlich die Anhänge~@ref{sec:rule-milestones} bis~@ref{sec:test-strategy}. Die Abschnitte~@ref{sec:learning-units} und~@ref{sec:levels} richten sich an alle, die Kurse gliedern und planen.

### Lesekonventionen {#sec:conventions unnumbered=true}

**Verbindlichkeit.** „Muss“, „darf nicht“ und „verbindlich“ kennzeichnen Regeln des Modells. „Noch nicht implementiert“ heißt: verbindlich beschrieben, aber in der Laufzeit nicht umgesetzt. „Optional“ kennzeichnet ein Zusatzprofil, „offen“ oder „noch nicht entschieden“ eine bewusst unentschiedene Frage.

**Schreibweisen.** Kursive Großbuchstaben bezeichnen Mengen und Relationen ($G$, $A$, $R$, $M$), kursive Kleinbuchstaben beliebige Ziele ($g$, $p$, $a$). Konkrete Beispielknoten einer Abbildung stehen aufrecht und serifenlos, genau wie im Bild beschriftet: In der Kette $\nd{Q}\to\nd{B}\to\nd{A}$ ist $\nd{A}$ ein einzelnes Ziel, nicht die Menge $A$ der atomaren Ziele. Ausgeschriebene Beispielnamen wie *Velocity* sind kursiv gesetzt. Pfeile zeigen stets in Richtung der Relation, also vom Cluster zum Kind und vom Ziel zu seiner Voraussetzung. Schreibmaschinenschrift kennzeichnet Feld- und Bezeichnernamen wie `requires`. Die sieben englisch beschrifteten Abbildungen~@ref{fig:overview} bis~@ref{fig:filters} sind unveränderte Originale der Quellspezifikation; die Bildunterschriften erläutern ihre Beschriftungen.

**Begriffe.** Die folgenden Begriffe werden leicht verwechselt und deshalb durchgehend in genau dieser Bedeutung verwendet. Anhang~@ref{sec:glossary} enthält das vollständige Verzeichnis der Begriffe und Symbole.

::include{block="frontmatter-distinctions"}

### Quellen und Grenzen der Aussagen {#sec:frontmatter-sources unnumbered=true}

Die fachlichen Verträge im Repository bleiben die maßgeblichen Einzelquellen. Anhang~@ref{sec:sources} ordnet alle Kapitel diesen Quellen zu. Anhang~@ref{sec:implementation} stellt die datierten Entscheidungen des Product Owners zusammen, auf die der Text verweist, und nennt die beim Erstellen überprüften Implementierungsabweichungen. Mathematische Beispiele, Bildunterschriften und Plausibilitätsprüfungen ersetzen weder fachliche Aufgabenreviews noch Untersuchungen mit Lernenden.
