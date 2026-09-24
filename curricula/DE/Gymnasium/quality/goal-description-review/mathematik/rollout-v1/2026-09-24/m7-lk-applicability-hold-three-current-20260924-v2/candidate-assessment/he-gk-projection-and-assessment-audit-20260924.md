# HE-GK-Projektion und Assessment-Bindung: gezielter M7-Audit

Stand: 24.09.2026. Dies ist ein Kandidatenaudit, keine Freigabe und kein zentraler D-Abschluss.

## Befund

- Die aktuellen Ziele `803d910d-96d1-5118-b9ca-29e93d0da76d`, `d3c42193-f1b7-5c6d-a991-bf034d99359f` und `ae3483e3-4712-56a1-a881-2e1f8a1a8df9` tragen jeweils nur das Kurs-Tag `LK`. Ihre direkten HE-Quellenbezüge sind Q2.5 Spiegelstrich 4 beziehungsweise Q4.2 Spiegelstrich 15; die ersten beiden sind in der aktuellen HE-Quellenextraktionszuordnung als eigene LK-Aspekte erfasst.
- `de-he-sekii-gk.view.json` und `de-he-gk.view.json` projizieren alle drei als `target`; die daraus generierten G8/G9-GK-Ansichten erben dies. Die zwei Q2-Ziele stehen sogar als explizite `canonicalSubtree`-Einträge in den GK-Ansichten. Das Q4-Ziel wird über den breiten Teilbaum `a5f07620-a895-52db-a0cc-1d05bf64c3d6` mitgenommen.
- Die GK-Ansichten enthalten derzeit insgesamt **93** atomare `target`-Ziele, die `LK`, aber nicht `GK` tragen; die entsprechenden LK-Ansichten enthalten 140. Die drei hier untersuchten Ziele sind somit Teil eines größeren Kursprofil-Projektionsproblems. Die Zahl ist eine Momentaufnahme der aktuellen `collectCompositionProjectionRoleGoalIds`-Auswertung, keine historische Curriculum-Gesamtzahl.
- Das Q2-Assessment `81823f27-0c92-5444-ac4e-32b83169f318` nennt die beiden Q2-LK-Ziele in `requires` und `examData.coveredGoalIds`. Seine konkrete Aufgabe behandelt aber eine zweidimensionale Matrixabbildung, einen Eigenvektor und die Projektion auf die x-Achse; sie fordert weder eine Parallelprojektion auf eine beliebige Ursprungsebene in $\mathbb R^3$ noch das Lösen von $A\vec x=\vec x$ für Fixpunkte.
- Das Q4-Assessment `f77b9b40-6afc-5d9e-821e-79903bbbcb94` nennt das Gütefunktionsziel in beiden Listen. Seine konkrete Aufgabe optimiert den Umfang eines Rechtecks bei festem Flächeninhalt mit Ableitung und Ungleichung; sie enthält keine Operationscharakteristik, Gütefunktion oder Stichprobenumfangentscheidung.

## Konsequenz für diese drei Ziele

Die Beschreibungsreviews können blind und unabhängig als Kandidaten erstellt werden. Eine zentrale D-Integration der drei LK-Ziele bleibt zurückgestellt, bis ihre Kursprofil-Projektion und die beiden konkreten Assessment-Bindungen gezielt korrigiert und erneut geprüft sind. Eine bloße Fingerprint- oder Hash-Anpassung wäre dafür keine fachliche Prüfung. Die vorhandenen `examData.reviewStatus: released`-Werte belegen keine Freigabe einer veränderten Aufgabe oder Abdeckungsbehauptung; menschliche Release-Gates bleiben getrennt.

## Begrenzter Korrekturpfad

1. Die GK-Basisansichten und generierten Daueransichten mit einem getrennten Kursprofil-Paket prüfen; die 93 betroffenen LK-Ziele nicht durch einen lokalen Drei-Ziele-Patch stillschweigend übergehen.
2. Für die beiden Assessments `requires` und `coveredGoalIds` anhand des tatsächlich gestellten Aufgabentexts korrigieren. Der Aufgabentext, die Lösung und die Bewertung bleiben dabei gesondert zu prüfen, falls sie angefasst werden.
3. Die aktuelle HE-Projektion, Kursprofilgrenzen, Assessment-Abdeckung, betroffenen Seiten/Kontexte und abhängigen Layer-A-Prüfungen nach der Korrektur erneut prüfen. Historische Reviews und veröffentlichte Artefakte bleiben erhalten.

Bis dahin: **strenger Nettozuwachs 0**, keine der drei Ziel-IDs ist durch diesen Audit geschlossen.
