# Produktentscheidung: Beherrschung durch Verständnis und selbständige Anwendung

**4. November 2026.** Dieser Beschluss ersetzt die bisherige Deutung impliziter
Erledigung als bloßen Entfall von Vorbereitung. Er gilt für die Konzepte;
die bisherige Implementierung ist noch nicht entsprechend korrigiert.

## Verbindliche Bedeutung

- **Transitive Minimalität bleibt erforderlich.** Die am 31. Oktober
  dokumentierte Aufhebung wird zurückgenommen. Die Rechnung muss indirekte
  Voraussetzungen verstehen, ohne redundante Direktkanten zu verlangen.
- **Direkt erledigt** bezeichnet den unmittelbaren Nachweis eines Lernziels,
  bei gewöhnlichen Kompetenzzielen auf Verständnisebene.
- **Implizit erledigt** bezeichnet die durch selbständige Anwendung in den
  zugehörigen Prüfungen nachgewiesene Beherrschung. Es ist keine Freistellung
  und kein schwächerer Abschluss.
- **Erledigt ist erledigt:** Beide Nachweiswege erfüllen spätere Voraussetzungen
  und zählen zum Gesamtfortschritt. Eine spätere offene Prüfung, ein Fokuswechsel
  oder ein anderer ausgewählter Lehrplan nimmt die Anerkennung nicht zurück.
- Gespeichert bleibt pro atomarem Ziel ausschließlich das binäre Ergebnis.
  Effektive Beherrschung wird aus expliziten Ergebnissen und festen fachlichen
  Abschlussverträgen abgeleitet. Es gibt keine zusätzlichen Mastery-Stufen,
  Freistellungsdatensätze oder qualifizierenden Prüfbelege.
- **Prüfungs- und Lernkartenziele bleiben selbst explizit zu erledigen.**
  Für sie gelten die normalen Bewertungs- beziehungsweise Recall-Regeln.

## Lokale Begründung, globale Wirkung

Ein autoritativ bestimmter Erwerbslevel umfasst seine Lernziele und sämtliche
zugehörigen Prüfungs- und Lernkartenziele. Innerhalb dieses Vertrags werden
alle transitiven Verbraucher berücksichtigt, auch über bereits gemeisterte
Zwischenziele hinweg. Ein beliebiger Baum- oder Fokusfilter definiert keinen
Abschlussvertrag. Die konkrete Levelauflösung ist später zu implementieren.

```text
Level 1: Prüfung Q1 ──requires──▶ B ──requires──▶ A
Level 2: Prüfung Q2 ──requires──▶ C ──requires──▶ A
```

Ist nur das gewöhnliche B gemeistert, bleibt A für die offene Q1 erforderlich.
Besteht die Person Q1 und sind damit sämtliche für A und B relevanten lokalen
Pflichten erfüllt, gelten A und B als durch Anwendung gemeistert. Die offene
Q2 verhindert dies nicht. Beim späteren Lernen von C ist A bereits erfüllt.
Es wird weder erneut als offen verlangt noch als zweites Ziel gezählt.

Eine weitere offene Prüfung im selben Level kann die Anerkennung von A
hingegen noch verhindern. Ein unabhängiges offenes Lernkartenziel hält den
Levelabschluss offen, aber nicht automatisch jede anderweitig bereits
nachgewiesene Kompetenz. Keine ausgewählte Prüfung und kein ausgewähltes
Lernkartenziel darf aus der Rechnung herausgefiltert werden.

Die [normative Abschlussrechnung](assessment-gated-completion.md) definiert
die Mengen und die Verbindung zur [Graph-Definition](graph-definition.md).
Das Dokument [Curriculare Level](curriculum-levels.md) beschreibt ihre
Einordnung. Zusätzliche ganze Level sperrende Zugangsgates bleiben ein
[getrennter optionaler Entwurf](curriculum-level-gates.md).

## Verbindliche Anforderung an Prüfungen

Die Aufgaben und normalen Bewertungsregeln müssen gemeinsam die **selbständige
Anwendung aller dadurch anerkannten Kompetenzen** absichern. Ein
Voraussetzungspfad, die Erwähnung einer Kompetenz oder ein angeleiteter
Rechenschritt genügt nicht. Der unabhängige fachliche Review fragt:

> Kann die relevante Prüfungsmenge bestanden werden, obwohl eine wesentliche
> dadurch anerkannte Kompetenz nicht selbständig angewandt wurde?

Wenn ja, muss Aufgabe, normale Bestehensregel oder Levelzuschnitt korrigiert
werden. Ein völlig fehlender wesentlicher Bestandteil darf nicht durch Punkte
aus anderen Bereichen ausgeglichen werden, während dieser Bestandteil als
beherrscht anerkannt wird. Nicht jede einzelne Prüfung muss alles doppelt
prüfen; maßgeblich ist die für die Anerkennung erforderliche Prüfungsmenge.
Dies ist eine Autorenpflicht, kein zweites Laufzeit-Bestehensverfahren.

Bestehende Prüfungen und frühere M7-Freigaben belegen diesen stärkeren Vertrag
nicht automatisch. Eine Prüfungsziel-ID muss eine stabile Anerkennungsbedeutung
behalten. Spätere Kanten oder Programmvarianten dürfen alten Ergebnissen keine
zusätzlichen Kompetenzen zuschreiben. Gleichwertige Aufgabenformen können
denselben Vertrag erfüllen; eine veränderte Anerkennungsbedeutung benötigt
eine eigene Prüfungsidentität oder eine ausdrücklich geprüfte Migration.
Die technische Ausgestaltung gehört in die spätere Umsetzungsplanung.

## Darstellung und Planung

Grüne und blaue Symbole dürfen den Nachweisweg unterscheiden; beide stehen für
erledigte Ziele. Ein Tooltip erklärt den direkten Nachweis beziehungsweise
den Nachweis selbständiger Anwendung. Wiederholen bleibt freiwillig möglich.

Gesamtfortschritt zählt eindeutige effektiv beherrschte Ziele innerhalb seines
Zielumfangs. „Nur explizit erreichte Lernziele zählen“ ändert allein die
Plananrechnung. Tages- und Wochenpensum zählen weiterhin nur tatsächliche
explizite Abschlussereignisse. Anerkennung erzeugt keine künstlichen Ereignisse
oder Datumsangaben. Siehe [Lernplanstatus](../didactic/unified-learning-plan-status.md).

## Vereinbarte Reihenfolge

1. Konzepte einschließlich LaTeX, Abbildungen und PDF auf frischer `main`-Basis
   konsolidieren und unabhängig prüfen.
2. Anschließend die Umsetzung neu planen.
3. Erst danach wiederverwendbare Teile des bisherigen PR prüfen. Die alte
   Curriculum- und Runtimearbeit wird nicht einfach fortgesetzt.

Dieser Stand ändert keine Produktionsdaten und behauptet weder einen passenden
produktiven Runtime noch eine bereits erfolgte Neuprüfung der Curricula.
