# Automatische OpenAI-Dialogregression

## Zweck und Grenzen

Die 14 Fälle aus der aktuellen `review-cases.json` werden zusätzlich zu den
Backend- und Komponententests als echte API-Dialoge ausgeführt. Dies ist ein
dauerhafter Regressionstest vor und nach der Einreichung. Die Produktionsanwendung
verwendet diesen Testzugang nicht.

Der Coach bekommt den aktuellen Skill, die Coaching-Regeln, Server-Anweisungen
und den vollständigen modellseitigen Werkzeugkatalog. Er entscheidet selbst
über Werkzeugaufrufe. Erwartungstexte und Prüfkriterien erhält nur die separate
Bewertung, niemals der Coach.

Aufrufe durchlaufen den echten MCP-Adapter und dessen Versions-/Capability-
Prüfungen. Der Lernzustand darunter ist eine isolierte, zustandsbehaftete
Simulation ohne Produktionsdatenbank oder Produktionssession. Jeder Fall
startet neu. Die Kartenbedienung in P3 ist ein simulierter Komponentenakteur;
das Modell bekommt weder das App-only-Bewertungswerkzeug noch die privaten
Karteninhalte aus `_meta`.

Ein grüner Lauf bedeutet: **Alle konfigurierten API-Dialogprüfungen dieser
Fassung sind bestanden.** Er garantiert weder beliebige Dialoge noch die
tatsächliche ChatGPT-Oberfläche, OAuth-Anmeldung, Widget-Darstellung oder native
iOS-/Android-Bedienung. Diese Grenzen bleiben als `hostAcceptance: not_tested`
sichtbar. Die einmalige manuelle Abnahme vor der Einreichung bleibt separat;
die Automatik setzt keine `manualReviews` auf grün.

## Lokal ausführen

Vom Repository-Hauptverzeichnis:

```bash
# Kostenlos: Testprogramm und aktuelle Quellbindungen prüfen.
node --test scripts/openai_dialog_eval.test.mjs scripts/openai_dialog_assertions.test.mjs
node scripts/openai_dialog_eval.mjs check

# API-Key ohne Klartext in der Shell-Historie eingeben (Bash).
read -rsp 'OpenAI test API key: ' OPENAI_EVAL_API_KEY
export OPENAI_EVAL_API_KEY
node scripts/openai_dialog_eval.mjs run
unset OPENAI_EVAL_API_KEY
```

Nur `run` führt kostenpflichtige Modellanfragen aus. Der Schlüssel stammt
ausschließlich aus `OPENAI_EVAL_API_KEY`; ein allgemeiner produktiver Key wird
nicht automatisch übernommen. Nicht in Chat, Git oder Kommandozeilenargumenten
hinterlegen. Ein eigener OpenAI-Testprojekt-Key ist dafür vorgesehen.

Der Runner prüft zunächst Snapshot und Einreichungsdateien, kompiliert den
Java-Testprozess und führt alle Fälle aus. Voraussetzung sind die im Repository
festgelegten Java- und Node-Versionen. Jeder Lauf bekommt einen neuen Ordner
unter `tmp/openai-dialog-eval/`. Mit `--out-dir tmp/MEIN-NEUER-LAUF` lässt sich
ein noch nicht vorhandener Ordner wählen; alte Ergebnisse werden nicht ersetzt.

Fehlender Key, veraltete Quellbindungen, fehlende Fixtures, API-Fehler, Timeout,
Budgetende, unvollständige Antworten oder fehlende Prüfkriterien ergeben keinen
Pass und einen Exit-Code ungleich null. Einzelne fehlgeschlagene Wiederholungen
bleiben sichtbar; es gibt kein Wiederholen bis zum ersten grünen Ergebnis.

## Prüfung und Nachvollziehbarkeit

`report.json` enthält Dialogereignisse, Werkzeugversuche, öffentliche
Werkzeugantworten, Prüfergebnisse, API-Request-IDs, Modelle und Tokenverbrauch.
Schlüssel, Sessionwerte, Capability-Werte und private Komponentenmetadaten
werden nicht im Klartext übernommen. Echte Lernersitzungen sind nicht zulässig.

