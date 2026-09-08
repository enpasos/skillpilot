# B040 Astrophysik-Split – geprüftes Autorenpaket, noch nicht angewendet

Dieses Paket bereitet ausschließlich die gezielt freigegebenen Änderungen vor. Es ist kein D-/P-Abschluss, keine blinde Wiederholungsprüfung, keine menschliche Freigabe und kein Nachweis eines erreichten Physik-100%-Stands. Die bestehende Agentinstanz hat fachliche Vorbefassung; die Modellkennung ist nicht verfügbar.

## Verbindliche aktuelle Entscheidung

- Sieben neue, individuell formulierte DE/EN-Atome; die drei alten IDs bleiben gleichbreite fachliche Cluster mit unveränderten Texten und vorhandenen Ressourcen.
- Zwölf gewöhnliche Requires-Umbindungen plus genau eine Memory-Edge-Änderung: memory266 verliert ausschließlich den alten, nach c15-Entfernung unbegründeten c940-Require. Seine vier übrigen Requires bleiben erhalten.
- Alle sieben neuen Atome erhalten individuell begründetes `no_memory_needed`. Die bloß qualitative Rotverschiebungskarte c15 wird aus den drei bestehenden aktiven Deckkopien entfernt; ihre ursprüngliche Zeile und ihr Originalfingerprint bleiben als `remove / necessary:false / originGoalIds:[]` im Karten-Audit erhalten.
- Diese ausdrückliche spätere Root-Entscheidung ersetzt den ursprünglichen Vorschlag, c15 korrigiert zu behalten und B einem Q4-Deck zuzuordnen. Der nie angewendete alte Vorschlag steht in `superseded-memory-proposal-v1.json`. Die technische Erstinventur bleibt unverändert, ihr damaliger c15/c52-Keep-Abschnitt ist nicht mehr der Implementierungsauftrag.
- Dunkle Materie wird gegen **bekannte gewöhnliche Materie** abgegrenzt, einschließlich nichtleuchtender baryonischer Gas-/Staubanteile. Bloße Unsichtbarkeit ist kein hinreichendes DM-Kriterium.

## Paketinhalt

| Datei | Zweck |
| --- | --- |
| `authoring-input.json` | Neue Texte, eindeutige IDs, drei Clusteränderungen, 13 genaue Requires-Deltas, c15-Entfernung und einzeln geleaste Felder |
| `source-decisions.json` | 32 konkrete aktuelle Quellpassagen mit Originalbezug, vorherigen Mappingzeilen und enger begründeten partiellen Zielzuordnungen |
| `individual-am-judgments.json` | Sieben individuelle fachliche A-/M-Begründungen; keine kopierten Elternentscheidungen |
| `view-candidates.ts` / `view-field-leases.json` | Feldweise aktuelle Kompositionsänderungen mit nativen Projektions-/Duplikatprüfungen |
| `ledger-candidate.ts` | Aktuelle A/M/K-/Karten-Fingerprints, archivierte alte drei A-/M-Zeilen, nur gezielte neue Entscheidungen |
| `generator-overlay-candidate.ts` | 32 quelltextgebundene operative Zuordnungen für acht bestehende Generatoren; Rohquellen werden nicht regeneriert |
| `source-inventory.ts` | Reproduzierbare aktuelle Inventur aller 25 Physik-Extraktionen / 16 Länder und direkter Alt-ID-Mappings |
| `prompts/*.nano-banana-prompt.de.md` | Sieben einzelne, noch nicht gesendete Nano-Banana-Pro-Prompts |
| `emit-implementation.ts` | Read-only Emitter; liefert JSON mit `patch` und `receipt`, schreibt selbst keine Datei |

## Quellen- und Ansichtsscope

Die Quellenentscheidungen sind **partielle Sachzuordnungen**, keine alten-ID→Kind-Mastery-Äquivalenzen. Bestehende HE-Legacy-Ziel-ID-Mappings auf die gleichbreiten alten Cluster bleiben unangetastet. Die drei RP-Legacy-Zeilen enthalten dagegen tatsächliche aktuelle Extraktions-Source-IDs; nur diese werden mit ihren aktuellen Reviewzeilen synchronisiert.

| Scope | Neue Target-Atome |
| --- | --- |
| Nationale CrossStage-/SekII-Ansichten und Atlas, HE | S, T, B, DM, DE, G, U |
| BY | S, B, DM, G |
| BW | B, DM, G, U |
| RP | B, G, U |
| SL CrossStage | S, G im Sek-I-Wahlthema Jahrgang 10 / naturwissenschaftlicher Zweig |
| SN CrossStage | S in Jahrgang 10 / Sek I |
| TH | T in der Einführungsphase, genau einmal |
| Übrige aktuelle Landesansichten | Keine pauschal geerbten neuen Targets; enge benötigte S/G/B-Grundlagen bleiben ausdrücklich prerequisiteOnly |

S = Sonnensystem, T = Gezeiten, B = Urknallmodell/Rotverschiebung/Hintergrundstrahlung, DM = dunkle Materie, DE = dunkle Energie, G = kosmische Strukturen, U = Größe/Alter. Es wird kein gesamter Q4-Kartenstapel neu nach BY/BW ausgerollt.

