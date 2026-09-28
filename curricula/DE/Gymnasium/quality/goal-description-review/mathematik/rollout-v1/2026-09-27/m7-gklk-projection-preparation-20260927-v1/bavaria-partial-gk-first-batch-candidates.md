# Bayern: erster Quellenabgleich für nur teilweise gemappte Pflichtziele

Stand 27. September 2026. Kandidatennotiz ohne View-Änderung, D-Freigabe
oder M7-Zuwachs. Grundlage sind der amtliche [LehrplanPLUS M12](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer)
und [LehrplanPLUS M13](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik),
der aktuelle Kanontext, die BY-Source-Extraction samt Mapping und die
aktuellen Kompositions-Views. Alle drei nachstehenden Ziele sind derzeit
direkte `goalEntry`-Ziele in `de-by-lk.view.json` und
`de-by-sekii-lk.view.json`, aber fehlen in `de-by-gk.view.json` und
`de-by-sekii-gk.view.json`. Die kanonischen Tags lauten jeweils `GK`, `LK`;
keiner ihrer Titel trägt einen einschränkenden `(LK)`-Zusatz.

| Ziel | Amtlicher Pflichtbezug | Voraussetzung und vorläufiger Befund |
| --- | --- | --- |
| `b9bbd2a8-1379-5ffb-817f-41467d48abef` – Hauptsatz der Differential- und Integralrechnung nutzen | M13.1 verlangt anschauliches Begründen des Hauptsatzes und Berechnen bestimmter Integrale über Stammfunktionen; die Deutung als Flächenbilanz steht im selben Pflichtkapitel. Die einzelne Mapping-Zeile `28181660-ad3d-5ed4-891d-e98b477c92bd` bleibt `partial`. Für die vollständige Zielformulierung einschließlich geometrischer Deutung ist die Kombination der beiden amtlichen Aussagen zu dokumentieren. | Das direkte `requires`-Ziel `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` (Flächen unter Graphen näherungsweise bestimmen) ist bereits BY-GK-`target`. Quellen- und Pfadlage sprechen für einen gezielten Placement-Kandidaten. Vor Freigabe: betroffene Atlas-Seite, D-Bindung und Frontier prüfen. |
| `da95ab35-bac2-54f2-b38f-8b612cde8b54` – Zufallsgrößen und Verteilungen als Modellrahmen einordnen | M12.2 führt Zufallsgrößen und Wahrscheinlichkeitsverteilungen ausdrücklich ein und arbeitet mit diskreten Darstellungen und der Binomialverteilung. Die Mapping-Zeile `0555e436-b1af-5e09-bea9-7be198a364bd` ist eine `partial`-Teilkompetenz des breiteren Pflichtabschnitts. | Direkt vorausgesetzt sind `09f47964-2cd0-410e-93ee-9632b582fc91` (Funktionsbegriff, BY-GK-`target`) und `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` (Orientierung, in beiden GK-Views als `canonicalSubtree`). Eine fachlich passende Wahrscheinlichkeitsgrundlage fehlt in der direkten `requires`-Liste. Vor Placement den didaktischen Einstieg und die Frontier-Kette prüfen und nötigenfalls korrigieren. |
| `71683f37-24de-4e0f-badd-858b56fa4d64` – Parameter einer Funktion aus Kontextbedingungen bestimmen | M13.4 verlangt Parameterwerte aus Bedingungen eines Funktionsterms; derselbe Abschnitt behandelt Sachkontexte. Die Mapping-Zeile `b131f9ae-5003-5d50-899d-f2b6fa4c8718` ist `partial`. Dieselbe Quellenstelle ist bereits `exact` mit dem engeren Ziel `6947245e-6bd7-52d7-9bc2-0c60cfa447c5` (Parameterwerte in ganzrationalen Funktionen) verbunden. Breite und Nicht-Duplizierung des zusätzlichen Ziels sind daher gesondert zu begründen. | Das einzige direkte `requires` ist die Orientierung `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`, die in beiden GK-Views vorhanden ist. Für ein M13-Anwendungsziel ist das didaktisch zu schwach: Es könnte unmittelbar nach der Motivation angeboten werden. Vor Placement die fachliche Voraussetzungskette korrigieren und gezielt testen. |

`b9bbd2a8` ist aus diesem Dreiervergleich der einzige Kandidat ohne
offenkundige Lücke in der unmittelbaren didaktischen Voraussetzung.
Die anderen zwei sind quellennahe Zielkandidaten, aber gegenwärtig
**nicht placement-fertig**. Ein fehlender Eintrag für die Orientierung
im auf `curricularAtomic` begrenzten Lernzielbuch ist dabei kein Beleg
für einen fehlenden Laufzeitknoten: Die Orientierung ist in beiden
GK-Views ausdrücklich referenziert.

Nicht in diesen kleinen Batch gehören beispielsweise `0f180645` (der
Kanon fordert zusätzlich eine Volumenformel-Herleitung), `c406d5a0`
(zusätzlich unbekannter Verteilungsparameter), `c72a8032` (ohne die
amtliche Beschränkung auf einfache Fälle) sowie die zwar pflichtnahen
Raumziele `075f1ef2`, `be0e8715`, `9460c3ff` und `ea4bd128` mit noch
zu schließender fachlicher Voraussetzungskette. Die beiden Pflichtziele
`ae5010cc` und `cf48c918` haben zwar bereits sichtbare direkte
Ableitungs-Voraussetzungen, tragen aber noch `(LK)` im Titel; eine
neutrale Kanonformulierung braucht anschließend erneute Text-/Bild-QS.

Weitere fachliche und technische Vorbereitung siehe
[Teil-Mapping-Triage](bavaria-partial-mapping-triage.md) und
[Zwischenzuordnung](bavaria-interim-pre-placement-audit.md).
