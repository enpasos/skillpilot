# Isolierte Source-A-QA auf Git 5c9: konkreter Ausführungsplan

Stand: 6. November 2026. Dies ist eine lesende Analyse mit tatsächlich ausgeführter Source-A-Verifikation und Größen-/Referenzinventur. Es wurde kein physischer Kandidatenlauf ausgeführt und keine Aktivierung freigegeben. Der [maschinenlesbare Beleg](source-identity-5c9-isolated-qa-doing-plan-2026-11-06.json) enthält alle Pins, Eingaben, Selektoren, konkreten geänderten Goals, Adaptergrenzen und Negativkontrollen. Die [Vorbereitungseingabe](source-identity-5c9-isolated-qa-doing-plan-2026-11-06.preparation-input.json) benutzt das bestehende Format des Preparers.

## Festgelegter Stand und tatsächliches Ergebnis

Der unveränderte Source-A-Verifier lief unabhängig mit Exit 0 gegen:

- Git `5c9ff83586c407fd9189207c38238400c74bce51`;
- Manifest-Rohhash `7228360915bbbff170cd8d1bcbc0d21afedfad17677422fc73cd5ce6a6498209`;
- SourceProjection `5d479a67b5ea3ddd60963942bb5aabd333a887416475c20fb2f10fee5733cec7`;
- 164 Identitätsregeln, 593 Katalogdateien und 8.584 gebundene Dokumente.

Auch die 113 tatsächlichen Dokumentprojektionen wurden hier mit dem unveränderten Kernel im Speicher aufgebaut, gegen ihre hypothetischen Hashes geprüft und vollständig invers verglichen. Ihre zusätzlichen kanonischen Bytes betragen 23.204.606. Das ist weiterhin kein Nachweis, dass ein nativer QA-Produzent einen physischen Kandidaten gelesen hat.

Dieser Snapshot enthält Mathematik `da4724ae…`, die frischen Memory-Kind-Entscheidungen im `78a5f2d9…`-Ledger und Informatik `f95c0a11…`. Während dieser Analyse wurde der getrennte E9-Schritt auf Informatik tatsächlich angewandt. **Der 5c9-Beleg umfasst E9 und den anschließend geplanten CQR202-Code daher nicht.** Für einen endgültigen späteren Arbeitsstand sind Generator und unabhängige Verifikation auf dessen neu festgelegtem Commit zu wiederholen. Die bisherigen Pins werden nicht umbenannt.

Der mathematische Defekt betrifft den Cluster `99ef0fc2-150a-51e8-bac8-7e40e46917b`: Der letzte UUID-Teil hat elf statt zwölf Zeichen. A verändert hier das Clusterobjekt und seinen direkten `contains`-Elternverweis, keine atomare Kompetenz. Der bestehende Bild-URL/Dateiname bleibt erhalten; nur der ausdrücklich registrierte `resourceLinks[0].skillpilotId` wird mitgeführt. PoWi hat 157 Umbenennungen, Wirtschaft sechs; darunter zusammen zehn eigenständige Memorygoals.

## Was bereits vorhanden ist und was fehlt

`scripts/prepare_identity_qa_candidate.py` erstellt ein Paar privater Wurzeln. Unveränderte Textdateien werden zwischen beiden privaten Wurzeln hart verlinkt; die 113 Projektionen bekommen eigene Inodes. Die Bezeichnungen `original80` und `projectedA80` sind historische Verzeichnisnamen, keine Festlegung auf Commit 80d70. Der Inhalt wird durch den ausdrücklich übergebenen Commit und Manifestpin bestimmt.

Die Composer-Fabrik in `app/scripts/lib/sourceIdentityQaMetadata.ts` ist bewusst eng: Sie verifiziert die physischen A-Wurzeln, prüft unveränderte Original-Kind-Ledger, führt den echten ursprünglichen Fünf-Fach-Deep-Produzenten aus und liefert über eine private WeakMap ausschließlich ID-zu-Kind-Zuordnungen für die vorhandenen Composer-Ledger. Sie nimmt keinen importierten grünen Report entgegen. **Sie stellt keinen Kandidatenadapter für D/P/A/M/V, Memory oder CQR bereit.** Diesen Umfang nachträglich als erledigt auszugeben wäre falsch.

Der historische A80-Beleg unter `tmp/identity-qa-metadata-bridge-2026-11-06/` dokumentiert fünf originale Deep-Produzenten, 18.511 authentisierte originale Lesungen und den 352-View-Composer-Lauf. Er beweist weder zehn Kandidaten-Floors noch aktuelle 5c9-QA. Seine Dateien bleiben unverändert.

Die fehlende Verbindung ist konkret sichtbar:

