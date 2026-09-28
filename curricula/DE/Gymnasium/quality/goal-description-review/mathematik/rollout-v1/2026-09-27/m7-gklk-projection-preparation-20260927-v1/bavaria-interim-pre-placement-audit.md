# Bayern-Mathematik: quellabgeleiteter Vorher-Abgleich vor Placement-Änderungen

Stand 27. September 2026. **Nicht aktiver, nicht freigebender Diagnose-Snapshot.**
Die beschlossene technische Zwischenregel lautet: BY-`GK` enthält das
verpflichtende vierstündige Mathematikfach; BY-`LK` enthält denselben Umfang
plus alle fünf Vertiefungskursmodule. Das ist keine amtliche GK/LK-Bezeichnung.
Der spätere dauerhafte Drei-von-fünf-Zielumfang bleibt [Issue #59](https://github.com/enpasos/skillpilot/issues/59).

[`auditMathBavariaInterimCourseProjection.ts`](../../../../../../../../../app/scripts/auditMathBavariaInterimCourseProjection.ts)
leitet die IDs aus der BY-Source-Extraction und ihrem Mapping ab, schneidet
sie mit den **797** `curricularAtomic`-Atlasseiten und vergleicht deren
BY-Sek-II-Sichten im aktiven und im nicht aktiven vorgeschlagenen Atlas.
Der damalige Bindungsdigest war
`sha256:acb1323faee736172c11e8f194f7a9dded90ce541069b470db4aeaa80faf4e66`.
Die inzwischen ergänzten zehn BY-GK-Placements sind im
[Folgeabgleich](bavaria-interim-ten-exact-placement.md) dokumentiert; das
Skript prüft **den aktuellen**, nicht mehr diesen Vorher-Stand. Aufruf von
der Repository-Wurzel:

```bash
app/node_modules/.bin/tsx app/scripts/auditMathBavariaInterimCourseProjection.ts
```

| Quellengruppe | Source-Ziele | Mapping-Zeilen | kanonische IDs | M7-Atlasseiten | exakt / nur partiell | aktuell BY GK+LK / nur LK / abwesend | vorgeschlagen BY GK+LK / nur LK / abwesend |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pflichtfach `JGST12_EA`, `JGST13_EA_TEIL1/2` | 64 | 75 | 57 | 44 | 14 / 30 | 9 / 31 / 4 | 8 / 32 / 4 |
| Nur `JGST12_VERTIEFUNG` | 41 | 66 | 48 | 35 | 25 / 10 | 11 / 24 / 0 | 0 / 35 / 0 |

Von den **14 exakt** auf ein Pflichtfach-Source-Ziel gemappten Atlasseiten
fehlen im vorgeschlagenen BY-GK-Profil **12**; von den **30 nur partiell**
zugeordneten Pflichtfachseiten fehlen **4** sogar in BY-LK. `partial` ist
kein Nachweis, dass das gesamte kanonische Ziel verpflichtender Stoff ist;
diese Fälle brauchen eine fachliche Scope-Entscheidung. Die beiden zusätzlich
kanonisch als `type: atomic` markierten Quellenziele `0f18f4e2…` und
`2f8a3a90…` sind im maßgeblichen Ledger `practiceAssessment`, nicht
`curricularAtomic`, und zählen daher nicht zu den 44 Atlasseiten.

Der vorgeschlagene globale Kursmarker beseitigt zwar die elf bisherigen
BY-GK-Fehlgeltungen der 35 Vertiefungskursseiten, **liefert aber keinen
korrekten BY-Pflichtfachumfang**. Er wird durch diesen Audit nicht aktiviert.
Weder diese Zählung noch ein grüner Digest ist eine Quellenfreigabe für
partielle Mappings, ein D-Nachweis oder ein M7-Abschluss.
