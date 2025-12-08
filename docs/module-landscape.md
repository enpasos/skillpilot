# Modul-Mapping als JSON-Landschaft

Diese Anleitung beschreibt, wie wir ein Universitätsmodul (z. B. TUM CIT573018) in das bestehende Landscape-Format übernehmen. Das Vorgehen lässt sich für andere Hochschulen übertragen.

## 1. ID-Schema („Identifier Tile“)

Wir verwenden sprechende IDs, die Location, Bildungstyp und Fach zusammenfassen:

| Schema | Bedeutung | Beispiel |
| --- | --- | --- |
| `DE_HES_S_GYM_2_PHYSIK` | Land=Deutschland, Bundesland=Hessen, Bildungstyp=School, Schulart=Gymnasium, Stufe=Oberstufe (2), Fach=Physik | (Hessen GyO Physik) |
| `DE_BAY_U_TUM_CIT513018` | Land=Deutschland, Bundesland=Bayern, Bildungstyp=University, Institution=TUM, Modulcode=CIT513018 | (TUM Modul) |

**Regeln**
1. Präfix nach ISO-Codes (Land, Bundesland).
2. `S` für School, `U` für University, weitere Typen können folgen (z. B. `V` für Weiterbildung).
3. Danach Level oder Organisation (`GYM`, `HS`, `FH`, `TUM`, `LMU` …).
4. Abschluss mit einem stabilen Fach-/Modulkürzel (`PHYSIK`, `INF`, `CIT513018`).
5. Diese Zeichenfolge wird:
   - als Dateiname verwendet (`landscapes/DE_BAY_U_TUM_CIT513018.de.json`),
   - in `landscapeId` hinterlegt,
   - für Goals präfixiert (z. B. `DE_BAY_U_TUM_CIT513018_G1`).

## 2. Datenquellen sammeln

1. Modulbeschreibung öffnen (z. B. TUM Online Link).
2. Informationen extrahieren:
   - Titel, ECTS, Sprache, Pflicht/Wahl, Prüfungsform.
   - Lernziel-Formulierungen („Die Studierenden können …“).
   - Inhalte/Strukturabschnitte (z. B. Teilgebiete, Praktikumsteile).
   - Empfohlene Vorkenntnisse.

## 3. JSON-Struktur vorbereiten

Wir folgen dem bestehenden `LearningLandscape` Schema (`meta` + `goals`):

```json
{
  "landscapeId": "DE_BAY_U_TUM_CIT513018",
  "locale": "de-DE",
  "subject": "Informatik",
  "title": "Modul CIT513018 – Beispiel",
  "description": "Modulbeschreibung …",
  "filters": [
    { "id": "BSc", "label": "Bachelor" },
    { "id": "MSc", "label": "Master" }
  ],
  "goals": [
    { "...": "..." }
  ]
}
```

### Goals anlegen
1. **Cluster-Goal** für das gesamte Modul (`contains` = alle Lernziele, `requires` = Vorkenntnisse).
2. **Atomic Goals** pro Lernzielabschnitt.
3. Attribute:
   - `phase`: z. B. „Modul“ oder Semesterangabe.
   - `area`: Themengebiet (z. B. „Software Engineering“).
   - `tags`: `["ects:6", "semester:3", "level:MSc"]`.
   - `requires`: sowohl interne Abfolge als auch externe Vorkenntnisse (`DE_BAY_U_TUM_INF1001_G1` o. ä.).

Beispiel für ein Atomic-Goal:

```json
{
  "id": "DE_BAY_U_TUM_CIT513018_LO1",
  "shortKey": "tum_cit513018_lo1",
  "title": "Grundlagen des Moduls erläutern",
  "description": "Studierende können ...",
  "core": true,
  "phase": "Modul",
  "area": "Einführung",
  "weight": 1,
  "tags": ["ects:6", "language:de"],
  "contains": [],
  "requires": [],
  "examples": ["Übung 1", "Klausuraufgabe 2024/1"]
}
```

## 4. Dateien ablegen

1. Datei unter `landscapes/DE_BAY_U_TUM_CIT513018.de.json` erstellen.
2. `git add` & `git commit`.
3. Backend lädt beim Start automatisch alle JSON-Landschaften (`LandscapeService`).

## 5. Prüf-Checkliste

- [ ] `landscapeId` entspricht Schema.
- [ ] Jede `goal.id` einzigartig.
- [ ] DAG-Regeln eingehalten (`contains`/`requires` keine Zyklen).
- [ ] Tags für Filter (ECTS, Semester, Level) gesetzt.
- [ ] Cross-Landscape-Dependencies im Format `LANDSCAPE_ID:GOAL_ID`.
- [ ] Datei über `npm run build` / Backend-Neustart getestet (Landschaft erscheint in Breadcrumb).

## 6. Erweiterungen

1. **Metadaten erweitern**:
   - Prüfungsform (`exam: schriftlich 90min`),
   - Modus (`mandatory/elective`),
   - Literaturhinweise.
2. **Automatisierte Pflege**:
   - Parser bauen, der TUM-HTML/PDF → JSON konvertiert (z. B. mit Python + BeautifulSoup).
3. **Verlinkung**:
   - Module mit School-Landscapes verknüpfen (`requires: DE_HES_S_GYM_2_MATHE_G7`), um Brückenkurse abzubilden.

Mit diesem Blueprint kann jedes Modul (TUM oder andere) konsistent im Landscape-System gepflegt werden.
