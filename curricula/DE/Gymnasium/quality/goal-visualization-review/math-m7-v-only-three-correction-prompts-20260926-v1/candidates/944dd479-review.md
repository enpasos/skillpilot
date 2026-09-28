# Spatprodukt: V-only-Bildkandidat und Sichtprüfung

Ziel `944dd479-9f30-5acb-ab32-3ea0b6dc8e06`, „Spatprodukt korrekt definieren und deuten“. Der bisherige [HOLD-Beleg](../../math-m7-quality-holds-20260923-v1/assets/944dd479-9f30-5acb-ab32-3ea0b6dc8e06/944dd479-9f30-5acb-ab32-3ea0b6dc8e06.jpg) hat SHA-256 `327da301d87ab0d9865256e8357515f9ff840cde1a2839dda58c134249e0c3c6`: Die beschrifteten Vektoren widersprechen den eingezeichneten x-/y-Achsen. Er bleibt unverändert und zurückgestellt.

Alle fünf Versuche sind 1536 × 1024 px große PNGs aus dem **eingebauten OpenAI/Codex-Bildwerkzeug**. Die Werkzeugausgabe nannte keine genaue Modellvariante; sie wird nicht geraten. Die tatsächlichen Provider-Prompts stehen jeweils neben den Bildern. Die 360 × 240 px großen Dateien sind mit `ffmpeg scale=360:-1` erzeugte Sichtprüfkopien, keine neuen generierten Kandidaten.

| Versuch | SHA-256 des Original-PNG | Eingang | Sichtprüfung Original und 360 px |
| --- | --- | --- | --- |
| [1](944dd479-attempt-1.png) | `7581b39687c11d7e72a0ca433e789432e48945e73dbda1710697cb69eee74e8e` | Altbild nur für Stil/Farbe | HOLD: Vektorrichtungen berichtigt, aber Spatkanten/Vertikalverschiebungen unstimmig; kleine Zusatzerklärung bei 360 px unlesbar. |
| [2](944dd479-attempt-2.png) | `808a3ce2e30c5048a12ba794e3220bca6dd1a5d63911b150e8e7f4c0a086b499` | Versuch 1 als Edit-Ziel | HOLD: Beschriftungen besser, doch die gezeichneten Spatkanten sind weiterhin keine konsistenten Translationen der drei Pfeile. |
| [3](944dd479-attempt-3.png) | `548a7ea5a73dacbec6897448292bdb426105690fdc68759da80768ac217fad5c` | Altbild als Stilreferenz und [exakte Geometrie-Skizze](944dd479-geometry-reference.svg) als Konstruktion | HOLD: Kantenfamilien verbessert, aber dunkle Vignette macht rote/grüne Koordinaten bei 360 px unlesbar. |
| [4](944dd479-attempt-4.png) | `48688018f202b641c49db232f9eea162ea75463bb4630643af9e66126e544f26` | Versuch 3 als Edit-Ziel | HOLD: Weißer Hintergrund und lesbare Labels; roter Pfeil endet noch etwas vor/unter der zugehörigen Spatecke. |
| [5](944dd479-attempt-5.png) | `24d3703dbd25a381b3b414706490eabc4163bbd5f5e639c3f0b818e29dda3e36` | Versuch 4 als Edit-Ziel | **Als Bildkandidat angenommen**: Pfeil und x-Achse laufen nun von O über dieselbe Spatecke. Originalpixel und [360-px-Kopie](944dd479-attempt-5-360.png) visuell geprüft. |

Die Geometrie-Skizze wurde lokal selbst erstellt und als [PNG-Referenz](944dd479-geometry-reference.png) mit `rsvg-convert` gerastert (SHA-256 `edfb7bc5aa86fbc394f1fe8abc1be3fc5de7ad3e21e4040ef87334b3440fbbbc`). Sie war nur Erzeugungshilfe; das ausgewählte Bild ist das vom Bildwerkzeug generierte PNG.

## Kandidaten-QA für Versuch 5

