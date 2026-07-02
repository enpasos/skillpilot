# Lernzielvisualisierung: Modulare Arithmetik nutzen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `d8cbf2bd-2512-5661-b431-4aea7e688912`
- Titel: Modulare Arithmetik nutzen (LK)
- Beschreibung: Die lernende Person kann Potenzen modulo $n$ effizient berechnen und die Rechenschritte fachsprachlich erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `d8cbf2bd-2512-5661-b431-4aea7e688912.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/d8cbf2bd-2512-5661-b431-4aea7e688912/d8cbf2bd-2512-5661-b431-4aea7e688912.jpg`

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

Titel: Modulare Arithmetik nutzen (LK)
Beschreibung: Die lernende Person kann Potenzen modulo $n$ effizient berechnen und die Rechenschritte fachsprachlich erläutern.

Zusatzanweisung:
Pflichtinhalt:

Show efficient modular exponentiation for `7^5 mod 13`.
Use a table with rows:
`7^1 mod 13 = 7`
`7^2 = 49 ≡ 10 mod 13`
`7^4 ≡ 10^2 = 100 ≡ 9 mod 13`
`7^5 = 7^4 * 7 ≡ 9 * 7 = 63 ≡ 11 mod 13`
Final result: `7^5 ≡ 11 mod 13`.
Use German labels such as `Quadrate nutzen` and `Rest bestimmen`.

Vermeiden:

Do not compute `7^5 = 16807` as the main method.
Do not write the wrong final residue `10` or `12`.
Use no arrows; use a clean step table.
Do not introduce Fermat, Euler, or negative residues.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
