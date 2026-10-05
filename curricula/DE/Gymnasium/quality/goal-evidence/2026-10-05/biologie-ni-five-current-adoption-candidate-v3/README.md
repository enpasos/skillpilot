# NI5: inaktive aktuelle Adoptionsvorschau v3

Status: **candidate / ai_candidate**, nach bekannten Autoren- und A/B-v2-Befunden materialisiert. Dies ist keine neue unabhängige Prüfung, keine operative Adoption, keine menschliche Freigabe und keine Book-D2-/V-Freigabe. P-Inhalte wurden nicht gelesen, P-Profile nicht erstellt.

## Materialisierte Basis

368 curricularAtomic-Ziele / 446 kanonische Records; 123 entschiedene Sourcegruppen / tatsächlich 336 Mappingkanten. Alle 363 alten Atomkörper bleiben unverändert. Exakt 115 vollständige alte Source-Records und 117 alte Mappingentscheidungen sind unverändert gebunden. Alle 334 NI3-Kanten bleiben erhalten; FW6-008 erhält zwei zusätzliche **partial**-Kanten, welche gemeinsam die gewählten chromosomalen Rekombinationsprinzipien tragen. Die beiden alten partial-Targets bleiben erhalten.

| Neues Ziel | Prospektive UUID |
|---|---|
| Variation innerhalb einer Art | `359e6313-cd86-54d1-bee5-8e680101dc32` |
| Gene, Genprodukte und Merkmale | `0263fb84-33b1-52a3-a47e-dad56be7c9bc` |
| Erbgleichheit durch Mitose | `36d3bf01-e68b-55be-8e20-5652ada36a51` |
| Unabhängige Chromosomenverteilung | `0b55e592-3335-52e4-8b4f-79c53f32400b` |
| Nichtschwesterchromatid-Abschnittsaustausch | `9e459608-bdea-55a1-b9c5-214bbd741be6` |

Die zwei neuen Rekombinationstexte sind exakt die v2-Templates mit von Root zugeordneten UUIDs. Die Freeses A `743773a49377f95502763c223588cf6fcc29db5da796789b635dd224e536c1e6` und B `5418d5761c7236bfea2cda6e15bcd9f9a0b274a50b757d7b46070d01c0ff5a13` wurden tatsächlich gelesen und gebunden. Vorgaben bleiben korrekt bereitgestellte Chromosomenmodelle; keine eigenständige Modellkonstruktion, molekulare Reparatur oder Formelquote.

## Native Kandidatenprüfungen

- Kanonische Validierung/DAG, geschlossenes Kind-Schema und aktuelle Kind-Fingerprints: PASS; gezielt fünf neue Blätter und zwei contains-geänderte Eltern. Alle übrigen 439 alten Kindentscheidungen bleiben unverändert.
- Native FULL-A: PASS 368 aktuell atomare Records, keine fehlenden/veralteten/obsoleten Records. Die ersten 363 alten Recordbytes sind unverändert.
- Native FULL-M: PASS 360 no-memory / 8 memory-required; 17 erhaltene primäre Karten. Alle 363 alten Recordbytes und alle Kartenbytes sind unverändert. Jede neue Kompetenz hat eine eigene fachliche Begründung.
- Native Source-Atlas-Ableitung: PASS 368 Atome, NI-Union 137, keine unaufgelösten Source-Scope-Entscheidungen. Neue fünf ausschließlich DE-NI/SekI.
- MAPPING-2: sieben Kandidatenchecks PASS. MAPPING-3: fünf PASS, zwei begrenzte HOLDs für vollständige fachliche Source-/Prerequisite-Adoption. 123 mapped Gruppen ersetzen keine normative Abdeckungsprüfung.

Diese Resultate sind Prüfungen inaktiver Snapshots und zählen nicht als operative Gates. Die Kind-Simulation benötigt das native `authoritative`-Feldformat; das äußere Kandidatendossier stellt klar, dass keine aktive Autorität adoptiert wurde.

