# c441: 23 unveränderte positive Nachweiszeilen technisch behalten

Dieses inerte Teilpaket enthält ausschließlich die exakte Subtraktion von c441 aus dem bestehenden P24-Eingang. Keine neue unabhängige Fachrunde, keine neue Run-Manifestdatei, keine neuen P1-Inhalte und keine aktiven Registry-/Canon-/QA-/Asset-Änderungen.

`positive23.retained.current.config.json` behält ursprüngliche reviewId, Regelversionen, Kriterien, aktuelle Landschafts-/Kindpfade und sämtliche alten Run-Verweise. Nur reviewPath, scope.goalIds und scope.label wurden gezielt auf den behaltenen 23er-Teilstand angepasst. c441 ist der einzige ausgeschlossene Goal-ID.

`positive23.exact-retained-independent-b.review.jsonl` enthält genau 23 ursprüngliche Zeilen mit identischen Bytes, Reihenfolge und Zeilenenden. Kein Neuschreiben der einzelnen JSON-Objekte. `retained23-whole-lines-profiles-config-and-native-check.actual.proof.json` bindet je Zeile Originalzeilennummer, ganze Zeilen- und Profilhashes, ursprüngliche profileFingerprint, reviewId, reviewedAt, reviewer und reviewRunIds. Alle 23 ganzen Records und Profile sind exakt unverändert.

Tatsächlicher unveränderter Produktionschecker:

```bash
npm --prefix app run quality:positive-goal-evidence -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-c441-positive-retained23-technical-preparation-author-v1/positive23.retained.current.config.json --mode=check
```

Exit 0: Configured goals 23, Approved 0, Needs human review 23, Rejected 0, Blocking issues 0. Zeit, tatsächliche Ausgabe und Terminalreceipt sind erhalten. Keine Checkschwächung oder eigene Ersatzvalidierung.

Alte P24-Config, P24-Records und Originalrun wurden nicht verändert. Root registriert später diese 23 plus eine separat aktuelle und unabhängig geprüfte c441-P1-Bindung. Dieses Paket erteilt weder c441-Freigabe noch neue Science-/Human-/M7-Freigabe. strict-Zuwachs 0.
