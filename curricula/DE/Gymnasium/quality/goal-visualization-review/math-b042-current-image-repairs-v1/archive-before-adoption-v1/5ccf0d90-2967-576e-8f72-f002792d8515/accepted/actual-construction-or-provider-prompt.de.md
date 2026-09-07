# Lernzielvisualisierung: Integrationstechniken gezielt kombinieren

## SkillPilot-Ziel

- SkillPilot-ID: `5ccf0d90-2967-576e-8f72-f002792d8515`
- Titel: Integrationstechniken gezielt kombinieren
- Beschreibung: Die lernende Person kann bei gegebenen Integralen geeignete Techniken auswählen, ggf. mehrere Methoden kombinieren und den Lösungsweg begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `5ccf0d90-2967-576e-8f72-f002792d8515.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5ccf0d90-2967-576e-8f72-f002792d8515/5ccf0d90-2967-576e-8f72-f002792d8515.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Integrationstechniken gezielt kombinieren
Beschreibung: Die lernende Person kann bei gegebenen Integralen geeignete Techniken auswählen, ggf. mehrere Methoden kombinieren und den Lösungsweg begründen.

Zusatzanweisung:
# Einzelne falsche Lehrbehauptung im Referenzbild korrigieren

Bearbeite das beigefügte Referenzbild möglichst lokal. Behalte vollständig
den weißen Hintergrund, das 16:9-Layout, die Farben, Figur, Tabellen,
Pfeile und alle korrekten Formeln. Erzeuge keine neue Gesamtillustration.

Nur die obere linke Sprechblase ist fachlich falsch:
„Faktor 2x ist du.“ darf dort nicht stehen, denn du=2x dx.
Ersetze ihren Text exakt durch:

„Struktur erkennen:
Innere Funktion x²,
ihre Ableitung 2x.
→ Substitution“

Alle anderen Inhalte bleiben erhalten und korrekt:
I=∫₀¹ 2x·(1+x²)·e^(x²) dx.
u=x², du=2x dx; x=0→u=0, x=1→u=1.
I=∫₀¹(1+u)e^u du.
G(u)=u e^u und G′(u)=e^u+u e^u=(1+u)e^u.
I=[u e^u]₀¹=e.
Weder Integralgrenzen noch Exponenten, Variablen oder Vorzeichen verändern.
Die Sprechblase muss gut lesbar bleiben und darf keine neue Behauptung
über einen Differentialfaktor ohne dx enthalten.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
