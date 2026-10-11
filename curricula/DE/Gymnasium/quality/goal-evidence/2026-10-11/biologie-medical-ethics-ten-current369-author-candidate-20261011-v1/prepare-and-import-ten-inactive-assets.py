#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run byte-exact normal helpers in an external minimal root, never active paths."""
import json, hashlib, shutil, subprocess, tempfile
from pathlib import Path
from PIL import Image
R = Path.cwd()
P = Path(__file__).resolve().parent
def write(p,x):
    p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
base=json.load(open(P/'inputs/whole480-current395.baseline.exact.json'))
by={g['id']:g for g in base['goals']}
g=by['e36bebef-d7e3-57d0-bf01-236799d41cb7'];g['title']='Genetische Diagnostik erläutern';g['titleEn']='Explain genetic diagnostics'
g=by['7f76ff0b-218b-568d-91df-20bbe2b156e2']
g['description']='Die lernende Person kann auf zellulärer und molekularer Ebene erklären, wie Störungen der Zellteilungsregulation zur Tumorbildung führen und wie sich Krebszellen bei der Metastasierung durch Gewebeinvasion, Transport und Besiedlung anderer Gewebe ausbreiten können.'
g['descriptionEn']='The learner can explain at cellular and molecular levels how disrupted regulation of cell division leads to tumor formation and how cancer cells can spread during metastasis through tissue invasion, transport, and colonization of other tissues.'
write(P/'candidate/whole480-current395.medical-ten.inactive.json',base)
inventory=json.load(open(P/'images/actual-generated-ten-inventory.json'))
shutil.copy2(P/'images/actual-generated-ten-inventory.json',P/'images/first-generated-ten-inventory.json')
edits={x['i']:x for x in json.load(open(P/'images/actual-three-targeted-edits.json'))}
prompts=json.load(open(P/'images/ten-actual-generation-prompts.author.json'))
captions=[
 'Methodenabhängige Zell- und DNA-Proben liefern unterschiedliche genetische Aussagen; die Darstellung zeigt keine Gesundheitssicherheit.',
 'Gesellschaftliche Beteiligung kann die institutionelle Abwägung genetischer Anwendungen beeinflussen; sie ersetzt kein Gesetzgebungsverfahren.',
 'Veränderte Bakterien produzieren ein Protein, das getrennt aufbereitet wird; Nutzen und Risiken werden fallbezogen geprüft.',
 'Eine Regulationsstörung kann Tumorwachstum ermöglichen; eine mögliche Metastase benötigt zusätzlich Invasion, Transport und Besiedlung.',
 'Eigene Körperzellen werden außerhalb des Körpers verändert und zurückgegeben; beabsichtigte Genfunktion, Risiken und Nachkontrolle gehören zur Bewertung.',
 'Information aus einer Zellprobe vor Embryotransfer wird in methodischen und ethischen Grenzen abgewogen.',
 'Genetische Beratung verbindet verständliche Information, Vertraulichkeit und eine offene persönliche Entscheidung.',
 'Pränataldiagnostische Information und ihre Grenzen werden mit Belastungen, Werten und selbstbestimmter Entscheidung abgewogen.',
 'Stammzellmodelle ermöglichen Differenzierungsforschung; medizinische Anwendung verlangt eigene Prüfung und ethische Abwägung.',
 'DNA-Analytik kann medizinische Information liefern; gesellschaftliche Nutzung verlangt die Prüfung von Einwilligung und Datenschutz.'
]
helper_root=Path(tempfile.mkdtemp(prefix='skillpilot-medical10-normal-helpers-'))
(helper_root/'scripts').mkdir()
helper_bindings=[]
for name in ['prepare_goal_visualization.mjs','import_goal_visualization.mjs','goal_visualization_common.mjs']:
    src=R/'scripts'/name;dst=helper_root/'scripts'/name;shutil.copy2(src,dst)
    assert sha(src)==sha(dst);helper_bindings.append({'path':str(src.relative_to(R)),'sha256':sha(src),'bytes':src.stat().st_size})
