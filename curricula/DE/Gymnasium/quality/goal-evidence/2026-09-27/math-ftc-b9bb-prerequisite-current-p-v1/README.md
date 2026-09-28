# Current P-v2 evidence for the Fundamental-Theorem goal b9bbd2a8

The canonical goal now asks learners to use a suitable antiderivative for $F(b)-F(a)$ and explain the signed area balance. Constructing polynomial antiderivatives independently belongs to prerequisite `31be24f0-3ab1-54d2-856d-fa9b7f36552f`; it is not a separate success condition in this profile. Both fresh cases therefore supply `F` and assess the theorem: endpoint difference and cancellation of additive constants in one case, then an accumulation function with variable upper bound and reversed orientation in the other.

The active PNG (SHA-256 `00d1970fc7a39e34038b04a78f4f776b6e79e3b4e4c079227f06c224c2466884`) shows `f(x)=2x−2` on `[0,3]`, with signed areas `−1` and `+4` and integral `3`. The former first case, `f(x)=x−1` on that same interval, would be only half of the pictured function and is not fresh enough. It was replaced: for the falling line `f(x)=2−x` on `[0,4]`, the signed integral is `0` versus total positive area `4`. The second case, `f(t)=2t+1`, gives `A(x)=∫₁ˣf(t)dt=x²+x−2`, `A′=f`, and `A(0)=−2` because the bounds reverse direction.

`materialize-retained.mts` pins the old three-record B038r review to SHA-256 `82845bc7ca4ae4c9db717e6ce9e3466c5d202bed3ab43cdf76c1e35be317f2fe` and carries the two J10 logarithm records forward byte-for-byte. The central registry replaces the old three-goal config with this retained-two config and the current one-goal config, leaving no overlapping active scope. The old files remain audit history.

The new profile is `needs_human_review / ai_candidate`, E1/G1. Structural P-v2 success is neither human approval nor D resolution or strict Mathematics M7 closure.
