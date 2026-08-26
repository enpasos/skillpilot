# Lernzielvisualisierung: Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `25593605-5e13-55cc-9a05-8f3d737e15e9`
- Titel: Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen
- Beschreibung: Die lernende Person kann in einem passend skalierten kartesischen Koordinatensystem Punktlagen aus Koordinaten darstellen und daraus vorgegebene Strecken oder Geraden erzeugen, wobei sie die begrenzte beziehungsweise unbegrenzte Ausdehnung begründet.

## Generator

- Provider: Deterministisch aus geprüfter SVG-Geometrie gerendert
- Modus: exakte Vektorkonstruktion mit quadratischem Koordinatengitter
- Erzeugt am: 2026-08-26
- Status: geometrisch konstruiert und hashgebunden KI-geprüft
- Quellbild: `25593605-5e13-55cc-9a05-8f3d737e15e9.png`
- Aktiviertes Public Asset: `/assets/goal-visualizations/mathematik/25593605-5e13-55cc-9a05-8f3d737e15e9/25593605-5e13-55cc-9a05-8f3d737e15e9.png`
- Recoverable Generatorversion: `tmp/goal-visualization-legacy-backups-20260826-math-batch001/curricula/DE/Gymnasium/visualizations/mathematik/25593605-5e13-55cc-9a05-8f3d737e15e9/25593605-5e13-55cc-9a05-8f3d737e15e9.batch-001.png`
- SVG-Quelle: `point-segment-line-v1.svg`
- SVG SHA-256: `7df8a0a2cf72b66098499f2fdf56db8768e2ab087f90832df62c9080a75dbbf5`
- Renderer: librsvg rsvg-convert 2.52.5
- Befehl: `rsvg-convert --width 1536 --height 1024 --format png --output 25593605-5e13-55cc-9a05-8f3d737e15e9.png point-segment-line-v1.svg`
- PNG SHA-256: `daaa45f9c17a02126390863e3a459e98a4e29f7de7fcb03ef1bb8317f501045c`

## Geometrische Bindung

- Das zentrale Gitter verwendet in x- und y-Richtung dieselbe Einheitsskala.
- `P(−3|2)` liegt bei SVG `(540|330)`, `Q(4|−1)` bei `(1030|540)`; die Bildkoordinatendifferenz `(490|210)` entspricht wegen der nach unten gerichteten SVG-y-Achse exakt dem mathematischen Richtungsvektor `(7|−3)`.
- Die linke Strecke besitzt genau die beiden markierten Endpunkte P und Q.
- Die rechte Gerade `g` ist genau ein gerades SVG-`line`-Element. Beide Pfeilspitzen sowie die markierten Punkte P und Q sind kollinear; es gibt am Punkt P keinen Knick und keinen abweichenden Pfeilabschnitt.

## KI-Review-Notiz

Der vom Product Owner gemeldete Knick der alten generativen Gerade am Punkt P wurde durch eine deterministische Neukonstruktion beseitigt. Das neue Rasterbild wurde in Originalauflösung geprüft: Beide Punktkoordinaten stimmen mit der quadratischen Skalierung überein; Strecke und Gerade besitzen denselben aus P und Q folgenden Richtungsverlauf; die Gerade setzt sich an P und Q ohne Richtungsänderung bis zu beiden Pfeilspitzen fort. Die KI-Freigabe wird im QA-Ledger an `sha256:daaa45f9c17a02126390863e3a459e98a4e29f7de7fcb03ef1bb8317f501045c` gebunden. Die Fehlermeldung des Product Owners wird dokumentiert; eine menschliche Freigabe der Ersatzfassung wird nicht behauptet.
