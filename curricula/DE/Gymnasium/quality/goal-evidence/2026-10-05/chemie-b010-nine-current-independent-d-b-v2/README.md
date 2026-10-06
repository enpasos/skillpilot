# B010: unabhängiges aktuelles Beschreibungsreview B

Status: neun **`candidate` / `ai_candidate`**-Records, neun begründete D-KEEPs.
Fünf Texte wurden fachlich geprüft; vier unveränderte bestehende Ziele wurden
gezielt auf ihre tatsächlich geänderten Seiten-/Kontextbindungen geprüft.
Keine operative Übernahme, kein strenger neuer Abschluss, keine bereits
wiederhergestellte operative Bindung und keine menschliche Prüfung/Freigabe.

## Tatsächlich geprüfte Eingänge

- Finales natives Modell `89c798ec…`, Bundle `f182af9b…`,
  Beschreibungsinput `3ac67feb…` und B-Batch `ed545ecd…`.
- Alle **215** eingefrorenen Autorenartefakte bytegleich; alle **12** nativen
  Bundle-Artefakte und **9** ursprünglichen Bildinputs mit den angegebenen
  SHA-256-Werten bytegleich.
- Neun tatsächliche PDF-Raster (physische Seiten 3–11) und neun tatsächliche
  HTML-Captures fachlich/visuell angesehen. Zusätzlich 950 und d726 eigenständig
  aus der gebundenen PDF mit PyMuPDF rasterisiert und angesehen.
- Die **neun** aus der tatsächlichen PDF extrahierten Bildderivate stimmen
  bytegleich mit den nativen Render-Manifest-Einträgen überein. Alle neun
  aktuellen Ziel-IDs sind auf den tatsächlichen PDF-Seiten enthalten.
- Amtliche HE-PDF selbst gelesen; physische Seiten **19, 22 und 25** lokal
  rasterisiert und angesehen. Erneute HTTP-Abfrage 200: PDF bytegleich zum
  bisherigen amtlichen Input. [HE-Primärquelle](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf).
- BY C8/4 mit Gittermodell, Eigenschaftserklärung, Kugelpackungsmodell und
  Zustands-Leitfähigkeit selbst gelesen, HTTP 200 und tatsächlicher
  Antwortdigest dokumentiert. Kein BY-Spezialbeleg für die HE-Anwendungen
  erfunden. [BY-Primärquelle](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium%20/8/chemie).
- Kein Review A, keine frühere Reviewentscheidung und keine Adjudikation
  gelesen. Informierter Autoreneingang und vier gelieferte konkrete
  Seitenänderungsfälle wurden als Eingänge behandelt.

## Einzelurteile

| Ziel | Umfang B | Entscheidung und Gegenstand |
| --- | --- | --- |
| fcc73fb5 | bestehende Seitenbindung | KEEP; neuer Halogen-Rückverweis passt zum Eigenschaftsordnen |
| 42a84bca | bestehende Seitenbindung | KEEP; Rückverweis unterstützt Element-/Verbindungsunterscheidung |
| 950c73c6 | fachlicher Kandidat | KEEP; ein räumlicher Gitter-/Eigenschaftszusammenhang, Koordinationszahl ausdrücklich HE10.1 |
| 16a80de2 | fachlicher Kandidat | KEEP des Textes; beide Wasser-Systeme, Produktunterschied, OH⁻-Ursache, Deutung statt gefährlicher Eigenversuch |
| 58486300 | fachlicher Kandidat | KEEP; stoffgenaue Element-/Verbindungsverwendungen, keine Wasserstoff-/HCl-Synthesefreigabe |
| b5086548 | bestehende Seitenbindung | KEEP; neuer Salz-/Anwendungs-Breadcrumb und passende Nachfolger |
| d726e00e | bestehende Bild-/Seitenbindung | KEEP; tatsächliches PNG 51341eaf… auf neuer PDF-/HTML-Seite, drei richtige Kalkreaktionen |
| 414489cb | fachlicher Kandidat | KEEP; vereinfachter SO₂–Oxidation–Sulfat–Gips-Weg, ausgeglichene Gesamtgleichung |
| 1f5ee84f | fachlicher Kandidat | KEEP; ein begrenzter, datenabhängiger Nährstoffion-/Nutzen-Risiko-Anwendungsbezug |

Alle neun Records enthalten eigenständig formulierte bilinguale Ketten aus
Verständnis, selbstständig beobachtbarer Leistung und chemisch bedeutsamem
Transfer. Vier historische Whole-goal-Fachurteile bleiben erhalten; ihre
Seitenprüfung erzeugt keinen zusätzlichen fachlichen Abschluss.

Der d726-Befund wird ausdrücklich nicht durch Umbenennen alter Hashes behoben:
Die tatsächlich neue PDF enthält das aktuelle PNG. Das historische Modell mit
JPG `2525c341…` bleibt unverändert; seine alte Seite wird weiterhin nicht als
aktuell dargestellt. Erst unabhängiger zweiter D-Abschluss, Synthese und
operative Integration können eine aktuelle Bindung herstellen.

## Offene Integrations- und Bildbefunde

1. **SOURCE-BINDING HOLD:** Der eingefrorene native Atlasbeleg bindet den
   Canon mit `10ce4543…`; der finale exportierte zukünftige Canon hat
   `d892d345…`. Die unveränderte native Ableitung bindet tatsächlich rohe
   Dateibytes. Vor Übernahme muss der Atlas aus der finalen Zukunftsmenge neu
   abgeleitet und geprüft werden. Die neun text-/seitenbezogenen D-KEEPs
   verleihen diesem alten Atlasbeleg keine Aktualität. Die fachlichen
   Primärquellenklauseln wurden separat geprüft; keine manuelle Hashkorrektur
   wurde vorgenommen.
2. **Gezielter V-Hinweis 16a:** Das unveränderte aktuelle JPG zeigt Natriumstück
   und Flamme unterhalb der Wasserlinie. Gleichungen und OH⁻-Erklärung sind
   fachlich richtig; die tatsächliche Na-Auftriebs-/Flammenlage kann jedoch
   missverständlich erscheinen. Die zuständige tatsächliche V-Prüfung muss
   diesen konkreten Befund entscheiden. Dieses D-Urteil ist keine neue
   Bildfreigabe.
3. HE9.2-Wasserstoff/Halogen/HCl, die 722/e0-Split-/Companionfälle und der
   bekannte 11bea-Prerequisite-Grenzfall bleiben sichtbar und ungezählt.

## Native Prüfung

Unveränderter `validateGoalDescriptionReviewCampaignResults.ts`, nur Runde B:
**Exit 0; `Goal-description review campaign results valid: 9`**. Tatsächliche
Argumente, Zeiten, stdout/stderr und SHA-256-Werte stehen in
`native-round-validator.actual.receipt.json`. Der native Erfolg beweist
Struktur, exakte Fingerprints und vollständige neun Records; er behebt weder
den Atlasbefund noch den separaten V-Hinweis oder die offene operative
Integration. Keine globalen QS-Läufe, Builds, Commits oder GitHub-Schreibaktionen.

Eigene didaktische Reviewtexte: CC-BY-4.0; technische Serialisierungshilfe:
Apache-2.0. Amtliche Drittquellen behalten ihre eigenen Rechte. Das genaue
Modell-/Sampling-Kennzeichen wurde vom Lauf nicht offengelegt und wird nicht
erfunden. Die Manifestzeiten binden die tatsächliche Record-Serialisierung;
die vorangehende fachliche Lektüre und Sichtprüfung sind separat dokumentiert.
