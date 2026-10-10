import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const c=normalizeCanonicalLandscape(JSON.parse(readFileSync(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),'utf8'))),index=buildCanonicalGraphIndex(c)
const views=[]
for(const name of readdirSync(resolve(root,'curricula/DE/Gymnasium/composition-views/wirtschaft')).filter(x=>x.endsWith('.view.json')).sort()){
 const view=normalizeCompositionView(JSON.parse(readFileSync(resolve(root,'curricula/DE/Gymnasium/composition-views/wirtschaft',name),'utf8')))
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,index.goalById)
 views.push({name,scope:view.scope,targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort()})
}
writeFileSync(resolve(out,'actual-current35-native-target-prerequisite-only-sets.READONLY.json'),JSON.stringify(views,null,2)+'\n')
console.log(JSON.stringify({currentWholeViews:views.length,nativeRoleSets:true,noFingerprintsOrReviews:true}))
