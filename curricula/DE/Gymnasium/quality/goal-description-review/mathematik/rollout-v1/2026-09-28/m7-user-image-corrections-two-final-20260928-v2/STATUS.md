# D-Neuprüfung für korrigierte Lernzielbilder

Stand: 28. September 2026. Dieser Batch ist ein **maschinell gültiger D-Nachweis
aus zwei unabhängigen KI-Erstreviews und expliziter Synthese**, aber keine
menschliche Freigabe. Die ältere v1-Vorbereitung
enthält inzwischen überholte Bildbytes; sie wird nicht für Entscheidungen
verwendet und bleibt zur Nachvollziehbarkeit unverändert.

| Ziel | aktueller Bild-SHA-256 | aktueller Seitenfingerprint |
| --- | --- | --- |
| `eb070ed2-7ef4-5afe-b203-190ebb0116af` | `sha256:f2466e2594b783ca21cd08c61b0e99bd8e1dc7603885946456ae0b7ca3af9a5d` | `sha256:d55e1cf6f88e0d36652772377f95347de106658b643261dc1851694a2dfb19c0` |
| `5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d` | `sha256:94d1cc06ba4ac0492aa54dca1604a1b0254113ed665498fad7de317d8b204f7b` | `sha256:2cef6abe050b3ed471a3d09976b4f69b0d0a0e9b6f5df560e2bba2b098505429` |

Die endgültigen Bilder wurden im Originalformat fachlich angesehen: Die drei
Kantenfamilien, Flächen- und Winkelbezeichnungen im Quader stimmen zusammen;
im Divisionsbild sind Konjugation, Zähler, Nenner und Ergebnis mathematisch
gleichwertig dargestellt. Diese Inspektion ersetzt **keine** unabhängigen
Beschreibungserstreviews. `quality:goal-description-rollout-batch prepare` und
`check` bestanden für diese v2-Konfiguration. Ihr Buch-Digest lautet
`sha256:6f7e84c524c13647e70c08bb188136df857b29872795a88ce794be18240d4335`,
der Bundle-Fingerprint
`sha256:0a5935ff7d973f3d1f55636358d1afcb238d32623d6fa45528b26a1b78bde643`.
Der bei der Vorbereitung gebundene Vollbuch-Digest
`sha256:8e2b1292df53f11b09429f39aba9c7f19a876515c563a9b71dc031b457e49ced`
stimmt mit einem danach frisch geladenen Vollbuch überein.

Die beiden blinden Erstreviews wurden für diese exakten Seiten und Bilder
erstellt und nativ validiert. Beide halten die Quaderbeschreibung. Zur
komplexen Division hält Runde A den bestehenden knappen Text, Runde B schlägt
eine präzisierende, aber für alle Divisionsfälle zu verfahrensfeste Formulierung
vor. Die Synthese hält den aktuellen Text mit einem ausdrücklich begründeten
`revisionDissent`; kein alter Reviewhash wurde einfach übernommen. Neue
Resolutionen und der Zwei-Ziel-Index wurden nativ materialisiert und in der
zentralen Konfiguration aktiviert. Die bisherigen Sammelindizes sind dort
durch unveränderte Restmengen ohne diese beiden Ziele ersetzt; historische
Originale bleiben erhalten. Der zentrale Report besteht mit Mathematik
**772/799** strikt, D **772/799**, null Blockern. Das ist keine zusätzliche
Fortschrittsgutschrift, sondern die aktuelle Neubindung zweier schon gezählter
Ziele.

Ein separater Integritätsbefund bleibt offen: Der zentrale D-Validator gleicht
alte Reviewseiten derzeit nicht mit der **aktuellen** primären Bild-URL und
dem aktuellen Bilddigest ab. Ein read-only-Vergleich der 772 aktiven
Mathematik-D-Resolutionen **vor dieser Zwei-Ziel-Aktivierung** gegen den
aktuellen QA-Bestand fand **27** solche Abweichungen: 20 ohne Bild im alten
Review bei jetzt vorhandenem Bild, fünf mit geändertem URL und Digest
(einschließlich der zwei inzwischen ersetzten Altresolutionen) und zwei mit
unverändertem URL, aber geändertem Digest. Für die übrigen 25 Fälle ist
noch keine entsprechende Neubegutachtung belegt. Ein allgemeines
Fail-closed-Gate würde ohne weitere Neubegutachtung bis zu 25 aktuelle
D-Gutschriften und damit den geschützten M6-Stand entziehen. Die
allgemeine Validatoränderung samt Regressionstests und Neubegutachtung dieser
übrigen Altbindungen muss als eigener expliziter Schritt erfolgen; dieser
Zwei-Ziel-Batch behauptet keine globale Lösung des Befunds.

### Konkrete Restliste der Bildbindungen (read-only-Audit nach D-774-Stand)

Der Vergleich der 774 **aktiven, eindeutigen** strikten D-Resolutionen mit
`goal-visualization-qa/mathematik.qa.json` ergibt weiterhin genau 25
Abweichungen. Grundlage ist jeweils `reviewContext.page.visualization` der
aktiven `round-a/description-review-input.json`, verglichen mit `imageUrl`
und `assetSha256` des aktuellen QA-Records derselben Ziel-ID. Die Liste
belegt nur eine veraltete Bildbindung, nicht automatisch einen fachlichen
Fehler im Text. Keine der alten D-Resolutionen wurde durch diesen Audit
nachträglich freigegeben oder deaktiviert.

- Früheres Review **ohne Bild**, jetzt mit Bild (20):
  `e105bad8-b4e5-53fc-b02e-604f1df5b503`,
  `3256476b-ec65-4038-9f5a-a8808fbcf207`,
  `a506fc1d-b784-548f-90c3-5aae1b819b68`,
  `5619ca5b-dc2a-504e-ad89-2e0ca0a83822`,
  `fdce0ced-46a0-594a-9b5d-d2dc18e5e473`,
  `79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16`,
  `8b3ce429-e6bb-5d33-b6aa-6ded41afc74c`,
  `075f1ef2-6860-4b20-9df2-878157eb395e`,
  `e7350739-c89f-5c7b-b4d1-717d6a767298`,
  `164921f6-3bf7-5efc-a438-ea4759dca9ef`,
  `b71c332f-ef9d-5c27-983b-7103269ff419`,
  `47400de4-b0e4-5bb6-a1bd-bd2beee616bb`,
  `5bced7dc-6557-4af1-9e70-d87f850d3b7f`,
  `3bfc2747-03e2-57db-b13f-01f78835eefd`,
  `743e5470-ff39-551e-9aba-529656418c66`,
  `f509a549-aee5-5468-af73-5b1efa3f342c`,
  `fc047e6e-5d6d-460f-99fc-ade3a23b9a8e`,
  `36728db8-da44-4add-97b8-0fdd7cfd9c41`,
  `e663cc67-5249-55db-b103-357b58a1ca91`,
  `f9e21454-857c-5a6a-8367-32a34fc0026b`.
- Bild-**URL und Digest** geändert (3):
  `1b70498a-62a0-5a84-99dd-476b8af68da6`,
  `1dd0266c-41b4-5481-b64b-7b718cfe799b`,
  `d98849c7-bd0b-50d4-90aa-6293a3adb211`.
- Gleiche Bild-URL, **Digest** geändert (2):
  `cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa`,
  `f52e9d72-4995-5c80-91d2-7761ea0cbec0`.

Vor einer allgemeinen Fail-closed-Regel müssen diese 25 Ziele jeweils mit
aktuellem Bild neu beurteilt und die aktiven Indizes gezielt umgebunden werden.
