# G16/G17-Normalisierung und Fortgeltung von D/P-Nachweisen

Stand 6. November 2026. **Vertragsanalyse und Empfehlung, keine implementierte
Kompatibilität, keine Anwendung und keine zusätzliche QA-Erfüllung.** Die
[Quellenbindung](formal-prerequisite-normalization-evidence-compatibility-analysis-2026-11-06.sources.json)
hält die tatsächlich gelesenen Normen, Validatoren und Kriterien fest.

**Der derzeitige Vertrag gestattet keine automatische D/P-Fortgeltung allein
aufgrund gleicher Graph-Closure.** Ein eigener enger Kompatibilitätsvertrag ist
fachlich sinnvoll, wenn er die unveränderten Beiträge der alten Nachweise und
sämtliche tatsächlich geänderten Kontexte getrennt nachweist. Er wäre eine
ausdrückliche neue Regel samt Validatorintegration. Die bestehenden
Requires-Fingerprints einfach zu ignorieren oder neu zu schreiben wäre keine
zulässige Umsetzung.

Hier bezeichnet **P** das maschinelle Verständnisprofil
`positive-understanding-evidence-v2`. Tatsächliche Champion-Erprobungsquittungen
sind eine andere Nachweisart und gehören nicht automatisch in denselben Kanal.

## Was heute verbindlich ist

