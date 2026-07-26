# Wissens- und Verhaltensparität des deutschen MCP-Lerncoaches

**Stand:** 26. Juli 2026
**Status:** normative Paritätsmatrix für die UI-lose deutsche MCP-App

Die ChatGPT-MCP-App besitzt keine Knowledge-Uploadfläche wie ein Custom GPT.
Die bisherigen sieben deutschen Knowledge-Dokumente bleiben deshalb als
fachliche Ausgangsspezifikation erhalten, werden aber nicht zur Laufzeit gesucht
oder hochgeladen. Jede produktionskritische Regel liegt unmittelbar dort, wo sie
wirksam sein muss: in Server-Instruktionen, frischen zustandsabhängigen Policies,
engen Toolbeschreibungen oder Backendguards.

Dieses Dokument beschreibt fachliches Verhalten, nicht die
Transportauthentisierung. Für den TLS/OAuth-Basisschutz, die optionale
fail-closed mTLS-Härtung am MCP-Rand, das konfigurierte OAuth-Profil
(vorregistrierter Public Client mit
Token-Endpunkt-Authentisierung `none` oder optional CIMD mit
`private_key_jwt` und Same-Origin-JWKS), exakte
Client-ID-/Callback-/Resource-/Scope-Allowlisten und die 24h-Lernsession sind
[OpenAI-MCP-Clientbindung](../../security/openai-mcp-client-binding.md) und
[OAuth-, Lernenden- und 24h-Sitzungsbindung](openai-mcp-oauth-learner-session-architecture.md)
maßgeblich. Insbesondere attestiert optionales mTLS die
OpenAI-Connector-Infrastruktur und nicht den sichtbaren App-Namen.

Normative Quellen der bisherigen Variante:

- `ai/openai-custom-gpt-visible-session/de/system_instructions.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/coaching_and_mastery.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/deep_linking_and_resources.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/errors_and_restart.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/exam_proctor.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/state_personalization_and_progress.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/verified_recall.md`
- `ai/openai-custom-gpt-visible-session/de/knowledge_docs/visible_session_protocol.md`

## Paritätsmatrix

