# Biologie E.3: zwei vorhandene Ziele fachlich trennen – Kandidat v1

Stand: 2026-10-01. **Nur ein Integrationskandidat.** Weder kanonische Ziele noch aktive M7-Registry, Source-Atlas oder historische Review-Artefakte wurden für diesen Vorschlag geändert. Er begründet keine D/P/A/M/V-Freigabe und keine menschliche Abnahme. Eigene Lernzieltexte: CC-BY-4.0 gemäß `LICENSING.md`.

## Quellenbefund und Entscheidung

Das [amtliche hessische KCGO Biologie, Ausgabe 2024, Stand 01.08.2025, E.3, gedruckte S. 36](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf#page=36) nennt als **getrennte** vierte und fünfte Inhaltsangabe „von der Befruchtung zur Blastocyste (Übersicht)“ und „embryonale Schädigungen (zum Beispiel Röteln, Contergan, Alkohol)“. Die zweite Angabe ist keine Unterphase der ersten. Aus ihr folgt auch keine Pflicht, alle drei Beispiele in einem einzigen Lernziel zu beherrschen.

Die aktuelle kanonische Beschreibung von `2517be3f-e42f-5e41-889d-70f00dc24686` verbindet Entwicklungsübersicht und unbestimmte „Störungen“. Daneben existiert bereits `c5435624-7b6a-5330-b8cc-0d3186e19911`, das die Übersicht nochmals verlangt und mit teratogenen Einflüssen kombiniert. **Beide vorhandenen IDs reichen für die beiden amtlichen Inhalte aus; ein drittes Ziel würde die Doppelung verstärken.** Das Elterncluster `7d2d7ce7-57da-5f50-81f4-9fa53ae839f8` enthält schon beide IDs. Die bisherige `curricularAtomic`-Einstufung für beide ist nur die aktuelle Klassifikation, kein Nachweis der fachlichen Atomarität ihrer jetzigen Texte.

Die zwei unabhängigen D-Reviews des E12-v2-Buchs entschieden für `2517be3f` jeweils `split_review` und nannten die getrennten Nachweise sowie das Risiko einer falschen Beschränkung embryonaler Schädigungen auf die Blastocystenphase. Ihre unterschiedlichen Begründungen führten im Dual Summary zu `requiresSynthesis: true`; sie bestätigen **keinen** neuen Text. Für `c5435624` fand ich in der aktuellen Biologie-D-Kampagne keine eigene A/B-Seite. Die ältere semantische Atomaritätszeile mit `atomic` und die ältere Memory-Entscheidung `no_memory_needed` für beide IDs stammen aus der Zeit vor dieser fachlichen Entflechtung.

## Konkreter Textkandidat

| Feld | Ziel 1: Entwicklungsübersicht | Ziel 2: Schädigungen |
| --- | --- | --- |
| ID | `2517be3f-e42f-5e41-889d-70f00dc24686` (behalten) | `c5435624-7b6a-5330-b8cc-0d3186e19911` (behalten) |
| Titel DE | Frühe Embryonalentwicklung skizzieren | Embryonale Schädigungen am Fallbeispiel erläutern |
| Titel EN | Sketch early embryonic development | Explain embryonic harm using a case example |
| Beschreibung DE | Die lernende Person kann Befruchtung, frühe Zellteilungen und die Entstehung der Blastocyste in einer einfachen Entwicklungsübersicht in die richtige Reihenfolge bringen und die Abfolge erläutern. | Die lernende Person kann an einem dokumentierten Fallbeispiel eine mögliche embryonale Schädigung anhand vorgegebener Befunde erklären und den Zeitpunkt der Einwirkung passend einordnen. |
| Beschreibung EN | The learner can place fertilization, early cell divisions and blastocyst formation in the correct order in a simple developmental overview and explain the sequence. | The learner can use a documented case to explain possible harm to embryonic development from supplied evidence and place the exposure in the appropriate developmental period. |
| Quellanker | HE E.3, S. 36, vierter Inhaltsstrich | HE E.3, S. 36, fünfter Inhaltsstrich |

Die Formulierung des ersten Ziels bleibt beim verlangten Überblick. Sie fordert weder genaue Tageszahlen noch Implantationsdetails. Das zweite Ziel verwendet ein belegtes Fallmaterial, dessen Befunde und Zeitpunkt angegeben sind. Es fordert keine Diagnose, keine individuelle Gesundheitsberatung und keine pauschale Aussage, dass Röteln, Thalidomid/Contergan oder Alkohol nur vor der Blastocyste wirken. In der EN-Fassung wird „possible harm“ wie im DE-Text an Befunde gebunden; kein Schadenseintritt wird aus einer bloßen Exposition garantiert.

### Nachweisgrenzen für P und Aufgaben

- **Ziel 1:** Eine neue, schematische Stadienfolge ordnen und eine vertauschte Abfolge begründet berichtigen. Die Aufgabe prüft die Übersicht, nicht Teratogene oder Chromosomenmutation.
- **Ziel 2:** Bei einem materialgestützten Beispiel einen möglichen Zusammenhang von Einwirkung und Schädigung mit den vorgegebenen Befunden und dem angegebenen Entwicklungszeitraum erläutern; aus fehlenden Angaben keine sichere Schädigung ableiten. Eine zweite Aufgabe darf einen anders gelagerten, dokumentierten Fall nutzen. Die Aufgabe prüft nicht erneut die ganze Reihenfolge bis zur Blastocyste.
- Beide P-Profile brauchen eigene positive Verständnisnachweise, unabhängige fachliche Prüfung und aktuelle Fingerprints. Die A/B-`split_review`-Texte sind dafür nur Befundmaterial.

## Bindungen, die vor kanonischer Aktivierung zu prüfen sind

1. **HE-Quelle und Mapping:** Die lokale `DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json` paraphrasiert den amtlichen E.3-Inhalt doppelt und in anderer Reihenfolge: `E.3.3` (`8d8be51a-2d23-4bc1-a5cc-647a38709723`) verbindet Blastocyste mit „Störungen“, `E.3.5` (`167dcf2e-04b3-4de0-b386-ddce6ed47112`) wiederholt die Blastocyste neben teratogenen Einflüssen. Die derzeitigen **exakten** 1:1-Mappings auf die beiden kanonischen IDs können nach der Texttrennung nicht unverändert als exakte Quellenabdeckung gelten. Eine neue versionierte amtliche Quellenbindung muss die zwei echten E.3-Inhaltsstriche auf S. 36 einzeln belegen, die alten Extraction-IDs als Paraphrasen kennzeichnen und die Mapping-Entscheidungen mit zutreffendem `matchType` neu bewerten. Die alten Source-Extraction-/Mapping-Dateien und Review-Bundles bleiben als Historie erhalten.
2. **Andere Länder und Projektionen:** Direkte Mappings für Ziel 1 liegen außer HE in BB, BE, BW, NW und SH; für Ziel 2 in BB, BE, BW und NW. Die BW-Extraction trennt Befruchtung/Embryo (`FE-001`) und Schwangerschaft/äußere Einflüsse (`FE-002`) bereits; beide Bindungen sind dort `partial`. Die breiteren BB/BE/NW-Quellziele sowie SHs Reproduktionsrahmen belegen die jetzt engeren Einzelleistungen nicht automatisch. Die kanonischen `applicability`-Listen enthalten außerdem BY; für diese beiden IDs fand ich kein direktes BY-Mapping im gescannten Mapping-Review. Vor Übernahme müssen Source-Atlas-Inputs, die HE-GK/LK-Views und alle betroffenen Sek-I-Views gegen den genauen neuen Text und das jeweilige Alter/Level geprüft werden. Eine unmapped oder nur indirekt sichtbare Region darf nicht durch den HE-Text gerechtfertigt werden.
3. **Didaktische Kanten:** Ziel 1 erfordert derzeit die freie Trisomie 21 (`0dd8380d`), Ziel 2 die Geschlechtsfestlegung (`37147890`). Für die getrennten Leistungen sind diese beiden Abhängigkeiten fachlich nicht notwendig. Kandidat: bei beiden nur die vorhandene Biologie-Orientierung (`2d451684-6e53-565e-a987-f362da919d2c`) behalten; keine harte Kante von Ziel 2 auf die Blastocystenübersicht setzen. Die didaktische Sequenz und die Folgen für Frontier und regionale `target`-/`prerequisiteOnly`-Projektionen müssen vor Übernahme geprüft werden. Der Sek-II-Abschlussknoten (`1cfb2f8b`) fordert bereits beide IDs; seine konkrete Prüfungsabdeckung ist gesondert zu prüfen.
4. **Persistierte Mastery:** Die IDs bleiben stabil, aber der Bedeutungsumfang ändert sich. Vor Produktivübernahme ist zu prüfen, ob für diese IDs gespeicherte Mastery vorliegt und wie sie für die zwei engeren Kompetenzen behandelt wird. Aus alter Mastery darf keine zusätzliche Leistung oder menschliche Freigabe für die neue Fassung abgeleitet werden; keinen pauschalen Reset ohne eigene Zustandsentscheidung durchführen.

## Erforderliche erneute M7-Nachweise

| Gate | Aktueller Befund | Nach der Textentscheidung nötig |
| --- | --- | --- |
| A / Atomarität | `2517be3f`: A/D-Split-Risiko dokumentiert; `c5435624`: alter `atomic`-Eintrag trotz Doppelziel. | Beide aktuellen Texte unabhängig als atomar prüfen und die Entscheidungen neu binden; die Quellenprüfung läuft zusätzlich zu den fünf Gates. |
| D / Beschreibung | `2517be3f`: zwei historische `split_review`, `requiresSynthesis`; `c5435624`: kein aktueller A/B-Durchgang gefunden. | Neues aktuelles Buch/Seitenfingerprint mit beiden IDs, unabhängige A/B-Reviews, Synthese und Auflösung für die dann tatsächlich kanonischen Texte. |
| P / Verständnis | Für diese beiden neuen Texte kein aktuelles gebundenes P-Profil gefunden. | Zwei getrennte, materialgestützte positive Verständnisprofile mit unabhängiger Inhaltsprüfung und aktuellen Bindungen. |
| M / Memory | Alte `no_memory_needed`-Entscheidungen für beide Ziele; Fingerprints ändern sich. | Je Ziel neu prüfen, ob kein eigenes Memory nötig ist; Status und Fingerprint aktualisieren. |
| V / Bild | `biologie.qa.json`: beide `visualizationState: missing`, `no_primary_link`, keine Humanfreigabe. | Für Ziel 1 eine korrekte, lesbare Übersicht ohne erfundene Zeitangaben; für Ziel 2 ein getrenntes, quellengebundenes Fall-/Wirkungsbild ohne falsches Blastocysten-Zeitfenster. Aktive/kopierte Assets und Alttexte prüfen; keine QA-Freigabe aus einem Prompt ableiten. |

Die aktive Atlas-Konfiguration nennt derzeit 362 `curricularAtomic`-Biologieziele. Da beide IDs bereits existieren, erzeugt dieser Kandidat **kein zusätzliches Ziel**; jede Änderung von Geltungsbereich oder Projektion kann den aktuellen Zielumfang dennoch ändern. Die Zahl und die strenge D/P/A/M/V-Schnittmenge müssen nach Integration neu berechnet werden.

## Konkrete Integrations- und Prüfsequenz

1. Neue versionierte HE-Quell-/Mappingprüfung und regionale Direktmapping-Prüfung dokumentieren; aktive Source-Views erst nach Abschluss laufender D-Bindungen gezielt neu materialisieren. Die `in-flight-work-ledger.json` enthält derzeit andere Biologie- und Chemie-Batches und keine Freigabe für diese beiden Ziele.
2. Erst nach Quellen- und Kantenentscheidung die beiden kanonischen DE/EN-Texte, `requires`, semantische Fingerprints und nötige Source-Views in einem konsistenten Änderungssatz übernehmen. Bei geänderten Geltungsbereichen die GK/LK- und Sek-I-Projektionen explizit testen.
3. Frische A/D-Reviews und D-Synthese für **beide** Ziele, dann P-/M-Reviews und zwei V-Nachweise auf genau diesem Text- und Bildstand erstellen. Historische E12-v2-Seiten nicht umschreiben.
4. `npm --prefix app run quality:semantic-atomicity:check`, `npm --prefix app run quality:memory-card-review:check:all`, `npm --prefix app run check:goal-visualization-assets`, Source-Atlas-/Goal-Book-Build und die betroffenen D/P-Validatoren auf aktuellen Configs ausführen; anschließend `npm --prefix app run quality:deep-understanding-rollout:check` und den zentralen Bericht neu rechnen. Erst dessen aktuelle fünf Gates können M7-Fortschritt belegen.

**Offen:** Quellenbindung über alle betroffenen Regionen, Abhängigkeits-/Mastery-Entscheidung, neue A/D/P/M/V-Nachweise und zentraler aktueller M7-Bericht. Dieser Kandidat zählt keines dieser Ziele als abgeschlossen.
