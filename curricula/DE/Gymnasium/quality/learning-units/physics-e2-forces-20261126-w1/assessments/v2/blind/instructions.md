# Independent successor marking

Read v2/*.candidate.goal.json, v2/goals.json, all 26 paired responses in v2/blind/scripts.json and their actual linked PNGs, the KG task stimulus, and v2/be6d4895-prerequisite-review.input.json. View the actual images. Do not read v2/author, any earlier author expectations or other marker output. Independently mark every paired response using the v2 rubric. Do not use earlier scores as an authority. Count actual relevant evidence anywhere; no intended score is supplied.

The successor clarifies partial credit and graphic completeness and fixes German drawing-scale grammar. One shared response drawing now contains a detached full construction. Assess it as visible; do not infer missing physical arrows. Also explicitly compare the four ordinary goals in goals.json with the tasks' claimed coverage and identify any mismatch.

Return JSON {marker,isolation,rubricAccepted,bilingualAccepted,standaloneCoverageAccepted,concerns:[],assessmentVerdicts:{KB,KG,KT,KF},cases:[{id,de:{points:{A,B,C,D},total,pass},en:{points:{A,B,C,D},total,pass},reason}],existingAssessmentReview:{...},releaseDecision}. Acceptance is not expected: flag any remaining ambiguous criterion or inconsistent evidence. This review grants no learner results, publication, mandatory offers or CQR enrollment authority.
