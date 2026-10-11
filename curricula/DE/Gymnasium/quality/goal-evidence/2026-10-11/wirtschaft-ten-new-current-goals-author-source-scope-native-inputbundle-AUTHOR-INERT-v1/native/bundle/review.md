# AI review input: Wirtschaftswissenschaften: zehn neue Ziele – aktueller gebundener Beschreibungsreview-Eingang

- Book ID: `de-gym-economics-current346-ten-new-goals-2026-10-11-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:df322d32bed02dc9819880ca7c1916528aa936afa1a15c39a4ff0d45518b5ce9`
- Selected goals: 10

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Marktversagen durch Informationsasymmetrien erklären

- Full learning-goal ID: `a2fa1186-df35-5954-a9a9-e311a55e218f`
- Goal fingerprint: `sha256:0349b9de0efa238332a12b1a2cecac84d5f543cf632efddd293dde4ceea92261`
- Page fingerprint: `sha256:b989c6865b6e529410a4a7c2445356bd9be6a52c526e1457661af385b27dc51c`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität

### Canonical description

Die lernende Person kann an vorgegebenen Fällen erklären, wie ungleich verteilte Informationen vor einem Geschäft über Auswahl- und Teilnahmeentscheidungen eine effiziente Marktlösung beeinträchtigen können, und die entscheidenden Informations- und Anreizbedingungen benennen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/a2fa1186-df35-5954-a9a9-e311a55e218f/a2fa1186-df35-5954-a9a9-e311a55e218f.png

- original digest: `sha256:ef23ad55008886722edea68289a837c11c2eed65c1be0a56fe068309b864045e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- E: Drei Marktversagensmechanismen in zwei Fallgruppen unterscheiden — `44555f3b-b9c9-5f86-a118-0bb04d37ef8e` (outside this book)
- E: Marktveränderung, Konzentration und Marktzugang untersuchen — `e3fd58d1-f16a-523c-ad64-7c0b3be5e366` (outside this book)
- E: Informationsauswahl vor Verträgen materialgestützt erklären — `fac37707-bd32-506f-a4ec-a95d8d333bed` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5cea3942f39fee861cb1574c5eaeff57e5c121a39dadaa58ee01f1e6f1cf00c0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `hidden-information-selection`
  - Essential understanding (DE): Vorvertraglich verborgenes Wissen über Qualität oder Risiko kann bei gemeinsamer Bewertung Teilnahme verändern und vorteilhafte Geschäfte verdrängen. Erforderlich sind die konkreten Wissens-, Preis- und Teilnahmebedingungen; ungleiches Wissen allein genügt nicht.
  - Essential understanding (EN): Pre-contract hidden quality or risk can change participation under pooled pricing and displace beneficial trades. Specific information, price and participation conditions matter; unequal knowledge alone is insufficient.
  - Observable performance (DE): Die Person erklärt an neuen vorgegebenen Fällen die Informationsverteilung, gemeinsame Bewertung, Teilnahmeauswahl und mögliche Rückkopplung; sie prüft die Informationsursache anhand der gegebenen Bedingungen und grenzt vorvertragliche Auswahl von einem nicht gegebenen nachvertraglichen Verhaltenswechsel ab.
  - Observable performance (EN): The learner explains information distribution, pooled valuation, participation selection and possible feedback in new supplied cases, tests the information cause using the given conditions and distinguishes pre-contract selection from a post-contract behavioural change that is not stipulated.

**Coverage expectations**

- required expectations: `hidden-information-selection`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hidden-attribute`: Verborgene Leistungsqualität versus verborgenes vorvertragliches Risiko. / Hidden service quality versus hidden pre-contract risk.
- `information-verification`: Gemeinsame Bewertung versus glaubwürdig überprüfbare getrennte Information. / Pooled valuation versus credibly verifiable differentiated information.
- `participation-direction`: Gute Anbieter ziehen sich zurück; günstige Nachfragerrisiken verlassen den Pool. / High-quality providers withdraw; low-risk buyers leave a pool.

**Application cases**

- `hidden-repair-quality-selection`
  - Task demand (DE): Fiktiver Reparaturdienstmarkt: Werkstätten kennen vor Vertrag, ob ihre Reparatur dauerhaft oder nur kurz wirksam ist; Kundschaft kann dies nicht prüfen. Für eine dauerhafte Reparatur beträgt der Kundennutzen120 EUR, für eine kurze40 EUR. Bei anfangs gleichen Anteilen bietet Kundschaft höchstens80 EUR. Dauerhaft reparierende Werkstätten benötigen mindestens90 EUR, kurz reparierende mindestens20 EUR. Erkläre Auswahl und mögliche nicht zustande kommende vorteilhafte Geschäfte. Was würde eine glaubwürdig überprüfbare Qualitätsbescheinigung an genau diesem Mechanismus ändern?
  - Task demand (EN): Fictional repair-service market: providers know whether a repair lasts or only works briefly; customers cannot verify this before contracting. Customer value isEUR120for lasting andEUR40for brief repair. With initially equal shares, customers offer at mostEUR80. Lasting-repair providers require at leastEUR90and brief-repair providersEUR20. Explain selection and potentially forgone beneficial transactions. How would credibly verifiable quality certification change this particular mechanism?
  - Expected performance (DE): Die Kundschaft sieht nur die gemischte erwartete Leistung und bietet80. Das liegt unter90 der dauerhaften, aber über20 der kurzen Anbieter: Dauerhafte Reparaturen können aussteigen, kurze bleiben. Die erwartete Qualität kann sinken und weitere Preis-/Teilnahmerückkopplung entstehen. Eine dauerhafte Reparatur hätte mit120 Nutzen und90 Mindestpreis ein mögliches vorteilhaftes Geschäft; die fehlende Unterscheidbarkeit verhindert es möglicherweise. Glaubwürdige Qualitätsbescheinigung erlaubt getrennte Bewertung/Angebote und bearbeitet die Informationsursache. Eine Garantie vollständigen Zusammenbruchs oder die Behauptung, jeder Wissensunterschied sei ineffizient, folgt nicht.
  - Expected performance (EN): Customers offer80for pooled expected quality. This is below90required by lasting-repair providers but above20for brief repairs, so good providers may withdraw while poor ones remain. Expected quality and offers can fall further. A lasting repair valued at120with a minimum price90could support a beneficial trade that hidden quality may prevent. Credible certification allows separate valuation and addresses the information cause. Total collapse or inefficiency from every knowledge difference is not established.
  - Understanding focus (DE): Verborgene Leistungsqualität verändert Teilnahme; Vergleich mit überprüfbarer Qualität prüft die tatsächliche Ursache.
  - Understanding focus (EN): Hidden service quality changes participation; verifiable-quality contrast tests the actual cause.
- `hidden-risk-insurance-selection`
  - Task demand (DE): Fiktiver Versicherungsmarkt ohne Verwaltungskosten: Personen kennen ihr individuelles Risiko, der Versicherer vor Vertrag nur die Hälfte niedriger und die Hälfte hoher Risiken. Erwartete Kosten sind100 beziehungsweise500 EUR, daher gemeinsame Prämie300 EUR. Niedrigrisikopersonen zahlen höchstens160 EUR, Hochrisikopersonen höchstens560 EUR. Erkläre, wer zunächst aussteigen kann und wie sich der verbleibende Durchschnitt verändert. Vergleiche mit glaubwürdig überprüfbaren Risiken und risikogerechten Prämien100/500. Ein Verhaltenswechsel nach Vertrag ist ausdrücklich nicht gegeben.
  - Task demand (EN): Fictional insurance market without administration costs: individuals know their risk, the insurer before contracting only an equal low/high-risk mix. Expected costs areEUR100andEUR500, yielding a pooled premiumEUR300. Low-risk clients pay at most160and high-risk clients560. Explain initial exit and the remaining average. Compare with credibly verifiable risks and premiums100/500. Changed behaviour after contracting is explicitly absent.
  - Expected performance (DE): Bei300 steigen niedrige Risiken mit Zahlungsgrenze160 aus, hohe können bleiben. Der verbleibende erwartete Aufwand kann auf500 steigen; eine entsprechend höhere gemeinsame Prämie verstärkt die Auswahl nach Teilnahme, statt den ursprünglichen Durchschnitt zu halten. Risikoabhängige Prämien100/500 wären bei den gegebenen Grenzen für beide Gruppen akzeptabel; die fehlende Beobachtbarkeit kann also mögliche beidseitig tragfähige Verträge verdrängen. Der Mechanismus ist vorvertragliche Auswahl durch verborgenes Risiko, kein gegebener nachvertraglicher Verhaltenswechsel und keine Firmenfusion.
  - Expected performance (EN): At300, low risks with a160limit leave while high risks may remain. Remaining expected cost can rise to500; a higher pooled premium reflects selection rather than maintaining the initial average. Premiums100/500would fit both groups’ stated limits if risks were verifiable, so hidden risk can displace mutually feasible contracts. The mechanism is pre-contract selection through participation, not stipulated post-contract behaviour or a merger.
  - Understanding focus (DE): Andere Informationsart und Teilnahmeentscheidung übertragen denselben vorvertraglichen Auswahlmechanismus.
  - Understanding focus (EN): A different hidden attribute and participation setting transfer the same pre-contract selection mechanism.
## Page 2: Bereitstellungsprobleme öffentlicher Güter erklären

- Full learning-goal ID: `df17fd21-e9b7-598f-970e-8f541d059694`
- Goal fingerprint: `sha256:aa63edcf7784cb37e216f50fb3aecb2d2302259c837c2e51786084960bbcf8c5`
- Page fingerprint: `sha256:760497df51a8638cce69bd2a575f8d22ac1f21d6edb7ff64cdb856951a4938af`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität

### Canonical description

Die lernende Person kann an vorgegebenen Fällen Nicht-Rivalität und Nicht-Ausschließbarkeit erkennen und erklären, wie daraus bei freiwilliger einzelner Finanzierung Trittbrettfahrer und eine mögliche Unterbereitstellung entstehen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/df17fd21-e9b7-598f-970e-8f541d059694/df17fd21-e9b7-598f-970e-8f541d059694.png

- original digest: `sha256:a0fee5cb7b395c2718b59ba85547acd25ba4444e324d5c8c6dddec5a2b8f8897`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- E: Drei Marktversagensmechanismen in zwei Fallgruppen unterscheiden — `44555f3b-b9c9-5f86-a118-0bb04d37ef8e` (outside this book)
- E: Öffentliche Güter und freiwillige Bereitstellung erklären — `c9f3e65d-f97a-5390-ac7e-32f92a96da8e` (outside this book)
- E: Marktveränderung, Konzentration und Marktzugang untersuchen — `e3fd58d1-f16a-523c-ad64-7c0b3be5e366` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e673fdfa372c666ec6053ff09dd0d2e7d89f5edc87d858156607b9371222e81d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `public-good-provision`
  - Essential understanding (DE): Nicht-Rivalität und Nicht-Ausschließbarkeit können bei freiwilliger einzelner Finanzierung Trittbrettfahren und Unterbereitstellung verursachen, auch bei positivem Gesamtnutzen. Öffentlicher Zweck allein bestimmt diese Eigenschaften nicht.
  - Essential understanding (EN): Non-rivalry and non-excludability can cause free-riding and underprovision under voluntary individual funding despite positive aggregate benefit. Public purpose alone does not establish those properties.
  - Observable performance (DE): Die Person begründet an neuen vorgegebenen Fällen Nicht-Rivalität und Nicht-Ausschließbarkeit, verbindet sie mit individuellen Beitragsanreizen und möglicher Unterbereitstellung und grenzt gegebene rivalisierende beziehungsweise ausschließbare Leistungen anhand ihrer tatsächlichen Nutzungseigenschaften ab.
  - Observable performance (EN): The learner establishes non-rivalry and non-excludability in new supplied cases, links them to individual contribution incentives and possible underprovision, and distinguishes supplied rival or excludable services by their actual use characteristics.

**Coverage expectations**

- required expectations: `public-good-provision`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `use-property`: Hörbares Signal versus frei kopierbare Übersicht bei explizit unverdrängter Nutzung. / Audible signal versus freely copied map with explicitly undiminished use.
- `excludability-rivalry-boundary`: Nichtzahlende nutzen mit; knappe reservierte Plätze sind rival und ausschließbar. / Non-payers share use; scarce reserved spaces are rival and excludable.
- `individual-versus-total-benefit`: Individueller Beitragsanreiz versus Summe des Nutzens und volle Bereitstellungskosten. / Individual contribution incentive versus aggregate value and total provision cost.

**Application cases**

