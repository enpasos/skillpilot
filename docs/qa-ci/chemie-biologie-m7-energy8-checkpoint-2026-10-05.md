# Chemie/Biologie M7: acht neue Chemieabschlüsse, 5. Oktober 2026

Fortsetzung des [vorherigen geprüften Zwischenstands](chemie-biologie-m7-resumption-checkpoint-2026-10-05.md). Das Goal bleibt ausschließlich für Chemie und Biologie aktiv. Dieser Stand ist maschinelle Curriculum-QS; menschliche Freigaben, Erprobung, Veröffentlichung und GitHub-CI werden nicht behauptet.

## Aktueller strenger Stand

Der [zentrale Curriculum-Bericht](status/curriculum-quality-status.json) wurde am **2026-10-04T23:02:10.938Z**, entsprechend 5. Oktober in Deutschland, vollständig neu erzeugt. Der vorher abgeschlossene zentrale Fünf-Gate-Check hat Exit 0, je Fach 6/6 erforderliche Checks und 0 technische Berichtblocker. Maßgeblich sind aktuelle `curricularAtomic`-IDs.

| Fach | Streng abgeschlossen | Offen | D / P / A / M / V | Reifegrad / CQR-303 |
| --- | --- | --- | --- | --- |
| Chemie | **66/376 (17,6 %)** | 310 | 66 / 66 / 199 / 376 / 352 | M6 / WARN |
| Biologie | **37/363 (10,2 %)** | 326 | 37 / 37 / 363 / 363 / 44 | M6 / WARN |
| Mathematik | 807/807 | 0 | 807 / 807 / 807 / 807 / 807 | M7 / PASS |
| Physik | 478/478 | 0 | 478 / 478 / 478 / 478 / 478 | M7 / PASS |

**Paketfortschritt: Chemie +8 neue fachliche Abschlüsse, +8 netto, 0 wiederhergestellte strenge Abschlüsse. Biologie +0 in diesem Paket.** Die zwei vorherigen neuen Biologieabschlüsse bleiben erhalten. Alle neun geschützten Reifegrad-Untergrenzen bestehen; keine Untergrenze wurde geändert.

## Tatsächlich abgeschlossene acht Ziele

| Ziel-ID | Kompetenz |
| --- | --- |
| `2be9e61a-88ea-56fe-8294-ee46e3c9a8ef` | Rohstoffvorkommen reflektieren |
| `a0e8f0f2-24e2-5945-a511-597d32e73796` | Fossile und nachwachsende Rohstoffe nachhaltig bewerten |
| `8b98d8ba-65c6-58d7-92f0-45f4b2456573` | Quellenbelegte Rohstoffmaßnahmen ableiten |
| `4663fd80-1618-5211-8020-18f4b80979fc` | Standard-Reaktionsenthalpien berechnen und deuten |
| `3c9bfa10-9a13-50cc-96c8-6213e28d6c54` | Halogenkohlenwasserstoffe quellenkritisch bewerten |
| `b759d50d-0e82-5b10-89a2-fe5271106e50` | Brennstoffzellen verstehen |
| `27e4fe9b-4796-579b-8f7d-06c65fb600c0` | Blei-Akkumulator beschreiben |
| `6b82f80e-f493-5e6b-9709-2d4eca98c137` | Lithium-Ionen-Akkumulator einordnen |

Beide unabhängigen, gegenüber der jeweils anderen Runde blinden D-Reviews haben alle 13 aktuellen PDF-Lernzielseiten tatsächlich angesehen sowie die relevanten HE-/BY-Originalquellen und Voraussetzungen geprüft. Für diese acht Ziele behalten beide denselben aktuellen DE/EN-Text. Der Syntheseindex schließt ausschließlich diese acht Beschreibungen; fünf echte Befunde bleiben explizit offen. Unveränderte Ziele mit gültiger historischer Evidenz wurden nicht erneut geprüft.

