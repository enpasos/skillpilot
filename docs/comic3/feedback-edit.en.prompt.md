# Targeted comic edit: direct feedback (EN)

Provider: Google Gemini / Nano Banana Pro (`gemini-3-pro-image`)
Input: `docs/comic3/champion.en.png` from the Git revision before this edit.
Goal: Adapt only panel 3 to the existing learning-goal feedback flow.

## Provider prompt

Use case: precise-object-edit / illustration-story.
Image 1 is the edit target, an existing English four-panel SkillPilot comic.
Keep the same four-panel layout, friendly hand-drawn cartoon style, warm colors,
crisp outlines, lettering, robot, and young champion character. Keep the entire
top row (panels 1 and 2) and the bottom-right panel (panel 4) unchanged, including
every word, object and character. Do not redesign or simplify the comic.

Change ONLY the bottom-left panel (panel 3). Keep the champion and robot, but
replace the GitHub workshop, issue display and pull-request prop with a tablet
showing a learning-goal page. The champion notices an unclear passage and taps
the visible button "Feedback on this learning goal"; the robot receives the
feedback as a speech-bubble symbol. The tablet is a simple illustrative interface,
not a precise screenshot. Do not show personal data, code, tickets or numeric scores.

Replace this panel's yellow heading with exactly:
"Improve (Direct Feedback)"

Replace this panel's speech-bubble text with exactly:
"Found something unclear or incorrect? Give feedback directly on the learning goal. We discuss bigger ideas on GitHub. Together we improve the curriculum."

Use the existing readable comic lettering. Fit all words comfortably inside the
speech bubble, without overlap or clipping. Remove all old "ISSUE", "PULL REQUEST"
and "GITHUB / WORKSHOP" labels in panel 3. The word GitHub should occur in panel 3
only in the new speech bubble. Preserve the original framing and all four complete
panels. No new panels or extra text.
