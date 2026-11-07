# GK24: unabhängiger vollständiger Inhaltsreview

**Fachliches Urteil: 24 von 24 Kompetenzverträgen sind im eingefrorenen Draft angemessen und selbstständig prüfbar. Kein fachlicher Inhalts-Hold. Anwendung, Identitäten und Release bleiben offen.** Der [JSON-Beleg](informatics-gk24-terminal-independent-review-2026-11-06.json) enthält für jede einzelne Kompetenz Originaltext, Eltern, Material-/Aufgaben-/Lösungs-/Rubrikbezug und eine eigene Begründung.

Geprüft wurden der vollständige Aufgabenbogen mit 197 Zeilen, sämtliche Materialien, die ganze Musterlösung mit 561 Zeilen, alle 24 unveränderten Originalbedeutungen einschließlich der tatsächlich vorhandenen englischen Texte und jedes einzelne Bewertungskriterium. Die beiden fehlenden englischen Originalbeschreibungen werden nicht ergänzt. Der Draft bleibt auf Quelle `f95c0a11…` und seine ursprünglichen Artefakthashes gebunden; der Integrationsplan `947ab004…` und die Abschlussquittung `ec02faeb…` bleiben unverändert.

## Fachliche Abdeckung und Kursgrenze

Die ausgeschlossene alte LK-Kompetenz `e3e5c851-39d8-569f-9f0a-d516c729ed36` verlangt paketorientierte Übertragung mit Adressierung und Segmentierung. Im GK-Material ist der zuverlässige geordnete Transportdienst gegeben. Keine zulässige Bestehensroute verlangt Segmentgrößen, Sequenz-/ACK-Rechnung, Pufferung oder Wiederzusammensetzung. Die weiterhin verlangte Erklärung von IP, DNS, Ports und vier TCP/IP-Ebenen ist eine eigenständige GK-Kompetenz und wird nicht mit dieser zusätzlichen Realisierungsleistung gleichgesetzt.

| Kriterien | Eigenständige erforderliche Leistung |
| --- | --- |
| G01–G02 | Komponentenfunktionen und konkreten Dienstweg erklären; IP, DNS, Port und vier Schichten begründet zuordnen. |
| G03 | Den gegebenen vollständigen SMTP-Dialog selbst analysieren, Token dekodieren und Risiken begrenzt bewerten. |
| G04–G06 | Eigenes vollständiges semantisches HTML, wirksames CSS und Formular erstellen; konkrete GET-/POST-Übertragung erklären. |
| G07–G10 | Eigene Ein-/Ausgabe, Zustandsänderung, Schleife/Verzweigung und Unterprogrammzerlegung implementieren und belegen. |
| G11 | Konkrete Fehler des gegebenen Altprogramms mit eigenen Gegenfällen und tatsächlich benutzten Werkzeugen lokalisieren und korrigieren. |
| G12–G14 | Vor Umsetzung planen, echte verschiedene eigene Entwicklungsstände dokumentieren und das eigene Ergebnis mit Reflexion vorstellen. |
| G15–G17 | Mono- und polyalphabetische Verfahren anwenden und brechen; Angriffe demonstrieren; drei moderne Schutzsituationen mit ihren Vertrauensgrenzen beurteilen. |
| G18 | Dialog und Logs über Session/Queue korrelieren; Anmeldung, Berechtigung und belegte Beobachtung unterscheiden. |
| G19–G20 | Dokumentbäume und neue Verschachtelung modellieren; eigenes responsives Layout tatsächlich prüfen. |
| G21–G22 | Eigene Teststrategie mit Soll-/Istwerten durchführen und den vorgegebenen Tarifcode gezielt lauffähig anpassen. |
| G23–G24 | Alle sechs Qualitätsdimensionen des eigenen Produkts beurteilen und ein prüfbares eigenes Pflichtenheft aus den tatsächlichen Anforderungen herleiten. |

Das neue **G23** bezeichnet Softwarequalität; es ist nicht die aus dem alten 25er-Vertrag ausgeschlossene **K23**-Paketkompetenz. Die Projektleistungen bleiben vollständig erhalten. Drei kopierte Referenzstände, eine kopierte Solltabelle oder reine Präsentationsüberschriften reichen laut Aufgabenstellung und Rubrik ausdrücklich nicht zum Bestehen. Planung, Entwicklung, Beobachtung und Reflexion sind durch die jeweilige Lernendenabgabe nachzuweisen.

Jedes der 24 Kriterien hat höchstens einen Punkt; die Bestehensschwelle ist 24. Fehlt irgendeine Kompetenzleistung, sind höchstens 23 Punkte erreichbar. Diese Arithmetik verhindert die Kompensation durch andere Aufgaben, ersetzt aber keine fachliche Bewertung der tatsächlich abgegebenen Leistung.

Die gemeinsame SMTP-Szene trägt zwei verschiedene Leistungen: vollständige Protokollanalyse in G03 und Authentisierungs-/Logbewertung in G18. Daraus folgt weiterhin **keine universelle gewöhnliche Vorbereitungskante `6c4… → ace…`**. Eine andere vollständig erklärte Login-/Logszene könnte G18 tragen, ohne den vorherigen ganzen SMTP-Abschluss zu verlangen.

