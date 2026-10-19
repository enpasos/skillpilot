# Biotreibstoff-Massenbilanz: inaktive PNG-Autorenkandidatin

Die neue Bildkandidatin gehört ausschließlich zum vorgeschlagenen Atom
`b732c780-beb8-55f3-8503-edd6b8677a3a` aus dem unveränderten versiegelten
Biofuel-Autorenpaket. Sie zeigt ein ideales Papiermodell: **100 kg ganze Saat
→ 30 kg Öl + 70 kg Presskuchen**, eine gemeinsame Erfassungsgrenze und den
unbekannten anfänglichen Ölvorrat beziehungsweise Rückgewinnungsgrad.

## Ergebnis und tatsächliche Herstellung

- Ausgewählte Datei: [native PNG](candidate/b732c780-beb8-55f3-8503-edd6b8677a3a.png).
- Tatsächlicher Provider: **OpenAI / built-in image_gen.imagegen**. Eine Modellversion wird vom Tool nicht offengelegt und hier nicht erfunden.
- Native PNG: **1672 × 941 px**, nahezu 16:9; keine Formatabweichung erforderlich und keine finale Konvertierung, Beschneidung oder Nachzeichnung.
- Roh-SHA-256: `fed2d21cb975e5091e8400eddaad78ed291c5b9b6abe89e7feb293fc024e8ee4`.
- Der originale `caBX`-/C2PA-Chunk ist bytegenau erhalten; Chunk-SHA, PNG-CRC und tatsächlich vorhandene Marker sind dokumentiert. Eine kryptografische Signatur-/Vertrauensprüfung wurde nicht durchgeführt.
- Eigenes didaktisches Bild: **CC-BY-4.0** nach aktueller Projektregel. Keine fremde Vorlage wurde in das Bild kopiert; die bestehende Routenillustration wurde lokal als Stilreferenz gesichtet.

Vor der Generierung lief der echte `visualization:prepare`-Helper mit dem
**INACTIVE**-Landscape, `--subject=chemie` und explizitem Provider. Ein erster
PNG-Entwurf enthielt lose Samen und Krümel neben den Behältern. Er wurde wegen
möglicher ungezählter Stoffmengen als Autorenkandidat zurückgestellt und bleibt
mit Rohhash erhalten. Ein gezielter built-in Edit entfernte genau diese Teile.

Die tatsächlichen Prompts und Toolbelege stehen in
[generation/](generation/). Der letzte konkrete Editprompt wurde beim echten
`visualization:import` mit `--prompt` übergeben. Der Import lief ausschließlich
mit **`--dry-run`**, demselben inaktiven Landscape und demselben expliziten
Provider. [CLI-Ausgabe](checks/CLI.import-dry-run.actual.stdout.txt) und
[Argumente](checks/CLI.import-dry-run.actual.json) dokumentieren das Ergebnis.
Die mit den originalen Helper-Funktionen abgeleitete
[ganze Before/After-Ziel-CAS](candidate/whole-goal-resourceLink.CAS.INACTIVE.pending.json)
ist nur ein inaktiver Vorschlag; kein Link oder Asset wurde normal registriert.

## Tatsächliche Selbstsichtung und Grenzen

Das rohe Endbild sowie unverzerrte Prüfkopien bei **360 × 203** und
**680 × 383 px** wurden tatsächlich mit `view_image` geöffnet.
[Selbstsichtung](inspection/SELF.actual-view_image-author-candidate-only.json)
hält den fachlichen und visuellen Befund fest: Saatmasse und Ölmasse sind
unterschieden, die Rechnung stimmt, beide Ausgänge liegen in derselben
Erfassungsgrenze und es gibt keine behauptete vollständige Ölrückgewinnung,
Reaktion oder praktische Durchführung. Die Symbolgefäße zeigen keine
gemessenen Volumina. Die Preview-Dateien dienen ausschließlich der Sichtung;
das Kandidaten-PNG bleibt bytegleich zum nativen Provideroutput.

**Status: `needs_external_review`.** Dies ist eine informierte Autorensichtung,
keine unabhängige V-Entscheidung, Humanfreigabe oder M7-Aussage. Das Bild ist
Orientierung und ersetzt keine Aufgabe, frische Transferleistung oder
Quellenevidenz. Aktuelle D/P/A/SEM/M/V-Bindungen, externe Bildprüfung,
Integration und gegebenenfalls menschliche Freigabe bleiben eigene Schritte.

Das ursprüngliche Autorenpaket bleibt mit sämtlichen 60 versiegelten Dateien
unverändert. Fremd-QAs wurden nicht gelesen oder geändert. Es gab keine
Normaländerung, Veröffentlichung, Runtime-Aktivierung oder Fullchecks.
Die begrenzten Integritätsbefunde und das abschließende Seal stehen unter
[checks/](checks/) und [SEAL.image-author-only-inactive.json](SEAL.image-author-only-inactive.json).

