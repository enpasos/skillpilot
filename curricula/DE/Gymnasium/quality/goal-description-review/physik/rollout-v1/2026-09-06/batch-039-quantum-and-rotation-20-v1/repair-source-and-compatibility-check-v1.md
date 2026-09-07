# B039 – Quellen-/Kompatibilitätsprüfung zur Energie-Moment-Aufteilung

Read-only, Codex, geprüft bis 2026-09-06T22:37:18.886Z. Nur diese Notiz wird geschrieben. Keine Canonical-, Mapping-, Registry-, Runtime- oder Masteryspeicheränderung; keine post-change Freigabe. Der vorige allgemeine Designhinweis zum unveränderten exact-Legacypfad ist durch die hier konkret empfohlene **partial/partial-Entscheidung** überholt.

## Empfehlung

Die favorisierte Variante ist die risikoärmste native Datenlösung: 5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931 bleibt atomar für den bisherigen Energieanteil; eine neue Schwester-ID erhält allein das Beschleunigungsmoment. Die alte HE-Legacy-ID cecebbb6-2ad4-43c5-b9ce-4b80f5cd870c wird auf beide Teilziele mit jeweils partial geroutet. **Kein exact stehen lassen oder neu erfinden, kein splitFromCanonicalGoalId, keine Masteryübertragung.** Quellen-Teilansprüche lassen sich in der vorhandenen Authoring-Lane konkret begründen; ein neues Runtimefeld ist weder nötig noch angemessen.

Für die konkrete GK-Aufgabenabdeckung genügt eine kleine, fachlich passende Ergänzung des bestehenden GK/LK-Rotationsassessments 6d25344c-35d7-5853-925d-2bccbaf50630. Sein heutiger Inhalt prüft M = Iα noch nicht. Eine Quellen-/Scopefreigabe für RP-GK oder alle 14 Länder folgt aus dieser Ergänzung ausdrücklich nicht.

## 1. Amtliche Quellen tatsächlich geprüft

Die verlinkten amtlichen PDFs wurden geöffnet; zusätzlich wurden die vorhandenen lokalen PDF-Seiten mit pdftotext -layout gelesen, einschließlich des HE-E-Phasen-Kontexts und der Originalgliederung.

