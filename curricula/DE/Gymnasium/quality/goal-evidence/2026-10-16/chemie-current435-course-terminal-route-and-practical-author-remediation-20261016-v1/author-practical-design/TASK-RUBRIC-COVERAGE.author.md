<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Sechs vollständige Aufgabenentwürfe: Praxis und ehrliche Papier-Coverage

Rolle: **AUTHOR**, kein unabhängiges Review. Alle sechs `examData.reviewStatus` bleiben `draft`. Zwei unabhängige aktuelle Inhaltsreviews einschließlich vollständigem DE/EN-Task, Lösung, Rubrik und nativem Kontext sind offen. E0/G0; keine beobachtete Durchführung, keine generierten Medien, HumanApproval=false, HumanTrial=false.

Die vorher eingefrorene Autorenplanung ist `../PLAN.first-evidence-course-routes-before-candidates.author-frozen.json`, SHA256 `bcd0f514ed7f66b950b8a5f2aaac9fef9aa2b262fa89aed5de921de2fe9511d6`. Grundlage ist die geschützte H-Chemie mit SHA256 `6bed948af8d0ba47d722fb6205bacba6f8792e233f58c1772366395dd8450d8e`, 629 Goals. Die 435 gewöhnlichen Kompetenzziele wurden nicht verändert.

Die vollständigen aktuellen Texte stehen pro Goal in `wholegoals/<id>.author-draft.json`, zusätzlich in `paper-wholegoals.author-draft.json` und `practical-wholegoals.author-draft.json`. Das maschinenlesbare vollständige Mapping jeder Rubrikzeile ist `coverage-and-arithmetic.author.json`.

## Die drei praktischen Endpunkte

| Neues Prüfungsziel | Geprüfte einzige Vollkompetenz | Aufgaben und Rubrik | BE / Grenze |
| --- | --- | --- | --- |
| `7fece532-d052-5633-b24e-ca5595fd76d0` | `02634fdd-c8ba-591a-b240-77129b1bebb8` | s1: eigenständige Planung, Maßlösung/Indikator, Endpunkt und Stöchiometrie; s2: beobachtbare sichere Büretten-/Pipetten-/Titrierhandlungen; s3: drei eigene Volumenpaare und unmittelbares Protokoll, Streuung/Fehler; s4: eigene Konzentration aus Volumina; s5: frischer Überverbrauchsfehler | 10 / 10 |
| `27045f71-10ed-57d3-ac99-cfbe5d6b515a` | `973c12d9-d863-5292-8c68-9c80cdacf9e2` | s1: geeignete kontrollierte Fehling-Probe; s2: eigene beobachtbare Ansätze/Wasserbad/Abfall; s3: eigene gültige Positiv-/Negativkontrollen und Stoffunterscheidung; s4: Redoxdeutung; s5: Zucker als Spezifitätsgrenze | 10 / 10 |
| `ac75b416-70d5-50f8-a913-475943d21a55` | `6765f741-42a6-55c5-a218-81b883b1f5ae` | s1: Plan und drei Estergruppen; s2: eigene beobachtbare alkalische Fetthydrolyse; s3: tatsächliches Aussalzen **und** Abtrennen mit eigenem Protokoll; s4: Glycerin, drei Fettsäuresalze und Phasen; s5: Neutralisation freier Fettsäure ist keine Fetthydrolyse | 10 / 10 |

Jede Zeile zählt 2 BE. 10/10 kann weder ohne die Kernhandlungen noch ohne eigene Aufzeichnungen erreicht werden. Beobachtbare tatsächliche Durchführung durch die lernende Person, eigenes unmittelbares Protokoll und eine dem Versuch zuordenbare Bestätigung durch die beaufsichtigende Fachperson sind ausdrücklich erforderlich. Ein Text, Selbstauskunft, fremde Messdaten oder eine Simulationsauswertung erhält keine Durchführungspunkte. Misslungene Kontrollserien oder Phasentrennungen werden nicht erfunden: Sie bleiben offen und benötigen vor erfolgreichem Abschluss einen sachgerechten erfolgreichen Versuch. Sicherheitsabbruch ist zulässig und wird als solcher dokumentiert.

