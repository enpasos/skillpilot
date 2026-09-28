# Drei V-only-Ziele: Bildkorrektur-Prompts und Nachweise

Stand: 26.09.2026. Die ursprünglichen drei Dateien waren
**Erzeugungs-/Editierprompts** für V-offene Mathematikziele. Inzwischen sind
die Kettenlinien- und Modellierungsbilder nach getrennter Original- und
360-Pixel-QS als `accepted_pilot` importiert und an exakte V-QA-Hashes
gebunden; das Spatprodukt ist weiterhin offen. Die historischen Altbild-HOLDs
und die menschlichen Prüfstände bleiben unverändert. Die in den einzelnen
Dateien abgesetzten Provider-Prompts enthalten absichtlich keine technischen Ziel-IDs.
Als Zielbild gilt ein freundliches, abstraktes, klares, comicartiges **Rasterbild**
im bestehenden Lernzielbild-Stil, keine SVG- oder sterile Diagramm-Ausweichlösung.

| Ziel | Prompt | Exakt geprüfter Altbildbeleg und dokumentierter HOLD |
| --- | --- | --- |
| `164921f6-3bf7-5efc-a438-ea4759dca9ef` | [Kettenlinie](164921f6.prompt.de.md) | [`prompt_8`-Archiv](../math-astra-user-image-sight-20260924-v1/assets/164921f6-3bf7-5efc-a438-ea4759dca9ef/164921f6-3bf7-5efc-a438-ea4759dca9ef.png), SHA-256 `3a6889e602122105fd46f27a0e91a672e8d2106136a9fe5dac9d5db13f6b5538`; [Pixelbefund](../mathematik-z-astra-image-sight-20260924-v1.md): zweimal „Katenoide“ statt „Kettenlinie“. |
| `1b70498a-62a0-5a84-99dd-476b8af68da6` | [Modellieren](1b70498a.prompt.de.md) | [archiviertes JPG](../math-m7-quality-holds-20260923-v1/assets/1b70498a-62a0-5a84-99dd-476b8af68da6/1b70498a-62a0-5a84-99dd-476b8af68da6.jpg), SHA-256 `1a67ba07d39e9730f2e100bd87d1761ef1d44daf70796529603238c779667b33`; [Pixelbefund](../mathematik-m7-quality-holds-2026-09-23.md): Fall-vom-Haus-Geschichte, Startwertpfeil und gezeichnete Wurfparabel passen nicht zusammen. |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | [Spatprodukt](944dd479.prompt.de.md) | [archiviertes JPG](../math-m7-quality-holds-20260923-v1/assets/944dd479-9f30-5acb-ab32-3ea0b6dc8e06/944dd479-9f30-5acb-ab32-3ea0b6dc8e06.jpg), SHA-256 `327da301d87ab0d9865256e8357515f9ff840cde1a2839dda58c134249e0c3c6`; [Pixelbefund](../mathematik-m7-quality-holds-2026-09-23.md): Vektorrichtungen widersprechen den Achsen. |

Die Bildaussagen und Prüfkriterien sind an den aktuellen kanonischen Zieltext
gebunden, nicht an den Altbildstatus. Ein erzeugter Kandidat braucht danach
eine unabhängige Prüfung der **Originalpixel und einer 360-px-Ansicht**:
Geometrie, Gleichungen, deutsche Texte, Lesbarkeit, Alt-Text, Stil, Provenienz
und Rechte. Erst ein danach hashgebunden freigegebenes Bild darf V ändern;
betroffene P-/GoalBook-Kontexte müssen nach einem Import neu geprüft werden;
ein unveränderter text- und quellengebundener D-Nachweis kann aktuell bleiben.
`humanApproved` wird durch keinen dieser Schritte behauptet.

Details: [Kettenlinien-Versuche](164921f6-attempts.md),
[Modellierungs-Versuche](1b70498a-attempts.md) und
[Spatprodukt-Kandidatenprüfung](candidates/944dd479-review.md). Die exakten aktuellen
V-Entscheidungen stehen in `../mathematik-z-catenary-correction-20260926-v1.md`
und `../mathematik-z-modeling-correction-20260926-v1.md`.
