# Neunerpaket: validierte zweite Runde, weiterhin kein D-Abschluss

Stand: 24. September 2026. Diese Fortsetzung ergänzt die frühere
`reconciliation-readiness.md`: Unter `round-b/results/` liegt inzwischen eine
abgeschlossene zweite, von Runde A getrennte Reviewrunde. Der native
`validateGoalDescriptionReviewCampaignResults.ts` bestätigt für A und B jeweils
neun gültige Records. Die ursprünglichen A- und B-Records sowie ihre Run-Receipts
bleiben unverändert.

Der Paketcheck `quality:goal-description-rollout-batch -- check` scheitert
aktuell schon an der PDF-Bytebindung: `bundle/manifest.json` erwartet für
`bundle/book.pdf` 893294 Bytes und
`sha256:839e6e93aa174dd0f6ae6155a56cc5d176dae8e50c7ba7c2efb116b3a328e565`;
die lokal vorhandene Datei hat 895669 Bytes und
`sha256:773c5034b08f73b8bff6ff663abf56d476c190226328dc9d8e2b864f27bbb065`.
Das erwartete PDF wurde unter den PDF-Dateien des Repositories nicht gefunden.
Ein Hash-Tausch wäre keine fachliche Prüfung. Solange der exakte gebundene
Reviewstand nicht wiederhergestellt oder eine neue vollständig geprüfte
Seitenbindung hergestellt ist, wird daraus weder eine Dual-Summary noch eine
strenge Resolution materialisiert.

## Zielweise Synthesegrenze

| Ziel | A / B | Aktueller Umgang |
| --- | --- | --- |
| `8064088b…` Kreis/Kreisteile | `split_review` / `split_review` | HOLD: Umfang und Flächeninhalt sowie Titel-/Beschreibungsspanne brauchen eine Strukturentscheidung. |
| `59d5a330…` Prismen | `split_review` / `split_review` | HOLD: Oberfläche und Volumen sind getrennt prüfbar. |
| `74d29d0c…` Pyramide/Kegel | `split_review` / `keep` | HOLD: Atomaritätsdissens bleibt ungelöst. |
| `1ea06c0c…` Kugel | `split_review` / `split_review` | HOLD: Oberfläche und Volumen samt unterschiedlicher Skalierung sind getrennt prüfbar. |
| `4cba85d3…` Tangensquotient | `keep` / `keep` | Hier keine Arbeit: nach korrigierter BW-Quelle bereits separat im aktuellen V2-Einzelpaket registriert. |
| `7feaaebd…` Extremstellen | `keep` / `keep` | Inhaltlich enges D-Kandidatenziel; benötigt die exakte aktuelle Paketbindung und eine gültige formale Synthese. Der frühere B-Kandidateninhalt mit falschen Fingerprints wird nicht benutzt. |
| `ccfd4e60…` Exponential-/Polynom-Schar | `split_review` / `keep` | HOLD: Breite von Summe, Produkt und Verkettung fachlich entscheiden. |
| `0e8417d7…` Integrale verknüpfter Funktionen | `split_review` / `block` | HOLD: Reichweite der Integralforderung und Quelle vor Text- oder Strukturentscheidung klären. |
| `e33e75e3…` Transformationsschar | `keep` / `keep` | Inhaltlich enges D-Kandidatenziel; benötigt die exakte aktuelle Paketbindung und eine gültige formale Synthese. |

Bis zu dieser Bindung und den betroffenen Synthesen sind die zwei passenden
KEEP-Paare lediglich Kandidaten. Aus diesem Paket werden **null** zusätzliche
strenge Abschlüsse, **null** wiederhergestellte Bindungen und keine menschliche
Freigabe behauptet.
