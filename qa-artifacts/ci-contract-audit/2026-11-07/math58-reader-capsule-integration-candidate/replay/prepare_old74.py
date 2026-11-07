from pathlib import Path
import json,hashlib
W=Path(__file__).parent;R=Path('/home/enpasos/projects/skillpilot');j=json.loads((R/'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json').read_text());rows=[]
for row in j['rows']:
 receipt=json.loads((R/row['receipt']['path']).read_text());s=json.loads((R/receipt['ownerSource']['path']).read_text());g=next(g for g in s['goals']if g['id']==row['goalId']);links=[x for x in g.get('resourceLinks',[])if x.get('type')=='goal-visualization' and x.get('role')=='primary'];assert len(links)==1;url=links[0]['url'];asset=R/('app/public'+url);context={k:g[k]for k in ['title','description','titleEn','descriptionEn']if k in g};context.update(landscapeId=row['landscapeId'],subject=receipt['context']['subject'],goalId=g['id'],assetSha256='sha256:'+hashlib.sha256(asset.read_bytes()).hexdigest(),imageUrl=url,publicAssetPath='app/public'+url,canonicalAssetPath='curricula/DE/Gymnasium/visualizations/'+url.removeprefix('/assets/goal-visualizations/'))
 if g.get('dimensionTags',{}).get('demandLevel'):context['demandLevel']=g['dimensionTags']['demandLevel']
 rows.append({**row,'current':context,'boxplotV2':False})
(W/'old74-native-inputs.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
p=W/'candidate/app/scripts/testMath58ReaderCandidate.ts';s=p.read_text();s=s.replace("const inputs = JSON.parse(readFileSync(W + '/native-inputs.json', 'utf8'))", "const inputs = JSON.parse(readFileSync(W + (process.env.MATH58_OLD74 === '1' ? '/old74-native-inputs.json' : '/native-inputs.json'), 'utf8'))");s=s.replace("'/native-reader-'+(process.env.MATH58_BOX_V2", "'/native-reader-'+(process.env.MATH58_OLD74 === '1' ? 'old74' : process.env.MATH58_BOX_V2");p.write_text(s)
