# E.1 – unabhängige Prüfung der Sek-I-Quellen und Übungsangebote

Stand 24. November 2026, auf der Grundlage von `bf34d99e7f`. Die Unterrichts- und Prüfungsentscheidungen wurden von Codex getrennt von den Claude-Opus-Autoren geprüft. „Teilzuordnung“ bezeichnet eine nachweisbare Überschneidung mit einer Quellenaussage. Ein vollständiges Sek-I-Ziel und das Angebot einer konkreten Übung benötigen jeweils einen eigenen Nachweis.

| Nr. | Ergebnis und Quellenbeleg | Umsetzung und Prüfpfad |
|---:|---|---|
| 1 | **SN bestätigt.** Klasse 9 nennt „Weg als Fläche“ und behandelt die Bewegungsgesetze zunächst „ohne Anfangsgeschwindigkeit“ (Physik, PDF 36–37). Die Aufgabe verlangt einen verschobenen Zeitursprung und eine Bremsgleichung. Die Vorbereitung einschließlich Mathematik trägt diesen Transfer. | `a8dc0290` verlangt LAWS. Die 20 Punkte bewerten weiterhin BES. Alle 66 Vorbereitungsatome sind einzeln gebunden. [Aufgaben-, Quellen- und Hashprüfung](sn/review.actual.json) |
| 2 | **SN bestätigt und korrigiert.** Klasse 7 fordert „Anwenden des Gesetzes von der Erhaltung der Energie“ (PDF 28). Der Wahlbereich in Klasse 9 behandelt die „Radialkraft“ (PDF 39). Keine der beiden Stellen trägt ein Freifallexperiment. | Die beiden Direktzuordnungen tragen Energieerhaltung bzw. die Anwendung der Zentripetalkraft. Die experimentelle Freifallaufgabe liegt in J9. Ihre vollständige Vorbereitung umfasst 69 Atome. [Vier korrigierte Quellentscheidungen](sn/route-decisions.current.json) · [Nachprüfung des früheren Einheitenreviews](free-fall-preparation-supersession.actual.json) |
| 3 | **TH bestätigt.** Der Physiklehrplan setzt seine drei Zeilen im Themenbereich 2.2.2 unter „Klassenstufe 10“ (S. 21). Die Oberstufenbroschüre verortet dort die Einführungsphase des regulären Gymnasiums (Druck 4–5). | Die drei fachlichen Teilrouten bleiben. Für das vollständige Gesetzesziel gilt die E10-Einstufung. [Quellen und Geltungsbereich](th-mv/th-motion-laws-source-stage.review.actual.json) |
| 4 | **MV bestätigt die Teilzuordnung.** Belegt sind das „s(t)-Diagramm, v(t)-Diagramm“ der gleichförmigen Bewegung (Druck 36, PDF 40) und die Durchschnittsgeschwindigkeit im benachbarten E-Bike-Kontext. Ein Nachweis für die vorzeichenbehaftete Flächendeutung fehlt. | Die Diagrammroute bleibt als Teilbezug. Das vollständige TV-Ziel wird in Sek I als zusätzlicher Quellenseed ausgeschlossen. [Originalstellen und Entscheidung](th-mv/mv-velocity-time-source-scope.review.actual.json) |
| 5 | **SN lehnt beide FALL-Zuordnungen ab.** „g als Fallbeschleunigung“ und der „Hinweis auf Bewegung mit Reibung“ (Druck 25, PDF 37) tragen keinen gezielten Vergleich leichter und schwerer Körper in Luft und Vakuum. | Beide Zuordnungen zum Vergleichsziel entfernt. Freier Fall und Galileo bleiben in der Originalstelle verankert. [Vorher](sn/route-decisions.before.json) · [Nachher](sn/route-decisions.current.json) |
| 6 | **ST bestätigt, HH lehnt das bestehende Angebot ab.** In ST stehen „Flächen unter den Graphen interpretieren“ (S. 45) und „Bewegungen mit Anfangsbedingungen“ (S. 46). HH nennt im erhaltenen Plan `s = ½at²` und `v = at` (S. 20). Auch im aktuellen Plan fehlt die vollständige Vorbereitung auf den Wechsel des Zeitursprungs und die vorzeichenbehaftete Flächenauswertung dieser Aufgabe. | ST bietet `a8dc0290` nach 66 vorhandenen Vorbereitungsatomen an. HH benötigt einen passenden Nachweis. Acht vorhandene Aufgaben wurden geprüft. [Entscheidungen](hh-st/source-stage-review.actual.json) · [Vorhandene Alternativen](hh-st/existing-alternatives.actual.json) |

