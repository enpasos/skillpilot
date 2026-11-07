# Unabhängige feste Original-Auxclosure für 54 V-Kandidaten

Die aus den festen Readerzugriffen von **Commit `9b798d6ef6e715c148e93cae82f6ce7c3f7ec3a4`** abgeleitete Inventur stimmt exakt mit Runtimes tatsächlich gemessenem Callbackindex überein. Es gibt **keine fehlende oder zusätzliche historische Referenz, keine abweichende Kopierrolle und keinen anderen Kandidaten**. Der Lauf bezieht sich nur auf die alten 18 plus die zwei neuen Economics-Familien mit 36 Kandidaten; Diagramm-B und das neue Matrixbild sind ausgeschlossen.

| Größe | Tatsächlich gemessen |
| --- | ---: |
| Konkrete Qualifikationsreceipts | 54 |
| Historische `artifact()`-Rollenaufrufe | 344 |
| Eindeutige `(Commit, Pfad, SHA-256)`-Artefakte | 224 |
| Unterschiedliche historische Pfade | 223 |
| Unterschiedliche historische Inhalte | 224 |
| Rohbytes aller 224 historischen Artefakte | 130.224.426 |
| Benötigte unveränderte Original-Dateikopien | 221 |
| Rohbytes dieser 221 Dateikopien | 120.243.527 |
| Historische Ownerquellen nur aus Git | 3 |
| Qualifikationsreceipt-Bytes separat | 160.500 |
| Aktuelle Eingaben separat | 110 |

Die 344 Aufrufe bestehen aus vier gemeinsamen Rollen je Receipt (216), zwei Derivaten je neuer Economics-Zeile (72), 16 zusätzlichen Trade-Nativbildaufrufen, je 16 Trade-Metadaten-/WholeGoal-Aufrufen (32) und acht früheren REJECT-JSONs. Rollenaufrufe zählen bewusst auch Mehrfachlesungen: Das Trade-Nativbild ist bereits als `reviewedAsset` enthalten; WholeGoals und Ownerquellen werden gemeinsam verwendet.

**Drei historische Ownerquellen sind Git-only.** Zwei unterschiedliche Wirtschaftsrevisionen teilen denselben Dateipfad. Sie dürfen nicht als heutige kanonische Quelldatei materialisiert oder als ein aktueller Ownertext zusammengeführt werden. Für die 221 erforderlichen historischen Originalkopien gibt es dagegen keine Pfad-/Hashkollision. Die neue Liste ist eine genaue Dateieingabenliste, noch keine gemessene vollständige Git-Commit-/Tree-/Blob-Transportkapsel.

**Die 110 aktuellen Eingaben bleiben außerhalb der historischen Originalmenge:** zwei tatsächlich gelesene kanonische Quellfassungen und jeweils 54 öffentliche sowie kanonische Assetkopien. Ihre gesamten gelesenen Bytes sind 212.118.726; das ist kein Auftrag, diese Daten erneut zu kopieren. Der Kernel erhält den aktuellen Goaltext vom Caller und prüft beide tatsächlichen aktuellen Bildkopien. Historische Ownerblobs oder frühere Reviewmetadaten dürfen diese aktuellen Eingaben nicht ersetzen. Beide Quellcaptures waren beim Lauf bytegleich zu9b und wurden am Ende erneut unverändert geprüft.

[closure.json.gz](closure.json.gz) enthält pro Receipt jede einzelne feste Rolle, ihren Commit/Pfad/Hash, die boolesche Originalkopiepflicht und Codeanker. Die deduplizierte historische Tabelle ergänzt Bytes und berechnete Git-Blob-OIDs. Aktuelle Quell-/Assetinputs, Codepins, beide feste Kandidatenlisten und Ausnahmen stehen getrennt darin. [closed-read-roles.json](closed-read-roles.json) fasst die geschlossene Rollenliste zusammen. Es wurde kein freies rekursives Einsammeln von JSON-Locators verwendet.

Die Reader lesen bei einem Korrekturfall den gebundenen **REJECT-Review**, aber nicht rekursiv dessen alte Bilder und Derivate. Generierungsrecords, Prompts, freie URLs und weitere gelistete Belegpfade werden nur dann zur Kapselanforderung, wenn ein ausdrücklich neuer Readervertrag sie tatsächlich liest. Sie wurden nicht still in diese Closure aufgenommen. Der vorhandene `economics-native-v1`-Reader hat außer seinen vier Hauptrollen keine weiteren Dateizugriffe.

[runtime-comparison.json](runtime-comparison.json) bindet die exakte Runtime-Ausgabe SHA `3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e`; deren unveränderte Bytes sind als [runtime-index.original.json.gz](runtime-index.original.json.gz) erhalten. Die eigenständige Inventur entstand aus dem gelesenen9b-Code, bevor die Runtime-Referenzliste verglichen wurde. Runtime stellt eine deduplizierte Menge bereit; die feinere Per-Receipt-Rollentabelle stammt aus dieser unabhängigen Ableitung. Der anfängliche `pending`-Vermerk in der eingefrorenen Rohinventur wird durch den separaten abschließenden Vergleich aufgelöst, nicht rückwirkend umgeschrieben.

[reproduce_read_only_inventory.py](reproduce_read_only_inventory.py) liest ausschließlich die festen9b-Kandidaten, originalen Codepfade und konkret ausgewählten Eingaben; es schreibt seine Ausgabe in einen eigenen RAM-Pfad. Die tatsächlichen Original- und Current-Copy-Hashes wurden verglichen. Das ist keine neue Sichtprüfung, kein M7-/CI-/Source-A-Pass, keine externe Akzeptanz des Runtimeindexes und keine Produktions- oder Capsuleverdrahtung. Keine aktive Quelle, QA-Zeile, Asset- oder Code-Datei wurde verändert.