- Jeder farbige Pfeil ist eine Gerade ab O: `a=(2,0,0)` rot entlang x schräg rechts unten, `b=(0,3,0)` grün entlang y schräg links unten, `c=(0,0,4)` blau entlang z aufwärts. Die drei Spatkantenfamilien sind in der räumlichen Projektion konsistent; die Grundkante b ist nicht geknickt. Keine 2D-Rechtwinkelmarke behauptet falsche Bildflächen-Senkrechtigkeit.
- Die abgebildeten Aussagen sind `[a,b,c]=a·(b×c)`, `b×c=(12,0,0)`, `[a,b,c]=+24` und `V=|[a,b,c]|=24`. Separat nachgerechnet: `(0,3,0)×(0,0,4)=(12,0,0)`, `(2,0,0)·(12,0,0)=24`; der Betrag liefert das nichtnegative Volumen. Vektorpfeile, Kreuz `×`, Skalarpunkt `·` und Betragsstriche sind im Bild unterscheidbar. Die positive Zahl ist an die geordnete Vektorfolge gebunden; das Bild gibt sie nicht ohne Betrag als allgemeine Volumenformel aus.
- Bei 360 px sind Titel, Koordinatenlabels und die vier Formelkarten lesbar. Die kleine erklärende Fußnote aus Versuch 1 wurde entfernt. Der freundliche, abstrakte Comicstil und die Rot/Grün/Blau-Codierung passen zum geprüften Altbild, ohne dessen falsche Achsen zu übernehmen.
- Vorgeschlagener Alt-Text für eine spätere, gesonderte Übernahme: „Drei gerade Kantenvektoren beginnen in O: a=(2,0,0) zeigt auf der x-Achse nach rechts unten, b=(0,3,0) auf der y-Achse nach links unten, c=(0,0,4) auf der z-Achse nach oben. Sie spannen einen transparenten Spat auf. b×c=(12,0,0), das geordnete Spatprodukt ist +24 und das Volumen ist sein Betrag 24.“ Der Alt-Text ist hier nur ein Vorschlag und wurde nicht in die Kanonik geschrieben.
- Provenienz/Rechte: Nur das eigene archivierte SkillPilot-Bild und die lokale Geometrie-Skizze dienten als Referenzen. Im Kandidaten sind keine erkennbaren Drittlogos, geschützten Figuren, Wasserzeichen oder technischen IDs. Die in `LICENSING.md` festgelegte CC-BY-4.0-Zuordnung für eigene Lerninhalte und ein formeller Rechte-/Freigabeschritt sind vor einer Veröffentlichung weiterhin zu beachten; diese Sichtprüfung allein ist keine rechtliche Freigabe.

Der aktuelle zentrale V-Eintrag steht weiterhin auf `visualizationState: "missing"` mit `missingReason: "deferred_quality_review"`. Der [P-Nachweis](../../../goal-evidence/m7-three-held-image-text-current-20260924-v1/README.md) ist ausdrücklich textbasiert und bindet kein Bild. Kanonisches Bild, Public-Assets, QA-Ledger, Registry, D-/P-Bindungen und Human-QS wurden hier **nicht** geändert. Für eine spätere Übernahme müssen diese Zustände am exakten Kandidatenhash separat geprüft bzw. erneuert werden.

## Nachträgliche unabhängige Gegenprüfung: HOLD

Eine zweite, vom Erzeuger unabhängige Sichtprüfung von Versuch 5 bei Original-
und 360-Pixel-Größe widerspricht dessen obigem Kandidatenurteil. Die Formeln
sind korrekt und lesbar, aber die schwarze x-Achse knickt am roten Pfeilende
sichtbar ab: Die Strecke vom Ursprung O zur rechten Spatecke setzt sich nicht
geradlinig zum Achsenpfeil fort. Der rot gezeichnete Vektor und die gestrichelte
O–Eck-Kante fallen ebenfalls nicht exakt zusammen. Die y-Achse hat nach dem
grünen Pfeilende einen kleineren Knick. Zudem zeigt `+24` nur den positiven
Beispielfall, ohne das Vorzeichen als geordnete Orientierung zu erklären.
Damit bleibt das Bild **HOLD**. Es wurde weder importiert noch als V freigegeben;
der historische Text-only-P-Nachweis bleibt gültig. Dies ist die maßgebliche
Entscheidung für Versuch 5, nicht das vorläufige Erzeugerurteil oben.
