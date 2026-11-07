# Source-A: kleiner privater Capture-Schritt

Der Vorbereiter erfasst Binärbytes jetzt in eigenen privaten Inodes gegen die gepinnten Gitobjekte, statt Hostdateien einzubinden oder hart zu verlinken. Private Assetgruppen teilen ausschließlich private Daten. Ein vollständiger Hardlinkvergleich verhindert auch die Wiederverwendung eines gleich gehashten, aber noch mit dem Host verbundenen Inodes.

Installierte Dependencies werden einmal privat mit einem extern angenommenen Baumdigest erfasst. Der Git-authentifizierte package-lock wird getrennt gebunden; die installierten Bytes werden nicht als Gitquellen ausgegeben. Der Launcher verlangt einen externen Vorbereitungspin, verdeckt den Host-Worktree, bindet nur explizite Gitobjekte wieder ein und schützt die Eingaben vor Schreibzugriffen. Run und Extend sind gegenseitig gesperrt.

Der finale kleine Testlauf ist terminal grün: **14/14 Kontrollen, null Skips**. Das umfasst die vorherigen zwölf sowie zwei zusätzliche Kontrollen gegen Hosthardlinks und Dependencyänderungen während der Erfassung. Vier Testmethoden führen tatsächlich bwrap aus; ein kleiner realer Gitbaum prüft zudem die private Materialisierung, eine eigene Kandidatenprojektion und den vollständigen Index bei nur ausgewählten physischen Dateien. Dies ist kein künstlich freigegebener vollständiger Source-A-Beweis.

Es wurde kein großes Paar kopiert und kein vollständiger Kandidaten-QA-Produzent gestartet. Grundlage bleibt der eingefrorene 5c9-Beweis mit Info f95; E9, der spätere CQR-Gatepatch und weitere heutige Änderungen brauchen ihren neuen Beweis. V1, Schema, Verifier, aktive Quellen und vorhandene QA-Records bleiben unverändert. Identitätsleseadapter, vollständige tatsächliche Leseinventur und weitere Laufzeitbindungen gehören zum nächsten freigegebenen Schritt. Vor einer großen Materialisierung werden Ressourcen und Safepoint erneut abgestimmt.

[Codepins, Kontrolllog und Grenzen](source-identity-private-capture-step-2026-11-06.json)
