# Independent blind marking

Read the four candidate.goal.json files, the paired DE/EN learner responses in scripts.json, the actual linked PNG drawings (view them), and the scaled KG stimulus. Mark each response independently against that exact rubric. Do not read author/expectations.json, other marker responses, or release records. The author sealed expectations separately before the markers started.

Some scripts deliberately omit a named block while sharing a base drawing: only evidence visible in that response and its actual drawing may count. If a base drawing provides evidence despite a textual omission, count the drawing and flag the mismatch; do not infer the author's intended score.

Return JSON: {marker, isolation, rubricAccepted, bilingualAccepted, standaloneCoverageAccepted, concerns:[], cases:[{id,de:{points:{A,B,C,D},total,pass},en:{points:{A,B,C,D},total,pass},reason}], releaseDecision}. Include all cases. State flaws candidly; acceptance is not expected. Review the four goal texts in goals.json if present. Existing be6d4895 review: B is added only as prerequisite; its task/solution/scoring/coveredGoalIds remain byte-identical, and passing that mixed exam does not establish B. Assess its prerequisite relevance, coverage preservation and source frozen-transfer retirement; no additional learner credit.
