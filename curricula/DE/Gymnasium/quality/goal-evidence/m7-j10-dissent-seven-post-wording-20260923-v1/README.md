# Mathematik M7 – J10: sieben aktuelle P-v2-Kandidaten nach Textpräzisierung

Dieses unveränderliche Teilpaket ersetzt **nur** die sieben durch kanonische DE-/EN-Textänderungen stale gewordenen P-v2-Records des historischen 18er-Pakets. Es wurde gegen die aktuellen sieben Zieltexte, direkten Voraussetzungen, Bildbindungen und das fachliche P-v2-Kriterium geprüft. Die historischen Records und die elf unveränderten Profile bleiben unverändert. Es gibt **keine** zentrale Registry-Änderung, D-Auflösung, GoalBook-Freigabe, menschliche Freigabe oder Behauptung über Lernende.

| Ziel | Fachliche Reprüfung der beiden Fälle und der Profilbindung |
| --- | --- |
| `31207307` | Konstanter Faktor bei gleichen Schritten, Wachstum und Zerfall sowie begründete Zuordnung einer Exponentialfunktion; Tabellen- zu Graphtransfer bleibt passend. |
| `c74d0c7e` | Parameter einer **Funktionsgleichung** `f(t)=b·a^t` aus Werten bzw. Term bestimmen und deuten. Die frühere Begründung mit „Exponentialgleichungen“ war falsch; der Profilkörper verlangte bereits kein Lösen solcher Gleichungen. |
| `3c1d6ce7` | Exakte Umkehrung und digitale Näherung bleiben; der zweite Fall prüft jetzt außerdem Basis `1` und negatives Argument als unzulässig, damit die neuen expliziten Logarithmusbedingungen beobachtbar sind. |
| `3010d965` | Profil spricht nun von linearer **Änderung** statt nur Wachstum; Zunahme und Abnahme werden durch konstante Differenz gegen konstanten Faktor abgegrenzt. |
| `1ce8af38` | Einfache Polynomterme und Graphen werden in beiden Richtungen über Nullstellen, Endverhalten und weitere prüfbare Merkmale zugeordnet. Keine vollständige Kurvendiskussion oder eindeutige Rekonstruktion aus zu wenig Merkmalen. Der getrennt dokumentierte GoalBook-/Scope-Grenzfall bleibt offen und wird hier nicht entschieden. |
| `ad66009f` | `x³` liefert einen tatsächlichen Vorzeichenwechsel von `f″`; `x⁴` widerlegt die bloße Nullstelle als Wendekriterium. Das prüft genau die korrigierte Zielbedingung. |
| `f76d00dc` | Direkter Fall prüft `f′>0` und `f′<0` auf einem Intervall; der Transfer mit `x³` und `-x³` widerlegt beide strengen Umkehrungen an einer Ableitungsnullstelle. |

Die Profile bleiben `status: needs_human_review`, `reviewAuthority: ai_candidate`, `E1/G1`, ohne gebundene Review-Runs. Dies ist der wahrheitsgemäße P-Nachweisstatus; M7 ist eine getrennte maschinelle Entscheidung. `1a18dbb3` ist im anderen, bytegenau erhaltenen Teilpaket enthalten, aber sein D-SPLIT-Fall bleibt offen.

Reproduktion:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-dissent-seven-post-wording-20260923-v1/author-candidates.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-dissent-seven-post-wording-20260923-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-dissent-seven-post-wording-20260923-v1/positive-evidence.candidates.json --write
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-j10-dissent-seven-post-wording-20260923-v1/positive-evidence.config.json
```

Lokaler Check: sieben konfiguriert, sieben aktuelle KI-Kandidaten, null approved, null blockierende Probleme.
