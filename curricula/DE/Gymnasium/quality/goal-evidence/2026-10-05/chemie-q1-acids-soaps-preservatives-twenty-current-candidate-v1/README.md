# Chemie Q1: zwanzig aktuelle Ziele – inaktiver Autoren-Zwischenstand

Dieser Stand wird auf ausdrücklichen Nutzerwunsch eingefroren. Er ist keine operative Übernahme und kein M7-Abschluss. Der zentrale Stand bleibt **Chemie 85/376**, **Biologie 38/363**. Dieses Paket bringt **0 neue fachliche Abschlüsse, 0 wiederhergestellte Bindungen und 0 strengen Nettozuwachs**. Mathematik 807/807 und Physik 478/478 bleiben geschützt.

## Umfang und Fortsetzung

Aus den aktuellen Ästen Carbonsäuren/Derivate, Seifen und Konservierungsstoffe wurden zwanzig aktuelle, zuvor offene Ziel-IDs gewählt. Die Auswahl und damalige Reservierungsprüfung stehen in `selection-and-base.actual.receipt.json`. Vierzehn haben übernahmefähige **Autoren-Kandidaten für ihren eigenen Kompetenzumfang**; sechs Quellen-/Operatorfälle bleiben HOLD und wurden im isolierten operativen Kandidaten unverändert gelassen. Ein Quellenpaket mit 217 Eingangsgruppen ist damit ausdrücklich nicht vollständig fachlich freigegeben.

Das native Reviewbuch enthält **14 neue Kandidatenseiten und eine bestehende Bindungsseite** (`bd36dc58-c93e-5247-9e82-da2f9e4e2bed`), insgesamt 15 Lernzielseiten/17 physische PDF-Seiten. `native-finalbook/bundle/book.pdf`, das vollständige native Modell und zwei leere D-Kampagnen sind erhalten. `final-native-preparation.terminal.receipt.json` belegt die tatsächlichen nativen Prepare-/Check-Ergebnisse.

**Offener Layoutbefund:** Auf physischer PDF-Seite 13 ist der Anfang des langen Wasserhärte-Titels links abgeschnitten. Modell und HTML enthalten den vollständigen Titel. Deshalb sind die nativen Strukturchecks PASS, die tatsächliche PDF-Sichtprüfung aber **14 PASS / 1 HOLD**. Vor unabhängigen abschließenden D-Reviews muss dieser konkrete Layoutfall geklärt werden. `actual-final-fifteen-pdf-layout.author.receipt.json` und `actual-final-pdf-page-13.png` belegen den Befund.

**Noch offen:** unabhängige aktuelle V-Freigaben für acht betroffene Bildbindungen; zwei unabhängige abschließende D-Reviews samt Befundauflösung; aktuelle fachlich geprüfte positive-understanding-evidence-v2-Profile für die vierzehn neuen Ziele; gezielte bd36-Seiten-/Quellenbindung; anschließend operative Integration und zentrale Prüfungen. **P14 wurde vor der Nutzerpause nicht begonnen.** Die leeren D-Kampagnen enthalten keine P-Profile oder Autorenurteile. Reviewer sollen erst die geprüfte genaue Buchversion erhalten; bestehende unveränderte Nachweise bleiben erhalten.

## Tatsächlich geprüfte Kandidaten und Bindungen