| Quelle | Konkret belegter Umfang | Begrenzung |
| --- | --- | --- |
| [HE KC Physik 2024, S. 29–31, E.7](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-physik.pdf#page=31) | E.7 nennt Drehmoment, Drehimpuls und Trägheitsmoment; der E-Phasen-Vorspann fordert mathematische Modellierung mechanischer Vorgänge und quantitative Vorhersagen. Ein einfaches Beschleunigungsmoment bei konstantem I ist eine fachlich nachvollziehbare Operationalisierung dieses Zusammenhangs. | E.7 ist nicht Teil der ausdrücklich verpflichtenden E.1–E.3. Die E.7-Liste nennt weder M = Iα noch eine eigene Berechnungsanforderung wörtlich. Deshalb partial mit transparenter Operationalisierungsbegründung, nicht exact oder „verbindlicher GK-Stoff“. |
| [RP Physik MSS, S. 54](https://static.bildung-rp.de/lehrplaene/naturwissenschaften/Lehrplan_Physik-Web.pdf#page=54) | Rotation starrer Körper wird in der Einführungsphase als Leistungsfach-Wahlpflichtbaustein geführt. Vier Inhaltsbegriffe sind I, Drehimpuls, Drehmoment und Rotationsenergie; die Hinweise verlangen Grundwissen und Analogien zur Translationsmechanik. Damit sind Energie- und Momentteil getrennt fachlich anschlussfähig. | Kein Grundfach-/GK-Beleg. Die quantitativen kanonischen Ziele sind Operationalisierungen des breiteren Blocks, nicht wörtliche 1:1-Übernahmen. Der Extraktionssatz „Drehmoment als Ursache von Rotationsänderungen beschreiben und anwenden“ ist authored wording, kein Originalzitat. |

Die Originalstruktur auf HE S. 31 ordnet Präzession dem Drehimpuls und das Anwendungsbeispiel dem Trägheitsmoment unter; die flache Extraktion allein hätte diese Hierarchie nicht gezeigt. Für den vorliegenden Momentteil ist der erste Hauptspiegelstrich die saubere direkte Route, mit I und der quantitativen E-Phasen-Einleitung als dokumentiertem Kontext.

Lokale Source-Hashes, ohne Behauptung eines Bytevergleichs mit dem gerade online ausgelieferten PDF:

- curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf: SHA-256 46f3e728b5d9fc6b5901f191247951a4a9d9c3df641afa60ca8b17a2e049813f.
- curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf: SHA-256 3bf220e5e409fc4ae057b3327dfa3d445a8f27ad6961925aae5eb16f2d1c12cc.

## 2. Native exact/partial-Konvention: konkreter Befund

Der vorhandene Repository-Loader GoalMappingService.java ist hier eindeutig:

- normalizeMatchType akzeptiert ausdrücklich nur exact oder partial; fehlende Angaben scheitern.
- loadMappings erlaubt mehrere Zielkanten derselben Legacy-ID nur ohne exact unter den beteiligten Kanten. Ein verbleibendes exact neben einer neuen partial-Kante löst „Conflicting goal mappings“ aus.
- Der vorhandene Test allowsOneLegacyGoalToMapPartiallyToMultipleCanonicalGoals bildet genau zwei partial-Nachfolger ab. Er wurde gelesen, nicht neu ausgeführt.
- Dateien mit .review.json, reviewId, sourceExtractionPath oder decisions werden vom Repository-Legacyloader ausgeschlossen. Normative Source-Review und historische Legacy-Kompatibilität sind also bereits getrennte vorhandene Lanes. Package-backed Laden hat eigene Regeln; die Empfehlung beansprucht keine neue universelle Vertragsregel für sämtliche Paketmodi.

Die geschlossene publication-evidence-Schemaquelle contracts/curriculum-package/v1/source-to-canonical-mappings.schema.json kennt pro Kante nur sourceGoalId, canonicalGoalId und matchType. Sie schließt Authoring-Rationale und historische Worklogs ausdrücklich aus der Publikationsprojektion aus. Es gibt hier kein zusätzliches normatives Runtime-Teilumfangsfeld.

Die vorhandene fachliche Teilumfangskonvention ist stattdessen: konkrete Ziel-IDs und Typen in mappings; deckungsgleiche canonicalGoalIds in decisions; genau bezeichnete Source-Stelle in sourceSpan; Zuordnung und ausdrückliche Nichtzuordnung einzelner Teilkompetenzen in rationale. Das ist in applyPhysicsCurrentWaveMappings.ts unmittelbar belegt: breite kombinierte Source-Blöcke erhalten partial-Einzelkanten, nicht genannte Teilkompetenzen werden ausdrücklich ausgeschlossen. applyPhysicsBatch011ElectricityStructuralSplit.ts verwendet zudem schon partial/partial-Legacy-Routing nach einem fachlichen Split. Dies belegt die vorhandene Form, ersetzt aber nicht die oben separat durchgeführte Quellenprüfung.

## 3. Exakte vorgeschlagene Mappingtransaktion

NEW_MOMENT ist hier nur ein Platzhalter für eine später neu zu vergebende stabile ID.

| Datei/Source-ID | Empfohlene Änderung |
| --- | --- |
| mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json; cecebbb6-2ad4-43c5-b9ce-4b80f5cd870c | Bisherige Kante nach 5a von exact auf partial; eine weitere partial-Kante nach NEW_MOMENT. Energie zuerst lassen, weil der Repository-Kompatibilitäts-Single-Lookup aktuell die erste Kante zurückgibt; dies ist keine Masteryfreigabe. |
| HE source-extraction review; he-phys-sekii-e-7-b01-a01-8ba122e4 | Bisheriger Zielknoten cf570e66-2ce2-5923-9033-c97d74119553 bleibt für Kraft-Hebelarm/Drehwirkung. NEW_MOMENT ergänzt den Beschleunigungsfall. Beide Einzelkanten als partial führen, die bisherige exact-Kante nicht pauschal fortschreiben. decisions.canonicalGoalIds und rationale gemeinsam anpassen. |
| RP source-extraction review; rp-phys-sek2-ef-torque-lk | Bestehende partial-Kante nach cf570 behalten, partial nach NEW_MOMENT ergänzen. Rationale ausdrücklich auf Leistungsfach/Wahlpflicht, S. 54 und begrenzte Starrkörper-/Konstant-I-Operationalisierung begrenzen. |
| RP source-extraction review; rp-phys-sek2-ef-rotational-energy-lk | Vorhandene partial-Kanten nach 642aebd7-66cd-5a50-b543-73c4b207525d und 5a behalten; Rationale auf qualitative I/E-Verbindung bzw. quantitativen Energieanteil präzisieren. Keine Momentkante aus dem Energie-Source erzeugen. |

Geeigneter Inhalt der HE-Rationale: Der Drehmomentaspekt wird in zwei getrennte kanonische Teilansprüche operationalisiert: Kraft-Hebelarm/Drehwirkung bei cf570 und quantitatives mittleres Beschleunigungsmoment bei konstantem Trägheitsmoment bei NEW_MOMENT. Kontext sind I und die mathematische Modellierung in E.7/E1–E2. Die Formel steht nicht ausdrücklich im Spiegelstrich; keine einzelne Kante ist ein vollständiges 1:1-Abbild. Keine Energiekompetenz aus diesem Drehmomentaspekt zusätzlich behaupten.

Geeigneter Inhalt der Legacy-Änderungsnotiz: Das historische kombinierte Autorenziel wird auf seinen bereits enthaltenen Energieanteil bei der stabilen 5a-ID und den gesonderten Momentanteil bei der neuen ID verteilt; jede Kante ist partial wegen des Teilumfangs. Dies ist eine historische Kompatibilitätszuordnung, keine amtliche Behauptung, dass der alte Autorentext selbst im Lehrplan stand. Die ausführliche Notiz gehört in den begrenzten Authoring-/Migration-Receipt, nicht in ein erfundenes geschlossenes Runtimefeld.

HEs vorhandener sourceGoal.courseLevel-Wert GK_LK bewahrt hier die nicht LK-exklusive Einführungsphasen-Einordnung, nicht eine Pflichtstoffbehauptung. RP bleibt LK. Dass ein gemeinsames kanonisches Ziel GK und LK trägt, macht die RP-Kante nicht zu RP-GK-Evidenz. Der aktuelle CQR-004-Code überspringt partial-Kanten bei der Niveauprüfung; ein grünes CQR-004 wäre daher insbesondere kein Beleg der GK-Zuordnung dieser neuen Kanten. Die Quellen-/Scope-Begründung muss fachlich sichtbar bleiben. Die übrigen Länder wurden in diesem bounded Auftrag nicht neu normativ geprüft; vorhandene übergreifende Sichtbarkeit ist kein Ersatzbeleg.

## 4. Sichtbare Legacywirkung: ausdrücklich akzeptierter Datenpreis, kein Speicherwrite

In LearnerService.applyCanonicalMasteryProjection und der Timestamp-Variante werden nur exact-Kanten verarbeitet. Beide Funktionen beginnen mit einer Kopie der vorhandenen Mastery und ergänzen daraus Projektionen; die Mappingänderung löscht keinen gespeicherten Datensatz.

| Vorhandene gespeicherte Werte | Nach partial/partial |
| --- | --- |
| Nur Legacy cece… = 1, keine direkte 5a-Mastery | Energie bekommt nicht mehr über diese Kante 1 projiziert; NEW_MOMENT ebenfalls nicht. Die gespeicherte Legacy-1 bleibt erhalten. |
| Direkte 5a = 1 | Direkte Energie-1 bleibt unverändert; keine Anrechnung auf NEW_MOMENT. |
| Legacy = 1 und direkte 5a = 0,5 | Die frühere Projektion konnte Energie auf 1 anheben; nach der Änderung bleibt die direkte Schätzung 0,5 sichtbar. |
| Neues Momentziel ohne eigene Daten | Keine automatische Beherrschung aus Alt-ID, Legacy-ID, gemeinsamem Elterncluster oder einem beherrschten abhängigen Assessment. |

Der Auftrag hält den historischen, bereits zur Bereinigung freigegebenen Kontext ohne echte Altuser fest. Es wurden hier keine produktiven Nutzer- oder Datenbankbestände geprüft; dieser Kontext wird nicht als neu verifiziertes Inventurergebnis ausgegeben. Er rechtfertigt keine falsche exact-Abkürzung. Die korrekte Umsetzung dokumentiert den möglichen Projektionsverlust und bleibt vollständig ohne Runtime-/Masteryspeicherwrite. Der alte ID-Energieanteil bleibt atomar, sodass kein Contains-Split-Autoprojektionspfad entsteht.

## 5. Konkreter GK-Endpunkt mit geringstem Delta

Die Task-/Solution-Inhalte aller 125 aktuellen examData-Ziele wurden programmgesteuert nach den einschlägigen Rotationsbegriffen durchsucht; die zwei einschlägigen Materialaufgaben und der breite E-Endpunkt wurden vollständig gelesen:

- 879491c0-7153-570b-91f4-c61d9fe8a143 enthält bereits einen konkreten Hochlauf und M = Iα, ist aber nur LK-getaggt. Hier reicht später das korrekte Ergänzen von NEW_MOMENT in requires und coveredGoalIds; keine GK-Freigabe durch Retagging der gesamten Thermodynamikaufgabe.
- 6d25344c-35d7-5853-925d-2bccbaf50630 ist GK/LK und ein lokaler Rotationsendpunkt. Es enthält heute Pirouettenenergie und zwei Präzessionsrechnungen, kein Beschleunigungsmoment. Sein technischer Rotor ist der passende vorhandene Kontext.
- 7f83e25c-38f7-5ac2-8f9c-ec54eeef1026 ist nur eine generische E-Klausuraufforderung ohne konkrete Rotorwerte. Keine neue Momentabdeckung allein durch coveredGoalIds behaupten; eine große Reparatur dieser Vorlage ist für den lokalen Rotationsendpunkt nicht nötig.

Minimaler Ergänzungsentwurf für 6d, noch nicht implementiert:

Material 3 bekommt eine klar getrennte Hochlaufphase bei festgehaltener Achse: konstantes I = 25 kg m², ω von 0 auf 200 rad/s in 20 s, mittlere Winkelbeschleunigung 10 rad/s². Das ergibt exakt den dort schon verwendeten End-Drehimpuls L = 5000 N m s. In dieser Phase ist das resultierende Antriebsmoment axial. Erst danach wird das vorhandene vereinfachte Präzessionsmodell mit dem quer zu L wirkenden Störmoment betrachtet. Keine Behauptung, dass axiales Beschleunigungsmoment und Präzessionsmoment dasselbe bewirken.

Neue Aufgabe 5, 5 BE: Bestimmen Sie das mittlere resultierende Antriebsmoment während des Hochlaufs (2 BE). Begründen Sie das resultierende Moment bei anschließend konstanter Winkelgeschwindigkeit und vernachlässigten Verlusten (2 BE). Unterscheiden Sie die Wirkung des axialen Moments von der des später quer zum Drehimpuls wirkenden Störmoments (1 BE).

Erwartung: 250 Nm; anschließend 0 Nm trotz großen Drehimpulses; axiales Moment ändert den Betrag, das quer wirkende Moment die Richtung des Drehimpulses. Alle vier bisherigen Aufgaben bleiben erhalten. s5 ergänzen; maxPoints 25→30 und passingPoints 15→18 erhalten die vorhandene 60-%-Schwelle. NEW_MOMENT in requires/coveredGoalIds ergänzen. 5a kann zugleich explizit in beide Listen aufgenommen werden, weil Aufgabe 1 die Energie bereits wirklich berechnet. Keine automatische Masteryableitung aus den Assessment-Prerequisites.

Die Zahlen wurden unter Node 20 mit sechs echten Assertions geprüft: Iω = 5000; Δω/Δt = 10; Iα = 250; MΔt = 5000; I·0 = 0; das bereits vorhandene Verhältnis 1000/5000 = 0,2. Kein nativer Post-change-Gate wurde ausgeführt, da keine Implementierung vorliegt.

## Abnahmegrenze

Die Mapping-/Kompatibilitätsentscheidung ist damit fachlich und nativ ausreichend konkret: **partial/partial statt exact, vorhandene Rationale-Konvention, ausdrücklich möglicher Verlust nur der Legacyprojektion, kleiner echter GK-Aufgabencheck statt bloßer Coverage-ID.** Vor Umsetzung keine weitere Ontologie- oder Runtime-Theorierunde nötig. Die anschließende Layer-A-Transaktion muss ihre aktuellen Source-/Scope-/Graph-/Assessment- und M6-Gates tatsächlich erfüllen; diese Notiz ersetzt weder diese Gates noch eine neue fachliche Quellenprüfung der übrigen Länder.
