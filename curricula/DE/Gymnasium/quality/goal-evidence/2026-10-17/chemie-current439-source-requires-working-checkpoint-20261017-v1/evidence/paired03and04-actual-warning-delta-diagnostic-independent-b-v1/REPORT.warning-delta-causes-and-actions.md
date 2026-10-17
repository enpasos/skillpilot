# Kombinierte Pakete03/04: technische Warnungsdiagnose

**58 alte − 1 entfallene + 29 neue = 86 Warnungen; 57 alte bleiben erhalten. Keine neue Compilation, keine neue fachliche Stimme, keine Warnung erlassen.**

| Gruppe | Anzahl | Tatsächliche Ursache und Konsequenz |
|---|---:|---|
| APV-201 |12| Explizite Overrides auf12 gewöhnlichen Zielen, insgesamt46 Jurisdiktionswerte. Jeder dieser Werte hat tatsächlich nur Override-Evidenz und eine konkrete eigene Erwerbsannotation mit officialWholeSourceCredit=false. Erwartete Hinweise; sichtbare Quellen-/Kurs-/Wahlgrenzen behalten. |
| APV-203, Erweiterung |15|11 gewöhnliche Override-Erweiterungen plus Lehrer54bc über requires-closure, Memory2106 über Origin cc5a und Cluster c21d/e594 über child-union. Das gespeicherte Rohfeld blieb vor der Compilation unverändert. Echter Roh-/Compilerunterschied, kein automatischer Quellenfehler und kein Quellenpass. |
| APV-203, HB-Verengung |2|7f verliert HB; Obercluster5428 verliert HB als Folgewirkung. Das ist der reale separate HB-Scope-HOLD, keine harmlose Erweiterungswarnung. |
| APV-203 entfernt |1|9812 war im Rohfeld bereits BY/RP, kompilierte vorher nur BY. Der explizite eigene RP-Scope stellt BY/RP her. Kein Rohfeld wurde zur Warnungsunterdrückung geändert; APV-201 bleibt neu. |

## Alle betroffenen Ziele

| Goal | Neue Codes | Compilerdelta | Ursache / nötige Aktion |
|---|---|---|---|
| 188bd684 Farbstoffe als Motor der chemischen Industrie beurteilen | APV-201, APV-203 | +DE-BW,DE-RP,DE-SH,DE-SN,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 21066929 Primärabbau und Mineralisierung: Begriffe abrufen | APV-203 | +DE-HH,DE-MV,DE-RP,DE-SH,DE-SL,DE-SN,DE-ST,DE-TH | EXPECTED_MEMORY_ORIGIN_PROPAGATION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 2d16528c Zeolith-Enthärter strukturell erklären | APV-201, APV-203 | +DE-HH,DE-MV,DE-RP,DE-SH,DE-SL,DE-SN,DE-ST,DE-TH | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 34da1a4c Indikatorfarbstoffe über Strukturänderungen erklären | APV-201, APV-203 | +DE-SH | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 542822de Chemie in Gesellschaft und Berufsfeldern einordnen | APV-203 |  −DE-HB | REAL_HB_CHILD_UNION_CONTRACTION_SAME_HOLD; genaue Ursache/Aktion im JSON. |
| 54bc6ca0 Emission und Absorption zur Farbigkeit unterscheiden | APV-203 | +DE-BW | EXPECTED_ORDINARY_TEACHER_REQUIRES_CLOSURE_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 61da9d34 Farbstoffe im Alltag und Gesundheit bewerten | APV-201, APV-203 | +DE-BW,DE-RP,DE-SH,DE-SN,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 63e0d92b Küpenfärbung erklären und durchführen | APV-201, APV-203 | +DE-BW,DE-RP,DE-SH,DE-SN,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 64b03eff Substituenteneffekte in Farbstoff-Molekülen erklären | APV-201, APV-203 | +DE-BW,DE-RP,DE-SN,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 7f140b34 Chemische Anwendungen und ihre gesellschaftliche Bedeutung diskutieren | APV-203 |  −DE-HB | REAL_HB_TARGET_SCOPE_GAP_RETAIN_HOLD; genaue Ursache/Aktion im JSON. |
| 87d8cc68 Farbigkeit durch delokalisierte Elektronen erklären | APV-201, APV-203 | +DE-BW | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| 981242bb Azofarbstoff-Synthese mechanistisch darstellen | APV-201 | +DE-RP | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; genaue Ursache/Aktion im JSON. |
| b208b1a5 Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen | APV-201, APV-203 | +DE-BW,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| c21d430b Enthärter und Abbauwege (LK) | APV-203 | +DE-HH,DE-MV,DE-RP,DE-SH,DE-SL,DE-SN,DE-ST,DE-TH | EXPECTED_CHILD_UNION_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| c8f51eac Absorbiertes und reflektiertes Licht verknüpfen | APV-201, APV-203 | +DE-BW,DE-RP,DE-SH,DE-SN,DE-ST | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| cc5a626a Biologische Abbauwege von Tensiden beschreiben | APV-201, APV-203 | +DE-HH,DE-MV,DE-RP,DE-SH,DE-SL,DE-SN,DE-ST,DE-TH | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| e5941581 Azo- und Triphenylmethanfarbstoffe mechanistisch darstellen | APV-203 | +DE-RP | EXPECTED_CHILD_UNION_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |
| f0ba30a8 Absorptionsspektren von Farbstoffen auswerten | APV-201, APV-203 | +DE-BW | EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED; EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE; genaue Ursache/Aktion im JSON. |

