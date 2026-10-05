# Unabhängige NI-Erhaltungsprüfung A

5. Oktober 2026. **Inaktive Kandidatenprüfung; keine aktuelle D/P/A/M/V-Freigabe, kein strenger Abschluss und keine menschliche Freigabe.**

## Reihenfolge und tatsächliche Grundlage

Die drei DE/EN-Lernzielbeschreibungen, Voraussetzungen, sechs Quellenzellen, Mappingdeltas und Quellenstilllegungsbefunde wurden zuerst unabhängig geprüft. Die Beschreibungsphase wurde in `description-phase-a.freeze.json` eingefroren, bevor die Inhalte von `positive-evidence.candidates.json` gelesen wurden. Kein Schwesterreview B und keine Bildprompts wurden gelesen. Danach wurden alle drei vollständigen Innenprofile und alle sechs frischen DE/EN-Fälle tatsächlich gelesen und fachlich geprüft.

Die vorhandene amtliche NI-PDF wurde auf den gedruckten Seiten 87–90 als eigener Textauszug und als tatsächliche Tabellenbilder betrachtet. Die aktuelle amtliche PDF wurde zusätzlich live gelesen: [NIBIS, Kerncurriculum Naturwissenschaften Gymnasium 2015](https://cuvo.nibis.de/index.php?p=download&upload=18). Der separate rohe Download antwortete mit HTTP 403; eine aktuelle Bytegleichheit wird daher nicht behauptet. Der vorhandene PDF-Hash steht im eingefrorenen Beleg.

`exact-before-verification.receipt.json` bestätigt die aktuellen Vorwerte aller sechs benannten Quellen- und Mappingzeilen, fünf kanonischen Ziel-Snapshots, zwei gekoppelten Quellenbefunde und beiden UUIDv5-Vorschläge. `source-boundary-verification.receipt.json` wurde mit dem tatsächlichen Repository-Helfer `sourceAtlasDescendants` erzeugt: beide neuen Atome sind direkt bindbar und gegenüber den breiten Eltern- und Wurzelbindungen abgegrenzt; `requires` und `contains` bleiben im Kandidaten DAGs. Die Klasse-6-Voraussetzung enthält ausschließlich die vorhandene Orientierung. Eine aktuelle jahrgangsbezogene Runtime-Sicht oder Frontier wurde nicht als bestanden ausgegeben.

## Ergebnisse

| Ziel | Beschreibung und Quelle | P-Profil |
|---|---|---|
| `359e6313-cd86-54d1-bee5-8e680101dc32` | **REVISE:** Die fachliche Grundidee stimmt. Das operative Erläutern der ungerichteten Variation zwischen Generationen sollte die ausdrückliche Anforderung FW7-002 erhalten. | **REVISE:** Beim Bohnenfall beweisen lediglich unterschiedliche Nachkommenlängen nicht, dass nicht alle Hülsen länger als bei den Eltern sind. Der Schneckenfall ist stimmig. |
| `0263fb84-33b1-52a3-a47e-dad56be7c9bc` | **PASS als Kandidat:** ein kohärentes Gen→Genprodukt→Merkmal-Modell ohne Molekulargenetik, keine Ein-Gen-ein-Merkmal-Behauptung. | **PASS als Kandidat:** eigene positive Zusammenhangsdarstellung und frischer Transfer auf Produktfunktion und weitere notwendige Bedingungen. |
| `9f73b963-5fac-5a90-a993-d7b7c0cc8526` | **PASS als Kandidat:** Mutation/Rekombination erzeugen neue Varianten/Kombinationen; Selektion wirkt auf vorhandene Variation. Die neue Voraussetzung führt nicht über die molekulare Mutationsklassifikation. | **PASS als Kandidat:** Ursprünge und selektive Verbreitung werden getrennt; die Umweltumkehr und offene Vorteilsaussage verlangen Transfer. Mutationszuordnung gilt nur für das ausdrücklich dokumentierte neue erbliche Modellereignis. |

Minimale Klasse-6-Textkorrektur: „Die lernende Person kann Unterschiede zwischen Individuen derselben Art an Beispielen beschreiben und erläutern, dass solche Unterschiede von Generation zu Generation ungerichtet auftreten.“ Der zugehörige EN-Vorschlag steht in der eingefrorenen Phase. Für den Bohnenfall sind ausdrücklich **kürzere, mittellange und längere** Nachkommenhülsen anzugeben, oder die erwartete Schlussfolgerung ist entsprechend auf den unbelegten zielgerichteten Grund zu begrenzen. Die Datenkorrektur erhält den vorgesehenen Fall.

Die tabellarischen Altersgrenzen sind korrekt getrennt: FW7-001/002 Ende Klasse 6; FW7-003/012 sowie FW6-010/011 Ende Klasse 10. Das Molekulargenetik-Verbot bei FW7-003 ist korrekt wiederhergestellt. FW6-010/011 stehen auf Seite 88; FW7-012 auf Seite 90. Eine einzelne `partial`-Zeile ist kein Vollbeleg; die benannten Quellenunionen sind erforderlich. **Die tatsächliche Überschrift FW6.3 heißt „Ausprägung der genetischen Information“; die vorgeschlagenen Extraktions-/Mappingüberschriften und Spanbezeichnungen „Realisierung genetischer Information“ sind gezielt zu korrigieren.**

## Offene Erhaltung der Mitoseanforderung

Die Stilllegung des synthetischen FW6-003 ist sachlich richtig: Replikation steht im Einleitungskontext, nicht als Tabellenkompetenz; molekulare Vertiefung ist ausdrücklich der Sekundarstufe II zugeordnet. Historischer Quellenatom, Mapping, kanonisches Replikationsziel und gültige Quellen anderer Länder bleiben erhalten.

**FW6-004 bleibt offen.** Die Quelle verlangt eine Begründung der Erbgleichheit von Körperzellen durch Mitose. Die aktuelle Beschreibung `1d2b1038` nennt das Beschreiben von Mitose, vereinfachter Meiose und Keimzellbildung, aber keine solche Begründung. Das molekulare Replikationsziel `e70` und der darüber vorausgesetzte Zellzyklus `053` schließen diese Lücke nicht durch ihre Bezeichnungen.

Minimaler nächster Schritt: nur das bestehende Mitose/Meiose-Ziel gezielt hinsichtlich einer operativen, nichtmolekularen Chromosomenmodell-Begründung prüfen und ergänzen, mit tatsächlichen P-Fällen zur Kopienverteilung und genetischen Information. Die Frage der semantischen Atomarität dieses kombinierten Ziels muss dabei erneut fachlich entschieden werden. Falls die Begründung zwei unabhängig prüfbare Ziele bestätigt, ist der betroffene Verbund tatsächlich in Mitose/Erbgleichheit und Meiose/Keimzellbildung zu teilen. Die Quellenanforderung darf weder durch bloßes Löschen des unpassenden Replikationsmappings noch durch Umbenennung als erfüllt gelten. Nachfolger für Quelle, Mapping und Sicht müssen zusammenpassen.

## Grenzen

Die vorgeschlagene NI-Quellensicht korrigiert nur die sechs ausgewiesenen Bindungen. Die zusätzlich vorgeschlagene Replikationsstilllegung und verbleibende molekulare Voraussetzungspfade sind darin noch nicht vollständig integriert. Die beiden neuen Atome besitzen nur belegte direkte NI-Bindungen; es wird keine Quellenautorität anderer Länder durch breite Elternzuordnungen behauptet. Vor einer Aktivierung fehlen die gezielten Nachfolgerkorrekturen, die offene Mitoseerhaltung und die tatsächliche Alters-/Voraussetzungssichtprüfung.

**Neue fachliche Abschlüsse: 0. Wiederhergestellte strenge Bindungen: 0.**

Entwicklerdokument und Prüfschnittstellen: Apache-2.0. Eigene didaktische Vorschläge: CC-BY-4.0. Rechte der amtlichen Quellen bleiben separat.