| Aktive Memory-Belege | Umbenannte `record.goalId` | Records mit umbenannten `memoryGoalIds` | Einzelne solche Verweise |
| --- | ---: | ---: | ---: |
| PoWi | 134 | 107 | 108 |
| Wirtschaft | 0 | 55 | 56 |
| Übrige acht aktive Konfigurationen | 0 | 0 | 0 |

Ein generisches Suchen/Ersetzen würde historische Belege verfälschen. Umgekehrt lässt unverändertes natives Laden dieser Original-IDs gegen Kandidaten-IDs die entsprechenden Zuordnungen scheitern. Dafür ist ein getrennter, eng geprüfter QA-Leseadapter erforderlich.

## Ein physisches Paar mit messbarem Speicherbedarf

Der vollständige Gitbaum enthält 207.646 Dateien mit 45.829.008.998 logischen Bytes. Ihn vollständig zu kopieren ist hier unnötig und passt nicht in den freien RAM-Bereich.

Die aus dem echten historischen Leseinventar, der aktuellen A-Hülle, den aktuellen Standardselektoren und aktiven Memory-Konfigurationen gebildete **Startmenge** enthält 30.839 Dateien. Die zusätzlich vollständig inventarisierten nativen Selektoren ergänzen 74 Dateien mit 2.193.006 Bytes. Damit umfasst diese vorbereitende Menge 30.913 Dateien. Sie ist ausdrücklich noch keine abgeschlossene aktuelle Produzenten-Lesemenge.

| Einmaliger Speicheranteil | Bytes |
| --- | ---: |
| Private Originaltexte, in beiden Wurzeln geteilt | 4.608.469.824 |
| 2.517 eindeutige Binärblobs für 5.046 logische Binärpfade | 4.851.907.530 |
| 113 zusätzliche Kandidatenprojektionen | 23.204.606 |
| Zusätzliche Dateien aus den vollständigen Selektoren | 2.193.006 |
| Einmalige vorhandene `node_modules`-Kopie, gemessene logische Größe | 307.188.922 |
| Summe dieser Anteile | 9.792.963.888 |

Hinzu kommen Dateisystem-/Git-Verwaltung, tatsächlich neu entdeckte Inputs, Laufzeitumgebung, Ausgaben und komprimierte Logs. Vor dem Start erneut freien RAM-/tmpfs-Platz messen und nach Materialisierung mindestens 1 GB Reserve verlangen. Keine alte A80-Wurzel löschen; keine zweite vollständige Kopie für jeden Fachlauf erzeugen. Die aktuellen 12 GB freien tmpfs-/24 GB verfügbaren RAM-Werte sind eine Planungshilfe, keine dauerhaft gültige Zusage.

Der vorhandene Launcher bindet Host-Binärdateien nur lesbar ein und prüft ihre Hashes vor und nach dem Lauf. Das verhindert keine zwischenzeitliche Änderung durch einen anderen Hostprozess. Für einen unveränderlichen Snapshot deshalb jede benötigte Binärdatei einmal gegen Gitobjekt, Länge und SHA verifizieren und in einen privaten, nach SHA deduplizierten RAM-Store kopieren. Beide Wurzeln binden denselben Store nur lesbar ein. Die vorhandene Gruppierung der Asset-Verzeichnisse bleibt verwendbar; die momentanen Host-Hardlinks sind keine unveränderliche Capture. Eine einmalige private Dependency-Kopie vermeidet dieselbe Lücke bei `node_modules`.

## Vorbereitung und Schließen der tatsächlichen Lesemenge

1. Die neue Source-A-Hülle und den externen Commit-/Rohhashpin vor dem Lauf dauerhaft sichern. Nicht das alte A80-Manifest überschreiben. Die bereits erfolgreiche Verifikation ist im JSON mit vollständigen Argumenten und stdout enthalten.
2. Den echten historischen `dependency-census/reads.strace.gz` als Startliste dekomprimieren. Seine Pfade liefern benötigte Gitdateien; sein altes Ergebnis ist keine aktuelle Abnahme. Die Vorbereitungseingabe enthält 131 reale Konfigurationspfade und exakt 14 abgetrennte Ausgaben. Alle 14 wurden auf Disjunktheit zu A-gebundenen Inputs geprüft. Kein `bootstrap` oder `--write-fingerprints`.
3. Ein einziges neues Paar vorbereiten. Folgende Form verwendet vorhandene Parameter; sie wurde hier nicht ausgeführt:

   ```bash
   python -B scripts/prepare_identity_qa_candidate.py \
     --repo-root /home/enpasos/projects/skillpilot \
     --manifest /dev/shm/skillpilot-sourcea-current-5c9-dy_6kda5/source.proposal.json \
     --expected-base-commit 5c9ff83586c407fd9189207c38238400c74bce51 \
     --accepted-manifest-sha256 7228360915bbbff170cd8d1bcbc0d21afedfad17677422fc73cd5ce6a6498209 \
     --output /dev/shm/skillpilot-identity-qa-5c9 \
     --read-trace /dev/shm/skillpilot-sourcea-current-5c9-dy_6kda5/dependency-seed.strace \
     --output-paths docs/dev/ci-graph-repairs/source-identity-5c9-isolated-qa-doing-plan-2026-11-06.preparation-input.json \
     --max-private-bytes 6000000000
   ```

