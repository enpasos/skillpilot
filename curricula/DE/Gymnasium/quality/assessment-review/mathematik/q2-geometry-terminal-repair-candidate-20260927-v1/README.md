# Q2-Geometrie: Reparaturpaket für lokale Prüfungswege (AI-Kandidat)

**Status:** eigenständiger, nicht kanonischer Aufgabenentwurf vom 27.09.2026. Weder Prüfungsfreigabe noch D-/P-/M7-KEEP oder Veröffentlichung. Die kanonische Landschaft, die zentrale Prüfungsregistrierung, Kompositionsansichten und das Lernzielbuch wurden hierfür nicht geändert. `TASKS.md` enthält Aufgaben, Lösungen und Bewertungseinheiten; `candidate-routes.json` enthält die vorgeschlagenen *direkten* `requires`- und `coveredGoalIds`-Listen. `MATH-REVIEW.md` dokumentiert den engen Rechen- und Lückencheck; `verify.mjs` prüft die mechanischen Invarianten gegen den noch unveränderten Ausgangsstand.

## Ausgangsproblem und Reparaturidee

Die bestehende Q2-Prüfung `1878f680-095c-511d-aaed-e98393f7fde9` behauptet 43 direkte Voraussetzungen und 43 geprüfte Ziele, obwohl sie nur eine vierteilige Koordinaten-/Pyramidenaufgabe enthält. Der [Quellen- und Prüfungs-Audit](../../../goal-description-review/mathematik/rollout-v1/2026-09-24/m7-q2-volume-two-source-route-current-20260924-v2/audit-20260927.md) begründet, weshalb derzeit höchstens drei Ziele vollständig nachgewiesen und nach einer präzisen Ergänzung von Teil 3 höchstens vier vertretbar sind. Das vorliegende Paket hält die vierte Zuordnung `5f548596…` **bedingt**: Ohne explizite Prüfung der Körpereigenschaften in Teil 3 wären nur drei Ziele zu behalten und 40 statt 39 zu ersetzen.

Die vierteilige Aufgabe bleibt bei 20 BE; Teil 3 ergänzt den Volumenvergleich mit einem Prisma gleicher Grundfläche und gleicher senkrechter Höhe. Die alte Teil-3-Rubrik wird innerhalb der bestehenden 6 BE differenziert. Nur nach fachlicher Freigabe dürften die beiden kanonischen Listen gemeinsam auf die vier belegten IDs reduziert und `coveredStrands` von L1–L4 auf L3 korrigiert werden. Teil 4 über Längenskalierung begründet **nicht** die LK-Kompetenz zu *vektoriellen* Transformationen.

Die übrigen **39** Ziele werden nicht künstlich in der alten Aufgabe gelassen, sondern zwölf thematischen, lokal in Q2 sinnvollen Prüfungsentwürfen zugeordnet. Ein Paket enthält mehrere Teilaufgaben; die Zusammenfassung ist eine Kandidatenstruktur, kein Nachweis, dass alle Ziele schon valide geprüft sind. Zeichen- und Softwareleistungen fordern ausdrücklich eine eigene Abgabe. Der LK-Herleitungs-/Transformationsentwurf bleibt LK-only.

## Gezielte Revision und erneuter Aufgabencheck

Die erste Fassung war an mehreren Stellen zu knapp: Volumenaufgaben gaben Raumgrößen oder Spatvektoren direkt vor; Raumkoordinaten prüften nicht beide Skalarproduktdeutungen; Geradenlage konnte ohne systematisches Gleichungssystem entschieden werden; Körpertypen wurden in Prosa fast schon benannt. Die jetzige Fassung verlangt Koordinatenmodelle/Skizzen und selbst gewählte Spatkanten, Orts- und Verschiebungsvektoren samt **selbst formulierter** Komponenten- und Winkelbeschreibung des Skalarprodukts, geometrische Deutung von Abhängigkeit/Kollinearität, zwei vollständig aufgestellte Gerade-Gerade-Gleichungssysteme samt geometrisch gedeutetem Gerade-Ebene-Schnitt sowie fünf aus Eckpunktmodellen zu erschließende Körper. Die Streckung `2u` muss eigens gedeutet werden. Eine eigene 20-BE-Aufgabe vergleicht Längen und Winkel an Würfel, Quader, geraden/schiefen Prismen und Pyramiden. Bei Pyramiden ist nur die **Lot-Höhe**, nicht die Seitenkante, senkrecht zur Grundfläche.

`requires` und `coveredGoalIds` sind getrennte Entscheidungen. Die Werte sind in dieser Fassung für jedes lokale Terminal zwar gleich, weil jeweils alle unmittelbar geprüften Teilkompetenzen als nach der Lernphase beherrschte Prüfungsgrundlage angesetzt werden; das ist **kein** allgemeiner Kopieralgorithmus. Die individuelle Gate-Begründung steht in `requiresRationale` pro Aufgabe, und der lokale Prüfer erzwingt gerade **keine** Gleichheit. Ob diese Gates in GK/LK und den betroffenen Länderprojektionen fair sind, bleibt offen.

