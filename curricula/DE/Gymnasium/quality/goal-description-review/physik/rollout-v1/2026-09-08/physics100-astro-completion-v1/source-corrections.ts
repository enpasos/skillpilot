/** Current exact metadata corrections. Historical B040 source leases stay frozen. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const check=(value:any,message:string)=>{if(!value)throw Error(message)}
const encode=(value:any)=>JSON.stringify(value,null,2)+'\n'
export function sourceCorrections(root:string) {
  const files:any[]=[],reconciliation:any[]=[],splices:any[]=[]
  const read=(path:string)=>readFileSync(resolve(root,path),'utf8')
  const snOldUrl='https://www.schulportal.sachsen.de/lplandb/lehrplan/102'
  const snUrl='https://www.schulportal.sachsen.de/lplandb/lehrplan/file/125/vo3eXMDs8Ua4hqbRxPxG'
  // Correct bibliographic labels only. Stable source IDs, filenames and edition-key
  // compatibility strings remain unchanged; no source competence or mapping changes.
  const labels=[
    ['Lehrplan Gymnasium Physik Sachsen 2025','Lehrplan Gymnasium Physik Sachsen 2019'],
    ['Lehrplan Gymnasium 2025 Source-Extraction','Lehrplan Gymnasium 2019 Source-Extraction'],
    ['Lehrplan Physik Gymnasium 2025','Lehrplan Physik Gymnasium 2019'],
    ['Lehrplan Gymnasium Sachsen 2025','Lehrplan Gymnasium Sachsen 2019'],
  ]
  const correct=(s:string)=>labels.reduce((text,[before,after])=>text.replaceAll(before,after),s).replaceAll(snOldUrl,snUrl)
  for(const [stage,key]of [['lower-secondary','SEKI'],['upper-secondary','SEKII']]) {
    const path=`curricula/DE/Gymnasium/input/SN/${stage}/source-extraction/DE_SN_PHYSIK_${key}_LEHRPLAN_GYMNASIUM_2025.source-extraction.json`
    const before=read(path),doc=JSON.parse(before)
    check(doc.sourceDocument.url===snOldUrl&&doc.sourceDocument.title==='Lehrplan Gymnasium Physik Sachsen 2025','SN bibliographic lease '+path)
    const after=correct(before),next=JSON.parse(after)
    check(doc.sourceGoals.length===next.sourceGoals.length,'SN source count unchanged')
    for(let i=0;i<doc.sourceGoals.length;i++) {
      const a={...doc.sourceGoals[i]},b={...next.sourceGoals[i]};delete a.sourceRef;delete b.sourceRef
      check(JSON.stringify(a)===JSON.stringify(b),'SN correction must not alter source competence '+a.id)
    }
    files.push({path,before,after})
    reconciliation.push({file:path,type:'bibliographic-only',oldDocumentUrl:snOldUrl,newDocumentUrl:snUrl,editionLabelBefore:'2025',editionLabelAfter:'2019',sourceGoalCount:doc.sourceGoals.length,sourceCompetenceFieldsUnchanged:true,stableIdsAndFilenameRetained:true,reason:'Actual local and official Physik PDF is the 2004/2007/2009/2011/2019 curriculum; former URL points to Astronomy, not Physics. All sourceRef labels change mechanically, not the content, spans, pages or decisions.'})
  }
  const snGenerator='app/scripts/generateSnPhysicsSourceExtraction.ts',snBefore=read(snGenerator),snAfter=correct(snBefore)
  check(snBefore.includes("const sourcePdfUrl = '"+snOldUrl+"'"),'SN generator URL lease')
  files.push({path:snGenerator,before:snBefore,after:snAfter})
  splices.push({file:snGenerator,type:'closed-literal-metadata-replacements',replacements:[...labels,[snOldUrl,snUrl]]})
  const bwPath='curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_PHYSIK_SEKII_BP2016_V2.source-extraction.json'
  const bwBefore=read(bwPath),bw=JSON.parse(bwBefore),rows=bw.sourceGoals.filter((g:any)=>g.topicCode==='3.5.7')
  check(rows.length===9,'BW exact nine astronomy source rows')
  for(const g of rows) {
    const before=`Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, 3.5.7 (${g.bulletIndex}), S. 37.`
    check(g.sourceRef===before,'BW exact old sourceRef '+g.id)
    const after=before.replace('S. 37.',`S. ${g.bulletIndex===9?39:38}.`)
    g.sourceRef=after
    reconciliation.push({file:bwPath,sourceGoalId:g.id,field:'sourceRef',before,after,reason:'Original BW V2 PDF: physical pages40/41, printed38/39; bullet9 begins on printed39. No source-content or course-label change.'})
  }
  const gw=bw.sourceGoals.find((g:any)=>g.id==='bw-phys-sekii-3-5-4-b08-a01-f1cbf258')
  check(gw?.sourceRef==='Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, 3.5.4 (8), S. 35.','BW gravitational-wave sourceRef lease')
  reconciliation.push({file:bwPath,sourceGoalId:gw.id,field:'sourceRef',before:gw.sourceRef,after:gw.sourceRef.replace('S. 35.','S. 36.'),reason:'Actual original PDF physical38/printed36 contains 3.5.4(8), freshly read for the narrow GW comparison terminal.'})
  gw.sourceRef=gw.sourceRef.replace('S. 35.','S. 36.')
  files.push({path:bwPath,before:bwBefore,after:encode(bw)})
  const bwGenerator='app/scripts/generateBwPhysicsSourceExtraction.ts',bwGenBefore=read(bwGenerator)
  const before='sourceRef: `Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, ${sourceSpan}, S. ${topic.page || \'?\'}.`,'
  const after='sourceRef: `Bildungsplan 2016 Gymnasium Physik Baden-Wuerttemberg, ${sourceSpan}, S. ${topic.spec.code === \'3.5.7\' ? (bulletIndex === 9 ? 39 : 38) : topic.spec.code === \'3.5.4\' && bulletIndex === 8 ? 36 : (topic.page || \'?\')}.`,'
  check(bwGenBefore.split(before).length===2,'BW sourceRef generator exact anchor')
  files.push({path:bwGenerator,before:bwGenBefore,after:bwGenBefore.replace(before,after)})
  splices.push({file:bwGenerator,type:'exact-source-reference-expression',before,after})
  return {files,reconciliation,splices}
}
