# Kanonisches Gymnasium Mathematik: Bundesländer-Status

Snapshot: `2026-05-07T07:44:05Z`

Diese Datei wird generiert aus:

- `curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- `app/scripts/reportCanonicalMathStateAtomCounts.ts`
- `curricula/DE/Gymnasium/composition-views/mathematik`

## Kennzahlen im Überblick

- Erfasste Bundesländer: `16`
- Kanonische Quellenabdeckung vorhanden: `16/16`
- Operativer ländergewichteter Rollout-Score (mit Count-Gate): `85.9%`
- Länder mit aktiven Snapshots (`P2+`): `16/16`
- Länder mit zugeordneten Strukturankern (`P3+`): `16/16`
- Länder mit geprüftem Korridor (`P4+`): `16/16`
- Länder mit breiter Abdeckung (`P5+`): `16/16`
- Länder operativ umstellungsbereit (`P6` nach Count-Gate): `1/16`
- Aktive kanonische Korridore: `0/6`
- Referenzspur für die Anzahl atomarer Ziele: `DE-HE` Hessen
- Hessen-Referenzzahlen: `Sek I 105`, `Sek II (GK) 416`, `Sek II (LK) 483`
- Hessen-Korridor (`+-20%`): `Sek I 84-126`, `Sek II (GK) 333-499`, `Sek II (LK) 387-579`
- Nicht-Referenzländer auf allen drei Stufenzählwerten im Korridor: `0/15`
- Sek I im Korridor: `5/15`
- Sek II (GK) im Korridor: `0/15`
- Sek II (LK) im Korridor: `0/15`
- Durch das Count-Gate für `cutover_ready` gesperrte Länder: `15`
- Priorität `active`: `10`
- Priorität `next_wave`: `5`
- Priorität `backlog`: `1`

## Steuerungsmodell

- Primäre Arbeitseinheit: `maintenance_delta`
- Regel für die kanonische Sicht: Die kanonische DE-Mathematik-Sicht wird als kuratierte didaktische Single Source of Truth geführt, nicht als ungefilterte Vereinigung aller länderspezifischen Atome.
- Regel für Ländersichten: Bundesland-Sichten werden als Projektionen geführt, die so nah wie möglich an der kanonischen Sicht bleiben und dabei Atome auslassen, die dem jeweiligen Landeslehrplan widersprechen würden.
- Count-Gate-Regel: Länder außerhalb des hessischen `+-20%`-Stufenkorridors werden operativ bei `P5` / `subtree_adopted` gedeckelt, bis der Korridor eingehalten wird.
- Ablaufreihenfolge:
  - Zuerst die vorgehaltene Landes-Quellspur archivieren oder aktualisieren und anschließend das betroffene Curriculum-Delta gezielt auf Mappings, Provenienz, Applicability und Composition-Scopes eingrenzen.
  - Nur die geprüften kanonischen Atome und die kleinsten landesspezifischen Mathematik-Composition-Views anfassen, deren lernendenseitige Baumstruktur sich tatsächlich ändert.
  - Applicability, Composition-View-Validierung, kanonische Mathematik-Scope-Abdeckung, Status-Generierung und CI erneut ausführen, bevor das Pflege-Delta gemergt wird.
- Aufnahme kanonischer Atome:
  - Ein kanonisches Atom nur dann ergänzen, wenn es die didaktische Vollständigkeit des gemeinsamen DE-Mathematik-Skill-Graphen verbessert.
  - Keine kanonischen Atome nur deshalb ergänzen, um Paketzuschnitt, Tabellenlayout oder Wortlaut eines einzelnen Bundeslandes abzubilden.
  - Die Qualität kanonischer Teilbäume hat Vorrang vor kurzfristiger Mapping-Bequemlichkeit.

## Register der kanonischen Korridore

| Korridor | Status | Fokusländer | Nächster Schritt |
| --- | --- | --- | --- |
| `SEK1.J10.FUNCTION_FAMILIES` Sek I J10 Funktionsfamilien | `completed` | `DE-BY`, `DE-BW`, `DE-SH`, `DE-NI`, `DE-SN` | Den Sek-I-J10-Durchlauf zu Funktionsfamilien vorerst als abgeschlossen behandeln: die sichtbare `F1-F5`-Oberfläche einschließlich des späten J10-Fortsetzungskorridors einfrieren, breite `9/10`- bzw. Jahrgang-10-Funktionsspuren dort als aufgelöst akzeptieren, wo die Quelle gemischt bleibt, und nur dann wieder öffnen, wenn eine später geprüfte Spur oder ein Validator-Befund eine echte gemeinsame kanonische Lücke jenseits der aktuellen Funktionsoberfläche erzwingt. |
| `SEK1.J10.5D_GEOMETRY` Sek I J10 Körper, Volumina und Plausibilität | `completed` | `DE-BY`, `DE-BW`, `DE-SH` | Den Sek-I-J10-Durchlauf zu Körpern / Volumina / Plausibilität vorerst als abgeschlossen behandeln: die sichtbare `G2-G7`-Oberfläche zusammen mit dem späten J10-Körper- und Plausibilitätskorridor einfrieren, breite Jahrgang-10-Körperbänder dort als aufgelöst akzeptieren, wo die Quelle grob bleibt, und nur dann wieder öffnen, wenn eine später geprüfte Spur oder ein Validator-Befund eine echte gemeinsame kanonische Lücke jenseits der aktuellen Geometrieoberfläche erzwingt. |
| `SEK2.ANALYSIS` Sek II Analysis sowie Integral- und Exponentialvertiefung | `completed` | `DE-HE`, `DE-NW`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-NI`, `DE-SN` | Den Sek-II-Gesamtdurchlauf zur Analysis vorerst als abgeschlossen behandeln: die sichtbare `AN2-AN4`-Oberfläche einfrieren, die Restbestandssteuerung ruhig halten und nur dann wieder öffnen, wenn eine später geprüfte Spur oder ein Validator-Befund eine echte gemeinsame kanonische Lücke erzwingt. |
| `SEK2.GEOMETRY_LINEAR_ALGEBRA` Sek II Geometrie und Lineare Algebra | `completed` | `DE-NW`, `DE-BB`, `DE-BE`, `DE-SH`, `DE-BW`, `DE-BY`, `DE-SN`, `DE-RP` | Den Sek-II-Gesamtdurchlauf zu Geometrie / Linearer Algebra vorerst als abgeschlossen behandeln: die sichtbaren `AGV1-AGV5`- und `LM2-LM5`-Oberflächen einfrieren, breite Überblicksspuren dort als aufgelöst akzeptieren, wo die Quelle auf Korridorebene bleibt, und nur dann wieder öffnen, wenn eine später geprüfte Spur oder ein Validator-Befund eine echte gemeinsame kanonische Lücke erzwingt. |
| `SEK2.STOCHASTICS` Sek II Stochastik | `completed` | `DE-NW`, `DE-BE`, `DE-BB`, `DE-SH`, `DE-NI`, `DE-BW`, `DE-BY`, `DE-SN` | Den Sek-II-Gesamtdurchlauf zur Stochastik vorerst als abgeschlossen behandeln: die sichtbare `ST2-ST5`-Oberfläche samt expliziter `ST3`-Grenze einfrieren und nur dann wieder öffnen, wenn eine später geprüfte Spur oder ein Validator-Befund eine echte gemeinsame kanonische Lücke erzwingt. |
| `SEK1.FOUNDATIONS` Sek I Breite der Mittelstufe | `completed` | `DE-BW`, `DE-BY`, `DE-BE`, `DE-BB`, `DE-NI` | Den bundesweiten Breiten-Durchlauf zur Sekundarstufe I vorerst als abgeschlossen behandeln: alle obersten Sek-I-Zeilen sind einmal aufgelöst; die sichtbaren Oberflächen `A1-A4`, `F1-F5`, `G2-G7` und `D1-D5` einfrieren und die aktive bundesweite Fertigstellungsarbeit auf Applicability, lernendenseitige Scope-Auswahl und `P6/F6`-Cutover-Bereinigung verlagern. |

