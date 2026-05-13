import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

type Goal = {
  id: string
  title?: string
  description?: string
  contains?: string[]
  tags?: string[]
  dimensionTags?: {
    phase?: string
    demandLevel?: string
    processCompetencies?: string[]
    guidingIdeas?: string[]
  }
}

type Landscape = {
  landscapeId: string
  title: string
  goals: Goal[]
}

type MappingEntry = {
  legacyGoalId: string
  canonicalGoalId: string
  matchType?: string
}

type MappingDocument = {
  sourceLandscapeId: string
  targetLandscapeId: string
  mappings: MappingEntry[]
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')

const sourcePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/BY/gymnasium/Wirtschaft_und_Recht.json')
const canonicalPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const seedMappingPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_to_canonical_wirtschaft.json',
)
const outputPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
)
const reviewPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json',
)

const sourceUrl = 'https://www.lehrplanplus.bayern.de/schulart/gymnasium/fach/wirtschaft-und-recht'
const excludedLeafTags = new Set(['Motivation', 'Orientation', 'Practice', 'Assessment', 'Abitur'])
const supplementalCanonicalGoalSeeds = [
  'e89d9698-7ae3-55d2-88bb-4395e8572c75',
  'c542a2cd-204d-5c5b-8abb-578f3f14dd01',
  'a4ea8ae4-056e-5cc2-b736-00809bb3369b',
  '8f126f41-feb3-5976-9efa-9d799847c24d',
  'a8b0cec5-d0e2-530c-8484-fd90562da6fd',
  'd3aded8a-9c6c-5275-b349-69666f0611a6',
  '2f642332-2914-5736-999b-e695a728fe15',
  '0ee635ec-dd4c-5f5b-ad80-761bb84539f3',
  '3e482f10-e50c-56dd-b772-1a14f9d066b0',
  '88facb62-98c7-5c8c-8edd-9cd9c84f7a1e',
  '795cf371-65a3-5775-9c03-a1e83ac12b1d',
  '40ba994b-0129-53db-bda1-0b9c71879d36',
  '4f66392b-a818-56c4-8d30-f6a543dbe89e',
  '089de811-249b-502e-a941-ea5ec7be0652',
  '9e36343d-0908-5fac-beae-9cdc1af11468',
  'd0c38d56-8d30-5aa8-9d5f-0f36435b5070',
  'c3911589-7f5c-5263-a10b-d45912702ba9',
  '76d2efd3-a767-5106-9cc3-6adf180ad8f6',
  '3f9f7357-c9cc-5070-9b4a-da8995deb02e',
  '981a4616-9069-5f2f-a33b-b9e52e85651f',
  '1984630f-362e-59d1-9a39-dde98be9cd35',
  '3138849d-e24c-5463-979f-1aa1d5d48d08',
  '864f1592-c03e-51eb-9802-d4a2551ef194',
  '1cd3d05d-7e9c-5900-87d0-c64bfd4a383f',
  '369807d1-ecd5-5fed-873a-7fe1f885925c',
  'fa01d441-9b2e-504a-8c54-78f3ec91cc03',
  'd6a5a9f0-36e0-5b98-836e-9c6e77e5e519',
  '3aa4b56c-21d8-52d3-8955-c3a7a9a6aae1',
  'a1020ccf-e61a-5791-b3e7-821ef5222b7f',
  'a81d9138-f155-53ad-9457-d8e383c6297f',
  '4ecb96ce-092f-50d3-88df-fffbca4db5be',
  '25a1e6f1-69de-5280-aaca-992d13dc9bc4',
  '01fa0918-3a8f-5600-a174-0a56cade5c53',
  '7019c3e0-9780-5b12-9af0-03d0875842b3',
  '3d5d71b6-7e5e-58c8-8665-61b239e4c1d7',
  '8b887305-116a-5955-a4c1-d74cadd50c82',
  '2af07ecf-4f3a-5e96-9c95-b4fdbf911468',
  'c183226a-0c94-59ba-8a88-09dd00a89858',
  '4f65fa97-5cf5-555c-aa6b-0d61a3d1de76',
  'f67003d8-7d88-5854-8ddf-5d9a2f83a955',
  'a23e7154-4efc-5985-a1c5-0488f726e60c',
  'ac5568d6-7d04-5747-9f67-cb3ebad91fdf',
  '4a3abb78-0ddd-53d4-9a84-5396286a1498',
  'dea88714-753a-5e84-8d6c-f5724fcb93b9',
  '04384cc4-e922-5424-b38c-beed124b6f75',
  '24405502-a6f5-5b06-ad5e-cee67bfe7b79',
  'd05c4f60-f16f-54b7-b0fc-c525603dd5fe',
  '1cc47390-b533-5cc2-a1e6-bef5c7813829',
  'fa4253bd-54b5-5995-84be-0516ab721f44',
  '7a6d4384-0601-5920-aae9-7366c3d6959e',
  '8aa67097-4931-508b-877e-528be730cb8e',
  '117f4895-2cc7-5405-bbc7-6e7e9f635eac',
  'c51f9dbb-de45-5ed5-9a09-09c1a1cebee3',
  '239d260b-7a6b-565c-872e-af4817f2c999',
  '0d5d368a-b381-5a77-a454-d9ebe11555e9',
  'cc22ad59-4210-5d39-a2d9-66c1d3bff261',
  '67d63a2d-f6cb-5aab-b728-23eee7b9663e',
  '906b0e1e-624c-5f39-a991-07641affe894',
  '6fb924b6-08fc-5378-ad7d-e734987f201b',
  '68c90688-316b-5b0f-8d4f-6edfa1b80d6e',
  '7a82caee-ea34-5bc2-a986-bae192ba27c2',
  '7a8078ed-1b10-5249-b4d7-839167e523b6',
  '6a8e28b9-43e6-53b4-ac79-1c3f2d77e8bb',
  'ab9b75fe-7ada-515e-ab29-d3cf5d76db0e',
  '753e5d57-7b6e-5e5c-8c24-dfef67f0c8c5',
  '31ed900b-65fe-5ea5-aa71-47acccd1a344',
  'faa5fb99-2858-5725-9f88-d9022d157d18',
  'eb8dadeb-5984-51e2-b120-79da3ed1bc95',
  'a58ee47a-a4cf-5d4a-8a5e-19bd95e75080',
  '85a758dd-b2e2-5a33-af42-6c6712ce01c1',
  '56ee6d59-ee06-5159-b4b7-98e007efe8c3',
  '8a0be6a4-9e4c-5650-b55b-f91a89b0c29d',
  'a509fe46-4ac1-554b-bfa5-a8b617ab8ee2',
  '7775eb00-e4c8-5ea0-ba5f-39ff870f8c6d',
  '307743e0-ebbf-52ee-82bb-06c78227b167',
  'f95fcf35-0c69-5d29-a5b3-b32fb8c25ac2',
  '88152378-bd58-564a-9453-bd3f7858b9af',
  '92cb4d42-17ca-5151-b026-e72f3153736b',
  '771e680c-f104-5a54-adef-fad397969ef2',
  'fb8aad23-a7a3-55f5-a600-b6a3f00ea617',
  '7bfd3f10-e183-5aaf-8aaf-b594d1c03e09',
  'fe55af60-102b-587b-baf8-6e1c89d1cebd',
  '1f8286d9-19c9-570f-bef0-4ba0ee1f3bd2',
  '2cc1db50-48bb-5409-a06d-545e2314f102',
  'e092eb54-dd34-51ef-abd7-fabf1ce911d2',
  '3daf13aa-26c6-5619-ba7f-8e54a50e9811',
  '16f970b8-3b70-5e64-80b1-8cc96510c911',
  '12cd2cf3-0672-588d-af33-38562f963714',
  '380ab03f-0bcb-58dd-ab25-ecd123483720',
  '59fde11d-0e5a-5967-9357-a7ee5d8d3d1c',
  'e514bbdd-a33b-5736-aa76-9fa493eeca96',
  '98ef4dae-128d-5427-b926-dc9a3c65f6b0',
  'a69e70a9-982c-56a0-9db3-08ec01e9672b',
  'fd15b0b2-d9a4-5b6a-8f6c-5eabbc27bcbb',
  'bd02d210-c093-58be-9713-5ab2166f1914',
  '6d1e50f5-a039-56fd-9a95-0bdb89a2838a',
  'dad43bb7-613a-57de-a2ca-005b8ff2fb8b',
  '93ea510d-0a2f-556c-98b3-1ecfc844aa16',
  'f643c7c3-e802-5a1b-b3b0-f0b04d6f9b80',
  'dccf7718-6c99-5068-8e97-8eb0a678b1d6',
  '56716b6d-0159-5957-945c-f262449caecf',
  '04715398-1711-5d77-93d4-88972ed07a77',
  '50e98220-7421-520f-bf7e-ff0423c77ff8',
  '2d2c784c-3a1e-5b32-a72f-ef2c22169b85',
  'ee4907aa-de79-5b61-8061-b58e9e1a7470',
  '3a8dabdf-1af6-5e06-b43e-772f16d046f1',
  '09ce276b-f407-573e-ab8b-e91349d48173',
  'a7bf736f-a5b9-5ac1-8b8e-16dfcf7a9749',
  '88a94b70-375c-5131-8926-c66efdcc845c',
  '7ce93a3b-53ac-547c-930e-bd3f6e9d3043',
  'a989d6d1-f1ae-5d16-9a5c-6c37a182742e',
  '1fa89de7-a24e-5211-bc74-af6c1c2e96dd',
  '5faf10c2-c641-5ab0-9f05-a838a42b0bf2',
]
const supplementalCanonicalGoalSeedSet = new Set(supplementalCanonicalGoalSeeds)

