# Chemie B010: unabhängige Prüfung zweier inaktiver PNG-Kandidaten

Stand: 2026-10-05. Prüfer: Codex, unabhängiger Prüfagent
`chem_b010_independent_visual_qa`; an Erzeugung und Autorentriage der
Kandidaten nicht beteiligt.

**Beide Bilder: PASS_CANDIDATE_ONLY.** Diese tatsächliche fachliche und
visuelle AI-Prüfung ist keine aktive V-Freigabe, keine menschliche Freigabe
und kein strenger D/P/A/M/V-Abschluss. Keine kanonischen Ziele, aktiven
Bilder, QA-Gates, Registry-Einträge oder In-flight-Claims wurden verändert.
Nettozuwachs strenger Abschlüsse: **0**. Wiederhergestellte aktive Bindungen:
**0**.

## Prüfgrundlage und tatsächliche Ansichten

Gelesen wurden die einschlägigen Regeln in `AGENTS.md`, insbesondere
Abschnitt 7.3, die Format-, Qualitäts- und Freigaberegeln in
`docs/concept/skill-graph/atomic-goal-visualizations.md`, die beiden
Erzeugungsnotizen samt tatsächlichen Providerprompts sowie der
[B010-Reparaturvorschlag](../../goal-description-review/chemie/rollout-v1/2026-10-01/b010-element-groups-repair-candidate-v1.md).
Der ältere unabhängige Reparaturbefund wurde als dokumentierter
Korrekturanlass gelesen; er ersetzt diese Prüfung der neuen PNGs nicht.

Die kanonischen DE/EN-Felder wurden für beide aktuellen IDs gelesen. Sie
enthalten weiterhin die alten, breiteren Beschreibungen; die engeren
Vergleichsbeschreibungen sind Vorschläge. Diese Kandidatenprüfung behauptet
keine bereits gültige neue Zielbindung.

Die **tatsächlichen PNG-Dateien** wurden vollständig in nativer Auflösung
angesehen, danach in separat skalierten Ansichten mit exakt 360 und
680 Pixeln Breite. Die vier nebenstehenden `*-inspection.png` sind reine
Prüfansichten mit proportionaler Lanczos-Verkleinerung. Sie sind keine
Ersatzbilder und wurden nicht in Lernendenoberflächen importiert. Eine
Browser-, Geräte- oder Hostprüfung wird daraus nicht behauptet. Die alten
JPGs wurden zusätzlich als konkrete Stilreferenzen angesehen.

| Kandidat | SHA-256 der geprüften Originaldatei | Format und Größe | Tatsächlich geprüfte Ansichten | Urteil |
| --- | --- | --- | --- | --- |
| Wasservergleich, Versuch 2 | `4d9f5072930bb31e56188b21353f677f6cd6971e5602375a1b53de1925c1555c` | PNG/RGB, 1672 × 941, 1 347 289 Bytes | nativ; 360 × 203; 680 × 383 | **PASS_CANDIDATE_ONLY** |
| Halogen-Stoffidentität, Versuch 1 | `a358e181bab0c963c63169b29028d078f938905111c0e6c196e560140b7646f9` | PNG/RGB, 1672 × 941, 1 369 900 Bytes | nativ; 360 × 203; 680 × 383 | **PASS_CANDIDATE_ONLY** |

Originaldateien:

- [Wasservergleich v2](../chemie-b010-water-comparison-candidate-20261004-v1/candidate-v2.png)
- [Halogen-Stoffidentität v1](../chemie-b010-halogen-identity-candidate-20261004-v1/candidate-v1.png)

Beide Original-SHAs stimmen mit dem Prüfauftrag und den Erzeugungsnotizen
überein. Das Verhältnis 1672:941 entspricht ungefähr 16:9. Die Formatwahl
ist mit dem geltenden Standard vereinbar; die tatsächlichen kleinen
Ansichten stützen diese Entscheidung. Eine Umformatierung ist nicht nötig.
Die freundlichen Cartoonformen, kräftigen Konturen und blauen beziehungsweise
türkisen Farben passen zu den vorhandenen, tatsächlich angesehenen
Stilreferenzen. Keine Fotorealistik, technischen IDs, Wasserzeichen,
Markenlogos oder erkennbaren fremden Arbeitsblätter sind sichtbar.

## 1. Wasservergleich — `16a80de2-b5e0-5467-a9b3-5860730d7d8b`

### Fachliche Prüfung

