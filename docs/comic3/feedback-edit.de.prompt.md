# Gezielte Comic-Anpassung: Direktfeedback (DE)

Provider: Google Gemini / Nano Banana Pro (`gemini-3-pro-image`)
Eingabe: `docs/comic3/champion.de.png` aus dem Git-Stand vor dieser Änderung.
Ziel: Nur Panel 3 an den vorhandenen Lernziel-Feedbackweg anpassen.

## Provider-Prompt

Use case: precise-object-edit / illustration-story.
Image 1 is the edit target, an existing German four-panel SkillPilot comic.
Keep the same four-panel layout, friendly hand-drawn cartoon style, warm colors,
crisp outlines, lettering, robot, and young champion character. Keep the entire
top row (panels 1 and 2) and the bottom-right panel (panel 4) unchanged, including
every word, object and character. Do not redesign or simplify the comic.

Change ONLY the bottom-left panel (panel 3). Keep the champion and robot, but
replace the GitHub workshop, issue display and pull-request prop with a tablet
showing a learning-goal page. The champion notices an unclear passage and taps
the visible button "Feedback zu diesem Lernziel"; the robot receives the feedback
as a speech-bubble symbol. The tablet is a simple illustrative interface, not a
precise screenshot. Do not show personal data, code, tickets or numeric scores.

Replace this panel's yellow heading with exactly:
"Verbessern (Direktes Feedback)"

Replace this panel's speech-bubble text with exactly:
"Etwas unklar oder fehlerhaft? Gib Feedback direkt am Lernziel. Größere Ideen besprechen wir auf GitHub. Gemeinsam verbessern wir das Curriculum."

Render German umlauts and ß correctly. Use the existing readable comic lettering.
Fit all words comfortably inside the speech bubble, without overlap or clipping.
Remove all old "ISSUE", "PULL REQUEST" and "GITHUB / WERKSTATT" labels in panel 3.
The word GitHub should occur in panel 3 only in the new speech bubble. Preserve
the original framing and all four complete panels. No new panels or extra text.