| Fachliche Regel | Laufzeitort der MCP-App | Harte Absicherung |
| --- | --- | --- |
| Backendzustand ist autoritativ; Kandidaten sind nicht aktiv; nichts erfinden | Server-Instruktionen und `policies` jedes frischen Context-Ergebnisses | Mutationen werden gegen den aktuellen Learner-State revalidiert |
| natürlicher Mehrfachwunsch, eindeutige Schritte sofort, nur offene Wahl nachfragen | Server-Instruktionen sowie Selection-Policy und Navigationstool | ausschließlich aktuell gelieferte Optionen und IDs |
| Unterricht an genau einem bestätigten atomischen Ziel | Chat-Policy und zustandsabhängige `instruction` | aktives Ziel kommt nur aus dem Backend |
| ungewöhnliche, aber gleichwertige Lösungswege voll anerkennen; explizite Anforderungen einhalten | Server-Instruktionen, Chat-Policy und Exam-Evaluation-Instruktion | Prüfungsgrundlage wird erst für das aktive freigegebene Exam geliefert |
| Mastery nur nach zwei unabhängigen Checks oder echtem mehrschrittigem Transfer; alle Zielaspekte prüfen | Server-Instruktionen, Chat-Policy und Mastery-Toolbeschreibung | Coach-Mastery hat keinen frei wählbaren Wert und speichert ausschließlich `1.0` für das aktive atomische Nicht-SRS-Ziel |
| Cluster und Memorierungs-/SRS-Ziele niemals manuell meistern | Chat-Policy und Mastery-Toolbeschreibung | Mastery-Handler weist Cluster und Memory/SRS ab; Recall speichert Abschluss selbst |
| Verified Recall: ganzer Batch, Sollantwort erst nach Antwort, jedes Ergebnis speichern, erst dann nächster Batch | Recall-Policy und die drei Recall-Toolbeschreibungen/-Ergebnisse | Antwort- und Resultendpunkte sind an aktives Merkziel und Karte gebunden; vollständiger serverseitiger Evidence-Receipt ist eine spätere Härtung |
| Prüfung: Aufgabe wortgetreu, keine Hinweise oder Rückfragen, Lösung erst nach vollständiger Abgabe | Exam-Policy, Context-Instruktion und Evaluationstool | Lösung/Raster fehlen im normalen Context und werden nur für das aktive freigegebene Exam ausgeliefert |
| Rasterpunktweise bewerten; nur sichtbare Leistung; gleichwertige Wege; Teilpunkte und konkrete Abzüge | Exam-Policy und dynamische Evaluation-Instruktion | Scoring ist strukturiert; die fachliche Auswertung bleibt Aufgabe des Provider-Modells |
| nur Backend-URLs wortgetreu; keine Links aus IDs oder mit Tokens; Visualisierungen im Cockpit | globale Context-Policy und allowlist-projizierte Ressourcen | private Bildpfade und interne Identität werden aus dem Providerzustand entfernt |
| `requiresCockpit` betrifft nur die Ressource; Cockpit-Üben pausiert die Kartenprüfung | Ressourcen- und Memory-Mode-Instruktion | Cockpit-URL wird serverseitig erzeugt; keine Modellkonstruktion |
| Fortschritt nur frisch, aktueller Scope zuerst, keine Schätzung, Abschluss ohne erfundene Ziele | globale Progress-Policy und Completion-Instruktion | Zahlen und Abschlussstatus stammen ausschließlich aus dem Backend |
| Mathematik nur mit `\(...\)` und `\[...\]` | Server-Instruktionen und globale Context-Policy | ausgelieferte freigegebene Inhalte werden zusätzlich normalisiert |
| ohne bestätigten Erfolg keine Speicherung behaupten; Konflikt höchstens einmal neu laden; bei Blockade stoppen | Server-Instruktionen, globale Policy und MCP-Fehlerresultate | Mutationen liefern frischen Zustand; Konflikt- und Authfehler werden explizit signalisiert |
| keine Tool-/API-/JSON-/Feldnamen, technischen IDs oder Geheimnisse in sichtbaren Antworten | Server-Instruktionen und globale Context-Policy | permanente SkillPilot-ID, OAuth-Subjekt und Token sind weder Toolargumente noch Toolergebnisse |

## Bewusst nicht migrierte Relay-Regeln

Die folgenden Regeln waren ausschließlich Kompensation für die
Custom-GPT-Action-Regression und gehören nicht zur MCP-Zielarchitektur:

- sichtbares `sps_...`-Token, Relay-Footer und sichtbare technische Lernziel- oder
  Karten-IDs;
- `getVisibleState` vor jedem User-Turn und die zugehörigen Ausnahmen;
- `selectionReference`, `choiceNumber` und `choiceNumbers` als sichtbares
  Transportprotokoll;
- erneutes Tragen technischer Werte durch Benutzernachrichten;
- `getVisible*`-/`setVisible*`-Namen und Fehlerlogik des 24-Stunden-Tokens.

Ersetzt werden sie durch argumentloses Rehydrieren zu Sitzungsbeginn, nach
Mutationen sowie bei Reload, Unsicherheit, langem Dialog oder möglicher
Kontextkompaktierung. Der kurze MCP-Retentionstest belegt die strukturierte
Wiederverwendung, macht den Backendzustand aber nicht entbehrlich.

## Verbleibende modellseitige Grenzen

In der ersten UI-losen Version kann das Backend nicht kryptografisch beweisen,
dass vor dem Abruf einer Recall-Sollantwort tatsächlich eine Lernendenantwort
oder vor der Exam-Evaluation eine vollständige Chat-Abgabe vorlag. Ebenso kann
es die fachliche Qualität zweier Mastery-Checks nicht aus einem reinen
Abschlussaufruf ableiten. Deshalb stehen diese Regeln in jedem relevanten
frischen Policy-Paket und Toolergebnis.

Eine spätere Härtungsstufe kann serverseitige Attempt-/Evidence-Receipts mit
`learnerAnswer` beziehungsweise `submissionText` einführen. Das ist eine
zusätzliche Sicherheitsverbesserung, keine Voraussetzung für den ersten
UI-losen Cutover.
