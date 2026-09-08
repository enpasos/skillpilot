# Lernzielvisualisierung: p-n-Übergang und Diode

## SkillPilot-Ziel

- SkillPilot-ID: `7f0798cb-5966-5dcb-beb3-84f637ab6139`
- Titel: p-n-Übergang und Diode
- Beschreibung: Die lernende Person kann den p-n-Übergang qualitativ beschreiben, Kennlinien von Dioden experimentell bestimmen und einfache Gleichrichterschaltungen erläutern.

## Generator

- Provider: SkillPilot / reviewed repo-native SVG
- Status: accepted
- Quellbild: `7f0798cb-5966-5dcb-beb3-84f637ab6139.png`
- Public Asset: `/assets/goal-visualizations/physik/7f0798cb-5966-5dcb-beb3-84f637ab6139/7f0798cb-5966-5dcb-beb3-84f637ab6139.png`

## Prompt

```text
Erstelle eine eigenständige, vollständig lesbare deutschsprachige Physik-Lernübersicht im Querformat 1600 × 900 Pixel. Sehr heller blaugrauer Hintergrund, weiße abgerundete Inhaltsfelder mit dünnen blaugrauen Rändern. Dunkelblaue serifenlose Schrift, bevorzugt DejaVu Sans; Titel etwa 36 Pixel, Paneltitel 26–30 Pixel, Erklärungstexte überwiegend 20–23 Pixel. Funktionskurven blau, ausgewählte Gegenkräfte beziehungsweise Ausgangssignale orange. Keine Fotografien, dekorativen Formeln, Logos, technischen IDs oder internen Layoutmaße im Bild. Alle Wörter, Indizes und mathematischen Zeichen vollständig und ohne Überlagerung rendern. Die folgenden Angaben beschreiben eine bereits tatsächlich betrachtete kontrollierte Diagrammfassung; ihre Beziehungen dürfen nicht durch bloß plausible Freihandgeometrie ersetzt werden.

Titel: „Diode: vom pn-Übergang zum Einweggleichrichter“. Oben links ein breites Halbleiterpanel, oben rechts ein Kennlinienpanel; unten ein durchgehendes Schaltungs- und Signalpanel.

OBEN LINKS: Überschrift „1 · pn-Übergang: Ladungen und Barriere“. Ein horizontaler Halbleiterstreifen ist von links nach rechts unterteilt in p-Außenbereich, p-seitige Raumladungszone, n-seitige Raumladungszone und n-Außenbereich. p rötlich, n bläulich. Beschrifte außen „p: quasineutral“ und „n: quasineutral“, mittig „Raumladungszone“. Die Grenze zwischen p und n ist klar, ebenso die zwei Außenränder der Raumladungszone.
Stelle mobile Ladungsträger als Kreise, ortsfeste Dotierionen als Quadrate dar. Im p-Außenbereich exakt sechs positive Kreise und sechs negative Quadrate, im n-Außenbereich exakt sechs negative Kreise und sechs positive Quadrate. Damit sind beide Außenbereiche erkennbar ladungsausgeglichen; keine Wolken mit einseitigem Ladungsüberschuss zeichnen. In der p-seitigen Raumladungszone sechs negative ortsfeste Ionen, in der n-seitigen sechs positive ortsfeste Ionen, keine mobilen Mehrheitsträger. Die Anzahlen sind eine qualitative Symbolbilanz, keine maßstäbliche Dichteangabe.
Vollständige Legende darunter:
„Kreise: mobile Löcher (+) / Elektronen (−).“
„Quadrate: ortsfeste Akzeptorionen (−) / Donatorionen (+).“
„Zone: kaum freie Ladungsträger; die Ionen bleiben zurück.“
Danach die zwei unvertauschten Polungsregeln:
„Durchlass: p an +, n an − → Barriere kleiner“
„Sperrung: p an −, n an + → Barriere größer“

OBEN RECHTS: Titel „Diodenkennlinie (schematisch)“. Horizontale Achse U_D, vertikale Achse I_D, beide positive Richtung rechts beziehungsweise oben. Für negative Spannung ein kleiner negativer Sperrstrom nahe der Achse; bei positiver Spannung ein zunächst kleiner, dann stark ansteigender positiver Durchlassstrom. Kein Durchbruch und keine feste universelle Schwellspannung behaupten. Labels „Sperrstrom klein“ und „Durchlassstrom stark zunehmend“ stehen lesbar abseits der Kurve.
Darunter: „U an der Diode, I durch die Diode messen.“ und „Strom begrenzen; sichere Kleinspannung.“

UNTEN: Überschrift „2 · Einweggleichrichter (ideale Diode)“. Links ein tatsächlich geschlossener Serienkreis: sinusförmige Wechselspannungsquelle links, Diode in der oberen Leitung mit Anode links und Kathodenstrich rechts, Lastwiderstand R rechts und durchgehender Rückleitung unten. Das Diodensymbol berührt den Kathodenstrich, keine scheinbar offene Kontaktlücke. Keine Brücke und kein Glättungskondensator ergänzen.
u_in an der Quelle und u_out am Lastwiderstand jeweils mit Bezugspolung oben +, unten − kennzeichnen. Der Quellkreis enthält ein Wechselspannungssymbol. Text: „±: Bezugspolung; die Quelle ist eine Wechselspannung.“ Die Plus-/Minuszeichen sind keine Behauptung einer zeitlich konstanten Quellspannung.

Rechts zwei exakt übereinander ausgerichtete Zeitdiagramme, oben u_in, unten u_out. Beide haben dieselbe horizontale Zeitachse von 0 bis T; T/2 ist durch eine gemeinsame senkrechte gestrichelte Hilfslinie markiert.
Obere blaue Eingangskurve: genau eine Sinusperiode, positive Halbwelle von 0 bis T/2, negative Halbwelle von T/2 bis T.
Untere orange Ausgangskurve: von 0 bis T/2 genau dieselbe positive Halbwelle wie oben; von T/2 bis T eine exakt waagerechte Linie auf der Nulllinie. In der zweiten Hälfte KEINE zweite positive Halbwelle. Beschrifte die erste Hälfte „leitend“, die zweite „gesperrt: u_out = 0“. Beide Signalnullstellen und der gemeinsame Zeitpunkt T/2 müssen übereinstimmen.
Vollständiger Fußtext: „Ohne Glättung: Die positive Halbwelle bleibt; während der negativen Halbwelle ist der Ausgang null.“
Die idealisierte Gleichrichterschaltung unten und die qualitative reale Kennlinie oben sind getrennt gekennzeichnet. Keine gefährliche Netzspannung, falsche Sperrrichtung, erfundenen Gerätewerte oder fachlichen Zusatzpanels ergänzen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
