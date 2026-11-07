# Kleinster bestehender D15-Folgeweg

Es gibt im vorhandenen aktuellen D-Vertrag keine bloße Bestätigung veränderter
`requires` durch einen Closurebeweis. Der kleinste unveränderte Weg ist **ein
neuer Standalone-Batch für genau diese 15 Ziele, mit zwei echten unabhängigen
aktuellen Runden und anschließend 15 neuen, begründeten Resolutionen**. Die
Beschreibungen dürfen unverändert bleiben. Unveränderte Bedeutung und
Prerequisite-Erreichbarkeit sind gute fachliche Gründe, die der Koordinator
kennt; sie ersetzen die von D verlangten aktuellen Kontextbelege nicht.

Dies ist ausschließlich eine Schnittstellenprüfung. Es wurden weder neue
D-Inputs/Runden erzeugt noch Reviews, Synthesen oder Produzenten ausgeführt.
Die aktuelle statische D-Diagnose steht im separat versiegelten Kindpaket
`../math-g17-fifteen-semantic-kind-independent-review/additional-D-freshness-hold.json`.

## Aktuelle Eingaben und vorhandene Schnittstellen

1. Eine neue private Batchconfig nach
   `contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json`
   mit den exakt 15 IDs in einer festgeschriebenen Reihenfolge und einem neuen
   Ausgabeordner verwenden. Der volle Mathematik-Basis-GoalBook muss zur
   Source15 und zum neu geprüften 1252-Zeilen-Kindledger passen. Das ist in einem
   kohärenten privaten Overlay möglich; keine aktive Quelle muss ersetzt werden.
   Die native Basis prüft vollständige aktuelle `curricularAtomic`-Abdeckung
   (807 Seiten), der tatsächlich zu reviewende Ausschnitt umfasst nur 15.
2. Vorhandener Einstieg:
   `materializeGoalDescriptionRolloutBatch.ts prepare --config <neue-private-config>`.
   Die Funktion `prepareGoalDescriptionRolloutBatch` baut aus dem aktuellen
   Basis-GoalBook das 15-Seiten-Modell, HTML/PDF mit Renderbelegen, Bundle und
   beide Round-Gerüste. Sie verwendet `createGoalDescriptionReviewCampaignArtifacts`
   und denselben vollständigen aktuellen V3-Beschreibungskontext in beiden
   Runden. Dieser `prepare`-Pfad ruft keinen zentralen D/P/A/M/V-Produzenten auf.
   **Den `select`-Pfad nicht benutzen:** Die Ziele sind bereits exakt bestimmt;
   `selectGoalDescriptionRolloutBatch` ruft `generateDeepUnderstandingRollout` auf.
3. Der aktuelle gebundene Reviewprompt bleibt
   `curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md`,
   die Fachkriterien bleiben
   `curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md`.
   Prompt/Kriterien/Recordschema werden im frischen Bundle gebunden. Die aktuellen
   Quellen-/Ziel-/Seiten-/Bundle-/Batchfingerprints werden vor Reviewbeginn nativ
   erzeugt. Ein alter GoalBook oder alte V3-Kontexte werden nicht umetikettiert.

## Runden und tatsächliche Akteure

Der konkrete aktuelle Standalone-Builder setzt für A und B jeweils
`reviewerRole=internal_ai_reviewer`, `reviewPass=first_pass`,
`blindToOtherReviews=true` und unterschiedliche `campaignId`, `roundId` und
`independenceGroupId`. Beide Runden müssen denselben vollständigen Bundle und
V3-Input sowie dieselbe Zielreihenfolge binden. Ein `follow_up` oder
`synthesizer`-Run kann keine dieser beiden Runden ersetzen.

Zwei separate Reviewer beginnen ohne die bisherige Konversation. Sie erhalten
nur ihre gebundenen aktuellen Batchunterlagen, Prompt, Kriterien, Schema und
die zugehörigen aktuellen Seiten/Materialien. Der Prompt verbietet ausdrücklich
andere Revieweroutputs, frühere Runden, Adjudikationen und den kanonischen Diff.
Der Root-Koordinator und der Autor dieses Kindreviews haben solche Informationen
gelesen und können deshalb nicht nachträglich als blinde Reviewer gelten.
Auch ein Review derselben Inhalte in zwei Dateien durch denselben informierten
Akteur erfüllt diese Unabhängigkeit nicht.

Je Reviewer und Ziel entsteht ein **inhaltlich neuer** Datensatz: 15 pro Runde,
30 insgesamt. Alle Kriterien gelten weiter. Er enthält die sechs
zielbezogenen DE/EN-Felder für wesentliches Verständnis, unabhängig beobachtbare
Leistung und sinnvollen Transfer, begründetes `keep`, `revise`, `split_review`
oder `block`, die bestehende Profil-Empfehlung und alle nativen Bindungen.
`recordStatus=candidate` und `reviewAuthority=ai_candidate` bleiben erhalten.
`keep` ist bei passenden unveränderten Texten erwünscht, wird jedoch nicht vorgegeben.
Die Prüfung darf weder auf ein Hashurteil verkürzt werden noch nur die Aussage
„Closure unverändert“ in alle Felder kopieren.

