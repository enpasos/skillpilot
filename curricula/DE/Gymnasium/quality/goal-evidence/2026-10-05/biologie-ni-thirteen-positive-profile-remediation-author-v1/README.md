# NI: dreizehn positive Verständnisprofile — Autorenremediation

## Status und Gegenstand

Dies ist ein **inaktiver Autorenkandidat**, keine unabhängige Freigabe und kein
operativer M7-Abschluss. Die unabhängige gezielte P13-Nachprüfung ist noch offen.
Die bisherigen unabhängigen 32 Befunde bleiben in ihren historischen Dateien
unverändert erhalten. Das Zuordnungsdokument nennt ausdrücklich
`authored_candidate_pending_independent_follow_up` und null unabhängig gelöste
Befunde. Menschliche Prüfung und Erprobung bleiben getrennt.

Die aktuelle Autorenbasis ist der eingefrorene Stand
`../biologie-ni-ten-current-native-author-candidate-v2/`, Manifest
`174b280a3d02591d1e5125ed32624c525bef699fff188be1cb4d9f51c016646f`
(556 Dateien). Der maßgebliche unabhängige P18-Vorgänger liegt unter
`../biologie-ni-eighteen-current-independent-p-v1/`, Manifest
`b5e9f37e4a1f503c34b63015585fc79d21270b8a9a752b54023f762ec2daffc1`
(22 Dateien, fünf PASS und dreizehn HOLD). Alle 578 Originaldateien wurden vor
und nach der nativen Prüfung anhand der eingefrorenen SHA-256-Werte überprüft.

## Tatsächliche Profiländerungen

Die vollständigen Profilinhalte wurden gelesen und gezielt manuell korrigiert.
Die neue deutsche und englische wesentliche Verständnisbeschreibung nennt in
jedem der dreizehn Profile den positiven biologischen Inhalt und dieselben
individuellen Grenzen. Die 26 Fallfokusse nennen jeweils den Inhalt ihres
eigenen vollständigen Falles. Vier vollständige beobachtbare Leistungspaare
(2ae2da43, 2164195d, 3417bb28, 72fac740) wurden semantisch angeglichen.

Der Kältefall von eda5b810 enthält nun ein ausdrücklich fiktives Modell:
Reversible, laut Kontrollen nicht vererbte individuelle Veränderungen werden
mit bereits vorhandenen erblichen Fellvarianten einer Säugetierpopulation
verglichen. Dichteres Fell führt unter sonst gleichen kalten Bedingungen zu
geringerem Wärmeverlust; das Modell gibt mehr später selbst fortpflanzende
Nachkommen und eine erbliche Häufigkeitszunahme über Generationen vor.
Der Erwartungstext verlangt ausdrücklich die Nutzung dieses Funktions- und
Fortpflanzungsbefunds. Vererbbarkeit und Zeitskala allein belegen nur erbliche
Variation, keine Angepasstheit. Keine molekulare Epigenetik und keine
beobachtete reale Labor- oder Lernendenleistung werden behauptet.

Bei 3417bb28 wurde der frühere Satz zur unveränderten Wiederverwendung zweier
Rekombinationsatome aus der biologischen Verständnisbeschreibung entfernt und
mit ursprünglichem Vollfeld, Herkunftsdatei, SHA-256 und beiden bestehenden
Ziel-IDs in `repository-provenance-outside-understanding.actual.json` bewahrt.
Die Grenze zwischen sichtbarer Merkmalsänderung und Nutzen einer Mutation wird
im Fallfokus ausdrücklich erhalten: fehlende Sichtbarkeit ist kein Beleg
fehlenden Nutzens. Eine frühe, noch nicht eingefrorene Formulierung und deren
erste native Prüfbelege sind additiv unter
`initial-author-native-pass-before-own-scientific-precision-review/` erhalten.

Der endgültige Kandidat verändert **90 innere Profilfelder**:

- 26 wesentliche Verständnisfelder (13 vollständige DE/EN-Paare),
- 52 Fallfokusfelder (26 vollständige DE/EN-Paare),
- 8 beobachtbare Leistungsfelder (4 vollständige DE/EN-Paare),
- 4 Kältefallfelder (Auftrag und erwartete Leistung jeweils DE/EN).

