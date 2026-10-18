# AUTHOR: 62 BY-Quellen/View-Bindungen

**Status: bewertbarer Kandidat mit offenem Placement-HOLD; keine Normalintegration oder neue Quellen-/D/P/A/M/V-Freigabe.**

## Begrenzter Vorschlag

Eine Kopie der aktuellen `de-by-lk.current-pilot.view.json` erhält genau zwei zusätzliche Strukturen: das bestehende BcP-Angebot und die bestehenden C11-NTG-Ziele zu Lebensmitteln/Pharmazie. Der technische LK-CrossStage-Pilot ist hier das breitere SkillPilot-Ziel nach der Ownerentscheidung vom 16.10.2026. Daraus entstehen weder eine amtliche allgemeine GK/LK-Pflicht noch ein Nachweis einer tatsächlichen Kurs-/Themenwahl. C10 bleibt unverändert.

| Tatsächliche pure Laufzeitprojektion | vorher | Kandidat | Delta |
|---|---:|---:|---:|
| Fachliche Zielatome | 263 | 301 | +38 |
| Vorhandene Memory-Ziele | 28 | 31 | +3 |
| Der 62 Zeilen ohne Zielintersection | 62 | 0 | −62 |

Die vollständige heutige atomare Zielclosure jeder der 62 vorhandenen Quellzuordnungen ist sichtbar. Drei bereits referenzierte enge Memory-Einheiten der Stereochemie werden mitplatziert; keine neuen Karten oder M-Urteile. Alle bisherigen sichtbaren Ziele und der View-Scope bleiben erhalten.

## Amtliche Grenzen und erhaltene HOLDs

- [BcP12/13](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biolog-chem-praktikum) ist ein eigenständiger Praktikumskurs. Pro Jahr mindestens drei Bereiche2–7, ausgewogen Bio/Chemie, Bereich1 an geeigneter Stelle. Die Erwartungen/Inhalte sind Anregungen; nicht alles ist verpflichtend. Die 42 Zeilen sind21 je Jahr wiederholte Kompetenzen, keine42 unabhängigen Pflichtgegenstände.
- [Chemie11](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie) ist NTG-Jahrgang11. Die20 hier erfassten Zellen werden nicht zu GA/EA-Q12-Belegen umgedeutet. Rohes `courseLevel: unspecified` und sämtliche Mappingmetadaten bleiben unverändert.
- Die vorhandenen breiten Clusterzuordnungen sind keine neue Ganzziel-/Ganzquellenfreigabe. Zusätzliche Reichweite heutiger Zieltexte wird offen genannt: insbesondere Polarimetrie-Konzentration/Unsicherheit und der dritte Stereochemie-Unterpunkt. Die vorhandenen unabhängigen historischen C15-S01–S03-HOLDs werden nicht durch neue Hashes oder aktuelle D/P-Metadaten geschlossen.
- **Offener Placement-HOLD:** C11.2.6 / Quelle `383bfcc7-41cb-5694-95a3-a7a7e75bbd95` → Polarimetrie `f4d5a02d-711b-5a6b-a41d-971359c1f64d`. Dessen vorhandener Voraussetzungsknoten `8761cfd2-aa1a-56f1-9272-9cf66ef4b271` hat drei Kohlenhydratatome, die in dieser View keine Targets sind. Die Kante bleibt exakt erhalten. Es wird keine Target-/prerequisiteOnly-Rolle aus `requires` abgeleitet. Die unabhängige Prüfung muss die tatsächliche Vorwissensroute vor Integration entscheiden.
- Die15 anderen in der Diagnose fehlenden direkten Voraussetzungsknoten sind derselbe Sicherheitscluster; seine beiden Atome sind schon im heutigen Target enthalten. Dafür ist kein neues Ziel nötig.

## Endliche Belege

