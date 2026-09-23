# Mathematik M7 – sechs unveränderte B046-Nachweise

Das neue PNG-Delta bewertet `8823e26e` aktuell neu. Die übrigen sechs Ziele aus dem bisherigen B046-Siebenerpaket sind unverändert. Dieses Teilpaket bewahrt ihre P-v2-Records **zeilenweise byteidentisch**, einschließlich des ursprünglichen `needs_human_review`/`ai_candidate`-Status; es prüft sie nicht erneut und führt keine menschliche Freigabe ein. Der neue D-Teilindex referenziert die sechs unveränderten alten Auflösungen mit ihren bestehenden Digests. Das alte Siebenerpaket und sein Index bleiben historische, unveränderte Originale, werden aber in der zentralen Registry ersetzt.

`retain-b046-records-and-index.mjs` bindet beide Quellen an SHA-256, kontrolliert die exakte 6+1-Partition und erzeugt nur die neuen Teilartefakte. Das separate B012-Zweierpaket besteht ausschließlich aus den zwei weiteren neu bildgebundenen Zielen und benötigt kein altes Restpaket.

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-b046-unchanged-six-retained-20260923-v1/retain-b046-records-and-index.mjs --check
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-b046-unchanged-six-retained-20260923-v1/positive-evidence.config.json
```
