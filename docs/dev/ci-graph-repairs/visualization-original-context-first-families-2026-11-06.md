# Ursprüngliche V-Kontexte: zwei abgeschlossene Familien

Am 6. November wurden die acht Matrixreviews vom September und die zwanzig
Wirtschaftsreviews der Familie „project, markets, international, methods“ vom
Oktober einzeln auf ihre ursprünglichen Kontextbelege geprüft. Von diesen
**28 Fällen ergeben 18 technisch qualifizierbare Kandidaten**, sechs weitere
passende Originalketten benötigen einen eigenen geschlossenen Parser, vier
bleiben offen. Das ist keine neue Bildbegutachtung und keine aktive V-Freigabe.

Die [maschinenlesbare Fallliste](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json)
hat SHA-256 `3b8c7c3dc08c9a49c51a4c7436459894ee7459a397dc8bfbb252b31d209bad90`.
Sie bindet jeden Originalreview, dessen tatsächlichen Input, die historische
Ownerzuordnung und die ursprünglich begutachteten Bildbytes. Die 18 einzelnen
Receipt-Kandidaten liegen unmittelbar daneben unter `qualification-candidates/`.
Der neue native Receiptvalidator ist noch in Arbeit; seine Abnahme wird hier
nicht vorweggenommen.

| Abgeschlossene Familie | Kandidaten in vereinbarten Formaten | Eigener Parser offen | Kontext offen |
| --- | ---: | ---: | ---: |
| Mathematik: acht Matrixreviews | 2 | 2 | 4 |
| Wirtschaft: zwanzig Original-/Korrekturreviews | 16 | 4 | 0 |

Die beiden Matrixkandidaten `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` und
`35558905-753d-5fcb-b25e-7f85ffdbff56` besitzen den vollständigen ursprünglichen
`goalSnapshot`. DE-/EN-Titel und -Beschreibung sowie Anforderungsniveau stimmen
mit der aktuellen Quelle überein. Die sechzehn Wirtschaftskandidaten binden
ihre tatsächlich gelesenen ursprünglichen Native-Metadaten über deren im
Originalreview enthaltenen Hash. Diese Metadaten belegen den deutschen
Darstellungskontext; die bloße Angabe, auch Englisch gelesen zu haben, wird
nicht in einen unbelegten englischen Textsnapshot umgewandelt.

Bei `0de1e45c-aea9-5e53-932a-027dcf509efa`,
`4d331ba0-56d6-5730-a51b-e3d1126b31ba` und
`b72d87d4-763e-54aa-940d-31f195b51700` fehlen im gelesenen Originalreview die
vollständigen ursprünglichen Beschreibungen und eine bindende Inputreferenz
darauf. Ein zeitnaher Gitstand allein beweist nicht, welchen Text der Reviewer
gelesen hat. Diese drei Fälle erhalten deshalb keinen Kandidaten.

Bei `4c494716-567b-59c2-855c-6ea45635c666` unterscheidet sich der dokumentierte
Originaltext tatsächlich vom heutigen Text: Die ursprüngliche allgemeine
Formulierung zu „geometrischen Abbildungen, etwa Schattenwürfe oder
Projektionen“ wurde durch die engere Beschreibung linearer Abbildungen und
als Parallelprojektion modellierter Schattenwürfe ersetzt. Die ursprüngliche
Bildfreigabe wird weder durch diese Verengung noch durch unveränderte Bildbytes
zu einer neuen Kontextfreigabe. Auch dieser Fall bleibt offen.

Die zwei anderen Matrixreviews und die vier korrigierten Wirtschaftsbilder
besitzen passende Originaltexte und Bildketten in eigenen Formaten. Sie werden
als `matching-original-context-closed-adapter-pending` geführt, nicht in einen
anderen Parsertyp umetikettiert. Sämtliche historischen Entscheidungen,
Reviewer und tatsächlichen Reviewzeitpunkte bleiben erhalten. Insbesondere
ist der spätere Sammelzeitpunkt der Wirtschafts-Integration kein neuer
Bildreviewzeitpunkt.

Die Prüfung wurde mit dem
[endlichen Qualifikationsskript](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/visualization-review-context-gap/qualify-first-two-families.py)
ausgeführt, SHA-256
`80bb492c133c332e748a25cacc6b89a7c2a94a7febe6d7a94c78b6b5d83ff15f`.
Es prüfte die Originale aus den Commits `9d8aabe64487c6d96e7d2a7afe6aeff4a07534c1`
und `42095f427223545968e452d494e4f982c196c7e2` gegen den externen akzeptierten
Repositorycommit `6fe35a6b0fa807e5a97475b34f3715dc16a89c00`, verglich die
historischen Archivdateien bytegenau mit diesen Gitblobs und hashte die
ursprünglichen sowie heutigen öffentlichen und kanonischen Bilder tatsächlich.
Die Quellen und aktiven QA-Dateien wurden vor und nach der Prüfung verglichen;
sie blieben unverändert. Der historische Ownerquelltext dient nur zur
Zuordnung, niemals als Ersatz für einen fehlenden ursprünglichen Reviewinput.

Die übrigen Fälle des Inventars mit 2.562 Zeilen sind damit noch nicht
qualifiziert oder abgelehnt. Aus diesen zwei Familien lässt sich keine
Gesamtzahl benötigter neuer Bildreviews ableiten. Der gesonderte echte
[Diagramm-B-Review](math-diagram-description-b-visualization-independent-review-2026-11-06.md)
bleibt eine neue konkrete Begutachtung und wird nicht mit dieser technischen
Qualifikation historischer Entscheidungen vermischt.
