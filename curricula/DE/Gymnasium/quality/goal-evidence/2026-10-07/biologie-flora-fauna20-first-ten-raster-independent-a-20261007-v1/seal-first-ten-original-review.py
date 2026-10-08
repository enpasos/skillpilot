import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image


ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-current391-author-v1"
IMAGES = ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1"
OLD_A = OUT.parent / "biologie-flora-fauna20-current391-independent-a-20261007-v1"


def bind(path):
    path = Path(path)
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def dump(name, value):
    p = OUT / name
    if p.exists():
        raise RuntimeError(f"Append-only output already exists: {p}")
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return p


notes = [
    ("HOLD", [
        "The actual meadow distinguishes several organism forms, the dodo is separated in an extinction/museum inset, and the beetle investigation is not labelled a confirmed new species. These scientific motifs are usable.",
        "The open field guide at the learner's left presents its upright readable face toward the external viewer while the learner is behind/right of it. The foreground notebook likewise places the tree base and page bottom toward the viewer, opposite the depicted learner. This fails the actor-facing book/notebook requirement in the actual raster.",
        "Correct only the guide/notebook orientation, preferably through an over-shoulder observer view or by rotating the pages toward the learner. Keep the usable diversity, dodo and beetle motifs. Original-size labels Vielfalt/Aussterben/Entdecken are readable; final responsive and native bindings remain unreviewed.",
    ]),
    ("KEEP", [
        "The dog, foreground articulated limb, lung with bronchial tree, and heart offer coherent organ/function associations: movement, gas exchange and transport. Callouts target the relevant regions.",
        "This is a simplified organ/function illustration, not an alveolar diffusion or detailed cardiac-circulation diagram. The blue surrounding lung symbols do not carry an asserted chemical identity or a claim that air crosses the chest wall.",
        "Large organ silhouettes and three original-size functional labels are clear. No notebook perspective is involved. Final actual responsive/native readability remains pending.",
    ]),
    ("KEEP", [
        "The otter's fur inset explicitly retains an insulating air layer above skin under dense fur, alongside a webbed-foot inset. These are coherent aquatic-habitat adaptations, with no claim that sunlight is conducted through hair into the body.",
        "No environmental command creates the traits and no conscious-purpose evolutionary explanation is pictured. The warm illustrated scene is compatible with the established friendly comic landscape.",
        "Original-size fur/skin/air labels and webbing are distinguishable. Actual narrow-width and native page review is still required.",
    ]),
    ("KEEP", [
        "The observer records three distinguishable dog postures, with observation sketches separated from a Deutung column in the ethogram. The scene does not substitute anthropomorphic thoughts for observed behavior.",
        "The notebook faces the observer, and the over-shoulder reading/writing direction is physically coherent. The three sample postures do not establish an actual learner observation or a universal mandatory behavioral sequence.",
        "The full-size Ethogramm heading and illustrated records are legible. The synthetic explanatory raster is not real performance evidence; final360/680 and book-page checks are pending.",
    ]),
    ("KEEP", [
        "The ancestry branch distinguishes an ancestral population, modern wolves and domestic dogs. Human breeding choice and heritable variation are separately represented; one modern wolf is not transformed into a dog.",
        "Different dog forms are variation/selection examples, with no progression ladder or new mandatory welfare experiment. The small DNA icon is schematic and does not purport to delimit a gene.",
        "Main animals, branch arrows and large labels remain clear at original size. No actor-facing written page is present. Final actual360/680/native review is pending.",
    ]),
    ("KEEP", [
        "The selected v2 shows swelling, downward radicle emergence before the shoot, an emerging hooked shoot, then the leafy seedling with roots. This is a coherent simplified bean-germination sequence.",
        "Water, warmth and air are separated from light, which is explicitly later important for growth rather than a universal prerequisite for every seed's germination. The substrate does not show a sealed permanently submerged seed.",
        "The illustration is a model sequence, not evidence that actual growth has been followed. Stage labels and main root/shoot relations are legible in the original; final responsive/native checks are pending.",
    ]),
    ("KEEP", [
        "The selected v2 depicts root water intake with arrows from surrounding droplets into the root and blue transport upward through the stem. The root-zoom arrows do not discharge water outward into soil.",
        "The sunlit leaf inset connects the photosynthetic leaf to sugar, and orange arrows connect assimilate supply to developing tips, pods and roots. Sugar is not represented as flowing exclusively upward or as root absorption from soil.",
        "The large root/stem/leaf relations are coherent for the whole current goal. The original-size Wasser/Zucker labels are readable. Final actual360/680 and native bindings remain pending.",
    ]),
    ("KEEP", [
        "The actual stylized flower section distinguishes pollen-bearing anther, filament, stigma, style, ovary and enclosed ovules. Bee/pollen reaches the stigma; the inset separates pollination, pollen-tube growth and fertilization in the ovule.",
        "The seed-containing fruit continuation does not show a bee entering the ovule or a pollen grain directly becoming the whole seed. The image is a general functional schema rather than an exact species-specific floral formula or a claim about every fruit's accessory tissues.",
        "Full-size labelled structures are distinguishable, with no confirmed anatomical pointer contradiction. This comparatively label-rich candidate specifically needs the forthcoming actual narrow-width and native checks before final V approval.",
    ]),
    ("KEEP", [
        "The selected v2 places the learner behind the open guide in the same reading direction: the pages are naturally readable by the person holding them. Wild meadow and cultivated bean support usage context, and enlarged leaf/flower features support comparison.",
        "The raster makes no edibility guarantee or claim that every wild plant is harmful. The enlarged lobed white/yellow daisy example is not labelled Bellis perennis, and a single enlarged bean leaflet is not an explicit claim that every bean has only simple mature leaves. No definite species-diagnostic error is established by this generic drawing.",
        "The main wild/useful signs and paired botanical features are clear at original size; the field-guide body text is not required reading. Actual360/680/native review remains pending.",
    ]),
    ("KEEP", [
        "The selected v2 gives the bird's flying form and feather a coherent relationship to movement in air. The feather checklist correctly says leicht, stabil and dichte Fahne; it does not call the flight vane air-permeable.",
        "The streamlining inset explicitly connects a compact body form to lower air resistance, without fins morphing into feathers or conscious acquisition of a trait. This is the bird example for a source scope with a bird-or-fish in-depth choice; the image does not require simultaneous fish depth.",
        "The original-size bird, feather and streamlined-body motifs are distinct. Decorative unlabelled movement curves are not used as a quantitative airflow claim. Final actual360/680/native review is pending.",
    ]),
]

