# Unabhängiges gezieltes V-A-v2-Followup

**Ergebnis: vier neue KEEP, keine REVISE.** Die Entscheidung gilt nur für die vier ausgewählten PNG-Hashes in `targeted-v-a-v2.decisions.actual.json`. Drei unveränderte eigene V1-KEEPs werden ausschließlich bytegenau weitergebunden; sie wurden nicht erneut bewertet. Der V1-Bericht bleibt unverändert.

| Ziel | Eigener gezielter Befund |
|---|---|
| 965ca297 – Salzformeln aus Ionenladungen ableiten | 2 Al³⁺, 3 O²⁻, Verhältnis 2:3, Al₂O₃ und Ladungssumme 0 stimmen und sind ausreichend groß. |
| 747c5777 – Bindungs- und Molekülpolarität ableiten | δ-Zeichen und Farblegende stimmen; schwarze Bindungen und rote Dipolpfeile sind getrennt. Lineare CO₂-Dipole heben sich auf. |
| 49235cbe – Unterenergiestufen aus Spektren und Ionisierungsenergien ableiten | Be/B 900/801 und N/O 1402/1314 kJ/mol, relative Höhen sowie n=1/2 und ℓ=0/1 stimmen. Das Spektrum bleibt schematisch. |
| 5e2eb826 – Partikelgröße und Oberflächen-Volumen-Verhältnis deuten | Acht getrennte kleine Würfel haben in derselben grundlegenden Perspektive ungefähr halbe entsprechende Kanten. Gleicher Gesamtinhalt und größere äußere Oberfläche passen. |

Alle vier vollständigen aktuellen DE/EN-Ziele und vier native PNGs (1672×941) wurden tatsächlich gelesen bzw. gesehen. Zusätzlich wurden zwölf tatsächliche Chromium-Abbildungen gesehen. Ein erfolgreicher Screenshotlauf allein wurde nicht als Sichtprüfung gewertet.

## Tatsächliche Breiten und Grenzen

Die isolierte Bildbrowser-QA reproduziert die aktuelle `GoalCard.tsx`-Bildklasse `block h-auto max-h-[28rem] w-full object-contain`. Die Hauptfälle haben **360 bzw. 680 px tatsächliche Bildbreite**, bei Viewports 362/682 px wegen des Figure-Rahmens. Zusätzlich wurde ein **360-px-Kartenfall mit p-5, Karten- und Figure-Rahmen** geprüft: dort ist das Bild **316 px breit**. Alle zwölf Bilder laden; `object-fit: contain` gilt, und die Maximalhöhe 448 px greift bei diesen Bildbreiten nicht.

Bei 360/680 px sind die entscheidenden Ladungen, Dipole, Werte, Einheiten und Quantenzahlen lesbar. Im engeren 316-px-Fall sind insbesondere die kleinen Achsenticks/ℓ-Angaben und der ergänzende Makromolekülhinweis knapp. Es gibt keine pauschale Garantie, dort jeden Kleinsttext sicher zu lesen. Die getrennten fallbezogenen Befunde stehen im Entscheidungs-JSON.

Die Farbfelder und Würfel sind qualitative Illustrationen. Der Energiebalkenplot bewahrt die richtige relative Höhenfolge und numerischen Werte, ist aber kein exakt skalierter Messplot. Die acht vorliegenden NIST-HTML-Nachweise und der eigene V1-Datenreceipt wurden erneut bytegenau geprüft; es gab keinen neuen Download und keine Änderung der gültigen Datentexte.

Die empfohlenen `boundedAltDE`-Texte beschreiben ausschließlich tatsächlich vorhandene Bildinhalte. Kein Bild beansprucht vollständige Deckung seines ganzen Lernziels. Diese Prüfung ist weder eine vollständige App-/Native-Buch-Seitenprüfung noch Quellen-/P-/D-Freigabe, aktiver QA-Eintrag, Human Approval, Human Trial oder M7-Abschluss. Keine Peer-V-B-v2-Befunde wurden gelesen; keine Bilder erzeugt und keine aktiven Dateien geändert. Netto strenge Abschlüsse: 0.

## Bindungen und Freeze

Der Author-Freeze `d98626c72ae462ba680483e5e3a1431353e950ddb8eb28a2ebf99df1b027c709` bindet 29 Nutzdateien; das Verzeichnis hat 30 Dateien einschließlich des Freeze. Eigener Eingang, zwölf Browser-Screenshots, Browserprobe, vier Entscheidungen und finale Eingangsprüfung stehen in diesem eigenen Ordner. Die finale Prüfung erhält den historischen Author-/Eingangshash und bindet den tatsächlich aktuellen ganzen Kanon getrennt, falls sich parallel autorisierte Metadaten ändern. Alle sieben vollständigen Zielobjekte müssen weiterhin exakt zum Raw-Eingang passen.

`targeted-v-a-v2.final.freeze.json` versiegelt ausschließlich diese eigenen Artefakte. Nach dem Freeze bleibt der Prüfer idle; weitere Aufträge sind getrennt.
