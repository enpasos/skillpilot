# Platzierungsvorschlag: eine eigene Modellprüfung für drei Aufgabenlücken

**Vorschlag, ohne Rootwrites oder Enrollment.** Inhalt ist die unveränderte Prüfung `4293cf40-06fb-51e3-9799-6fde0bf2771b` aus Batch2, Goalhash `5924e6184fc405d7e2fa2c0a8e06b969e23b03e1c55590c2a91893a03d71645b`. Das unabhängige Inhalts-Nachreview bestätigt diese Fassung; es gibt ausdrücklich keine Source-, Platzierungs-, Zusatzpflicht- oder M7-Freigabe. Task, Lösung, Rubrik, Voraussetzungen und Coverage bleiben bytegleich. Der Kandidat bleibt `draft`.

## Eine zusätzliche, begründete Aufgabe

Der gemeinsame Übergangsweg verlangt tatsächlich alle drei bisher fehlenden Handlungen: ein Polynom aus Eigenschaften rekonstruieren (`8e1b0d9c…`), beide C1-Anschlüsse modellieren (`4b16fce6…`) und eine Wendebedingung zur Modellbildung verwenden (`b88cbf71…`). Dieselben fünf Bedingungen bestimmen dasselbe Polynom. Deshalb ist eine zusammenhängende zusätzliche Prüfung fachlich begründet; drei neue Prüfungs-IDs wären für diese gemeinsame Handlung unnötig.

Vorgeschlagen wird genau **ein zusätzliches geschütztes Target** in Angeboten, die diese drei Kompetenzen bereits als Targets beabsichtigen. Es ersetzt keine historische oder eigene Prüfung und schließt keine Lücke durch eine bloße Requires-Kante. 13 BE sind eine Bewertungsskala, keine validierte Arbeitszeit. Die normale Bestehensgrenze ist 11/13; bei einer fehlenden oder fachlich falschen wesentlichen Modellierungshandlung begrenzt die transparente gewöhnliche Rubrik die Gesamtpunktzahl auf 10. Isolierte Rechenfehler und gültige Folgearbeit werden fair gewertet; es gibt ein Gesamtresultat und die bestehende binäre Mastery.

Die tatsächliche zusätzliche Pflicht muss der Platzierungsverantwortliche ausdrücklich akzeptieren. Sie kostet reale zusätzliche Prüfungsarbeit; ein Inhalts-PASS beweist weder Kapazitätsverträglichkeit noch eine offizielle zusätzliche Prüfungspflicht. Bereits gültige Mastery aller bestehenden Ziele bleibt unverändert. Die neue ausgewählte Prüfung benötigt ihre eigene ausdrückliche Mastery; eine vorhandene Kompetenzmastery wird weder gelöscht noch nachqualifiziert. Auch alle vorhandenen Prüfungs- und Lernkartenziele behalten ihren ausdrücklichen Masteryvertrag.

## Bestehender kanonischer und programmatischer Anker

`parent-before-after.json` ergänzt genau ein Kind unter **„Übungen E-Phase“** (`28b45b93…`). Der bestehende Parent enthält 13 eigene Aufgaben und ist derzeit für alle 16 Länder anwendbar. Seine tatsächliche kanonische Kette lautet:

`Übungen E-Phase → Grundlagen der Analysis und mathematische Modelle (a668ea17…) → Mathematik (c01b1ce9…)`.

Der Analysisancestor hat eine bestehende primäre Platzierung in `de-gym-math-sek2`, unter dem Programm `de-gym-math-program`. Weder der Aufgabenparent noch seine 13 Aufgaben haben eigene `goalPlacements`. Die Programmeinheit `de-gym-math-e` existiert, ist aber für diese Objekte kein expliziter Platzierungsanker. Der Vorschlag erfindet keine neue Programmplatzierung. E bleibt vorläufiges Kompatibilitätsmetadatum; der Titel des Parents und die Phase erlauben keine automatische amtliche Landes- oder Jahrgangszuordnung.

Die drei tatsächlich betroffenen Ancestorgewichte werden als Mengen eindeutiger atomarer Nachfahren berechnet:

| Goal | bisheriges Weight | eindeutige Atome vorher | nach neuer Aufgabe |
| --- | ---: | ---: | ---: |
| Übungen E-Phase | 13 | 13 | 14 |
| Grundlagen der Analysis und mathematische Modelle | 128 | 128 | 129 |
| Mathematik | 979 | 980 | 981 |

Die Root-Unterzählung um eins besteht bereits vor der neuen Aufgabe. `979→981` enthält getrennt **eine vorhandene Korrektur** und **ein neues Atom**. Sonstige Gewichte werden nicht untersucht oder bereinigt. Root muss diese Werte bei Integration neben parallel vorbereiteten Deltas erneut aus UniqueAtoms bestimmen.

## Tatsächliche Angebotsmenge und vier Viewlücken

Grundlage ist der eingefrorene native Report `backend/build/reports/curriculum-completion-integrity/68a8ac50-f5f5-4e24-8aa9-5e408ca01ced/audit.json`, SHA `7ac71b4187ca24522dadd796aa2a4d8671e21856dc36a0d30ea1fac87e523848`, zum Kanon `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`.

