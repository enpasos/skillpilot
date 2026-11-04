# One overall result

There is one total score out of 20 points and exactly one binary overall
result: **pass at 15 points**, otherwise not passed. Partial marks have no
separate pass thresholds.

Credit equivalent mathematical methods and traceable work wherever they
appear in the submission. Count identical work only once. Award partial
marks as specified, otherwise 0.5 points for meaningful but incomplete work.
Do not repeatedly penalise one local calculation or transcription error;
correct traceable follow-through retains its credit. Such a local error alone
does not trigger an overall cap. Concise correct explanations and equivalent
notation are sufficient; no particular wording or fixed order is required.

| Criterion | Points |
|---|---:|
| n=187 and phi=160, 1 each; coprimality/inverse condition modulo phi (1); d=23 with check or derivation (1). | 4 |
| Clearly states the public key (1); private key (1); explains the different related keys and sender/recipient roles (1). | 3 |
| Suitable modular exponentiation for m=20 (1); c=147 (1). | 2 |
| Suitable modular exponentiation for m=11 (1); c=88 (1). | 2 |
| Both decryptions using a traceable method, 1 each: 0.5 calculation and 0.5 recovery. | 2 |
| Reduces encryption/decryption to m to the power ed, with ed=161=1+160. | 1 |
| Sound Fermat/exponent argument for nonzero residues modulo 11. | 1 |
| Sound Fermat/exponent argument for nonzero residues modulo 17. | 1 |
| Includes zero-residue cases generally (1); correctly relates m=11 and evaluates the blanket Euler substitution and its missing hypothesis (1). | 2 |
| Combines the two prime-modulus results using CRT (1); explains unique recovery over the complete message range including 0 (1). | 2 |

Before comparison with the pass threshold, cap the total score at 14 points if, across the whole submission, the asymmetric key roles are entirely absent or replaced by a single shared-secret-key role, no traceable RSA encryption of a message is present, or a sound general recovery justification including messages not coprime to n is entirely absent. In particular, an Euler step valid only for coprime messages does not replace the missing treatment of messages divisible by p or q; a valid treatment elsewhere counts. Merely checking the two numerical examples does not replace a general justification. A concise correct prime-modulus/CRT argument or an equivalent general justification is sufficient. Isolated local calculation errors, incomplete secondary details, or failure to name a theorem already correctly used do not trigger this cap.

Multiple applicable reasons still impose only the same cap of 14 points. Compare the one resulting total with 15 points. There are no additional part-pass decisions.
