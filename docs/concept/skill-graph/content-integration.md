# Contentanbindung: verbindlicher Architekturrahmen

Status: übernommen aus [Issue #50](https://github.com/enpasos/skillpilot/issues/50).
Die Konzeptgrundlage vom 15. September 2026 wurde am 20. September übernommen.
Version 1.1 vom 21. September 2026 setzt die ausdrückliche Klarstellung des
Product Owners um: Die Materialauswahl ist eine normale Cockpit-Einstellung im
bestehenden SkillPilot-ID-Zugangsmodell, ohne zusätzliche Freigabe oder
Content-Zugangsschlüssel. Die Benennung des Skill-Graphs ist redaktionell an das
Repository-Glossar angepasst. Konkrete PoC-Entscheidungen und der Migrationsstand stehen getrennt
im [Physik-Libre-Pilotbericht](../../dev/content-integration-physik-libre-pilot.md).
Bestehende eigene Zielvisualisierungen behalten im PoC ihren geprüften
[Visualisierungsvertrag](atomic-goal-visualizations.md); sie werden nicht
mit optionalen externen Contentpaketen vermischt.

---

# SkillPilot – Architekturrahmen für die Contentanbindung

Anbieterunabhängige Lernmaterialien als optionale Personalisierungsebene

Architekturrahmen  |  Version 1.1  |  21. September 2026

> **SkillPilot trennt die kanonische Kompetenzstruktur, die Zuordnung externer Lernmaterialien und deren persönliche Auswahl.** Content wird an das Curriculum angebunden, nicht in das Curriculum eingebaut.

## 1. Ziel und Geltungsbereich

SkillPilot stellt eine anbieterunabhängige Grundlage für lehrplanbezogenes Lernen bereit. Lernende und Lehrende sollen dazu passende Materialien auswählen können, ohne die gemeinsame Kompetenzstruktur zu verändern. Die Auswahl wird im Rahmen der Personalisierung einer SkillPilot-ID wirksam.

Dieser Rahmen legt die logischen Verantwortungsgrenzen und die dauerhaft zu erhaltenden Architekturprinzipien fest. Er gilt fach- und anbieterübergreifend. Die konkrete Ausgestaltung wird anhand praktischer Anwendungen und gegebenenfalls gemeinsam mit Contentprovidern entwickelt. Der erste Anwendungsfall ist Physik im Gymnasium mit Physik Libre. [1]

## 2. Architekturentscheidung

| Ebene | Verantwortung und Abgrenzung |
| --- | --- |
| Kanonisches Curriculum | Beschreibt Lernziele, fachliche Voraussetzungen, curriculare Zuordnungen und deren Quellenbelege. Enthält keine didaktischen Contentlinks und keine Festlegung auf bestimmte Anbieter oder Lernmaterialien. |
| Contentebene | Verknüpft externe Materialien mit den curricularen Lernzielen. Contentlink-Pakete bündeln solche Zuordnungen außerhalb des kanonischen Curriculums. Sie verändern weder dessen Ziele noch dessen Abhängigkeiten. |
| Personalisierung | Legt für eine SkillPilot-ID fest, welche Contentanbindungen berücksichtigt werden. Die Auswahl erfolgt als normale Cockpit-Einstellung über den bestehenden Profilzugang. Mehrere Angebote können nebeneinander bestehen. |

**Die Verweisrichtung verläuft von der Contentebene zum Curriculum.** Das Curriculum muss einzelne Anbieter oder Pakete nicht kennen. Die Personalisierung wählt aus der Contentebene aus; sie schreibt keine Materialauswahl in die kanonischen Lernziele zurück.

„Contentlink-Paket“ bezeichnet hier eine logisch zusammengehörige Sammlung von Materialverweisen und Lernzielzuordnungen. Damit sind weder ein Dateiformat noch ein Übertragungsprotokoll festgelegt. Die Trennung der Ebenen verlangt auch keine getrennten Dienste oder Datenbanken.

## 3. Architekturprinzipien

### 3.1 Fachlicher Kern und Quellenbelege bleiben erhalten

Didaktische Verweise auf Erklärungen, Aufgaben, Bücher oder andere Lernmaterialien werden aus dem kanonischen Curriculum herausgehalten. Quellenbelege, die Herkunft und Interpretation curricularer Aussagen nachvollziehbar machen, bleiben dagegen erhalten. Entscheidend ist die Funktion eines Verweises, nicht seine Domain oder Dokumentart. Die Trennung darf die Nachvollziehbarkeit der Curriculumarbeit nicht schwächen.

### 3.2 Zuordnungen liegen außerhalb des Curriculums

Materialien werden über eindeutige Referenzen den passenden Lernzielen zugeordnet. Ein Material kann mehrere Ziele unterstützen; zu einem Ziel können mehrere Materialien passen. Die Zuordnung darf keinen vollständigen Contentbestand voraussetzen. Ein Anbieterwechsel oder ein weiteres Paket erfordert keine inhaltliche Änderung des kanonischen Curriculums. Wie Referenzen, Versionen und Änderungen technisch behandelt werden, bleibt offen.

### 3.3 Auswahl gehört zur SkillPilot-ID

Die wirksame Contentauswahl ist eine normale Cockpit-Einstellung bei SkillPilot und nicht ausschließlich eine Einstellung eines bestimmten KI-Hosts oder Chats. Materialien werden ausgewählt und gespeichert; die Auswahl kann geändert oder aufgehoben werden. Es gibt keinen zusätzlichen Content-Zugangsschlüssel, keine manuelle Freischaltung einzelner Profile und kein besonderes Lehrendenkonto.

Wie im übrigen Cockpit ist die SkillPilot-ID der Profilzugang. Technisch wird absichtlich nicht zwischen der lernenden Person und jemandem mit einer Kopie ihrer ID unterschieden. Wer ein Profil über diese ID verwendet, hat auch dieselbe Möglichkeit zur Materialauswahl. Die ID bleibt deshalb vertraulich; die Materialanbindung schafft weder eine neue Identitätsprüfung noch eine serverseitige Lehrenden- oder Klassenbeziehung. Die bestehenden Prüfungen für aktive Profile, schreibbare Sitzungen und widerspruchsfreie Speicherstände bleiben erhalten.

Die Contentfunktion steht standardmäßig zur Verfügung; eine neue SkillPilot-ID startet dennoch ohne ausgewähltes Paket. Ein globaler Betriebsschalter kann die optionale Anbindung abschalten, ohne das Lernen zu sperren. Gruppenbezogene Vorgaben und Prioritäten sind nicht Voraussetzung der persönlichen Auswahl und können später ausgestaltet werden.

### 3.4 Lernstand und Kompetenznachweis bleiben unabhängig

Die Auswahl, der Wechsel oder die Deaktivierung eines Pakets verändert keine bereits erreichten Lernstände. Das Öffnen eines Links oder die Verfügbarkeit eines Materials weist keine Kompetenz nach. Materialien können den Lernprozess und die Gewinnung von Kompetenznachweisen unterstützen; die Entscheidung über Zielerreichung und Freischaltungen bleibt in der dafür vorgesehenen SkillPilot-Logik.

### 3.5 Die Anbindung ist optional und allgemein

Das Curriculum bleibt ohne aktiviertes Contentpaket nutzbar. Fehlende Zuordnungen oder nicht verfügbare Materialien dürfen keine inhaltliche Sperre im Skill-Graph erzeugen. Fach, Anbieter, freie oder kostenpflichtige Bereitstellung sind keine Gründe für unterschiedliche Grundarchitekturen. Zusätzliche Anwendungsfälle sollen den gleichen Rahmen nutzen können, ohne anbieterspezifische Sonderfälle in den curricularen Kern einzubauen.

### 3.6 Qualität und Zuständigkeiten werden getrennt betrachtet

Die Qualität des Curriculums, die Qualität eines Materials und die Richtigkeit seiner Lernzielzuordnung sind getrennte Aussagen. Ein Curriculum-Meilenstein bestätigt nicht automatisch die Qualität angebundener Inhalte. Die Herkunft einer Zuordnung muss nachvollziehbar sein; ein von Dritten erstelltes Paket gilt nicht automatisch als vom Anbieter bestätigt. Contentanbieter erhalten durch die Anbindung keine Kontrolle über Kompetenzmodell, Lernstandsentscheidungen oder Systemberechtigungen.

### 3.7 Aktivierung, Zugang und Nutzung sind verschiedene Fragen

Ein aktiviertes Paket bedeutet zunächst, dass seine Materialien berücksichtigt werden sollen. Es bescheinigt weder eine Zugangsberechtigung noch einen tatsächlichen oder erlaubten Inhaltszugriff durch die KI. Ebenso begründet es keine automatische Weitergabe von SkillPilot-ID oder Lernverlauf an Anbieter. Die Anbindung setzt keine Übernahme der Inhalte in SkillPilot voraus; weitergehende Zugriffs- und Nutzungsmodelle sind gesondert auszugestalten.

## 4. Bewusst offene Ausgestaltung

Der Architekturrahmen definiert die Grenzen zwischen Kompetenzmodell, Materialzuordnung und Personalisierung. Er legt noch kein vollständiges Contentprodukt fest. Insbesondere werden die folgenden Entscheidungen nicht vorweggenommen:

| Themenfeld | Später auszugestalten |
| --- | --- |
| Format und Bereitstellung | Datenformat, Metadaten, Austauschstandard, Speicherung, Import und Schnittstellen. Auch die technische Form eines Contentlink-Pakets bleibt offen. |
| Fachliche Verknüpfung | Granularität der Verweise, didaktische Rollen, Abdeckungsangaben sowie Umgang mit unterschiedlichen Materialausgaben und Curriculumständen. |
| Nutzung im Lernprozess | Darstellung, Reihenfolge und Auswahl passender Materialien; Umfang des Materialkontexts für den Coach; mögliche Einbindung digitaler und gedruckter Angebote. |
| Auswahl und Verwaltung | Erweiterte Katalogsuche, Empfehlungen, Gruppen- oder Kurszuordnungen und Prioritäten; die persönliche Cockpit-Auswahl nutzt bereits den bestehenden Profilzugang. |
| Zugang und Finanzierung | Anbindung vorhandener Nutzungsrechte, Bezahlcontent, gegebenenfalls kostenpflichtige Ankopplung, Lizenzmodelle und Abrechnung. |
| Qualität und Betrieb | Erstellung, fachliche Prüfung, Kennzeichnung, Veröffentlichung, Pflege und Aktualisierung von Paketen sowie Zuständigkeiten bei fehlerhaften oder veralteten Zuordnungen. |

Für einen funktionierenden Pilotversuch dürfen einfache technische und fachliche Entscheidungen getroffen werden. Sie werden damit nicht automatisch zum dauerhaften Standard. Verallgemeinert werden soll das, was sich praktisch bewährt und die Architekturprinzipien erhält; zusätzliche Komplexität benötigt einen konkreten Anwendungsbedarf.

## 5. Zusammenarbeit mit Contentprovidern

Contentprovider sollen ihre Materialien an SkillPilot anschließen können, ohne selbst ein vollständiges System zur Lernstandsführung und curricularen Lernbegleitung bereitstellen zu müssen. SkillPilot soll dafür eine gemeinsame, nachvollziehbare Zuordnungsgrundlage bieten, ohne einen Anbieter zu bevorzugen oder dessen Angebot zu vereinnahmen. Die Anbindung soll offen dokumentiert sein und es Contentprovidern oder anderen fachkundigen Beteiligten ermöglichen, Zuordnungen selbst zu erstellen.

Die Ausgestaltung kann gemeinsam mit Anbietern und Lehrenden erfolgen. Praktische Fragen zu Verweistiefe, Pflegeaufwand, Darstellung und Zugang sollen an konkreten Materialien geklärt werden. Für den Einstieg ist eine Zusammenarbeit hilfreich, aber nicht Voraussetzung dafür, das allgemeine Architekturprinzip festzulegen.

Ein angestrebter Nutzen ist die wechselseitige Ergänzung: SkillPilot führt zu passenden Materialien; Anbieter können ihren Nutzern eine ergänzende personalisierte Lernbegleitung empfehlen. Ob daraus eine aktive Mitbewerbung von SkillPilot entsteht, ist eine zu prüfende Kooperationsperspektive und keine zugesicherte Wirkung der Architektur.

## 6. Erster Anwendungsfall: Physik im Gymnasium

**Der fachliche Pilot beginnt nach Erreichen von M7 für Physik.** Dieser Rahmen verändert weder die Definition noch den Nachweis dieses Meilensteins. Die Architekturentscheidung kann unabhängig davon festgehalten werden.

Als erster konkreter Anwendungsfall ist Physik Libre unter https://physikbuch.schule/ vorgesehen. [1] Der Einstieg erfolgt mit einem überschaubaren, fachlich geeigneten Ausschnitt. Eine vollständige Abdeckung des Physikcurriculums ist keine Voraussetzung. Ein vereinbarter Partnerstatus wird damit nicht vorausgesetzt.

Die erste Umsetzung muss die allgemeine Trennung bereits praktisch einhalten: Die Zuordnungen liegen außerhalb des Curriculums, ihre Nutzung wird über die Personalisierung ausgewählt, und ein weiterer Anbieter könnte nach demselben Prinzip hinzukommen. Ein bloßes Zurückschreiben von Physik-Libre-Links in Lernziele erfüllt den Rahmen nicht.

> **Beispiel für die Nutzung:** Eine lernende Person arbeitet an einem Physik-Lernziel. Für ihre SkillPilot-ID ist die Physik-Libre-Anbindung aktiviert. Liegt eine passende Zuordnung vor, kann der Coach auf das betreffende Material verweisen. Fehlt eine Zuordnung oder ist das Material nicht verfügbar, bleiben Lernziel und Lernstand unverändert nutzbar. Der Verweis allein bedeutet nicht, dass der Coach den Inhalt bereits gelesen hat.

Am Beispiel werden die Verweise, ihre fachliche Passung und die Nutzung im Lernprozess erprobt. Daraus können Anforderungen an das spätere Format und die Pflege entstehen, gegebenenfalls im Austausch mit dem Anbieter. Ein Zahlungssystem, ein vollständiger Contentkatalog oder eine umfassende Übernahme von Volltexten gehören nicht zu den Voraussetzungen dieses Piloten.

## 7. Übergang und Überprüfung

Vorhandene didaktische Contentlinks werden bei der Umsetzung aus den kanonischen Curricula entfernt und, soweit fachlich geeignet, in die separate Contentebene überführt. Erhaltenswerte Zuordnungsarbeit soll dabei nicht verloren gehen. Quellenbelege curricularer Entscheidungen bleiben erhalten. Fachliche Aussagen, Voraussetzungen und bestehende Lernstände dürfen durch die Auslagerung nicht verändert werden.

Die Umsetzung wird an vier architektonischen Kriterien überprüft:

- **Unveränderter Kern:** Ein Paket lässt sich ergänzen, ersetzen oder entfernen, ohne Lernziele, Abhängigkeiten oder erreichte Lernstände zu ändern.

- **Persönliche Auswahl:** Bei unverändertem Curriculum können unterschiedliche SkillPilot-IDs unterschiedliche Materialien nutzen. Die Auswahl wird im jeweiligen Cockpit gespeichert, ohne zusätzliche Content-Zugangsprüfung; ein Wechsel des Profils darf dessen Einstellungen nicht vermischen.

- **Konkrete Funktion:** Der Physik-Pilot führt für den gewählten Ausschnitt nachvollziehbar zu fachlich passenden Materialien von Physik Libre.

- **Allgemeine Tragfähigkeit:** Ein zweiter Anbieter oder ein weiteres Fach lässt sich nach demselben Prinzip ergänzen, ohne Sonderlogik im kanonischen Curriculum.

[1] Physik Libre: https://physikbuch.schule/ — Website des vorgesehenen ersten Anwendungsfalls; abgerufen am 15. September 2026.
