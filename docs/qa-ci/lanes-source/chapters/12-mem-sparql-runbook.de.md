## MEM-SPARQL-Konsistenz-Runbook {#sec:qal-mem-sparql-runbook}

Dieses Runbook bildet die operative Checkliste zur Ausführung und Triage des in @ref{sec:qal-mem-sparql} spezifizierten MEM-SPARQL-Konsistenzaudits (Erstprotokoll siehe [MEM-SPARQL-PoC vom 01.06.2026](repo:docs/qa-ci/archive/mem-sparql-consistency-poc-2026-06-01.md)).

### Audit ausführen und Queue inspizieren {#sec:qal-mem-runbook-inspect}

```bash
cd app
npm run quality:mem-sparql-consistency
cd ..
node - <<'NODE'
const q = require('./docs/qa-ci/status/mem-sparql-consistency-review-issues.json')
console.log(q.summary)
console.log(q.reviewLedger)
console.log(q.highestSignalChecks.map((i) => ({
  id: i.id, status: i.status, category: i.category,
  side: i.side, mem: i.memText, local: i.localText,
})))
NODE
```

Zur menschlichen Durchsicht dienen [mem-sparql-consistency-review-issues.md](repo:docs/qa-ci/status/mem-sparql-consistency-review-issues.md) (Queue) und [mem-sparql-consistency-audit.md](repo:docs/qa-ci/status/mem-sparql-consistency-audit.md) (Länderabdeckung und Zähler).

### Entscheidungen eintragen, Diagnostik deuten und lokal verifizieren {#sec:qal-mem-runbook-decide}

1. Eintrag aus `highestSignalChecks` oder `textTriageQueue` wählen und `id` sowie `itemFingerprint` übernehmen.
2. `memText`/`memRef`, `localText`/`localRef`, `rationale` und ggf. `reviewNote` abgleichen; lokale Extraktionsfehler direkt im `source-extraction`-Artefakt beheben.
3. Status wählen (`not_an_issue`, `local_extraction_fix_needed`, `mem_feedback_candidate`, `source_version_gap`, `deferred`), als einzeiliges JSONL-Objekt an `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.review.jsonl` anhängen und das Audit erneut starten.

Bedeutung von `reviewLedger.diagnostics` (vor einem MEM-Feedback-Durchgang bereinigen; Testdaten nur unter `tmp/` anlegen):

- `stale_review`: Eintrag existiert weiterhin, aber der Evidenz-Fingerprint hat sich geändert $\to$ neu prüfen.
- `unknownItemRecords`: Ledger verweist auf eine nicht mehr in der aktuellen Queue enthaltene `itemId`.
- `duplicateItemRecords`: Mehrere Zeilen zur selben `itemId` (die letzte gewinnt; Mehrdeutigkeit entfernen).

Lokale Verifikation nach Änderungen an Generator, Konfiguration, Extraktion oder Dokumentation:

```bash
cd app
npx eslint scripts/generateMemSparqlConsistencyAudit.ts
npm run quality:source-coverage-audit:check
cd ..
git diff --check
MEM_CFG=curricula/DE/Gymnasium/quality/mem-sparql-consistency
node -e "for (const f of [
  '$MEM_CFG/canonical-math-poc.config.json',
  'docs/qa-ci/status/mem-sparql-consistency-audit.json',
  'docs/qa-ci/status/mem-sparql-consistency-review-issues.json'
]) JSON.parse(require('fs').readFileSync(f, 'utf8')); console.log('json ok')"
```
