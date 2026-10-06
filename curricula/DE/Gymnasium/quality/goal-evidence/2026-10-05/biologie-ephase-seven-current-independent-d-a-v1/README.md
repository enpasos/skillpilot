# Biologie E-Phase: unabhängiger aktueller Beschreibungsreview D-A7

Datum: 5. Oktober 2026. Eigene, vom E7-Text-/Profilautor getrennte
Beschreibungsprüfung. Andere E7-Beschreibungsurteile wurden vor diesem
Freeze nicht gelesen. Keine aktiven Canon-, Registry-, Ledger- oder Asset-Writes.

## Ergebnis und Zählgrenze

Sieben **KEEP-Kandidaten**, keine offenen aktuellen D-Befunde. Die sieben
kanonischen Zielobjekte einschließlich DE/EN-Texten sind vollständig mit dem
aktuellen aktiven Stand identisch. Geprüft wurden tatsächliche aktuelle Ziele,
operative Quellkomponenten, Kontext-, Seiten- und Bildbindungen; eine technische
Bindungssynchronisation allein begründet dieses Urteil nicht.

| Ziel | Eigenes aktuelles Urteil | Verbindliche fachliche Grenze |
| --- | --- | --- |
| `56663bb4` Tierische Morphogenese | KEEP | Zusammenspiel von Teilung, Differenzierung und Formbildung; E.4 nicht als verbindliches E.1–E.3-Thema ausgeben. |
| `9d931642` Pflanzliche Entwicklung | KEEP | Aktuelle HE-Erklärung bewahren; NI-Jg.6 und SL-Jg.5 nur als Teilkontexte, kein Zellliniennachweis aus Farben. |
| `a545b28f` Meristemfunktionen | KEEP | Meristembereich und zelluläre Entwicklungsregulation erklären; kein erfundenes bestimmtes Signalmolekül. |
| `861fbc18` Transportexperimente | KEEP | Tatsächliche Durchführung mit zulässiger Anleitung und eigenen Befunden; gegebenes Laborprotokoll allein reicht nicht. |
| `7a79fda6` Membranmodelle | KEEP | Modelle an Befunden kritisch vergleichen; zusätzliche Bilddetails sind kein experimenteller Beweis. |
| `e566ae2f` RGT-Regel | KEEP | Geeigneter Temperaturbereich und fallbezogener Faktor; keine weitere Hochrechnung bei Enzyminaktivierung und kein zweiter Denaturierungsabschluss. |
| `dd196715` Allosterische Regulation | KEEP | Anderer Bindungsort allein beweist keine reine nichtkompetitive Kinetik oder unverändertes Km. |

Aktiver strenger Nettozuwachs durch dieses Dossier: **0**. Sieben unabhängige
D-Prüfkandidaten liegen vor; eine fachübergreifende oder vollständige
Fünf-Gate-Freigabe wird damit nicht behauptet. Alle sieben D-Eingänge haben
`evidenceProfile: null`. Die sieben neuen Empfehlungen heißen deshalb
`create`; keine bereits gebundene P-Profilprüfung wird vorgetäuscht.
V, P, A und M benötigen ihre eigenen aktuellen Nachweise. Die bestehende
RGT-Entscheidung `memory_required` samt Karten und Sichtbarkeit bleibt bestehen.

## Tatsächlich gelesener eingefrorener Eingang

Autorenpaket: `../biologie-ephase-seven-current-native-candidate-v1`.

- Alle **195** Dateien aus `author-native-candidate.final.freeze.json` vor und
  nach der Prüfung bytegenau verifiziert. Manifest SHA-256:
  `36a3cd9763d06419dba9a1464a2b36ea62f4e88a539fcdcf7ff3cfacf0dcc790`.
- Book-Digest:
  `50ef9c8068c84a2da5301d8961622a7390cec096ebd789a5bfc373037918e92a`.
- Bundle-Fingerprint:
  `1e1ab0094971d73c89f78b142911847af93462216f1b667e5f9818914d842f52`.
