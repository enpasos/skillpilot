# Ergänzende Kontextanker für die Synthese

Das maschinell gebundene D-Paket ist `batch-manifest.json` mit den beiden
unveränderten kanonischen Zielen und ihren aktuellen Seiten in `bundle/`.
Diese Notiz liefert zusätzliche, **nicht in den Paketfingerprint einbezogene**
Quellen-, Bild- und P-Anker. Sie ist keine dritte Reviewrunde und keine
D-, P-, V- oder menschliche Freigabe. A und B prüfen unabhängig ihre jeweils
eigenen gebundenen Eingaben.
Die unten verkürzten Pfade beginnen jeweils bei `curricula/DE/Gymnasium/`.

## `aeae526e-b3a4-5a17-b177-351df0307cb9`

- Kanonisch: „Notation adressatengerecht erläutern“, Q4, AB2, K6.1;
  `goalFingerprint` `sha256:3c7764333b2d5185eea9ac17373c521fde536bb0ce94b71450f33dfa0e344288`.
- Provenienz: HE-Oberstufen-Snapshot
  `input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`,
  Quellziel `c72e7a1b-8781-4f76-89ab-619edb9afe11`; die HE-Zuordnung
  `mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json`
  nennt `matchType: exact`. Das amtliche KC-PDF
  `input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`
  nennt K6.1 auf gedruckter S. 24 unter Anforderungsbereich I. Die kanonische
  AB2-Einstufung ist damit eine zu prüfende Modellentscheidung; die Quellenroute
  allein belegt keinen wortgleichen amtlichen Notationssatz.
- Aktives Originalbild:
  `visualizations/mathematik/aeae526e-b3a4-5a17-b177-351df0307cb9/aeae526e-b3a4-5a17-b177-351df0307cb9.jpg`,
  SHA-256 `fd230b4a6ec4071bf78335622e3699a0c73502c8ed3635d84d349f015ca6f287`.
  Die Zeichen um `f`, `3` und `7` in den Sprechblasen sind gepaarte
  Anführungszeichen. Die aktuelle Bild-QA enthält eine KI-Zustimmung zu genau
  diesem Hash; `humanApproved` ist `no`. Die gebundene Reviewseite zeigt
  `review_candidate` und `approvedForPublication: false`.
- P-v2-Kandidatenprofil:
  `quality/goal-evidence/m7-q4-argumentation-communication-p-20260923-v1/image-bound-15.review.jsonl`,
  gleicher Ziel-Fingerprint; `ai_candidate`, `needs_human_review`, E1/G1.
  Zwei voneinander verschiedene Notationsfälle (Funktion/Ableitung und bedingte
  Wahrscheinlichkeit) sind darin als Transfermaterial beschrieben; das Profil
  ist nicht in die neue D-Seite eingebunden.

## `1a18dbb3-f350-4766-9c8b-20ca018ccef1`

- Kanonisch: „Monotonie, Extremstellen und Funktion-Ableitungs-Beziehungen
  untersuchen“, J10, AB2, `semanticAtomic: true`;
  `goalFingerprint` `sha256:9299fdfaf425156492d7d0abc9abebfefb361a6d67992d7c231499176069fcf6`.
- Provenienz: BW-Sek-I-Snapshot
  `input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`,
  Quellziel `3eb6b0db-af4b-4072-991f-81c9e7644257`. Die aktuelle
  BW-Source-Extraction
  `input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`
  trennt Kompetenzen 11 (Monotoniebegriff), 12 (lokal/global), 22
  (Ableitungsuntersuchung) und 23 (Graphen von Funktion und Ableitung).
  Die Zuordnungen in
  `mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`
  sind jeweils `partial`. Daraus folgt keine automatische Entscheidung über
  die semantische Atomarität des kanonischen Sammelziels.
- Aktives Originalbild:
  `visualizations/mathematik/1a18dbb3-f350-4766-9c8b-20ca018ccef1/1a18dbb3-f350-4766-9c8b-20ca018ccef1.jpg`,
  SHA-256 `e86811073adffb07edf396609b50057f7ec5ab58df2edf5af051d84887c8290a`.
  Die dargestellte Parabel `f(x)=-x²+4`, Ableitung `f′(x)=-2x`,
  Vorzeichentabelle und das Maximum bei `x=0` passen zusammen. Die aktuelle
  Bild-QA enthält eine KI-Zustimmung zu diesem Hash; `humanApproved` ist `no`.
  Die gebundene Reviewseite zeigt `review_candidate` und
  `approvedForPublication: false`.
- P-v2-Kandidatenprofil:
  `quality/goal-evidence/m7-j10-unchanged-eleven-retained-20260923-v1/positive-evidence.review.jsonl`,
  gleicher Ziel-Fingerprint; `ai_candidate`, `needs_human_review`, E1/G1.
  Es unterscheidet Ableitungsvorzeichen, lokale Extremstellen und den
  definitionsbereichsabhängigen globalen Vergleich. Sein `dissent` begrenzt
  die Beispiele auf einfache Fälle und verweist auf die offene D-Splitfrage.
  Das Profil ist nicht in die neue D-Seite eingebunden.

Nach A/B bleibt die fachliche Synthese nötig. Eine Textänderung würde neue
kanonische Ziel- und Seitenfingerprints erfordern; diese Datei ändert nichts
an Zieltexten, Bildern oder zentralen Gate-Ledgern.
