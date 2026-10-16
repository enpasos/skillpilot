<!-- SPDX-License-Identifier: Apache-2.0 -->
# SH032: bestehende Themenauswahl im Level-2-Modell

**Befund: Modellgrenze für eine gesonderte Medikamenten-View unter derselben
Chemie-Landschaft.** Im geprüften vorhandenen Auswahlpfad lässt sich die
bewusste Wahl dieses Themas weder durch eine zusätzliche View-ID noch durch
eine Programmunit autoritativ als Level-2-Auswahl belegen. Das ist kein
fachliches KEEP/REVISE-Votum zum neuen Ziel und keine neue Source-Freigabe.

## Quellenumfang

Die tatsächlichen SH-Primärseiten69–71 wurden aus der vorhandenen PDF gelesen;
SHA256 `ab56f18400f427991d6c7a7fba64be3e027c2a48c2d7d0c2c42f85db690981f9`.
S.69 macht Kunststoffe zum Mindestthema des grundlegenden Niveaus und lässt
zusätzliche Themen zu. Die gemeinsame linke Tabellenspalte gilt innerhalb des
behandelten Themas für grundlegendes und erhöhtes Niveau. S.71 nennt beim
Medikamententhema die exemplarische Wirkstoffgruppenbetrachtung über Forschung,
Entwicklung, Labor-/Großproduktion und Vermarktung. Die rechte Spalte fügt
Aromatenbasis und Syntheseplanung hinzu. Daraus folgt keine allgemeine
Medikamentenpflicht jedes SH-GK; SH+GK/LK allein dokumentiert keine Themenwahl.

Die erlaubte Autoren-Quellennotiz wurde als Vorschlag gelesen, nicht als
Freigabe oder unabhängige Autorität. Andere AMPV-A-Ergebnisse und das
Rootjournal wurden nicht gelesen.

## Bestehende Auswahl und ihre Grenzen

| Stelle im normalen Repository R | Tatsächliche Bedeutung |
| --- | --- |
| `contracts/curriculum-package/v1/composition-view.schema.json:75` | `scope` ist geschlossen und erlaubt nur `schoolForm`, `jurisdiction`, `stage`, `courseProfile`, `durationModel`. `viewId` ist eine Dokumentidentität außerhalb des Scope. Strukturknoten sind ebenfalls geschlossen und enthalten Kind/ID/Label/Kinder, keine Wahldeklaration. |
| `app/src/components/PersonalCurriculumSetup.tsx:42`; `app/src/views/LearnerView.tsx:135` | Gespeicherte GUI-Konfiguration pro Landschaft: `selected`, `filterId`, `durationModel`, `stage`. Kein `canonicalView`, `viewId` oder ausgewähltes `programUnitId`. |
| `backend/src/main/java/com/skillpilot/backend/api/CreateLearnerRequest.java:3`; `.../service/LearnerService.java:742` | Die Anlage einer lernenden Person hat einen leeren Request und erzeugt keine Themen-/Viewauswahl. Persönliche Curriculumwahl folgt anschließend. |
| `backend/src/main/java/com/skillpilot/backend/landscape/PersonalizationSourceKind.java:13` | Sieben vorhandene Autoren-Quellarten wählen Landschaften, Landschaftsfilter oder Scopewerte. Weder Views noch Programmunits sind ein eigener Auswahltyp; `contains`/`requires` werden ausdrücklich nicht als Personalisierungsentscheidung interpretiert. |
| `.../service/CurriculumPersonalizationPlanner.java:597`; `.../service/LearnerService.java:5158` | `scopeValues` kann einen Autoren-Schlüssel und Wert transportieren und als String speichern. Das macht einen beliebigen Schlüssel noch nicht zu einer von der Zielprojektion interpretierten Auswahl. |
| `.../service/LearnerService.java:5734` | Der generische JSON-Container kann zusätzliche Stringschlüssel bewahren. Persistierbare Bytes sind deshalb kein Beweis für semantisch unterstützten Zustand. |
| `.../service/LearnerService.java:10015` | `deriveCompositionScope` liest Root-/Fachfilter, Stage und Duration und erzeugt genau den Scope aus Schulform, Bundesland, Stage, Kursprofil und Duration. `canonicalView`, `viewId`, `offeringId`, `selectedTheme` und `programUnitId` werden hier nicht ausgewertet. |
| `.../service/LearnerService.java:9742` | Die Backend-Zielprojektion löst die View aus Landschafts-ID und diesem abgeleiteten Scope über `findLearnerScopeView` auf. Sie verwendet keine in der Personal-Curriculum-Map gespeicherte View-/Offering-ID. |
| `.../service/CompositionViewService.java:41,563,605` | Lernendenscopes erlauben nur die fünf bekannten Dimensionen; Schulform und Stage müssen verankert sein. Unbekannte Scopefelder werden abgewiesen. |
| `.../service/CompositionViewService.java:503` | Bei gleicher Scopepassung entscheidet der Repository-Matcher unter anderem über die lexikalische View-ID. Das ist keine ausdrückliche Lernendenentscheidung und keine erlaubte Auflösung einer inhaltlichen Doppelbelegung. |
| `.../service/CompositionViewService.java:614` | `findViewById` existiert als Lookup für bereits bekannte View-/synthetische Strukturreferenzen. Seine Existenz schafft keinen Level-2-Auswahl-/Persistenzpfad. |

