# Direkter Info-Owner mit leerem Personal Curriculum: endliche Runtimeanalyse

Befund: Der leere PackageState ist im normalen Repository-Beanmodus beabsichtigt,
kein bloß vergessener Helperparameter. Der problematische Zustand ist jedoch kein
vollständig konfigurierter Level-2-Scope: selectedCurriculum=InfoOWNER plus {}.
COMPLETE bedeutet hier nur „kein verpflichtender authored PersonalizationFlow“.
Es belegt weder eine gespeicherte Stage noch einen gewählten Kurs. Die bestehende
Repository-Fallbacklogik behandelt diesen unaufgelösten direkten Owner trotzdem
als IdentityProjection und exponiert die vier außerhalb der bereinigten Views
gehaltenen Ziele. Das ist eine reale defensive Lücke für diesen Direktzustand;
es ist kein Nachweis, dass der normale globale Gymnasium-Flow fehlschlägt.

## Norm und drei getrennte Frames

Live per GitHub gelesen: main 0ce5a8d791eeb9783a919195fd8590bfb79f3595 und der
weiter offene eingefrorene PR 83, docs/learning-units-restart-20261106,
52619b960e7b261e1cc18d070063c8e7aca74e21. Analysierter Audit-Branch ist separat
feat/skill-graph-ci-contracts,25e667dfaeaa5770967c12778d00212de33f4b5a.
Die Main-Norm steht bereits in AGENTS.md 300–308 und learning-workflow.md:
Katalognavigation und gewählte Basis sind kein aufgelöster Lernumfang. Stage
bleibt ohne ausdrückliche Angabe unaufgelöst; LK impliziert nie SekII. Die hier
relevanten CompositionViewService-, Planner- und Repository-Bean-Dateien sind
zwischen main, PR83 und Auditbranch bytegleich. Auch die sechs untersuchten
LearnerService-Methoden sind zwischen main und Auditbranch exakt gleich.
Der Befund benötigt keine Semantikübernahme aus PR83 und keinen neuen Unitruntime.

## Tatsächliche Verdrahtung und Ursachenpfad

1. application.yml 183–184 verwendet repository als Default von
   SKILLPILOT_CURRICULUM_SOURCE. RepositoryCurriculumConfiguration ist bei
   repository oder fehlender Property aktiv und baut CompositionViewService
   aus Properties, ObjectMapper und CanonicalGraphSupplier. Dessen Konstruktor
   setzt packageState=null. Nur der ausdrücklich opt-in gewählte package-Modus
   lädt PackageCompositionViewState und verwendet dessen eigenen Konstruktor.
   Die tatsächliche Produktions-ENV eines laufenden Servers wurde nicht gelesen.
2. CompositionViewService.findDefaultView und isAuthoritativeForLandscape
   liefern ohne PackageState null beziehungsweise false. Das verhindert keine
   normalen authored Repository-Viewmatches bei ausdrücklich gelöstem PC.
3. Der Info-Owner 7d51b38c-a149-5407-bddc-d2ce7878b020 hat keinen
   personalizationFlow. CurriculumPersonalizationPlanner.plan 73 liefert deshalb
   COMPLETE. Das ist ein bestehender enger Planner-Kompatibilitätsvertrag, durch
   completesWithoutMandatoryChoicesWhenNoFlowIsAuthored explizit getestet.
4. LearnerService.hasCompletedPersonalCurriculum 4790 setzt diese Flowaussage mit
   vollständig konfiguriertem PC gleich: plan.valid() && !plan.required().
   applyCompositionViewProjection 10772ff liefert bei leerer Config plus
   nonauthoritative Repositoryansicht unmittelbar IdentityProjection. Bei
   nichtleerem LK-PC ohne Stage weist der vorhandene Scope-Matcher korrekt den
   unaufgelösten Viewrequest ab; die nonauthoritative Fallbackkante nimmt danach
   trotzdem die gefilterten Rohziele. Phase Q3 der Ziele ist keine Learner-Stage.

## Tatsächliche Level-2-Felder und Persistenzgrenze

