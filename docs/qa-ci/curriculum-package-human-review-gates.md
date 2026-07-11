# Menschliche Review-Gates für Curriculum-Releases

Diese Seite ist die zentrale, kurze Arbeitsliste für Entscheidungen, die die Toolchain nicht selbst treffen darf. Sie bezieht sich zunächst auf `org.skillpilot.curriculum.de.gymnasium.mathematik`; Hash- oder Inhaltsänderungen können bereits abgeschlossene Entscheidungen wieder veralten lassen.

## Überblick

| Gate | Offener Umfang | Blockiert | Primäre Arbeitsquelle |
| --- | ---: | --- | --- |
| HR-001 Fachliche Bildfreigabe | 621 vorhandene Bilder; kein Bild fehlt mehr im 754-Goal-Atomic-Scope | fachliche Publikationsreife | `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json` |
| HR-002 Bildrechte | 757 Einzelentscheidungen, davon 6 mit nutzerbereitgestellter Erzeugungsbehauptung | öffentliche Weiterverbreitung | `curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json` |
| HR-003 Rechte der Nicht-Binärartefakte | 3 Klassenentscheidungen | öffentliche Weiterverbreitung | dasselbe Redistribution-Ledger |
| HR-004 Source-Text-Verifikation | 479 Einzelentscheidungen | Quellen-QA/Promotion | `curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json` |
| HR-005 Core-first Ontologie-Sign-off | nach DPK-008 aus dem Extension-/Coverage-Report zu bestimmen | Ontologie-Promotion | künftiger DPK-008-Report |
| HR-006 Signatur- und Stable-Promotion | 1 Trust-/Release-Entscheidung je Releasegruppe | öffentlicher `stable`-Release | künftiger DPK-011-Release-Index |

Die Gates sind unabhängig. Ein fachlich korrektes Bild kann rechtlich ungeklärt sein; eine geklärte Lizenz ersetzt keine mathematische Prüfung. Ebenso ist eine technisch reproduzierbare Textübereinstimmung keine rechtliche Freigabe eines Zitats.

## HR-001 – Fachliche Bildfreigabe

Aktuell umfasst die Visualisierungs-QA 757 Entscheidungen und Bilder. Alle 754 Goals des Atomic-Scope haben mindestens ein aktives Bild; es gibt keine technische Bildlücke mehr. 136 aktive Visualisierungen sind menschlich freigegeben, 621 warten auf Review. Die zuletzt technisch importierte Visualisierung für Goal `f40fcaf7-c630-589c-9f48-6c9e69da0b9d` gehört zu dieser offenen Human-Reviewqueue.

Für jedes neue oder geänderte Bild sind mindestens zu prüfen:

- fachliche und mathematische Richtigkeit aller Werte, Beschriftungen, Relationen und Darstellungen;
- Passung zu Lernziel, Altersstufe und beabsichtigter Orientierungshilfe;
- Lesbarkeit, Sprache, Alt-Text und erkennbare Artefakte;
- Entscheidung `human-approved`, `rejected` oder gegebenenfalls `deferred-provider-limitation` auf dem aktuellen Asset-Hash.

Bereits freigegebene Bilder benötigen nur bei Hash- oder relevanter Metadatenänderung ein neues Review.

## HR-002 – Rechte an 757 Bildern

Jedes eingebettete Bild steht bewusst auf `pending-human-review`, `review-required` und `licenseExpression: null`. Die Herkunftsangabe „AI-generated, SkillPilot-curated“ ist keine Lizenz.

Erforderlich sind je Bild oder über eine belastbare, auf jedes Bild angewandte Batch-Evidenz:

- Prüfung der maßgeblichen Providerbedingungen zum Erzeugungszeitpunkt;
- Bestätigung, dass Eingaben und Ausgaben weiterverbreitet werden dürfen;
- konkrete SPDX-artige `licenseExpression` und belastbare Review-Evidence;
- Reviewer und Zeitstempel;
- für die sechs `user-provided-generated-claim`-Fälle zusätzlich eine Rechte-/Uploader-Attestation.

Eine Batchentscheidung darf Arbeit bündeln, muss aber weiterhin alle 757 hashgebundenen Assetrecords eindeutig abdecken. Nicht belegbare Assets werden `prohibited` und müssen vor einem öffentlichen Paket entfernt oder ersetzt werden.

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

Dieses Gate wird erst nach dem technischen DPK-008-Export konkret befüllt. Zu prüfen sind dann insbesondere:

- ob jeder verwendete FWU-Core-Term semantisch passt und nicht nur ähnlich benannt ist;
- ob jede SkillPilot-Erweiterung eine nachgewiesene Core-Lücke schließt;
- ob registrierte kanonische JSON-Literale eng begrenzt bleiben und keine versteckte Komplettkopie des JSON-Pakets bilden;
- ob Source-, Goal-, Programm-, Placement-, Kompetenzachsen- und Composition-View-Semantik sauber getrennt bleiben.

Der technische Roundtrip, SHACL-/OWL-Test und identische Digest sind notwendig, ersetzen dieses semantische Sign-off aber nicht.

## HR-006 – Signatur und Stable-Promotion

Nach DPK-011 muss eine verantwortliche Person oder ein festgelegter Releaseprozess:

- die vertrauenswürdige Signing-Identität beziehungsweise den Schlüssel freigeben;
- bestätigen, dass alle vorherigen Human-Gates auf den im Release-Index gebundenen Hashes geschlossen sind;
- die atomare JSON-/OWL-Releasegruppe von `staging` auf `stable` promoten.

Ein technisch gültiger, aber nicht vertrauenswürdig zugeordneter Signaturnachweis reicht nicht. Änderungen nach dem Sign-off erzeugen eine neue Releasegruppe und benötigen die jeweils durch Hashdrift betroffenen Reviews erneut.

## Bereits maschinell erledigt

- vollständige, hashgebundene Queue-Erzeugung ohne erfundene Human-Freigaben;
- 9.498 technische Source-Text-Treffer und 479 exakt abgegrenzte Restfälle;
- 757 einzeln gebundene Bildrechte-Records und drei disjunkte Nicht-Binärklassen, zusammen 760 offene Redistribution-Entscheidungen;
- automatische Apache-2.0-Freigabe ausschließlich für den exakten Softwarevertragsbestand;
- fail-closed Erkennung von fehlenden, obsoleten oder gedrifteten Reviewrecords;
- strukturell gültige Staging-Kandidaten bleiben bei offenen Rechten `not-ready-incomplete` und können nicht als `ready` promotet werden.
