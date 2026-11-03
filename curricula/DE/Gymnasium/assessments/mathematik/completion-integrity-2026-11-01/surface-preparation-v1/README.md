# Lokale Oberflächenvorbereitung: 9f9c7ece

**Autorenkandidat, unabhängig noch nicht freigegeben.** Root bleibt unverändert; Basis ist Kanon-SHA `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`. Keine neue Prüfung, Source-/Scopeänderung, Targeteinschreibung oder Änderung gültiger Mastery. Die vorhandene unabhängige 30er-Kohorte bleibt als historische Entscheidung unverändert.

## Ganzer Zielvertrag und begrenzte Korrektur

`9f9c7ece-b81c-55fa-8073-dd816d7d4778` heißt weiterhin **Oberflächeninhalte von Körpern berechnen**. Der vollständige DE/EN-Vertrag bleibt exakt: Eigenschaften einfacher Körper nutzen, um Mantel- und Oberflächeninhalte in passenden Situationen zu berechnen. Weder auf gerades Prisma noch auf ein einziges Formel-/Körperbeispiel eingeschränkt. Phasen, Anwendbarkeit, SourceRef, Typ, Tags, Gewicht, Bilder und sämtliche anderen Felder bleiben byteinhaltlich gleich. Nur seine direkten `requires` werden ersetzt.

| Ganzer alter Vertrag | Entscheidung und fachlicher Grund |
|---|---|
| `5f548596`: Volumeninhalte einfacher Körper berechnen | Entfernen. Ein räumlicher Inhalt und seine Kubikeinheit sind keine universelle Voraussetzung für Mantel-/Oberflächenmaße. Ein vollständig bemaßter Körper kann über seine Außenflächen berechnet werden, ohne vorher sein Volumen bestimmen zu können. |
| `50eb5156`: Längen-/Winkelbeziehungen an Würfeln, Quadern, geraden und schiefen Prismen/Pyramiden mit geeigneten Vektordarstellungen | Entfernen. Dieser ganze Raumwinkel-/Vektorvertrag ist für eine Oberflächenberechnung mit geeigneten gegebenen Maßen nicht allgemein erforderlich. Das Verwenden oder gegebenenfalls Ermitteln benötigter Flächenmaße wird nicht aus `9f9` gestrichen; dafür muss aber nicht vor jedem Einstieg der ganze analytisch-geometrische Längen-/Winkelvertrag beherrscht werden. |
| `eb070ed2`: Parallelität und Orthogonalität von Kanten, Flächen und Raumrichtungen untersuchen | Entfernen. Eine vollständige Raumrichtungsuntersuchung ist kein allgemeiner Einstiegsnachweis für die Flächenzerlegung. Elementare Parallelität und rechte Winkel verschwinden nicht: sie liegen im erhaltenen elementaren Unterbau. |
| `b4fd63de`: Symmetrieachsen und Symmetrieebenen bestimmen | Entfernen. Gleichartige Flächen können beim Rechnen genutzt werden, ohne zuerst alle Achsen und Ebenen eines Körpers untersuchen zu müssen. Symmetrie ist eine mögliche Hilfe, keine universelle Vorpflicht. |

Keiner der vier alten direkten Vollverträge bleibt als direkte Anforderung erhalten. Der native Compiler belegt zusätzlich, dass sie auch nicht über indirekte oder geerbte Kanten heimlich wieder in den neuen Support eintreten.

| Ganze neue direkte Anforderung | Begründung |
|---|---|
| `c823b5a2-82e3-5e22-9c27-c0f41cc5eac6`: Elementare Körper erkennen und benennen | Allgemeine geometrische Orientierung für den ganzen Körpervertrag. Der Text nennt Quader, Würfel, Prisma, Zylinder, Pyramide, Kegel und Kugel und verengt das Ziel deshalb nicht auf die später geprüfte Prisma-Instanz. Die Zuordnung von Mantel, Grund- und Außenflächen bleibt Lerngegenstand von `9f9`. |
| `87c55be5-06a9-41e2-a0d4-c60f7c8b8078`: Flächeninhalte ebener Figuren berechnen | Berechnung, geeignete Zerlegung und Interpretation von Flächen mit Einheiten sind die allgemein benötigte Messgrundlage. Der ganze Vertrag umfasst Parallelogramme, Dreiecke, Trapeze und zusammengesetzte Figuren; nicht nur die zwei Dreiecke dieses einen Messkeils. Körperabhängige Verfahren werden weiterhin in `9f9` gelernt und angewendet. |

