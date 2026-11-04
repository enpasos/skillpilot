"""Independent exact checks for the frozen four-form content review.

No author check program is imported or executed. This program writes only into
the reviewer's own output directory. Grading judgments are separately explained
in review.md and the concrete counterexample; arithmetic is not content approval.
"""
from pathlib import Path
import hashlib
import json
import sympy as s

OUT = Path(__file__).resolve().parent
H = OUT.parent
REPO = H.parents[2]
GOALS = [
    "492463cf-6cb2-5a5a-98e0-c1d77c36c256",
    "a9fde754-51b4-58d7-85e5-5e36160581e6",
    "edaf0bb4-e12e-5a6c-b484-91124ba209f3",
    "fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc",
]


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


checks = []


def check(goal, name, condition, evidence):
    checks.append({"goalId": goal, "check": name, "pass": bool(condition), "evidence": evidence})
    assert condition, name


manifest = json.loads((H / "review-input-manifest.json").read_text())
bound_files = []
for f in manifest["files"]:
    p = REPO / f["path"]
    assert sha(p) == f["sha256"] and p.stat().st_size == f["bytes"], str(p)
    bound_files.append(f)
assert len(bound_files) == 52
assert sha(H / "review-input-manifest.json") == "b0f6fb93d4fe29ed7688aa750413177412280da114e4d84405762949b32430e1"
assert sha(H / "content-review-handoff.json") == "585943faa0c0d5aea502ee1895fc7edd9d13d57534f24257109c9fcfd5efe71c"

