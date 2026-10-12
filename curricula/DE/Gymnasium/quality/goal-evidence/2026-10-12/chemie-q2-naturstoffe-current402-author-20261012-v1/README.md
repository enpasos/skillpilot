# Chemie Q2.1 Naturstoffe: 31 aktuelle Autorenkandidaten

AUTHOR; ausschließlich Chemie; inaktiv. `ai_candidate` / `needs_human_review`, E1/G1. Keine unabhängigen Stimmen, keine menschliche Freigabe oder Erprobung, strenger Nettozuwachs **0**. Die aktuelle Ausgangslage bleibt **212/402**.

Einstieg: `FINAL.whole31.neutral-author-review-input.json`. Dieser neutrale Input enthält alle 31 vollständigen aktuellen Ziele und Kandidaten, 62 DE/EN-Aufgaben mit chemischen Modellantworten und Rubriken, die aktuellen Quellenbeiträge, aktuelle Memory-Entscheidungen, die exakten Bildbytes und normalen nativen Seiten. Zwei spätere unabhängige D/P/A/M/V-Prüfungen sind noch offen.

Die Zielmenge ist die exakte Schnittmenge der curricularAtomic-Nachfahren von `24b47a95-c239-552a-9be7-324aa54a89dd` mit den aktuell noch nicht streng abgeschlossenen Zielen im aktuellen zentralen 402-Bericht. Kein historischer381-Seiten-Atlas wird als M7-Nenner benutzt. Der aktuelle Quellenatlas mit382 Seiten wurde zusätzlich mit seinem normalen Loader und Originalquellenprojektor gelesen; Quellenunion und Operatorfreigabe bleiben getrennt.

## Fachliche Kandidaten und Grenzen

- **29 Texte KEEP**, zwei begrenzte Textkorrekturen: die Slash-Formulierung zu glykosidischen Bindungen wird prüfbar operationalisiert; die englische Chromatografieformulierung wird von `plan` zu dem deutschen und bayerischen `apply/anwenden` korrigiert.
- **31 P-Profile**, 62 konkret variierte Aufgabenfälle samt Modellantworten, Schlussgrenzen und Missverständnisprüfungen. Zahlen sind ausdrücklich synthetische Aufgabenwerte. Experimentelle Planung oder fremde Messdaten beweisen keine tatsächliche Durchführung; relevante praktische Operatoren brauchen eigenes beobachtetes Arbeiten und Protokolle.
- **Vier A-Grenzfälle bleiben offen**: Aminosäuren (`62149f36`), Kohlenhydrate (`8761cfd2`), Proteine/Ammonium (`9deeac6f`) sowie Fettstruktur/Bewertung (`bebea164`). Die ersten drei Autorenurteile sind `non_atomic`, das vierte `needs_developer_review`. Konkrete Optionen mit insgesamt neun möglichen Kindern liegen in `atomicity/four-bounded-concrete-split-options.author-inactive.json`. Keine Strukturänderung wurde angewandt.
- **Zwei gezielte Memory-Nachfolger** binden die geänderten Texte mit fachlicher Begründung; die anderen400 Records sind exakt erhalten. Der normale402-Memory-Check einschließlich75 Karten und konfigurierter Sichtbarkeiten besteht. Die vorgeschlagenen Entscheidungen sind Autorenentscheidungen.
- **Acht direkte BY-Quellenrouten fehlen im aktuellen Atlas** für die Ziele `0b5342b9`, `360fccb9`, `3681e688`, `47582f06`, `8da5c5cf`, `8fe39739`, `9abd8069`, `9fa7d857`. Die amtlichen C11.2-Kompetenzen und ihre aktuellen Originalformulierungen wurden tatsächlich kontrolliert. Alle bestehenden Partnerbeiträge bleiben im Paket erhalten. Eine geerbte NI-Makromolekülroute beweist diese konkreten bayerischen Operatoren nicht vollständig.

## Bilder und native Seiten

