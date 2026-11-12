# Kanonisches Gymnasium Physik: Bundesländer-Status

Snapshot: `2026-04-24T12:00:00Z`

Diese Datei wird generiert aus:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `app/scripts/reportCanonicalPhysicsStateAtomCounts.ts`
- `curricula/DE/Gymnasium/composition-views/physik`

## Kennzahlen im Überblick

- Erfasste Bundesländer: `16`
- Kanonische Quellenabdeckung vorhanden: `16/16`
- Operativer ländergewichteter Rollout-Score (mit Count-Gate): `61.9%`
- Länder mit aktiven Snapshots (`P2+`): `16/16`
- Länder mit zugeordneten Strukturankern (`P3+`): `16/16`
- Länder mit geprüftem Korridor (`P4+`): `9/16`
- Länder mit breiter Abdeckung (`P5+`): `2/16`
- Länder operativ umstellungsbereit (`P6` nach Count-Gate): `1/16`
- Aktive kanonische Korridore: `1/13`
- Referenzspur für die Anzahl atomarer Ziele: `DE-HE` Hessen
- Hessen-Referenzzahlen: `Sek I 63`, `Sek II (GK) 267`, `Sek II (LK) 334`
- Hessen-Korridor (`+-20%`): `Sek I 51-75`, `Sek II (GK) 214-320`, `Sek II (LK) 268-400`
- Nicht-Referenzländer auf allen drei Stufenzählwerten im Korridor: `13/15`
- Sek I im Korridor: `13/15`
- Sek II (GK) im Korridor: `13/15`
- Sek II (LK) im Korridor: `13/15`
- Durch das Count-Gate für `cutover_ready` gesperrte Länder: `2`
- Priorität `active`: `2`
- Priorität `backlog`: `14`

## Steuerungsmodell

- Primäre Arbeitseinheit: `topic_first_reviewed_corridor`
- Regel für die kanonische Sicht: Die kanonische DE-Physik-Skill-Landschaft wird als kuratierte didaktische Single Source of Truth geführt, nicht als ungefilterte Vereinigung aller länderspezifischen Paketstrukturen.
- Regel für Ländersichten: Bundesland-Sichten werden als Projektionen geführt, die so nah wie möglich am kanonischen Physik-Baum bleiben und dabei Atome auslassen oder zurückstellen, die den jeweiligen Landeslehrplan überbeanspruchen würden.
- Count-Gate-Regel: Länder außerhalb des hessischen `+-20%`-Stufenkorridors werden operativ bei `P5` / `subtree_adopted` gedeckelt, bis der Korridor eingehalten wird.
- Ablaufreihenfolge:
  - Zuerst die amtlichen Physik-Quellmaterialien für jede noch fehlende Bundesland-Spur lokal unter der bundesweiten DE-Input-Struktur archivieren, sowohl für Sek I als auch für Sek II, soweit einschlägig; keinen weiteren geprüften Länderkorridor ausweiten, bevor diese Quell-Onboarding-Tranche abgeschlossen ist.
  - Sobald die Quellbasis lokal vollständig ist, eine aktive Physik-Themenzeile auswählen und diese Zeile über alle vorgehaltenen Bundesland-Quellen hinweg vergleichen, bevor eine weitere Länderspur ausgeweitet wird.
  - Zuerst die vorgehaltene Landes-Quellspur archivieren oder aktualisieren und anschließend das betroffene Delta gezielt auf Mappings, Provenienz, Applicability und nur diejenigen lernendenseitigen Views eingrenzen, die sich innerhalb dieser Themenzeile tatsächlich ändern.
  - Geprüfte Quellsplits und konservative Teilbrücken gegenüber vorzeitigem Wachstum kanonischer Atome bevorzugen, solange die aktuelle gemeinsame Physik-Oberfläche semantisch noch enger oder breiter als der Quellwortlaut ist.
  - Die Standard-Prüfschranken für Physik-Mappings, Applicability und Runtime erneut ausführen, bevor das Rollout-Delta gemergt wird.
- Aufnahme kanonischer Atome:
  - Ein kanonisches Physik-Atom nur dann ergänzen, wenn es die didaktische Vollständigkeit des gemeinsamen DE-Skill-Graphen verbessert.
  - Keine kanonischen Atome nur deshalb ergänzen, um den Paketwortlaut eines einzelnen Bundeslandes abzubilden oder einen vorübergehenden quellgeführten Restbestand zu vermeiden.
  - Die Qualität kanonischer Teilbäume hat Vorrang vor kurzfristiger Mapping-Bequemlichkeit.