| Quelle | Bedeutung für diese Frage |
|---|---|
| [Graph Definition §§7.2–7.3](../../concept/skill-graph/graph-definition.md#73-transitive-minimality) | Lokale und transitive Minimalität sind Pflicht. Die Reduktion muss trotzdem Quellenbedeutung, Vererbung und geltende Prüfverträge erhalten; sie ist keine Lernerzustandsoperation. |
| [M7-Vertrag §3.1](../../concept/curriculum-quality-and-human-trial.md#31-vollstandiger-abschluss-der-funf-prufgates) | D braucht zwei unabhängige abgeschlossene Reviews am gültigen Inhalt/Kontext; P ein aktuelles vollständig geprüftes V2-Profil. Frühere M7-Zahlen ersetzen das nicht. |
| [Evidence-Pipeline §2 und §4.2](../../concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md#42-fingerprint-binding) | Direkte `requires` und `contains`, Ressourcen und Kriterien gehören zur Reviewbindung. Jeder Mismatch macht den alten Nachweis stale; geänderte Voraussetzungen dürfen keine stille Approval-Vererbung erhalten. |
| [Evidence-Pipeline §13](../../concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md#13-required-validation-classes) | Ein Baseline-Wechsel allein zum Grünmachen ist verboten; die betroffene Prüfung ist zu wiederholen. Der Text enthält derzeit keine G16-/G17-Ausnahme. |
| [Evidence-Pipeline §§5.4–5.5 und Reviewer-Kontext](../../concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md#54-stable-topological-order-from-requires) | Direkte und rückwärts gerichtete Verweise sowie Buchreihenfolge sind sichtbarer und geprüfter Kontext. Gleiche transitive Nachfrage ist nicht automatisch dieselbe Buchseite. |

Die tatsächliche P-Funktion `goalEvidenceReviewInputPayload` bindet die
sortierten direkten Arrays. Der semantische `goalFingerprint` kann unverändert
bleiben, während `reviewInputFingerprint` zu Recht wechselt. Der V2-Validator
weist den alten Input dann als stale zurück. D-V3 bindet zusätzlich
`canonicalContext.requires`, die ganze aktuelle Seite, die unabhängigen Runden
und ihre Auflösung. Der zentrale Report verwendet die strenge aktuelle
Validierung; sein historischer Pfad trägt ausdrücklich keine aktuelle
Readiness bei.

Die Mathematik-Kriterien nennen ausdrücklich den vollständigen curricularen
Umfang einschließlich Beziehungen, Applicability und Quellen. Deshalb wäre
die Behauptung, alle alten D-Urteile hätten ohnehin nur den unveränderten
Beschreibungstext bewertet, falsch.

Die vorhandene `goal-description-scope-narrowing-compatibility` ist ein enger
diagnostischer D-Kanal für entfernte GK-Scope-Tupel. Ihr Beweis verlangt
Gleichheit sämtlicher übriger Seitenfelder; Requires-/Reverse-Links dürfen
nicht wechseln. Sie erzeugt keine neue Dual-Round-Auflösung, keinen P-Nachweis
und keine allgemeine aktuelle M7-Zählberechtigung. Auch ihre historischen
Originalrunden werden vollständig geprüft. Dieser Kanal ist ein Beispiel für
ehrliche getrennte Bindung, aber keine Ermächtigung für Kantenänderungen.

## Was die formale Gleichheit tatsächlich beweist

Bei unverändertem `contains`, identischen Knoten/Typen und vollständig
aufgelösten Referenzen kann ein G16-Entzug sogar die gesamte effektive
Goal-Adjazenz erhalten. Für G17 muss nach jedem konkreten Entzug und für die
Gesamtmenge die vollständige transitive Goal-Relation sowie die normalisierte
atomare Closure gleich sein. G17 bleibt der Goal-Knoten-Beweis aus §7.3; er wird
nicht nachträglich durch einen anderen atomaren Minimalitätsbegriff ersetzt.

Für eine Auswertung, die genau diese vollständigen atomaren Nachfragemengen
verwendet und erst danach die Endpunkte auf Fokus/Targets beschränkt, folgt
damit dieselbe Voraussetzungen-Erfüllung für jede Belegungsmenge der atomaren
Masterywerte und jeden solchen Fokus. Das ist stärker als einige exemplarische
Frontier-Tests. Es beweist aber weder korrekte Lernzieltexte noch Aufgabenqualität,
zulässige Quellenzuordnung oder unveränderte beliebige Consumer-Ausgaben.
Eine bereits fachlich falsche Zwischenkante bleibt auch bei identischer
fehlerhafter Closure falsch.

Ein einfaches Gegenbeispiel zeigt die Kontextgrenze: Im Vollgraphen liegen
`A→B`, `A→C`, `C→B`; `A→B` ist redundant. Ein Buch enthält nur A und B und
behandelt C als extern. Seine jetzige direkte In-Scope-Sortierung sieht vor
der Entfernung B vor A, danach diese interne Kante nicht mehr. Damit kann
die bevorzugte Viewreihenfolge A vor B erzeugen, obwohl die globale Closure
unverändert ist. Das ist ein analytisches Gegenbeispiel zur behaupteten
Implikation, kein behaupteter reproduzierter Bestandsfehler. Die tatsächliche
`topologicallyOrderTargets`-Implementierung verwendet genau direkt auf
Buchtargets beschränkte Voraussetzungen. Auch ohne Reihenfolgenwechsel ändern
sich mindestens direkte beziehungsweise Reverse-Verweise und deren Bindungen.

## Empfohlener separater C-Vertrag

Ein neuer Kanal sollte **unveränderte historische Beiträge mit einem aktuellen
Kompatibilitätsbeweis verbinden**, statt die Originalrecords als neu reviewed
auszugeben. Zunächst ist ein G16-Pilot mit identischer effektiver Adjazenz
kleiner und leichter abzugrenzen als ein pauschaler G17-Rollout. G17 braucht
anschließend dieselben zusätzlichen Kontextnachweise.

1. **Geschlossene Transformation:** Nur konkret aufgelistete Entzüge vorhandener
   `requires`-Einträge; keine neuen Kanten, Umordnung, Umbenennung, Text-,
   Contains-, Typ-, Scope-, Mapping-, Karten-, Aufgaben-, Rubrik-, Coverage-,
   Ressourcen- oder Kriterienänderung. Vorherige ganze Arrays, Goal-Identitäten
   und Dateibytes sind geschützt. UUID-Migration ist eine andere Transformation.
2. **Echte unabhängige Eingabepins:** Festgelegte Originalrevision, aktuelle
   Kandidatenrevision beziehungsweise exakte Kandidatenbytes, zugelassener
   Policy-/Schema-/Validator-Digest und akzeptierte Belegdigests kommen aus dem
   aufrufenden Prüfvertrag. Ein im Manifest selbst behaupteter Ausgangshash
   genügt nicht. Alle tatsächlich verwendeten Bytes werden einmal erfasst und
   danach unveränderlich geprüft; keine unbekannten oder ausgelassenen Inputs.
3. **Vollständiger Graphbeweis:** Die feste tatsächliche Loader-/Owner-Domäne,
   globale Referenzen, eingehende Contains-Ahnen, Clusteratome und sämtliche
   beeinflussten fremden Verbraucher werden berücksichtigt. Keine First-/Last-
   Auswahl widersprüchlicher Serialisierungen. Vor jeder Entfernung wird ihr
   authored Ursprung entzogen und der verbleibende Pfad neu berechnet;
   individuelle und gemeinsame Goal-/Atomic-Gleichheit sind Pflicht.
4. **Wirkliche Consumer-Gleichheit:** Alle geltenden Scopes und Rollen,
   Applicability, sichtbaren Targetbäume, Abschluss-/Frontier-Nachfragen und
   eingefrorenen relevanten Runtime-Verträge müssen unverändert bleiben.
   Ergebnisse werden mit den Produktionsfunktionen verglichen. Der Graphsatz
   allein darf keine andere Ableitungsfunktion als gleich erklären.
5. **Aktueller Review-/Buchkontext:** Alte und neu erzeugte vollständige
   V3-/P-Eingaben werden verglichen. Zulässige Unterschiede sind einzeln als
   direkte beziehungsweise Reverse-Verweisänderungen, daraus berechnete
   Bindungen und ausdrücklich erlaubte technische Darstellungseffekte
   ausgewiesen. Buchreihenfolge, Kapitel, Targets, Texte und Ressourcen bleiben
   für den ersten engen Kanal identisch. PDF/HTML, Links und Layout erhalten
   frische technische Prüfungen. Ungeklärte Seitendeltas schlagen fehl.
6. **Beitragstreue der fachlichen Urteile:** Beide ursprünglichen D-Runden,
   Synthese, Dissens, Kriterien, Autorität und das ganze P-Profil werden in
   ihrem originalen gebundenen Kontext validiert. Ob ein freier alter Reviewtext
   oder ein Bild eine bestimmte direkte Kante, Reihenfolge oder vorausgesetzte
   Methode behauptet, folgt nicht aus Closure. Solche Fälle benötigen einen
   gezielten neuen fachlichen Review der betroffenen Aussage und sind für einen
   rein mechanischen ersten Kanal ausgeschlossen. Bekannte Blocker bleiben
   Blocker. Der Beweis ersetzt keine fachliche Prüfung der neuen Modellierung.
7. **Getrennte Ausgabe und Nutzung:** Ein aktueller Receipt bindet Original- und
   Kandidateninputs, unveränderte Reviewbytes und die tatsächlich bewiesenen
   Teilbehauptungen. Er verändert weder ursprüngliche Fingerprints/Zeiten/
   Reviewer noch deren E-/G-Stufen oder menschliche Autorität. Nur der passende
   unabhängig geprüfte Validator darf eine unverfälschbare Capability erzeugen;
   eine boolesche Manifestbehauptung darf kein D/P-Gate öffnen. Der zentrale
   Report kann diesen explizit zugelassenen Weg später ausweisen, niemals eine
   parallele M7-Rechnung. Es sind null neue Inhaltsreviews, soweit lediglich
   originale Beiträge fortgelten.

Die neue normative Regel muss genau diesen begrenzten Fortgeltungsfall nennen
und die bisherigen Stale-/Neureview-Regeln für alle anderen Änderungen
erhalten. Insbesondere darf aus „fachlich gleicher Nachfrage“ keine allgemeine
Freigabe beliebiger Darstellung, Assets oder Reviewurteile werden. Bei nicht
formal abgrenzbaren betroffenen Aussagen bleibt die entsprechende echte neue
fachliche Prüfung erforderlich; es besteht kein Grund, dafür unveränderte
andere Ziele pauschal neu zu beurteilen.

## Harte Ausschlüsse und nötige Gegenfälle

Ein C-Kanal muss mindestens folgende Fälle zurückweisen: notwendige Kante
entfernt; Closure nur im ausgewählten Fach gleich, fremder Verbraucher anders;
fremder Contains-Ahne ausgelassen; jede einzelne entfernte Kante scheinbar
redundant, gemeinsame Entfernung aber nicht; zusätzlicher redundanter
Kantenaufbau; gleiche Closure bei geändertem Goaltext/Typ/Assessment/Karte;
Scope-/Buchsortierungs-/Ressourcendrift; altes Review ursprünglich ungültig;
neu gehashte oder synthetisch ersetzte Originalreviews; Selbst-Pin statt
extern akzeptierter Referenz; Parser-/Owner-Kollision oder unvollständiger
Inputbestand; wiederholtes Lesen veränderter Bytes; ein bekannter fachlicher
Blocker trotz formal gleicher Closure. Fehlender oder übersprungener Beweis
ist kein Erfolg.

Source-A bleibt die andere, isolierte Identitäts-/Definitionsprojektion und
wird dafür nicht umgedeutet. C ist keine öffentliche A→Runtime-/State-Brücke,
kein B-Aktivierungsnachweis und keine neue Anerkennungs- oder Unit-Funktion.
Mastery/SRS, Historien und Importe werden nicht verändert. Menschliche
Erprobungsquittungen benötigen ihren eigenen aktuellen Inhalts-/Scopevertrag;
`ChampionPracticeFingerprint` bindet derzeit ebenfalls direkte Voraussetzungen.
Eine maschinelle D/P-Kompatibilität allein kann weder eine neue praktische
Bearbeitung noch deren aktuelle Human-Freigabe erzeugen.

**Empfehlung:** Erst einen explizit spezifizierten, unabhängig überprüften
G16-C-Pilot vorbereiten. Bis zu dessen normativer und technischer Integration
bleibt jeder tatsächlich abweichende D-/P-Input nach dem heutigen Vertrag
stale. Die 923 Mathematik- und 396 Physik-G17-Befunde sind damit weder fachlich
freigegeben noch normalisiert oder als QA-abgeschlossen anzurechnen.
