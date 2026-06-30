# Lernzielvisualisierung: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `c92133c6-d5de-4902-936c-321915cf21e9`
- Titel: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)
- Beschreibung: Die lernende Person kann diskrete und stetige Zufallsgrößen unterscheiden und die Verteilungsfunktion der Normalverteilung $\Phi_{\mu,\sigma}(x)=\int_{-\infty}^{x}\varphi_{\mu,\sigma}(t)\,dt$ als Integralfunktion deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `c92133c6-d5de-4902-936c-321915cf21e9.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c92133c6-d5de-4902-936c-321915cf21e9/c92133c6-d5de-4902-936c-321915cf21e9.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)
Beschreibung: Die lernende Person kann diskrete und stetige Zufallsgrößen unterscheiden und die Verteilungsfunktion der Normalverteilung $\Phi_{\mu,\sigma}(x)=\int_{-\infty}^{x}\varphi_{\mu,\sigma}(t)\,dt$ als Integralfunktion deuten.

Zusatzanweisung:
Additional mathematical constraints for this batch:

- Do not include technical IDs in the image.
- Prefer one clear diagram with correct labels over many small formulas.
- For normal density, show a smooth symmetric bell curve centered at `mu`. The curve approaches the x-axis but does not cross it.
- If the density formula is shown, use `f(x)=1/(sigma*sqrt(2*pi))*exp(-0.5*((x-mu)/sigma)^2)`.
- Never present `f(x)` as a point probability. For continuous variables, emphasize area under the curve: `P(a <= X <= b) = integral_a^b f(x) dx`.
- Mark `sigma` horizontally as a distance from `mu` to `mu+sigma` or from `mu-sigma` to `mu`, never as vertical height.
- For calculating with a normal distribution, a safe example is `X ~ N(100, 15^2)` and the central interval `85 <= X <= 115`, interpreted as roughly one standard deviation around the mean.
- For the distribution function, use `F(x)=P(X <= x)`. For continuous variables, show `F(x)=integral_{-infinity}^x f(t) dt` as shaded area to the left of `x`.
- For discrete vs continuous variables, use this contrast:
  - discrete: separate bars, `P(X=k)` can be positive
  - continuous: smooth density curve, `P(X=x)=0`, probabilities are areas over intervals
- For recognizing approximately normal situations, use conditions such as many small independent influences, unimodal bell shape, approximate symmetry, and no hard boundary near the typical values.
- For binomial normal approximation, use `X ~ B(n,p)`, `mu=n*p`, `sigma=sqrt(n*p*(1-p))`. State the rule of thumb `n*p >= 5` and `n*(1-p) >= 5` only if it fits clearly.
- If a binomial approximation example is shown, use `X ~ B(100,0.5)` approximated by `Y ~ N(50,25)`, and show continuity correction such as `P(45 <= X <= 55) approx P(44.5 <= Y <= 55.5)`.
- For Poisson as a limit, show `X_n ~ B(n,p_n)`, `n*p_n -> lambda`, `p_n -> 0`, and the result `P(X=k)=e^{-lambda}*lambda^k/k!`.
- For Poisson context, use rare independent events in a fixed interval with constant average rate `lambda`; do not use a normal bell curve for the Poisson distribution.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