## NI-View und tatsächliche Runtime-Memorysichtbarkeit

Navigation ergänzt genau fünf IDs. Der NI-Sourceview ergänzt fünf IDs und entfernt genau vier nicht mehr durch NI getragene direkte Targets:

- `02cabf54-0b70-572c-b85a-7409e686a48e`
- `05358518-f66c-5c1b-ad3f-d16211d0fc1c`
- `0daa79f6-8f61-5506-98f9-65db83062ba8`
- `e70d8a85-2dea-5165-919b-200fee9f4db4`

Alle kanonischen Körper und anderen Bundeslandbindungen bleiben erhalten. Vollständige Vorher-Witnesses, nun leere NI-Witnessmengen und native Compilerbefunde stehen in `ni-four-sourceview-removals.evidence.candidate.json`.

Der reine curricularAtomic-Sourceview unter `app/scripts/config/goal-books` ist kein runtime-registrierter Compositionview. Die zusätzliche Buchview-Memoryprobe findet dieselben fünf alten Memoryziele ohne Memoryknoten vor und nach der Änderung; sie begründet keinen neuen Learner-M-HOLD. Tatsächlich registrierte GK- und Sek-I-Views liegen unter `curricula/DE/Gymnasium/composition-views/biologie/`. Beide enthalten vor und nach der Änderung dieselben fünf Ziele sowie Memoryziel `9e51741b-f952-5f62-9b6b-080eee6c5590`, Deck `de_gymnasium_biology_core`. Native Runtime-M-Probes vor/nach: beide exit 0. Siehe `memory-visibility-probe.qualifier.candidate.json`.

## Begrenzter DNA-Scope-HOLD

Die tatsächliche PDF87 wurde erneut visuell gelesen. Ihr Einführungstext weist DNA-Aufbau/Replikation, Proteinbiosynthese und Punktmutation der Sek II zu. Das alte Ziel `0daa79f6-8f61-5506-98f9-65db83062ba8` fordert ausdrücklich Nukleotide, Doppelhelix und Replikation. Es darf nicht als unbemerkt verpflichtende Voraussetzung der betrachteten NI-Sek-I-Aufgaben behandelt werden.

Die native Voraussetzungsermittlung einschließlich vererbter Cluster-requires liefert fünf vollständige Pfade; in diesen fünf Pfaden sind tatsächlich ausschließlich direkte requires-Kanten enthalten:

1. `0db20819-ee94-54c6-8ecb-aff8c9b7419e` → `9dff0360-c2e9-5e43-af8b-87e264281cf7` → `440854be-7f06-5678-91cb-ba8dcab56959` → `0daa79f6-8f61-5506-98f9-65db83062ba8`.
2. `440854be-7f06-5678-91cb-ba8dcab56959` → `0daa79f6-8f61-5506-98f9-65db83062ba8`.
3. `9dff0360-c2e9-5e43-af8b-87e264281cf7` → `440854be-7f06-5678-91cb-ba8dcab56959` → `0daa79f6-8f61-5506-98f9-65db83062ba8`.
4. `9f73b963-5fac-5a90-a993-d7b7c0cc8526` → `ffef97e3-12d6-5090-9816-46ab9e57fae2` → `475eebb4-4eb0-524f-b1ec-4a672bf856d2` → `0daa79f6-8f61-5506-98f9-65db83062ba8`.
5. `ffef97e3-12d6-5090-9816-46ab9e57fae2` → `475eebb4-4eb0-524f-b1ec-4a672bf856d2` → `0daa79f6-8f61-5506-98f9-65db83062ba8`.