canonical = json.loads((REPO / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").read_text())
live = {g["id"]: g for g in canonical["goals"]}
contracts = []
for gid in GOALS:
    d = H / gid
    old = json.loads((d / "current-whole-goal.json").read_text())
    new = json.loads((d / "proposed-whole-goal.draft.json").read_text())
    whole = json.loads((d / "whole-contract.before-after.json").read_text())
    assert old == whole["wholeCurrentGoal"] == live[gid]
    assert new == whole["wholeProposedGoal"]
    changes = sorted(k for k in set(old) | set(new) if old.get(k) != new.get(k))
    assert changes == ["examData", "nodeKind"]
    assert new["nodeKind"] == "exam"
    assert new["examData"]["coveredGoalIds"] == [gid]
    assert new["examData"]["reviewStatus"] == "draft"
    scoring = new["examData"]["scoring"]
    assert sum(x["points"] for x in scoring["steps"]) == scoring["maxPoints"] == 20
    assert scoring["passingPoints"] == 15
    for lang, suffix in [("de", ""), ("en", "En")]:
        task = (d / f"task.{lang}.md").read_text().strip()
        solution = (d / f"solution.{lang}.md").read_text().strip()
        rubric = (d / f"rubric.{lang}.md").read_text().strip()
        assert task == new["examData"]["taskContent" + suffix].strip()
        assert solution + "\n\n" + rubric == new["examData"]["solutionContent" + suffix].strip()
    contracts.append({
        "goalId": gid, "onlyAddedFields": changes,
        "liveOriginalMatches": True,
        "externalTextsMatchEmbeddedExam": True,
        "bindings": [{"path": str(p.relative_to(REPO)), "sha256": sha(p)} for p in [
            d / "current-whole-goal.json", d / "proposed-whole-goal.draft.json",
            d / "whole-contract.before-after.json",
            *[d / f"{kind}.{lang}.md" for kind in ["task", "solution", "rubric"] for lang in ["de", "en"]],
        ]],
    })

t, a, r, u, x, y, z, lam = s.symbols("t a r u x y z lam", real=True)
M = s.Matrix
gid = GOALS[0]
P, Q = M([5, 3, 8]), M([11, 0, 5])
v = (Q - P) / 3
x0 = P - 2 * v
motion = x0 + t * v
check(gid, "velocity", v == M([2, -1, -1]), str(v.T))
check(gid, "initial-position", x0 == M([1, 5, 10]), str(x0.T))
check(gid, "both-observations", motion.subs(t, 2) == P and motion.subs(t, 5) == Q, "x(2)=P; x(5)=Q")
check(gid, "evaluation", motion.subs(t, 6) == M([13, -1, 4]), "x(6)=(13,-1,4)")
check(gid, "displacement", motion.subs(t, 4) - motion.subs(t, 1) == M([6, -3, -3]), "x(4)-x(1)=3v")
check(gid, "R-unique-and-in-range", s.solve(list(motion-M([15, -2, 3])), [t]) == {t: 7} and 0 <= 7 <= 8, "Only t=7")
check(gid, "S-no-common-time", s.solve(list(motion-M([15, -1, 3])), [t]) == [], "x,z require t=7; y requires t=6")

gid = GOALS[1]
g = M([2, -3, 6]) + r*M([1, 2, -2])
for coord, expected_r, expected_point, plane in [
    (2, s.Integer(3), M([5, 3, 0]), "xy"),
    (1, s.Rational(3, 2), M([s.Rational(7, 2), 0, 3]), "xz"),
    (0, s.Integer(-2), M([0, -7, 10]), "yz"),
]:
    check(gid, plane+"-unique-parameter", s.solve(g[coord], r) == [expected_r], str(expected_r))
    check(gid, plane+"-both-memberships", g.subs(r, expected_r) == expected_point and expected_point[coord] == 0, str(expected_point.T))
check(gid, "zeroing-coordinate-counterexample", s.solve(list(g-M([2, -3, 0])), [r]) == [], "(2,-3,0) belongs to xy but not g")
check(gid, "contained-line", (M([1, 2, 0])+u*M([2, -1, 0]))[2] == 0, "h: z=0 for all u")
check(gid, "strictly-parallel-line", (M([1, 2, 4])+u*M([2, -1, 0]))[2] == 4, "k: z=4 never zero; direction z=0")

gid = GOALS[2]
ga = M([0, a-1, a*(a-1)])+r*M([1, a, 0])
dh = M([1, 0, 0])
dg = M([1, a, 0])
check(gid, "nondegenerate-all-real-a", dg[0] == 1, "Direction first component always 1")
check(gid, "h-complete-necessary-root-set", s.solve(ga[2], a) == [0, 1], "z=a(a-1)=0 iff a=0 or 1")
check(gid, "h-parallel-directions-only-a0", s.solve(list(dg.cross(dh)), [a]) == {a: 0}, "dg cross dh=(0,0,-a)")
check(gid, "a0-parallel-but-disjoint", ga.subs(a, 0)[1] == -1 and dg.subs(a, 0) == dh, "g0 has y=-1; h has y=0")
check(gid, "a1-unique-origin", s.solve([ga.subs(a, 1)[1], ga.subs(a, 1)[2]], [r]) == {r: 0} and ga.subs({a: 1, r: 0}) == M([0, 0, 0]), "r=0")
check(gid, "remaining-a-skew-proof", s.factor(ga[2]) == a*(a-1) and dg.cross(dh) == M([0, 0, -a]), "For a outside {0,1}: nonzero height and nonparallel directions")
check(gid, "k-complete-root-set", s.solve(a*(a-1)-2, a) == [-1, 2], "(a-2)(a+1)=0")
for av, uv in [(-1, -2), (2, 1)]:
    check(gid, f"k-both-memberships-a{av}", ga.subs({a: av, r: 0}) == M([0, uv, 2]), f"r=0; u={uv}")
check(gid, "distinct-k-intersections", ga.subs({a: -1, r: 0}) != ga.subs({a: 2, r: 0}), "(0,-2,2) != (0,1,2)")

gid = GOALS[3]
ea = (a-1)*x+y+a*z-(a+1)
f = y+z-2
gg = y+z-3
L = {x: t, y: 1+t, z: 1-t}
check(gid, "nondegenerate-plane-all-a", s.diff(ea, y) == 1, "Normal second component always 1")
check(gid, "E0", s.expand(ea.subs(a, 0)) == -x+y-1, "-x+y=1")
check(gid, "E1-is-F", s.expand(ea.subs(a, 1)-f) == 0, "Entire F is intersection at a=1")
check(gid, "F-elimination-factor", s.expand((ea-f)-(a-1)*(x+z-1)) == 0, "(a-1)(x+z-1)=0")
check(gid, "intersection-direction-and-point", s.expand(ea.subs(L)) == 0 and s.expand(f.subs(L)) == 0, "L=(0,1,1)+t(1,1,-1), valid for every a")
check(gid, "common-set-exact-via-E0-E1", s.solve([ea.subs(a, 0), ea.subs(a, 1)], [y, z]) == {y: x+1, z: 1-x}, "Intersection of E0 and E1 is exactly L")
check(gid, "counterexample-common-set-via-E0-E2", s.solve([ea.subs(a, 0), ea.subs(a, 2)], [y, z]) == {y: x+1, z: 1-x}, "Same exact argument can omit all E1 analysis")
check(gid, "point-unique-parameter", s.solve(ea.subs({x: 2, y: 0, z: 1}), a) == [s.Rational(3, 2)], "a=3/2")
check(gid, "point-substitution-check", ea.subs({a: s.Rational(3, 2), x: 2, y: 0, z: 1}) == 0, "1+0+3/2=5/2")
ng = M([0, 1, 1])
na = M([a-1, 1, a])
check(gid, "G-parallel-normal-only-a1", s.solve(list(na-lam*ng), [a, lam]) == {a: 1, lam: 1}, "Second component fixes scale; first and third fix a=1")
check(gid, "G-never-identical", s.expand(ea.subs(a, 1)-gg) == 1, "At only parallel parameter, constants differ by 1")

plane_profile = {
    "normal": 1, "genuine-plane": 1, "examples": 1, "elimination": 2,
    "exception": 0, "intersection": 2, "position-meaning": 1,
    "common-inclusion": 2, "common-exact": 1, "common-meaning": 1,
    "point-condition": 2, "parallel-condition": 1,
}
assert sum(plane_profile.values()) == 15

report = {
    "status": "INDEPENDENT_CHECKS_COMPLETE_CONTENT_FINDING_SEPARATE",
    "manifestSha256": sha(H / "review-input-manifest.json"),
    "handoffSha256": sha(H / "content-review-handoff.json"),
    "boundFileCount": len(bound_files),
    "contracts": contracts,
    "exactMathematicsCheckCount": len(checks),
    "exactMathematicsChecks": checks,
    "planeCounterexampleRawScores": plane_profile,
    "planeCounterexampleRawTotal": sum(plane_profile.values()),
    "planeCounterexampleCurrentLiteralCapTriggered": False,
    "planeCounterexampleCurrentResult": "PASS_15_OF_20_DESPITE_OMITTED_A1_F_CASE",
    "note": "Counterexample grading is an independent reading of the prose rubric, not an executable production scoring engine.",
}
(OUT / "independent-checks.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
print(json.dumps({"boundFileCount": len(bound_files), "wholeContractsChecked": len(contracts), "exactMathChecks": len(checks), "mathFailures": 0, "planeCounterexampleRawTotal": 15}, indent=2))
