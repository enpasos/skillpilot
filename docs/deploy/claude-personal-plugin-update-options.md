# Installation und Updates für persönliche Claude-Konten

Aktueller lokaler Kandidat, **12. September 2026**: **1.1.4** ist die autorisierte
Datenschutzkorrektur; Produktion und Marketplace dürfen nach grüner CI
ausgerollt werden. Die letzte verifiziert veröffentlichte Version ist 1.1.3.
Die neuen Marketplace-, Guide- und
Client-Abnahmen stehen aus. Deshalb zeigt die lokale Webanleitung vorerst
den Datei-Installationsweg; die Marketplace-Anleitung ist dort deaktiviert.
Der lokale Veröffentlichungsindex nennt 1.1.4. Das aktualisiert weder den
externen Marketplace noch die bereits bereitgestellte Webanleitung.
Die Korrektur benötigt den aktualisierten Backend-Vertrag und einen frisch
geladenen Tool-Katalog: Rückmeldungstexte bleiben im Chat; alte Freitextparameter
werden absichtlich nicht mehr akzeptiert.
Details und Artefaktnachweise stehen im
[Marketplace-Runbook](claude-personal-marketplace-release.md).

## Erhaltene Anleitung und Beobachtungen für 1.1.2

Die folgenden Angaben dokumentieren die frühere 1.1.2-Freigabe. Sie übertragen
keine Zustimmung oder Client-Abnahme auf den neuen Kandidaten.

Stand: **9. September 2026**. Der Product Owner hat nach Sichtung der neuen
Kontobeobachtungen ausdrücklich eine überarbeitete `/plugins`-Anleitung
freigegeben: **Marketplace als erster Weg, Datei herunterladen und hochladen
als Alternative**. Diese Empfehlung für die kontrollierte Claude-Beta ist
weder eine abgeschlossene Client-Abnahme noch eine Zusage automatischer Updates.
Neue Releases, externe Veröffentlichungen, Deployments sowie Änderungen an
Claude-Konten oder GitHub-Rechten gehören nicht zu diesem Änderungssatz.

Die neue Freigabe erweitert den dokumentationsbezogenen Auftrag der Übergabe
`skillpilot-claude-marketplace-doku-2026-09-09-r2` gezielt um die Webanleitung.
Die sechs Dateien des veröffentlichten Plugins bleiben unverändert. Der damals
veröffentlichte Repository-Stand ist **1.1.2**, `published_pending_acceptance`; Veröffentlichung
und separate Guide-Entscheidung stehen im
[Marketplace-Runbook](claude-personal-marketplace-release.md).

## Neu installieren

