# Biologie Q1 – aktueller SOURCE-v2-Checkpoint

**Inaktiv und unadoptiert. SOURCE-HOLD bleibt offen.** Dieser Checkpoint exportiert ausschließlich die bis zur Unterbrechung tatsächlich abgeschlossene Autorenarbeit. Aktiver Stand bleibt **BIO 38/363**, Chemie **85/376**, Mathematik **807/807**, Physik **478/478**. Es werden keine neuen BIO-Abschlüsse gezählt.

Eigene Lernziel-, Profil- und Bildinhalte: CC-BY-4.0. Technische Skripte und Entwicklerdokumentation: Apache-2.0. Die amtliche PDF und ihre Belegabbildung behalten ihre eigenen Rechte.

## Korrigierte Kandidateneingaben

Der bestehende TF-Kandidat `946ce2e7-c30d-5670-839d-003b0619c284` und der stabile Methylierungsbegleiter `0ac51522-352c-50d1-8b95-8d3992b4db15` bleiben vollständig wie im eingefrorenen v1-Paket. Kanonische Zieltexte, DE/EN, Alttexte, Profile, Voraussetzungen, Assessment- und Capstone-Kandidaten sowie PNG-Pixel sind unverändert. Künftiger Umfang bleibt **442 kanonische Ziele / 364 curricularAtomic**.

Die neue HE-Extraction verwendet die vorhandene native `sourceDocumentKey`-Auswahl:

- Der alte 2024-Dokumenteintrag bleibt exakt erhalten. Alle übrigen **148** Quellenziele wählen ihn jetzt ausdrücklich. Quelltexte, Referenzen, alte URL und lokaler Pfad, Granularität, native Facets, ganze kanonische Target-ID-Listen und Mappingentscheidungen bleiben exakt gleich. Diese Metadatenklärung behauptet keine 148 neuen fachlichen Reviews.
- Nur `b8aa6b7a` (TF und DNA-Methylierung) und `b5e1cdfd` (PCR und Gel) wählen den zusätzlich beschriebenen tatsächlichen Stand **01.08.2025**. Das vorhandene Repository-PDF hat 49 Seiten und SHA256 `52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`. Die vollständigen beiden GK/LK-Klauseln auf tatsächlicher gedruckter/physischer S.39 wurden gelesen und als Bild angesehen. Es wird keine neue PDF-Kopie angelegt. Amtliche URL: [Hessen, Ausgabe 2024, Stand 01.08.2025](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf).
- Neue HE-Extraction und Mappingversion liegen als tatsächliche Zukunftsdateien unter `prospective-input-tree/`; die künftigen Atlas-Inputs wählen diese HE-Version und pinnen das vorhandene PDF über `sourceDocumentSnapshots`.

Belege: `he-source-version-correction.delta.json`, `actual-native-source-document-routing.receipt.json`, `actual-source-2025-page-39.png`.

## Verbleibender tatsächlicher SOURCE-HOLD

`goalBookOriginalSources.ts` liest weiterhin sämtliche physischen `mapping/**/*.review.json`-Dateien. Die aktuellen Atlas-`mappingPaths` begrenzen diesen separaten Zitateverbraucher nicht. Historische Gel-v1- und TF/Methylierungs-v1-Eingaben erzeugen dadurch zusätzlich **vier falsche aktuelle Zitatbindungen**: `Stand 01.08.2025 / S.39` ist mit der alten **2024-11-PDF-URL** gekoppelt. Betroffen sind TF946, Methylierung0ac, Gel8eb und PCRa3f. Die korrekte neue 2025-Bindung erscheint daneben.

Der tatsächliche Zitateverbraucher ist daher weiterhin nicht quellenversionskorrekt. Alle historischen Dateien bleiben erhalten. Eine vorhandene konfigurierte Active-Mapping-Auswahl wurde im OriginalSources-Verbraucher nicht gefunden; `sourceDocumentKey` wählt lediglich ein Dokument innerhalb einer Extraction. Eine generische BUILD/QS-Anbindung an konfigurierte aktuelle Mappingpfade muss separat behandelt und geprüft werden. Dieser Checkpoint enthält keine solche Codeänderung.

Der vollständige genaue Fehler und alle vorher/nachher Zitate stehen in `actual-source-version-current-page-footprint.receipt.json` sowie `actual-native-original-source-links.before.json` und `.after.json`. **Keine Source-Closure, operative Adoption oder Freigabe aus diesem Paket.**

## Tatsächlich abgeschlossene native Prüfungen

- Atlas **364/364**, 20 Quellenansichten, keine unresolved/omitted Goals; 26 konkrete native Filter-/Projektionsfälle einschließlich HE GK/LK, anderer Bundesländer/Stufen und altem Fokus. DAG ohne fehlende Kanten/Zyklen.
- Alle **38** aktuellen strengen Ziele und fachlichen Seitenkontexte sind unverändert. Neun Seitenfingerprints und sechs eigene Seitenpositionen ändern sich durch die bereits eingefrorene Companion-Platzierung. Alle 363 alten und alle 364 v1-Seiten wurden konkret verglichen. Zwischen frozen-v1 und v2 ändern sich keine fachlichen Seitenpayloads. Die tatsächlichen Quellenlinkänderungen betreffen exakt TF, Methylierung, Gel und PCR; PCR erhält keinen neuen Abschluss.
- Die vorhandenen unabhängigen **zwei A/M/V-Ergebnisse** aus `biologie-q1-tf-methylation-current-independent-a-m-v-v1` wurden für exakte unveränderte WholeGoal-/Text-/Alt-/Pixelbindungen geprüft und wiederverwendet. Ihre wissenschaftliche Begründung und tatsächliche PNG-/GoalCard-Inspektion bleiben erhalten. Native A/M-Checks bestehen für die beiden Ziele und Full364; die anderen 362 bestehenden JSONL-Zeilen bleiben bytegleich. Native V bleibt AI **yes**, Human **no**. Diese Ergebnisse werden als neue strenge Abschlüsse **nicht gezählt**.
- Zwei P-Profile sind nativ als `needs_human_review` / `ai_candidate` gebunden und geprüft. Es gibt keine P-Freigabe.
- Die native QA-Normalisierung und -Prüfung sind abgeschlossen. Quellen-/Frontend-/Backend-PNGs bleiben bytegleich; keine Pixelgeneration oder Bildänderung.

