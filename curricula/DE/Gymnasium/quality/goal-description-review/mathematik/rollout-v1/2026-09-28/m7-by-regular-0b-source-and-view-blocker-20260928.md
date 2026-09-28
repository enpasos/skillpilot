# BY-Pflichtfach Mathematik: M13.4-Integralziel `0b162cb0…`

Stand: 28. September 2026. Dies ist ein Quellen- und Projektionsbefund, **keine**
BY-GK-Freigabe und keine neue D-/M7-Entscheidung.

Der [amtliche Fachlehrplan Mathematik 13 auf erhöhtem Anforderungsniveau](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/13/mathematik)
führt M13.4 unter der regulären Mathematik. Die Source-Extraction zerlegt die
Erwartung in den Aspekt `9371884f-3c08-5f6f-b963-163f2ccc9cb3` (flexible,
reflektierte Anwendung von Differential- **und** Integralrechnung in
Sachzusammenhängen) und den Aspekt
`by-math-m13-4-9371884f-s02-bf45d4d2b4` (Interpretation/Validierung).
Die bisherige `exact`-Kante des ersten Aspekts auf den Gesamtcluster
`ead1f5ce-fdf4-5591-8982-395001017848` bleibt erhalten. Neu ist eine
**`partial`-Kante** desselben Aspekts auf das atomare Ziel
`0b162cb0-8507-5ac2-b9d6-57f40f4d3f35`: Dieses prüft nur die Wahl,
Anwendung und Deutung geeigneter *Integral*-Methoden. Es beansprucht weder
Differentialrechnung noch die Validierung der Modellannahmen. Die zweite
Source-Extraction-Kante wird nicht auf dieses Atom kopiert.

## Noch nicht wirksame BY-GK-Zuordnung

Nach der beschlossenen Zwischenregel muss `0b162cb0…` in Bayern sowohl im
technischen GK- als auch im LK-Zielumfang stehen. In den beiden aktuellen
BY-GK-Kompositionsansichten fehlt es; die BY-LK-Ansichten enthalten den
Elterncluster. Ein direktes `goalEntry` in den beiden GK-Dateien wäre im
aktuellen System **keine funktionierende Korrektur**:

- Das Atom trägt `tags: ["LK", "canonical"]` und
  `applicability.courseProfile: ["LK"]`. Diese globalen Markierungen dürfen
  wegen anderer Bundesländer nicht pauschal zu GK+LK geändert werden.
- `LearnerService.java` filtert im gewöhnlichen Lauf die kanonischen Ziele
  nach `matchesCourseFilter` **vor** `applyCompositionViewProjection`. Das
  LK-only-Atom ist deshalb im GK-`allGoals`-Set nicht mehr vorhanden, wenn
  ein `goalEntry` ausgewertet wird.
- `goalBookModel.ts` prüft bei aktivierter Kursprofil-Schnittmenge sowohl
  `applicability.courseProfile` als auch die LK-Marker, bevor die
  Atlas-Geltung festgelegt wird. Ein direkter GK-View-Eintrag allein kann
  beide Prüfungen nicht aufheben.

Die fachlich richtige Folgemaßnahme ist eine **explizit auf DE-BY Mathematik
und einen direkt als `target` gesetzten GK-View-Eintrag begrenzte**
Kursprofil-Override-Regel in Atlas und Lernendenprojektion. Erst mit dieser
Regel und ihren Regressionen gehört das Atom in beide BY-GK-Views.
Nicht-BY-GK darf es dadurch nicht zusätzlich erhalten. Die beiden anderen
bereits direkt in BY-GK platzierten regulären Ziele `b431148b…` und
`49f9059a…` sind Gegenproben für denselben Vorfilter-Fehler. Der
Vertiefungskurs `9b339361…` muss weiterhin nur BY-LK-Target bleiben.

Die bestehende Tankprüfung `c849eeab…` enthält einen sachgerechten
Integralschritt, ist aber eine Drei-Ziele-Prüfung mit 10/20
Bestehenspunkten; ein Bestehen allein garantiert noch nicht die
Integral-Leistung. Assessment-Deckung und Bestehenskriterium sind gesondert
zu prüfen. Die neue Quellenkante ersetzt weder diese Prüfung noch die
erforderliche aktuelle D-/P-/A-/M-/V-Bindung.