`d6c3fb37` (Umfang und Flächeninhalt unterscheiden) und `f2e42af5` (passende Einheiten, gleichartige Umrechnung und Vergleich) bleiben über `87c55` transitiv enthalten. Zusätzliche direkte Dubletten wären unnötig. Auch elementare Parallelität, ebene Figurenkenntnis und der vorhandene Rechenunterbau bleiben erhalten. Die zwei Kanten sind ein minimaler direkter Autorenansatz, keine Behauptung, der gesamte vorhandene elementare Unterbau sei global minimal. Dessen sonstige Voraussetzungen werden nicht bereinigt.

Nicht als Ersatz gewählt: `d379e28b` klingt nach bloßer Körperbeschreibung, fordert vollständig aber 3D-Koordinaten und Schrägbildzeichnen; `d8e56cfc` zieht parametrische Flächenmodelle und weitere eigenständige Geometrieverträge nach sich. Beide würden den überbreiten Support durch einen anderen breiten Import ersetzen. Das spezielle Kreis-/Kreissektorziel `2f073195` wird ebenfalls nicht zur universellen Vorpflicht jeder Oberflächenbearbeitung; es passt zu bestimmten Körperaufgaben und wird hier weder gelöscht noch geändert. Das bedeutet keine Einschränkung des unveränderten `9f9`-Texts auf Prismen oder eine abschließende Liste ausschließlich zulässiger Körperaufgaben.

## Bestehende Aufgabe und vorsichtiger Vorbereitungsvorschlag

Die vollständigen aktuellen Verträge liegen als `9f9c7ece.{before,after}.goal.json` und `e5494c67.{before,after}.goal.json` vor. [existing-prism-task.md](existing-prism-task.md) zeigt die exakt bestehenden Aufgaben-/Lösungsstrings und Rubrik. Die frühere Dichte-Ursprungsvariante `0dded9c1` ist vollständig gelesen und als `0dded9c1.unchanged-variant.goal.json` erhalten; an ihr wird hier gar nichts vorgeschlagen.

`e5494c67` verlangt beim geraden 6/8/10-Dreiecksprisma mit 20 cm Länge bereits:

- Dreiecksgrundfläche `G=24 cm²`;
- Volumen aus kongruenten Schichten `V=480 cm³`;
- beide Grundflächen und alle drei Mantelrechtecke, deren Summe die äußere Beschichtungsfläche ergibt: `M=480 cm²`, `O=528 cm²`, mit Sachdeutung.

Die strenge bestehende 6/6-Rubrik weist null Oberflächenpunkte zu, wenn nicht beide Grundflächen, alle drei Mantelflächen und die korrekten 528 cm² vorliegen. Der Oberflächenkern ist deshalb zum Bestehen erforderlich. Der volle Aufgaben-, Lösungs- und Rubrikvertrag bleibt **exakt unverändert**, ebenso Punkte, Passschwelle und beide bisherigen Coverages `68fb0e78` und `f1348d40`. Kein neuer Mantelflächenauftrag wird nachträglich behauptet: die bestehende Aufgabenfrage verlangt die gesamte Oberfläche und alle gezählten Flächen; die bestehende Lösung aggregiert die Mantelflächen ausdrücklich. Eine getrennte zusätzliche Frage „Berechne M“ und ein zusätzlicher Transfer auf einen anderen Körper stehen dort nicht.

