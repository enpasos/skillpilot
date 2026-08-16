# Lernzielvisualisierung: Parameterabhängige Winkel und Lagebeziehungen untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `5f90df42-8a71-534d-b995-b8f7dcaf1661`
- Titel: Parameterabhängige Winkel und Lagebeziehungen untersuchen
- Beschreibung: Die lernende Person kann in räumlichen Konfigurationen mit einem zusätzlichen Parameter Winkel zwischen einer Geraden und einer Ebene sowie zwischen zwei Ebenen untersuchen und Parameterwerte bestimmen, für die eine vorgegebene Winkel-, Orthogonalitäts-, Parallelitäts- oder Lagebedingung erfüllt ist.

## Generator

- Provider: OpenAI image generation
- Status: pilot
- Quellbild: `5f90df42-8a71-534d-b995-b8f7dcaf1661.png`
- Public Asset: `/assets/goal-visualizations/mathematik/5f90df42-8a71-534d-b995-b8f7dcaf1661/5f90df42-8a71-534d-b995-b8f7dcaf1661.png`

## Prompt

```text
PROMPTSTUFE 1 VON 2 — INITIALPROMPT

Erzeuge eine fachlich präzise, bewusst einfache Mathematik-Infografik im Querformat 16:9 mit weißem bis sehr hellblauem Hintergrund und ruhigem modernem Schulbuchstil. Ausschließlich deutscher Text, keine Logos/Wasserzeichen. Keine perspektivischen 3D-Bilder und keinerlei Koordinatenpunkte in den Skizzen.

Titel: „Parameterabhängige Winkel und Lagebeziehungen untersuchen“

Zwei gleich große Hauptpanels.

LINKS, blau, „Gerade – Ebene“:
Formelbereich:
E: z=0
g_k: x = (0,0,1)^T + t·(0,k,1)^T
d_k=(0,k,1)^T, n_E=(0,0,1)^T
sin α = |d_k·n_E|/(|d_k|·|n_E|)=1/√(k²+1)

Darunter eine reine zweidimensionale, ausdrücklich beschriftete „Schnittansicht (schematisch)“:
- E ist nur eine dicke horizontale blaue Linie.
- g_k ist nur eine schräge blaue Gerade, die E in genau einem Punkt S schneidet.
- Ab S verläuft eine horizontale blaue Halbgerade innerhalb E nach rechts; sie ist beschriftet „Projektion von g_k in E“.
- Der spitze Winkel α liegt EXAKT am gemeinsamen Punkt S zwischen der schrägen Geraden g_k und der horizontalen Projektionshalbgeraden.
- Keine weiteren Punkte, keine gestrichelten Lotlinien, keine Achsen, keine Koordinaten.

Ergebnisfelder:
α=45° ⇒ k=±1
k=0 ⇒ g_0 ⟂ E
Kleine separate Schnittansicht für k=0: eine vertikale Gerade trifft eine horizontale Linie E mit rechtem Winkel.

RECHTS, grün, „Ebene – Ebene“:
Formelbereich:
E: z=0
F_k: kx+z=1
n_F=(k,0,1)^T, n_E=(0,0,1)^T
cos β = |n_E·n_F|/(|n_E|·|n_F|)=1/√(k²+1)

Darunter eine reine zweidimensionale, ausdrücklich beschriftete „Schnittansicht senkrecht zur Schnittgeraden (schematisch)“:
- E ist nur eine dicke horizontale grüne Linie.
- F_k ist nur eine schräge grüne Gerade, die E in genau einem Punkt S schneidet.
- Der spitze Winkel β liegt EXAKT am gemeinsamen Punkt S zwischen beiden Linien.
- Beschriftung darunter: „Die Linien sind die Schnittspuren der beiden räumlichen Ebenen.“
- Keine 3D-Ebenen, keine Achsen, keine Koordinaten.

Ergebnisfelder:
β=45° ⇒ k=±1
k=0 ⇒ F_0:z=1 parallel zu E:z=0
Kleine separate Schnittansicht für k=0: zwei verschiedene parallele horizontale Linien, oben F_0:z=1, unten E:z=0.

Schlusszeile:
„Parameter einsetzen → Winkel- oder Lagebedingung prüfen → passende k-Werte angeben“

Unbedingt vermeiden:
- keine Koordinatenpunkte oder Achsen;
- keine falsche perspektivische Lage;
- kein Vektor–Vektor-Beispiel;
- Winkel α und β müssen jeweils direkt am Schnittpunkt S der zwei relevanten Linien sitzen;
- Gerade–Ebene: sin α; Ebene–Ebene: cos β;
- bei 45° k=±1;
- g_0 senkrecht, F_0 parallel und verschieden;
- Formeln und Umlaute fehlerfrei und gut lesbar.

PROMPTSTUFE 2 VON 2 — KORREKTURPROMPT AUF DEM INITIALBILD

Korrigiere ausschließlich die beiden großen schematischen Schnittansichten in der vorhandenen Infografik; alle Formeln, Ergebnisfelder, Sonderfälle, Texte, Titel, Farben und das Layout bleiben unverändert.

Linke Schnittansicht Gerade–Ebene:
- Der Schnittpunkt S bleibt auf der horizontalen Linie E.
- Zeichne die schräge Gerade g_k von S aus nach RECHTS OBEN weiter (und optional kurz nach links unten), nicht von S nach links oben.
- Die horizontale Halbgerade „Projektion von g_k in E“ startet ebenfalls exakt bei S und zeigt nach rechts.
- Der kleine spitze Winkel α liegt exakt bei S zwischen dem nach rechts oben laufenden Strahl von g_k und der nach rechts laufenden horizontalen Projektion.
- α muss sichtbar kleiner als 90° sein. Kein Winkelbogen zur falschen Geradenhälfte.

Rechte Schnittansicht Ebene–Ebene:
- Der Schnittpunkt S bleibt auf der horizontalen Linie E.
- Zeichne die schräge Schnittspur F_k von S aus nach RECHTS OBEN weiter (und optional kurz nach links unten), nicht von S nach links oben.
- Der kleine spitze Winkel β liegt exakt bei S zwischen dem nach rechts oben laufenden Strahl F_k und der nach rechts laufenden horizontalen Linie E.
- β muss sichtbar kleiner als 90° sein. Kein Winkelbogen zur falschen Geradenhälfte.

Keine neuen Inhalte und keine Koordinatenachsen hinzufügen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
