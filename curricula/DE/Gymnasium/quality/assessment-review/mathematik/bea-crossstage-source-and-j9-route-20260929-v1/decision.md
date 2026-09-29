# Raumstreckenmittelpunkt: Quellenstufe und J9-Prüfungsroute

AI-Fachprüfung am 29. September 2026. Kein menschliches Review, keine Freigabe oder Host-Erprobung. Die historischen J9-Aufgabenfassungen v2/v3 und früheren Reviewartefakte bleiben unverändert.

## Originalbelege und Geltung

| Land/Stufe | Original und konkrete Stelle | Entscheidung |
| --- | --- | --- |
| BW Sek I, Klassen 9/10 | Bildungsplan 2016 Gymnasium Mathematik 3.3.3, Punkte (9) räumliches Koordinatensystem und (10) Mittelpunkt einer Strecke berechnen | Das vorhandene Ziel `bea0e5a0-4833-5337-b6f1-7251b8cf8089` bleibt in BW J9 sichtbar. |
| BB Sek II | `input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Mathematik.pdf`, Q3 S. 29, „Mittelpunkte von Strecken im Raum berechnen“; PDF-SHA-256 `3c8c0df6901b6a6e7a1dff4f2d563696c32c43b19c1d0bcf401a0dc4fd224d79` | Das identische 3D-Ziel wird als BB-Q3-Target platziert. Eine vorherige Kante zum Analysis-Cluster wurde fachlich entfernt. |
| SL Sek I, J5/6 | `input/SL/LP_MA_gym9_5und6_2023.pdf`, S. 24, ausschließlich $x$-/$y$-Achsen und besondere Punkte ebener Figuren; PDF-SHA-256 `fd684fe9e30f4f072e98ed9dee7b28c8f1a7711dc9e104b0b390d33d418d950b` | Die Kante dieses Bullet zum räumlichen Ziel war falsch und wurde entfernt. |
| SL Sek II, G-Kurs | `input/SL/LP_Ma_GOS_HP_G-Kurs_2016_Stand_2019.pdf`, S. 30: Ortsvektorformel $\overrightarrow{OM}=\tfrac12(\overrightarrow{OA}+\overrightarrow{OB})$ und „leiten die Formel zur Berechnung des Mittelpunkts einer Strecke her“; PDF-SHA-256 `ee77ed726ee6be38a66a1830f0f69fd672883a2fb558cd6ceed41894fd0a5086` | Das in der alten Extraction ausgelassene einzelne GK-Bullet wurde als SourceGoal `de-sl-mathematik-sekii-gos-2014-2019-sl-sekii-q-gk-t05-geometrische-grundobjekte-b01-57ac95fb00` aus dem Original nachgetragen und partiell auf bea gemappt. |
| SL Sek II, LK | `input/SL/LP_Ma_LK_HP_2019.pdf`, S. 33: Formeln für Streckenmittelpunkt **und Dreiecksschwerpunkt** herleiten, beide Ortsvektorformeln im Fachwissen; PDF-SHA-256 `9a4c674eab01edda713a9aef60f38f2d24df3031a7361dabeb6b0f9946f66134` | Das bestehende LK-SourceGoal `de-sl-mathematik-sekii-gos-2014-2019-sl-sekii-q-lk-t05-vektorielle-untersuchung-geometrischer-strukturen-b01-2ff69db2d7` ist nur für den Mittelpunkt auf bea gemappt. |

Die eine stabile Ziel-ID beschreibt in allen drei zulässigen Kontexten dieselbe mathematische Kompetenz. Drei `goalPlacements` verorten sie in BW J9, BB Q3 und SL Sek II. `dimensionTags.phase=J9` bleibt ein Kompatibilitätstag, nicht der Quellenbeleg für BB oder SL. Die BB-/SL-CrossStage- und Sek-II-Composition-Views zeigen bea genau einmal unter analytischer Geometrie der Sek II; BW zeigt sie in J9. Der native Compiler meldete für die acht betroffenen BB-/SL-Views keine CPV-Fehler.

## Prüfungsroute

Die bestehende J9-Vektorprüfung `853905c5-e82b-592f-a485-1ff84c8bb22e` prüft in v4 fünf tatsächlich enthaltene Vektorziele mit 13 BE und Bestehensgrenze 12 BE. Ihre frühere Mittelpunkt-Teilaufgabe entfällt; BB und SL behalten damit diesen J9-Terminalpfad. Die neue BW-only-Prüfung `5f6496ef-e4d2-5341-8a2c-3293b2e4e25a` prüft den Mittelpunkt vorwärts und rückwärts samt gerichteter Kontrolle mit 8 BE, Bestehensgrenze 7 BE. Die Lösungen, Punktdeckel und Quellen-/Rollenprüfungen stehen in `assessments/mathematik/vector-shared-operations-2026-09-28/j9-stage-split-ai-review-2026-09-29.md`. Der native Zielrollencheck bestätigte BW-Ziel und BB-/SL-Ausschluss der BW-Prüfung, bei fortbestehendem BB-/SL-Target der gemeinsamen Aufgabe.

## Echter verbleibender Quellenrest

Das SL-LK-Bullet T05-B01 enthält zusätzlich die **Herleitung der Schwerpunktformel für ein Dreieck**. Die aktuelle Canon-Landschaft enthält kein semantisch passendes Atom dazu. Die früheren vier LK-Mappingkanten auf Analysis-/Ableitungscluster waren keine Abdeckung und wurden entfernt; das SourceGoal ist jetzt ausdrücklich `partial`. `pipelineStatus.MAPPING-3` der SL-Oberstufen-Extraction bleibt deshalb `in_progress`, obwohl alle 744 SourceGoals eine M3-Entscheidung haben. Der Schwerpunktanteil ist kein abgeschlossener M7-Nachweis und keine menschliche Freigabe.

Ein nachfolgendes, eigenständig zu prüfendes Canon-Atom sollte genau das Herleiten von $\overrightarrow{OS}=\tfrac13(\overrightarrow{OA}+\overrightarrow{OB}+\overrightarrow{OC})$ für den Dreiecksschwerpunkt abbilden, mit SL-LK-Quelle und Q-Placement. Die gegebene Originalstelle belegt dieses Atom; sie belegt es **nicht** für den G-Kurs. Ein neuer Zielknoten erhöht den aktuellen curricularAtomic-Nenner und braucht eigene D/P/A/M/V-Nachweise und einen stufengerechten lokalen Terminalpfad, bevor die Quellenlücke als geschlossen gelten kann.
