# Physik B038: unabhängige Sichtprüfung der ersten Bildkandidaten

Datum: 06.09.2026. Prüfer: Codex-Unteragent `physics_b038_image_audit`.
Autorität: tatsächlich durchgeführte fachliche AI-Sichtprüfung; **keine neue
menschliche Freigabe**. Diese Notiz importiert keine Datei und verändert weder
die kanonischen Verknüpfungen noch das zentrale Bild-QA-Ledger.

Zuerst wurden alle sechs aktiven Original-JPGs tatsächlich angesehen und gegen
die aktuellen kanonischen Zielbeschreibungen sowie die beiden vorhandenen
B038-Beschreibungsreviews abgeglichen. Anschließend wurden die sechs hier
archivierten Kandidaten vollständig mit `view_image` angesehen. Originale,
Originalprompts, vorherige kanonische Ziel-/Linkdaten und vorherige QA-Datensätze
liegen jeweils in `original/`. Pro `candidate-1/` bindet `archive-receipt.json`
die sieben exakten Bild-/Provider-/Rekonstruktionsdateien mit SHA-256 und Länge.
Die vorhandene Rekonstruktionsdatei des c020-Originals wurde mitgesichert; bei
den übrigen fünf Originalen existierte vor dieser Arbeit keine solche Datei.

## Entscheidungen

- **c0205f47-185c-5e27-b89c-c3ff8809b1d1 — REJECT.**
  Kandidat SHA-256 `b10a1bbd0bfdc200b94b7fefa0637deb7773827fad1b2de2c83eae07c8ba5fbf`.
  Die neue Zeile zur gleichen Kraftamplitude ist richtig, die beiden Kurven
  starten jedoch weiterhin bei verschiedenen statischen Amplituden und kreuzen
  sich zweimal. Der belegte Diagrammfehler ist nicht behoben. Kein Import.
- **a7255b83-336c-4d42-ba5c-bc2f6248ea36 — REJECT.**
  Kandidat SHA-256 `585d27c93d1da6ca7713687832c50df7e50df96124c7e159ca9966640fea34ae`.
  `Gezeigt: φ=0` ist ergänzt, aber die blaue elektrische Energiekurve beginnt
  weiterhin bei null und die grüne magnetische bei maximaler Energie, entgegen
  den eigenen cos²-/sin²-Beschriftungen und dem gezeichneten anfänglichen
  Ladungsmaximum. Der erforderliche Farbtausch blieb aus. Kein Import.
- **5da7d4d0-878e-44fd-b398-1b1de8b636a4 — ACCEPT AI.**
  Kandidat SHA-256 `2406367b71adc03eca78a0f6de8b4e30e68c3669a744e71b47b1ad75e0d53e18`.
  Die obere Kondensatorplatte trägt jetzt auch innen drei Pluszeichen; die
  untere bleibt negativ. Damit ist die widersprüchliche Ladungsdarstellung
  beseitigt. Schwingkreis, Öffnungsidee, Dipol, Stil und vorhandene Wellenbögen
  bleiben erhalten. Die Bögen sind ein qualitatives Abstrahlungssymbol, keine
  maßstäbliche Richtcharakteristik. Kein weiterer Änderungsbedarf.
- **a844895e-2cdc-4665-aad2-a49c62f11759 — REJECT.**
  Kandidat SHA-256 `60d2a406702231bc4035998cc2034217ffd6c3f6682135f10194f7080c29d0cd`.
  Zeitnotation und Kondensatorpolarität bei der halben Periode wurden repariert.
  Der rechte Geschwindigkeitspfeil bei t=T/4 bleibt jedoch trotz positiver
  x-Richtung nach links mit positivem v_max beschriftet. Zusätzlich entstanden
  neue Formeldefekte: unten links steht in der Federenergie v_max statt x_max;
  im elektrischen Energiesatz bei t=T/2 taucht v_max statt q_max auf. Die
  Strombeschriftung bei t=T/4 ist zudem verstümmelt. Kein Import; gezielte
  Korrektur dieser konkreten Zeichen und unveränderte Kontrolle aller Formeln.
- **5c57dbc7-d258-4aad-a84c-e773f3c493ae — ACCEPT AI.**
  Kandidat SHA-256 `e323ef71e0c708d05bde17b39b4110e25881c0e43f3a47bd57282fe57c916b4f`.
  Das dichteste zentrale Trefferband liegt jetzt neben dem größten Gipfel;
  die beiden weiteren ausgeprägten Bänder erhalten passende kleinere Gipfel.
  Vertikal steht korrekt `Ort x`, horizontal `p(x)`. Die vorherige zentrale
  Maximum/Minimum-Verwechslung und die falsche Achsenzuordnung sind behoben.
  Die vereinzelteren diffusen äußeren Treffer sind im qualitativen
  Wahrscheinlichkeitsbild bei kleinen, nicht numerisch als null ausgewiesenen
  Wahrscheinlichkeiten zulässig. Das Bild behauptet keine quantitativ kalibrierte
  Histogramm-/Dichte-Übereinstimmung. Quelle, zwei Spalte, durchgestrichene
  klassische Bahn und Stil bleiben erhalten; kein weiterer Erzeugungslauf nur
  zur stilistischen Glättung oder exakten Histogrammanpassung.
- **c64820e1-c0ee-4342-9225-f981650f0c52 — ACCEPT AI.**
  Kandidat SHA-256 `ab0ebcc0f082ae7c8e789d765e99b16121522ffb517b8a7910d3750cbeae045c`.
  Der Einzelspalt-Minimakasten nennt jetzt ausdrücklich
  `m=±1, ±2, … (m≠0)`. Die übrige Fernfeldgeometrie und die separat dargestellten
  Doppelspaltmaxima mit m=0 bleiben intakt. Der belegte fehlende Formelbereich
  ist damit lokal korrigiert.

## Abgrenzung

Die zusätzlich gezielt kontrollierten Originale `2c6af966` (qualitative
Interferenzmuster) und `5f97952e` (gleichphasige ohmsche Zeiger) bleiben KEEP.
Ihre schematische Abstraktion beziehungsweise gemeinsam lesbare Drehrichtung
begründen keinen nachgewiesenen fachlichen Austauschbedarf. Diese Kontrollen
und die vorliegenden Beschreibungs-KEEP-Entscheidungen verleihen keine neue
menschliche Bildfreigabe. Die drei ACCEPT-AI-Kandidaten müssen vor einer
Veröffentlichung vom zuständigen Autor seriell importiert und mit neuen
hashgebundenen AI-Nachweisen versehen werden; alte Freigaben gelten nur für
die archivierten alten Bildbytes.