## Korridor für die Anzahl atomarer Ziele

Hessen (`DE-HE`) ist die Referenzspur. Alle anderen Bundesländer sollen innerhalb von `+-20%` der hessischen Stufenzählwerte liegen.

Operatives Gate: Länder außerhalb des Korridors werden bei `P5` / `subtree_adopted` gedeckelt. Abweichungen auf allen drei Stufen eskalieren auf `active`, Teilabweichungen auf `next_wave`.

| Bundesland | Sek I | Sek II (GK) | Sek II (LK) | Korridor | Detail |
| --- | ---: | ---: | ---: | --- | --- |
| `DE-BW` Baden-Württemberg | `82` | `63` | `73` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-BY` Bayern | `140` | `103` | `115` | `out` | Sek I zu hoch, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-HB` Bremen | `38` | `50` | `57` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-HH` Hamburg | `44` | `20` | `23` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-MV` Mecklenburg-Vorpommern | `42` | `1` | `1` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-RP` Rheinland-Pfalz | `35` | `12` | `15` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-SL` Saarland | `35` | `12` | `15` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-SN` Sachsen | `79` | `2` | `2` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-ST` Sachsen-Anhalt | `1` | `1` | `1` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-TH` Thüringen | `1` | `1` | `1` | `out` | Sek I zu niedrig, Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-BB` Brandenburg | `90` | `78` | `78` | `out` | Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-BE` Berlin | `85` | `141` | `149` | `out` | Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-NI` Niedersachsen | `103` | `91` | `104` | `out` | Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-NW` Nordrhein-Westfalen | `97` | `77` | `90` | `out` | Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-SH` Schleswig-Holstein | `105` | `55` | `55` | `out` | Sek II (GK) zu niedrig, Sek II (LK) zu niedrig |
| `DE-HE` Hessen | `105` | `416` | `483` | `reference` | Referenzspur `Hessen` |

