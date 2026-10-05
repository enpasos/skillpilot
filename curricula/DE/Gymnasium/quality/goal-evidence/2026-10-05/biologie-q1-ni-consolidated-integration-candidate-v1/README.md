# Biologie Q1 + NI: konkrete inaktive Integrationsvorbereitung

**Keine aktive Änderung, kein neuer Fünf-Gate-Abschluss und keine menschliche Freigabe.** Die Originale und alle bisherigen Reviews bleiben unverändert. Das Paket enthält ausführbare, einzeln auswählbare Deltas, zwei tatsächlich erzeugte Materialisierungen und gebundene Quellen-, Bild-, Prüfungs- und Kontextnachweise.

## Direkt weiterführbare Teilintegration

`staged/independent-parts-v1/` materialisiert sechs Einheiten: NI-Variation, NI-Genprodukt/Merkmal, NI-Erbgleichheit, die fachliche Mutation/Rekombination/Selektion-Korrektur bei9f, Q1-Informationsfluss475 und Gel8eb. Drei neue NI-Ziele werden unter ihren bestehenden Eltern ergänzt. Alle433 anderen ursprünglichen kanonischen Datensätze bleiben in diesem Teilstand exakt erhalten. NI besitzt nach der belegten synthetischenFW6-003-Retirement-Kandidatur123 Quellenatome und134 direkt gemappte Ziel-IDs.

Der bei9f verbliebene falsche **autorisierte Quellenparaphrasen-Satz** wird als zusätzliche genaue Ein-Feld-Korrektur in `he-evolution-source-description.required-followup.delta.candidate.json` bereitgestellt. Root muss diese Korrektur vor Adoption des versionierten HE-Quellennachfolgers anwenden. Die tatsächliche amtliche HE-Quelle nennt Rekombination/Mutation; die Selektion bleibt bestehender didaktischer Zielumfang, ohne diese einzelne Quellenzeile als vollständigen Pflichtnachweis auszugeben.

Die sechs Einheiten sind Kandidaten für gezielte Integration und die anschließende aktuelle Buchprüfung. D/P/A/M/V bleiben bis zur korrekten aktuellen Nachweisführung offen. Der9f-Bildnachweis fehlt weiterhin.

## Vier erhaltene Integrations-Holds

| Einheit | Konkretes Hindernis vor engerer aktiver Fassung |
|---|---|
| DNA0daa | Amtliches HE verlangt semikonservative Replikation. e70 bleibt erhalten, wird als HE-GK/LK-Quellentarget vorgeschlagen, hat aber aktuell wederP nochV; ausdrückliche semikonservative Kompetenz und echte HE-SekII-Voraussetzungs-/Zielerreichbarkeit müssen belegt werden. |
| Mutationffef | BY verlangt zusätzlich Mutagene, Proteinfunktion und Schutz. Weitere Sek-I-Kontexte müssen ihre eigenen Grenzen behalten. NI-Molekularzuordnungen entfallen nur zusammen mit der getrennten NI-Erhaltung. |
| TF946 + Methylierung | HE-GK/LK-Pflicht ist konkret geteilt. Die ursprüngliche BY-Anforderung und die BY-Erreichbarkeit der vorhandenen Prüfung3ac1 sind durch einen HE-only-Begleiter noch nicht bewiesen. |
| Bakterium5b + Zweiteilung | SN verlangt ausdrücklich Vermehrung; weitere nicht-HE-Zuordnungen bleiben einzeln zu klären. Ein HE-LK-Begleiter erlaubt noch keine globale Verengung auf Zellbau. Keine Kurs-/Altersanforderung aus fehlendenPhasen ableiten. |

`staged/full-held-proposal-v1/` enthält das gesamte vorgeschlagene Delta einschließlich dieser vier **weiterhin blockierten** Einheiten. Es ist keine pauschale Integrationsfreigabe. Dort bleiben425 andere ursprüngliche kanonische Datensätze exakt erhalten. Beide Materialisierungen bewahren die originalen Eltern und alle ursprünglichen Kinder; e70/1d/995 bleiben unverändert.

## Zwei echte Split-Begleiter

Namensraum: `fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb`; UUIDv5-Seed: `biology:08a43a1b-d97e-522c-9dfa-c950a493364e:<candidateKey>`.

- DNA-Methylierung: `ff5bb904-e1bf-58f1-9752-feda6fdd61f1`, bisher belegtHEQ1.2 GK/LK.
- Bakterielle Zweiteilung: `df92a3a1-0a32-5516-9d7b-66947e90a0e4`, bisher belegtHEQ1.2 LK.

Die UUIDs kollidieren aktuell nicht. Die Begleiter werden unter dem beibehaltenen Q1.2-Elternknoten ergänzt; nationale Navigation benötigt ihre konkreten UUID-Einträge. Ihre tatsächlichen PNGs sind inzwischen unabhängig nativ/360/680 **PASS als Kandidaten**. Dies hebt keinen Quellen-/Prüfungs-Hold auf.

