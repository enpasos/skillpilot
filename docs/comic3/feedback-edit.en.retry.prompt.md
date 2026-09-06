# Champion comic: English text correction

Provider: Google Gemini / Nano Banana Pro (`gemini-3-pro-image`).

Input: the first English candidate from [the feedback edit](feedback-edit.en.prompt.md).
Visual review rejected its duplicated "discuss discuss" in panel 3.
This retry changes only that speech bubble; it does not redesign the comic.

## Provider prompt

Edit the supplied four-panel comic. Make exactly one correction: in the speech bubble of the BOTTOM-LEFT panel, replace the complete text with the following exact text:

"Found something unclear or incorrect? Give feedback directly on the learning goal. We discuss bigger ideas on GitHub. Together we improve the curriculum."

The word "discuss" must occur exactly ONCE. Check the lettering before finishing. All words must be legible, with no duplicated or missing words. Preserve the bubble's shape, size, pointer, lettering style and reading order; only adjust line wrapping as needed to fit without clipping.

Preserve all drawings, people, the robot, backgrounds, panel borders, headings, the tablet and feedback button, warm colors and the loose friendly comic style. Panels 1, 2 and 4 must remain unchanged. Do not add any other text, logos, labels or decorative elements.