Learner persistiert selected_curriculum und personal_curriculum als zwei getrennte
JPA-Spalten. Es gibt keine zusätzlichen stage-, phase- oder profile-Felder im
Learner-Entity. Level-2-Stage, filterId, selected und gegebenenfalls durationModel
stehen im PC-JSON. Die Filterliste GK/LK des Landscape und die phase der Goals
sind verfügbare Fachmetadaten; sie sind keine gespeicherten Entscheidungen.

Die untersuchten Nativehelper besitzen ausschließlich lesende Repositoryproxies:
kein save, kein Commit, keine Events. Der konkrete {}-Fall setzt ausdrücklich
strictMode=false, selectedCurriculum=OWNER, personalCurriculum="{}", ohne
Stage-/Profil-/Dauerwerte und ohne aktives Ziel. Die Profile-PCs enthalten
{OWNER:{selected:true,filterId:GK,stage:CrossStage}}; bei Land zusätzlich die
entsprechenden ROOT-Werte. Keine Phase/Year-Werte wurden gesetzt. Beide Helper
und mein Vergleich lassen diese Felder und die beiden vorhandenen Masterywerte
unverändert; die neue eigene Prüfung wird nicht als gemeistert geschrieben.
Die Bezeichnung persistedPersonalCurriculum in einem Helper-JSON bezeichnet
seinen In-Memory-Entitystring, KEINE nachgewiesen persistierte Datenbankzeile.
Live-Learnerdaten oder Datenbankinhalte wurden nicht gelesen oder verändert.

## Konkrete lesende Kontrollen

Eigener Adapter: OwnerEntryAnalysis.java; aktueller Bytevergleich von 484
Produktionsquelldateien und 484 zugehörigen Klassen ohne Abweichung. Keine
Spring-Initialisierung, kein Gradle-Gesamtlauf. Der Prozess liest den unveränderten
V3-Datenframe unter readonly bwrap-Mounts; Belegausgaben liegen nur im eigenen RAM.
Die bestehende Fachkorrektur des Infoautors wird weder ersetzt noch überschrieben.

| Dienstzustand | unverändertes PC-JSON | Plan | View | Target-IDs |
| --- | --- | --- | --- | ---: |
| tatsächlicher Repository-Konstruktor | {} | COMPLETE | keine | 288 |
| Repository | ausdrücklich GK und CrossStage | COMPLETE | Informatics GK | 170 |
| Repository | LK ohne Stage | COMPLETE | keine | 282 |
| geladenes PackageView-Komponentenfixture | {} | COMPLETE | explizit deklarierter GK-Default | 220 |
| PackageView-Komponentenfixture | ausdrücklich GK und CrossStage | COMPLETE | Informatics GK | 170 |
| PackageView-Komponentenfixture | LK ohne Stage | COMPLETE | keine | 0 |

Die Packagekontrolle verwendet tatsächlich PackageCompositionViewState.load mit
unverändertem V3-Info-JSON, tatsächlichem GK-View-JSON, konsistenten ScopeDimensionen,
einem ausdrücklich deklarierten single-Offering und Default. Das ist eine
korrekt geladene In-Memory-Komponentenfixture, KEIN veröffentlichtes Info-Paket,
kein kompletter package-Backend-Boot und kein Positivfall der 51 Owner-PCs.
Der Fixture bietet nur GK/CrossStage an; seine LK-Zeile beweist deshalb nicht
isoliert eine Stageablehnung. Die vorhandene produktive Matcher-Unit prüft die
Missing-Stage-Regel für GK/LK getrennt. Der Unterschied 220 versus 170 zeigt
zusätzlich, dass Defaultview ohne explizite Coursefilter keine gleichwertige
persistierte GK-Auswahl ist. Daraus wird keine neue Paket-Freigabe abgeleitet.
Target-IDs enthalten hier auch Strukturknoten; die Zahlen sind keine Anzahl
curricularAtomic-Ziele und keine M6-/M7-Kennzahl.

Nur Repo{} und Repo-LK-ohneStage enthalten die problematischen alten Targets;
die gültige explizite GK-Ansicht und der deklarierte PackageDefault enthalten
sie nicht. 875 ist ein altes atomisches LK-Ziel; die drei übrigen atomischen
Ziele haben Practice/Assessment-Tags und examData. Eine automatische
Node-Typ-Umdeutung oder Stageableitung würde den eigentlichen Fehler nicht lösen.

