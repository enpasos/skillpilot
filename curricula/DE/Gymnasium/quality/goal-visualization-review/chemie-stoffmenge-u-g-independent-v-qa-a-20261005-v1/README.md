# Unabhängige V-Prüfung A: u/g-Korrekturkandidat v1

**Bildentscheid: HOLD.** Die fachliche Darstellung und Zahlen stimmen.
Der konkrete verbleibende Befund betrifft die Handyansicht: In der tatsächlich
angesehenen `preview-360-v1.png` ist „schematisch“ direkt unter der rechten
Atomgruppe nur etwa 5–6 Pixel hoch und ohne Vergrößerung nicht zuverlässig
lesbar. Diese Kennzeichnung unterscheidet die gezeichnete kleine Gruppe von
der bezeichneten Molportion und soll auch auf 360 Pixel Breite lesbar sein.

Eine begrenzte Korrektur kann diese Kennzeichnung vergrößern oder in die rechte
Panelbeschriftung aufnehmen. Die geprüften Werte, beide Einheiten auf beiden
Ebenen, Näherungszeichen und Größenordnungen sollen dabei erhalten bleiben.
Diese Prüfung hat keine Bildänderung oder aktive Import-/QA-Mutation vorgenommen.

## Eingefrorener Bildbefund

- Ziel: `dd3fc8fe-2316-5fbc-b569-00651c83bc81`.
- Original: `candidate-v1.png`, 1672×941 Pixel, RGB/PNG.
- Kandidat-SHA256: `d6e2bcbd6a03b6111a72c39c4d30a35bebd018002e0c4d4a94347378874910c6`.
- Tatsächliche Vorschauen: 360×203 und 680×383 Pixel.
- `frozen-image-review.json` SHA256:
  `e79d07b3abb9d472ae72ee1ab31b52a730fb1db0bb1573ce20cb5748498a7bab`.

Alle drei Dateien wurden zuerst mit `view_image` bei Originalauflösung
angesehen. Prompt, Generierungsrequest, Terminal-Receipt und fremde Verdicts
waren bis zum Freeze ungelesen. Die gespeicherte Entscheidung ist unabhängig
von der späteren Provenanzprüfung und wurde danach nicht geändert.

Fachlich bestanden wurden:

- u und g beschreiben auf beiden Ebenen dieselbe Massengröße;
- das einzelne C-12-Atom trägt `12 u` und `≈ 2,0 · 10⁻²³ g`;
- die Molportion trägt `≈ 7,2 · 10²⁴ u` und `≈ 12 g`;
- alle drei gerundeten Angaben tragen `≈`; der negative Exponent `−23`
  und der positive Exponent `24` sind korrekt und auch auf 360 Pixel Breite erkennbar;
- der Pfeil stellt Teilchenzahl mal Teilchenmasse dar;
- abstrakte C-12-Kugeln, zwei klare Panels und freundlicher Blau/Gelb-Stil passen
  zum Sek-I-Ziel; Hauptinformationen sind im Original und auf 680 Pixel Breite lesbar;
- keine abgeschnittenen Hauptinhalte, Rechenzeichenfehler oder beschädigten Werte.

Die modellbezogene Kennzeichnung ist im Original sichtbar, in der kleinen
Handyvorschau jedoch zu klein. Die Hauptwerte und Haupttexte sind dort lesbar;
der HOLD betrifft gezielt diese zusätzliche Modellkennzeichnung.

## Fachliche Gegenprüfung

Aus dem aktuellen [BIPM-Molbegriff](https://www.bipm.org/en/si-base-units/mole)
folgt die genaue Anzahl `6,02214076 · 10²³` spezifizierter Einheiten pro Mol.
Die [NIST-CODATA-Werte 2022](https://physics.nist.gov/cuu/pdf/all.pdf) geben
`1 u ≈ 1,66053906892 · 10⁻²⁴ g` an. Daraus ergeben sich für C-12:

- einzelnes Atom: `1,992646882704 · 10⁻²³ g`, passend zu `≈ 2,0 · 10⁻²³ g`;
- ein Mol Atome: `7,226568912 · 10²⁴ u`, passend zu `≈ 7,2 · 10²⁴ u`;
- ein Mol Atome: ungefähr `12,0000000126 g`, passend zu `≈ 12 g`.

Die Definition der atomaren Masseneinheit über das freie C-12-Atom im Grundzustand
wurde außerdem in der aktuellen [BIPM-SI-Broschüre](https://www.bipm.org/documents/20126/41483022/SI-Brochure-9.pdf/fcf090b2-04e6-88cc-1149-c3e029ad8232?download=true&t=1780473476314&version=6.1)
nachgesehen. Detaillierte Rechnungen und Quellenverwendung stehen im eingefrorenen Bericht.

## Separate Prüfung nach dem Freeze

`post-freeze-provenance-review.json` dokumentiert einen **PASS für die gespeicherte
Request-/Prompt-/Receipt-Konsistenz**. Der Bildentscheid bleibt HOLD.

Der gespeicherte Request und die Promptdatei stimmen überein. Referenzbild und
Provider-Ausgabedatei existieren. Die Provider-Ausgabedatei ist bytegleich mit
dem geprüften Kandidaten; SHA256, 1672×941 Pixel, PNG und opaker RGB-Modus stimmen
mit dem Terminal-Receipt überein. Die Promptzeichenfolge enthält keine Ziel-ID.
Die Modell-ID ist wahrheitsgemäß als nicht vom eingebauten Tool exponiert angegeben.
Publikations- oder menschliche Freigabeclaims sind nicht vorhanden.

Das gespeicherte `generation-observed-terminal-v1.receipt.json` meldet
`generationObservedTerminal: success` für Exec-Zelle `347` und nennt die
tatsächlich vorhandene Ausgabedatei. Sein SHA256 lautet:

`8637a293e92356c07a0dbca1aa378dd7ab73642a86ad47e20c1b0bd39ee7018f`

Diese V-Prüfung hat den ursprünglichen Generierungstool-Aufruf nicht selbst
beobachtet oder den historischen Exec-Status neu abgefragt. Bestätigt wurden
der gespeicherte Observer-Bericht und die dazu passenden tatsächlichen Dateibytes.
Es wird keine konkrete API-Modell-ID oder ein nicht beobachteter Parameter erfunden.
Der nach dem Freeze gelesene Prompt fordert ausdrücklich eine lesbare
Modellkennzeichnung auf 360 Pixel Breite; der bereits festgestellte HOLD bleibt bestehen.

Die frühere B013-D-Runde ist unverändert; ihr Frozen-Receipt-SHA256 bleibt
`998453b4d22c229ad3b8b13a26f9448dfeed82ab2b0ba2b060142671f3cb36df`.
Alle Ergebnisse sind AI-Kandidaten. Es wurde keine menschliche Freigabe erteilt.
