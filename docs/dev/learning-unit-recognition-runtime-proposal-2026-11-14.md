# Stufe 3: Anerkennung zur Laufzeit, Entscheidungsvorlage vom 14. November 2026

Stand: 14. November 2026. Diese Vorlage bereitet Stufe 3 des
[Umsetzungsplans](mathematics-physics-learning-units-plan.md) vor: Das Backend
leitet aus gültigen Einheitenverträgen die wirksame Beherrschung ab. Sie ändert
keinen Code und keine Curriculumdaten. Vier Fragen entscheidet der Product
Owner; zu jeder steht eine Empfehlung.

## 1. Ausgangslage

Normativ gilt seit dem 4. November die
[Produktentscheidung zur Beherrschung durch Anwendung](../concept/skill-graph/completion-semantics-clarification-2026-11-04.md)
mit der Rechnung der
[Graph Definition §13](../concept/skill-graph/assessment-gated-completion.de.md):

$$
M_{\mathrm{eff}} = M \cup \bigcup_{U} I_U, \qquad
I_U = \mathrm{Own}(U) \setminus \bigl(M \cup P_U \cup N_U\bigr),
$$

ausgewertet nur für Einheiten, die R1–R5 erfüllen. $M$ sind die expliziten
Ergebnisse, $P_U$ die eigenen Prüfungs- und Lernkartenziele, $N_U$ ihr offener
Bedarf.

Produktiv läuft dagegen noch die am 4. November abgelöste Rechnung des
Arbeitsentfalls (`automatic:personal-curriculum`, beschrieben in
[Assessment-gated Completion](assessment-gated-completion-pilot.md)). Dort gilt
jedes nicht gemeisterte Ziel als erledigt, das keine offene Prüfung des
Persönlichen Lehrplans mehr benötigt, auch ohne bestandene Prüfung. Der
Katalog läuft im Backend immer in diesem Modus, und die Completion ist
standardmäßig eingeschaltet. Der Satz im Umsetzungsplan, bis Stufe 3 ändere
sich für Lernende nichts, gilt deshalb nur für die Einheiten: Der
Arbeitsentfall wirkt schon heute.

| Stelle | Heute (Arbeitsentfall) | Nach Stufe 3 |
| --- | --- | --- |
| Lernempfehlung (Frontier) | überspringt entfallene Ziele | Eine Voraussetzung ist erfüllt, wenn sie in $M_{\mathrm{eff}}$ liegt; sonst entfällt kein Ziel. |
| Plan-IST | zählt standardmäßig $M \cup W_{PC}$ | zählt $M_{\mathrm{eff}}$; „Nur explizit erreichte Lernziele zählen“ bleibt. |
| Cockpit | blaues Schild „Für diesen Abschnitt nicht mehr erforderlich“, blauer Balkenanteil | Blau heißt „durch Anwendung nachgewiesen“; der Tooltip nennt Einheit und Prüfung. |
| Coach | erhält Entfall und blockierende Prüfung | erhält $M_{\mathrm{eff}}$ und je anerkanntem Ziel die Einheit |

Unverändert bleiben: Je Ziel wird nur das binäre Ergebnis gespeichert, Tages-
und Wochenpensum zählen nur explizite Abschlussereignisse, und Prüfungen
bleiben direkt ansteuerbar.

Heute tragen drei Einheiten vollständige R2-Nachweise. Nach der Umstellung
erhalten deshalb zunächst nur wenige Ziele eine Anerkennung, und der heutige
Entfall außerhalb dieser Einheiten fällt weg. Das ist die gewollte Folge der
Entscheidung vom 4. November, für Lernende aber sichtbar: Ziele, die heute
blau sind oder im Plan-IST mitzählen, sind danach wieder offen.

## 2. Entscheidungen

### E1: Wann der Arbeitsentfall abgeschaltet wird

Dass die Anerkennung den Arbeitsentfall ablöst, ist entschieden (4. und
12. November). Offen ist der Zeitpunkt.

| Möglichkeit | Folge |
| --- | --- |
| **Mit der Aktivierung der Anerkennung, in einem Schritt (Empfehlung)** | Es gibt nie zwei Rechnungen nebeneinander, deren Blau sich nicht unterscheiden ließe. Die Prüfungsabkürzungen, also der direkte Prüfungsstart, bleiben. |
| Vorher in einem eigenen Schritt | Bis zur Aktivierung gibt es gar keine implizite Erledigung. Lernende verlieren den Entfall, ohne dass schon etwas an seine Stelle tritt. |

### E2: Wie R5 umgesetzt wird

R5 verlangt: Ein späterer Zuschnitt einer Einheit oder eine spätere Kante
verschafft vorhandenen Ergebnissen keine zusätzliche Anerkennung. Drei Fälle
zeigen, worum es geht:

- Eine neue Einheit fasst eine Prüfung, die jemand vor Monaten bestanden hat.
  Dieses alte Bestehen darf die Ziele der neuen Einheit nicht anerkennen.
