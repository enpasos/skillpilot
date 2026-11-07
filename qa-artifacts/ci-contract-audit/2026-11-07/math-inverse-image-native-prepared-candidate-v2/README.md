# Matrixbild: tatsächlich vorbereiteter und importierter Kandidat V2

Die [neuen PNG-Bytes](ce198bc9-b014-52ba-814f-25cc3e020668.png) wurden mit dem
eingebauten `image_gen`-Tool erzeugt. Der vollständige tatsächliche
[Prompt](actual-generation-prompt.txt) ist erhalten. Die vorhandenen
`visualization:prepare`- und `visualization:import`-Helper wurden bytegleich
in einem eigenen RAM-Projekt ausgeführt, jeweils mit ausdrücklich benanntem
OpenAI-Provider. Die Vorbereitung erfolgte vor dieser zweiten Generierung.
Es wurde kein alter Vorbereitungslauf überschrieben.

[Vorbereitung](native-before.execution.json), ursprüngliche Metadaten und
[Generierung/Import](native-generation-import-receipt.json) dokumentieren den
tatsächlichen Ablauf. Der private Import verändert genau fünf Ressourcenfelder
des Matrixziels; Lernzieltexte, Niveau und übrige Quelle bleiben erhalten.
`967a9cf8…` ist der Eingangsstand, `e4de3c3e…` der wirkliche private
Nachimportstand. Der vollständige Nachimport ist verlustfrei als
`candidate-source.after-native-import.json.gz` erhalten.

Die [Browserausführung](browser-view-execution.json) und die Screenshots bei
360 und 680 Pixeln belegen tatsächlich ausgeführte proportionale
Chromium-Anzeigen. Der zuerst gescheiterte Browserversuch ist separat erhalten
und wird nicht als Ansicht gezählt.

Der [unabhängige aktuelle Review](../math-inverse-image-native-prepared-v2-independent-review/README.md)
hat Original und beide Breiten selbst angesehen und für den Pixelhash
`3d2e99d21ccdc30695657c5778173d6420cce22514cba2f061bddd745d60f091`
KEEP entschieden. Vorherige Pixelstände, das ursprüngliche REVISE und das
visuelle KEEP des ersten, noch nicht korrekt vorbereiteten Kandidaten bleiben
unverändert erhalten.

Kanonische und öffentliche Hostbilder, echte Goalressourcen und aktive
QA-Ledger sind weiterhin nicht ersetzt. Dieser Kandidat ist kein nativer
V-/M7-Pass. Seine technische Qualifikation, die weiteren QA-/Scopebindungen und
die vollständige Anwendung sind eigenständige nächste Schritte.