- `shared-night-warning-funding`
  - Task demand (DE): Fiktives Tal: Ein nächtliches Warnsignal ist nach Bereitstellung für36 Personen hörbar. Ein zusätzlicher Hörer beeinträchtigt niemandes Empfang, und Nichtzahlende können im Modell nicht ausgeschlossen werden. Bereitstellung kostet1.200 EUR; jede Person bewertet den Nutzen mit40 EUR. Es gibt keine verbindliche gemeinsame Finanzierung, nur freiwillige Beiträge. Erkläre, warum die Gruppe trotz Gesamtnutzen1.440 EUR die Finanzierung verfehlen kann. Was ist an der Aussage falsch, der Nutzenüberschuss garantiere freiwillige Bereitstellung?
  - Task demand (EN): Fictional valley: once provided, a night-warning signal reaches36people. An extra listener reduces nobody’s reception and non-payers cannot be excluded. Provision costsEUR1,200; each person values it at40. Funding uses only voluntary contributions with no binding joint arrangement. Explain why funding may fail despite total benefit1,440. Why does positive aggregate net benefit not guarantee voluntary provision?
  - Expected performance (DE): Zusätzliche Hörer verdrängen niemanden: nicht rival. Nichtzahlende erhalten das Signal dennoch: nicht ausschließbar. Eine Person kann ihren Beitrag sparen und auf Beiträge anderer hoffen; ihr individueller Nutzen40 deckt die volle Bereitstellung nicht. Freiwillige Mittel können deshalb unter1.200 bleiben, obwohl1.440 größer als1.200 ist. Das ist ein möglicher Trittbrettfahrer-/Unterbereitstellungsmechanismus; tatsächlicher Ausfall ist ohne Beitragsdaten nicht sicher. Positive Gesamtbewertung allein erzeugt keine verbindliche Finanzierung.
  - Expected performance (EN): Use is non-rival because extra listeners displace nobody and non-excludable because non-payers receive the signal. Individuals can save contributions while hoping others pay; a personal benefit40does not cover total provision cost. Voluntary funding can remain below1,200despite total benefit1,440. This is a possible free-rider/underprovision mechanism, not certain failure without contribution data. Aggregate value alone does not create binding funding.
  - Understanding focus (DE): Individuelle Beitragsanreize und kollektiver Nutzen werden aus expliziten Gütereigenschaften getrennt.
  - Understanding focus (EN): Individual contribution incentives and collective value are separated using explicit goods characteristics.
- `open-map-versus-booked-space`
  - Task demand (DE): Zwei fiktive Leistungen für dieselbe Nachbarschaft: A ist eine frei kopierbare Übersicht über geöffnete öffentliche Wege. Weitere Nutzende mindern die Nutzung anderer nicht; Nichtzahlende dürfen die fertige Übersicht ebenfalls nutzen und kopieren. Erstellung kostet500 EUR,20 Personen bewerten sie je mit30 EUR. B sind zehn knappe, nur mit bezahlter Reservierung zugängliche Fahrradabstellplätze. Erkläre für A die mögliche Unterbereitstellung bei freiwilliger einzelner Finanzierung. Begründe anhand der Eigenschaften, warum B nicht denselben Trittbrettfahrermechanismus besitzt, obwohl beide Leistungen der Nachbarschaft dienen.
  - Task demand (EN): Two fictional neighbourhood services: A is a freely copied map of open public paths. Extra users do not reduce others’ use; non-payers may use/copy it. Creation costsEUR500and20people each value it at30. B comprises ten scarce bicycle-storage spaces accessible only with a paid reservation. Explain possible underprovision of A under voluntary individual funding. Use goods characteristics to explain why B lacks that same free-rider mechanism even though both serve the neighbourhood.
  - Expected performance (DE): A ist im gegebenen Modell nicht rival und nicht ausschließbar. Jede Person kann die fertige Übersicht ohne Zahlung bekommen; freiwillige Beiträge können daher unter500 bleiben, obwohl der Gesamtnutzen600 beträgt. B ist wegen zehn Plätzen rival und durch bezahlte Reservierung ausschließbar: Ein Nichtzahler kann nicht denselben garantierten Nutzen eines belegten Platzes mitnehmen. Fehlende Nachfrage oder andere Bereitstellungsprobleme bei B wären möglich, aber nicht die hier beschriebene Nicht-Ausschließbarkeitsursache. Öffentliche Zwecksetzung entscheidet nicht über den ökonomischen Gütertyp.
  - Expected performance (EN): A is non-rival and non-excludable under the model. Non-payers can obtain the completed map, so voluntary contributions may fall below500despite aggregate value600. B is rival because capacity is ten and excludable through paid reservations; non-payers cannot freely receive a reserved space’s use. Other demand/provision problems may occur for B, but not this non-excludability mechanism. Serving a public purpose does not determine economic goods properties.
  - Understanding focus (DE): Transfer vom hörbaren Signal zur kopierbaren Information; Rivalität und Ausschließbarkeit begrenzen die Erklärung.
  - Understanding focus (EN): Transfer from an audible signal to copyable information; rivalry and excludability delimit the explanation.
## Page 3: Anbieterverhalten aus Marktbedingungen ableiten

- Full learning-goal ID: `ec1e8644-bd6d-53ef-a154-9a6efb69e1c7`
- Goal fingerprint: `sha256:83b085476c4d62747c66642086c764fbabe9d7f075c073e01e73fa84f6ff1b2d`
- Page fingerprint: `sha256:6d7fb4dddc780aeb4b55f2d30fe02a7482ed03fe8f897ef12e0dee861ac33242`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität > Weitere Anbieter- und Diagrammkompetenzen im Marktmodell

### Canonical description

Die lernende Person kann aus der Anbieterstruktur und gegebenen Bedingungen zu Produktgleichheit, Information, Ausweichmöglichkeiten und Marktzutritt ableiten, welchen Preis- und Absatzspielraum Anbieter in einem vorgegebenen Markt haben, und die Ableitung beim Wechsel einer maßgeblichen Bedingung begründet anpassen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/ec1e8644-bd6d-53ef-a154-9a6efb69e1c7/ec1e8644-bd6d-53ef-a154-9a6efb69e1c7.png

- original digest: `sha256:6b8698f0d17bd808fa3d81afc839aa7a0eb90dbb134b9cf8f0da09495097ac74`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Unvollkommenes Polypol im Preis-Mengen-Diagramm darstellen — `8820a8d9-605a-565b-bc13-1961a4df60ed` (page 4)
- Gewinnwirkungen von Preisdifferenzierung diskutieren — `646c5663-bf14-5b4a-893e-be01df701d54` (page 5)

### Prerequisites outside this book

- Marktformen anhand der Anbieterstruktur einordnen — `273809d9-bc31-5c1b-8a58-149dd61d2ba0` (outside this book)

### Direct reverse prerequisites outside this book

- Markt und Preis mit gewählter Marktsteuerung selbstständig bearbeiten — `38b58eb0-ff40-5209-a872-797910ddab5f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8ffde53d4a6dabb62579d5fa7b591913c924ae86e65882ab39f83d2a6899b4b4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `supplier-behaviour`
  - Essential understanding (DE): Anbieterverhalten hängt von Struktur und konkret wirksamen Wettbewerbsbedingungen ab; Firmenzahl allein trägt keine Preis-/Absatzprognose.
  - Essential understanding (EN): Supplier behaviour depends on structure and effective competition conditions; count alone cannot predict pricing or sales.
  - Observable performance (DE): Die lernende Person kann aus der Anbieterstruktur und gegebenen Bedingungen zu Produktgleichheit, Information, Ausweichmöglichkeiten und Marktzutritt ableiten, welchen Preis- und Absatzspielraum Anbieter in einem vorgegebenen Markt haben, und die Ableitung beim Wechsel einer maßgeblichen Bedingung begründet anpassen.
  - Observable performance (EN): The learner can derive suppliers’ pricing and sales scope from supplier structure and supplied conditions concerning product similarity, information, alternatives and market entry, and revise the reasoning when a decisive condition changes.

**Coverage expectations**

- required expectations: `supplier-behaviour`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-model-change`: Die zwei ausgeformten Materialien ändern maßgebliche Bedingungen: Ausweichbarkeit/Eintritt statt bloß andere Produktnamen. / The written materials change decisive conditions: switching/entry rather than only product names.
- `bounded-inference`: Neue begründete Materialvariation innerhalb einer umfassenden Leistung kann eigenständige Evidenz tragen; keine Pflicht, beide Beispielaufgaben abzuarbeiten. / A reasoned fresh material variation within one substantial performance can provide independent evidence; no obligation to complete both examples.

**Application cases**

- `homogeneous-bolts-versus-differentiated-repair`
  - Task demand (DE): Alle Angaben sind fiktive Modellannahmen. Markt A:40 unabhängige kleine Schraubenanbieter verkaufen identische Schrauben; Kundschaft kennt alle Preise, kann ohne Zusatzkosten wechseln, neue Anbieter können eintreten. Ein Anbieter verkauft bei Marktpreis2 EUR bis zur eigenen Kapazität; bei einem Preis über2 wechseln seine Käufer vollständig. Markt B:40 unabhängige Reparaturdienste unterscheiden sich durch Lage, Öffnungszeiten und überprüfbare Leistung. Käufer kennen veröffentlichte Preise, Wechsel kostet Zeit. Für einen Dienst sind20 EUR/30Aufträge,22 EUR/24Aufträge und24 EUR/17Aufträge gegeben. Leite für A und B möglichen Preis- und Absatzspielraum aus mehreren Bedingungen ab. Darf man aus40Anbietern gleiche Preisnehmerrolle ableiten? Erkläre anschließend die Wirkung, wenn in B alle Leistungen austauschbar werden und Wechselkosten entfallen; kein Preis oder Gewinn außerhalb der Angaben ist zu erfinden.
  - Task demand (EN): All facts are fictional model assumptions. Market A has40 independent small bolt suppliers selling identical products; buyers know all prices and switch at no extra cost; entry is open. A seller can sell up to capacity at the market price of2 euros but loses all buyers above2. Market B has40 independent repair services differentiated by location, opening hours and verifiable service. Buyers know published prices but switching takes time. One firm has supplied price/order options20/30,22/24 and24/17. Derive pricing and sales scope in A/B from several conditions. Does40 sellers imply identical price-taking? Then explain the change if B’s services become interchangeable and switching costs disappear; invent no unsupplied price or profit.
  - Expected performance (DE): Beide Märkte sind nach Anbieterzahl Polypole. In A machen Produktgleichheit, vollständige Preiskenntnis und kostenloses Wechseln einen eigenen Aufschlag nicht tragfähig; Eintritt begrenzt zusätzlich dauerhafte Sonderstellungen. Der einzelne Anbieter nimmt2 EUR hin, seine Mengenentscheidung bleibt kapazitätsgebunden. In B besteht trotz vieler Anbieter begrenzter eigener Preisspielraum: bei22 bleiben24Aufträge, bei24 noch17. Differenzierung und Wechselaufwand verhindern vollständiges Ausweichen, ohne unbegrenzte Marktmacht zu schaffen.40 allein erklärt die unterschiedlichen Reaktionen nicht. Werden Produkte austauschbar und Wechselkosten beseitigt, schwindet unter den gegebenen Informationsannahmen dieser Spielraum; ein höherer eigener Preis verliert Kundschaft an Alternativen. Ein konkreter neuer Marktpreis oder optimaler Gewinn ist nicht gegeben.
  - Expected performance (EN): Both are many-supplier markets by seller count. In A homogeneous products, complete price knowledge and costless switching make an individual markup unsustainable; entry additionally limits durable special positions. The seller takes2 euros as given and chooses sales within capacity. In B differentiation and switching effort provide limited pricing scope despite many firms:24 orders remain at22 and17 at24. Alternatives still constrain the firm, so scope is not unlimited. Forty sellers alone does not explain the contrast. Making services interchangeable and removing switching costs eliminates this source of pricing scope under the given information assumptions; buyers can leave a higher-priced seller. No new equilibrium price or profit optimum is supplied.
  - Understanding focus (DE): Anbieterzahl mit mehreren konkreten Wettbewerbsbedingungen zu einer Verhaltensableitung verbinden.
  - Understanding focus (EN): Link seller count and multiple competitive conditions to a behavioural inference.
- `three-suppliers-entry-and-switching-change`
  - Task demand (DE): Fiktiver Baustoffmarkt: Drei voneinander unabhängige Firmen verkaufen denselben Baustoff. Preise aller Firmen sind sichtbar. Anfangs haben Kunden lange bindende Lieferverträge; neue Anbieter benötigen eine knappe Zulassung. Eine Firma kann deshalb einige bestehende Kunden bei einem begrenzten Aufschlag halten; die Reaktionen der anderen beiden Firmen sind nicht gegeben. Die neue Modellregel beendet die Vertragsbindung und erlaubt kurzfristigen Markteintritt zusätzlicher Lieferanten. Bestimme die Anbieterform im alten Zustand und leite einen bedingten Preis-/Absatzspielraum ab. Begründe, was sich mit Wechsel und Eintritt verändert. Prüfe die Behauptungen: Drei Firmen beweisen eine Absprache; nach der Reform folgt zwingend ein bestimmter gemeinsamer Preis. Es ist keine konkrete Spieltheorie- oder Kartellrechtskenntnis vorausgesetzt.
  - Task demand (EN): Fictional building-material market: three independent firms sell the same material and all prices are visible. Initially buyers have long binding supply contracts and entrants need a scarce licence. A firm can retain some customers after a limited markup; rivals’ reactions are unspecified. A new model rule ends contractual lock-in and permits quick entry of extra suppliers. Classify the initial supplier structure and derive conditional pricing/sales scope. Explain what changes with switching and entry. Assess: three firms prove coordination; the reform necessarily produces a particular common price. No game-theory or actual cartel-law recall is needed.
  - Expected performance (DE): Anfangs liegt nach Anbieterzahl ein Oligopol vor. Vertragsbindung und Zulassungsengpass stützen einen begrenzten Aufschlag trotz Produktgleichheit und sichtbarer Preise; die anderen Firmen und mögliche Reaktionen begrenzen ihn, sind aber nicht quantifiziert. Das Ende der Bindung erleichtert Ausweichen; zusätzlicher Eintritt erweitert Alternativen und schwächt den alten Preisspielraum. Ob daraus ein Polypol wird, hängt von der tatsächlichen späteren Anbieterzahl ab. Drei unabhängige Anbieter sind kein Beleg für eine Absprache. Ohne Nachfrage-, Kosten- und Reaktionsdaten folgt kein bestimmter neuer gemeinsamer Preis. Eine schlüssige bedingte Ableitung genügt, keine erfundene Gleichgewichtsrechnung.
  - Expected performance (EN): Initially the market is an oligopoly by seller count. Lock-in and scarce entry permission support a limited markup despite homogeneous products and transparent prices; rivals constrain it but their responses are not quantified. Removing lock-in enables switching, and entry expands alternatives, weakening the previous pricing scope. Whether the later market is many-supplier depends on the realised seller count. Three independent sellers do not prove coordination. Without demand, cost and response data no particular common price follows. A coherent conditional inference suffices; no invented equilibrium calculation is warranted.
  - Understanding focus (DE): Verhalten beim Wechsel realer Eintritts-/Ausweichbedingungen anpassen, ohne Absprache oder Zahlen zu erfinden.
  - Understanding focus (EN): Revise behaviour when actual entry/switching constraints change without inventing coordination or numbers.