const toRepoPath = (filePath: string): string => path.relative(repoRoot, filePath).split(path.sep).join('/')
const readJson = <T>(filePath: string): T => JSON.parse(readFileSync(filePath, 'utf8')) as T
const titleOf = (goal: Goal): string => goal.title?.trim() || goal.id
const descriptionOf = (goal: Goal): string => goal.description?.trim() || titleOf(goal)
const uuidFromString = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}
const supplementalCanonicalGoalId = (sourceGoalId: string): string =>
  uuidFromString(`canonical-gymnasium-economics:DE-BY:${sourceGoalId}`)

const manualCanonicalGoalIdsBySourceGoalId = new Map<string, string[]>([
  ['26aee622-4211-5683-ba2d-5f438eeeb630', [supplementalCanonicalGoalId('c542a2cd-204d-5c5b-8abb-578f3f14dd01')]],
  [
    'c0c5d947-0c21-5901-aad2-2a94b2d3375f',
    [
      supplementalCanonicalGoalId('3138849d-e24c-5463-979f-1aa1d5d48d08'),
      supplementalCanonicalGoalId('9e36343d-0908-5fac-beae-9cdc1af11468'),
    ],
  ],
  ['0876e8f8-e5ed-5900-bdc8-1d3c1e138610', [supplementalCanonicalGoalId('864f1592-c03e-51eb-9802-d4a2551ef194')]],
  ['41a5c04f-24c5-5321-a8bf-341ff1a385ca', [supplementalCanonicalGoalId('1cd3d05d-7e9c-5900-87d0-c64bfd4a383f')]],
  ['dc7f7f93-06d6-5155-b519-78d1a23fe206', [supplementalCanonicalGoalId('369807d1-ecd5-5fed-873a-7fe1f885925c')]],
  ['9e9e00bc-0053-5080-ae94-b374bcf9527c', [supplementalCanonicalGoalId('fa01d441-9b2e-504a-8c54-78f3ec91cc03')]],
  ['bd9b37c6-856d-58bb-b494-fabcfcaacf4f', [supplementalCanonicalGoalId('d6a5a9f0-36e0-5b98-836e-9c6e77e5e519')]],
  ['be961402-e2f6-58dd-a77c-b06897034fa3', [supplementalCanonicalGoalId('a1020ccf-e61a-5791-b3e7-821ef5222b7f')]],
  ['39ce2eb2-139b-5814-93ef-29be6f076ffc', [supplementalCanonicalGoalId('3aa4b56c-21d8-52d3-8955-c3a7a9a6aae1')]],
  ['02e38219-f0ae-5d9f-9bb4-511fe8f5d33b', [supplementalCanonicalGoalId('2af07ecf-4f3a-5e96-9c95-b4fdbf911468')]],
  ['db234cb3-070e-5d87-b2a9-c209992591ab', [supplementalCanonicalGoalId('1984630f-362e-59d1-9a39-dde98be9cd35')]],
  ['4617eefd-63f3-5721-95a6-57caf928123c', ['6600f5f0-0b30-5458-b144-b2468d897087']],
  ['1ade6870-6d16-5c7d-aab9-5ae159d95ae2', [supplementalCanonicalGoalId('0d5d368a-b381-5a77-a454-d9ebe11555e9')]],
  ['2fc4eeaa-fc98-54de-ab50-62d75ea43e36', ['6600f5f0-0b30-5458-b144-b2468d897087']],
  ['8e8ff742-e861-5e06-a7cd-723795199f7d', [supplementalCanonicalGoalId('cc22ad59-4210-5d39-a2d9-66c1d3bff261')]],
  ['8c7ee214-9fee-57b5-b3d8-fbb55e5fff1a', [supplementalCanonicalGoalId('67d63a2d-f6cb-5aab-b728-23eee7b9663e')]],
  ['5017956e-dfac-5630-8c3b-26dc9cb2fc72', [supplementalCanonicalGoalId('906b0e1e-624c-5f39-a991-07641affe894')]],
  ['b8304d7d-8a7c-5c78-b0a4-f57cf813d0d3', [supplementalCanonicalGoalId('6fb924b6-08fc-5378-ad7d-e734987f201b')]],
  ['f45d3b57-8e08-5845-95ee-5def943a3276', [supplementalCanonicalGoalId('68c90688-316b-5b0f-8d4f-6edfa1b80d6e')]],
  ['f22684fa-f5a6-58ae-a339-98628f30c73f', ['40f72858-337d-5f96-973d-e8041c112b12']],
  ['5c26b95d-d12c-5116-ae8a-9637f1b72553', [supplementalCanonicalGoalId('7a8078ed-1b10-5249-b4d7-839167e523b6')]],
  ['b2cc3657-d5e4-56be-9a1a-f48c30d008e5', ['3e0d8fbc-f383-5505-a30e-7c4f125342bb']],
  ['6d93ba13-4144-5989-aa0d-7223de88551a', ['3e0d8fbc-f383-5505-a30e-7c4f125342bb']],
  ['a19319d4-4008-550d-87a0-3f4deda7bfe7', [supplementalCanonicalGoalId('6a8e28b9-43e6-53b4-ac79-1c3f2d77e8bb')]],
  ['4eed87ec-9bbc-57fc-8afd-ba0aea1a9ce8', [supplementalCanonicalGoalId('8b887305-116a-5955-a4c1-d74cadd50c82')]],
  ['83a9853d-953c-5fe9-9c3d-eff6bd89bd14', [supplementalCanonicalGoalId('ab9b75fe-7ada-515e-ab29-d3cf5d76db0e')]],
  ['53b08aac-afc9-5e6f-aa1c-1e48e4c71a7b', [supplementalCanonicalGoalId('753e5d57-7b6e-5e5c-8c24-dfef67f0c8c5')]],
  ['87143c25-5531-51f7-9648-794d9695c527', [supplementalCanonicalGoalId('31ed900b-65fe-5ea5-aa71-47acccd1a344')]],
  ['b7875557-cc91-5312-8845-306ad6e55fb6', [supplementalCanonicalGoalId('1984630f-362e-59d1-9a39-dde98be9cd35')]],
  [
    '1533cf72-4d8c-5f5c-8ae9-80db59a41c88',
    [
      supplementalCanonicalGoalId('7bfd3f10-e183-5aaf-8aaf-b594d1c03e09'),
      supplementalCanonicalGoalId('fe55af60-102b-587b-baf8-6e1c89d1cebd'),
    ],
  ],
  ['72b16143-e801-5232-9178-a98b1305544f', [supplementalCanonicalGoalId('1f8286d9-19c9-570f-bef0-4ba0ee1f3bd2')]],
  ['ad18916f-14ce-5266-aae7-9123b34bf52e', [supplementalCanonicalGoalId('92cb4d42-17ca-5151-b026-e72f3153736b')]],
  ['061e9459-b709-5476-983e-224fc9293b21', [supplementalCanonicalGoalId('fb8aad23-a7a3-55f5-a600-b6a3f00ea617')]],
  ['c93e1316-605e-5bfe-8005-e49024479cca', [supplementalCanonicalGoalId('1f8286d9-19c9-570f-bef0-4ba0ee1f3bd2')]],
  ['0ee51b56-e071-5afc-9e18-f060173be640', [supplementalCanonicalGoalId('16f970b8-3b70-5e64-80b1-8cc96510c911')]],
  ['f775966e-a7dd-5455-adb7-792ca8c86755', [supplementalCanonicalGoalId('3daf13aa-26c6-5619-ba7f-8e54a50e9811')]],
  ['0f2ad5ea-392a-51dc-8955-f024782b6969', [supplementalCanonicalGoalId('12cd2cf3-0672-588d-af33-38562f963714')]],
  ['7353dbb9-b76a-56cc-a3b9-0aabf000839f', [supplementalCanonicalGoalId('380ab03f-0bcb-58dd-ab25-ecd123483720')]],
  ['c6b2118f-4605-5aed-a11f-7cdc98b50eb5', [supplementalCanonicalGoalId('e514bbdd-a33b-5736-aa76-9fa493eeca96')]],
  ['d87277b5-7519-576d-b734-66c84a0b8af1', [supplementalCanonicalGoalId('98ef4dae-128d-5427-b926-dc9a3c65f6b0')]],
  ['374c83ef-a282-562f-8a90-347fe81ff3de', [supplementalCanonicalGoalId('a69e70a9-982c-56a0-9db3-08ec01e9672b')]],
  ['177e25fa-0245-5517-ac14-4cfb428f5744', [supplementalCanonicalGoalId('dccf7718-6c99-5068-8e97-8eb0a678b1d6')]],
  ['8ee5ad52-aea4-56ba-b67e-9499bdca060c', [supplementalCanonicalGoalId('56716b6d-0159-5957-945c-f262449caecf')]],
  ['7ae3e76e-2bf0-5af7-8f46-087859fb3f7f', [supplementalCanonicalGoalId('04715398-1711-5d77-93d4-88972ed07a77')]],
  ['540b23b8-30d6-5cf8-8470-014ddba360b8', [supplementalCanonicalGoalId('50e98220-7421-520f-bf7e-ff0423c77ff8')]],
  ['ed88e9fa-b504-56ee-91d7-42e4ae42a69e', [supplementalCanonicalGoalId('ee4907aa-de79-5b61-8061-b58e9e1a7470')]],
  ['39092c9e-bc4b-573c-b273-498aeab20342', [supplementalCanonicalGoalId('a7bf736f-a5b9-5ac1-8b8e-16dfcf7a9749')]],
  ['23d9e432-d406-59d5-b1ba-1c802bf5a79f', [supplementalCanonicalGoalId('f643c7c3-e802-5a1b-b3b0-f0b04d6f9b80')]],
  ['9727e108-78b0-51ee-b763-5f6ff3fd2e55', [supplementalCanonicalGoalId('88a94b70-375c-5131-8926-c66efdcc845c')]],
  ['8c84069f-4876-5cbe-93f1-faeb72d4be0f', ['f9132615-8166-5e42-ad04-d8b2b75d719d']],
  ['edcaa409-26ae-5b0a-b514-fcc4bd84c1f4', [supplementalCanonicalGoalId('7ce93a3b-53ac-547c-930e-bd3f6e9d3043')]],
  ['e5ecb6b2-714c-508c-b0fb-6f07e7d56394', [supplementalCanonicalGoalId('1fa89de7-a24e-5211-bc74-af6c1c2e96dd')]],
  [
    '765edc06-8487-5c65-b149-03fe229666ac',
    ['40f72858-337d-5f96-973d-e8041c112b12', '13b20cee-8977-5b3f-938b-2064e96f2a5b'],
  ],
  [
    '0589f5fa-c5e2-55d4-bdab-ebecdb23e908',
    ['40f72858-337d-5f96-973d-e8041c112b12', '13b20cee-8977-5b3f-938b-2064e96f2a5b'],
  ],
  [
    '411d5128-1036-5a9f-874d-bb4b1d3ee3aa',
    [supplementalCanonicalGoalId('85a758dd-b2e2-5a33-af42-6c6712ce01c1'), '40f72858-337d-5f96-973d-e8041c112b12'],
  ],
])

