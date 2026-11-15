# Aktuelle unabhängige Abgrenzung des Restauftrags

Die [gezielte Fach- und Platzierungsprüfung](k4-k8-review.md) bestätigt die
ursprünglichen K4-/K8-Stufenreparaturen am Commit `069fd6cf4f…`.
32 aktuelle Sichten und der Voraussetzungsschluss über 21 kanonische Wurzeln
wurden geprüft. Innere Rückgriffe bleiben ausdrücklich offen; reale Pläne
wurden nicht aktiviert. Ein Abschluss setzt weiterhin Integration und eine
frische erfolgreiche Main-CI voraus.

Der getrennte Bestandsaudit aller K1–K13/F1–F7 liegt als unveränderte
Originaldatei `remaining-work-review.md.txt` vor. Er nennt K6 und F7 als enge
Abschlusskandidaten; K4/K8 waren zum Zeitpunkt dieses Audits noch unter
Schlussprüfung. Der spätere gezielte Bericht oben beantwortet diese Frage.
Die allgemeine RC1-/Anerkennungsgrenze ist nicht geschlossen.

`retention.actual.json` bindet die ursprünglichen und gespeicherten Bytes.
Der große native 32-Sichten-Beleg ist verlustfrei komprimiert; beispielsweise
zeigt `gzip -dc current-input-and-placement.actual.json.gz` die Originaldaten.
Die Originalberichte bleiben unverändert, einschließlich ihrer historischen
TMP-Pfade. Die dort benannten Dateien `review.md` und `audit.mts` sind hier
als `k4-k8-review.md` und `audit.mts.txt` erhalten. Die relativen Links im rohen
Gesamtaudit beziehen sich auf seinen protokollierten ursprünglichen Pfad.
Sein lokaler Integrationsentscheid ist keine zusätzlich veröffentlichte
Runtime-Abnahme; der eingecheckte Platzierungsnachreview wird getrennt benannt.

Die ursprünglichen Quellen-PDFs werden nicht erneut kopiert. Ihre selbst
nachgerechneten Hashes und amtlichen Fundstellen stehen im Fachreview und in
`source-hashes.json`. Dies sind unabhängige Agentenreviews und begrenzte
automatisierte Auswertungen, keine Unterrichts- oder Produktionsabnahme.