## Page 4: Unvollkommenes Polypol im Preis-Mengen-Diagramm darstellen

- Full learning-goal ID: `8820a8d9-605a-565b-bc13-1961a4df60ed`
- Goal fingerprint: `sha256:7621164223382dfd316c28869e8b158689c2ee858cccc4656b05477e7243d9e1`
- Page fingerprint: `sha256:2bded417be6af74550619a393a2595c5802945be2a1cfc040669812fede3070f`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität > Weitere Anbieter- und Diagrammkompetenzen im Marktmodell

### Canonical description

Die lernende Person kann für ein vorgegebenes Modell eines unvollkommenen Polypols die Preis-Absatz-Beziehung eines einzelnen Anbieters aus Material in einem beschrifteten Preis-Mengen-Diagramm darstellen, von der Gesamtnachfrage unterscheiden und die gezeigte Form mit den gegebenen Marktbedingungen erklären, ohne daraus eine universell gültige Kurvenform abzuleiten.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/8820a8d9-605a-565b-bc13-1961a4df60ed/8820a8d9-605a-565b-bc13-1961a4df60ed.png

- original digest: `sha256:a43ee88a1d2f093f7ae27b22999d6f7ce082cf97a86ea2cb44b416b2be790fa6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Anbieterverhalten aus Marktbedingungen ableiten — `ec1e8644-bd6d-53ef-a154-9a6efb69e1c7` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Markt und Preis mit gewählter Marktsteuerung selbstständig bearbeiten — `38b58eb0-ff40-5209-a872-797910ddab5f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0e4763f23a370ce8dd13c4b05c114f5daa6ea0e53ea88335b85194677f9f6193`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `imperfect-polypol-diagram`
  - Essential understanding (DE): Individuelle Preis-Absatz-Beziehung und Gesamtmarktnachfrage sind verschiedene Modellgrößen; die Kurvenform folgt Materialbedingungen, nicht dem Wort Polypol.
  - Essential understanding (EN): Individual price–sales and aggregate demand are different model quantities; shape follows the material, not the label many-supplier.
  - Observable performance (DE): Die lernende Person kann für ein vorgegebenes Modell eines unvollkommenen Polypols die Preis-Absatz-Beziehung eines einzelnen Anbieters aus Material in einem beschrifteten Preis-Mengen-Diagramm darstellen, von der Gesamtnachfrage unterscheiden und die gezeigte Form mit den gegebenen Marktbedingungen erklären, ohne daraus eine universell gültige Kurvenform abzuleiten.
  - Observable performance (EN): The learner can use supplied material to plot and label an individual supplier’s price–sales relationship in a model of an imperfect many-supplier market, distinguish it from aggregate demand and explain the represented shape through the given market conditions without asserting a universal curve shape.

**Coverage expectations**

- required expectations: `imperfect-polypol-diagram`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-model-change`: Die zwei ausgeformten Materialien ändern maßgebliche Bedingungen: Datenneigung und Änderungsszenario bei identischer Achsenkonvention. / The written materials change decisive conditions: data slopes and change scenarios with the same axis conventions.
- `bounded-inference`: Neue begründete Materialvariation innerhalb einer umfassenden Leistung kann eigenständige Evidenz tragen; keine Pflicht, beide Beispielaufgaben abzuarbeiten. / A reasoned fresh material variation within one substantial performance can provide independent evidence; no obligation to complete both examples.

**Application cases**

- `differentiated-cafes-linear-material`
  - Task demand (DE): Fiktive20Cafés bieten unterschiedliche Lage und Atmosphäre; Preise und Qualität sind bekannt. Das Material beschreibt drei getrennte Modellbeziehungen, keine simultane Aggregation der Einzelkurve: Ein Café verkauft bei Preis p=2,3,4,5 EUR die Mengen q=60,45,30,15Becher/Tag. Bei einer gemeinsamen Preisänderung aller Cafés beträgt die Gesamtnachfrage Q=1000,900,800,700Becher/Tag. Als Benchmark eines vollkommenen Polypols wird für einen kleinen Anbieter bei Marktpreis3 eine horizontale Absatzlinie bis q=60 angegeben; oberhalb3 kann er nichts verkaufen. Zeichne die individuelle Café-Preis-Absatz-Beziehung und die gesonderte Gesamtnachfrage mit Menge horizontal und Preis vertikal, passenden Einheiten und unterscheidbaren Skalen. Vergleiche mit der gegebenen Preisnehmer-Benchmark. Erkläre die begrenzte Preisreaktion aus Differenzierung. Darf Q=900 als Einzelabsatz oder eine Knickform als universell verlangt behandelt werden? Tabellen oder genau beschriftete Koordinaten sind als textuelle Diagrammspezifikation zulässig; kein Bild ist Voraussetzung.
  - Task demand (EN): Twenty fictional cafés differ in location and atmosphere, with prices and quality known. The material gives three separate model relationships, not simultaneous aggregation of the individual curve: one café sells q=60,45,30,15 cups/day at p=2,3,4,5 euros. If all cafés’ prices change together, aggregate demand is Q=1000,900,800,700 cups/day. A perfectly competitive benchmark for one small seller is horizontal at market price3 up to q=60; above3 it sells nothing. Plot individual café demand and separate aggregate demand with quantity horizontal, price vertical, units and distinct scales. Compare with the supplied price-taking benchmark. Explain limited price sensitivity through differentiation. Can aggregate900 be individual sales or a kink universally required? Labelled coordinates/tables are accepted as textual diagram specifications; an image is not required.
  - Expected performance (DE): Individuelle Kurve: Achsen q(Becher dieses Cafés/Tag) und p(EUR/Becher); Punkte(60,2),(45,3),(30,4),(15,5), im Modell fallend geradlinig verbunden. Gesamtnachfrage separat: Q(Becher aller Cafés/Tag),p; Punkte(1000,2),(900,3),(800,4),(700,5). Q=900 ist nicht q=45 und die Materialtabellen werden nicht durch20×q künstlich gleichgesetzt, weil sie unterschiedliche Änderungssituationen beschreiben. Die individuelle Preisnehmer-Benchmark verläuft bei p=3 horizontal bis60; sie ist nicht die fallende Gesamtmarktnachfrage eines vollkommenen Marktes. Differenzierung lässt manche Käufer beim höheren Einzelpreis bleiben, sodass eigene Preiswahl mit Absatzverlust verbunden ist. Die konkrete fallende Linie folgt den gelieferten Daten, nicht einer zwingenden universellen Knickkurve. Gewinnoptimum oder Angebotskurve des Cafés sind ohne weitere Daten nicht ableitbar.
  - Expected performance (EN): Individual diagram: horizontal q(cups sold by this café/day), vertical p(euros/cup); points(60,2),(45,3),(30,4),(15,5), connected by the model’s falling straight line. Separate aggregate diagram: Q(all cafés’ cups/day),p; points(1000,2),(900,3),(800,4),(700,5). Aggregate900 is not individual45; multiplying the individual curve by20 would incorrectly equate different change scenarios. The given individual price-taking benchmark is horizontal at3 up to60, not the falling aggregate demand of a perfectly competitive market. Differentiation retains some buyers at a higher individual price, linking own price choice to lower sales. This shape follows supplied observations; no universal kink is required. No profit optimum or café supply curve follows without additional data.
  - Understanding focus (DE): Einzelanbieter-/Gesamtmarktdiagramm und Preisnehmer-Benchmark fachlich trennen.
  - Understanding focus (EN): Distinguish individual/aggregate diagrams and the price-taking benchmark.
- `differentiated-services-piecewise-provided-data`
  - Task demand (DE): Fiktive12Dienste bieten unterschiedliche Abholzeiten. Für einen Dienst ergibt eine Befragung p=8/10/12/14 EUR und q=50/48/25/10Aufträge pro Woche. Für gemeinsame Preisänderungen aller Dienste werden gesondert p=8/10/12/14 und Q=480/420/300/180 angegeben. Im Unterrichtsmodell sind zwischen den Messpunkten gerade Verbindungsstücke erlaubt; außerhalb gibt es keine Daten. Im Preisintervall8→10 ist die individuelle Nachfrage deutlich weniger preissensitiv als im Preisintervall10→12. Stelle beide Beziehungen getrennt dar und erkläre, was die geänderte Neigung im Material zeigt. Unterscheide individuelle Menge48 von Gesamtmenge420. Ein alternatives Modell mit gleichartigen Leistungen und kostenfreiem Wechsel gibt dem einzelnen kleinen Dienst eine horizontale Preisnehmerlinie bei10. Ist eine geknickte oder eine gerade Einzelkurve für jedes unvollkommene Polypol zwingend? Kein strategisches Rivalenreaktionsgesetz ist angegeben.
  - Task demand (EN): Twelve fictional services offer different collection times. One firm’s survey gives p=8/10/12/14 euros and q=50/48/25/10 weekly orders. Separate common price changes across all services give Q=480/420/300/180 at those prices. Straight segments may connect measured points; nothing is supplied outside them. The individual relationship is less price-sensitive over the price interval8→10 than over the price interval10→12. Represent the two relationships separately and explain the change in slope in this material. Distinguish individual48 from aggregate420. A homogeneous, costless-switching benchmark gives a small firm a horizontal price-taking line at10. Must every imperfect many-supplier market have a kinked or straight individual curve? No strategic rival-response rule is supplied.
  - Expected performance (DE): Individuell(q,p): (50,8),(48,10),(25,12),(10,14), korrekt beschriftet stückweise verbunden; aggregiert(Q,p): (480,8),(420,10),(300,12),(180,14) auf gesonderter Mengenskala. Von8 auf10 sinkt q nur2, von10 auf12 um23: die Angaben zeigen unterschiedliche lokale Preisempfindlichkeit, im Diagramm eine Änderung der Neigung.48 ist die Wochenmenge eines Dienstes,420 die Gesamtnachfrage bei gemeinsamer Änderung. Die horizontale individuelle Benchmark bei10 beruht auf Austauschbarkeit und kostenfreiem Ausweichen. Das vorliegende Muster ist datenbedingt; weder ein Knick noch eine Gerade ist eine universelle Pflichtform des unvollkommenen Polypols. Aus den Befragungswerten folgt kein unbezeichnetes Rivalenreaktionsmodell und keine Fortsetzung außerhalb der Tabelle.
  - Expected performance (EN): Individual(q,p) points(50,8),(48,10),(25,12),(10,14) are correctly labelled and joined piecewise; aggregate(Q,p) points(480,8),(420,10),(300,12),(180,14) use a separate quantity scale. Raising price8→10 loses2 orders, while10→12 loses23, showing different local price sensitivity and a slope change.48 is one firm’s weekly sales;420 is aggregate demand under a common price change. The horizontal individual benchmark at10 follows interchangeability and costless switching. This pattern is data-specific; neither a kink nor a straight line is universal for imperfect many-supplier markets. The survey does not establish an unspecified rival-response model or extrapolation beyond the table.
  - Understanding focus (DE): Datenbedingte Kurvenneigung erklären und Grenzen der Formbehauptung einhalten.
  - Understanding focus (EN): Explain data-specific slopes and limit shape claims.
## Page 5: Gewinnwirkungen von Preisdifferenzierung diskutieren

- Full learning-goal ID: `646c5663-bf14-5b4a-893e-be01df701d54`
- Goal fingerprint: `sha256:28d2e877113ee9355fe8f88130c71bff955fc9910cbd2435131e0d7dff4f0db1`
- Page fingerprint: `sha256:a414360c1dd0ec626222bdb3c25bc0ab11d4c183fd133a47b43135eb45561b77`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität > Weitere Anbieter- und Diagrammkompetenzen im Marktmodell

### Canonical description

Die lernende Person kann anhand gegebener gruppenspezifischer Nachfrage, Kosten und Bedingungen für getrennte Preise diskutieren, ob und wie Preisdifferenzierung gegenüber einem einheitlichen Preis den Gewinn verändert, und den Schluss bei veränderten Trennungs-, Weiterverkaufs- oder Zusatzkostenbedingungen begrenzen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/646c5663-bf14-5b4a-893e-be01df701d54/646c5663-bf14-5b4a-893e-be01df701d54.png

