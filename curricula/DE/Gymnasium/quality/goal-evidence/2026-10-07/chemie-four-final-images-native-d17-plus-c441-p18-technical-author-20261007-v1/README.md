# Finale vier PNGs – native D17+c441 / P18, technische Autorenvorbereitung

**AUTHOR / TECHNIK; inert; ai_candidate / needs_human_review; E1/G1; strict gain0.**

## Einstieg für die gezielte unabhängige Prüfung

- `native-root/native-d-seventeen/bundle/book.pdf`:19 physische Seiten. Neu zu prüfen sind nur0bf26276 (Lernzielseite3/physisch5), a44af1fa (12/14),9751b6d8 (14/16). `actual-final-d-pages/` enthält exakt diese neuen Rasterseiten.
- `native-root/native-d-c441/bundle/book.pdf`:3 physische Seiten, c441 auf Seite3. Nutzt die bisherige gültige private D-Kompositionssicht; die ganzen DE/EN-Ziele und fachlichen Kontexte bleiben erhalten.
- Beide nativen D-Batches haben frische `round-a/` und `round-b/`-Kampagnen mit vollständigen DE/EN-Titeln/Beschreibungen, Quellen-Provenienz, Kontext und Bildbindung. Die Kampagnen enthalten keine Ergebnisse dieses Autors.
- `four-final-new-d-inputs-plus-retained-fourteen-routes.technical.json` belegt14 exakt gleiche ganze D-Input-Objekte und pageFingerprints samt Routen zu den bisherigen versiegelten nativen14-Urteilen. Die gesamte Buch-/Bundle-Bindung ist neu; es wird keine alte Gesamtbundle-Gültigkeit behauptet. Die drei neuen D17-Seiten ändern nur `visualization` und `pageFingerprint` im Review-Kontext.
- `native-root/candidate/positive18.author-candidates.review.jsonl` und `native-root/configs/positive18.author-candidates.config.json`:17 Profile mit exakt v3-P580b und unveränderten16 anderen ganzen Profilen, dazu unveränderter bisheriger c441-Profilkörper. Vollständige34 DE/EN-Fälle stehen in `native-root/candidate/complete34-bilingual-material-cases.v3.exact.json`; c441 samt beiden vollständigen Aufgaben/Modellantworten/Grenzen in `whole-four-author-science-and-material.exact.json`.
- Die vier ausgewählten unveränderten PNGs, Promptfolgen, Originale, Fehlversuche und tatsächlichen360/680-Ansichten liegen im separat versiegelten `chemie-four-evidenced-friendly-comic-author-20261007-v1`. Dessen Freeze ist hier gepinnt.

## Was tatsächlich vorbereitet und geprüft wurde

Unveränderte native Produktions-CLI/API-Dateien und ihre Verträge wurden bytegleich nach `native-root/` kopiert. Damit können die bestehenden Root-basierten Asset-Loader lesen, ohne aktive Dateien zu schreiben. Die nativen Bildimporte liefen dort mit vorherigem dry-run; Source/Public/Backend tragen vier gleiche PNG-Kopien. Die479 ganzen v2-Ziele ändern sich ausschließlich in vier `resourceLinks` mit PNG-URL, OpenAI-Provider, CC-BY-4.0, fachlich begrenztem Alttext und offenem `candidate`-Status. Die übrigen475 ganzen Ziele bleiben gleich. Bestehende Provider-/Assethistorie und alle ungebrochenen Rasterbytes bleiben erhalten. Klassifikationen sind unverändert; der native semantische Quellenfingerprint ändert sich für kein Ziel.

Native D-prepare/check17 und1 sowie P-materialize/check18:PASS. P18:approved0, needs_human_review18, rejected0, reviewRunIds leer. Nur die vier neuen physischen PDF-Seiten wurden tatsächlich rasterisiert und für Layout/Bildbindung angesehen. Vollständige DE-Sätze sind sichtbar; EN ist im nativen vollständigen Review-Input, kein EN-PDF-Nachweis. Formales PASS und Autorenansicht sind keine eigene fachliche D/P/V-Freigabe.

Für native Vollkontext-Hashprüfung werden358 bisherige Assets bytegleich gelesen. Die14 gerenderten unveränderten Assets sind echte Kopien innerhalb des inert Public-Roots; nicht gerenderte übrige Assets sind nur unveränderte Dateisymlinks mit explizitem Ziel/Hash im Freeze. Der node_modules-Symlink verweist auf die vorhandene Installation. Es wurde nichts installiert und kein globaler Build gestartet. Alle native-Aufrufe und die ersten korrigierten Format-/CLI-Fehler sind in `receipts/` erhalten; die Produktionswerkzeuge wurden nicht angepasst.

## Grenzen und Rechte

Die drei ausgeschlossenen Quellen-HOLDs bleiben außerhalb P18/D18; begrenzte597-/975-Quellenrouten aus v2 werden nicht als breite neue Quellenfreigabe umgedeutet. Neue Bildbindungen brauchen die tatsächlichen nachfolgenden unabhängigen Urteile. Die14 unveränderten früheren D-Urteile werden nur mit exakt beibehaltenen Eingaben referenziert, nicht vom Autor neu vergeben. Keine aktive Canon/QA/Registry, Runtime, Veröffentlichung, menschliche Freigabe oder Human Trial. Nach der Freeze wird dieser Ordner nicht beschrieben.

Eigene didaktische Medien/Texte:CC-BY-4.0; technische Skripte/Verfahrensdokumentation:Apache-2.0 nach LICENSING.md. Fremdquellen behalten ihre Rechte und Provenienz.

Read-only Freeze-Prüfung: `python scripts/check_and_freeze.py --check` aus diesem Dossier oder mit vollständigem Scriptpfad. Native Checks laufen mit dem vorhandenen Repository-tsx aus `native-root/`: `app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config configs/native-d-seventeen.batch.config.json`, analog c441; `app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=configs/positive18.author-candidates.config.json`.
