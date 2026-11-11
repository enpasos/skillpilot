## Curriculum-Mapping-Workbench {#sec:qal-mapping-workbench}

Während das Qualitätsdashboard (@ref{sec:qal-quality-dashboard}) anzeigt, *ob* QA-Regeln grün, gelb oder rot sind, macht die lokale schreibgeschützte **Curriculum-Mapping-Workbench** für Curriculum-Verantwortliche nachvollziehbar, *warum* ein Befund vorliegt — vom amtlichen Lehrplan-PDF bis in den lernendenseitigen SkillPilot-Baum.

```text
Route:     /curriculum-mapping-workbench
Endpunkte: /__curriculum-mapping-workbench/list
           /__curriculum-mapping-workbench/load?sourceLandscapeId=<id>
```

### Siebenteiliger Datenfluss im Repository {#sec:qal-workbench-dataflow}

Die Workbench führt sieben bestehende Artefaktschichten ohne Schreibzugriff zusammen:

1. **Quelllandschafts-Register (`curricula/DE/Gymnasium/provenance/source-landscape-registry.json`):** Identifiziert Quell-Snapshots über `landscapeId`, `jurisdiction`, Titel und Quellpfad.
2. **Amtliche PDF-Passagenextraktion (`source-extraction/*.source-extraction.json`):** Für geprüfte Curricula (z. B. `DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json` aus `kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`) zerlegt `pdftotext` das PDF nach Themenfeldern (`E.1`, `Q1.3`, `Q4.2`), entfernt Kopf-/Fußzeilen, normalisiert Deutsch nach NFC gegen Mojibake (`ä`, `ö`, `ü`, `ß`) und wandelt Formeln in Inline-LaTeX für KaTeX um.
3. **Quellziele (Source Goals):** Stammen bei vorhandener `source-extraction` direkt aus den wörtlichen Teilaspekten der amtlichen Aufzählungspunkte (inkl. Eltern-Bullet, `sourceSpan` und PDF-Seite); fehlt eine persistierte Extraktion, fällt die Ansicht auf den Quell-Snapshot (`*.de.json.snapshot`) zurück.
4. **Source-Goal-Membership-Register (`source-goal-membership-registry.json`):** Definiert als erfasst geltende Quellziele; nicht registrierte Quellziele erscheinen rot.
5. **Source-Goal-Closure-Register (`source-goal-closure-registry.json`):** Zerlegt breite Originalziele in die sie abschließenden atomaren Quellziele.
6. **Mapping- und Review-Dateien (`curricula/DE/Gymnasium/mapping/...`):** Verknüpfen `legacyGoalId` bzw. extrahierte Quellziele (`exact`, `partial` oder explizite Lückenentscheidungen in `*.review.json`) mit `canonicalGoalId`.
7. **Kanonischer Skill-Graph und Kompositionsansicht:** Verbindet `curricula/DE/Gymnasium/canonical/*.de.json` mit der passenden lernendenseitigen Ansicht unter `curricula/DE/Gymnasium/composition-views/` (sodass rechts genau der für Lernende sichtbare Baum erscheint).

### Fail-Closed-Pipeline-Gates (`MAPPING-1` bis `MAPPING-3`) {#sec:qal-workbench-gates}

Ein späterer Mapping-Schritt darf niemals als abgeschlossen gemeldet werden, solange ein Vorgängerschritt offen oder blockiert ist (`pipelineStatus` in `source-extraction`):

:::table{cols="2.6cm,3.8cm,X"}
| Gate | Bedeutung | Abschlusskriterium |
| --- | --- | --- |
| `MAPPING-1` | Amtliche Passagen extrahiert | Jedes erwartete Themenfeld ist genau einmal mit amtlichem Aufzählungstext und sauberem Deutsch-/LaTeX-Anzeigetext vorhanden. |
| `MAPPING-2` | Quellziele gebildet | `MAPPING-1` komplett, jede zieltragende Passage hat mindestens ein eindeutiges Quellziel mit Span/Eltern-Bullet/Seitenreferenz und sauberem Encoding (reine Leitfaden-Hinweise dürfen zielfrei bleiben). |
| `MAPPING-3` | Kanonische Abbildung geprüft | `MAPPING-2` komplett, jedes akzeptierte Quellziel besitzt eine geprüfte Entscheidung auf existierende kanonische Ziele und ist inhaltlich abgedeckt (`needs_canonical_goal` oder `needs_view_placement_review` zeigen Fortschritt, schließen `MAPPING-3` aber nicht). |
:::

### Zweistufiges Interaktionsmodell und Prüfinterpretation {#sec:qal-workbench-interaction}

Die Oberfläche trennt die Prüfung in zwei zweigeteilte Stufen plus Detailleiste am unteren Rand:

- **Stufe 1 (Amtliche PDF-Passage $\leftrightarrow$ Quellziele):** Links nach Themenfeldern segmentierte PDF-Passagen, rechts die zugeordneten Quellziele mit bidirektionaler Hervorhebung.
- **Stufe 2 (Quellziel-Baum $\leftrightarrow$ SkillPilot-Baum):** Links der Quellziel-Baum mit Registrierungs- und Mapping-Status, rechts die lernendenseitige Kompositionsansicht mit direkter/abgeleiteter Quellenunterstützung und wechselseitigem Scroll-Fokus; unten Detailangaben zu PDF-Seite, Quellreferenz, Closure-Atomen und Zielknoten.

:::warning{title="Grün bedeutet registriert/verknüpft — nicht inhaltlich endabgenommen"}
Ein grüner Status zeigt lediglich eine im Repository hinterlegte Registrierungs- oder Mapping-Beziehung. Die fachliche Prüffrage lautet stets, ob jedes Originalziel im PDF erfasst, jede breite Stelle sauber atomisiert, jedes Ziel semantisch passend zugeordnet und kein Bundesland-Ziel ohne legitimen Lehrplanbeleg eingeblendet ist.
:::

Aktuell aufgelöste hessische Prüfeinstiege unter `http://127.0.0.1:5174/curriculum-mapping-workbench`:

:::table{cols="2.6cm,1.6cm,3.4cm,3.8cm,X"}
| Fach | Stufe | Quellziele | Mappings | Amtliches PDF in der Workbench |
| --- | --- | --- | --- | --- |
| Mathematik | Sek I | 132 | 37 | `g9-mathematik.pdf` |
| Mathematik | Sek II | 316 persistierte Ziele | 316 geprüft / 383 Kanten | `kerncurriculum_gymnasiale_oberstufe-mathematik.pdf` |
| Physik | Sek I | 60 | 53 | `g9-physik.pdf` |
| Physik | Sek II | 376 | 376 | `kerncurriculum_gymnasiale_oberstufe-physik.pdf` |
:::
