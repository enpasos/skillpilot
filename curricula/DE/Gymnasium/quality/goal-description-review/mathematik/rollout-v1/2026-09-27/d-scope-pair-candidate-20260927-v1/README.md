# Mathematik M7: zwei bildbereite D-Holds in Q2 – Quelle, Kursprofil und Prüfung

Stand: 27.09.2026. **Nicht kanonischer Audit**, keine D-Entscheidung, keine neue Bildfreigabe, keine menschliche QS. Die beiden aktuellen Ziele bleiben im strengen Fünf-Gate-Bericht offen; Nettozuwachs: **0**. Dieser Kandidat ergänzt die bestehende [D-Synthese](../m7-vready-remainder19-recheck-20260927-v1/synthesis-assessment.md), den [Q2-Identitätskandidaten](../m7-q2-three-goal-identity-candidate-20260927-v1/README.md) und den [GK/LK-Atlas-Audit](../m7-q4-lk-gk-projection-audit-20260927.md), ersetzt sie nicht.

## Nachweisstand

| ID | Aktuelles Ziel | Enger Befund |
| --- | --- | --- |
| `6b2a1c04-8c28-51ff-905b-9c9492a26cc3` | „Spezielle Lagen von Geraden und Ebenen begründen (LK)“ | Keine abgegrenzte Zusatzleistung und kein direkter Quellenbeleg für die einzige effektive Atlas-Geltung BW-LK. HE Q2.3 ist nur `partial`, gehört zum gemeinsamen GK/LK-Umfang und trägt bereits `58f613da…` exakt. Das vorhandene Bild zeigt einen korrekten Spezialfall, begründet aber keinen eigenen LK-Lernzielumfang. |
| `803d910d-96d1-5118-b9ca-29e93d0da76d` | „Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)“ | Der DE/EN-Text und die HE-LK-Quelle passen. Der Atlas weist trotzdem in 15 Ländern GK **und** LK aus. Das einzige hier gefundene terminale Assessment nennt das Ziel, prüft aber nur eine Projektion mittels einer **2×2-Matrix** auf die x-Achse. |

Beide aktuellen visuellen Assets stehen in `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json` auf `aiApproved: yes` mit den gebundenen Bild-SHA-256-Werten (`6b2a…`: `8031e926…`, `803d…`: `1b0cb7b7…`). Das ist **kein** Argument für D-KEEP oder eine andere Zielidentität. Die aktuellen P-v2-Profile sind als `ai_candidate`/`needs_human_review` gekennzeichnet; ihre positive fachliche Beispielsubstanz und die getrennte menschliche Prüfung dürfen nicht verwechselt werden.

## 1. `6b2a…`: vorhandene Kompetenz oder Dublette?

Der kanonische DE/EN-Text verlangt unbestimmte „besondere Lagebeziehungen“ von Geraden und Ebenen beziehungsweise *special positional relationships*. Die fünf `requires` umfassen bereits Geradenparametrisierung, Gerade–Ebene-Schnitt, Winkel, Lageklassifikation und Abstandsverfahren. Insbesondere `24174bba…` lehrt die Gerade–Ebene-Lage bereits als eigenes GK/LK-Ziel; `0f4f9957…` ist die LK-Identität für Ebene–Ebene-Lagen. Das P-v2-Profil zu `6b2a…` verwendet eine in einer Ebene enthaltene Gerade **und** zwei getrennte parallele Ebenen. Damit ist auch im Nachweisprofil keine trennscharfe zusätzliche LK-Leistung erkennbar.

Die amtliche [HE-Q2.3-Stelle, Druckseite 42](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) nennt unter *grundlegendem Niveau (GK und LK)* die besondere Lage **einer Geraden zu Koordinatenachsen und Koordinatenebenen**. Die aktuelle Quellenextraktion bindet genau diesen Aspekt `exact` an `58f613da…`, aber nur `partial` an `6b2a…` (`hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json`, Aspekt `he-math-sekii-q2-3-b03-a03-eeed44a0`). Für eine breite LK-Mehrleistung liefert diese HE-Stelle keinen eigenständigen Beleg.

