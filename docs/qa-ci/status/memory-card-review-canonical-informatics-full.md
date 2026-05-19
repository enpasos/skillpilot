# Memory-Card Review: canonical-informatics-full

Dieser Report ist eine menschenlesbare Audit-Sicht auf die Memory-Review-Ledger. Die verbindlichen Prüfdaten bleiben die JSONL-Ledger; dieser Report wird daraus reproduzierbar erzeugt.

## Scope

- Scope: Canonical informatics full landscape
- Landscape: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- Goal ledger: `curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.review.jsonl`
- Card ledger: `curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.cards.review.jsonl`
- Rule version: `memory-card-review-v1`

## Summary

| Metric | Value |
| --- | --- |
| ordinary atomic goals reviewed | 207 |
| goals without memory need | 198 |
| goals with intentional memory support | 9 |
| goals needing developer review | 0 |
| primary cards in scope | 28 |
| kept primary cards with origin trace | 28 |
| cards removed from active decks | 0 |
| memory goals traced | 5/5 |
| composition visibility scopes | 18 |
| memory-required goals checked in views | 96 |
| memory-required goals without visible memory node | 0 |
| blocking issues | 0 |

## Composition Visibility

| Scope | View | Visible goals | Visible memory goals | Checked memory-required goals | Missing visible memory goals |
| --- | --- | --- | --- | --- | --- |
| Informatik Gymnasium GK (DE) | `curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-informatics-gk.view.json` | 251 | 5 | 8 | 0 |
| Informatik Gymnasium LK (DE) | `curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-informatics-lk.view.json` | 270 | 5 | 9 | 0 |
| Informatik Gymnasium DE-BB | `curricula/DE/Gymnasium/composition-views/informatik/de-bb-gym-informatics-crossstage.view.json` | 90 | 5 | 4 | 0 |
| Informatik Gymnasium DE-BE | `curricula/DE/Gymnasium/composition-views/informatik/de-be-gym-informatics-crossstage.view.json` | 90 | 5 | 4 | 0 |
| Informatik Gymnasium DE-BW | `curricula/DE/Gymnasium/composition-views/informatik/de-bw-gym-informatics-crossstage.view.json` | 97 | 5 | 4 | 0 |
| Informatik Gymnasium DE-BY | `curricula/DE/Gymnasium/composition-views/informatik/de-by-gym-informatics-crossstage.view.json` | 233 | 5 | 9 | 0 |
| Informatik Gymnasium DE-HB | `curricula/DE/Gymnasium/composition-views/informatik/de-hb-gym-informatics-crossstage.view.json` | 114 | 5 | 6 | 0 |
| Informatik Gymnasium DE-HE | `curricula/DE/Gymnasium/composition-views/informatik/de-he-gym-informatics-crossstage.view.json` | 233 | 5 | 9 | 0 |
| Informatik Gymnasium DE-HH | `curricula/DE/Gymnasium/composition-views/informatik/de-hh-gym-informatics-crossstage.view.json` | 96 | 5 | 2 | 0 |
| Informatik Gymnasium DE-MV | `curricula/DE/Gymnasium/composition-views/informatik/de-mv-gym-informatics-crossstage.view.json` | 158 | 5 | 6 | 0 |
| Informatik Gymnasium DE-NI | `curricula/DE/Gymnasium/composition-views/informatik/de-ni-gym-informatics-crossstage.view.json` | 96 | 5 | 2 | 0 |
| Informatik Gymnasium DE-NW | `curricula/DE/Gymnasium/composition-views/informatik/de-nw-gym-informatics-crossstage.view.json` | 105 | 5 | 3 | 0 |
| Informatik Gymnasium DE-RP | `curricula/DE/Gymnasium/composition-views/informatik/de-rp-gym-informatics-crossstage.view.json` | 116 | 5 | 4 | 0 |
| Informatik Gymnasium DE-SH | `curricula/DE/Gymnasium/composition-views/informatik/de-sh-gym-informatics-crossstage.view.json` | 135 | 5 | 3 | 0 |
| Informatik Gymnasium DE-SL | `curricula/DE/Gymnasium/composition-views/informatik/de-sl-gym-informatics-crossstage.view.json` | 118 | 5 | 6 | 0 |
| Informatik Gymnasium DE-SN | `curricula/DE/Gymnasium/composition-views/informatik/de-sn-gym-informatics-crossstage.view.json` | 141 | 5 | 5 | 0 |
| Informatik Gymnasium DE-ST | `curricula/DE/Gymnasium/composition-views/informatik/de-st-gym-informatics-crossstage.view.json` | 94 | 5 | 5 | 0 |
| Informatik Gymnasium DE-TH | `curricula/DE/Gymnasium/composition-views/informatik/de-th-gym-informatics-crossstage.view.json` | 108 | 5 | 7 | 0 |

