# ln/e-Umkehrfunktion: Kursgeltung vor D-Abschluss

Stand 27.09.2026. Die beiden unabhängigen aktuellen D-Runden zur neuen
PNG-Seite entscheiden den Fachtext und das Bild jeweils mit `keep`. Das ist
noch **keine** umfassende Freigabe der angezeigten GK/LK-Geltung.

Das kanonische Ziel `06ce2b1b-e888-5322-9ed9-dfc6d322956a` heißt
derzeit DE/EN `(LK)` beziehungsweise `(advanced course)`, wird im aktuellen
GoalBook aber in 14 GK-Kontexten angezeigt. Der direkte HE-Quellanker trägt
LK. Andererseits führt die registrierte SH-Source-Extraction den Anteil
„ln-Funktion als Umkehrfunktion der e-Funktion“ ausdrücklich als
`courseLevel: GK_LK` und mappt ihn `partial` auf dieses Ziel:

- `curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_MATHEMATIK_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json`,
  Quellziel K025;
- `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_math_upper_secondary_source_extraction_to_canonical_math.review.json`;
- `curricula/DE/Gymnasium/composition-views/mathematik/de-sh-sekii-gk.view.json`.

Damit wäre ein globaler Filter „`(LK)` bedeutet nie GK“ falsch. Insbesondere
darf der vorbereitete Ausschluss von `DE-SH|SekII||GK` aus
`m7-gklk-projection-preparation-20260927-v1/course-projection-delta.json`
nicht aktiviert werden. Für die übrigen GK-Projektionen liegt in diesem Audit
noch kein zielgenau bestätigter GK-Quellweg vor; das ist eine Prüfqueue, keine
Behauptung, dass deren amtliche Curricula die Kompetenz ausschließen.

Sichere Richtung: DE/EN-Blatttitel kursneutral formulieren, die HE-LK- und
SH-GK/LK-Routen getrennt erhalten und jede weitere GK-Platzierung am eigenen
Quellbeleg prüfen. Der SH-GK-Pfad braucht auch in seinen sichtbaren Eltern
eine kursneutrale Bezeichnung. Ein bloßer Titelwechsel invalidiert jedoch
aktuelle Ziel-/Seitenbindungen: D muss an der neuen Seite unabhängig geprüft
werden; P, semantische Atomarität, Memory und Semantic-Kind sind
fingerprintgenau nachzubinden; das PNG selbst bleibt bei SHA-256
`88c744b741a89636cfad6c1e3f95f8c7e6f00a5f94642bbf379f686b06481a02`
unverändert und benötigt keine fingierte neue Bildprüfung.

Bis diese Kursgeltung und Bindungen geklärt sind, bleibt der aktuelle
Einziel-D-Doppelreview als fachlicher Beleg erhalten, aber **nicht** als
vollständiger D-Abschluss registriert. Dies ist ausschließlich maschinelle
Curriculum-QS, keine menschliche Freigabe.
