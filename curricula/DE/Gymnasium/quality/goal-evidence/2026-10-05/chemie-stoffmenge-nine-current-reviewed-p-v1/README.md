# Neun Chemie-P-v2-Profile: aktuelle Inhaltsprüfung

**Inaktive Autorenkandidaten: ai_candidate / needs_human_review, E1/G1. Keine menschliche Freigabe oder Lernendenbewährung.**

Die tatsächliche CandidateSet-Datei für `materializePositiveGoalEvidenceCandidates.ts` steht in `positive-evidence.candidates.json`: äußeres `schemaVersion: 1`, `authoringContract: positive-understanding-evidence-candidates-v1`, genau neun Ziele in B013-Reihenfolge. Ihre inneren Profile verwenden den bestehenden `positive-understanding-evidence-v2`-Vertrag und bleiben vollständig unverändert. Die neue Review-ID, der tatsächliche Prüfzeitpunkt, Reviewer und neun Wrapper-Reasons dokumentieren diese eigene aktuelle Inhaltsprüfung.

Die von Root als unabhängig eingefroren gemeldete B013-D2-Runde ging der P-Lektüre voraus. Diese Arbeit hat die aktuelle Übereinstimmung ihrer DE/EN-Zieltexte mit dem Canonical selbst geprüft. Sie behauptet keine zusätzliche unabhängige Prüfung der A/C-Run-Manifeste.

## Inhaltliche Urteile

| Ziel-ID | Ziel | Inneres Profil |
|---|---|---|
| `1dc15fa2-fca4-56b0-b5c1-4d215613dde0` | Stoffmenge und Mol | PASS |
| `8a2ad724-df5e-5986-8de9-560ba43caac2` | Molare Masse | PASS |
| `dd3fc8fe-2316-5fbc-b569-00651c83bc81` | u und g | PASS |
| `e45c0022-ac0d-5c83-b433-5f68655e382f` | Avogadro-Konstante | PASS |
| `1e5a4b89-69f1-5379-811e-c8ec76faad2a` | Avogadro-Gasvolumenregel | PASS |
| `2924f784-5261-54e8-93ee-49ac3b3cd300` | Molares Gasvolumen | PASS |
| `199570f4-b3c3-5e12-877d-ced97e9f6968` | Gas-Molarmasse | PASS |
| `d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a` | Zweiatomige Elementmoleküle | PASS |
| `ddb76915-4d63-5375-901d-4e659f5e9b09` | Qualitative Elementaranalyse | PASS |

11bea, 965ca297 und e675fa94 sind ausgeschlossen. `content-review.verdicts.json` nennt je Ziel die aktuelle DE/EN-Kompetenz, geprüfte Zahlen/Erklärungen, gelieferte Eingaben und die verbleibende unabhängige Performanz beziehungsweise frische Transferleistung.

Besonders geprüft sind die sieben aktuellen Präzisierungen: spezifizierte Teilchen, Formel/Atommasse/Massenbezug, u/g als Einheiten derselben Größe, ideale Gasbedingungen, zwei Gas-Molarmassenwege, Interpretation gegebener Zweiatomigkeitsmodelle sowie C/H-Schluss aus kontrollierten CO2-/Wassernachweisen.

Bereitgestellte Konstanten, Formeln, Gaszustandsdaten, Teilchenmodelle und Nachweistabellen zählen als Eingaben. Die eigene Lernleistung besteht in Wahl und Begründung des Bezugs, Umrechnung/Bilanz, Zustands- oder Kontrollenprüfung und begrenzter Schlussfolgerung. Das Profil bescheinigt keine ungeholfene Entdeckung vorgegebener Fakten. Die zwei Fallbriefs bleiben Assessment-Kandidaten; es wurde keine reale Lernendenperformanz beobachtet.

## Technische Prüfung und offene Bindung

Die wirkliche Code-Schnittstelle, der v2-Profilschema-Vertrag und das Vierer-v2-Vorbild wurden gelesen. Die eigene Validierung nutzt den unveränderten echten `$defs.profile` mit Ajv2020 und die tatsächliche `fingerprintPositiveGoalEvidenceProfile`-Funktion. Ergebnis: neun gültige Profile, identische innere Fingerprints zur Quelle, korrekte neun Ziel-IDs und Reihenfolge. Die Materializer-Funktion wurde **nicht** aufgerufen; es wurden keine aktuellen D/P-Records, Config-Registrierungen oder Registryänderungen geschrieben.

**Ziel-/Seiten-/Bildbindung für alle neun bleibt HOLD**, bis der laufende u/g-Bildaustausch abgeschlossen und die tatsächliche Bindung gezielt erneuert ist. `current-goals-reviewed.snapshot.json` ist ein Text-/Kontextsnapshot und keine erneuerte Bild- oder PDF-Seitenfreigabe. Inhalts-PASS allein belegt weder aktuelle fünfteilige QA-Schnittmenge noch ganze Landesprojektionen.

`own-numerical-and-equation-checks.json` dokumentiert eigene Rechen- und Atombilanzprüfungen. Aktuelle BIPM-/NIST-Primärquellen wurden für spezifizierte Elementarteilchen, exaktes NA und den nur annähernden u↔g/mol-Zahlenbezug geprüft und als Quellenkopien gespeichert. Alte Autorenartefakte, das Vierer-v2-Paket und der separate 11bea-Quellenkandidat bleiben unverändert.

Der Abschlussreceipt dokumentiert echte lokale Zeiten, Input-/Alte-Artefakt-Guards und exakte SHAs. Er enthält keine erfundenen Provider-Samplingparameter oder menschlichen Freigaben.
