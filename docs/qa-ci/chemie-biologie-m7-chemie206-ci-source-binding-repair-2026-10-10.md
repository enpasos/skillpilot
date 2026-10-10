# Chemie/Biologie M7 – Chemie-Quellenbindungen und CI-Fortsetzung

Der [Integrationsstand vom 10. Oktober](chemie-biologie-m7-chemie206-biologie353-integration-2026-10-10.md) bleibt bei **206/398 Chemie** und **353/394 Biologie**. Mathematik 807/807 und Physik 478/478 bleiben M7. Diese Korrektur erzeugt **null neue fachliche Abschlüsse** und stellt **zwei bestehende Quellenbindungen** wieder her; sie kommt zu den fünf zuvor wiederhergestellten Beschreibungsbindungen hinzu.

Die [Chemie-Überwachung auf `cd7f5d345`](https://github.com/enpasos/skillpilot/actions/runs/38079093540) erkannte drei Änderungen gegenüber ihrer Baseline: den Chemiegraphen sowie die Quellenzuordnungen für Bayern und Sachsen-Anhalt. Der gezielte Abgleich mit den vorhandenen unabhängigen Reviews fand zusätzlich einen Integrationsfehler: Die übernommene Bayern-Datei stammte aus einer älteren Basis und verlor zwei am 7. Oktober gültig geprüfte direkte Quellenkanten samt ihren Entscheidungseinträgen.

| Amtlicher BY-Operator | Wiederhergestelltes Ziel | Beleggrenze |
| --- | --- | --- |
| C10-HG_SG_MUG_WWG_SWG.4.6 | `597ac03c…` | Ausschließlich die Struktur-Eignungskomponente; `partial`, keine Gesamtabdeckung oder Geschwisterzuordnung. |
| C10-NTG.2.8 | `9751b6d8…` | Qualitative Beeinflussung ausgewählter Säure-Base-Reaktionen durch reversible Protonenübergänge; keine Erweiterung um MWG, pKa, Puffer oder allgemeine OH⁻-Produkttrends. |

Die vollständigen aktuellen Zielobjekte sind unverändert. Die ursprünglichen A/B-Nachweise gelten weiterhin; die [tatsächliche Wiederherstellung](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie206-watch-delta-two-retained-BY-source-bindings-repair-20261010-v1/two-current-valid-BY-source-bindings.restored.actual.json) bindet sie und die exakt übernommenen alten Kanten und Entscheidungen. Historische Artefakte bleiben unverändert. Alle anderen aktuellen Bayern-Zuordnungen und Entscheidungen bleiben erhalten.

Der normale Atlasgenerator erhält 398 Atome, 378 veröffentlichte Seiten, 48 Ansichten, 496 ungelöste Quellenpflichten und 20 ausgelassene Ziele einschließlich des C11-HOLDs. Der normale Quellenatlas-Test prüft jetzt zusätzlich die beiden direkten Kindbelege, ihre genaue Zuordnungsform und ihre Entscheidungsziele. Sichtbarkeit über den historischen Elternknoten reicht dafür nicht aus.

Bei künftigen Integrationen müssen aktuelle Quellenkanten und Entscheidungen zusammen mit den Ziel-IDs verglichen werden. Vor einem Chemie-Commit gehört der bestehende Lauf `./scripts/run_canonical_chemistry_evidence_watch.sh` zum gebündelten Integrationscheck. Eine Baseline darf erst nach fachlich belegter Auflösung tatsächlicher Änderungen erneuert werden; ihre Erneuerung ist keine fachliche Prüfung.

CQR-303 und M7 für Chemie/Biologie bleiben offen. Menschliche Prüfung, Freigaben und Erprobung bleiben getrennt. Der GitHub-Lauf für die Korrektur ist bei Erstellung dieses Fortsetzungsdokuments noch ausstehend; seine terminalen Ergebnisse müssen am tatsächlich gepushten Head geprüft werden.