## Programmphasen

| Programmphase | Status |
| --- | --- |
| `F0` Tracking-Grundgerüst | `completed` |
| `F1` Aktive Fünf-Länder-Basis | `completed` |
| `F2` Onboarding der übrigen Quellen | `completed` |
| `F3` Bundesweiter Erstdurchlauf über den ersten Korridor | `completed` |
| `F4` Breite in der Sekundarstufe I | `completed` |
| `F5` Breite in der Sekundarstufe II | `completed` |
| `F6` Umstellung (Cutover) und Pflege | `active` |

## Phasenskala der Bundesländer

| Phase | Score | Bedeutung |
| --- | ---: | --- |
| `P0` Platzhalter | `0%` | Nur README-/Quellenlinks, keine aktive Mathematik-Rollout-Spur. |
| `P1` Quelle archiviert | `15%` | Mathematik-Quellmaterial ist in der bundesweiten DE-Input-Spur archiviert. |
| `P2` Snapshots aktiv | `30%` | Mathematik-Quell-Snapshots und Provenienz sind aktiv. |
| `P3` Strukturanker zugeordnet | `50%` | Kanonische Strukturanker sind auf dem gemeinsamen Rückgrat zugeordnet. |
| `P4` Erster Korridor geprüft | `65%` | Mindestens ein didaktisch geschlossener, geprüfter Korridor ist zugeordnet. |
| `P5` Breite Landesabdeckung | `85%` | Das Land verfügt über eine breite geprüfte Abdeckung entlang des Mathematik-Hauptrückgrats. |
| `P6` Land umstellungsbereit | `100%` | Das Land ist auf der kanonischen Mathematik-Skill-Landschaft operativ einsatzbereit. |

## Länderübersicht