## Register der kanonischen Korridore

| Korridor | Status | Fokusländer | Nächster Schritt |
| --- | --- | --- | --- |
| `M1.HE_BY_HARDENED_BASE` Gehärtete Basis Hessen und Bayern | `completed` | `DE-HE`, `DE-BY` | Die Hessen-/Bayern-Basis ausschließlich im Pflegebetrieb behandeln: vorgehaltene Quell-Snapshots, Mappings, Provenienz, Applicability und landesspezifische Composition-Views gemeinsam aktualisieren, sobald eine Lehrplanrevision den sichtbaren Physik-Scope verändert. |
| `SEK2.NW.UPPER_SECONDARY` Nordrhein-Westfalen Sekundarstufe II schmale Korridorspur | `completed` | `DE-NW` | Den aktuellen NRW-Oberstufenkorridor auf dem geprüften Pilotschnitt als abgeschlossen behandeln und innerhalb der laufenden themenzentrierten Pflegephase stabil halten. NRW nur für einen weiteren klar quellgeführten Korridor außerhalb des ausgeschöpften GK-Atommodell-Streifens wieder öffnen oder wenn eine spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt; keine NRW-spezifischen Physik-Composition-Views einführen, bevor breitere geprüfte Evidenz dies tatsächlich erfordert. |
| `SEK2.NI.UPPER_SECONDARY_ENTRY` Niedersachsen Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-NI` | Die Ersteinstiegsspur Niedersachsen Sekundarstufe II auf dem aktuellen geprüften Pilotschnitt als abgeschlossen behandeln: der importierte Niedersachsen-Pilotkorridor umfasst nun die geprüften Anschlüsse zu `Michelson`, gekreuzten Feldern und Fadenstrahlrohr; diese vorgehaltene Zeile stabil halten. Niedersachsen nur dann wieder öffnen, wenn eine spätere Bundesland-Quellspur eine echte gemeinsame Physik-Lücke erzwingt oder wenn das weiterhin quellgeführte nachhaltigkeitsbezogene Bewertungsblatt eine echte gemeinsame Physik-Bewertungsoberfläche erhält. |
| `SEK2.BW.UPPER_SECONDARY_ENTRY` Baden-Württemberg Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-BW` | Die aktuelle BW-Ersteinstiegsspur Sekundarstufe II auf dem geprüften Pilotschnitt als abgeschlossen behandeln und innerhalb der laufenden themenzentrierten Pflegephase stabil halten. BW nur für einen weiteren klar fehlenden geprüften Korridor außerhalb der inzwischen abgedeckten Basisfach-/Leistungsfach-Optik- und Quantenstreifen wieder öffnen oder wenn eine spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt; weiterhin auf BW-spezifische Physik-Composition-Views oder einen breiteren Applicability-Durchlauf verzichten, bevor breitere Evidenz vorliegt. |
| `SEK2.BE.UPPER_SECONDARY_ENTRY` Berlin Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-BE` | Die aktuelle Berliner Ersteinstiegsspur Sekundarstufe II auf dem geprüften Pilotschnitt als semantisch abgeschlossen behandeln. Berlin ausschließlich im Pflegebetrieb halten und nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt. |
| `SEK2.BB.UPPER_SECONDARY_ENTRY` Brandenburg Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-BB` | Die aktuelle vorgehaltene Brandenburger Oberstufenspur `3.2.1` -> `3.2.2` auf dem geprüften Pilotschnitt als semantisch abgeschlossen behandeln. Brandenburg ausschließlich im Pflegebetrieb halten und nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt. |
| `SEK2.SH.UPPER_SECONDARY_ENTRY` Schleswig-Holstein Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-SH` | Die aktuelle Oberstufenspur Schleswig-Holstein auf dem geprüften Pilotschnitt als semantisch abgeschlossen behandeln. Schleswig-Holstein ausschließlich im Pflegebetrieb halten und nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt. |
| `SEK2.RP.UPPER_SECONDARY_ENTRY` Rheinland-Pfalz Sekundarstufe II Ersteinstiegsspur | `completed` | `DE-RP` | Die aktuelle Oberstufenspur Rheinland-Pfalz auf dem geprüften Pilotschnitt als semantisch abgeschlossen behandeln. Rheinland-Pfalz ausschließlich im Pflegebetrieb halten und nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt. |
| `F4.ALL_MISSING_STATE_SOURCE_ONBOARDING` Physik-Quell-Onboarding-Tranche aller fehlenden Länder | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Die Quellarchivierungs-Tranche ist nun abgeschlossen: alle sieben zuvor fehlenden Physik-Länderfamilien sind lokal für Sek I und Sek II archiviert, soweit einschlägig. Die archivierten Pakete stabil halten und den aktiven Rollout vor einer weiteren Ausweitung geprüfter Themenzeilen auf Quell-Snapshot- und Provenienz-Aktivierung umstellen. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` Physik-Snapshot-Aktivierungstranche aller neu archivierten Länder | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Die Snapshot-/Provenienz-Tranche ist nun abgeschlossen: Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt und Thüringen verfügen alle über aktive vorgehaltene Physik-Quellspuren für Sekundarstufe I und Sekundarstufe II. Diese quellgestützten Pakete stabil halten und den aktiven Rollout vor einer weiteren Ausweitung geprüfter Themenzeilen auf den ersten Strukturanker-Durchlauf umstellen. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` Physik-Strukturanker-Aktivierungstranche aller neu archivierten Länder | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Der erste konservative `P3`-Strukturanker-Durchlauf ist nun für Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt und Thüringen abgeschlossen. Diese landesweiten Ankerschnitte stabil halten und den aktiven Rollout statt einer weiteren landeslokalen Strukturaktivierung wieder auf die erste horizontale, über alle Länder geprüfte Physik-Themenzeile zurückführen. |
| `F5.ALL_STATE_HORIZONTAL_TOPIC_REENTRY` Horizontaler Wiedereinstieg über alle Länder im Physik-Themendurchlauf | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HH`, `DE-HE`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Die horizontale Wiedereinstiegstranche über alle Länder ist auf dem aktuellen geprüften Schnitt abgeschlossen: die vier anfänglichen Sek-II-Zeilen, die ersten acht Sek-I-Zeilen und der erste nachgelagerte Sek-I-Kandidatendurchlauf sind jeweils einmal abgeschlossen. Die auditierten Zeilen stabil halten, die Aufnahme weiterer Sek-I-Zeilen eingefroren lassen und diesen Korridor nur dann wieder öffnen, wenn neue quellgestützte Evidenz oder ein echt neuer Hessen-basierter Sek-I-Streifen eine weitere bundesweite Zeile rechtfertigt. |
| `F6.MAINTENANCE_EVIDENCE_WATCH` Physik-Pflege und Evidenzüberwachung (Evidence Watch) | `active` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HH`, `DE-HE`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Physik befindet sich nun im Pflege- / Evidence-Watch-Modus ohne offene kanonische Restbestandsspur. Die abgeschlossene Hessen-/Bayern-Basis, die geprüften Oberstufen-Länderkorridore, die ersten acht auditierten Sek-I-Zeilen und die eingefrorenen nachgelagerten Sek-I-Kandidatenentscheidungen stabil halten. Das maschinenlesbare Watch-Manifest `curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json`, den generierten Watch-Status `docs/dev/canonical-gymnasium-physics-evidence-watch-status.md`, die baselinegestützte Delta-Ansicht `docs/dev/canonical-gymnasium-physics-evidence-watch-delta.md`, die Exit-Code-Prüfung `python3 scripts/check_canonical_physics_evidence_watch_delta.py`, den festen Ausführungspfad `./scripts/run_canonical_physics_evidence_watch.sh` und den geplanten Workflow `.github/workflows/canonical_physics_evidence_watch.yml` als operative Überwachungsoberfläche für Sek-I-Kandidatenzeilen und allgemeine Sek-II-Quellrevisionen nutzen. Den aktiven Rollout nur dann wieder öffnen, wenn sich eine der überwachten Quelldateien so ändert, dass die dokumentierten Wiederöffnungs-Trigger erfüllt sind. |

## Korridor für die Anzahl atomarer Ziele

Hessen (`DE-HE`) ist die Referenzspur. Alle anderen Bundesländer sollen innerhalb von `+-20%` der hessischen Stufenzählwerte liegen.

Operatives Gate: Länder außerhalb des Korridors werden bei `P5` / `subtree_adopted` gedeckelt. Abweichungen auf allen drei Stufen eskalieren auf `active`, Teilabweichungen auf `next_wave`.

| Bundesland | Sek I | Sek II (GK) | Sek II (LK) | Korridor | Detail |
| --- | ---: | ---: | ---: | --- | --- |
| `DE-BY` Bayern | `92` | `154` | `207` | `out` | Sek I zu hoch, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-BW` Baden-Württemberg | `95` | `81` | `117` | `out` | Sek I zu hoch, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-HE` Hessen | `63` | `267` | `334` | `reference` | Referenzspur `Hessen` |
| `DE-BB` Brandenburg | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-BE` Berlin | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-NI` Niedersachsen | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-NW` Nordrhein-Westfalen | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-RP` Rheinland-Pfalz | `63` | `266` | `332` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-SH` Schleswig-Holstein | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-HB` Bremen | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-HH` Hamburg | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-MV` Mecklenburg-Vorpommern | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-SL` Saarland | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-SN` Sachsen | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-ST` Sachsen-Anhalt | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |
| `DE-TH` Thüringen | `63` | `267` | `334` | `ok` | alle Stufenzählwerte im Hessen-Korridor |