## Memory-Required Goals

| Lernziel | Decks | Begründung |
| --- | --- | --- |
| E: Aufbau von Rechnernetzen erklären (`ca07458c-1fc1-5ca1-b226-69f59e2d62d3`) | `de_gymnasium_informatics_network_oop` | Memory-Anteil streng begrenzt auf wenige Netzwerkkomponenten und Rollenbegriffe; das Zusammenspiel lokaler Netze bleibt Erklär- und Modellierungsarbeit. |
| Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | `de_gymnasium_informatics_graphs` | Graphbegriffe sind ein kompakter Fachwortschatz, der korrekt abrufbar sein muss; Graphmodellierung und Algorithmen bleiben normale Übungsarbeit. |
| Q1: Vererbung und Polymorphie erläutern (`c54693ae-448b-5a06-8972-785022f35cd7`) | `de_gymnasium_informatics_network_oop` | Memory-Anteil streng begrenzt auf die Begriffe Vererbung und Polymorphie; Klassenbeziehungen einordnen bleibt Verstehens- und Übungsarbeit. |
| Q2: Grundoperatoren anwenden (`fdfa87be-06ca-5c54-9950-d8408dba8e38`) | `de_gymnasium_informatics_databases` | Die relationalen Grundoperatoren müssen als Fachnotation und Bedeutung sicher abrufbar sein; ihr Einsatz bleibt Abfrage- und Übungspraxis. |
| Q2: Kardinalitäten und Optionalitäten sichern (`1eb09d02-9123-50e2-bfee-e2f0b5b23564`) | `de_gymnasium_informatics_databases` | Kardinalitäten und Optionalitäten enthalten knappe Notations- und Bedeutungsbausteine; das Begründen komplexer ER-Modelle bleibt Modellierungsarbeit. |
| Q2: Weitere Operatoren nutzen (`56e5edb6-b883-50a0-92bb-732d5e44c781`) | `de_gymnasium_informatics_databases` | Weitere relationale Operatoren werden nur als knapper Abrufbestand gesichert; das Anwenden in Abfragen bleibt Übungsarbeit. |
| Q3: Formale Sprache definieren (`cdb24f8f-3596-5e68-a44f-9d651c7eed62`) | `de_gymnasium_informatics_formal_languages` | Alphabet, Wort und formale Sprache sind präzise Definitionsbausteine; Beispiele bilden und Sprachen untersuchen bleibt Verstehensarbeit. |
| Q3: Grammatiken schreiben (`c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565`) | `de_gymnasium_informatics_formal_languages` | BNF-Notation und Grammatikgrundbegriffe müssen korrekt abrufbar sein; Grammatiken zu formulieren bleibt Konstruktions- und Übungsarbeit. |
| Q4: Fakten und Regeln schreiben (`5f48f0bb-a1a6-588e-a498-fab20245efcd`) | `de_gymnasium_informatics_logic_programming` | Fakten, Regeln und Anfragen enthalten kleine Syntaxmuster, die korrekt abrufbar sein müssen; Wissensbasen modellieren bleibt Problemlösearbeit. |

## Kept Cards

