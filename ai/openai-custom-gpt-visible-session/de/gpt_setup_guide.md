# Builder-Setup: SkillPilot Lerncoach – Visible Session (DE)

Diese Konfiguration aktualisiert den **bestehenden deutschen SkillPilot-GPT** an
Ort und Stelle:

`https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch`

Keinen neuen GPT anlegen, duplizieren oder klonen. GPT-ID, URL, Eigentümerschaft
und Freigabe bleiben unverändert. Keine Datei aus `ai/openai custom gpt/` in diese
Konfiguration übernehmen.

## 1. Basisdaten

- Bestehenden Namen, Profil und Freigabe nicht ändern.
- Prüfen, dass keine Gesprächsaufhänger einen alten Startcode-Flow auslösen. Der
  reguläre Start kommt mit vorbereitetem Sitzungstoken aus dem SkillPilot-Cockpit.

## 2. Instructions

Die bestehenden Instructions vollständig ersetzen; nicht anhängen oder mischen.
Den vollständigen Inhalt von `system_instructions.md` unverändert in das Builder-
Feld **Instructions** kopieren.

Wichtige Sanity Checks im Builder:

- `getVisibleState` wird im ersten Turn mit dem sichtbaren `sps_...`-Token genutzt.
- Vor jedem substantiellen normalen Folgeturn wird der State frisch geladen.
- Es gibt kein `redeemStartCode`.
- Jede normale Antwort endet mit dem deutschen SkillPilot-Sitzungsanker.
- Für einen Folgeturn benötigte Action-Werte werden zuvor sichtbar ausgegeben.
- Es gibt keine Frage nach einer dauerhaften SkillPilot-ID.

## 3. Knowledge

Zuerst alle bisherigen Legacy-Knowledge-Dateien aus diesem GPT entfernen. Danach
nur diese sieben deutschen Dateien hochladen:

1. `knowledge_docs/visible_session_protocol.md`
2. `knowledge_docs/state_personalization_and_progress.md`
3. `knowledge_docs/coaching_and_mastery.md`
4. `knowledge_docs/deep_linking_and_resources.md`
5. `knowledge_docs/verified_recall.md`
6. `knowledge_docs/exam_proctor.md`
7. `knowledge_docs/errors_and_restart.md`

Keine Legacy- oder englische Knowledge-Datei ergänzen. Insbesondere darf keine
Datei Anweisungen zur Startcode-Einlösung enthalten.

## 4. Action

1. Die bestehende SkillPilot-Action öffnen. Keine zweite Action daneben anlegen.
2. Das bestehende Schema vollständig durch die paketlokale Datei
   `ai/openai-custom-gpt-visible-session/de/skillpilot-api-4ai.de.json`
   ersetzen. Nicht die englische Datei und nicht die gleichnamige Datei aus dem
   Legacy-Paket verwenden.
3. Prüfen, dass die vorhandene Authentifizierung weiterhin **API Key** und
   **Bearer** ist. Falls der Builder sie beim Schematausch verworfen hat, den
   produktiven SkillPilot-Action-Key aus der Deployment-Konfiguration erneut
   eintragen. Den Key nie in eine Repository-, Knowledge- oder Instructions-Datei
   kopieren.
4. Falls der Builder eine Datenschutzerklärung verlangt:
   `https://skillpilot.com/privacy`

Diese deutsche API ist vollständig eigenständig. Sie muss genau neun Operationen
und ausschließlich Pfade unter `/api/ai/de/...` anzeigen:

- `getVisibleState`
- `applyVisibleChoice`
- `requestVisibleNavigation`
- `setVisibleActiveGoal`
- `setVisibleMastery`
- `startVisibleVerifiedRecall`
- `getVisibleVerifiedRecallAnswer`
- `recordVisibleVerifiedRecallResult`
- `getVisibleExamEvaluation`

Alle neun Operationen müssen in der Schemaquelle
`"x-openai-isConsequential": false` enthalten. Die lokale Paketprüfung validiert
dies für jede Operation einzeln.