Die geänderten Quellrouten liegen in `mapping/DE-HH/lower-secondary`, `mapping/DE-SN/lower-secondary` und `mapping/DE-ST/lower-secondary`. Bei der gemeinsamen Gegenprüfung der Stufen wurden zwei Seitenangaben im ST-Oberstufenmapping präzisiert. Alle Konfigurationen der Sek-I-Ausschlüsse, Bindungen und aktuellen Dateihashes liegen in `scripts/generate_laender_physics_stage_views.sources.json`. Die aufbewahrten Originallehrpläne und Extraktionen sind unverändert. Die vier am 17. November gebundenen sächsischen Nachweise sind mit ihren früheren Hashes in der Nachfolgeprüfung referenziert. Die zusätzliche hessische Platzierung der Zweireihenaufgabe ist in ihrem Datenstand sichtbar. Ihre fachliche Aktivierung gehört zur hessischen Materialprüfung.

## Nachtrag zur Gegenprüfung

Bayern, Ph10.3.4: Die quantitative Beschreibung von Bewegungen trägt LAWS. Die einzige bayerische Quellroute zu MOD ist entfernt. Der Generator behält die ursprüngliche Zielauswahl in beiden stufenübergreifenden Sichten und in der Sek-I-Sicht bei. Dort bleibt MOD in J10/Ph10.3. In den beiden reinen Sek-II-Sichten ist MOD abwesend. Alle fünf Dateien sind vor und nach diesem Nachtrag bytegleich. Die sächsische GK11-Zeile 68 verweist jetzt auf PDF-Seite 48 (Druckseite 36). [Quellenentscheidungen und fünf Sichtvergleiche](bavaria-saxony-route-addendum.actual.json)

Für die zwei durch die sächsischen Routenkorrekturen sichtbar gewordenen Ziele wurde das vorhandene Aufgabenangebot nochmals geprüft. Die konkrete Kurvenfahrtaufgabe hat 74 reale Vorbereitungsatome. Die vollständige Winkelgeschwindigkeitskompetenz und die Herleitung der Radialkraft sind in der sächsischen Sekundarstufe I nicht belegt. Ihr engerer Rechenweg in der Aufgabe genügt für die Freigabe des gesamten Vertrags nicht. Für die in J7 belegte Energieerhaltung liefern auch die acht vorhandenen nachgelagerten Aufgaben keinen passenden Sek-I-Endpunkt. [Geprüfte Aufgaben, Voraussetzungen und Quellen](sn/endpoint-gap-review.actual.json)

## Qualitätslauf und alle offenen Kontexte

Physik M3, Physik Sek I M2. CQR-104 scheitert in 12 von 106 Kontexten. Der bayerische Nachtrag erzeugt weder in den Landes- noch in den bundesweiten Bayern-Projektionen einen neuen Fehler.

| Sichtdatei | Land | Offene Ziele bzw. Endpunkte |
|---|---|---|
| `de-de-gym-physics-gk.view.json` | DE-HH | `262f807a` |
| `de-de-gym-physics-gk.view.json` | DE-SN | `91c49019` |
| `de-de-gym-physics-lk.view.json` | DE-HH | `262f807a` |
| `de-de-gym-physics-lk.view.json` | DE-SN | `91c49019` |
| `de-de-gym-seki-physics.view.json` | DE-HH | `262f807a` |
| `de-de-gym-seki-physics.view.json` | DE-SN | `91c49019` |
| `de-hh-gk.view.json` | DE-HH | `262f807a` |
| `de-hh-lk.view.json` | DE-HH | `262f807a` |
| `de-hh-seki.view.json` | DE-HH | `262f807a` |
| `de-sn-gk.view.json` | DE-SN | `91c49019`, `accb1d9e` |
| `de-sn-lk.view.json` | DE-SN | `91c49019`, `accb1d9e` |
| `de-sn-seki.view.json` | DE-SN | `91c49019`, `accb1d9e`, `b1808b4c` |

In Hamburg fehlt die Abschlussroute für die Bewegungsgesetze (`262f807a`). In Sachsen fehlt sie für Energieerhaltung (`91c49019`) und in den Landessichten zusätzlich für die Anwendung der Zentripetalkraft (`accb1d9e`). In der reinen sächsischen Sek-I-Sicht fehlt außerdem der erwartete Kurvenfahrt-Endpunkt (`b1808b4c`). Die Prüfungsprojektion meldet diese Lücken. Der Zielbuchtest stoppt an der noch ungeprüften geänderten Vorbereitung von `dfd2628f`. [Ungekürztes Ergebnis](quality-result.actual.json) · [Verschachtelte Lernkarten](nested-map-comparison.actual.json)
