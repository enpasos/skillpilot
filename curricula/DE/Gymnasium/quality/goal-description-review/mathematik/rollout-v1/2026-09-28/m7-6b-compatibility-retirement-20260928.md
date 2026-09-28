# 6b2a1c04: fachliche Dublette als Kompatibilitätsknoten

Status: kanonische Bereinigung umgesetzt; **keine neue D-Freigabe, kein M7-Abschluss und noch keine Produktionsabnahme**.

## Fachlicher Befund

Die frühere Beschreibung „besondere Lagebeziehungen von Geraden und Ebenen“ bezeichnete keine eigenständige LK-Leistung. Der einzige direkte geprüfte amtliche Quellenbezug war HE Q2.3, Spiegelstrich 3, Aspekt 3: besondere Lage **einer Geraden zu Koordinatenachsen und Koordinatenebenen**, gültig für GK und LK. `58f613da…` bildet diesen Aspekt bereits exakt ab. Die allgemeine Gerade–Ebene-Lage ist `24174bba…`, die Lage zweier Ebenen `0f4f9957…`. BW 3.5.3(6) und (7) nennen genau diese beiden allgemeinen Lagebeziehungen. HE Q2.3 nennt die parameterabhängigen Fälle sowie Geraden- und Ebenenscharen gesondert; dafür bestehen `5f90df42…`, `edaf0bb4…` und `fd4b7145…`. Keine dieser Quellen begründet ein zusätzliches breites LK-Ziel `6b2a…`.

Quellenanker: `input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`, Q2.3, und `input/BW/upper-secondary/source-extraction/DE_BW_MATHEMATIK_SEKII_BP2016.source-extraction.json`, 3.5.3; Pfade relativ zu `curricula/DE/Gymnasium/`. Das geprüfte HE-Mapping enthält nun nur noch die exakte Kante zum eigenständigen Ziel `58f613da…`.

## Aktueller Graph und Lernerfolge

- `6b2a1c04-8c28-51ff-905b-9c9492a26cc3` bleibt als bekannte ID und `runtimeSupport`-Kompatibilitätscluster erhalten. Es verweist auf die drei fachlich getrennten Ziele, ist mit `compatibilityOnly: true` und `applicabilityProjection: "excluded"` gekennzeichnet und hängt nicht mehr unter dem aktuellen Mathematikbaum oder in der Lernzielbuchnavigation.
- Das Folge-Ziel `7d37513b…` verlangt diese Dublette nicht mehr als Voraussetzung. Seine übrigen Voraussetzungen bleiben bestehen; keine neue fachliche Voraussetzung wird aus der alten Sammel-ID konstruiert.
- Vorhandene Mastery zur alten ID bleibt im Backend gespeichert. Sie wird **nicht** automatisch auf `58f613da…`, `24174bba…` oder `0f4f9957…` verteilt: Die alte breite Bewertung beweist deren einzelne Beherrschung nicht. Der gezielte Backend-Test mit historischer HE- und kanonischer 6b-Mastery schützt genau diese Nicht-Übertragung. Die neue Zielerreichung kann daher bei einzelnen Lernenden von der bisherigen Anzeige abweichen; die alten Daten dürfen dafür nicht gelöscht werden.
- Die bisherigen D-, P-, A-, M- und V-Einzelbelege für `6b2a…` sind historische Belege zur auslaufenden Zielidentität und zählen nicht als Freigaben für die drei aktuellen Ziele. Diese benötigen ihre jeweils aktuellen Prüfnachweise.
- Die historische Neuner-P-Reviewdatei bleibt unverändert. Die aktive P-Registry verweist jetzt auf eine materialisierte Achter-Auswahl ohne `6b2a…`; der gezielte P-v2-Check meldet acht `needs_human_review`-Records und keinen strukturellen Blocker. Der 6b-Record wird nicht mit neuen Fingerprints scheinbar wiederbelebt.
- Das Entfernen der 6b-Voraussetzung änderte den aktuellen Input von `7d37513b…`. Dessen bisheriger P-Record war deshalb stale. Das P-Profil wurde fachlich gegen das unveränderte Ziel und die verbleibenden Voraussetzungen geprüft und als eigener, aktuell gebundener AI-Kandidat materialisiert; die vier anderen Records des ursprünglichen P-Batches bleiben byteidentisch erhalten. Der gezielte P-v2-Check ist für beide Nachfolge-Configs grün. Der V-Nachweis ist weiterhin gesondert neu zu binden bzw. zu prüfen; D und V wurden hier nicht bearbeitet.

## Rollout-Gate für bestehende Sitzungen

Vor Produktion muss ein Backend-Integrationstest mit einem bestehenden Lernenden `6b2a…` als gespeichertem Fokus **und** als aktivem Ziel durchlaufen: Nach Laden des neuen Graphen sind die alte ID weder Target noch Frontier noch im Lernzielbuch, der ungültige Fokus wird auf einen gültigen Standardfokus gesetzt, das aktive Ziel wird geleert, die gespeicherte alte Mastery bleibt unverändert und keines der drei Nachbarziele erhält daraus Mastery. Auch der Leseweg ohne Seiteneffekte muss eine leere oder gültige Projektion liefern und darf `6b2a…` nicht als aktives Ziel empfehlen. Die vorhandenen Revalidierungswege in `LearnerService` deuten auf dieses Verhalten; der spezifische Fokus-/Aktivziel-Integrationstest und ein kontrollierter Deploy-Check sind noch offen.

Die kanonische DAG-Validierung, die vollständige semantische Atomizitätsprüfung und die vollständige Memory-Card-Prüfung sind nach der Bereinigung lokal grün. Der vollständige Lernzielbuch-/M7-Lauf ist ein separates Gate, besonders nach den parallel laufenden Mathematikänderungen.