## Programmphasen

| Programmphase | Status |
| --- | --- |
| `F0` Tracking-Grundgerüst | `completed` |
| `F1` Gehärtete Basis Hessen und Bayern | `completed` |
| `F2` Aktivierung des dritten Landes | `completed` |
| `F3` Wiederholbarer Mehr-Länder-Rollout | `completed` |
| `F4` Pflege vorgehaltener Länder und künftiges Quell-Onboarding | `completed` |
| `F5` Horizontaler geprüfter Durchlauf über alle Länder | `completed` |
| `F6` Pflege und Evidenzüberwachung (Evidence Watch) | `active` |

## Phasenskala der Bundesländer

| Phase | Score | Bedeutung |
| --- | ---: | --- |
| `P0` Platzhalter | `0%` | Nur README-/Quellenlinks, keine aktive Physik-Rollout-Spur. |
| `P1` Quelle archiviert | `15%` | Physik-Quellmaterial ist in der bundesweiten DE-Input-Spur archiviert. |
| `P2` Snapshots aktiv | `30%` | Physik-Quell-Snapshots und Provenienz sind aktiv. |
| `P3` Strukturanker zugeordnet | `50%` | Kanonische Strukturanker sind auf dem gemeinsamen Physik-Rückgrat zugeordnet. |
| `P4` Erster Korridor geprüft | `65%` | Mindestens ein didaktisch geschlossener, geprüfter Physik-Korridor ist zugeordnet. |
| `P5` Breite Landesabdeckung | `85%` | Das Land verfügt über eine breite geprüfte Abdeckung entlang des aktiven Physik-Rückgrats. |
| `P6` Land umstellungsbereit | `100%` | Das Land ist auf der kanonischen Physik-Skill-Landschaft operativ einsatzbereit. |

