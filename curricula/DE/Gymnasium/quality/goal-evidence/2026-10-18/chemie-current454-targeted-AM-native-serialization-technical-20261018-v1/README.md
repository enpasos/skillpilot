# Inaktive native A/M-Serialisierung — Kandidat 454

**Technisch vorbereitet, nicht aktiviert.** Dieses Paket serialisiert ausschließlich die 33 tatsächlich versiegelten A/M-Urteile aus `chemie-current454-targeted-AM-components-independent-a-20261018-v1`. Es erzeugt keine neue wissenschaftliche Stimme, blinde D-Prüfung, Humanfreigabe oder M7-Annahme.

## Aktueller Eingang

Ausgewählt ist `LATEST.selected-candidate-state.pending.json` des gemeinsamen V2-Kandidaten: `landscape.with-five-reviewed-images.INACTIVE.json`. Gegenüber der eigenen wissenschaftlichen Sicht sind alle 33 Zielkörper außerhalb der Bildlinks sowie sämtliche 33 ganzen P-Profile exakt erhalten. Die neue 858-Bilddatei ist kein neuer A/M-Inhalt. Ihre Bildfreigabe wird hier nicht erneut geprüft.

## A: genau ein Owner pro Inhaltsatom

Die zukünftige Auswahl enthält 80 Configs:

- 60 ganze bisherige Configs werden unverändert weiterverwendet.
- 19 Configs erhalten explizite Restscopes mit den ganzen ursprünglichen Record-Zeilen; die 29 ersetzten Bestandsziele werden daraus entfernt.
- Ein neuer A33-Owner bindet vier neue und 29 bestehende Atome an die eigenen versiegelten Fachurteile.

Alle 421 unveränderten A-Records behalten ihren vollständigen ursprünglichen Inhalt und ihre Reviewidentität. Fünf bestehende Records behalten ausdrücklich ihre alte `ruleVersion: v1`; sie werden nicht auf eine andere Regel umgerechnet. 454 gewöhnliche Inhaltsatome besitzen genau einen ausgewählten Owner, ohne doppelte Scopezuordnung. Cluster, Memory und Assessments sind außerhalb dieser A-Auswahl.

## M: ganze 454 mit unveränderten Kartenreviews

Das M454-Ledger enthält 421 bytegenau erhaltene ursprüngliche Zeilen und 33 aktuelle Records aus den versiegelten Einzelurteilen. Die 29 ersetzten ursprünglichen Records und ihre Identitäten bleiben als ganze Vorherobjekte in den Bindungsnachweisen und im kopierten M450-Ledger erhalten. Neue Records nennen ausdrücklich die technische Serialisierung und die tatsächliche wissenschaftliche Quelle.

Die 80 ursprünglichen Kartenreview-Zeilen werden als ganze Datei bytegenau kopiert. Alle 68 Memory-Zielkörper und die vollen 41 künftigen Sichtdefinitionen bleiben erhalten. Die vier geprüften bestehenden `memory_required` (3de, 3ec, 197 und 28bb) behalten sämtliche Memorygoal-/Deck-Refs. Die vier neuen Atome erhalten jeweils ihr individuell begründetes `no_memory_needed`.

## Tatsächliche Stockprüfung

Unveränderte Funktionskörper aus `semanticAtomicityReview.ts` und `memoryCardReview.ts` berechnen die Fingerprints. Der portable technische Helfer protokolliert die tatsächlichen Produktionsfunktionen und ursprünglichen Regelversionen. Zusätzlich wurden die Stock-CLI-Prüfungen direkt gegen den vorhandenen Kandidaten ausgeführt:

| Prüfung | Tatsächliches Ergebnis |
|---|---|
| A33, `--mode=check` | Exit 0; 33 aktuelle atomare Records; keine fehlenden/veralteten Records |
| M454, `--mode=check` | Exit 0; 388 `no_memory_needed`, 66 `memory_required`; keine fehlenden/veralteten Goal- oder Kartenrecords |
| M-Sichten | 41 Sichten; 1715 Memory-Ziel-Sicht-Paare; kein sichtbares Ziel ohne zugeordneten Memoryträger |
| A-Auswahl | 454 eindeutige Owner; alle 421 erhaltenen Originalrecords passen zum Kandidaten unter ihrer jeweiligen ursprünglichen Regel |

Die M-Prüfung testet den bestehenden technischen Gesamtvertrag; sie ist keine erneute fachliche Prüfung der übrigen Ziele oder Karten. Keine Vollbuilds, Framework- oder Normaländerungen wurden ausgeführt. Fingerprints allein stellen keine Fachprüfung dar.

## Aktivierung durch Root

`ACTIVATION.two-registry-field-CAS.pending.json` enthält die genauen Vorher-/Nachherwerte ausschließlich für:

1. `subjects[chemie].semanticAtomicityConfigPaths`
2. `subjects[chemie].memoryReviewConfigPath`

Die CAS kann mit den getrennten Quellen-/P-/D-/Bildänderungen am selben Registryobjekt komponiert werden. Voraussetzung sind der gepinnte gemeinsame Kandidat und seine 41 Kandidatensichten im normalen Zielort. `config/active/` bezeichnet lediglich zukünftige, auf normale Pfade gerichtete Configs; aktuell sind sie nicht registriert. `config/probe/` verweist auf den bereits vorhandenen inaktiven Kandidaten. Die normale abschließende Stockprüfung erfolgt nach der gemeinsamen Aktivierung durch Root.

Die wissenschaftliche Rolle bleibt offen: Der Reviewer der zugrunde liegenden informierten 33er-Sicht war zuvor Autor des Carbonsäuren- und 2fac-Nachfolgers. Diese technische Serialisierung schafft dafür keine fremde unabhängige Autorenfreigabe und keine zusätzliche Reviewidentität.