`PersonalCurriculumState` ist in den untersuchten aktiven Quellpfaden kein
entsprechender benannter Datentyp; der wirksame Zustand ist die oben
beschriebene JSON-Map plus serverseitiger Autoren-Flowzustand. Die konkrete
Verbrauchsstelle des Zustands entscheidet, welche gespeicherten Angaben die
Zielprojektion beeinflussen.

## Ausdrücklicher Offering-Pfad geprüft

Es gibt einen tatsächlichen, engeren Pfad, der bei einer oberflächlichen
Suche übersehen werden könnte:

- `app/src/hooks/useAppCore.ts:137` liest eine gespeicherte `offeringId`.
- `useAppCore.ts:512,540,557` nimmt im **Paketmodus** eine URL-Offering-ID oder
  diese gespeicherte ID und lädt das Offering-Dokument.
- `app/src/utils/runtimeCurriculumCatalog.ts:540` validiert die ausdrückliche
  Offering-ID gegen die Landschaft.

Dieser Pfad steuert die Paketansicht. Er ist **keine nachgewiesene gemeinsame
Level-2-Lösung**: Die bestehende Backend-Projektion konsumiert diese ID nicht;
der normale geführte Curriculum-Editor bietet keine View-/Offeringwahl an.
Zusätzlich darf der Paketkatalog für dieselbe Landschaft und denselben Scope
nicht zwei konkurrierende Offerings registrieren:

- `app/src/utils/runtimeCurriculumCatalog.ts:324`: eindeutige
  Landschaft/Scope-Offering-Identität;
- `backend/src/main/java/com/skillpilot/backend/curriculumpackage/PackageCompositionViewState.java:119`:
  derselbe Eindeutigkeitscheck im Backend;
- `scripts/validate_curriculum_runtime_catalog_contract.py:274,324`:
  `DUPLICATE_VIEW_SCOPE` beziehungsweise `DUPLICATE_OFFERED_SCOPE`.

Eine eigene Medikamenten-View mit identischen fünf Scopefeldern kann daher
nicht als ausdrückliche, disjunkte Themenwahl ausgegeben werden. Ein neuer
Labeltext, eine andere View-ID oder ein URL-Link beseitigt diese Grenze nicht.

## Programmunit und Level3

`backend/.../landscape/ProgramUnit.java:6` trägt nur ID, Art, Label, Reihenfolge
und Elternunit. `GoalPlacement.java:8` ordnet Ziele mit Kontext einer Unit zu.
`app/src/utils/goalPlacementProjection.ts:233` baut daraus Struktur und wertet
vorhandene Filter aus. Das ist weder eine Autoren-Auswahlliste für Units noch
ein gespeicherter Themenentscheid. Die Chemie-Landschaft H enthält derzeit
ohnehin keine `programUnits` oder `goalPlacements`.

Eine Auswahl über die geplanten/fokussierten Ziele
(`LearnerUiController.java:287`) gehört zu Level3. Sie ändert nicht den
Level-2-Targetumfang und belegt deshalb keine dauerhafte optionale
Medikamentenwahl. Das Etikett einer Unit oder eines Fokus darf die
Quellenbedingung nicht ersetzen.

## R und H getrennt

Der Modellbefund verwendet den tatsächlichen normalen Runtime-/Backendcode
aus R. Die normale Chemie-Datei R mit SHA256
`9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960` ist der
bewusst unveränderte ältere aktive Stand, kein unerwarteter Drift.

Der Datenkontext wurde zusätzlich im isolierten H geprüft:

- Chemie H: SHA256 `d17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f`,
  634 Gesamtobjekte; Source032-Kandidat `3eb2a06c-d283-57aa-9eb4-088940c4801a`
  fehlt weiterhin.
- SH-GK-View H: SHA256 `758c0fc586a40d46d05a5af89dfefef8d35cd5ab3cf1b1ff871ccce1eaed2fe9`,
  ID `de-sh-gym-chemistry-gk`, Scope Gymnasium/DE-SH/CrossStage/GK.
- SH-LK-View H: SHA256 `650ed3cddb15112134f0b33d30fe85ba6a4a4a9adaeed245a62e94de1f887796`,
  ID `de-sh-gym-chemistry-lk`, Scope Gymnasium/DE-SH/CrossStage/LK.

Weder in H noch im bestehenden gemeinsamen Autoren-Flow ist eine separate
Medikamenten-View als Level-2-Entscheidung vorhanden. Eine neue
Grundlandschaft mit eigener Landschafts-ID wäre eine andere
Curriculum-Modellierung mit eigenem Katalog-/Closure-/Auswahlvertrag; sie ist
keine vorhandene Medikamenten-View im geprüften Chemieangebot und wird hier
nicht als ungeprüfte Lösung behauptet.

## Konsequenz innerhalb dieses Auftrags

Die Frage ist für den vorhandenen Chemie-/Fünf-Felder-Pfad negativ geklärt.
Source032 darf damit weder als allgemeine GK-Pflicht noch als bereits
ausdrücklich gewählter Umfang behandelt werden. Eine passende spätere
Modellentscheidung benötigt einen durchgängigen Autorenauswahl-, Persistenz-
und Backend-Projektionspfad. Im vorliegenden Auftrag werden dafür kein neues
Scopefeld, kein Stage-/Duration-Kunstgriff, keine BB/BE-Fallbackerweiterung
und kein neuer Runtimecode eingeführt.

Die begrenzten Schema-/Originalmatcher-Proben und exakten Codeausschnitte
stehen daneben. Sie prüfen die beschriebene Modellgrenze, ohne Normaldaten,
H, R oder Git zu ändern. Keine Gesamt-M7-Aussage, Sourcefreigabe,
menschliche Freigabe oder Erprobung.