- Sieben konkrete DE/EN-Textänderungen: Carboxygruppen/Säurecharakter, saure gegenüber alkalischer Hydrolyse, praktische Seifenherstellung/Aussalzen, amphiphile Grenzflächen/Micellen, Waschfaktoren/Kalkseifen, Härtearten/Enthärtung sowie qualitativer Ascorbinsäurenachweis/Reagenzreduktion. Die anderen sieben tragfähigen Zieltexte bleiben bestehen.
- Dreizehn veraltete Hessen-Provenienzbindungen wurden als nachvollziehbare aktuelle Quellenkandidaten korrigiert. Originalprovenienz bleibt im Kandidaten erhalten. Alle sechs HOLD-Zielobjekte sowie 459 andere kanonische Zielobjekte bleiben unverändert.
- Sieben abgegrenzte HE-Mappinggruppen wurden mit vollständigen Vorher-/Nachher-Fällen korrigiert. Die übrigen 31 Mappingdateien und normative Extraktionsbytes bleiben gleich. Ester-Nomenklatur/Mechanismus-Routing, die Brønsted-Seifenbindung und optionale Supplemente werden nicht allein durch generische Obercluster freigegeben.
- Native A-Checks: 21 Ziele in den drei bestehenden scopes, davon sieben neu begründete Textentscheidungen und 14 gültige unveränderte Entscheidungen. Native M-Prüfung: 376 aktuelle Zeilen auf der neuesten B014-Basis, sieben neue fachliche Begründungen und 369 unveränderte Entscheidungen; keine neuen Karten/Decks. Die drei zuletzt korrigierten B014-M-Zeilen bleiben erhalten.
- Native Quellen- und Graphprüfung: 418 vollständige Vorher-/Nachher-Quellenkontexte, beide DAGs ohne fehlende Kanten/Zyklen und 80 tatsächlich kompilierte/gefilterte Sichtkontexte ohne bisherige Sichtbarkeitsverluste.
- Von 85 aktuell streng abgeschlossenen Chemiezielen behalten 84 Ziel-, Seiten- und Kontextbindungen. Nur bd36 braucht wegen des geänderten vorausgesetzten Ester-Titels eine gezielte neue Seitenbindung. Sein vollständiges Zielobjekt, seine eigene Semantik und sein nativer Ziel-Fingerprint bleiben unverändert. `bd36-current-authoritative-page-targeted-binding.case.json` trennt das von einem neuen fachlichen Abschluss.

Alle oben genannten PASS-Angaben betreffen Autoren-/Strukturprüfungen. Die eigentliche unabhängige D/P/V-QS ist dadurch nicht ersetzt.

## Quellen und Versionsgrenzen

Die tatsächlich neu geladenen offiziellen Hessen-PDFs sind getrennt erhalten: [ursprüngliche Ausgabe 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-chemie.pdf), relevante physische Seiten 37/38, und [aktueller Stand 21.04.2026](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf), relevante Seiten 39/40. HTTP-/Bytebindungen stehen in `targeted-primary-http-and-byte-bindings.actual.receipt.json`; tatsächliche Primärdateien und Seitenbilder liegen unter `primary-inputs/`.

Die aktuellen [BY C10 CH](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch)- und [CH-NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg)-Vorkommen wurden getrennt mit ihren tatsächlichen Operatoren/Trackgrenzen geprüft. BY Sek-I-Einträge werden nicht in erfundene GK/LK-Oberstufenpflichten verwandelt. Transesterifizierung ist im HE-Fette-Kontext Q2 gebunden; Tensid-Abbaubarkeit an HE Q4.3. Der bestehende kanonische Navigationsplatz Q1 ist keine Behauptung einer entsprechenden HE-Q1-Pflicht.

RP-Seite 40 und BB-Seite 24 wurden aus den vorhandenen tatsächlichen PDF-Bytes und Seitenbildern gezielt geprüft. RP-Liveabruf war HTTP 400; ein aktueller EUR-Lex-Kontext lieferte HTTP 202/Captcha. Solche Antworten sind kein aktueller normativer Download. Die sechs HOLD-Fälle mit konkreten Operator-/Companion-Optionen stehen in `six-holds-exact-remediation-and-companion-reuse.candidate.json` und `bounded-two-existing-ids-for-ascorbin-paraben-width.candidate.json`.

Beim bestehenden d3cd-Atom bleibt die gültige native A-Entscheidung für eine quantitative Bestimmungsroutine erhalten. Sein HOLD betrifft den vollständig zu erhaltenden erweiterten normativen Umfang einschließlich Ascorbin-Struktureigenschaften und separatem Paraben-Einsatz. `held-d3cd-current-native-a-scope-clarification.candidate.json` erklärt diese Grenze; eine bloße Fingerprint-Anpassung löst sie nicht.

## Bilder

