# Chemie Q3 v5: unabhängige Bild-, Seiten- und Transferprüfung A

Die aktuellen drei Bilder erhalten eine an ihre tatsächlichen SHA-256 gebundene **Approved-AI**-Entscheidung. Die beiden guten bestehenden Bilder bleiben **KEEP**. Alle drei vollständigen aktuellen DE/EN-P-v2-Profile und sechs vollständigen Fälle bleiben fachlich als `ai_candidate / needs_human_review` geeignet. Es wurde kein in diesem Prüfbereich blockierender Bild-, Seiten- oder Transferfehler gefunden. **Quellen-/Operator-HOLDs bleiben erhalten; Humanfreigaben, Human Trial und neue strikte Schließungen: 0.**

Die eigene [FIRST](FIRST.actual-inputs.independent-a.json) wurde vor Autoren-README, Autorenurteilen und fremden Review-Ergebnissen erstellt. Alle 100 in der aktuellen FINAL-Freeze aufgeführten Dateien wurden mit ihren tatsächlichen Bytes und Hashes verglichen; alle sind exakt. Auch bis zum eigenen [Verdict](VERDICT.independent-a.actual.json) wurde kein fremdes Reviewergebnis gelesen. Das Autoren-README wurde nicht als Begründung verwendet.

## Tatsächlich geprüfter Umfang

- Alle drei originalen PNGs, danach jedes ganze Bild bei exakt 360 und 680 Pixeln Breite. Die sechs dokumentierten Ansichtskopien sind reine Skalierungen ohne Inhaltsänderung.
- Alle drei ganzen aktuellen kanonischen Ziele einschließlich DE/EN, Voraussetzungen, Dimensions- und Anwendbarkeitsfeldern, Provenienz, Ressourcenbeschreibung und Alttext.
- Die ganzen drei aktuellen Kontexte des 398-Ziele-BookModels, alle drei vollständigen nativen HTML-Lernzielseiten und die vollständigen nativen PDF-Lernzielseiten 3–5; zusätzlich die beiden PDF-Vorspannseiten.
- Alle drei vollständigen DE/EN-P-v2-Profile einschließlich Pflichtkriterien, unabhängiger Demonstrationen, Variationsachsen und vollständiger Fallbriefs.
- Alle sechs vollständigen DE/EN-Fälle einschließlich Material, Aufgabe, Modelllösung, jedem Rubrikpunkt, Regel, frischer Variation und deren Lösung sowie E1/G1- und Experiment-/Lernendenleistungsgrenzen. Die fachlichen Fallkörper stimmen tatsächlich mit den Operator-Eingaben überein.

Die eigenen Browseraufnahmen stammen aus dem unveränderten nativen HTML. Nur die drei Bild-URLs wurden auf die exakten eingefrorenen Kandidatenbytes geroutet; kein aktives Runtimebild wurde als Kandidatenbeweis ausgegeben. Die PDF-Ansichten wurden aus dem tatsächlichen nativen PDF neu gerastert. Einzelheiten stehen unter [inspection](inspection/native-html.actual-browser-inspection.json).

## Fachliche und visuelle Entscheidungen

| Ziel | Original-SHA-256 | Entscheidung | Ganzer Seitenbezug |
|---|---|---|---|
| Gleichgewichtsdynamik, `81373fb7…` | `c5547661514f22df99df9b19d955996e5a994cd145356637e85419b3322730f8` | KEEP / Approved AI | 398-Modell 236; native HTML 1; PDF 3 |
| Spannungsreihen, `8be14f15…` | `42238208258aa8a372c48547e2005880439c64de769a099a0e02b212abaf562f` | accepted_pilot / Approved AI | 398-Modell 258; native HTML 2; PDF 4 |
| Primärzellen, `c8844ac6…` | `7304cab9eaa0292f65bf9d032b817ac43a9ac23eec675770a59717c051022894` | KEEP / Approved AI | 398-Modell 269; native HTML 3; PDF 5 |

**Gleichgewicht:** Die konstante Stoffebene und das laufende Teilchenmodell sind getrennt. A und B werden bei der Bildung und Zerlegung von AB erhalten; beide Richtungen sind als gleich schnell dargestellt. Die verschiedenen Mengen werden nicht als gleiche Konzentrationen ausgegeben. Das Bild bleibt bei 360/680 Pixeln verständlich. Das Profil verlangt den unabhängigen Artennachweis und begründete gleiche, nicht nuller Raten; eine konstante Farbe oder bloße Zahlenangabe schließt das Ziel nicht. Der offene Zustand in `q3-01-b` prüft gerade die Grenze zwischen Stationarität und Gleichgewicht.

**Spannungsreihen:** Die tatsächlichen beiden Endkappen der blauen 1,10-V-Dimension liegen bei Cu und Zn. Bei SHE liegt keine zusätzliche Endkappe und kein Teilintervall. Cu +0,34 V, SHE 0,00 V und Zn −0,76 V sind korrekt geordnet; 0,34 − (−0,76) = 1,10 V. Zn ist negative Anode, Cu positive Kathode. Der äußere Elektronenpfeil führt Zn → Cu; NO₃⁻ zur Zn-Halbzelle und K⁺ zur Cu-Halbzelle. Beide Salzstegenden liegen in den Lösungen. Die Gesamtgleichung ist atom- und ladungsbilanziert. Werte, Vorzeichen, Einheiten, Pole und vollständiges Intervall bleiben im ganzen Bild bei 360/680 Pixeln erkennbar, ohne äußere Caption.

