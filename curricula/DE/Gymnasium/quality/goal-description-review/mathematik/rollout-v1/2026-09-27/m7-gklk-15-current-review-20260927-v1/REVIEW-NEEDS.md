# Mathematik M7 – 15 aktuelle LK-Seiten außerhalb der reinen Scope-Kompatibilität

Stand: 2026-09-27. **Vorbereitet, nicht zentral registriert.** Die [Batch-Konfiguration](../m7-gklk-15-current-review-20260927-v1.config.json) verwendet ausschließlich den vorgeschlagenen, nicht produktiv aktivierten GK/LK-Atlas. Das gebundene Review-Buch enthält 15 aktuelle kanonische Ziele in voraussetzungsgeeigneter Reihenfolge. Mittlerweile liegen zwei getrennte, blinde KI-Review-Kandidatenrunden und ihr [nichtkanonischer Abgleich](dual-review-triage.md) vor; es gibt weiterhin **keine neuen D-Abschlüsse**.

Gebundene Basis: BookModel `sha256:f631e321e7711a3cf6e31a70c3e1c8c7b43248c2a47fc52522e11c9e24cad539`, Review-Input `sha256:362c30f1037e40d4a4c5a24f73dc4a75b9e1f7e5ad178a36620ec029c916235e`, Bundle `sha256:3d6999720f1958ca92ed34554a45186e789cb7788bd7f0bd6dde43114533440e`. `prepare` und `check` des Standalone-Batch-Werkzeugs bestehen. Der [zielgenaue Vergleich](../../../../../../../../../app/scripts/auditMathGkLk15CurrentReviewPackage.ts) prüft für alle 15 alte Resolution-Bytes gegen ihre zentral registrierten SHA-256-Digests sowie die alte Seite gegen den alten V3-Input, die neue Seite gegen den neuen V3-Input und den neuen kanonischen Kontext. Alle 15 behalten denselben zweisprachigen Text, `sourceRef` und kanonischen `goalFingerprint`; die neuen Geltungen und Seitenkontexte sind aus dem aktuellen vorgeschlagenen Atlas gebaut.

