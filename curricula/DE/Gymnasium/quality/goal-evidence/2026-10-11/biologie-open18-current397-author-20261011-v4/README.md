# Current397 / Open18 – isolierter Autorenstand v4

Basis: `96f443a698c2a9c4ad631013d9449b4a1cb750c7` (vollständiger GitHub-CI-PASS vor der Vorbereitung). Dieses Paket ist ein **unfreigegebener Autorenkandidat**. Aktives Curriculum, Bilder und Qualitätszähler werden dadurch nicht geändert. Chemie bleibt pausiert.

## Tatsächlich erzeugt und geprüft

- Frische normale Whole397-Baseline und gemeinsamer Whole397-Kandidat; genau23 Seiten ändern sich,374 bleiben identisch. Keine zusätzlichen Seiten außerhalb der23.
- P18 normal materialisiert/geprüft:18 Kandidaten,0 Blocking Issues,18 `needs_human_review`,0 freigegeben. Ganze36 bilinguale Fälle; nur3 Profilkörper ändern sich gegenüber den früheren Revieweingaben.
- SourceAtlas normal build/check:397/397,24 SourceViews,0 unresolved/omitted;103 aktuelle Eingabebindungen. Die31 aktuellen Mapping-/Extraction-Träger bilden die Basis, keine alten Whole-Forks.
- Zwei normale Nativeprepare/check-Läufe:Root11 undMedical12, getrennte normale Round-A-/Round-B-Eingaben;23 tatsächliche ganze HTML-/PDF-Seiten und46 Browseransichten der Originalraster bei360/680px. Keine fehlenden Bilder/Overflow; tatsächliche PDF-Seitentitel bestätigt. Kein KaTeX-Assetbedarf in diesen Ausgaben.
-35b-Goal und sein vollständiges aktuelles P-Profil bleiben unverändert. BY550→35b ist nur ein konservativer partieller Autorenvorschlag anhand der ganzen amtlichen EA-/GA-3.1-Abschnitte; f368→440 bleibt unverändert. Genuine unabhängige Quellen-/Deckungsprüfung steht aus.
-16 geschützte Ziele aus den veralteten Autorenforks bleiben aktuell; die2 entfernten Clusterbilder bleiben entfernt. Genau4 Titel-/Beschreibungsänderungen binden die normalen Fingerprints neu. Keine blanket397-Neubindung.

## Neutrale Revieweingaben

Der vollständige Einstieg ist `RAW-FIRST.current397-open18-complete-inputs.neutral.json`. Er nennt Whole397, P18, ganze Fälle,17 gezielte Quellenzeilen und echte Primärseiten/Abschnitte, OriginalSources,23 Kontexte, tatsächliche Captures, native Batch-/Campaign-/Inputpfade und normale Prüflogs. `FINAL.neutral-inputs.freeze.json` bindet alle eigenen regulären Dateien.

ReviewerA liest nur `inputs/reviewer-A-*.neutral.json`; ReviewerB nur `inputs/reviewer-B-*.neutral.json`. Die früheren eigenen Eingabebindungen sind getrennt; frühere Urteilskörper oder Peertexte werden nicht kopiert. Zwei historische externe Eingaben sind seit dem damaligen Review technisch fortgeschrieben: gemeinsame DurationPolicy und unveränderter Normalhelper mit begrenzter Fehlermeldung. Ihre alten Hashes bleiben historisch, die aktuellen Bytes sind separat eingefroren. Unveränderte gültige wissenschaftliche Teile werden dadurch nicht automatisch neu beurteilt.

## Portable isolierte Ausführung

Die normalen Atlashelper verlangen `app/scripts/config/goal-books/...` als Book-local-Output. Diese Outputs existieren nur in der Ausführungskapsel und liegen im Paket als reguläre `frozen/execution/...`-Kopien. `inputs/portable-execution-aliases.neutral.json` nennt exakt alle Wiederherstellungsaliase.379 aktuelle öffentliche Raster werden aus dem Repository mit gebundenen Hashes regulär kopiert;18 Kandidaten liegen einmal im Paket und werden in der privaten Kapsel zusätzlich zum normalen Publicpfad kopiert. Keine Symlinks, Hardlinks, nestedRepos oder Dependencytrees.

```bash
python3 "$PACKAGE/restore_execution_capsule.py" --repository-root /home/enpasos/projects/skillpilot --capsule-root /home/enpasos/projects/skillpilot/app/tmp/NEW-PRIVATE-CAPSULE
```

`--audit-only` prüft eine vorhandene Kapsel ohne Schreiboperationen. Normale Helper verwenden die vorhandenen externen npm-Module über die Elternpfade; Node/tsx/Playwright/Fonts sind Ausführungswerkzeuge, keine kopierten Paketabhängigkeiten. Die unveränderten30 Helper und benötigten Schemas/Prompts sind exakt eingefroren. Die tatsächlichen normalen Checkerargv und Logs stehen in `checks/normal-check-runs.actual.json`.

Dieses Paket ist keine operative M7-Freigabe, keine menschliche Freigabe, kein HumanTrial und kein Nachweis tatsächlicher Lernleistungen/Experimente. Echte aktuelle unabhängigeA/B-Reviews sowie normale Whole397-/23-Kontext-V/P-QS und danach die gezielte normale Integration bleiben notwendig. Die gemeinsame DurationPolicy erfordert später auch die normale Chemie-Atlasreceipt-Ableitung; das eröffnet keine pausierte Chemie-Facharbeit.

Eigenes Lernmaterial: CC-BY-4.0, SkillPilot. Technische Dokumentation/Programme/Verträge: Apache-2.0. Rechte amtlicher und wissenschaftlicher Primärquellen bleiben unverändert; Provenanz ersetzt keine Rechte- oder Qualitätsfreigabe.
