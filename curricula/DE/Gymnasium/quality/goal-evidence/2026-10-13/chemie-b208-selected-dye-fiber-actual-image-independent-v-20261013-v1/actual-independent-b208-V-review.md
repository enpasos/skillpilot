# Unabhängige tatsächliche b208-Bildprüfung: `rejected_regenerate`

Geprüft wurden ausschließlich die neue b208-PNG-Datei, das ganze nachher-Ziel aus der neutralen CAS-Datei, beide ganzen DE/EN-Fälle und das ganze b208-Profil. Original, tatsächliche Browseransichten bei 360 und 680 Pixeln sowie das alte JPG wurden mit `view_image` gesehen. Die FIRST-Entscheidung wurde vor Autor-Selbstprüfungsnotizen oder fremden Bildurteilen gespeichert und gehasht; solche Notizen wurden auch anschließend nicht benötigt.

| Bindung | Exakter Stand |
|---|---|
| Ziel | `b208b1a5-c609-53a1-8add-979417a93b7d` |
| DE-Titel | Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen |
| DE-Zieltext | Die lernende Person kann ausgewählte Bindungs- und Wechselwirkungstypen zwischen Farbstoff-Molekülen und Faser-Molekülen beschreiben und die Eignung von Farbstoffen als Textilfarbstoff beurteilen. |
| PNG-SHA-256 | `c4524ad4c7aba38166ae62640894ce866ea32f9c8814a05a95db4682751e07ae` |
| Vorgeschlagene öffentliche URL | `/assets/goal-visualizations/chemie/b208b1a5-c609-53a1-8add-979417a93b7d/b208b1a5-c609-53a1-8add-979417a93b7d.png` |
| Tatsächlich gesehene Größen | PNG 1672 × 941; Browser 360 × 203 und 680 × 383 |
| Altes tatsächlich gesehenes JPG | 2752 × 1536; SHA-256 `b63de17d9b17590189626493e600b3ae3e3e51f4b80cab1abf7bc169dc8ff869` |

## Fachliche Beobachtung