Das Paket enthält keine Testate realer Lernender. Die 10/10-Regel ist eine entworfene Bewertungsregel; sie ist kein behauptetes Bestehen. Es wurde kein neues Backend-Gate oder Nachweisregister implementiert. Die beobachtete Durchführung ist in der aktuellen Exam-Auswertung anhand der tatsächlich eingereichten Nachweise zu prüfen; ihre technische Authentisierung bleibt ein gesondertes Laufzeitproblem.

`requires` ist bei jedem neuen praktischen Endpunkt genau `[ordinaryGoalId]`, ebenso `coveredGoalIds`. Die Gleichheit gilt hier bewusst wegen des engen praktischen Einzielumfangs. `applicability` ist unverändert von genau diesem gewöhnlichen Ziel übernommen; `applicabilityFromRequires=true` und die Mapping-Grenze ermöglichen keine zusätzlichen Quellen- oder Erprobungsbehauptungen. Die realen Composition-View-Platzierungen übernimmt der übergeordnete Autorenauftrag. Die bisherigen BW-Freigabebelege wurden nicht übernommen.

## Die drei Papierfälle

| Papierziel | Tatsächliche Voll-Coverage | Rubrikzuordnung | BE / Grenze |
| --- | --- | --- | --- |
| `c91350bc-7d2e-523c-bd50-0324bccfcf98` | `eb7537dd…` Wechselwirkungen; `5a30273a…` Struktur/Eigenschaften; `e9b61d96…` Alkanol-Konstitutionsisomere | s2/s4: vorhandene Siede-/Anwendungsbegründung; s5: beide benannten C3H8O-Alkanolstrukturen und Konstitutionsvergleich; s6: Dipol/H-Brücken/Ionen-Dipol/London; s7: Schmelzen/Sieden mit Packungsgrenze, Wasserlöslichkeit und Iod-/Saccharose-Lösemittelwahl | 44 / 27 |
| `bf6c39f0-1e44-53b2-8ff6-025f2e36e125` | `6966df95…` vollständige Grenzflächen/Micellen-Kompetenz; `1837690e…` Temperatur, Härte und Tensidkonzentration | s1: vorhandene amphiphile Struktur/Micellen/Emulgierung; s3/s4: Härte und begrenzte Anwendung; s5: zwei Grenzflächen, Oberflächenspannung und Aggregatabgrenzung; s6: drei kontrollierte Paarvergleiche mit Dispergier-/Micellen-/Kalkseifendeutung | 40 / 24 |
| `9746ff9a-c423-5504-9d4d-0fced93fa382` | `28bb9d15…` Arrhenius; `1c1420c2…` Brønsted vollständig; `b4777001…` qualitativer Stärke-/Partnervergleich | s1: vorhandene Neutralisationsdeutung; s5: vier Name/Formel-Paare und beide Arrhenius-Wirkungen; s6: zwei Gleichungen, vier korrespondierende Paare, Wasserampholyt, Teilchen/Gemisch; s7: HCO3− gegenüber Säure und Base, zwei Richtungen aus relativen Stärken, Grenzen | 48 / 29 |

Die vorherigen vollständigen Wholegoals mit ihren alten 63/63/6 Zulassungslisten, alten `coveredGoalIds`, Aufgaben, Lösungen und Scoring stehen unverändert als historische Objekte unter `history/three-previous-paper-wholegoals.json`. Die korrekten alten Mengen, vier Grundaufgaben und Rechnungen wurden bewahrt. Die Antazida-Anwendungsfrage wurde zu einer ausdrücklich chemischen Modellbewertung von Kapazität und vorgegebener Geschwindigkeit korrigiert. Eine Wirkung, Dosierung oder Eignung beim Menschen wird nicht abgeleitet. Schaum ist im Seifenfall kein direkter Reinigungsnachweis; dafür enthält der Entwurf nun eine konkret kontrollierte **synthetische** Ölentfernungsreihe.