- original digest: `sha256:e5bacb8b330d9548e074fc16d2552a4d8978572a973ca963ddfa49e226ee20e9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Anbieterverhalten aus Marktbedingungen ableiten — `ec1e8644-bd6d-53ef-a154-9a6efb69e1c7` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Markt und Preis mit gewählter Marktsteuerung selbstständig bearbeiten — `38b58eb0-ff40-5209-a872-797910ddab5f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b1bb416db7f9241a09c86253c31ef31d5f30982d229d8916090be714c0970b47`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `price-differentiation-profit`
  - Essential understanding (DE): Preisgruppen wirken über tatsächlich verschiedene Mengen und Deckungsbeiträge; Mehrgewinn hängt an durchsetzbarer Trennung, Nachfrage und Zusatzkosten.
  - Essential understanding (EN): Group pricing acts through actual quantities and contribution margins; profit gains depend on enforceable separation, demand and extra costs.
  - Observable performance (DE): Die lernende Person kann anhand gegebener gruppenspezifischer Nachfrage, Kosten und Bedingungen für getrennte Preise diskutieren, ob und wie Preisdifferenzierung gegenüber einem einheitlichen Preis den Gewinn verändert, und den Schluss bei veränderten Trennungs-, Weiterverkaufs- oder Zusatzkostenbedingungen begrenzen.
  - Observable performance (EN): The learner can use supplied group-specific demand, costs and conditions for separate prices to discuss whether and how price differentiation changes profit relative to a uniform price, and qualify the conclusion when separation, resale or additional-cost conditions change.

**Coverage expectations**

- required expectations: `price-differentiation-profit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-model-change`: Die zwei ausgeformten Materialien ändern maßgebliche Bedingungen: kein Mehrgewinn versus echter Vorteil mit veränderter Trennung/Weiterverkauf. / The written materials change decisive conditions: no gain versus a real advantage under changed separation/resale.
- `bounded-inference`: Neue begründete Materialvariation innerhalb einer umfassenden Leistung kann eigenständige Evidenz tragen; keine Pflicht, beide Beispielaufgaben abzuarbeiten. / A reasoned fresh material variation within one substantial performance can provide independent evidence; no obligation to complete both examples.

**Application cases**

- `separable-ticket-groups-profit-and-costs`
  - Task demand (DE): Fiktive Veranstaltung, ohne Kapazitätsengpass: variable Kosten4 EUR je Besuch, gleiche Fixkosten100 EUR. Gruppe A kauft bei p=10 genau10Tickets, bei p=6 genau30; Gruppe B kauft bei10 genau40, bei6 genau50. Nur diese beiden Preise sind zulässig. Einheitlicher Preis gilt für beide Gruppen. Bei getrennten Preisen kann die Zugehörigkeit kostenlos überprüft werden; Weiterverkauf ist im Modell unmöglich. Berechne Gewinn=(Preis−4)×Menge−100 für beide Einheitspreise und für A6/B10. Diskutiere den Gewinnunterschied und seine Bedingungen. Ändere dann nur die Zusatzkosten der Gruppenprüfung auf100 EUR: Ist getrennter Preis noch gewinnsteigernd gegenüber dem besten einheitlichen? Eine allgemeine gesellschaftliche Vorteilhaftigkeit ist aus Gewinn nicht zu behaupten.
  - Task demand (EN): Fictional event with no capacity constraint: variable cost4 euros per visit and the same fixed cost100. Group A buys10 tickets at10 or30 at6; B buys40 at10 or50 at6. Only these two prices are allowed. A uniform price applies to both groups. Group membership can initially be verified at no extra cost and resale is impossible. Compute profit=(price−4)×quantity−100 for each uniform price and A6/B10. Discuss the gain and its conditions. Then change verification cost alone to100: does differentiation still raise profit against the best uniform option? Profit does not establish a general social benefit.
  - Expected performance (DE): Einheitspreis10:50Besuche, Erlös500, variable Kosten200, Gewinn200. Einheitspreis6:80Besuche, Erlös480, variable Kosten320, Gewinn60. Getrennt A6/B10: A liefert(6−4)×30=60, B(10−4)×40=240; abzüglich100Fixkosten ergibt200. Hier gibt es gegenüber dem besten Einheitspreis10 KEINE Gewinnsteigerung:200=200. Mehr Absatz allein reicht nicht. Mit100zusätzlichen Prüfkosten sinkt der Differenzierungsgewinn auf100 und liegt darunter. Gruppentrennung und fehlender Weiterverkauf ermöglichen verschiedene Preise, beweisen aber keinen zusätzlichen Gewinn; Nachfrage/Kosten müssen tatsächlich passen. Gewinn ist keine Gesamtwohlfahrtsrechnung.
  - Expected performance (EN): Uniform10:50 visits, revenue500, variable cost200, profit200. Uniform6:80 visits, revenue480, variable cost320, profit60. Separate A6/B10: A contributes(6−4)×30=60 and B(10−4)×40=240; subtracting100 fixed cost yields200. Differentiation gives NO gain over the best uniform10:200=200; extra sales alone do not suffice. Adding100 verification cost lowers differentiated profit to100. Segmentation and no resale permit separate prices but do not establish a gain; actual demand/costs must support it. Firm profit is not a total-welfare calculation.
  - Understanding focus (DE): Mehr Menge oder verschiedene Preise nicht automatisch mit Mehrgewinn gleichsetzen.
  - Understanding focus (EN): Do not equate extra sales or separate prices automatically with higher profit.
- `course-access-positive-gain-and-resale-limit`
  - Task demand (DE): Fiktiver Kurszugang: variable Kosten2 EUR je Zugang, Fixkosten50 EUR. Zwei überprüfbare Gruppen, kein Kapazitätsengpass: A kauft bei Preis12 genau5, bei6 genau25; B kauft bei12 genau30, bei6 genau35. Nur6 und12 sind zulässig. Bei getrennten Preisen A6/B12 fallen zunächst keine weiteren Kosten an und Zugänge sind personengebunden. Berechne die Gewinne der zwei Einheitspreise und der Trennung. Diskutiere den Vorteil relativ zum besten Einheitspreis. Nun sind Zugänge übertragbar: B kann sämtliche gewünschten30Zugänge von A zu6 erhalten; für den Vergleich gilt insgesamt dieselbe Nachfrage bei einem gemeinsamen effektiven Preis6. Kann man den alten Mehrgewinn halten? Benenne außerdem die höchste zusätzliche Trennungskostenbelastung, bei der die ursprüngliche Trennung noch mindestens so viel Gewinn wie der beste Einheitspreis bringt.
  - Task demand (EN): Fictional course access: variable cost2 per access and fixed cost50. Two verifiable groups with no capacity constraint: A buys5 at12 or25 at6; B buys30 at12 or35 at6. Only6 and12 are allowed. A6/B12 initially has no extra cost and access is tied to the person. Compute both uniform profits and differentiated profit; discuss the gain against the best uniform price. Access then becomes transferable: B can obtain all30 desired accesses from A at6; for this comparison total demand is stipulated to equal demand at a common effective price6. Can the old gain persist? Also identify the largest extra segmentation cost for which initial differentiation still yields at least the best uniform profit.
  - Expected performance (DE): Einheitspreis12:35Zugänge, Gewinn(12−2)×35−50=300. Einheitspreis6:60Zugänge, Gewinn(6−2)×60−50=190. Getrennt: A(6−2)×25=100, B(12−2)×30=300, abzüglich50 ergibt350. Gegenüber dem besten einheitlichen Preis beträgt der Mehrgewinn50. Mit maximal50Zusatzkosten bleibt Gleichstand zu300; darunter ist der Vorteil positiv, darüber nicht. Übertragbarkeit verhindert hier die wirksame Abschottung: B zahlt effektiv6, unter der vorgegebenen neuen Gesamtnachfrage bleibt190 statt350. Der alte Vorteil verlangt durchsetzbare Zuordnung und fehlende Arbitrage; die Aussage gilt für die gegebenen zulässigen Preise, nicht für ein allgemeines kontinuierliches Optimum oder eine Wohlfahrtsrangliste.
  - Expected performance (EN): Uniform12:35 accesses, profit(12−2)×35−50=300. Uniform6:60 accesses, profit(6−2)×60−50=190. Differentiation contributes100 from A and300 from B; subtract50 to get350, a gain of50 over the best uniform price. Extra segmentation cost up to50 preserves at least a tie at300; below50 the advantage is positive. Transferability breaks effective separation: B pays effectively6 and the stipulated common-price demand yields190 instead of350. The gain depends on enforceable group assignment and no arbitrage, and is bounded to the permitted prices, not a continuous optimum or welfare ranking.
  - Understanding focus (DE): Echten Gewinnvergleich mit Kosten- und Weiterverkaufsgrenzen begründet diskutieren.
  - Understanding focus (EN): Discuss an actual profit comparison with cost and resale limits.
## Page 6: Staatseingriffe im Marktmodell analysieren und bewerten

- Full learning-goal ID: `2dea7d3c-cbac-5246-b0b1-6463c8e6dad6`
- Goal fingerprint: `sha256:291ca53ce50225ac39474513613582388f3d0e93c9585733ae1781c3797a8c16`
- Page fingerprint: `sha256:d976241234ae5ee744e0749c8dee6798d55a7b581ca8467ad83470cee1f21270`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > E2 Wachstum & Lebensqualität > Gewählte Marktsteuerung im Diagramm

### Canonical description

Die lernende Person kann einen vorgegebenen staatlichen Preiseingriff im Preis-Mengen-Modell darstellen, daraus Mengen-, Verteilungs- und gegebenenfalls Budgetwirkungen unter den Materialannahmen ableiten und den Eingriff anhand gegebener Ziele und Vollzugsbedingungen begründet bewerten.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/2dea7d3c-cbac-5246-b0b1-6463c8e6dad6/2dea7d3c-cbac-5246-b0b1-6463c8e6dad6.png

- original digest: `sha256:313d75a9679581b52f3d8dabc05a606023ff1842e9dfc6b04b18920dad212d5e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Marktgleichgewicht, Elastizitäten und Gesamtwohlfahrt analysieren — `50e07b86-428c-5f9c-8c7e-0d0669343af5` (outside this book)

### Direct reverse prerequisites outside this book

- Markt und Preis mit gewählter Marktsteuerung selbstständig bearbeiten — `38b58eb0-ff40-5209-a872-797910ddab5f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ecd57e4d01ca6a12fe8d68a44c6772652acef79f68057cc2875737d1240782e8`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `optional-intervention-diagram`
  - Essential understanding (DE): Ein bindender Preiseingriff verändert Nachfrage-/Angebotsmengen und Verteilung; Zielerreichung und gegebenes Budget sind getrennt zu prüfen.
  - Essential understanding (EN): Binding price intervention changes supply/demand and distribution; goals and the stated budget must be assessed separately.
  - Observable performance (DE): Die lernende Person kann einen vorgegebenen staatlichen Preiseingriff im Preis-Mengen-Modell darstellen, daraus Mengen-, Verteilungs- und gegebenenfalls Budgetwirkungen unter den Materialannahmen ableiten und den Eingriff anhand gegebener Ziele und Vollzugsbedingungen begründet bewerten.
  - Observable performance (EN): The learner can represent a supplied public price intervention in a price–quantity model, derive quantity, distribution and where relevant budget effects under the material assumptions, and evaluate it using supplied objectives and implementation conditions.

**Coverage expectations**