Neue Runmanifeste nach `goal-evidence-ai-run-manifest.schema.json` binden
wirklichen Provider/Modell, eine passende Reviewrolle (etwa `subject_reviewer`
oder `didactic_reviewer`), neue runIds, getrennte independenceGroupIds,
`blindToOtherRuns=true`, tatsächliche Start-/Endzeiten, echte Ausgabe- und
Inputdigests, Prompt/Kriterien/Parameter und Toolchain. Alle recordIds und
runIds müssen über beide Runden eindeutig sein. Zusätzliche agentenspezifische
Actorbelege bleiben in einem externen Ausführungsreceipt, sofern das geschlossene
Manifest kein entsprechendes Feld hat. Keine Modellidentität oder Zeit erfinden.

Der bestehende aktuelle Standalone-Pfad nutzt für `validateGoalDescriptionReviewDualRound`
die Defaultpolicy **`report_only`**. Verschiedene Provider oder Modelle sind daher
für diesen konkreten Maschinenpfad keine zusätzliche technische Pflicht; zwei
tatsächlich unabhängige neue Runs derselben Modellfamilie können ihn erfüllen.
Eine explizit gewählte Policy `require_distinct_provider_or_model` muss dagegen
disjunkte Provider oder exakte Modellidentitäten nachweisen. Das ist von der
allgemeinen früheren Atlas-V1/V2-Strategie mit externer Runde zu unterscheiden;
interne Runden werden nicht als externe Prüfung oder menschliche Freigabe verkauft.

## Synthese und begrenzte native Prüfung

Nach beiden abgeschlossenen Runden:

```text
materializeGoalDescriptionRolloutBatch.ts summarize --config <config> --write
materializeGoalDescriptionRolloutSynthesisManifest.ts --config <config> --authoring <neue-echte-synthese> --write
materializeGoalDescriptionRolloutResolutions.ts --config <config> --synthesis-manifest <neues-manifest> --write
materializeGoalDescriptionRolloutBatch.ts finalize --config <config> --write
```

Die Aufrufpräfixe sind `node app/node_modules/tsx/dist/cli.mjs app/scripts/`;
die Platzhalter oben sind keine ausgeführten Befehle. Der Synthesisakteur ist
von den beiden blinden Rollen getrennt und darf danach beide Outputs sehen.
`authority=ai_synthesis`, `humanAttestation=null`, tatsächliche Identität sowie
begründete zweisprachige Entscheidungen und offene/aufgelöste Dissents sind zu
führen. Der Bestand erlaubt bei unverändertem Text `keep_current` aus
KEEP/KEEP; auch zwei KEEP-Records können inhaltliche Dissents enthalten, die
ausdrücklich entschieden werden müssen. Genau ein KEEP plus ein REVISE ist
nur mit der bereits implementierten exakten, begründeten Zurückweisung des
Revisionsdissents im Synthesemanifest zulässig. SPLIT/BLOCK und ungelöste
Dissents ergeben keinen Abschluss. Kein Konsens darf vorab angenommen werden.

Der Synthesematerialisierer setzt sein `synthesizedAt` derzeit deterministisch
auf das späteste Round-`completedAt` plus 1000 ms (`synthesisTimestamp`). Dieser
abgeleitete Artefaktzeitpunkt ist kein gemessener Synthesezeitpunkt. Falls dieser
Helper benutzt wird, muss ein separater Ausführungsbeleg den wirklichen
Syntheseakteur und die tatsächliche Bearbeitungszeit nennen; alte Roundzeiten
dürfen nicht manipuliert werden, um einen gewünschten Synthesezeitpunkt zu erzeugen.

`validateGoalDescriptionDualRoundResolution` beziehungsweise die bestehende
Bindings-Schnittstelle prüft gegen das echte aktuelle Source15-Goal. Der
Standalone-Index hat `schemaVersion=2`, höchstens 20 Ziele, einen eigenen
Gruppenbeitrag und keinen erfundenen globalen Abschlusszähler. Auf diesen
neuen begrenzten Pfad beschränkte Checks sind von Roots späterem genau einem
kombinierten kalten Produzentenlauf zu trennen.

## Registrierung ohne historische Umschreibung

Die zehn alten Indizes, beide alten Runden und alle alten Resolutionen bleiben
bytegleich und registriert. Zum aktuellen privaten Nachfolger kommt der neue
15er-Index hinzu. Für jedes dieser 15 Ziele wird über die bereits vorhandene
`resolutionSupersessions`-Schnittstelle eine Kante vom bisherigen aktuellen
Index zum neuen Index aufgenommen. Der vorhandene Code verlangt je Ziel eine
lineare vollständige Kette und genau einen aktuellen Anspruch. So behalten die
übrigen alten Ziele ihre vorhandenen Beiträge; kein ganzer Altindex muss
umgeschrieben oder dessen Restmenge neu begutachtet werden.

Der diagnostische `goal-description-scope-narrowing-compatibility`-Vertrag ist
auf ein enges GK-Applicability-Narrowing beschränkt, erklärt sich ausdrücklich
nicht zur Dual-Round-Resolution und bietet keinen requires-Closure-Ersatz.
Er ist hier keine Abkürzung. Kein Validator, Rohrelationenvergleich,
Blindheitsanspruch oder historischer Record wird geändert.
