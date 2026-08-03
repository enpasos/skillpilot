# Wissens- und Verhaltensparität des MCP-Lerncoaches

**Stand:** 30. Juli 2026

**Status:** normative Current-to-Target-Paritätsmatrix für den mehrsprachigen Coach-Skill
und chat-first MCP-App mit read-only Lernzielvisualisierung

Diese Matrix weist nach, **wo** die früheren Regeln technisch wirksam werden
sollen. Sie ist kein Nachweis, dass das Zusammenspiel von Modell, Tools,
Zustandsprojektion und Backend bereits dieselbe Endnutzerqualität wie der
frühere Custom-GPT-Coach erreicht. Die übergreifende Verhaltensaufgabe, Golden
Journeys und Acceptance-Gates stehen in
[Verhaltensintegration des MCP-Lerncoaches](openai-mcp-coach-behavioral-integration.md).

Die ChatGPT-MCP-App allein besitzt keine Knowledge-Uploadfläche wie ein Custom
GPT. Das versionierte sprachneutrale V1-Quellpaket unter
[`ai/openai plugin/skillpilot-coach-v1`](https://github.com/enpasos/skillpilot/tree/main/ai/openai%20plugin/skillpilot-coach-v1)
ergänzt sie deshalb um einen Coach-Skill. Die bewährten deutschen Inhalte unter
`ai/openai custom gpt` bleiben fachlich-didaktische Ausgangsspezifikation,
werden aber nicht als alte Knowledge-Dateien zur Laufzeit gesucht oder
hochgeladen. Sie werden nachvollziehbar in Skill, Skill-Referenz, kurze
Server-Instruktionen, zustandsabhängige Policies, Toolbeschreibungen und
Backendguards überführt.
Paket-SemVer, Contract Major, öffentliche Origins und Lifecycle folgen dem
[Versionierungs- und Lebenszyklusplan](openai-plugin-versioning-and-lifecycle.md).

Bis der Skill im realen Providerhost Verhaltensparität erreicht, bleiben die
heutigen ausführlichen Server-Instruktionen als Kompatibilitätsschicht aktiv.
Die Matrix unterscheidet deshalb bewusst aktuellen und angestrebten
Laufzeitort.

Dieses Dokument beschreibt fachliches Verhalten, nicht die
Transportauthentisierung. Für den TLS/OAuth-Schutz, den fest vorregistrierten vertraulichen
OAuth-Client mit `client_secret_basic`, die exakten
Client-ID-/Callback-/Resource-/Scope-Allowlisten und die explizite
24h-Lernsession sind
[OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md) und
[OAuth-Appbindung und 24h-Lernsession](openai-mcp-oauth-learner-session-architecture.md)
maßgeblich. mTLS ist nicht Teil des `1.0.0`-Vertrags; eine spätere
Transporthärtung bleibt eine getrennte Architekturentscheidung.

Quellenpriorität für die Skill-Migration:

1. aktueller Backend-/MCP-Vertrag für Zustand, Tools und Garantien;
2. neuere Visible-Session-Dokumente für bereits fachlich korrigierte Regeln;
3. bewährte Dateien unter `ai/openai custom gpt` für Coach-Verhalten und
   Didaktik;
4. alte Action-, Startcode- und Relayregeln werden nicht migriert.

Bewährter ursprünglicher Coach-Korpus:

- `ai/openai custom gpt/system_instructions.de.md`
- `ai/openai custom gpt/knowledge_docs/lerncoach.de.md`
- `ai/openai custom gpt/knowledge_docs/mastery_rules.de.md`
- `ai/openai custom gpt/knowledge_docs/exam_proctor.de.md`
- `ai/openai custom gpt/knowledge_docs/state_machine.de.md`
- `ai/openai custom gpt/knowledge_docs/error_handling.de.md`
- `ai/openai custom gpt/knowledge_docs/deep_linking.de.md`

Normative Quellen der späteren Visible-Session-Variante:

- `ai/openai-custom-gpt-visible-session/de/system_instructions.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/coaching_and_mastery.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/deep_linking_and_resources.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/errors_and_restart.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/exam_proctor.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/state_personalization_and_progress.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/verified_recall.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/visible_session_protocol.md`

## Paritätsmatrix

| Fachliche Regel | Heutiger Laufzeitort | Primärer Zielort | Harte Absicherung |
| --- | --- | --- | --- |
| Backendzustand ist autoritativ; Kandidaten sind nicht aktiv; nichts erfinden | Server-Instruktionen und `policies` jedes frischen Context-Ergebnisses | kurze Server-Invariante, Skill-Entscheidungszyklus und frischer Kontext | Mutationen werden gegen den aktuellen Learner-State revalidiert |
| natürlicher Mehrfachwunsch, eindeutige Schritte sofort, nur offene Wahl nachfragen | Server-Instruktionen sowie Selection-Policy und Navigationstool | Skill; erlaubte Optionen bleiben dynamisch | ausschließlich aktuell gelieferte Optionen und IDs |
| Unterricht an genau einem bestätigten atomischen Ziel | Chat-Policy und zustandsabhängige `instruction` | Skill und aktuelle `instruction` | aktives Ziel kommt nur aus dem Backend |
| ungewöhnliche, aber gleichwertige Lösungswege voll anerkennen; explizite Anforderungen einhalten | Server-Instruktionen, Chat-Policy und Exam-Evaluation-Instruktion | Skill-Referenz `coaching-policy.md` und aktuelle Exam-Instruktion | Prüfungsgrundlage wird erst für das aktive freigegebene Exam geliefert |
| Mastery nur nach zwei unabhängigen Checks oder echtem mehrschrittigem Transfer; alle Zielaspekte prüfen | Server-Instruktionen, Chat-Policy und Mastery-Toolbeschreibung | Skill, Skill-Referenz und Mastery-Toolbeschreibung | Coach-Mastery hat keinen frei wählbaren Wert und speichert ausschließlich `1.0` für das aktive atomische Nicht-SRS-Ziel |
| Cluster und Memorierungs-/SRS-Ziele niemals manuell meistern | Chat-Policy und Mastery-Toolbeschreibung | Skill-Referenz und Mastery-Toolbeschreibung | Mastery-Handler weist Cluster und Memory/SRS ab; Recall speichert Abschluss selbst |
| Verified Recall: ganzer Batch, Sollantwort erst nach Antwort, jedes Ergebnis speichern, erst dann nächster Batch | Recall-Policy und die drei Recall-Toolbeschreibungen/-Ergebnisse | Skill-Ablauf sowie die drei Recall-Toolbeschreibungen und -Ergebnisse | alle drei Operationen verlangen das aktuelle sichtbare aktive atomische Memory-/SRS-Ziel; Karte und SRS-Typ werden zusätzlich backendseitig geprüft; ein vollständiger Evidence-Receipt bleibt eine spätere Härtung |
| Prüfung: Aufgabe wortgetreu, keine Hinweise oder Rückfragen, Lösung erst nach vollständiger Abgabe | Exam-Policy, Context-Instruktion und Evaluationstool | Skill, Skill-Referenz, aktuelle Exam-Instruktion und Evaluationstool | Lösung/Raster fehlen im normalen Context und werden nur für das aktive freigegebene Exam ausgeliefert |
| Rasterpunktweise bewerten; nur sichtbare Leistung; gleichwertige Wege; Teilpunkte und konkrete Abzüge | Exam-Policy und dynamische Evaluation-Instruktion | Skill-Referenz und dynamische Evaluation-Instruktion | Scoring ist strukturiert; die fachliche Auswertung bleibt Aufgabe des Provider-Modells |
| nur Backend-URLs wortgetreu; keine Links aus IDs oder mit Tokens; passendes Bild des aktiven atomaren Ziels als Orientierung im Cockpit und in der OpenAI-MCP-UI | globale Context-Policy, allowlist-projizierte Ressourcen, optionale `goalVisualization` und versionierte UI-Ressource | kurze Server-Invariante, Skill-Ausgaberegel und sichere Projektion | nur der dedizierte Renderer bindet die UI; Context und Mutationen merken ein Bild für einen späteren Lernenden-Turn vor, in dem der Renderer mit Ziel-ID und `expectedStateVersion` zuerst läuft; der Renderer validiert Backendzustand und Ziel erneut; private oder nicht passende Bildpfade und interne Identität werden entfernt; ohne gültiges Bild bleibt der normale Chat |
| `requiresCockpit` betrifft nur die Ressource; Cockpit-Üben pausiert die Kartenprüfung | Ressourcen- und Memory-Mode-Instruktion | Skill-Referenz und aktuelle Modus-Instruktion | Cockpit-URL wird serverseitig erzeugt; keine Modellkonstruktion |
| Fortschritt nur frisch, aktueller Scope zuerst, keine Schätzung, Abschluss ohne erfundene Ziele | globale Progress-Policy und Completion-Instruktion | Skill-Referenz sowie Progress- und Completion-Instruktion | Zahlen und Abschlussstatus stammen ausschließlich aus dem Backend |
| Mathematik nur mit `\(...\)` und `\[...\]` | Server-Instruktionen und globale Context-Policy | Skill-Ausgaberegel | ausgelieferte freigegebene Inhalte werden zusätzlich normalisiert |
| ohne bestätigten Erfolg keine Speicherung behaupten; Konflikt höchstens einmal neu laden; bei Blockade stoppen | Server-Instruktionen, globale Policy und MCP-Fehlerresultate | Skill-Stopregel, kurze Server-Invariante und konkrete Fehlerresultate | Mutationen liefern frischen Zustand; Konflikt- und Authfehler werden explizit signalisiert |
| keine Tool-/API-/JSON-/Feldnamen, internen IDs oder Geheimnisse in sichtbaren Antworten; die automatisch transportierte `learningSessionId` nicht erläutern oder verändern | Server-Instruktionen und globale Context-Policy | Skill-Ausgaberegel, kurze Server-Invariante und globale Context-Policy | permanente SkillPilot-ID, OAuth-Token und Client-Secret sind weder Toolargumente noch Toolergebnisse; jedes fachliche Tool verlangt die kurzlebige Session-ID |

## Bewusst nicht migrierte Relay-Regeln

Die folgenden Regeln waren ausschließlich Kompensation für die
Custom-GPT-Action-Regression und gehören nicht zur MCP-Zielarchitektur:

- Relay-Footer sowie sichtbare technische Lernziel-, Auswahl- oder Karten-IDs;
- `getVisibleState` vor jedem User-Turn und die zugehörigen Ausnahmen;
- `selectionReference`, `choiceNumber` und `choiceNumbers` als sichtbares
  Transportprotokoll;
- erneutes manuelles Tragen technischer Werte durch Benutzernachrichten;
- `getVisible*`-/`setVisible*`-Namen und Fehlerlogik des 24-Stunden-Tokens.

Das sichtbare Relay-Protokoll wird nicht wieder eingeführt. Davon zu
unterscheiden ist die aktuelle `learningSessionId`: SkillPilot erzeugt sie bei
jedem **Lernen starten** neu, trägt sie automatisch genau einmal in die
Startnachricht ein und ChatGPT muss sie unverändert an jedes fachliche
MCP-Werkzeug übergeben. Sie ersetzt weder OAuth noch den autoritativen
Backendzustand. Nach Mutationen sowie bei Reload, Unsicherheit, langem Dialog
oder möglicher Kontextkompaktierung wird mit derselben noch gültigen Session-ID
frisch rehydriert.

## Verbleibende modellseitige Grenzen

In der ersten chat-first Version kann das Backend nicht kryptografisch beweisen,
dass vor dem Abruf einer Recall-Sollantwort tatsächlich eine Lernendenantwort
oder vor der Exam-Evaluation eine vollständige Chat-Abgabe vorlag. Ebenso kann
es die fachliche Qualität zweier Mastery-Checks nicht aus einem reinen
Abschlussaufruf ableiten. Deshalb stehen diese Regeln in jedem relevanten
frischen Policy-Paket und Toolergebnis.

Eine spätere Härtungsstufe kann serverseitige Attempt-/Evidence-Receipts mit
`learnerAnswer` beziehungsweise `submissionText` einführen. Das ist eine
zusätzliche Sicherheitsverbesserung, keine Voraussetzung für den ersten
chat-first Cutover. Die bereits enthaltene read-only Zielbildkarte ändert diese
Evidenzgrenze nicht: Ein Bild ist weder Lernendenantwort noch Aufgabe, Lösung,
Bewertung oder Mastery-Nachweis.