## Prüfung3ac1 und Bilder

Die additive Prüfungsänderung behält946 und475 und ergänzt den Methylierungsbegleiter in `requires` und `coveredGoalIds`. Sie qualifiziert die Methylierungswirkung auf das gegebene Modell, berichtigt die unzulässige Eintrittsraten-Folgerung aus einer S-Phasen-Momentaufnahme und korrigiert7→8BE für Aufgabe1, sodass die Schritte30BE ergeben. Der neue Prüfungsstand ist `draft` und braucht gezielte Prüfungs-QS; der ursprüngliche `released`-Datensatz ist erhalten. Seine bestehende BY+HE-Sichtbarkeit wird nicht still eingeschränkt.

`visual-assets.integration.delta.candidates.json` bindet elf tatsächliche PNG-Kandidaten, die elf unabhängigen Kandidatenentscheidungen bzw. den bestehenden gültigenffef-v2-Review, konkrete Alttexte und genaue Kopierpfade für Quelle/Frontend/Backend. Bei ffef sind vorgeschlageneDE/EN-Texte und Bildhash unverändert zur vorhandenen unabhängigen Prüfung; deshalb wird diese gültige Bildprüfung erhalten. Aktive primäre Links, aktuelle maschinelleV-Registry und menschliche Entscheidungen werden hier nicht geschrieben. e70/9f haben weiterhin keine vorgeschlagenen geprüften Bilder.

## Ausführbare Materialisierung

Aus Repositorywurzel, ausschließlich in einen **neuen** Unterordner dieses Pakets:

```bash
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-ni-consolidated-integration-candidate-v1/materialize_inactive_candidates.py --units ni-variation,ni-gene-product-trait,ni-mitotic-identity,ni-evolution-causal-correction,q1-protein-information-flow,q1-gel-analysis --output-name weiterer-inaktiver-stand
```

Der Materialisierer prüft genaue aktuelle betroffene Datensätze und Quellenhashes, stabile IDs, `requires`-/`contains`-DAGs, Ziel-/Quellen-ID-Konsistenz und doppelte Navigation. Er schreibt ausschließlich in dieses Paket. Blockierte Einheiten verlangen das ausdrückliche Argument `--include-held`, das nur eine **inaktive** Darstellung ermöglicht. Bei Teilintegration wird die NI-Zielmenge aus allen verbleibenden Mappingzeilen neu berechnet; keine pauschale Entfernung von Zielen aus nicht gewählten Einheiten.

## Nächster operativer Schritt für Root

1. Geeignete Einheiten gezielt integrieren, versionierte Quellen-/Mappingnachfolger erstellen und die präzise HE9f-Quellenparaphrasen-Korrektur anwenden. Alte Quellen-/Mapping-/Retirement-/Reviewartefakte unverändert bewahren.
2. Neue semantische Klassifikationen und echte atomare/Memory-Entscheidungen begründen; vorhandene gültige Karten erhalten und tatsächlich erforderliche Ziel-/Voraussetzungs-Sichtbarkeit prüfen. Prospektiv366 aktuellecurricularAtomic-Ziele für den sechsfachen Teilstand bzw.368 für alle Einheiten; dies sind Zielmengen, keine Abschlüsse.
3. Exakte geprüfte Bilder nach Bildplan importieren und Quellenatlas neu erzeugen. Die vorbereiteten inaktiven Inputs sind Datenvorschläge; der aktive semantische Ledger enthält die neuen IDs noch nicht und wird hier nicht autoritativ ergänzt.
4. Aktuelles Biologie-Buch/PDF und gezieltes Review-Bundle nur für betroffene Ziele/Seiten/Kontexte/Quellen/Bildbindungen erstellen. Zwei voneinander unabhängige aktuelle D-Runden mit aufgelösten Befunden **vor P** frieren. Danach die genau gebundenen neuesten innerenP-Nachfolger prüfen und aktuelle äußere Bindungen wahrheitsgemäß materialisieren.
5. Betroffene A/M/V- und Layer-A-Prüfungen bündeln. Vollständigen zentralen Bericht/Build erst am stabilen Integrationsstand durch Root durchführen. Ungeprüfte Kandidaten und offene Grenzfälle bleiben ungeschlossen.

`targeted-materialization-and-preservation.check.receipt.json` enthält den bestandenen gezielten Vorbereitungslauf. Mathematik-/Physik-Registrydatensätze und ihre geschützten Reifegrade wurden unverändert erhalten. **Strenger Nettozuwachs dieses Pakets:0; neue fachliche Abschlüsse:0; wiederhergestellte aktive Bindungen:0.**