Die Papierfälle beanspruchen keine Durchführung von `02634fdd…`, `973c12d9…` oder `6765f741…`. `f1ed86f0…` umfasst eigenes Lösungenherstellen und wird durch gegebene Konzentrationszahlen ebenfalls nicht vollständig geprüft. Seine Rechnenaspekte sowie die vorgegebene Titrationsstöchiometrie sind außerhalb der Voll-Coverage dokumentiert. Das E-Phasen-Cluster `323a222e…` ist aus der geprüften Voll-Coverage entfernt. Funktionelle Gruppen, Ausbeute und Calciumstearat-Stöchiometrie sind nützliche Aufgabenanteile; ihnen wird keine zusätzliche unvollständig geprüfte Vollkompetenz zugeschrieben.

## Zulassung ist getrennt von geprüfter Coverage

Die genaue taskbezogene Entscheidung steht in `paper-admission-rationale.author.json` und in jedem Papier-Wholegoal.

| Papierziel | Neue direkte `requires` | Konkreter Grund |
| --- | --- | --- |
| Propanon | `eb7537dd…`, `5a30273a…`, `e9b61d96…`, `1dc15fa2…` | Wechselwirkungs-/Stoffeigenschafts- und Isomerentheorie für die Erläuterungen; Mol-Grundlage für die gegebene 1:1-Ausbeute. Tatsächlicher Carbonyltest oder Seifenherstellung wird nicht als Zulassung verlangt. |
| Campingseife | `eb7537dd…`, `1dc15fa2…`, `11bea4c6…` | Wechselwirkungen, Stoffmenge und Koeffizientenverständnis. Der konkrete Seifenanion-Aufbau wird bereitgestellt; die eigene Arbeit muss die daraus folgenden Grenzflächen/Micellen/Waschzusammenhänge erklären. Die geprüften Micellen-/Waschziele werden hier nicht zusätzlich als vorher schon gemeistert verlangt, weil ihr aktueller gewöhnlicher Pfad praktische Seifenherstellung erbt. |
| Modell-Säurevergleich | `e7c363d4…`, `8a2ad724…`, `11bea4c6…` | Formeln, molare Masse/Stoffmenge und Reaktionsbilanzen; `c=n/V` steht explizit im Material. Säure-Base-Theorie wird aus der Abgabe geprüft. Eine schon absolvierte Titration oder Lösungsmittelherstellung wird nicht verlangt. |

Damit ist `requires` ausdrücklich nicht automatisch `coveredGoalIds`. Es werden keine gewöhnlichen Voraussetzungsketten verändert. Frühere praktische Grundlagen, die aktuell transitiv beispielsweise an Bindungs-/Alkanoltheorie hängen, sind keine durch diesen Entwurf gelöste Routenfrage; deren Zustand bleibt **HOLD**. Der übergeordnete Auftrag bewahrt vollständige tatsächliche HE-GK/LK-Kurszulassungen in getrennten globalen Endpunkten. Die drei Papierfälle übernehmen keine künstliche Universal-Kursabschlussfunktion.

## Nachgerechnete Größen und Grenzen

- Propanon-Ausbeute: `1,05/1,50 = 0,70 = 70 %`.
- Calciumstearat: `min(0,020/2; 0,0060) = 0,0060 mol`; benötigtes Stearat `0,0120 mol`.
- Anfangssäure `0,00500 mol`; Rest `0,00143 mol`; gebunden `0,00357 mol`; Anteil `71,4 %`.
- Maximalbindung der angegebenen Massen: A `0,003570999… mol`, B `0,003996403… mol`; keine medizinische Anwendungsaussage.
- Nur synthetisches Titrations-Rechenbeispiel: `19,92/19,96/19,94 mL`, Mittel `19,94 mL`, Spannweite `0,04 mL`, Konzentration `0,09970 mol/L`. Keine dieser Zahlen ist ein beobachteter Wert.
- Nur synthetische Waschreihe: `B−A=45`, `C−B=15`, `D−C=−35` Prozentpunkte. Kein universelles Temperatur-/Dosisgesetz.
- Papierpunktsummen `30+4+4+6=44`, `30+4+6=40`, `30+6+6+6=48`; Grenzen sind die auf ganze Punkte aufgerundeten 60 %: `27`, `24`, `29`. Die Praxisgrenze ist bewusst `10/10`.

Technische Konsistenzprüfungen und Rechenchecks sind Autorenarbeit. Sie sind keine unabhängigen Exam-Inhaltsreviews und keine Freigabe.