- `MATRIX.by62-source-target-closure-and-placement.author.json`: alle62 ganzen Quelltexte, Quellenpfade, Ziele, ganze atomare Closures und individuelle Grenzen/HOLDs.
- `INPUTS.finite62-whole-sources-current-goals-and-active-DP-bindings.json`: ganze relevante heutige Quell-/Ziel-/Mappingobjekte plus aktive D450-Owner-Auflösung und bestehende P/M-Metadaten. Bei allen38 Atomen stimmen die aktuellen bilingualen Zieltexte mit ihrer aktiven D-Auflösung überein; die bestehenden P-Bindungen benutzen denselben Zielfingerprint. Das ist kein neues Fachreview.
- `PRIMARY.live-source62-text-identity-and-course-read-receipt.json`: tatsächlicher aktueller Abruf beider Primärseiten; alle62 ganzen Textstrings stimmen unter ausschließlicher Entfernung von Unicode-Whitespace überein. Vollständige fremde HTML-Kopien liegen nur im lokalen tmp, nicht in diesem Paket.
- `EVIDENCE.existing-independent-boundaries-and-present-text-comparison.author.json`: echte ältere unabhängige Scope-Grenze und historische S01–S03-Findings mit heutiger begrenzter Textgegenprüfung; kein automatisches Aufheben.
- `DELTA.actual-pure-runtime-targetsets-and-source62-intersections.author.json`: vollständige Before/After-Mengen,38/3 Zusätze,0 Entnahmen,62 vollständige Intersections, tatsächliche Voraussetzung-Closure-Diagnose.
- `RECEIPT.finite-author-execution-and-current-input-pins.json`: erneute Pinprüfung aller endlichen referenzierten Eingaben und tatsächlicher Befehl/Exitcode. Keine ganzen Compiler-/CQR-/M7-Läufe.

