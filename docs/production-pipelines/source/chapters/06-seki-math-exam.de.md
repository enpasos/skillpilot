## Produktionspipeline für Sek-I-Mathematikprüfungen {#sec:pp-seki-math-exam}

Dieses Kapitel definiert den geprüften Produktionsworkflow für kanonische Gymnasium-Mathematikprüfungen der Sekundarstufe I (Jahrgangsstufen 5 bis 10). Jede sichtbare Jahrgangsstufe erhält genau einen Ordner `Prüfungen Jahrgangsstufe <n>` mit einzelnen atomaren Prüfungsaufgaben darunter; weder ein Sammel-Capstone `Sek-I-Abschlussaufgaben Mathematik` noch ein pauschaler Zweig `Übungen Sekundarstufe I` darf als lernendenseitiger Routenendpunkt genutzt werden.

### Quellenhygiene und Arbeitspaket-Layout {#sec:pp-seki-hygiene}

Externe Referenzaufgaben dienen ausschließlich der Stil-, Qualitäts- und Schwierigkeitskalibrierung — niemals als Kopier-, Übersetzungs- oder Paraphrasiervorlage:

- Heruntergeladene Beispiele bleiben lokal unter `tmp/seki-math-exam-reference-pool/` (inkl. `sources.json` oder `README.md` mit URL, Anbieter, Abrufdatum, Jahrgangsbezug und Verwendungszweck) und werden **nie** in Git eingecheckt.
- Bevorzugte Referenzpools: IQB Sek I / VERA-8, Landesbildungsserver / ZSL / Lehrerfortbildungsserver, kuratierte Hochschul-/Landesdatenbanken wie SMART sowie amtliche Lehrplanseiten (keine privaten Arbeitsblätter mit unklaren Rechten, Lösungs-Scraper oder ungeprüften KI-Listen).
- Bei externen Designideen darf höchstens das abstrakte Konstruktionsprinzip notiert werden, niemals Wortlaut, Zahlen, Rahmengeschichte, Grafik oder Lösungsweg.

Gemeinsame Checkliste ist `curricula/DE/Gymnasium/assessments/mathematik/seki/quality-checklist.md`; je Jahrgangsstufe wird ein Arbeitspaket angelegt (flache Altdateien wie `j5_terminal_autonomy_v1.md` gelten nach Promotion als abgelöst):

```text
curricula/DE/Gymnasium/assessments/mathematik/seki/j5/
  blueprint.md & draft_v1.md & solution_v1.md
  internal_qa_v1.md & external_review.md
  findings.md & finding_resolution.md
  re_qa.md & release_candidate.md
```

### Zehnstufiger Gate-Workflow und Releaseregel {#sec:pp-seki-workflow}

:::table{cols="3.4cm,X",longtable=true}
| Schritt | Pflichtergebnis & Freigabe-Gate |
| --- | --- |
| **0. Referenzpool** | Mindestens zwei unabhängige hochwertige Quellfamilien unter `tmp/seki-math-exam-reference-pool/` gesichtet; keine Fremdaufgaben im Git. |
| **1. Checkliste** | `quality-checklist.md` vor Entwurfsbeginn durch Product Owner oder externes Review bestätigt. |
| **2. Blueprint** | Jahrgang, Bearbeitungszeit, abgedeckte kanonische Ziel-IDs, Leitideen/Prozesskompetenzen, Punkte-/Anforderungsmatrix, explizite Nicht-Abdeckung und Hilfsmittel dokumentiert. |
| **3. Roh-Entwurf** | Altersgerechter Kontext, zugänglicher Einstieg plus Begründungs-/Prüf-/Modellgrenzen-Impuls je Aufgabe, unabhängige Teilaufgaben ohne versteckte Annahmen (`draft_v1.md`). |
| **4. Lösung & BE** | Vollständiger Lösungsweg, transparente `BE`-Vergabe auf beobachtbare Schülerleistung, zulässige Alternativwege und typische Fehlerhinweise (`solution_v1.md`). |
| **5. Interne QS** | `internal_qa_v1.md` mit Status `pass`, `fail`, `blocked` oder `not_applicable` je Punkt; null `fail`/`blocked` in releasekritischen Abschnitten. |
| **6. Externes Review** | `external_review.md` mit positivem Votum oder konkretem Sanierungsplan für alle Blocker. |
| **7. Findings-Iteration** | `findings.md` & `finding_resolution.md`; jeder Befund ist begründet `resolved`, `accepted_risk` oder `out_of_scope`. |
| **8. Re-QS & Kandidat** | `re_qa.md` & `release_candidate.md`: Checkliste komplett, externe Blocker gelöst, Originalität und Quellenhygiene bestätigt. |
| **9. Graph-Promotion** | Kanonische Knoten aktualisieren (`examData.reviewStatus = "released"`, präzise `examData.coveredGoalIds`, exakt geprüfte `requires`), Quellen-/Rationale-Berichte erneuern und vollständige CI samt Kompositionsansichten unter `Prüfungen Jahrgangsstufe <n>` bestehen. |
:::