## Konkreter HB-HOLD

Vorher hatte7f die einzige HB-Evidenz `requires-closure: required by188bd684`. Nach Entfernen der fachlich korrigierten Kante188→7f bleibt BY aus den bestehenden partiellen Mappings und der anderen BY-Anforderung6c9a.7f ist weiterhin als HB-GK/LK-Target platziert, wird aber jetzt in beiden Sichten ausgeschlossen. Der Obercluster5428 vereinigt nur seine sichtbaren Kinder und verliert daher ebenfalls HB. Das sind zwei Warnungen zu einem zugrunde liegenden offenen atomaren Erwerbsscope. Die ursprüngliche HB-Quelle wird hier fachlich weder verworfen noch neu gutgeschrieben. Die bereits laufende unabhängige7f-Korrektur muss konkret abgeschlossen und anschließend technisch gemessen werden. Keine falsche Kante zurücksetzen, keine Targets löschen und keinen automatischen Override setzen.

## Quellen- und Mappinggrenze

Die18 ganzen betroffenen Vorher-/Nachherziele, alle tatsächlichen Evidenceketten und relevanten vollständigen Mappingeinträge sind im separaten Extrakt gepinnt. Die44 berührten Mappingdateien stimmen bytegenau mit der tatsächlichen Baseline-APV-Capsule überein. Es wurden keine neuen amtlichen Quellbezüge erzeugt. Alle46 neuen direkten Jurisdiktionsevidenzen heißen tatsächlich ausschließlich override. Die gewöhnlichen Annotationen deklarieren eigene Erwerbserweiterung und keinen Vollquellenkredit; allgemeine oder partielle Alt-Mappings werden dadurch nicht stärker. Die vollständigen Original-PDFs werden für diese reine Diagnose nicht nochmals fachlich freigegeben.

Insbesondere sind courseProfiles/viewIds in den eigenen Annotationen keine zusätzliche vom Jurisdictioncompiler implementierte Kursdimension. Aktuelle Projektionsmessung und geprüfte Wholeviews bleiben maßgeblich. RP-/SH-/SN-Wahlstatus, BW-Kursgrenzen und die übrigen benannten Originalquellengrenzen werden durch eine Compilerwarnung weder ersetzt noch aufgehoben.

## Nächste Aktionen

- Retain all actual warnings and per-goal reasons, with exact paired science/scope provenance from existing accepted packages; this diagnostic adds no science vote.
- Finish the independent HB7f source/own-acquisition correction and then measure both7f target pairs and parent5428. No target deletion or wrong prerequisite restoration.
- For the12 overrides retain jurisdiction-specific own source/optional/course limits; for Memory/teacher/cluster propagation retain actual origin/dependency/child boundaries.
- Any future raw-applicability materialization and P/SEM/M/card source binding must use explicit whole guards and actual stable integrated bytes; removing APV-203 alone is not scientific or final-scope approval.
- Preserve the76 current exclusions, including74 old and2new at this snapshot. No final source/native/Central/fullM/APV/build/M7/human or learner-performance claim.

## Unveränderliche Pins

- `4e33f66fa446cc81d5173a984dc51400368469d836898f1bd09fda397a175aa5` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/RECEIPT.partial73-net-restoration.HOLD-two-new-HB-exclusions.json
- `6606d71c6bca5efba38e59ceca65fb82081d9bb0d7abbb47f8a2af79db4bfbc9` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/CHECK.actual75-restored-and-current149-warning-delta.json
- `48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd` — /mnt/e/skillpilot-chemie-L7-20261017/paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json
- `d9835ea71c19876bc0aa15319a1fce54eb02953d6268563f067cd57f5daeeb62` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json
- `27f953b07b8d301613d23f3f6dee0a0b62246bbd6297b7d942923e1f57126b20` — /mnt/e/skillpilot-chemie-L7-20261017/actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/STOCK.actual650-paired-twenty-foundations-and-coordinate-applicability.json
- `3f4eca1695fada72465fefa6369ad6777ffe47d77824c45de6afb9cbb85b1425` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/STOCK.actual650-C20-plus-paired-package03-and04-applicability.json
- `dedb2df40358c78be1caac649759017b4fc5ddd99e64de2919bda6f74c90a1e4` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/candidate.whole39views.C20-plus-two-BW-labels.private.json
- `0241c675af70a6ca5e68b32049112dc97a969ab87cd1cc81405025da30754b5b` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json
- `c9d0b7d9f86b7deb3900b358769530d7759b90f89ac3feaba6a6fd1c4c79816b` — /mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/capsule/AGENTS.md
- `50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd` — /home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts

Die erste Dateivergleichsdiagnose hatte versehentlich die kleine P-Capsule als Mappingbasis gewählt; sie hatte dort keine Ressourcen und ist unverändert als fehlgeschlagene Vergleichshistorie erhalten. Der additive Vergleich gegen die tatsächliche Baseline-APV-Capsule belegt44/44 unveränderte Mappingbytes. Keine dieser Diagnosen schreibt einen Bestand um.