- required expectations: `optional-intervention-diagram`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-model-change`: Die zwei ausgeformten Materialien ändern maßgebliche Bedingungen: Knappheit unter Höchstpreis versus Überschuss/Budget unter Mindestpreis. / The written materials change decisive conditions: ceiling shortage versus floor surplus and budget.
- `bounded-inference`: Neue begründete Materialvariation innerhalb einer umfassenden Leistung kann eigenständige Evidenz tragen; keine Pflicht, beide Beispielaufgaben abzuarbeiten. / A reasoned fresh material variation within one substantial performance can provide independent evidence; no obligation to complete both examples.

**Application cases**

- `binding-price-ceiling-shortage`
  - Task demand (DE): Fiktiver Markt, keine aktuellen Rechtsregeln: Nachfrage QD=100−2p, Angebot QS=2p für p=0…50. Tabellen p=10/20/25/30 ergeben QD=80/60/50/40 und QS=20/40/50/60. Ein Höchstpreis20 wird vollständig durchgesetzt; ohne Nebenregeln wird höchstens die angebotene Menge verkauft. Ziele sind niedriger Preis und möglichst viele versorgte Käufer. Stelle Angebot/Nachfrage, Gleichgewicht und Höchstpreis dar; leite Nachfrage, Angebot und Knappheit ab. Bewerte die beiden Ziele getrennt und begrenze Aussagen über tatsächliche Zuteilung an einzelne Personen. Diagramm als Koordinaten-/Tabellenspezifikation ist erlaubt.
  - Task demand (EN): Fictional market with no actual legal rules: QD=100−2p and QS=2p for p=0…50. Prices10/20/25/30 give demand80/60/50/40 and supply20/40/50/60. A ceiling20 is fully enforced; absent further rules at most supplied quantity is sold. Objectives are a low price and serving as many buyers as possible. Represent demand/supply, equilibrium and the ceiling; derive demand, supply and shortage. Evaluate the objectives separately and limit claims about who receives goods. Labelled coordinates/tables are accepted.
  - Expected performance (DE): Im(Q,p)-Diagramm liegt Nachfrage fallend durch(80,10),(60,20),(50,25),(40,30), Angebot steigend durch(20,10),(40,20),(50,25),(60,30); Schnittpunkt(50,25). Horizontale Preisgrenzep=20 liegt darunter: Nachfrage60,Angebot40,Nachfrageüberhang20, maximal40Verkäufe statt50. Für tatsächliche Käufer ist der Preis niedriger; das Ziel hoher Versorgung wird im gegebenen Angebotsmodell verfehlt. Welche Personen beliefert werden, ist ohne Zuteilungsregel unbekannt. Vollzug ist vorausgesetzt, mögliche Qualitäts-/Langfristfolgen nicht beziffert; kein allgemeines Verbot jeder Preisgrenze folgt.
  - Expected performance (EN): Demand in(Q,p) falls through(80,10),(60,20),(50,25),(40,30); supply rises through(20,10),(40,20),(50,25),(60,30), meeting at(50,25). Horizontal ceiling20 is below equilibrium: demand60, supply40, shortage20, at most40 sales instead of50. Successful buyers pay less, but broad service deteriorates in this supply model. Allocation to particular people is unknown without a rule. Enforcement is stipulated and quality/long-run effects unquantified; no universal rejection of ceilings follows.
  - Understanding focus (DE): Bindende Preisregel aus Diagramm analysieren und an konkreten Zielen bewerten.
  - Understanding focus (EN): Analyse a binding price rule through the diagram and evaluate specific objectives.
- `price-floor-government-purchase-budget`
  - Task demand (DE): Fiktiver Markt: dieselben linearen Regeln QD=100−2p,QS=2p, mit Tabellen p=20/25/30/35: QD=60/50/40/30;QS=40/50/60/70. Statt einer Preisgrenze gilt jetzt ein durchgesetzter Mindestpreis30. Die Modellregierung kauft den gesamten Angebotsüberschuss zum Preis30; Verwaltungs-/Lagerkosten sind unbekannt. Ziele: Produzentenerlös stützen, öffentliche Ausgaben höchstens500 EUR, private Versorgung mindestens45Einheiten. Stelle den Eingriff im Diagramm dar, bestimme private Menge, öffentliche Käufe und Ausgaben und bewerte die Ziele. Erlös ist nicht Gewinn; ohne Regierungsankauf wäre die vermarktete Menge nicht60. Texte und Tabellen genügen als Diagrammspezifikation.
  - Task demand (EN): Fictional market with the same linear rules QD=100−2p,QS=2p. At prices20/25/30/35, demand is60/50/40/30 and supply40/50/60/70. An enforced floor30 replaces the ceiling. The model government buys all excess supply at30; administration/storage costs are unknown. Goals are producer-revenue support, public spending at most500 euros and private service at least45 units. Represent the intervention, calculate private sales, government purchases and spending, and evaluate the goals. Revenue is not profit; without government buying, sold quantity would not be60. Text/tables suffice.
  - Expected performance (DE): Gleichgewicht bleibt(50,25); Preisuntergrenzep=30 darüber. Nachfrage40,Angebot60,Überschuss20. Private Käufer erwerben40,Regierung20; Ausgaben20×30=600 EUR schon vor Lager-/Verwaltungskosten. Produzentenerlös aus60×30=1800 steigt gegenüber50×25=1250, aber Kosten/Nettoertrag sind nicht gegeben. Budgetziel500 wird verfehlt, private Mindestversorgung45 ebenfalls. Das Erlösziel wird unter glaubwürdigem Vollankauf erreicht; ohne Ankauf würden nur40private Einheiten verkauft. Der Eingriff ist anhand dieser Ziele begründet zu beurteilen, nicht als universell immer gut oder schlecht.
  - Expected performance (EN): Equilibrium remains(50,25); floor30 is above it. Private demand40, supply60, excess20: private buyers buy40 and government20, costing20×30=600 before storage/administration. Producer revenue60×30=1800 exceeds50×25=1250, but costs/profit are unspecified. Spending cap500 and private-service minimum45 fail. Revenue support holds if full purchases are credible; without buying only40 private units sell. Evaluate these goals without a universal good/bad claim.
  - Understanding focus (DE): Unterschiedliche Mengen, Transferbudget und Erlös/Gewinn sauber aus Eingriffsmodell trennen.
  - Understanding focus (EN): Distinguish quantities, transfer budget and revenue/profit in an intervention model.
## Page 7: Rechtsstaatsbezogene EU-Haushaltsmaßnahmen prüfen

- Full learning-goal ID: `5aaf5abf-5e70-57c6-b030-1d08a35d17b8`
- Goal fingerprint: `sha256:666b6d8734d12362664d9bd57aa47807576cad4e05d4e6d1f6ddab86519694b3`
- Page fingerprint: `sha256:06935e5c526b8e1d79d44f4e091838224600b5b524df5aa75c00da89faa61353`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Q3 Globalisierung und Außenwirtschaft > Europäische Integration bewerten

### Canonical description

Die lernende Person kann anhand bereitgestellter aktueller Normen in gegebenen EU-Finanzierungsfällen die Voraussetzungen und das Verfahren rechtsstaatsbezogener Haushaltsmaßnahmen prüfen und ihre Verhältnismäßigkeit sowie Pflichten gegenüber Endbegünstigten beurteilen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/5aaf5abf-5e70-57c6-b030-1d08a35d17b8/5aaf5abf-5e70-57c6-b030-1d08a35d17b8.png

- original digest: `sha256:9f0e801f43d5a0108582a1c76cdae3e07cbe48e8380d0ba2de5f6943d69d253a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- Q3: Europäische Integration, Förderung und Konflikte materialgestützt beurteilen — `0b3dbe47-9b98-5540-92e5-a8edf1693b96` (outside this book)
- Q3: Integration: Markt-, Rechtsstaats- und Schuldenkonflikte trennen — `f6bc5493-e138-5717-a027-e0579c80d687` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:95e675f780beebb029210f729ee8aba1dcd4397a74d6a91a7a686e72bab5d0a7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `budget-conditionality-conditions-procedure-proportionality`
  - Essential understanding (DE): Rechtsstaatsbezogene EU-Haushaltsmaßnahmen schützen den Haushalt unter einem bestimmten Rechtsrahmen. Eine festgestellte Rechtsstaatsverletzung muss dessen ordnungsgemäße Finanzverwaltung oder finanzielle Interessen hinreichend direkt beeinträchtigen oder ernsthaft gefährden. Die Kommission prüft Befunde und Abhilfe, der Rat entscheidet im vorgesehenen Verfahren. Umfang und Wirkung der Maßnahme müssen verhältnismäßig sein; die Pflichten gegenüber Endbegünstigten sind anhand des angenommenen Beschlusses und der Norm gesondert zu prüfen.
  - Essential understanding (EN): Rule-of-law measures protecting the EU budget operate within a specific legal framework. An established breach must sufficiently directly affect or seriously risk the budget’s sound financial management or financial interests. The Commission examines evidence and remedies and the Council decides through the prescribed procedure. Measures must be proportionate; obligations towards final beneficiaries must be examined separately using the adopted decision and the rule.
  - Observable performance (DE): Die Person wendet die bereitgestellten aktuellen Artikel 4–6 der Verordnung 2020/2092 auf konkrete Befunde an, verbindet Haushaltsbezug und Verfahrensstand mit einer begründeten möglichen Maßnahme und beurteilt deren Umfang sowie die Endbegünstigtenpflichten. Sie unterscheidet festgestellten Sachverhalt, fehlende urteilsrelevante Information, Kommissionsvorschlag und Ratsbeschluss; eine tragfähige alternative verhältnismäßige Maßnahme ist mit Falldaten gleichwertig.
  - Observable performance (EN): The learner applies supplied current Articles 4–6 of Regulation 2020/2092 to specific findings, links the budget connection and procedural stage to a justified possible measure, and assesses its scope and beneficiary obligations. They distinguish established facts, missing decision-relevant information, Commission proposal and Council decision; a well-supported proportionate alternative grounded in the case is equally valid.

**Coverage expectations**

- required expectations: `budget-conditionality-conditions-procedure-proportionality`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `budget-link-and-finding`: Belegtes ernsthaftes Risiko für ein bestimmtes EU-finanziertes Programm gegenüber allgemeinem Rechtsstaatsbefund ohne belegten direkten Haushaltsbezug. / A documented serious risk to a specific EU-funded programme versus a general rule-of-law finding without a demonstrated direct budget link.
- `procedural-stage-and-remedy`: Abhilfeprüfung und noch ausstehender Ratsbeschluss gegenüber angenommener begrenzter Maßnahme und ihren Endbegünstigtenpflichten. / Assessment of remedies and a pending Council decision versus an adopted limited measure and its beneficiary obligations.

**Application cases**

- `affected-procurement-programme-and-targeted-measure`
  - Task demand (DE): Fiktiver MitgliedstaatA, geteilte EU-Mittelverwaltung: Ein bestimmtes Beschaffungsprogramm hat Volumen 40; weitere Programme 60 sind unabhängig kontrolliert. Belegte manipulierte Vergaben und fehlende wirksame gerichtliche Kontrolle verursachen im 40-Programm ein hinreichend direktes ernsthaftes Risiko; bereits eingetretener Geldverlust ist nicht belegt. Eine datierte eigene Regelkarte zu VO 2020/2092 Art 4–6 gibt Bedingungen, Verhältnismäßigkeit und Verfahren an. Die Kommission hat begründet schriftlich unterrichtet und Parlament/Rat informiert; A konnte Stellung nehmen und Abhilfe anbieten. Die Kommission prüft sie als unzureichend und ermöglicht auch Äußerung zur Verhältnismäßigkeit. Sie schlägt eine befristete Zahlungsaussetzung nur für betroffene Vorgänge vor; der Rat hat noch nicht beschlossen. Prüfe diese Phase und eine pauschale Aussetzung aller 100. Im anschließenden tatsächlich veränderten Sachverhalt nimmt der Rat die begrenzte Maßnahme an; sie enthält keine abweichende Endbegünstigtenregel. Berechtigte Empfänger haben fällige Ansprüche gegen A. Beurteile ihre Folgen.
  - Task demand (EN): Fictional member state A manages EU funds jointly: one procurement programme has a volume of 40; other programmes of 60 have independent scrutiny. Documented manipulated procurement and ineffective judicial review create a sufficiently direct serious risk in the 40 programme; an actual monetary loss is not established. A dated original rule card on Regulation 2020/2092 Articles 4–6 supplies conditions, proportionality and procedure. The Commission has sent a reasoned written notification and informed Parliament/Council; A could comment and propose remedies. The Commission finds the remedies inadequate and also allows comments on proportionality. It proposes temporarily suspending payments only for affected operations; the Council has not yet decided. Assess this stage and a blanket suspension of all 100. In the subsequent genuinely changed facts the Council adopts the targeted measure, with no different beneficiary provision. Eligible recipients have due claims against A. Assess the consequences.
  - Expected performance (DE): Die Person ordnet den konkreten ernsthaften Haushaltsrisikobefund Art 4 zu; tatsächlicher Verlust ist keine zwingende Zusatzbedingung. Sie prüft Unterrichtung, Äußerungs-/Abhilfemöglichkeit und Kommissionsbewertung als vorgelagerten Art 6-Weg. Der Vorschlag ist kein angenommener Ratsbeschluss und keine automatische Zahlungssperre. Eine Maßnahme muss Reichweite, Schwere, Dauer und Haushaltswirkung beachten; die pauschalen 100 sind durch das gegebene 40-Risiko allein nicht gerechtfertigt. Nach dem beschlossenen begrenzten Schritt bleiben mangels abweichender Beschlussregel die Programm- und Zahlungspflichten von A gegenüber berechtigten Empfängern nach Art 5(2) bestehen. Sie trennt EU-Zahlung an A von der Zahlungspflicht von A und begründet eine gleichwertige engere Alternative, wenn das Material sie trägt.
  - Expected performance (EN): The learner connects the specific serious budget risk to Article 4; proven actual loss is not an additional necessary condition. They examine notification, opportunities to comment/remedy and Commission assessment as the preceding Article 6 route. A proposal is not an adopted Council decision or automatic suspension. Scope, gravity, duration and budget impact matter; the given risk concerning 40 alone does not justify stopping all 100. After the targeted decision, with no different provision, A’s programme and payment duties towards eligible recipients remain under Article 5(2). They distinguish EU payments to A from A’s own payment obligations and justify an equivalent narrower alternative where the evidence supports it.
  - Understanding focus (DE): Direktes ernsthaftes Haushaltsrisiko, Verfahrensstufe und verhältnismäßige Wirkung auseinanderhalten.
  - Understanding focus (EN): Separate sufficiently direct serious budget risk, procedural stage and proportionate effects.
