# Ungeklärter Fachumfang darf keinen Abschluss melden

Ein direkt ausgewählter kanonischer Fachlehrplan ohne eigenen Auswahlfluss
konnte bei leerem Personal Curriculum oder LK ohne Stage als fertig eingerichtet
gelten. Im tatsächlich geprüften Informatikfall meldete ein alter, bereits
gemeisterter Fokus dadurch sogar `scope_completed=true`. Ein fehlender
Auswahlfluss beweist jedoch keinen aufgelösten Lernumfang.

Die Reparatur verwendet den bestehenden Scope- und View-Resolver. Ungeklärte
kanonische Fachzugänge erhalten einen ungültigen Einrichtungsstatus, keine
Lernfrontier und keinen Abschluss. Die WebGUI bietet den vorhandenen Weg zur
bewussten Basislehrplanauswahl an und startet währenddessen keinen automatischen
Lernplanabgleich. Die öffentliche Curriculum-Mutation verwendet jetzt denselben
Katalogguard wie der bestehende andere Einstieg. Explizite passende Fachscopes,
der tatsächliche globale Auswahlfluss, ausdrücklich veröffentlichte
Paketdefaults und klassifizierte Kompatibilitätszugänge behalten ihren jeweils
bestehenden Vertrag. Allgemeine Domänen ohne Auswahlfluss bleiben nutzbar.

Es werden weder ein GK-Profil noch eine Stage ergänzt. Der geprüfte alte
Masterywert bleibt erhalten; eine neue Prüfung erhält keinen Ergebniswert.
Die Servicebelege verwenden Memory-Entities und lokale Eventrecorder, keine
produktiven Lernendendaten oder Datenbanktransaktionen. Die Prüfung des
globalen Auswahlflusses ist kein Beleg für alle landesspezifischen Pflichtziele.

## Übernahme und Prüfung

Der [Anwendungsnachweis](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/informatics-owner-entry-reviewed-active-application/verification.json)
bindet die neun übernommenen Dateien und das unveränderte Autorenpaket.
Alle 21 kanonischen Quellen, die beiden Meilensteinberichte und die geschützte
Floorpolicy blieben bei Anwendung und Prüfung bytegleich.

Die frische aktive Prüfung kompilierte die beiden Produktionsklassen und alle
drei verwendeten Testklassen. Genau 22 JUnit-Fälle wurden gefunden, gestartet
und erfolgreich abgeschlossen, ohne übersprungene Fälle oder Containerfehler.
Editorlabels sowie die vollständigen Startup-/Scope- und SessionSetup-
Browsersuiten liefen ebenfalls mit Exit 0. Die vier konkreten Servicekontrollen
des Autorenpakets vergleichen ungeklärten Fachzugang, LK ohne Stage, expliziten
Fachscope und tatsächlich verfassten globalen Personal-Curriculum-Fluss;
zusätzlich sind Katalogablehnung und bewusste Basiskorrektur belegt.

Ein erster isolierter Root-JUnit-Aufruf hatte eine fehlende Kontrollklasse.
Sein kleiner Runner meldete trotz Discovery-Containerfehler Exit 0. Dieser
Fehlversuch ist unverändert erhalten und zählt nicht als Pass. Der nachfolgende
Runner prüft auch Containerfehler sowie exakt 22 gestartete und erfolgreiche
Tests. Der normale CI-Backendlauf verwendet weiterhin den bestehenden
Gradle-Testlauf, nicht diesen lokalen Hilfsrunner.

Die Änderungen liegen in den bereits aufgerufenen Backend-, Editor-, Startup-
und SessionSetup-Prüfungen. Eine frische Remote-CI für diesen Nachfolger ist
noch ausstehend; der zuvor gestartete Lauf auf `25e667df` prüft dessen Vorgänger.
Es gab kein Deployment. Die Quellen-/Prüfungsmaterial-Reparatur und der neue
Schutz historischer Prüfungsbedeutung bleiben getrennte Änderungen. Dieser
Schritt stellt allein keinen neuen Fachmeilenstein her.
