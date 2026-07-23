# Menschliche Review-Gates für Curriculum-Releases

Diese Seite ist die zentrale, kurze Arbeitsliste für Entscheidungen, die die Toolchain nicht selbst treffen darf. Sie bezieht sich zunächst auf `org.skillpilot.curriculum.de.gymnasium.mathematik`; Hash- oder Inhaltsänderungen können bereits abgeschlossene Entscheidungen wieder veralten lassen.

## Überblick

| Gate | Offener Umfang | Blockiert | Primäre Arbeitsquelle |
| --- | ---: | --- | --- |
| HR-001 Fachliche Bildfreigabe | 576 aktive Bilder warten auf Review; 23 von 754 Scope-Zielen sind bewusst providerbedingt zurückgestellt | fachliche Publikationsreife | `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json` |
| HR-002 Bildrechte | 734 Einzelentscheidungen, davon 6 mit nutzerbereitgestellter Erzeugungsbehauptung | öffentliche Weiterverbreitung | `curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json` |
| HR-003 Rechte der Nicht-Binärartefakte | 3 Klassenentscheidungen | öffentliche Weiterverbreitung | dasselbe Redistribution-Ledger |
| HR-004 Source-Text-Verifikation | 479 Einzelentscheidungen | Quellen-QA/Promotion | `curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json` |
| HR-005 Core-first Ontologie-Sign-off | 1 hashgebundene fachlich-ontologische und rechtliche Expertenfreigabe für exaktes FWU-Paket, Reverse-Receipt, Profil und Registry | Ontologie-Promotion | DPK-008c-FWU-Receipt und DPK-008d-Reverse-Receipt |
| HR-006 Signatur- und Stable-Promotion | 1 Trust-/Release-Entscheidung je Releasegruppe | öffentlicher `stable`-Release | künftiger DPK-011-Release-Index |

Die Gates sind unabhängig. Ein fachlich korrektes Bild kann rechtlich ungeklärt sein; eine geklärte Lizenz ersetzt keine mathematische Prüfung. Ebenso ist eine technisch reproduzierbare Textübereinstimmung keine rechtliche Freigabe eines Zitats.

## HR-001 – Fachliche Bildfreigabe

Aktuell umfasst die Visualisierungs-QA alle 754 Goals des Atomic-Scope. Davon haben 731 ein aktives Bild; 23 sind nach wiederholt fachlich fehlerhaften Provider-Ergebnissen als `deferred_provider_limitation` bewusst ohne aktiven Link und ohne veröffentlichtes Asset zurückgestellt. 155 aktive Visualisierungen sind menschlich freigegeben, 576 warten auf Review.

Für jedes neue oder geänderte Bild sind mindestens zu prüfen:

- fachliche und mathematische Richtigkeit aller Werte, Beschriftungen, Relationen und Darstellungen;
- Passung zu Lernziel, Altersstufe und beabsichtigter Orientierungshilfe;
- Lesbarkeit, Sprache, Alt-Text und erkennbare Artefakte;
- Entscheidung `human-approved`, `rejected` oder gegebenenfalls `deferred-provider-limitation` auf dem aktuellen Asset-Hash.

Bereits freigegebene Bilder benötigen nur bei Hash- oder relevanter Metadatenänderung ein neues Review.

## HR-002 – Rechte an 734 Bildern

Jedes eingebettete Bild steht bewusst auf `pending-human-review`, `review-required` und `licenseExpression: null`. Die Herkunftsangabe „AI-generated, SkillPilot-curated“ ist keine Lizenz.

Erforderlich sind je Bild oder über eine belastbare, auf jedes Bild angewandte Batch-Evidenz:

- Prüfung der maßgeblichen Providerbedingungen zum Erzeugungszeitpunkt;
- Bestätigung, dass Eingaben und Ausgaben weiterverbreitet werden dürfen;
- konkrete SPDX-artige `licenseExpression` und belastbare Review-Evidence;
- Reviewer und Zeitstempel;
- für die sechs `user-provided-generated-claim`-Fälle zusätzlich eine Rechte-/Uploader-Attestation.

Eine Batchentscheidung darf Arbeit bündeln, muss aber weiterhin alle 734 hashgebundenen Assetrecords eindeutig abdecken. Nicht belegbare Assets werden `prohibited` und müssen vor einem öffentlichen Paket entfernt oder ersetzt werden.

## HR-003 – Rechte der Nicht-Binärartefakte

Drei Klassen sind offen:

1. `skillpilot-data`: kanonische Landschaft, Views, Karten, Mappings, Migrationen und fachlich verfasste Assessment-Texte;
2. `official-source-evidence`: amtliche Quellenmetadaten und source-nahe Textbelege;
3. `generated-metadata`: abgeleitete Indizes, Closure-, Quality-, Build- und Validierungsberichte.

Für jede Klasse sind Rechteinhaberschaft, zulässiger Umfang, Lizenzexpression und Evidenz festzuhalten. Besonders bei amtlichen Source-Texten muss zwischen bloßen Fakten/Metadaten, eigener Paraphrase und gegebenenfalls geschütztem Wortlaut unterschieden werden. Nur die an den exakten Root-`LICENSE`-Hash gebundene Klasse `software-contracts` ist derzeit automatisch als Apache-2.0 geklärt.

## HR-004 – 479 Source-Text-Entscheidungen

Die Maschine hat 9.493 Texte zusammenhängend in authored Passage-Carriern und weitere fünf in einer reproduzierbaren, nur temporär erzeugten PDF-Textprojektion gefunden. Diese 9.498 Nachweise benötigen für die technische Source-Verification-Lane kein zusätzliches Human-Review und werden trotzdem nicht als menschliche oder rechtliche Freigaben bezeichnet.

