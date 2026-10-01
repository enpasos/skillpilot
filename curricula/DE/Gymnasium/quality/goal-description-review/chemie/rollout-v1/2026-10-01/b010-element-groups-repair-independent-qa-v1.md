# B010 Elementgruppen: unabhängige Prüfung des Reparaturkandidaten v1

Stand: 2026-10-01. Prüfgegenstand ist ausschließlich
`b010-element-groups-repair-candidate-v1.md`. **AI-Fachprüfung eines
Vorschlags; keine kanonische Integration, kein strenger D/P/A/M/V-Abschluss,
keine menschliche Bildfreigabe.** Die drei aktiven kanonischen Ziele, ihre
Mappings und die aktiven Bilder wurden gelesen; die JPGs wurden in
Originalgröße (2752 × 1536) sowie als separat skalierte 680- und
360-Pixel-Ansichten geprüft. Die SHA-256-Werte der aktiven JPGs stimmen mit
dem Kandidaten überein. Diese Prüfung ändert weder diese Dateien noch
Registry-Einträge.

## Maßstab und übergreifender Befund

Der [amtliche hessische G9-Lehrplan Chemie, 9.2, PDF-Seite 19 / Druckseite
18](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf)
nennt unter 2.1 ausdrücklich **Eigenschaften und Verwendung sowohl der
Metalle als auch ihrer Verbindungen**, dann die Systeme Alkalimetall/Wasser
und Alkalimetalloxid/Wasser. Unter 2.2 nennt er Eigenschaften und Verwendung
der Halogene sowie Halogene und ihre Verbindungen im Alltag. Die lokale
PDF-Kopie hat den im Kandidaten angegebenen SHA-256-Wert
`f0a2c3795fcbcad1fee8d92d7ab9bc26810609bee0ef1fbd02c830e171220d2f`.

Die HE-Source-Extraction zerlegt 9.2 in Aspekte. Ihre `B02A02`-Zeile lautet
„Halogene und ihre Verbindungen im Alltag Chemische Reaktionen mit Metallen“;
ein neues Ziel zum Alltagsvergleich würde davon nur den ersten Teil
abdecken. Die vorhandene HE-Mapping-Datei ordnet `B02A02` bereits zwei
anderen kanonischen Zielen zu. Eine zusätzliche Teilkante darf diese
bestehenden Zuordnungen nicht stillschweigend ersetzen. Für die drei hier
geprüften Ziele gibt es **keine direkte DE-BY-Mapping-Kante** in der aktiven
bayerischen Source-Extraction-Mapping-Datei. `DE-BY` in den kanonischen
`applicability`-Listen ist deshalb keine direkte bayerische Quellenbestätigung
der vorgeschlagenen engeren Leistung. Die direkten BB-/BE-/HB-/NI-Kanten
für `e0e201bd` und `58486300` sind `partial` und müssen bei einer
Zieländerung ebenfalls gezielt neu bewertet werden; insbesondere die
NI-Kante zu qualitativen Nachweisreaktionen stützt nicht automatisch die
neuen Verwendungsleistungen.

| Ziel | Text/Atom | Quelle/Graph | Aktives Bild | Gesamt für Integration |
| --- | --- | --- | --- | --- |
| `e0e201bd-a1fd-5985-ab08-fd24c8655f3d` plus neue ID | **HOLD** | **HOLD** | **HOLD** für beide neuen Bindungen | **HOLD** |
| `16a80de2-b5e0-5467-a9b3-5860730d7d8b` | **PASS** als DE/EN-Kandidat | **PASS** als fachlich passende HE-9.2-Auslegung; Kante erneut prüfen | **HOLD** | **HOLD** |
| `58486300-3f84-5aa1-9ed4-66186af62669` | **PASS** als begrenzter DE/EN-Kandidat | **HOLD** bis Teilmappings geprüft sind | **HOLD** | **HOLD** |

## Zielgenaue Befunde

### `e0e201bd` und vorgeschlagene neue ID — SPLIT-HOLD bestätigt, Text nacharbeiten

1. Die Trennung von elementaren Alkalimetallen und einer salzartigen
   Verbindung ist fachlich sinnvoll. Die deutsche und englische Fassung
   meinen jeweils dasselbe; `salt-like`/„salzartig“ begrenzt die neue ID
   nachvollziehbar. Der vorgeschlagene Text der bestehenden ID prüft aber
   **keine Verwendung eines elementaren Metalls** mehr, obwohl HE
   `9.2#B01A01` genau diese Verwendung neben den Eigenschaften verlangt.
   Die neue ID prüft nur eine Verbindung. Vor einem HE-Vollabdeckungsanspruch
   eine tatsächliche, altersgerechte Metallverwendung mit passender
   Stoffeigenschaft in einer atomaren Leistung nachweisen und aufnehmen
   oder die verbleibende Lücke ausdrücklich als offen dokumentieren.
