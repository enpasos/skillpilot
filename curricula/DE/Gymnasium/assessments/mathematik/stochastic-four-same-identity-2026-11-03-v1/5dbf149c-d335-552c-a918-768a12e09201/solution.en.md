**1.** The frequencies total $40$. Symmetry, or the weighted sum, gives $\bar x=100\,\mathrm{ml}$. The weighted sum of squared deviations is
$$2\bigl(1\cdot4^2+3\cdot3^2+5\cdot2^2+7\cdot1^2\bigr)=140\,\mathrm{ml}^2.$$
Thus $s^2=140/40=3.5\,\mathrm{ml}^2$ and $s=\sqrt{3.5}\approx1.8708\,\mathrm{ml}$. Frequencies matter; the nine distinct measurement values are not nine equally weighted observations.

**2.** A first fitted model is
$$X\sim N(100;3.5),$$
with estimated mean $100\,\mathrm{ml}$ and estimated standard deviation about $1.87\,\mathrm{ml}$. The data are approximately bell-shaped, symmetric and unimodal. This supports trying the model, not proving normality. The sample mean and empirical standard deviation are parameter estimates, not exactly known process parameters.

**3.** With $Z\sim N(0;1)$,
$$P(97.5\le X\le102.5)=\Phi\!\left(\frac{2.5}{\sqrt{3.5}}\right)-\Phi\!\left(\frac{-2.5}{\sqrt{3.5}}\right)\approx0.81855.$$
The model therefore assigns about $81.9\%$ of further fills to this range. Also,
$$P(X>104)=1-\Phi\!\left(\frac4{\sqrt{3.5}}\right)\approx0.01625,$$
or about $1.63\%$ above $104\,\mathrm{ml}$. These are model predictions assuming a still-comparable filling process. No continuity correction is required: the range is stated for continuous $X$, not a binomial approximation or rounded categories.

**4.** The interval contains $5+7+8+7+5=32$ observations, giving $32/40=0.80$. This is close to the predicted $0.81855$ and is not an obvious contradiction in a sample of 40. Closeness of one proportion nevertheless establishes neither the entire distributional shape nor accurate tail probabilities. Suitable specific limitations include finite sample size and uncertain parameter estimates; rounding; possible drift or dependence between fills; sparsely observed tails; or the unbounded mathematical normal distribution versus physically non-negative volumes. One explained relevant limitation suffices. With these parameters the extremely distant negative tail would be practically negligible; that is not a proof of the distributional assumption.

**Partial credit:** 2 points for the weighted mean; 2 for the weighted variance calculation and 1 for standard deviation. Award 2 for an unambiguous fitted model, 1 for data shape and 1 for recognising estimation. Award 2 for the interval expression/result and 1 for its interpretation; 1 for the upper-tail expression/result and 1 for its interpretation. Award 2 for $32/40$, 2 for a sound comparison without claiming proof of normality and 2 for an explained specific limitation. Consistent use of divisor $m-1$ differs from the stated convention: deduct at most 1 point for the variance convention, then credit correct follow-through and a sensible model fitted using that convention. Its expected numerical probabilities change accordingly.



**Ordinary overall grading:** Partial credit yields exactly one total score. After the ordinary cap stated below, compare it with the single passing threshold. There are no part-pass fields or additional prerequisite-evidence requirements.

Credit relevant work wherever it appears in the submission, including tables, sketches, calculations and concise comments. Wording matching the reference and duplicate explanations in separate parts are unnecessary. Mathematically equivalent methods are accepted. Deduct for a local arithmetic, graph-reading, sign or copying error specifically and only once; award correctly executed follow-through. One incorrect value does not mean an entire core action is absent. Do not assume work not shown. This rubric grades only the new task; it changes neither graph rules nor existing mastery.

The raw total ranges from 0 to 20; the single passing threshold is 15. Cap the total at 14 if the entire submission lacks actual data-based parameter fitting, contains no identifiable work on a range probability using a normal model, or contains no contextual, reasoned statement about the limited evidential value of the comparison or a specific model limitation. A wrongly calculated s following a correct data-based setup does not trigger the cap. A concise valid critique or a limitation already explained in the comparison counts; no fixed uncertainty formula or formal test is required.

