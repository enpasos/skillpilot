# Mathematik M7: Binomial-PNG-Kandidaten und Bindungsprüfung (24.09.2026)

Aktueller Stand: `aa00` **candidate-v2** und `9b6` **candidate-v3** wurden
nach den unten dokumentierten Prüfungen als aktive PNG-Bindungen in Kanon,
Web/Backend und aktuelle KI-Bild-QA übernommen. Die bildgebundenen unabhängigen
P-v2-Profile und der aktuelle D-Endreview mit zwei unabhängigen Runden sind
separat registriert und im zentralen Fünf-Gate-Bericht geprüft.
Diese Datei enthält weiterhin die ursprüngliche Kandidaten- und HOLD-Historie;
sie allein behauptet keinen strengen M7-Abschluss.

## Gemeinsame Provenienz und Prüfgrenze

- Generator: eingebaute **OpenAI/ChatGPT-Codex-Bildgenerierung** via
  `image_gen.imagegen`; die konkrete Modellversion wird vom Werkzeug nicht
  ausgewiesen und wird hier nicht behauptet. Für jede Zielabbildung wurde ein
  eigener Generierungsaufruf verwendet; die zweite Version ist jeweils eine
  gezielte Bearbeitung des ersten Kandidaten mit demselben Werkzeug.
- Tatsächliche Eingaben: die vollständigen Dateien `prompt-v1.md` und
  `prompt-v2-edit.md` im jeweiligen Zielordner. An den Generator wurden keine
  technischen Ziel-IDs, privaten Lernenden-, Chat- oder Sessiondaten gesendet.
- Stilreferenz vor dem Prompting: vorhandene Mathematik-Bilder zu Bernoulli-
  Ketten (`e495fa38…`) und Binomialverteilungen (`42d300e3…`) visuell
  angesehen; sie wurden weder bearbeitet noch dem Generator als Bildinput
  gegeben. Die neue Gestaltung hält die freundliche Orange/Teal/Navy-
  Comic-Sprache mit reduzierter Informationsdichte ein.
- Quellstand: aktuelle kanonische Ziele und ihre registrierten
  `positive-understanding-evidence-v2`-Profile. Beide aktiven QA-Einträge
  stehen vor diesem Paket auf `missing` / `deferred_provider_limitation`:
  nach dem semantischen Split lag kein eigenständig fachlich freigegebenes
  Ersatzbild vor; ein altes Clusterbild soll nicht überdehnt werden.
- Sichtprüfung erfolgte an den **Originalpixeln (1536×1024)** und an einer
  rein diagnostischen Skalierung auf **360 px Breite**. Die temporären
  360-px-Ansichten sind keine Produktionsassets. Formeln und Zeichnung wurden
  getrennt geprüft. Diese KI-Prüfung behauptet keine menschliche Freigabe.

| Ziel | Erste Version: abgelehnt | Zweite Version: Kandidat für Bindungsprüfung |
| --- | --- | --- |
| `aa00edfa-cf8d-500e-994f-7e33a5ebd045` – Binomialwahrscheinlichkeiten bestimmen und deuten | `candidate-v1-rejected.png`, SHA-256 `3d754a64b32a232fada77c8f4e92dda143b6c9ef902e82f21a8372c483ce6c65`: vier Kopfseiten oben suggerierten trotz Zufallsexperiment fälschlich ein bereits eingetretenes Vier-Kopf-Ergebnis. | **ACCEPT als ungebundener Kandidat:** `candidate-v2.png`, SHA-256 `58cd2f73b87e66856188dc09c03562dbd8cb6186174e3745014e6162f6dfb837`. Die irreführenden Münzen sind entfernt. Drei Zeilen zeigen exakt `{2}`, `{1,2}` und `{0,1,2}` für `X`, jeweils mit `6/16`, `10/16`, `11/16`. Für `X~Bin(4,1/2)` gelten die Einzelgewichte `(1,4,6,4,1)/16`; die drei Summen stimmen. Gleiche Kreisgröße ist hier nur ein Selektionsmarker, **kein** Wahrscheinlichkeitsbalken. Text, Ziffern, Markierungen und Brüche bleiben bei 360 px lesbar. |
| `9b6f4d7d-a804-5666-b7ea-85bb3c73da4a` – Die Formel für Binomialwahrscheinlichkeiten an einem Beispiel begründen | `candidate-v1-rejected.png`, SHA-256 `6294ac99cb433d193fda1a00dfa0e52557fc38fccf939f3c6998bf29188c6248`: mathematische Muster korrekt, aber Überschrift und Legende waren auf dunkelblauem Grund bei 360 px nicht ausreichend lesbar. | **HOLD nach unabhängiger Zweitprüfung (korrigiert das frühere ACCEPT):** `candidate-v2.png`, SHA-256 `df91aa81ca527fb0f07d035b9050f25589ab9d171072ca5cc4410d8c256aa9f2`. Die sechs Folgen `KKZZ`, `KZKZ`, `KZZK`, `ZKKZ`, `ZKZK`, `ZZKK` sind korrekt und bei 360 px lesbar. Das Bild behauptet jedoch `1 Muster: 1/16` und `6 Muster: 6/16`, während der sichtbare Titel nur „Genau 2-mal Kopf bei 4 Würfen“ nennt. Die dafür nötigen Voraussetzungen **faire und unabhängige Münzwürfe** stehen nur im Prompt. Für allgemeines p hat jedes 2K2Z-Muster `p²(1−p)²`. Gerade für dieses Begründungsziel ist die fehlende Voraussetzung wesentlich. Keine Bindung oder V-Freigabe; Korrektur und neue Prüfung nötig. |

