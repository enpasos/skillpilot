# Kandidatennotiz zu `1a18dbb3-f350-4766-9c8b-20ca018ccef1`

Stand: 27. September 2026. Dies ist eine fachliche Arbeitshypothese für die
nächste Prüfung, **keine** D-Resolution, Änderung der kanonischen Zielidentität
oder M7-Freigabe.

## Gebundener Befund

- Der kanonische J10-Text, `semanticAtomic: true` und der zugehörige JPG-Hash
  `e86811073adffb07edf396609b50057f7ec5ab58df2edf5af051d84887c8290a`
  sind gegenüber dem gebundenen Zweierpaket unverändert. Das Paket besteht
  `quality:goal-description-rollout-batch check`. Der aktuelle Gesamtatlas
  enthält 797 `curricularAtomic`-Seiten. Die aus ihm neu abgeleitete **gebundene
  Zweierseite dieses Ziels** ist exakt identisch mit der geprüften Seite:
  `pageFingerprint`
  `sha256:bd8e151e3e44329f9f4d937f9874f39dc7608379d73824a9bb7ce1569f42897e`.
- Runde A entscheidet `split_review`: graphische Funktion–Ableitung-Beziehung
  und Untersuchung von Monotonie und Extrema können eigenständig geprüft
  werden. Runde B entscheidet `keep`: Beide Leistungen verwenden in einfachen
  Fällen dieselbe Steigungs- und Vorzeichenidee. Der gebundene
  `dual-summary.json` markiert `requiresSynthesis: true` und
  `automaticAcceptance: false`.
- Die BW-Sek-I-Extraktion 3.3.4 führt Monotoniebegriff (11), lokale und globale
  Extrema (12), Funktionsuntersuchung mit Ableitungen (22) und das Schließen
  zwischen Funktions- und Ableitungsgraph (23) getrennt. Alle vier Kanten zu
  diesem kanonischen Ziel sind `partial`. Damit sind die Facetten belegt;
  weder eine einzige noch mehrere kanonische Zielidentitäten folgen allein
  aus dieser Quellgliederung. Quelle 22 umfasst auch höhere Ableitungen,
  Krümmung und Wendepunkte, die hier nicht beansprucht werden.
- Das P-v2-Kandidatenprofil mit demselben Ziel-Fingerprint
  `sha256:9299fdfaf425156492d7d0abc9abebfefb361a6d67992d7c231499176069fcf6`
  verlangt zwei Leistungen: aus dem Vorzeichen von `f′` Monotonie und lokale
  Extrema begründen; für globale Extrema Definitionsbereich, innere
  Kandidaten und gegebenenfalls Randwerte vergleichen. Die zwei Fälle
  umfassen eine nach unten geöffnete Parabel und den Transfer auf eine
  kubische Funktion in einem geschlossenen Intervall. Das Profil ist
  `ai_candidate`/`needs_human_review`, kein menschliches Testat.

## Fachliche Synthesehypothese

`keep_current` kann fachlich vertretbar sein, wenn der gemeinsame Gegenstand
ausdrücklich die **Untersuchung des Funktionsverlaufs mit der ersten
Ableitung** ist. Die graphische Beziehung zwischen `f` und `f′` erklärt dabei
Steigung und Vorzeichen; daraus werden Monotonieintervalle und lokale
Extremstellen erschlossen. Für eine globale Aussage müssen zusätzlich alle
relevanten Funktionswerte im angegebenen Bereich, einschließlich der
Randpunkte, verglichen werden. In einer zusammenhängenden Aufgabe können
diese Schritte als eine überprüfbare Kompetenz gezeigt werden. Eine
bidirektionale Rekonstruktion ganzer Graphen oder die Untersuchung mit
höheren Ableitungen gehört nicht zu diesem engeren Ziel.

Der Einwand aus Runde A bleibt substanziell: Wer Graphen von `f` und `f′`
erklären kann, beherrscht deshalb noch nicht zwingend die gesamte
Extremwertuntersuchung, und umgekehrt. Die nächste unabhängige Prüfung muss
entscheiden, ob die im aktuellen Wortlaut verbundene Leistung als eine
atomare Kompetenz genügt oder ob eine kanonische Trennung nötig ist. Ein
einziger integrierter Beispielfall allein entscheidet dies nicht.

## Formale Grenze und nächster Schritt

Der strenge Synthesevertrag akzeptiert `keep_current` nur bei zwei gebundenen
`keep`-Voten oder bei `keep`/`revise` mit exakt dokumentierter Ablehnung der
Revision (`app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts`).
Für das vorliegende `split_review`/`keep` wäre eine D-Resolution daher
ungültig. Der aktuelle gebundene Seitenkontext ist geprüft; für einen
strengen D-Abschluss sind zwei neue voneinander unabhängige Reviews des
fachlich geklärten Ziels erforderlich.
Wird ein Split fachlich bestätigt, müssen beide Nachfolgeziele samt
Quellenbindung, Lernweg, P/A/M/V und neuen D-Paketen geprüft werden.