Der aktuelle nationale Atlas zeigt `6b2a…` ausschließlich als **BW-LK**. Die amtliche [BW-Leistungsfach-Stelle 3.4.3(6), Fassung 2024/V2](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M.V2_IK_11-12-LF_03) verlangt Lage- und Schnittgebilde für Gerade–Ebene und Ebene–Ebene. Das trägt die Fachfamilie, benennt aber keine darüber hinausgehende *besondere* Konfiguration oder eigenständige Transferleistung; die vorhandenen kanonischen Nachbarziele erfassen beide Objektpaare bereits. Die aktuellen BW-Mapping-Dateien enthalten für `6b2a…` keine direkte Zielzuordnung. **Schlussfolgerung aus Quellen und Zielgraph, nicht amtliche Aussage:** Für ein zusätzliches BW-LK-Atom fehlt gegenwärtig eine überprüfbare eigene Identität.

Kein `examData.coveredGoalIds` des aktuellen kanonischen Graphen enthält `6b2a…`; das einzige direkte `reverseRequires` ist `7d37513b…` („Transformationsargumente für Flächen und Volumina nutzen (LK)“). Ein späteres Retire/Merge darf daher dessen Lernweg, mögliche gespeicherte Lernerfolge, Landesprojektionen und Quellenbindungen nicht still verlieren. **Bevorzugter Kandidatenpfad:** zunächst nach einem wirklich eigenen, konkret benannten BW-LK-Quellaspekt und einer separaten Assessment-Leistung suchen; bleibt beides aus, die Dublette fachlich auf `24174bba…`/`0f4f9957…` beziehungsweise `58f613da…` konvergieren lassen, `7d37513b…` neu begründen und vorhandene Mastery-Daten migrieren. Keine neue Bildaufgabe für eine bis dahin ungeklärte Zielidentität ausgeben.

## 2. `803d…`: klarer LK-Inhalt, inkonsistente Geltung und unzutreffende Prüfung

Die amtliche [HE-Q2.5-Stelle, Druckseite 44](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) trennt die gemeinsamen Projektionen auf **Koordinatenebenen** von den LK-Projektionen auf **beliebige Ursprungsebenen**. Der kanonische Text verlangt eine vorgegebene Richtung außerhalb der Zielebene. Das ist mathematisch sinnvoll: Für `E={x:n·x=0}` und `n·d ≠ 0` ist die Projektion entlang `d`

`P(x) = x - (n·x)/(n·d) d`, also `P = I - d nᵀ/(n·d)`.

Die Forderung `n·d ≠ 0` sichert den eindeutigen Schnitt mit `E`; `P²=P`, jeder Bildpunkt liegt in `E`, und alle Punkte von `E` bleiben fest. Die aktuelle 3D-Visualisierung entspricht dieser LK-Identität. Ohne Änderung des Zieltexts oder Bildes ist hier fachlich **kein neues Bild** angezeigt; V wäre nach einer bloßen Kursseitenkorrektur gezielt erneut zu prüfen, nicht automatisch zu ersetzen.

Das Ziel trägt kanonisch nur `LK`, und die HE-Zuordnung zu `he-math-sekii-q2-5-b04-a02-0d61ba3e` ist `exact`. Dennoch führt `de-gym-mathematik-bundesweit.book-model.json` für `803d…` in **15** Bundesländern jeweils GK und LK. Der bestehende GK/LK-Audit führt dies auf die ungeschnittene Teilbaumübernahme im Lernzielbuch-Generator zurück und unterscheidet korrekt zwischen **nachgewiesen fehlerhafter Buch-/D-Seite** und der gesondert nach LK-Tags filternden Cockpit-/Backend-Laufzeit. Eine kosmetische Entfernung von „(LK)“ wäre fachlich falsch. Der Korrekturschnitt muss dieselbe effektive Kursentscheidung für Atlas und Laufzeit nachweisen; der vorhandene Audit quantifiziert insgesamt 103 betroffene LK-Zielseiten und 95 schon D-gebundene Seiten, die bei einer Kursseitenänderung überprüft werden müssen.

