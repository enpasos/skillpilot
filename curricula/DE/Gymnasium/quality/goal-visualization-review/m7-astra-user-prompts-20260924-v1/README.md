# M7 Mathematik: Bildprompts für den Astra-Lauf

Dieses Paket enthält 22 paste-fertige Prompts für Ziele, deren D- und Positive-Evidence-Bindungen im zentralen Bericht vom 24.09.2026 aktuell waren und die keinem damals offenen D-Paket angehörten. Gate V bleibt bei allen 22 offen. Die aktuellen IDs, Zieltexte und Snapshot-Fingerprints stehen in prompt-manifest.json.

## Übergabe

Bitte pro Ziel genau eine quadratische PNG-Datei mit exakter Goal-ID unter incoming/ ablegen, zum Beispiel:

    incoming/06ce2b1b-e888-5322-9ed9-dfc6d322956a.png

Keine Skalierung, Nachzeichnung, Kompression, Beschriftungsänderung oder sonstige Pixelbearbeitung vor der Ablage. Für einen neuen Versuch die alte Datei erhalten und -v2.png verwenden.

Die zuerst dokumentierte reine Prompt-Zuordnung wurde auf den späteren ausdrücklichen Nutzerhinweis zu möglichen Kopierfehlern durch eine Sichtprüfung in Originalauflösung ergänzt. Die Entscheidungen und konkreten Befunde stehen in [mathematik-z-astra-image-sight-20260924-v1.md](../mathematik-z-astra-image-sight-20260924-v1.md). Generierung und Import sind keine V-Freigabe. Menschliche Freigabe und Erprobung bleiben separate Release-Gates.

Die kopierfertigen Prompts stehen in prompts.md. Ziele aus offenen D-Prüfpaketen erhalten nach deren aktueller Synthese ein eigenes Folgepaket.

Prompt 1 wurde nach dem Nutzerhinweis zum falsch sitzenden Punkt präzisiert: Er bindet jetzt das reflektierte Paar `(ln 4, 4)` und `(4, ln 4)` mit getrennten Koordinatenhilfen und dem Hinweis, Beschriftungen zu versetzen, ohne Marker zu verschieben.

Prompt 4 wurde nach dem Nutzerhinweis von der Dreierzerlegung eines Prismas auf dünne horizontale „Stockwerke“ umgestellt. Die ähnlich verkleinerten Querschnitte haben in Höhe `z` den Flächeninhalt `G(1-z/h)²`; die Integralzeile zeigt die exakte Rechnung nur als nachgeordneten Zusatz. Das zugeordnete Ziel liegt in Jahrgang 10 und verlangt curriculargemäß eine Plausibilisierung des Drittelfaktors, keine Beherrschung der Integralrechnung. Der frühere Prompt wurde als Arbeitsstand ersetzt.

Die fachliche Durchsicht von Prompt 3 und 5–22 samt den gezielten Korrekturen steht in [prompt-review-20260924.md](prompt-review-20260924.md).

Der erste Importstand mit Prompt 1–19 und 22 ist in [user-image-import-receipt-20260924.json](user-image-import-receipt-20260924.json) bytegenau festgehalten. Prompt 6 wurde nach einer späteren Nutzerfassung als `-v2` übernommen; die frühere Kopie und ihr Beleg bleiben erhalten. Historische Prompt- und Rekonstruktionsmetadaten wurden unverändert erhalten.

Aktueller Integrationsstand: 16 Bilder, einschließlich des neu gelieferten Prompt 21, sind nach Originalansicht als Pilot-Assets mit genauem Hash maschinell V-geprüft. Für diese 16 wurde auch das aktuelle P-Profil gezielt gegen die neue Bild-/Seitenbindung geprüft; beim Pyramidenziel wurde das Profil fachlich auf den Schichtvergleich umgestellt. Fünf Bilder (1, 5, 7, 8, 10) sind wegen konkreter Qualitätsbefunde archiviert und aus den aktiven Links entfernt. Prompt 20 ist weiterhin bytegleich mit Prompt 19 und nicht eingebunden. Die fünf unveränderten P-Nachweise für die zurückgezogenen Bilder wurden bytegleich wiederhergestellt. Details stehen in [positive-current-image-bound-v1](positive-current-image-bound-v1), [positive-restored-after-sight-v2](positive-restored-after-sight-v2) und [user-image-sight-and-prompt21-receipt-20260924-v2.json](user-image-sight-and-prompt21-receipt-20260924-v2.json).

## Wiederaufnahme: bereits angenommene Bilder erhalten

Die vom Nutzer gelieferten und hier bereits angenommenen Bilder zu Prompt **2, 3, 4, 6, 9, 11–19, 21 und 22** werden bei einem neuen Arbeitsanlauf **nicht erneut fachlich oder visuell geprüft**. Maßgeblich sind die 16 Goal-IDs und exakten SHA-256-Werte in der oben verlinkten Paketquittung sowie die aktuellen Ziel-, Asset-, V- und P-Bindungen. Ein erneuter Lauf darf diese Nachweise nur auf unveränderte Bytes und gültige Bindungen abgleichen und muss sie dann übernehmen. Die Herkunft des Bildgenerators ist kein Grund für eine Wiederholungsprüfung.

Nur tatsächlich neue oder geänderte Bilder und betroffene Ziel-, Seiten-, Kontext-, Quellen- oder Bildbindungen brauchen eine gezielte neue Prüfung. Die zurückgestellten Bilder zu Prompt 1, 5, 7, 8 und 10 und die falsche Kopie zu Prompt 20 sind keine angenommenen Assets; ihre bisherigen Befunde bleiben erhalten. Die Nutzerannahme dieser Bilddateien ist keine menschliche Curriculum- oder Release-Freigabe.

Der [aktuelle Prompt-20-Aufschub](../mathematik-zz-prompt20-current-deferral-2026-09-24.md) hält den Kopierfehler und die weiterhin offene Provider-Warteschlange zugleich fest. Dadurch bleibt die QA/Coverage-Zählung konsistent, ohne die historische Sichtentscheidung zu ändern oder ein angenommenes Bild erneut zu prüfen.

Der zentrale Fünf-Gate-Bericht nach diesem Paket meldet Mathematik 723/797 streng (D 733, P 772, A 797, M 797, V 757; null Blocker) und Physik 478/478. Gegenüber 707/797 sind das 16 neue fachlich geprüfte Abschlüsse. Die fünf wiederhergestellten P-Bindungen sind darin kein eigener Nettozuwachs. Menschliche Release-Gates bleiben offen.

Für drei noch nicht integrierte Q3-Stochastikziele liegen getrennte Promptkandidaten vor; ihr Status und die exakten IDs stehen in [m7-q3-stochastics-supplement-20260924-v1.manifest.json](m7-q3-stochastics-supplement-20260924-v1.manifest.json). Sie zählen derzeit nicht zu den 22 aktuellen D-gebundenen Prompts.