- Ein neuer Zuschnitt nimmt ein Ziel X in eine Einheit auf, deren Prüfungen
  schon bestanden sind. X darf dadurch nicht sofort anerkannt sein.
- Eine Kante von einer offenen Prüfung zu einem eigenen Ziel entfällt. Das Ziel
  darf dadurch nicht über ein früheres Bestehen einer anderen Prüfung frei
  werden.

Das Backend speichert dafür heute nichts Brauchbares. Die Mastery-Zeile hat nur
Wert und `updated_at`, und `updated_at` ändert sich bei jedem Schreiben. Jeder
echte Übergang auf „bestanden“ erzeugt dagegen ein Abschlussereignis
(`learner_goal_completion`); Importe erzeugen keines, und das Ereignis bleibt
bestehen, solange die lernende Person besteht.

Der **Vertragsstand** $H_U$ einer Einheit ist ein Hash, den Backend und
Validator aus der Landschaft ableiten: eigene Ziele, eigene Prüfungs- und
Lernkartenziele, für jedes davon die eigenen Ziele auf seinem
Voraussetzungspfad, und je Abdeckungsreview die abgedeckten Ziele. Mehr
braucht die Rechnung nicht, weil $I_U$ nur eigene Ziele enthält. Eine Kante
ändert $H_U$ nur, wenn sie ändert, welche eigenen Ziele eine eigene Prüfung
benötigt. Die geprüfte **Aufgabenfassung** einer Prüfung, also der Hash von
Aufgabe, Lösung und Bewertung, steht nicht in $H_U$, sondern im Ereignis.

| Möglichkeit | Folge |
| --- | --- |
| **A: Vertragsstand am Abschlussereignis (Empfehlung)** | Besteht jemand eine eigene Prüfung einer Einheit, speichert das Backend am vorhandenen Ereignis die Einheit, $H_U$ und die bestandene Aufgabenfassung. Für die Anerkennung zählt die Prüfung als bestanden, wenn ihr letztes Ereignis den aktuellen $H_U$ trägt und diese Aufgabenfassung noch mit demselben Hash geprüft ist. Sonst bleibt ihr explizites Ergebnis stehen, ihr Bedarf aber offen. Neu sind Spalten an einer vorhandenen Tabelle, kein zweiter Status und keine neue Tabelle mit Lernendendaten. |
| B: Aktivierungsprotokoll | Das Backend hält global fest, seit wann ein $H_U$ gilt; ein Bestehen zählt, wenn sein Ereignis danach liegt. Es entstehen keine Lernendendaten, aber die Bindung ist unscharf, wenn beim Deployment kurz alte und neue Instanzen nebeneinander laufen, und nach einer Rücknahme. |
| C: A und ein Vertragsarchiv | Frühere Vertragsstände bleiben auswertbar, eingefroren als eigene Ziele, geschützte Ziele und deren Bedarf an eigenen Zielen. Dann nimmt auch eine Vertragsänderung keine Anerkennung zurück. Das ist mehr Aufwand und lässt sich auf A nachrüsten, weil das Ereignis den Vertragsstand schon benennt. |

Verworfen ist eine Bindung über den Zeitstempel der Mastery-Zeile.

Folgen von A:

- **Bestehen vor der Umstellung erkennen nichts an.** Sie tragen keinen
  Vertragsstand. Das ist R5 im Wortlaut: Vorhandene Ergebnisse gewinnen keine
  Anerkennung.
- **Eine Vertragsänderung setzt die abgeleitete Anerkennung dieser einen
  Einheit zurück**, bis die betroffenen Prüfungen erneut bestanden sind.
  Explizite Ergebnisse bleiben. Das deckt Abnahmefall 10 des Plans.
- **Lernkartenziele zählen mit ihrem expliziten Stand.** Ihr Bestehen beendet
  nur Bedarf und erkennt selbst nichts an; die Bindung braucht nur die
  Prüfungen.
- **Erneutes Bestehen muss ein Ereignis erzeugen.** Heute entsteht ein
  Ereignis nur beim Übergang von offen zu bestanden. Damit jemand nach einer
  Vertragsänderung oder nach einem Import die Anerkennung zurückholen kann,
  legt ein erneutes Bestehen einer eigenen Prüfung ebenfalls ein Ereignis an,
  ohne Periodenzählung, so wie heute schon Übungsnachweise.
- **`revision` folgt $H_U$.** Der Validator verlangt eine neue `revision`,
  sobald sich $H_U$ gegenüber dem ausgelieferten Stand ändert. Die Graph
  Definition sieht diese Regel bereits für die Bindung zur Laufzeit vor.

### E3: Wie experimentelle Ziele zu einer Einheit gehören

Seit dem 14. November steht fest, dass experimentelle Ziele nie anerkannt
werden (Plan, Abschnitt 5). Offen ist die Form im Vertrag.