## Länderübersicht

| Bundesland | Operative Phase | Erfasste Phase | Score | Applicability | Mappings | Zählkorridor | Quellstufe | Priorität |
| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |
| `DE-BY` Bayern | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `44` | `out` | `subtree_adopted` | `active` |
| `DE-BW` Baden-Württemberg | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `64` | `out` | `subtree_adopted` | `active` |
| `DE-HE` Hessen | `P6` Land umstellungsbereit | `P6` Land umstellungsbereit | `100%` | `yes` | `429` | `reference` | `cutover_ready` | `backlog` |
| `DE-BB` Brandenburg | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `27` | `ok` | `subtree_adopted` | `backlog` |
| `DE-BE` Berlin | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `27` | `ok` | `subtree_adopted` | `backlog` |
| `DE-NI` Niedersachsen | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `56` | `ok` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `28` | `ok` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `112` | `ok` | `subtree_adopted` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P4` Erster Korridor geprüft | `P4` Erster Korridor geprüft | `65%` | `yes` | `24` | `ok` | `subtree_adopted` | `backlog` |
| `DE-HB` Bremen | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `16` | `ok` | `anchors_mapped` | `backlog` |
| `DE-HH` Hamburg | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `14` | `ok` | `anchors_mapped` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `18` | `ok` | `anchors_mapped` | `backlog` |
| `DE-SL` Saarland | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `24` | `ok` | `anchors_mapped` | `backlog` |
| `DE-SN` Sachsen | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `33` | `ok` | `anchors_mapped` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `40` | `ok` | `anchors_mapped` | `backlog` |
| `DE-TH` Thüringen | `P3` Strukturanker zugeordnet | `P3` Strukturanker zugeordnet | `50%` | `yes` | `17` | `ok` | `anchors_mapped` | `backlog` |

## Unmittelbare Arbeitsliste

- `DE-BW` (`P4`, `active`): Baden-Württemberg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Physik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BY` (`P5`, `active`): Bayern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Physik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.

