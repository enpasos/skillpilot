# Bio Neuro21: Bildplan und erste sieben Autorenkandidaten

Rolle: Bildautor. Dieses Paket enthält keine unabhängige V-Freigabe, keine menschliche Freigabe, keinen aktiven Import und keinen neuen strict Abschluss.

## Rohes Reviewrouting

`first-seven/first-seven-whole-goal-material-source-original-raster-native-routing.author.raw.json` bindet die sieben ausgewählten unveränderten Generator-PNGs, alle ganzen stage02-DE/EN-Ziele, je beide vollständigen Referenzmaterialien, tatsächliche eingefrorene Quellenbindungen, verwendete Prompts, alle vorherigen Generatorversuche sowie native Import-Dry-runs. Die Providerbezeichnung ist ausdrücklich `OpenAI / ChatGPT-Codex image generation`; das tatsächliche Tool ist builtin image_gen. Die konkrete Modellversion wird vom Tool nicht offengelegt und bleibt unbekannt. Eigenes Bildmaterial: CC-BY-4.0.

Das erste Paket umfasst ce19, 1b38, e3fb, 04d7, ff1, e111 und f628. Alle sieben Primärbilder fehlten. Gute erste Outputs für ce19, 1b38 und f628 bleiben bytegenau ausgewählt. Bei e3fb wurden die falsche K⁺-Pumpenrichtung und die Kleinschrift tatsächlich korrigiert; bei 04d7, ff1 und e111 wurden konkrete Lesbarkeits-/Zuordnungsprobleme gezielt bearbeitet. Alle zwölf tatsächlichen builtin Calls, Originaloutputs und historischen Anzeigen bleiben erhalten. Keine programmgenerierten Bilder, SVGs, externe Generator-CLI oder Bildbearbeitung außerhalb builtin image_gen.

## Tatsächliche Reihenfolge

Die ersten sieben Generierungen, eine Pumpenkorrektur und zwei Typografiekorrekturen liefen **vor** dem vorgeschriebenen nativen `visualization:prepare`. Das war eine Workflow-Abweichung; sie wird weder rückdatiert noch als fachlicher Defekt eines guten Rasters ausgegeben. Die native Vorbereitung wurde anschließend siebenmal mit dem echten Provider gegen den eingefrorenen stage02-Kanon ausgeführt, bevor die letzten beiden Korrekturen und sämtliche Import-Dry-runs liefen. `first-seven/native-prepare-after-actual-initial-generation/seven-native-preparations.actual.receipt.json` enthält echte Befehle und Zeitpunkte. Der Kanon blieb bytegenau unverändert.

Sieben unveränderte native `visualization:import --dry-run` liefen nach der abschließenden Sichtung mit aktuellem tatsächlichem Prompt, begrenztem Bildalttext, explizitem Provider und CC-BY-4.0. Ihre 21 möglichen Installationspfade stammen aus dem Produktionshelper; keine Ressourcenmetadaten wurden von Hand erstellt und keine Installationskopie wurde geschrieben.

## Autorensichtung und Grenzen

Alle sieben finalen PNGs wurden in voller Größe sowie bei tatsächlichen **Bildbreiten** 360 und 680 Pixeln gesehen. Die isolierte Anzeige übernimmt `display:block;height:auto;max-height:448px;width:100%;object-fit:contain` aus GoalCard. Die Bildboxen sind exakt 360/680 Pixel breit, ohne Verwechslung mit einem gepolsterten Container. Original-PNGs wurden dabei nicht verändert. Screenshots, HTML-Fixtures und reale Browsergeometrie liegen unter `first-seven/author-displays/final-current-seven/`. Dies ist eine Autorensichtung, keine vollständige App-, Buch-, unabhängige V- oder Human-Akzeptanz.

Die Bilder zeigen jeweils begrenzte Modelle. Die vollständigen Ziel- und P-Leistungen werden nicht auf Bildbeispiele reduziert; weder Diagramme noch Referenzmaterialien sind echte Lernenden- oder Messnachweise. Die drei Modelle Hebb 4f63, Netzänderung a46c und LTP/LTD c9a0 werden separat vom Root-Bildautor erzeugt und wurden hier nicht generiert. 080b bleibt vor Generierung wegen einer möglichen aktuellen P-Fallkorrektur ausdrücklich offen. Der kompakte 21er Plan bewahrt alle übrigen Ziele für spätere getrennte Pakete. Sämtliche ursprünglichen Quellen-/Landesscope-HOLDs bleiben bestehen. Unabhängige V-A/V-B-Reviews fehlen; strict Gewinn 0.
