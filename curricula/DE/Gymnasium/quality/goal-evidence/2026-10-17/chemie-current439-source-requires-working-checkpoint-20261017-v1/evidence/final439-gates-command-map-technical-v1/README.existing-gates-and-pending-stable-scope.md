# Vorhandene439-Gates: technische Wegkarte, keine Ausführung

**Kein Centralbericht, kein neues Buchmodell, kein Compiler-/M-/CQR-/Floorlauf wurde erzeugt. Finale All-seven-R-Statistik und stabile Assembly sind Voraussetzung.**

## Konkrete vorhandene Basis

- L6: `/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1`
- Neuester privater439-Central: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-native36-contexts-four-images-open-private-L6-technical-20261017-v1/central.current439.native36-contexts-four-images-open.private.config.json`;105 D-Indices,112 Pconfigs,75 Aconfigs.
- Original437-L4-Central: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current437-six-current-native-bindings-private-L4-central-check-technical-20261016-v1/central.current437.P6-normal-kind-address-only.after-measured-failure.inactive.config.json`;102 D-Indices.
- Volle439-Modellbasis: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1/base.full439.current-native-inputs.config.json`.
- Private volle Review-Sicht: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-F03-private-L6-technical-20261016-v1/VIEW.full439.final-native-review-only.json`. Sie verwendet kanonische Teilbäume;439 ist durch das aktuelle Modell/SEM zu messen, kein Name- oder Direktknotenbeweis.

Die drei additiven D-Indices enthalten2 neue Ziele459/F03,20 erste aktuelle Kontextbindungen sowie16 abgeschlossene aus einem weiteren20er-Batch. Die vier übrigen IDs dieses Batches bleiben deferred. Es gibt hier keinen vorhandenen Full439-goalIds-Reviewbatch; die439er-Buchbasis und die begrenzten Native-D-Batches sind getrennt. Alle102 ursprünglichen L4-Indexpfade sowie die drei Ergänzungen mit Dateipins und Resolutionpfaden stehen im Inventar.

## Reale fehlende Ressourcen in der dünnen E-Capsule

Beim untersuchten Precompiler-Stand fehlen sämtliche105 alten D-Indexpfade, sämtliche75 Aconfigpfade, die112 alten L6-Pconfigadressen sowie chemie.qa.json und der private Centralconfig. Das ist keine fachliche Ablehnung dieser Nachweise.112 aktuelle eigene Pconfigfragmente sind unter den neuen Indexpfaden tatsächlich vorhanden, strukturell disjunkt für439 IDs. Eine neue vollständige E-Review-Capsule muss unveränderte D/A/V-Abhängigkeiten einschließlich ihrer transitiven Artefakte aus der geschützten L6 übernehmen und den Centralconfig auf die aktuellen Ppfade und650er-SEM/M/V-Ressourcen binden.

## Zuerst aktuelle Kontexte vergleichen

Nach stabiler Scopeassembly das neue volle Modell mit der vorhandenen buildGoalBookModel-CLI erzeugen. Für den Differenzvergleich die tatsächlichen Stockexports buildGoalDescriptionCanonicalContext und die Review-Input-/P-/SEM-Funktionen verwenden. Kein eigener Näherungsfingerprint. Der D-CanonicalContext enthält raw applicability/Requires und die benannten Kernfelder, aber keine skillPilotAcquisitionExtensions oder applicabilityOverrides. Metadaten-only-Scopezusätze sind daher nicht pauschal neue D-Staleness. Die tatsächliche aktuelle Science-/Compiler-/SEM-Bindung bleibt trotzdem separat zu belegen.

Alte Reviewer wurden für genau ihre eingefrorenen Seiten/Bundles eingesetzt. Globale neue Paginierung oder ein neuer Gesamtdigest berechtigen weder zum Umschreiben alter Urteile noch zu439 neuen Reviews. Ganze aktuelle Seiten, P-Inhalte und tatsächlich verwendete Bildbytes gegen die ausgewählten originalen Eigentümer vergleichen; konkrete geänderte Kontexte gezielt prüfen.

## Vorhandene Befehle

