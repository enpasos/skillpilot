# Chemie/Biologie M7: commit-fähiger Zwischenstand vom 8. Oktober 2026

## Aktueller strenger Stand

| Fach | Aktuelle Abschlüsse | Anteil | Offen | Maschineller Reifegrad |
| --- | ---: | ---: | ---: | --- |
| Chemie | 177/378 | 46,8 % | 201 | M6; M7 offen |
| Biologie | 244/392 | 62,2 % | 148 | M6; M7 offen |
| Mathematik | 807/807 | 100 % | 0 | M7, geschützt |
| Physik | 478/478 | 100 % | 0 | M7, geschützt |

Gegenüber dem aktuellen Git-HEAD `eff7e5acbadc6457bff2e1d03b72108d7793f989`
beträgt der Nettozuwachs **+24 neue fachliche Abschlüsse: +22 Biologie und +2 Chemie**.
Zusätzliche strenge Abschlüsse allein durch Bindungswiederherstellung: **0**.
Die Nenner bleiben unverändert. Die tatsächlichen aktuellen Ziel-IDs und die
ursprünglichen fachlichen Delta-Nachweise sind im
[Nettofortschritt](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/current-id-net-progress-since-head.actual.json)
gebunden. Der [zentrale Bericht](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt)
ist mit Exit 0 beendet; alle sechs erforderlichen Checks je Fach bestehen,
ohne zentrale Blocker. CQR-303 bleibt für Chemie und Biologie wegen der offenen
Abdeckung unbestanden. M7 und das 100-Prozent-Ziel sind noch nicht erreicht.

Die [Fortsetzung mit den drei Stoffwechsel-Abschlüssen](chemie-biologie-m7-stoffwechsel-three-continuation-2026-10-08.md)
beschreibt die zuletzt integrierten Quellen-, D/P- und Bildreviews. Historische
Belege bleiben unverändert; gültige Atomaritäts-, Memory- und menschliche
QA-Felder werden erhalten. M7 ist ausschließlich maschinelle Curriculum-QS.

## Abschlussprüfungen dieses Zwischenstands

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Vollständige Schemavalidierung | PASS; 44.412 Dateien; Exit 0 |
| Vollständiger Anwendungsbuild | PASS; vier Lernzielbücher, TypeScript und Vite; Exit 0 |
| Normaler Lernzielbuch-Modelltest | PASS; einschließlich Quellenatlas und Offline-Eingaben; Exit 0 |
| Betroffener Backend-Projektionstest | PASS; 66 G8/G9-Zähler und 14 konkrete Split-Prüfungen; Exit 0 |
| Normale Curriculum-Symlinktests | PASS; Exit 0 |
| Geschützte Reifegrad-Untergrenzen | PASS; Exit 0 |
| Normale Bilddateiprüfung | PASS; 1953 Bildbindungen; Exit 0 |
| Normaler KI-Inventarcheck des aktuellen Bildstands | PASS; 1953 Visualisierungen, davon 1902 mit C2PA-Containermarkern; Exit 0 |
| Dokumentationslinks und abschließende betroffene Dateiprüfung | Im abschließenden Checkpoint-Nachweis gebunden |

Der vollständige Build dieses Zwischenstands ist tatsächlich ausgeführt. Die
früheren vollständigen Builds und Schemaläufe werden weiterhin nur für ihren
damaligen Stand verwendet. Die aktiven nativen Original-HTML/PDFs und elf
zusätzliche verpflichtende Atlas-Eingaben sind gezielt mit exakten Indexbytes
für den Commit vorgemerkt. Source-Caches werden im normalen Offline-Test
weggelassen. Es gibt keine zusätzlichen Ignore-Ausnahmen oder Validatoränderungen.

Die ergänzende Index-Leerzeichenprüfung meldet 30 abschließende Leerzeichen
ausschließlich in den sechs unveränderlichen nativen Original-HTMLs. Diese
Renderer-Ausgaben bleiben für ihre gültigen Erstsiegel bytegenau erhalten.
Die Meldungen sind dokumentiert und kein CI-Gate; die normale Prüfung der
aktuellen Dateiänderungen besteht. Es wurden keine Git-Prüfregeln geändert.

## CI-Korrekturen