## Nächste Schritte

- `DE-BY`: Bayern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Physik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BW`: Baden-Württemberg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Physik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HE`: Hessen ausschließlich im Pflegebetrieb halten: vorgehaltene Quell-Snapshots, Mappings, Provenienz, Applicability und die DE-HE-Physik-Composition-Views gemeinsam aktualisieren, sobald eine Lehrplanrevision den sichtbaren Scope oder die lernendenseitige Baumstruktur verändert.
- `DE-BB`: Brandenburg auf der geprüften vorgehaltenen Route `3.2.1` -> `3.2.2` stabil halten. Nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt.
- `DE-BE`: Berlin auf der geprüften vorgehaltenen Route `3.2.1` -> `3.2.2` stabil halten. Nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt.
- `DE-NI`: Niedersachsen auf dem aktuellen geprüften Pilotschnitt ausschließlich im Pflegebetrieb halten: den importierten vorgehaltenen Pilotkorridor einschließlich der geprüften Anschlüsse zu `Michelson`, gekreuzten Feldern und Fadenstrahlrohr bewahren. Das nachhaltigkeitsbezogene Bewertungsblatt bewusst quellgeführt belassen, sofern ein späterer vorgehaltener Rollout keine echte gemeinsame Physik-Bewertungsoberfläche erzeugt, und weiterhin auf Niedersachsen-spezifische Physik-Composition-Views oder neue kanonische Atome ohne breitere geprüfte Evidenz verzichten.
- `DE-NW`: Nordrhein-Westfalen auf dem aktuellen geprüften Pilotschnitt ausschließlich im Pflegebetrieb halten: den bestehenden Oberstufenkorridor innerhalb der laufenden themenzentrierten Pflegephase bewahren und NRW nur für einen weiteren klar quellgeführten Korridor außerhalb des ausgeschöpften GK-Atommodell-Streifens wieder öffnen oder wenn spätere vorgehaltene Quellspuren eine echte gemeinsame Physik-Lücke erzeugen; keine NRW-spezifischen Physik-Composition-Views einführen, bevor breitere geprüfte Evidenz dies tatsächlich erfordert.
- `DE-RP`: Rheinland-Pfalz auf dem aktuellen geprüften Schnitt stabil halten. Nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt.
- `DE-SH`: Schleswig-Holstein auf dem aktuellen geprüften Schnitt stabil halten. Nur dann wieder öffnen, wenn eine spätere Quellrevision den sichtbaren Scope ändert oder eine andere spätere vorgehaltene Quellspur eine echte gemeinsame Physik-Lücke erzeugt.
- `DE-HB`: Bremen auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Bremen auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Bremen relevanten Streifen erreicht.
- `DE-HH`: Hamburg auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Hamburg auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Hamburg relevanten Streifen erreicht.
- `DE-MV`: Mecklenburg-Vorpommern auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Mecklenburg-Vorpommern auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Mecklenburg-Vorpommern relevanten Streifen erreicht.
- `DE-SL`: Saarland auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Saarland auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für das Saarland relevanten Streifen erreicht.
- `DE-SN`: Sachsen auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Sachsen auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Sachsen relevanten Streifen erreicht.
- `DE-ST`: Sachsen-Anhalt auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Sachsen-Anhalt auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Sachsen-Anhalt relevanten Streifen erreicht.
- `DE-TH`: Thüringen auf dem ersten konservativen `P3`-Strukturankerschnitt stabil halten. Thüringen auf der aktuellen Evidenzbasis nicht in einen weiteren landeslokalen Korridor ausweiten; nur dann wieder öffnen, wenn eine spätere quellgestützte bundesweite Zeile oder eine echte gemeinsame Physik-Lücke einen für Thüringen relevanten Streifen erreicht.

## Neugenerierung

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
