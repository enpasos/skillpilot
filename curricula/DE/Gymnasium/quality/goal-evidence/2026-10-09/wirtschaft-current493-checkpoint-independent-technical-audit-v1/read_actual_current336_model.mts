import { readFile,writeFile } from 'node:fs/promises'
import { loadGoalBookBuildInputs,stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-checkpoint-independent-technical-audit-v1'
const actual=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-economics-current-canonical.json')
const old=JSON.parse(await readFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-qualified-active-integration-and-book-root-v1/whole-active-current336.normal-production-book-model.json','utf8'))
const differences=[]
for(const key of Object.keys(actual.model.source)) if(stableGoalBookJson(actual.model.source[key as keyof typeof actual.model.source])!==stableGoalBookJson(old.source[key])) differences.push({field:key,before:old.source[key],after:actual.model.source[key as keyof typeof actual.model.source]})
const out={technicalOnly:true,oldFrozen336NativeModelDigest:old.digest,currentNativeModelDigest:actual.model.digest,
 actual336WholeOwnerPagesEqual:stableGoalBookJson(actual.model.pages)===stableGoalBookJson(old.pages),
 actualBookAndNavigationEqual:stableGoalBookJson(actual.model.book)===stableGoalBookJson(old.book)&&stableGoalBookJson(actual.model.navigation)===stableGoalBookJson(old.navigation),
 actualSourceMetadataDifferences:differences,
 noAutomaticReviewInvalidationOrScientificClosureClaimed:true,
 currentBookRebuildNotWritten:true,
 limitation:'Frozen173 review packages remain bound to their own historical source digest; a current active full-book rebuild may have a different model digest after technical QA source-path rebinding. No fingerprints are rewritten by this audit.'}
await writeFile(root+'/raw.actual-native336-rebuild-after-QA-source-binding.json',JSON.stringify(out,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(out))