Reproduzierbarer rein funktionaler Zielmengenbefehl ab Repositorywurzel:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BY-source-view-binding-author-20261018-v1/tools/pure-targetsets.ts
```

## Matrixkurzsicht

Alle Vorschläge benötigen unabhängige Quellen-/Kurs-/Placement-Prüfung. „HOLD“ ist zusätzlich die konkret ungelöste Vorwissensroute; weitere Ganzquellen-/Operator-HOLDs stehen zeilenweise im JSON.

| Nr. | Quellstelle | Quellen-ID | vorhandene Zielwurzel(n) | Atome | Placement |
|---:|---|---|---|---:|---|
| 1 | BcP12.1.4 | `90c8f1ca-9779-50b9-bcdf-a8dd44b8c9c6` | `cf2631d9-da24-50e8-9e50-db625e6efaad` | 9 | AUTHOR |
| 2 | BcP12.2.1 | `8a92da4c-2064-5e78-a417-544ebaa99118` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 3 | BcP12.2.2 | `16192309-b2d6-5087-8d04-a07f571c7257` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 4 | BcP12.3.1 | `2593fa34-24e6-5aaf-9438-953ddff429f9` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 5 | BcP12.3.2 | `1298b179-8b44-5eba-80fd-dafa7ef4473c` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 6 | BcP12.3.3 | `75026111-0315-52e6-8f6a-65e26e2a3857` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 7 | BcP12.4.1 | `af074023-4396-5348-8d18-a5fa198f304b` | `9ace7bd2-136b-595c-a021-6e03077508a7` | 2 | AUTHOR |
| 8 | BcP12.4.2 | `4d5d5597-4007-59a9-9333-28bb754e292b` | `9ace7bd2-136b-595c-a021-6e03077508a7` | 2 | AUTHOR |
| 9 | BcP12.4.3 | `a31715d0-b071-521c-a06b-030c9ff6ee27` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 10 | BcP12.4.4 | `2e7e1642-0a1c-5a86-bd8c-c47f150827e4` | `e6dcd3a0-264d-503b-aaac-a3e86eeb7059` | 1 | AUTHOR |
| 11 | BcP12.4.5 | `356da26a-9452-5859-a017-9c9cacbcd262` | `7b443158-8ca9-5b8e-8328-a8fa56f6e26f` | 1 | AUTHOR |
| 12 | BcP12.4.6 | `eeae95a6-2b03-5fbf-b1a4-ee7653314d8b` | `dc4a26c7-8304-529d-8705-7333b2f038fc` | 1 | AUTHOR |
| 13 | BcP12.4.7 | `4c81c061-4249-5c3f-b068-6c2a27009892` | `ffebca5e-76b5-55d7-80d6-df1e7d2c75ea` | 1 | AUTHOR |
| 14 | BcP12.5.1 | `9c1808d9-3f10-56bb-885c-2839264bf266` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 15 | BcP12.5.2 | `b66e0cdb-4e8a-58f2-9ee3-64f9ebea2321` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 16 | BcP12.5.3 | `ae915657-3ce5-5563-8ccc-7fd65c6b06b7` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 17 | BcP12.6.1 | `806a49a8-22cc-53d7-8097-fe872bac90da` | `3351fe47-5b0c-5407-a3bf-05229cfbf0c5` | 3 | AUTHOR |
| 18 | BcP12.6.2 | `96bcf5fb-bf77-53b8-b5f1-03ffbe26a53e` | `3351fe47-5b0c-5407-a3bf-05229cfbf0c5` | 3 | AUTHOR |
| 19 | BcP12.7.1 | `5f3656df-6d88-5db9-b0bf-5dd274382334` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 20 | BcP12.7.2 | `e615708a-bf0d-5570-9d5b-828746272d0d` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 21 | BcP12.7.3 | `7949c6ee-f0b4-55e8-b6d0-3e85de43a1a1` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 22 | BcP13.1.4 | `931377b6-c9f2-5000-b31f-428792134fa6` | `cf2631d9-da24-50e8-9e50-db625e6efaad` | 9 | AUTHOR |
| 23 | BcP13.2.1 | `68ddb267-01ce-5e32-8167-2a8b0faeb320` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 24 | BcP13.2.2 | `51eac1e5-9ff0-5ac5-817b-1f0c094fb117` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 25 | BcP13.3.1 | `05dcd367-5c48-5f97-a67d-8b942626cba5` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 26 | BcP13.3.2 | `861529a5-a2de-5c85-b7cb-ab1f8612f7d1` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 27 | BcP13.3.3 | `44db5f22-cc6e-5037-9190-292c94a852bf` | `cfa5c1e4-6714-5be7-9a57-a24b201b6231` | 2 | AUTHOR |
| 28 | BcP13.4.1 | `816b1a6f-1534-59b3-ae46-06b08e1b7aca` | `9ace7bd2-136b-595c-a021-6e03077508a7` | 2 | AUTHOR |
| 29 | BcP13.4.2 | `0a46d248-e340-5f51-b9b6-67489b0e2548` | `9ace7bd2-136b-595c-a021-6e03077508a7` | 2 | AUTHOR |
| 30 | BcP13.4.3 | `4892eb10-0c07-598d-93dd-c3277a5a6a1c` | `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` | 1 | AUTHOR |
| 31 | BcP13.4.4 | `1dc77e5a-24f2-5efc-a6e2-8c4a920162fe` | `e6dcd3a0-264d-503b-aaac-a3e86eeb7059` | 1 | AUTHOR |
| 32 | BcP13.4.5 | `8e4fc3b2-bfa4-5c67-b107-7997fc89cc45` | `7b443158-8ca9-5b8e-8328-a8fa56f6e26f` | 1 | AUTHOR |
| 33 | BcP13.4.6 | `3e146174-d54f-5e4d-ae04-cd5a4727760c` | `dc4a26c7-8304-529d-8705-7333b2f038fc` | 1 | AUTHOR |
| 34 | BcP13.4.7 | `558f8c3d-b881-5cb6-bff3-f147848518f1` | `ffebca5e-76b5-55d7-80d6-df1e7d2c75ea` | 1 | AUTHOR |
| 35 | BcP13.5.1 | `9be83d32-7f3e-50c6-ae44-092e769ab98e` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 36 | BcP13.5.2 | `87752f17-7152-53da-835e-dcbcd6d447e2` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 37 | BcP13.5.3 | `cd8acf10-d748-5f58-b6c8-2b97bd708494` | `fec1563e-a34a-5fc1-93bb-03981f35ab13` | 1 | AUTHOR |
| 38 | BcP13.6.1 | `766296f6-2b0a-5ad5-8222-a831477584be` | `3351fe47-5b0c-5407-a3bf-05229cfbf0c5` | 3 | AUTHOR |
| 39 | BcP13.6.2 | `1fe13e20-7e59-5b75-899b-b255719b3085` | `3351fe47-5b0c-5407-a3bf-05229cfbf0c5` | 3 | AUTHOR |
| 40 | BcP13.7.1 | `3ba4193f-a551-5fb6-8eff-27065300d4d4` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 41 | BcP13.7.2 | `fe3af01c-434f-5750-8e21-6d5fdeff2358` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 42 | BcP13.7.3 | `96979728-26a4-5adc-af97-730b822d9102` | `ebe2f6db-95a3-5157-a27d-2624f6c82e4e` | 3 | AUTHOR |
| 43 | C11.2.1 | `db8bd4ed-5850-5807-b050-b186799c15b8` | `9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f` | 1 | AUTHOR |
| 44 | C11.2.2 | `4df0e486-840a-54e7-a186-af1934eb1476` | `360fccb9-896d-5e67-bf5d-5732621604c9` | 1 | AUTHOR |
| 45 | C11.2.3 | `934928bc-1f4a-5130-a9a9-012c133c0604` | `8fe39739-2938-5e2c-8db2-08572b44569a` | 1 | AUTHOR |
| 46 | C11.2.4 | `302818a2-d25c-5de2-a279-877bf6369557` | `8da5c5cf-d346-5df9-b4c9-26938fc80a88` | 1 | AUTHOR |
| 47 | C11.2.6 | `383bfcc7-41cb-5694-95a3-a7a7e75bbd95` | `f4d5a02d-711b-5a6b-a41d-971359c1f64d` | 1 | HOLD |
| 48 | C11.2.7 | `4cbd7966-a172-5881-8e25-59246a1d61ae` | `eae2a380-601c-53ed-be30-03c69c1f4f54` | 3 | AUTHOR |
| 49 | C11.2.13 | `327295ec-493a-53d1-b82d-ea6ca7b62e28` | `9abd8069-17ad-5d30-9102-f8eff6055045` | 1 | AUTHOR |
| 50 | C11.2.14 | `1717c214-3bea-5015-9f9a-088685d571c7` | `3681e688-7880-5bb4-9ab9-ef78289345c8` | 1 | AUTHOR |
| 51 | C11.2.16 | `f93dde15-1574-52c0-923b-5780ad39f081` | `0b5342b9-512d-573f-90d5-7522aee35efa` | 1 | AUTHOR |
| 52 | C11.2.17 | `fbc4f570-99e3-5d3b-9404-f0c8caba7456` | `47582f06-d724-5da9-acc6-16c91ab94f67` | 1 | AUTHOR |
| 53 | C11.3.1 | `66d5f91e-3527-5782-a5c3-3ab2650a5a1c` | `2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00` | 1 | AUTHOR |
| 54 | C11.3.2 | `3760b84d-1efe-577f-9d69-53fd89c7cb51` | `126c56ef-25ac-57b6-84df-111b79d01b8d` | 1 | AUTHOR |
| 55 | C11.3.3 | `488f4af4-8118-5abe-9122-cfa0bfe788b1` | `5f151e8c-a62e-5e8c-979d-dcf4eb025873` | 1 | AUTHOR |
| 56 | C11.3.4 | `0615679b-07d3-50a7-b887-1b85cede63c4` | `f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528` | 1 | AUTHOR |
| 57 | C11.3.5 | `903cf8ee-39da-599f-9603-74142d0bbd8d` | `98ae3f8e-4800-5ff3-bd2c-89434c006143` | 1 | AUTHOR |
| 58 | C11.3.6 | `85003608-3325-562a-b433-7a9b02553795` | `539476ee-f9cd-5b66-9b2e-ab42c4ea7cf4` | 1 | AUTHOR |
| 59 | C11.3.7 | `9247dea7-80e2-5e60-acdc-ca8fc918a6cc` | `96d3f50b-62f7-5db4-8426-43b4a0c26543` | 1 | AUTHOR |
| 60 | C11.3.8 | `025cc87e-b7a1-5580-a96b-229fbfcb1418` | `ce6cb788-54ff-5727-b263-aa40b7c7f613` | 1 | AUTHOR |
| 61 | C11.3.9 | `13448d25-4d39-5175-a040-af0fa1d52a0f` | `1654b644-f03d-59db-9f31-d63998cb0439` | 1 | AUTHOR |
| 62 | C11.3.10 | `796c4618-fae2-5aa3-a00e-cc57a5d0ac51` | `a853069e-2ebb-5a19-8edf-b767cdb41ed7` | 1 | AUTHOR |
