# Mathematik M7: zwei weitere exakte V-Quickwins

Review date: 2026-09-27

Stand: 27.09.2026. Von zehn verbliebenen strengen V-Lücken wurden nur zwei neue, eigenständige PNGs importiert. Die Entscheidung stützt sich auf die **importierten Originalbytes** und die 360-px-Kartenansicht, die aktuelle deutsche und englische kanonische Zielbeschreibung, aktive Alt-Texte und Provider sowie fachliche Gegenprüfung. Das ist eine hashgebundene **AI-V-Pilotprüfung**, keine menschliche Freigabe. Der strenge 797-ID-V-Scope steht nach diesen beiden Änderungen bei **789/797**; acht Ziele bleiben offen.

| Ziel | Kanonischer PNG-SHA-256 | Fach-/Sichtbefund | Herkunft |
| --- | --- | --- | --- |
| `8b3ce429-e6bb-5d33-b6aa-6ded41afc74c` – Transformationen von Logarithmusgraphen deuten (LK) | `3c7a63b04016e68503a5829be93b785ff5d68cb56e0e044ef89dfa5290da2106` | `f(x)=log₂(x)` mit `(½,−1)`, `(1,0)`, `(2,1)`, `(4,2)` und `g(x)=log₂(x−2)` mit `(2½,−1)`, `(3,0)`, `(4,1)` stimmen. Definitionsbereiche und senkrechte Asymptoten sind `x>0`/`x=0` beziehungsweise `x>2`/`x=2`. Der Pfeil zeigt jetzt tatsächlich **nach rechts**, passend zur Verschiebung um 2. Original 1254×1254 und 360×360 geprüft; Haupttext, Punkte und Asymptoten sind lesbar. Das Bild zeigt exemplarisch eine horizontale Verschiebung, nicht sämtliche im Ziel enthaltenen Streckungen sowie x-/y-Verschiebungen. | OpenAI/Codex Built-in-Bilderzeugung; konkrete Modellkennung nicht ausgegeben. Versuch 05 ohne externe Vorlage neu erzeugt, Versuche 06/07 sind Edits der jeweils vorigen generierten Datei. `tmp/math-m7-image-prompts-2026-09-27/generated/8b3ce429/attempt-log-imagegen-20260927.md` dokumentiert die Kette. Der tatsächliche finale Provider-Prompt steht kanonisch unter `visualizations/mathematik/8b3ce429-e6bb-5d33-b6aa-6ded41afc74c/prompt.de.md`. |
| `bd637a72-6609-54f5-bb33-8a9e898bf7a0` – Heuristik auswählen und begründen | `dbafb59c8db08324fd077537888e4ada708aaeb3a576a516cf5a0101b03178e5` | Anders als der alte zurückgestellte Hash nennt das neue Bild die Aufgabe **mit Zielwert 11**. Umkehren von `+3` und `×2` ergibt `11→8→4`; die Vorwärtsprobe `2·4+3=11` stimmt. Aufgabe, Rückwärtsweg und Probe sind bei 360 px gut lesbar. Der bekannte Endwert und die umkehrbaren Schritte machen die Wahl anschaulich; eine vollständige sprachliche Begründung oder ein Vergleich mit anderen Heuristiken muss die Lernaufgabe leisten. | Google Gemini / Nano Banana 2, im Request nachweislich `gemini-3.1-flash-image`, aus einem eigenen Prompt ohne Nutzerbild erzeugt. Der tatsächliche Prompt steht kanonisch unter `visualizations/mathematik/bd637a72-6609-54f5-bb33-8a9e898bf7a0/prompt.de.md`; Arbeitsquelle `tmp/math-m7-image-prompts-2026-09-27/images/bd637a72-6609-54f5-bb33-8a9e898bf7a0.png`. |

Die folgenden vollständigen IDs indexieren dieselben oben geprüften Endbytes für den maschinenlesbaren Rollout-Status. Sie sind keine zusätzliche oder menschliche Freigabe.