candidate=P/'candidate/whole480-current395.medical-ten.inactive.json'
commands=[];adoptions=[]
for i,x in enumerate(inventory):
    gid=x['goalId'];d=P/'images'/gid;dest=d/(gid+'.png')
    if i in edits:
        hist=d/'history';hist.mkdir(exist_ok=True);shutil.copy2(dest,hist/'initial-generated.png')
        shutil.copy2(edits[i]['newPath'],dest);x['initialGenerationSourcePath']=x['sourcePath'];x['sourcePath']=edits[i]['newPath']
    im=Image.open(dest);x.update({'packagePath':str(dest.relative_to(R)),'sha256':sha(dest),'bytes':dest.stat().st_size,'pixels':list(im.size),'authorVisualStatus':'inspected_author_candidate_not_independent_approval'})
    for w in [360,680]:
        t=im.copy();t.thumbnail((w,round(w*im.height/im.width)));t.save(d/('view-'+str(w)+'.png'))
    chain=prompts[i]['prompt']
    if i in edits: chain+='\n\nActual targeted edit of the preceding generated image:\n'+edits[i]['prompt']
    (d/'actual-generation-chain.de.md').write_text('# Actual generation request(s)\n\n'+chain+'\n')
    reconstruct=prompts[i]['prompt']
    if i in edits: reconstruct+='\nFinal standalone constraints: '+edits[i]['prompt'].replace('Edit this existing teaching illustration,','Create a standalone teaching illustration;').replace('Edit this existing didactic GMO illustration.','Create a standalone GMO teaching illustration.').replace('Edit this existing ex-vivo somatic gene-therapy illustration.','Create a standalone ex-vivo somatic gene-therapy illustration.').replace('Preserve exactly','Draw').replace('REMOVE','Omit')
    (d/'image-reconstruction-prompt.de.md').write_text('# Standalone reconstruction description\n\n'+reconstruct+'\n')
    common=['--landscape',str(candidate),'--subject','biologie','--provider','OpenAI / Codex built-in image_gen','--review-status','pilot']
    prepare=['node',str(helper_root/'scripts/prepare_goal_visualization.mjs'),gid,*common]
    result=subprocess.run(prepare,capture_output=True,text=True);commands.append({'argv':prepare,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr});assert result.returncode==0,result.stderr
    prepared=helper_root/'tmp/goal-visualizations'/gid
    shutil.copy2(prepared/'metadata.json',d/'normal-prepare-metadata.json')
    shutil.copy2(prepared/'nano-banana-prompt.de.md',d/'normal-prepare-template.de.md')
    imp=['node',str(helper_root/'scripts/import_goal_visualization.mjs'),gid,str(dest),*common,'--license','CC-BY-4.0','--prompt',str(d/'actual-generation-chain.de.md'),'--reconstruction-prompt',str(d/'image-reconstruction-prompt.de.md'),'--description',captions[i],'--alt-text',captions[i]]
    result=subprocess.run(imp,capture_output=True,text=True);commands.append({'argv':imp,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr});assert result.returncode==0,result.stderr
    for folder in ['curricula/DE/Gymnasium/visualizations/biologie','app/public/assets/goal-visualizations/biologie','backend/src/main/resources/static/assets/goal-visualizations/biologie']:
        src=helper_root/folder/gid
        for f in src.iterdir():
            rel=f.relative_to(helper_root);dst=P/'portable'/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dst)
            adoptions.append({'normalTargetPath':str(rel),'packagePath':str(dst.relative_to(R)),'sha256':sha(dst),'bytes':dst.stat().st_size})
    copies=[a for a in adoptions if a['normalTargetPath'].endswith(gid+'/'+gid+'.png')]
    assert len(copies)==3 and {c['sha256'] for c in copies}=={x['sha256']}
write(P/'images/actual-generated-ten-inventory.json',inventory)
write(P/'checks/normal-prepare-import.actual-command-receipt.json',{'role':'technical ordinary helpers after actual built-in generation; no independent visual approval','helperFiles':helper_bindings,'externalTemporaryRoot':str(helper_root),'candidateLandscapePath':str(candidate.relative_to(R)),'commands':commands,'exitCode':0,'activeWrites':False})
write(P/'portable/normal-adoption-files.actual.json',adoptions)
print(json.dumps({'normalPrepare':10,'normalImport':10,'adoptionFiles':len(adoptions),'externalRoot':str(helper_root),'activeWrites':False}))
