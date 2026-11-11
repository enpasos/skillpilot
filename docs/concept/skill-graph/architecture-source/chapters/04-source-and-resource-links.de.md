## Quellen- und Ressourcenlinks {#sec:sga-source-resource-links}

SkillPilot setzt für externe Lernmaterialien ein striktes Umkehrprinzip durch: **„Content referenziert das Curriculum; das Curriculum wählt keine Anbieter aus.“**

### Dreiteilung der Linkzwecke und hartes Kernverbot {#sec:sga-srl-split}

| Mechanismus | Träger | Zulässiger Zweck & Grenzen |
| --- | --- | --- |
| **Amtliche Curriculum-Provenienz** | `sourceRef` sowie `resourceLinks` vom Typ `curriculum` | Rückverfolgung kanonischer Ziele auf amtliche Lehrpläne, Verordnungen und Fundstellen (@ref{sec:sga-source-rationales}). |
| **Eigene Zielvisualisierungen** | `resourceLinks` mit `type: "goal-visualization"` | Optionale kuratierte 16:9-Begriffsillustrationen in eigener SkillPilot-Verantwortung (@ref{sec:sga-goal-visualizations}). |
| **Externe Lernmaterialien** | Optionale Pakete unter `content/` (@ref{sec:sga-content-integration}) | Anbieterspezifische Lehrwerke, Simulationen, Videos und Aufgabensammlungen, die stabile kanonische `goalId`s von außen referenzieren. |
{cols="24%,30%,46%"}

Verbindliche Regeln:

- **Keine neuen Drittanbieter-Links an kanonischen Zielen:** Kanonische `SkillLandscape`-JSON-Dateien dürfen keine externen Lehrbuch-, Video- oder Übungsplattform-Links in `resourceLinks` aufnehmen. Frühere Migrationsstände zu Übungslinks dienen ausschließlich als historische Provenienzevidenz und nicht als Vorlage für neue Anbieterlinks im Kerngraphen.
- **Datenschutzsichere Plain-URLs & ehrliche Coach-Grenze:** Ausgespielte Links müssen trackingfreie Plain-URLs ohne Lernenden- oder Sitzungs-IDs sein. KI-Coaches dürfen angebotene Links als optionale Vertiefung nennen, aber **niemals** behaupten, nicht abgerufene externe Webseiten gelesen zu haben.
