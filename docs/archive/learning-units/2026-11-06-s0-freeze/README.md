# Eingefrorener Einheitenstand vor dem eigenständigen CI-Auftrag

Am 6. November 2026 hat der Product Owner die Einheitenarbeit angehalten:
Zuerst soll das eigenständige Thema der deterministischen Konzeptregeln und
ihrer tatsächlichen CI-Durchsetzung erledigt werden. Das Einheiten-Goal ist
pausiert. Dieser Stand ist ein gesicherter Zwischenstand, keine Freigabe.

Der Branch `docs/learning-units-restart-20261106` und Draft-PR #83 bewahren
Konzeptkorrektur, neuen Umsetzungsplan, mathematische Referenz, PNG-Diagramme,
PDF und die technischen S0-Inventare. Es wurde keine neue Einheitenruntime
und keine Curriculumzerlegung umgesetzt. Der vollständige Fachabschluss
Mathematik/Physik sowie S0 sind nicht erreicht.

[review-notes.zip](review-notes.zip) sichert die Astra-/Sol-Analysen,
das technische Eingabeinventar und den unterbrochenen Regelzensus.
Die interne `manifest.json` bindet jede enthaltene Datei per SHA-256.
Das normative Inventar ist **unvollständig**: zum Einfrieren sind 147 Regeln
erfasst; Plan-/Perioden-, Quellen-/QA-/Bild-/Buch- und Paketblöcke müssen noch
systematisch ergänzt und vollständig gegen CI abgeglichen werden.
Die technische Berichtssammlung ist keine abgeschlossene Regel-zu-CI-Matrix.

Die externen Originaleingaben und zwei fixierten CSV-Fassungen bleiben lokal
unter `tmp/aa_input/source-versions/` erhalten. Ihre Identität steht in den
gesicherten Inventaren. Das ZIP veröffentlicht diese Eingaben nicht zusätzlich.
Umfangreiche ältere Sicherungen bleiben an den im Neustartpapier beschriebenen
Orten erhalten. Es wurde nichts bereinigt oder verworfen.

Der neue CI-Arbeitszweig beginnt separat auf `origin/main`. Seine Übergabe
steht in [CI-Vertragsaudit: Übergabe](../../../dev/ci-contract-audit-handoff-2026-11-06.md).
Die auf diesem Einheitenbranch vorbereiteten Solländerungen dürfen dort nicht
unbemerkt als bereits in main implementierter oder geprüfter Vertrag gelten.