| Ziel-ID | Inhalt | Gegenüber dem bisherigen D-Review geändert | Erforderliche neue Prüfung |
| --- | --- | --- | --- |
| `6a66b4f5-d36e-5b53-91ad-cf25a849d66b` | Explizite Folgen | 16 GK-Geltungen entfernt; Seitenreihenfolge und externe Voraussetzung neu. Altes 7er-Subset wegen entfallenem Ziel `12a8dffc…` nicht gleichwertig rekonstruierbar. | Aktuellen Folgen-Kontext eigenständig beurteilen. |
| `10efb267-9733-5db3-a807-03f4cf54e336` | Rekursive Folgen | Dieselbe 16er GK-Einschränkung; neues Subset statt nicht rekonstruierbarem Alt-Batch. | Explizit/rekursiv fachlich trennen und Voraussetzung prüfen. |
| `f1eee698-04c6-5d60-bcc6-a3c67129eea2` | Bildungsgesetze von Folgen | Dieselbe 16er GK-Einschränkung; neues Subset statt nicht rekonstruierbarem Alt-Batch. | Beobachtbare Regelbildung vom bloßen Musterfortsetzen abgrenzen. |
| `b66d13c5-187e-530b-b4d3-efc7506a7f34` | Monotonie, Beschränktheit, Konvergenz | Dieselbe 16er GK-Einschränkung; neues Subset statt nicht rekonstruierbarem Alt-Batch. | Eigenständige Teilaspekte und atomare Abgrenzung kritisch prüfen. |
| `bfc2bf06-9b37-4912-a8eb-25fb5d489d72` | Uneigentliche Integrale und Flächen | 16 GK-Geltungen entfernt; Breadcrumbs/Kapitel und Navigation geändert. | Kontext und fachlich zulässige Interpretation uneigentlicher Integrale prüfen. |
| `e7350739-c89f-5c7b-b4d1-717d6a767298` | Exponential-Parameteruntersuchung | 15 GK-Geltungen entfernt; Bild **fehlend → PNG**, dazu Seiten-/Voraussetzungskontext neu. | Aktuelle Bild-/Parameterbindung und Beschreibung gemeinsam prüfen. |
| `164921f6-3bf7-5efc-a438-ea4759dca9ef` | Kettenlinienmodell | 15 GK-Geltungen entfernt; Bild **fehlend → PNG**; Navigation neu. | Aktuelle Kettenlinien-Darstellung samt Parameterdeutung prüfen. |
| `b71c332f-ef9d-5c27-983b-7103269ff419` | Glockenkurvenmodell | 15 GK-Geltungen entfernt; Bild **fehlend → PNG**; Navigation neu. | Modellbedeutung und Bild-/Textgrenzen prüfen. |
| `fdce0ced-46a0-594a-9b5d-d2dc18e5e473` | Ortskurven von Extrempunkten | 15 GK-Geltungen entfernt; Bild **fehlend → PNG**; Navigation neu. | Ortskurve versus einzelne Extremstelle fachlich unterscheiden. |
| `79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16` | Ortskurven von Wendepunkten | 15 GK-Geltungen entfernt; Bild **fehlend → PNG**; Navigation neu. | Wendepunkt-Bedingung und Parameterort fachlich prüfen. |
| `f9c24dd8-eaa5-5395-8679-820c1a74e7b7` | Strategien vergleichen | **15 LK-Geltungen hinzugefügt**, keine GK-Entfernung; Breadcrumbs, Kapitel, externe Voraussetzungen und Navigation geändert. | Besonders die neue LK-Zuordnung und Auswahlkriterien gegen aktuelle Quellen/Umgebung prüfen. |
| `edaf0bb4-e12e-5a6c-b484-91124ba209f3` | Geradenscharen | 15 GK-Geltungen entfernt; Breadcrumbs/Kapitel und Navigation geändert. | Scharparameter und geometrische Lage im neuen Kontext prüfen. |
| `36e0de23-1e3b-5c69-888f-e5e19e79cbbe` | Normalen-/Hessesche Form | 15 GK-Geltungen entfernt; Breadcrumbs/Kapitel, externe Voraussetzungen und Navigation geändert. | Signum-/Abstandsbedingungen und Methodenabgrenzung prüfen. |
| `fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc` | Ebenenscharen | 15 GK-Geltungen entfernt; Breadcrumbs/Kapitel, externe Voraussetzungen und Navigation geändert. | Parameterfälle und Ebenenlage prüfen. |
| `e105bad8-b4e5-53fc-b02e-604f1df5b503` | Geschichte komplexer Zahlen | 14 GK-Geltungen entfernt; Bild **fehlend → PNG**; Seiten-/Voraussetzungskontext neu. | Historischen Entwicklungsschritt ohne erfundene Kausalität und Bild-/Textbindung prüfen. |

Die sechs neuen Bildbindungen sind **keine ausstehenden Bildgenerierungsaufträge**: Für die aktuell referenzierten PNG-Bytes stimmen kanonische und öffentliche Datei mit `assetSha256` und `aiApprovedAssetSha256` im Visualisierungs-QA-Ledger überein; dort stehen `aiApproved: yes` und `contentApprovedChatGpt: yes`. Das GoalBook-Label `review_candidate` mit `approvedForPublication: false` kennzeichnet nur dieses unpublizierte Review-Buch, nicht eine fehlende maschinelle V-Freigabe. Menschliche Freigabe bleibt separat.

**Nächster D-Schritt:** Die zwei blinden Runden sind abgeschlossen und [zielgenau triagiert](dual-review-triage.md). Vor einer Synthese muss insbesondere Bayerns zusätzlicher, modularer Vertiefungskurs von regulären Kursprojektionen getrennt werden; ein bloßer GK→LK-Wechsel reicht nicht. Quellen-, Identitäts-, Text- und Bildfälle danach einzeln klären, nötige Bindungen erneuern und einen neuen Index nur nach bewusster Owner-Ersetzung zentral eintragen. Bis dahin zählen die bisherigen zentralen Alt-Claims unverändert, aber dieser vorgeschlagene Atlas ist nicht produktiv.

```bash
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-gklk-15-current-review-20260927-v1.config.json
app/node_modules/.bin/tsx app/scripts/auditMathGkLk15CurrentReviewPackage.ts
```