1. [Plugin-Verwaltung in Claude öffnen](https://claude.ai/new#customize/plugins/discover).
   Der beobachtete Link führt zu **Plugins → Entdecken**, nicht direkt zu einem
   Update. Falls er nicht funktioniert, den Plugin-Bereich in Claude selbst öffnen.
2. **Hinzufügen oben rechts → Marketplace hinzufügen → Aus einem Repository
   hinzufügen** wählen und folgende Quelle eingeben. Gemeint ist das Dropdown
   oben rechts, nicht der Hinzufügen-Knopf einer beworbenen Plugin-Karte.

   ```text
   https://github.com/enpasos/skillpilot-claude-marketplace
   ```

3. Die Quelle mit **Synchronisieren** hinzufügen. Bei **„Dieser Marketplace
   wurde bereits hinzugefügt“** nicht wiederholt dieselbe Quelle anlegen,
   sondern den unten beschriebenen Verwaltungsweg verwenden.
4. Unter **Entdecken** **SkillPilot Coach v1** aus der Quelle
   `skillpilot-claude-marketplace` öffnen, angebotene Version mit SkillPilot
   vergleichen und **Hinzufügen** wählen. Eine vorhandene alte Dateiinstallation
   nur gezielt ersetzen; genau eine aktive SkillPilot-Installation behalten.
   Andere Plugins und Konnektoren bleiben unangetastet.
5. Die installierte Version und den im Plugin enthaltenen **SkillPilot-Konnektor**
   prüfen, bei Bedarf verbinden und zu SkillPilot zurückkehren. Jede neue
   Lernsession dort über den bestehenden Übergabeweg starten. Keine zweite
   manuelle MCP-Verbindung und keine selbst eingetragene MCP-URL anlegen.

Verlangt Claude GitHub-Rechte für automatische Synchronisierung, ist das nicht
die SkillPilot-Konnektorverbindung. Für Lernende keine GitHub-Administration
einrichten; manuelle Aktualisierung oder den Dateiweg verwenden.

## Bereits installiert: aktualisieren

Wer bereits die auf SkillPilot angezeigte aktuelle Version installiert hat,
muss nicht erneut installieren. Andernfalls:

1. Den Plugin-Bereich in Claude öffnen.
2. **Hinzufügen oben rechts → Marketplaces verwalten → ⋮ am Eintrag
   `skillpilot-claude-marketplace` → Nach Updates suchen** wählen.
3. Den synchronisierten Stand und die angebotene Version unter **Inhalte**
   prüfen; zusätzlich die Version der **installierten** SkillPilot-Instanz
   kontrollieren. Ein aktualisierter Katalog allein beweist kein Installationsupdate.
4. Bleibt die installierte Version älter oder ist der Weg nicht verfügbar,
   den Dateiweg verwenden. Danach den enthaltenen Konnektor prüfen und eine
   neue Lernsession von SkillPilot aus starten.

Der Direktlink, „bereits hinzugefügt“, ein neuer Sync-Zeitpunkt oder die Auswahl
einer älteren Version unter **Inhalte** sind keine Installationsnachweise. Die
Versionshistorie zeigt synchronisierte Inhalte; ein unterstütztes Rollback,
Pinning oder parallele aktive Versionen sind damit nicht nachgewiesen. Ebenso
ist nicht belegt, dass laufende Chats sofort neue Anweisungen übernehmen.

## Alternative: Plugin-Datei herunterladen und hochladen

Der Dateiweg bleibt für Erstinstallation und Updates verfügbar, auch wenn der
Marketplace nicht erreichbar ist oder eine alte Version anbietet:

1. Zuerst die aktuelle `.plugin`-Datei von SkillPilot herunterladen. Ein
   Download allein installiert nichts.
2. Falls eine ältere Version ersetzt werden muss, nach dem Download nur die alte
   **SkillPilot-Plugininstanz** unter **Deine Plugins → ⋮ → Entfernen** entfernen.
   Andere Plugins und Konnektoren bleiben unverändert. Bei einer Neuinstallation
   entfällt dieser Schritt; eine bereits aktuelle Installation braucht weder
   Entfernung noch erneuten Upload.
3. Erst danach **Hinzufügen oben rechts → Plugin hochladen** verwenden und die
   heruntergeladene Datei unverändert hochladen. Genau eine aktive
   SkillPilot-Installation behalten.
4. Installierte Version, Aktivierung und enthaltenen SkillPilot-Konnektor
   kontrollieren; bei Bedarf erneut verbinden. Danach zu SkillPilot zurückkehren
   und dort eine neue Lernsession starten.

Die Anleitung verspricht nicht, dass ein Upload mit identischem Namen ohne
Rückfrage ersetzt oder jede Verbindung erhält. Dieser persönliche Webablauf
bleibt ein offener Praxistest. Der Dateiweg setzt **nicht** voraus, dass die
Marketplace-Quelle zuvor entfernt wird.

**Achtung beim Entfernen einer Quelle:** Claude warnt, dass dabei auch deren
Plugins deinstalliert werden. Marketplace-Entfernen ist deshalb kein normaler
Updateschritt. Es widerruft auch nicht nachgewiesenermaßen eine separat erteilte
GitHub-App-Installation oder persönliche GitHub-Autorisierung.

## Eine gemeinsame Versionsquelle

Die Webanleitung bezieht verfügbare Version, Downloadpfad, Dateigröße und SHA-256
aus dem bestehenden Veröffentlichungsindex. Auch Badge, Vergleichstext und
Schritte verwenden dessen Version; es gibt keine fest eingebrannte „aktuelle“
Versionsnummer. Neuere kompatible V1-Versionen werden akzeptiert, ohne die
Prüfung von Identität, Version, Dateiname, Hashpfad und Größe aufzuweichen.
Bei Ladefehlern erscheint keine angenommene Versionsnummer und keine veraltete
Ersatzdatei; Wiederholen lädt den Index erneut.
Die separat freigegebene Marketplace-Navigation bleibt dabei verfügbar;
Datei-Download und Versionsvergleich brauchen einen gültigen Index. Solange die
aktuelle Versionsangabe fehlt, keine bestehende Installation entfernen.

Der öffentliche Index beschreibt die **verfügbare**, nicht die im Claude-Konto
installierte Version. Downloadklick, Tab-Rückkehr, OAuth und Sessionstart werden
nicht als Installationsbestätigung gespeichert. Eine lokale Erinnerung an eine
manuell bestätigte Version und ein Browserhelfer waren frühere Ideen; sie sind
nicht Bestandteil dieser Umsetzung.

## Neue Kontobeobachtungen und Nachweisgrenzen

Die interne Übergabe vom 9. September 2026 trägt den Titel **SkillPilot × Claude:
persönliche Marketplaces, Updates und GitHub-Rechte**, Revision **r2**. Ihre
README hat SHA-256
`9bd52977e8224ff0758d78d02ba6b653575173e276be49e39b2fc5c046c59c13`.
Sie bleibt ein internes Belegpaket, keine Abhängigkeit der öffentlichen Doku.

- **E7** (`07-direktlink-plugins-entdecken.png`) zeigt **Plugins → Entdecken**.
  Die Zuordnung zur vollständigen URL stammt aus dem ausdrücklichen
  Nutzerbericht; die Aufnahme enthält keine Adressleiste.
- **E8** (`08-hinzufuegen-marketplaces-verwalten.png`) zeigt im oberen
  Hinzufügen-Menü **Marketplaces verwalten** und **Plugin hochladen**.
- **E9** (`09-marketplace-verwaltung-aktionsmenue.png`) zeigt am Marketplace
  **Nach Updates suchen**, **Automatisch synchronisieren** und **Entfernen**
  samt Warnung vor der Deinstallation seiner Plugins. Ein verdeckter
  Commitwert wird nicht rekonstruiert.
- **E3** zeigt historische Katalogstände `1.0.4` und `1.1.1`. Dies ist keine
  Abnahme der später veröffentlichten `1.1.2` und kein Laufzeitnachweis.
- **E6** zeigt eine GitHub-Zugriffsanforderung, keine bestätigte Autorisierung.

Die Beobachtungen betreffen ein persönliches Claude-Pro-Webkonto mit deutscher
Oberfläche. Der Betatester nutzt ein iPhone, Entwicklertests laufen weiterhin
auf Android; daraus und aus schmalen Browseransichten folgt keine zusätzliche
native Gerätefreigabe. Der Deep-Link ist ein beobachteter Webeinstieg, kein
zugesicherter geräteübergreifender Routingvertrag. Die englischen Menüangaben
in der Webanleitung sind Übersetzungen, keine separate englische Kontoprüfung.

## Automatische Synchronisierung und GitHub-Rechte

Der Auto-Sync-Schalter allein beweist keine erfolgreiche Einrichtung: Claude
verlangt gesondert Repository-Zugriff seiner GitHub-App. Der gezeigte Dialog
fordert neben Leserechten auch **Schreibrechte auf Code, Workflows, Actions,
Checks, Discussions, Issues, Pull Requests und Repository-Hooks**.
**Only select repositories** begrenzt die betroffenen Repositorys, nicht den
Berechtigungsumfang innerhalb dieser Repositorys. Keine pauschale Freigabe
aller Repositorys empfehlen.

Eine bewusst genehmigte Herausgeber-Einrichtung allenfalls auf das erforderliche
Veröffentlichungsrepository begrenzen. Keine Repository-Administratorrechte
an Lernende vergeben. Herausgeber-App-Installation, persönliche
GitHub-Autorisierung und SkillPilot-MCP-/OAuth-Verbindung sind getrennt.

Für persönliche Pro-Marketplaces bleiben genaue Auslöser, Timing und Übernahme
durch unabhängige Nutzerkonten offen. Die Übergabe zitiert für
**Organisationsmarketplaces** Webhooks und PR-Merges mit Versionserhöhung;
diese Regeln sind kein bestätigter Vertrag für persönliche Konten. Deshalb
weder „jeder Push aktualisiert alle Nutzer“ noch „direkte Pushes funktionieren
hier nie“ behaupten. Auto-Sync ist keine Voraussetzung der Lernenden-Anleitung.

## Historischer Fehlerbericht vom 8. September 2026

Der Product Owner berichtete im
[Community-Beitrag](https://www.claudeai.directory/community/claude-pro-personal-marketplace-already-added-but-invisible-in-ui-plugin-stuck-on-an-old-version):

1. Das öffentliche Repository wurde hinzugefügt und zunächst `1.0.4` installiert.
2. Nach Veröffentlichung von `1.1.1` zeigte Claude weiterhin `1.0.4`.
3. Ein Verwaltungsweg wurde damals nicht gefunden, auch nicht vor der
   Deinstallation. Das ist kein Nachweis, dass es ihn tatsächlich nicht gab.
4. Erneutes Hinzufügen wurde mit „Dieser Marketplace wurde bereits hinzugefügt“
   abgewiesen; Synchronisieren brachte keine sichtbare Änderung.
5. Erneute Installation über Entdecken zeigte laut Nutzer wieder `1.0.4`.

Der Beitrag ließ sich bei der damaligen Untersuchung nicht erneut laden;
der mitgeteilte Stand ist Nutzerbericht, kein bestätigter aktueller Antwortstand
und keine Anerkennung eines Fehlers durch Anthropic. Veraltete Metadaten oder
ein Cache waren Hypothesen, keine festgestellte Ursache.

Der damalige Repository-Abgleich bestätigte am Commit
`5cc7aba22ddf90ab8273cd6c15b71e8186781fc3` den relativen Pfad
`./plugins/skillpilot-coach-v1` und Version `1.1.1` im Pluginmanifest.
Die nur dort geführte Version war kein belegter Formatfehler. Die damalige
öffentliche Datei hatte 53.140 Bytes und SHA-256
`b4bfa8122812bf1ad0430e6b02932b89e29b107c7a831cebf994da010c359351`.
Diese Angaben sind historische Prüfnachweise, keine aktuellen Downloadwerte.

Am 9. September berichtete der Nutzer den erfolgreichen historischen Abruf
von `1.1.1` nach Eingabe von
`https://github.com/enpasos/skillpilot-claude-marketplace?v=2`.
Unbekannt ist, ob dabei ein Cache umgangen oder eine weitere Registrierung
angelegt wurde. Der Erfolg darf nicht allein dem damaligen Katalogtest-Namen
zugeschrieben werden. Der Query-Workaround bleibt historische Fehleranalyse;
die normale URL enthält keinen Query-Parameter.

Inzwischen ist die Verwaltung durch E7–E9 gefunden. Die frühere Aussage eines
fehlenden Verwaltungswegs ist damit überholt. Ob Claude etwas neu ausgerollt
hat oder das Menü zuvor übersehen wurde, ist nicht bekannt.

## Noch erforderliche Praxistests

Die neue Empfehlung ist eine bewusste Guide-Entscheidung des Product Owners,
keine nachträgliche Änderung der Testresultate. Weiter offen bleiben:

1. Der reguläre manuelle Updateweg im betroffenen Bestandskonto, ohne neue
   Quellen-URL: Katalogstand, installierte Version, Konnektor und neue Lernsession
   getrennt vor und nach der Aktion prüfen.
2. Erstinstallation und mindestens zwei aufeinanderfolgende echte Updates in
   einem unabhängigen persönlichen Konto, möglichst ohne GitHub-Verbindung:
   notwendige Handlungen, Duplikate und Verbindungserhalt dokumentieren.
3. Datei-Update mit identischem Namen: ersetzt Claude, verlangt es Bestätigung
   oder entsteht ein zweiter Eintrag? Erst ein Nachweis erlaubt ein Versprechen
   über verlustfreies Ersetzen ohne vorherige Entfernung.
4. Auto-Sync nur nach separat genehmigter GitHub-Einrichtung testen; Ereignis,
   Branch, Version, Zeitpunkt und betroffene Konten erfassen. Keine künstlichen
   Releases oder Änderungen an unveränderlichen Paketbytes für den Test.

Lokale UI-Prüfungen bestätigen unsere Anleitung, nicht Claudes Konto- oder
Laufzeitverhalten. Kein neuer Supportbeitrag oder Kontoeingriff ist Bestandteil
dieser Umsetzung. Paketgrenzen und die offenen Release-Abnahmekriterien bleiben
unverändert.

## Weiterführende Quellen

- [Anthropic: Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Anthropic: Manage plugins for your organization](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
- [GitHub: Installing a GitHub App](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party)
- [GitHub: Authorizing GitHub Apps](https://docs.github.com/en/apps/using-github-apps/authorizing-github-apps)
- [GitHub: Reviewing installed GitHub Apps](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps)
