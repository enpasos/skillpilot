# Mathematik M7 · zwei gezielt korrigierte Lernzielbilder

Datum: 24.09.2026. Umfang: ausschließlich die primären Visualisierungen der Ziele `b431148b-526c-4bde-b04b-48d23101d0d3` und `502ecaa7-cca6-5c51-a1cc-da09a7b2382c`. Die Lernzieltexte, Seiten und D-/P-/A-/M-Nachweise werden hier nicht freigegeben oder verändert.

## Ausgangslage und Entscheidung

Bei `b431` zeigte das zuvor aktive JPG im Kern nur eine glockenförmige Binomialverteilung samt Normalapproximation und Stetigkeitskorrektur. Für die eigentliche Kompetenz — in Situationen **begründet einzuschätzen**, ob die Annäherung tragfähig ist — fehlte ein klarer Gegenfall. Das Bild wurde nicht allein wegen seines Generators verworfen: Der neue Vergleich eines geeigneten und eines ungeeigneten Falls macht genau diese Entscheidung sichtbar und ist auf kleinen Karten besser lesbar.

Bei `502` war das zuvor aktive PNG fachlich widersprüchlich: Der Graph zum Term `(x²−4)/(x−2)` war als gekrümmte Kurve statt als Gerade mit Lücke bei `x=2` gezeichnet; außerdem standen eine Radikandprüfung neben einem Term ohne Wurzel und ein nicht hergeleiteter Ballwurf-Zeitbereich im Bild. Die neue Fassung zeigt drei unabhängige, in sich stimmige Beispiele für Term, Graph und Sachkontext.

Die alten aktiven Assets und ihre Prompt-/Rekonstruktionsdateien liegen unverändert unter [`archived-active/`](archived-active/). Frühere menschliche Freigaben bezogen sich auf deren **alte** Bytes und wurden nicht auf die neuen PNGs übertragen. Die neuen Bilder sind nach Prüfung der tatsächlichen Pixel AI-freigegebene Pilotbilder; `humanApproved: no`. Herkunft, Lizenz und fachliche Prüfung sind getrennte Angaben.

## Erzeugung und vollständige Iteration

Beide neuen quadratischen Comic-PNGs wurden mit der integrierten OpenAI/ChatGPT-Codex-Bildgenerierung erzeugt. Es wird weder Nano Banana Pro als Quelle noch eine nicht belegte Modellversionsnummer behauptet. Die tatsächlich verwendeten Prompts sind wortgetreu versioniert. Die erste Runde jedes Ziels wurde **nicht** importiert:

| Ziel/Runde | Prompt SHA-256 | Bild SHA-256 | Prüfung |
| --- | --- | --- | --- |
| `b431` V1 | [`9097daa1…`](b431-prompt-v1.md) | [`9341a2ee…`](candidates/b431-v1-rejected.png) | Abgelehnt: Beim Beispiel `n=100, p=0,01` war der erste Histogrammbalken deutlich höher als der zweite; tatsächlich gilt `P(X=1)/P(X=0)=100·0,01/0,99≈1,0101`, also ist der zweite minimal höher. |
| `b431` V2 | [`d9919826…`](b431-prompt-v2.md) | [`de87084c…`](candidates/b431-v2-accepted.png) | Importiert nach Original- und 360-Pixel-Prüfung. |
| `502` V1 | [`713c88d2…`](502-prompt-v1.md) | [`5db1f828…`](candidates/502-v1-rejected.png) | Abgelehnt: Die x-Achse stauchte die Strecke von `1` nach `4` gegenüber `0` nach `1` um rund 10%; der Kontext benannte die Funktion nicht ausdrücklich. |
| `502` V2 | [`d4bf4c2b…`](502-prompt-v2.md) | [`fbc4a7ff…`](candidates/502-v2-accepted.png) | Importiert nach Original- und 360-Pixel-Prüfung. |

Vollständige SHA-256-Werte:

| Datei | SHA-256 |
| --- | --- |
| `b431-prompt-v1.md` | `9097daa1822f4bc88661c55b762323a40f6fede31771771587ee16192a4e279d` |
| `b431-prompt-v2.md` | `d991982684300c908efee6c1408a89b5f57a15c4a6c2be7a38a0582eaa1bf89f` |
| `502-prompt-v1.md` | `713c88d2162257d84d69aed89d7e77216fc8f3cc1c319d7dbdef6c94aec2ffde` |
| `502-prompt-v2.md` | `d4bf4c2b967dffea3e8659bd33bcb16e92bf3bb051f76f59e3673676f33dd55c` |
| `candidates/b431-v1-rejected.png` | `9341a2ee1d29c950c61bb6619c7f5f63be5eb872747e62dde3b4f5fc9d1c4dc2` |
| `candidates/b431-v2-accepted.png` | `de87084c06ea972b84ce521e6c70ee57e0f4f304ab40d466f48760ecf59fef0f` |
| `candidates/502-v1-rejected.png` | `5db1f828eceea876d5eea0fe1060545fd5551543a056e128ad1b5cf5618dabb8` |
| `candidates/502-v2-accepted.png` | `fbc4a7ff7bee8a732f7efb2862e490021ac29e26df6c534f738c5bcae4a5c4e9` |

Die lokalen Generierungsquellen waren `exec-4694275e-0dea-4b56-a58d-b2b1421f90da.png`, `exec-404e5866-ebc4-4ad2-bffe-16337c22a0ce.png` (`b431` V1/V2) sowie `exec-4cd9105c-8e9f-4d47-94f3-1bed17fad889.png`, `exec-2cc85333-ac51-483d-ac80-d751c728a1ba.png` (`502` V1/V2) unter `/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/`. Die versionierten Kandidaten im Paket erhalten die geprüften Bytes unabhängig von diesem lokalen Pfad.

Die archivierten alten Assets haben SHA-256 `aec28a4d43dff8b6764a059ce592aaf9b223d35bd609aef7511fb7e685887b67` (`b431-original.jpg`) und `7779288e950bd9c18bf6a4850d3ec2eaf2a3da7d58af6675cb1327d777ea1a15` (`502-original.png`). Die archivierten Promptdateien sind ebenfalls bytegleich mit den vorher aktiven Dateien; sie bleiben historische Belege, keine aktuellen Import-Prompts.

## Prüfung der tatsächlich importierten Bilder

`b431`: Links ist die Trefferzahl bei 100 unabhängigen fairen Münzwürfen mit `p=0,5` annähernd glockenförmig. Rechts hat `B(100;0,01)` Erwartungswert `np=1`: Die Balken für null und einen Treffer sind fast gleich hoch, der Ein-Treffer-Balken minimal höher; die Verteilung fällt danach rechtsschief ab. Der Bildtext „Normalmodell hier unpassend“ ist für diesen Gegenfall richtig. Die beiden Fälle, Formeln, deutschen Beschriftungen und die abstrahierte Comicgestaltung wurden im Original (`1254 × 1254`) sowie bei 360 Pixel Kartenbreite geprüft.

`502`: Beim Term `f(x)=1/(x−3)` ist `x=3` ausgeschlossen. Der zweite, eigenständige Graph ist `y=2` für `1≤x<4`, mit geschlossenem Punkt bei `1` und offenem Punkt bei `4`. Die x-Marken `0`, `1` und `4` sind im Handzeichnungsstil annähernd gleichförmig skaliert; die verbleibende Abweichung von etwa 3% ändert weder Punktlage noch Intervall. Im dritten Feld wird `t` als Zeit seit dem Start eines Wegs `s(t)` eingeführt, daher `t≥0`. Term, Graph und Sachkontext werden nicht als ein und dieselbe Funktion ausgegeben. Deutsche Texte und Symbole sind im Original und bei 360 Pixel Kartenbreite lesbar.

Der Import setzte je einen aktuellen primären kanonischen Bildlink und identische PNG-Bytes in kanonische Visualisierungsablage, Web- und Backend-Static-Assets. Die aktuellen V-QA-Einträge binden AI-Freigaben an die **exakten neuen Hashes**, beide mit `humanApproved: no`. Das neue eigene Bildmaterial trägt `CC-BY-4.0` gemäß `LICENSING.md`; diese Angabe lizenziert keine alten Drittanbieter-Assets neu.

Diese Paketentscheidung gilt nur für das V-Gate. Wegen der geänderten Bild- und Seitenbindung sind D-/P-Kontext, Quellen und abhängige Nachweise gezielt zu prüfen; Hash-Nachführung allein genügt nicht. Ein vollständiger Fünf-Gate-Abschluss oder menschliche Bildfreigabe wird hier nicht behauptet.
