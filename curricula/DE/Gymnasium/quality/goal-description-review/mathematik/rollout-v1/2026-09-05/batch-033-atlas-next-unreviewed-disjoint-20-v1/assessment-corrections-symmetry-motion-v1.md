# B033: Umsetzungsvorschlag für zwei Assessmentkorrekturen

Stand: 2026-09-06. Gezielte **AI-Synthese/Quellenabstimmung**, kein Blindreview, keine Übernahme und keine neue Freigabe. Ausschließlich diese Notiz und die zugehörige JSON-Datei werden angelegt.

Die [JSON-Datei](assessment-corrections-symmetry-motion-v1.json) enthält die vollständigen, exakt aus dem aktuellen Kanon gelesenen Vorhertexte, vollständige Nachhertexte für beide Aufgaben und Lösungen, historische Metadaten und Vergleichshashes. Der Gesamtdateihash ist wegen paralleler Arbeiten nur ein Aufnahmebeleg; für eine Übernahme sind die jeweiligen Vorherfelder erneut abzugleichen.

## 1. Symmetrie: e7013f6e-6051-5c88-8b4b-e054dc8db4cc

Unveränderter Titel: „Funktionen und Darstellungen analysieren“.

Der Vorschlag definiert $f$ zunächst auf $\mathbb{R}$ und kennzeichnet den Graphen auf $[0,9]$ ausdrücklich als Einschränkung des Modells. Teil 1 lautet neu:

> Prüfen Sie für die vollständige Parabel und den Modellgraphen, ob y-Achsen- oder Ursprungssymmetrie vorliegt; berücksichtigen Sie dabei jeweils die Definitionsmenge. Bestimmen Sie außerdem die Symmetrieachse und den Scheitelpunkt der vollständigen Parabel und entscheiden Sie, ob ihre Achsensymmetrie beim Einschränken auf $[0,9]$ erhalten bleibt.

Die Lösung prüft $f(-x)$ gegen $f(x)$ und $-f(x)$; die vollständige Parabel besitzt weder y-Achsen- noch Ursprungssymmetrie. Beim Modellgraphen fehlt schon die Invarianz von $[0,9]$ unter $x\mapsto -x$. Die vollständige Parabel hat weiterhin die Achse $x=4$ und $S(4\mid10)$. Der eingeschränkte Graph behält den Scheitelpunkt, aber nicht die globale Achsensymmetrie: $9$ wird an $x=4$ auf $-1$ außerhalb des Definitionsbereichs gespiegelt.

Alle bisherigen Aufgabenwerte, vier Teile und 20 Punkte bleiben erhalten; Aufgaben- und Lösungsteile 2–4 bleiben wortgleich. Die JSON enthält zusätzlich einen konkreten Ersatz für die bisher zu enge Bewertungsbeschreibung von Schritt e1, weiterhin 5 Punkte. Die vorgeschlagene interne Verteilung (2 Punkte y-/Ursprungssymmetrie, 2 Achse/Scheitel, 1 Definitionsmengen/Einschränkung) ist noch zu prüfen.

### Offene Befunde — keine Gesamtvalidierung der 13 Coverage-Einträge

Die Korrektur adressiert gezielt d8c9eb57-1614-4c1d-829a-618134def352. Sie bestätigt weder alle 13 alten coveredGoalIds noch die vollständige requires-Liste. Konkrete weitere Lücken bleiben separat:

- 8fa32a68…: keine Exponentialfunktion gefragt.
- 1801c759…: kein vorgegebener Graph, aus dem eine Funktionsgleichung gewonnen wird.
- 0b47fec8…: kein Verhalten im Unendlichen mit Grenzwertnotation.
- 56b4acb5…: kein Schnittwinkel.
- 71f62cfa…: Nullstellenberechnung, aber keine Aufgabe zur Vielfachheit und ihrem Graphenverhalten.

Außerdem reicht $[0,9]$ über den Bodentreffer $4+2\sqrt5$ hinaus; $f(9)=-2{,}5$. Das ist eine offene physikalische Modellgrenze, keine Begründung, das verlangte Intervall oder die Zahlen stillschweigend zu ändern.

