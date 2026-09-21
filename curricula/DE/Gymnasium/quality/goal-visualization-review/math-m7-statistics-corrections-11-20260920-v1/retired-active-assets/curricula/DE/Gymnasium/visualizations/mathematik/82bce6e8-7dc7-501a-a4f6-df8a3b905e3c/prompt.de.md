# Lernzielvisualisierung: Gütefunktion und Teststärke untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c`
- Titel: Gütefunktion und Teststärke untersuchen (LK)
- Beschreibung: Die lernende Person kann für einen Hypothesentest die Operationscharakteristik als Wahrscheinlichkeit für das Nichtverwerfen der Nullhypothese und die Gütefunktion als Wahrscheinlichkeit für ihr Verwerfen in Abhängigkeit vom wahren Wert von $p$ unterscheiden, beide grafisch darstellen und den Einfluss von Stichprobenumfang und Signifikanzniveau auf die Teststärke erläutern.

## Generator

- Provider: OpenAI image generation
- Status: pilot
- Quellbild: `82bce6e8-7dc7-501a-a4f6-df8a3b905e3c.png`
- Public Asset: `/assets/goal-visualizations/mathematik/82bce6e8-7dc7-501a-a4f6-df8a3b905e3c/82bce6e8-7dc7-501a-a4f6-df8a3b905e3c.png`

## Prompt

```text
Use case: scientific-educational
Asset type: SkillPilot learning-goal visualization, landscape 16:9
Primary request: Create a mathematically exact German infographic titled "Operationscharakteristik und Gütefunktion unterscheiden" for one right-sided binomial test.
Style/medium: clean modern textbook infographic, white/light blue background, high legibility, no decorative imagery.
Composition: one shared coordinate system is mandatory (not two separate graphs). Horizontal axis "wahrer Wert p", vertical axis "Wahrscheinlichkeit" from 0 to 1. Draw exactly two pointwise complementary curves: blue decreasing L(p)=P_p(H₀ nicht verwerfen), orange increasing G(p)=P_p(H₀ verwerfen)=1-L(p). At one marked p₁ choose visibly complementary heights, for example L(p₁)=β=0,3 and G(p₁)=1-β=0,7=Teststärke. Show "L(p₁)+G(p₁)=1". At a marked null-hypothesis boundary p₀ show "G(p₀)≤α" and "L(p₀)≥1−α". Add two short separate notes: "Größeres n: steilerer Übergang und höhere Teststärke für relevante Alternativen." and "Größeres α: höhere Verwerfungswahrscheinlichkeit, aber auch größeres Risiko eines Fehlers 1. Art."
Constraints: The two curves at every p must be visually complementary about probability 0.5. At p₁ the plotted ordinates must visibly be 0.3 and 0.7, not equal. Correct labels β and Teststärke. Correct German umlauts. No logos, watermark, product name, technical IDs, extra plots, or extra topics.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