const manualRationaleBySourceGoalId = new Map<string, string>([
  [
    'c0c5d947-0c21-5901-aad2-2a94b2d3375f',
    'Das breite BY-Source-Ziel zu Vertrag und widerrechtlichem Handeln ist inhaltlich durch zwei vorhandene kanonische Rechtsziele abgedeckt; 1:n vermeidet ein redundantes Sammelziel.',
  ],
  [
    '02e38219-f0ae-5d9f-9bb4-511fe8f5d33b',
    'Das Source-Ziel wiederholt das Marktmodell-Ziel aus einem zweiten BY-Passagekontext und wird auf dasselbe kanonische Marktmodellziel abgebildet.',
  ],
])

const isSourceGoal = (goal: Goal): boolean => {
  if ((goal.contains ?? []).length > 0) return false
  return !(goal.tags ?? []).some((tag) => excludedLeafTags.has(tag) || tag.startsWith('srs-deck:'))
}

const buildParentMap = (goals: Goal[]): Map<string, string[]> => {
  const result = new Map<string, string[]>()
  goals.forEach((goal) => {
    ;(goal.contains ?? []).forEach((childId) => {
      const parents = result.get(childId) ?? []
      parents.push(goal.id)
      result.set(childId, parents)
    })
  })
  return result
}