plans_path = AUTHOR / "neutral-twenty-current-whole-imageplans.author.json"
whole_path = AUTHOR / "current20-whole-DEEN-goals.actual.json"
plans = json.loads(plans_path.read_text())["goals"][:10]
whole = {g["id"]: g for g in json.loads(whole_path.read_text())["goals"]}
canon_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
canon = {g["id"]: g for g in json.loads(canon_path.read_text())["goals"]}
inputs = [bind(plans_path), bind(whole_path), bind(canon_path)]
for seal in [OLD_A / "first-twenty-whole-science.freeze.json", OLD_A / "native-preimage-D20-and-retained-AM.final.freeze.json", OLD_A / "targeted-v3/targeted-v3.independent-a.final.freeze.json", OLD_A / "targeted-v4/targeted-v4.independent-a.final.freeze.json"]:
    inputs.append(bind(seal))

rows = []
for plan, (decision, observations) in zip(plans, notes, strict=True):
    ordinal, gid = plan["ordinal"], plan["goalId"]
    assert whole[gid] == plan["wholeGoal"] == canon[gid], f"Whole selected goal changed: {gid}"
    version = 2 if ordinal in (6, 7, 9, 10) else 1
    image_path = IMAGES / "candidates" / gid / f"candidate-v{version}.png"
    provenance_path = image_path.parent / f"generation-v{version}.actual.provenance.json"
    request_path = IMAGES / f"{gid}.v{version}.actual-request.json"
    provenance = json.loads(provenance_path.read_text())
    request = json.loads(request_path.read_text())
    image_binding, request_binding = bind(image_path), bind(request_path)
    assert image_binding == provenance["candidate"]
    assert request_binding == provenance["actualRequest"]
    assert request["goalId"] == gid and request["version"] == version
    with Image.open(image_path) as im:
        assert im.format == "PNG" and im.size == (1672, 941)
    inputs += [image_binding, bind(provenance_path), request_binding]
    if request.get("promptPath"):
        prompt_path = ROOT / request["promptPath"]
        assert prompt_path.read_text().strip() == request["prompt"].strip()
        inputs.append(bind(prompt_path))
    rows.append({
        "ordinal": ordinal, "goalId": gid, "title": whole[gid]["title"],
        "selectedVersion": version, "actualOriginalImage": image_binding,
        "decisionForOriginalRasterOnly": decision,
        "actualInspection": "full selected original PNG viewed at original detail through view_image",
        "observations": observations,
        "actual360Review": "pending final neutral input", "actual680Review": "pending final neutral input",
        "actualNativePageReview": "pending final neutral input",
        "wholeGoalDEENExactlyCurrent": True,
        "retainedWholeTextPAMScience": "own genuine earlier whole20 and targeted v3/v4 seals; no restart or current P-fingerprint approval here",
        "finalMachineVisualizationApproval": False, "humanApproval": False,
    })