2. „Aus vorgegebenen Stoffdaten ... Reaktionsbereitschaft ... begründen“ ist
   zu unbestimmt: bloße Stoffdaten wie Dichte oder Schmelzpunkt erklären die
   chemische Reaktivität nicht. Die Eingabe müsste geeignete **Reaktionsdaten
   oder ein passendes Struktur-/Außenelektronenmodell** enthalten; DE und EN
   entsprechend präzisieren. Der in der vorgeschlagenen Verbindungsversion
   verlangte Eigenschafts-Verwendungs-Bezug ist dagegen gut prüfbar, sofern
   ein **benannter Stoff** statt nur „Lithium-Ionen-Akku“ ohne Stoffformel
   verwendet wird.
3. Die alte `exact`-HE-Kante zu `B01A01` kann die beiden engeren Ziele nicht
   einzeln als volle Abdeckung ausgeben. Neue ID, beide Teilkanten, Eintrag
   im Kompositionsbaum und Prerequisites sind gemeinsam zu prüfen. Das
   Folgeziel `16a80de2` verlangt derzeit `e0e201bd`; nach Split ist zu
   prüfen, ob es weiterhin nur die elementare Metallleistung braucht.
4. Das aktive Bild (SHA-256 `4ba3e599…d20aea`) zeigt Li/Na/K,
   Metall-Eigenschaften, NaCl, KCl und einen Li-Ionen-Akku. Auf 680 Pixeln
   sind die Beispiele lesbar, auf 360 Pixeln sehr klein. Für das neue
   **Metallziel** zeigt es weiterhin Verbindungen; für das neue
   **Verbindungsziel** nennt es beim Akku keinen konkreten Lithiumstoff und
   begründet keine Nutzung mit einer Stoffeigenschaft. Die historische
   menschliche Freigabe gilt für die alte Bindung, nicht für zwei neue
   Ziele. Keines der beiden Bilder hier als V-pass übernehmen; nach
   Text-/Graphentscheidung jeweils eine eigene Bildbindung prüfen.

### `16a80de2` — Textkandidat PASS, Bild-V HOLD statt KEEP

1. Die vorgeschlagenen DE/EN-Beschreibungen sind fachlich deckungsgleich
   und gegenüber der bloßen Reaktionsaufzählung besser prüfbar. Die
   Begrenzung auf ein **einfaches Oxid** ist nötig: am Bildbeispiel gelten
   `2 Na + 2 H₂O → 2 NaOH + H₂` und
   `Na₂O + H₂O → 2 NaOH`. Nur der Metallweg setzt dabei H₂ frei; beide
   bilden unter den dargestellten Bedingungen eine alkalische Lösung.
   Der [PubChem-Eintrag zu Natriumoxid](https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-oxide)
   bestätigt die Bildung von Natriumhydroxid bei Kontakt mit Wasser.
   „Anhand vorgegebener Daten“ grenzt die Leistung sinnvoll auf Deutung
   statt eigenständige Versuchsdurchführung ein. Die HE-Zeile
   `9.2#B01A03` nennt beide Systeme; die vergleichende Leistung ist eine
   plausible didaktische Operationalisierung. Ob die bisherige `exact`-Kante
   dabei bestehen kann, ist fachlich neu zu entscheiden, nicht per
   Fingerprint-Tausch.
