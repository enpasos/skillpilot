# SPDX-License-Identifier: Apache-2.0
"""Freeze actual inactive image author candidate; never install/approve it."""
import copy
import hashlib
import importlib.util
import json
import shutil
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent

def bind(p):
    p = Path(p)
    return {'path':str(p.relative_to(ROOT)), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes':p.stat().st_size}

def put(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

old_entry = json.loads((OWN/'neutral-fourteen-remaining-image-role-candidates.author.entry.json').read_text())
entry = copy.deepcopy(old_entry)
candidate = json.loads((OWN/'fourteen-whole-goals-and-image-links.author.candidate.json').read_text())
gid = '431a0f03-f28a-5e56-a61f-000336d0b410'
record = next(r for r in entry['candidates'] if r['goalId']==gid)
goal = next(g for g in candidate['goals'] if g['id']==gid)
folder = OWN/'images-targeted-criteria-v2'/gid
folder.mkdir(parents=True)
src = OWN/'generated/criteria-v2.actual.png'
asset = folder/(gid+'.png')
shutil.copyfile(src, asset)
prompt = folder/'prompt.de.md'
shutil.copyfile(OWN/'criteria-arguments-no-fixed-material-v2.prompt.de.md', prompt)
reconstruction = folder/'image-reconstruction-prompt.de.md'
reconstruction.write_text('Aktueller aus dem tatsächlich gesichteten PNG abgeleiteter Rekonstruktionsprompt, keine historischen Generatorparameter.\n\nFreundliche klare Comicillustration, quer1672×941. Große Überschrift Chemische Argumente abwägen. Gleichberechtigte Pro- und Kontra-Karten zeigen je ein offenes Belegbuch und denselben neutralen Erlenmeyerkolben mit blauem Modellinhalt. Eine leere ausgeglichene Waage und ein Fragezeichen halten das Ergebnis offen. Unten stehen drei große Kriterien Umwelt, Sicherheit und Kosten mit Blatt-, Schild- und Münzsymbol. Eine freundliche Lupenfigur betrachtet die Belege. Nur diese großen Labels; keine festen Materialurteile, Gewichte, Rangfolgen oder Kleinschrift. Dunkelblaue Konturen, Creme/Hellblau, Grün/Orange. Hauptmotiv und Beschriftung bei360px und680px lesbar.\n')
resource = copy.deepcopy(record['resourceLink'])
resource.update(url=f'/assets/goal-visualizations/chemie/{gid}/{gid}.png', provider='OpenAI / ChatGPT-Codex integrated image_gen tool', description='Pro- und Kontra-Argumente zu einem chemischen Sachverhalt werden mit Belegen und den Kriterien Umwelt, Sicherheit und Kosten betrachtet. Die leere Waage lässt ihr begründetes Gewicht offen; weder ein Material noch ein Argument erhält vorab einen Vorrang.', altText='Große Pro- und Kontra-Karten mit je einem Belegbuch und einem neutralen Kolben flankieren eine leere ausgeglichene Waage. Darunter stehen die Kriterien Umwelt, Sicherheit und Kosten.')
goal['resourceLinks'] = [link for link in goal['resourceLinks'] if link.get('type')!='goal-visualization']+[resource]
record.update(originalAsset=bind(src),candidateAsset=bind(asset),actualDimensions=[1672,941],actualFormat='PNG',provider=resource['provider'],resourceLink=resource,availableActualPrompts=[bind(prompt),bind(reconstruction)],actual360=bind(OWN/'generated/qa/criteria-v2.actual.png.360px.png'),actual680=bind(OWN/'generated/qa/criteria-v2.actual.png.680px.png'))
entry['sourceImages']=[r for r in entry['sourceImages'] if r['role']!='criteria']+[{'role':'criteria','actualAsset':bind(src),'actualDimensions':[1672,941],'actualFormat':'PNG'}]
provenance=json.loads((OWN/'actual-four-generation-attempts.provenance.json').read_text())
for version,prompt_name,tool_path in [('v1','criteria-arguments-large-labels.prompt.de.md','exec-d32f0a94-689a-4f68-959c-6c362f8f01e4.png'),('v2','criteria-arguments-no-fixed-material-v2.prompt.de.md','exec-9a0a9802-174b-43c6-a602-7b5dcb6742bb.png')]:
    artifact=OWN/f'generated/criteria-{version}.actual.png'
    with Image.open(artifact) as im: dims=list(im.size)
    provenance['attempts'].append({'motif':'criteria-'+version,'tool':'OpenAI/ChatGPT-Codex integrated image_gen','originalToolOutput':'/home/enpasos/.codex/generated_images/01a0f2c0-2182-78f3-8b44-9fcdfd2c8634/'+tool_path,'copiedArtifact':bind(artifact),'dimensions':dims,'transparentBackground':False,'actualPrompt':bind(OWN/prompt_name)})
provenance['criteriaV1RetainedForActualMisleadingMaterialAssignment']=True
put(OWN/'actual-six-generation-attempts.provenance.json',provenance)
put(OWN/'fourteen-whole-goals-final-resource-links.author-candidate.json',candidate)
entry.update(exactWholeFourteenGoalsWithCandidateResourceLinks=bind(OWN/'fourteen-whole-goals-final-resource-links.author-candidate.json'),actualGenerationProvenance=bind(OWN/'actual-six-generation-attempts.provenance.json'),newStandaloneMotifs=4,targetRolesUsingNewPngMotifs=6,unchangedExistingGoodImageRoleCandidates=8,authorResponsiveInspectionStillToFreeze=False)
put(OWN/'neutral-fourteen-final-actual-image-role-candidates.independent-review.entry.json',entry)
science=json.loads((ROOT/entry['all26WholeGoalsProfiles52Cases']['path']).read_text())
source_by_id={r['wholeGoal']['id']:r['wholeGoal'] for r in science['routineBodies']}
assert len(candidate['goals'])==14
assert all({k:v for k,v in g.items() if k!='resourceLinks'}=={k:v for k,v in source_by_id[g['id']].items() if k!='resourceLinks'} for g in candidate['goals'])
checks=OWN/'checks'
checks.mkdir(exist_ok=True)
imports=[]
landscape=science['currentWhole504Source']['path']
for r in entry['candidates']:
    link=r['resourceLink']
    argv=['node','scripts/import_goal_visualization.mjs',r['goalId'],r['candidateAsset']['path'],'--landscape='+landscape,'--subject=chemie','--provider='+r['provider'],'--license=CC-BY-4.0','--review-status=pilot','--description='+link['description'],'--alt-text='+link['altText'],'--dry-run']
    prompts=r['availableActualPrompts']
    actual=next((b['path'] for b in prompts if Path(b['path']).name=='prompt.de.md'), None)
    rec=next((b['path'] for b in prompts if Path(b['path']).name=='image-reconstruction-prompt.de.md'),None)
    if actual: argv.append('--prompt='+actual)
    if rec: argv.append('--reconstruction-prompt='+rec)
    result=subprocess.run(argv,text=True,capture_output=True)
    out=checks/(r['goalId']+'.import-dry-run.stdout.txt')
    out.write_text(result.stdout+result.stderr)
    imports.append({'goalId':r['goalId'],'argv':argv,'exitCode':result.returncode,'output':bind(out),'activeWrites':0})
put(checks/'fourteen-normal-import-dry-runs.actual.json',{'runs':imports,'allPassed':all(r['exitCode']==0 for r in imports)})
assert all(r['exitCode']==0 for r in imports), imports
spec=importlib.util.spec_from_file_location('normal_validate',ROOT/'scripts/validate_schemas.py')
validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator)
schema=json.loads((ROOT/'docs/landscape-runtime.schema.json').read_text())
files=sorted(OWN.rglob('*.json'))
assert all(validator.validate_file(str(p),schema) for p in files)
portable=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p.relative_to(ROOT)) for p in OWN.rglob('*') if p.is_file())+'\n',text=True,capture_output=True)
assert portable.returncode==1 and portable.stdout=='', portable.stdout
put(checks/'ordinary-affected-json-and-portability.actual.json',{'normalValidator':'scripts/validate_schemas.py:validate_file unchanged','jsonChecked':len(files),'jsonFailed':0,'gitCheckIgnoreExitCode':portable.returncode,'ignoredPaths':[],'scienceFieldsWhole14Exact':True,'whole26Profiles52CasesSourceHashExact':bind(ROOT/entry['all26WholeGoalsProfiles52Cases']['path']),'activeWrites':0,'fullRepositorySchemaRunClaimed':False})
print('Normal14 importer dryruns and affected JSON/portable checks PASS. Final neutral input ready; actual author verdict must be written separately before firstseal.')
