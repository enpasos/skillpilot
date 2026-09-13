import type { LabelLanguage } from './filterLabels'
import { CURRENT_TERMS_VERSION } from './legalTermsVersion'

export interface LegalViewCopy {
  backToApp: string
  title: string
  markdown: string
}

const LEGAL_TEXT_DE = `
**Stand: 13. September 2026 · Version ${CURRENT_TERMS_VERSION}**

Diese Nutzungsbedingungen regeln die Nutzung des von der enpasos - Enterprise Patterns & Solutions GmbH bereitgestellten SkillPilot-Dienstes. Die anschließenden rechtlichen Hinweise sind Bestandteil dieser Seite.

## 1. Anbieter und Geltungsbereich

Anbieter ist die **enpasos - Enterprise Patterns & Solutions GmbH**, Heuhohlweg 42, 61462 Königstein, Deutschland. Vertretungsberechtigung, Registerangaben und Umsatzsteuer-ID stehen im [Impressum](/imprint). Kontakt für Support und rechtliche Anliegen: [support@skillpilot.com](mailto:support@skillpilot.com).

Diese Bedingungen gelten für den gehosteten SkillPilot-Dienst auf skillpilot.com, insbesondere für Lernenden-, Trainer- und Explorer-Funktionen, die Verwaltung pseudonymer Lernstände sowie SkillPilot Coach v1 und andere optionale Verbindungen zu KI-Lerncoaches über die von SkillPilot betriebenen Schnittstellen. Für Quellcode, der unter der Apache License 2.0 veröffentlicht ist, gilt stattdessen diese Open-Source-Lizenz; die Regeln für den gehosteten Dienst beschränken die dort gewährten Rechte nicht.

## 2. Vertragsschluss und unentgeltliche Nutzung

Das bloße Aufrufen öffentlich zugänglicher Informationsseiten begründet noch keinen Nutzungsvertrag. Für nichtöffentliche Funktionen des gehosteten Dienstes kommt der Vertrag zustande, wenn Sie im First-Party-Startprozess diese Nutzungsbedingungen ausdrücklich durch die Checkbox akzeptieren und anschließend mit der gewählten Rolle fortfahren.

Die derzeit angebotene Standardnutzung von SkillPilot ist unentgeltlich. Es entsteht weder eine automatische Zahlungsverpflichtung noch ein kostenpflichtiges Abonnement. Falls künftig kostenpflichtige Leistungen angeboten werden, setzt deren Nutzung ein gesondertes, klar bezeichnetes Angebot und Ihre ausdrückliche Bestellung voraus.

Ein Konto, Abonnement oder Workspace bei einem ausgewählten KI-Anbieter ist nicht Bestandteil des SkillPilot-Vertrags und unterliegt den Bedingungen dieses Anbieters.

Der laufende Lern-Betatest findet mit Claude statt. Eine reguläre SkillPilot-Verbindung für ChatGPT ist derzeit nicht verfügbar; sie ist erst nach Stabilisierung des Claude-Betriebs, eigener ChatGPT-Integrationsabnahme und dem offiziellen Einreichungs- und Freigabeverfahren vorgesehen. Ein bestimmter Veröffentlichungstermin wird nicht zugesagt.

## 3. Nutzungsberechtigung und Minderjährige

Sie dürfen SkillPilot selbstständig nutzen, wenn Sie die hierfür erforderliche Geschäftsfähigkeit besitzen. Minderjährige benötigen vor der Annahme dieser Bedingungen die Einwilligung ihrer gesetzlichen Vertretung, soweit der Vertrag für sie nicht lediglich rechtlich vorteilhaft ist oder das anwendbare Recht dies sonst verlangt. Wer für eine Schule, Organisation oder eine andere Person handelt, muss dazu befugt sein.

Für die Claude-Beta über ein persönliches Claude-Konto gelten zusätzlich die [Nutzungsbedingungen von Anthropic](https://www.anthropic.com/legal/consumer-terms). Diese setzen mindestens 18 Jahre oder eine höhere örtlich geltende Altersgrenze voraus. Die Zustimmung eines Elternteils hebt diese Anbietergrenze nicht auf; ein Claude-Konto darf auch nicht anderen Personen zur Nutzung überlassen werden. Wer diese Voraussetzungen nicht erfüllt, kann das SkillPilot-Cockpit ohne die Claude-Verbindung nach den vorstehenden Regeln nutzen. Für organisatorische oder künftig angebotene andere KI-Verbindungen gelten die Bedingungen des jeweiligen Anbieters; sie sind keine automatische Ausnahme von dessen Altersregeln.

## 4. Leistungsumfang und Zugangsschlüssel

SkillPilot bildet Lernziele in einem Skill-Graphen ab, speichert pseudonyme Lernstände und unterstützt die Planung, Übung, Reflexion und Bewertung von Lernprozessen. Einzelne Funktionen können eine Verbindung zu einem ausdrücklich ausgewählten KI-Anbieter verwenden. SkillPilot betreibt dabei kein eigenes Dialogmodell.

Die zufällig erzeugte dauerhafte SkillPilot-ID ist der alleinige Zugriffsschlüssel zum pseudonymen Lernstand. Bewahren Sie diese ID, verschlüsselte ID-Dateien, temporäre Lernsession-Werte und sonstige Zugangsdaten sicher auf und geben Sie sie nicht an Unbefugte weiter. Ohne die dauerhafte ID kann der Betreiber den Lernstand grundsätzlich weder einer Person zuordnen noch wiederherstellen. Kurzlebige Lernsessions und OAuth-Verbindungen ersetzen die dauerhafte ID nicht.

SkillPilot ist weder eine amtliche Bildungsplattform noch eine Prüfungsstelle. Ein angezeigter Lernstand, eine KI-Bewertung oder ein abgeschlossenes Lernziel stellt keinen anerkannten Abschluss, kein Zeugnis und keine verbindliche Zertifizierung dar.

## 5. Zulässige Nutzung

Sie dürfen den gehosteten Dienst nur rechtmäßig und entsprechend seinem Lernzweck nutzen. Insbesondere dürfen Sie nicht:

* fremde SkillPilot-IDs, Lernsessions oder sonstige Zugangsdaten ohne Erlaubnis verwenden;
* Authentifizierung, Sicherheitsmaßnahmen, Zugriffsbeschränkungen oder Rate-Limits umgehen oder dies versuchen;
* den Dienst durch Schadsoftware, automatisierte Überlastung oder sonstige störende Eingriffe beeinträchtigen;
* rechtswidrige Inhalte übertragen oder Rechte, Vertraulichkeit und personenbezogene Daten Dritter ohne Befugnis verletzen;
* Lernnachweise, Bewertungen oder die Herkunft von Inhalten vorsätzlich täuschend manipulieren; oder
* den Dienst nutzen, um in einer Prüfung unerlaubte Hilfe zu erhalten oder andere zu einem Rechtsverstoß anzuleiten.

Zulässige Nutzung des veröffentlichten Quellcodes nach der Apache License 2.0 bleibt hiervon unberührt.

## 6. Eingaben und Nutzungsrechte

Sie behalten Ihre Rechte an eigenen Eingaben. Soweit Sie Inhalte unmittelbar an SkillPilot übermitteln, etwa freiwilliges Feedback im Cockpit, räumen Sie dem Betreiber nur das einfache, räumlich erforderliche und grundsätzlich auf die Vertragsdauer begrenzte Recht ein, diese Inhalte zu speichern, technisch zu verarbeiten und anzuzeigen, soweit dies für die jeweilige Funktion und in der [Datenschutzerklärung](/privacy) beschrieben ist. Für eine von Ihnen gewählte KI-Verbindung darf SkillPilot den erforderlichen Lernkontext und die Toolergebnisse an den ausgewählten KI-Anbieter übermitteln. Diese Klausel gibt SkillPilot kein Recht, Ihren dortigen Chat, Fotos oder Sprachaufnahmen abzurufen. Soweit Daten nach Vertragsende aufgrund gesetzlicher Pflichten oder einer sonstigen gesetzlichen Grundlage noch zulässig gespeichert werden, gilt dieses Nutzungsrecht nur für den entsprechenden Zweck und Zeitraum fort.

Sie dürfen nur Inhalte und Daten verwenden, für die Sie die erforderlichen Rechte und Einwilligungen besitzen. Diese Klausel überträgt kein Eigentum und begründet kein Recht des Betreibers, Ihre Eingaben zum Training eines Dialogmodells zu verwenden.

## 7. KI-Funktionen und Dienste Dritter

Wenn Sie den KI-Lerncoach nutzen, läuft der Dialog beim erkennbar ausgewählten Anbieter. Dieser verarbeitet Ihre Chateingaben, hochgeladenen Fotos und Dateien sowie bei Voice-Mode-Nutzung die Spracheingaben; hinzu kommen der für das Coaching erforderliche SkillPilot-Lernkontext und Toolergebnisse. Die Claude-Beta umfasst den Chat, die Claude-App, Foto-Uploads beziehungsweise Kameraaufnahmen in der App und Voice Mode. Die konkrete Bereitstellung dieser Anbieterfunktionen hängt unter anderem von Konto, Gerät und App-Version ab. Bei der Sprachausgabe kann es zu vorübergehenden Pausen kommen. Für den Drittanbieterdienst gelten dessen eigene Bedingungen, Datenschutzregeln, Verfügbarkeit und gegebenenfalls Kosten.

**Keine Chattexte an den SkillPilot Core:** Der Coach beurteilt die Arbeit und formuliert Erklärungen, Rückmeldungen und Erfolgsantworten selbst im Anbieterchat. Die SkillPilot-Schnittstelle verarbeitet dafür ausschließlich die vorgesehenen strukturierten Tooldaten, etwa Lernziel- und Session-Verweise, Abschlussmeldungen, einzelne Richtig/Falsch-Ergebnisse oder zulässige numerische Prüfungsergebnisse. Freie Antworten, Lösungswege, Chat-Auszüge, Zusammenfassungen und ausformulierte Bewertungs- oder Erfolgsbegründungen dürfen nicht über diesen Weg an SkillPilot übertragen werden. Fotos, Audio und Chatprotokolle gehören ebenfalls nicht zum SkillPilot-Lernstand. Eine textliche Zusage des Coaches allein bestätigt keine Speicherung: Maßgeblich sind der erfolgreiche Toolabschluss und der im Cockpit angezeigte Lernstand.

Davon getrennt können Sie im Cockpit freiwillig Feedback zum dort angezeigten aktuellen Lernziel abgeben, auch wenn sich der Coach Ihrer Ansicht nach falsch verhält. Dabei übermitteln Sie Ihren selbst eingegebenen Feedbacktext bewusst an SkillPilot. Beschreiben Sie das Problem in eigenen Worten und ohne vollständige Lernchats, Zugangsschlüssel oder unnötige persönliche Angaben. Dieses Feedback ist kein automatischer Export aus dem Anbieterchat. Die Verarbeitung dieses Feedbacks und von Supportanfragen ist in der [Datenschutzerklärung](/privacy) gesondert beschrieben.

KI-Ausgaben und KI-gestützte Bewertungen können falsch, unvollständig, verzerrt oder unpassend sein. Prüfen Sie wichtige Inhalte selbst oder mit einer qualifizierten Lehrperson. Verwenden Sie solche Ausgaben nicht als alleinige Grundlage für Zeugnisse, Prüfungsentscheidungen, Zulassungen, Zertifikate, Personalentscheidungen oder andere Entscheidungen mit wesentlichen rechtlichen oder persönlichen Folgen.

## 8. Verfügbarkeit und Änderungen des Dienstes

Für den unentgeltlichen Dienst wird kein bestimmtes Service-Level und keine ununterbrochene Verfügbarkeit zugesagt. Wartung, Sicherheitsmaßnahmen, Störungen bei Infrastruktur oder Drittanbietern und Ereignisse außerhalb des Einflussbereichs des Betreibers können die Nutzung vorübergehend einschränken.

Der Betreiber darf den Dienst aus triftigen Gründen weiterentwickeln oder ändern, insbesondere zur Fehlerbehebung, Sicherheit, Einhaltung rechtlicher Anforderungen, technischen Kompatibilität mit Browsern oder Provider-Schnittstellen, Abwehr von Missbrauch sowie nachvollziehbaren technischen oder didaktischen Verbesserungen. Solche Änderungen verursachen im Rahmen des bestehenden unentgeltlichen Vertrags keine zusätzlichen Kosten. Hinweise werden auf skillpilot.com veröffentlicht und, soweit die Änderung für den Vertrag wesentlich ist, spätestens beim nächsten First-Party-Start deutlich angezeigt. Beeinträchtigt eine Änderung den Zugang oder die Nutzbarkeit mehr als nur unerheblich, erfolgen Information, Vorlauf und Beendigungsrechte nach dem zwingend anwendbaren Recht.

## 9. Beendigung, Löschung und Sperrung

Sie können den Vertrag jederzeit ohne Frist durch eine eindeutige Erklärung an [support@skillpilot.com](mailto:support@skillpilot.com) beenden. Über die dafür vorgesehene Funktion in der SkillPilot-Weboberfläche können Sie außerdem den aktiven, unter Ihrer SkillPilot-ID in der SkillPilot-Datenbank gespeicherten Lernstand einschließlich der zugehörigen SkillPilot-Lernsessions und SkillPilot-Verbindungen dauerhaft löschen. Danach kann die SkillPilot-ID nicht mehr für diesen Lernstand verwendet werden. Sichern Sie zuvor Inhalte, die Sie behalten möchten.

Nach 365 aufeinanderfolgenden Tagen ohne erfolgreiche Tätigkeit sind diese aktiven serverseitigen Daten zur automatischen Löschung fällig und werden beim nächsten automatischen Löschlauf entfernt. Als Tätigkeit zählen ausschließlich die erfolgreiche Erstellung einer SkillPilot-ID, das aktive Laden oder Fortsetzen des Lernstands in der SkillPilot-Weboberfläche, ein vom Server abgeschlossener Import oder Export signierter Lerndaten, eine serverseitig erfolgreich gespeicherte Änderung des Lernstands, eine erfolgreich abgeschlossene SkillPilot-Sitzungs- oder KI-Anbieter-Verbindungsaktion sowie ein gültiger Coach-/MCP-Aufruf, den SkillPilot mit einem fachlich erfolgreichen Ergebnis abschließt. Hintergrund-GET-Anfragen, SSE-Verkehr, OAuth-Token-Aktualisierungen, das bloße Auswählen oder Öffnen einer lokalen Datei sowie vom Server nicht abgeschlossene oder fachlich abgewiesene Aktionen zählen nicht und starten die 365-Tage-Frist nicht neu.

Die manuelle oder automatische Löschung erfasst keine heruntergeladenen oder sonstigen lokalen Dateien und keine Chats oder sonstigen Daten beim ausgewählten KI-Anbieter. Bestehende Sicherungskopien gehören nicht zum aktiven Lernstand. Die Löschfunktion und der 365-Tage-Ablauf löschen sie nicht unmittelbar einzeln. Eine Verbindung zu einem KI-Anbieter können Sie außerdem über den vorgesehenen Verbindungsweg widerrufen.

Für separat übermittelte Feedback- und Supportnachrichten sowie technische Protokolle gelten die in der [Datenschutzerklärung](/privacy) beschriebenen Zwecke und Aufbewahrungsregeln. Eine Löschung des Lernstands ist nicht mit einer pauschalen Löschung sämtlicher dieser getrennten Vorgänge gleichzusetzen. Gesetzliche Löschansprüche bleiben unberührt.

Der Betreiber darf den Zugang verhältnismäßig einschränken oder sperren, wenn konkrete Anhaltspunkte für einen Verstoß gegen diese Bedingungen, eine Sicherheitsgefährdung, eine rechtswidrige Nutzung oder eine zwingende behördliche oder gesetzliche Anforderung bestehen. Soweit Zweck und Dringlichkeit es erlauben, wird vorher informiert und Gelegenheit zur Klärung gegeben. Bei schwerwiegenden oder wiederholten Verstößen oder einem sonstigen wichtigen Grund kann der Vertrag beendet werden. Eine dauerhafte Einstellung des unentgeltlichen Dienstes wird, soweit vernünftigerweise möglich, vorher angekündigt.

Zwingende gesetzliche Rechte zur Kündigung, Vertragsbeendigung, Datenherausgabe oder Löschung bleiben unberührt.

## 10. Datenschutz und Datensicherung

Die [Datenschutzerklärung](/privacy) beschreibt die aktuell angebotenen Verbindungswege und Datenflüsse und nennt den Kontakt für Datenschutz- und Betroffenenanfragen. SkillPilot ist pseudonym, nicht anonym: Wer die dauerhafte SkillPilot-ID besitzt, kann auf den zugehörigen Lernstand zugreifen. Nutzer:innen sind deshalb für die sichere Verwahrung ihrer ID und für zusätzliche Exporte oder Sicherungskopien wichtiger Informationen verantwortlich.

Trotz angemessener technischer und organisatorischer Maßnahmen können Störungen oder Datenverluste nicht vollständig ausgeschlossen werden. Gesetzliche Pflichten des Betreibers bleiben hiervon unberührt.

## 11. Lernmodelle, Curricula und Gewährleistung

Skill-Landschaften und Lernziele sind didaktische Modelle und können unvollständig oder für einen Einzelfall ungeeignet sein. Auch vollständig angezeigte Teilziele beweisen nicht, dass das tatsächliche fachliche oder berufliche Lernziel erreicht wurde. Maßgeblich bleiben offizielle Curricula, Prüfungsordnungen und die Beurteilung verantwortlicher Lehr- oder Prüfungsstellen.

Die gesetzlichen Rechte bei Mängeln und sonstige zwingende Verbraucherrechte bleiben unberührt. Soweit ein gesetzliches Widerrufsrecht besteht, bleibt auch dieses unberührt.

## 12. Haftung

Der Betreiber haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei schuldhafter Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz, bei Arglist, aufgrund einer übernommenen Garantie und in allen anderen Fällen zwingender gesetzlicher Haftung.

Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist die Haftung auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt. Wesentliche Vertragspflichten sind Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags erst ermöglicht und auf deren Einhaltung die andere Vertragspartei regelmäßig vertrauen darf. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit dies gesetzlich zulässig ist. Diese Beschränkungen gelten entsprechend für gesetzliche Vertreter:innen und Erfüllungsgehilf:innen des Betreibers.

## 13. Anwendbares Recht und Verbraucherstreitbeilegung

Es gilt deutsches Recht. Bei Verbraucher:innen gilt diese Rechtswahl nur, soweit dadurch zwingender Schutz des Staates ihres gewöhnlichen Aufenthalts nicht entzogen wird. Für Verbraucher:innen gelten die gesetzlichen Gerichtsstände.

Die enpasos - Enterprise Patterns & Solutions GmbH ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Unabhängig davon können Sie sich mit Beschwerden jederzeit an [support@skillpilot.com](mailto:support@skillpilot.com) wenden.

## 14. Änderungen dieser Nutzungsbedingungen

Der Betreiber darf diese Bedingungen nur aus einem sachlichen Grund ändern, insbesondere wegen neuer oder geänderter Funktionen, Sicherheitsanforderungen, zwingender Rechtsänderungen oder notwendiger Anpassungen an Provider-Schnittstellen. Die neue Fassung wird mit Versionsnummer und Gültigkeitsdatum unter dieser URL veröffentlicht. Materielle Änderungen werden beim nächsten First-Party-Start klar kenntlich gemacht. Wo eine Zustimmung erforderlich ist, wird vor der weiteren Nutzung erneut eine ausdrückliche, versionsgebundene Annahme verlangt; Schweigen gilt nicht als Zustimmung. Zwingende gesetzliche Informations- und Beendigungsrechte bleiben unberührt.

## Nutzung von Curricula und Lehrplänen

SkillPilot verwendet Strukturen und Kompetenzbeschreibungen aus staatlichen Kerncurricula und Lehrplänen, zum Beispiel des Landes Hessen. SkillPilot bildet Lernziele und Kompetenzstrukturen auf Grundlage öffentlich zugänglicher, amtlich veröffentlichter Curricula und Ordnungen im SkillPilot-Graphen ab. Dabei können Bezeichnungen, Zuschnitte und Formulierungen angepasst werden, soweit dies für eine konsistente Nutzung im Kontext von SkillPilot erforderlich ist.

SkillPilot ist keine amtliche Veröffentlichung und erhebt keinen Anspruch auf wortlautgetreue oder vollständige Wiedergabe. Maßgeblich bleiben die jeweiligen Originaldokumente; Quellen werden angegeben und verlinkt. SkillPilot übernimmt keine konkreten Vorlesungsskripte, Folien oder Unterrichtsmaterialien von Lehrenden. Abgebildet wird der Kompetenzrahmen, nicht der urheberrechtlich geschützte Inhalt einer konkreten Vermittlung.

## Lizenzierung des Quellcodes

Der veröffentlichte Quellcode der SkillPilot-Software ist unter der **Apache License, Version 2.0** lizenziert. Diese Lizenz betrifft die dort bezeichnete Software. Curriculumquellen, Marken, Inhalte Dritter und sonstige Materialien können eigenen rechtlichen Bedingungen unterliegen.

## KI-Transparenz

**Stand: 13. September 2026**

SkillPilot enthält dokumentiert KI-gestützte Lernziel-Visualisierungen, weitere didaktische Illustrationen und Comics, zwei Audioeinführungen, teilweise KI-unterstützt erstellte und redigierte Lerninhalte sowie den Lerncoach. Auch die beiden fotorealistisch wirkenden Lernmotive auf der Startseite sind KI-generierte Symbolbilder und direkt als solche gekennzeichnet. Sie zeigen keine dokumentierten Nutzererfahrungen; abgebildete Geräteoberflächen, Roboter und Sprechblasen sind keine echten Produktaufnahmen oder zugesicherten Funktionen. Der Lerncoach läuft im Chat des jeweils gewählten, dort erkennbaren KI-Anbieters. SkillPilot stellt dafür Lernkontext und Werkzeuge bereit, betreibt aber kein eigenes Dialogmodell. Die aktuell angebotenen Verbindungswege und Datenflüsse beschreibt die [Datenschutzerklärung](/privacy).

Beide Audioeinführungen werden direkt am Player vorsorglich mit dem Hinweis gekennzeichnet, dass sie KI-erzeugte Stimmen enthalten; die genaue Anbieter-, Stimmen- und Segmentprovenienz ist noch nicht abschließend belegt. Die vorhandenen Bildbestände sind überwiegend didaktische Illustrationen und Schemata. „KI-generiert“ bedeutet nicht automatisch „Deepfake“. Für die Einordnung sind Realismus, Ähnlichkeit, Kontext und mögliche Täuschungswirkung maßgeblich; realistische oder sonst zweifelhafte Inhalte werden einzeln geprüft. Soweit eine Offenlegung am betreffenden Inhalt nach [Art. 50 KI-Verordnung](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de) erforderlich ist, ersetzt dieser allgemeine Hinweis sie nicht.

Rechtsgrundlagen sind die [KI-Verordnung (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de) und die [Änderungsverordnung (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=de). Zur Auslegung von Art. 50 berücksichtigt SkillPilot die [nicht bindenden Leitlinien der Europäischen Kommission](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
`

