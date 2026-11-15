# Korrekturen nach zwei unabhängigen Fachreviews

15. November 2026. Dies ist der aktuelle lokale Autorierungsstand. Die erste
Lieferung im übergeordneten Verzeichnis und die beiden vollständigen nativen
D-Runden bleiben historisch erhalten. Ihre damalige Freigabe gilt nicht
pauschal für diese veränderten Eingaben. [current-inputs.json](current-inputs.json)
bindet den aktuellen kanonischen Stand, alle 70 Sichten und die neuen
Materialien. Der rohe kanonische Hash lautet
`147da780fcbddb5ee10e8f6425741baad9c207ddb35ca523ae1083333438a8a7`.

## Tatsächlich umgesetzte Korrekturen

| Gegenstand | Entscheidung und Grenze |
| --- | --- |
| Funktionale Diode `dc55adac` | Beide Polungen werden bei angegebener **Diodenspannung im dargestellten Kennlinienbereich** beurteilt. Die positive Polung allein garantiert keinen nennenswerten Strom. |
| Gleichrichter `3b586f2a` | Bekannter Eingangsverlauf und angegebene Bauteilannahmen begrenzen die Erklärung. Eine universelle ideale Schwellspannung wird nicht behauptet. |
| Supraleitung `853dbe54` | Beschreibung nennt Temperatur-, Strom- und Feldgrenzen. Das echte magnetische Vorwissen `0f6b798b` ist ergänzt. Das vorhandene Bild ist eine idealisierte schematische Darstellung, keine eigene Messung. |
| Transistorschalter `7d4d6a39` | Das zuvor fehlende Schaltplanverständnis `69f8f59c` ist direkt ergänzt; es sichert auch `7ca44ba0`. Ein im geltenden Rahmen verlangter eigener Aufbau bleibt eine tatsächliche praktische Leistung mit beaufsichtigter, strombegrenzter Kleinspannung. |
| Verstärker `af50bb9a` | Die vorgegebene Spannungsabfallbeziehung im einfachen Kollektorzweig gehört zum neu zu erwerbenden Erklärungsmodell. Größerer Kollektorstrom erhöht den Widerstandsspannungsabfall und senkt bei fester Versorgung die Ausgangsspannung. Die vorhandenen Spannungs-, Tabellen-, Energie- und Begrenzungsanforderungen bleiben bestehen. |
| Flipflop `c2af45aa` | Kein neuer Text und keine zusätzliche direkte Kante; das reale Schaltplanvorwissen wird über den Transistorschalter gesichert. |
| Materialklassifikation `7badac4d` | Ein neues elementares Bild ersetzt die aktive Bandtheorie-Abbildung. Vergleichbare Bedingungen, typische Leitfähigkeit und begründete Anwendungen genügen; Bänder und Dotierung werden nicht vorweggenommen. Alte Bildbytes bleiben erhalten. |
| Fortgeschrittenes Bandziel `df010b2b` | Das **gesamte Zielobjekt bleibt unverändert**. Review A bestätigt die bestehende Kompetenz; die zusätzliche Wortlautempfehlung aus B wird mit begründeter Gegenentscheidung erhalten. Das vorhandene P prüft bereits besetzte/überlappende Bänder, Lücke, Dotierniveaus und Träger sowie Transfer durch Erwärmung. |

Der tatsächlich abgeleitete Wissenszuwachs steht in
[ordinary-prerequisite-delta.json](ordinary-prerequisite-delta.json): für
Supraleitung genau das magnetische Ziel; für Schalter, Verstärker und Flipflop
jeweils genau die beiden vorhandenen Stromkreis-/Schaltplanziele. Kein altes
fachliches Vorwissen fällt weg. Die ebenfalls tatsächlich berechnete, **nicht
angewandte** Verstärkerkante zu `267170bd` hätte zusätzlich 20 Mathematik- und
fünf Physikziele einschließlich Messung und Schaltungsplanung eingezogen.
Diese Apparate-/Planungskette ist für die vorgegebene einfache Beziehung kein
passender Stellvertreter. Die korrigierten unabhängigen Reviews müssen die
konkrete Grenze des neuen Verstärkermodells erneut beurteilen; ein weiterer
wirklicher Befund würde behoben und nicht durch diesen Autorierungsentscheid
überstimmt.

