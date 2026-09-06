# Physics B036: gezielte Bildkorrektur ce14a7e7-7e2a-517f-a465-78ba3fbe414d

Status: zwei AI-Kandidaten erstellt; Versuch 1 fachlich verworfen, Versuch 2 geometrisch bevorzugt, aber mit offenem Liniencodierungsrest zur Entscheidung an Root. Kein Import, keine QA-/Freigabeänderung.
Reviewer: OpenAI / Codex, keine nicht verfügbare Modell-Snapshotbehauptung.
Vollständige Sichtprüfung beider Kandidaten mit view_image; zweiter Sichtcheck abgeschlossen 2026-09-06T09:04:50Z. Bindungscheck abgeschlossen 2026-09-06T09:06:14Z.

## Ausgangsdaten und Sicherung

- Originalbild: `app/public/assets/goal-visualizations/physik/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.jpg`
- Originalbild-SHA-256: `sha256:5f1cb5fbfc97b78fbf6c5529a980467b8209cbaa7c626d5a3ce5a10e3c98de82`
- Originalprompt: `curricula/DE/Gymnasium/visualizations/physik/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/prompt.de.md`
- Originalprompt-SHA-256: `sha256:3c4ae7efcb9dbf41671000a91730eca0cf556ec4ae72735d208ab829212f4340`
- Wiederherstellbare Sicherungen: `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/original.jpg` und `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/original-prompt.de.md`.
- Originalfehler: Im rechten Weitsichtigkeitsfeld waren vier durchgezogene Strahlen bereits zu einem roten Punkt auf dem Schirm vereinigt, während weitere gestrichelte Linien einen anderen Fokus hinter dem Schirm markierten. Links/Mitte waren ausreichend.

## Durchführung

Ausschließlich vorhandenes `scripts/generate_goal_visualization_nano_banana.mjs`, ausdrücklich gewählter Nano-Banana-Weg. Modell `gemini-3-pro-image`, 16:9, 2K, image/jpeg. Gemeinsame Flags: `--landscape curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json --subject physik --model gemini-3-pro-image --no-import --skip-reconstruction-prompt --review-status candidate`. `--goal ce14a7e7-7e2a-517f-a465-78ba3fbe414d` war eine lokale Zuordnung; der Provider-Prompt enthielt keine technische Goal-ID.

### Versuch 1

- Start: 2026-09-06T09:01:32Z; generiertes Ergebnis: 2026-09-06T09:01:59.920Z.
- `--reference-image tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/original.jpg`
- `--prompt-append-file curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/edit-attempt-1.de.md`
- Edit-Prompt-Digest: sha256:149ece32fce625f1f28a0bf3d82d3258b20c153eacced3ba5236adbbc4208205.
- Vollständiger Provider-Prompt: `provider-attempt-1.de.md`, sha256:00dd6cd7ac6f5636226c64eb3143fa67246f5c6a43e6ba4a82cafc27676edb2f.
- Request: `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/attempt-1-request.json`, sha256:cc59a267392cd69141f1fed1db3e4fbacbed1ba165637cd1ff3e79616860b0b3.
- Antwortzusammenfassung: `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/attempt-1-response-summary.json`.
- Kandidat: `tmp/goal-visualizations/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/generated/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.generated.2026-09-06T09-01-59-920Z.jpg`
- Bild-Digest: sha256:b0ce506fbed9e12cc9e86d03884c04fed8fdec8170803d6c77175e9f65532ca1.
- Urteil: nicht auswählen. Der scharfe rote gemeinsame Treffpunkt auf dem Schirm und die zusätzliche gestrichelte Strahlenfamilie blieben bestehen. Ein größerer Unschärfefleck löste den fachlichen Widerspruch nicht. Deshalb genau ein gezielter Retry.

### Versuch 2

- Start: 2026-09-06T09:02:58Z; generiertes Ergebnis: 2026-09-06T09:03:27.511Z.
- `--reference-image tmp/goal-visualizations/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/generated/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.generated.2026-09-06T09-01-59-920Z.jpg`
- `--prompt-append-file curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/edit-attempt-2.de.md`
- Edit-Prompt-Digest: sha256:7f02020d56026c61d7a9250c8d8625fe6209b0bce8eb4771c3b3265eae949c96.
- Vollständiger Provider-Prompt: `provider-attempt-2.de.md`, sha256:18caf3f42360fb58ee3056383f804d3345d582e2198ea39ace73dc2339bcb40d.
- Request: `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/attempt-2-request.json`, sha256:bf93d6e53829f8791d4a1c66fb847dedf442b88a0dbd9dbe8fd80b15bd9bda02.
- Antwortzusammenfassung: `tmp/physics-b036-image-corrections-PHoLso/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/attempt-2-response-summary.json`.
- Geometrisch bevorzugter Kandidat: `tmp/goal-visualizations/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/generated/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.generated.2026-09-06T09-03-27-511Z.jpg`
- Bild-Digest: sha256:dafea2b13df564618d9372bb61caad94e43cc0fee5cd3106c95ed36f72989cdd.

