# Lernzielvisualisierung: Faktorisierungsverfahren erläutern (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `1c1754b7-2cd3-5635-824d-ce93f7b99514`
- Titel: Faktorisierungsverfahren erläutern (LK)
- Beschreibung: Die lernende Person kann die Funktionsweise eines Faktorisierungsverfahrens, zum Beispiel des quadratischen Siebs, fachsprachlich erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `1c1754b7-2cd3-5635-824d-ce93f7b99514.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/1c1754b7-2cd3-5635-824d-ce93f7b99514/1c1754b7-2cd3-5635-824d-ce93f7b99514.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Faktorisierungsverfahren erläutern (LK)
Beschreibung: Die lernende Person kann die Funktionsweise eines Faktorisierungsverfahrens, zum Beispiel des quadratischen Siebs, fachsprachlich erläutern.

Zusatzanweisung:
Pflichtinhalt:

Show a concise explanation of a factorization procedure using a congruence of squares.
Use exactly this example:
- `N = 91`
- choose `x = 10`
- `x^2 - N = 100 - 91 = 9 = 3^2`
- therefore `10^2 ≡ 3^2 (mod 91)`
- `ggT(10 - 3, 91) = ggT(7, 91) = 7`
- `ggT(10 + 3, 91) = ggT(13, 91) = 13`
- final result: `91 = 7 * 13`

Use a clean step table or numbered list. A small note may say: `Idee wie beim quadratischen Sieb: Quadrate modulo N finden`.

Vermeiden:

Do not claim this is a full implementation of the quadratic sieve; present it as the core idea of finding a congruence of squares.
Do not use wrong factors of `91`.
Do not write `91 = 7 + 13`.
Do not use decorative arrows or process arrows; a numbered list is safer.
Do not add unrelated cryptography context.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