| Bundesland | Operative Phase | Erfasste Phase | Score | Applicability | Mappings | Zählkorridor | Quellstufe | Priorität |
| --- | --- | --- | ---: | --- | ---: | --- | --- | --- |
| `DE-BW` Baden-Württemberg | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `209` | `out` | `subtree_adopted` | `active` |
| `DE-BY` Bayern | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `351` | `out` | `subtree_adopted` | `active` |
| `DE-HB` Bremen | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `68` | `out` | `subtree_adopted` | `active` |
| `DE-HH` Hamburg | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `76` | `out` | `subtree_adopted` | `active` |
| `DE-MV` Mecklenburg-Vorpommern | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `59` | `out` | `subtree_adopted` | `active` |
| `DE-RP` Rheinland-Pfalz | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `65` | `out` | `subtree_adopted` | `active` |
| `DE-SL` Saarland | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `95` | `out` | `subtree_adopted` | `active` |
| `DE-SN` Sachsen | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `130` | `out` | `subtree_adopted` | `active` |
| `DE-ST` Sachsen-Anhalt | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `72` | `out` | `subtree_adopted` | `active` |
| `DE-TH` Thüringen | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `48` | `out` | `subtree_adopted` | `active` |
| `DE-BB` Brandenburg | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `159` | `out` | `subtree_adopted` | `next_wave` |
| `DE-BE` Berlin | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `187` | `out` | `subtree_adopted` | `next_wave` |
| `DE-NI` Niedersachsen | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `218` | `out` | `subtree_adopted` | `next_wave` |
| `DE-NW` Nordrhein-Westfalen | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `167` | `out` | `subtree_adopted` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P5` Breite Landesabdeckung | `P6` Land umstellungsbereit | `85%` | `yes` | `149` | `out` | `subtree_adopted` | `next_wave` |
| `DE-HE` Hessen | `P6` Land umstellungsbereit | `P6` Land umstellungsbereit | `100%` | `yes` | `486` | `reference` | `cutover_ready` | `backlog` |

## Unmittelbare Arbeitsliste

- `DE-BW` (`P5`, `active`): Baden-Württemberg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen. Landesspezifische Behandlung: Den aktiven Qualitätskorridor für Baden-Württemberg ohne Übermapping auflösen: die amtliche BP2016-Quellextraktion als quellenintern abgeschlossen behandeln, die 33 in Hessen abgedeckten, in BW nicht expliziten kanonischen Atome als dokumentierte Ländersicht-Ausschlüsse belassen, sofern spätere Quelle-Evidenz dem nicht widerspricht, die 78 stufenverschobenen Atome über Sek-I-Abschluss/Applicability statt über Kursstufen-Übermapping routen und anschließend die verbleibende lernendenseitige Atomzahl-Lücke über geprüfte Applicability und Composition-View-Scope statt über synthetische BW-Kursstufen-Mappings abgleichen.
- `DE-BY` (`P5`, `active`): Bayern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HB` (`P5`, `active`): Bremen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HH` (`P5`, `active`): Hamburg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-MV` (`P5`, `active`): Mecklenburg-Vorpommern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-RP` (`P5`, `active`): Rheinland-Pfalz auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SL` (`P5`, `active`): Saarland auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SN` (`P5`, `active`): Sachsen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-ST` (`P5`, `active`): Sachsen-Anhalt auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-TH` (`P5`, `active`): Thüringen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BB` (`P5`, `next_wave`): Brandenburg auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BE` (`P5`, `next_wave`): Berlin auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-NI` (`P5`, `next_wave`): Niedersachsen auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-NW` (`P5`, `next_wave`): Nordrhein-Westfalen auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SH` (`P5`, `next_wave`): Schleswig-Holstein auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.

## Nächste Schritte

- `DE-BW`: Baden-Württemberg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen. Landesspezifische Behandlung: Den aktiven Qualitätskorridor für Baden-Württemberg ohne Übermapping auflösen: die amtliche BP2016-Quellextraktion als quellenintern abgeschlossen behandeln, die 33 in Hessen abgedeckten, in BW nicht expliziten kanonischen Atome als dokumentierte Ländersicht-Ausschlüsse belassen, sofern spätere Quelle-Evidenz dem nicht widerspricht, die 78 stufenverschobenen Atome über Sek-I-Abschluss/Applicability statt über Kursstufen-Übermapping routen und anschließend die verbleibende lernendenseitige Atomzahl-Lücke über geprüfte Applicability und Composition-View-Scope statt über synthetische BW-Kursstufen-Mappings abgleichen.
- `DE-BY`: Bayern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HB`: Bremen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HH`: Hamburg auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-MV`: Mecklenburg-Vorpommern auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-RP`: Rheinland-Pfalz auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SL`: Saarland auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SN`: Sachsen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-ST`: Sachsen-Anhalt auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-TH`: Thüringen auf `Sek I`, `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BB`: Brandenburg auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-BE`: Berlin auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-NI`: Niedersachsen auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-NW`: Nordrhein-Westfalen auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-SH`: Schleswig-Holstein auf `Sek II (GK)`, `Sek II (LK)` in den hessischen Korridor für atomare Ziele führen: mit lernendenseitigen Mathematik-Composition-Views und Applicability beginnen und jede verbleibende Lücke anschließend über das kleinste Mapping-/Provenienz-Delta eingrenzen, das die fehlenden sichtbaren Atome erklärt; die Spur nicht als `cutover_ready` behandeln, solange nicht alle Stufenzählwerte innerhalb von `+-20%` von Hessen liegen.
- `DE-HE`: Hessen ausschließlich im Pflegebetrieb halten: vorgehaltene Quell-Snapshots, kanonische Mappings/Provenienz, Applicability und die landesspezifischen Mathematik-Composition-Views gemeinsam aktualisieren, sobald eine Lehrplanrevision den sichtbaren Scope oder die lernendenseitige Baumstruktur verändert.

## Neugenerierung

```bash
python3 scripts/render_canonical_math_bundesland_status.py
```
