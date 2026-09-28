# Mathematik M7: vier importierte PNGs, unabhängige exakte V-Sichtung

Review date: 2026-09-27

Stand: 27. September 2026. Dies ist ausschließlich die maschinelle Bild-QS
für die vier unten genannten, nun aktiven Mathematik-Visualisierungen. Die
Sichtung erfolgte unabhängig von deren Erzeugung und Import. Die Originale
und vorhandenen 360-Pixel-Ansichten wurden gegen die aktuellen kanonischen
DE-/EN-Zieltexte, die bildbezogenen P-Kontexte und die Alttexte geprüft. Für
jedes Ziel sind `tmp/.../images/<ID>.png`, kanonisches Quell-PNG, öffentliches
App-PNG und Backend-PNG bytegleich nach SHA-256. Auch die aktiven kanonischen
Links zeigen auf genau diese Dateien; Provider, `lang: de`, Alttext,
`CC-BY-4.0`-Metadatum und `reviewStatus: pilot` sind gesetzt.

| Lernziel | Importierter SHA-256 | Exakte maschinelle Bildentscheidung |
| --- | --- | --- |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` – Körpersymmetrien | `45772c3862767cfd98131dbcfd8c11fe343b0b7fe95358000d4d1e354c1620b9` | **AI-V-accept.** Die blaue senkrechte Ebene liegt in der Mitte des transparenten Würfels und trifft gegenüberliegende Kanten in deren Mitte. Die orange gestrichelte Achse führt durch Ober- und Unterseitenmitte; eine Vierteldrehung bildet den Würfel auf sich ab. Zeichnerische Perspektive, Pfeil und alle drei Beschriftungen sind am Original und bei 360 px plausibel und lesbar. Das Bild zeigt einen Würfel; die unabhängigen P-Fälle zu ungleichkantigem Quader und quadratischer Pyramide werden dadurch nicht vorweggenommen. |
| `4aa70ad4-171d-5671-a864-c0c7758fa0ed` – Softwaresimulation | `34387caf628357b0d265b94dcd0c0d2359d15265b7219532f9a918ecb8b92251` | **AI-V-accept mit Deckungsgrenze.** Tabelle und Säulen zeigen für die Augen 1–6 durchgehend `10, 12, 8, 11, 9, 10`; die Summe ist 60 und `12/60 = 0,20 = 20 %`. Werte und Achsen sind auch bei 360 px noch entzifferbar. Das Bild illustriert die Auswertung und grafische Darstellung eines Simulationsergebnisses, nicht das Einrichten oder Bedienen von Software. Diese Tätigkeit muss in P/D selbstständig geprüft werden; der Alttext darf das nicht als durch das Bild nachgewiesene Lernendenleistung ausgeben. |
| `9023226b-fc17-412b-807c-2bb45cd551d5` – quadratische Gleichungen | `4827bc3171dde6090f174fcda4d3a6691296b5e1ee2820b7928dac491113f060` | **AI-V-accept.** Die vier Teilflächen sind `x²`, `2x`, `2x`, `4`, also `x²+4x+4=(x+2)²`. `(x+2)²=0` ergibt algebraisch `x=−2`; der große, auch bei 360 px lesbare Hinweis `Im Bild: x ≥ 0 / Algebraisch: x = −2` trennt die gezeichnete geometrische Aufteilung von der algebraischen Lösung. Ein konkreter Ergänzungsfall, kein Ersatz für grafisches Lösen, Lösungsformel oder Sachtransfer. Nicht die spätere Attempt-05-Datei mit abgeschwächtem Domänenhinweis verwenden. |
| `21fa0c22-976e-59b3-a871-899f0c0177f3` – Wahrscheinlichkeitsterm zuordnen | `345954480f78d53665c8effba6d22e8019ae4aebc745960f01f111e86cc4c976` | **AI-V-accept.** Vor dem ersten Zug liegen vier rote und sechs blaue Kugeln vor; eine rote Kugel wird herausgenommen. Danach verbleiben drei rote und sechs blaue. Für zweimal Rot ohne Zurücklegen gilt `(4/10)·(3/9)=2/15`. Der irritierende Leerraum einer älteren Variante ist fort; Bestände, Term und Beschriftung bleiben bei 360 px klar. Das Bild zeigt eine gültige Zuordnung, nicht die vom Lernenden selbst zu erbringende Umkehrkonstruktion oder den unabhängigen Komplementfall. |

Die folgenden vollständigen IDs indexieren dieselben oben unabhängig geprüften Endbytes für den maschinenlesbaren Rollout-Status. Sie sind keine zusätzliche oder menschliche Freigabe.

| Goal ID | Title | Decision | Exact imported SHA-256 | Finding |
| --- | --- | --- | --- | --- |
| `b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2` | Symmetrien einfacher Körper untersuchen | `accepted_pilot_after_original_resolution_ai_review` | `sha256:45772c3862767cfd98131dbcfd8c11fe343b0b7fe95358000d4d1e354c1620b9` | Würfelachse und Spiegelebene stimmen; keine Prüfung der weiteren P-Fälle. |
| `4aa70ad4-171d-5671-a864-c0c7758fa0ed` | Zufallsexperimente mit Software simulieren | `accepted_pilot_after_original_resolution_ai_review` | `sha256:34387caf628357b0d265b94dcd0c0d2359d15265b7219532f9a918ecb8b92251` | Häufigkeitstabelle und Diagramm stimmen; Softwarebedienung bleibt eigenständige Lernleistung. |
| `9023226b-fc17-412b-807c-2bb45cd551d5` | Quadratische Gleichungen lösen | `accepted_pilot_after_original_resolution_ai_review` | `sha256:4827bc3171dde6090f174fcda4d3a6691296b5e1ee2820b7928dac491113f060` | Flächenzerlegung und algebraische Lösung stimmen mit getrenntem Geltungsbereich. |
| `21fa0c22-976e-59b3-a871-899f0c0177f3` | Zufallsexperimente und Ereignisse aus Termen formulieren | `accepted_pilot_after_original_resolution_ai_review` | `sha256:345954480f78d53665c8effba6d22e8019ae4aebc745960f01f111e86cc4c976` | Urnenbestände und Term für zweimal Rot stimmen; der Komplementfall bleibt ungeprüft. |

Die genauen aktiven Provider sind im kanonischen Link enthalten: bei
`b4fd63de` und `9023226b` OpenAI/Codex-Imagegen, bei `4aa70ad4` Google
Gemini/Nano Banana 2 (`gemini-3.1-flash-image`), bei `21fa0c22` ein
OpenAI/Codex-Edit eines Gemini-Pro-Bildes. Die Prompt- und Versuchsketten
bleiben unter `tmp/math-m7-image-prompts-2026-09-27/` nachvollziehbar;
`SIX_IMAGE_IMPORT_PREP.md` benennt die exakten finalen Dateien und verworfenen
Alternativen. In den geprüften Pixeln sind keine Logos, Wasserzeichen oder
erkennbar fremden Figuren sichtbar. Das ist keine abschließende rechtliche
Prüfung. `CC-BY-4.0` gilt nur für Rechte, die SkillPilot an eigenen Inhalten
einräumen kann; der Provenienzhinweis ist keine Rechtegarantie.

Die vier Einträge in `mathematik.qa.json` tragen `aiApproved: yes` nur mit den
oben genannten **exakten** Asset-Hashes. `humanApproved: no` bleibt
unverändert. Diese maschinelle V-Sichtung ist weder menschliche Freigabe noch
eine D-/P-Beschreibungs-, Lernleistungs- oder Gesamt-M7-Abnahme. Nach
geändertem Bild oder Zieltext müssen die jeweils betroffenen aktuellen
Bindungen neu geprüft werden.