4. Vor einer QA-Abnahme die oben beschriebene private Binär-/Dependency-Capture und die fehlende Authentisierung tatsächlicher Kandidatenlesungen implementieren und separat gegenprüfen. Das sind Vorbereitungs-/Lesegrenzen, keine Änderung der eingefrorenen A-Schemata oder der Source-A-Hülle. Werden Produzentenadapter nach 5c9 ergänzt, ihre eigenen Codebytes und ihren Commit separat binden; sie dürfen nicht als Code aus 5c9 ausgegeben werden. Datenzugriffe müssen ausdrücklich auf das Paar zeigen. Modulrelative Standardpfade eines außerhalb ausgeführten Scripts reichen dafür nicht.
5. Aktuelle Discovery-/Read-Probes für alle vorgesehenen Produzenten ausführen; bei Bedarf das gleiche Paar nur vor dem finalen Freeze mit `--extend` ergänzen. Das bestehende `read_inventory` verarbeitet erfolgreiche absolute Pfade, aber keine vollständige PID/cwd/dirfd-Auflösung. Relative/FD-relative Zugriffe, Pfadescaping, fehlgeschlagene Inputs und Verzeichnisdiscovery deshalb zusätzlich vollständig prüfen. Nie erfolgreiche Reads synthetisch erfinden.
6. Die realen Selektoren gegen den gepinnten Gitbaum vergleichen: 21 Canonicals, 352 Composition-Views, 36 rekursiv entdeckte Atomicity-Konfigurationen, zehn direkt im Standardverzeichnis entdeckte Memory-Konfigurationen, fünf Visualization-QA-Ledger, zwei Composer-Kind-Ledger und 320 Source-Extractions. Die Registry wählt davon unabhängig die aktuellen Fünf-Fach-Nachfolger. Historische Unterverzeichnis-Konfigurationen dürfen nicht zu aktiven zusätzlichen Memory-Angeboten werden.
7. Wurzeln, Inputs, Toolchain, Selektoren und Ausgabepfade einfrieren. Danach kein stilles Nachladen oder Weiter-Extend. Der Private-Gitindex muss das vollständige gepinnte Pfadinventar enthalten: `repositorySourceAvailability.ts` benutzt tatsächlich `git ls-files` und nicht bloß die physisch kopierten Pfade. Für tatsächliche Lesungen reichen Indexnamen dagegen nicht; deren Bytes müssen vorhanden und authentisiert sein.

Der aktuelle `--ro-bind / /` macht den Host lesbar. Deshalb den Host-Worktree bis auf ausdrücklich gebundene Git-/Toolinputs verdecken oder jeden außerhalb der deklarierten Wurzeln erfolgenden Repositoryzugriff als Fehler behandeln. Jeder Kandidatenread muss zu einem exakten A-Projektionsbyte, unveränderten Gitbyte oder einer ausdrücklich gebundenen Ausgabe dieses Laufs gehören. Gegenwärtig authentisiert `verify_identity_qa_producer_reads.py` nur die begrenzten Originalreads. Ein leerer oder bloß positiver Readzähler beweist keine geschlossene Lesemenge.

## Kleinster fachlich ehrlicher QA-Adapter

Die nativen Evaluatoren und ihre Kriterien bleiben erhalten. Ein separater, ausschließlich im isolierten QA-Modus verwendbarer Kontext liefert ein genaues, Owner-gebundenes Paar aus Original- und Kandidatendefinition. Ein fremder Owner bleibt fremd; UUID-Wertgleichheit eines Goal-IDs darf keinen Owner normalisieren.

Originale Ledger, Karten, Reviewkonfigurationen, Kriterien, Signaturen, Run-Manifeste, Ressourcen und ihre Hashes bleiben bytegleich. Der Kontext authentisiert diese Inputs und lässt die nativen ursprünglichen Evidenzprüfer gegen die **aktuellen ursprünglichen 5c9-Definitionen** laufen. Nur an der historischen ID-/Fingerprint-Vergleichsstelle darf die entsprechend bewiesene Originaldefinition verwendet werden. Die Ergebniszuordnung erhält beide IDs, den Originalbelegpfad/-hash und den exakten A-Verweis. Sie erzeugt keinen neuen Reviewhash und keinen frei importierbaren Ready-Satz.

