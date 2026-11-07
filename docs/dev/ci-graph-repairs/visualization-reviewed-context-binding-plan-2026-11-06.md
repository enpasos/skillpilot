# V-Gate: tatsächlichen Reviewkontext binden, 6. November 2026

Der [frisch reproduzierte Diagrammfall](math-diagram-description-b-visualization-independent-review-2026-11-06.json) zeigt eine echte Gatelücke: Bei unverändertem Bild genügt es heute, die neue Beschreibung in der QA-Zeile auszugeben. Der Generator und der native Deep-V-Verbraucher akzeptieren anschließend die alte KI-Freigabe. Eine technische Metadatenaktualisierung erscheint dadurch als Freigabe des veränderten Goal-/Bildkontexts.

Die kleinste belastbare Reparatur bindet eine unveränderliche Reviewquittung an ihre tatsächlich betrachteten Eingaben: Goalidentität, fachlicher Titel/Beschreibung und exakte Bildbytes. Der aktuelle Ledger referenziert diese Quittung mit deren Hash. Der gemeinsame Validator liest und hasht die originalen Bytes, berechnet daraus den begutachteten Kontext und vergleicht ihn mit dem aktuellen Ziel. Ein zusätzliches aus heutigen Metadaten berechnetes Feld allein schließt die Lücke nicht. Der Generator darf aktuelle Anzeigeinformationen aktualisieren, aber weder einen begutachteten Kontext nachträglich umschreiben noch einen alten Review als neuen ausgeben.

Der Mindestumfang schließt den bereits bestehenden V-Vertrag für den kanonischen angezeigten Titel und die Beschreibung. Zusätzlich behauptete Prüfung von Englisch, Kurs- oder weiterem Materialkontext benötigt auch dessen tatsächliche gebundene Eingaben; eine deutsche Metadatei beweist keinen ungelesenen englischen Text. Ein pauschaler Fingerprint des gesamten Goals einschließlich `requires` oder Gewicht wäre kein Ersatz für diese präzise Inhaltsbindung.

Die Inventur umfasst genau die fünf aktuellen zentral registrierten V-Ledger:

| Fach | Ledgerzeilen | Aktuelle curricularAtomic-Ziele |
| --- | ---: | ---: |
| Mathematik | 832 | 807 |
| Physik | 509 | 478 |
| Chemie | 478 | 455 |
| Biologie | 397 | 397 |
| Wirtschaftswissenschaften | 346 | 346 |
| Gesamt | 2562 | 2483 |

Alle Zeilen besitzen dieselben 27 Felder und keinen strukturierten unveränderlichen Goalreviewkontext. Alle heutigen Anzeigetexte passen zu den aktuellen Quellen; das ist gerade kein Beweis, dass frühere Reviewer diese Texte gesehen haben. 973 Notizen enthalten Repository-Locators, neun den vollständigen aktuellen Beschreibungstext. Beides sind Suchhilfen, keine automatische Qualifikation.

Vorhandene echte Reviews dürfen erhalten bleiben. Der tatsächliche Mathematikreview für `922d89fc…` enthält einen vollständigen DE/EN-Goalsnapshot und den Bildhash; beide wurden gegen den heutigen Text und die beiden tatsächlichen Assetdateien geprüft. Seine Integrationsquittung bindet den originalen Reviewhash. Beim Wirtschaftsreview `6f75cdff…` bindet die Originalquittung die tatsächlich gelesene native Metadatei mit Titel/Beschreibung und das Bild; die Hashkette und aktuellen DE-Texte stimmen. Diese Originaleingaben tragen eine technische Fortgeltungsprüfung. Es wurde hier weder eine neue Bildabnahme behauptet noch bereits ein vollständiger neuer Qualifikationsdatensatz erstellt; insbesondere ursprüngliche Owner-/Quellzuordnung muss dabei explizit bleiben.

Fehlt ein original gebundener Kontext oder unterscheidet er sich, ist eine echte aktuelle Sichtprüfung erforderlich. Historische Prompts, ein Datum, eine aktuelle QA-Zeile oder ein positives Bildhashfeld allein reichen nicht. Für den Diagramm-B-Text liegt diese neue Sichtprüfung bereits vor. Für die beiden übrigen unveränderten Bilder des Math-Dreiers ist die Originalkontextqualifikation noch gesondert zu erbringen; aus unveränderten Bildbytes wird keine neue Abnahme abgeleitet.

Die genaue Zahl weiterer notwendiger Sichtprüfungen ist noch offen. Die vollständige Feldinventur ist keine vollständige Qualifikation sämtlicher historischer Reviewketten. Deshalb weder pauschal 2483 neue Reviews fordern noch den Bestand ungeprüft übernehmen. Jeder tatsächlich qualifizierte Altreview behält seine originalen Bytes, Daten und Reviewer; eine neue technische Qualifikationsquittung beschreibt nur die jetzt geprüfte Bindung. Es gibt keine Baseline- oder Datums-Ausnahme.

Der [konkrete Implementierungs- und Negativtestplan](visualization-reviewed-context-binding-plan-2026-11-06.json) nennt Generator, gemeinsamen Validator, Deep-V-Verbraucher und weitere aktuelle Leser. Die ursprüngliche Viererprobe muss danach den reinen Beschreibungsaustausch ablehnen und den echten frischen B-Review akzeptieren. Erst anschließend sind die vollständigen fünf fachlichen Verbraucher und die Meilensteinkette neu zu prüfen. Hier wurde kein Produktionscode, aktiver Ledger, alter Review oder Floor verändert.