Sieben der neun konkret benannten Aufgabenlücken sind **auf Entwurfsebene bearbeitet**: `aae119f2…` verlangt die eigene Wahl und Begründung eines zweiten Koordinatenbezugs; `636b3e2d…` einen Eigenschaftsbeweis an der Pyramide; `b04bd2d6…`, `d6b74b15…` und `ef1524f1…` prüfen Kongruenz, Ähnlichkeit und Figurenargumente auch unabhängig an Vierecken. Neu ergänzt wurden für `b4fd63de…` ein bewerteter Symmetrievergleich von Zylinder und Kegel mit Quader/Pyramide sowie für `4af3dfb9…` drei **nicht vorbenannte** Koordinatenfiguren, zu denen Lernende die Eigenschaften selbst bestimmen und vollständige fachsprachliche Beschreibungen verfassen. Die neuen Teile haben eigene Lösungen und BE. `taskLevelCoverageRepairs` hält den Unterschied zwischen einer bearbeiteten Aufgabenentwurf-Lücke und einer **noch ausstehenden menschlichen Deckungs- und Projektionsfreigabe** ausdrücklich fest.

Zwei Zuordnungen bleiben in `coverageReviewHolds`: Bei `075f1ef2…` fehlt das **Ablesen** unbekannter Punkte/Vektoren aus einer vorgegebenen 3D-Darstellung; `d379e28b…` erkennt Körper nur aus Koordinatenmodellen und eigenen Skizzen statt aus einem geprüften visuellen Stimulus. Ohne passendes zusätzliches Aufgabenmaterial und Fachreview gehören diese IDs nicht in eine freigegebene `coveredGoalIds`-Liste. Auch die übrigen `coveredGoalIds` sind weiterhin **Reviewvorschläge, keine bestätigte volle Abdeckung**. Bei nicht aufgelösten Holds muss die Zuordnung aus der Prüfungsaufgabe entfernt oder eine spezifische Teilaufgabe ergänzt werden. Ebenso bleibt die vierte ID der alten Prüfung bedingt. Damit ist keine vollständige 39er-Fachdeckung behauptet.

Auch bei den nicht gehaltenen Kandidaten ist die *Projektions- und Gate-Fairness* offen: Die GK/LK-Zuordnung im Entwurf ist keine geprüfte Bundesland-/Kompositionsansicht. Eine spätere Prüfung muss je tatsächlich sichtbarem GK-/LK-Scope kontrollieren, ob die Aufgabe erreichbar ist, keine LK-Kompetenz einen GK-Weg sperrt und alle direkt als `requires` geführten Teilziele bereits als faire Prüfungsvoraussetzung taugen. Besonders das gemeinsame Fünf-Formeln-Gate und Geräte-/Upload-Voraussetzungen dürfen keine unnötigen Hürden schaffen. Die 17/39-Direktpfad-Rechnung unten ersetzt diesen terminalen CQR-/Projektionscheck nicht.

Ein [reproduzierbarer Projektionsaudit](PROJECTION-AUDIT.md) hat diese Lücke
konkretisiert: Im aktuellen nationalen Lernzielbuch passen bei sechs von
zwölf Kandidatenaufgaben die pauschalen GK/LK-Marker nicht zu den
gemeinsamen Geltungssichten ihrer direkt geprüften und vorausgesetzten
Ziele. Das ist ein notwendiger Korrekturauftrag am **Entwurf**, keine
automatische Erlaubnis, die Aufgaben auf die kleine Schnittmenge zu
beschränken und andere Lernwege unversorgt zu lassen.

Bei einer nach Review gestrichenen `coveredGoalIds`-Zuordnung ist die
zugehörige `requires`-Kante **eigenständig** zu prüfen; die beiden Listen
werden nicht blind gemeinsam gekürzt. Die alte Prüfung ist in 14
Bundesländern anwendbar, viele neue Zielgruppen reichen über 16; bei zwei
Kandidaten unterscheiden sich die Länder sogar innerhalb der Zielgruppe.
Ihre alte Anwendbarkeit darf nicht auf neue Prüfungs-IDs kopiert werden.

## Vollständige Liste der 39 zurückzunehmenden Direktlinks