**Vier neue PNG-Kandidaten**: zwei fehlende Motive (Acidität, Verseifung/Aussalzen) und zwei Korrekturen tatsächlich belegter Schwächen (unzulässige Harmlos-/Neutralisiert-Behauptungen und falsche Struktur beim Ascorbinbild; dominante fachfremde EDTA-Quantifizierung und universelles MgCO3 beim Härtebild). Alle sind freundliche abstrakte Comic-PNGs, native 1672×941, etwa 16:9. Erzeuger: tatsächliches Codex/ChatGPT-Imagegen; ein nicht offengelegter Modellname wurde nicht erfunden. Eigene neue Medien tragen CC-BY-4.0. Die Bilder und tatsächlichen Ausgangs-/Editprompts sind gebunden; Erzeugung ist keine Freigabe.

**Vier unveränderte betroffene JPGs**: a378, 667, 6966 und 1837 bleiben pixelgleich und brauchen aktuelle unabhängige Text-/Bildbindungsprüfungen. Andere gute unveränderte Bilder und gültige Bindungen werden erhalten. Der Bildkandidat für 10f bleibt im separaten Quellen-HOLD und ist nicht übernommen.

`eight-current-visual-inputs-v2.candidate.json`/`eight-current-visual-inputs-v2.freeze.json` binden die acht endgültigen aktuellen Zieltexte, bildspezifischen Alttexte, Herkunft und je drei exakt gleiche Source-/Frontend-/Backend-Kopien. **Alle acht aktuellen V-Status bleiben pending und humanApproved bleibt no.** Der erste Acht-Bilder-Freeze ist unverändert erhalten. Unabhängige Original-/360-/680-Prüfungen sind weiterhin erforderlich; die Autoren-/PDF-Sichtprüfung ist keine unabhängige V-Freigabe. Alle übrigen 368 QA-Zeilen bleiben gleich, einschließlich 19 bisheriger Deferral-Gründe.

## Isolation, Nachweise und Integration

`prepared-prospective-input-tree.receipt.json` benennt die tatsächlichen künftigen nativen Dateipfade und exportierten exakten Kandidatenbytes. Bilder werden aus dem bereits eingefrorenen v2-Eingangsbaum referenziert. `prepared.freeze.manifest.json`/`.sha256` binden den gesamten inaktiven Zwischenstand. Die sichere Isolation kann nach erneutem Nachweis aller exportierten Bytes entfernt werden; die Qualitätsartefakte und historischen Nachweise bleiben erhalten.

Bei späterer Übernahme nur die expliziten Ziel-/Mapping-/A-/M-/Bilddeltas auf die dann aktuelle operative Basis anwenden. Vollständige Snapshot-Dateien dürfen parallele oder später geprüfte Änderungen anderer Pakete nicht zurücksetzen. Die Basis enthält die zuvor nachgewiesenen 69 operativen B014-Dateien plus die neueste operative volle A/M-Routingkorrektur. Native Werkzeuge und Validatoren wurden nicht geändert.

Ein früherer nativer M-Fingerprintlauf schrieb das bestehende Kartenledger einmal durch einen übersehenen isolierten Symlink mit **denselben Bytes**. Die aktive Datei ist weiterhin exakt HEAD, 0 Inhaltsänderungen. Die lokale Kopie wurde danach physisch abgetrennt. `card-ledger-same-byte-write-isolation.erratum.receipt.json` bleibt ausdrücklich erhalten; es wird kein pauschales „keine Schreibereignisse“ behauptet. Spätere Import-/Buchschritte hatten 0 aktive Schreibereignisse. Zwei weitere lokale Prüfstopps betrafen unvollständig abgetrennte Bild-/Historien-Eingänge und den öffentlichen Pfad für bd36; sie sind mit tatsächlichen Fehlermeldungen erhalten und lokal ohne aktive Inhaltsänderung behoben.

Historische B014-159-/69-Exporte, alte Bildpixel/Prompts, gültige alte D/P/A/M/V-Nachweise, Registry, aktive Canonical-/QA-Dateien, In-flight-Ledger und Decks wurden durch diesen Zwischenstand nicht fachlich übernommen oder abgesenkt. Keine menschliche Prüfung, Freigabe, Erprobung oder Lernendenleistung wird behauptet.
