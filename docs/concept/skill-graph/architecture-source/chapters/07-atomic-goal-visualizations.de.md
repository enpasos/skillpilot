## Visualisierungen für atomare Lernziele {#sec:sga-goal-visualizations}

Optionale Begriffsillustrationen unterstützen Lernende dabei, die Kernidee eines atomaren Lernziels visuell zu erfassen, ohne eigenes Nachdenken oder Aufgabenlösen vorwegzunehmen.

### Kanonisches Linkschema und MCP-App-Darstellungsvertrag {#sec:sga-vis-contract}

Geprüfte Visualisierungen werden über `resourceLinks` am atomaren Lernziel referenziert:

```json
{
  "type": "goal-visualization",
  "resourceType": "image",
  "role": "primary",
  "skillpilotId": "<exakte-kanonische-goal-id>",
  "url": "/assets/goal-visualizations/<subject>/<id>/<id>.png"
}
```

In MCP-fähigen Hosts wie OpenAI ChatGPT liefert `render_skillpilot_goal_visualization` ein oberflächenneutrales `text/html;profile=mcp-app`-Widget mit einmaliger `(goalId, stateVersion)`-Autorisierung und dem Schalter `showGoalVisualizationsInChat`. Das Widget bleibt bis zum erfolgreichen Bildladen eingeklappt, wertet begrenzte MCP-Ergebnisumschläge aus (mit gespeichertem Widget-State nur als Bootstrap-Fallback) und bewahrt alle zuvor veröffentlichten inhaltsadressierten UI-Ressourcen-Hashes unverändert.

### Produktionsbereich, Format und Provider-Priorität {#sec:sga-vis-providers anchors="provider-priority-and-exception-policy"}

Prompts, Kandidatenerzeugung und QA-Ledger liegen unter `curricula/DE/Gymnasium/visualizations/` (`prompt.de.md`, `image-reconstruction-prompt.de.md`, Ausspielung per `npm run deploy:assets` als 16:9-PNG um `1600x900`, geprüft auf `360px` Mobil- und `680px` Desktopbreite, kalibriert am Pilotziel `502ecaa7-cca6-5c51-a1cc-da09a7b2382c`).

Gemäß verbindlicher **Product-Owner-Entscheidung vom 13. September 2026** gilt:

- **Standard `KEEP`:** Gute bestehende Mathematik- und Physikbilder bleiben unabhängig vom ursprünglichen Generator erhalten; es erfolgt keine rückwirkende Konvertierung zur Provider-Vereinheitlichung.
- **Provider-Priorität bei Neu- oder Korrekturbildern:** Bevorzugt wird **ChatGPT/Codex-Bildgenerierung** in der freundlichen, abstrakten, klaren, comicartigen Raster-Bildsprache von SkillPilot, sofern Fachrichtigkeit und Darstellung passen. **Nano Banana Pro** (`gemini-3-pro-image`) ist ohne vorherigen Fehlversuch als reguläre Alternative zulässig, wenn es die fachliche Darstellung besser trifft.
- **Enge SVG-/Plot-Ausnahme:** Programmatisch gezeichnete Diagramme/SVGs bleiben eng begrenzte, fachlich begründete Ausnahmen für exakte Geometrie-/Funktionsplots und kein allgemeiner Stilwechsel.

### CLI-Workflow und zweistufige Review-Gates {#sec:sga-vis-review}

Die Hilfsskripte unter `app/` (`visualization:generate:nano-banana`, `visualization:plan-batch`, `visualization:check-prompt-appends`, `visualization:prepare`, `visualization:import`) trennen Generierung strikt von Freigabe:

1. **KI-QA-Ledger (`aiApprovedAssetSha256` / Gate V):** Speichert strukturierte Prüflabels (`accepted_pilot`, `accepted_pilot_after_regeneration`, `rejected_regenerate`, `deferred_provider_limitation`, `needs_external_review`), gebunden an den exakten Datei-SHA-256.
2. **Menschliches Publikationsgate (`humanApproved`, `HR-003`):** Öffentliche Standalone-Releases und `public`-Lernzielbücher (@ref{sec:sga-goal-book}, [Menschliche Review-Gates](repo:docs/qa-ci/curriculum-package-human-review-gates.en.md)) verlangen eine ausdrückliche menschliche Fach- und Rechtefreigabe (`CC-BY-4.0` getrennt von Provenienz); bloße Generierung oder KI-Prüfung ersetzt keine Publikationsfreigabe.
