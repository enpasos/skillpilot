# P-v2 nach der BY-Pflichtfach-Titelbereinigung

Status: **vier aktuelle AI-Kandidaten (`needs_human_review`, E1/G1), keine menschliche Freigabe, kein strikter M7-Abschluss.** D, V und der kanonische Graph wurden in diesem Paket nicht geändert.

Die vier Ziele `0b162cb0…`, `71fe4a39…`, `b431148b…` und `49f9059a…` erhielten kanonische Titel ohne den für das bayerische Pflichtfach irreführenden Zusatz `(LK)`. Beschreibungen, Kompetenzkern und Voraussetzungen blieben gleich. Die bisherigen P-Profile wurden dennoch gegen die aktuellen Ziele und Lehrbilder geprüft:

| Ziel | Fachlicher P-Befund |
| --- | --- |
| `0b162cb0…` | Tank-Nettoänderung `3 L`, Endbestand `13 L`; beim Geschwindigkeitsfall Ortsänderung `1,5 m`, Weg `2,5 m`. Das Lehrbild zeigt einen anderen, ausschließlich positiven Zufluss von `20 L`. Profil unverändert. |
| `71fe4a39…` | Der alte Besucherfall war im früheren JPG-Lehrbild mit genau demselben Term und allen Ergebnissen bereits gelöst. Er war als eigenständiger Prüfungsfall ungeeignet und wurde durch `h(t)=20t−5t²` für einen Ballflug ersetzt: Maximum `20 m` bei `t=2 s`, sinnvolle Flugdauer `0–4 s`, `h(5)=−25 m` nur rechnerisch, nicht physikalisch. Der Tankkapazitätsfall bleibt unverändert. Das neue, kursneutrale PNG zeigt nur schematisch Besucherzahlen und verrät keinen der beiden P-Fälle. |
| `b431148b…` | Die beiden Binomialfälle benutzen andere Parameter als das Lehrbild: `Bin(100;0,4)` erlaubt eine begründete Normalnäherung, `Bin(20;0,001)` nicht. Das bestehende bildgebundene Profil bleibt unverändert. |
| `49f9059a…` | Beide Begründungen wurden erneut geprüft: `x²/eˣ≤6/x→0` für `x→∞`; bei `t=−x` gilt `|x³eˣ|≤24/t→0` mit Annäherung von unten. Das Lehrbild behauptet nur die erste Dominanz, gibt aber keine der beiden Abschätzungen vor. Profil unverändert. |

Ein gemeinsamer bildgebundener Vierer-Review hätte die bisherige P-Bindung der drei textgebundenen Ziele ohne Not verändert und war mit dem früheren bildgleichen 71fe-Fall fachlich unzulässig. Der autoritative Vierer-Kandidatensatz `positive-evidence-four.candidates.json` wurde deshalb in drei textgebundene und einen bildgebundenen P-Review aufgeteilt. So bleibt die bisherige Bildbindung bei `b431148b…` erhalten und es wird keine Bildfreigabe für die übrigen drei behauptet. Die Bilder von `71fe4a39…` und `49f9059a…` wurden danach durch kursneutrale PNGs ersetzt; ihre separate V-Prüfung gehört nicht zu diesem P-Paket.

`materialize-retained.mts` pinnt die drei historischen Reviewdateien per SHA-256 und übernimmt die zwölf unbetroffenen Records byteidentisch in Teilmengen von 5, 1 und 6. `materialize-candidates.mts` pinnt dieselben Quellen und die vier alten Profil-Fingerprints; nur das oben begründete 71fe-Profil ändert seinen ersten Fall. `materialize-neutral-png-rebind.mts` pinnt den anschließenden Drei-Ziel-Kandidatensatz und erzeugt einen neuen, gegen die vereinfachten 71fe-/49f-PNGs und aktuellen Metadaten geprüften Drei-Ziel-Kandidaten. Die vorherigen Configs, Candidates und Reviews bleiben unverändert. Die aktive Registry enthält für jedes der vier Ziele genau einen aktuellen P-Owner.

Gezielte Verifikation:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/materialize-retained.mts
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/materialize-candidates.mts
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/materialize-neutral-png-rebind.mts
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/current-text-three-neutral-png.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/current-text-three-neutral-png.candidates.json
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/current-image-one.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1/current-image-one.candidates.json
```

Die drei Retained-Configs sowie die aktuelle bildgebundene Einer- und die neue textgebundene Dreier-Config bestanden jeweils `quality:positive-goal-evidence:check` mit null Blockern. Das ist strukturelle und fachliche AI-Kandidaten-Evidenz, keine menschliche Erprobung.
