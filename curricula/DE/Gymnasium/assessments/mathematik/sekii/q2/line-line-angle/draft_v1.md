# Kandidat: Schnittwinkel zweier Geraden

Status: am 28. September 2026 fachlich geprüft und als kanonischer Prüfungsknoten `338135aa-d5bb-5b53-8413-90fa8f1e4fb6` maschinell freigegeben; **kein** M7-D-/P-/V-Nachweis oder menschlich erprobte Aufgabe. Das einzige abgedeckte Inhaltsziel ist `18be713b-7d90-4f01-b60a-5582ac4df0e8`; die Aufgabe prüft weder Gerade–Ebene- noch Ebene–Ebene-Winkel.

## Aufgabe

Zwei Geraden schneiden sich in `P = (1|2|0)`. Ihre Richtungsvektoren sind `u = (1|1|0)` und `v = (−1|0|−1)`. Berechne den **nichtstumpfen** Schnittwinkel der Geraden. Eine Mitschülerin erhält mit der Kosinusformel zunächst `120°`. Erkläre, wie dieser Wert zustande kommt und warum er nicht der verlangte Geradenschnittwinkel ist. Prüfe deine Begründung, indem du `v` durch den gleichwertigen Richtungsvektor `−v` ersetzt.

## Lösung und Bewertungsidee

`u·v = −1` und `|u| = |v| = √2`. Für den nichtstumpfen Winkel zwischen den **unorientierten Geraden** gilt `cos α = |u·v|/(|u||v|) = 1/2`, also `α = 60°`. Der direkt mit `u` und `v` berechnete Vektorwinkel ist `arccos(−1/2) = 120°`; er ist der Supplementwinkel. Da eine Gerade keine bevorzugte Richtung besitzt, beschreibt `−v` dieselbe zweite Gerade. Mit `u·(−v)=1` folgt wieder `60°`.

Bewertung: **neun Punkte**, Bestehen ab **acht**. Skalarprodukt und beide Normen zusammen zwei Punkte; Betrag in der nichtstumpfen Winkel-Formel und Ergebnis `60°` drei Punkte; `120°` als Winkel der gewählten Vektoren **und** Supplementwinkel erklären zwei Punkte; Invarianz unter `v↦−v` rechnerisch und fachlich begründen zwei Punkte. Ohne mathematische Winkelberechnung sind höchstens sechs, ohne Supplementerklärung oder ohne Orientierungsprüfung höchstens sieben Punkte erreichbar. Der erste Punkt der Supplementerklärung setzt den richtigen Vektorwinkel `120°` und die Unterscheidung zum Geradenschnittwinkel voraus; der erste Orientierungspunkt verlangt **sowohl** die Rechnung mit `−v` **als auch** die Erklärung, warum der Schnittwinkel derselbe bleibt. Eine bloße Zahl `60°` ohne Vektor- und Orientierungsargument zeigt die Kernkompetenz nicht vollständig. Der Server erzwingt nur die Gesamtschwelle; die kriterientreue Coach-Bewertung ist nicht real-host-erprobt.

Der gemeinsame Schnittpunkt ist vorgegeben, weil das gesonderte Lernziel zur Prüfung von Lagebeziehungen nicht hier erneut bewertet werden soll. Die Richtungsvektoren liegen im Raum und besitzen ein **negatives** Skalarprodukt; die bisherige Lernzielillustration zeigt dagegen ein positives Produkt und 45°. Damit ist der Prüfungsfall eigenständig und überprüft gerade die oft übersehene Unabhängigkeit von der Vektororientierung. Der Prüfungsknoten liegt im Q2-Übungscluster; `requires` und `coveredGoalIds` nennen ausschließlich das passende Schnittwinkelziel. Quelle/Atlas/P-v2/D-Bindung und Freigabe bleiben getrennte Folgeschritte.