const LEGAL_TEXT_EN = `
**Effective: September 13, 2026 · Version ${CURRENT_TERMS_VERSION}**

These Terms of Use govern the SkillPilot service provided by enpasos - Enterprise Patterns & Solutions GmbH. The legal notices that follow form part of this page.

## 1. Provider and scope

The provider is **enpasos - Enterprise Patterns & Solutions GmbH**, Heuhohlweg 42, 61462 Königstein, Germany. Representation, company-register details and VAT ID are available in the [Imprint](/imprint). Contact for support and legal matters: [support@skillpilot.com](mailto:support@skillpilot.com).

These Terms apply to the hosted SkillPilot service on skillpilot.com, in particular learner, trainer, and explorer features, the management of pseudonymous learning state, SkillPilot Coach v1, and other optional connections to AI learning coaches through interfaces operated by SkillPilot. Source code published under the Apache License 2.0 is governed by that open-source license instead; rules for the hosted service do not restrict the rights granted by that license.

## 2. Contract formation and free use

Merely viewing publicly accessible information pages does not create a service contract. For non-public features of the hosted service, the contract is formed when you expressly accept these Terms through the checkbox in the first-party start flow and then continue with the selected role.

The standard SkillPilot service currently offered is free of charge. It creates neither an automatic payment obligation nor a paid subscription. If paid services are offered in the future, their use will require a separate, clearly labelled offer and your express order.

An account, subscription, or workspace with a selected AI provider is not part of the SkillPilot contract and is governed by that provider's terms.

The ongoing learning beta uses Claude. A regular SkillPilot connection for ChatGPT is not currently available; it is planned only after stabilising the Claude service, completing a separate ChatGPT integration acceptance check, and following the official submission and approval process. No publication date is promised.

## 3. Eligibility and minors

You may use SkillPilot independently if you have the legal capacity required to do so. Before accepting these Terms, minors need the consent of their legal representative where the contract is not merely legally beneficial to them or applicable law otherwise requires consent. Anyone acting for a school, organisation, or another person must be authorised to do so.

The Claude beta through a personal Claude account is additionally subject to [Anthropic's Consumer Terms](https://www.anthropic.com/legal/consumer-terms). These require a minimum age of 18 or a higher minimum age that applies locally. Parental permission does not override this provider restriction, and a Claude account must not be made available to other people. Anyone who does not meet these requirements may use the SkillPilot cockpit without the Claude connection under the preceding rules. Organisational connections or other AI connections offered in the future are subject to their respective provider's terms; they are not an automatic exception to its age rules.

## 4. Service and access credentials

SkillPilot represents learning goals in a skill graph, stores pseudonymous learning state, and supports the planning, practice, reflection, and assessment of learning. Individual features may connect to an explicitly selected AI provider. SkillPilot does not operate its own conversational model.

The randomly generated permanent SkillPilot ID is the sole access key to the pseudonymous learning state. Keep this ID, encrypted ID files, temporary learning-session values, and other credentials secure and do not disclose them to unauthorised persons. Without the permanent ID, the provider generally cannot associate the learning state with a person or restore access. Short-lived learning sessions and OAuth connections do not replace the permanent ID.

SkillPilot is not an official education platform or examination body. A displayed learning state, AI assessment, or completed learning goal is not a recognised qualification, report card, or binding certification.

## 5. Acceptable use

You may use the hosted service only lawfully and for its intended learning purpose. In particular, you must not:

* use another person's SkillPilot ID, learning session, or other credentials without permission;
* bypass or attempt to bypass authentication, security measures, access restrictions, or rate limits;
* impair the service through malware, automated overload, or other disruptive interference;
* transmit unlawful content or infringe the rights, confidentiality, or personal data of others without authority;
* intentionally manipulate learning evidence, assessments, or the provenance of content in a misleading way; or
* use the service to obtain unauthorised help in an examination or to instruct others to violate the law.

Permitted use of published source code under the Apache License 2.0 remains unaffected.

## 6. Inputs and limited licence

You retain your rights in your own inputs. Where you submit content directly to SkillPilot, such as voluntary cockpit feedback, you grant the provider only a non-exclusive licence, limited in geographic scope as necessary and generally limited to the term of the contract, to store, technically process, and display that content to the extent required for the respective feature and described in the [Privacy Policy](/privacy). For an AI connection you select, SkillPilot may transmit the necessary learning context and tool results to that provider. This clause grants SkillPilot no right to retrieve your conversation, photos, or voice recordings held there. Where data may lawfully remain stored after the contract ends because of a legal obligation or another legal basis, this licence continues only for the corresponding purpose and period.

You may use only content and data for which you have the necessary rights and permissions. This clause transfers no ownership and grants the provider no right to use your inputs to train a conversational model.

## 7. AI features and third-party services

When you use the AI learning coach, the conversation runs with the visibly selected provider. That provider processes your chat inputs, uploaded photos and files, and, when using voice mode, voice inputs; it also receives the SkillPilot learning context and tool results required for coaching. The Claude beta includes chat, the Claude app, photo uploads or camera captures in the app, and voice mode. Availability of these provider features depends, among other things, on the account, device, and app version. Voice output may pause temporarily. The third-party service is governed by its own terms, privacy rules, availability, and any applicable charges.

**No chat text sent to the SkillPilot Core:** The coach assesses the work and composes explanations, feedback, and success responses within the provider conversation. For this purpose, the SkillPilot interface processes only the defined structured tool data, such as learning-goal and session references, completion reports, individual pass/fail results, or permitted numeric examination scores. Free-form answers, solution steps, chat excerpts, summaries, and written assessment or success explanations must not be transferred to SkillPilot through this channel. Photos, audio, and chat transcripts are likewise not part of the SkillPilot learning state. A coach's written assurance alone does not confirm storage: the successful tool result and the learning state shown in the cockpit are authoritative.

Separately, you may voluntarily submit feedback in the cockpit about the current learning goal displayed there, including behaviour of the coach that you consider incorrect. This deliberately sends the feedback text you enter to SkillPilot. Describe the problem in your own words without full learning chats, access credentials, or unnecessary personal details. This feedback is not an automatic export from the provider conversation. Its processing and the handling of support requests are described separately in the [Privacy Policy](/privacy).

AI output and AI-supported assessments may be incorrect, incomplete, biased, or unsuitable. Verify important content yourself or with a qualified educator. Do not use such output as the sole basis for report cards, examination decisions, admissions, certificates, employment decisions, or other decisions with significant legal or personal effects.

## 8. Availability and service changes

No specific service level or uninterrupted availability is promised for the free service. Maintenance, security measures, infrastructure or third-party outages, and events outside the provider's control may temporarily restrict use.

The provider may develop or change the service for valid reasons, in particular to fix defects, maintain security, comply with law, preserve technical compatibility with browsers or provider interfaces, prevent abuse, or make reasonable technical or educational improvements. Such changes impose no additional cost under the existing free contract. Notices will be published on skillpilot.com and, where a change is material to the contract, displayed prominently no later than the next first-party start. If a change impairs access or usability more than insignificantly, information, advance notice, and termination rights will be provided as required by mandatory law.

## 9. Termination, deletion, and suspension

You may terminate the contract at any time without notice by sending an unambiguous declaration to [support@skillpilot.com](mailto:support@skillpilot.com). You may also use the designated function in the SkillPilot web interface to permanently delete the active learning state stored under your SkillPilot ID in the SkillPilot database, including the associated SkillPilot learning sessions and SkillPilot connections. The SkillPilot ID can then no longer be used for that learning state. First export anything you wish to retain.

After 365 consecutive days without successful activity, this active server-side data becomes due for automatic deletion and is removed during the next automatic deletion run. Only the following count as activity: successful creation of a SkillPilot ID; foreground loading or resuming of the learning state in the SkillPilot web interface; a server-completed import or export of signed learner data; a learner-state change successfully stored on the server; a successfully completed SkillPilot session or AI-provider connection action; and a valid Coach/MCP call that SkillPilot completes with a successful domain result. Background GET requests, SSE traffic, OAuth token refreshes, merely selecting or opening a local file, and server operations that do not complete or are domain-rejected do not count and do not restart the 365-day period.

Manual or automatic deletion does not cover downloaded or other local files, or chats or other data held by the selected AI provider. Existing backup copies are not part of the active learning state. Neither the delete function nor the 365-day expiry immediately deletes each backup copy individually. You may also revoke an AI-provider connection through the designated connection flow.

Separately submitted feedback and support messages, as well as technical logs, follow the purposes and retention rules described in the [Privacy Policy](/privacy). Deleting the learning state is not equivalent to deleting all of these separate records. Statutory rights to erasure remain unaffected.

The provider may proportionately restrict or suspend access where there are concrete indications of a breach of these Terms, a security threat, unlawful use, or a binding legal or regulatory requirement. Where the purpose and urgency allow, notice and an opportunity to clarify will be provided first. The provider may terminate for a serious or repeated breach or another important reason. Permanent discontinuation of the free service will be announced in advance where reasonably possible.

Mandatory statutory rights to terminate, obtain data, or request deletion remain unaffected.

## 10. Privacy and backups

The [Privacy Policy](/privacy) describes the connection methods and data flows currently offered and provides contact details for privacy and data-subject requests. SkillPilot is pseudonymous, not anonymous: a person who possesses the permanent SkillPilot ID can access its learning state. Users are therefore responsible for keeping the ID secure and for making exports or additional backups of important information.

Despite appropriate technical and organisational measures, outages or data loss cannot be completely excluded. The provider's statutory obligations remain unaffected.

## 11. Learning models, curricula, and statutory remedies

Skill landscapes and learning goals are educational models and may be incomplete or unsuitable for an individual situation. Even where all displayed sub-goals are complete, this does not prove that the actual academic or professional learning objective has been achieved. Official curricula, examination regulations, and the assessment of responsible educators or examination bodies remain authoritative.

Statutory rights concerning defective performance and other mandatory consumer rights remain unaffected. Where a statutory right of withdrawal applies, it also remains unaffected.

## 12. Liability

The provider has unlimited liability for intent and gross negligence, culpable injury to life, body, or health, liability under the German Product Liability Act, fraudulent concealment, an assumed guarantee, and all other cases of mandatory statutory liability.

For a slightly negligent breach of an essential contractual obligation, liability is limited to the damage that was foreseeable and typical for the contract when it was formed. Essential obligations are those whose fulfilment makes proper performance of the contract possible and on whose fulfilment the other party may regularly rely. Liability for other cases of slight negligence is excluded to the extent permitted by law. These limitations apply correspondingly to the provider's legal representatives and agents.

## 13. Governing law and consumer dispute resolution

German law applies. For consumers, this choice of law applies only to the extent that it does not deprive them of mandatory protection under the law of their country of habitual residence. Statutory places of jurisdiction apply to consumers.

enpasos - Enterprise Patterns & Solutions GmbH is neither willing nor required to participate in dispute-resolution proceedings before a consumer arbitration board. You may nevertheless contact [support@skillpilot.com](mailto:support@skillpilot.com) with any complaint.

## 14. Changes to these Terms

The provider may change these Terms only for an objective reason, in particular because of new or changed features, security requirements, binding changes in law, or necessary adaptations to provider interfaces. The new version will be published at this URL with its version number and effective date. Material changes will be clearly identified at the next first-party start. Where consent is required, continued use will require a new express, version-specific acceptance; silence does not count as consent. Mandatory rights to information and termination remain unaffected.

## Use of curricula and syllabi

SkillPilot uses structures and competency descriptions from official core curricula and syllabi, for example those of the State of Hesse. SkillPilot models learning goals and competency structures in the SkillPilot graph based on publicly accessible, officially published curricula and regulations. Names, scopes, and wording may be adjusted where necessary for consistent use within SkillPilot.

SkillPilot is not an official publication and makes no claim to reproduce the wording verbatim or in full. The original documents remain authoritative; sources are cited and linked. SkillPilot does not include specific lecture notes, slides, or teaching materials from instructors. It models the competency framework, not the copyright-protected content of a particular course or method of instruction.

## Source-code licence

Published SkillPilot source code is licensed under the **Apache License, Version 2.0**. That licence applies to the software identified there. Curriculum sources, trademarks, third-party content, and other materials may be subject to their own legal terms.

## AI Transparency

**Date: September 13, 2026**

SkillPilot includes documented AI-supported learning-goal visualizations, other educational illustrations and comics, two audio introductions, learning content that may be AI-assisted and editorially reviewed, and the learning coach. The two photographic-looking learning scenes on the homepage are also AI-generated illustrations and are labelled directly. They do not document user experiences; depicted device interfaces, robots, and speech bubbles are not actual product captures or promised features. The coach runs in the chat of the selected, visibly identified AI provider. SkillPilot supplies learning context and tools but does not operate its own conversational model. The [Privacy Policy](/privacy) describes the connection options currently offered and the related data flows.

Both audio introductions carry a precautionary notice directly at the player that they contain AI-generated voices; their exact provider, voice and segment provenance has not yet been conclusively established. The existing image collection consists predominantly of educational illustrations and diagrams. “AI-generated” does not automatically mean “deepfake.” The assessment considers realism, resemblance, context and potential to mislead; realistic or otherwise doubtful items are reviewed individually. Where disclosure on the content itself is required under [Article 50 of the AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), this general notice does not replace it.

The legal bases are the [AI Act, Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), and [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj). For the interpretation of Article 50, SkillPilot takes account of the [European Commission’s non-binding Guidelines](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
`

export const getLegalViewCopy = (language: LabelLanguage): LegalViewCopy => (
  language === 'en'
    ? {
        backToApp: 'Back to App',
        title: 'Terms of Use & Legal Notices',
        markdown: LEGAL_TEXT_EN,
      }
    : {
        backToApp: 'Zurück zur App',
        title: 'Nutzungsbedingungen & rechtliche Hinweise',
        markdown: LEGAL_TEXT_DE,
      }
)
