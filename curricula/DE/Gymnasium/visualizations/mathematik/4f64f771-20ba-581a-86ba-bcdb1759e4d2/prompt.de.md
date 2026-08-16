# Lernzielvisualisierung: Komplexe Zahlen in Polarform und Gaußscher Zahlenebene darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `4f64f771-20ba-581a-86ba-bcdb1759e4d2`
- Titel: Komplexe Zahlen in Polarform und Gaußscher Zahlenebene darstellen
- Beschreibung: Die lernende Person kann komplexe Zahlen in der Gaußschen Zahlenebene und in Polarform $z=r\cdot e^{i\varphi}=r\cdot(\cos\varphi+i\cdot\sin\varphi)$ mit $r\ge 0$ darstellen, ihren Betrag und für $z\ne 0$ ein Argument bestimmen sowie Darstellungen mit $\varphi=\omega t$ fachsprachlich deuten.

## Generator

- Provider: OpenAI image generation
- Status: pilot
- Quellbild: `4f64f771-20ba-581a-86ba-bcdb1759e4d2.png`
- Public Asset: `/assets/goal-visualizations/mathematik/4f64f771-20ba-581a-86ba-bcdb1759e4d2/4f64f771-20ba-581a-86ba-bcdb1759e4d2.png`

## Prompt

```text
Erzeuge eine fachlich präzise, klar lesbare Mathematik-Infografik im Querformat (16:9) mit weißem bis sehr hellblauem Hintergrund und ruhigem, modernem Schulbuchstil. Verwende ausschließlich deutschen sichtbaren Text, echte Umlaute und gut lesbare mathematische Notation. Keine Logos, Wasserzeichen, technischen IDs, Produktnamen oder dekorativen Figuren. Wenig Text und keine zusätzlichen Themen.

Titel: Komplexe Zahlen in Polarform darstellen

Hauptbereich links: Gaußsche Zahlenebene
- Waagerechte Achse: Re(z), senkrechte Achse: Im(z).
- Zeichne den Punkt z = 3 + 4i bei den Koordinaten (3,4).
- Zeichne den Ortsvektor vom Ursprung zum Punkt.
- Beschrifte seine Länge mit r = |z| = 5.
- Markiere den gegen den Uhrzeigersinn von der positiven reellen Achse gemessenen Winkel φ.
- Zeige als kurze Beziehung: φ = arctan(4/3) ≈ 53,1°.

Formelfeld in der Mitte, groß und fehlerfrei:
z = 3 + 4i = 5·(cos φ + i·sin φ) = 5·e^(iφ)

Allgemeines Merksatzfeld:
z = r·e^(iφ) = r·(cos φ + i·sin φ),  r ≥ 0
Für z ≠ 0 ist φ ein Argument von z.

Kleiner Bereich rechts „Drehung mit der Zeit“:
- Zeichne einen Kreis mit festem Radius r und einen Zeiger bei Winkel φ=ωt.
- Formel: z(t)=r·e^(iωt)
- Kurze Beschriftung: „ω: Winkelgeschwindigkeit“.
- Bei positivem ω zeigt ein kleiner Pfeil gegen den Uhrzeigersinn.

Vermeiden:
- Den Faktor r niemals weglassen; die allgemeine Polarform ist nicht auf den Einheitskreis beschränkt.
- Nicht z=e^(iφ) als allgemeine Polarform darstellen.
- Real- und Imaginärachse nicht vertauschen.
- Den Punkt 3+4i nicht an einer anderen Koordinate platzieren.
- Betrag und Argument nicht verwechseln.
- Für z=0 kein Argument behaupten.
- Keine falsche Gleichung wie r=φ oder |z|=3+4.
- Keine Dezimalpunkte; sichtbare Dezimalzahl als 53,1° schreiben.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
