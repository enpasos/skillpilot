# 7d37513b: P-v2 nach dem 6b-Kompatibilitäts-Retirement

Status: **aktueller AI-Kandidat (`needs_human_review`, E1/G1), keine menschliche Freigabe, keine D-/V-Freigabe und kein M7-Abschluss.**

Die frühere 6b-Voraussetzung war ein zu breites, inzwischen fachlich als Dublette bereinigtes LK-Sammelziel. Das aktuelle 7d-Ziel fordert weiterhin, vektorielle Transformationen auf räumliche Figuren anzuwenden und Folgen für Flächen oder Volumina zu begründen. Der frühere P-v2-Nachweis wurde deshalb nicht bloß mit einem neuen Hash versehen: Seine zwei Aufgaben, erwarteten Leistungen und Variationsachsen wurden gegen diese aktuelle Zieldefinition geprüft. Keine Aufgabe verwendet die 6b-ID, deren Mastery oder eine spezielle Gerade-Ebene-Lage als Voraussetzung.

- Bei der zentrischen Streckung `T(X)=A+2(X−A)` verdoppeln sich `AB=(2,0,0)` und `AC=(0,3,0)`. Der Dreiecksinhalt wächst korrekt von 3 auf 12, also mit Faktor 4.
- Bei der Scherung `T(x,y,z)=(x+z,y,z)` des Quaders `2×3×4` bleiben die Grundfläche 6 und die senkrechte Höhe 4 erhalten. Das Bildvolumen ist 24; die schiefen Seitenkanten dürfen nicht als neue Höhe verwendet werden.

Beide Fälle verlangen eine geometrisch/vektoriell begründete Maßfolge statt bloßer Bildkoordinaten oder einer auswendig gelernten Determinantenregel. Sie prüfen unterschiedliche Wirkungen (Flächenskalierung versus Volumenerhaltung) und sind nicht aus dem Lehrbild allein zu beantworten. Das komplette frühere Profil wird inhaltlich unverändert übernommen; `materialize-candidate.mts` pinnt die historische Fünfer-Review per SHA-256 und erzeugt den explizit neu begründeten Kandidaten. Der gemeinsame Materializer bindet ihn anschließend an den aktuellen Ziel-Input. `reviewedResourceTypes: []` entspricht dem früheren P-Umfang; eine etwaige Bildfreigabe gehört zur separaten V-Spur.

Die historische Fünfer-Konfiguration und Review-Datei bleiben unverändert. In der aktiven P-Registry stehen jetzt vier byteidentisch erhaltene Records aus `rest-d8f-without-7d` und dieser einzelne aktuelle 7d-Kandidat.

Gezielte Prüfung:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/materialize-rest-d8f-without-7d.mts
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-7d-after-6b-retirement-p-v1/materialize-candidate.mts
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-7d-after-6b-retirement-p-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-7d-after-6b-retirement-p-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-d8f-without-7d.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-7d-after-6b-retirement-p-v1/positive-evidence.config.json
```
