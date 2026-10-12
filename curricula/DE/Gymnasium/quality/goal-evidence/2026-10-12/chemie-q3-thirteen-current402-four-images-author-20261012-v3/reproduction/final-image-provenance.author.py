from pathlib import Path
import hashlib
import json
import shutil
import subprocess
from PIL import Image

OWN = Path(__file__).resolve().parent.parent
REPO = Path(__file__).resolve().parents[8]
CAP = REPO / 'tmp/chemie-q3-thirteen-author-v3-execution-capsule'
GENERATED = Path('/home/enpasos/.codex/generated_images/01a12dd6-a455-76f2-94fb-b6775e48ddc0')
chosen = [
 ('5a', '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c', 'exec-09446d02-c33e-4cf4-94f5-72dd5f08a559.png', '5a.targeted-B-marker-correction.prompt.txt'),
 ('545a', '545a2e56-e981-5725-b0e4-a0c77f7f291e', 'exec-a8b4fe82-1fb4-4634-8b9d-329e1d7ac911.png', '545a.targeted-continuity-correction.prompt.txt'),
 ('c046', 'c0463225-cba1-5e62-a1fb-e9046d7034b5', 'exec-c00e4fc0-f4b9-4eb6-9d61-5e602cf02fb4.png', None),
 ('b8', 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb', 'exec-39a7b21d-7ed9-4846-8ecd-2ffc72ecd5a5.png', None),
 ('e62', 'e62c6c58-b688-59c3-8ac5-2cfc26ac22d7', 'exec-da01a964-9804-44a5-a861-898afd1c5134.png', None),
]
goals = {g['id']:g for g in json.loads((OWN/'inputs/current523.author-successor.de.json').read_text())['goals']}
receipts = []
for key,gid,filename,followup in chosen:
    prompt = OWN/f'visualization/{key}.provider-prompt.txt'
    if followup:
        final_prompt = OWN/f'visualization/{key}.full-provider-and-correction-prompt.txt'
        final_prompt.write_text('Initial built-in image generation/edit prompt:\n\n'+prompt.read_text()+'\n\nTargeted built-in edit of the first generated proposal:\n\n'+(OWN/'visualization'/followup).read_text())
        link = next(l for l in goals[gid]['resourceLinks'] if l['type']=='goal-visualization')
        args = ['node',str(CAP/'scripts/import_goal_visualization.mjs'),gid,str(GENERATED/filename),
                '--landscape','candidate/landscape.json','--subject','chemie','--lang','de',
                '--provider','OpenAI built-in image_gen','--review-status','pilot','--license','CC-BY-4.0',
                '--prompt',str(final_prompt),'--description',link['description'],'--alt-text',link['altText']]
        completed = subprocess.run(args,cwd=CAP,text=True,capture_output=True)
        (OWN/f'checks/{key}.final-prompt-normal-import.stdout.actual.txt').write_text(completed.stdout)
        (OWN/f'checks/{key}.final-prompt-normal-import.stderr.actual.txt').write_text(completed.stderr)
        assert completed.returncode==0,completed.stderr
        relative=Path(f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/prompt.de.md')
        shutil.copyfile(CAP/relative,OWN/'visualization/staged'/relative)
        prompt = final_prompt
    source = OWN/f'visualization/staged/curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png'
    with Image.open(source) as im: dimensions=list(im.size)
    receipts.append({'goalId':gid,'provider':'OpenAI built-in image_gen','modelNameExposedByTool':False,
      'initialPromptPath':str((OWN/f'visualization/{key}.provider-prompt.txt').relative_to(REPO)),
      'targetedEditPromptPath':str((OWN/'visualization'/followup).relative_to(REPO)) if followup else None,
      'fullNormalImportPromptPath':str(prompt.relative_to(REPO)),
      'generatorOriginalPathHistoricalOnly':str(GENERATED/filename),
      'currentPortableImagePath':str(source.relative_to(REPO)),
      'sha256':'sha256:'+hashlib.sha256(source.read_bytes()).hexdigest(),'nativeDimensions':dimensions,
      'ownDidacticMediaLicense':'CC-BY-4.0','sourceBeforeEditActuallyViewed':True,
      'selectedNativeActualPixelsViewed':True,'independentApproval':False,'humanApproval':False})
assert json.loads((CAP/'candidate/landscape.json').read_text())==json.loads((OWN/'inputs/current523.author-successor.de.json').read_text())
(OWN/'visualization/five.generated-image-provenance.author.json').write_text(json.dumps({'role':'actual_provider_and_prompt_author_provenance_not_approval','rows':receipts},ensure_ascii=False,indent=2)+'\n')
(OWN/'visualization/5a.attempt01.author-finding.json').write_text(json.dumps({'role':'rejected_author_proposal_actual_pixel_finding','imagePath':str((OWN/'visualization/5a.attempt01.rejected-ambiguous-B-marker.png').relative_to(REPO)),
 'fault':'The pressure panel represented B as three joined blue spheres beside 2A(g) ⇌ B(g), inviting an unintended atomic-composition reading. Targeted edit uses one green abstract species marker B.',
 'replacementGoalId':'5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c','historyRetained':True,'approval':False},ensure_ascii=False,indent=2)+'\n')
print('Final prompts accurately imported; five actual PNG provider/dimensions/provenance records bound.')
