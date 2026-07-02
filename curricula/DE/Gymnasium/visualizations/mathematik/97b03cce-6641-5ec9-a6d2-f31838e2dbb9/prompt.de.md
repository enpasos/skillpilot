# Lernzielvisualisierung: RSA-Verfahren mathematisch erläutern und anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `97b03cce-6641-5ec9-a6d2-f31838e2dbb9`
- Titel: RSA-Verfahren mathematisch erläutern und anwenden (LK)
- Beschreibung: Die lernende Person kann das Prinzip des RSA-Verfahrens als asymmetrisches Verschlüsselungsverfahren erläutern, Nachrichten damit verschlüsseln und die Korrektheit der Entschlüsselung plausibel begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `97b03cce-6641-5ec9-a6d2-f31838e2dbb9.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/97b03cce-6641-5ec9-a6d2-f31838e2dbb9/97b03cce-6641-5ec9-a6d2-f31838e2dbb9.jpg`

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

Titel: RSA-Verfahren mathematisch erläutern und anwenden (LK)
Beschreibung: Die lernende Person kann das Prinzip des RSA-Verfahrens als asymmetrisches Verschlüsselungsverfahren erläutern, Nachrichten damit verschlüsseln und die Korrektheit der Entschlüsselung plausibel begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: RSA-Verfahren mathematisch erlaeutern und anwenden.
- Verwende genau dieses kleine, voll pruefbare Zahlenbeispiel:
  p = 5, q = 11.
  n = p*q = 55.
  phi(n) = (p-1)*(q-1) = 4*10 = 40.
  e = 3.
  d = 27, denn 3*27 = 81 und 81 congruent 1 mod 40.
- Schreibe die Kongruenz unbedingt als Kongruenz, nicht als Gleichheit:
  3*27 = 81.
  81 ≡ 1 (mod 40).
- Zeige die Schluessel:
  oeffentlicher Schluessel: (n=55, e=3).
  privater Schluessel: d=27.
- Verschluesselung einer kleinen Nachricht:
  m = 7.
  c = m^e mod n = 7^3 mod 55 = 343 mod 55 = 13.
- Entschluesselung:
  m = c^d mod n = 13^27 mod 55 = 7.
- Zeige als Ablauf:
  Nachricht 7 -> Verschluesseln mit e=3 -> Geheimtext 13 -> Entschluesseln mit d=27 -> Nachricht 7.
- Erklaere knapp die Idee:
  e und d sind inverse Exponenten modulo phi(n).
  Nur mit d wird der Geheimtext wieder zur Nachricht.

Vermeiden:
- Nicht p und q vertauschen oder n falsch berechnen.
- Nicht phi(n)=55 oder phi(n)=54 schreiben; korrekt ist phi(n)=40.
- Nicht d=7 oder d=13 verwenden; korrekt ist d=27.
- Nicht behaupten, c sei 7; der Geheimtext ist 13.
- Nicht "81 = 1 mod 40" schreiben; korrekt ist "81 ≡ 1 (mod 40)".
- Nicht den privaten Schluessel als oeffentlich markieren.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