Genau **132 von 154** tatsächlichen Angeboten enthalten alle drei geprüften Kompetenzen als Targets: ausschließlich SekII oder CrossStage, keine SekI-Angebote. `expected-offerings.json` enthält die genaue 132er-Liste und alle 154 Entscheidungen als QA-Erwartung, kein Runtimeprofil. In 60 Angeboten sind auch alle vier Voraussetzungen Targets. In den übrigen 72 SekII-Angeboten bleibt `546bf0b3…` berechtigte LGS-Unterstützung außerhalb des Targets. Weder die neue Aufgabe noch die Zuordnung `applicabilityFromRequires` befördert dieses oder andere Unterstützungsziele zu Target.

Die vorhandenen `canonicalSubtree`-Verweise auf den Aufgabenparent bzw. seine Ancestors transportieren das neue Kind für **126** der 132 Angebote. Die anderen sechs sind Bayern G9, SekII/CrossStage × GK/LK/GK+LK. Ihre vier konkreten Source-Views verteilen Ziele einzeln statt den Aufgabenparent zu referenzieren. `view-reference-proposal.json` schlägt deshalb genau vier direkte `goalEntry target`-Ergänzungen vor, jeweils im vorhandenen Children-Array:

- `de-by-gk.view.json`: `gk-sek-ii-e-weitere-kompetenzen`.
- `de-by-lk.view.json`: `lk-sek-ii-e-weitere-kompetenzen`.
- `de-by-sekii-gk.view.json`: `gk-sek-ii-only-e-weitere-kompetenzen`.
- `de-by-sekii-lk.view.json`: `lk-sek-ii-only-e-weitere-kompetenzen`.

Die Ankerwahl folgt den **wirklichen bestehenden Platzierungen aller drei Kompetenzen**: in jeder dieser Views liegen sie bereits gemeinsam unter „Jahrgangsstufe 11 / Weitere Kompetenzen“. Rekonstruktion ist direkt eingetragen; Wende- und Anschlussmodellierung werden über `e681c0f9…` referenziert. Die exakten Referenzen, kanonischen Expansionspfade und JSON-Pfade sind beigefügt. Die gemeinsame Stelle folgt somit nicht aus `phase:E`. Ob diese bestehende J11-Einordnung fachlich amtlich stimmt und auch die zusätzliche eigene Prüfung dort fair ist, bleibt ausdrücklich eine Frage an Astra. Es werden keine weiteren Unterbäume importiert, keine alten Aufgaben verdrängt und keine 132 Einzelprofile eingeführt.

## Eigene Aufgabe ohne geerbte amtliche Sourceclaims

`goal-metadata-delta.json` schlägt neben dem freigegebenen Inhalt nur zwei nachvollziehbare Metadatenergänzungen vor:

- `extendedData.applicabilityMappingInheritance = "boundary"`, analog zum bestehenden eigenen Assessment `8d314e15…`. Der vorhandene Compiler stoppt dort breite Ancestormappings; die neue eigene Aufgabe darf sie nicht als Sourceevidenz ihrer Formulierungen erben.
- Eine vorläufige `applicability.jurisdiction`-Cachemenge der 16 Länder aus der Schnittmenge der vier bestehenden Voraussetzungscaches. Der vorhandene native Schnittmengenhelfer bestätigt sie. Die volle Applicability-/Sourceprüfung bleibt offen; die Cachemenge ersetzt sie nicht.

Das bereits gesetzte `applicabilityFromRequires=true` bleibt erhalten. Seine `assessment-requires`-Evidenz betrifft Berechtigung, keine amtliche Abdeckung, keine Stufe und keine Targetauswahl. Es gibt keine neuen Mapping-/Provenienzeinträge. Alle bestehenden Sourceentscheidungen bleiben erhalten; `input-bindings.json` bindet die unveränderten Mapping-/Provenienzdateien. Die neue Aufgabe hat eigene CC-BY-4.0-Inhalte und keinen übernommenen historischen Aufgabentext.

## Kleine Ledgerentscheidung und Beleggrenzen

`practice-assessment-ledger-proposal.json` schlägt genau eine neue `practiceAssessment`-Entscheidung im vorhandenen Ledgerformat vor. Die darin enthaltene zukünftige `authoritative`-Zeile ist ausdrücklich inert und benötigt erst die Platzierungsentscheidung. Alle bestehenden Klassifikationen bleiben erhalten; nur der Parentfingerprint muss wegen des neuen `contains`-Kinds aktualisiert werden. Die beiden reinen Ancestorgewichte gehören nach dem vorhandenen Fingerprintvertrag nicht zu dessen Eingaben. Es wird kein neues Lernzielresultat oder Runtimeprofil eingeführt.

`verify_authoring.ts` verwendet die vorhandenen nativen Rollen-, Viewcompiler- und Fingerprintfunktionen auf den im Speicher angewandten Deltas. Für alle 108 authored Math-Views bleiben bestehende Target-/Supportrollen unverändert; ausschließlich das neue Atom kommt hinzu. Die erwarteten 132 Angebote sind danach erreichbar, mit null neuen nativen Source-Viewfehlern. Das ist ein Autorenbeleg, kein nachgebauter Service-Merger und kein tatsächlicher 154er-Lauf. Nach unabhängiger Entscheidung und Rootintegration bleiben der tatsächliche Service-/154er-Lauf, Readiness, sichtbarer Baum und alle einschlägigen M7-/CI-Gates durch Root erforderlich.

**Astra entscheidet hier eng:** Sind eigener Parent und vier konkrete BY-Anker zulässig, ist genau eine zusätzliche Pflicht für diese realen 132 Zielmengen gerechtfertigt, und verhindern Boundary/Eligibility-Metadaten falsche Sourceclaims? Source-/Stufenfreigabe, Enrollment und M7 werden in diesem Autorenkandidaten nicht behauptet.