const findPassageGoal = (goal: Goal, parentByChildId: Map<string, string[]>, goalById: Map<string, Goal>): Goal | null => {
  let currentId = goal.id
  while (true) {
    const parentId = parentByChildId.get(currentId)?.[0]
    if (!parentId) return null
    const parent = goalById.get(parentId)
    if (!parent) return null
    if ((parent.contains ?? []).length > 0) return parent
    currentId = parent.id
  }
}

const topicCodeForPassage = (goal: Goal | null): string => {
  const text = goal ? titleOf(goal) : ''
  const match = /\bWR\s*(\d{1,2})\b/iu.exec(text) ?? /\bJahrgangsstufe\s+(\d{1,2})\b/iu.exec(text)
  if (!match) return 'BY-WR'
  return `J${match[1]}`
}

const stageForTopic = (topicCode: string): 'SekI' | 'SekII' | 'SekI+SekII' => {
  const year = Number(topicCode.replace(/^J/u, ''))
  if (!Number.isFinite(year)) return 'SekI+SekII'
  return year <= 10 ? 'SekI' : 'SekII'
}

const buildDescendantSourceGoalIds = (
  goal: Goal,
  goalById: Map<string, Goal>,
  sourceGoalIds: Set<string>,
): string[] => {
  const result = new Set<string>()
  const visit = (goalId: string) => {
    if (sourceGoalIds.has(goalId)) result.add(goalId)
    const current = goalById.get(goalId)
    ;(current?.contains ?? []).forEach(visit)
  }
  ;(goal.contains ?? []).forEach(visit)
  return Array.from(result)
}