Die konkreten Quellen- und Anwendungsgrenzen des praktischen Transistorziels
stehen in [transistor-experiment-application-binding.json](transistor-experiment-application-binding.json).
Ein Quellenabschnitt über eine Animation verlangt allein keinen eigenen
Aufbau; ein ausdrücklich vorgesehenes Experiment wird hingegen nicht mit
Papier, Simulation oder einer fertigen Abbildung als durchgeführt anerkannt.
Der Beleg enthält keine behauptete Beobachtung einer Lernendenleistung und
führt keinen neuen Laufzeitwähler ein.

## Reale Aufgaben und Bilder

Die Bandaufgabe `1abfd5ef` behält ID, Bandmodell-Kompetenz und ihre drei
inhaltlichen Teile. Sie liefert nun die tatsächlich referenzierten
Banddiagramme als [eigenes Material](../../../../visualizations/physik/1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e/1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e-bands-20261115.png).
Besetzte und freie erlaubte Zustände, Lücke und ein besetztes Donatorniveau
werden ausdrücklich unterschieden. Die Ausgangsbesetzung ist als Modell bei
0 K angegeben. Die analytische Bewertung verteilt 6/5/5 Punkte; Bestehen ab
12/16 verhindert, dass ein vollständig ausgelassener Teil ausgeglichen wird.
Teilbeiträge bleiben bewertbar.

Die Verstärkeraufgabe `144007cb` liefert einen tatsächlichen beschrifteten
10-V-Kollektorzweig und die verwendeten Spannungsbeziehungen. Ihre bisherige
10-V-Tabelle, Energieerklärung, aktive Grenzen und Begrenzungsfälle bleiben
erhalten. Das Lernzielbild mit 5 V bleibt ein anderes vorgegebenes Beispiel;
die neue Aufgabe legt ihre eigene Versorgung und ihre Annahmen fest.

Die vollständigen deutschen und englischen Aufgaben, Lösungen und Rubriken
wurden unabhängig maschinell gelesen; alle Verstärkerwerte wurden
nachgerechnet. Beide tatsächlichen PNGs wurden in voller Größe sowie bei
360 und 680 Pixel Breite betrachtet. Die genauen Inhaltsprojektionen und
Viewport-Belege stehen in [band-assessment-content-review.json](band-assessment-content-review.json)
und [amplifier-assessment-content-review.json](amplifier-assessment-content-review.json).
`RELEASED` bezeichnet diese maschinelle Inhaltsfreigabe, keine menschliche
Erprobung oder nachgewiesene Lernwirksamkeit.

Die drei neuen Abbildungen sind eigene native SVGs mit exakt gerenderten
PNGs. Wissenschaftlich genaue Bandzustände, Verbindungen, Vorzeichen und
Werte begründen hier die enge Vektorausführung. Es wurde kein Rasterbild
bearbeitet und kein Bildanbieteraufruf erfunden. Bestehende JPG-/PNG-Bytes
bleiben erhalten. Die aktive Klassifikationsabbildung wurde zusätzlich im
tatsächlichen GoalCard-Größenlimit betrachtet. Die drei alten Beschreibungen
bei Supraleitung, Schalter und Verstärker benennen jetzt den realen
schematischen Bildinhalt und behaupten keinen vollständigen Aufbauplan.

## Quellen, Sichtkorrektur und Stufenwirkung