`actual-native-context-and-all-page-comparison.receipt.json` enthält alle Seiten- und Kontextdetails. `native-*.check.txt` enthält die tatsächlichen abgeschlossenen Checker-Ausgaben. Es wurde für v2 kein neuer zentraler Gesamtbericht erzeugt. Der letzte aktive zentrale Bericht ist `chemie-b014-five-current-integration-v1/central-after-five-current-A-M.report.json`.

## Leeres D2-Paket und Exporte

`native-finalbook/` wurde mit unverändertem nativen `prepare` und `check` erzeugt. Es enthält drei Ziele: TF946 und Methylierung0ac als zwei offene fachliche D-Kandidaten, Gel8eb ausschließlich für die gezielte neue aktuelle Quellen-/Seitenbindung. WholeGoal, P/A/M/V und Bild von Gel bleiben erhalten. PCRa3f ist als zusätzlicher Quellenlink-Footprint dokumentiert.

Beide unabhängigen Round-a-/Round-b-Kampagnen haben **leere `results/`**. Keine D-Ergebnisse, keine D/P-Freigabe, keine neue menschliche Prüfung. SOURCE-HOLD bleibt auch für dieses Paket offen. PDF und HTML sowie alle 28 nativen Exportdateien sind als echte Dateien im OWN gesichert. Die tatsächlichen PDF-Seiten 3/4/5 wurden angesehen; die vollständigen Texte und unveränderten Bilder werden gezeigt. Die HTML-Bild- und Altbindungen wurden gelesen.

Git speichert leere Ordner nicht. Nach einem Checkout lassen sie sich ohne Reviewergebnis wiederherstellen:

```bash
mkdir -p curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2/native-finalbook/round-a/results curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2/native-finalbook/round-b/results
```

Die PDF-/HTML-/PNG-Exporte können durch Gitignore verborgen sein. Der Checkpoint benötigt die tatsächlichen Dateien aus den Freeze-Listen im Commit; temporäre Isolationen gehören nicht zum Commit.

## Reproduktion, Prozesse und geschützte Grenzen

`prepare-source-v2.py` dokumentiert die sichere Isolation und Eingabenmaterialisierung. Die vorhandenen 38 künftigen Canon-/Quellen-/Atlas-/QA-/Bilddateien sind als echte Dateien exportiert und in `prepared-inputs.freeze.json` gebunden. Full364-A/M-Konfigurationen und -Reviews, P-Kandidaten und -Bindungen, Modelle, native Kampagnen und Renderergebnisse sind im OWN gesichert. Die vorhandene PDF bleibt über Pfad, amtliche URL und tatsächlichen SHA gebunden. Bestehende unveränderte Repositoryeingaben sind im Boundary-Receipt gehasht. Bei Recreation werden die benötigten JSON-/Mapping-/Cards-/Bildblätter physisch kopiert, tatsächliche `prompt.de.md` und relevante öffentliche JPG-Blätter vor Import/Render abgetrennt.

Alle gestarteten nativen Prozesse sind terminal. Zwei Vorbereitungsläufe endeten zunächst mit dokumentierten technischen Fehlern (P-reviewId-Metadaten und isolierter Gel-PNG-Pfad). Die korrigierten Läufe endeten erfolgreich. Keine Prozesse laufen; beide D-Reviews und die generische Quellenverbraucherkorrektur bleiben offen. Nach der Checkpoint-Anweisung wurden ausschließlich Export, Freeze und README ausgeführt. Details: `native-preparation-fault-corrections.receipt.json`, `native-finalbook-export-and-terminal-processes.receipt.json`.

Alle **131 v1-Autorendateien / 38 v1-Zukunftsdateien**, die frühere 37-Dateien-Quellenhistorie und der unabhängige A/M/V-Freeze sind SHA-genau unverändert. Alle aktiven BIO-Canon-/Quellen-/Atlas-/QA-/Ledger-/Cards-Eingaben bleiben erhalten. Die 694 isolierten nativen Codedateien sind exakt zum Init-Stand bytegleich. Lediglich der unabhängige Root-Claude-Test `testClaudePluginInstallUi.ts` wurde parallel geändert; seine tatsächlich benutzte isolierte alte Kopie ist für Recreation exportiert. BIO-Verbrauchercode ist weiterhin bytegleich mit Root.

Keine vollständige zukünftige Registry-Kopie ist erstellt. `unadopted-bio-only-route-deltas.reference.json` benennt lediglich mögliche spätere BIO-A/M-Pfade. Jede spätere Adoption muss die dann aktuelle Registry sowie Chem85-A/M-/Root-Routen bewahren und den offenen SOURCE-HOLD zuvor bearbeiten. Keine M7-/Human-/Lernablauf-/Laborannahme aus diesem Checkpoint.

## Freeze

`prepared-inputs.freeze.json` bindet die 38 künftigen Eingabedateien. `author-checkpoint.final.freeze.json` bindet das vollständige aktuelle OWN-Paket einschließlich tatsächlicher PDF/HTML/PNG-Exporte, offener SOURCE-Findingbelege und leerer D2-Kampagnen.