- Die linke Natriumprobe schneidet die sichtbare Wasseroberfläche; sie liegt
  nicht vollständig unter Wasser. Die Flamme ist oberhalb der Oberfläche.
  Die Blasen und das H₂-Symbol sind dem Metallweg zugeordnet. Damit ist der
  dokumentierte entscheidende Fehler des alten JPGs tatsächlich behoben.
  Die [Royal Society of Chemistry](https://edu.rsc.org/experiments/reactivity-trends-of-the-alkali-metals/731.article)
  beschreibt schwimmendes, reagierendes Natrium und eine mögliche
  Entzündung. Die sichtbare Flamme ist eine schematische Möglichkeit, keine
  Behauptung, dass Natrium stets oder unter Wasser brennt.
- Beide Gleichungen sind stofflich und stöchiometrisch richtig:
  `2 Na + 2 H₂O → 2 NaOH + H₂` und `Na₂O + H₂O → 2 NaOH`. Die erste
  besitzt je zwei Na- und O-Atome sowie vier H-Atome auf beiden Seiten;
  die zweite je zwei Na-, zwei H- und zwei O-Atome. Beim dargestellten
  einfachen Oxid entsteht kein H₂. Die
  [ILO/WHO-Karte für Natriumoxid](https://chemicalsafety.ilo.org/dyn/icsc/showcard.display?p_card_id=1653&p_lang=en)
  bestätigt das weiße feste Erscheinungsbild, die Reaktion mit Wasser und
  das Produkt Natriumhydroxid.
- Der Na₂O-Haufen liegt klar in einer separaten Schale außerhalb des
  rechten Bechers. Schale und Pulver überlappen weder Flüssigkeit noch
  Wasseroberfläche. Der in Versuch 1 neu entstandene Eindruck eines
  schwimmenden Oxidhaufens ist damit behoben. Versuch 1 bleibt historisch
  inaktiv; sein HOLD wird nicht umgedeutet.
- Rechts sind keine Gasblasen und keine Flamme zu sehen. Die rechte
  Darstellung kombiniert eine beschriftete Ausgangsprobe neben dem Becher
  mit einer schematischen Ergebnislösung. Gleichung und gemeinsame
  Ergebniszeile machen diesen Vergleich nachvollziehbar. Sie ist kein
  Zeitprotokoll und zeigt keinen Arbeitsschritt des Einfüllens.
- `Na⁺` und `OH⁻` sind korrekt beschriftet; die Aussage zu OH⁻ und
  alkalischer Lösung ist richtig. Die blaue Flüssigkeit ist eine
  durchgängige schematische Wasserfarbe, kein Nachweis einer blauen
  Natriumhydroxidlösung. Diese Abstraktion ist für die Orientierung
  tragfähig. Keine Geräteablesung, Mengenangabe oder Versuchsanweisung ist
  dargestellt.

### Lesbarkeit und Zielbezug

Bei 680 Pixeln sind beide Gleichungen, Tiefstellungen, Ionenladungen,
H₂-Symbol und Ergebniszeile klar lesbar. Bei 360 Pixeln bleiben der
Oberflächenkontakt, die Flamme oberhalb des Wassers und die getrennte
Oxidschale erkennbar. Beide Reaktionsgleichungen und die gemeinsame
OH⁻-Aussage bleiben ohne Vergrößerung lesbar; das kleinere Na₂O-Schild an
der Schale ist durch die große Gleichung redundant. Der Kontrast stützt
die vorgeschlagene Leistung, vorgegebene Daten zu Metall/Wasser und
einfachem Oxid/Wasser zu vergleichen. Die Zeichnung liefert keinen
Leistungsnachweis und begründet keinen allgemeineren Oxidanspruch.

### Vor aktiver Bindung erforderlich

Die neue Beschreibung muss den Vergleich gelieferter Daten und die
Begrenzung auf ein **einfaches Oxid** erhalten. Die aktuelle
HE-9.2/B01A03-Zuordnung ist fachlich gegen diese Leistung zu entscheiden;
dieser Bildbericht entscheidet keine Quellenkante. Nach Text-/Quellen-
und Bildintegration die tatsächlich betroffenen Seiten-, Kontext- und
D/P/A/M/V-Bindungen prüfen. Der konkrete Alt-Text soll Oberflächenreaktion,
H₂ nur links, separate Oxidprobe und schematische Ergebnislösung nennen.
Keine eigenständige Schülerdurchführung aus dem Bild ableiten.

## 2. Halogen-Stoffidentität — `58486300-3f84-5aa1-9ed4-66186af62669`

### Fachliche Prüfung

- Links sind `NaCl` und `Cl⁻` richtig dargestellt und dem Kochsalzmotiv
  zugeordnet. Dieses Feld hat kein Keimvernichtungs- oder Medizinsymbol.
- In der Mitte steht wirklich `NaOCl` und darunter `ClO⁻`: Das zusätzliche
  O ist auch in der 360-Pixel-Ansicht erkennbar. Hypochlorit und gewöhnliches
  Chlorid sind weder gleichgesetzt noch über einen gemeinsamen X⁻-Pfad
  verbunden. Flasche, Wischtuch und harte Fläche liefern ein konkretes
  Flächendesinfektionsmotiv. Die
  [CDC-Fachquelle](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/chemical-disinfectants.html)
  nennt Natriumhypochlorit als Chlor-Desinfektionsmittel für entsprechende
  Oberflächenanwendungen. Die Zeichnung zeigt keine Hautanwendung und
  behauptet keine pH-unabhängige alleinige Wirkweise von ClO⁻; HOCl und
  Gleichgewichte sind nicht Teil dieser vereinfachten Identitätsdarstellung.
- Rechts steht neutrales molekulares `I₂`, nicht `I⁻`. Medizinflasche,
  Verband und Pflaster ergeben erkennbar ein Präparatmotiv. Es wird keine
  Anwendung reiner Iodkristalle dargestellt. Die oben verlinkte CDC-Quelle
  beschreibt Iodlösungen und Iodophore sowie den Beitrag freien I₂ zur
  antiseptischen Wirkung. Die fachlich tragfähige Bilddeutung ist deshalb
  **I₂ als Stoffform in einer iodhaltigen antiseptischen Zubereitung**.
  Das Bild enthält keine Aussage über die vollständige Zusammensetzung
  eines Produkts und keine Anwendungsempfehlung.
- Die drei Karten sind sichtbar getrennt. Die frühere Pauschalaussage zu
  Chlorverbindungen und die gemeinsame Halogenidlinie sind vollständig
  entfernt. Die vorhandenen Formeln und Ladungen sind korrekt; keine
  chemisch falsche Verbindung zwischen den Anwendungen ist sichtbar.

### Lesbarkeit und Zielbezug

Bei 680 Pixeln sind alle Formeln und Stoffnamen klar lesbar. Bei 360
Pixeln bleiben `NaCl`, `NaOCl`, `Cl⁻`, `ClO⁻` und `I₂` sowie die drei
Objektkontraste erkennbar. Stoffnamen und Verwendungswörter sind kleiner,
bleiben in der tatsächlich angesehenen Ansicht lesbar; die Hauptaussage
hängt nicht von einer langen Fußnote ab. Die Größen- und Formatwahl trägt
die korrigierte Stoffidentitätsorientierung.

**Reichweitengrenze:** Die Karten zeigen zwei Chlorverbindungen und
elementares Iod. Sie enthalten kein vollständiges Paar eines elementaren
Halogens mit **einer seiner eigenen Verbindungen**. Der vorgeschlagene
DE/EN-Zieltext fordert genau diesen stoffgenauen Vergleich und außerdem
eine Eigenschafts-Verwendungs-Begründung. Das Bild kann diesen Lernanlass
unterstützen, ersetzt aber weder den passenden gleich-elementigen
Aufgabenfall noch die Begründung. Diese fehlende vollständige
Aufgabenabbildung ist kein Bildfehler einer Orientierungsdarstellung;
aus den drei Karten darf keine vollständige Leistung oder Quellenabdeckung
abgeleitet werden.

### Vor aktiver Bindung erforderlich

- Bei der späteren Ziel- und P-v2-Prüfung mindestens den im Ziel genannten
  Vergleich eines konkreten Halogens mit einer **seiner** Verbindungen
  erzwingen. Eine bloße Aufzählung der drei Bildkarten genügt nicht.
- Iodmotiv in Alt-Text und Beschreibung ausdrücklich als **iodhaltige
  antiseptische Zubereitung** bezeichnen; weder reine I₂-Flüssigkeit noch
  iodidhaltiges beliebiges Produkt oder feste Kristalle behaupten. Die
  Flächenanwendung des Hypochloritbeispiels konkret benennen.
- Die vorgeschlagenen HE-Teilmappings B02A01/B02A02 und andere betroffene
  Quellenbindungen bleiben zu prüfen. Das Bild liefert keinen Beleg für
  die ganze Halogengruppe, alle Eigenschaften, alle Anwendungen oder die
  Reaktionen mit Metallen. Bestehende andere B02A02-Kanten erhalten.
- Endgültige aktuelle Text-/Seiten-/Kontext-/Quellen-/Bildbindung und
  maschinelle V-Entscheidung erst nach den gezielten Integrationsprüfungen
  schreiben. Erzeugung, diese Kandidatenprüfung und ein Hash-Abgleich
  ersetzen keinen dieser Schritte.

## Herkunft und nächste Integration

Die Erzeugungsnotizen dokumentieren OpenAI / ChatGPT Codex imagegen und die
tatsächlichen Referenzstrategien sowie Prompts. Kein zugrundeliegender
Modellname wird erfunden. Die Formeln und Objektbeziehungen wurden am
erzeugten Bild geprüft, nicht aus dem Prompt als erfüllt übernommen.
Beide PNG-Bytes bleiben unverändert. Die vier Prüfansichten sind die
einzigen neu geschriebenen Bilddateien dieses Prüfpakets.

Für die zwei Kandidaten ist keine weitere Erzeugung wegen eines belegten
Bildfehlers erforderlich. Ihre späteren aktiven Freigaben bleiben an die
oben genannten aktuellen Ziel-, Quellen- und Evidenzbindungen gebunden.
Historische JPGs, frühere Kandidaten, Befunde und separate menschliche
Freigaben bleiben erhalten und werden nicht als neue Freigaben ausgegeben.