Der `after`-Prüfungsdatensatz schlägt nach Korrektur des lokalen Supports zusätzlich `9f9` als **Vorbereitung** vor: Eigenschaften eines Körpers erkennen, Außenflächen zuordnen und Flächeninhalte ermitteln ist genau die tatsächlich benutzte allgemeine Handlung. Er enthält **keine zusätzliche `9f9`-Coveragebehauptung**. Die engere bereits freigegebene Prismenkompetenz bleibt die explizit bewertete Coverage. Damit werden Vorbereitung, die tatsächlich bepunktete Instanz und eine möglicherweise weitergehende allgemeine Ergebnisbehauptung sichtbar auseinandergehalten. Dass dieselbe Flächenhandlung mit der engeren Prismenkompetenz überlappt, ist ausdrücklich Gegenstand des bevorstehenden Reviews; die neue Kante wird nicht allein aus dem gewünschten Routeneffekt begründet.

**Konkreter HOLD:** Ob die repräsentative Prismenhandlung den allgemeinen `9f9`-Vertrag auch als vollständige zusätzliche Coverage trägt, bleibt offen und ist nicht freigegeben. Die vorhandene unabhängige Kohorte nennt die Prismahandlung einen echten Kandidaten ohne neue Aufgabenlücke und hält den breiten Support offen. Ein enger Autoren-Gegencheck verlangt zusätzlich Transfer oder einen gesonderten Mantelauftrag, um diese breitere Coverage zu behaupten. Der Kandidat entscheidet diesen Bewertungsunterschied nicht durch Umbenennung des Ziels. Astra soll nach Lesen des nun begrenzten ganzen Supportvertrags ausdrücklich entscheiden, ob die Vorbereitungskante fachlich trägt und ob darüber hinaus Coverage zulässig wäre. Sollte dafür eine weitere Aufgabenhandlung erforderlich sein, bleibt sie HOLD; hier wird weder eine solche Handlung erfunden noch der bestehende Task verändert.

Die beiden bisherigen Prüfungsanforderungen bleiben erhalten. `examData.reviewStatus` des vorgeschlagenen Metadatendeltas steht auf `pending`; die historische Aufgabenfreigabe wird in `reviewNote` erhalten und präzise von der neuen Vorbereitung unterschieden. Der historische `sourceArtifactPath` bleibt unverändert. Gültige vorhandene Mastery benötigt keine neue Qualifikation.

## Native und enge statische Prüfung

Ausführen: `python tmp/approach-review-20261101/surface-preparation-candidate/validate_candidate.py`.

[author-validation.json](author-validation.json) bindet die vollständigen Vorher-/Nachherdateien und identische Task-, Lösungs-, Rubrik- und Coveragefelder. [native-validation.json](native-validation.json) stammt aus dem bestehenden echten Backendcompiler mit Root plus zwei Goal-Overlays. Alle 1.254 Definitionen und 980 atomaren Targets bestehen Referenz-, `contains`-, rohe und vollständig expandierte `requires`-DAG-Prüfung. Target-ID-Mengen und 165 Assessment-IDs bleiben identisch. Keine komplette Graphkopie ist angelegt.

Der isolierte `9f9`-Kontext wechselt von 21 auf 29 IDs: 18 bisherige Kontext-IDs entfallen, 26 elementare Grundlagen treten an ihre Stelle. Weniger direkte Kanten bedeutet hier ausdrücklich nicht weniger ganze Kontext-IDs. Der bestehende Prismentask-Kontext wächst dagegen nur von 31 auf 33 IDs: neu sind `9f9` und die elementare Körpererkennung `c823`; die gesamte Flächen-/Einheitenbasis war bereits aus den bestehenden Anforderungen bekannt. Keiner der vier entfernten breiten Verträge ist im neuen expandierten Kontext der beiden Kandidatengoals vorhanden. Die vollständigen IDs stehen im Nativebefund.

Readiness ist wegen `pending` erwartungsgemäß falsch; die mathematisch unveränderte Payload erfüllt den vorhandenen Vertrag bei ausschließlich im Arbeitsspeicher gesetztem `released`. Das ist keine unabhängige Freigabe. Reale Angebotswirkung, Sourcefreigabe, Lernenden-/Hosterprobung und M7 werden hier nicht behauptet.
