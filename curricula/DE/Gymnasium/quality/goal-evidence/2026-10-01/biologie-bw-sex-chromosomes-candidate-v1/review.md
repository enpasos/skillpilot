# BW Geschlechtschromosomen: Kandidat v1

Status: inaktiv; keine Kanon-, Mapping- oder Registry-Integration. Die stabile ID und die fachliche Begründung stehen in `candidate.json`.

Die amtliche BW-Biologie-V2 nennt in 3.3.2(5), gedruckte S. 22, die Bestimmung des Geschlechts beim Menschen durch Geschlechtschromosomen. Das bislang alleinige Mapping auf `37147890` ist nur ein Teilbeleg: dessen geplanter aktueller HE-Text prüft im selben Fall die Reichweite eines Karyogramms gegenüber körperlichem Befund und Geschlechtsidentität. Diese drei Informationsquellen verlangt BW 3.3.2(5) nicht. Der eigene Sek-I-Atomvorschlag prüft nur die chromosomale Erklärung an einer vereinfachten Konstellation und vermeidet eine Aussage über Körpermerkmale oder Identität aus dem Chromosomensatz allein.

Das Ziel wird unter dem bestehenden Sek-I-Genetikcluster platziert. Es hat keinen fachlich notwendigen separaten `requires`-Vorgänger; die Erklärung kann im Ziel selbst gelehrt und geprüft werden. Die atomare `applicabilityMappingInheritance: boundary` verhindert eine falsche Vererbung breiter Vorfahren-Mappings; der Compiler unterstützt diese Semantik auch bei Atomen. Das BW-Original erhält nach Integration eine direkte Zuordnung, während die partielle alte `37147890`-Zuordnung gezielt zurückgezogen wird. Der aktive Mappingbaum bleibt bis zu einer Entscheidung unangetastet.

Neue Nachweise nach Entscheidung: zwei unabhängige aktuelle DE/EN-D-Reviews; P-v2 mit zwei frischen Konstellationsfällen und begründeter Grenze zur Körperausprägung/Identität; A- und M-Entscheidungen; Bildkandidat mit Alttext und visuelle QA; echte Lernendenprojektion und Source-Original-Coverage. Der Nenner steigt von 362 auf 363, ohne wiederhergestellten oder neuen strengen Abschluss aus dem Kandidaten.