Das aktuelle gemeinsame GK/LK-Assessment `81823f27-0c92-5444-ac4e-32b83169f318` führt `803d…` sowohl in `requires` als auch in `examData.coveredGoalIds`. Sein vierter Aufgabenteil verwendet jedoch `B=[[1,0],[0,0]]` und projiziert in **R²** auf die x-Achse. Das prüft weder eine 3D-Matrix noch eine beliebige Ursprungsebene in R³. Der Assessment-Status `released` hebt diese inhaltliche Überdeckung nicht auf. Zudem kann ein GK/LK-gemeinsamer Terminalknoten nicht ohne Weiteres ein LK-only-Ziel voraussetzen.

Als **nicht veröffentlichter fachlicher Testfall** für eine getrennte LK-Abschlussaufgabe eignet sich beispielsweise: Zielebene `E: x+2y-z=0`, Richtung `d=(0,1,0)` und Ausgangspunkt `A=(2,0,4)`. Gefragt werden Herleitung und Matrix der Parallelprojektion, `P(A)`, Nichtdegeneriertheit und zwei unabhängige Kontrollen. Hier ist `n=(1,2,-1)`, `n·d=2`,

`P = [[1,0,0],[-1/2,0,1/2],[0,0,1]]`, `P(A)=(2,1,4)` und `2+2·1-4=0`; zudem `Pd=0` und `P²=P`.

Der Fall weicht vom aktuellen Bild (andere Ebene/Richtung) ab und prüft die übertragbare Formel. Die Matrixrechnung wurde unabhängig nachgerechnet. Er ist **nur** ein fachlicher Aufgabenrohling mit Kernrechnung, keine vollständig begutachtete Musterlösung/Bewertungsrubrik und keine Freigabe. Vor Integration sind ein LK-Terminal mit selbstständigem Aufgaben-/Lösungs-/Punkte-Review und der GK/LK-Split des bisherigen gemeinsamen Assessment-Zugangs zu entscheiden. Die 2D-Aufgabe kann für ihre tatsächlich geprüften GK/LK-Ziele bleiben, darf `803d…` aber nicht weiter als erledigt ausweisen.

## Sicherer Implementationsschnitt und Abschlussnachweis

1. `6b2a…` nur nach einer **Identitätsentscheidung** ändern oder ablösen; zuerst Zielabgrenzung, BW-/HE-Quellenbezug, `7d37513b…`-Voraussetzung und bestehende Mastery-/Scope-Auswirkungen belegen. Bei Entfall ändert sich der aktuelle `curricularAtomic`-Nenner legitim, aber nicht durch bloßes Weglassen eines unbequemen Ziels; die Kompetenz muss bei den verbleibenden IDs nachweislich gedeckt sein.
2. `803d…` als LK-Ziel behalten. Die generelle GK/LK-Schnittmenge im Atlas zielgerichtet mit Runtime vergleichen, nicht nur diese eine Buchseite flicken. Danach dessen neue Seite und alle 95 zuvor D-gebundenen betroffenen Seiten auf inhaltliche/metadata-Kompatibilität prüfen; wo nötig zwei neue unabhängige D-Reviews mit aktuellen Seiten-Fingerprints durchführen.
3. `81823f27…` fachlich auf die tatsächlich geprüften 2D-Inhalte begrenzen und `requires`/`coveredGoalIds` angleichen. Für die 3D-LK-Leistung ein separates, vollständig geprüftes Terminal schaffen; Prüfungsanforderung und `coveredGoalIds` müssen anhand derselben Aufgabenleistung übereinstimmen. Die einschlägigen Layer-A- und Lernwegprüfungen danach erneut ausführen.
4. Nur geänderte Ziele, Quellbindungen, Projektionen, Seiten, P-/A-/M-/V-Fingerprints und Nachbar-Prerequisites gezielt neu prüfen; historisches Reviewmaterial nicht überschreiben. Anschließend zentralen Fünf-Gate-Bericht und CQR-303 prüfen. Maschinelles M7 bleibt unabhängig von menschlicher Erprobung/Freigabe.

**Status:** D für beide IDs offen. Keine kanonische oder QA-Registry-Datei wurde mit diesem Audit geändert; keine der beiden bestehenden Visualisierungen wurde ersetzt.
