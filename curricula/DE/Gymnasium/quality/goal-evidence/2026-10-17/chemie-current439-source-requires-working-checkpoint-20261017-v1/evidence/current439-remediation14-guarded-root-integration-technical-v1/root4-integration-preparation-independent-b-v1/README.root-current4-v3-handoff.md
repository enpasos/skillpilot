# Root: aktuelle Vierer-Integration V3

## Bereit und geprüft

- Staging-Probelauf: zwei echte native D4-Runden, 55 unveränderte Dateipins, kein Schreiben nach K.
- Syntheseentwurf: `node --check` bestanden. Er kopiert ausschließlich die bereits von Root geschriebenen vier Notiz-Tupel aus `J/SYNTHESIS.native4-v3.actual-root-rationales.json`, SHA256 `64533f2a86ffc935e9a091125c2716ef4cbd51a9763efd1838d12d877dccfa5e`.
- D113/P439V3-Probelauf bestanden: 113 D-Indizes, 360 Supersessions, unverändert zwei andere aktive Withdrawals; 123 P-Konfigurationen für genau 439 verschiedene Ziele. Alle übrigen 435 und auch f85/b8/188 bleiben zeilenweise bytegleich.
- Aktuelles Materialreceipt als konkreter Entwurf vorhanden: zwei tatsächlich berichtete KEEP-Urteile pro betroffenem P-Scope, aktuelle V3- und Native-Bindungen, unveränderte negative ältere Historie. Keine neue wissenschaftliche Stimme erzeugt.

Die Probeläufe und Entwürfe liegen ausschließlich in diesem neuen eigenen Ordner. Die Skripte schreiben erst mit `--apply-root` neue Dateien nach K und verweigern abweichende vorhandene Bytes oder Symlink-Durchgriffe. Es wurde kein Zentralbericht, keine Aktivierung, kein voller Gate-Lauf und keine Bereinigung gestartet.

## Identitäten für P erhalten

Das eingefrorene D4-Buch verwendet bereits die exakten Wrapper aus:

`K/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1/P439.material4-v3-only28c-author-profile-current.aggregate.jsonl`

SHA256: `eb2019c4bb61b375d2959a4c03c32c479da7a31f0ef1b4d39d44e477ec2a26f6`.

Deshalb wird ausschließlich der bisherige 28c-P14-Einzelowner ersetzt: Die V3-Zeile wird einschließlich LF exakt extrahiert (SHA256 `6f518400390d8aa12d25fd3b9fb0a327a9abf6dabc0175fe50880a05bf696e90`). Die anderen 122 P-Konfigurationspfade bleiben exakt. Der neue 28c-Owner behält `reviewRunManifestPaths: []`; die Autorzeile zitiert keine Runs.

B4-P-Datensätze/Run sowie A-FIRST und A-Bindungsbestätigung stehen separat im aktuellen korrektiven Materialreceipt. A besitzt keinen separaten nativen P4-Wrapper; ein solcher wird nicht erzeugt. Neue B-Review-IDs werden nicht in die aktiven Autorwrapper oder deren Run-Verweise eingetragen. So bleiben auch alle vier P-Wrapperidentitäten der tatsächlich geprüften D4-Seiten erhalten. Der vollständige technische Befund steht in `p-config-audit.json`.

## Root-Ausführung, strikt nacheinander

Root hat Staging und Synthese bereits zur eigenen Ausführung übernommen. Bereits erfolgreich ausgeführte Schritte nicht erneut starten.

```bash
TASK4_DRAFT_DIR=/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/root4-integration-preparation-independent-b-v1
python "$TASK4_DRAFT_DIR/stage_actual_native4_v3_root_owned.py" --apply-root
NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main' /home/enpasos/projects/skillpilot/app/node_modules/.bin/tsx "$TASK4_DRAFT_DIR/synthesize_actual_native4_v3_root_owned.mjs" --apply-root
python "$TASK4_DRAFT_DIR/prepare_prospective_D113_P439V3_root_owned.py" --apply-root
python "$TASK4_DRAFT_DIR/record_current4_v3_corrective_material_receipt.py" --apply-root
```

Die Node-Flags sind erforderlich: `K/app` und `K/app/scripts` sind Symlinks. Der Stock-Code leitet `REPOSITORY_ROOT` aus seinem Modulpfad ab; ohne erhaltene Symlinkpfade könnte er den fremden Quellbaum statt K verwenden.

Die Synthese verwendet den vom Stock-Index verlangten deterministischen Zeitwert `max(review.completedAt)+1 Sekunde`. Der neue Receipt erläutert, dass dieser Bindungswert keine beobachtete Schreibzeit der Root-Notizen ist; `createdAtUTC` gibt die tatsächliche technische Ausführung an.

## Konkrete neue K-Ausgaben

Unter `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1/native4/`:

- echte A/B-Ergebnisdateien, Dual-Summary, Root-Synthesemanifest, vier Resolutions und `resolution-index.json`;
- alle eingefrorenen Eingaben bleiben unverändert.

Unter `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/`:

- `central.current439.D113-P439V3.PROSPECTIVE.config.json`;
- `records/P4v3.28c.exact-frozen-author-whole-line.jsonl`;
- `config/P4v3.28c.exact-frozen-author-identity.config.json`;
- `RECEIPT.current4-v3-corrective-material-paired-review.json`.

Der neue Materialreceipt berichtet die tatsächlichen unabhängigen aktuellen P-Ergebnisse. Der alte Receipt mit offenen P4-Befunden bleibt bei seiner ursprünglichen R14-Bindung erhalten und wird als Historie referenziert. D-Synthese allein wird nicht als P-Nachweis ausgegeben.

Danach kann Root den angekündigten einzelnen frischen vollständigen Zentralbericht mit der **neuen** prospektiven Konfiguration ausführen. Dieser Handoff startet ihn nicht und behauptet kein M7-Ergebnis. Die beiden anderen Withdrawals sowie A/M/V und alle anderen Konfigurationsfelder bleiben exakt. Alle KI-Datensätze bleiben E1/G1 und `candidate`/`ai_candidate`; menschliche Freigabe oder Erprobung werden nicht behauptet.