Vollständige DE-Texte, Source-Operatoren, geforderte Inhalte und drei enge optionale requires-Deltas stehen in `dna-five-paths.full-source-texts-and-options.candidate.json`. Die optionalen Deltas sind separat DAG-geprüft und beseitigen die ersten drei DNA-Pfade; sie werden **nicht** in die NI5-Basis oder das Adoptionsskript übernommen. Die zwei molekularen Mutation/Evolution-Pfade brauchen einen gezielten Source-Route-Entscheid. Ein technisch gültiges prerequisiteOnly-Modell mit 137 Targets plus DNA als Voraussetzung liegt separat vor; diese Rolle heilt keinen fachlich falschen Kompetenzzwang.

## Betroffene aktuelle 37 strenge Ziele

Exakt fünf aktuelle Kontextfälle sind betroffen; alle 37 Körper und nativen Goal-Evidence-Fingerprints bleiben unverändert:

| ID | Tatsächlicher aktueller Kontextdelta |
|---|---|
| `0dbe758c-73c8-530b-bbbd-fb55540f942f` | Ausgewählter NI-FW6-010-Witness entfällt; zwei andere NI-Witnesses bleiben. |
| `28850d2e-062d-5341-ac66-bd787a8fc84f` | NI-FW6-010/011-Witnesses entfallen; FW4-006 bleibt. |
| `440854be-7f06-5678-91cb-ba8dcab56959` | Vorhandener requires-Pfad endet an DNA ohne NI-Targetnachweis; begrenzte fachliche Prerequisitefrage. |
| `62e52002-b8df-533e-9972-028f3ee60cd1` | Genetikparent enthält vier neue Geschwister. |
| `ec88fc1d-ee0f-5a01-9464-dc358241050e` | FW6-004-Witness entfällt; erhaltene FW6-008-Sourcezelle wird präzisiert. |

Die anderen 32 haben im geprüften Graph-/Source-/Viewkontext keinen materiellen Delta. Globale Modeldigests und Dateipfade ändern sich dennoch; Root muss aktuelle BookModel/PDF-/Dossier-Bindungen und den M6/37-Unterrand bei Integration tatsächlich prüfen. Dieses Dossier zählt keinen neuen Kandidaten als strenges M7-Ziel.

## Reproduzierbare Adoptionshilfe

`python adopt_candidate.py` führt nur einen vollständigen read-only Preflight aus. Der gespeicherte Dry-run ist erfolgreich. Root besitzt eine mögliche spätere Anwendung mit `--apply --acknowledge-candidate-holds`; dieser Modus wurde nicht ausgeführt.

Das Skript prüft Bio-Vorgängerbindungen, bewahrt fremde gemeinsame Registry/Atlas-Felder und ändert den echten NI-Eintrag unter `entries[].landscapeId`. Es archiviert vor einer Entfernung die vollständigen alten Sourcebytes und beide gescannten Mappingreviews unter `quality/source-mapping-history/.../before-source|before-reviews/*.snapshot`, außerhalb `input` und außerhalb literal `/mapping/`. Erst danach materialisiert es jeweils eine `current-five-20261005-v1`-Source/Mapping-Datei, die begrenzten View-/Kind-Deltas und neue FULL-A/M-Nachfolger. Es ist kein crash-atomarer Gesamttransaktionierer; die verifizierten Archive dienen Root als Wiederherstellungspfad.

Root aktualisiert danach die beiden zentralen A/M-Configpointer, klärt die dokumentierten DNA-Scopefragen, bindet und prüft echte neue Modell-PNGs, regeneriert Atlas/Manifest/Projections und aktuelle review BookModel/HTML/PDF. Erst terminale aktuelle Gates können operative Fertigstellung belegen. Source-Pipelineflags bleiben in dieser Kandidatenquelle blockiert. Ein Image-Generatorreceipt oder Platzhalterlink ist keine V-Freigabe.

## Lizenzen

Eigene Kompetenztexte und didaktische Kandidateninhalte: CC-BY-4.0. Technische Prüf-/Adoptionsskripte: Apache-2.0. Amtliche Primärquelle behält ihre eigenen Rechte. Freigaben, Provenienz und Lizenz sind getrennt.
