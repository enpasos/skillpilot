<!-- SPDX-License-Identifier: Apache-2.0 -->
# Vier Chemie-Ziele: tatsächliche native duale Vertragskorrektur v4

Diese enge technische Fortsetzung verwendet getrennte `campaignId` für die beiden unabhängig blinden Runden A/B. Der Produktionsvertrag `validateGoalDescriptionReviewDualRound.ts` verlangt diese Verschiedenheit zusätzlich zu getrennten `roundId` und `independenceGroupId`. Die ursprünglichen v2/v3 bleiben unverändert erhalten.

Der generische Schreiber persistiert native Buffer als tatsächliche rohe Bytes. Beide Dateien enthalten vier echte JSONL-Zielzeilen mit exaktem bereits deklariertem `batchInputFingerprint` und Schema-SHA. Beide individuellen nativen Kampagnen bestehen; die tatsächlichen dualen Metadaten sind vollständig, unterschiedlich und an denselben ganzen Review-Eingang gebunden. Es gibt keine vom Autor erzeugten Records, Run-Manifeste oder fachlichen Freigaben. Die native Prüfung der tatsächlichen unabhängigen Ergebnisse folgt nach deren Fertigstellung.

`independent-neutral-review-entry.json` führt zu den unveränderten versiegelten fachlichen v2-Inputs und den endgültigen lokalen leeren Runden. Nur zwei Kampagnen-IDs sind neu; Round-/Independence-IDs und fachliche Fingerprints bleiben exakt. Ziele, Profile, Fälle, Seiten und Bildbytes sind unverändert. Strenger Fortschritt und fachlicher Zuwachs bleiben 0.