- `general-judicial-breach-and-new-audit-evidence`
  - Task demand (DE): Anderer fiktiver MitgliedstaatB: Das Material stellt eine Rechtsstaatsverletzung durch eingeschränkte unabhängige gerichtliche Kontrolle einer nationalen Regelung fest. B hat hohe Schulden. Für das EU-finanzierte Bildungsprogramm gibt es zunächst wirksame getrennte Kontrollwege; ein hinreichend direkter Haushaltsbezug der Verletzung ist weder festgestellt noch belegt. Prüfe die Forderung, allein deshalb sämtliche EU-Zahlungen zu stoppen. Danach kommt im selben Transfer ein unabhängiger neuer Prüfbericht: Manipulierte EU-finanzierte Bildungsvergaben werden wegen derselben Kontrolllücke nicht wirksam überprüft; ein ernsthaftes direktes Risiko für diese Mittel ist begründet. Die Kommission sendet jetzt eine Art 6-Unterrichtung; Stellungnahme und Abhilfeprüfung stehen noch aus, kein Ratsbeschluss liegt vor. Wende die bereitgestellte aktuelle Regelkarte erneut an und begründe zulässige nächste Schritte, Informationsbedarf und Grenzen einer bereits behaupteten Aussetzung.
  - Task demand (EN): A different fictional member B: the material establishes a rule-of-law breach through limited independent judicial review of a national measure. B has high debt. The EU-funded education programme initially has effective separate controls; a sufficiently direct budget link from the breach is neither established nor evidenced. Assess the demand to stop every EU payment solely on that basis. Within the same transfer an independent new audit report then supplies new facts: manipulated EU-funded education procurement lacks effective review because of the same control gap, creating a supported serious direct risk to these funds. The Commission now sends an Article 6 notification; comments and assessment of remedies are still pending and there is no Council decision. Reapply the supplied current rule card and justify next steps, needed information and limits on a claimed existing suspension.
  - Expected performance (DE): Die Person erklärt zunächst: Festgestellte Rechtsstaatsverletzung und Schuldenstand allein erfüllen den geforderten hinreichend direkten Haushaltsbezug nicht; ein Schluss auf automatische Aussetzung ist unbegründet. Der neue Bericht ändert den Art 4-Befund durch den konkreten Mittel-/Kontrollzusammenhang und ernsthaftes Risiko. Die Unterrichtung eröffnet die geregelte Prüfung, ersetzt aber weder Gelegenheit zu Stellungnahme/Abhilfe noch deren Bewertung, proportionalitätsbezogene Äußerung, begründeten Kommissionsvorschlag und Ratsentscheidung. Sie benennt Informationen zu Risikoumfang und wirksamer Abhilfe für einen begrenzten möglichen Schritt. Endbegünstigtenpflichten werden im späteren tatsächlichen Beschluss nach Art 5(2) geprüft; sie sind im Ausgangsfall nicht schon wegen der Schulden aufgehoben.
  - Expected performance (EN): Initially the learner explains that an established rule-of-law breach and high debt alone do not supply the required sufficiently direct budget connection; automatic suspension is unsupported. The new report changes the Article 4 finding through specific funding/control links and serious risk. Notification begins the prescribed examination but replaces neither opportunities for comments/remedies nor their assessment, comments on proportionality, reasoned Commission proposal and Council decision. They identify information on risk scope and effective remedies needed for a limited possible measure. Beneficiary obligations would be assessed against a later actual decision under Article 5(2); high debt alone has not removed them in the initial facts.
  - Understanding focus (DE): Neue Haushaltsbelege verändern die Voraussetzung, ohne das Verfahren zu überspringen.
  - Understanding focus (EN): New budget evidence changes the condition without bypassing the procedure.
## Page 8: Personalplanung aus Arbeitgeber- und Arbeitnehmerperspektive analysieren

- Full learning-goal ID: `b6f352e1-bcbd-57d7-a502-b15e54d1400c`
- Goal fingerprint: `sha256:f7bef2b861cefb9fb0c0c4a7fd87d41b07a7984fb4ddf16961c6352b0a7a3b79`
- Page fingerprint: `sha256:0fdd45ddec862d98685a57dc217e17c7e1dd5a365408a3b9c57e53bd0cbc0dc6`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Ergänzende Sach- und Methodenkompetenzen

### Canonical description

Die lernende Person kann anhand gegebener Personalbedarfs-, Kapazitäts- und Qualifikationsdaten Aufgaben und Vorgehensweisen der Personalplanung beschreiben, einen bedarfsgerechten Plan aus Arbeitgeber- und Arbeitnehmerperspektive analysieren und den Plan bei einer veränderten Bedarfs- oder Qualifikationsbedingung begründet anpassen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/b6f352e1-bcbd-57d7-a502-b15e54d1400c/b6f352e1-bcbd-57d7-a502-b15e54d1400c.png

- original digest: `sha256:cb77c85f3c9a2f787aac4c1b84cf6ba0d614c8a55f01abb426fd5c48db2a995e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- Personal planen, Führung und Entwicklung beurteilen, Beteiligung unterscheiden — `b1440271-2fcd-582c-8a53-c084ada87acc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6b68a0c21d8f18a992b55a8f49c2123292c953502fbbc0748c4851a62d7aee89`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `planning-whole-case-performance`
  - Essential understanding (DE): Personalplanung gleicht zeitlichen Mengen- und Qualifikationsbedarf mit tatsächlich verfügbarer Kapazität ab; beide Interessenperspektiven sind Teil derselben Planung, nicht austauschbare Schlagwörter.
  - Essential understanding (EN): Personnel planning matches time-specific volume and skill needs with actual capacity; both perspectives are aspects of the same plan, not interchangeable labels.
  - Observable performance (DE): Die lernende Person kann anhand gegebener Personalbedarfs-, Kapazitäts- und Qualifikationsdaten Aufgaben und Vorgehensweisen der Personalplanung beschreiben, einen bedarfsgerechten Plan aus Arbeitgeber- und Arbeitnehmerperspektive analysieren und den Plan bei einer veränderten Bedarfs- oder Qualifikationsbedingung begründet anpassen.
  - Observable performance (EN): The learner can use supplied staffing-demand, capacity and qualification data to describe personnel-planning tasks and procedures, analyse a plan meeting demand from employer and employee perspectives, and revise the plan when a demand or qualification condition changes.

**Coverage expectations**

- required expectations: `planning-whole-case-performance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `substantive-case-and-constraint`: Mengenlücke gegenüber Qualifikationsengpass; Abwesenheit und zeitverzögerte Qualifizierung ändern die tragfähige Planung. / Aggregate shortage versus a skill bottleneck; absence and delayed qualification change a feasible plan.
- `fresh-bounded-revision`: Eine eigene begründete neue Materialvariation innerhalb einer umfassenden Leistung kann zusätzliche unabhängige Evidenz liefern. Die zwei ausgeformten Beispiele sind keine Pflichtquote; nach tatsächlicher vollständiger Evidenz endet die Prüfung. / A reasoned fresh material variation within one substantial performance can supply further independent evidence. The two written examples are not a task quota; assessment ends when actual complete evidence is available.

**Application cases**

- `service-capacity-and-absence`
  - Task demand (DE): Fiktiver Monatsfall S: Der belegte Auftragseingang erfordert1200 qualifizierte Arbeitsstunden. Zehn gleich qualifizierte Beschäftigte können normalerweise je120 Stunden leisten; zwei sind im ganzen Monat abwesend. Eine bereitstehende qualifizierte Aushilfe kann sofort bis240 Stunden übernehmen. Eine dauerhafte Einstellung dauert mindestens drei Monate. Ungelernte Hilfskräfte dürfen die hier nötigen Tätigkeiten nicht selbstständig ausführen; zusätzliche Stunden des vorhandenen Teams sind für diesen Plan nicht verfügbar. Aufgabenregel: nutzbare Kapazität = verfügbare Personen × Stunden; Stundenlücke = Bedarf minus nutzbare Kapazität, mindestens0. Beschreibe Aufgaben und Vorgehensweise der Personalplanung und analysiere einen sofort umsetzbaren Plan aus Sicht des Arbeitgebers sowie der Beschäftigten. Trenne Stundenbedarf, Qualifikation und zeitliche Umsetzbarkeit. Begründe, welche Information später überprüft werden muss. Variation: Der bestätigte Bedarf sinkt auf1080 Stunden; Abwesenheiten und übrige Regeln bleiben gleich. Passe den Plan an. Die Planregeln sind ausdrücklich fiktive Fallannahmen, keine behaupteten gesetzlichen Arbeitszeitgrenzen.
  - Task demand (EN): Fictional monthly case S: confirmed orders require1200 qualified working hours. Ten equally qualified employees can normally provide120 hours each; two are absent for the entire month. An available qualified temporary worker can immediately supply up to240 hours. A permanent hire takes at least three months. Untrained helpers cannot independently perform these tasks, and extra hours from the existing team are unavailable in this plan. Supplied rule: usable capacity = available people × hours; shortfall = demand minus usable capacity, with a minimum of0. Describe personnel-planning tasks and procedure and analyse an immediately feasible plan from employer and employee perspectives. Distinguish hours, qualifications and implementation timing. Explain what information needs later checking. Variation: confirmed demand falls to1080 hours, with the same absences and rules. Revise the plan. These are fictional planning assumptions, not asserted statutory working-time limits.
  - Expected performance (DE): Die Planung ermittelt zunächst mengen- und zeitbezogenen Bedarf, prüft die tatsächlich verfügbare qualifizierte Kapazität, vergleicht beides, wählt eine durchführbare Deckung und kontrolliert Bedarf und Umsetzung. Zehn Namen sind nicht zehn verfügbare Personen:8×120=960 Stunden, Lücke240 Stunden, entsprechend zwei120-Stunden-Kapazitäten. Die sofort verfügbare qualifizierte Aushilfe deckt240; eine erst in drei Monaten verfügbare Einstellung löst diesen Monat nicht, ungelernte Hilfe ebenfalls nicht die unabhängige Facharbeit. Arbeitgeberinteressen sind verlässliche Auftragsdeckung, Qualität und Kosten; aus Beschäftigtensicht müssen die erlaubte Kapazität, faire Lastverteilung und vorhersehbare Einsatzzeiten berücksichtigt werden. Eine sachgerechte Kritik kann Kosten/Bindung der Aushilfe und Unsicherheit des Bedarfs nennen, ohne unerlaubte Mehrarbeit zu erfinden. Regelmäßig prüfen, ob Bedarf und Rückkehrtermine stimmen und die240 Stunden tatsächlich passend eingesetzt werden; dauerhafter Zusatzbedarf könnte später eine Einstellung begründen. Bei1080 bleibt960 Kapazität, Lücke120. Der vorläufige Zusatzplan wird auf120 Stunden reduziert; zwei volle Zusatzkapazitäten wären ohne andere belegte Aufgaben nicht bedarfsgerecht. Andere begründete Pläne unter denselben bereitgestellten Grenzen zählen.
  - Expected performance (EN): Planning first establishes volume and timing of demand, checks genuinely available qualified capacity, compares the two, selects feasible cover and monitors demand and execution. Ten names do not mean ten available people:8×120=960 hours, leaving240 hours, equivalent to two120-hour capacities. The qualified temporary worker can cover240 now; a hire available in three months does not solve this month, and untrained assistance does not cover the independent skilled work. Employer interests include reliable delivery, quality and cost; employee interests include respecting available capacity, fair workload and predictable deployment. Criticism can discuss temporary-cover cost, commitment and demand uncertainty without inventing extra hours. Monitor demand, return dates and actual fit of the240 hours; enduring additional demand may justify a later hire. With1080 demand, capacity stays960 and shortfall is120. Reduce interim cover to120; two full extra capacities are unwarranted without other evidenced tasks. Other reasoned plans within the supplied limits count.
  - Understanding focus (DE): Planung als bedarfs-, qualifikations- und zeitbezogener Prozess mit beiden Perspektiven, statt Personalnamen oder bloße Differenzzahl.
  - Understanding focus (EN): Planning as a demand, skill and timing process with both perspectives, rather than headcount or a difference alone.
- `production-qualification-bottleneck`
  - Task demand (DE): Anderer fiktiver Monatsfall P: Die Aufträge benötigen insgesamt720 Stunden, davon270 Stunden Tätigkeit B. Sieben Beschäftigte können je90 Stunden leisten. Nur zwei dürfen B selbstständig durchführen. Eine zusätzlich verfügbare B-qualifizierte Person kann90 Stunden übernehmen. Eine Person nur für Tätigkeit A könnte ebenfalls90 Stunden leisten. Als weitere Alternative benötigt die Schulung einer vorhandenen A-Person30 Arbeitsstunden in diesem Monat; B-Zulassung gilt ausdrücklich erst im Folgemonat. Sonstige Überstunden und Fremdvergabe sind nicht verfügbar. Nutze dieselbe bereitgestellte Stundenlückenregel. Beschreibe und analysiere die Personalplanung aus Arbeitgeber- und Arbeitnehmerperspektive: Welchen Plan decken Gesamtmenge und Qualifikation tatsächlich? Was leistet die Schulung wann, und welche längerfristige Frage bleibt offen? Variation: Der Gesamtbedarf sinkt auf630 Stunden, B bleibt270. Prüfe, ob kein zusätzlicher Personalbedarf mehr besteht. Formuliere eine bedingte Lösung; keine Kenntnisse eines bestimmten realen Berufs oder Arbeitsgesetzes sind vorausgesetzt.
  - Task demand (EN): Different fictional monthly case P: orders require720 total hours, including270 of task B. Seven employees provide90 hours each, but only two may independently perform B. An available extra B-qualified person can provide90 hours. An A-only person could also provide90. Alternatively, training one existing A employee consumes30 working hours this month and B authorisation explicitly starts only next month. Extra hours and outsourcing are unavailable. Use the same supplied shortfall rule. Describe and analyse planning from employer and employee perspectives: which plan genuinely covers volume and skills? What does training achieve when, and what longer-term question remains? Variation: total demand falls to630 hours while B remains270. Does this eliminate additional personnel needs? Give a conditional solution; no specific occupational or actual employment-law knowledge is assumed.
  - Expected performance (DE): Gesamtkapazität7×90=630; Gesamtstundenlücke90. B-Kapazität2×90=180; B-Lücke90. Die zusätzliche B-Person deckt gleichzeitig die Gesamt- und B-Lücke, während die A-Person zwar Gesamtstunden ergänzt, die B-Lücke aber offen lässt. Die Planung muss daher Mengen- und Qualifikationsabgleich getrennt erklären, dann gemeinsam lösen. Schulung senkt die aktuelle nutzbare Gesamtkapazität auf600; der aktuelle Gesamtengpass wächst auf120, B bleibt180. Sie ersetzt diesen Monat keine B-Kapazität. Im Folgemonat könnten drei B-Qualifizierte270 B-Stunden leisten, doch7×90=630 Gesamtstunden bleiben, sofern Bedarf720 und übrige Kapazität unverändert:90 Stunden sind weiter zu decken. Arbeitgeberseitig sichern passende Qualifikation und termingerechte Menge die Leistung; Beschäftigte gewinnen Qualifikation, haben aber Schulungszeit und belastungsgerechte Einsatzplanung zu berücksichtigen. Bei630 Gesamtbedarf besteht zwar keine Gesamtstundenlücke, aber weiterhin90 B-Lücke. B-Zusatzkapazität mit gleichzeitig geringerem Einsatz anderer Tätigkeiten ist unter den gegebenen Regeln ein bedingter Vorschlag; bloß keine Neueinstellung wegen630=630 wäre falsch. Vertrags-/Kostenbedingungen der Zusatzperson sind nicht gegeben und dürfen als offene Planungsinformation benannt werden.
  - Expected performance (EN): Total capacity is7×90=630, leaving90 total hours. B capacity is2×90=180, leaving90 B hours. The extra B-qualified person covers both shortfalls; the A-only person adds total hours but leaves the B bottleneck. Planning must separately explain quantity and skill matching, then solve them together. Training reduces current usable total capacity to600, increasing the current overall shortfall to120; B remains180. It cannot replace B capacity this month. Next month three qualified employees could supply270 B hours, but total capacity remains7×90=630: if demand remains720, another90 total hours still need cover. For the employer, skill fit and timely capacity secure output; employees gain qualifications, while training time and manageable deployment matter. With630 total demand there is no aggregate shortfall, but the90-hour B bottleneck remains. Extra B capacity alongside reduced deployment on other work is a conditional option under the rules; simply refusing additional cover because630=630 is wrong. Contract and cost details of extra cover are unspecified and may be identified as missing planning information.
  - Understanding focus (DE): Gesamtstunden können ausgeglichen sein, während eine Qualifikationslücke fortbesteht; Schulung hat einen Zeitverlauf.
  - Understanding focus (EN): Aggregate hours can balance while a qualification gap remains; training effects have a time course.