Die verbleibenden 479 Datensätze müssen am jeweils hashgebundenen Original geprüft werden. Zulässige Entscheidungen sind:

- `verified-verbatim` – Wortlaut am Original bestätigt;
- `verified-normalized-transcription` – ausschließlich dokumentierte typografische/Extraktionsnormalisierung;
- `reviewed-paraphrase` – fachlich korrekt, aber ausdrücklich keine wörtliche Wiedergabe;
- `rejected` – falsch oder nicht ausreichend belegbar.

Jede abgeschlossene Entscheidung benötigt Reviewer, Zeitstempel und Begründung. Ihr `reviewEvidenceSha256` bindet sie an SourceText, Passage, PDF und Locator; Drift macht die Entscheidung automatisch stale. Die genaue Verteilung nach Collection und Quelldokument steht im [generierten Source-Verification-Report](status/source-verification-de-gymnasium-mathematik-v1.md).

## HR-005 – Core-first Ontologie-Sign-off

Erforderlich ist eine hashgebundene fachlich-ontologische und rechtliche Expertenfreigabe des exakten DPK-008c-FWU-Pakets, des DPK-008d-Reverse-Receipts sowie von Profil und Registry. Der aktuelle technische Prüfgegenstand bindet:

- FWU-OWL-ZIP: 2.362.455.128 Byte, SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`;
- FWU-OWL-Manifest: SHA-256 `29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3`;
- rekonstruiertes JSON-ZIP: 1.737.571.471 Byte, SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195`;
- rekonstruiertes JSON-Manifest: SHA-256 `8d7970435431ff78743d0bf413a54bbebee009bbaafe35f1283ebcb89b4f2ff0`;
- DPK-008d-Reverse-Receipt: 12.185 Byte, SHA-256 `94035f2d88e2c2b7588f13f01cb44b917c83900b9f839c66558ea7eae585884f`;
- DPK-008d-Evidenzmanifest: 3.483 Byte, SHA-256 `31c256ff612aa7a346fb0792c83b109d4bc01df52fdc36e98a8c717bf9b8eafc`; exakt 20 Dateien mit Inventardigest `8483f5ce428cc54cca1353668370ae09f32f51166af6a3235a2ff19ccb88ea1e`;
- die 454-Einträge-Registry mit SHA-256 `2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48` sowie die im FWU-Receipt bytegebundenen Core-, Anwendungsprofil- und Shapes-Dateien.

Zu bestätigen sind insbesondere:

- ob jeder verwendete FWU-Core-Term semantisch passt und nicht nur ähnlich benannt ist;
- ob jede SkillPilot-Erweiterung eine nachgewiesene Core-Lücke schließt und auf das wirklich notwendige Maß begrenzt bleibt;
- welche Lizenz-, Attributions- und Share-Alike-Pflichten für die gebündelte Core-Komponente und das generierte Gesamtmodell gelten und ob die derzeitige CC-BY-SA-4.0-Angabe diese Pflichten korrekt abbildet;
- ob registrierte kanonische JSON-Literale eng begrenzt bleiben und keine versteckte Komplettkopie des JSON-Pakets bilden;
- ob Source-, Goal-, Programm-, Placement-, Kompetenzachsen- und Composition-View-Semantik sauber getrennt bleiben.

Der technisch verlustfreie isolierte Reverse-Lauf mit 111/111 Normalform-Oracles, byteidentischen Bildern, zwei unabhängig validierten JSON-Paketen und gebundener Hermetik-Evidenz ist notwendig, aber keine menschliche Semantik- oder Rechtefreigabe. Ebenso ersetzen SHACL, OWL 2 DL, HermiT und der identische `contentDigest` dieses Sign-off nicht.
Bis zu dieser Entscheidung trägt die Core-Datei im FWU-OWL-Manifest bewusst `licenseExpression: null` und `redistributionStatus: review-required`; technische Validität darf diesen offenen Rechtsstatus nicht zu `allowed` umdeuten.

## HR-006 – Signatur und Stable-Promotion

Nach DPK-011 muss eine verantwortliche Person oder ein festgelegter Releaseprozess:

- die vertrauenswürdige Signing-Identität beziehungsweise den Schlüssel freigeben;
- bestätigen, dass alle vorherigen Human-Gates auf den im Release-Index gebundenen Hashes geschlossen sind;
- die atomare JSON-/OWL-Releasegruppe von `staging` auf `stable` promoten.

Ein technisch gültiger, aber nicht vertrauenswürdig zugeordneter Signaturnachweis reicht nicht. Änderungen nach dem Sign-off erzeugen eine neue Releasegruppe und benötigen die jeweils durch Hashdrift betroffenen Reviews erneut.

## Bereits maschinell erledigt

- vollständige, hashgebundene Queue-Erzeugung ohne erfundene Human-Freigaben;
- 9.498 technische Source-Text-Treffer und 479 exakt abgegrenzte Restfälle;
- 734 einzeln gebundene Bildrechte-Records und drei disjunkte Nicht-Binärklassen, zusammen 737 offene Redistribution-Entscheidungen;
- automatische Apache-2.0-Freigabe ausschließlich für den exakten Softwarevertragsbestand;
- fail-closed Erkennung von fehlenden, obsoleten oder gedrifteten Reviewrecords;
- strukturell gültige Staging-Kandidaten bleiben bei offenen Rechten `not-ready-incomplete` und können nicht als `ready` promotet werden.
