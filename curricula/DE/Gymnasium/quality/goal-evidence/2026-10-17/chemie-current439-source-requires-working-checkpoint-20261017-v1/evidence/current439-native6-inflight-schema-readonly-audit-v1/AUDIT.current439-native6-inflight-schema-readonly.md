# Native6: lesende technische Ledger- und Schema-Prüfung

Zeit: 2026-10-17T06:54:26.520211+00:00. Ausschließlich administrative Technik; kein Reviewerinput, kein neuer Vote.

Stock und F haben denselben Ledger mit 15 aktiven Batchpfaden und 171 Ziel-Claims; keine doppelten Claims innerhalb derselben Subject-/Basebindung. Ledger-SHA256: `5009d76ffc70449b9df727161c5499277115b72830b59793f489c25add17f72a`.

| ID | Aktive Reservierung | Konkreter vorhandener Kontextabschluss |
|---|---|---|
| 9b56d01e-c2d7-51d8-b78e-237592c1ed20 | nein | resolved; keep_current; eigene Aktualitätsannahme: nein |
| 6966df95-f125-5ecc-af8e-0442545d9f17 | nein | resolved; keep_current; eigene Aktualitätsannahme: nein |
| f0f67a7a-b06a-50b9-8edc-1f2a0d97520d | ja | resolved; keep_current; eigene Aktualitätsannahme: nein |
| 17ab1148-7383-5cab-8b91-73aff795f1e4 | nein | resolved; keep_current; eigene Aktualitätsannahme: nein |
| 93b914d4-747d-5b22-90ff-ac6320514b44 | ja | resolved; keep_current; eigene Aktualitätsannahme: nein |
| e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f | ja | resolved; keep_current; eigene Aktualitätsannahme: nein |

Die drei aktiven Claim-Ausgaben fehlen tatsächlich. Für f0f67, 93b9 und e22a liegen getrennt davon konkrete registrierte native Resolutions mit `status: resolved`, beiden abgeschlossenen Runs, Resultbytes, Dual- und Synthesebindungen vor. Das ist ein historischer Kontextabschluss und kein heutiger F-Akzeptanznachweis.

Das Schema kennt weder im Ledger noch in Batchconfigs State-/Statusfelder. Aktivität folgt allein aus `activeBatchConfigPaths`. Der Loader deaktiviert nichts anhand vorhandener Abschlüsse. `select` lädt den Ledger; `prepare` tut dies im untersuchten Stock nicht. Der bestehende Ledger wurde weder gelöscht, umgangen noch umgeschrieben.

Zwei /proc-/Dateisystembeobachtungen finden 0 passende Befehlsprozesse und 0 passende schreibende Deskriptoren an den drei alten Claim-Ausgaben. Die Ausgaben und zugehörigen temporären Materialisierungen bleiben abwesend. Das ist eine begrenzte Beobachtung, keine Sperre.

Alle exakten Pfade, Hashes, Rundendigestprüfungen, die sechs geordneten Betroffenheiten und ein echtes Stock-Beispielconfig stehen im JSON. Keine Prepare-/Renderer-/Central-/Compiler-/native Validatorausführung; keine Quelle oder Capsule verändert.
