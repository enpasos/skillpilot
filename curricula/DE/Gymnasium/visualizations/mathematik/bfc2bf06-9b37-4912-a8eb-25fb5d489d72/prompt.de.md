# Lernzielvisualisierung: Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `bfc2bf06-9b37-4912-a8eb-25fb5d489d72`
- Titel: Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)
- Beschreibung: Die lernende Person kann Flächeninhalte mithilfe uneigentlicher Integrale bestimmen, indem sie passende uneigentliche Integrale aufstellt und berechnet.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `bfc2bf06-9b37-4912-a8eb-25fb5d489d72.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/bfc2bf06-9b37-4912-a8eb-25fb5d489d72/bfc2bf06-9b37-4912-a8eb-25fb5d489d72.jpg`

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

Titel: Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)
Beschreibung: Die lernende Person kann Flächeninhalte mithilfe uneigentlicher Integrale bestimmen, indem sie passende uneigentliche Integrale aufstellt und berechnet.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Flaecheninhalte mithilfe uneigentlicher Integrale ermitteln.
- Verwende die Funktion f(x)=1/x^2 fuer x >= 1.
- Zeige die Flaeche unter der Kurve von x=1 bis unendlich.
- Rechne mit Grenzwert:
  A = integral_1^infty 1/x^2 dx
    = lim_{b -> infinity} integral_1^b 1/x^2 dx
    = lim_{b -> infinity} [-1/x]_1^b
    = lim_{b -> infinity} (-1/b + 1)
    = 1.
- Ergebnisbox: Trotz unendlichem Intervall ist die Flaeche endlich, weil der Grenzwert existiert.

Vermeiden:
- Nicht mit integral_1^infty 1/x verwechseln; dieses divergiert.
- Nicht direkt ein Unendlichkeitszeichen in die Stammfunktion einsetzen, ohne Grenzwert zu schreiben.
- Nicht behaupten, die Flaeche sei unendlich; hier ist sie 1.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
