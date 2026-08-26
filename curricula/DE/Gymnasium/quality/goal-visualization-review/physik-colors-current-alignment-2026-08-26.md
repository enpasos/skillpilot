# Physik: aktuelle Visualisierungsprüfung für Farbziele

Date: 2026-08-26

Dieser append-only Nachtrag bindet die Visualisierungen an die nach dem
dualen Beschreibungsreview aktuellen Lernzieltexte. Der historische Eintrag in
`physik-batch-074.md` bleibt als damaliger Prüfstand unverändert; bei
`1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075` ersetzt die folgende aktuelle
Sichtprüfung ausdrücklich dessen sachlich unzutreffende Spektrum-/Zapfen-Notiz.

| SkillPilot-ID | Entscheidung | Begründung |
|---|---|---|
| `a4681378-ade4-4f20-bf77-fb020469510f` | `accepted_pilot_after_fresh_ai_review_correction` | Frische Sichtprüfung des mit OpenAI ImageGen erzeugten Originalbilds: Die Zweiteilung kennzeichnet Prismendispersion und den schnell rotierenden Farbkreis ausdrücklich als verschiedene Vorgänge. Das Prisma zerlegt weißes Licht in Spektralfarben in korrekter Reihenfolge; der rotierende Farbkreis erzeugt nur einen annähernd weißen Farbeindruck und zerlegt kein Licht. Das Auge empfängt Licht. Text, Umlaute und Zielbezug sind korrekt. Aktives Asset: `a4681378-ade4-4f20-bf77-fb020469510f-v2.png`; reviewed asset hash: `sha256:92fa897740a8303aec87e5f3163931e3f2883db166cfc7ba83282e462ce0101e`. |
| `1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075` | `accepted_pilot_after_fresh_ai_review` | Frische Sichtprüfung des bestehenden Originalbilds: Derselbe rote Apfel wird unter weißer und grüner Beleuchtung gezeigt. Die Darstellung trennt Lichtquelle, Oberfläche und das zum Auge gelangende Licht fachlich korrekt; das Auge sendet keine Strahlen aus. Damit passt das Asset zur aktuellen Beschreibung. Die historische Spektrum-/Zapfen-Begründung beschrieb dieses Bild nicht und gilt nicht mehr als aktueller Reviewstand. Reviewed asset hash: `sha256:520fdeed70bf83ddbf5c429d8478fb8da15b704a705a366e43795d8e8bf96e4f`. |

Der finale ImageGen-Prompt und die aktive Asset-Route sind im Prompt-Datensatz
des Ziels `a4681378-ade4-4f20-bf77-fb020469510f` versioniert. Das frühere
Prisma-only-Bild bleibt als historischer Zustand erhalten, ist aber nicht mehr
die aktive Lernzielvisualisierung.

## Präzisierter aktueller Stand nach dem zweiten Beschreibungsreview

Die folgenden jüngeren Einträge binden dieselben Assetbytes an die nochmals
präzisierten aktuellen Beschreibungen. Sie sind für diese Ziele der maßgebliche
Reviewstand.

| SkillPilot-ID | Entscheidung | Begründung |
|---|---|---|
| `a4681378-ade4-4f20-bf77-fb020469510f` | `accepted_pilot_after_fresh_ai_review_correction` | Frische Originalprüfung gegen die vergleichend präzisierte Beschreibung: Das aktive Zweifeld-Asset trennt Prismendispersion und schnell rotierenden Farbkreis ausdrücklich. Die Spektralreihenfolge, die schnelle Rotation, das empfangende Auge und der annähernd weiße Farbeindruck stimmen; das Bild behauptet weder Farberzeugung im Prisma noch Lichtzerlegung am Farbkreis. Reviewed asset hash: `sha256:92fa897740a8303aec87e5f3163931e3f2883db166cfc7ba83282e462ce0101e`. |
| `cdab9fd1-5054-4a7e-8c9a-4474062ddd23` | `accepted_pilot_after_fresh_ai_review` | Frische Originalprüfung gegen den präzisierten Wortlaut: Das Asset stellt additive Mischung ausdrücklich als Licht auf dunklem Grund und subtraktive Mischung als Filter/Farbe dar. Die korrekten RGB- und CMY-Kombinationen sowie „mehr Licht → heller“ und „mehr Filter/Farbe → dunkler“ unterstützen die Unterscheidung von Überlagerung und selektiver Lichtentnahme ohne fachlichen Widerspruch. Reviewed asset hash: `sha256:b73707fb44b3a0d20d3e371b111f8f58e3c0e2d5ac6bf34e0301df3642032ab7`. |
| `cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5` | `accepted_pilot_after_fresh_ai_review` | Frische Originalprüfung gegen den präzisierten Wortlaut: Das Asset ordnet Bildschirmfarben ausdrücklich der additiven RGB-Mischung und Farbdruck der subtraktiven CMY(K)-Mischung zu. Licht-/Helligkeits- und Farbe-/Dunkelheitskontrast, Beschriftungen und Umlaute sind korrekt. Reviewed asset hash: `sha256:d22542d622babce52a45a5b27886675a91b336d96396e4c4b2e5e66120f346e5`. |

## Maßgeblicher Stand nach der dritten Beschreibungsprüfung

Die folgende jüngste Prüfung bindet das unveränderte Asset an die nun
ausdrücklich kausale Beschreibung. Sie ersetzt für dieses Ziel die älteren
Einträge als maßgeblichen Reviewstand.

| SkillPilot-ID | Entscheidung | Begründung |
|---|---|---|
| `1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075` | `accepted_pilot_after_fresh_ai_review` | Frische Originalprüfung gegen die kausal präzisierte Beschreibung: Beide Bildfelder zeigen dieselbe Oberfläche unter verschiedener Beleuchtung und führen die von der Oberfläche kommenden Lichtanteile zum empfangenden Auge. Damit trägt das Asset die vollständige Kette „Beleuchtung und Oberfläche bestimmen das ins Auge gelangende Licht und damit den Farbeindruck“, ohne Materialwechsel, vom Auge ausgesandte Strahlen oder fachfremde Biologiedetails. Reviewed asset hash: `sha256:520fdeed70bf83ddbf5c429d8478fb8da15b704a705a366e43795d8e8bf96e4f`. |
