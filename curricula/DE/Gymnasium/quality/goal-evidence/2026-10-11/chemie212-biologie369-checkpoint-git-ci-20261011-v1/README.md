# Git-/CI-Integration des geprüften Zwischenstands

Dieser technische Integrationslauf bringt den bereits unabhängig geprüften
Zwischenstand Chemie 212/402 und Biologie 369/395 auf `main` und verfolgt danach
den zugehörigen GitHub-CI-Lauf. Der Fortschritt besteht aus sechs neuen fachlichen
Chemie-Abschlüssen und drei neuen fachlichen Biologie-Abschlüssen; vier weitere
Chemie-D-Bindungen wurden wiederhergestellt. Mathematik, Physik und
Wirtschaftswissenschaften bleiben bei ihren erreichten maschinellen M7-Ständen.

Grundlage ist der versiegelte Staging-Vorschlag aus
`chemie-stable-biologie369-checkpoint-dependency-qs-20261011-v1`, ergänzt um das
dort belegte HE-Primär-PDF. Neue Bio8-, Natur8- und Medizin10-Kandidaten sind
außerhalb dieses Commits. Der normale vollständige Fünf-Bücher-Build ist bereits
erfolgreich; vor dem Commit werden normal Validate Schemas und
`git diff --check` ausgeführt.

Dieser Lauf gewährt keine neue Fachfreigabe, keine menschliche Prüfung oder
Erprobung, keinen M7-Abschluss für Chemie/Biologie und keine Veröffentlichung im
Plugin-Portal. GitHub-Status wird nur für tatsächlich abgeschlossene Jobs am
betroffenen Commit berichtet.

The normal schema validation passed for 90135 files. The staged whitespace check
passed after extending existing generic byte preservation to native normal reports
and normal-renderer HTML captures. Three original captured outputs retain their
sealed bytes; no scientific evidence or quality gate was changed.
