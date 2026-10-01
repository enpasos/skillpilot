# 4dab7d52 fuel comparison: image candidate, not an approval

Goal: `4dab7d52-5b89-52ab-a425-17a7707f44c8`.

## Reason for correction

The active JPG mixes `CO₂ pro Mol` with unquantified `hoch`/`mittel` heat and categorical suitability marks. These cannot support a defensible comparison without a common reference basis. The B009 independent description synthesis already holds its V gate for that reason. The old JPG remains intact as historical evidence.

## Candidate and format

- Source: ChatGPT/Codex image generation, three prompt iterations on 2026-10-01. Original generated files: `/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/exec-5d16cc71-c4a5-43cf-ace4-16257fb00135.png`, `exec-0fe50e9b-f2ce-4dfb-a8ef-b783b781dfde.png`, and `exec-3e1e70c8-fa35-4a42-a9e4-3b1c5e5f6902.png` in the same directory. All three are copied here as versioned candidates.
- Candidate V3: RGB PNG, 1448 × 1086, 4:3, SHA-256 `5609098698338b309970b092bd751524fadbe52724576613a4d5b300b9b348cd`.
- Why 4:3: the two horizontal comparison cards remain each about 100 px high at 360 px width. A 16:9 canvas would leave only about 203 px total height and compress their labels and CO₂ contrast. This is a didactic phone-legibility exception to the 16:9 default.
- V1 had a transparent background and illegible footnote. V2 used an opaque cream background and removed the footnote, but [independent QA](independent-candidate-qa-v2.json) held it because fuel → heat → CO₂ implied that heat creates CO₂. V3 branches from each combustion flame separately to heat and CO₂.
- The picture is a *qualitative model*: equal released heat, methane versus pure carbon, and smaller versus larger direct CO₂ output. It does not give exact mass ratios, upstream emissions or a full lifecycle CO₂ balance.

## Actual visual self-check

Viewed the V2 native image and `candidate-v2-360px.png` and `candidate-v2-680px.png`, then the V3 native image and `candidate-v3-360px.png` (Lanczos previews). I also viewed `candidate-v3-597px.png` at the effective 597 × 448 px desktop size imposed by GoalCard's 28 rem height cap on a 4:3 image in a 680 px card. At both 360 px and the capped desktop size, the labels `GLEICHE WÄRME`, `METHAN (CH₄)`, `KOHLENSTOFF (C)` and both `CO₂` labels are readable; the different CO₂ cloud sizes and equal heat symbols are clear. The V3 arrows branch from the same flame to both outputs. Independent V3 scientific and visual QA passed as an AI candidate in `independent-candidate-qa-v3.json`; exact V3 bytes were then activated in canonical, public and backend paths. The old JPG copies are retained byte-identically in `historical-active-before-correction/`. The affected image asset and Chem QA-ledger checks passed. Current D/P/A/M evidence and the central strict intersection remain separate; no human or full M7 closure is claimed here.

Primary curricular context: [LehrplanPLUS Gymnasium Chemie 8](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie), which explicitly connects fuel CO₂ balance, heat of reaction and energy-carrier evaluation. The limited model contrast is consistent with the [US EIA fuel emission factors per heat content](https://www.eia.gov/environment/emissions/co2_vol_mass.php); its carbon card depicts pure C, not the variable composition of commercial coal.
