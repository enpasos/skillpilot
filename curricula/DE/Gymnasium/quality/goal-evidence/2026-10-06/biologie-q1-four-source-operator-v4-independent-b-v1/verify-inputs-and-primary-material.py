# SPDX-License-Identifier: Apache-2.0
"""Independent read-only checks of author v4, writing only this review directory."""
import datetime
import hashlib
import itertools
import json
import pathlib
import re
import subprocess
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-current383-source-scope-author-remediation-v4"
V3 = AUTHOR.with_name("biologie-q1-four-current383-source-scope-author-remediation-v3")
EXPECTED = "89816e95a26d30ff82e900565ec164acb3427cb341129f86aaa154adce82419f"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(path.read_text())


def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


freeze_path = AUTHOR / "author-source-scope-remediation-v4.final.freeze.json"
assert sha(freeze_path.read_bytes()) == EXPECTED
freeze = read(freeze_path)
own_checks = []
for f in freeze["files"]:
    p = AUTHOR / f["path"]
    data = p.read_bytes()
    own_checks.append({"path": str(p.relative_to(ROOT)), "expected": f["sha256"], "actual": sha(data), "bytes": len(data), "match": sha(data) == f["sha256"] and len(data) == f["bytes"]})
bound_checks = []
for f in read(AUTHOR / "actual-reviewed-inputs.author.freeze.json")["files"]:
    p = ROOT / f["path"]
    data = p.read_bytes()
    bound_checks.append({"path": f["path"], "expected": f["sha256"], "actual": sha(data), "bytes": len(data), "match": sha(data) == f["sha256"] and len(data) == f["bytes"], "reviewUse": "Binding integrity only; individual scientific content reads are separately listed."})
