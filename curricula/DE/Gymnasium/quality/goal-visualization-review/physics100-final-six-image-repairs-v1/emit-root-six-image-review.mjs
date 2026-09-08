import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const base="curricula/DE/Gymnasium/quality/goal-visualization-review/physics100-final-six-image-repairs-v1/";
const hash=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const spec=[
 ['d05a146f-7fcd-56ae-b9b9-b54203328579',null,'e586a4dbe15f4076c7906b3e06e59fbf326a4d19f0b18c673ee1858858d2f4f5','Exact full PNG: energies 1:4:9 above V=0, correct E_n formula and L^-2 scaling. One electron and infinite-wall limits explicit. Native SVG source mathematically checked and independently raster-counterreviewed.'],
 ['f2538793-8b0a-5c3b-b216-5d329a4e87bd','19-50-48-521','b603ebbaa8f91f8d26b88cee673044790f78ebe4d923614fd71e3c9db2b39df0','Exact full raster: one normalized ground-state sin-squared density, zero endpoints, maximum 2/L, left-half integral 1/2, density versus dimensionless probability correct.'],
 ['bacae732-2016-5a83-bc61-d0f94ed5a0e4','19-54-49-060','7ef82d53e417fe6e93bd7de7bdc077c093961663f9a5afe0ab13652f466d985c','Exact full raster: all six H/He+ energies checked, negative binding energies relative to zero ionization, n and Z scaling correct under explicit one-electron, nonrelativistic, fixed-nucleus Coulomb conditions.'],
 ['333ca92b-a92c-46a9-86be-dea8ddbd43e0','19-54-46-022','9c38b7ea32a8e2b8639949bec8783ca538c9d17b7978d4d73595eb7fdb45f177','Exact full raster: contraction, faster flow, lower pressure consistent with continuity and equal-height Bernoulli under explicit stationary incompressible low-friction streamline assumptions. No universal faster-means-lower-pressure claim.'],
 ['3b50255a-6b01-578b-8f5c-4383536a3221','20-07-56-842',null,'Exact full raster: Th23290 to Ra22888 alpha, then Ac22889 beta-minus; A/Z/N all checked. Ac expressly not stable final daughter. Only nuclide changes, not a purported complete particle-products diagram.'],
 ['161502b8-e52d-58d0-8f01-9f777b56d392','20-01-49-745',null,'Exact full raster: isolated boundary includes both reservoirs, cyclic machine and ideal work source. 100+25=125 J; signed reservoir entropies -0.400 and +0.4167 J/K yield positive total. Optical order is not identified with thermodynamic entropy; compatible microstates explicitly distinguished.']
];
const targets=spec.map(([goalId,stamp,expected,reason])=>{
 const imagePath=stamp?'tmp/goal-visualizations/'+goalId+'/generated/'+goalId+'.generated.2026-09-07T'+stamp+'Z.jpg':base+goalId+'.png';
 const sha256=hash(fs.readFileSync(imagePath));if(expected)assert.equal(sha256,'sha256:'+expected);
 const reconstructionPath=base+'curated-reconstruction/'+goalId+'.de.md';
 const promptPath=stamp?'tmp/goal-visualizations/'+goalId+'/nano-banana-prompt.de.md':reconstructionPath;
 return {goalId,imagePath,sha256,decision:'accept_current_candidate',fullRasterViewed:true,reason,reconstructionPath,reconstructionSha256:hash(fs.readFileSync(reconstructionPath)),promptPath,promptSha256:hash(fs.readFileSync(promptPath)),provider:stamp?'Google Gemini / Nano Banana Pro (gemini-3-pro-image)':'Repository-native SVG diagram; deterministic PNG rendering',...(stamp?{}:{svgSourcePath:base+goalId+'.svg',svgSourceSha256:hash(fs.readFileSync(base+goalId+'.svg'))})};
});
const rejected=[
 ['d05a146f-7fcd-56ae-b9b9-b54203328579','19-38-11-673','Incomplete energy formula and incorrectly spaced energy levels.'],
 ['d05a146f-7fcd-56ae-b9b9-b54203328579','19-50-50-304','Energy axis labelled h, 2h, ... although Planck constant is not an energy unit; incomplete interior-potential label. Second targeted provider attempt did not meet correctness.'],
 ['f2538793-8b0a-5c3b-b216-5d329a4e87bd','19-38-13-348','Unwanted second curve and incorrect density origin; inconsistent representation of one ground-state density.'],
 ['3b50255a-6b01-578b-8f5c-4383536a3221','19-54-58-547','Nuclide chain correct, but unnecessary beta-minus particle cartoon omitted antineutrino and risked presenting incomplete decay products as a complete reaction.'],
 ['2825b528-00ee-52d0-870e-686890cb1195','20-01-50-429','Numbers correct but electric field arrows parallel to capacitor plates instead of normal to them, mixed signs on one plate, distance not electrode separation; magnetic in-plane arrow contradicted out-of-plane dots.'],
 ['761a0879-fc15-5d0c-a2b7-2b439efecd5b','20-01-50-714','Euler values and units correct; detailed secondary reading found the t=0 body drawn away from labelled x0=0, contradicting the initial-condition table. Withheld before import; not accepted on correct arithmetic alone.']
].map(([goalId,stamp,reason])=>{const imagePath='tmp/goal-visualizations/'+goalId+'/generated/'+goalId+'.generated.2026-09-07T'+stamp+'Z.jpg';return{goalId,imagePath,sha256:hash(fs.readFileSync(imagePath)),decision:'reject_candidate',fullRasterViewed:true,reason};});
const result={schemaVersion:1,artifactType:'informed-current-root-image-review',reviewer:'/root',materializedAt:new Date().toISOString(),exactSightTimes:'not individually recorded; all actual full-raster inspections preceded this manifest',humanApproval:false,blindReview:false,descriptionOrEvidenceApproval:false,targets,rejected,nativeException:{goalId:targets[0].goalId,reason:'Two targeted Nano Banana Pro attempts remained physically misleading; exact energy spacing, complete dimensional formula and readable model limits require a narrow controlled diagram. This is not replacement for convenience or style.',svgSourceSha256:targets[0].svgSourceSha256,pngProofSha256:targets[0].sha256},counterReviewPath:base+'informed-counterreview-four-current-candidates.physics-b043-a.json'};
console.log(JSON.stringify(result,null,2));
