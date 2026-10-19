# Carbonsäure-Beobachtungen: inaktive PNG-Autorenkandidatin

Eine spezifische Bildkandidatin für
`dc146a38-994d-58ec-b6a0-5210118b93ae`, auf Grundlage der ganzen
V1-Ziel-/P-/Materialkörper und des exakten V2-Quellenoverlays.
**Status: `needs_external_review`**, keine V- oder Humanfreigabe.

## Ein tatsächlich erzeugter und gesichteter Kandidat

[Native PNG](candidate/dc146a38-994d-58ec-b6a0-5210118b93ae.png):
**1672 × 941 px**, nahe 16:9, 1.579.918 Rohbytes.
SHA-256: `e38ca121688d23bcec3843113daf5a2e371836f3dbcd6a614ac95d8b6adfe800`.
Tatsächlicher Provider: **OpenAI / built-in image_gen.imagegen**;
eine Modellversion ist vom Tool nicht offengelegt. Es gab einen Generierungsversuch.

Das Bild zeigt zwei **vorgegebene** Vergleichsbefunde für bekannte Stoffe unter
milden wässrigen Bedingungen: Ethansäure mit blau→rot-Lackmus und Gasblasen
nach Hydrogencarbonat; Ethanolkontrolle mit blau bleibendem Lackmus und ohne
entsprechende Gasblasen. Große Papierstreifen und klare Gasblasen stehen im
Vordergrund. Es erscheinen keine Ausführungsroutine, praktizierende Person,
Reaktionsgleichung, Rauch- oder CO₂-Wolke und kein Universalindikator-Schema.
Der große Hinweis **Beleg ≠ Strukturbeweis** erhält die Aussagegrenze.

Die eigene Materialkarte benennt allgemein einen sauren Indikatorbefund.
**Blauer Lackmus ist die neue Bildkonkretisierung**, keine bereits dort
gedruckte Farbangabe. Diese Abgrenzung und die gesetzten Bedingungen sind in
[IMAGE.condition-concretization.pending.json](inputs/IMAGE.condition-concretization.pending.json)
festgehalten. Blau bleibender Lackmus allein beweist keinen pH-Wert und keine
Stoffidentität. Die Stoffangabe CO₂ stammt aus den bereitgestellten Daten;
die schematischen Blasen zeigen Gasvolumen und keine sichtbare Gasfarbe.

## Herkunft, Format und tatsächliche Sichtung

[Originalprompt](generation/prompt.actual.md),
[tatsächlicher Toolbeleg](generation/attempt-01.actual-tool-receipt.json) und
[Roh-PNG-/C2PA-/Formatbefund](generation/attempt-01.raw-PNG-C2PA-and-format.json)
sind erhalten. Der native Provideroutput wurde bytegleich in das Paket kopiert:
kein finales Resizing, Crop, Retuschieren, SVG oder programmatisch erzeugtes
Ersatzbild. Der `caBX`-/C2PA-Chunk samt SHA und PNG-CRC bleibt unverändert;
eine kryptografische Signatur-/Vertrauensprüfung wird nicht behauptet.
Eigenes didaktisches Material: **CC-BY-4.0** nach aktueller Projektregel.

Das native Endbild sowie unverzerrte Prüfkopien bei **360 × 203** und
**680 × 383 px** wurden tatsächlich mit `view_image` geöffnet.
[Autorensichtung](inspection/SELF.actual-view_image-author-candidate-only.json)
dokumentiert chemische Korrektheit, kleine Zusatzlabels, Hauptmotiv,
Vergleichslogik und Grenzen. Die Prüfkopien dienen ausschließlich der Sichtung.
Die bestehenden Struktur- und Praxisbilder wurden lokal als Stilreferenzen
gesichtet, nicht als Provider-Eingaben übertragen; Dateien und Links bleiben KEEP.

## Vorbereitung und inaktiver Importplan

Der vollständige inaktive Prepare-Input wurde aus dem unveränderten aktuellen
kanonischen Landscape und genau den **23 bewachten V1-CAS-Operationen**
abgeleitet. Alle zehn ganzen After-Zielobjekte stimmen mit dem Autorenpaket
überein. Das V2-Overlay ändert ausschließlich die vorgeschlagenen
Quellenbeiträge; Ziel, P und Material bleiben V1-exakt.

Vor der Bildgenerierung lief der echte `visualization:prepare`-Helper mit
`--landscape=<INACTIVE>`, `--subject=chemie` und explizitem Provider.
Danach lief der echte `visualization:import` ausschließlich mit **`--dry-run`**,
dem tatsächlichen Prompt und demselben expliziten Provider.
[Importbeleg](checks/CLI.import-dry-run.actual.json) und
[rohe CLI-Ausgabe](checks/CLI.import-dry-run.actual.stdout.txt) halten dies fest.
Die mit den originalen Helper-Funktionen abgeleitete
[ganze Before/After-Link-CAS](candidate/whole-goal-resourceLink.CAS.INACTIVE.pending.json)
ist ein inaktiver Vorschlag. Keine normale Bildkopie oder Linkregistrierung
wurde erzeugt.

V1, sämtliche drei V2-Dateien, ursprüngliche Urteile und bestehende Bilder
bleiben unverändert. Fremd-QAs wurden nicht gelesen. Das Bild ist Orientierung
und ersetzt keine Aufgabe, frischen Säure-/Estertransfer, reale Versuchshandlung
oder Quellenevidenz. Keine Normalaktivierung, Runtime-/Host-Akzeptanz, neue
D/P/A/SEM/M/V-Freigabe, Humanfreigabe oder M7-Aussage; kein Fullcheck.
[Begrenzte Integritätsprüfung](checks/CHECK.raw-image-and-exact-author-boundaries.actual.json)
und [Seal](SEAL.image-author-only-inactive.json) schließen diese Autorenstufe ab.

