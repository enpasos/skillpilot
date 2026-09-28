# Q2-Parameterbedingungen: aktuelle D-Bindung

Dieses Paket ersetzt die zentrale Bindung der inhaltlich unveränderten
`5f90df42-8a71-534d-b995-b8f7dcaf1661`-Synthese aus v1. Die
kanonische Mathematik-Landschaft änderte sich außerhalb dieses Ziels, weil
der fachlich ungeeignete Bildlink zu `ae3483e3…` zurückgezogen wurde.
Dadurch änderte sich der vom Materializer gebundene Landschafts-Digest.
Die v1-Artefakte bleiben unverändert als zeitgebundener Beleg erhalten;
v2 wurde aus denselben unabhängigen A/B-Reviews neu materialisiert.

Der Vergleich der beiden `synthesis-decisions.json` und Resolutionen
zeigt: Ziel-Fingerprint, Review- und Buch-Fingerprints, Textentscheidung,
beide fachlichen Begründungen und die offengelegten früheren
`split_review`-Einwände sind identisch. Nur Manifest-/Resolution-IDs,
der globale Landschafts-Digest und davon abgeleitete Fingerprints
änderten sich. Das ist eine **Bindungsaktualisierung**, kein neuer
fachlicher Abschluss und keine menschliche Freigabe.

`npx tsx scripts/materializeMathM7PartialKeep.ts --config
curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-26/m7-q2-fivef-keep-current-partial-20260926-v2.config.json
--check` aus `app/` prüft weiterhin `strict D=1/9, open=8`.
Der zentrale D-Index verweist nun auf v2; die acht offenen Q2-Ziele
bleiben unverändert offen.
