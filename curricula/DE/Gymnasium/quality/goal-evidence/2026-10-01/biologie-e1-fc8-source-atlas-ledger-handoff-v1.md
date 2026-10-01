# fc8c E.1: Quellen-, Atlas- und Ledger-Handoff

Stand: 2026-10-01. Read-only Fachprüfung und Übergabenotiz; **kein** neuer D-, P- oder V-Abschluss für `fc8c4b02-02f2-5ad6-b481-224d36121da1`.

## Amtlicher Quellpunkt und aktuelle Bindung

- Das [hessische KCGO Biologie, Ausgabe 2024, Stand 01.08.2025, E.1, gedruckte S. 36](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) fordert Bau und Funktion der Zellorganellen **im elektronenmikroskopischen Bild der Zelle** als Übersicht. Der unmittelbar folgende Punkt behandelt den evolutionsbiologischen Aspekt einschließlich Endosymbiontentheorie getrennt. In der älteren [PDF-Fassung von November 2024, gedruckte S. 33](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) ist die fachliche Trennung bereits gleich.
- Der aktuelle kanonische fc8c-Text nennt ein elektronenmikroskopisches Zellbild und verbindet das Erkennen ausgewählter Organellen mit begründeter Funktionszuordnung. Die eigenständige Endosymbiontentheorie bleibt dem anderen kanonischen Ziel `1042bb24-96ba-553b-a956-abaf9c74dc43` zugewiesen. Diese Abgrenzung ist fachlich angemessen.
- Die historische HE-Source-Extraction `E.1.3` paraphrasiert den amtlichen Organellenpunkt zu breit und vermischt ihn mit Endosymbiose. Das aktive HE-Mapping `...m7-ephase-20260930-v2.review.json` bewertet die fc8c-Kante bereits als `partial` und dokumentiert diese Abweichung. Der versionierte HE-v3-Kandidat für 0dd übernimmt diese fc8c-Entscheidung unverändert. Für fc8c ist keine zusätzliche Mappingänderung belegt.
- Das tatsächlich geöffnete aktuelle PNG zeigt freundlich gezeichnete Pflanzen- und Tierzellen mit beschrifteten Organellen und darunter zwei Endosymbiose-Abläufe. Ein elektronenmikroskopischer Zellbild-Ausschnitt fehlt. Ein neuer Bildkandidat ist in Arbeit. Der vorbereitete fc8c-Einzelziel-D-v1-Buchabzug bindet noch die alte Bildseite und darf nicht für eine Abschlussentscheidung verwendet werden.

## Atlas-Handoff

Ein nicht schreibender Atlas-Build mit den versionierten HE-v3-/NI-v2-Mapping-Kandidaten für 0dd ergibt 362/362 projizierte `curricularAtomic`-Ziele, 20 Source-Views, 0 ungelöste Scope-Entscheidungen und 0 ausgelassene Ziele. Bytevergleich aller 23 generierten Ausgaben gegen die aktiven Dateien: **Nur** `source-projection.receipt.json` unterscheidet sich. Manifest, Navigation und alle 20 Source-Views bleiben byte-identisch. Die Aktivierung kann daher gemeinsam als gezielter Wechsel der zwei Pfade in `de-gym-biology-national-atlas.inputs.json` plus neu erzeugtem Receipt erfolgen. Sie ändert die Buch-/Seitenprojektion für fc8c und 0dd nicht; diese Aussage gilt für genau die geprüften Kandidaten und den geprüften kanonischen Stand.

## Ledger- und Fünf-Gate-Handoff

1. Nach fachlicher und visueller Prüfung des **tatsächlichen** neuen fc8c-Bildes zuerst aktive kanonische/Web-/Backend-Bildbindung und exakte maschinelle V-QA aktualisieren. Zieltext, Alttext, Bildinhalt und mobile/PC-Lesbarkeit gemeinsam prüfen. Erzeugung ist keine Freigabe.
2. Die bereits vorbereitete fc8c-D-v1-Kampagne mit altem Bildkontext historisch stehen lassen. Für das neue Bild einen neuen versionierten Einzelziel-D-Durchgang vorbereiten und zwei unabhängige Reviews am aktuellen Ziel-/Seiten-Fingerprint durchführen. P-v2 benötigt ebenfalls die dann aktuelle Text- und Bildbindung sowie unabhängige Inhalts-QA.
3. Das In-flight-Ledger führt momentan das ältere E1-Neunerpaket, das fc8c enthält; die fc8c-Einzelkampagne und das 0dd-Einzelziel fehlen. Bei der nächsten Paketübergabe eindeutige aktive Zuständigkeiten herstellen: fc8c aus einem versionierten Restpaket ausklammern oder das Neunerpaket als überholt aus dem Ledger nehmen, falls seine anderen Ziele bereits abgeschlossen sind; die neuen Einzelziel-Konfigurationen für offene fc8c/0dd aufnehmen. Historische Pakete bleiben auf Datenträger erhalten.
4. Die zentrale Registry enthält bereits eine genaue `resolutionWithdrawals`-Zeile für die alte fc8c-D-Resolution. Diese schützt vor Wiederzählung und bleibt erhalten. Nach strenger neuer D/P/A/M/V-Prüfung den frischen fc8c-Index ergänzen; alte Artefakte nicht überschreiben. Human-Release-Gates bleiben separat. Für 0dd gilt derselbe Integrationsgrundsatz ohne bestehende Withdrawals-Zeile.

Keiner dieser Übergabeschritte zählt fc8c oder 0dd jetzt streng als abgeschlossen.
