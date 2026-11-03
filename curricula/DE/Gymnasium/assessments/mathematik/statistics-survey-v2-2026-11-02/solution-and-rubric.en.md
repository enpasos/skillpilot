# Reference solution and normal overall rubric

This is a non-exclusive reference. Correct equivalent fractions, percentages, labelled contingency tables and other traceable representations receive equivalent credit. The numbers initially describe the 250 voluntary responses, not automatically the school. There is one score out of 56 and a passing score of 45; apply the ordinary overall cap below before comparison.

## A. Critical evaluation

**1. Conditional proportions.** Of 150 app users, 99 cycle regularly; among 100 non-users, 34 do so. In total, 133 of the 250 respondents cycle regularly. Hence

$$
P(R\mid A)=\frac{99}{150}=0.66,\qquad
P(R\mid\overline A)=\frac{34}{100}=0.34,\qquad
P(A\mid R)=\frac{99}{133}\approx0.7444.
$$

The reference groups are app users, non-users, and all regular cyclists among the respondents. “What proportion of app users cycle regularly?” differs from “What proportion of regular cyclists use the app?” Interchanging condition and outcome changes the question.

**2. Subgroups.** For short journeys, the app-user rate is $96/120=80\%$ and the non-user rate is $18/20=90\%$. For long journeys, these are $3/30=10\%$ and $16/80=20\%$. The observed user rate is ten percentage points **lower** within each journey group, although it is 32 percentage points higher overall. The aggregate calculations are not arithmetically wrong; they compare differently composed groups.

**3. Composition and base rates.** Short journeys account for $120/150=80\%$ of app users but only $20/100=20\%$ of non-users. Short journeys are associated with more cycling in these data. The app group contains many more of these students, so its total rate can be higher despite a lower rate within both subgroups.

Using the same specified 40/60 mixture gives

$$
0.4\cdot0.8+0.6\cdot0.1=0.38,
\qquad 0.4\cdot0.9+0.6\cdot0.2=0.48.
$$

With equal journey weights, the numerical comparison is thus 38% versus 48%. These are still not established school rates or causal effects: the subgroup observations themselves come from selective volunteers. Weighting by one variable does not remove every bias.

**4. Design and sample.** The cycling club and app newsletter are unlikely to reach everyone equally. Cycling interest and app use may influence both access and willingness to respond. Respondents were not randomly selected from all 1,000 students. The number 250 is a sample size, not proof of representativeness.

There are 140 short-journey respondents out of 250, or 56%, compared with 400 out of 1,000, or 40%, in the school. Composition already differs on this known variable. Some subgroups are much smaller than 250: for example, 20 short-journey non-users or 30 long-journey users. Reclassifying one answer changes these rates by five or about 3.3 percentage points. No particular margin of error or significance conclusion is required; sample size alone would not justify one without a sampling model.

**5. Question and display.** “Our useful app makes young people cycle more often” praises the app and presupposes its effect. A neutral question is: “On how many of the five school days in the specified reference week did you cycle to school?” App use should be asked separately with a defined meaning. A neutral yes/no question about at least three days also measures the original indicator appropriately.

The published 66% and 34% do not refer to “all students”; they refer to the **respondents within each app group**. A suitable heading is “Regular cyclists among respondents, by app use”. Group sizes 150 and 100 and the definition “at least three of five days” should appear alongside. “Doubles” is not exactly the ratio $66/34$ either, although the unsupported causal interpretation matters more than rounding.

**6. Explanatory power and cause.** This is an observed association. There was no random assignment and no before-use measurement. Journey length, previous cycling habits and self-selection may relate to both app use and cycling. Neither the positive aggregate association nor the negative subgroup association proves a causal effect. “The app demonstrably causes harm” is unsupported too.

One replacement report: “Among 250 voluntary respondents, 66% of app users and 34% of non-users cycle regularly, but their journey lengths differ substantially. Within both short and long journey groups, the observed user rate is lower. Voluntary selection and lack of controlled comparison prevent generalisation to all students or a causal claim about the app.” Other concise, accurate reports are equally acceptable.

## B. Own plan and actual example recording

**7. Selection plan.** The population is all 1,000 students during the specified week. A proportionately stratified random sample selects, without replacement, 40 of the 400 short-journey codes and 60 of the 600 long-journey codes. Selection probabilities are equal within each stratum and here equal 0.1 in both. All selected students receive access through the same neutral school channel, regardless of app use or club membership. Identical clear questions refer to the same five days.

Participation remains voluntary; selection and responses are distinguished. A prespecified procedure could send everyone one identical reminder, then report response/non-response counts by journey group and retain missing values openly. Arbitrary extra volunteers must not silently replace selected non-respondents. Other traceable random procedures within the explicitly required proportional stratification are equivalent; their allocations here are 40/60.

**8. Variables and example codebook, version 1.**

| Field | Meaning and permitted values | Purpose |
| --- | --- | --- |
| Record/person code | anonymous unique code | trace to source and prevent duplicate counting |
| Journey group | S: at most 3 km; L: more than 3 km | agreed strata and later subgroup descriptions |
| Cycling days | number of different school days in the week, integer 0–5 | measured behaviour; multiple trips on one day count as one day |
| App | Y/N: used at least once in the reference week or not | describe app groups with one observable definition |
| Regular | Y for at least 3 cycling days, otherwise N; uncertain where the day count is unresolved | a consistent derived measure rather than subjective frequency words |
| Status/note | V: valid; M: missing/uncertain; E: outside the allowed range | retain problems visibly rather than treating them as zero |

Journey group establishes the comparison structure, day count measures the behaviour of interest, and app use permits grouping. None by itself proves an app effect. Neutral questions specify week, days and app use without praise or a presupposed effect. Alternative clear variable names and missing-value codes are equally valid if documented.

