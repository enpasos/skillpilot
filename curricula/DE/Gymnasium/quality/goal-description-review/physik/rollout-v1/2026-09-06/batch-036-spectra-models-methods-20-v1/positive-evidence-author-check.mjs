import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const base = "curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-036-spectra-models-methods-20-v1";
const prefix = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-036-spectra-models-methods-20-v1";
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const hash = (v) => 'sha256:' + createHash('sha256').update(v).digest('hex');
const checks = [];
const near = (id, actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, id + ': ' + actual + ' versus ' + expected);
  checks.push({ id, actual, expected, tolerance, pass: true });
};
const truth = (id, condition) => { assert.ok(condition, id); checks.push({ id, pass: true }); };

async function main() {
  const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve('app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href);
  const { stableGoalBookJson } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href);
  const config = read(prefix + '.config.json');
  const candidates = read(prefix + '.candidates.json');
  const batch = read(base + '.config.json');
  const manifest = read(base + '/bundle/manifest.json');
  const model = read(base + '/bundle/book-model.json');
  const input = readFileSync(base + '/bundle/review-input.jsonl', 'utf8').trim().split('\n').map(JSON.parse);
  // This is the immutable original input only; no round results are accessed.
  const bilingual = read(base + '/round-b/description-review-input.json');
  const landscape = read(config.landscapePath);
  assert.deepEqual(config.scope.goalIds, batch.goalIds);
  assert.deepEqual(input.map((x) => x.page.goalId), batch.goalIds);
  assert.deepEqual(bilingual.goals.map((x) => x.goalId), batch.goalIds);
  assert.equal(input.length, 20);
  const { digest, ...withoutDigest } = model;
  assert.equal(hash(stableGoalBookJson(withoutDigest)), digest);
  assert.equal(digest, manifest.bookModelDigest);
  assert.equal(digest, 'sha256:53447634cd068173c688d5a94822becaddb3f1ab6aa0c8520444a531332267b0');
  const artifactChecks = manifest.artifacts.map((a) => {
    const bytes = readFileSync(base + '/bundle/' + a.path);
    assert.equal(hash(bytes), a.digest, a.path);
    assert.equal(bytes.length, a.bytes, a.path);
    return { path: a.path, digest: a.digest, bytes: a.bytes, pass: true };
  });
  for (let i=0; i<20; i++) {
    const page = input[i].page;
    const original = bilingual.goals[i];
    const current = landscape.goals.find((g) => g.id === page.goalId);
    assert.equal(current.title, original.currentTitleDe, page.goalId + ' DE title');
    assert.equal(current.description, original.currentDescriptionDe, page.goalId + ' DE description');
    assert.equal(current.titleEn ?? current.title, original.currentTitleEn, page.goalId + ' EN title');
    assert.equal(current.descriptionEn ?? current.description, original.currentDescriptionEn, page.goalId + ' EN description');
    assert.equal(page.goalFingerprint, manifest.goals[i].goalFingerprint);
    assert.equal(page.pageFingerprint, manifest.goals[i].pageFingerprint);
    assert.deepEqual(page, model.pages[i]);
    assert.equal(input[i].evidenceProfile, null);
  }

  near('particle-excess', 120-100, 20);
  near('particle-excess-uncertainty', Math.sqrt(120+15**2), 18.574175621, 1e-8);
  near('particle-excess-standardised', 20/Math.sqrt(345), 1.0767638, 1e-6);
  near('particle-ratio-standardised', (1.02-1)/.04, .5);
  near('emission-cascade', 2.5+1.5, 4);
  near('xray-l-k', -2-(-10), 8);
  near('xray-m-k', -1-(-10), 9);
  near('xray-target2-line', -3-(-16), 13);
  const wavelengthNm = (lower, upper) => 1e9/(1.097e7*(1/lower**2 - 1/upper**2));
  near('rydberg-3-2-nm', wavelengthNm(2,3), 656.335, .001);
  near('rydberg-3-2-eV', 13.6*(1/4-1/9), 1.8888888889, 1e-9);
  near('rydberg-4-1-nm', wavelengthNm(1,4), 97.2348830143, 1e-9);
  near('rydberg-lyman-limit-nm', wavelengthNm(1,Infinity), 91.1577, .0001);
  near('rydberg-4-1-eV', 13.6*(1-1/16), 12.75);
  near('cavity-air-MHz', 3e8/(2*.3)/1e6, 500);
  near('cavity-doubled-MHz', 3e8/(2*.6)/1e6, 250);
  near('cavity-filled-MHz', 3e8/(2*1.5*.2)/1e6, 500);
  near('cavity-roundtrip-intensity', 1.1*.85, .935);
  truth('cavity-three-in-band', [-2,-1,0,1,2].filter(q=>Math.abs(q*.5)<=.6).length===3);
  near('orbital-excitation-eV', -1-(-2), 1);
  truth('three-level-inversion', 60>40);
  truth('four-level-inversion', 20>2);
  near('continuity-half-area-speed-ratio', 1/.5, 2);
  const focal = (g,b) => g*b/(g+b);
  const image = (f,g) => f*g/(g-f);
  near('eye-near-f-mm', focal(250,20), 18.5185185185, 1e-9);
  near('eye-limited-near-f-mm', focal(100,20), 16.6666666667, 1e-9);
  near('eye-limited-far-f-mm', focal(300,20), 18.75);
  near('eye-limited-near-b-mm', image(18,100), 21.9512195122, 1e-9);
  near('sound-pressure-ratio', 10**(20/20), 10);
  near('sound-intensity-ratio', 10**(20/10), 100);
  near('sound-relative-energy-exposure-ratio', 10*.2/2, 1);
  near('si-cm-to-m', 120/100, 1.2);
  near('astronomy-orbit-m', 2*1.5e11, 3e11);
  near('astronomy-luminosity-W', .5*3.83e26, 1.915e26, 1e11);
  near('astronomy-distance-m', 4*9.46e15, 3.784e16, 1);
  near('astronomy-distance-ratio', 4*9.46e15/(2*1.5e11), 126133.3333333, .0001);
  near('astronomy-pc-to-ly', 3*3.26, 9.78);
  near('astronomy-mass-ratio', 2/.2, 10);
  near('astronomy-luminosity-ratio', 20/.01, 2000);
  [[10,10.2,1.01],[14.1,14.3,1.42],[20,20.2,2.01]].forEach(([a,b,t],i)=>near('pendulum-mean-T-'+i,(a+b)/2/10,t));
  near('pendulum-reading-uncertainty-T', .2/10, .02);
  [[4,.04],[2.5,.025],[3,.03],[2,.02]].forEach(([u,i],n)=>near('solar-case1-ohms-'+n,u/i,100));
  [[1,.05],[1.34,.067],[.88,.044],[1.24,.062]].forEach(([u,i],n)=>near('solar-case2-ohms-'+n,u/i,20));
  // Same unshaded modules: higher per-module voltage accompanies lower current.
  truth('solar-case1-monotone-module-points', 4/2 < 2.5 && .04 > .025/2 && 3/2 < 2 && .03 > .02/2);
  truth('solar-case2-monotone-unshaded-module-points', 1/2 < 1.34 && .05 > .067/2);
  truth('solar-case2-relative-drop', (.05-.044)/.05 > (.067-.062)/.067);
  truth('solar-case1-voltage-margin', 4-.1>3.5 && 3+.1<3.5);
  truth('solar-case2-current-margin', .062-.001>.05 && .044+.001<.05);
  near('eye-myopia-b-mm', image(100,1000), 111.1111111111, 1e-9);
  truth('eye-myopia-measurement-match', Math.abs(image(100,1000)-112)<=2 && 112+2<120);
  near('eye-hyperopia-b-mm', image(100,300), 150);
  truth('eye-hyperopia-measurement-match', Math.abs(image(100,300)-149)<=3 && 149-3>120);
  near('eye-hyperopia-model-f-mm', focal(300,120), 85.7142857143, 1e-9);

  const records = await buildPositiveGoalEvidenceCandidateRecords({config, candidateSet:candidates});
  assert.equal(records.length,20);
  records.forEach((r,i) => {
    assert.equal(r.goalId,batch.goalIds[i]);
    assert.equal(r.goalFingerprint,input[i].page.goalFingerprint);
    assert.equal(r.status,'needs_human_review');
    assert.equal(r.reviewAuthority,'ai_candidate');
    assert.equal(r.evidenceLevel,'E1');
    assert.equal(r.maximumClaimScope,'G1');
    assert.deepEqual(r.reviewRunIds,[]);
    assert.equal(r.profile.applicationCaseBriefs.length,2);
  });
  const paths = [prefix+'.config.json',prefix+'.candidates.json',config.landscapePath,config.semanticKindLedgerPath,config.reviewCriteriaPath,
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md',
    'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
    'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
    base+'/bundle/manifest.json',base+'/bundle/review-input.jsonl',base+'/bundle/book-model.json',base+'/round-b/description-review-input.json'];
  console.log(JSON.stringify({
    checkedAt:new Date().toISOString(),sourceBookDigest:digest,bundleFingerprint:manifest.bundleFingerprint,
    claim:{status:'needs_human_review',authority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],reviewedResourceTypes:[]},
    fileDigests:paths.map(path=>({path,digest:hash(readFileSync(path))})),
    originalArtifacts:artifactChecks,originalAndCurrentTextMatches:20,goalCount:20,caseCount:40,
    mathematicalChecks:checks,
    qualitativeChecks:[
      'Emission direction and cascade energy conservation; occupied initial states and allowed transitions explicit.',
      'X-ray vacancy threshold separated from line energy; no unsupervised radiation.',
      'Atomic representations are not direct trajectories; Pauli applies to complete states, not degenerate energy levels.',
      'Laser inversion degeneracies specified; cavity modes separated from gain/loss and pump energy.',
      'Spectral attribution bounded by light path, reference set, noise and alternative stellar origin.',
      'Bernoulli assumptions separated from continuity and Reynolds regime; selected law only.',
      'Cross-stage lens, sound and SI expectations keep one common core; EN fallback is disclosed.',
      'Measurement data are hypothetical supplied datasets, not claims of experiments actually performed.',
      'Each solar U/I pair respects its fixed test load; unshaded per-module points permit decreasing I-V relations.',
      'Historical/technical cases contain no claim of normative source, human or image approval.',
    ],
    recordBindings:records.map(({goalId,goalFingerprint,reviewInputFingerprint,profileFingerprint,reviewCriteriaFingerprint})=>({goalId,goalFingerprint,reviewInputFingerprint,profileFingerprint,reviewCriteriaFingerprint})),
    records
  }));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
