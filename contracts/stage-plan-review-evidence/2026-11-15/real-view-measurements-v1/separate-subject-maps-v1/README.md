# Getrennte kanonische Fachkarten: begrenzter Nachweis

Die sechs UI-Fachfilterfälle und sechs tatsächlichen API-Einzelwahlen für Mathematik/Physik × GK/LK/GK+LK verwenden die echte Gymnasium-Basis. Root hat alle zwölf Ergebnisse unabhängig bestätigt: **0 obere Rückgriffe, 0 obere atomare Rückgriffsursachen und 0 eigene losgelöste Fachziele**. Bei den sechs Einzelwahlen hat auch die vollständige notwendige Lernbasis vor dem Anzeigefilter keine losgelösten Atome.

Die ältere 72er-Messung bewies zuerst die gemeinsame Übersicht. Die getrennte Produktanzeige entsteht in [LearnerGoalNavigationMap](../../../../../app/src/components/learningUnitMap/LearnerGoalNavigationMap.tsx) durch `filterLearnerUnitMapToSubjects`; ein gewähltes einzelnes Lernziel ersetzt nicht die Kartenwurzel. Der Ergänzungsnachweis führt genau diese Produktfunktion und `createLearnerUnitMapCache` einschließlich `memberUnits` aus. Die sechs neuen API-Fälle wählen unter der gültigen Gymnasium-Wurzel jeweils genau ein Fach und behalten notwendige Fremdfach-Vorbereitung. Eine fremde oder künstliche Gesamtinventarwurzel wird nicht eingesetzt.

| Messart | Mathematik GK/LK/beide: eigene Lernatome | Physik GK/LK/beide: eigene Lernatome |
| --- | --- | --- |
| UI-Fachfilter bei beiden ausgewählten Fächern | 911 / 953 / 967 | 605 / 640 / 662 |
| Native Einzelwahl eines Fachs | 910 / 953 / 967 | 605 / 640 / 662 |

**Die Nullaussage gilt für das äußere SekI/SekII-Board, nicht für jede Detailkarte.** Mathematik zeigt im inneren Jahrgang-8-Board weiter 1 Pfeil mit 4 Ursachen. Physik zeigt innen Sek I 7 Pfeile mit 13 Ursachen und in Sek II 3 Pfeile/10 Ursachen (GK), 4/13 (LK), 4/15 (beide). Bei alleiniger Physikanzeige bleiben 48/54/54 direkte notwendige Mathematik-Vorbereitungen als Fremdfach-Kontexthinweise erhalten; sie werden nicht aus dem API-Lernumfang gelöscht. Die vorhandenen `memberUnitAbsent`-/`memberUnitSplit`-Befunde stehen unverändert in den Berichten. Diese bestehenden inneren und optionalen Gruppenbefunde wurden hier nicht repariert.

`retention.actual.json` bindet alle exakten Dateien und verwendeten Quellen per SHA-256. `six-ui-subject-filters.actual.json` und `six-native-single-subject-ui.actual.json` bewahren die vollständigen zwölf Fälle samt Grenzen. Der kleine Bankstand enthält nur die sechs neuen API-Fälle; die große 72er-Bank wurde nicht nochmals kopiert. `ExportSubjectFocusInputs.java` nutzt den tatsächlichen lesenden Backend-Service mit einem Repository-Proxy, der ausschließlich `findById` zulässt. `measure-subjects.mts` bildet die produktive Projektion und Fachanzeige ab. Es handelt sich um native API-/UI-Funktionsprüfung, nicht um Browser-/Host-Rendering, Unterrichtserprobung, M7-Gesamtabnahme oder erfolgreiche Main-CI.
