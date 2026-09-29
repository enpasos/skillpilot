# J10-Prüfungsrouten: BW-Vektoren und SL-Kugelherleitung

Begrenzte Folgekorrektur vom 29.09.2026. Diese Umsetzung ändert Scope und eine terminale Route; sie ist kein neuer D/P/A/M/V-Abschluss und keine menschliche Freigabe.

## BW-Aufgabe 5

`ea664a30-98be-508e-90ac-5304679814ee` verlangt in 7 von 10 BE dreidimensionale Vektorbewegungen und Geradenlage, anschließend in 3 BE eine Kegelvolumenrechnung mit Plausibilisierung. Die beiden vorausgesetzten J10-Vektorziele `b025df0c` und `ba343971` sind direkt nur für BW SekI belegt. Die Aufgabe ist daher als Ganzes **BW / SekI / J10**. Nur zwei Voraussetzungen zu entfernen, ohne die sieben zugehörigen BE zu ändern, wäre fachlich falsch.

Canon-Applicability und kontextgebundenes J10-Placement sind entsprechend begrenzt. `applicabilityFromRequires` und die Mapping-Inheritance-Grenze verhindern künftig eine losgelöste breite Prüfungsprojektion. Landesansichten außerhalb BW verwenden `prerequisiteOnly`; BW- und nationale Inhaltskatalogansichten behalten das Target. Aufgabeninhalt, Bewertung und historische Review bleiben unverändert. Die Quelle `assessments/mathematik/seki/j10/draft_v3.md` und deren alte Freigabe wurden nicht überschrieben.

Bekannte fachliche Grenze der unveränderten Aufgabe: Sie untersucht eine schneidende und eine parallele Geradenlage. Sie liefert allein keine vollständige Evidenz für alle vier im präzisierten b025-Text ausdrücklich benannten Fälle; identische und windschiefe Geraden sind nicht enthalten. Diese Scope-Korrektur wird deshalb nicht als neue vollständige Assessment- oder P-Freigabe ausgegeben. Auch der nur angehängte Kegeltank ist keine nachträgliche Bestätigung des breiten Transferumfangs von `6c122f0e`.

## Neue SL-Kugelprüfung

Vorherige J10-Prüfungen wurden tatsächlich gelesen: `926d0551` verwendet ein Füllverhältnis und begründet die Volumenformel plausibel; `68ffe46f` behandelt Cavalieri an Prismen. Keine dieser Aufgaben verlangt den allgemeinen Querschnittsvergleich einer Kugel mit dem archimedischen Restkörper. Eine zusätzliche `coveredGoalIds`-Kante wäre dort unbelegt gewesen.

Neu: `79f5f4cc-10e1-56a5-8ed3-8cd51688db41`, **practiceAssessment**, „Kugelvolumen durch Querschnittsvergleich herleiten (Jahrgangsstufe 10, 12 BE)“. Der [Aufgabenentwurf](../../../../../assessments/mathematik/seki/j10/sl-sphere-cavalieri-20260929/candidate.md) verlangt:

1. Zwei konkrete Querschnittsvergleiche als zugänglichen Einstieg.
2. Den allgemeinen Kugelschnitt aus Pythagoras und den Kegelschnittradius aus Ähnlichkeit.
3. Die vollständigen Cavalieri-Voraussetzungen sowie Zylindervolumen minus zwei Kegelvolumina.
4. Die Beurteilung des Fehlschlusses aus nur einem gleich großen Schnitt.

Es gilt exakt `requires = coveredGoalIds = [baea3966-5d10-53bf-8193-3fcda7b1e73f]`. Andere vorausgesetzte Rechenfertigkeiten werden nicht pauschal als geprüfte Lernziele übernommen. 12 BE, Bestehensgrenze 10; ohne allgemeine Querschnittsherleitung oder ohne Volumenherleitung sind höchstens 8 BE erreichbar. Algebraisch gilt für alle $-r\le z\le r$: $A_K(z)=A_R(z)=\pi(r^2-z^2)$ und $V=2\pi r^3-2(\pi r^3/3)=4\pi r^3/3$.

Die Originalquelle ist `input/SL/LP_MA_gym9_10_2026.pdf`, S.34 (Volumen- **oder** Oberflächenherleitung), S.35 (Restkörper/Cavalieri), S.36 (jeweils andere Herleitung fakultativ). Die Aufgabe prüft ausschließlich die bereits gewählte Volumenalternative. Sie erhält SL/SekI-Applicability, J10-Placement und die requires-abgeleitete Geltung. `cb20dd6b` enthält die neue Aufgabe, sein Gewicht steigt 10→11. SL-GK/LK-Ansichten zeigen sie unter J10-Prüfungen; andere Länder erhalten kein neues Target. Nationale Ansichten bleiben Inhaltskataloge.

**Status: `needs_review`.** Die strukturelle Route ersetzt keine unabhängige fachliche Aufgabenreview oder Freigabe. Eine menschliche Erprobung wird nicht behauptet. Neue Semantic-Kind-/A/M-Bindungen und die aktuelle Atlas-Navigation sind zentrale Folgeschritte; die Semantic-Kind-Einstufung als practiceAssessment wurde anschließend durch den zuständigen Q2-Agent vorgenommen.

## Native Prüfung

[Dateimanifest](changed-files.json), [Canon-/View-Prüfung](native-validation.json) und [direkte atomare Route](route-validation.json) sind versionierte Protokolle gegen eingefrorene Vorher-/Nachher-Eingaben. Ergebnis: Canon 0 Findings; 88 Views geprüft, 42 geändert; 0 neue Compilerfehler; 0 fremde atomare Target-Deltas; 0 unbelegte authored Targets.

Die native `validateHardDirectAtomicRoutes`-Prüfung über alle curricularen Sek-I-Atome meldet vorher genau die fehlende baea-Terminalroute, nachher keinen Befund. Die aktuelle authoritative Semantic-Kind-Entscheidung für die neue Prüfung war bei diesem Routenlauf bereits vorhanden; es wurde kein Ersatzwert injiziert. Dies ist ein lokaler struktureller Nachweis, keine Behauptung, dass die neue Prüfung bereits freigegeben oder alle M7-Gates geschlossen seien.
