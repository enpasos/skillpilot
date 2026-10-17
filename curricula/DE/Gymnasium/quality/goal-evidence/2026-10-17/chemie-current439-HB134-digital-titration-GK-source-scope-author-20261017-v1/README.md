# HB134: inaktiver Quellen- und Kursplatzierungsvorschlag

AUTHOR pending; E1/G1, ai_candidate / needs_human_review. Keine Freigabe, kein aktiver Schreibzugriff, kein Build.

## Konkreter Vorschlag

Bestehendes Goal `e0944fbb-0761-5f9c-afaa-3d4713ed1bed` und das ganze unveränderte operative-v3-P wiederverwenden. Nur `GK` additiv an dessen bisherige Tags anhängen. Den ganzen Goaltext, alte Leistungsanforderungen, Materialien und prerequisites erhalten. HB134 belegt den gemeinsamen GK/LK-Prozess; PDF23 und PDF37 wurden aus der gepinnten lokalen offiziellen PDF tatsächlich gelesen. Der Plan wird durch vier partielle Komponenten getragen: selbstständige Untersuchung, Titrationsplanung, tatsächliche pH-Kurve mit eigener digitaler Auswertung und quantitative hypothesenbezogene Dateninterpretation.

`PATCH.HB134.scope-and-composition.pending.json` enthält alle genauen Basis-Pins, Felder, Referenzen und additiven Operationen. Die sechs `CANDIDATE.*.view.json` sind vollständige inaktive Ansichtsnachfolger; nach final C muss der Root anhand stabiler IDs deduplizieren, nicht diese alten ganzen Views über neuere C-Änderungen kopieren.

## Begrenzung auf HB

Der Standardcompiler kompiliert ausschließlich Jurisdiktion (`applicabilityCompiler.ts`, Konstante `SUPPORTED_DIMENSION` und direkte mapping-Evidenz). Er kann DE-HB aus den direkten HB-Mappings gewinnen. Der Kursfilter wertet GK/LK separat und global aus (`goalFilters.ts`). Deshalb ist ein bloßes GK-Tag unzureichend: es würde das Goal auch in bestehende breite HE- und nationale GK-Unterbäume bringen. Vier direkte `prerequisiteOnly`-Referenzen in genau diesen bestehenden Ansichten überschreiben die geerbte target-Rolle und erhalten die bisherige Zielgrenze. HB GK und HB LK erhalten je einen sichtbaren target-Verweis pro bislang fehlendem Source134-Träger.

Kein Zusatzgoal, keine Runtime-Ausnahme, kein neuer Quotenauftrag. Ein globaler Kursfilter ohne ausgewählte unterstützte Kompositionssicht kann die Kombination BY/HE/NI + GK weiterhin technisch zulassen. Das bedeutet keine amtliche GK-Freigabe dieser Länder; dieser Weg ist kein zugesicherter Bestandteil des Vorschlags. Root muss die tatsächliche Ansichtsauflösung und die Nicht-HB-Zielmengen nach final C normal prüfen. Tag und sechs View-Deltas sind eine gemeinsame Integrationsmenge, kein einzeln freigebbarer Tagfix.

## Getrennte fehlende HB-Jurisdiktionen

16b24dc5 und 9e3fae29 haben bereits GK/LK. Hier ist kein GK-Fix vorgeschlagen. Fehlendes DE-HB in ihrer bisherigen kompilierten Liste wird nicht durch einen blinden Tag ersetzt: heutige direkte HB-Quellenmappings können die normale Compilation tragen. 9e3 ist HB134-Komponente; 16b betrifft andere bereits beauftragte Quellen und bleibt außerhalb dieses Patchumfangs.

## Noch ausstehend

Zusammenführung mit final C, normale gezielte Projektion/Kurs/Role/Scope-Prüfungen und unabhängige Kurs-/Quellen-/D-Kontextprüfung. Der beiliegende begrenzte Technikbefund ist keine Fach- oder Kursfreigabe und belegt keine tatsächliche Lernendenleistung. Eigenes Laborpaket und Bio-B-FIRST bleiben eingefroren.
