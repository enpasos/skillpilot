# Platz für vollständige CI-Checkouts

Der Frontendjob zu `047ec7fcb9` brach bereits beim Checkout ab. Die tatsächliche
GitHub-Annotation meldet `No space left on device` beim Schreiben des
Runner-Protokolls. Der vollständige verfolgte Arbeitsbaum umfasst rund
42,8 GiB und 209.420 Dateien; Gitdaten und Buildabhängigkeiten kommen hinzu.

Vier Jobs mit vollständigem Checkout entfernen deshalb vor dem Checkout
weitere unbenutzte SDKs und Dockerimages auf dem wegwerfbaren GitHub-Runner.
Python, Java und System-Buildwerkzeuge bleiben erhalten. Alle späteren
Prüfschritte und sämtliche Lehrplan- und historischen Prüfdaten bleiben bestehen.
Block- und Inode-Diagnose sowie eine Platzprüfung vor und nach dem Checkout
machen einen erneuten Kapazitätsengpass unmittelbar sichtbar.

Die Reserven von 66 GiB vor und 8 GiB nach dem Checkout sind begründete
Budgetannahmen, keine bereits gemessene verfügbare Runnerkapazität. Der neue
GitHub-Lauf muss zeigen, ob die tatsächlich freigegebene Kapazität ausreicht.

Beide YAML-Dateien, acht Shellfragmente und zwölf bestehende Workflow- und
APT-Regressionstests bestehen lokal. Keine Bereinigung wurde auf dem lokalen
Arbeitslaufwerk oder auf einem Produktionsserver ausgeführt.

[Übergabe](handoff.json), [Messgrundlage](baseline-input-and-size-evidence.json),
[begrenzter Patch](finite-workflow.patch),
[zwölf Regressionen](existing-workflow-regressions.actual.tap),
[Root-Import](root-import.json). Remote-CI-PASS steht noch aus.
