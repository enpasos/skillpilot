# Current positive-understanding evidence for 31be24f0

The canonical goal now asks learners to construct an antiderivative of a polynomial function **without aids** and verify their own result by differentiation. This is narrower than the old positive-evidence record, which also tested a definite integral and reconstruction from a supplied antiderivative. Those old cases no longer establish this goal and must not be retained by changing only fingerprints.

The current primary image (SHA-256 `3e1a2c03a680c44de63a43d149598085f6f0185ee77bc1ea465c230946576ec1`) shows `f(x)=3x²+2x → F(x)=x³+x² → F′(x)=f(x)`. It teaches one example, not learner mastery. This candidate tests two fresh examples with different functions: an expanded polynomial and a factorized polynomial with a constant term. Both require an independently formed antiderivative and its complete derivative check. Neither asks for a definite integral or reconstruction from supplied `F`.

`materialize-retained.mts` pins the old ten-record file to SHA-256 `88353cc18414653b8fe0ff6ec42e62b1593b9adb4aa6fa81f02f6a57032eb6ea` and carries nine records forward byte-for-byte. Only the `31be24f0` record was replaced in that step. Following the sourced retirement of the duplicate `6b2a1c04` goal as a compatibility cluster, `materialize-retained-eight.mts` now pins those nine historical records and carries the other eight forward unchanged. The central P registry points to the eight-record config and the one-goal current config, avoiding an active positive-evidence claim for the retired goal. Both earlier files remain intact as audit history.

The profile is `needs_human_review / ai_candidate`, E1/G1. A passing P-v2 structural check means the current, image-bound candidate is usable in that AI lane; it does not grant human approval, settle the separate D review, or establish strict Mathematics M7 completion.

Targeted checks:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/materialize-retained.mts
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/materialize-retained-eight.mts
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/retained-first15-eight.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-antiderivative-31be-current-p-v1/positive-evidence.config.json
```
