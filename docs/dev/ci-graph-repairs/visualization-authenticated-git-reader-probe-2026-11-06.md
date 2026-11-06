# V-Originaleingaben: Rohobjekte statt Git-Auskunft authentisieren

Der [getrennte Nachfolgerbeleg](visualization-authenticated-git-reader-probe-2026-11-06.json)
schließt zwei vollständig reproduzierte Akzeptanzlücken im unverdrahteten
Reader. Manipulierte Review-Blobbytes unter dem ursprünglichen OID wurden
akzeptiert. Dasselbe galt für manipulierte Treebytes, die den ursprünglichen
Pfad auf einen anderen, für sich gültigen Blob umleiteten. Ohne diese
ODB-Manipulation blieb derselbe freie Receipt-/Beschreibungsmutant rot.

Der Reader prüft nun selbst das Git-Framing samt SHA1 jedes ausgewählten
Commit-, Tree- und Blobobjekts. Die echte Elternkette führt vom externen
akzeptierten Commit zum Originalcommit. Authentisierte Treeeinträge belegen jede
exakte Pfadkomponente; der Originalblob erhält zusätzlich seinen SHA-256-Abgleich.
`merge-base` und `ls-tree` liefern keine ungeprüfte Autorität mehr.

Alle zwölf Kontrollen bestehen. Blob-, Tree- und Commitmanipulationen scheitern
jeweils ausdrücklich am passenden OID-Nachweis. Der ältere Reader hatte den
zusätzlichen Commitfall schon bei der Ancestryprüfung abgewiesen; eine frühere
Akzeptanz dieses Falls wird nicht behauptet. Die 18 historischen Positivketten,
26 bestehenden Gegenkontrollen, der echte B-Fall mit zehn Negativen und der
fokussierte strikte Typecheck bleiben grün.

Auch der neue Reader besteht die 18 Fälle in demselben tatsächlich flachen
privaten Repository. Die bereits separat committete Kapsel und ihr ausdrücklich
historischer `f83`-Replay bleiben unverändert. Der neue Readernachweis wird
separat gespeichert und ersetzt keine alten Codepins oder Ergebnisse.

Authentisierte Commit-/Treebytes bleiben innerhalb der Verifierinstanz
unveränderliche Eingaben; Bild-/Blobbytes werden nicht unbegrenzt global
gespeichert. Replace-Refs, Graftdateien und geerbte Git-Repository-/ODB-Umlenkungen
bleiben deaktiviert.

Der unabhängige B-/ODB-Zweitblick steht noch aus. Bestehende V-/Deep-/M7-/UI-/
Workflow-Verbraucher sind weiterhin unverändert; die produktive Kontextlücke ist
daher noch nicht geschlossen. Aktive Quellen, QA-Daten, Zustände und historische
Freigaben bleiben unangetastet. Es wird kein pauschaler V- oder M7-Pass behauptet.
