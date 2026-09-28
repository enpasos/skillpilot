# Zwei graphische Stammfunktionsziele: Review-Stand

Stand: 28. September 2026. Dieses Paket ist ein **historisch gültiger Reviewinput**, aber keine aktuelle D-Resolution und keine M7-Freigabe. Es enthält bewusst weder `synthesis-decisions.json` noch `resolution-index.json`.

| Ziel | Zwei unabhängige Blindrunden | Aktueller Kanon | Ergebnis |
| --- | --- | --- | --- |
| `21676dae-8619-59d1-89e3-a35bb2297e2c` (`f`-Graph → `F`-Graph) | `keep` / `keep`, Dissens nur im Wortlaut von Verständnisnachweis und Begründung | Deutscher und englischer Zieltext stimmen noch mit dem Reviewinput überein. | Inhaltlich kann der Text bleiben; eine gebundene D-Synthese fehlt. |
| `85eda551-cfc1-52c6-a252-4c7394c1f7e6` (`F`-Graph → `f`-Graph) | `revise` / `revise`: Beide Runden beanstanden, dass die alte Fassung Tangentensteigungen als solche von `f` lesbar macht. | Der Kanon enthält bereits den präziseren Text der zweiten Runde: Die **Tangentensteigungen von F** begründen Werte, Vorzeichen und Nullstellen von `f = F′`. | Die alte Textfassung darf nicht als `keep_current` synthetisiert werden; der neue Text braucht einen aktuellen, unabhängigen D-Review. |

`check` und `summarize` für diesen Batch bestehen und bestätigen die damaligen gebundenen Reviewartefakte (`2` Ziele, `2` Synthesebedarfe). Das ist keine Abnahme gegen den geänderten Kanon. Der Standalone-Vertrag verlangt **eine gültige Resolution für jedes der beiden Batch-Ziele**; er erlaubt keine Teilauflösung von `21676dae…`, während `85eda551…` offen bleibt. Zudem akzeptiert der Synthesevalidator zwei `revise`-Urteile ausdrücklich nicht als aktuelle Textfreigabe. Die vorhandenen Urteile bleiben als Begründung für die bereits ausgeführte Textkorrektur erhalten; ihre Fingerprints werden nicht auf den neuen Text umgebunden.

## Nächster fachlicher Schritt

1. Einen neuen, aktuellen D-Batch für beide Zielseiten aus dem jetzigen Kanon und Lernzielbuch vorbereiten. `21676dae…` kann inhaltlich unverändert bleiben; `85eda551…` verwendet den bereits integrierten eindeutigen DE/EN-Text. Zwei voneinander unabhängige Runden müssen **diese aktuellen Seiten** prüfen, einschließlich Richtung der Zuordnung `F′ = f`, Tangentensteigung, Vorzeichen, Nullstellen und tatsächlich eigenständiger graphischer Leistung. Dissens begründet auflösen; erst dann Synthese, Resolution und zentrale Registrierung.
2. Die vorhandenen primären Lernzielbilder bleiben separate V-Nachweise. Beim zweiten Bild ist insbesondere zu prüfen, dass die Kurve `F(x)=x²` und die Gerade `f(x)=2x` mathematisch und auf Mobilbreite verständlich verbunden sind; die Illustration ist weder neue Reviewfreigabe noch Ersatz für eine eigenständige Zeichnung. Die Bildbytes müssen nicht allein wegen der Textpräzisierung geändert werden.
3. Die BW-Prüfung `22842d80-de9d-5dad-9819-6ae6e9ca61be` steht im **aktuellen** Kanon bereits auf `released` und verlangt zwei gezeichnete Ableitungsgraphen zu getrennten SVG-Stimuli. Ihr bestehender Quellen- und Rubrikvertrag prüft 12 Punkte, Bestehen ab 11 sowie beide Zeichnungen und Tangentenbegründung. Der ältere Kandidatenhinweis mit `needs_review` ist hierfür überholt. Vor einer weitergehenden Host-/Lernenden-Aussage sind Darstellung beider SVGs, Foto-/Zeichnungsabgabe und Korrektur unter realen Bedingungen getrennt zu testen; dieser D-Batch behauptet das nicht.

Die zentrale M7-Prüfung zählte vor weiterer Bearbeitung `772/799` streng vollständige Matheziele (D `772`, P `794`, A/M/V je `799`). Beide hier behandelten Ziele sind unter den 27 D-offenen Zielen. Diese Notiz hebt keinen Gate-Status an.