Im aktuellen Record steht lediglich reviewStatus=released; reviewNote, sourceRef und sourceArtifactPath fehlen. Das ist kein Nachweis einer neuen oder menschlichen Abnahme. Eine spätere Freigabe braucht eine tatsächliche fokussierte Aufgaben-/Lösungs-/Bewertungsprüfung; die Abdeckung ist gesondert zu bereinigen.

## 2. Bewegung: ea664a30-98be-508e-90ac-5304679814ee

Unveränderter Titel: „Aufgabe 5 (Jahrgangsstufe 10, 10 BE)“.

Der Ansatz $r(t)=(1|2|0)+t\cdot(2|1|1)$ bleibt unverändert. Ergänzt werden Zeit in Sekunden, Ortskoordinaten in Metern und $t=0$ als Referenzzeitpunkt. Teil 1 verlangt ausdrücklich Anfangsort, konstante Ortsänderung pro Sekunde und Position nach zwei Sekunden. Die Lösung benennt den Geschwindigkeitsvektor $(2|1|1)\,\mathrm{m/s}$ und $r(2)=(5|4|2)$ in Metern; das bedeutet hier die Position bei 2 s, nicht einen dimensionslosen Zeitpunkt.

Für Teile 2 und 3 ist ausdrücklich die gesamte Trägergerade gemeint. Es entsteht weder eine neue Bedingung $t\ge0$ noch eine Verwechslung mit einem Bewegungsstrahl; eine bestimmte zusätzliche Parametrisierungsmethode wird nicht verlangt. Alle alten Zahlen, vier Teile und 2+3+2+3=10 BE bleiben erhalten. Teile 2–4 der Aufgabe bleiben wortgleich; in der Schnittlösung wird nur „Trägergerade“ präzisiert.

### Quellen- und Freigabefolge bei späterer Übernahme

Die JSON enthält neben den kanonischen Texten den exakten alten/neuen Task-5-Markdownabschnitt aus draft_v1.md sowie den passenden Lösungsabschnitt aus solution_v1.md, einschließlich historischer Dateihashes.

Das [J10-README](../../../../../../assessments/mathematik/seki/j10/README.md) erklärt bereits promovierte Quellenversionen für unveränderlich. Deshalb lautet der Vorschlag: **neue Task-5-only draft_v3.md / solution_v3.md**, keine Änderung an v1/v2 und keine Umhängung anderer Aufgaben. Diese Dateien sind hier weder angelegt noch freigegeben. sourceRef und examData.sourceArtifactPath müssen bei Übernahme gemeinsam auf die tatsächlich vorhandene neue Aufgabenquelle zeigen; die genauen Pfadvorschläge stehen in der JSON.

Historisch vorhanden sind reviewStatus=released, die Notiz „released after simulated internal review on 2026-06-28 for J10“ und der Bewertungsbezeichner j10_released_v1_5. [simulated_review_v1.md](../../../../../../assessments/mathematik/seki/j10/simulated_review_v1.md) nennt ausdrücklich Codex simulated didactic QA und approved_for_release_candidate. Das ist kein neuer menschlicher Einzelreview. Neue Dateiköpfe dürfen daher nicht ungeprüft den alten promoted-Status übernehmen; auch der versionierte Bewertungsbezeichner ist bewusst zu behandeln, ohne Punkte zu ändern.

Root sollte die neue Fassung erst nach einem tatsächlichen fokussierten AI-Review-v3 (mit wahrer Provenienz, Datum, geprüften Bytes und begrenztem Umfang) als freigegeben übernehmen. Falls operative Inhalte vorher geändert werden, wäre needs_review die ehrliche Zwischenstufe; wegen der Auswirkung auf Lernendenverfügbarkeit entscheidet Root dies ausdrücklich. Die kanonische Beschreibung nennt bereits eine „freigegebene Prüfungsaufgabe“ und darf keinen ungeprüften Entwurf unter alter Freigabe kaschieren.

## Grenze dieses Vorschlags

Keine Kanon-, Quellen-, Ledger-, Profil-, Bild- oder Graphänderung; keine Testsuite und kein neuer Reviewlauf. Erst eine spätere Adoption löst die zuständigen Kontext-/Fingerprint-/Provenienz- und Qualitätsaktualisierungen aus. Historische Belege bleiben erhalten. Die beiden Korrekturen sind kein pauschaler Release- oder Coverage-Nachweis.
