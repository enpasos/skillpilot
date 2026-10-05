# Unabhängige Bildprüfung: Titration und Ionengitter

Maschinelle, unabhängige Prüfung durch `/root/bio_q1_six_source_remediation`.
Die Bildautorschaft lag bei `/root`. Der Auftrag nannte die fachlichen Risiken
und bisherigen gezielten Korrekturen; diese Vorinformation ist offengelegt.
Die tatsächlichen Bilder und gebundenen Kandidatentexte wurden vor den
gezielten Erzeugungsprompts geprüft. Die fachlichen Root-Bildverdicts wurden
nicht als eigene Prüfung übernommen.

## Ergebnis

| Aktuelles Ziel | Bildurteil | Format / 360 / 680 Pixel | Belegte Bildfehler |
| --- | --- | --- | --- |
| `02634fdd-c8ba-591a-b240-77129b1bebb8` Säure-Base-Titrationen | **PASS** | **PASS / PASS / PASS** | keine |
| `950c73c6-4ed1-488a-9267-1142e95e0055` Ionengitter | **PASS** | **PASS / PASS / PASS** | keine |

Beide tatsächlichen PNG-Originale haben **1672 × 941 Pixel**, Verhältnis
**1,776833**, nahe dem vorgegebenen 16:9. Die Originale und alle vier
eingefrorenen 360-/680-Ansichten wurden tatsächlich angesehen. Vier Ansichten
wurden zusätzlich in dieser unabhängigen Prüfung aus den gebundenen PNGs
neu mit Chromium gerendert und tatsächlich angesehen; die resultierenden
Bytes stimmen mit den eingefrorenen Ansichten überein. Es erfolgte keine
Bildgenerierung oder Bildkorrektur.

### Titration

Die HCl-Probe, farblose NaOH-Maßlösung und farblose Indikator-Stocklösung
sind passend angeordnet. Die Probe zeigt einen sehr zarten rosa Endpunkt.
Stativklemme, Bürette, Hahn und Auslauf sind plausibel; die Skala nimmt nach
unten zu. Der Schwenkpfeil ist klar. Das Protokollheft liegt zur angenommenen
Arbeitsseite offen und enthält keine verkehrt orientierte lesepflichtige
Messzeile. Alle Hauptlabels bleiben bei 360 Pixeln lesbar.

Die Endpunktdarstellung wurde fachlich mit der
[Titrationsanleitung der University of British Columbia](https://groups.chem.ubc.ca/chem121/111_121_files/Techniques_Titration.pdf)
abgeglichen. Die Abbildung unterstützt die Orientierung. Sie belegt keine
praktische Durchführung, begründete Indikatorwahl, vollständige Messreihe
oder Konzentrationsrechnung.

### Ionengitter

Die hervorgehobene Na⁺-Umgebung zeigt sechs getrennte Cl⁻ in drei
gegenüberliegenden räumlichen Richtungen. Weitere Ionen führen das
Kristallmodell fort. Die gestrichelten Linien markieren nächste Nachbarn;
die Koordinationszahl wird ausdrücklich benannt. Das schematisch aufgeweitete
Modell ist nicht für maßstäbliche Abstands- oder Radiusmessungen vorgesehen.
Die räumliche Koordinationsumgebung wurde mit den Darstellungen der
[Open University](https://www.open.edu/openlearn/mod/oucontent/view.php?id=72184&section=2.2)
und des [Beloit College](https://chemistry.beloit.edu/edetc/pmks/pages/NaClExample.html)
abgeglichen. Ionenbeweglichkeit und Leitungsmechanismen sind separat zu
bearbeiten. Ladungen, Nachbarn und Haupttexte bleiben bei 360 Pixeln lesbar.

## Bindungen und Nachweise

- [Vollständiger unabhängiger Prüfbeleg](independent-two-image-v-qa.receipt.json):
  exakte zwei Zieltexte, Asset-/Prompt-SHAs, Herkunft, spezifische Befunde,
  Formatentscheidungen und abgegrenzte Prüfclaims.
- [Geprüfte Eingabebindungen](input-bindings.checked.json): Original-Freeze
  SHA256 `84db6171b208285b67a4afc00cfe9d6e94c0bad8a040c24849f3c4f8a8316e35`,
  alle **31** eingefrorenen Originalartefakte unverändert. Tatsächliche
  generierte Ausgangsdateien und drei isolierte Importkopien hashgleich.
- [Gebundene inaktive Zieltexte](reviewed-two-goal-inputs.snapshot.json).
- [Unabhängiger Breitenbeleg](independent-width-capture.actual.receipt.json)
  und [reproduzierbarer Renderer](capture-independent-widths.cjs).
- [Geprüfte spezifische Alttexte](specific-alt-texts.reviewed.candidate.json).
  Die ursprünglichen generischen Alttexte wiederholen die Kompetenzbeschreibung.
  Vor aktiver Integration sind die konkreten deutschen Alttexte zu übernehmen.
- [Eigener Freeze](independent-v-qa.freeze.json).

Die Herkunft wird durch erhaltene tatsächliche Erzeugungsrequests, Root-
Toolbelege sowie identische generierte und isoliert importierte Bytes gestützt.
Der dort dokumentierte Generator ist `image_gen__imagegen` / ChatGPT-Codex.
Eine nicht ausgegebene Modellversion oder unabhängige Provider-Transportprüfung
wird nicht behauptet. Sichtbare Logos, technische IDs, Wasserzeichen oder
kopierte Arbeitsblattlayouts wurden nicht festgestellt.

## Integration und verbleibender Umfang

Das dritte Bild `16da6a4d-8e9c-5f5d-b69d-338d67a2d362` ist **außerhalb**
dieser Zwei-Bild-Prüfung. Sein bestehender, separat belegter mobiler **HOLD**
bleibt bestehen; diese Prüfung enthält dazu keine neue Sichtprüfung und keine
Freigabe.

Aktive Canonical-, QA-, Registry- oder Publikationsdateien wurden nicht geändert.
Keine D-/P-Freigabe, menschliche Prüfung, Erprobung oder Host-Abnahme wird
behauptet. **Neue fachliche Abschlüsse 0; wiederhergestellte Bindungen 0;
strenger Nettozuwachs 0.** Als nächstes sind diese beiden geprüften PNGs mit den
spezifischen Alttexten am final integrierten Ziel-, Seiten-, Kontext- und
Quellenstand zu binden und die betroffenen maschinellen Checks auszuführen.
