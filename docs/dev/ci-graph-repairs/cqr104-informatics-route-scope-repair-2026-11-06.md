# CQR104: Informatik nach Land und Kurs prüfen

Die Meilensteinprüfung verwendet für Informatik jetzt den vorhandenen
`compiled-jurisdiction`-Modus. Erwartete Endpunkte berücksichtigen außerdem den
vorhandenen Kurs-/Dauerfilter, der bisher nur für Wirtschaft wirkte. Es werden
keine Quellen, Views, Zielmengen oder Prüfungsidentitäten geändert.

Der echte Nativvergleich zeigt:

| Informatik CQR104 | Vorher | Nachher |
| --- | ---: | ---: |
| tatsächlich geprüfte Projektionen | 18 | 48 |
| leere anwendbare Endpunktmengen | 0 | 42 |
| Status | pass | fail |

Die sechs nicht leeren Kontexte passen exakt; kein Endpunkt fehlt oder ist
unerwartet. Alle elf anderen vollständigen Routenprofilberichte und sämtliche
anderen Informatikregeln sind vor/nachher exakt gleich. Die
[Quittung](cqr104-informatics-route-scope-repair-2026-11-06.json) bindet alle 48
einzeln nativ geprüften Kontexte, einschließlich der 42 Leerstellen. Der normale
Bericht behält seine unveränderte Begrenzung auf 20 Detailbeispiele. Der
[schreibfreie Integritätsreplay](verify_cqr104_route_endpoint_scope_repair.py)
prüft die gebundenen Nachweise; mit `--check-current-inputs` fordert er zusätzlich
exakt den untersuchten aktuellen Quellen-/View-/Codekontext.

Zwei echte rote Regressionen sind erhalten: zuerst fehlende Länderprojektionen,
danach die falsche Forderung der jeweils anderen GK-/LK-Prüfung trotz korrigierter
Länderprüfung. Mit beiden Korrekturen bestehen die nativen Positivkontrollen;
fehlende Landes-/Kursendpunkte, leere Pflichtmengen und fehlende kompilierte
Anwendbarkeit bleiben rot. Die bestehende Scope-Ableitung begrenzt diese Fehler
auf M2. Die gültige kleine Fixture behält ihre separate Legacy-CQR203-Warnung
und bleibt M3; fehlender `reviewStatus` wird nicht nachträglich umgedeutet.

Der normale Aufruf `npm run test:deep-understanding-rollout` ist terminal grün
und führt den neuen Test tatsächlich aus. Die fünf vorhandenen Denominatoren
807/478/397/455/346 bestehen. Der TypeScript-Vergleich hat unverändert 48
bestehende Fehler und keine neuen; ein insgesamt grüner Typecheck wird nicht
behauptet.

Eine ausdrücklich unregistrierte Zusatzdiagnose mit den zwei bestehenden
Abiturangebotsclustern als weiteren Routenclustern zeigt noch sechs fehlende
Kontexte. Diese Profilvergrößerung wird nicht angewandt und ist kein Ersatzgate.
Die neue GK-ID aus dem getrennten E25/GK24-Vorschlag wird hier nicht eingeführt.
Die 42 vorhandenen Leerstellen sind weiterhin echte offene Arbeit; daraus folgt
keine M6-/M7- oder Inhaltsfreigabe. Ein gesamter CQR-Producer wurde in diesem
Reparaturblock nicht gestartet.