Die fünf ganzen gültigen Vorgänger-Kandidatenzeilen bleiben exakt unverändert.
Auch ihre inneren `profile`-Bytefolgen in den tatsächlichen nativen JSONL-Zeilen
sind bytegleich, nicht lediglich semantisch ähnlich. Die 18 ganzen Zielobjekte,
Beschreibungsseiten D18/D5, Quellenverbünde, Quellklauseln, aktuelle Bindungen
und tatsächlichen PNGs wurden nicht verändert oder neu erzeugt.

## Eingänge und genaue Deltas

- `positive.eighteen.remediated-author.candidates.json`: vollständiger nativer
  P18-Autorenkandidat in derselben Zielreihenfolge wie der Vorgänger.
- `thirteen.complete-remediated-inner-profiles-and-twenty-six-cases.json`:
  die vollständigen dreizehn überarbeiteten Profile und 26 vollständigen Fälle.
- `exact-ninety-before-after-profile-field-deltas.json`: alle 90 einzelnen
  Felder mit tatsächlichen vollständigen Vorher-/Nachherwerten.
- `thirty-two-findings-to-author-remediation.mapping.json`: alle 32 ursprünglichen
  Finding-IDs, vorgeschlagene Autorenauflösung, exakte betroffene Felder und
  ausstehende unabhängige Nachprüfung.
- `positive.eighteen.remediated-author.config.json` und
  `positive.eighteen.remediated-author.review.jsonl`: native aktuelle Konfiguration
  und 18 materialisierte positive-understanding-evidence-v2-Nachweise.

## Nativer Prüfstand und Grenzen

Der kleine eigene ausführbare Baum liegt ausschließlich unter
`tmp/biologie-ni-thirteen-positive-profile-remediation-author-v1-native-root`.
Er enthält fünf unveränderte aktuelle native Skript-/Typdateien sowie Links
auf die eingefrorenen fachlichen Eingänge, die vorhandenen tatsächlichen
Bilddateien, Vertragschemas und Abhängigkeiten. Kein vollständiger Klon, kein
Buch-/App-/Backend-Build und keine aktive Registry-, Canon-, Ledger- oder
Reviewerdatei wurde geschrieben. `small-native-root-read-only-input-contract.json`
belegt die konkreten Pfade. Die einzigen nativen Schreibziele gehören diesem
neuen Autorennamespace.

Die drei endgültigen nativen Schritte sind mit tatsächlichen argv, Zeiten,
Exit-Codes und TXT-Ausgaben protokolliert:

1. `materializePositiveGoalEvidenceCandidates.ts --write`: Exit 0, 18 Nachweise.
2. Derselbe Materializer ohne `--write`: Exit 0, exakter aktueller Inhalt verifiziert.
3. `positiveGoalEvidenceReview.ts --mode=check`: Exit 0, 18 Ziele, 0 Blocker,
   0 approved, 18 needs_human_review, 0 rejected.

Die unveränderten bestehenden v2-Schemas bestehen für die Konfiguration und
alle 18 tatsächlichen Nachweise (19 Objekte). Alle Nachweise behalten
`reviewAuthority=ai_candidate`, `evidenceLevel=E1`, `maximumClaimScope=G1`,
`status=needs_human_review`, leere `reviewRunIds` und ehrliche Autorenherkunft.
Schema-/Frischeerfolg löst die unabhängigen wissenschaftlichen Befunde nicht.

`actual-eighteen-native-record-bindings-and-five-literal-payload-protection.json`
belegt für jedes der 18 Ziele identische aktuelle `goalFingerprint`,
`reviewInputFingerprint` und `reviewCriteriaFingerprint`. Nur die dreizehn
überarbeiteten inneren Profilfingerprints ändern sich. Die ganzen Bücher,
Quellenexporte und tatsächlichen Bilder sind zusätzlich in
`actual-unchanged-goal-bodies-d18-d5-sources-images-proof.json` gebunden;
alle 578 eingefrorenen Originaldateien sind nach der Prüfung unverändert.

**Strenger aktiver Nettozuwachs: 0. Neue aktive fachliche Abschlüsse: 0.
Wiederhergestellte aktive Bindungen: 0.** Nächster Schritt ist die gezielte
unabhängige P13-Prüfung dieses konkreten finalen Freeze. Erst deren belegte
Auflösung kann in einen bewachten Integrationskandidaten eingehen.
