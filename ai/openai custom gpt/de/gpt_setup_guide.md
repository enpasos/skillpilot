# Builder-Setup: neuen SkillPilot GPT Coach (de) erstellen

Diese Anleitung erstellt einen **neuen deutschen Custom GPT von Grund auf**.
Es gibt keinen vorhandenen GPT zu aktualisieren oder zu klonen. Beginne im
Builder mit einer leeren Konfiguration und speichere sie zunächst ausschließlich
privat.

## 1. Neue GPT-Konfiguration

Empfohlene Metadaten:

- Name: `SkillPilot GPT Coach (de)`
- Beschreibung: `Persönlicher deutschsprachiger Lerncoach für dein in SkillPilot konfiguriertes Curriculum.`
- Sprache der Metadaten, Starter und Antworten: Deutsch
- Anfangssichtbarkeit: privat

Mögliche Conversation Starter ohne technische Werte:

- `Ich möchte mit SkillPilot lernen.`
- `Wie starte ich meine SkillPilot-Lernsitzung?`

Keinen früheren GPT duplizieren und keine alte GPT-ID, Freigabe-URL, Action oder
Knowledge-Datei übernehmen. Die neue URL wird erst nach erfolgreicher privater
Abnahme erfasst.

## 2. Betriebsannahme

Der private Standardstart setzt voraus, dass ChatGPT den geheimen Token aus dem
Ergebnis von `redeemStartCode` in späteren Action-Aufrufen wiederverwenden kann.
Dies ist vor jeder Freigabe mit dem unten beschriebenen Cross-Turn-Canary real zu
testen. Die OpenAI-Action-Dokumentation beschreibt Actions und Authentifizierung,
garantiert diese Retention aber nicht als stabilen Produktvertrag.

Der sichtbare `sps_...`-Relay ist ein bewusst gestarteter Notfallmodus. Er ist
kein automatischer Rückfall und nicht der normale WebUI-Start.

## 3. Instructions und Knowledge

Den vollständigen Inhalt von `system_instructions.md` unverändert in das
Instructions-Feld einfügen.

Nur diese sieben deutschen Knowledge-Dateien hochladen:

1. `knowledge_docs/visible_session_protocol.md`
2. `knowledge_docs/state_personalization_and_progress.md`
3. `knowledge_docs/coaching_and_mastery.md`
4. `knowledge_docs/deep_linking_and_resources.md`
5. `knowledge_docs/verified_recall.md`
6. `knowledge_docs/exam_proctor.md`
7. `knowledge_docs/errors_and_restart.md`

Keine Datei aus `en/` oder `action-regression/` hochladen. Manifest,
Setup-Anleitung und OpenAPI-Datei sind ebenfalls keine Knowledge-Dateien.

## 4. Neue Action anlegen

1. Eine neue Action in diesem GPT anlegen.
2. Den vollständigen Inhalt von
   `ai/openai custom gpt/de/skillpilot-api-4ai.de.json` als Schema einsetzen.
3. Authentifizierung als **API Key / Bearer** konfigurieren. Den produktiven Key
   ausschließlich aus der Deployment-Konfiguration in den Builder eintragen,
   niemals in Repository, Instructions oder Knowledge.
4. `https://skillpilot.com/privacy` als Datenschutzerklärung verwenden.

Das Schema muss genau zehn Operationen anzeigen:

- `redeemStartCode`
- `getVisibleState`
- `applyVisibleChoice`
- `requestVisibleNavigation`
- `setVisibleActiveGoal`
- `setVisibleMastery`
- `startVisibleVerifiedRecall`
- `getVisibleVerifiedRecallAnswer`
- `recordVisibleVerifiedRecallResult`
- `getVisibleExamEvaluation`

Alle zehn Operationen tragen `"x-openai-isConsequential": false`. Bei den neun
Session-Operationen muss der Parameter direkt `"name": "chatSessionToken"`
enthalten; kein wiederverwendeter Parameter-`$ref`. Der Builder darf keine
Schemafehlermeldung und keine übersprungene Funktion anzeigen.

Nicht benötigte optionale Fähigkeiten wie Websuche oder Code Interpreter nicht
aktivieren. Fachliches Feedback zu einem von der lernenden Person hochgeladenen
Bild muss im privaten Abnahmetest geprüft werden, sofern der aktuelle Builder
solche Eingaben für den GPT zulässt.

Den neuen GPT jetzt privat speichern. Noch keine WebGUI-URL konfigurieren und
noch keine Freigabe per Link erteilen.

## 5. Pflicht-Canary für private Retention

Immer einen neuen Chat, einen frischen fünf Minuten gültigen Startcode und die
reale neue Builder-Konfiguration verwenden. Testwerte nie in Screenshots oder
Tickets veröffentlichen.

