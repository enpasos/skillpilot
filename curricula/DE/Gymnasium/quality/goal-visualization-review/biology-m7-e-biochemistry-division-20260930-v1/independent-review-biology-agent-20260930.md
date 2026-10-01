# Unabhängige maschinelle PNG-Sichtung

2026-09-30; Reviewer: Codex, Biologie-Spur. Die sechs tatsächlichen `*.candidate.png` wurden in Originalauflösung 1672×941 und als lokal herunterskalierte 360px-Ansicht betrachtet. Die Skalierungen waren reine Prüfkopien in `/tmp`; die Originale blieben unverändert. Entscheidung betrifft ausschließlich V-Kandidaten, keine menschliche Bildfreigabe und keinen D/P-/M7-Abschluss.

| Ziel | SHA256 des geprüften Originals | V-Urteil | Konkreter Befund |
| --- | --- | --- | --- |
| `28850d2e` | `5e5158b2ba18ce0801640e7d256cd5ab0a2212e8e31dde3bb86b9bb18c05f581` | PASS | Einzelne Aminosäuren werden zur Peptidkette verknüpft, die anschließend ein gefaltetes Protein bildet. Große Hauptmotive und Beschriftungen bleiben bei 360px erkennbar. Das Bild behauptet nicht, alle vier Strukturebenen einzeln zu zeigen. |
| `0dbe758c` | `be18a08b3793d2a9d47815f519422aa6d6ed9be59c7ec5eccdc1e178a74e0a3e` | PASS | Substrat bindet am aktiven Zentrum, Produkte verlassen das Enzym, das als dasselbe violette Objekt erneut erscheint. Ablauf und drei großen Labels bleiben mobil erkennbar; abstraktes Schema, kein Stoffnachweis. |
| `f539fe51` | `d6294ea34980f7f3fb1e3e5ce5244a426383a1b988f38750055363ad9e86a5b6` | **HOLD** | Drei qualitative Kurven sind fachlich plausibel, doch Achsenbegriffe `Aktivität` und besonders `Substratkonzentration` sind bei 360px Kleinsttext und für richtige Graphdeutung nötig. Im rechten `besetzt`-Bild liegen scheinbar mehrere Substratmoleküle zugleich am einzigen aktiven Zentrum; Sättigung meint besetzte Zentren über viele Enzymmoleküle. Überarbeitung erforderlich. |
| `01819a6c` | `8d882106ae2d0f90ac66804766e58b22066a6b6325c41cde5114746234afcb6f` | **HOLD** | Competitive/Allosterie-Gegenüberstellung stimmt im Prinzip, aber bei 360px sind gerade die entscheidenden Hinweise auf aktive und andere Bindestelle sowie Formänderung zu klein. Ohne diese Labels sind die Rollen der farbigen Formen nicht hinreichend eindeutig. Große knappe Labels oder eindeutigere Symbolführung erforderlich. Fachliche D-Titelgrenze bleibt gesondert offen. |
| `ec88fc1d` | `203de5d2d8275ea46197ab05461741c5aa9fc18cb9bd87254c1fa5eaa1c1b633` | PASS | Oben entstehen bei Mitose zwei Zellen mit gleichem Chromosomensatz; unten trennt Meiose zuerst homologe Chromosomen und dann Schwesterchromatiden zu vier Zellen mit halbem Satz. Die korrigierten Endchromosomen sind Stäbchen; Hauptformen bei 360px klar. Stark vereinfachtes n=1-Modell, keine Darstellung von Crossing-over. |
| `9344c5ce` | `ab1885e29e46e4abfc6331a2fe6cbe3cab53c9d26b15d78dfae2bd18d3539ae5` | PASS | Drosophila-Fliegen und C. elegans-Wurm sind klar getrennt; die Fliegenfolge in eigenen Gefäßen zeigt generationenübergreifende Beobachtung ohne eine dem Wurm zugeschriebene Puppe. Fragezeichen hält den Forschungszweck offen; bei 360px erkennbar. |

Bei `f539fe51` und `01819a6c` ist ein neuer tatsächlicher Kandidat erneut visuell und fachlich zu prüfen. Eine bloße Alt-Text-Änderung würde die festgestellte mobile Lesbarkeitslücke nicht schließen.

## Neue tatsächliche Kandidaten nach den Holds

Die beiden ersetzten PNGs wurden erneut in 1672×941 und 360px angesehen. Die obige HOLD-Tabelle bleibt als historischer Befund zu den verworfenen Fassungen bestehen.

| Ziel | Neuer SHA256 | Neues V-Urteil | Gezielte Neusichtung |
| --- | --- | --- | --- |
| `f539fe51` | `c678bc75c40b14c1c6f0509e3a62ff993bc1434f80f40c759852d84953cf87fb` | PASS | Drei große Überschriften und x-Achsen tragen Temperatur, pH und Substratmenge auch bei 360px; `Aktivität` ist knapp, aber sichtbar und wiederholt sich konsistent. Der dritte Cartoon zeigt jetzt drei verschiedene Enzyme mit jeweils genau einem gebundenen Substrat und weitere freie Substrate. Die drei qualitativen Kurven sind plausibel; keine universellen Optimumwerte werden behauptet. |
| `01819a6c` | `54b1277ada9b7f8607771b1f2e956668e3fc74cc54e9584d1e502064863365fb` | PASS | Bei 360px bleiben `kompetitiv`, `allosterisch`, `Zentrum besetzt` und `Form verändert` groß lesbar. Roter Hemmstoff belegt die aktive Bindestelle, blauer Hemmstoff bindet seitlich und die Form des aktiven Zentrums ändert sich; das Substrat passt dort nicht mehr. Die kleinere Einzelbeschriftung `Hemmstoff` ist durch die eindeutige Pfeil-/Farbführung nicht lesepflichtig. Der Titel-/Quellenumfang von `018` bleibt D-seitig separat zu klären. |

Diese PASS-Urteile gelten nur für die jeweils neuen Hashes. Ein Import und ein aktueller QA-Ledgereintrag müssen danach exakt diese Fassungen binden.