## Page 9: Führungsprinzipien fallbezogen diskutieren

- Full learning-goal ID: `8e065dac-4345-5b88-aee1-dbca803a2631`
- Goal fingerprint: `sha256:fb6b1d39a7967f0526ce210da505396421b8f769a2f82d7be8974b3ef04d8354`
- Page fingerprint: `sha256:6ffd89820f20b9a527f9aa0a3304eb36e3266eae405ebbd2a66809d3b9c4731e`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Ergänzende Sach- und Methodenkompetenzen

### Canonical description

Die lernende Person kann gegebene Führungsprinzipien in einem betrieblichen Fall anhand ihrer Regeln für Entscheidung, Koordination und Rückmeldung diskutieren, deren Chancen und Grenzen für Unternehmen und Beschäftigte begründet gegeneinander abwägen und das Urteil bei einer veränderten Fallbedingung anpassen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/8e065dac-4345-5b88-aee1-dbca803a2631/8e065dac-4345-5b88-aee1-dbca803a2631.png

- original digest: `sha256:857a0a86cf3b380cd70690f134483d012de686fec45a12a9f69cccfb85cdcd2b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- Personal planen, Führung und Entwicklung beurteilen, Beteiligung unterscheiden — `b1440271-2fcd-582c-8a53-c084ada87acc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5fd6795188f54af13c598e21430de014c392558d0b50242d11c9dab25f6e338e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `leadership-whole-case-performance`
  - Essential understanding (DE): Ein Führungsprinzip regelt Entscheidung, Koordination und Rückmeldung; seine Chancen und Grenzen folgen Fallbedingungen und Kriterien, nicht einem universellen Stilrank.
  - Essential understanding (EN): Leadership principles govern decisions, coordination and feedback; merits and limits follow case conditions and criteria rather than a universal style ranking.
  - Observable performance (DE): Die lernende Person kann gegebene Führungsprinzipien in einem betrieblichen Fall anhand ihrer Regeln für Entscheidung, Koordination und Rückmeldung diskutieren, deren Chancen und Grenzen für Unternehmen und Beschäftigte begründet gegeneinander abwägen und das Urteil bei einer veränderten Fallbedingung anpassen.
  - Observable performance (EN): The learner can discuss supplied leadership principles in a workplace case through their decision, coordination and feedback rules, weigh opportunities and limits for the firm and workers, and revise the judgment when a case condition changes.

**Coverage expectations**

- required expectations: `leadership-whole-case-performance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `substantive-case-and-constraint`: Erfahrenes Übergabeteam gegenüber verteilten Fachleuten; Erfahrung, aktuelle Information und mögliche Rückmeldung ändern die Schlussbegründung. / Experienced handover team versus distributed experts; experience, current information and possible feedback change the inference.
- `fresh-bounded-revision`: Eine eigene begründete neue Materialvariation innerhalb einer umfassenden Leistung kann zusätzliche unabhängige Evidenz liefern. Die zwei ausgeformten Beispiele sind keine Pflichtquote; nach tatsächlicher vollständiger Evidenz endet die Prüfung. / A reasoned fresh material variation within one substantial performance can supply further independent evidence. The two written examples are not a task quota; assessment ends when actual complete evidence is available.

**Application cases**

- `repair-team-feedback-and-direction`
  - Task demand (DE): Fiktives Reparaturteam: Acht erfahrene Beschäftigte berichten, dass unterschiedliche Prioritäten bei Übergaben Fehler verursachen. Die Leitung braucht nachvollziehbare Entscheidungen; Beschäftigte wünschen Einfluss auf sinnvolle Abläufe. Prinzip D: Leitung entscheidet Prioritäten allein, gibt genaue Arbeitsanweisungen und kontrolliert täglich. Rückfragen laufen einzeln über sie. Prinzip P: Leitung nennt verbindliche Sicherheits- und Terminziele; das Team verteilt Aufgaben gemeinsam und meldet Übergabeprobleme in einer kurzen täglichen Runde zurück. In dieser Fallprognose braucht D1 Koordinationsstunde und erreicht105 Aufträge bei7 Fehlern; P braucht3 Koordinationsstunden und erreicht102 bei3 Fehlern. Mindestziel100 Aufträge, maximal3 Koordinationsstunden. Prognosen sind begründete Modellannahmen, keine bewiesenen Effekte. Diskutiere die beiden Prinzipien: Erkläre Entscheidungs-, Koordinations- und Rückmelderegeln, Chancen und Grenzen für Betrieb und Beschäftigte, begründe ein bedingtes Urteil mit Gegenargument. Variation: Das Team besteht kurzfristig aus unerfahrenen Aushilfen, die Aufgabenverteilung nicht sicher beherrschen; nur D erreicht nun100, P erreicht90. Passe das Urteil an. Trainingsmaßnahmen sind nicht Bestandteil der Aufgabe.
  - Task demand (EN): Fictional repair team: eight experienced workers report that inconsistent handover priorities cause errors. Management needs traceable decisions; workers want influence over useful procedures. Principle D: management alone sets priorities, gives precise instructions and checks daily; questions go to the manager individually. Principle P: management sets binding safety and deadline goals; the team jointly assigns tasks and reports handover problems in a short daily meeting. In this case forecast D uses1 coordination hour, completes105 jobs and makes7 errors; P uses3 hours, completes102 and makes3 errors. Minimum100 jobs, maximum3 coordination hours. These are reasoned model forecasts, not proven effects. Discuss decision, coordination and feedback rules, opportunities and limits for the firm and workers, and justify a conditional judgment with a counterargument. Variation: the team temporarily consists of inexperienced workers unable to allocate tasks safely; only D now reaches100 while P reaches90. Revise the judgment. Training interventions are outside this task.
  - Expected performance (DE): D bündelt Entscheidung und Kontrolle bei der Leitung, kann rasch einheitliche Prioritäten sichern und beansprucht weniger Koordinationszeit; einzelne Rückfragen können aber die Leitung überlasten und erfahrungsnahe Hinweise unterdrücken. P verbindet verbindliche Ziele mit gemeinsamer Aufgabenverteilung und systematischer Rückmeldung; unter den gegebenen Erfahrungen passt dies zum belegten Übergabeproblem und ermöglicht Beschäftigten Mitsprache. P erfüllt102≥100 und3≤3, bei weniger prognostizierten Fehlern als D, sodass eine begründete Präferenz für P unter Qualitäts-/Beteiligungskriterien tragfähig ist. Ein Gegenargument sind höherer Koordinationsaufwand oder Konflikte bei gemeinsamem Entscheiden; D ist nicht allgemein schlechter oder unzulässig. Beschäftigteninteressen und betriebliche Ziele sind getrennt zu erläutern, nicht nur Stilnamen zu nennen. Prognosen müssen an tatsächlichen Fehlern, Terminen und Belastung überprüft werden. In der Variation entfällt die für P nötige sichere Selbstkoordination; P90 verfehlt100. D kann vorübergehend vorzugswürdig sein, mit begründeter enger Anleitung und Rückmeldung. Daraus folgt keine allgemeine Überlegenheit von Kontrolle über Beteiligung und kein unbelegter Schulungserfolg.
  - Expected performance (EN): D concentrates decision and control in management, can quickly establish uniform priorities and uses less coordination time, but individual queries may overload the manager and suppress practical feedback. P combines binding objectives with joint assignment and systematic feedback, fitting the documented handover problem and enabling worker voice under the supplied experience. P meets102≥100 and3≤3 and forecasts fewer errors, so a conditional preference based on quality and participation is defensible. Counterarguments include coordination cost or conflict over joint decisions; D is not universally inferior or unlawful. Explain worker and firm interests separately rather than naming styles. Check forecasts against actual errors, deadlines and workload. The variation removes the ability on which P depends:90 misses100. D may temporarily be preferable with focused instructions and feedback. This does not establish universal superiority of control or an unsupplied training effect.
  - Understanding focus (DE): Führungsregeln und Fallvoraussetzungen diskutieren; kein pauschaler Stilrank und keine Entwicklungsstrategieprüfung.
  - Understanding focus (EN): Discuss leadership rules and case conditions without universal style rankings or assessing development strategies.
- `distributed-expert-team-and-urgent-deadline`
  - Task demand (DE): Anderes fiktives Team: Fachleute arbeiten an drei Standorten. Das Problem sind widersprüchliche Freigaben zwischen Standorten, nicht fehlendes Fachwissen. Prinzip C: Jede Änderung braucht zentrale Zustimmung; eine zentrale Liste schafft klare Verantwortung, kann aber Entscheidungen verzögern. Prinzip K: Standorte entscheiden innerhalb gemeinsamer Qualitätsregeln selbst; feste gegenseitige Rückmeldung macht Konflikte sichtbar, erfordert aber Abstimmung. Materialprognose: C löst60 Vorgänge/Woche mit8 Verzögerungen, K löst70 mit3 Verzögerungen und2 zusätzlichen Abstimmungsstunden. Gegebenes Ziel mindestens65 Vorgänge;2 Stunden Abstimmung sind verfügbar. Diskutiere C/K mit beiden Perspektiven, begründe das Urteil und eine Gegenposition; benenne eine Information zur Kontrolle der Prognose. Variation: Für eine einzelne Woche gilt ein enges Sofortverfahren; die gemeinsame Abstimmung ist nicht verfügbar. C kann dann68 Vorgänge mit vollständiger aktueller zentraler Information lösen, K ohne Rückmeldung55. Welche begrenzte Schlussänderung trägt das? Keine Personalentwicklungsmaßnahme und keine Theorieetiketten aus dem Gedächtnis werden verlangt.
  - Task demand (EN): Different fictional team: experts work at three sites. The problem is contradictory approvals between sites, not missing expertise. Principle C requires central approval for every change; a central list creates clear responsibility but can delay decisions. Principle K lets sites decide within common quality rules, with fixed reciprocal feedback exposing conflicts but requiring coordination. Forecast: C resolves60 matters per week with8 delays; K resolves70 with3 delays and2 additional coordination hours. Required minimum65;2 coordination hours are available. Discuss both principles from firm and worker perspectives, justify a judgment and counterposition, and identify information to check the forecast. Variation: a one-week emergency procedure removes reciprocal coordination. C can then resolve68 using complete current central information; K without feedback resolves55. What bounded change follows? No development intervention or recalled theory labels are required.
  - Expected performance (DE): C schafft einen klaren zentralen Entscheidungsweg und einheitliche Verantwortlichkeit; die zusätzliche Freigabe kann jedoch zum Engpass werden und standortnahes Wissen nur verzögert nutzen. K verbindet lokale Entscheidung mit gemeinsamen Qualitätsgrenzen und verbindlichem Informationsaustausch; dies ist nicht ungeregeltes Belieben. Beschäftigte erhalten Handlungsspielraum, tragen aber Koordinationsverantwortung. Betriebliche Kriterien sind Durchsatz, weniger Verzögerungen und verlässliche Qualität. Im Grundfall erreicht C60 das Mindestziel65 nicht; K70 erreicht es mit verfügbaren2 Stunden und weniger prognostizierten Verzögerungen. K ist daher unter diesen Bedingungen begründet vorzuziehen. Gegenposition: zentrale Verantwortung vereinfacht Zuordnung und kann bei Informationsdefiziten wichtig sein; Qualität muss in beiden Fällen gemessen werden, die Prognose ist keine Kausalgarantie. In der Variation fehlt K seine wesentliche Rückmeldestruktur,55<65; C68 erfüllt65 aufgrund ausdrücklich vollständiger aktueller zentraler Informationen. C ist für diese Woche begründet, ohne dauerhaft lokale Fachentscheidungen abzuschaffen oder jeden Notfall gleich zu behandeln.
  - Expected performance (EN): C provides clear central decisions and responsibility, but approval may become a bottleneck and delay use of local knowledge. K combines local discretion with common quality limits and mandatory exchange, rather than unrestricted action. Workers gain discretion but assume coordination responsibility. Firm criteria include throughput, fewer delays and reliable quality. Initially C60 misses65, whereas K70 meets it within the available2 hours with fewer forecast delays, supporting K conditionally. A counterposition is that central responsibility eases accountability and may help where information is deficient; quality must be monitored in either arrangement, and forecasts do not prove causality. In the variation K loses essential feedback and55 misses65; C68 meets65 with explicitly complete current central information. Prefer C for that week without claiming that local expertise should permanently disappear or that every emergency is identical.
  - Understanding focus (DE): Der Vorteil eines Prinzips hängt von Informations- und Rückmeldebedingungen ab, nicht nur von Zustimmung zum Beteiligungswort.
  - Understanding focus (EN): The merit of a principle depends on information and feedback conditions, not endorsement of participation as a label.
## Page 10: Personalentwicklungsstrategien materialgebunden beurteilen

- Full learning-goal ID: `1839e595-3e30-53ec-904f-b38e2ed4e4e0`
- Goal fingerprint: `sha256:70c7f1c54701a2b2df2ada7e6548ec68ac8f944f8692516bfa689a9ab8f9b2e8`
- Page fingerprint: `sha256:06d6066f651016c5ba238ee16f1f3df72a418708f352779b819b27f76761ea6f`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Ergänzende Sach- und Methodenkompetenzen

### Canonical description

Die lernende Person kann gegebene Personalentwicklungsstrategien anhand bereitgestellter Qualifikations- und Mitarbeiterbeurteilungsbefunde zu einem betrieblichen Lernbedarf, ihrer Durchführung, Kosten und erwarteten Transferwirkungen beurteilen, eine bedingte Auswahl begründen und diese bei einer veränderten Durchführungs- oder Wirkungsvoraussetzung überprüfen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/1839e595-3e30-53ec-904f-b38e2ed4e4e0/1839e595-3e30-53ec-904f-b38e2ed4e4e0.png

- original digest: `sha256:11be8bb4770c6c92c5adba7c3c0c92a2732d7c8f41b10e04063b885b114c4976`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- Personal planen, Führung und Entwicklung beurteilen, Beteiligung unterscheiden — `b1440271-2fcd-582c-8a53-c084ada87acc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8eb395133129d91f808c86ef3829deef9dec32b776386743aa48030cc3ae4f73`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `development-whole-case-performance`
  - Essential understanding (DE): Entwicklungsstrategien sind nach belegtem Lernbedarf und durchführbarem Transfer zu beurteilen; Kosten oder ein Lernetikett allein beweisen keine Wirkung.
  - Essential understanding (EN): Development strategies are assessed through evidenced learning needs and feasible transfer; cost or a learning label alone does not prove effectiveness.
  - Observable performance (DE): Die lernende Person kann gegebene Personalentwicklungsstrategien anhand bereitgestellter Qualifikations- und Mitarbeiterbeurteilungsbefunde zu einem betrieblichen Lernbedarf, ihrer Durchführung, Kosten und erwarteten Transferwirkungen beurteilen, eine bedingte Auswahl begründen und diese bei einer veränderten Durchführungs- oder Wirkungsvoraussetzung überprüfen.
  - Observable performance (EN): The learner can assess supplied personnel-development strategies against supplied qualification and employee-appraisal evidence of workplace learning needs, implementation, costs and expected transfer effects, justify a conditional choice and reconsider it when an implementation or effectiveness condition changes.

**Coverage expectations**

- required expectations: `development-whole-case-performance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `substantive-case-and-constraint`: Praktische Diagnose gegenüber Schnittstellentransfer; Budgetänderung und Ausfall einer Begleitperson sind verschiedene Wirksamkeits-/Durchführungsänderungen. / Practical diagnosis versus interface transfer; changed budget and loss of a mentor alter different effectiveness and implementation conditions.
- `fresh-bounded-revision`: Eine eigene begründete neue Materialvariation innerhalb einer umfassenden Leistung kann zusätzliche unabhängige Evidenz liefern. Die zwei ausgeformten Beispiele sind keine Pflichtquote; nach tatsächlicher vollständiger Evidenz endet die Prüfung. / A reasoned fresh material variation within one substantial performance can supply further independent evidence. The two written examples are not a task quota; assessment ends when actual complete evidence is available.