Der aktuelle [GitHub-Lauf 37741113299](https://github.com/enpasos/skillpilot/actions/runs/37741113299)
auf dem genannten HEAD hatte zwei Fehler. Der Curriculum-Job scheiterte an
55 relativen Dokumentationslinks außerhalb des veröffentlichten `docs/`-Baums.
Die Links zeigen jetzt auf die jeweiligen Repository-Dateien bei GitHub;
fachliche Aussagen und historische Belegdateien bleiben erhalten.

Im Backend waren 14 Biologie-Erwartungswerte veraltet: Der bereits integrierte
Familienplanungs-Split ersetzt ein Atom durch zwei. Der Test prüft zusätzlich
in jeder betroffenen G8/G9-Sicht beide aktuellen Kinder und den Ausschluss des
früheren Atoms. Der betroffene normale Test besteht. Der lokale JVM-Patchstand
und der CI-Patchstand sind im Nachweis getrennt dokumentiert.

Beim abschließenden Lernzielbuch-Modelltest waren außerdem zwei BY-Atlas-Zähler
veraltet. Die bereits unabhängig geprüfte Entfernung der unbelegten
Lichtsammelkomplex-Zuordnung aus einer Chromatographie-Quelle ergibt GK 91 und
LK 121. Konkrete Ausschlussprüfungen sichern diese Quellenbegrenzung.
Der normale Git-Tracking-/Offline-Gate bleibt bestehen und ist bestanden.

Ein neuer grüner GitHub-Lauf für diese lokalen Korrekturen steht nach Commit
und Push noch aus. Dieser Zwischenstand behauptet keinen Commit, Push,
Deployment oder Veröffentlichung.

## Gesicherte, inaktive Fortsetzung

Die beiden Biologie-Basisziele `0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38` und
`32483d30-2162-50a5-a6cc-05b7f2467ab1` haben jetzt echte unabhängige Quellen-,
native D/P- und Bildreviews sowie die betroffene Wortziel-Kontextprüfung.
Die ursprünglichen Erstsiegel und Dateibindungen sind geprüft und erhalten.
Der technische D-Adopter ist vorbereitet und wurde nicht ausgeführt.
Die Kandidaten bleiben inaktiv und zählen **0** zusätzliche strenge Abschlüsse.
Die Integration muss die aktuellen 392 QA-Zeilen, die vorhandenen gültigen
P-Nachweise und die gezielte Kontext-Supersession erhalten.

Chemie B008 bleibt inaktiv. Gesichert sind die tatsächlichen gepaarten BY-/SL-
Quellenentscheidungen und zwölf Bildkandidaten: acht KEEP und vier neue PNGs.
Die drei belegten Erstfehler der neuen Bilder sind korrigiert; ursprüngliche
Versuche und Befunde bleiben erhalten. Unabhängige Bildfreigaben, vierzehn
weitere Bildrollen, normale Atlasplatzierungen, acht bestehende Kontexte und
vollständige Quellen-HOLDs bleiben offen. Die noch fehlschlagende inaktive
Atlaserzeugung wird nicht als bestandener Gate ausgegeben.

Nächster fachlicher Schritt nach diesem Commit-Zwischenstand: die bereits
unabhängig geprüften Biologie-Basisziele mit den erforderlichen aktuellen
Bindungen integrieren; anschließend die offenen Chemie-Kandidaten gezielt prüfen.
Menschliche Prüfung, Freigabe, Erprobung und Release-Gates bleiben getrennt.

## Tatsächliche Prüfbelege

- [Vollständige Schemavalidierung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/full-validate-schemas.terminal.actual.json)
- [Vollständiger Anwendungsbuild](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/full-application-build.terminal.actual.json)
- [Normaler Modelltest nach Quellen-Zählkorrektur](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/current-goal-book-model-source-scope-correction-v2.terminal.actual.json)
- [Backend-Ursache und konkrete aktuelle Projektionen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/backend-projection-ci-fix.actual.json)
- [Backend-Testabschluss](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/backend-projection-ci-fix.terminal.actual.json)
- [Dokumentationslinks: konkrete Korrekturen und Prüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/docs-links.correction-and-check.actual.json)
- [Normale Symlinktests und geschützte Untergrenzen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/portable-links-and-floors.terminal.actual.json)
- [Zusätzliche aktive Atlas-Eingaben mit exakten Indexbytes](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/exact-active-atlas-mandatory-inputs.index-staging.actual.json)
- [Inaktive Basis2-Erstsiegel und tatsächliche Bindungsprüfung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/inactive-basis2-independent-seals.actual.json)
- [Abschließender Checkpoint-Nachweis](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie177-biologie244-commit-checkpoint-root-20261008-v1/commit-ready-checkpoint.actual.json)
