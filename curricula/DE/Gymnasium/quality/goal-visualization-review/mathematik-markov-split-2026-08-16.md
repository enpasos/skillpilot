# Goal Visualization Review – Mathematik Markov Split

Review date: 2026-08-16

Status: `completed`

Scope: two new atomic Markov goals created from the retained broad cluster.

| Goal ID | Goal | Decision | Final SHA-256 | Review notes |
| --- | --- | --- | --- | --- |
| `10a33d93-dc20-5edd-ae3b-32338d05407c` | Zustände in Markov-Ketten vorwärts berechnen und deuten | `accepted_pilot_after_regeneration` | `sha256:c70950b5a95a1fda40df8146972fc3dacf96d6bdfb73b228ad22e14864ff3d38` | Column-vector convention and left matrix multiplication are explicit. $M=\bigl(\begin{smallmatrix}0.7&0.2\\0.3&0.8\end{smallmatrix}\bigr)$ has column sums 1; $x_1=(0.50,0.50)^T$ and $x_2=(0.45,0.55)^T$ are correct. The transition labels are A→B 0.3 and B→A 0.2 after two targeted corrections. |
| `3d4d510c-0fd7-55ea-9b79-1db8d640758f` | Rückwärtsrechnen in Markov-Ketten auf Zulässigkeit und Eindeutigkeit prüfen | `accepted_pilot` | `sha256:81c28760394a4229429a65c74d320364fe081e465107f3218525e14e3cd2343c` | The image distinguishes predecessor calculation, validity and uniqueness. $Mx_0=x_1$, $x_0=(0.60,0.40)^T$, nonnegativity, sum 1 and $\det(M)=0.50\neq0$ are correct. Warning cases correctly separate negative components from singular matrices. |

Both images were generated with OpenAI built-in image generation and imported with the repository's standard visualization importer. The old cluster image remains as immutable historical source material but is not referenced because it only depicts forward calculation and would misrepresent the retained broad cluster.
