# Biologie E: drei Zellbilder, gezielte Sichtprüfung

Am 30. September 2026 mit ChatGPT/Codex `image_gen` als eigene freundliche, abstrakte Comic-PNGs erzeugt. Die exakten Erzeugungs- und Korrekturanweisungen liegen je Ziel in `*.prompt.md`. Eigene SkillPilot-Inhalte stehen gemäß `LICENSING.md` unter CC-BY-4.0; die KI-Herkunft ist keine menschliche Freigabe.

| Ziel | aktiver Bild-SHA-256 | unabhängige fachlich-visuelle Entscheidung |
| --- | --- | --- |
| `7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f` | `sha256:55e77664caba7432961035c0df732e8724f05e466498702487d0146c61fa64f3` | Das erste Zellenschema wurde verworfen: DNA und Organellen hätten wie lichtmikroskopisch sichtbare Befunde wirken können. Ein zweiter Entwurf trennte Lichtmikroskopie und Modell, enthielt aber die ungenauen Bezeichnungen „Pflanze“/„Tier“. Das aktive PNG zeigt oben nur plausible Lichtmikroskopansichten und unten ausdrücklich ein nicht maßstabsgetreues Schema mit den korrigierten Beschriftungen „Pflanzenzelle“/„Tierzelle“. Unabhängige Zweitprüfung positiv. |
| `fc8c4b02-02f2-5ad6-b481-224d36121da1` | `sha256:77abed0f1902cf403eb441ec421927c0f83987bfb117d753aad27b71673b8c47` | Organellen und ihre modellhaft vereinfachte endosymbiotische Herkunft sind fachlich passend; das Bild behauptet keinen heutigen Aufnahmemechanismus in gewöhnlichen Körperzellen. Unabhängige Zweitprüfung positiv. |
| `5c2ce7b1-30ba-5e9c-99de-1ffac126ec13` | `sha256:c33dd99e9d09623254ee3d9d0f2cc2233219fc20d4ac9317c54778e46b9f19ec` | Der erste Osmose-Entwurf zeigte auf der gelöstreichen Seite zu viele Wassermoleküle und wurde verworfen. Das aktive PNG zeigt Wasserfluss von der verdünnten zur gelöstreichen Seite, passive Diffusion entlang und ATP-Transport gegen das jeweilige Teilchengefälle. Unabhängige Zweitprüfung positiv. |

Alle drei Bildbytes sind als primäre PNG-Links mit identischen Quelle-, Web- und Backend-Kopien aktiv. Die Biologie-QA bindet die exakten Hashes mit `aiApproved: yes`; `humanApproved` bleibt `no`. Der zielbezogene Freshness-Check von `generateGoalVisualizationQaLedgers.ts --check --subject=biologie` besteht. Das V-Gate allein ist kein M7-Abschluss; D/P fehlen für diese drei Ziele noch.