2. **Neuer, entscheidender Bildbefund:** Das aktive JPG (SHA-256
   `8fe44fbc…0fcf7062ddc0`) zeigt den Natriumwürfel nach dem Einwurf
   **vollständig unter der Wasseroberfläche und dort brennend**. Dieser
   Hauptkontrast ist schon auf 360 Pixeln sichtbar. Elementares Natrium
   schwimmt beim typischen Wasserexperiment auf der Oberfläche und reagiert
   dort; siehe die [Royal Society of Chemistry zur Dichte und Reaktion von
   Natrium](https://edu.rsc.org/download?ac=11162) und ihre
   [Demonstrationsbeschreibung](https://edu.rsc.org/experiments/reactivity-trends-of-the-alkali-metals/731.article).
   Die korrekt ausgeglichenen Gleichungen heilen diesen falschen
   räumlichen Eindruck nicht. Die frühere V-Beurteilung und der im
   Kandidaten vorgeschlagene `KEEP` reichen daher nicht: **V-HOLD**, bis
   das Bild eine fachlich plausible Oberflächenreaktion zeigt oder eine
   unabhängige Prüfung eine andere belastbare Deutung des aktuellen Bildes
   begründet. Keine Schüler-Versuchsanweisung daraus ableiten.
3. Auf 680 Pixeln sind beide Gleichungen gut lesbar; auf 360 Pixeln bleiben
   sie erkennbar, der untere Satz zu `NaOH → Na⁺ + OH⁻` ist jedoch klein.
   Eine Korrektur sollte vor allem den Hauptfehler beheben und danach die
   tatsächliche 360-/680-Pixel-Lesbarkeit erneut prüfen.

### `58486300` — begrenzter Textkandidat PASS, Source-/Bild-HOLD

1. Die vorgeschlagenen DE/EN-Sätze sind sinngleich und können mit einem
   **benannten Halogen, einer benannten Verbindung und einem belegten
   Stoffmerkmal** in einer zusammenhängenden Aufgabe geprüft werden. Die
   Formulierung sollte bei der Aufgaben- und P-v2-Prüfung gerade diesen
   Stoffvergleich erzwingen; ein allgemeiner Satz zu „Chlorverbindungen“
   oder nur ein Verwendungsname genügt nicht. Falls die HE-Zeile
   `9.2#B02A01` vollständig durch dieses Ziel belegt werden soll, fehlt
   explizit eine Verwendung eines **elementaren** Halogens. Andernfalls
   diese Kante als Teilabdeckung behandeln und die restliche Leistung
   separat zuordnen.
2. Die alleinige bisherige `exact`-Kante von `B02A01` trägt den neuen
   Vergleich mit Verbindungen nicht. `B02A02` liefert den Alltagsbezug,
   enthält in der aktiven Extraction aber zusätzlich Reaktionen mit
   Metallen. Beide neuen direkten Kanten wären höchstens geprüfte
   **Teilkanten**; die bestehenden zwei `B02A02`-Kanten bleiben separat
   nachzuverfolgen.
3. Das aktive Bild (SHA-256 `b8139a29…176863de8f62e9c5`) verbindet
   „bilden Halogenide X⁻“ grafisch mit **allen** Alltagskarten. Besonders
   „Chlorverbindungen zur Desinfektion“ lässt dadurch gewöhnliche
   Chloride als wirksame Desinfektionsstoffe erscheinen. Der benannte
   Wirkstoff Natriumhypochlorit ist eine andere Verbindung als NaCl; die
   [CDC beschreibt Natriumhypochlorit als Wirkstoff in
   Bleich-/Desinfektionslösungen](https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/chemical-disinfectants.html).
   Auch die Iod-Karte darf nicht pauschal aus dem X⁻-Pfad folgen.
   Dieser Verbindungsfehler ist auf 680 und 360 Pixeln sichtbar; die
   360-Pixel-Karten sind zusätzlich textlastig. **V-HOLD** ist begründet.
   Für eine spätere Bildfassung die Stoffformen und die Pfade trennen,
   etwa `NaF/Fluorid` für Zahnpasta und ausdrücklich `NaOCl/Hypochlorit`
   für ein passendes Desinfektionsbeispiel; Zahl und Größe der Labels für
   360 Pixel begrenzen. Ein generiertes PNG braucht danach eigene
   Original-/680-/360-Prüfung.

## Nächste fachlich prüfbare Schritte

Zuerst die beiden Quellenlücken zu **Metallverwendung** und gegebenenfalls
**Verwendung elementarer Halogene** entscheiden und die HE-/BB-/BE-/HB-/NI-
Teilkanten sowie die fehlende direkte BY-Evidenz dokumentieren. Danach die
betroffenen Zieltexte, neue ID und Graphbeziehungen als ein versioniertes
Paket prüfen. Für `16a80de2` die unter Wasser brennende Na-Darstellung
fachlich korrigieren; für `58486300` Halogenide, Hypochlorit und elementare
Halogene im Bild entflechten. Erst auf den dann aktuellen Text-/Quellen-/
Seiten-/Bildbindungen unabhängige D-, A-/M-, P-v2- und V-Entscheidungen
erheben. Diese Prüfung liefert **0 neue strenge Abschlüsse**.
