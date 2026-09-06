# Physics B036: gezielte Bildkorrektur 84ddb244-e560-592f-9d43-e84c801fe5b4

Status: AI-Kandidat, nur vorbereitet; kein Import und keine QA-/Freigabeänderung.
Reviewer: OpenAI / Codex, keine nicht verfügbare Modell-Snapshotbehauptung.
Sichtprüfung abgeschlossen und notiert: 2026-09-06T09:03:19Z.

## Umfang und Sicherung

- Originalbild: `app/public/assets/goal-visualizations/physik/84ddb244-e560-592f-9d43-e84c801fe5b4/84ddb244-e560-592f-9d43-e84c801fe5b4.jpg`
- Originalbild-SHA-256: `sha256:c0c3842c5ec150c549eb8c5fea205b4101f6d8672e3534a69085cf146cf69a83`
- Originalprompt: `curricula/DE/Gymnasium/visualizations/physik/84ddb244-e560-592f-9d43-e84c801fe5b4/prompt.de.md`
- Originalprompt-SHA-256: `sha256:dc41d2c26d92de6d3a50d7f572a0d54ed38080eb7a3a0919f5cc504052fc60de`
- Unveränderte Sicherungen: `tmp/physics-b036-image-corrections-PHoLso/84ddb244-e560-592f-9d43-e84c801fe5b4/original.jpg` und `tmp/physics-b036-image-corrections-PHoLso/84ddb244-e560-592f-9d43-e84c801fe5b4/original-prompt.de.md`.
- Ausgangsbild in source/public/backend hatte denselben SHA-256. Die drei Produktionskopien und der Originalprompt wurden durch diese Arbeit nicht beschrieben.

## Generierung und Bindung

- Ausschließlich vorhandenes `scripts/generate_goal_visualization_nano_banana.mjs`; ausdrücklich gewünschter Nano-Banana-Weg statt Skill-Standardprovider.
- Modell: `gemini-3-pro-image`; 16:9, 2K, image/jpeg.
- Start erster Request: 2026-09-06T09:01:32Z; erzeugter Kandidat: 2026-09-06T09:02:00.043Z.
- Flags: `--landscape curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json --subject physik --model gemini-3-pro-image --reference-image tmp/physics-b036-image-corrections-PHoLso/84ddb244-e560-592f-9d43-e84c801fe5b4/original.jpg --prompt-append-file curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/84ddb244-e560-592f-9d43-e84c801fe5b4/edit-attempt-1.de.md --no-import --skip-reconstruction-prompt --review-status candidate`; `--goal 84ddb244-e560-592f-9d43-e84c801fe5b4` nur lokale Zuordnung, keine ID im Provider-Prompt.
- Edit-Prompt: `edit-attempt-1.de.md`, sha256:86a85b7a78bff9b960be0afc47940659cec44b3ef0f71d067252c36c122a2a2b.
- Vollständiger Provider-Prompt: `provider-attempt-1.de.md`, sha256:54d45dbe4c6ea1e4c52e11de77114e130bd9d82bc86c244ed4025fa208c35517.
- Request-Trace: `tmp/physics-b036-image-corrections-PHoLso/84ddb244-e560-592f-9d43-e84c801fe5b4/attempt-1-request.json`, sha256:8a857917a6d389c7cc6a0e3a4c706c2b2900df333666987e8c308dd362a5f9e4; keine API-Schlüssel darin.
- Antwortzusammenfassung: `tmp/physics-b036-image-corrections-PHoLso/84ddb244-e560-592f-9d43-e84c801fe5b4/attempt-1-response-summary.json`.
- Ausgewählter Kandidat: `tmp/goal-visualizations/84ddb244-e560-592f-9d43-e84c801fe5b4/generated/84ddb244-e560-592f-9d43-e84c801fe5b4.generated.2026-09-06T09-02-00-043Z.jpg`.
- Kandidaten-SHA-256: `sha256:be7ee0441b1b19c18e4ee241a5be815a22cb1d45097bb53616d50b4fee8ee4ef`.

## Visueller Befund

Original: Der untere Lichtweg war vor und hinter der Linse gekrümmt; Bildhöhe und Treffpunkt wurden dadurch geometrisch erzwungen.

Versuch 1: Vollständiges erzeugtes JPG mit view_image in Originalauflösung betrachtet. Der Mittelpunktstrahl ist jetzt eine gerade, kollineare Linie von der Gegenstandsspitze durch das Linsenzentrum. Der Parallelstrahl bleibt vor der Linse horizontal und verläuft nach seinem einzelnen Knick gerade zum gemeinsamen Treffpunkt. Beide treffen die Spitze des verlängerten, invertierten Bildpfeils an der Netzhaut. Die fast gleichen Gegenstands- und Bildweiten passen nun zur ungefähr gleichen Pfeilhöhe. Formel, Beschriftungen, Linse, Hintergrund und Modellgrenzenkarte bleiben erhalten. Keine weitere fachliche Auffälligkeit beim vollständigen Sichtcheck; keine ästhetische Iteration.

Auswahl: Versuch 1 als Kandidat für Roots unabhängige Sichtung. Kein Retry erforderlich. Kein menschliches Urteil, keine Publikations-, Quellen- oder formale Bildfreigabe.

## Skill-Einfluss und Grenze

Die imagegen-Skill und ihr vollständig gelesenes prompting.md führten zu expliziten Erhaltungsbedingungen, referenzgebundenem lokalem Edit und vollständiger Sichtkontrolle. Generator und gemeinsame Prompt-/Pfadimplementierung wurden vor Nutzung gelesen. Es wurden ausschließlich tmp-Artefakte sowie diese dauerhaften Edit-Prompts und Review-Notizen erstellt. Keine Canonical-, Public-, Backend-, Registry-, QA- oder Genehmigungsänderung. Import und unabhängige abschließende Entscheidung liegen bei Root.


## Dauerarchiv und Root-Adjudikation

Am 2026-09-06T09:07:32Z zusätzlich dauerhaft und wiederherstellbar archiviert: `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/84ddb244-e560-592f-9d43-e84c801fe5b4/original.jpg` und `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/84ddb244-e560-592f-9d43-e84c801fe5b4/original-prompt.de.md`. SHA-256 exakt gegen die oben gebundenen Originalbytes verifiziert. Keine Originale gelöscht oder überschrieben.

Root hat die drei ausgewählten Vollbilder eigenständig visuell gelesen und Versuch 1 als AI-Pilot zur nachfolgenden nativen Übernahme ausgewählt. Diese dokumentierte Root-Adjudikation ist keine menschliche, medizinische oder source-bezogene Freigabe. Der ausführende Subagent hat weiterhin keinen Import und keine produktive QA-/Approvaländerung vorgenommen. Der geplante Root-Import verwendet den passenden dauerhaften `provider-attempt-1.de.md`; dessen tatsächlicher Generator-/Promptinhalt bleibt unverändert.