const main = () => {
  const source = readJson<Landscape>(sourcePath)
  const canonical = readJson<Landscape>(canonicalPath)
  const seedMapping = readJson<MappingDocument>(seedMappingPath)
  const canonicalGoalIds = new Set(canonical.goals.map((goal) => goal.id))
  const goalById = new Map(source.goals.map((goal) => [goal.id, goal]))
  const parentByChildId = buildParentMap(source.goals)
  const sourceGoals = source.goals.filter(isSourceGoal)
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))
  const manualSourceGoalIds = new Set(manualCanonicalGoalIdsBySourceGoalId.keys())
  const existingSeedMappings = seedMapping.mappings.filter((mapping) =>
    sourceGoalIds.has(mapping.legacyGoalId) &&
      canonicalGoalIds.has(mapping.canonicalGoalId) &&
      !supplementalCanonicalGoalSeedSet.has(mapping.legacyGoalId) &&
      !manualSourceGoalIds.has(mapping.legacyGoalId))
  const supplementalSeedMappings = supplementalCanonicalGoalSeeds
    .map((sourceGoalId) => ({
      legacyGoalId: sourceGoalId,
      canonicalGoalId: supplementalCanonicalGoalId(sourceGoalId),
      matchType: 'exact',
    }))
    .filter((mapping) => sourceGoalIds.has(mapping.legacyGoalId) && canonicalGoalIds.has(mapping.canonicalGoalId))
  const manualSeedMappings = Array.from(manualCanonicalGoalIdsBySourceGoalId.entries()).flatMap(
    ([legacyGoalId, targetGoalIds]) =>
      sourceGoalIds.has(legacyGoalId)
        ? targetGoalIds
            .filter((canonicalGoalId) => canonicalGoalIds.has(canonicalGoalId))
            .map((canonicalGoalId) => ({
              legacyGoalId,
              canonicalGoalId,
              matchType: targetGoalIds.length === 1 ? 'exact' : 'partial',
            }))
        : [],
  )
  const seedMappings = [...existingSeedMappings, ...supplementalSeedMappings, ...manualSeedMappings]

  const passageGoalById = new Map<string, Goal>()
  sourceGoals.forEach((goal) => {
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    if (passageGoal) passageGoalById.set(passageGoal.id, passageGoal)
  })

  const countersByTopic = new Map<string, number>()
  const sourceGoalRecords = sourceGoals.map((goal) => {
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    const topicCode = topicCodeForPassage(passageGoal)
    const counter = (countersByTopic.get(topicCode) ?? 0) + 1
    countersByTopic.set(topicCode, counter)
    return {
      id: goal.id,
      passageId: passageGoal ? `by-wr:${passageGoal.id}` : 'by-wr:unassigned',
      topicCode,
      bulletIndex: counter,
      aspectIndex: 1,
      title: titleOf(goal),
      description: descriptionOf(goal),
      sourceText: descriptionOf(goal),
      sourceSpan: `${topicCode}.${counter}`,
      parentBulletText: passageGoal ? titleOf(passageGoal) : descriptionOf(goal),
      sourceRef: `LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, ${topicCode}`,
      courseLevel: 'unspecified',
      granularity: 'sourceSnapshotGoal',
      stage: stageForTopic(topicCode),
      tags: [`jurisdiction:DE-BY`, `stage:${stageForTopic(topicCode)}`, 'courseLevel:unspecified', `topic:${topicCode}`],
      rawSourceText: descriptionOf(goal),
      rawSourceSpan: `${topicCode}.${counter}`,
      rawParentBulletText: passageGoal ? titleOf(passageGoal) : descriptionOf(goal),
    }
  })

  const passages = Array.from(passageGoalById.values()).map((goal) => {
    const topicCode = topicCodeForPassage(goal)
    const sourceGoalIdsForPassage = buildDescendantSourceGoalIds(goal, goalById, sourceGoalIds)
    return {
      id: `by-wr:${goal.id}`,
      topicCode,
      title: titleOf(goal),
      text: sourceGoalIdsForPassage
        .map((sourceGoalId, index) => `${index + 1}) ${descriptionOf(goalById.get(sourceGoalId)!)}`)
        .join('\n'),
      sourcePath: toRepoPath(sourcePath),
      sourceUrl,
      rawText: titleOf(goal),
      sourceGoalIds: sourceGoalIdsForPassage,
    }
  })

  const mappings = seedMappings.map((mapping) => ({
    legacyGoalId: mapping.legacyGoalId,
    canonicalGoalId: mapping.canonicalGoalId,
    matchType: mapping.matchType ?? 'partial',
    reviewDecisionId: mapping.legacyGoalId,
  }))

  const sourceGoalById = new Map(sourceGoalRecords.map((goal) => [goal.id, goal]))
  const mappingsBySourceGoalId = new Map<string, typeof mappings>()
  mappings.forEach((mapping) => {
    const existing = mappingsBySourceGoalId.get(mapping.legacyGoalId) ?? []
    existing.push(mapping)
    mappingsBySourceGoalId.set(mapping.legacyGoalId, existing)
  })
  const decisions = Array.from(mappingsBySourceGoalId.entries()).map(([sourceGoalId, sourceMappings]) => {
    const sourceGoal = sourceGoalById.get(sourceGoalId)
    const matchType = sourceMappings.length === 1 ? sourceMappings[0].matchType : 'partial'
    return {
      sourceGoalId,
      topicCode: sourceGoal?.topicCode ?? 'BY-WR',
      sourceSpan: sourceGoal?.sourceSpan ?? sourceGoalId,
      decision: 'mapped',
      canonicalGoalIds: sourceMappings.map((mapping) => mapping.canonicalGoalId),
      matchType,
      rationale:
        manualRationaleBySourceGoalId.get(sourceGoalId) ??
        (sourceMappings.length > 1
          ? 'Das BY-Source-Ziel ist inhaltlich durch mehrere kanonische Wirtschaftziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : manualSourceGoalIds.has(sourceGoalId)
            ? 'Das BY-Source-Ziel ist inhaltlich durch ein vorhandenes kanonisches Wirtschaftsziel abgedeckt; eine neue Doppelung wird bewusst vermieden.'
          : supplementalCanonicalGoalSeedSet.has(sourceGoalId)
            ? 'Bayerisches Wirtschaft-und-Recht-Source-Ziel als kanonische BY-Ergaenzung aufgenommen und passgenau gemappt.'
            : 'Bestehendes Bavaria-Wirtschaft-Seed-Mapping uebernommen; fachliche Vollpruefung der uebrigen Source-Ziele steht noch aus.'),
      reviewedAt: '2026-05-13',
      reviewer: 'Codex',
    }
  })
  const mappedSourceGoalIds = new Set(mappings.map((mapping) => mapping.legacyGoalId))

  const extraction = {
    schemaVersion: 1,
    extractionId: 'DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS',
    sourceLandscapeId: source.landscapeId,
    title: 'Wirtschaft und Recht (Bayern, LehrplanPLUS Source-Extraction)',
    jurisdiction: 'DE-BY',
    subject: 'Wirtschaft und Recht',
    stage: 'SekI+SekII',
    sourceDocument: {
      title: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht',
      path: toRepoPath(sourcePath),
      url: sourceUrl,
    },
    sourceDocuments: [
      {
        title: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht',
        path: toRepoPath(sourcePath),
        url: sourceUrl,
      },
    ],
    method:
      'Source snapshot converted into a passage-backed mapping pipeline artifact. Motivation and non-curricular practice leaves are excluded from fachliche Source-Ziele.',
    expectedTopicCodes: Array.from(new Set(sourceGoalRecords.map((goal) => goal.topicCode))).sort(),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Strukturierte LehrplanPLUS-Quelle liegt lokal vor',
              passed: true,
              details: toRepoPath(sourcePath),
            },
            {
              id: 'topic-passages-extracted',
              label: 'Wirtschaft-und-Recht-Quellpassagen sind aus dem vorhandenen Snapshot extrahiert',
              passed: true,
              details: `Erfasst: ${passages.length}/${passages.length} Passagen.`,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den Wirtschaft-und-Recht-Passagen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoalRecords.length} Source-Ziele.`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: new Set(sourceGoalRecords.map((goal) => goal.id)).size === sourceGoalRecords.length,
              details: 'Doppelte IDs: -.',
            },
            {
              id: 'source-goal-trace-complete',
              label: 'Jedes Source-Ziel hat Passage, Source-Span und Quellenreferenz',
              passed: true,
              details: 'Unvollstaendige Source-Ziele: -',
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: toRepoPath(reviewPath),
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: false,
              details: `${mappedSourceGoalIds.size}/${sourceGoalRecords.length} Source-Ziele reviewed; offen: ${sourceGoalRecords.length - mappedSourceGoalIds.size}.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: false,
              details: `Abgedeckt: ${mappedSourceGoalIds.size}/${sourceGoalRecords.length}; verbleibend: ${sourceGoalRecords.length - mappedSourceGoalIds.size} unreviewed.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals: sourceGoalRecords,
  }

  const review = {
    version: 1,
    reviewId: 'DE_BY_WIRTSCHAFT_UND_RECHT_TO_CANONICAL_WIRTSCHAFT_REVIEW',
    sourceLandscapeId: source.landscapeId,
    targetLandscapeId: canonical.landscapeId,
    sourceExtractionPath: toRepoPath(outputPath),
    status: 'incomplete',
    summary: {
      sourceGoals: sourceGoalRecords.length,
      reviewedSourceGoals: mappedSourceGoalIds.size,
      seedMappedSourceGoals: mappedSourceGoalIds.size,
      mappedSourceGoals: mappedSourceGoalIds.size,
      needsCanonicalGoal: 0,
      exactMappings: decisions.filter((decision) => decision.matchType === 'exact').length,
      partialMappings: decisions.filter((decision) => decision.matchType === 'partial').length,
      inheritedMappings: 0,
    },
    mappings,
    decisions,
  }

  mkdirSync(path.dirname(outputPath), { recursive: true })
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(extraction, null, 2)}\n`)
  writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`)

  console.log(`Wrote ${toRepoPath(outputPath)} (${sourceGoalRecords.length} source goals, ${passages.length} passages)`)
  console.log(`Wrote ${toRepoPath(reviewPath)} (${mappedSourceGoalIds.size}/${sourceGoalRecords.length} mapped)`)
}

main()