| Möglichkeit | Folge |
| --- | --- |
| **Neue Platzierungsrelation `ownExplicit` (Empfehlung)** | Das Ziel gehört zur Einheit und zählt zu ihrem Gesamtumfang und zu ihrem vollständigen Abschluss. Es wird nie anerkannt, sein offener Stand hält keine anderen Ziele zurück, und R1 und R2 gelten für es nicht. Der Validator verlangt ein atomares gewöhnliches Ziel, das in keinem Abdeckungsreview steht. |
| Merkmal am Ziel | Es ändert Zielobjekte und kostet ihre Übertragung aus dem eingefrorenen Reduktionsnachweis. Ob ein Ziel nachweisbar ist, hängt zudem vom Kanal ab, nicht vom Ziel selbst. |
| Weiter ohne Einheit | Dann erreicht Physik nie `learningUnitCoverage: complete`, weil R4 dafür für jedes Ziel eine Einheit verlangt. |

Der Vertrag erkennt ein experimentelles Ziel nicht selbst. Die Fachprüfung der
Einheit entscheidet und protokolliert es; `ownExplicit` ist ihr Ergebnis. Die
Relation ist allgemein und passt auch auf andere Ziele, die sich im Kanal nicht
prüfen lassen.

### E4: Aufgabenvarianten

Aufgabe, Lösung und Bewertung stehen heute am Prüfungsziel (`taskContent`,
`solutionContent`, `scoring`), und der Abdeckungsreview bindet ihren Hash. Eine
Einheit soll nach einer aufgedeckten Lücke eine frische, gleichwertige Prüfung
anbieten können (Graph Definition §11).

| Möglichkeit | Folge |
| --- | --- |
| **Form im neuen Vertrag festlegen, Inhalte später (Empfehlung)** | Ein Prüfungsziel kann mehrere Varianten tragen, jede mit eigener Aufgabe, Lösung und Bewertung, aber derselben Abdeckungsangabe. Jede Variante braucht ihren eigenen Review. Das Ereignis nennt die bestandene Aufgabenfassung (E2), und ein Bestehen zählt, solange diese Variante mit demselben Hash geprüft ist. Eine neue Variante ändert $H_U$ nicht. |
| Erst mit der ersten Einheit, die Varianten braucht | Weniger Arbeit jetzt, aber ein zweiter Vertragswechsel und eine zweite Umstellung der Bindung. |

Eine Variante zu ergänzen ist eine Änderung des Prüfungsziels und braucht
dessen Reviews.

## 3. Vertragsversion

Die Relation `ownExplicit`, die Varianten und die Regel für `revision` kommen
in einen neuen Paketvertrag 1.3 neben 1.2; veröffentlichte Dateien älterer
Versionen bleiben unverändert. Die Produktion liest im Repositorymodus direkt
die kanonische Landschaft. Der Vertrag betrifft deshalb Paketverbraucher und
den Weitergabeledger, nicht die Frage, ob das Backend die Einheiten sieht.

## 4. Lieferschnitte

Jeder Schnitt ist ein eigener PR. Bis zum letzten ändert sich für Lernende
nichts.

| Schnitt | Inhalt | Für Lernende |
| --- | --- | --- |
| 3a | Rechnung als reine Funktion in TypeScript und Java. Beide lesen dieselben Abnahmefälle (Plan, Abschnitt 8). Ableitung von $H_U$. | keine Änderung |
| 3b | Vertrag 1.3: `ownExplicit` und Varianten in Schema, Validator und Paketvalidator; `revision` folgt $H_U$ | keine Änderung |
| 3c | Backend: Vertragsstand und Aufgabenfassung am Abschlussereignis (Liquibase), Ereignis bei erneutem Bestehen, Projektion von $M_{\mathrm{eff}}$ hinter einem Schalter, der ausgeschaltet ist | keine Änderung |
| 3d | Verbraucher hinter demselben Schalter: Lernempfehlung, Plan-IST, Cockpit, Coachkontext; der Arbeitsentfall wird dabei entfernt | keine Änderung, solange der Schalter aus ist |
| 3e | Einschalten durch den Product Owner; Deployment und Hostabnahme getrennt | Umstellung |

Schnitt 3a hängt von keiner der vier Entscheidungen ab, bis auf die Fälle 7, 8
und 10 des Plans, die R5 betreffen. Er kann sofort beginnen.

## 5. Grenzen

- Ganz-Einheits-Voraussetzungen und Sperren bleiben unentschieden; keine
  Möglichkeit hier braucht sie.
- Den Wissenskontext an den Coach zu liefern ist ein eigener Schritt
  (Plan, Abschnitt 4) und gehört nicht zu Stufe 3.
- Der Stand der Lernenden liegt im Backend. Jede Anbieterspur sieht die
  Anerkennung deshalb ohne eigene Erweiterung. Die Hostabnahme folgt der
  Reihenfolge der Anbieter in `AGENTS.md` §0.
- Die Zahl der Ziele, die heute über den Arbeitsentfall blau sind, lässt sich
  ohne Lernendendaten nicht angeben; diese Vorlage nennt keine.
