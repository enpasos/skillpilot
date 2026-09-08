# Installation und Updates für persönliche Claude-Konten

Stand: 8. September 2026. Prüfauftrag des Product Owners: den funktionierenden
Datei-Upload wieder als Installationsweg anbieten und wiederkehrende Updates
für Beta-Nutzer vereinfachen. Betrachtet werden persönliche Claude-Pro-Konten
und die bestehenden, unveränderten SkillPilot-Pluginpakete. Team/Enterprise
und Änderungen am Zuschnitt des Plugins gehören nicht zu diesem Vorhaben.

## Sofort nutzbarer Weg

Die angepasste `/plugins`-Seite führt durch fünf Schritte: aktuelle Datei
herunterladen, Plugin-Verwaltung in Claude öffnen, alte SkillPilot-Installation
bei Bedarf ersetzen und Datei hochladen, enthaltenen Konnektor prüfen,
zu SkillPilot zurückkehren. Andere Plugins und Konnektoren bleiben erhalten.
Wer bereits die aktuelle Version verwendet, muss sie nicht erneut installieren.
Download und Upload bleiben eine Übergangslösung für Updates.
Die Änderung der Anleitung ist lokal umgesetzt; ein Deployment ist in diesem
Auftrag nicht erfolgt.

Der Download verwendet den bestehenden Veröffentlichungsindex und die
dazugehörige unveränderliche `.plugin`-Datei. Am Prüftag liefert der öffentliche Server
Version **1.1.1**, **53.140 Bytes** und SHA-256
`b4bfa8122812bf1ad0430e6b02932b89e29b107c7a831cebf994da010c359351`.
Der tatsächliche Download wurde gegen diesen Hash geprüft. Ein fehlgeschlagener
Indexabruf bietet keine veraltete Ersatzdatei an; Wiederholen lädt erneut.