1. Die vorbereitete Nachricht `Starte SkillPilot mit Startcode: SP-....-....`
   absenden. `redeemStartCode` muss genau einmal laufen, danach im selben Turn
   `getVisibleState`.
2. Sichtbare Antwort prüfen: Weder Startcode noch `sps_...`, `relayFooter`,
   Auswahlcode oder Lernziel-ID dürfen erscheinen.
3. In einem **neuen User-Turn** eine normale fachliche Frage stellen. Vor der
   Antwort muss `getVisibleState` mit dem intern wiederverwendeten Token
   erfolgreich laufen. Das ist der entscheidende Retention-Canary.
4. In einem weiteren Turn nur eine zuvor angezeigte Nummer senden.
   `applyVisibleChoice` muss die intern behaltene `selectionReference` und die
   Nummer verwenden; technische Werte bleiben verborgen.
5. Nach mehreren normalen Turns erneut State laden. Sobald ChatGPT einen Token
   oder eine Referenz erfragt, erfindet oder nicht einsetzen kann, ist der Canary
   fehlgeschlagen und der GPT darf nicht freigegeben werden.

## 6. Fachliche Abnahme

**Natürliche Benutzerführung:** `Ich möchte Mathe in der Oberstufe in Hessen lernen.`
Frische eindeutig passende Optionen im selben Assistententurn anwenden und nur
die erste offene Entscheidung zeigen. Fehlt eine Option, keinen Abschluss
behaupten. Eine reine Nummernantwort gilt nur für genau eine Auswahl.

Zusätzlich prüfen:

1. Curriculum, Stufe, Fächer und Kursprofil werden nicht im Chat geändert;
   fehlende Level-2-Konfiguration führt zurück zur WebGUI.
2. Fokus-/Scope- und Zielwechsel verwenden `requestVisibleNavigation`,
   `applyVisibleChoice` und den frischen Folgezustand. Eine ausdrücklich erlaubte
   Mehrfach-Scope-Auswahl verwendet nur `choiceNumbers`, nie zusätzlich
   `choiceNumber`.
3. Orientierung enthält keine Wissensprüfung; eine bloße Interessenauswahl
   speichert keine Mastery.
4. Gewöhnliche Mastery verlangt zwei unabhängige Checks oder echten Transfer und
   einen erfolgreichen `setVisibleMastery`-Response.
5. Verified Recall verwendet keine modellgewählte `batchSize`, zeigt
   `expectedAnswer` nie vor der Antwort, speichert jedes Ergebnis und setzt nach
   `masterySaved=true` keine zusätzliche Mastery.
6. Die Prüfungslösung fehlt im State; Evaluation folgt erst nach vollständiger
   Abgabe, gleichwertige Lösungswege werden fair bewertet, es gibt keine
   Rückfrage und Mastery verlangt `passingPoints`.
7. Cockpit-/Bildlink, Progress sowie Fehlerfälle `409`, `401` und `410`.

## 7. Sichtbarer Notfallmodus und Negativtests

Mit einer eigens für den sichtbaren Fallback erzeugten Startnachricht testen: Das
vollständige `sps_...`-Token steht im ersten Benutzertext und `redeemStartCode`
läuft nicht. Auswahlcode, erforderliche IDs und Karten-IDs bleiben sichtbar;
jede normale Antwort endet mit dem deutschen `relayFooter`.

Negativtests:

- Chat ohne Startcode oder sichtbaren Notfalltoken: keine Action und keine Bitte
  um SkillPilot-ID oder Token.
- Fehlender privater Token in einem späteren Turn: kein Moduswechsel;
  kontrollierter Neustart über `skillpilot.com`.
- Abgelaufener Token (`410`): keine weitere Action und kein veralteter Footer.

## 8. Freigabe und neue URL

Erst wenn Canary und vollständige Abnahme bestanden sind:

1. die vom Builder neu vergebene GPT-URL erfassen;
2. die gewünschte Freigabestufe nach aktueller OpenAI-Policy setzen;
3. die URL ausschließlich in die ausdrücklich freigegebene, sprachspezifische
   Deployment-Konfiguration übernehmen;
4. einen Start aus der späteren WebGUI-Route erneut vollständig testen.

Die URL gehört nicht in Instructions, Knowledge, Schema oder Manifest. Eine
deutsche GPT-URL darf nie als englische Konfiguration wiederverwendet werden.

## 9. Lokale Vertragsprüfung

Vor der Builder-Erstellung aus dem Repository-Root ausführen:

```bash
npm test --prefix "ai/openai custom gpt"
```

Offizielle Referenz:
https://developers.openai.com/api/docs/actions/getting-started#step-3-create-the-gpt-action-and-test
