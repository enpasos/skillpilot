# Q2-Pilotreview: Rückwärtsrechnen in Markov-Ketten

Status: `needs_review`

Review date: 2026-08-16

Canonical assessment goal: `57aff94e-91b8-5cc6-9f85-3f317ecf36ca`

## Scope and decision

The existing canonical Q2 assessment was extended by one five-point task that provides genuine evidence for both atomic Markov goals. The frozen Hessen assessment remains unchanged; its mapping to the expanded canonical assessment is therefore `partial`.

The task states the column-vector convention explicitly. It asks for two immediate predecessor states under the same transition matrix: one valid population distribution and one algebraically unique but invalid vector with a negative component. This distinguishes algebraic uniqueness from validity as a distribution.

## Mathematical review

For

$$
M=\begin{pmatrix}0.92&0.05\\0.08&0.95\end{pmatrix}
$$

the two supplied later states are correct:

$$
M\begin{pmatrix}12000\\6000\end{pmatrix}=\begin{pmatrix}11340\\6660\end{pmatrix},
\qquad
M\begin{pmatrix}19000\\-1000\end{pmatrix}=\begin{pmatrix}17430\\570\end{pmatrix}.
$$

Moreover, $\det(M)=0.87\neq0$, so both algebraic predecessors are unique. The first is valid because its components are nonnegative and sum to $18{,}000$. The second is invalid because one component is negative; uniqueness rules out another valid immediate predecessor. Determinants are offered only as one correct justification, not prescribed as the learner's method.

## Scoring review

- 2 points: valid predecessor case
- 2 points: invalid predecessor case
- 1 point: uniqueness and its consequence
- Total assessment: 25 points
- Passing threshold: 13 points

## Required human decision

Please approve or reject the five-point extension described above. It is
necessary because the new backward-calculation goal otherwise has no terminal
assessment that observes validity and uniqueness separately. The existing
twenty-point assessment remains unchanged apart from this added task and the
corresponding point total.

Decision: `pending_human_approval`
