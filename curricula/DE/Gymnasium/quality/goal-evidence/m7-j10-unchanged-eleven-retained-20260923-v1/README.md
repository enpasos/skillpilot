# Mathematik M7 – elf unveränderte J10-P-v2-Records

Dieses Teilpaket erhält die elf durch die sieben Textänderungen **nicht betroffenen** P-v2-Records aus `m7-j10-functions-equations-20260923-v1` zeilenweise byteidentisch. Das Skript bindet die historische Quelldatei an SHA-256 `87389f60939c7a5da10765d5807e65381b838102cbf8a31d05881db9f5d0fdea` und kopiert nur exakt die elf konfigurierten IDs; es schreibt keine neuen Profilfingerprints und bewertet die Ziele nicht erneut. Der ursprüngliche `reviewId` und der ursprüngliche `needs_human_review`/`ai_candidate`-Status bleiben erhalten.

Enthalten sind zehn bereits D-KEEP/KEEP-aufgelöste J10-Ziele und `1a18dbb3`, dessen D-SPLIT-Frage weiterhin offen ist. P-Gültigkeit ist keine D-Freigabe. Das Paket und das neue Siebenerpaket ersetzen zusammen die bisherige 18er-Config in einer künftigen zentralen Registry-Integration; diese Datei nimmt jene Änderung nicht vor.

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-unchanged-eleven-retained-20260923-v1/retain-records.mjs
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-unchanged-eleven-retained-20260923-v1/positive-evidence.config.json
```

Lokaler Check: elf konfiguriert, elf aktuelle KI-Kandidaten, null approved, null blockierende Probleme.