Vollbild-Sichtbefund: Der falsche rote Schirmfokus ist entfernt. Vier Strahlen treffen den Schirm an getrennten Höhen und laufen ohne Richtungswechsel gemeinsam zum gelben Punkt hinter dem Schirm. Es gibt nur einen gemeinsamen Fokus im rechten Feld. Die beiden inneren Strahlen sind bis zur Schirmebene durchgezogen und dahinter gestrichelt. Die äußeren Strahlen sind jedoch bereits vom Linsenaustritt bis zum Fokus gestrichelt. Damit ist die geometrische Lage jetzt korrekt, aber die angeforderte einheitliche Codierung reale Strahlen vor dem Schirm / hypothetische Verlängerungen dahinter bleibt bei zwei Strahlen unerfüllt. Das ist ein offener Darstellungsrest, nicht bloß eine ästhetische Präferenz. Links/Mitte sowie Titel, Schirm-/Linsenanordnung und übriger Stil sind inhaltlich erhalten.

Auswahlvorschlag: Nur Versuch 2 an Root zur gesonderten Entscheidung übergeben; keine vorbehaltlose Bildfreigabe. Kein dritter Versuch, da das vereinbarte Limit von höchstens einem Retry ausgeschöpft ist. Keine eigenmächtige native Nachzeichnung, Entfernung aktiver Assets oder Provider-Deferral-Änderung.

## Schutz- und Tracechecks

Am 2026-09-06T09:06:14Z waren alle neun source/public/backend-JPGs des gesamten Dreierpakets und die drei Originalprompts byte-identisch zur Vorher-Sicherung. Vier gespeicherte Requests wurden auf tatsächliche Bildreferenz, angefordertes Modell/Seitenverhältnis und Goal-ID-freien Provider-Text geprüft. Keine API-Schlüssel ausgegeben oder in den Request-Traces gespeichert.

Die vollständig gelesene imagegen-Skill und prompting.md führten zu expliziten Erhaltungsbedingungen, referenzgebundenem lokalem Edit und vollständigem Sichtcheck. Generator und gemeinsame Prompt-/Pfadimplementierung wurden vor Nutzung gelesen. Geschrieben wurden ausschließlich tmp-Artefakte sowie dauerhafte Edit-Prompts und diese Review-Notiz. Keine Canonical-, Public-, Backend-, Registry-, QA- oder Genehmigungsänderung; insbesondere kein erfundenes Human-/Quellen-/Bildapproval. Root besitzt Import und abschließende fachliche Entscheidung.


## Dauerarchiv und Root-Adjudikation

Am 2026-09-06T09:07:32Z zusätzlich dauerhaft und wiederherstellbar archiviert: `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/original.jpg` und `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/original-prompt.de.md`. SHA-256 exakt gegen die oben gebundenen Originalbytes verifiziert. Auch `curricula/DE/Gymnasium/quality/goal-visualization-review/physics-b036-local-corrections-v1/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/rejected-attempt-1.jpg` ist dauerhaft erhalten; SHA-256 sha256:b0ce506fbed9e12cc9e86d03884c04fed8fdec8170803d6c77175e9f65532ca1. Keine Originale gelöscht oder überschrieben.

Root hat die drei ausgewählten Vollbilder eigenständig visuell gelesen und Versuch 2 als AI-Pilot zur nachfolgenden nativen Übernahme ausgewählt. Root bewertet die äußeren, schon vor dem Schirm gestrichelten Hilfsstrahlen mangels anderslautender Legende als dokumentierte stilistische Inkonsistenz, nicht als weiteren Regenerationsgrund. Der obige unabhängige Erstbefund bleibt als Verlauf erhalten; es gibt keine dritte Generierung. Diese dokumentierte Root-Adjudikation ist keine menschliche, medizinische oder source-bezogene Freigabe. Der ausführende Subagent hat weiterhin keinen Import und keine produktive QA-/Approvaländerung vorgenommen. Der geplante Root-Import verwendet den passenden dauerhaften `provider-attempt-2.de.md`; dessen tatsächlicher Generator-/Promptinhalt bleibt unverändert.