Die aktuellen Struktur-, Quellen-, Kurs-, Applicability-, Sichtbarkeits-, Deckzuordnungs-, Aufgaben- und Floorprüfungen sehen immer die tatsächlichen Kandidatendefinitionen. Insbesondere darf nicht der ganze Kandidat vor dem UUID-Check invers in den alten Graphen verwandelt werden. D/P/A/M/V-Subprozesse müssen den Kontext explizit übernehmen; ein fehlender Kontext in einem Kindprozess ist ein Fehler. Die konkreten nativen Eintrittspunkte sind im JSON je Gate aufgeführt.

Die Fingerprintverträge unterscheiden sich: Der einfache A/M-Goal-Fingerprint enthält die Goal-ID und Goaltexte, aber kein `requires`; das P-Reviewinput enthält zusätzlich `requires`/`contains` und Ressourcen. Der vollständige Kind-Fingerprint enthält unter anderem `contains`, `requires`, `examData` und `extendedData`. Ein generischer Hashersatz wäre deshalb schon technisch unzutreffend. Auch echte fachliche Änderungen aus früheren Reparaturen müssen gegen ihre tatsächlich aktuellen 5c9-Belege bestehen. A kann keinen zuvor ungültigen fachlichen Review retten.

Die ursprünglichen Graph-/Floorprüfungen dürfen wegen der zu reparierenden ID-Defekte rot sein. Das wird als Ausgangsbefund festgehalten; ein grüner Original-Floor ist keine Voraussetzung, die die beabsichtigte ID-Reparatur logisch verhindern müsste. Originale fachliche Evidenz muss dagegen für jede übertragene Behauptung selbst gültig sein. Jeder andere rote Befund bleibt erhalten.

## Tatsächliche Laufkette und Abschlusskriterien

Alle Läufe verwenden seriell dasselbe eingefrorene Paar. Je Prozess sind vollständige Argumente, cwd, erlaubte Umgebung, Code-/Inputpins, stdout/stderr, Kindprozesse, terminaler Exitcode und tatsächliche Reads zu sichern. Rohlogs können sofort komprimiert werden; kompakte Abschlussbelege müssen außerhalb des flüchtigen RAM-Baums liegen.

- **Original:** echter `reportDeepUnderstandingRollout.ts --mode=check --format=json` für alle fünf Registry-Fächer; alle zehn aktiven Memory-Checks; vollständige CQR-Erzeugung und Floors. Das wiederholt die aktuellen Belege und liefert den ehrlichen Ausgangszustand.
- **Physisches A-Paar:** `verify_identity_qa_source_context.py` innerhalb derselben Mountumgebung, damit auch die tatsächlichen Assetbytes sichtbar sind. Vollständige Original-/Kandidatenbytes und Inverse prüfen.
- **Kandidat:** `validate:graph`, native strikte 21-Katalog-Prüfung über CQR, echter Composition-CLI mit fünfteiliger Source-A-Anfrage, alle 352 Views und echte Kurs-/Duration-/Math-/Physik-Projektionen. Je Scope Targets, Support, Rollen, geordnete sichtbare Bäume und Applicability unter der A-Bijektion vergleichen; gleiche Anzahlen reichen nicht.
- **Kandidat mit separat geprüftem QA-Leseadapter:** echte fünf Deep-Produzenten, zehn Memory-Checks und Reports, vollständiges `quality:curriculum-status`, danach `quality:curriculum-status:check` und `check:curriculum-maturity-floors`. Diese letzten Adapter sind derzeit nicht implementiert. Reportmodus allein ist kein Gate.
- **Abschluss:** tatsächliche Reads und Selektoren authentisieren, physische Hülle nachprüfen, alle Ausgaben und Fehler sichern. Die zehn geschützten Fächer bedeuten fünf M7- und fünf M6-Floors, nicht zehn getrennte M6-Scripts. Die policy bleibt unverändert und ausnahmefrei.

Der gepinnte Statuscache von 18:45:31.502Z enthält nur Deutsch, Geschichte und Latein auf M6; sieben geschützte Floors sind nicht erfüllt. Hier wurde kein neuer CQR-Lauf behauptet. Vollständig ausgeführte Kandidaten-QA kann ehrlicherweise weiterhin rote fachliche oder strukturelle Gates liefern. Ein Abschluss der Messung ist keine inhaltliche Freigabe und weder Source-A noch dieser Plan öffnet B, LearnerState, Mastery, SRS oder den Runtimepfad.
