# Unabhängige Bildprüfung: Vierfeldertafeln interpretieren

22.09.2026 (Europe/Berlin); Prüfzeit UTC: `2026-09-21T22:06:38Z`. **KEEP**, Status `candidate`, Autorität `ai_candidate`. Keine Humanfreigabe, kein Import, keine QA-Aggregatänderung und keine Realhost-Abnahme.

Aktuelles Referenz-JPG und neues PNG wurden zuerst tatsächlich angesehen. Eigene Sachentscheidung vor dem Lesen des Edit-Prompts und Root-Reviews gebildet. Die frühere Hold-Inventur war bekannt; dies ist eine unabhängige neue Kandidatensicht, kein historisch blinder Vollreview.

- Kandidat: `candidate.png`, 1678 × 937; `sha256:6764ed8c68218dc8f6c24bee3e959a07e4f968c252b3a02084fd341f9644a7aa`.
- Referenz und kanonisches Quellbild: `sha256:e52e39a3e77b0855ad766559fe179a15c6599b6f549c4468386efd051ac77c84` (beide Dateien stimmen überein).
- Toolherkunft erst nach der Sachprüfung aus `generation-and-root-review.json` gebunden: OpenAI / ChatGPT-Codex image generation, `image_gen__imagegen`, Result-ID `exec-9adde408-e8c7-4616-941f-9d22a436db3a`; exaktes Serving-Modell nicht offengelegt.

## Konkrete Prüfung

- Innenzahlen 30,20 / 10,40; Zeilensummen 50,50; Spaltensummen 40,60; Gesamtsumme 100 stimmen.
- Alle vier Innenwerte 0.30,0.20 / 0.10,0.40 und Randsummen 0.50,0.50 sowie 0.40,0.60,1.00 entsprechen der absoluten Tafel dividiert durch 100.
- P(A∩B)=30/100=0,30; P(A|B)=30/50=0,60; P(B|A)=30/40=0,75. Gemeinsamer Zähler 30, unterschiedliche richtige Bezugsgruppen 100/50/40.
- Die irreführenden Einzelzellpfeile der Referenz sind entfernt. Rote Bezugszeile B und violette Bezugsspalte A werden durch Klammern und ausdrückliche Kartenüberschriften als Gruppen ausgewiesen. Keine innere oder Randzelle wird allein als bedingte Wahrscheinlichkeit bezeichnet.
- Schnittzeichen ∩ und Bedingungsstriche | bleiben unterscheidbar; die vertauschten Bedingungen A|B und B|A haben die jeweils richtigen Nenner. Die Tabelle nutzt Dezimalpunkte, die Karten Dezimalkommas; Werte sind eindeutig und konsistent.

Das AB1-Beispiel erklärt gemeinsame und bedingte Lesarten einer absoluten/relativen Vierfeldertafel. Eine konkrete Vierfeldertafel ist ausreichend als Orientierung; nicht jede Mehrfeldertafel oder Sachtextkonstruktion muss im Bild vollständig ausgeführt werden.

## Stil und Lesbarkeit

Hellblaue freundlich gerahmte Lernlandschaft, gelbe absolute und grüne relative Tafel, rote/violette Bezugsgruppen und abgerundete Karten. Die bisherigen passenden Farben und der zugängliche Charakter bleiben erhalten. Alle Innenwerte, Randsummen, Nenner, Ereigniszeichen und drei Kartenüberschriften sind lesbar. Farbklammern verdecken keine nötigen Zahlen; erläuternde Texte sind vollständig im Bild. Prüfung am bereitgestellten Raster, kein neuer Browser-/Mobil-/Screenreadertest und keine pixelidentische Erhaltung behauptet.

Keine blockierenden Befunde. Die vollständige eigenständig nutzbare `reconstruction-prompt.md` legt Zahlen, Ereigniszuordnung, Layout, Farben und Notation fest. Eine spätere Rekonstruktion muss ihrerseits geprüft werden. Die maschinenlesbare Evidenz und genaue Herkunftsbindung stehen in `ai_candidate-review.json`. Weitere Canonical-/D-/P-/V-Integration bleibt beim koordinierenden Agenten.

