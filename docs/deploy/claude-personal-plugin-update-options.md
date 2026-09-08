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