**9. Completed example recording.** Here “NA” means that a unique valid day count cannot be recorded; the raw record is retained.

| Record | Journey | App | Cycling days | Status | Regular | Raw-record/check reference |
| --- | --- | --- | ---: | --- | --- | --- |
| P01 | S | Y | 4 | V | Y | four cycling entries in P01 diary |
| P02 | L | N | 0 | V | N | no cycling entry in P02 diary |
| P03 | L | Y | 3 | V | Y | Mon, Wed and Thu in P03 |
| P04 | S | N | NA | M | unresolved | two known cycling days; Tue unknown, hence 2 or 3 possible |
| P05 | S | Y | NA | E | unresolved | raw “6 days” conflicts with the permitted range 0–5 |
| P06 | L | N | 2 | V | N | Mon and Fri in P06 |

For P04, the possible interval 2–3 may additionally be stored; it does not determine the yes/no category. P05 is neither clipped to 5 nor reinterpreted as 0. Clarification could be sought in a real subsequent collection, but no answer is supplied here. Four day values are valid and two unresolved/invalid. These six purpose-selected cases do not establish a representative school proportion.

**10. Example recording log.** “Task pilot material, records P01–P06; common specified five-school-day week; codebook version 1. Counted cycling diary days per record and coded the threshold of at least 3. Checked permitted range 0–5 and retained raw records and problem reasons. P04 unresolved because one day is unknown; P05 flagged for six days. Four valid and two unresolved/invalid day counts. Recording was performed on these six supplied records; the planned 100-person random survey was not carried out.” Other concise, traceable logs are equally acceptable.

## Granular point allocation

| Step | Points | Partial credit |
| --- | ---: | --- |
| A1 | 6 | three correct proportions, 1 each; appropriate reference groups/denominators, 2 together; direction distinction, 1 |
| A2 | 6 | four subgroup rates, 1 each; opposite within-journey comparisons, 1 together; contrast with aggregate comparison, 1 |
| A3 | 6 | 80/20 and 20/80 journey composition, 2 together; weight explanation, 1; two weighted rates, 1 each; limits of numerical comparison, 1 |
| A4 | 5 | concrete access/response selection criticism, 2; 56% versus 40% or corresponding counts, 1; a smaller subgroup and uncertainty, 1; sample size alone cannot justify generalisation, 1 |
| A5 | 5 | explains leading wording and gives neutral question, 2 together; identifies incorrect reference population, 1; correct table heading, 1; clear group sizes/indicator definition, 1 |
| A6 | 4 | distinguishes association/cause using a specific missing control, 2; negative association is not proof of harm either, 1; accurate replacement report, 1 |
| B7 | 6 | population/frame, 1; proportional 40/60, 1; executable random selection without duplication, 1; neutral access/common period, 1; documented non-response plan, 1; explains avoiding club/app volunteers only, 1 |
| B8 | 6 | three clear variable definitions, 1 each; justifies purposes, 1; neutral wording/reference week, 1; distinguishes missing/invalid codes, 1 |
| B9 | 8 | four valid day counts, 0.5 each (2); P04 unresolved with reason, 1; P05 invalid without invention, 1; four valid regular categories, 0.5 each (2); two unresolved categories, 0.5 each (1); connects all six codes/journey/app fields and raw references, 1 |
| B10 | 4 | source/codes/reference week, 1; documented codebook/recording steps, 1; traceable quality checks, 1; 4/2 tally and distinction between processed material and merely planned random survey, 1 |
| **Total** | **56** | **Pass at 45 after the ordinary overall cap.** |

Do not repeatedly penalise the same arithmetic or counting error. Consistent later quotients, comparisons, categories and interpretations receive their own follow-through credit unless they contain an independent conceptual error. In particular, a correctly derived threshold category may earn credit after an earlier count error. Evaluate free text by mathematical substance, not wording identical to this reference. More than one justified sampling method, neutral question and clear coding convention is acceptable.

**Normal total-score cap:** First add the existing partial-credit marks into one overall score. This score is capped at 44 out of 56 if any of the following core actions is entirely absent from the whole response or replaced solely by a fundamentally incorrect claim:

- a traceable conditional subgroup comparison;
- a sound explanation of how the app groups' different journey compositions affect the aggregate comparison; merely listing subgroup rates or comparing the sample with the school does not replace this explanation;
- concrete criticism of the original survey/selection method;
- a sound contextual assessment of the sample size or subgroup sizes and what they mean for the strength of the claims; a brief valid explanation suffices, without a prescribed uncertainty formula;
- reasoned critical evaluation of the original leading question;
- reasoned critical evaluation of the misleading published display and its reference group;
- a correct distinction between observed association and cause;
- an executable selection plan of your own;
- a substantive justification for the variables in your own recording plan; merely defining or copying them is not yet a justification;
- an actually populated recording table traceable to the raw records.

Relevant sound work counts anywhere in the response, even outside the suggested numbered part. A new neutral question or correctly calculated proportions alone do not replace criticism of the original material; they may demonstrate that criticism when their connection to its actual problem is explained. Brief valid reasons, equivalent methods and other clear codes receive credit. Individual calculation, counting, transcription or wording errors, and incomplete secondary details within a substantively demonstrated core action do not trigger the cap; use the existing partial-credit and follow-through rules for these. No particular label, uncertainty formula, codebook notation or full marks in each part are required. Traceably recording the explicitly fictional pilot material counts as an exemplar recording actually carried out; it does not claim a real survey.

After this single overall cap, compare the one total score with 45. There are no additional part-pass decisions.
