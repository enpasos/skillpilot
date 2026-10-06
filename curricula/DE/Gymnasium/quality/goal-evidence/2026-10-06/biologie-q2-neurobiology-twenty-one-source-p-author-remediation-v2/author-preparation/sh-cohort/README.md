# SH-Kohortengrenze – inaktive Autoren-Vorbereitung

Dies ist eigene Autoren-Vorbereitung für Neuro21 v2. Sie enthält kein unabhängiges Reviewurteil und keine Freigabe. Eigene fachliche Texte: CC-BY-4.0; technische Helfer: Apache-2.0. Die amtlichen Eingaben behalten ihre ursprünglichen Rechte.

## Tatsächlich gelesene Primärquellen

- [Amtliches Biologie-Fachportal](https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html): Übergangsregel live gelesen und HTML exakt gespeichert.
- [Fachanforderungen 2026, 4. Auflage](https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html?cid=17928&file=files%2FFachanforderungen+und+Leitf%C3%A4den%2FSekundarstufe%2FFachanforderungen%2FFachanforderungen+Biologie+Sekundarstufe+%282026%29.pdf): amtliche PDF live geladen; Titel/Impressum und gezielte Textpassagen gelesen. Keine vollständige 2026-Inhaltsprüfung.
- [Fachanforderungen 2023, 3. Auflage](https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html?cid=29947&file=files%2FFachanforderungen+und+Leitf%C3%A4den%2FSekundarstufe%2FFachanforderungen%2FFachanforderungen+Biologie+Sekundarstufe+%282023%2C+barrierearm%29.pdf): live geladen. Druckseiten 24/26, physische PDF-Seiten 26/28, als Text und tatsächliche Seitenbilder gelesen.

HTTP-Status, tatsächliche URLs, UTC-Zeit, Bytes und SHA-256 stehen in `official-primary-fetch.actual.receipt.json`. Die live geladene 2023-PDF ist bytegleich zur bestehenden lokalen Originalquelle: `11228f1b3b661dc974a5538fd02e115fd25906af840aa7758503f9c88389b23f`.

## Verbindlich begrenzte Geltung

Sek I 2026 gilt ab 2026/27 aufwachsend ab der jeweiligen Jahrgangsstufe des Fachbeginns. Sek I 2023 gilt für die auslaufenden Jahrgänge weiter und entfällt jahrgangsweise. Der Fachbeginn muss aus dem tatsächlichen schulischen Curriculum/Kohortenstand hervorgehen; die amtliche Portalregel setzt keinen universellen Biologie-Fachbeginn J5. Eine Schuljahr-/Klassenstufenformel gilt nur bei bekanntem Fachbeginn und regulärer Progression. Wiederholung oder Schulwechsel benötigen konkreten Nachweis.

`effectiveFrom: 2023-08-01` begründet keine heutige pauschale SH-Sek-I-Geltung. Ein pauschales Ende am 1. August 2026 wäre ebenfalls falsch. Der amtliche Portaltext bezeichnet Sek II ausdrücklich als unverändert aus 2023 übernommen; die Sek-I-Übergangsgrenze erzeugt keine neue Sek-II-Inhaltsänderung.

## Sechs erhaltene Beziehungen, begrenzte Komponenten

Die vollständigen aktuellen Source-/Canonical-/ReviewDecision-IDs bleiben in `sh-cohort.author-preparation.actual.receipt.json` erhalten: jeweils die SR- und IK-Beziehung zu `ce19b80f`, `ff1bf88f`, `19758e09`. Keine neue ID und keine native Mappingdatei wurden erzeugt.

- `ce19b80f`: SR4 belegt Nervenzellen als Systembestandteile; IK4 liefert Organebenen-Kommunikation. Begrenzter Bezug zum verengten Neuronaufbau; kein Sek-I-Aktionspotenzialbeleg und keine Abdeckung der ganzen größeren Source-Union.
- `ff1bf88f`: Die Originalzeilen nennen weder Synapse noch Transmitter. Neuronale Kommunikation ist nur ein allgemeiner didaktischer Anschlusskontext; chemische oder elektrische Mechanismen erhalten dadurch keinen ausdrücklichen Pflichtbeleg. Die Beziehung bleibt als Kandidatenbezug mit offener mechanistischer Beleggrenze erhalten.
- `19758e09`: Hormonproduktion, Empfangsorganwirkung und Hormon-/Nervensystem als Organebenen sind Komponenten. Gemeinsame neuronale/hormonelle Steuerkreise sowie chronische Cortisol-/Stressfolgeregelkreise werden durch diese Zeilen nicht ausdrücklich gefordert.

## Native Grenze und nutzbare Dokumentation

Bestehende Felder `sourceDocument.key/title/url/path`, `extractionNotes`, `reviewNotes`, `decisions[].rationale/notes` und `sourceRef/sourceSpan` können Edition, Originalkomponente und auslaufende Geltung dokumentieren. Diese Angaben sind keine Kohortenauswahl.

Der unveränderte native Scope-Matcher unterstützt nur `schoolForm`, `jurisdiction`, `stage`, `durationModel`, `courseProfile`; unbekannte angeforderte Dimensionen scheitern. Das geschlossene Package-View-Schema erlaubt keine `cohort`-/`sourceVersion`-Scope-Felder. Ein tatsächlicher Import des Matchers sowie Schemaassertionen endeten mit Exit 0; die begrenzte Prüfquittung liegt in `native-cohort-contract.actual.receipt.json`.

Der bestehende Applicability-Compiler verarbeitet ausschließlich `jurisdiction`. Auch `partial` fügt SH hinzu; andere Input-Matchtypen werden dort als `exact` behandelt. Eine Umstellung auf `partial` löst daher weder die Kohortengrenze noch die automatische Pflichtsichtbarkeit. Frei akzeptierte Placement-Metadaten ergänzen ebenfalls keine unterstützte Auswahldimension. `durationModel`, `courseProfile`, `phase` und `requires` dürfen nicht zur Versionskodierung umgedeutet werden.

Die sechs Kandidatenbeziehungen bleiben mit diesen offenen Grenzen gebunden. Vor Aktivierung muss die tatsächliche Kohortenzulässigkeit geklärt und durchgesetzt sein. Keine Original-/Science-Freigabe oder vollständige Source-Union-Abdeckung wird aus dieser Vorbereitung abgeleitet. Laufende Neuro-B-Prüfausgaben wurden nicht gelesen.
