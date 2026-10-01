# Bildgenerierung

Werkzeug: integriertes `image_gen` (kein CLI/API-Fallback). Neu generierter Bitmap-Kandidat; anschließend eine gezielte Bildkorrektur. Der ausgewählte zweite Output wurde unverändert als `candidate-3891b735.png` in dieses Verzeichnis kopiert. Die beiden kleineren PNGs sind nur Prüfskalierungen.

## Ausgangsprompt

> Use case: scientific-educational. Asset type: SkillPilot learning-goal illustration candidate for German Gymnasium biology Q1. Landscape 16:9, friendly clear comic illustration, bold simple shapes that remain legible at 360 px width, clean light background, no text, letters, numbers, logos or watermarks. Explain one somatic gene therapy principle: adding a functional gene copy to suitable blood-forming body cells can help them make a missing protein, while some target cells may remain unreached. Make a simple left-to-right three-part scene with large cells and broad arrows: left, three blood-forming cells with an existing DNA strand in each nucleus and no visible protein output; center, one clearly distinct orange functional DNA segment is added to only one target cell without deleting or cutting its existing DNA; right, that reached cell visibly produces a few matching green protein molecules, while the two unreached cells remain unchanged. Show intention and partial reach, not a cured person or guaranteed clinical result. No scissors, no virus, no syringe, no detailed delivery method, no mixing DNA and protein, no molecule-level claims beyond this simplified principle. Use a warm friendly comic palette and enough space between panels for visual clarity.

## Gezielter Korrekturprompt

> Use case: precise-object-edit. This is an educational biology comic. Change only the rightmost panel's protein depiction: remove the green arrows that start at the nucleus and place three clearly visible green protein shapes in the reached cell's pale purple cytoplasm outside the dark purple nucleus. The proteins must appear in cytoplasm, not within the nucleus or as direct products of DNA. Keep the cell count, partial reach, the separate orange added gene copy, broad blue panel arrows, warm palette, 16:9 composition, bold simple comic style, and all other parts of the image unchanged. Do not add any text, letters, tiny labels, virus, scissors, syringe, or cured patient.

Die Korrektur wurde nötig, weil der erste Entwurf Proteinpfeile unmittelbar am Zellkern beginnen ließ. Der gespeicherte Kandidat zeigt die Proteinformen im Zellplasma.