Die 51 ursprünglichen COMPLETE-PCs sind ausschließlich direkte Owner-PCs.
Derselbe alte PC-Map unter globalem ROOT ergab beim Infoautor 3 SELECTION und
48 INVALID, also keinen Global-Flow-Pass. Der eigentliche authored Global-Flow
mit Jurisdiction, optionaler Dauer, Stage, Fach und Kurs wird getrennt vom
Infoautor über echte angebotene Options-IDs aufgebaut. Als bestehender gültiger
Vertragsanker dient LearnerPersonalizationProgressionIntegrationTest ab 78.

## Erreichbarkeit, Legacy und kleinste reparaturfähige Kanten

Der geladene öffentliche Basiskatalog enthält den Info-Owner nicht; er ist ein
Fach unter dem Gymnasium-Root. Zugleich ist er NICHT compatibilityOnly.
setCurriculumFromPublicCatalog prüft bereits exakt die veröffentlichte Basis-
menge. Der UI-Pfad LearnerUiController.updateCurriculum 321 ruft stattdessen
setCurriculum auf; applyCurriculumSelection prüft dort nur Existenz und
Retirement. Er kann daher einen direkten Owner setzen, PC leeren und wegen der
falschen Bereitschaftsaussage sogar einen Defaultfokus anlegen. Diese Codekante
belegt Persistierbarkeit des Zustands über den normalen UI-Servicepfad; der
lesende Helper führt absichtlich keinen solchen Schreibvorgang aus.

Der allgemeine Planner-No-Flow-Vertrag und die alte Transitionregel „projection
preferred when present, legacy fallback when absent“ sind belegte Kompatibilität.
Sie autorisieren keinen ausdrücklichen Sonderfall für einen aktuellen
canonical-gymnasium-Fachowner mit vorhandenen scopegebundenen Views, fehlender
Stage und nicht belegten alten Targets. Ein solcher Normanker wurde nicht
gefunden; der Zustand wird hier nicht nachträglich zum erlaubten Legacy-Scope
erklärt. Vorhandene alte Gesamtmastery bleibt trotzdem global erhalten.

Kleine bestehende Reparaturpfade zur getrennten Umsetzung/Prüfung:

- Neue UI-Basisauswahl an denselben bestehenden öffentlichen Katalogguard wie
  CoachToolFacade.setCurriculum binden; gültige vorhandene Wiederaufnahme von
  gesondert autorisierten Legacyzuständen getrennt halten. Kein neuer Picker
  und keine zweite Scopeengine sind nötig.
- Für bestehende direkte kanonische Fachzustände muss Readiness zusätzlich die
  vorhandene Scope-/Viewauflösung prüfen. Fehlende Stage darf weder durch
  No-Flow-COMPLETE noch nonauthoritative Rohziel-Fallback als konfigurierter PC
  gelten. Bestehende INVALID/Personalization-Diagnostik plus erstparteilicher
  authored Flow sind die vorhandenen Vertragsflächen; dabei muss eine konkrete
  Einrichtung/Wiederöffnung möglich bleiben. Kein leeres Targetset als falsche
  Completion, kein erfundener GK-Default und kein bloßes Wegfiltern alter IDs.
- Gezielt negativ prüfen: Owner{}, Owner+LK-ohneStage und neue UI-Auswahl eines
  nicht veröffentlichten Fachowners. Positiv prüfen: gültiger gleicher Owner-PC
  mit ausdrücklicher Stage/Kurs sowie vollständig über echte Options-IDs
  durchlaufener globaler Info-PC. Den bisherigen allgemeinen No-Flow-Test für
  andere legitime Curricula erhalten. Bei allen Übergängen Mastery-ID/Werte
  unverändert halten; neue Exams/Karten bleiben ausdrücklich ungeprüft.

Kein Runtimefix wurde aus einer Summary inferiert oder implementiert. Paket-
Default und veröffentlichter Katalog sind keine Erlaubnis zur versteckten
Level-2-Verkleinerung. Aktive Sources, Backend/App-Code, QA-Factories, Git,
Deployment und reale Lernzustände blieben durch diese Diagnose unberührt.
Source-A-Datenkonsistenzpaket und zurückgewiesene native Review blieben unangetastet.