**Application cases**

- `repair-learning-need-and-budget`
  - Task demand (DE): Fiktiver Betrieb R: Bereitgestellte fiktive Qualifikations- und Mitarbeiterbeurteilungsbefunde aus beobachteten Arbeitsproben mit20 dokumentierten Übergabefehlern zeigen15 fehlende konkrete Diagnosehandlungen,5 reine Zeitplanprobleme. Lernziel: Diagnose im realen Einsatz zuverlässig anwenden. Strategie H: ein allgemeiner Vortrag,600 EUR,8 Stunden; Prognose im ersten Monat105 Aufträge und7 Übergabefehler. Er erklärt Begriffe, enthält keine angeleitete Anwendung/Rückmeldung. Strategie T: angeleitete Fallarbeit mit erfahrenen Begleitpersonen und Rückmeldung im Einsatz,1000 EUR,16 Stunden; Prognose92 Aufträge und3 Fehler. Gefordert sind mindestens100 Aufträge im ersten Monat; Budget1000 EUR. Eine bekannte Überbrückung der fehlenden8 Aufträge kostet weitere200 EUR. Beurteile beide Personalentwicklungsstrategien anhand Lernbedarf, Durchführung, Kosten und Transfer, begründe einen bedingten Plan und benenne eine Wirkungskontrolle. Variation: Das Budget steigt auf1300 EUR; die Überbrückung ist gesichert. Beurteile erneut. Alle Effekte sind Fallprognosen; Führungsprinzipien sind fest und werden nicht gewählt.
  - Task demand (EN): Fictional firm R: supplied fictional qualification and employee-appraisal evidence from observed work samples with20 documented handover errors finds15 missing practical diagnostic actions and5 scheduling issues. Learning goal: reliably apply diagnosis in real work. Strategy H is a general lecture costing600 euros and8 hours, forecasting105 jobs and7 errors in month one; it explains terms without guided practice or feedback. Strategy T provides guided cases with experienced partners and workplace feedback, costing1000 and16 hours, forecasting92 jobs and3 errors. Minimum100 jobs in month one, budget1000. A known bridge for the missing8 jobs costs another200. Assess both development strategies through learning needs, implementation, cost and transfer; justify a conditional plan and an effectiveness check. Variation: budget becomes1300 and the bridge is assured. Reassess. Effects are case forecasts; leadership principles are fixed and are not selected.
  - Expected performance (DE): Die belegte Hauptlücke ist praktische Diagnose, nicht bloß Begriffswissen;15/20 Fehler begründen diesen Schwerpunkt, die5 Zeitprobleme lösen Entwicklungsmaßnahmen nicht automatisch. H ist sofort wirtschaftlich/kapazitiv machbar (600≤1000,105≥100), bietet aber wenig direkte Übung und nur7 prognostizierte Restfehler. T passt mit Anwendung und Rückmeldung besser zum Transferziel und prognostiziert3, kostet aber mit notwendiger Überbrückung1200>1000; ohne diese bleibt92<100. Daher ist T im Ausgangsplan nicht zugleich budget- und leistungsgerecht. Ein bedingter kurzfristiger H-Plan mit offengelegter fachlicher Schwäche oder die begründete Suche nach geänderten Ressourcen ist tragfähig; ungegebene Verbesserungen dürfen nicht zugesichert werden. Nach Budget1300 ist T+200-Überbrückung für1200 möglich und erreicht die gegebenen100 Aufträge. T ist nun bei Priorität praktischer Fehlerreduktion begründet, nicht immer überlegen. Wirkungskontrolle: echte Diagnosehandlungen und vergleichbare Übergabefehler nach Anwendung prüfen, Zeitprobleme separat beobachten; Prognosen beweisen keine individuelle Lernwirkung. Unterschiedliche transparente Kriteriengewichtungen sind zulässig, sofern die verbindlichen Grenzen erhalten bleiben.
  - Expected performance (EN): The evidenced main gap is practical diagnosis rather than terminology;15 of20 errors support that focus, while development does not automatically solve5 scheduling issues. H is immediately feasible in budget and capacity (600≤1000,105≥100) but offers little direct practice and forecasts7 remaining errors. T fits application and feedback needs better and forecasts3, but required bridging makes1200>1000; without bridging92<100. T therefore fails to meet both initial constraints. A conditional short-term H plan acknowledging weaker transfer, or a justified search for changed resources, is defensible; do not promise unsupplied benefits. At1300, T plus the200 bridge is feasible for1200 and supplies the given100 jobs. Prefer T when practical error reduction is prioritised, without universal superiority. Check real diagnostic actions and comparable handover errors after use, observing scheduling separately; forecasts do not prove individual learning. Alternative transparent weighting is valid within binding limits.
  - Understanding focus (DE): Entwicklungsstrategie nach tatsächlich belegtem Lernbedarf und durchführbarem Transfer beurteilen.
  - Understanding focus (EN): Assess development through evidenced learning needs and feasible transfer.
- `logistics-transfer-and-missing-mentor`
  - Task demand (DE): Anderer fiktiver Betrieb L: Bereitgestellte fiktive Qualifikations- und Mitarbeiterbeurteilung anhand von Arbeitsproben: Erfahrene Beschäftigte kennen die Regeln;9 Übergabefehler entstehen laut protokollierter Beobachtung bei ihrer Anwendung an Schnittstellen. Strategie V: allgemeines Regelblatt plus eintägiger Vortrag,300 EUR; Monatsprognose98 Vorgänge und8 Fehler, ohne Arbeitsprobe oder Rückmeldung. Strategie B: standortübergreifendes Begleiten echter Übergaben mit Rückmeldung und späterer selbstständiger Arbeitsprobe,700 EUR; Monatsprognose96 Vorgänge und3 Fehler, wenn eine qualifizierte Begleitperson verfügbar ist. Beide verlangen fest eingeplante Lernzeit. Mindestleistung95, Budget900; Begleitperson ist zunächst gesichert. Beurteile die Strategien, begründe eine Auswahl mit Gegenargument und Kontrollkriterium. Variation: Die Begleitperson fällt aus; das Material sagt ausdrücklich, dass B ohne Ersatz nur92 Vorgänge und keinen belegten Transfereffekt erwarten lässt. Ersatz steht diesen Monat nicht zur Verfügung. Passe dein Urteil an. Keine Führungsauswahl und keine bloße Zustimmung zu Lernen werden geprüft.
  - Task demand (EN): Different fictional firm L: supplied fictional qualification and employee-appraisal work-sample evidence: experienced workers know the rules, but recorded observation attributes9 handover errors to applying them at interfaces. Strategy V is a general rule sheet and one-day lecture costing300; forecast98 matters and8 errors, with no work sample or feedback. Strategy B is cross-site guided real handovers, feedback and a later independent work sample, costing700; forecast96 matters and3 errors if a qualified mentor is available. Both include scheduled learning time. Minimum95 matters, budget900; the mentor is initially assured. Assess strategies, justify a choice with a counterargument and evaluation criterion. Variation: the mentor is absent; material expressly forecasts only92 matters and no evidenced transfer effect for B without replacement. No replacement is available this month. Revise the judgment. Leadership selection and mere agreement with learning are not assessed.
  - Expected performance (DE): Da Regeln bekannt sind und die Anwendung die belegte Lücke ist, passt B mit realen Schnittstellen, Rückmeldung und selbstständiger Probe direkter zum Lernziel. B700≤900 und96≥95 ist umsetzbar und prognostiziert weniger Fehler als V; V300/98 wäre günstiger und kapazitätsstärker, begründet aber kaum Transfer auf den tatsächlichen Engpass. Eine Präferenz für B ist mit Gegenargument Kosten und Lernzeit tragfähig. Tatsächliche selbstständige Handlungen und vergleichbare Fehler nach der Begleitung prüfen; weniger Fehler können auch von anderer Auftragszusammensetzung kommen, daher nicht pauschal als individuellen Lernbeweis ausgeben. In der Variation fehlt B die Durchführungsvoraussetzung:92<95 und Transfer unbelegt. B darf nicht mit den ursprünglichen3 Fehlern weitergerechnet werden. V ist kurzfristig durchführbar, seine begrenzte Passung bleibt offen; B verschieben und die verfügbare Ressourcenlage erneut prüfen ist ebenfalls eine bedingte Entscheidung. Kein unerwähnter Ersatz, garantierter Lerneffekt oder allgemeiner Vorrang von Vorträgen folgt.
  - Expected performance (EN): Since rules are known and application is the evidenced gap, B’s real interfaces, feedback and independent sample fit the learning goal directly. B700≤900 and96≥95 is feasible and forecasts fewer errors than V. V300/98 is cheaper and has greater output, but offers weak transfer to the actual bottleneck; a preference for B can acknowledge cost and learning time as counterarguments. Check independent actions and comparable errors afterwards; changed job mix could also reduce errors, so do not equate totals with proven individual learning. In the variation B loses an implementation condition:92<95 and transfer is unsupported. Do not continue using the original3-error forecast. V is feasible short term but retains limited fit; deferring B and revisiting resources is also a conditional option. No unmentioned replacement, guaranteed learning or universal superiority of lectures follows.
  - Understanding focus (DE): Bei weggefallener Durchführungsvoraussetzung ist die ursprüngliche Transferprognose nicht fortzuschreiben.
  - Understanding focus (EN): Do not retain a transfer forecast after its implementation condition disappears.