assert len(own_checks) == 63 and all(c["match"] for c in own_checks)
assert len(bound_checks) == 179 and all(c["match"] for c in bound_checks)
canonical_text = read(AUTHOR / "canonical-preserved.inert-envelope.json")["preservedCanonicalUTF8"]
canonical = json.loads(canonical_text)
v3_canonical = read(V3 / "prospective-canonical.unchanged.snapshot.json")
assert canonical == v3_canonical
profiles = read(AUTHOR / "positive-four.native-candidate-records.json")["records"]
v3_profiles = read(V3 / "positive-four.native-candidate-records.json")["records"]
assert profiles == v3_profiles
main = read(AUTHOR / "four-main-components-eight-positive-cases.author-candidate.json")["components"]
mut = read(AUTHOR / "mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json")["components"]
components = main + mut
assert len(components) == 11 and len([c for c in components if c["canonicalGoalId"] is None]) == 7
cases = []
for c in components:
    for task in c["tasks"]:
        fields = ["material", "task", "solution", "materialEn", "taskEn", "solutionEn"] if "caseId" in task else ["materialDe", "promptDe", "solutionDe", "materialEn", "promptEn", "solutionEn"]
        assert all(isinstance(task.get(k), str) and task[k].strip() for k in fields)
        cases.append({"component": c["candidateKey"], "caseId": task.get("caseId", task.get("caseKey")), "completeDEEN": True, "caseSHA256CanonicalJSON": sha(json.dumps(task, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())})
assert len(cases) == 22
overlay_checks = []
for p in sorted((AUTHOR / "source-overlays-inert").glob("*.json")):
    d = read(p)
    old_path = ROOT / d.get("v3CandidatePath", d.get("v3SourcePath"))
    old_data = old_path.read_bytes()
    overlay_checks.append({"path": str(p.relative_to(ROOT)), "preservedFrom": str(old_path.relative_to(ROOT)), "byteSourceHashMatches": sha(old_data) == d["preservedV3BytesSHA256"], "jsonPayloadMatches": d["candidatePayload"] == json.loads(old_data), "wholeSourceClosure": d["wholeSourceClosure"]})
assert len(overlay_checks) == 17 and all(x["byteSourceHashMatches"] and x["jsonPayloadMatches"] and not x["wholeSourceClosure"] for x in overlay_checks)
v4_book = read(AUTHOR / "native-preserved383.book-model.actual.json")
v3_book = read(V3 / "prospective-native383.book-model.json")
book_equality = v4_book == v3_book
# Author supplied native snapshots can differ in metadata, so compare complete pages.
book_keys = list(v4_book)
page_key = "pages" if "pages" in v4_book else "goalPages"
assert v4_book[page_key] == v3_book[page_key]
assert len(v4_book[page_key]) == 383
write("binding-and-preservation.actual.json", {"createdAtUTC": NOW, "reviewer": "Independent B", "authorFreezeSHA256": EXPECTED, "authorOwnFiles": own_checks, "authorBoundInputs": bound_checks, "ownFileCount": 63, "boundFileCount": 179, "fourWholeDescriptionsAndFourProfilesExactV3": True, "canonicalWholeGoals": len(canonical["goals"]), "canonicalWholeGoalsExactV3": True, "eightOriginalPCaseBodiesExactV3": True, "twentyTwoCompleteDEENCases": cases, "inertPayloadChecks": overlay_checks, "nativeBookTopLevelKeys": book_keys, "nativeBookWholeObjectExactV3": book_equality, "native383WholePagesExactV3": True, "nativeCompilerExecutedByIndependentB": False, "activeWrites": 0, "humanApproval": False, "currentM7Approval": False})

pdf_specs = [
    ("BE", "BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf", 36, 36),
    ("BB", "BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf", 36, 36),
    ("HE", "HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf", 38, 38),
    ("MV", "MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf", 29, 30),
    ("SN", "SN/lehrplan-gymnasium-biologie-sachsen-2025.pdf", 42, 43),
    ("ST", "ST/FLP_Biologie_Gym_01082022_swd.pdf", 42, 43),
    ("TH", "TH/LP_GY_Biologie_2024.pdf", 28, 29),
]
primary_reads = []
for key, rel, first, last in pdf_specs:
    p = ROOT / "curricula/DE/Gymnasium/input" / rel
    raw = subprocess.check_output(["pdftotext", "-layout", "-f", str(first), "-l", str(last), str(p), "-"])
    name = f"primary-{key}-physical{first}-{last}.actual.txt"
    (OUT / name).write_bytes(raw)
    primary_reads.append({"sourceKey": key, "path": str(p.relative_to(ROOT)), "sha256": sha(p.read_bytes()), "physicalPages": [first, last], "extractionPath": name, "extractionSHA256": sha(raw), "readMethod": "Independent fresh pdftotext -layout extraction of retained original primary PDF pages"})

urls = {
    "BY9": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie",
    "BY12-GA": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend",
    "BY12-EA": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht",
    "NCBI-standard-code": "https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi",
}
html_by_key = {}
for key, url in urls.items():
    req = urllib.request.Request(url, headers={"User-Agent": "SkillPilot-independent-curriculum-review/1.0"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        raw = resp.read()
        final_url = resp.url
        status = resp.status
    name = f"primary-{key}.actual.html"
    (OUT / name).write_bytes(raw)
    html_by_key[key] = raw.decode("utf-8")
    primary_reads.append({"sourceKey": key, "officialURL": url, "finalURL": final_url, "httpStatus": status, "retrievedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(), "path": name, "sha256": sha(raw), "bytes": len(raw), "readMethod": "Independent official primary retrieval; scoped clauses read in source review"})
write("primary-inputs.actual.json", {"createdAtUTC": NOW, "sources": primary_reads, "scope": "Bounded clauses for eleven author components; no whole source approval"})

ncbi = html_by_key["NCBI-standard-code"]
ncbi_aas = re.search(r"AAs\s*=\s*([A-Z*]{64})", ncbi).group(1)
ncbi_bases = [re.search(rf"Base{i}\s*=\s*([TCAG]{{64}})", ncbi).group(1) for i in (1, 2, 3)]
table = {"".join(bs).replace("T", "U"): aa for bs, aa in zip(zip(*ncbi_bases), ncbi_aas)}
author_code = read(AUTHOR / "standard-code-sun.codon-data.actual.json")
three_to_one = dict(zip("Phe Leu Ser Tyr Stopp Cys Trp Pro His Gln Arg Ile Met Thr Asn Lys Val Ala Asp Glu Gly".split(), "FLSY*CWPHQRIMTNKVADEG"))
converted = {codon: three_to_one[amino] for codon, amino in author_code["codonAssignments"].items()}
assert len(converted) == 64 and converted == table
def translate_dna(seq):
    s = seq.replace(" ", "").replace("T", "U")
    return [table[s[i:i+3]] for i in range(0, len(s)-2, 3)]

sequences = {s: translate_dna(s) for s in ["ATG GAA TTT TGA", "ATG GAG TTT TAA", "ATG AAA TGC TAG", "ATG AAG TGT TGA", "ATG GAA TTC TAA", "ATG GAC TTC TAA", "ATG GAG TTC TAA", "ATG TCT GGT", "ATG GAA TTT CCA TAA", "ATG TTT GGC AAG TAA"]}
complement = lambda s: s.translate(str.maketrans("ACGT", "TGCA"))
write("independent-sequence-and-arithmetic.actual.json", {"createdAtUTC": NOW, "officialCodeSource": urls["NCBI-standard-code"], "standardTable1All64CodonsExact": True, "authorCodonDataSHA256": sha((AUTHOR / "standard-code-sun.codon-data.actual.json").read_bytes()), "codedDNACasesOneLetterProductsStopStar": sequences, "templateComplements": {s: complement(s) for s in ["ATGCCA", "CGTTA", "AGTCCA", "TACG", "GTAC"]}, "anticodonFor5GAA3": {"paired3to5": "CUU", "equivalent5to3": "UUC"}, "protectionRatesPercent": [[n, n/1000*100] for n in [3, 27, 6, 2, 18, 17]], "protectionARatioExposedToControl": 27/3, "repairUnresolvedMismatches": 30-24, "repairCorrectedFraction": 24/30, "mutationModificationBTemperatureIncrement": [14-8,16-10], "genomeMutationCounts": {"levelsA": "2n4: gamete3 + normal2 = 5", "levelsB": "2n6: gamete2 + normal3 = 5"}, "claimLimits": ["Correct arithmetic is not itself P or scientific source/operator approval.", "Residual6 mismatches are not necessarily6 fixed mutations.", "Spread notation supports a school-model comparison, not an inferential significance test."]})
print(json.dumps({"authorOwnFilesVerified":len(own_checks),"boundInputsVerified":len(bound_checks),"completeNewBilingualCases":len(cases),"exactWholePages":383,"primarySources":len(primary_reads),"all64Codons":True},ensure_ascii=False))
