# Physik Libre 1.1.0 — thematisch erweiterte Verlinkung

Prüfstand: **21. September 2026**. Lokaler Rollout-Kandidat; noch kein Deployment
oder Real-Claude-Abnahmenachweis.

## Ergebnis und Nutzung

**222 gezielte Abschnittsverweise unterstützen 280 von 478
aktuellen fachlichen Physik-Einzelzielen** auf 117 Buchseiten.
Die vier ursprünglichen Kinematikverweise bleiben enthalten. Neu hinzu kommen
Methoden, Kräfte/Energie, Gravitation/Rotation, Elektrizität/Elektromagnetismus,
Schwingungen/Wellen/Optik, Wärmelehre/Fluide und ausgewählte moderne Physik.
Ein passender Zusatztext bedeutet nicht, dass er die gesamte Kompetenz abdeckt.

Der stabile Paketname bleibt `physik-libre-gymnasium`. Bereits gespeicherte
Auswahlen erhalten nach dem Backend-Rollout die erweiterte Fassung, ohne dass
Lernende das Paket erneut auswählen müssen. Neue Profile bleiben ohne Opt-in.
Konfiguration: **Zahnrad → Mein Lehrplan → Zusätzliche Lernmaterialien**.
Am verknüpften Lernziel erscheinen weiterhin nur Inhaltstyp-Icon und Linktitel.
Alle Materialien sind deutschsprachig; die englische Paketbeschreibung ist keine
Behauptung einer englischen Buchausgabe. Der Coach nutzt dieselbe Zuordnung.

Version `1.0.0` bleibt als ausgerollter Pilot unverändert erhalten. Lediglich
`content/catalog.json` wählt die neue Version. Curriculum, Lernplan,
Voraussetzungen, Mastery und M7-Nachweise werden nicht verändert.

## Was geprüft wurde — und was nicht

- Der aktuelle öffentliche Buchindex wurde inventarisiert; 210 Inhaltsseiten
  wurden ohne Lernendeninformationen abgerufen. Die Fachzuordnung entstand
  durch Vergleich konkreter Abschnitte mit aktuellen Lernzielbeschreibungen,
  nicht durch automatisch übernommene Stichworttreffer.
- Jeder Materialeintrag nennt genaue Abschnittsanker und eine KI-Prüfbegründung.
  Teilabdeckungen sind ausdrücklich benannt. Die Weiterarbeit, das Experiment
  und der Kompetenznachweis bleiben beim Lernprozess.
- Fehlerhafte oder unpassende Abschnitte werden nicht als Lückenfüller empfohlen.
  198 Ziele haben deshalb weiterhin keinen ausgewählten Physik-Libre-Link.
  Das ist eine Inhaltsgrenze dieses Pakets, **kein offener M7-Prüfpunkt**.
- Die Fachreviews dokumentieren Lücken und Quellenprobleme:
  [Mechanik/Methoden](reviews/mechanics.md),
  [Elektrizität](reviews/electricity.md),
  [Optik/moderne Physik](reviews/modern.md),
  [Wärmelehre/Fluide](reviews/thermal.md).
  Die unabhängigen risikobasierten Nachprüfungen stehen daneben.
- Als abschließende Korrektur wurde der gruppierte Weltbild-Verweis vollständig
  zurückgestellt: Chronologie und historische Bewertung werden durch den
  konkreten Quellentext nicht verlässlich genug unterstützt. Das
  Aggregatzustandsziel verwendet nach Zweitprüfung den Teilchenmodellabschnitt.
- [mapping-review.json](mapping-review.json) hält Zählbasis, Quellseiten-Hashes
  und alle noch unverknüpften Ziel-IDs fest. Die Hashes dokumentieren den
  gelesenen Stand, nicht eine unveränderliche Zusicherung externer Inhalte.

Die Zuordnung ist keine menschliche Freigabe, Anbieterkooperation oder pauschale
Prüfung des gesamten Buches. Auch neben einem verlinkten, geeigneten Abschnitt
können ungeprüfte oder fehlerhafte Passagen stehen. Es werden keine Buchtexte
kopiert, keine Quellen für den Lehrplan ersetzt und keine Nutzungsrechte für
KI-Inhaltsübernahme behauptet: `public-link`, `link-only` bleiben unverändert.

## Regressionsprüfungen

`node scripts/validate_content_packages.mjs` und der zugehörige Node-Test
prüfen Schema, stabile Auswahl-ID, erhaltene Pilotverweise, aktuelle fachliche
Ziel-IDs, doppelte Links und die Resolver-Grenze von vier Links je Ziel.
`node scripts/validate_content_packages.mjs --check-links` prüft live HTTP,
HTML und jeden Fragmentanker; dies bleibt eine Autorprüfung, kein Netz-Zwang in
CI oder beim Lernen. Backend-Contenttests sichern Auflösung und optionales Opt-in,
Frontendtests die kompakte Darstellung und Einstellungen ab.