review = dump("first-ten-original-raster.independent-a.verdicts.json", {
    "schemaVersion": 1, "artifactKind": "independent original-raster-only Flora Fauna ten review",
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "reviewer": "/root/flora_fauna_independent_a", "reviewerRole": "independent reviewer A, not image author",
    "independence": "No other image reviewer findings read before this first verdict; author inputs and actual production requests/provenance inspected after direct raster inspection.",
    "scope": "selected originals 1-10 only; 6/7/9/10 v2, other selected versions v1",
    "summary": {"reviewedOriginals": 10, "KEEP": 9, "HOLD": 1, "reject": 0, "finalMobileNativeApprovals": 0},
    "reviews": rows, "humanApproval": False, "humanTrial": False, "activeWrites": 0,
    "newStrictCompletions": 0, "restoredStrictBindingsClaimed": 0,
    "nextStep": "Correct ordinal1 page perspective, then inspect final actual20 rasters, actual360/680 captures and complete native pages with exact D/P/V bindings.",
})
receipt = dump("first-ten-exact-input-binding.independent-a.receipt.json", {
    "artifactKind": "actual provenance and whole-current-goal check receipt, separate from scientific verdict",
    "boundFiles": inputs, "exactCurrentWholeGoals": 10,
    "actualPNGFormatAndNativeSize": "10 PNG at1672x941 verified",
    "actualProductionProvenance": "10 image and actual-request path/hash/byte bindings verified; ChatGPT/Codex builtin image_gen as recorded, serving model unexposed",
    "sciencePassFromHashes": False, "fullHistoricalReviewRestarted": False,
    "researchNote": "Possible leaf-shape concern was treated cautiously, not made into an unsupported required image change. Primary flora search snippets admit lobed Leucanthemum leaves; attempted full-page retrieval failed502 and oversized PDF retrieval failed. These snippets are not a new curricular source closure or a claim of exact species identification.",
    "researchURLs": ["https://www.efloras.org/florataxon.aspx?flora_id=1&taxon_id=118354", "https://www.efloras.org/florataxon.aspx?flora_id=1&taxon_id=200024187"],
    "activeWrites": 0, "humanApproval": False,
})
dump("first-ten-original-raster.independent-a.first.freeze.json", {
    "schemaVersion": 1, "artifactKind": "immutable first independent original-raster-only ten verdict seal",
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "frozenInputs": inputs, "frozenOutputs": [bind(review), bind(receipt), bind(Path(__file__).resolve())],
    "decisions": {"KEEP": 9, "HOLD": 1}, "mobileNativeFinalApproval": False,
    "historicalArtifactsUnmodified": True, "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False,
})
print("First original-raster verdict sealed:10 inspected,9 KEEP,1 HOLD; final360/680/native pending.")
