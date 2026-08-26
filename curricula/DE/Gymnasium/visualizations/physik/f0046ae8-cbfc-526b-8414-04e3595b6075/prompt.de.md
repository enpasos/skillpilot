# Lernzielvisualisierung: Sonnen- und Mondfinsternisse mit Schattenräumen erklären

## SkillPilot-Ziel

- SkillPilot-ID: `f0046ae8-cbfc-526b-8414-04e3595b6075`
- Titel: Sonnen- und Mondfinsternisse mit Schattenräumen erklären
- Beschreibung: Die lernende Person kann für Sonnen- und Mondfinsternisse die jeweilige Anordnung von Sonne, Erde und Mond darstellen, Kern- und Halbschatten zuordnen und daraus erklären, welches Himmelsobjekt für Beobachtende ganz oder teilweise verdunkelt erscheint.

## Generator

- Provider: Deterministisch aus geprüfter SVG-Geometrie gerendert
- Status: geometrisch konstruiert und hashgebunden KI-geprüft
- Quellbild: `f0046ae8-cbfc-526b-8414-04e3595b6075.png`
- Public Asset: `/assets/goal-visualizations/physik/f0046ae8-cbfc-526b-8414-04e3595b6075/f0046ae8-cbfc-526b-8414-04e3595b6075.png`

## Deterministische Quelle und Renderbindung

- SVG-Quelle: `eclipse-common-tangents-v1.svg`
- SVG SHA-256: `8eae5938e3fda4502acaaa53c2c2787c7e7eec7e7c8023e1707d6860850d6b46`
- Renderer: librsvg rsvg-convert 2.52.5
- Befehl: `rsvg-convert --width 1792 --height 1024 --format png --output f0046ae8-cbfc-526b-8414-04e3595b6075.png eclipse-common-tangents-v1.svg`
- PNG SHA-256: `c31d5ad3e4917a20fc4eb95bdf3a272d331a9d886ade58ce53e9406984b92c4c`

Die vier gelben Randstrahlen jedes Teilbilds sind SVG-`line`-Elemente und damit exakt gerade. Im oberen Teilbild sind sie als die vier gemeinsamen Tangenten der Kreise für Sonne und Mond konstruiert. Im unteren Teilbild sind sie als die vier gemeinsamen Tangenten der Kreise für Sonne und Erde konstruiert; der Mond ist dort ausschließlich Beobachtungsobjekt im Erdschatten und kein Tangentialkörper.

## Review-Notiz

Die Tangentialität wurde für alle acht Geraden rechnerisch über den senkrechten Abstand der jeweiligen Kreismittelpunkte zur Geraden geprüft. Die maximale Abweichung von den vorgegebenen Radien beträgt nach Rundung der SVG-Koordinaten weniger als `0,0005 px`. Das Rasterbild wurde außerdem in Originalauflösung auf gerade Linien, korrekte Körperzuordnung und Lesbarkeit geprüft. Die KI-Freigabe wird im QA-Ledger an `sha256:c31d5ad3e4917a20fc4eb95bdf3a272d331a9d886ade58ce53e9406984b92c4c` gebunden; eine menschliche Freigabe wird nicht behauptet.
