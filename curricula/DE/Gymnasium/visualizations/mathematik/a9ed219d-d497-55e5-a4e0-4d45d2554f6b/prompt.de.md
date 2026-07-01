# Lernzielvisualisierung: Einfache Integrale berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `a9ed219d-d497-55e5-a4e0-4d45d2554f6b`
- Titel: Einfache Integrale berechnen
- Beschreibung: Die lernende Person kann Stammfunktionen von Potenzfunktionen $f(x)=x^n$ für $n\in\mathbb{Z}\setminus\{-1\}$ bestimmen, Faktor- und Summenregel beim Integrieren anwenden und ganzrationale Funktionen sowie $e^x$, $\sin(x)$ und $\cos(x)$ integrieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `a9ed219d-d497-55e5-a4e0-4d45d2554f6b.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/a9ed219d-d497-55e5-a4e0-4d45d2554f6b/a9ed219d-d497-55e5-a4e0-4d45d2554f6b.jpg`

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

Titel: Einfache Integrale berechnen
Beschreibung: Die lernende Person kann Stammfunktionen von Potenzfunktionen $f(x)=x^n$ für $n\in\mathbb{Z}\setminus\{-1\}$ bestimmen, Faktor- und Summenregel beim Integrieren anwenden und ganzrationale Funktionen sowie $e^x$, $\sin(x)$ und $\cos(x)$ integrieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Einfache Integrale berechnen.
- Zeige eine klare Integrations-Tabelle mit genau diesen Paaren:
  f(x)=x^3 -> F(x)=1/4*x^4.
  f(x)=3x^2+2x -> F(x)=x^3+x^2.
  f(x)=e^x -> F(x)=e^x.
  f(x)=cos(x) -> F(x)=sin(x).
  f(x)=sin(x) -> F(x)=-cos(x).
- Zeige darunter ein bestimmtes Integral:
  integral_0^2 (3x^2+2x) dx = [x^3+x^2]_0^2 = 12.
- Ergebnisbox: Potenzregel, Faktorregel und Summenregel rueckwaerts anwenden; dann F(b)-F(a).

Vermeiden:
- Keine falschen Vorzeichen bei sin(x) und cos(x).
- Nicht integral sin(x) dx = cos(x) schreiben; richtig ist -cos(x).
- Kein falscher Wert fuer [x^3+x^2]_0^2; richtig ist 12.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
