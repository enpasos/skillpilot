# SkillPilot Coach v1 - lokaler Kandidat 1.1.0

Dieser Stand ist ausschliesslich ein lokaler, nicht publizierbarer Kandidat.
Er wurde weder vorbereitet noch in ein Portal hochgeladen oder fuer Produktion
aktiviert. Der eingereichte Baum `ai/openai plugin/skillpilot-coach-v1` bleibt
als Version 1.0.0 bytegenau unveraendert.

Der Kandidat ergaenzt hinter der standardmaessig ausgeschalteten Property
`skillpilot.openai.coach.v1.daily-plan-tools-enabled` zwei MCP-Werkzeuge:

- `get_skillpilot_daily_plan` liest die addierten Tagesanforderungen aller
  gueltigen Fachplaene in einer fuer den Chat bereinigten Darstellung.
- `resume_skillpilot_learning_plan` setzt eine moegliche Planfortsetzung als
  versionierten, wiederholsicheren Schreibvorgang um und liefert danach den
  frischen bestehenden Coach-Kontext.

Die lokale Kandidaten-SKILL erzwingt dabei die Reihenfolge: zuerst den frischen
Kontext laden, eine dort faellige Lernzielvisualisierung unmittelbar rendern
und erst danach den Tagesplan lesen. Wenn kein Lernziel aktiv ist und der
Tagesplan fortgesetzt werden kann, geschieht das samt einer gegebenenfalls neu
faelligen Visualisierung noch vor der ersten lernendenseitigen Antwort; erst
danach folgen Tageszahlen und Coaching. Fachlabels werden von Steuerzeichen
bereinigt, ungueltige Zaehlungen anonym als nicht verfuegbar behandelt und
gleiche bereinigte Fachlabels addiert.
`completedToday` bezeichnet ausschliesslich den aktuellen Beherrschungsstand
innerhalb der heute neu faelligen Menge, nicht eine Ereignishistorie dieses
Tages.

Mit ausgeschalteter Property bleibt die beobachtbare 1.0-Oberflaeche bei exakt
12 Werkzeugen und ihrem eingefrorenen Contract-Fingerprint. Nur eine bewusst
separat konfigurierte lokale Kandidateninstanz erhaelt 14 Werkzeuge. Eine
spaetere Aktivierung benoetigt eine eigene Produkt-, Review- und
Deploymententscheidung; dieser Kandidat nimmt sie nicht vorweg.
Der Review-Freeze von 1.0.0 ist damit nicht aufgehoben.
