# M7-Bild für `31be24f0`: KI-V geprüft, D/P noch offen

Das kanonische Ziel `31be24f0` wird als Kandidat auf das selbständige
Bestimmen und die Ableitungsprüfung einer Stammfunktion einer
ganzrationalen Funktion verengt. Das bisherige JPG zeigt zusätzlich die
Berechnung eines bestimmten Integrals und bleibt deshalb nicht ohne neue
fachliche Bildprüfung passend. Es wurde **nicht** überschrieben.

Neuer, zunächst separat geprüfter Kandidat:
[`31be24f0-candidate-v2.png`](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/math-31be-antiderivative-v2-20260927/candidate/31be24f0-candidate-v2.png)
(1672 × 941 Pixel, SHA-256
`3e1a2c03a680c44de63a43d149598085f6f0185ee77bc1ea465c230946576ec1`).
Erzeugung: eingebaute Bildgenerierung, bestehendes SkillPilot-JPG nur als
Stilreferenz. Die mathematische Folge im neuen Bild ist
`f(x) = 3x² + 2x` → `F(x) = x³ + x²` →
`F′(x) = 3x² + 2x = f(x)`; sie ist rechnerisch korrekt. Das Bild zeigt
kein bestimmtes Integral und keine Rekonstruktion. Eine zweite,
unabhängige Sichtprüfung bewertet Formeln, Zielpassung, Stil und
Lesbarkeit ebenfalls mit **KEEP**. Die importierte Datei wurde zusätzlich
als echte 360-px-Browserdarstellung geprüft: Titel und alle drei Formeln
bleiben klein, aber scharf und lesbar.

Nach der unabhängigen Erstprüfung wurde das identische PNG per
`visualization:import` unter seinem endgültigen Zielnamen in Kanon,
öffentliche Web-Assets und Backend-Assets kopiert. Alle drei Kopien haben
denselben SHA-256-Digest wie der Kandidat. Der Canonical-`resourceLink`
verwendet die neue PNG-URL, `CC-BY-4.0` und die tatsächliche Angabe zur
eingebauten Bildgenerierung; die drei identischen alten JPG-Kopien sind
unverändert unter
[`previous/`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/goal-visualization-review/math-31be-antiderivative-v2-20260927/previous/)
archiviert, statt als verwaiste Laufzeitbilder liegen zu bleiben. Der
QA-Ledger bindet nun genau diesen PNG-Digest mit
`aiApproved=yes`, `humanApproved=no`; Generator-Check und
Approval-Coverage-Check bestehen. Damit ist das **maschinelle V-Gate für
dieses Bild** erfüllt, nicht eine menschliche Freigabe oder
Lernwirksamkeitsprüfung. Der geänderte Zieltext braucht weiterhin neue
strenge D- und P-Nachweise. A/M wurden fachlich neu geprüft; der
Fünf-Gate-Abschluss dieses Ziels wird ausdrücklich noch nicht behauptet.

Verwendeter Prompt (deutsche Formeln und Titel sind verbindlich):

> Use case: scientific-educational. Asset type: SkillPilot
> Oberstufen-Mathematik Lernzielbild, landscape 16:9 PNG candidate. Input
> image: the attached existing SkillPilot image is a style reference only,
> not an edit target; retain its friendly clean comic-infographic spirit,
> soft blue/yellow colors and strong legibility, but make a new focused
> illustration. Primary request: show exactly ONE competency: independently
> finding an antiderivative of a polynomial and checking it by
> differentiating. Two-step left-to-right visual flow. On the left a
> learner's notebook has the exact formula 'f(x) = 3x² + 2x'. In the center
> show the exact resulting formula 'F(x) = x³ + x²'. On the right show the
> exact check 'F′(x) = 3x² + 2x = f(x)' with a small green check mark. Include
> subtle pencil and graph-paper texture and warm friendly colors; clean
> large typography. Text: title exactly 'Stammfunktion bestimmen und
> prüfen'; no other prose. Mathematical constraints: all formulas must be
> exactly correct and typeset with true superscripts; do NOT show any
> definite integral, interval limits, F(b)−F(a), reconstruction, or
> calculator. No additional equations, watermarks or logos. The composition
> should be wide, not square; not photorealistic or sterile technical.
