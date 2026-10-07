# Chemie B007: unabhängige Quellenprüfung B und native Routenbefunde v3

**Sieben begrenzte Quellen-/Textbefunde KEEP; native Routen REVISE; aktive Integration BLOCK bis gezieltem Follow-up.** Diese Stufe ist keine native D/P/A/M/V-Freigabe und keine M7-Erweiterung. Nettozuwachs 0, wiederhergestellte Bindungen 0; aktive Chemie 112/378 bleibt geschützt. Menschliche Freigabe/Erprobung bleiben offen.

## Tatsächlich geprüfte Eingänge

- Autor-Freeze `native-source-preparation-author-v3.final.freeze.json`, SHA256 `eacf8f185662b53414e77e3e7fa23aab9091e21b24fd335d026768ad6ed84f3a`: alle 31 eingefrorenen Paketdateien bytegenau geprüft. Keine A-Reviewdatei gelesen.
- Alle sieben aktuellen vollständigen DE/EN-Texte und ihre tatsächlichen UUIDs gelesen; UUID-v5-Bindungen unabhängig berechnet. Vier direkte Bestandsziel-Vorschläge getrennt geprüft.
- Originale lokale PDF-Seiten HE physisch 8/12/13, gedruckt 7/11/12, und NI physisch/gedruckt 51 als Text und tatsächlich als Seitenbilder gelesen. Eigenständige Seitenkopien liegen unter `sources/`.
- Unveränderte gültige eigene B-Fachprüfung der sieben Texte, 14 vollständigen Fälle und zwei kompakten Karten wiederverwendet. Die tatsächlichen Materialdateien, vollständigen Fall-/Kartenwerte und neuen UUID-/Origin-Bindungen wurden erneut exakt abgeglichen. Das ist keine neue native P/M-Freigabe.
- Alle 62 ursprünglichen Quellen-/Mappingdateien aus dem früheren Quellen-Snapshot bytegenau erhalten; 403 Originalquellenpflichten/413 Mappingzeilen bleiben offen.

## Sieben begrenzte KEEP

HE8.1, Gymnasium G9, SekI, Jahrgang 8, ohne amtliche GK/LK-Kursstufe: Kennzeichnung, Schutzmaßnahmen, Entsorgung, angeleitete Lösungsherstellung, Massenanteil und Volumenanteil beziehen sich jeweils auf einen benannten Pflichtaspekt, niemals auf die ganze Quellenzeile.

Quantitative Löslichkeit/Sättigung ist ausschließlich mit der **fakultativen** Fortsetzung HE8.1, physisch13/gedruckt12, unter `Temperaturabhängigkeit der Löslichkeit` verbunden. Numerische Restkapazität ist eine begrenzte didaktische Operationalisierung. NI5/6 auf Seite51 belegt qualitative Stoffeigenschaften und angeleitete Untersuchungen; daraus folgt keine quantitative Sättigungs- oder Anteilsverpflichtung. Ganze Originalquellen und andere Länder/Schuljahre werden nicht freigegeben.

Einzelurteile, Atomarität und sieben Memory-Entscheidungen stehen in `independent-b.source-science-and-native-route.review.json`.

## Tatsächliche native Reproduktion

Unveränderte Produktionshelfer `prepareLandscapeEntries`, `loadGoalBookBuildInputs`, kanonischer Validator und Composition-Compiler tatsächlich ausgeführt. Reine BookModels ergeben 378 → 382 Seiten bei 485 Kandidatenknoten und zwei bisherigen Atomen als Cluster. Alle drei vollständigen Modelle entsprechen den Autorenmodellen in ihren tatsächlichen geparsten Werten. Requires/Contains-DAGs bestehen. Kein Fullbuild, keine PDF-Erzeugung und kein Runtime-Frontiertest.

`all112-native-effective-requires-and-exact-contexts.independent-b.actual.json` enthält **alle 112** vollständigen direct/effective/inherited Requires, Objekt-/Goal-/Pagebindungen und sämtliche nativen Contains-Elternketten für Basis, Kandidat und Vier-Vorschlagsvariante. Die 112 Bestandsobjekte und Goal-Fingerprints bleiben im Basiskandidaten exakt. Im Vier-Vorschlagskandidaten bleiben 108 ganze Objekte exakt, aber weiterhin alle112 Goal-Fingerprints: Fingerprintgleichheit schützt hier die Requires-Semantik nicht.

