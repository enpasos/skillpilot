# Biologie M7: vier Methodenbilder, maschineller Bildreview

Datum: 2026-09-30. Umfang: ausschließlich die vier unten genannten aktuellen
`curricularAtomic`-Ziele der kanonischen Biologie-Landschaft. Die vorhandene
Landschaft hatte für diese Ziele keine Primärbilder; es wurde kein gutes
Bestandsbild ersetzt. Alle vier PNGs wurden mit dem eingebauten OpenAI
`image_gen` einzeln erzeugt. Die tatsächlich verwendeten Prompts liegen bei
den kanonischen Bilddateien als `prompt.de.md`.

| Ziel-ID | Bildidee und fachliche Sichtprüfung | SHA-256 der aktiven PNG-Bytes |
| --- | --- | --- |
| `d97f6957-fbc9-569c-8648-f7df5eb9dfd8` | Zwei gleichartige Jungpflanzen unter Licht und Schatten, Fragezeichen und noch leerer Planungsbogen. Die Frage und der Vergleich sind sichtbar, ohne einen Versuchsausgang vorzugeben. | `a073e72de63960af25e32f42d5000bb81dbfe694ba78039ee7377c9bf5cb2e6f` |
| `26aa47b7-e5cc-5131-8980-0ec3271758b6` | Eine Jungpflanze wird mit einem Lineal gemessen; die Protokollseite enthält Zeichnungen. Messung und Dokumentation sind erkennbar, ohne eine Schlussfolgerung zu behaupten. | `fa3d774cb5daf23927ba4f8f647997a1f17d2e2ec158df6c115cd65eef61d76a` |
| `0f1549f6-8341-53b0-8161-5eaeb2b37809` | Ein intaktes und ein löchriges Blatt derselben Pflanzenart werden betrachtet und als vergleichende Skizzen festgehalten. Die Darstellung behauptet keine Ursache für die Löcher. | `daafbf9040655e5f42329ec429e97a7d76c422e1b588b39198a2c3a49129748d` |
| `0380f992-723a-513d-8c3f-8ca7f8e0394f` | Ein orange-schwarzer Falter wird nach Flügelmerkmalen mit einem verzweigten Bildschlüssel abgeglichen; die passende Darstellung ist markiert. | `4102a73d509a853bf3279bf8da29da15e71171c165d65ed94de4a2164f2b01bf` |

Der erste Entwurf für `0f1549f6` enthielt Strichlisten zu einem einzelnen
Marienkäfer, deren Bedeutung nicht fachlich nachvollziehbar war. Er wurde
verworfen und unter `rejected/0f1549f6-initial-tally-candidate.png` als
historischer Kandidat belassen. Das Blattbild ist ein neuer, gezielt
korrigierter Entwurf; die Bilderzeugung selbst gilt nicht als Freigabe.

Nach eigener Sichtprüfung hat eine getrennte Codex-Hauptinstanz alle vier
aktiven PNGs unabhängig an den aktuellen Titeln und Beschreibungen geprüft.
Ihr Befund war für alle vier fachlich und visuell positiv. Beim Blattbild
wurde zusätzlich der Alt-Text präzisiert: Die Blätter sind Teile einer
beobachteten Pflanze. Die vier `biologie.qa.json`-Einträge sind als
**maschinell freigegeben** an den exakten aktiven Asset-Hash gebunden;
`humanApproved` bleibt `no`.

Für jede ID wurden Kandidat, kanonisches Asset, öffentliches Asset und
Backend-Static-Asset bytegleich geprüft. Primärlink, `skillpilotId`, Titel,
Beschreibung, Alt-Text und `CC-BY-4.0`-Lizenz wurden zielbezogen gesetzt.
`generateGoalVisualizationQaLedgers.ts --check --subject=biologie` bestand.
Die fachlichen D-/P-Nachweise fehlen für diese vier Ziele zu diesem Zeitpunkt
noch; aus V allein folgt kein strenger Fünf-Gate-Abschluss und keine
menschliche Prüfung, Freigabe oder Erprobung.
