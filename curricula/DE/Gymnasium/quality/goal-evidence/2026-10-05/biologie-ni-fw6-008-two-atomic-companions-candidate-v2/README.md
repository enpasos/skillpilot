# FW6-008: zwei atomare Companion-Kandidaten v2

Status: **candidate / ai_candidate**. Diese Texte sind eine **Revision nach Kenntnis des unabhängigen A-Befunds**, keine unabhängige Zweitprüfung. Der kombinierte v1-Entwurf bleibt unverändert mit seinem damaligen Freeze erhalten; dessen D-/A-Ablehnung wird hier angenommen.

## Zwei getrennte Kompetenzen

Die exakten DE-/EN-Texte stehen in [two-companions.goal-templates.candidate.json](two-companions.goal-templates.candidate.json):

1. **Unabhängige Chromosomenverteilung bei der Meiose erläutern**: Die lernende Person erklärt aus vorgegebenen korrekten Modellen, wie die voneinander unabhängige Verteilung mütterlicher und väterlicher Chromosomen verschiedener homologer Paare neue Kombinationen in Keimzellen erzeugt.
2. **Abschnittsaustausch bei der Meiose erläutern**: Die lernende Person erklärt aus vorgegebenen korrekten Modellen, wie der Austausch entsprechender Abschnitte zwischen Nichtschwesterchromatiden homologer Chromosomen neue Kombinationen in Keimzellen erzeugt.

Jedes Blatt hat genau einen kausalen Gegenstand. Die Beherrschung des anderen Blatts wird weder vorausgesetzt noch aus dem Erfolg beim ersten abgeleitet. Beide kanonischen IDs bleiben **null**; Root muss zwei verschiedene stabile UUIDs ausdrücklich adoptieren. Kein aktuelles Ziel wird ersetzt oder ausgeschlossen.

## Tatsächliche Quelle und Kontext

Die Original-PDF-Seite 87 wurde erneut tatsächlich als Bild angesehen: **FW 6.2, zusätzliche Spalte Ende Jg. 10**. Beide Blätter operationalisieren gemeinsam die dortige Klausel zu Rekombinationsprinzipien auf Grundlage der Meiose. Die Betrachtung bleibt cytologisch/chromosomal; molekulare Mechanismen werden nicht verlangt.

Vier tatsächliche aktuelle Ziel-/Eltern-/Voraussetzungskontexte wurden mit Repository-Fingerprints geprüft. Der Pflanzen-/Tierzellenvergleich ist ein zellulärer Einstieg und beweist kein Meiosewissen. Deshalb müssen korrekte Paar-/Chromatid-/Herkunfts-/Abschnittslegenden und korrekte Keimzellbilder tatsächlich bereitgestellt werden. Das breite Mitose-/Meioseziel bleibt unverändert und wird nicht zur zusätzlichen umfassenden Algorithmuspflicht.

[two-required-provided-model-contexts.candidate.json](two-required-provided-model-contexts.candidate.json) enthält getrennte konkrete Givens: korrekte alternative Verteilungsmodelle für Blatt 1 und einen korrekten entsprechenden Abschnittsaustausch für Blatt 2. Die kausale Erklärung leistet die Person selbst. Eigenständige Modellkonstruktion, Phasenabruf, Wahrscheinlichkeitsberechnung und Formelquota werden nicht gefordert. Die Modelldaten wurden strukturell geprüft; aktuelle gerenderte Bilder/Buchseiten und V-/P-Gates sind dadurch nicht freigegeben.

Normative **sourceLandscapeId**: `0b27a054-e81e-5423-aa71-d3d8d9d8f0db`; **canonicalLandscapeId**: `08a43a1b-d97e-522c-9dfa-c950a493364e`.

## Begrenzte Deltas

- [Mapping](mapping-fw6-008.delta.candidate.json): die zwei bestehenden partial-Zeilen bleiben exakt erhalten. Es kommen **zwei partial-Zeilen** hinzu; nur beide neuen Blätter gemeinsam tragen die vollständige Prinzipienklausel. Eine einzelne Companion-Zeile wird nicht als `exact` ausgegeben. Alle 334 NI3-Zeilen und die anderen 122 NI3-Entscheidungen bleiben erhalten.
- [Source und drei Caches](source-cell-and-three-cache.delta.candidates.json): genaue FW6-008-Originalformulierung/Jg.-10-Spalte, ausdrückliche Bereinigung der drei alten Trisomie-Caches entsprechend dem tatsächlich operativen v2-Mapping. Bei FW7-003 und FW7-012 wird nur der Cache ausgerichtet; historische Source-Urteile werden nicht neu etikettiert.
- [Parent und Placement](parent-placement.before-after.candidate.json): bestehender Genetikcluster, aktive 10 → NI3-vorbereitete 12 → mit Split 14 Kinder. Alle anderen Felder und Kinder bleiben erhalten. Beide neuen NI-only-Atome benötigen direkte Source-View-Einträge und eine Inheritance-Grenze. Kein zusätzlicher Cluster wird angelegt.

Die aus dem tatsächlichen NI3-Staging abgeleiteten Planwerte lauten **368 Atome, 446 Records, 123 Sourcegruppen und 336 Mappingzeilen**. Die frühere 335-Zeilenplanung gehörte zum nie adoptierten kombinierten v1-Entwurf. Nach diesen drei weiteren Source-Record-Deltas bleiben **115 vollständige Source-Records** und nach der FW6-008-Entscheidungsersetzung **117 historische Entscheidungen** unverändert. Die alte 118-Beobachtung bleibt unveränderte datierte Geschichte.

## Freeze, Validierung und offene Schritte

Der [Source-/D-Revisionsfreeze](source-description-revision.freeze.receipt.json) wurde vor P-Lektüre erstellt: `2659308f712493ecbfc23311b2e86b4c95666fe03820581daa19e0bb56285b12`.

Beide sechs Felder für Verständnis-/Performanz-/Transferbelege sind gegen den nativen Understanding-Subcontract schema-valid. Das ist weder eine vollständige D2-Prüfung noch eine unabhängige Freigabe der Revision. [validation.json](validation.json) bestätigt zusätzlich Counts, beide partial-Zeilen, erhaltene aktive Inputs, alle 363 bestehenden Atom-Bodies im NI3-Staging sowie die unveränderten alten Freezes.

[adoption-route.candidate.json](adoption-route.candidate.json) beschreibt den nächsten begrenzten Weg: zwei Root-IDs, tatsächliche finale Fingerprints und unabhängige aktuelle Source-/D-/A-/M-Prüfung, tatsächliche Modelldarstellungen/Buchseiten und separate P/V-Gates, dann gekoppelte source/mapping-Adoption mit Bytearchiv außerhalb beider aktiver Scanner. Der operative Source-HOLD bleibt bis dahin offen. `123 mapped` allein darf ihn nicht schließen. Die aktive M6-Untergrenze bleibt während dieser reinen Kandidatenarbeit unverändert; eine spätere Integration muss sie an den tatsächlichen aktuellen Bindungen bestätigen.

[Gesamtreceipt](frozen-receipt.json): `66c4aad982465422c02546c202764311ab1afcf6f98bcaede14736a6d3374c3e`.

Keine aktive Datei geändert, keine menschliche oder Source-Human-Freigabe behauptet, keine P-Inhalte gelesen, keine globale historische Neuprüfung begonnen. Modell-ID/API-Parameter sind lokal nicht zugänglich und wurden nicht erfunden.
