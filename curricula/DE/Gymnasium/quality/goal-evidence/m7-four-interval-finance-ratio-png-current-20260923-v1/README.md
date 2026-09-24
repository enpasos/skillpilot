# Mathematik P-v2: vier aktuelle PNG-Bindungen

Dieses Paket bindet vier vorhandene, fachlich erneut geprüfte Positive-Understanding-Evidence-Profile an die **jetzt aktiven** PNGs und kanonischen Zieltexte. Die Profile selbst bleiben unverändert; neu sind die aktuelle Quellen-/Bildbindung und die begründete Prüfung, dass beide Fälle pro Ziel nicht aus dem Bild abgelesen werden können. `positive-evidence.review.jsonl` ist maschinell materialisiert, nicht menschlich freigegeben: viermal `needs_human_review` / `ai_candidate`, `reviewRunIds: []`, null `approved`. Bei grünem Checker erfüllt das das maschinelle P-Gate, nicht die davon getrennte menschliche Freigabe; M7 insgesamt ist damit noch nicht erreicht.

| Ziel | Gegenwärtiges PNG (SHA-256) | Unabhängige Profilfälle |
| --- | --- | --- |
| `4d906967-9f4b-5dc8-af7a-d403b95d61f5` | `03d3076175b836975fb9739553fd8628154895322fbfd521ec899c8533edd5df` | Vorhersage eines Umfrageanteils und einer Ausschussquote mit eigenen Zahlen; bekanntes `p` gegen künftige relative Häufigkeit |
| `5c9ac68c-3928-518c-bbe0-e044667035a6` | `08326e4e189cf65f7d7ec89bcfb8e7e6a5ea7802782de79fe3c507a7d687f3ea` | Zwei neue Stichproben samt gegebenen Konfidenzintervallen; langfristige Überdeckung statt Wahrscheinlichkeit für festen Parameter |
| `fc34449a-fbf4-574c-884f-ecdf48b42d2e` | `d48610f7051322a1a8b37eae595fcfd79c6001f0774f35a1f81d83ea00c54c8e` | Zins-Sparziel und strukturell anderer Tilgungsfall; beide mit selbstständiger Tabellenentscheidung |
| `5d9c156b-e5a4-5e91-9da3-22e858eb1f8e` | `369fc89bc95f686974e72bf41761631bd7a35b7b9e397d2ba0b6d7bccb526fa5` | Verhältnis eines gegebenen Teilpunkts (`t=1/3`) und räumlicher Richtungsvergleich bei `t=1/4` beziehungsweise `3/4` statt Bildverhältnis `2:3` |

Die gepinnten Vorbesitzer sind der **aktive** Q3-Neuner-Owner (nicht die ältere Zehnerquelle), Q4-Dreier-Owner und B029-Dreier-Owner. Ihre Dateien bleiben unverändert. Aus ihnen werden die vier Profile übernommen und die nicht umgebundenen Datensätze bytegenau als `retained-q3-seven`, `retained-q4-two` und `retained-b029-two` erhalten. Q3 enthält nur sieben statt acht Restziele, weil `e495fa38-b198-5280-a405-9e41cafd6d17` bereits zuvor in ein separates aktuelles PNG-Delta ausgelagert wurde. Die drei alten Owner dürfen erst nach Umstellung der zentralen Registry ersetzt werden; eine parallele Registrierung würde Ziele doppelt besitzen. Dieses Paket ändert die Registry nicht.

`provenance.json` dokumentiert die exakten Quell- und Ausgabe-Hashes. Das deterministische Skript `materialize-candidates-and-retentions.mjs` prüft alle gepinnten Ursprungsdateien, die vier Quellprofil-Fingerprints sowie die aktiven PNG-Dateien, bevor es Kandidaten und Retentionen erzeugt. Die P-Materialisierung berechnet Ziel-, Kriterien- und Bildbindungen aus dem aktuellen kanonischen Stand; sie setzt keine menschliche Freigabe.

Reproduktion vom Repository-Root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1/materialize-candidates-and-retentions.mjs
npm --prefix app exec -- tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1/positive-evidence.config.json
```

Dasselbe `quality:positive-goal-evidence:check` ist zusätzlich für die drei `retained-*.config.json`-Dateien durchzuführen. Lokaler Stand: alle vier fokussierten Checks ohne Blocking Issues; jeder Datensatz bleibt KI-Kandidat. Es wurden keine kanonischen Inhalte, D-Reviews, Registry-Einträge oder Bild-/QA-Dateien durch dieses Paket verändert.
