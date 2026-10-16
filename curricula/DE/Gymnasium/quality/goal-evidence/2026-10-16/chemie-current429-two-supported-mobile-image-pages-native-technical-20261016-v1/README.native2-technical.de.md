# Zwei aktuelle Chemie-Bildseiten: technische Native-Vorbereitung

Genau diese beiden Zielseiten wurden mit dem unveränderten Stock-Runner im
bereits bestehenden isolierten Host vorbereitet und geprüft:

- `fec1563e-a34a-5fc1-93bb-03981f35ab13`
- `f0ba30a8-84b3-5915-bf85-6c3a176064d2`

Grundlage ist die ganze aktuelle578-Canonical `1e515c…` mit429 curricularAtomic-
Zielen und die aktuelleQA449 `cfb9e6…`. Die beiden aktuellen Normal-P-Zeilen sind
bytegenau als P2 gebündelt. Der eigene SEM-Adapter ändert ausschließlich den
`sourceLandscapePath`-Header auf diese direkte Canonical; sämtliche578 Entscheidungen
einschließlich Fingerprints und Typen bleiben exakt gleich zum aktuellen Host-Ledger
und zum vorhandenen gültigen Native15-Basisledger. Keine H-Normalaliase oder
Stock-Scripts wurden geändert, kein neuer Host wurde angelegt.

## Ausführung und tatsächliche PDF-Seiten

Stock `prepare` und `check` liefen **je genau einmal mit Exit0**. stdout und stderr
wurden direkt in dauerhafte Dateien geschrieben; keine `capture_output`-Pipes.
Das unveränderte Render-Manifest weist2 Zielseiten und2 Standard-Vorspannseiten aus,
also4 physische PDF-Seiten. Die zunächst zu enge abschließende Controller-Annahme
„nur2 physische Seiten“ ist transparent dokumentiert. Dafür wurde kein Stock-Lauf
wiederholt und kein vorhandenes Ergebnis umgeschrieben.

`pdftoppm` lief mit Exit0. Die tatsächlichen zwei Zielseiten liegen privat unter:

- `tmp/chemie-two-supported-image-pages-native-20261016-v1/actual-pdf-captures/page-3.png`
- `tmp/chemie-two-supported-image-pages-native-20261016-v1/actual-pdf-captures/page-4.png`

Beide tatsächlichen Zielseiten wurden geöffnet: passender Titel/ID, die aktualisierte
Bilddatei, Zielbeschreibung und Beziehungen werden auf der jeweiligen Seite vollständig
gerendert. Dies ist eine technische Renderbeobachtung, keine neue fachliche D-/V-Freigabe.

## Neutrale Inputs

`NEUTRAL.whole2-goals-whole2-profiles-whole4-original-cases.json` enthält beide ganzen
aktuellen Zielkörper, beide ganzen Profilobjekte ohne Reviewmetadaten und alle vier
ganzen Originalfälle. Vollständige P-Normaldatensätze sind getrennte technische
Renderer-Eingaben; Peer-Urteile oder alte D-/V-Befunde wurden dem neutralen Material
nicht beigefügt. Die zwei F0-Fälle behalten ihre eingebetteten historischen Zielkörper
unverändert; die darüber bereitgestellten aktuellen Zielkörper sind für den neuen
Seitenkontext maßgeblich. Aufgaben, Lösungen, Rubriken und Transfers wurden nicht geändert.

Dieser endliche Batch aktualisiert ausschließlich zwei Bild-Seitenkontexte. Er wiederholt
keine alte15er-Prüfung. Neue wissenschaftliche Votes, strenger Nettoabschluss,
menschliche Freigabe/Erprobung und aktive Übernahme: jeweils0 beziehungsweise false.
Der vorbereitete Native2-Selector ist für die unabhängigen Beschreibungsreviews bereit.