Die Darstellung der ersten Zeile folgt dem P-v2-Fall `four-tosses` mit
`P(X=2)=6/16`, `P(1≤X≤2)=10/16`, `P(X≤2)=11/16`; der zweite P-v2-Fall
`rare-tail` bleibt bewusst ein **anderer** Transferfall. Das zweite Bild
orientiert sich am P-v2-Fall `two-heads` (vier faire Würfe); `four-hits` mit
`p=0,8` bleibt der andere Transferfall. Das zweite Bild wollte die Faktoridee
an `p=1/2` zeigen, belegt diesen Parameter und die Unabhängigkeit aber nicht
sichtbar; es bleibt deshalb HOLD. Die bisherigen P-v2-Fälle `four-tosses` und
`two-heads` decken sich zudem mit den Bildern und taugen nicht als unabhängige
Leistungsnachweise. Ein separater textlicher P2-Split mit frischen Aufgaben
liegt unter `quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/`;
er bindet kein Bild und ist nicht zentral registriert.

Generator-Originale, aus denen nur die hier benannten Kandidaten kopiert
wurden (nicht als aktive Bindungen):

- `aa00` v1: `/home/enpasos/.codex/generated_images/01a0d04f-e3d7-7423-9305-7a0733fe8dcb/exec-557ef0ce-c23d-4446-b323-36069c568276.png`
- `aa00` v2: `/home/enpasos/.codex/generated_images/01a0d04f-e3d7-7423-9305-7a0733fe8dcb/exec-2edf0ea7-91ed-4a74-b3ed-c363bd7b5f64.png`
- `9b6` v1: `/home/enpasos/.codex/generated_images/01a0d04f-e3d7-7423-9305-7a0733fe8dcb/exec-1e74ed66-1588-4955-955d-e4277fbe6784.png`
- `9b6` v2: `/home/enpasos/.codex/generated_images/01a0d04f-e3d7-7423-9305-7a0733fe8dcb/exec-67e4ec0b-7601-4c9c-ab07-5f553142c459.png`

Für mögliche Aktivierung: `aa00` nochmals am aktuellen Ziel, an der
gerenderten Seite und im Kontext prüfen. `9b6` braucht zuerst eine gezielte
Bildkorrektur und erneut unabhängige Sichtprüfung in Originalgröße und bei
360 px. Erst danach kommen Import mit Provenienz, spezifischem Alt-Text,
SHA-gebundener V-Entscheidung, passender P-Bindung und D-Seitenprüfung infrage.
Bloßes Nachziehen von Hashes ist keine Inhaltsprüfung.

## Nachtrag: 9b6-Version 3 hebt den Version-2-HOLD auf

Der HOLD oben gilt ausschließlich für `candidate-v2.png`. Ein gezielter
Bildgenerierungs-Edit ergänzte den sichtbaren Untertitel „Vier faire,
unabhängige Würfe“. Der tatsächliche Prompt und das Generator-Original sind
unter `9b6f4d7d-a804-5666-b7ea-85bb3c73da4a/prompt-v3-edit.md`
dokumentiert. `candidate-v3.png` hat SHA-256
`cfc3330cbdeee3ec592a19662174cb7f4f80af70cb3c857c185baf2a5015ada0`.
Eine zweite unabhängige KI-Prüfung am Original und bei 360 px fand den
Untertitel lesbar, exakt sechs verschiedene 2K2Z-Folgen sowie `1/16` je
Folge und `6/16` insgesamt mathematisch korrekt. Version 3 wurde deshalb
als **Bildkandidat ACCEPT**, nicht als Lernzielabschluss, beurteilt. Die
historisch schlechte Version 2 bleibt ungebunden.

## Aktuelle Bindungsentscheidung nach dem Kandidatenstadium

Für `aa00` ist Version 2 und für `9b6` Version 3 aktiv. Kanon, Web- und
Backend-Asset sind pro Ziel bytegleich; Alttext, KI-Bild-QA und die
bildgebundenen unabhängigen P-v2-Fälle wurden am tatsächlichen Inhalt
geprüft. Nach Korrektur der roh angezeigten Formelbeschreibung führten zwei
unabhängige D-Runden für beide vollständigen Lernzielseiten zu KEEP. Die
informierte Synthese und der aktuelle D-Index liegen unter
`quality/goal-description-review/mathematik/rollout-v1/2026-09-24/m7-q3-binomial-two-image-final-20260924-v2/`.
Der zentrale Fünf-Gate-Check zählt beide nun streng mit (Mathematik insgesamt
693/797). Das sind KI-Prüfentscheidungen für M7, keine menschliche
Freigabe; der alte v2-HOLD bleibt zutreffend nur für jene Bildversion.