**23 vorhandene Bilder KEEP**, **acht fehlende Bilder als PNG-Kandidaten**. Die tatsächlichen PNGs liegen jeweils unter `images/<goalId>/<goalId>.png`, Prompts direkt daneben. OpenAI/ChatGPT-Codex built-in `image_gen`, konkrete Modellversion vom Tool nicht offengelegt. 1672×941, nahe16:9, freundlich und comicartig; keine SVG-/Programmbild-Ersatzproduktion. Alle Originale der neuen Bilder sowie tatsächliche360/680-Browseransichten wurden angesehen. Das Aminosäurenbild hatte im ersten Versuch das falsche `CO−`; dieser Versuch ist erhalten und verworfen, die korrigierte Fassung zeigt `COO−`. Die Bildprüfung des Autors gewährt keine V-Freigabe. Alle aktuellen Bilder sind breit; in diesem Paket gibt es keine4:3-Ausnahme. Die Browseransichten verwenden dennoch die aktuelle448px-Höhenbegrenzung.

Der zunächst im verkleinerten PDF vermutete Iod/Stärke-Farbfehler bei `8fe39739` wurde durch die volle Originalansicht widerlegt: Die Flüssigkeit ist dunkelblau, das Brot darüber beige. Der bestehende JPEG bleibt erhalten; eine unbegründete Korrektur wird nicht durchgeführt.

- `native/batch-1` und `native/batch-2`: normaler aktueller402-Datei-Loader und normale Standalone-Vorbereitung,16+15 Seiten, danach normale Checks bestanden.
- `native/final-image-batch-1` und `native/final-image-batch-2`: abschließende bildgebundene16+15 Seiten mit allen31 Bildern und P31, erzeugt durch unveränderte Produktionsfunktionen für BookModel, Subset, HTML/PDF, Bundle und Kampagnen.
- Für die inaktiven neuen PNGs nutzt die abschließende Variante die normale **pure-model API mit tatsächlichen eigenen Asset-Digests** und `native-public/`. Der Standard-Datei-Loader unter aktivem `app/public` kann die neuen inaktiven Bilder noch nicht lesen; seine Akzeptanz wird ausdrücklich nicht behauptet.
- Die finalen `round-a` / `round-b`-Ordner sind neutrale, bytegebundene Kampagnenvorbereitungen mit **null abgeschlossenen Reviews**.
- `native/actual-whole-html-pages` und `native/actual-whole-pdf-pages` enthalten jeweils31 tatsächliche Ganzseitenansichten. `images/actual-display-captures` enthält62 tatsächliche Bildansichten; die Kontaktbögen dienen nur der Sichtprüfung.

Die finalen Seiten schließen kein Gate automatisch. Nach unabhängiger Prüfung benötigen eventuelle Integrationsentscheidungen ihre normalen aktuellen D/P/A/M/V-Bindungen und zentrale Prüfung.

## Integrität und Rechte

`FIRST.author-inputs-CAS.json` und der abschließende CAS-Check bestätigen unveränderte Eingaben. Der inaktive Kandidat ändert genau zehn Ziele: zwei Textfälle und acht Bildlinks. Die fünf aktuellen B007-Applicability-Korrekturen und sämtliche sonstigen Felder einschließlich `requires` bleiben erhalten. Aktive Canonical-, Registry-, Ledger- und Git-Schreibvorgänge erfolgten nicht; Mathematik, Physik und Biologie wurden nicht bearbeitet.

Alle eigenen JSON/JSONL-Dateien wurden vollständig geparst; echte Newlines, keine Curriculum-Symlinks. Die eigenen Dateien und wiederverwendeten committable Eingaben sind in `FINAL.author-package.freeze.json` versiegelt. Nach dem Seal wird der Ordner nicht weiter beschrieben.

Eigene didaktische Texte/Bilder: CC-BY-4.0. Technische Skripte/Verfahrensdokumentation: Apache-2.0. Amtliche Fremdquellen behalten ihre Herkunft und Rechte. Alle historischen Prüf-, Bild- und Veröffentlichungsbytes bleiben erhalten.