Sechs echte gerenderte Kontextdeltas (ohne reine Pagination) bestehen in beiden Kandidaten:

- `018bec90-445f-4a88-b8bc-228f8335dee6`
- `13d4f336-ab16-54a7-9479-c920b458f385`
- `326d45bf-9f77-57d5-a054-93e76b034dd5`
- `5338b54c-68bc-5892-907c-e025351ffde6`
- `d2ccd1d5-56f7-583f-9724-e97441367f91`
- `ebaae4f5-cc13-5493-98b1-10e1abeb638f`

## Konkretes Routen-REVISE

Vier geschützte Ziele erben in der Vier-Vorschlagsvariante weiterhin `53fd1bfd-facb-54ae-b2dc-f667ed1414fc`:

| Ziel | Kompetenz |
| --- | --- |
| `988888bb-1f88-55f9-9a44-f3f60469a297` | Aggregatzustände mit dem Teilchenmodell |
| `5338b54c-68bc-5892-907c-e025351ffde6` | Lösungsvorgänge mit dem Teilchenmodell |
| `5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf` | Diffusion/Brownsche Bewegung |
| `78109f6d-c415-52c4-8314-07c0dd888a80` | Stoff-/Teilchenebene |

Alle vier liegen unter `10ce2814-8796-5633-9bed-f6990d039b91` (Requires: `326d45bf...` und `53fd1bfd...`), dann `3588c15e-adbe-5b81-b3a7-10da20574e3d`, dann `442c31c5-c561-5c7a-90bb-2335d779175c`. Bei `5338b54c...` ändert der direkte Fix die native effektive Voraussetzungsmenge überhaupt nicht. Der Autorenanspruch, das Risiko sei für alle vier direkten Verbraucher beseitigt, trifft damit nicht zu.

Weitere direkte Verbraucher bleiben `5abc5961...`, `f1ed86f0...` und der genannte Cluster `10ce2814...`. Der aufgespaltene Lösungscluster enthält jetzt vier GK-markierte Kinder einschließlich fakultativer quantitativer Sättigung und beider Anteilsroutinen. Der tatsächlich gelesene Backend-Code nimmt für Cluster-Voraussetzungen das Minimum der GK-Kinder; `core:false` allein entfernt die fakultative Sättigung nicht. Drei zusätzlich geerbte Bestandsblatt-Kontexte wirken im Buch äußerlich gleich, während ihre Cluster-Child-Verpflichtung verändert wird.

Diese strukturelle Gefahr ist eine belegte Code-Inferenz. Bei angewandter Composition kann der Backend-Code geerbte Voraussetzungen ignorieren, die weder als Target noch als prerequisiteOnly ausdrücklich erreicht sind. Es wird keine ausgeführte Runtime-Blockade in jedem Scope behauptet.

40 bestehende Quellenansichten wurden tatsächlich mit dem unveränderten Compiler gegengeprüft: **72 CPV-009** wegen Clusterreferenzen als `goalEntry`. Eine automatische Erweiterung ihrer breiten Referenzen auf alle neuen Routinen wäre fachlich unbelegt. Die einzelne prospektive HE8-Reviewansicht kompiliert, schließt aber diese nationalen Ansichten oder die 403 Quellenpflichten nicht.

## Eingangsdrift und Grenzen

AGENTS.md unterscheidet sich vom historischen Autoren-Input: eingefroren `b70ecef6...`, tatsächlich aktuell `ed7f0ca3...`. Der historische Freeze bleibt unverändert; die aktuelle tatsächliche Datei ist separat gebunden. Dieser Instruktionsdrift wird nicht als fachliche Text-/Material-/Quellenänderung ausgegeben. Keine Behauptung, alle historischen Eingänge seien unverändert.

Offen bleiben die gezielte Routen-/Quellenansichtkorrektur, tatsächliche betroffene D/P-Kontexte, native A/M/V-Bindungen und der zentrale Abschluss durch Root. Keine aktive Datei, historischen Artefakte, Tests/Gates oder Git-Operationen geändert.
