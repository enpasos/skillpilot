# B040s: gezielte Wiederbindung nach Fotoeffekt-Schreibkorrektur

Stand der Erhaltungsprüfung: 2026-09-07T12:42:42.386Z. Diese Prüfung ist ein
technischer und fachlicher AI-Kandidaten-Nachweis, keine menschliche Freigabe.

## Anlass und Grenze

Die freigegebene, bereits umgesetzte Schreibkorrektur ist dokumentiert in
`curricula/DE/Gymnasium/quality/orthography/physics-fotoeffekt-2026-09-07.review.json`.
Bei `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f` wurde dadurch die alte D/P-Eingangsbindung
ungültig. Das vorherige B034-Paket enthielt zugleich 14 unveränderte Ziele.
Diese werden nicht nochmals fachlich bewertet und ihre damaligen Urteile
werden nicht durch neue Datums- oder Reviewerangaben ersetzt.

Eine neue aktuelle D-Bindung darf ausschließlich aus den zwei tatsächlich
ausgeführten B040s-Runden entstehen. Ein `block` oder `split_review` verhindert
den strikten Abschluss auch dann, wenn die ursprüngliche Textänderung nur
orthografisch war. Die vorbereitete neue P-Bindung allein schließt D nicht.
Es wurden hier keine kanonischen Ziele, Bilder, zentralen Registry-Pfade oder
In-flight-Claims verändert.

## Erhaltene Nachweise

Die lokale Erhaltungsprüfung hat per exaktem Vergleich mit Git HEAD bestätigt:

- Die drei alten B034-P-Dateien und der alte D-Index sind unverändert.
- Alle 15 im alten D-Index referenzierten Resolution-Dateien sind unverändert.
- Im neuen P-14-Ledger sind exakt die ursprünglichen 14 JSONL-Zeilen erhalten,
  einschließlich Reviewer, Zeitpunkt, Körper und Fingerprints.
- Die 14 P-Kandidatenkörper und die 14 D-Indexeinträge sind exakt die bisherige
  Teilmenge ohne `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f`.
- Der historische D-Nenner 464 bleibt im gefilterten Legacy-Snapshot erhalten;
  lediglich Teilmengenzahl 14 und daraus berechnete Quote 3,0 ändern sich. Der
  aktuelle Gesamtumfang gehört weiterhin nur in den zentralen Bericht.

Neue Dateien für die unveränderte Teilmenge:

- `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-034-stable-current-14-v1.config.json`
- Gleichnamige `.candidates.json` und `.review.jsonl`.
- `curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-034-next-unresolved-20-v1/resolution-index.stable-current-14-after-spelling-v1.json`

## Aktueller P-Eintrag

Der bestehende inhaltsspezifische Profilkörper wurde am aktuellen DE/EN-Ziel
fachlich erneut geprüft: Einphotonenmodell, materialabhängige Schwelle,
`hf = W_A + E_kin,max`, getrennte Änderungen von Frequenz und Intensität sowie
die zwei konkreten geänderten Anwendungsfälle bleiben passend. Die Bestimmung
von h wird nicht aus dem benachbarten Ziel importiert. Der Körper wurde daher
unverändert in ein neues Ein-Ziel-Kandidatenpaket übernommen und ausschließlich
mit dem nativen Materializer an den aktuellen Zieleingang gebunden.

Die Prüfstufen bleiben `needs_human_review` / `ai_candidate`; neue menschliche
Freigaben oder unabhängige P-Gegenreviews werden nicht behauptet. Die fachlichen
Referenzen der erneuten P-Prüfung stehen im neuen Kandidatenrecord. Das P-Profil
hat `reviewedResourceTypes: []` und behauptet insbesondere keine Bildfreigabe.

Neue P-Datei:
`curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-040s-photoelectric-spelling-current-1-v1.config.json`
sowie gleichnamige `.candidates.json` und `.review.jsonl`.

| Bindung | Vorher | Jetzt |
| --- | --- | --- |
| goalFingerprint | `sha256:f0083e6c119ae129adf8f4277369d48031d4935033163d1aaf8c01366534ddf3` | `sha256:862937d3f99b5d607fade16a5e1e696a0aedc73a7ccac277f2e5ffb7da6e9a5a` |
| reviewInputFingerprint | `sha256:f0a6f50aee341d4542071c57f6f3bfb8908d52f0a8bd261eb419de113b4a4e5f` | `sha256:58927aed5b31c9160249493c74360a5436f7a42ad394c8c36b1ed973fabc8ca8` |
| profileFingerprint | `sha256:d15684aaf53a27e962a244d3e7671159bd8f69fc3974adb026e9fd6315cb8447` | unverändert |

## Ausgeführte Kontrollen

- Nativer P-Kandidaten-Materializer: 14 aktuelle unveränderte Profile PASS.
- Nativer P-Kandidaten-Materializer für B040s: Schreiben eines aktuellen Profils
  PASS; anschließender Lauf ohne `--write` PASS (1).
- Nativer `validateLegacyResolutionIndexSnapshot`: PASS für die 14er-Teilmenge.
- Exakter Erhaltungsvergleich: 19 historische Dateien unverändert zu HEAD,
  14 P-Reviewzeilen byte-identisch, 14 Kandidatenkörper und D-Einträge identisch,
  neuer Ein-Ziel-P-Profilkörper identisch zum alten Körper.

Die Kampagnenvalidierung und Dual-Synthese sind getrennte Schritte; ihr
Ergebnis ist nicht Bestandteil dieser Erhaltungsprüfung. Vor zentraler
Registrierung müssen aktuelle fachliche Blocker berücksichtigt werden.
