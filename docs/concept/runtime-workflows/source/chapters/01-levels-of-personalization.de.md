## Ebenen der Personalisierung {#sec:levels-of-personalization}

Dieses Kapitel beschreibt, wie SkillPilot vom veröffentlichten Curriculum-Katalog bis zur individuellen atomaren Beherrschung eingrenzt. Die vorgeschaltete Katalognavigation liegt vor den vier Personalisierungsebenen und wird niemals als Lernendenzustand gespeichert.

Die vier Ebenen beschreiben Auswahl und Lernstand einer Person. [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md) gliedern den Lernstoff im gewählten Bildungskontext. Eine Einheit kann als Fokus gewählt werden. Was ihr Abschluss belegt, ist eine eigene fachliche Frage.

### Vor Ebene 1: Katalognavigation {#sec:personalization-catalog}

Lernende wählen zunächst einen Katalogbereich wie **Schule**, **Hochschule** oder **Sprachen und Weiterbildung**, um ein passendes Wurzel-Curriculum zu finden. Dieser Schritt dient ausschließlich der Orientierung im Katalog.

### Ebene 1: Basis-Curriculum {#sec:personalization-level1}

Gewählt wird genau ein veröffentlichtes Wurzel-Curriculum, das den vollständigen Zielraum bereitstellt, ohne kanonische Lernziele zu kopieren oder umzubenennen (z. B. `Gymnasium (DE)`, ein Studiengangskatalog oder eine CEFR-Sprach-Skill-Landschaft).

Nur in `curricula/curriculum_manifest.json` deklarierte Wurzel-Curricula sind in der Oberfläche wählbar und für Champion-Registrierungen zulässig:

```json
{
  "curricula": [
    { "id": "a0e13c56-c25f-4742-9272-3a1a603ee52e", "title": "Gymnasium (DE)" }
  ]
}
```

Jede Manifest-ID muss unter `curricula/` existieren, darf keine Teil- oder Modullandschaft sein und wird in CI gegen die berechnete Wurzelmenge geprüft.

### Ebene 2: Persönlicher Lehrplan (Personal Curriculum) {#sec:personalization-level2}

Der Persönliche Lehrplan ist der verbindliche, längerfristige Lernumfang innerhalb des Basis-Curriculums — er bestimmt die geltende curriculare Sicht und nicht den kurzfristigen Arbeitsfokus. Für deutsche Schulcurricula gilt die semantische Reihenfolge:

1. **Bundesland / Jurisdiktion** (einschließlich expliziter kanonischer Sicht, sofern verfügbar);
2. **Dauermodell** (z. B. G8 oder G9, sofern landesspezifisch relevant);
3. **Stufe** (Sekundarstufe I, Sekundarstufe II oder ausdrücklich beide);
4. **Ausgewählte Fächer**;
5. **Kursprofil je gewähltem Fach** (sofern einschlägig).

Die Auswahl liefert die atomaren Ausgangsziele $S$. Die persönliche Lernbasis $L$ umfasst $S$ und alle im kanonischen Graphen transitiv benötigten Voraussetzungen. Dazu können Ziele eines anderen Fachs gehören. Ein Fokuswechsel ändert diese Lernbasis nicht.

Das Kursprofil hängt am einzelnen Fach: Mathematik `LK` und Physik `GK` können parallel gelten, `LK` impliziert niemals automatisch Sekundarstufe II, und eine fehlende Stufenangabe wird niemals stillschweigend stufenübergreifend gedeutet. Ebene 2 löst die geltende Kompositionsansicht auf und begrenzt Fokus, Frontier, Fortschritt und Abschluss; Änderungen revalidieren Fokus und `activeGoal`, ohne stabile Ziel-IDs oder globale Mastery zu löschen.

**Einheitlicher First-Party-Editorvertrag:** Ebene 2 wird ausschließlich im First-Party-WebGUI von SkillPilot gepflegt (vor dem Lernstart auf dem Startbildschirm sowie später im Cockpit) über gemeinsame Backend-Optionen, Validierung und Speicherung. Der OpenAI-ChatClient fragt Ebene 2 weder ab noch verändert er sie; ist sie unvollständig, stoppt er das Fachcoaching und verweist auf das WebGUI.

### Ebene 3: Lernfokus und aktives Lernziel {#sec:personalization-level3}

Ebene 3 ist bewusst leichtgewichtig veränderbar und besteht aus zwei Teilen:

- **Ebene 3a — Fokus:** eine oder mehrere Fokuswurzeln, die den aktuellen Lernkorridor wählen (z. B. Jahrgangsstufe 7, Q1 oder Analysis; Programmeinheiten sind selbst keine kanonischen Lernziele).
- **Ebene 3b — Aktives atomares Ziel:** höchstens ein konkretes, überprüfbares atomares Lernziel als unmittelbares Arbeitsziel.

Bei einer Fokusweitung veröffentlicht das Backend entlang des sichtbaren Vorfahrenpfads zur Wurzel nur gültige breitere Vorfahren, die noch offene `target`-Ziele ergänzen (nächstgelegener Vorfahr zuerst, unter Erhalt unabhängiger Mehrfachwurzeln in `goalIds`). Ein automatischer Vorschlag erfolgt nur nach tatsächlichem Abschluss des aktuellen Fokus (nicht bei bloß blockierter Frontier) und erfordert die Zustimmung der lernenden Person.

Die Wahl einer höheren Einstiegsebene beschreibt, woran die Person arbeiten möchte. Ein Fokuswechsel oder eine `requires`-Kante erzeugt keinen Nachweis für frühere Einheiten oder deren Ziele. Wer eine angebotene Prüfung direkt versucht, erbringt erst mit dem erfolgreichen Versuch einen eigenen Prüfungsbeleg. Zum Lernweg und zum Einheitenvorschlag siehe @ref{sec:workflow-step4}.

### Ebene 4: Mastery und orthogonale Zeitachse {#sec:personalization-level4}

Der dauerhaft gespeicherte Lernstand gehört zur stabilen UUID des atomaren Ziels und bleibt über Fachansichten, Personal Curriculum und Fokuswechsel hinweg erhalten. Ein Einzelziel hat einen binären Ergebnisvertrag. Zusammengefasste Fortschrittswerte brauchen einen benannten Umfang und eine Zählweise. Im heutigen Lernplan lässt sich einstellen, dass nur explizit erreichte Ziele angerechnet werden. Eine im jeweiligen Umfang entfallene Arbeit erzeugt keinen gespeicherten Erfolg für das Atom. [Lernplanstatus](repo:docs/concept/didactic/unified-learning-plan-status.md)

**Geltender Vertrag vom 4./11. November.** Für die effektive Beherrschung $M_{\mathrm{eff}}=M\cup I$ ergänzt die abgeleitete Anerkennung $I$ den gespeicherten Lernstand $M$. Die Anerkennung entsteht in der zuständigen Einheit und bleibt beim Fokuswechsel wirksam. Schritt 4 beschreibt den Stand der Umsetzung und den Vorschlag vom 19. November. Siehe @ref{sec:workflow-step4}.

**Orthogonale Zeitachse:** Ein datierter Kurs- oder Klausurplan ist kein fünftes Personalisierungslevel, sondern eine Ausführungsplanung für das **Wann** innerhalb von Ebene 2 (siehe [Einheitlicher Lernplanstatus](repo:docs/concept/didactic/unified-learning-plan-status.md) und [Zeitachsenkonzept](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)).
