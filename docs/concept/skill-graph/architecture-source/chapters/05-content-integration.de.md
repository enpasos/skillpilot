## Contentanbindung: Architekturrahmen {#sec:sga-content-integration}

Dieses Kapitel definiert den verbindlichen Architekturrahmen v1.1 (Product-Owner-Entscheidung vom **21. September 2026**, GitHub Issue `#50`; PoC- und Ausbaudetails unter [Physik-Libre-PoC](repo:docs/dev/content-integration-physik-libre-pilot.md), [PoC-Betrieb](repo:docs/dev/content-integration-poc.md) und [Content-Pakete zu Issue #54](repo:docs/dev/content-packages-issue-54.md)).

### Dreischichtige Entkopplung und persönliche Auswahl {#sec:sga-ci-layers}

```text
Kanonischer Skill-Graph (anbieterneutrale goalIds)
        ^
        |  von aussen referenziert ueber content/-Pakete
Optionale Contentlink-Pakete (Lehrwerke, Simulationen, Aufgaben)
        ^
        |  pro Lernendem ueber normale SkillPilot-ID gewaehlt
Persoenliche Materialauswahl (Cockpit & Coach, jederzeit abschaltbar)
```

Verbindliche Architekturprinzipien:

- **Anbieterneutraler Kern:** Kanonische Landschaften enthalten und bevorzugen keine externen Lehrbuch-, Video- oder Verlags-URLs; Contentpakete unter `content/` verweisen von außen auf stabile kanonische `goalId`s.
- **Personalisierung über die normale SkillPilot-ID:** Lernende aktivieren oder deaktivieren optionale Materialpakete im regulären Cockpit-Profil ohne Sonder-Keys, Lehrer-Accounts oder Drittanbieter-Logins.
- **Betriebsschalter (Kill-Switch) & Datenschutz:** Jedes externe Contentpaket lässt sich zentral per Betriebsschalter deaktivieren, ohne kanonische Graphen oder Lernstände zu verändern. Ausgespielte Links sind parameterfreie Plain-URLs ohne SkillPilot-ID oder Tracking-Token; Drittinhalte werden nicht umlizenziert.

### Physik-Pilot und vier Abnahmekriterien {#sec:sga-ci-acceptance}

Der erste Referenzpilot bindet offen lizenzierte Physikbuch-Abschnitte (`https://physikbuch.schule/`) nach der Physik-`M7`-Stabilisierung an und wird in Issue `#54` auf Mathematik und LEIFIphysik erweitert. Jede Contentanbindung wird an vier verbindlichen Kriterien gemessen:

| Kriterium | Geforderter Nachweis |
| --- | --- |
| **1. Unveränderter Kern** | Das Abschalten oder Entfernen aller `content/`-Pakete lässt kanonische Graphen, Views, Frontier-Logik und Mastery zu 100 % unberührt. |
| **2. Persönliche Auswahl** | Lernende steuern die Sichtbarkeit über ihr normales SkillPilot-Profil ohne Sonder-Keys oder Zusatzkonten. |
| **3. Konkrete Funktion** | Aktive Links führen zielgenau auf passende Kapitel/Aufgaben und erscheinen sauber in Cockpit und Coach ohne erfundene Seiteninhalte. |
| **4. Allgemeine Tragfähigkeit** | Ein zweiter Anbieter oder ein weiteres Fach benötigt nur ein deklaratives `content/`-Paket samt Validierung, keine Kernschema-Änderung. |
{cols="26%,74%"}
