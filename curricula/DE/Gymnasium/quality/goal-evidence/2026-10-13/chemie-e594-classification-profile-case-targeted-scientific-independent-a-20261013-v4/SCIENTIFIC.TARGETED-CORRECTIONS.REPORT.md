# Unabhängiger gezielter V4-Nachcheck

Lizenz: CC-BY-4.0. Reviewer: `chemie_e594_split_independent_a`.

## Ergebnis und exakte Grenze

Die beiden konkreten V3-Befunde sind für die ganzen V4-Nachfolger behoben: Beide Positivprofile erfüllen den tatsächlichen positiven Stockprofilfragmentvertrag mit Mindestwert 2; RP-Fall2 bezeichnet Z im ganzen deutschen Modell, Rubrik r3 und gekoppelten deutschen Profilbrief eindeutig als Küpenfarbstoff und weist die Direktfarbstoff-Zuordnung zurück.

FIRST wurde vor den neuen Korrektururteilen geschrieben. Sieben neutrale Eingangsbindungen und der Autor-FINAL `ee82c6f643d9614cfff93f32ec005fc9687dc794e75c9ebfc6c3020aaa98ed0c` passen bytegenau. Eigener V3-FINAL `839391bfc449fdf9fe96eedf2b138b3b246fd97bd3d87a9f2084175573fd54ed` bleibt immutable. Autorurteile oder fremde Fachentscheidungen wurden nicht als eigene Befunde gelesen.

Die Prüfung gilt ausschließlich den zwei ganzen Profil-CAS, vier ganzen Fall-CAS und der neuen Beweisstückauslegung. Ganze Ziele, Quellen, Views, Bilder und bestehende V3-Fachurteile werden nicht neu entschieden. Eigene Entscheidungen mit exakten Vorher-/Nachher-Locators stehen in `SCIENTIFIC.TARGETED-CORRECTIONS.DECISIONS.json`.

## Ganze CAS und erhaltener Anspruch

Die zwei ganzen erwarteten Profilzeilen und vier ganzen erwarteten Fälle entsprechen exakt den ursprünglichen V3-Arrays. Ein rekursiver Vergleich der vollständigen JSON-Körper ergibt nur diese Änderungen:

- Beide Profile: `coverageExpectations.minimumIndependentDemonstrations` 1 → 2.
- RP-Profil: deutscher Modellbrief des zweiten Falls korrigiert.
- Alle vier Fälle: `gradingBoundary` erläutert zwei inhaltlich verschiedene Beweisstücke innerhalb einer reichhaltigen Aufgabe und verbietet Doppelzählung sowie eine zusätzliche Aufgabenquote.
- Nur RP-Fall2: `modelAnswerDe` und `rubric[2].criterionDe` erhalten dieselbe fachliche Küpenkorrektur.

Alle ganzen Aufgaben, Daten, wissenschaftlichen EN-Modell-/Rubrikfelder, Erwartungs-IDs und Spannen sind unverändert. Alle zwölf Rubrikzeilen besitzen weiterhin die 24 korrekten DE/EN-Aufgabenspannen. Alle ganzen Aufgaben- und Modellbrief-Joins der vier Fälle zu beiden Profilen passen exakt. Punkte bleiben sechs je Fall. Die ganzen Zielkörper und ihre mit der tatsächlichen Stockfunktion gemessenen semantischen Fingerprints bleiben identisch; kein Page-Tuple-/Goal-Evidence-Fingerprint wird erfunden oder nur mechanisch freigegeben.

## Wissenschaftliche Beweisstückauslegung

Zwei unterschiedliche Leistungsbelege können innerhalb derselben reichhaltigen Arbeit entstehen. Die vorgelegten Fälle eröffnen diese Möglichkeiten tatsächlich:

| Fall | Erste Gelegenheit | Eigenständig zusätzliche Gelegenheit |
|---|---|---|
| RP1 | Strukturklassen Azo/Triphenylmethan/Anthocyan und alle gegebenen Kriterien begründet zuordnen | A/B und C/D kontrastieren und erklären, weshalb gleiche Strukturklasse nicht gleiche Löslichkeit/Verwendung und gleiche Wasserlöslichkeit nicht gleiche Herkunft/Strukturklasse bedeutet. |
| RP2 | X/Y/Z nach Struktur und Aktenkriterien klassifizieren | Die falschen Schlüsse Lebensmittel→natürlich, Farbe→Azo und Faser-Endergebnis→Direktfarbstoff mit den zutreffenden Kriterien zurückweisen. |
| SN1 | Chromophore Einbettung und daraus Strukturfamilien von U/V/W begründen | „Beliebiges N→Polymethin“ und „drei Arylgruppen→Carbonylfarbstoff“ durch tatsächliche notwendige Motive widerlegen. |
| SN2 | Die veränderten J/K/L-Gerüste begründet den Strukturfamilien zuordnen | Acetons UV-Carbonyltransition vom sichtbaren Farbstoffmotiv unterscheiden und zeigen, dass vertauschte Herkunfts-/Farblabels die Strukturklasse nicht verändern. |

Eine bloße erneute Nennung derselben Zuordnung genügt nicht als zweites unabhängiges Beweisstück. Die spezifische relationale, fehlerprüfende oder Nichtbeispielbegründung muss in der tatsächlichen Arbeit zusätzlich beobachtet werden. Die neue Grenze benennt dies ausdrücklich. Die vier Fallbezeichnungen allein sind kein Leistungsbeweis. Die zwei Alternativen eines Ziels sind kein Pflichtpaar und der Wert 2 erzwingt weder zwei Aufgaben noch zusätzliche Aufgaben nach hinreichendem Nachweis. Alle drei Zielaspekte, frische Variation und unabhängiger Transfer bleiben erforderlich. Es wird keine automatische Meisterung aus zwei Rubriknummern abgeleitet.

## Deutsche Küpenkorrektur

Die Daten beschreiben Z unverändert als Anthrachinonvertreter, der zur löslichen Leukoform reduziert, in die Faser eingebracht und anschließend zum unlöslichen Farbmittel oxidiert wird. Der neue deutsche Schlusssatz ordnet Z ausdrücklich der Küpenmethode zu und erklärt, warum das sichtbare Endergebnis allein keine Direktfarbstoff-Zuordnung rechtfertigt. Das stimmt mit dem vorhandenen Datensatz und der unveränderten englischen Antwort überein. Die ganze r3-Begründung ist identisch zum korrigierten Modellabschnitt; der ganze Profilbrief ist identisch zur korrigierten Modellantwort. Der frühere V3-Widerspruch wird im additiven Nachfolger beseitigt, ohne V3 umzuschreiben.

## Tatsächlicher positiver Stockvertrag und verbleibende Grenzen

Die unabhängige Ajv-Prüfung verwendet `$defs/profile` des unveränderten `contracts/goal-evidence/v2/goal-evidence-profile.schema.json`, einschließlich seiner tatsächlichen Definitionen. Beide ganzen V4-Profilfragmente sind gültig und haben Mindestwert 2. Das ist die Validität des Profilfragments, keine vollständig vorbereitete oder autoritative V2-Reviewzeile. Menschliche Profilautorität, aktuelle komplette Seiten-/Kontext-/Goal-Evidence-Fingerprints und normale Integration werden dadurch nicht bewiesen.

Die früheren V3-Grenzen bleiben erhalten: reale RP-WP/W- bzw. SN-WB-Auswahl und Registrierung, RP-Vorstellung versus bewertete Klassifikation im tatsächlich konsumierten Quellfeld, eigenständiges GK-Fundamentum, weitere SN-WB1-Modell-/Experiment-/Reflexionspflichten, SN-Prerequisite-Kontext von `64b03eff…`, optionale RP3.3-Bildungsentwürfe und ihre vollständige Fallevidenz/Integration, normale Quellencompiler- und aktuelle D-/Terminalkontexte. Es gibt keine neue allgemeine Quellen-, Länder- oder Modulfreigabe.

Die beiden Korrektururteile sind begrenzt positiv. Dieser Nachcheck schreibt keine aktiven/historischen Dateien oder Bilder und führt kein Git aus. Er erteilt keine D/P/A/M/V-, M7-, Human-Approval- oder Human-Trial-Freigabe und behauptet keine tatsächliche Leistung. Die erforderliche READONLY-Portabilitätsprüfung von Root wird mit einem bytegenauen dauerhaften Beleg gesondert attribuiert; alle eigenen Ausgaben sind physische Dateien.
