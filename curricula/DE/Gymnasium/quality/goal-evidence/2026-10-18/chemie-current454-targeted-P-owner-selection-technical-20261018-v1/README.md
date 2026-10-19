# Inaktive technische P-Ownerauswahl — 454 Ziele

**Vorbereitet, nicht aktiviert.** Die 31 bereits mit den Produktionsfunktionen geparsten Nachfolger aus `LATEST.selected-candidate-state.pending.json` werden ohne Änderung ihrer Record-Zeilen ausgewählt. Alle behalten `needs_human_review`, `ai_candidate`, Reviewidentität, Zeitpunkt und leere `reviewRunIds`. Diese Arbeit ist keine erneute fachliche P-Runde und erzeugt keine wissenschaftliche Stimme oder Humanfreigabe.

## Eindeutige Auswahl

| Teil | Ergebnis |
|---|---|
| Ganze unveränderte alte Configs und Recorddateien | 136 weiterverwendet |
| Alte Configs mit verbleibenden Ownern | 15 Restconfigs; ausschließlich exakte ursprüngliche Record-Zeilen |
| Entleerte alte Scopes | Acht nicht mehr ausgewählt |
| Neue P-Nachfolger | 31 unveränderte Native-Input-Zeilen in vier Configs |
| Alte unveränderte Owner | 423 ganze Originalzeilen mit ursprünglichem `reviewId`, Status, Reviewer und Zeitpunkt |
| Künftige Gesamtauswahl | 155 Configs, genau ein Owner für jedes der 454 gewöhnlichen Inhaltsziele |

Restdateien enthalten keine außerhalb ihres Configscopes liegenden Zeilen. Die ausgewählten Referenzen auf Run-Manifeste werden erhalten; tatsächlich referenziert der gegenwärtige Bestand keine. Es wurden keine Run-IDs oder Manifeste erfunden.

## Zwei Fingerprints, vier originale Kriterienpfade

29 Nachfolger verwenden `sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835`, zwei verwenden `sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be`.

Die alten ausgewählten Configs binden jedoch vier tatsächliche Dateipfade: je zwei bytegleiche Pfade innerhalb jeder Fingerprintgruppe. Insbesondere bleiben der vorhandene Kriterienpfad von 25729 im Acid-Analytics-Paket und der von 197 im Q2-Naturstoffe-Paket erhalten. Deshalb gibt es vier Configs unter den zwei Fingerprintgruppen, mit Gruppengrößen 28+1 und 1+1. Kein Pfad wurde auf einen vermeintlich einheitlichen Kriterienvertrag umgestellt.

Die vier neuen Splitatome übernehmen den tatsächlich vorhandenen Kriterienpfad ihres Elternträgers: dc146 von a378, b732 von 223e, 8e6 von 31cc und 69f2 von 8721. Der genaue Nachweis steht in `CRITERIA.two-fingerprints-four-exact-original-paths.json`.

## Tatsächliche technische Prüfung

Alle vier exakten Pfad-Configs wurden mit dem unveränderten `positiveGoalEvidenceReview.ts --mode=check` gegen den vorhandenen Kandidaten geprüft: jeweils **Exit 0**, zusammen 31 Kandidaten, keine blockierenden Befunde und kein `approved`-Record.

Eine zusätzliche technische Prüfung aller 454 ausgewählten Owner verwendet die unveränderten Produktionsfunktionen für Goal-, Input- und Profilfingerprints sowie Recordsemantik. Sie liest die tatsächlich gebundenen Bildbytes, prüft eindeutige Owner und exakte Scope-/Recordmengen. Ergebnis: keine Fehler. Alle 454 ausgewählten Records bleiben `needs_human_review` / `ai_candidate`. Das prüft den technischen Vertrag und wiederholt keine fachliche Gesamt-QS.

Bereits vorhandene Komponentenreferenzen und die ganze gemeinsame Quellen-/Profil-Lineage sind als Provenienz gebunden. Sie werden weder zu neuen Reviewstimmen noch zu 31 unabhängigen Gesamtfreigaben erklärt. Frühere eigene Autorenrollen bleiben in den referenzierten Fachpaketen offengelegt.

## Aktivierung durch Root

`ACTIVATION.positive-evidence-registry-field-CAS.pending.json` benennt die Datei und den genauen JSONpointer für ausschließlich `subjects[chemie].positiveEvidenceConfigPaths` im zentralen Rollout-Config. Die normalen kanonischen/SEM-Dateien müssen vorher dem gepinnten gemeinsamen Kandidaten entsprechen.

`config/active/` enthält nur zukünftige Configs auf normale Canonical-/SEM-Pfade. `config/candidate/` enthält die vier tatsächlich geprüften Configs auf den ausgewählten inaktiven Kandidaten. Keine dieser neuen Configs wurde registriert.

Die aktive Goalbook-Config `app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json` und ihr Inputs-Companion besitzen kein entsprechendes Feld mit der ausgewählten P-Configliste. Das vorhandene leere `evidenceReviewPaths` ist ein anderes Recordpfad-Feld und bleibt unverändert. Die CAS schreibt daher ausschließlich das zentrale P-Auswahlfeld.

Keine Normal-, Registry-, Framework-, Bild- oder Run-Änderungen, keine Vollbuilds und keine D-/CQR-/M7-/Humanbehauptung.