| Kanonisches Ziel | Zielkurztext | Vorgeschlagenes lokales Aufgabenpaket |
| --- | --- | --- |
| `1e77bb2f-0cd6-5961-b0fb-230317c73fce` | Volumen von Prismen aus Grundfläche und Höhe bestimmen | `q2-volume-five-solids` |
| `a594dec0-3977-5c43-9432-d4254a7f6130` | Volumen von Spaten und Tetraedern mit Spatprodukt berechnen | `q2-volume-five-solids` |
| `c71ae268-f28e-59f0-982d-91db8f963378` | Volumen von Zylindern aus Radius und Höhe bestimmen | `q2-volume-five-solids` |
| `e8237315-654e-5150-97de-49c4cb49b3d1` | Volumen von Kegeln aus Radius und Höhe bestimmen | `q2-volume-five-solids` |
| `2f2c9f1a-07f0-59e4-b84a-60648c3b0bda` | Volumen von Kugeln aus dem Radius bestimmen | `q2-volume-five-solids` |
| `e9181209-1506-59df-9053-17f36b91bb06` | Volumenformeln räumlicher Körper herleiten (LK) | `q2-volume-derivation-transform-lk` |
| `7d37513b-fa1a-54cc-9e2a-9279a381f0f0` | Transformationsargumente für Flächen und Volumina nutzen (LK) | `q2-volume-derivation-transform-lk` |
| `075f1ef2-6860-4b20-9df2-878157eb395e` | Punkte und Vektoren im Raum koordinatisieren | `q2-coordinates-vectors-metric` |
| `d81d888c-6ffa-5751-8a4b-ce2ff3085071` | Punkte im Raum mit Koordinaten beschreiben | `q2-coordinates-vectors-metric` |
| `f37b0a72-9e23-51c7-aad5-438c17a56899` | Vektoren im Raum addieren und vervielfachen | `q2-coordinates-vectors-metric` |
| `fb7a4fa0-03b5-53b4-bd86-608480b748a1` | Betrag eines Vektors im Raum bestimmen | `q2-coordinates-vectors-metric` |
| `69eda7f9-1898-5220-932d-e7bec839b7af` | Streckenlängen im Raum bestimmen | `q2-coordinates-vectors-metric` |
| `2ac2e902-a6ad-53c9-b139-d1c63d823023` | Skalarprodukt von Vektoren definieren | `q2-coordinates-vectors-metric` |
| `72dfc164-455d-4b63-85f0-96e803c9a1d5` | Linearkombinationen von Vektoren bilden und deuten | `q2-vector-combination-dependence` |
| `6fc9246a-9448-4cdb-b627-cf20ea1c65d3` | Lineare Abhängigkeit und Unabhängigkeit von Vektoren prüfen | `q2-vector-combination-dependence` |
| `54cfe5ce-693e-5d4a-ac1b-009570fbbc11` | Kollinearität von Vektoren im Raum prüfen | `q2-vector-combination-dependence` |
| `525b1da9-7fdd-4a70-9f30-ff01d7511b04` | Geraden und Strecken im Raum in Parameterform darstellen und Parameter deuten | `q2-lines-planes-intersections` |
| `06de364f-9b63-4044-8229-a975621dc6df` | Koordinatenformen von Ebenen zur Orientierung im Raum nutzen | `q2-lines-planes-intersections` |
| `69beb31d-5d02-4505-9500-3ec81af86f1e` | Lagebeziehungen von Geraden im Raum untersuchen | `q2-lines-planes-intersections` |
| `baf7276f-60a0-4d96-b959-d63acfb929de` | Schnittpunkte von Geraden mit Ebenen berechnen | `q2-lines-planes-intersections` |
| `3016ec37-1c2e-47db-83f5-e767923bc97e` | Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen | `q2-projection-mirror-point-distance` |
| `3256476b-ec65-4038-9f5a-a8808fbcf207` | Punkt-Gerade-Abstände im Raum bestimmen | `q2-projection-mirror-point-distance` |
| `8cb5c712-9c58-5910-8c63-8c3736369b80` | Punkte an Ebenen spiegeln | `q2-projection-mirror-point-distance` |
| `ed5d869b-af4e-4b80-b34d-a2338e16ce34` | Orthogonale Projektionen als erste lineare Abbildungsintuition deuten | `q2-projection-mirror-point-distance` |
| `509ae03b-96b1-4bb1-b015-b83d14569dae` | Gerade-Gerade-Abstände im Raum bestimmen | `q2-skew-lines-parallel-plane-distance` |
| `8eb14d81-353a-4909-9464-61be7b1ba5b8` | Gerade-Ebene- und Ebene-Ebene-Abstände im Raum bestimmen | `q2-skew-lines-parallel-plane-distance` |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten | `q2-cuboid-spatial-representations` |
| `7680701b-35e3-519e-beaa-09753e733756` | Schrägbilder räumlicher Objekte zeichnen | `q2-cuboid-spatial-representations` |
| `eb6bfdd9-3cbe-51b5-9798-a741bdc2782e` | Geometriesoftware zur Raumorientierung nutzen | `q2-cuboid-spatial-representations` |
| `d379e28b-d9d5-5cab-b383-318e0499c0c7` | Einfache geometrische Körper im Raum beschreiben | `q2-cuboid-spatial-representations` |
| `50eb5156-5046-5887-80dc-3128c5f8cbd6` | Längen- und Winkelbeziehungen einfacher Körper untersuchen | `q2-body-length-angle-family` |
| `eb070ed2-7ef4-5afe-b203-190ebb0116af` | Parallelität und Orthogonalität einfacher Körper untersuchen | `q2-cuboid-body-properties` |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | Symmetrien einfacher Körper untersuchen | `q2-cuboid-body-properties` |
| `636b3e2d-c687-5469-8850-e085df06878d` | Körpereigenschaften fachlich begründen | `q2-cuboid-body-properties` |
| `9f9c7ece-b81c-55fa-8073-dd816d7d4778` | Oberflächeninhalte von Körpern berechnen | `q2-cuboid-body-properties` |
| `4af3dfb9-7e15-5da5-8b86-0aac6c80e266` | Einfache geometrische Figuren beschreiben | `q2-plane-figures-classification` |
| `b04bd2d6-21d4-5ac5-9a77-b5f950a41c24` | Kongruenzbeziehungen ebener Figuren untersuchen | `q2-plane-figures-congruence-similarity` |
| `d6b74b15-1cbc-512b-a160-0f40aecafe8c` | Ähnlichkeitsbeziehungen ebener Figuren untersuchen | `q2-plane-figures-congruence-similarity` |
| `ef1524f1-0b2f-59f7-a001-5ab3e3dececb` | Eigenschaften geometrischer Figuren begründen | `q2-plane-figures-congruence-similarity` |