| Deck | Card | Front | Answer | Origin goals | Begründung |
| --- | --- | --- | --- | --- | --- |
| `de_gymnasium_informatics_databases` | `informatics_databases_001` | Was bedeutet 1:1 in einem ER-Modell? | Ein Objekt der einen Entitätsmenge ist höchstens einem Objekt der anderen Entitätsmenge zugeordnet und umgekehrt. | Q2: Kardinalitäten und Optionalitäten sichern (`1eb09d02-9123-50e2-bfee-e2f0b5b23564`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_002` | Was bedeutet 1:n in einem ER-Modell? | Ein Objekt der einen Entitätsmenge kann mehreren Objekten der anderen Entitätsmenge zugeordnet sein; jedes dieser Objekte gehört höchstens zu einem Objekt der ersten Entitätsmenge. | Q2: Kardinalitäten und Optionalitäten sichern (`1eb09d02-9123-50e2-bfee-e2f0b5b23564`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_003` | Was bedeutet n:m in einem ER-Modell? | Mehrere Objekte der einen Entitätsmenge können mehreren Objekten der anderen Entitätsmenge zugeordnet sein. | Q2: Kardinalitäten und Optionalitäten sichern (`1eb09d02-9123-50e2-bfee-e2f0b5b23564`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_004` | Wofür steht Projektion in der relationalen Algebra? | Projektion wählt bestimmte Attribute beziehungsweise Spalten einer Relation aus. | Q2: Grundoperatoren anwenden (`fdfa87be-06ca-5c54-9950-d8408dba8e38`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_005` | Wofür steht Selektion in der relationalen Algebra? | Selektion wählt Tupel beziehungsweise Zeilen einer Relation aus, die eine Bedingung erfüllen. | Q2: Grundoperatoren anwenden (`fdfa87be-06ca-5c54-9950-d8408dba8e38`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_006` | Was beschreibt ein Join in der relationalen Algebra? | Ein Join verknüpft Relationen über zusammengehörige Attributwerte. | Q2: Grundoperatoren anwenden (`fdfa87be-06ca-5c54-9950-d8408dba8e38`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_007` | Was bedeutet Vereinigung zweier Relationen? | Die Vereinigung enthält alle Tupel, die in mindestens einer der beiden kompatiblen Relationen vorkommen. | Q2: Weitere Operatoren nutzen (`56e5edb6-b883-50a0-92bb-732d5e44c781`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_008` | Was bedeutet Schnitt zweier Relationen? | Der Schnitt enthält nur die Tupel, die in beiden kompatiblen Relationen vorkommen. | Q2: Weitere Operatoren nutzen (`56e5edb6-b883-50a0-92bb-732d5e44c781`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_databases` | `informatics_databases_009` | Was bedeutet Differenz zweier Relationen? | Die Differenz enthält die Tupel der ersten Relation, die nicht in der zweiten kompatiblen Relation vorkommen. | Q2: Weitere Operatoren nutzen (`56e5edb6-b883-50a0-92bb-732d5e44c781`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_001` | Was ist ein Alphabet in der Theorie formaler Sprachen? | Ein Alphabet ist eine endliche Menge von Zeichen. | Q3: Formale Sprache definieren (`cdb24f8f-3596-5e68-a44f-9d651c7eed62`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_002` | Was ist ein Wort über einem Alphabet? | Ein Wort ist eine endliche Folge von Zeichen aus diesem Alphabet. | Q3: Formale Sprache definieren (`cdb24f8f-3596-5e68-a44f-9d651c7eed62`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_003` | Was ist eine formale Sprache? | Eine formale Sprache ist eine Menge von Wörtern über einem Alphabet. | Q3: Formale Sprache definieren (`cdb24f8f-3596-5e68-a44f-9d651c7eed62`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_004` | Was ist ein Terminalsymbol in einer Grammatik? | Ein Terminalsymbol ist ein Zeichen, das in erzeugten Wörtern der Sprache tatsächlich vorkommt. | Q3: Grammatiken schreiben (`c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_005` | Was ist ein Nichtterminalsymbol in einer Grammatik? | Ein Nichtterminalsymbol ist ein ersetzbares Hilfssymbol, das durch Produktionsregeln weiter abgeleitet wird. | Q3: Grammatiken schreiben (`c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_formal_languages` | `informatics_formal_languages_006` | Welche Form hat eine einfache BNF-Produktionsregel? | Eine typische Regel hat die Form <Nichtterminal> ::= Ausdruck, zum Beispiel <Ziffer> ::= 0 \| 1 \| ... \| 9. | Q3: Grammatiken schreiben (`c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_graphs` | `informatics_graphs_001` | Was ist ein Knoten in einem Graphen? | Ein Knoten ist ein Element oder Objekt des Graphen, das durch Kanten mit anderen Knoten verbunden sein kann. | Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_graphs` | `informatics_graphs_002` | Was ist eine Kante in einem Graphen? | Eine Kante beschreibt eine Verbindung oder Beziehung zwischen zwei Knoten. | Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_graphs` | `informatics_graphs_003` | Was ist ein Pfad in einem Graphen? | Ein Pfad ist eine Folge von Knoten, bei der aufeinanderfolgende Knoten jeweils durch eine Kante verbunden sind. | Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_graphs` | `informatics_graphs_004` | Wodurch unterscheidet sich ein gerichteter Graph? | In einem gerichteten Graphen haben Kanten eine Richtung von einem Startknoten zu einem Zielknoten. | Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_graphs` | `informatics_graphs_005` | Was bedeutet eine Gewichtung an einer Kante? | Eine Gewichtung ordnet einer Kante einen Wert zu, zum Beispiel Kosten, Entfernung, Dauer oder Kapazität. | Q1: Graphbegriffe kennen (`f0910b55-48a9-4f81-aed6-d15ac0446c70`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_logic_programming` | `informatics_logic_programming_001` | Wie ist ein einfaches Prolog-Faktum aufgebaut? | Ein Faktum hat die Form prädikat(argumente)., zum Beispiel mensch(sokrates). | Q4: Fakten und Regeln schreiben (`5f48f0bb-a1a6-588e-a498-fab20245efcd`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_logic_programming` | `informatics_logic_programming_002` | Wie ist eine einfache Prolog-Regel aufgebaut? | Eine Regel hat die Form kopf :- bedingung., zum Beispiel sterblich(X) :- mensch(X). | Q4: Fakten und Regeln schreiben (`5f48f0bb-a1a6-588e-a498-fab20245efcd`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_logic_programming` | `informatics_logic_programming_003` | Wie ist eine einfache Prolog-Anfrage aufgebaut? | Eine Anfrage hat die Form ?- ziel., zum Beispiel ?- sterblich(sokrates). | Q4: Fakten und Regeln schreiben (`5f48f0bb-a1a6-588e-a498-fab20245efcd`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_network_oop` | `informatics_network_oop_001` | Welche Aufgabe hat ein Switch in einem lokalen Netzwerk? | Ein Switch verbindet Geräte innerhalb eines lokalen Netzwerks und leitet Datenpakete gezielt an das passende Gerät weiter. | E: Aufbau von Rechnernetzen erklären (`ca07458c-1fc1-5ca1-b226-69f59e2d62d3`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_network_oop` | `informatics_network_oop_002` | Welche Aufgabe hat ein Router? | Ein Router verbindet unterschiedliche Netzwerke und leitet Datenpakete zwischen ihnen weiter. | E: Aufbau von Rechnernetzen erklären (`ca07458c-1fc1-5ca1-b226-69f59e2d62d3`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_network_oop` | `informatics_network_oop_003` | Was bezeichnet das Client-Server-Prinzip? | Ein Client fordert Dienste oder Daten an; ein Server stellt diese Dienste oder Daten bereit. | E: Aufbau von Rechnernetzen erklären (`ca07458c-1fc1-5ca1-b226-69f59e2d62d3`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_network_oop` | `informatics_network_oop_004` | Was bedeutet Vererbung in der objektorientierten Modellierung? | Eine Klasse übernimmt Attribute und Methoden einer Oberklasse und kann sie erweitern oder spezialisieren. | Q1: Vererbung und Polymorphie erläutern (`c54693ae-448b-5a06-8972-785022f35cd7`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |
| `de_gymnasium_informatics_network_oop` | `informatics_network_oop_005` | Was bedeutet Polymorphie in der objektorientierten Programmierung? | Objekte unterschiedlicher Klassen können über eine gemeinsame Schnittstelle angesprochen werden und passend zur konkreten Klasse reagieren. | Q1: Vererbung und Polymorphie erläutern (`c54693ae-448b-5a06-8972-785022f35cd7`) | Behalten: kompakter Informatik-Fachbegriff, Notationsbaustein oder Syntaxmuster mit kanonischer Lernzielherkunft; Modellierung, Implementierung und Anwendung bleiben außerhalb der Karte fachlich führend. |

## Removed Cards

Entfernte Karten bleiben im Card-Ledger als negative Entscheidung erhalten. Sie dürfen nicht mehr in einem aktiven Primärdeck vorkommen.

Keine.

## Blocking Issues

Keine.