Der amtliche [BW-Abschnitt 3.3.2(9)](https://www.bildungsplaene-bw.de/%2CLde/BP2016BW_ALLG_GYM_PH.V2_IK_9-10_02)
trägt die funktionale Diodenbeschreibung mithilfe der Kennlinie. Er verlangt
dort kein mikroskopisches p-n-Modell. Ein historischer Hilfsschritt hatte die
p-n-Aufgabe `c61b2a69` trotzdem in den unteren Übungsbereich beider BW-Sichten
eingefügt. Nachdem das Experiment fachlich korrekt ohne diesen Modellzwang
zugänglich ist, ist diese zusätzliche untere Pflicht nicht mehr begründet.
Es entfällt exakt diese Aufgabenreferenz samt leer werdender Struktur; alle
anderen Referenzen bleiben identisch. Die funktionale Aufgabe und die echte
Kennlinienmessung bleiben erhalten. Es wird keine obere Vorbereitung ohne
tatsächliches späteres Ziel erfunden. Der genaue Vorher-/Nachherbeleg steht in
[bw-source-placement-correction.json](bw-source-placement-correction.json).

Die abschließende echte CQR-Prüfung deckte außerdem eine noch zu breite
`prerequisiteOnly`-Referenz auf den gesamten Diodenelternknoten auf. Sie
exponierte weiterhin das unbenötigte p-n-Modell und verlangte deshalb zu Recht
dessen Abschlussaufgabe. Nun entfällt in beiden unteren BW-Abschnitten exakt
diese Elternreferenz. Es bleiben dieselben 146 unteren Zielatome, dieselben
237 beziehungsweise 268 Zielatome der Gesamtsicht und insbesondere beide
funktionalen sowie experimentellen Ziel-/Aufgabenpaare erhalten. Die beiden
wegfallenden Unterstützungsatome p-n-Erklärung und Gleichrichtung werden von
keinem behaltenen Ziel benötigt. Die tatsächlich ausgeführte native
Gesamt-/Sek-I-Kompilation und vollständige lokale Voraussetzungsschließung
stehen in [bw-unused-support-proof.json](bw-unused-support-proof.json).
Der Wiederherstellungstest prüft jetzt zusätzlich, dass ein veralteter
Generatorentwurf diese breite BW-Unterstützung nicht wieder einführt.


Die 32 begrenzten Quellenentscheidungen der ersten Phase gelten weiter;
der aktuelle Wiederholungstest bestätigt ihre exakten Passagen, vier
Mappingartefakte und vier bytegleichen erhaltenen Quelleninputs. Diese
Nachkorrektur ändert keine Quellenzuordnung. Die typisierten Physik-
Einstiegsmarker von `7badac4d` und `4a42cddd` bleiben erhalten: sie sichern
den eigenen Einstiegsvertrag, kein behauptetes fachliches Wissen.

[before.json](before.json) ist die bytegleiche Diagnose vor der ersten
kanonischen Mutation auf Basis `96035c60b1`; [after.json](after.json) ist frisch
für diesen Stand erzeugt und liest alle 21 kanonischen Wurzeln mit 6.532 Zielen
und alle 69 Physiksichten. Sie zeigt Rollen und sichtbare Stufeneinordnungen,
keine vollständige persönliche Lernbasis. Insbesondere bleiben die bekannten
ST-/TH-Fälle von früherer Vorbereitung neben oberem Target eine Aufgabe des
Stufenplanvertrags. Eine vollständige Stufenakzeptanz wird hier nicht aus
der Sichtkompilation abgeleitet. Die genaue zusätzliche fachliche Vorbereitung
ist begrenzt und im Wissensdelta sichtbar; sie erfindet keine offizielle
frühere Landeszuordnung.

## Begrenzte Primärbelege und aktueller Prüfumfang

- [LehrplanPLUS Physik 10, NTG 5.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik)
  verbindet echte Bauteilexperimente mit einfachen Modellen. Dies trägt den
  betreffenden bayerischen Umfang, keine pauschale Zuordnung aller Länder.
- Die tatsächlich gelesenen amtlichen [Hinweise zur Spannungsverteilung](https://www.lehrplanplus.bayern.de/serviceinformation/l293157)
  betonen qualitative Modellarbeit; [die Hinweise zum Widerstand](https://www.lehrplanplus.bayern.de/serviceinformation/l336765)
  begrenzen die formalen Anforderungen der Jahrgangsstufe 8. Das unterstützt
  einen explizit bereitgestellten einfachen Modellzusammenhang, beweist aber
  weder die konkrete Verstärkeraufgabe noch eine universelle Reihenfolge.
- [CERN zur Supraleitung](https://home.cern/science/physics/superconductivity/)
  beschreibt Widerstandsfreiheit und magnetische Abschirmung;
  [NIST-Forschung zur kritischen Stromstärke](https://www.nist.gov/programs-projects/critical-current-metrology)
  untersucht ausdrücklich Abhängigkeiten von Temperatur und Magnetfeld.
  Temperatur allein reicht daher als uneingeschränkte Bedingung nicht aus.

Der native Compiler besteht für alle **70** aktuellen Physik- und
Atlas-Sichten mit null Fehlern. Der gezielte Quellen-/Wiederherstellungstest
besteht für **32** Passagen und **70** konkrete Sichtpfade. Die native Prüfung
verwendet die vorhandene semantische Typklassifikation; sie ist keine
Freigabe veralteter Review-Fingerprints. Aktuelle D/P/A/M/V-Nachfolger,
strikte Reifegradprüfung, gesamte CI und frische erfolgreiche Main-CI bleiben
in der eigenen integrierten Evidenzspur. Die ursprünglichen D-Runden,
V9/Parent, erhaltene Quellen und Lernendenergebnisse werden nicht geändert.