Die genaue argv-Liste mit Ein-/Ausgaben und Bedingungen steht im COMMAND-MAP JSON. Alle Befehle sind unexecuted. CWD ist eine neu zu erstellende vollständig eigene physische E-Capsule. Stockcode dort bytegenau bereitstellen; import.meta-Reporoot und Main-Guards prüfen. Gemeinsamer Launcher:

```text
node --preserve-symlinks --preserve-symlinks-main --import /home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs
```

| Schritt | Vorhandener Scriptaufruf nach dem Launcher | Effekt |
|---|---|---|
| Aktuelles Modell | app/scripts/buildGoalBookModel.ts <new-full439-config.json> | schreibt nur neuen konfigurierten Modellpfad |
| Vorhandenen D-Batch prüfen | app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config <existing-frozen-batch.config.json> | liest eingefrorene Artefakte |
| D-Synthese/Index prüfen | gleiches Script summarize beziehungsweise finalize --config <existing-frozen-config> | ohne --write; keine neuen Votes |
| Nur echte neue D-Deltas vorbereiten | gleiches Script prepare --config <new-bounded-config> | schreibt neue Modelle/HTML/PDF/Bundles auch ohne --write; kein439-Neustart |
| M | app/scripts/memoryCardReview.ts --config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json --mode=check | volle aktuelle Karten-/Origin-/Sichtbarkeitsprüfung |
| P | app/scripts/positiveGoalEvidenceReview.ts --config=<each-current112-own-config> --mode=check | eigene criteria/reviewId beibehalten |
| A | app/scripts/semanticAtomicityReview.ts --config=<each-current-A-config> --mode=check | aktuelle originale Klassenbindungen |
| V | app/scripts/generateGoalVisualizationQaLedgers.ts --check --subject=chemie | aktuelle Assets/AI-Bindung; QAroot muss bereits existieren |
| Full439 Centraldiagnose | app/scripts/reportDeepUnderstandingRollout.ts --config=<new-current439-central> --mode=report --format=json | stdout; führt produktive Unterchecks aus |
| Full439 Centralcheck | gleiches Script --config=<same> --mode=check --format=json | fail bei Blockern |
| Status/CQR303 | app/scripts/generateCurriculumQualityStatus.ts [--check] | benutzt DEFAULTregistry und kompiliert Applicability intern; --check ist kein bloßer Hashvergleich |
| Floors | app/scripts/checkCurriculumMaturityFloors.ts | liest generierten aktuellen Status und alle geschützten Floors |

Die historischen tatsächlich ausgeführten20er-Befehle für summarize, Synthesismanifest, Resolutions und finalize liegen unter tmp/.../actual-finalize-native-twenty-current439-contexts-root-v1/*.execution.actual.json. Sie werden hier nur lokalisiert, nicht wiederholt. Die manifest-/resolutions-Scripts unterstützen --config <batch> --authoring <authoring> beziehungsweise --synthesis-manifest <manifest>, optional --write; Writes verlangen bereits echte geprüfte Entscheidungen.

## Default-Central ist nicht privater439-Central

Der vorhandene L6-Defaultregistry enthält Chemie mit50 Pconfig-/59 D-Indexpfaden, also den alten Kontext. Der neueste private439-Config hat112/105. generateCurriculumQualityStatus ruft generateDeepUnderstandingRollout() ohne individuellen Configparameter auf. Für CQR303 muss daher ein neuer physischer Defaultregistry-Nachfolger die aktuelle Chemie-Subjectconfig auswählen; die anderen Fächer bleiben vollständig erhalten. Ein standalone --config=... Centralbericht aktualisiert CQR303 nicht von selbst.

npm run quality:curriculum-status hat außerdem einen prehook, der sämtliche Memoryreports schreibt. Die direkten Scriptflags und alle Seiteneffekte sind im JSON explizit. Kein ursprünglicher Kriteriennamespace wird pauschal migriert; der früher korrekt geklärte Kriterienmix bleibt gültig.

Chemie hat laut gepinnter Floorpolicy M6 als geschützte Untergrenze. Ein bestandener Floorcheck wäre kein Chemie-M7-Beleg. Menschliche Freigaben/Erprobung und echte Lernenden-/Versuchsleistung bleiben gesondert.
