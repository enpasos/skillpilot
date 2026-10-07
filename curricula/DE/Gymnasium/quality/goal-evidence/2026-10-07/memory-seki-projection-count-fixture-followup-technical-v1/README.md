# Informatik: präzise Zählernachfolge nach Memory-Bindungsreparatur

Dies ist ein technischer Checkpoint-Nachweis. Die ursprünglichen drei
Applicability-Bindungsreparaturen sowie deren Quellen-, Karten- und
Sichtbarkeitsnachweise bleiben im benachbarten
`memory-final-origin-protected-binding-restoration-technical-root-v1` erhalten.
Diese Nachfolge ändert ausschließlich sechs bestehende Informatik-Zählerpaare
im Backend-Test. Sie behauptet keine neue Fachprüfung oder menschliche Freigabe.

## Tatsächlich kompilierte Zielmengen

`audit-twenty-eight-target-set-deltas.native-readonly.mts` verwendet den
bestehenden `compileCompositionView`, `convertLearningGoal` und
`goalMatchesFilters`. Für die vorhandene Personal-Curriculum-Konfiguration
wählt der Backendvertrag die aktuelle, hinsichtlich Dauer und Bundesland
neutrale **SekI**-Sicht `de-de-gym-seki-informatics`. Die Bundesland-Sichten mit
`CrossStage` passen nicht zu dieser exakten Stufenanforderung. Der gültige
Orientierungseintrag bleibt wie im bestehenden Backendvertrag erhalten.

Der gesicherte tatsächliche Vorhergraph entspricht bytegenau dem HEAD-Graphen
vor der Bindungsreparatur. Alle 28 kompilierten Vorhermengen erfüllen die
ursprünglichen 28 Zählerwerte. Die tatsächlichen Nachhermengen ergeben:

| GK SekI, jeweils G8 und G9 | Vorher | Nachher | Einziger zusätzlicher Knoten |
| --- | ---: | ---: | --- |
| DE-HH | 21 | 22 | `ca2469f3-3712-5d92-ae7c-ee61d8607efa` |
| DE-NI | 21 | 22 | `ca2469f3-3712-5d92-ae7c-ee61d8607efa` |
| DE-NW | 19 | 20 | `ca2469f3-3712-5d92-ae7c-ee61d8607efa` |
| DE-RP | 17 | 18 | `ca2469f3-3712-5d92-ae7c-ee61d8607efa` |
| DE-SN | 28 | 29 | `ca2469f3-3712-5d92-ae7c-ee61d8607efa` |
| DE-SH | 26 | 27 | `dbad1333-5783-57b5-8715-92d725f5c303` |

Die anderen 16 geprüften Informatik-Mengen bleiben exakt. Kein Ziel wird
entfernt. Der Graphbegriffe-Knoten `c254fd74…` ist LK-gebunden und erzeugt
hier keinen GK-Zuwachs. Alle fachlichen Zielfelder, die bestehenden ganzen
Reviewzeilen und die 15 zugehörigen Datenbank-/Sprachkarten bleiben unverändert.

Der JSON-Nachweis hält vollständige Vorher-/Nachher-ID-Mengen, tatsächliche
Compilerbefunde, SHA-Bindungen, ursprüngliche Herkunftsclosure und bestehende
Kartenzeilen fest. Die vorherige echte native M-Prüfung mit 28 Karten und 18
Sichtbarkeits-Sichten ist unverändert verlinkt. Die Zähler umfassen alle
sichtbaren atomaren Ziele, einschließlich der Memory-Knoten; sie sind keine
curricularAtomic-M7-Zähler.

## Backend-Nachprüfung

Der erste tatsächliche gezielte Lauf bestand für Science SekI und scheiterte
für Additional M6 zuerst an DE-HH G8 (Soll 21, Ist 22). Der rote Lauf bleibt
getrennt vom früheren erfolgreichen Vollsuite-Lauf mit 2300 Tests erhalten.
Nach dem belegten Fixture-Delta werden ausschließlich die zwei vorhandenen
Projektionsmethoden mit dem bestehenden Kontextcache-Limit 4 und 3 GiB
Testheap erneut ausgeführt. Der terminale Nachweis steht in
`targeted-two-backend-methods.actual.json`.