Anthropics persönliche Pluginhilfe dokumentiert das Hochladen eigener Dateien.
Die Academy nennt auch das `.plugin`-Format ausdrücklich, allerdings in einem
Cowork-Tutorial. Daraus folgt keine bestätigte Updateautomatik für das
persönliche Webkonto. [Persönliche Plugins](https://support.claude.com/en/articles/13837440-use-plugins-in-claude),
[Plugin-Dateiformat](https://academy.claude.com/tutorials/how-to-customize-plugins-in-cowork).

## Konkreter Fehlerbericht: registriert, aber nicht verwaltbar

Der Product Owner hat am 8. September 2026 seinen
[Community-Beitrag zum unsichtbaren persönlichen Marketplace](https://www.claudeai.directory/community/claude-pro-personal-marketplace-already-added-but-invisible-in-ui-plugin-stuck-on-an-old-version)
mit folgendem Ablauf zur Untersuchung beigesteuert. Die Kontobeobachtungen
stammen aus dem mitgeteilten Beitrag; sie wurden hier nicht unabhängig im
Claude-Konto reproduziert. Der Beitrag ließ sich beim erneuten Abruf nicht
laden. Sein mitgelieferter Stand nennt keine Antworten; das ist kein Nachweis
des aktuellen Antwortstands oder einer Bestätigung durch Anthropic.

1. Im persönlichen **Claude-Pro-Webkonto** wurde der öffentliche Marketplace
   `https://github.com/enpasos/skillpilot-claude-marketplace` hinzugefügt und
   `skillpilot-coach-v1` zunächst in Version `1.0.4` installiert.
2. Nach Veröffentlichung von `1.1.1` auf `main` zeigte Claude weiterhin `1.0.4`.
3. Die Marketplace-Quelle erschien **zu keinem Zeitpunkt als verwaltbarer
   Eintrag**, auch nicht vor der späteren Deinstallation des Plugins.
4. Nach Deinstallation wurde erneutes Hinzufügen derselben Quelle mit
   „Dieser Marketplace wurde bereits hinzugefügt“ abgewiesen.
   „Synchronisieren“ bewirkte keine sichtbare Änderung.
5. Eine Neuinstallation über „Entdecken“ war möglich, zeigte danach aber
   erneut `1.0.4` statt `1.1.1`.

Damit sind drei getrennte Probleme gemeldet: Die Registrierung wird weiterhin
erkannt, ihre Verwaltung ist nicht erreichbar, und die Neuinstallation zeigt
eine veraltete Version. Der in der offiziellen Hilfe beschriebene Menüpunkt
zum Entfernen setzt einen sichtbaren Marketplace-Eintrag voraus und ist in
diesem Zustand nicht ausführbar.
[Offizielle Marketplace-Verwaltung](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

Veraltete Metadaten oder ein Cacheproblem sind mögliche Erklärungen, keine
festgestellte Ursache. Die Versionsanzeige allein beweist auch nicht, welche
Paketbytes Claude tatsächlich ausführt. Der Bericht belegt weder, dass die
Deinstallation die unsichtbare Quelle verursacht hat, noch einen
Repositoryfehler. Wiederholtes Hinzufügen, Synchronisieren und Neuinstallieren
über „Entdecken“ gelten für diesen Fall als bereits erfolglos versucht.

Der erneute öffentliche Repository-Abgleich bestätigt am Commit
`5cc7aba22ddf90ab8273cd6c15b71e8186781fc3` die Quelle
`./plugins/skillpilot-coach-v1` im
[Marketplace-Katalog](https://github.com/enpasos/skillpilot-claude-marketplace/blob/5cc7aba22ddf90ab8273cd6c15b71e8186781fc3/.claude-plugin/marketplace.json)
und Version `1.1.1` im
[Pluginmanifest](https://github.com/enpasos/skillpilot-claude-marketplace/blob/5cc7aba22ddf90ab8273cd6c15b71e8186781fc3/plugins/skillpilot-coach-v1/.claude-plugin/plugin.json).
Die offizielle Formatreferenz führt die Katalogversion als optional und zeigt
selbst ein Beispiel mit Version ausschließlich im Pluginmanifest sowie einem
relativen `./plugins/...`-Pfad. Diese beiden Merkmale sind damit kein belegter
Formatfehler. Die Referenz stammt aus der Claude-Code-Dokumentation; sie
belegt das Paketformat, keinen Reparaturweg für den persönlichen Webaccount.
[Optionale Katalogfelder](https://code.claude.com/docs/en/plugin-marketplaces#optional-plugin-fields),
[Manifest und Katalog im Beispiel](https://code.claude.com/docs/en/plugin-marketplaces#walkthrough-create-a-local-marketplace),
[Relative Pluginpfade](https://code.claude.com/docs/en/plugin-marketplaces#relative-paths).

Der Dateiweg muss deshalb funktionieren, **ohne die unsichtbare
Marketplace-Quelle zuerst entfernen zu müssen**. Das Entfernen einer alten installierten
SkillPilot-Plugininstanz ist davon getrennt. Ein erfolgreicher Datei-Upload
würde die Reparatur oder Entfernung der Marketplace-Registrierung nicht
beweisen. Für das Update wird die geprüfte Download-Datei verwendet; der alte
Eintrag unter „Entdecken“ ist kein Ersatz dafür.

## Was heute belegbar ist

| Frage | Ergebnis |
| --- | --- |
| Kann SkillPilot die verfügbare Version und Datei liefern? | Ja, über den bestehenden öffentlichen Index und den geprüften Download. |
| Kann die normale SkillPilot-Seite die in Claude installierte Version lesen? | Im aktuellen System nein. Es gibt kein Versionssignal aus dem installierten Paket; eine passende öffentliche API für persönliche Konten wurde in den geprüften offiziellen Unterlagen nicht gefunden. |
| Beweist ein Download oder eine verbundene OAuth-Verbindung die Installation? | Nein. Die Installation kann ausbleiben oder in einem anderen Claude-Konto erfolgen. |
| Ist Upload mit gleichem Namen ein verlustfreies persönliches Webupdate? | Noch zu prüfen. Die persönliche Anleitung bestätigt diesen Ersetzungsfall nicht ausdrücklich. |
| Gibt es einen belegten anderen Web-Verwaltungsweg, der das bestehende Marketplace-Problem umgeht? | Nicht gefunden. Ein anderer Git-Host oder eine andere Oberflächen-URL beweist keine funktionierende Aktualisierung. |
| Aktualisiert eine lokale Desktop-/CLI-Installation automatisch denselben Webeintrag? | Dafür liegt kein Nachweis vor. Selbst hinzugefügte Desktop-/Cowork-Plugins werden laut persönlicher Hilfe lokal gespeichert. |

Die gewöhnliche SkillPilot-Webseite kann wegen der Herkunftstrennung nicht
Claudes Pluginoberfläche oder Webspeicher auslesen. Sie benötigt dafür eine
Zusammenarbeit von Claude oder einen vom Nutzer installierten Browserhelfer.
[HTML-Herkunftsregeln](https://html.spec.whatwg.org/dev/browsers.html),
[Herkunftsgebundener Webspeicher](https://html.spec.whatwg.org/dev/webstorage.html).

## Priorität 1: den persönlichen Upload wirklich verkürzen

Der entscheidende nächste Praxistest ist ein Update **ohne vorheriges Löschen**:

1. Im angemeldeten persönlichen Pro-Webkonto die aktuelle installierte Version,
   genau einen SkillPilot-Eintrag und die bestehende Konnektorverbindung erfassen.
2. Beim nächsten echten freigegebenen Paketupdate eine neuere Datei mit demselben
   Pluginnamen über die vorhandene Uploadoberfläche einspielen. Kein künstlicher
   Versionswechsel und keine Änderung der eingefrorenen Paketbytes für den Test.
3. Prüfen, ob Claude ersetzt, eine Bestätigung verlangt oder einen zweiten
   Eintrag erzeugt. Danach Version, Aktivierung, erhaltene Verbindung und Start
   einer neuen SkillPilot-Lernsession prüfen.
4. Nach Schließen und erneutem Öffnen sowie beim nächsten echten Update
   wiederholen. Dokumentieren, ob ein Dateidownload, ein Upload und eine
   Versionskontrolle genügen oder erneut eine Verbindung nötig wird.

Zusätzlich muss der im Fehlerbericht beschriebene Bestandsaccount geprüft
werden: Upload trotz nicht verwaltbarer Marketplace-Registrierung, genau eine
aktive SkillPilot-Installation mit der erwarteten Version und funktionsfähiger
Verbindung, auch nach erneutem Öffnen. Festhalten, ob der alte Discover-Eintrag
weiterhin erscheint oder mit der Dateiinstallation kollidiert. Ein Test in
einem unbelasteten neuen Konto ersetzt diesen Übergangstest nicht. Verlangt
Claude dabei die Entfernung einer nicht sichtbaren Quelle, ist dieser
Übergang blockiert; die Anleitung darf kein nicht vorhandenes Menü voraussetzen.

Erst ein positiver Nachweis erlaubt, das bisherige Entfernen aus der Anleitung
zu streichen. Das Ziel für wiederkehrende Updates lautet: keine erneute
Einrichtung, keine Suche nach einer Marketplace-Quelle, keine doppelte
Installation und möglichst keine erneute Autorisierung.

Diese Claude-Kontoprüfung wurde in diesem Auftrag nicht durchgeführt: Es stand
kein authentifizierter persönlicher Claude-Browser zur Verfügung. Die lokalen
Browserprüfungen verifizieren unsere Anleitung und Dateiauslieferung, nicht
Claudes Verhalten beim Ersetzen eines installierten Plugins.

## Priorität 2: ein einmal eingerichteter Browserhelfer

Wenn der native Uploadweg zuverlässig ersetzt, ist ein eng begrenzter
Browserhelfer ein konkreter Prototypkandidat. Der Nutzer richtet ihn einmal ein
und löst später „SkillPilot aktualisieren“ aus. Der Helfer lädt ausschließlich
das geprüfte SkillPilot-Paket, bedient im angemeldeten Claude-Tab die sichtbare
Pluginverwaltung und überprüft anschließend die angezeigte Version.

Chrome dokumentiert zeitweiligen Tabzugriff nach einer Nutzeraktion sowie
Netzwerkabrufe einer Erweiterung mit passenden Hostberechtigungen. Das belegt
die technische Grundlage; ein funktionierender Claude-Uploadhelfer ist damit
noch nicht nachgewiesen. [Tabzugriff](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab),
[Dateiabrufe mit Hostberechtigung](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests).

Der Prototyp müsste insbesondere Dateiauswahl/-übergabe, Authentifizierungsdialoge,
Abbruch, doppelte Einträge und veränderte Claude-Oberflächen testen. Er benutzt
keine undokumentierten privaten Updateendpunkte und speichert keine
Claude-Anmeldedaten. Bei unbekannter Oberfläche stoppt er mit konkretem Hinweis,
statt andere Plugins zu bearbeiten. Eine erfolgreiche Downloadmeldung darf
auch hier nicht als erfolgreiche Installation erscheinen.

Ein solcher Helfer braucht selbst einen verlässlichen Verteilungs- und
Updateweg, beispielsweise über einen Browser-Erweiterungskatalog. Unterstützte
Browser und Geräte müssen klar begrenzt werden; eine Desktop-Erweiterung ist
keine zugesicherte Lösung für mobile Browser. Der Versuch wird nur weitergeführt,
wenn der Aufwand für Nutzer nachweislich kleiner ist als beim manuellen Upload.

Der gemeldete Marketplace-Zustand begrenzt diesen Vorschlag zusätzlich:
Ein Helfer kann keinen fehlenden Verwaltungseintrag anklicken und keinen
unbekannten Registrierungs- oder Synchronisierungsfehler bei Claude beheben.
Sein möglicher Nutzen beschränkt sich auf einen zuvor nachgewiesenen,
funktionierenden Datei-Uploadablauf. Er darf die bereits gescheiterten
Marketplace-Schritte nicht nur automatisch wiederholen.

## Persönlichen Marketplace weiter prüfen, aber nicht wieder versprechen

Die öffentliche Quelle und ihr Export werden weiterhin auf exakten Inhalt,
Version und Integrität geprüft. Diese Prüfungen beweisen weder eine
Aktualisierung im Claude-Konto noch eine funktionierende automatische
Synchronisierung. Die bisherige Empfehlung auf `/plugins` ist deshalb
zurückgenommen; der bereits veröffentlichte Repositorystand bleibt erhalten.

Eine erneute Empfehlung benötigt denselben realen Nachweis für Erstinstallation
und zwei aufeinanderfolgende Updates: neue Version tatsächlich im persönlichen
Webkonto angekommen, keine erneute Quellenanlage, keine Duplikate und erhaltene
Konnektorverbindung. Der bekannte Hinweis „Dieser Marketplace wurde bereits
hinzugefügt“ erfüllt diesen Nachweis nicht. Unterschiede zwischen
Repositoryabruf, Marketplace-Synchronisierung und installierter Pluginversion
müssen getrennt dokumentiert werden. Ohne einen reproduzierbaren persönlichen
Webweg bleibt der Datei-Upload die Anleitung.

Für den gemeldeten Fehler reicht auch eine erfolgreiche Neuinstallation in
einem frischen Konto nicht aus. Im betroffenen Bestandsaccount müssen die
registrierte Quelle wieder auffindbar und ihre dokumentierten Verwaltungs-
und Entfernungsaktionen erreichbar sein. Eine unterstützte Aktualisierung
muss anschließend die erwartete Pluginversion liefern. Quellenregistrierung,
sichtbare Verwaltung, Synchronisierung und installierte Version werden als
getrennte Prüfpunkte erfasst; „bereits hinzugefügt“ bestätigt nur die
entsprechende Meldung, keinen erfolgreichen Repositoryabruf.

Eine Community-Antwort kann einen Versuch begründen, aber noch keinen
funktionierenden Updateweg bestätigen. Für eine Anfrage an Anthropic gehören
der obige Ablauf, Zeitpunkt, Pro/Web-Oberfläche, öffentliche
Repository-Revision, erwartete und angezeigte Version sowie bereinigte Aufnahmen des
fehlenden Quelleintrags zusammen. Die offenen Fragen bleiben: Wo ist die
Registrierung verwaltbar, wie lässt sie sich unterstützt zurücksetzen, und
wie wird ein erneuter Abruf des aktuellen Repositorystands ausgelöst?
Eine entsprechende Supportanfrage wurde in diesem Auftrag nicht versendet.

## Versionshinweise ohne Änderung am bestehenden Plugin

Eine kleine Webfunktion könnte die **vom Nutzer ausdrücklich bestätigte**
Version mit Datum lokal merken. Beispiel:

> Von dir am 8. September bestätigt: 1.1.1. Neu verfügbar: 1.1.2.

Die Bestätigung erfolgt erst nach Sichtkontrolle der installierten Version in
Claude. Downloadklick, Tab-Rückkehr, OAuth-Verbindung und SkillPilot-Sessionstart
setzen diesen Wert nicht. Ohne Bestätigung lautet der Zustand „Version noch
nicht bestätigt“. Ein Kontowechsel oder eine spätere Deinstallation bleiben
unbeobachtet; die Formulierung darf deshalb keinen aktuellen automatischen
Installationsnachweis behaupten. Auf anderen Geräten oder nach Löschen der
Websitedaten ist der Zustand wieder unbekannt. Zurücksetzen bleibt möglich.

Diese Erinnerung wäre eine Ergänzung, keine automatische Aktualisierung und
keine Voraussetzung für den Lernstart. Sie ist hier noch nicht implementiert.
Der heutige Veröffentlichungsparser akzeptiert absichtlich nur die im Webbuild
gebundene Paketversion. Ein späterer Versionshinweis muss deshalb auch mit
einem älteren noch geöffneten Webbuild funktionieren, ohne dessen strikte
Download-/Integritätsprüfung stillschweigend zu lockern.

## Abschlusskriterium

Eine akzeptable Lösung ist erst erreicht, wenn ein Beta-Nutzer nach der
Ersteinrichtung mindestens zwei reale Pluginupdates mit einem kurzen,
reproduzierbaren Ablauf durchführen kann. Gemessen werden nötige Handlungen,
Verbindungserhalt, eindeutige Erfolgskontrolle und Erholung nach einem Fehler.
Ein neuer Downloadknopf oder eine Versionswarnung allein lösen dieses Problem
nicht. Paketinhalt und Paketgrenzen bleiben bei allen beschriebenen
Verteilungsversuchen unverändert.