Ein nicht blockierender redaktioneller Punkt betrifft ausschließlich `/competencyBindings/1/independentlyObservablePerformance` im Reviewinput: Dort steht noch „Kapselung“. Der tatsächliche Aufgaben-/Lösungs-/Rubrikvertrag verlangt korrekt das funktionsbezogene Zusammenwirken der vier Ebenen beim gegebenen Transportdienst. Ein späterer redaktioneller Nachfolger sollte diese Metadatenaussage daran angleichen; keine zusätzliche Segmentierungsleistung hinzufügen. Die Originaldatei wurde hier nicht geändert.

## Tatsächlich neue begrenzte Referenzbelege

Die Referenzquellen wurden aus den exakt gepinnten **GK24**-Markdown-Dateien extrahiert und mit einem [separaten Reviewer-Harness](verify_informatics_gk24_draft_reference_2026_11_06.mjs) in einer privaten, netzisolierten Umgebung ausgeführt. Der übrige Dateibaum war nur lesbar. Diese Ausführung ist weder ein übernommener E25-Lauf noch ein behaupteter Autor- oder Lernendenlauf.

- **19 Programm-/Rechenkontrollen bestanden:** Zustandsfolge, eigene Schleife, ungültige Anzahl-/Formfälle, keine Mutation bei Ablehnung, Tarif und echte V2/V3-Unterschiede, vier Chiffrenfälle einschließlich inverser Kontrollen, SMTP-Token, 76-Byte-HTTP-Body und sämtliche 24 fehlendes-Kriterium-Gegenrechnungen.
- **Drei tatsächliche Altcodefehler beobachtet:** `reserveV0` liefert für 2, 3 und 4 Plätze jeweils eine falsche Entscheidung oder einen falschen Objektzustand. Dieselben Fälle bestehen am korrigierten eingebetteten Code. Das sind erwartete fachliche Altcode-Negative, keine drei separat behaupteten roten Testprozess-Exits.
- **Vier echte Chromium-Breiten bestanden:** 320/767/768/1024 Pixel ergeben 1/1/3/3 Spalten ohne horizontalen Überlauf. An jeder Breite wurden die Formulareingaben 2→2→1 am Robotikkurs und vier Laserplätze mit tatsächlicher Rückmeldung und Kartenaktualisierung durchgeführt. Keine Netzwerkversuche, Seitenfehler oder dauerhaften Speicherwerte wurden dabei beobachtet.
- Die [320-Pixel-Ansicht](informatics-gk24-independent-reference-2026-11-06/gk24-320.png) und [1024-Pixel-Ansicht](informatics-gk24-independent-reference-2026-11-06/gk24-1024.png) wurden außerdem visuell geprüft. Das ist keine allgemeine Browser-, Barrierefreiheits-, Host- oder Menschenabnahme.

Das [vollständige Referenzergebnis](informatics-gk24-independent-reference-2026-11-06/reference-result.json), die extrahierten Quellen und die Logs sind dauerhaft getrennt vom Draft gesichert. Die ursprüngliche Aussage „kein neuer Autor-Referenzlauf“ bleibt historisch richtig. Hier kommen neue, ausdrücklich als unabhängig bezeichnete Reviewer-Beobachtungen hinzu.

## Aktuelle Quelle und Scope-Gegenprüfung

Der direkte Vergleich von `f95c0a11…` mit der aktuellen Quelle `00bcdbaf0723441eea0e33dfef36c674ed865b61d7009705cd6c83241a897422` zeigt genau ein verändertes Goalobjekt: das alte 25er-Terminal `49ba66cf…`, ausschließlich dessen `requires`. Alle 24 gewöhnlichen Goalobjekte und alle direkten Eltern sind vollständig gleich geblieben. Die alte 25er-Coverage sowie vorhandene Aufgaben-/Lösungsbytes wurden durch E9 nicht verändert. Der neue Beleg ergänzt diese aktuelle Kontextfeststellung, ohne alte Sourcehashes umzuschreiben.

Auch die **35 tatsächlich bestehenden Scopeprojektionen** wurden mit den vorhandenen Produktionsfunktionen frisch gegen `00bc` gerechnet: Targets und Support entsprechen in jeder Zeile exakt dem gebundenen ursprünglichen Scopeinput. Je drei vollständige GK24- beziehungsweise LK25-Angebotskontexte bleiben Bayern, Hessen und die nationale technische Projektion. Die übrigen 29 Scopezeilen werden nicht erweitert. Der [Scope-Gegenbeleg](informatics-gk24-independent-reference-2026-11-06/scope-result.json) betrifft den bestehenden Graphen; er behauptet keine schon eingefügten neuen Goals oder fertig geprüften neuen sichtbaren Bäume.

## Verbleibende Integrationspflichten

Die zwei UUID-v5-Vorschläge sind weiterhin unreserviert. Ein fachlich tragfähiges minimales `requires`-Array ist nicht festgelegt; der alte Praxisparent würde weiterhin die ausgeschlossene LK-Paketkompetenz vererben. Weder der positive Inhaltsreview noch 24 Coverage-IDs legitimieren einen automatisch erzeugten Vorpfad.

Vor Anwendung müssen der konkrete neue Goal-/Parent-/Metadaten-/Viewkandidat, alle globalen und atomaren Abhängigkeiten, die vollständigen 35 Scope-/Baumwirkungen und die geschlossene QA-/Routenerfassung tatsächlich geprüft werden. `reviewStatus=draft` bleibt blockierend. Dieser Review ändert keine Quelle, View, Freigabe, Ledger, Mastery oder Ergebnisgeschichte. Die alte 25er-Identität behält ihren vollständigen Vertrag; ein 24er-Teilpass, Alias oder eine Ergebnisübertragung ist nicht freigegeben.
