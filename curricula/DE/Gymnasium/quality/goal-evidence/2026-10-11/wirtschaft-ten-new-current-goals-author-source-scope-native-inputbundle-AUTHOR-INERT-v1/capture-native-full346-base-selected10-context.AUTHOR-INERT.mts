import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel.ts';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const outputDirectory = resolve(process.argv[2]);
const config = JSON.parse(await readFile(resolve(outputDirectory, 'ten-current-new-goals.native-batch.config.json'), 'utf8'));
const base = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath);
const selected = new Set<string>(config.goalIds);
const pages = config.goalIds.map((id: string) => {
 const page = base.model.pages.find(p => p.goalId === id);
 if (!page) throw new Error(`Missing current native base page ${id}`);
 return page;
});
await writeFile(resolve(outputDirectory, 'actual-native-full346-base-selected10-pages-and-context.INPUT.json'), JSON.stringify({
 artifactKind: 'AUTHOR_INERT_NATIVE_CURRENT_BASE_CONTEXT_NO_D_VERDICT',
 baseGoalBookConfigPath: config.baseGoalBookConfigPath,
 nativeFunction: 'loadGoalBookBuildInputs',
 baseModelDigest: base.model.digest,
 book: base.model.book,
 source: base.model.source,
 navigation: base.model.navigation,
 chapters: base.model.chapters.filter(c => c.goalIds.some(id => selected.has(id))),
 pages,
}, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ nativeBaseModelDigest: base.model.digest, eligibleOrdinaryPages: base.model.pages.length, selectedPages: pages.length }));
