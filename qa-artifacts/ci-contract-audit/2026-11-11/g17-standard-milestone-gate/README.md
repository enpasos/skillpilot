# Standard-G17-Gate: tatsächlicher Zwischenlauf

Code: `15f74ef5641cb665e1e9a8f447a9176ed546e070`. Der reguläre Producer samt Vorlauf wurde unverändert mit
`npm run quality:curriculum-status` ausgeführt; anschließend lief
`npm run check:curriculum-maturity-floors`. Alle 21 Kataloge wurden ausgewertet.
Der Producer endet mit Exit 0, die Untergrenzenprüfung mit **Exit 1**.
Die vier noch unreparierten geschützten Fächer sind damit tatsächlich gesperrt.
Keine Untergrenze oder Ausnahme wurde geändert.

| Fach | Ergebnis mit G17 | Geschützte Untergrenze |
| --- | --- | --- |
| Mathematik | M7 | M7 |
| Physik | M7 | M7 |
| Biologie | M7 | M7 |
| Chemie | M7 | M7 |
| Deutsch | M6 | M6 |
| Geschichte | M0 | M6 |
| Informatik | M0 | M6 |
| Latein | M0 | M6 |
| Politik und Wirtschaft | M0 | M6 |
| Wirtschaftswissenschaften | M7 | M7 |

Alle globalen Graphfehler begrenzen auch sämtliche erzeugten Fachscopes auf M0.
Ungültige experimentelle Kataloge erhalten keinen Graphpass. Core-, 13 CLI-
und 14 Integrationsregressionen bestehen; ihre gebundenen Eingaben blieben gleich.

Die Quellen des gestarteten Arbeitsbaums entsprechen bytegenau dem oben
genannten, während des Laufs gesicherten Codecommit. `runHeadAtStart` bleibt
unverändert als damaliger Git-Head erhalten; dies ist kein Nachweis eines
geschlossenen Dateizugriffsraums.

Dieser Beleg bestätigt die tatsächliche Standardanbindung und Fehlerwirkung.
Die Aufnahme der verbleibenden Fachreparaturen, fünf M7- und fünf M6-Ergebnisse
unter diesem Gate sowie frische Pflicht-CI und Lieferung auf Main bleiben offen.
Der PR hat vorübergehend den Wirtschaftsbranch als Basis und ist bis dahin
nicht mergefähig. Es wird keine vollständige Goal-Abnahme behauptet.