- Tatsächliches PDF SHA-256:
  `430b53c275e51681b76f66c7eedecb5f36e009a85193f430556049016137c9ca`.
  Alle **neun vollständigen physischen Seiten** mit `pdftoppm` exportiert,
  `pdftotext` gelesen und anschließend mit `view_image` angesehen.
- Exaktes natives HTML lokal in Chromium geladen, alle sieben tatsächlichen
  Bilder dekodiert und Byte-/URL-/Alt-Bindungen geprüft. Alle **sieben
  vollständigen Zielabschnitte** als Screenshots angesehen. Die tatsächliche
  Ansicht ersetzt eine rein textuelle HTML-Lesung.
- Die sieben guten vorhandenen PNGs bleiben im Beschreibungszusammenhang
  KEEP, unabhängig vom Generator oder Verhältnis. Keine Erzeugung,
  Bildänderung oder eigenständige neue V-Publikationsfreigabe.

Nachweise: `actual-nine-pdf-pages.receipt.json`,
`actual-current-seven-html.receipt.json`,
`actual-complete-current-goal-page-source-image-review.receipt.json` sowie
`prepared-frozen-current-inputs.{before,after}.actual.json`.

## Originalquellen und tatsächliche Operatoren

Original HE-KC, Ausgabe 2024, Stand 01.08.2025: physische und gedruckte Seiten
**35–37** gelesen und vollständig visuell angesehen. Nur E.1–E.3 sind dort
verbindlich. E.4/E.5, die einzelnen E.5-Bullets sowie die übrigen Komponenten
der breiteren E.2-Bullets werden nicht versehentlich als erledigt mitgezählt.

Lokale unveränderte Originale: **NI 87**, **SL 25–26**, **BW physisch 26 /
gedruckt 24** tatsächlich gelesen und angesehen. Die eingangs angegebene
BW-physische Seite 24 ist eine benachbarte Genetikseite; die maßgebliche
Zellbiologie-Tabelle befindet sich tatsächlich auf physischer Seite 26. Der
breite historische SL-Seitenverweis 25 wird erhalten; die konkreten
Fortpflanzungs-/Vermehrungszeilen auf 26 wurden zusätzlich gelesen.
Bestehende `partial`-Mappings bleiben als Teilkontexte begrenzt. Keine
nachträgliche vollständige NI-/SL-HE-Kompetenzfreigabe, keine Erprobung.

Die Fachabgrenzung der kinetischen Hemmungsbegriffe wurde zusätzlich unabhängig
gegen [IUBMB, Abschnitt 6.4](https://iubmb.qmul.ac.uk/kinetics/ek4t6.html)
geprüft. Kinetische Klassifikation und molekularer Bindungsmechanismus werden
getrennt; daraus entsteht keine zusätzliche kinetische Kursanforderung.

## Materialisierung und tatsächlicher nativer Check

Eigene Records unter `results/`, gebunden an den exakten nativen Round-A-Eingang.
Materialisierung mit Schutz vor Überschreiben bestehender Ergebnisse:

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ephase-seven-current-independent-d-a-v1/materialize-own-independent-d-seven.py
```

Native `validateGoalDescriptionReviewCampaign.ts` im bereits vorhandenen
physischen E7-Isolat mit den aktuellen A-Manifest-, Input-, Campaign-,
Batch-, Run- und Record-Dateien: **Exit 0**, `Goal-description review batch
valid: 7`, am 05.10.2026, 19:19:10–19:19:11 UTC. Exakte ausgeführte Argumente,
CWD, Code-SHAs, Ausgabe-SHA und Record-/Run-SHAs stehen in
`own-native-round-validation.actual.json`. Keine vollständige globale QS,
kein Build, keine Git-Mutation.

Records bleiben `candidate` / `ai_candidate`; Model-Sampling und der genaue
Modellname sind vom Orchestrator nicht separat offengelegt. Menschliche
Freigabe und menschliche Erprobung sind jeweils **false**.