| Goal ID | Title | Decision | Exact imported SHA-256 | Finding |
| --- | --- | --- | --- | --- |
| `8b3ce429-e6bb-5d33-b6aa-6ded41afc74c` | Transformationen von Logarithmusgraphen deuten (LK) | `accepted_pilot_after_original_resolution_ai_review` | `sha256:3c7a63b04016e68503a5829be93b785ff5d68cb56e0e044ef89dfa5290da2106` | Die verschobenen Punkte und Asymptoten stimmen; ein horizontaler Verschiebungsfall. |
| `bd637a72-6609-54f5-bb33-8a9e898bf7a0` | Heuristik auswählen und begründen | `accepted_pilot_after_original_resolution_ai_review` | `sha256:dbafb59c8db08324fd077537888e4ada708aaeb3a576a516cf5a0101b03178e5` | Zielwert 11, Rückwärtsweg und Vorwärtsprobe stimmen. |

Beide kanonischen PNGs liegen unter `curricula/DE/Gymnasium/visualizations/mathematik/<ID>/<ID>.png`. Die Kopien in `app/public/assets/goal-visualizations/mathematik/` und `backend/src/main/resources/static/assets/goal-visualizations/mathematik/` haben je denselben SHA-256-Wert. Die aktiven `resourceLinks` sind deutsch, `primary`, `pilot`, mit wahrheitsgemäßem Alt-Text und `CC-BY-4.0` für das eigene didaktische Material. KI-Erzeugung und Sichtprüfung allein sind weder Rechtsgarantie noch menschliche Qualitätsfreigabe. Vorherige verworfene PNGs wurden nicht aktiviert.

## Acht weiter offene V-Fälle

| ID-Präfix | Aktueller Importblocker |
| --- | --- |
| `d051857c` | Nutzerdatei für Dreieckshöhen: fachlich plausibel, aber tatsächliche Erzeugung und Nutzungsrecht nicht belegt; keine automatische Umdeklaration zu eigenem CC-BY-Material. |
| `1b67aeb4` | Nutzerdatei mit zehn Paaren: Zählung richtig, aber Prompt/Generator und Rechtekette unbekannt. |
| `ae3483e3` | Güte-gegen-`n`-Bild ist keine passende Güte-/OC-Kurve über dem wahren Parameter; exakte Auswahlentscheidung aus wenigen Stützpunkten nicht gedeckt. |
| `a7fb1a7a` | Neuer Kandidat berechnet komplexe Zahlen richtig, beschriftet bei `|z/u|=1` die Division aber fälschlich als „stauchen“ und verwendet „Gegenvektor“ beim Ergebnisvektor missverständlich. |
| `93fc4fbb` | Neuer Dreischritt „Von Hand/CAS/Probe“ zeigt keine wirkliche Handumformung oder Begründung, warum CAS bei der einfachen Gleichung sinnvoll ist. |
| `ae483d98` | Versuch 05 verbessert die 360-px-Fußzeile, aber die Verwerfungsregeln `X≥32`/`X≥113` fehlen; schematische Balken legen Beta als Abstand statt als Wahrscheinlichkeit im Nichtverwerfungsbereich nahe. Die zielgebundene Gegenprüfung hat deshalb Vorrang vor der bloßen Lesbarkeitsfreigabe. |
| `4f64f771` | Kandidat zeigt den 3-4-5-Punkt, aber nicht die Exponentialform `5e^(iφ)` oder die geforderte zeitabhängige Deutung `φ=ωt`. |
| `74d29d0c` | Auch Versuch 09 des Kegelnetzes ist bei `s=2`, `r=1`, `180°` metrisch nicht präzise genug; Bogen-/Grundkreisverhältnis und Kreissektorform bleiben HOLD. |

Die detaillierten Importblocker stehen in den bestehenden unabhängigen Kandidatenprüfungen unter `tmp/math-m7-image-prompts-2026-09-27/generated/` sowie in den historischen HOLD-Notizen unter `quality/goal-visualization-review/`. Der zentrale Rollout-Status muss die beiden neuen Hash-Entscheidungen noch materialisieren; historische HOLD-Belege zu anderen Bytes bleiben als Historie bestehen.
