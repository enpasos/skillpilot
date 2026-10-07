# B007: enger BW-Locator- und Versionskandidat

Stand: 6. Oktober 2026. Rolle: Autorenvorbereitung durch Codex, **ai_candidate / candidate**. Zwei unabhängige Quellenprüfungen stehen aus. Keine neue fachliche D/P/A/M/V-Runde, kein Quellen-Superset-Abschluss, keine menschliche Freigabe oder Trial-Aussage.

## Tatsächliche Quellenprüfung

Der Abschnitt 3.2.1.2 beginnt auf physischer PDF-Seite 17, gedruckter Seite 15. Der explizit zitierte Absatz **3.2.1.2 (3)** steht hingegen auf physischer Seite **18**, gedruckter Seite **16**. Beide tatsächlichen Seitenraster wurden gelesen; Abschnittsüberschrift und Absatz werden getrennt gebunden. `passages[1].page = 15` bleibt deshalb unverändert.

Der amtliche V2-Download wurde über die [aktuelle amtliche Gymnasium-V2-Seite](https://www.bildungsplaene-bw.de/,Lde/LS/BP2016BW/ALLG/GYM/CH.V2) tatsächlich geladen. Die finale [amtliche PDF-Datei der Fassung vom 25. März 2022](https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf) hat 52 Seiten und ist **bytegleich** zum verwendeten retained V2-Snapshot: 2.155.781 Bytes, SHA-256 `3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62`.

Die bisher eingetragene URL ohne V2-Suffix liefert tatsächlich die ursprüngliche 2016-Datei mit 48 Seiten und anderem Hash. Dieser konkrete URL-/Versionsfehler wird getrennt korrigiert. Originale SourceDocument-Objekte, alte URL und tatsächlich geladene historische Datei bleiben als Belege erhalten.

## Exakte Rohkandidaten

| Rohkandidat | Änderungen gegenüber gebundener Basis |
| --- | --- |
| `raw-candidates/BW-SekI.source-extraction.author-candidate.json` | Nur `sourceDocument.url` und `sourceGoals[17].sourceRef`: S. 15 → S. 16 |
| `raw-candidates/BW-SekII-URL-only.source-extraction.author-candidate.json` | Nur `sourceDocument.url`, da derselbe V2-Originaldownload gebunden ist. Keine SekII-Absatzprüfung oder fachliche Mappingentscheidung |
| `raw-candidates/chemie-B007-v4-base.canonical.author-candidate.json` | Nur fünf `extendedData.provenance.sourceRef`-Felder, auf dem bisherigen inerten B007-v4-Kanon |
| `raw-candidates/chemie-current-active-base-alternative.canonical.author-candidate.json` | Dieselben fünf Locator-Felder auf separat eingefrorener aktiver Basis; keine B007-Material-/Graphänderung |
| `raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json` | Ausdrücklich getrennte Zusatzalternative: alle acht am selben V2-Raster belegten Absätze (3)–(10), nur deren `sourceRef` plus V2-URL; neun skalare Felder |

Die beiden kanonischen Rohkandidaten sind **Alternativen mit getrennten Baselines**. Der alte B007-v4-Kanon darf nicht über den aktuellen Kanon geschrieben werden. Root integriert später überprüfte einzelne Felder mit exakten Vorherwerten.

Die genaue JSON-Pointer-Liste und alle Vorher-/Nachher-Werte stehen in `exact-before-after-fields.raw-author-candidate.json`. Das Paket enthält insgesamt 13 skalare Operationen über diese vier getrennten Kandidaten; die aktive Alternative dupliziert die fünf Locator-Operationen der B007-Basis.

Für die ausdrücklich getrennte Acht-Absatz-Alternative stehen alle neun Vorher-/Nachher-Felder und ihre tatsächliche Reichweite in `eight-paragraph-scalar-fields-and-actual-target-reach.separate-author-candidate.json`. Sie bindet 15 bestehende Mappingrows zu 12 verschiedenen kanonischen Zielen. Die sieben zusätzlichen SourceGoal-IDs haben im aktuellen Kanon keine weiteren direkten `provenance.sourceGoalId`-Felder; die kanonische Locator-Feldreichweite bleibt deshalb bei denselben fünf Feldern. Abschnittsüberschrift sowie Absätze (1) und (2) behalten exakt S. 15.

## Tatsächliche Reichweite

Es handelt sich um **einen SourceGoal**, `bw-chem-seki-3-2-1-2-b03-a01-1f9ce38a`, mit drei bestehenden `partial`-Mappingrows zu `10ce2814-8796-5633-9bed-f6990d039b91`, `326d45bf-9f77-57d5-a054-93e76b034dd5` und `53fd1bfd-facb-54ae-b2dc-f667ed1414fc`. Diese drei Zeilen sind keine drei unterschiedlichen amtlichen Absätze. Beide Mappingdateien und die historische Entscheidung bleiben exakt erhalten.

Den gleichen falschen Provenienzlocator tragen der Cluster `10ce2814…` und seine vier Split-Kinder `988888bb…`, `5338b54c…`, `5dd180f1…`, `78109f6d…`. Alle fünf werden im jeweiligen Rohkandidaten korrigiert. Gegenüber der eigenen B007-v4-Basis bleiben 108 der 112 geschützten Gesamtobjekte exakt; bei vier ändert sich ausschließlich dieser Quellenlocator. Alle Texte, Übersetzungen, Graphbeziehungen, Bildlinks und Rasterbytes bleiben für den Locatordelta exakt. Frühere v4-Prerequisite-Proposals werden weder verändert noch erneut freigegeben.

Die amtliche Reichweite ist BW, Gymnasium, SekI, Klassen 8/9/10, `courseLevel: unspecified`. Der Absatz verlangt Teilchenmodell-Beschreibungen zu Aggregatzuständen, Lösungsvorgängen, Diffusion und Brownscher Bewegung. Daraus wird keine quantitative Sättigungs-/Konzentrations-/Massenanteils-/Volumenanteilsroutine oder vollständige Abdeckung aller sieben neuen Routinen abgeleitet.

## Verbleibende HOLDs und Prüfstatus

Die 403 originalen Quellenpflichten, 413 originalen Zuordnungszeilen, 40 betroffenen bestehenden Sichten und ihre bisherigen fachlichen Grenzen bleiben offen. Für BW SekI bleiben insbesondere die zwei bestehenden `CPV-009`-Referenzen und die quellengetreue Auswahl konkreter Kinder ungelöst. Die HE-Platzierungsintentionen und der getrennte qualitative NI-Witness werden nicht zu BW-Freigaben umgedeutet. Fakultative quantitative HE-Reichweite, Operator-/Kind-/Landesscope-Entscheidungen und verbleibende direkte Prerequisite-Verbraucher bleiben getrennt sichtbar.

Im selben bereits gelesenen Raster stehen auch die Absätze (4)–(10). Deren retained SourceGoal-Locators nennen ebenfalls die Abschnittsseite 15 statt der tatsächlichen Absatzseite 16. Diese sieben konkreten weiteren Abweichungen bleiben ausdrücklich als getrennte Locator-HOLDs in `additional-same-section-locator-holds.actual.json` offen. Im ursprünglichen B007-Subset bleiben ihre Felder unverändert; dieses Subset korrigiert ausschließlich den B007-bezogenen Absatz (3) und die belegte gemeinsame V2-URL.

Für diese sieben zusätzlichen Locators wurde anschließend ausdrücklich die getrennte Acht-Absatz-Rohalternative autorisiert und vorbereitet. Ihre zwölf tatsächlichen Mapping-Ziele sind technisch gebunden; fachliche Mapping-/Operator-/Kind- und Gate-Entscheidungen bleiben unverändert. Beide Subset-Alternativen bleiben bis zu den zwei Quellenprüfungen Kandidaten. Der Ausgangs-HOLD wird damit nicht als geschlossen gezählt.

Die aktuelle zentrale Maschinenquittung enthält inzwischen **127** strikte Chemie-IDs. Die vollständigen 127 aktuellen Goal-Objekte und die genaue Schnittmenge der vorhandenen Mapping-Routen stehen in `current127-protected-membership-and-actual-whole-source-goal-binding.snapshot.json`. Gegen die aktuelle aktive Metadatenalternative bleiben 123 Objekte exakt, bei vier ändert sich nur der Locator. Die B007-v4-Alternative hat eine ältere, separat gebundene Basis und behauptet keine aktuelle 127-Gesamtgleichheit. Spätere Delta-QS muss die tatsächlichen Goal-/Page-/Context-/Source-Bindungen aller aktuellen 127 berücksichtigen; diese wurde hier nicht vorweggenommen.

Gezielte eigene Erhaltungsprüfungen: **PASS**. Kein Lernzielbuch-, PDF-Buch-, SourceAtlas- oder globaler Lauf wurde neu ausgeführt. Die amtlichen PDF-Raster sind Quellenbelege, keine neuen Lernzielbilder. Keine Produktionsvalidatoren geändert. Keine aktiven oder historischen Dateien beschrieben. `sourceHoldsCleared = 0`, `strictCompletionsAdded = 0`.

Startpunkt für die zwei neuen Quellenprüfungen ist `raw-source-review-input.author-candidate.json`, mit exakten Rohkandidaten, Originalen, tatsächlichen Seitenrastern und Downloadquittungen. Neue Peer-Verdicts sind nicht Teil dieses Autoreneingangs.

## Rechte

Amtliche PDFs und daraus erzeugte Seitenraster behalten ihre ursprünglichen Drittanbieterrechte. Dieses Dossier behauptet keine neue Weitergabefreigabe oder CC-Lizenz für den amtlichen Bildungsplan. Eigene technische Nachweisführung und Hilfscode folgen Apache-2.0; eigene Landschafts-/Mapping-/didaktische Inhalte folgen der Repository-Zuordnung CC-BY-4.0. Quellenprovenienz, Lizenz und fachliche Freigabe werden getrennt behandelt.