Die nach dem Einfrieren der D-Records unabhängig geprüften P-v2-Ketten verlangen eigenständige Erklärung, Anwendung oder Urteil und fachlich wirksamen frischen Transfer. Sieben INNER-Profile bleiben exakt unverändert gegenüber dem tatsächlich inhaltlich geprüften ursprünglichen Kandidatenstand. Der Brennstoffzellen-Nachfolger entfernt den belegten Scopeüberschuss: vorgelagerte Wasserspaltung und Akkuvergleich gehören nicht zu den verpflichtenden Leistungen dieses Zellziels. Der neue Fall prüft selbst dargestellte bilanzierte Reaktionen, geänderte Elektrodenlage, blockierten inneren H+-Weg, unterbrochene H2-Zufuhr sowie Energieträger-/Wandlerrolle. Die H2-Grenze wurde zuletzt präzisiert; beide Reviewer haben die tatsächlichen Nachfolgerdaten gezielt geprüft. Alte HOLD-Befunde bleiben erhalten.

Alle P-Status bleiben **`ai_candidate` / `needs_human_review`, E1/G1**. Vorgegebene Gleichungen, Bilder oder Tabellen werden nicht als ungelenkte Leistung ausgegeben; zwei Demonstrationen sind keine starre Quote zusätzlicher Aufgaben. Es wird keine tatsächliche Lernendenbewährung behauptet.

- [Zwei unabhängige Reviews, Synthese und strenger Beschreibungsindex](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-04/batch-011-ephase-fuels-energy-current-13-v1/resolution-index.json)
- [Acht aktuelle fachlich geprüfte P-v2-Ketten](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy8-reviewed-p-v3/positive-evidence.config.json)
- [Exakte Übernahme-, Gleichheits- und Nachfolgergrenzen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy8-reviewed-p-v3/independent-integration.receipt.json)

## Offene Befunde und nächster Schritt

Die alte B011-Reservierung mit 13 Zielen wurde durch eine aktuelle Reservierung der fünf tatsächlich offenen Ziele ersetzt; die abgeschlossene ursprüngliche Konfiguration, unabhängigen Ergebnisse und Deferrals bleiben unverändert erhalten:

- `8ceb1749`: fraktionierte Destillation und thermisches Cracken sind zwei unabhängig prüfbare Kompetenzen; die fachliche Aufteilung steht aus.
- `8ece9beb`: gemeinsame Bezugsbasis energetischer Vergleiche präzisieren; das vorhandene Bild enthält Ethanol außerhalb des Kohlenwasserstoffziels und eine CO2-Rangfolge ohne Bezugsbasis.
- `b95cdf98`: die bereits curricular beanspruchte Beurteilung des Nutzens bzw. der Bedeutung von Erdölprodukten ausdrücklich machen.
- `4928d5d1`: Zustandsgrößen von ihren Änderungen unterscheiden; im P-Fall vollständig isolierten Stoff-, Wärme- **und Arbeits**austausch benennen.
- `3e433dae`: relative Energielagen benennen und qualitative Bindungsbegründung aus gegebenen Bilanzen prüfen, ohne verpflichtende Bindungsenergie-Summenrechnung über den Quellenscope hinaus.

Gezielte Korrektur- und Splitkandidaten werden vorbereitet; die sechs begonnenen Biologie-Genetikziele werden parallel als Kandidaten bearbeitet. Neue oder korrigierte PNGs bleiben bis tatsächlicher Fach-/Sichtprüfung und aktueller Bindung Kandidaten. Gute vorhandene Bilder bleiben KEEP. Der bestehende Chemie-Quellenatlas mit 358/376 veröffentlichten Zielen, 496 offenen Scope-Entscheidungen und 18 einzeln begründet ausgelassenen Zielen wird weiterhin als Teilumfang ausgewiesen.

## Prüfungsgrenzen

Aktueller zentraler Check, regenerierter Curriculum-Bericht, P-Frischeprüfung für acht Ziele, neun geschützte Reifegrad-Untergrenzen und `git diff --check`: PASS. Unveränderte aktuelle A-/M-/V-Nachweise bleiben erhalten; es gibt in diesem Paket keinen zusätzlichen aktiven Bildimport und keine Änderung des zuvor gemessenen 1745-Links-Inventars. Vollständige Abschluss-Builds und erforderliche weitere Layer-A-Abschlussprüfungen bleiben für stabile Integrationsstände und den tatsächlichen M7-Abschluss gebündelt. Chemie-/Biologie-M7 ist weiterhin offen.