Die Quellinventur ist gezielt, nicht eine neue vollständige Lehrplanbegutachtung aller Länder. Fehlende Schlagworttreffer sind kein genereller Negativbeweis. Konkrete zusätzliche SL-/SN-/TH-Belege sind ausdrücklich berücksichtigt. Die reine nationale Sek-I-Ansicht bleibt unverändert; die vier nationalen CrossStage-/SekII-Ansichten und der Atlas zeigen alle sieben neuen Atome plus den vorhandenen Kepler497 jeweils genau einmal.

Das einzelne Atlas-Sources-Feld `expectedCurricularAtomicGoalCount` wird zusätzlich gegen die aktuelle authoritative K-Inventur geleast und exakt additiv 466→470 angepasst. `read-only-implementation.receipt.v2.json` ergänzt diesen gezielten letzten Zählerpatch gegenüber dem unveränderten v1-Receipt; keine Tests oder Gates werden abgeschwächt.

Bei BW verschwindet die fachfremde alte Kosmologie-Referenz im Wellenkapitel. Der vorhandene spezifische Doppler-Nachbar bleibt unverändert. Kein fremdes bestehendes Target wird durch den Split entfernt.

## Sichere Anwendung durch Root

Vom Repository-Root mit Node 20:

```sh
/home/enpasos/.nvm/versions/node/v20.20.2/bin/node app/node_modules/tsx/dist/cli.mjs curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-split-implementation-v1/emit-implementation.ts --check-only
```

`--check-only` erzeugt den Patch intern und prüft ihn mit dem nicht schreibenden `git apply --check`; stdout ist der vollständige Receipt. Ohne Option enthält stdout JSON `{patch, receipt}`. `--receipt-only` überspringt nur die zusätzliche Patch-Anwendbarkeitsprüfung. Keine dieser Varianten schreibt Dateien.

Root prüft unmittelbar vor Anwendung sämtliche aktuellen `fileDigests[].beforeDigest` gegen die tatsächlichen Bytes und die neuen Dateipfade auf Nichtexistenz. Nur dann den vorgeschlagenen `patch` mit `apply_patch` anwenden. Bei Drift keine historische Gesamtdatei zurückschreiben und keine Lease still neu setzen: die konkrete Abweichung prüfen, erhalten und aus dem ausdrücklich stabilen aktuellen Stand neu emittieren.

Der Emitter verarbeitet aktuelle Dateien und bewahrt alle nicht betroffenen Felder; insbesondere andere B043-Texte, B035-Ziele/-Karten sowie aktuelle Bildressourcen. Die B035-Integration ist eine ausdrücklich mitgeteilte additive Baselineänderung: vor B040 717 Gesamtziele / 466 gewöhnliche Atome, danach voraussichtlich 724 / 470. Maßgeblich sind die tatsächlichen aktuellen Receiptwerte und der feste B040-Delta +7 Ziele / +4 gewöhnliche Blätter, nicht ein kopierter früherer Absolutwert.

Nach Anwendung sind die nativen A-/M-, Semantic-Kind-, Kompositions-, Source-/Maturity- und M6-Gates auf den wirklichen Dateien erneut erforderlich. Insbesondere müssen A **und** M explizit `obsoleteRecords=0` melden; A exit0 allein reicht nicht. Die Candidate-Hashes und In-Memory-Prüfungen sind kein vorgetäuschter post-apply PASS.

## Bewusst offener separater Hand-off

Prüfungsdaten bleiben vollständig unverändert:

- `335a75b0-f691-5867-8ce3-3c971d541b9f` (Astrophysik und Kosmologie): bislang 14 direkte Requires-/Coverage-Claims.
- `4a58df57-f791-502f-8b8d-9ba155e46035` (Q4-Klausurautonomie): bislang 65 direkte Requires-/Coverage-Claims.

Beide enthalten weiterhin die alten drei IDs. Ihr exakter aktueller Inhalt, Digest und sämtliche Claims stehen im Receipt. Root muss konkrete Aufgaben, Materialien, Lösungen und Bewertungsmaßstäbe fachlich autorieren und erst danach die tatsächlich geprüften Nachfolger in `requires` und `examData.coveredGoalIds` auswählen. Keine automatische 3→7-Claimvermehrung und keine Änderung anderer bestehender Claims allein wegen des Splits.

Die sieben Bilder fehlen bewusst noch. Die Prompts sind nur vorbereitet; es existieren daraus noch keine Providerantworten, tatsächlichen Sichtprüfungen oder gültigen V-Dispositionen. Nach stabiler Textübernahme zuerst `scripts/generate_goal_visualization_nano_banana.mjs --no-import` mit tatsächlichem Ziel und zugehörigem `--prompt-append-file` verwenden; einen zuvor separat materialisierten Kandidaten-Landscape ggf. über `--landscape` binden. Keine native Ersatzgrafik ohne belegte notwendige Ausnahme, kein automatischer Import und kein QA-Grünstempel.

Backend-`build/resources` bleibt ein veraltbares Buildprodukt und wird nicht manuell umgeschrieben. Die existierende `backend/src/main/resources/static/data`-Kopie wird im Vorschlag ausschließlich um c15 bereinigt; normale Build-/Deploy-Provisionierung muss den späteren tatsächlichen Runtimezustand herstellen.