Hashes binden den Bericht an Snapshot, Werkzeugvertrag, Fallsatz,
Coaching-Anweisungen, Fixtures, Testprogramm und Konfiguration. Getrennte Ebenen:

- Deterministische Regeln: erforderliche/verbotene Aufrufe, Zustimmung,
  Zustandsversionen, vollständige Batches, Fokusoptionen, Prüfungsfreigabe,
  erwartete Fehler und ausdrücklich geforderte exakte Texte.
- Separate inhaltliche API-Bewertung: Motivation statt Prüfung, keine
  vorweggenommenen Lösungen, richtige Zahlen und verständliche Antworten.
  Jedes Kriterium benötigt Begründung und beobachtete Turn-Referenzen.
  `insufficient_evidence` besteht nicht. Diese Bewertung ist probabilistisch,
  nicht menschlich und keine hostseitige Abnahme.
- Unabhängige Backend-/Komponenten-CI und menschliche ChatGPT-Abnahme.

Ein API-Pass setzt beide automatischen Dialogbewertungen für alle Fälle und
alle vorab konfigurierten Wiederholungen voraus. Bei Rubrik-, Fixture- oder
Modelländerungen auch die negativen Kontrolltests prüfen; Regeln nicht lediglich
lockern, damit ein aktueller Lauf grün wird.

## Kosten und GitHub Actions

`scripts/config/openai-dialog-eval.json` begrenzt derzeit einen Durchlauf aller
14 Fälle auf maximal 160 Anfragen, acht Anfragen pro Dialogturn, 4096
Ausgabetokens pro Anfrage und **10 USD konservativ geschätzten Verbrauch pro
Lauf**. Vor jeder Anfrage wird ihr maximaler Verbrauch reserviert. Bei
unbekanntem Verbrauch bleibt die Reservierung bestehen und der API-Client
stoppt. Es gibt keine automatischen kostenpflichtigen Netzwerk-Retries.

Die Berechnung ignoriert günstigere Cache-Lesezugriffe und berücksichtigt den
dokumentierten Cache-Schreibaufschlag. Modell und Preisannahmen werden gemeinsam
geprüft. Nach Ablauf der Preisprüfung stoppt der Runner bis zur erneuten Prüfung.
Grundlage sind die offiziellen
[GPT-5.6-Sol-Preisinformationen](https://developers.openai.com/api/docs/models/gpt-5.6-sol).
Das lokale Limit ist kein garantiertes Abrechnungslimit des OpenAI-Kontos;
zusätzlich Projektbudgets und Zugriffsrechte beim Anbieter begrenzen.

Der Workflow **OpenAI model dialog regression** lässt sich in GitHub Actions
manuell starten. Für einen täglichen Lauf um 04:35 UTC:

1. Repository-Secret `OPENAI_EVAL_API_KEY` mit dem separaten Test-Key hinterlegen.
2. Einmal manuell ausführen und den vollständigen Bericht prüfen.
3. Repository-Variable `OPENAI_DIALOG_EVAL_ENABLED` auf `true` setzen.

Ohne Aktivierungsvariable ist der Zeitplan deaktiviert, nicht bestanden. Ein
manueller Start ohne Key schlägt fehl. Kostenpflichtige Tests laufen nur auf
dem Default-Branch, niemals auf PR- oder Fork-Code. Der Workflow besitzt nur
lesende Repository-Rechte und behält bereinigte Berichte einschließlich
Fehlschlägen 30 Tage als Artefakte. Kostenlose Runner- und Adaptertests laufen
weiterhin in der normalen CI.

Die Umsetzung folgt dem offiziellen
[Responses-Werkzeugaufruf-Ablauf](https://developers.openai.com/api/docs/guides/function-calling).
Optionale MCP-Felder bleiben optional (`strict: false`); ihre tatsächliche
Validierung erfolgt im Adapter. Die Bewertung nutzt strukturierte Antworten,
deren Vollständigkeit zusätzlich im Testprogramm geprüft wird.
