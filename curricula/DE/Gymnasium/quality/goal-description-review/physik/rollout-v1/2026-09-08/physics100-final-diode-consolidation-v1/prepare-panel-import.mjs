// Root-authorized viewport-only reuse. Read-only CAS patch preparation; no provider calls.
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {base,paths,children,landscapeId} from './authoring-spec.mjs'
const {buildVisualizationPaths,createGoalVisualizationLink,createPromptMetadataMarkdown,createImageReconstructionPromptMetadataMarkdown}=await import(process.cwd()+'/scripts/goal_visualization_common.mjs')
const hash=x=>'sha256:'+createHash('sha256').update(x).digest('hex'),now=new Date().toISOString(),root=process.cwd()
const source='curricula/DE/Gymnasium/visualizations/physik/7f0798cb-5966-5dcb-beb3-84f637ab6139/7f0798cb-5966-5dcb-beb3-84f637ab6139.svg',sourceSvg=fs.readFileSync(source,'utf8')
const c=JSON.parse(fs.readFileSync(paths.canonical)),qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',q=JSON.parse(fs.readFileSync(qaPath)),out=['*** Begin Patch'],rows=[]
const crops=[[30,100,895,410],[930,100,640,410],[30,515,1540,385]]
const approved=['7b1053f77261d29bc2d0c653646a875ede3ebf49f8b14e492ff82a709c609478','bfac74412968fe6865a8f6b56bc23edd690e05a30a0ff38acbee9f37c3f3da7e','026c52e440415e75f67b201dab4cf4809751cb26fcfd78f41e9a9941430f4f66']
const notes=[
 'Mobile Löcher/Elektronen als Kreise, ortsfeste Akzeptor-/Donatorionen als Quadrate. Außenbereiche quasineutral, verarmte Raumladungszone mit richtigen Vorzeichen. Durchlass p+ / n− verkleinert, Sperrung p− / n+ vergrößert die Barriere. Orientierung, kein Leistungsnachweis.',
 'Explizit schematische qualitative I_D(U_D)-Kennlinie, kleiner negativer Sperrstrom und ansteigender positiver Durchlassstrom. Keine Messpunkte, keine universelle Schwellspannung, keine exakte Nullbehauptung. U an der Diode, I durch die Diode, Strombegrenzung und sichere Kleinspannung. Kein realer Aufbau oder Messdatennachweis.',
 'Geschlossener Serienkreis mit idealer Diode, Wechselquelle und Lastwiderstand. Bezugspolungen und zeitliche Zuordnung stimmen: positive Halbwelle am Lastwiderstand, negative Halbwelle null, ohne Glättung. Keine Netzspannungs- oder eigene Aufbauanweisung.',
]
const add=(p,b)=>{if(fs.existsSync(p))throw Error('No overwrite '+p);out.push('*** Add File: '+p,...b.trimEnd().split('\n').map(l=>'+'+l))}
const change=(p,b)=>{const d=spawnSync('diff',['-u',p,'-'],{input:b,encoding:'utf8',maxBuffer:4000000});if(d.status===1)out.push('*** Update File: '+p,...d.stdout.trimEnd().split('\n').slice(2).map(l=>/^@@ .* @@/u.test(l)?'@@':l));else if(d.status!==0)throw Error('diff '+p)}
for(const [i,id] of children.entries()){
 const g=c.goals.find(g=>g.id===id),p=buildVisualizationPaths(g,{subjectPath:'physik',lang:'de',extension:'png'}),relative=x=>x.slice(root.length+1),draft=base+'/panel-drafts/'+id,svg=fs.readFileSync(draft+'.svg','utf8'),png=fs.readFileSync(draft+'.png'),[x,y,w,h]=crops[i]
 if(hash(png)!=='sha256:'+approved[i])throw Error('Root-reviewed PNG mismatch')
 if(svg.replace(`width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"`,'width="1600" height="900" viewBox="0 0 1600 900"')!==sourceSvg)throw Error('Not viewport-only')
 if(g.resourceLinks?.length)throw Error('Concurrent image binding')
 const provider='SkillPilot / unchanged panel crop of reviewed repo-native SVG',license='AI-assisted, SkillPilot-curated (unchanged repo-native SVG panel)',reviewStatus='accepted'
 g.resourceLinks=[createGoalVisualizationLink(g,{provider,description:'Unveränderter zielspezifischer Ausschnitt der bestehenden Diodenübersicht; '+notes[i],altText:notes[i],lang:'de',license,reviewStatus,publicUrl:p.publicUrl})]
 const rawPrompt=`Keine neue Bildgenerierung. Erhalte das vollständige innere SVG aus ${source} byteidentisch. Ändere ausschließlich width="${w}", height="${h}" und viewBox="${x} ${y} ${w} ${h}". Rasterisiere mit rsvg-convert. Keine neuen Texte, Pfeile, Werte oder Panels.\n\n${notes[i]}`
 add(relative(p.sourceImagePath).replace(/\.png$/,'.svg'),svg)
 add(relative(p.sourcePromptPath),createPromptMetadataMarkdown(g,{provider,reviewStatus,fileName:p.fileName,publicUrl:p.publicUrl,rawPrompt}))
 add(relative(p.sourceReconstructionPromptPath),createImageReconstructionPromptMetadataMarkdown(g,{provider,sourceImageFile:p.fileName,rawPrompt}))
 const r=q.records.find(r=>r.goalId===id);if(!r||r.assetSha256)throw Error('Expected current missing image QA row')
 Object.assign(r,{visualizationState:'available',missingReason:'',imageUrl:p.publicUrl,publicAssetPath:relative(p.publicImagePath),canonicalAssetPath:relative(p.sourceImagePath),assetSha256:hash(png),umlautsCorrectChatGpt:'yes',contentApprovedChatGpt:'yes',chatGptReviewedAt:now,chatGptReviewer:'codex-physics-final-diode-informed-author-b',chatGptNotes:notes[i],aiApproved:'yes',aiApprovedAssetSha256:hash(png),aiReviewedAt:now,aiReviewer:'codex-root-informed-counterreview-20260908',aiNotes:'Root actually inspected the complete PNG at its exact SHA256. '+notes[i]})
 rows.push({goalId:id,viewport:crops[i],sourceSvg:source,sourceSvgSha256:hash(sourceSvg),svgSha256:hash(svg),pngSha256:hash(png),innerSvgByteIdentical:true,draftPng:draft+'.png',canonicalPng:relative(p.sourceImagePath),publicPng:relative(p.publicImagePath),backendPng:relative(p.backendImagePath),compatibilityWithPositiveProfile:notes[i]})
}
change(paths.canonical,JSON.stringify(c,null,2)+'\n');change(qaPath,JSON.stringify(q,null,2)+'\n')
add(base+'/panel-reuse-receipt.json',JSON.stringify({schemaVersion:1,reviewedAt:now,status:'INFORMED_AI_COUNTERREVIEW_PASS',author:'codex-physics-final-diode-informed-author-b',counterreviewer:'codex-root',providerCalls:0,humanApproval:false,blindDReview:false,authorisation:'Root explicitly allowed unchanged panels of the existing reviewed SVG during pause consolidation; not a claim of failed Nano Banana attempts.',rows},null,2)+'\n')
add('curricula/DE/Gymnasium/quality/goal-visualization-review/physik-2026-09-08-final-diode-panel-reuse.md','# Physics final diode panel reuse\n\nReview date: 2026-09-08\n\nStatus: `completed`\n\nExplicit root authorization: unchanged crops from the already reviewed repository-native parent SVG; zero provider calls and no fabricated provider limitation. Parent source and image remain byte-identical. Author and root independently inspected all complete cropped PNGs. AI approval only, no human approval or D acceptance. Hashes and viewport-only proof: `'+base+'/panel-reuse-receipt.json`.\n\n| Goal ID | Title | Decision | Review notes |\n| --- | --- | --- | --- |\n'+children.map((id,i)=>'| `'+id+'` | '+c.goals.find(g=>g.id===id).title+' | `accepted_pilot` | '+notes[i]+' |').join('\n')+'\n')
out.push('*** End Patch');console.log(out.join('\n'))
