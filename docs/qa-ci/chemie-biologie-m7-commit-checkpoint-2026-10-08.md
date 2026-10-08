# Chemie/Biologie M7: commitfähiger Zwischenstand vom 8. Oktober 2026

## Aktueller strenger Stand

| Fach | Streng abgeschlossen | Anteil | Offen | Maschineller Reifegrad |
| --- | ---: | ---: | ---: | --- |
| Chemie | 175/378 | 46,3 % | 203 | M6 |
| Biologie | 222/392 | 56,6 % | 170 | M6 |
| Mathematik | 807/807 | 100 % | 0 | M7, geschützt |
| Physik | 478/478 | 100 % | 0 | M7, geschützt |

Seit HEAD `0a463c66f2603ca72c3f288b5ddfc574447c0025` entstehen **88 neue fachliche Biologieabschlüsse und zwei neue fachliche Chemieabschlüsse**. Abschlüsse allein durch Bindungswiederherstellung: **0**. Alle bisherigen strengen Ziel-IDs bleiben erhalten. Der Biologie-Nenner steigt durch die geprüfte Aufteilung eines Ziels von 391 auf 392; Chemie bleibt bei 378. Maßgeblich sind die aktuellen IDs und Nachweise, nicht historische Summen.

Die letzten integrierten Pakete sind [Evolution mit 18 Abschlüssen](chemie-biologie-m7-evolution-eighteen-continuation-2026-10-08.md) und [Korrosion mit zwei Abschlüssen](chemie-biologie-m7-corrosion-two-continuation-2026-10-08.md). Der zentrale Bericht ist tatsächlich mit Exit 0 und ohne zentrale Blocker abgeschlossen. CQR-303 bleibt für beide Fächer wahrheitsgemäß `warn`; das vollständige M7-Ziel ist offen. Mathematik-Canon, Physik-Canon, Reifegrad-Policy und bestehendes In-flight-Ledger bleiben bytegleich zu HEAD.

## Abgeschlossene lokale Prüfungen

- Vollständiges `python scripts/validate_schemas.py`: **43.240 Dateien, alle bestanden** am endgültig beruhigten Arbeitsstand.
- Vollständiger `npm --prefix app run build:application`: **Exit 0**; alle vier Lernzielbücher verifiziert, TypeScript und Vite bestanden. Die Biologieausgabe enthält 392 Seiten, die getrennte Chemie-Atlas-Ausgabe 359. Diese Atlaszahl ersetzt den M7-Nenner 378 nicht.
- Memory-Berichte, aktueller Curriculum-Status und sämtliche neun geschützten Reifegrad-Untergrenzen: **Exit 0**.
- Gewöhnlicher KI-Inventarcheck und Prüfung des erzeugten lokalen Artefakts: **Exit 0**. Gemessene Bildzahl 1.913 → 1.931: 18 neue Biologiebilder sowie ein JPEG/PNG-Austausch; das ursprüngliche Chemie-JPEG bleibt in allen drei Assetwurzeln erhalten.
- Gewöhnliche Prüfung commitfähiger Symlinks, Symlink-Regression und `git diff --check`: **Exit 0**.

Die vorherigen unterbrochenen Läufe und der anschließende Sperrenfehler bleiben als Diagnose erhalten. Nach bestätigtem Prozessende wurde nur die nachweislich leere Build-Sperre entfernt. Der danach vollständig beendete Build und seine tatsächlich positiven Abschlussbelege sind maßgeblich. Es wurden keine Schema-, Validator- oder Ignore-Ausnahmen eingeführt. Generierte Python-Bytecodeänderungen sind auf HEAD zurückgesetzt.

## Offene Kandidaten und Fortsetzung

Die angefangenen Biologie-Stoffwechsel-/Ökologieprüfungen sowie Chemie-Quellenpakete sind mit eigenen tatsächlichen Erst-/Folgesiegeln dokumentiert. Sie werden nicht als strenge Abschlüsse gezählt. Zwei verbleibende P17-Fokusfelder wurden gezielt und unabhängig bereinigt; acht weitere Quellenrollen bleiben A-seitig PENDING. Die drei BW-Versuchspflichten behalten echte HOLDs für die konkrete fachliche Verfahrensbindung; partielle Prozessbeiträge und Locatorfixes sind keine vollständige praktische Quellenfreigabe. Beim Chemie-Viererpaket bleiben die HE-/TH-Rollengrenzen und das abgeschlossene Quellenpaar sowie finale D/P/V offen.

Das begonnene neue Biologie-Bildpaket enthält zwei gesicherte PNG-Kandidaten und drei Prompts. Die Gärdarstellung bleibt wegen tatsächlich offener Gasauffanggefäße HOLD; das Endokrinbild ist nur ein Autorenkandidat. Ein drittes Generierungsergebnis ist nicht gesichert. Kein Kandidatenbild wurde aktiv integriert oder unabhängig freigegeben. Die nächste Arbeit führt die tatsächlich geklärte Teilmenge zu aktuellen nativen D/P/V-Nachweisen und behandelt die offenen Quellen- und Atomaritätsbefunde separat.

Offizielle PDF-Arbeitskopien bleiben gemäß AGENTS lokal. Die amtlichen URLs und strukturierten Extraktionsstände sind die dauerhafte Referenz; ein cacheabhängiges historisches Authorsiegel wird nicht als portable operative Freigabe verwendet.

Der Zwischenstand ist lokal commitfähig. Menschliche Prüfung, Freigabe, Erprobung und Release-Gates bleiben getrennt. Es wird keine neue GitHub-CI-Abnahme, kein Commit, Push, Deployment oder Veröffentlichung behauptet.

## Aktuelle Belege

- [Abschlussmanifest](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie175-biologie222-commit-checkpoint-root-20261008-v1/commit-ready-checkpoint.actual.json)
- [Aktueller zentraler Fünf-Gate-Bericht](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-two-reviewed-active-integration-root-20261008-v1/affected-central.stdout.actual.txt)
- [Aktuelle ID-Mengen und Nettozuwachs seit HEAD](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie175-biologie222-commit-checkpoint-root-20261008-v1/actual-current-id-net-growth-since-head.json)
- [Endgültige vollständige Schemavalidierung](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie175-biologie222-commit-checkpoint-root-20261008-v1/final-settled-worktree-full-validate-schemas.terminal.actual.json)
- [Vollständig abgeschlossener Build](../../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie175-biologie222-stable-layer-a-root-20261008-v1/stable-full-application-build-after-empty-stale-lock-recovery.terminal.actual.json)