Der Builder muss das Schema ohne rote Parameterwarnung übernehmen. Insbesondere
muss bei jeder Operation im `parameters`-Eintrag unmittelbar
`"name": "chatSessionToken"` stehen; dort darf kein
`#/components/parameters/...`-`$ref` verwendet werden. Die bloße Anzeige der neun
Namen unter „Verfügbare Aktionen“ reicht nicht, wenn oberhalb weiterhin
„skipping function due to errors“ steht.

Danach den **bestehenden** GPT aktualisieren/speichern. Es darf keine neue GPT-URL
entstehen.

## 5. Fähigkeiten

Websuche und Code Interpreter sind für diesen Coach nicht erforderlich. Bild-
Uploads der lernenden Person dürfen für fachliches Feedback nutzbar bleiben. Der
Coach rendert keine privaten Backend-Bilder in den Chat.

## 6. Abnahmetest

Immer mit einem frisch vom Cockpit erzeugten 24-Stunden-Token und einem neuen Chat
testen.

1. **Start:** Vorbereitete erste Nachricht absenden. Prüfen, dass
   `getVisibleState` aufgerufen wird und die Antwort als letzte Zeile den exakten
   Token im deutschen Sitzungsanker trägt.
2. **Auswahl:** Einen Zustand mit mehreren Optionen herstellen. Die Antwort muss
   Auswahlcode, Nummern und bei Lernzielen die vollständigen kanonischen IDs zeigen;
   Üben-/Prüfen-Texte dürfen keine internen Aktionsnamen enthalten.
3. **Folgeturn:** Nur eine Nummer antworten. Prüfen, dass `applyVisibleChoice`
   exakt den sichtbaren Auswahlcode und die sichtbare Nummer sendet.
4. **Multi-Scope:** Eine ausdrücklich erlaubte Mehrfachauswahl prüfen. Nur dann
   `choiceNumbers`, niemals zusammen mit `choiceNumber`.
5. **Navigation/Profil:** Im Unterricht ausdrücklich Lehrplan, GK/LK-Profil,
   Lernumfang und Ziel wechseln. Erst `requestVisibleNavigation`, dann sichtbare
   Auswahl, danach `applyVisibleChoice`; bei eindeutiger aktueller Wahl oder genau
   einer Option darf beides im selben Assistententurn erfolgen.
6. **Aktives Ziel:** Prüfen, dass der nächste Anker zusätzlich die kanonische
   Lernziel-ID enthält.
7. **Unterricht:** Mindestens zwei unabhängige Checks durchführen. Erst danach darf
   `setVisibleMastery` erfolgen; anschließend nur bei bestätigtem Erfolg als
   gespeichert bezeichnen.
8. **Stabile ID:** Eine sichtbare, nicht UUID-förmige stabile Memorierungsziel-ID direkt
   adressieren und prüfen, dass das Schema sie akzeptiert.
9. **Verified Recall:** Karten-IDs mit Prompts sichtbar ausgeben, erwartete Antwort
   erst nach Benutzerantwort laden, alle Batch-Ergebnisse vor `next` speichern und
   nach `masterySaved=true` kein `setVisibleMastery` aufrufen.
10. **Exam:** State enthält keine Lösung. `getVisibleExamEvaluation` darf erst nach
    vollständiger Abgabe laufen; Mastery nur bei erreichter Punktgrenze.
11. **Cockpit/Bild:** `interactionMode`, `requiresCockpit`, Bildlink und State-
    Refresh nach Rückkehr prüfen.
12. **Fortschritt:** Scope- und Curriculum-Abschluss korrekt unterscheiden.
13. **Ablauf:** Mit einem abgelaufenen Token `410` provozieren. Es dürfen keine
   weiteren Actions und kein alter Sitzungsanker folgen; die Antwort verweist auf
   `skillpilot.com`.
14. **Negativtest:** Einen Chat ohne `sps_...`-Token starten. Der GPT darf keine
   Action ausführen und keine SkillPilot-ID erfragen.

## 7. Lokale Vertragsprüfung

Vor jeder Builder-Aktualisierung aus dem Repository-Root ausführen:

```bash
npm test --prefix ai/openai-custom-gpt-visible-session
```
