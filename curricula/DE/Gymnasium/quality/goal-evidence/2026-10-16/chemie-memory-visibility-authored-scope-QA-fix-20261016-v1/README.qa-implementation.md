# Memory-QS: Kursprofil der Erwerbssicht

Die Sichtbarkeitsprüfung löste `target` und `prerequisiteOnly` bereits mit der richtigen Spezifität auf. Anschließend zählte sie jedoch auch LK-Ziele aus breiten Teilbäumen einer GK-View. Der gezielte Fix verwendet für Ursprung- und Memory-Ziele denselben vorhandenen `goalMatchesFilters`-Helfer mit `view.scope.courseProfile`, den die Lernansicht verwendet.

Die Regression war vor der Korrektur tatsächlich rot (`2 !== 1`) und danach grün. Die vorhandenen Rollen-, Physikbaum- und hessischen Mathematik-Q2.1-Prüfungen bestanden ebenfalls. Der vollständige M436-Check gegen den unveränderten, versiegelten Chemie-Autorenkandidaten zählt anschließend 4 statt 18 Sichtbarkeitslücken. Die 14 entfallenen Meldungen betreffen LK-Ziele in GK. Die vier echten Lücken bleiben blockierend: Löslichkeitsgleichgewichte in HE-GK (CrossStage und SekII) und Arrhenius in HE-LK (CrossStage und SekII). Der Check endet deshalb weiterhin korrekt mit Exitcode 1.

Ein zunächst versuchter Filter auf allen rohen Kurs-/Landes-/Dauermetadaten wurde verworfen: Er erzeugte 56 Meldungen, weil rohe historische Landesbindungen die vom Stock-Compiler ergänzten `memory-review-origin`-Bindungen noch nicht enthalten. Code, Fixture-Lauf und tatsächlicher Fehlversuch sind als `ATTEMPT1` erhalten. Die endgültige Änderung beschränkt sich auf das belegte Kursprofilproblem. Landes-, Dauer- und Stage-Regeln werden dadurch nicht umgedeutet.

Keine Ziele, Quellen, Karten, Memory-Entscheidungen, Views oder generierten Statusberichte wurden geändert. Das ist eine technische QS-Korrektur; sie bescheinigt keine fachliche M7-Freigabe und keine menschliche Prüfung. Die echten vier Lücken werden separat als Autorenkandidat bearbeitet.

## Reproduktion

`npm --prefix app run test:composition-projection-roles`

Für die tatsächlichen M436-Vergleichsläufe wurde der jeweilige exakte Modulstand (`BEFORE.memoryCardReview.ts` beziehungsweise `AFTER.memoryCardReview.ts`) in einer privaten Overlay-Struktur unter `tmp/chemie-m7-resumed-20261016/memory-scope-QA-validation-only/app/scripts/memoryCardReview.ts` ausgeführt. `app/src` verweist auf die unveränderten Produktionshelfer, `curricula` und `app/public` nur lesend auf die versiegelte Autorenkapsel. Sämtliche Eingabepfade und Digests stehen im Ergebnis. Kommando:

```bash
node --preserve-symlinks --preserve-symlinks-main app/node_modules/tsx/dist/cli.mjs \
  tmp/chemie-m7-resumed-20261016/memory-scope-QA-validation-only/app/scripts/memoryCardReview.ts \
  --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-prospective-M436/M436.author-candidate.config.json \
  --mode=check
```

Kein `--write-report`, kein `--write-fingerprints`, kein vollständiger Build oder erneuter fachlicher Gesamtbericht.