Die Achse ist ein schematischer Vergleich; ihre vertikalen Abstände sind keine kalibrierte Messskala. Die äußere Verbindung zeigt den Elektronenweg ohne eingezeichnete Last oder Voltmeter. Das Bild ist damit weder ein experimenteller Messaufbau noch eine Behauptung einer gemessenen Klemmenspannung im Kurzschluss. Die 1,10 V bezeichnen die Standardpotentialdifferenz. Diese Modellgrenzen rechtfertigen keine metrische Interpolation und keinen praktischen Messversuch aus dem Bild. Die relative Referenzkonvention stimmt mit der [IUPAC-Definition des Elektrodenpotentials](https://goldbook.iupac.org/terms/view/E01956) und des [Standardelektrodenpotentials](https://goldbook.iupac.org/terms/view/S05912) überein; die [SHE-Konvention](https://goldbook.iupac.org/terms/view/S05917) bedeutet keine fehlende Grenzfläche.

Die vollständigen Aufgaben verlangen diese Referenzbedeutung, Standardzustände/Temperatur, Redoxrichtung, Bilanz, beide Ladungstransportwege und die Standard-/Realgrenze. Die unabhängigen Variationen verlangen zusätzlich begründete Referenzunabhängigkeit beziehungsweise intensive Potentialdifferenz: Cu/Ag 0,46 V; Ag/R +0,60 V; Cu/R +0,14 V; Vorschlagsrichtung Mg/Fe −1,93 V und spontane Richtung +1,93 V; formale Verdreifachung 2 → 6 Elektronen bei unverändertem E°; M/SHE +0,80 V. Die Skalierungsgrenze stimmt mit der [IUPAC-Definition der Standard-EMK](https://goldbook.iupac.org/terms/view/S05913) überein. Zahlenroutine allein erfüllt die Rubrik nicht.

**Primärzellen:** Im Schnitt ist der positive MnO₂-Bereich außen, der negative Zinkbereich innen. Der negative Kollektor kommt von unten und berührt nicht den positiven Deckel; der trennende Bereich und der isolierte untere Kontakt sind erkennbar. Diese vereinfachte Anordnung und die Zellreaktion passen zum [Herstellerhandbuch der Alkali-Mangan-Zelle](https://energizer.com/wp-content/uploads/2023/12/alkaline_appman.pdf). Bauformen und die Icons Leistung/Kosten/Entsorgung stellen offene Kriterien dar. Sie liefern kein vorweggenommenes Umwelturteil. Die Kerngegenstände und kurzen Labels bleiben bei 360/680 Pixeln verständlich.

## Batterie-Transfer und genaue P-Bindung

`q3-12-a` trägt die Pflicht zum unabhängigen **konzeptionellen** Transfer: Das veränderte Nutzungs- und Lagerungsprofil verlangt eine erneute bedingte Abwägung von Luftzugang, Aktivierungszustand, verifiziertem 1,5-V-Geräteanschluss und nutzbarer Energie. 4 Wh beziehungsweise 2 Wh sind korrekt berechnet. Das Material behauptet beim Zink-Luft-Paket keine 1,5-V-Einzelzellspannung; Wandler und nutzbare Energie einschließlich Verlusten sind explizit vorgegeben. Die Antworten bleiben auf diese fiktiven Pakete begrenzt.

`q3-12-b` verlangt weiterhin einen vollständigen Hauptfall mit Redoxprinzip, getrennten Ladungstransportwegen und bedingter Rohstoff-/Kostenabwägung. Die 2 → 2,4-Wh-Änderung liefert korrekt 0,1 Wh Reserve für Typ B, ist aber ausdrücklich **numerical-practice**, kein zweiter konzeptioneller Transfer. Der erhaltene historische Schlüssel `fresh-transfer` wird im vollständigen aktuellen Profil in beiden Sprachen entsprechend begrenzt. Eine Zielschließung allein aus dem Zahlenvergleich ist nicht gerechtfertigt.

Die drei tatsächlichen P-Tupel wurden mit den unveränderten normalen Fingerprintfunktionen, den vollständigen aktuellen Zielen, den aktuellen Profilen und den exakten PNG-Bytes neu berechnet. Alle neun Fingerprintfelder stimmen mit den Kandidatenrecords sowie den beiden BookModel-Kontexten überein; semantische Bindungsfehler: 0. Die exakten Werte stehen in [current3-P-tuples.actual-recomputed.json](inspection/current3-P-tuples.actual-recomputed.json).

## Reichweite der Ergebnisse

[V3](V3.independent-a.ai-approved.inactive.json) enthält nur die drei tatsächlich geprüften Bildrecords mit exakter `aiApprovedAssetSha256`. [P3](P3.independent-a.current-reviewed.candidate.jsonl) bewahrt alle vollständigen Profile und normalen Fingerprint-/Statusfelder; es bleibt `ai_candidate / needs_human_review`. Kein normales P-v2-Profil wurde mit AI-Autorität auf `approved` gesetzt.

Die ganzen Provenienz-/Kontextfelder und die neutrale Quellenabgrenzung wurden gelesen. Die 398-Ziele-Prüfsicht bietet keinen neuen Quellenbeleg über den unveränderten 378-Ziele-Quellenatlas. Die bisherigen Quellen-/Operatorpflichten bleiben in ihrer ursprünglichen Reichweite offen. Die externen fachlichen Plausibilitätskontrollen ergänzen diese begrenzte Prüfung; sie erzeugen keine curricularen Quellenmappings, Quellenfreigaben oder Veröffentlichungserlaubnis.

Dieser Reviewer hat ausschließlich dieses eigene inaktive Ergebnispaket geschrieben. Es wurden keine Bilder erzeugt, keine aktiven Dateien oder Helper geändert, keine Vollbuilds ausgeführt und keine GitHub-/Plugin-/Runtime-/Publikationshandlung vorgenommen. Die lokalen Bild- und Seitenansichten beweisen keine Host- oder Humanakzeptanz.