## Grenzen und notwendige Freigaben

- `requires` ist ein tatsächliches Didaktik-Gate. Vor einer Integration muss jede Kandidatenaufgabe auf eine faire, nicht unnötig harte Voraussetzung geprüft werden. `coveredGoalIds` darf nur enthalten, was ihre benotete Schülerleistung **vollständig** belegt; eine thematisch passende Aufgabe allein genügt nicht.
- Die zwölf Entwürfe sind nicht normativ, nicht menschenbegutachtet und in dieser Form nicht im Cockpit. Insbesondere die breiten Ziele zu Figuren-/Körpertypen und Körperbeziehungen brauchen einen unabhängigen Fachreview von Aufgabenstellung, Lösung und BE; ggf. weiter aufteilen statt eine Abdeckungsbehauptung zu erzwingen.
- Wenn der Fachreview `5f548596…` trotz Ergänzung von Teil 3 nicht als vollständig belegt ansieht, entsteht **ein weiterer** zurückzunehmender Direktlink. Dieses 39er-Paket deckt den dann zusätzlich nötigen lokalen Prüfungsnachweis noch nicht ab.
- Vorläufige Graphrechnung: Alle 39 bisher nur über diese eine Q2-Prüfung als **direkte** Prüfungsvoraussetzung geführten Ziele verlieren bei bloßer Reduktion ihren direkten lokalen Prüfungslink; 17 hätten dann sogar keinen `requires`-Pfad mehr zu einem der 52 vorhandenen Sek-II-Prüfungsenden, 22 behalten einen indirekten Pfad. Dies ist nur eine direkte Graphprüfung, **keine** anwendungs- und projektionstreue CQR-/GK-/LK-Routenfreigabe.
- Falls Aufgaben integriert werden, müssen echte IDs, lokale Q2-Cluster-Einbindung, GK-/LK-Anwendbarkeit, Aufgaben- und Lösungsreview, `coveredStrands`/Rubriken sowie betroffene GoalBook-/QA-/D-/P-/M7-Nachweise atomar geprüft werden. Historische Artefakte nicht überschreiben. Erst dann CQR/Terminals und nationale Book-/Projektionschecks laufen lassen. Ein grün laufendes JSON-Schema oder dieses Kandidatenpaket allein belegt keine M7-Reife.

Konkrete Freigabereihenfolge: (1) unabhängige mathematisch-didaktische Prüfung **jeder** Aufgabenfassung, Lösung, BE und Ziel-Teilaufgaben-Zuordnung, einschließlich der bedingten vierten alten ID; (2) GK-/LK- und Bundeslandprojektionen sowie faire direkte `requires` je Paket festlegen; (3) erst dann kanonische Prüfungs-IDs, Q2-Cluster, `examData` und Abdeckungsmetadaten als zusammenhängende Änderung einarbeiten; (4) gezielte Schema-/Assessment-/Routen-/GoalBook- und D/P-Fingerprint-Checks ausführen; (5) menschliche Abnahme und den tatsächlichen M7-Bericht getrennt dokumentieren. **Keiner dieser Schritte ist mit diesem Entwurf bereits erledigt.**