Im Original und bei 680 Pixeln ist kein grober chemischer Fehler erkennbar. Bei Wolle sind `–NH₃⁺` und `–SO₃⁻` mit gestrichelten Kontakten dargestellt; das ist eine ausgewählte elektrostatische Anziehung im ausdrücklich sauren Bad. Es entsteht im Modell keine neue kovalente Bindung. Geeignete weitere Wechselwirkungen werden durch das gewählte Beispiel nicht ausgeschlossen. Die Zuordnung protonierter Wollgruppen zu anionischen Säurefarbstoffen und die zusätzliche Rolle anderer Wechselwirkungen werden in der Primärstudie [Paul et al., ACS Omega 2024](https://pubs.acs.org/doi/10.1021/acsomega.4c00560) beschrieben. Die Publisher-Seite war beim direkten Öffnen gesperrt; die konkreten Primärtextpassagen wurden über die Suchausgabe abgerufen.

Das Baumwollpanel benennt einen Reaktivfarbstoff und zeigt einen durchgehenden `Cell–O–C`-Kontakt zum Farbstoff. Das ist ein zulässiges schematisches Produktmotiv, keine vollständige Strukturformel, Valenzdarstellung oder bilanzierte Reaktion. Die übrigen O-Markierungen auf dem abstrakten Faserband begründen deshalb für sich keinen zusätzlichen Strukturfehler. Die kovalente Umsetzung von Triazin-Reaktivfarbstoffen mit Cellulose-Hydroxygruppen ist im Abstract der Primärstudie [Tang et al., ACS Applied Materials & Interfaces 2021](https://pubs.acs.org/doi/10.1021/acsami.0c18613) beschrieben; dieser konkrete Abstract wurde über die Suchausgabe gelesen, nicht der gesperrte Volltext.

Beim Polyester liegen ungeladene Farbstoffmodelle zwischen den Ketten; gestrichelte Kontakte behaupten keine neue ionische oder kovalente Faserbindung. Thermometer und Wärmesymbol geben keine nicht belegte Temperatur an. Die Aufnahme als Moleküle innerhalb der Polyesterstruktur ist mit der tatsächlichen Primäruntersuchung [Sekido und Kojima, Sen'i Gakkaishi 1966](https://www.jstage.jst.go.jp/article/fiber1944/22/1/22_1_33/_article) vereinbar; deren Abstract wurde auf der geöffneten Journal-Seite gelesen.

Gleichrangige Panels, „Ausgewählte Beispiele“ und „Farbstoff + Faser + Bedingungen“ vermeiden die wissenschaftlich falsche allgemeine Beständigkeitsleiter des alten JPG. Der alte Bildstand behauptet „Van-der-Waals-Kräfte (schwach) → auswaschbar / geringe Eignung“, „Wasserstoffbrücken (mittel) → bedingt geeignet“ und „Ionenbindung / kovalente Bindung (stark) → beständig / hohe Eignung“ ohne konkrete Stoff-/Bedingungsgrenzen. Die neue Darstellung ersetzt diese pauschale Rangfolge sachgerecht.

## Konkreter Blocker bei 360 Pixeln

Die Faserobjekte, farbigen Farbstoffmodelle, drei Panels und großen Hauptbeschriftungen bleiben erkennbar. Die Zeichenhöhe der chemischen Gruppen und insbesondere der Ladungs-Superskripte fällt jedoch auf wenige Bildpixel; auch „Reaktivfarbstoff“ und „Dispersionsfarbstoff“ sind bei der tatsächlichen 360-Pixel-Ansicht sehr klein. Sie lassen sich in dieser Ansicht nicht bequem lesen. Der Cell–O–C-Kontakt und der kurze rote Bindungsstrich sind gegenüber der 680-Pixel-Ansicht deutlich schwerer zu unterscheiden.

Diese Angaben sind fachlich relevant: Die Ladungen erklären die Anziehung, und die Farbstoffklassen begrenzen die kovalente Baumwollbindung beziehungsweise Polyesteraufnahme auf die ausgewählten Systeme. Die Bilderkennung allein ersetzt diese Einschränkungen nicht zuverlässig. Nach der geltenden Bildregel dürfen solche wichtigen Angaben nicht von Kleinschrift abhängen. Die freundliche abstrakte Darstellung und die weitgehend stimmige Chemie reichen deshalb für die V-Freigabe des exakten PNG noch nicht aus.

Erforderlich ist eine gezielte Vergrößerung oder Vereinfachung der wichtigen Ladungs-/Gruppennotation und Farbstoffklassen, sodass sie bei 360 Pixeln lesbar sind. Ausgewählte Beispiele, korrektes Kontaktmodell und der Verzicht auf eine allgemeine Beständigkeitsrangfolge sollen erhalten bleiben. Danach sind die tatsächlichen neuen Bildbytes in Original-, 360- und 680-Pixel-Größe erneut zu prüfen.

Die aktuelle GoalCard verwendet in `app/src/components/GoalCard.tsx:672` `h-auto max-h-[28rem] w-full object-contain`. Bei 16:9 und 680 Pixeln Breite liegt die Bildhöhe von etwa 383 Pixeln unter der 448-Pixel-Höhenkappe; die gelesene Desktopansicht ist daher angemessen. Der Blocker stammt aus der tatsächlich schmalen Ansicht und nicht aus einem ungetesteten Formatvergleich.

## Entscheidungsgrenzen

Die separaten inaktiven QA-Felder nutzen vorhandene Ledger-Felder und setzen `aiApproved: "no"`, gebunden an genau dieses PNG. Menschenfelder werden nicht geschrieben. Das ist nur eine b208-V-Prüfung: keine e560-Prüfung, kein aktiver Import, keine D/P/A/M-Neubindung, keine menschliche Freigabe, kein Human Trial, keine Deployment- oder vollständige M7-Aussage. Bildgenerierung und korrekte Hashes sind keine Freigabe. Gute andere Bilder und vorhandene aktive Aufzeichnungen bleiben außerhalb dieser Prüfung.
