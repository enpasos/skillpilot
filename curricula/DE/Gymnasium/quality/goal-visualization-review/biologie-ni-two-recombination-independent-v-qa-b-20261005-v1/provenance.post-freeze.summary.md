# Getrennte Herkunftsprüfung nach dem eigenen Bild-Freeze

Die Herkunftsprüfung begann **nach** `visual-verdict.freeze.json` (04:25:28 UTC). Der darin eingefrorene unabhängige Bildbefund und seine Dateien wurden nicht verändert. Root-V-Berichte und fremde Bildurteile wurden auch anschließend nicht gelesen.

Für die Verteilungsillustration wurden ausschließlich der tatsächliche `generation-observed-terminal-v1.receipt.json`, `generation-request-v1.json` und `prompt-provider-v1.txt` gelesen. Für den Abschnittsaustausch waren es die entsprechenden tatsächlichen v2-Dateien. Ihre unveränderten Kopien liegen mit den Präfixen `provenance.assortment.*` und `provenance.segment-exchange.*` in diesem eigenen Ordner.

Beide terminalen Receipts nennen **OpenAI / ChatGPT-Codex image_gen** und erklären ausdrücklich, dass die genaue Bildmodellversion nicht offengelegt ist. Deshalb bleiben Modellname und Modellversion im eigenen Herkunftsbericht null. Die Kandidatenbezeichnungen v1/v2 bezeichnen Artefaktrevisionen und sind keine Modellversionen. Der Austausch-v2-Receipt dokumentiert einen tatsächlichen Edit-Auftrag mit einem bestehenden Referenzbild; der Verteilungs-v1-Receipt dokumentiert den erfüllten ursprünglichen Bildaufruf.

Die aktuell angegebene Bildausgabe für Verteilung ist:

`/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-baff7a35-a174-415f-91ad-579b6c020163.png`

Ihre tatsächlichen Bytes stimmen mit der Root-Kandidatenkopie und der eigenen eingefrorenen Kopie überein: SHA-256 `b5d4a97321d099b727353cd6d9b987e58c0ab85c9b89f102e928aeba96780281`.

Die aktuell angegebene Bildausgabe für Austausch ist:

`/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-25de887e-4c4a-4e23-9722-67c1b3fd810c.png`

Ihre tatsächlichen Bytes stimmen ebenfalls mit Root-Kandidatenkopie und eigener eingefrorener Kopie überein: SHA-256 `ab83ba181e54828121db484db27fc20525158438a7e9a2d5a82c286db0bae8a9`.

Die beiden nativen Dateien messen tatsächlich 1672 × 941 Pixel. Die vier tatsächlichen Vorschaudateien stimmen mit ihren Receipt- und eigenen Sichtprüfungs-Hashes überein. Request und exakter Receipt-Request sind identisch; die Promptdateien stimmen, abgesehen vom abschließenden Dateizeilenumbruch, mit dem verwendeten Prompttext überein. Die Aufträge verlangen und die tatsächlichen Bilder besitzen einen undurchsichtigen Hintergrund.

Der im v2-Receipt referenzierte frühere Austauschversuch `biologie-ni-chromatid-segment-exchange-candidate-20261005-v1/candidate-v1.png` ist weiterhin vorhanden. Sein tatsächlicher SHA-256 `63176209aeed89c6733b167d7e37eff96abbc7a89bd9c1019ac88427465dfde4` stimmt mit dem historischen Receipt-Verweis überein. Für diese Erhaltungsprüfung wurden seine Bytes gehasht, jedoch sein Bildinhalt nicht geöffnet oder neu bewertet. Historische Prompts und Receipts wurden nicht verändert.

Das ist eine belegte Konsistenzprüfung der vorliegenden lokalen Herkunftskette. Sie erfindet keine nicht offengelegte Modellversion und verleiht keine operative Adoption, Book-D2-Abnahme oder menschliche Freigabe. Die Receipt-Felder mit prospektiven Goal-IDs sind keine Behauptung, die aktuellen Null-ID-Templates seien schon kanonisch aufgenommen.

`provenance.post-freeze.review.json` enthält sämtliche exakten Ursprungs-, Kandidaten-, Kopier- und Receipt-Pfade, Hashes, tatsächlichen Prüfungen und Grenzen. `provenance.freeze.json` bindet diesen späteren Herkunftsbericht getrennt vom früheren Bildurteil.
