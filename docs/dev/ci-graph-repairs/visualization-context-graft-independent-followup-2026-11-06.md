# Zusätzliche Git-Graft-Grenze des V-Kontextkerns

Der von Root separat gefundene Graftfall ist im Kern `a375d017…` unabhängig
nachgeprüft und geschlossen. Die früheren Gegenbelege bleiben unverändert:
Sie dokumentieren ihre damaligen Owner-/Replace-Kontrollen und behaupten keine
Prüfung dieses zusätzlichen Git-Mechanismus.

Der vollständige neue Achtertest wurde zuerst mit dem erhaltenen Kern
`94d728fa…` in einem privaten, schreibgeschützten Overlay ausgeführt. Genau
der Graftfall wurde unerwartet akzeptiert: Eine lokale `.git/info/grafts`
machte einen nie akzeptierten, manipulierten Reviewcommit scheinbar zum
Vorfahren des extern festgelegten Basecommits. Ohne Graft wurde derselbe
Reviewcommit korrekt abgewiesen. Dieser tatsächliche Vorlauf endete mit
Exitcode 1.

Nach der Korrektur laufen beide Git-Aufrufpfade mit ausgeschalteten Grafts
und Ersetzungen sowie ohne geerbte Git-Verzeichnis-/Objektspeicherumleitungen.
Derselbe Achtertest endete unabhängig mit Exitcode 0 und ohne unerwartete
Akzeptanz. Auch die 18 echten historischen Positivfälle und 26 vorhandenen
Negativkontrollen wurden erneut erfolgreich ausgeführt.

Der [gebundene Nachtrag](visualization-context-graft-independent-followup-2026-11-06.json)
enthält aktuelle Codepins, echte Vorher-/Nachher-Logs und die genaue
Prüfgrenze. Die Mutation betraf ausschließlich ein privates RAM-Gitrepository;
aktive Quellen, QA und historische Originalbelege wurden nicht geändert.
Die spätere Consumerverdrahtung und weitere Reviewprofile bleiben eigene
Prüfgegenstände. Dies ist kein neuer Bildreview und kein vollständiger
V-, M7- oder CI-Pass.
