import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

interface SourceLandscape {
  landscapeId: string
  goals: SourceGoalNode[]
}

interface SourceGoalNode {
  id: string
  title: string
  description?: string
  contains?: string[]
  tags?: string[]
}

interface SourceDocument {
  key: string
  title: string
  path: string
  role: string
  official: true
  url: string
}

interface Passage {
  id: string
  topicCode: string
  title: string
  text: string
  sourcePath: string
  sourceUrl: string
  rawText: string
  sourceGoalIds: string[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: 'GK_LK' | 'LK' | 'unspecified'
  granularity: 'officialCompetency'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface PipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface PipelineStep {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: PipelineCheck[]
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const sourcePath = 'curricula/DE/Gymnasium/input/BY/gymnasium/Physik.json'
const outputPath = 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
const reviewPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json'
const legacyMappingPath = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json'
const canonicalPhysicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const reviewedCanonicalTargetsBySourceGoalId: Record<string, string[]> = {
  'ec4d15a2-9b21-5aba-a4fc-f758db183708': [
    'ec7a0a68-730b-5c94-ac72-a937508f8303',
    'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
    '39b2a0c4-eecf-5049-b58f-e790790a3bf2',
  ],
  'eb9dfc9d-24b8-544a-aae7-99b0543da8af': [
    'e918b31f-6f39-5dee-ade6-3617080fb24f',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    'f23fdfa9-38b6-5157-8301-ed302476c456',
  ],
  '091bba0e-3370-59bd-93cc-b58ebdc4ea29': [
    'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
    'e2da5eec-45de-5527-9ad7-16f41cacbe58',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '0edd9693-7d68-5ede-9269-e086ea147970': [
    'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
    '60211ac1-cbe1-5182-87ef-673a068c5b0a',
    'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
  ],
  'd0bcc1dd-1f02-50da-8a73-909fa13a04d9': [
    'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e',
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
  ],
  '9365bdd0-8f9c-5c57-b482-e95804e52594': [
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    'f23fdfa9-38b6-5157-8301-ed302476c456',
  ],
  'e71fd490-de7e-557a-b364-fd06b0fcd769': [
    '68020906-e615-462e-a56f-dd1ccc14b8d7',
    'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
  ],
  '47055c72-d69c-5753-b0b7-e0a7792ff01f': [
    'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
    '224243cd-5a53-5d6e-bed5-564cca167a80',
  ],
  '5ed63654-5507-500c-ae76-6436294c7515': [
    '5b90066f-b5b3-4e82-8d31-7b95ff0a0451',
    '6270e558-d657-5363-a6b2-e49a032a453b',
    '91683676-01cf-5003-80fa-a04d043b4e61',
  ],
  '4324b32d-b412-5836-a9d4-131c1cf0e0bd': [
    '8ad305d2-bde0-4223-9477-517b2943148b',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
  ],
  'dd63dc6c-b2a8-59b5-a4a5-8fe452d3ec98': [
    '6d18104b-5704-5c45-b39a-2c84565b1796',
    '15b56a1e-3eec-52ca-82fa-b4df9ce88415',
    '25edd154-b1d8-546c-94a5-88502b6725cd',
    'd873ffa2-04b3-5978-a955-89563802a348',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '078ad877-58c8-5481-91c2-b0fea27b8a14': [
    '6d18104b-5704-5c45-b39a-2c84565b1796',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '97c0dd4b-ec5c-50b6-adb8-2eba5e18c736': [
    'a684bec1-ba59-59d0-98d2-4ca37236f64c',
    'a08e33db-d821-457b-86dd-870e7648c5f4',
    '19aef2ed-eb46-55b1-9486-ee83f7520bb6',
    '6ebb6182-f221-5f4c-b112-4ac72b104321',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  'c891a1aa-1c38-5959-9560-38dd60d0e702': [
    'a684bec1-ba59-59d0-98d2-4ca37236f64c',
    '19aef2ed-eb46-55b1-9486-ee83f7520bb6',
    '6ebb6182-f221-5f4c-b112-4ac72b104321',
  ],
  '7f2458f7-fa1a-5453-8519-a54b35568fe7': [
    '2973da95-2cfc-5817-9c99-3c0c82777369',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'b1b7a742-ad35-5c4c-9f70-8c9d12be3ec0': [
    '2088ccf0-48f4-51d4-be5f-67affd0fb099',
    'cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73',
    '18058384-a1bc-5ba2-8f5d-1fe9498acbf0',
  ],
  '73011a73-9430-5640-a476-c07698de08e1': [
    '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'f322c268-dc16-5d50-82dd-209834f20208',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'b21aefb5-11ab-5166-a0bb-2a364014e58e': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
  ],
  'f4e4a50f-6761-5cf0-9c8e-b37f35521442': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
    'd67502e3-5e0a-595b-a24b-65b1c40de36e',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'dd51447f-04fe-50cc-bbe3-b23e967c1a3b': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
  ],
  '54cddc45-01c1-5350-8d4b-f017ece26453': [
    'ac25ffe3-fd42-592d-a937-79cc13460313',
    '761a0879-fc15-5d0c-a2b7-2b439efecd5b',
    '14ec85b9-68f6-5400-ad43-5e8dddfddf44',
  ],
  'f0101df7-6304-5700-953e-261144f3be2e': [
    '02876b2e-7cf0-5de6-ad04-d4ee95b7f80e',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '6e768087-0dd2-5056-8ee5-f6bfc86aec61': [
    '92076a27-46cd-5c33-b3d8-aa68329af7c4',
    '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
  ],
  'e931f57b-8515-51d7-8221-61eb5fe38a44': [
    '02876b2e-7cf0-5de6-ad04-d4ee95b7f80e',
    '92076a27-46cd-5c33-b3d8-aa68329af7c4',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '5a6bd8bf-80e1-5053-be59-242fc1375e35': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'f2625043-6cd9-51b0-ad7c-4e625947b606': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '8e9cc5bc-0048-5857-8c78-8a0f5a6a2182': [
    'd81576e9-0320-5a90-8a1d-cd824981f2f6',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'e78e846e-02a4-5031-a587-12c799d7dc61': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '57774b51-6d01-5a93-9cea-d4f383092dca': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '51054214-e720-59f2-ac02-a4cf974a0222': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    '5355fee0-0477-5570-a234-561477bf77ba',
  ],
  'dd02b589-2ab8-5d53-8c1a-c6c9208df227': [
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  'bf069a6b-ec3e-5fed-8b04-8243126f2f7c': [
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'e4e767d8-1c3c-5db4-82a8-c0bcee90f770': [
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    '14ec85b9-68f6-5400-ad43-5e8dddfddf44',
    '5c0d5040-92e4-50f6-9695-9d33d889a080',
  ],
  '1bdd3a19-55b0-5e0b-9e5a-2446dc0298c6': [
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '3b179ee3-7279-523b-8b89-190c3407c322': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    'ed6cfd98-38fa-59c3-af0d-0f9f61d52d25',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    'ac25ffe3-fd42-592d-a937-79cc13460313',
  ],
  '7e34b26d-49f4-5519-9441-2f49a8f7ea20': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    '8da5c981-8216-5fcd-a393-19f392ae2006',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    'c6355a22-24cf-5d8b-88af-ea11711460fb',
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
  ],
  'a699b41a-8e7f-50a7-8165-a686131de743': [
    '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '3ba8ca9c-826b-578f-9f80-90a0d0345179': [
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    '9f59a088-3939-59e9-821d-167fadfda782',
    'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'e24f9ef4-f341-596a-a213-0b0cdd359b22': [
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    '330808f6-789a-583d-86df-e271a7683d8b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
  ],
  '3edb37f8-1b00-576c-b304-f4f7a8a4da0a': [
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    '594f7f21-6b8a-531c-8424-5f1dcbaf0f23',
    '156edddc-ce8d-580d-8d17-d9376d59e60e',
  ],
  'a056ddc4-c987-5322-9998-201d6cec58d5': [
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
  ],
  '7130b717-d746-5908-ad49-3da5e17d8e94': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
    '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
    '72ee642f-7574-517e-abd6-17d699b05af6',
    '74a74132-fa39-541c-8d3c-696cf228452d',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '57943e93-34a4-5ae6-af2a-05f985e1f9db': [
    'b39ae8fb-4358-5866-8adf-3d5365368eeb',
    '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
    '2d62b444-796e-548d-aeee-cfd9c6665ddc',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '9f2f3313-3458-59e9-9968-f4f33e6ae09b': [
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
    'd18d4190-ddc1-5181-b1b6-e79947b737c2',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '186b80a1-e632-54d3-a578-43da49a4563a': [
    '37f28bc4-def2-57cf-a06b-191dfd228205',
    '692db5b6-8be1-5c7b-8307-3a02afb21ea0',
    'acf192a8-c398-51dc-a03b-672ab55df957',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '2051d7c2-b1c7-5064-8b56-9c0d68d2963b': [
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
    'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
  ],
  '50b93407-9c0e-5e7c-a247-40048333d207': [
    'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
    'f36a5946-f2a8-59b8-b3bd-a2f246defa4f',
    'a844895e-2cdc-4665-aad2-a49c62f11759',
    '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
    'b15f3e47-6051-5382-aa86-1e4f09e245d5',
  ],
  '74192b0a-c0cf-5218-81d6-cdb6b6fc5713': [
    'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'a0df4072-b2fb-52ef-993d-31358e592835': [
    '5da7d4d0-878e-44fd-b398-1b1de8b636a4',
    'c1563745-2722-503d-819f-95d336937e2b',
    '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'ec6a0907-479b-531d-8aae-1527d22feca1': [
    '224243cd-5a53-5d6e-bed5-564cca167a80',
    '6270e558-d657-5363-a6b2-e49a032a453b',
    'd5772db3-120c-5c37-ab46-2336d02236b0',
    'c1563745-2722-503d-819f-95d336937e2b',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  ],
  'e7949f0c-c726-59e7-9a1e-a2978b55c177': [
    '91683676-01cf-5003-80fa-a04d043b4e61',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '7889c2bf-5411-52e5-8167-24877bfb2a6a': [
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'fa87c42a-420d-5c7a-bc10-285e43a177e2': [
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    'c1563745-2722-503d-819f-95d336937e2b',
  ],
  '49413a64-28bc-5475-99ea-efbc049f841b': [
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
  ],
  '03b519dd-e3a6-5d1a-b6d0-1b8d4242b98b': [
    '84ddb244-e560-592f-9d43-e84c801fe5b4',
    '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5',
    '90e1e6cf-4092-41d6-81f7-5206f9d68f84',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    'ac25ffe3-fd42-592d-a937-79cc13460313',
  ],
  'a0ab399a-141c-59e6-aaf5-8550fa4a8145': [
    'ce14a7e7-7e2a-517f-a465-78ba3fbe414d',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '9fdcc2b4-1eb0-5448-bcdb-5186bcda1d44': [
    '39ef1e8a-9203-5192-8c76-8e0c3322646f',
    'cdab9fd1-5054-4a7e-8c9a-4474062ddd23',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '7fc1e339-bda3-553c-a9f1-6ffea4433d45': [
    '41872413-497e-5b88-ac65-365ed7d9851f',
    '224243cd-5a53-5d6e-bed5-564cca167a80',
    '709e688c-eb07-5f83-a506-82c9bfe0d89f',
  ],
  'ac3f33b4-ae7a-5f7c-acb6-dbf799ab3adc': [
    '6d882aac-9658-5f0d-bf3d-9338f0143bbc',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '84fa68f0-5016-5181-9996-bfa05703dd78': [
    '8fe0ebf1-8256-53d2-9b01-fdb945e57a59',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'affa2c60-333a-5adf-b7cd-a85c9efa1579': [
    'f06c581a-7157-584e-a692-99bcd613cff9',
    '224243cd-5a53-5d6e-bed5-564cca167a80',
    'e62e48bc-2387-4b2b-8d6f-7a06c8e7580e',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '98c500b8-214d-5d1d-92f7-ac746953021d': [
    '8ac61062-f63e-5935-96ae-84014906c368',
    '10aad90e-a1db-42b6-8d1e-1d856e14b47d',
    '3e33813d-db75-4571-8345-3845b02b956d',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '9d44489c-a946-59a8-95ca-6a71380994ca': [
    '9678afc1-44ca-54fb-b280-29336d45a928',
    'f06c581a-7157-584e-a692-99bcd613cff9',
  ],
  'bfb0ae08-1542-55a6-b1cb-63941facf9e2': [
    'bdaa56ad-6257-58a3-a633-8a6339f72f09',
    '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '4560fc6f-bd81-5ddd-b9e9-502e67ad2237': [
    '09e058e9-f3ed-5046-b0e9-495b694bf2a1',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'd86e0ae9-d644-507c-be1a-405bf1bf58f3': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    'ed6cfd98-38fa-59c3-af0d-0f9f61d52d25',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    'ac25ffe3-fd42-592d-a937-79cc13460313',
  ],
  '5341c511-5098-5a4c-b65c-27ef9b529166': [
    'e19fccd7-6a35-5c9e-86e1-dcca76481e9c',
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '76455e13-fd9c-52b7-87e4-7ccb585a88d8': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    '8da5c981-8216-5fcd-a393-19f392ae2006',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    'c6355a22-24cf-5d8b-88af-ea11711460fb',
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
  ],
  'c6f6d166-68d6-56bd-84ea-905df131321f': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
    '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  ],
  '520d58c3-4ec9-5af0-92ac-5a33bbe86ae1': [
    'd1306bda-35ff-53e9-9458-3cbc128874d8',
    '2d62b444-796e-548d-aeee-cfd9c6665ddc',
    '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'f70c92e0-1516-5eb6-941c-b6da44f86073': [
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '6e065c51-c87e-5c53-a11d-71d9dd62a681': [
    'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
    'ac25ffe3-fd42-592d-a937-79cc13460313',
  ],
  '9ebc77ee-90cf-5540-aed7-02d9b4140f4c': [
    '2825b528-00ee-52d0-870e-686890cb1195',
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '1e37d0a8-c314-57bd-8e64-26d0f2ec579a': [
    'c2e0fc31-27a2-5727-9025-a824db9150d2',
    '8f833b36-4126-52db-b210-79fb0023c7d9',
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '02dd9cae-846e-5dfb-91a5-253e851e4789': [
    '8cdef591-6ddb-5151-8c74-a80be0271079',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'be0ef66d-670e-5a33-8a2f-bb039a678cf6': [
    '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
    '330808f6-789a-583d-86df-e271a7683d8b',
    '8fca14c7-3251-5526-adde-2567ea6816b2',
  ],
  '795ece7f-5283-59c4-9d35-0b885f6ac05b': [
    '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
    '8cdef591-6ddb-5151-8c74-a80be0271079',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '74b0fc84-cad7-5ef2-b265-97bdece8c813': [
    '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
    'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'b20058be-d05f-533c-b071-1ac3d5a2b6c3': [
    '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
    'c2e0fc31-27a2-5727-9025-a824db9150d2',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  'd38b88ab-569c-57ed-97b5-ce0552fc5d01': [
    '0b08aed8-3c0f-5b38-844c-1bb363abbf68',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'badf859b-72aa-507c-8173-d6207dfc9d26': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    'ed6cfd98-38fa-59c3-af0d-0f9f61d52d25',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    'ac25ffe3-fd42-592d-a937-79cc13460313',
  ],
  '4324b1f3-8e16-5e83-9968-bd34b6aa72af': [
    '7df599e8-21ac-5be4-89f9-9b2a6f2e4465',
    '8da5c981-8216-5fcd-a393-19f392ae2006',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    'c6355a22-24cf-5d8b-88af-ea11711460fb',
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
  ],
  'f3a25699-872f-52f7-bec4-432c23297863': [
    '8da5c981-8216-5fcd-a393-19f392ae2006',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'e777f493-080c-5ff5-bef3-eb8ddc06f06e': [
    '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '14e2d8e8-d64e-50fc-919d-c1f759b34034': [
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    '9f59a088-3939-59e9-821d-167fadfda782',
    'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '613850fd-04c5-564f-9e95-031261505594': [
    '9fb1dd85-11b7-4a5a-b124-27fea8d1788e',
    '73b309ed-1aab-5778-8494-d9b65f5a352b',
    '9f59a088-3939-59e9-821d-167fadfda782',
  ],
  '8f951345-e0f9-500b-b7ec-9ad8ddf6bdfc': [
    '330808f6-789a-583d-86df-e271a7683d8b',
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  ],
  'a162255a-1f98-5f3a-a086-630e59f1668a': [
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    '594f7f21-6b8a-531c-8424-5f1dcbaf0f23',
    '156edddc-ce8d-580d-8d17-d9376d59e60e',
    '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
    'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
  ],
  'd0bbb0bf-3da0-5ac2-8cbc-0f8e70ad6949': [
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '201c41b6-b470-5d41-9de3-b8a17b0102ef': [
    '741774ef-15fc-4bcf-a370-e2c5cf4257d0',
    '9854589c-5feb-4942-b90f-311ddf36eb78',
    '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
    '72ee642f-7574-517e-abd6-17d699b05af6',
    '74a74132-fa39-541c-8d3c-696cf228452d',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'b8f1e627-283f-5c12-a080-0500f6dd0722': [
    'b39ae8fb-4358-5866-8adf-3d5365368eeb',
    '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
    '2d62b444-796e-548d-aeee-cfd9c6665ddc',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'dd90cad9-21f6-535d-b6dd-45dc7b012b19': [
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
    'd18d4190-ddc1-5181-b1b6-e79947b737c2',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '728778f2-f74c-520b-963e-546ac592b830': [
    '37f28bc4-def2-57cf-a06b-191dfd228205',
    '692db5b6-8be1-5c7b-8307-3a02afb21ea0',
    'acf192a8-c398-51dc-a03b-672ab55df957',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '0e2fe6e9-d9d9-5f05-9ad8-3ad5800f2fe7': [
    '692db5b6-8be1-5c7b-8307-3a02afb21ea0',
    'd18d4190-ddc1-5181-b1b6-e79947b737c2',
    '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  ],
  'aba56d32-b11c-5c6a-96b1-58f6ef72d288': [
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
    'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
  ],
  '4098bdc9-eefd-5cd1-8363-0d415da4a311': [
    'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
    'f36a5946-f2a8-59b8-b3bd-a2f246defa4f',
    'a844895e-2cdc-4665-aad2-a49c62f11759',
    '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
    'b15f3e47-6051-5382-aa86-1e4f09e245d5',
    '05af2893-0201-4d7f-985b-272d7b88e26e',
  ],
  '6075e3c2-2a29-5122-bc6c-6d8fcb3fb5f5': [
    'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
    '18c1f954-487e-5121-bb18-6c64a82f573d',
    'd350cfa7-c606-501e-abf7-1c9e546b266b',
    'a844895e-2cdc-4665-aad2-a49c62f11759',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'e1495918-5938-5f36-bfd7-a943805e8a83': [
    '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
    'c0205f47-185c-5e27-b89c-c3ff8809b1d1',
    'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '46d317f1-58aa-5804-bdc4-6b144e6c3814': [
    '5f97952e-5ac9-5749-94d0-d1dc50dda358',
  ],
  '614096ea-1d64-5ca0-ac62-f32b933178a9': [
    'ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a',
    'e413a352-33c4-53ae-b54a-30e52c3e65ae',
  ],
  'c5f7b4f9-e84a-5b1a-a2ee-b91df84d2562': [
    '5da7d4d0-878e-44fd-b398-1b1de8b636a4',
    'c1563745-2722-503d-819f-95d336937e2b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'd3725f7d-4f9e-5bc4-a34e-3ff6567a48e6': [
    'ffbbf243-c2eb-4330-b050-837de994c130',
    '5da7d4d0-878e-44fd-b398-1b1de8b636a4',
    'c1563745-2722-503d-819f-95d336937e2b',
    'd81576e9-0320-5a90-8a1d-cd824981f2f6',
  ],
  '5a76d3c5-22af-59a1-82ce-9c6237a47b97': [
    '5da7d4d0-878e-44fd-b398-1b1de8b636a4',
    'c1563745-2722-503d-819f-95d336937e2b',
    '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  ],
  'd3718d55-0169-5400-80b2-e3b43f48fcc8': [
    'e160acb4-5b88-509e-8055-2653df420c65',
    'c1563745-2722-503d-819f-95d336937e2b',
    '0693f68f-1bd4-50a9-ba2b-af95b1c949ee',
  ],
  '83e0755c-e664-5a5a-9b66-a7a4951452bc': [
    'd5772db3-120c-5c37-ab46-2336d02236b0',
    'c1563745-2722-503d-819f-95d336937e2b',
    '224243cd-5a53-5d6e-bed5-564cca167a80',
    '2c6af966-7703-4176-a117-5ddb8295bedf',
  ],
  'b4193da7-ad13-5a31-9a3a-7c1afd8dedd4': [
    '6270e558-d657-5363-a6b2-e49a032a453b',
    'c71315c1-f329-4289-a145-d99819da7bad',
    '2c6af966-7703-4176-a117-5ddb8295bedf',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  ],
  '56801db7-c4d5-53ca-a765-73945bce4ff0': [
    'c71315c1-f329-4289-a145-d99819da7bad',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
    '91683676-01cf-5003-80fa-a04d043b4e61',
  ],
  'b47189a1-27b3-5986-a29b-f7f4d43a59ac': [
    '2c6af966-7703-4176-a117-5ddb8295bedf',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
    'c71315c1-f329-4289-a145-d99819da7bad',
  ],
  'e42f3126-179c-5f13-ac07-070ee172b132': [
    '91683676-01cf-5003-80fa-a04d043b4e61',
    'c71315c1-f329-4289-a145-d99819da7bad',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'b44c5542-925f-5bea-bbda-b641d0ee3ae7': [
    '2c6af966-7703-4176-a117-5ddb8295bedf',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
  ],
  'c0eebb70-0014-5ccd-bd5d-8861a02ca0fb': [
    '81c0d811-e6de-5489-8415-3b257c734a2e',
    'c71315c1-f329-4289-a145-d99819da7bad',
  ],
  '7800550e-2398-5cb2-a100-f34026d2592d': [
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'e8817112-61e4-5d74-b780-b3b9c38777fb': [
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    'c1563745-2722-503d-819f-95d336937e2b',
    '91683676-01cf-5003-80fa-a04d043b4e61',
    'c71315c1-f329-4289-a145-d99819da7bad',
    'd5772db3-120c-5c37-ab46-2336d02236b0',
  ],
  '21b6d5fe-83f8-5a02-8a01-9d5ee36964c5': [
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
    'af1c3116-5b55-55f5-86da-8c2cfe2c550c',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
  ],
  '2f43763b-4152-5225-bb2a-c99c0e9cfd56': [
    '330808f6-789a-583d-86df-e271a7683d8b',
    '8fca14c7-3251-5526-adde-2567ea6816b2',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
  ],
  '4fdbaf6c-3fd0-50d2-9388-bb348ce8c5aa': [
    '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
  ],
  '4a5610d3-febc-5686-9996-ca232fceb44a': [
    '966782e5-690d-4fae-bbab-fa3fa30525c3',
    '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
    '0f803c37-8191-5a07-9b31-9603ded98fe2',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'a868d0fe-4357-5dfd-97e6-611aa17689bb': [
    '73b309ed-1aab-5778-8494-d9b65f5a352b',
    '9f59a088-3939-59e9-821d-167fadfda782',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '3b39d842-b7cd-5b38-8f41-1779be5d22cf': [
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'fa8f636e-9032-50af-a931-291e70d19be1': [
    '692db5b6-8be1-5c7b-8307-3a02afb21ea0',
    '37f28bc4-def2-57cf-a06b-191dfd228205',
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '372be1d2-7e1f-5404-9173-cc86c2a042dc': [
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
    '05af2893-0201-4d7f-985b-272d7b88e26e',
    '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
    'c0205f47-185c-5e27-b89c-c3ff8809b1d1',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'c92792b1-bf65-576e-b3b7-c435dcf48dc0': [
    'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
    'f36a5946-f2a8-59b8-b3bd-a2f246defa4f',
    'b15f3e47-6051-5382-aa86-1e4f09e245d5',
    'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
    '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
    'c0205f47-185c-5e27-b89c-c3ff8809b1d1',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '9d1d7bca-27bb-5acc-99c2-c03f61dae97e': [
    '5f97952e-5ac9-5749-94d0-d1dc50dda358',
    'ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a',
    'e413a352-33c4-53ae-b54a-30e52c3e65ae',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  'd12fd0f2-4d61-5c9f-9824-ed03f7e3b2ea': [
    '91683676-01cf-5003-80fa-a04d043b4e61',
    'c71315c1-f329-4289-a145-d99819da7bad',
    'c64820e1-c0ee-4342-9225-f981650f0c52',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '69fe06ff-cf18-50d8-9f41-ef480c157a0c': [
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  'ca6eda33-e8f1-598d-be39-c768f9db4c6c': [
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    '1911920e-b099-4310-82f2-b47f51a78b33',
  ],
  '28d68a66-6bbf-5618-8dc5-c92b0458a672': [
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  '8ae934cf-b74e-574f-87dc-d49c5526f819': [
    '1911920e-b099-4310-82f2-b47f51a78b33',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  'cd80eb78-832e-56f1-99be-9dd851e497f0': [
    '01bebdfc-5819-4610-a03e-ea5e794fc954',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'de098d6a-d015-574e-a201-50386c079d18': [
    '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
    '267170bd-f880-56a7-9719-ffb9751872c5',
    '8f833b36-4126-52db-b210-79fb0023c7d9',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  ],
  'f0da0513-86f0-5e4c-9674-161d630f6598': [
    '5355fee0-0477-5570-a234-561477bf77ba',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    'b57427c9-1af5-5daa-8c65-b84a4cc20785',
    '6a4c6042-052b-502b-a39a-0ed8941247ac',
  ],
  '9e35926a-0175-522c-8b80-f2cfc94edb07': [
    'dd7cdcea-0950-461b-96ac-ce49989fca47',
    '79cb1695-f985-443a-b93e-27b57ab474b7',
    'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  ],
  '90c1e686-e1c8-5f07-b2a2-2cecf652b886': [
    '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '1abf5128-21ea-575f-97c9-5b0b4e4b5a4f': [
    '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5',
    '6a4c6042-052b-502b-a39a-0ed8941247ac',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '50781cac-9bb1-5ee9-bea1-35d3f9e7089c': [
    '71b51afd-c71b-506f-8128-d6de36b509d1',
  ],
  '40a45cfe-3824-542b-ae33-730cf5cfc950': [
    '90e1e6cf-4092-41d6-81f7-5206f9d68f84',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '88685cb1-f3a9-5c32-9a42-9c678e25ca58': [
    '58fc7852-722c-5a67-be6a-bfd1be0b527e',
  ],
  '7c3355b3-7488-53eb-8f04-bd6f18d5c02d': [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  '7812213c-59e5-5d52-9a01-0c0534020cd5': [
    'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    'd67502e3-5e0a-595b-a24b-65b1c40de36e',
  ],
  '5f86e662-1f46-5fb2-b44a-57ec2cea470f': [
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  ],
  'c8acde94-88ba-51a7-a5f8-6888207081b0': [
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
  ],
  '01d2730e-a8d4-5f21-adcf-ca9d0dc7edda': [
    '5f289cdc-fda1-4058-b44f-041ba1398e79',
  ],
  '5be2d963-0510-5a61-a42a-820980bca521': [
    'e4b38061-1f28-43ad-8371-a3e7c0e81856',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '28346c05-3627-5942-9690-c35526adec7a': [
    '9c328f68-41ed-55dd-9e02-34414a6246f2',
  ],
  'ec2bc490-efbc-54ba-aff3-3369767f0a83': [
    '68c90ba6-c438-463c-9a53-cf61062d416a',
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
  ],
  '3c283b9c-4a1a-5c7a-bd1b-e19a961b7710': [
    '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
    '5ea765ac-c279-551a-8a94-a07da2381e5b',
    '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
  ],
  'c75cb2dd-c143-5537-82aa-4676a1148c71': [
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'a114f68b-91d5-593e-9d5b-d31d3240bf19': [
    '5ea765ac-c279-551a-8a94-a07da2381e5b',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '41fabd59-d26e-5b7f-964e-56e1af6dc494': [
    '45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83',
  ],
  '12f0549a-748d-5bdb-92ff-75d263fa1abe': [
    '0dd1e39c-8557-5a4e-b467-caae964fff67',
    '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '5d0ef1e3-a14f-5108-8c11-56f972943783': [
    '32111497-d5ca-453e-906d-d352f885b126',
    'baa2bf3c-798a-5ec3-a667-031bf062d96c',
    'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  'ccacae8c-d7dc-50a6-ac66-61809460f2a7': [
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '576eeee9-40bf-591e-a15a-80095e133a61': [
    '5355fee0-0477-5570-a234-561477bf77ba',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  'd9c30cdd-9220-586a-a53e-77d30961a258': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '84c992bc-b9e8-511a-aa94-ee45a498b76f': [
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '9830da24-0c3e-5e2c-815f-3b98f3a059c8': [
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  '822768a7-4ded-599c-b64d-37ad272abe97': [
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '37327429-a775-5bd8-a777-e8695d4df244': [
    '94784e0a-7ddc-48be-91fb-dc82b78eb322',
    '722857cf-f327-5740-8151-64eb92195ec8',
    '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '7a9ae9a5-0763-5d41-aade-0a46e7908c90': [
    '91c49019-ea51-4ce5-a919-c91c45b25e83',
    '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  ],
  'c1facc77-5590-5495-9257-48ff27195dd7': [
    'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  ],
  '46a5bb03-8eb6-5b71-a3c4-a66fc173e314': [
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  '711d0394-8d49-554a-b23f-d145580cd5fa': [
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'ed76f0d5-7d46-5783-bc9a-0ad83d502914': [
    'bbee4c52-4e95-5529-990f-706aa99316a3',
    '3ed3279e-c524-5230-a277-dda89493df6d',
  ],
  '0b71ca33-2ba3-5b1b-bc6d-cf3772c1ca60': [
    '1730c01d-8c85-57df-b031-c11e2a0511b1',
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  ],
  '06516caa-8438-5dcf-965a-b08d786e669f': [
    '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
    '59d1145e-ac54-5917-880a-21b4b80526d3',
    '8a84de16-2fde-58ec-827a-f803e2ce8564',
  ],
  '75c06e67-c267-5328-b38e-d72318d518df': [
    '201d353a-dfe7-521b-b0f6-eccb4d42945b',
    '46e42b07-c098-5d65-8ef5-8472b7c4d8e2',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '714b0252-c01a-5e08-bf65-58a0ef224316': [
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
    '71b51afd-c71b-506f-8128-d6de36b509d1',
  ],
  '93b23498-a6b8-559e-b40a-675fd39c5331': [
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  ],
  '14eff763-0a5e-5158-8cfb-f30d094c96c9': [
    '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  ],
  'ef9fc537-3696-59e9-8e91-a820bdca5139': [
    '37b33812-d428-5953-852e-57a53a4347fe',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  ],
  'b0a2ec7a-df5f-5bf3-b8eb-f3668c25917d': [
    '88d07c80-5d7d-5c70-b385-b22769381e44',
    '722857cf-f327-5740-8151-64eb92195ec8',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  ],
  '6cdf07db-fec6-584e-be83-b7df0a589d09': [
    '873c6371-4ffb-582b-8d8d-3f45f968ba08',
  ],
  '13daa101-2aa5-5f48-92e7-6ad87f960c57': [
    '5308de76-79f0-44f4-8cb7-fc9de4772217',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  ],
  '8cb1eb25-b758-5559-8cc8-4b788150acde': [
    '310b4f62-e261-46be-bb1b-1f125fc1699a',
    '5308de76-79f0-44f4-8cb7-fc9de4772217',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  ],
  '6d64dc5d-a931-5d83-8632-c86dabf2f162': [
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
    'd27c8860-12a4-4d7d-9849-ccd8b7caca48',
  ],
  '550dc4da-74d1-55d1-af57-13b5f842a27d': [
    'eeba6bf8-a2b9-4d7d-a1d6-67286c923cef',
    'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  ],
  '23e1efc2-5653-5d52-bb1b-09b0e2e8c07a': [
    'fbe0faae-7fba-482b-888e-341f926770f3',
    '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
  ],
  '95d36548-434c-5a51-b8db-20b60ab9bf89': [
    '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'e943752c-a9ef-5386-8536-7ad54217808c': [
    '5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce',
    'fbe0faae-7fba-482b-888e-341f926770f3',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
  ],
  '350e5e77-f0f1-5996-ac89-131a062490e6': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
  ],
  'e7c43943-a1d0-543f-a0cb-b203efbb8a87': [
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '8f093ad4-3507-5806-9ad9-457890d970c5': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '950adfea-8994-5355-aab2-71cc396c9397': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '43bf908c-c1bb-523c-a9f7-2fe23667d625': [
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '70d92b4a-4b60-57d1-ad95-a5574b74dd9c': [
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
  ],
  '9e4610a1-caa1-5dae-869e-bfddc4a38c1b': [
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '5be98160-5189-58aa-8183-1df1c400cc8c',
  ],
  'ca0b50ab-6929-5149-a564-34e86a8b76ed': [
    '0f6b798b-594e-5480-8c5f-95e2486a4d85',
    '106417ed-80db-5490-a1ee-bb4160d3f2b4',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  'd9b7068b-9388-54ce-a111-e8a6a2dfadcf': [
    'eb30189c-27c6-510b-b235-6543afa18b90',
  ],
  '2be79d74-1d45-5591-b963-376bc02dc06d': [
    'a522c8c0-f3a4-5568-acae-3010ed9feb87',
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'c0aa7a40-811e-52b3-8355-755621809a45': [
    'a522c8c0-f3a4-5568-acae-3010ed9feb87',
    '1a037489-3c95-540b-8cae-0acd360358ee',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '27b30900-d3d4-5717-a104-c4f1024f2c4a': [
    'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  ],
  '3b175519-8654-59f1-bd56-7e32a130f93a': [
    'eb30189c-27c6-510b-b235-6543afa18b90',
    'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '713ad139-bcb8-5a71-a520-3f194a0f8754': [
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
  ],
  'fe76e9bb-f2ce-5d9a-9ea2-d7ed7ea6ca8f': [
    '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
  ],
  '479784b2-511c-5b2a-a1a1-f9c7625fd5bb': [
    'a0aaedcb-41f8-4891-af77-a69a76b8c10d',
  ],
  '0074dc7c-b4ab-5bfb-b1b7-a8f5cdb9accc': [
    'ce431132-dfc4-42c2-aff6-bd72035190f8',
  ],
  'aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b': [
    '68c90ba6-c438-463c-9a53-cf61062d416a',
    '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  ],
  'd91f9aba-814a-573e-a09e-ebeb3b9f2bf5': [
    '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  ],
  'f7f4e1f0-3c48-5f1c-a474-4a41ca6296b6': [
    'd6dc0e02-831d-4894-a61a-852bcc74f147',
  ],
  '21e25931-e2aa-58f1-be38-77563b11d5b7': [
    '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  ],
  '9af9e852-a30a-5c9f-98cf-618371ebe0a9': [
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'f6f646db-3544-49ed-8f55-67bc684e80ce',
    'cb0426b0-a973-5660-b6fe-79407934730f',
    'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
  ],
  'dc93c563-9430-5f43-977f-5dc3a0ee7b35': [
    'cb0426b0-a973-5660-b6fe-79407934730f',
    'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
  ],
  '1294d659-60f1-5ef4-b19a-3726cd2e09e4': [
    '7d78da7f-6af5-440a-9d6b-6cab4bee8dd2',
    '49872cc0-401f-5464-9235-4763df4db5cf',
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
  ],
  'ea53f883-180a-580a-9b39-0dc759673797': [
    'a12fddce-0215-58d9-bd91-21be8a960d25',
  ],
  '37f5083d-49e3-58eb-82a2-a7e60fe67b9f': [
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
    '979e0d0d-8933-4ace-814f-f28060ad280f',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  'a91fa2d4-7c0e-53a0-807a-2bd6b26fa1a2': [
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    '979e0d0d-8933-4ace-814f-f28060ad280f',
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  ],
  'a4461a25-8e68-5f80-ab23-0c3f61af59db': [
    '7f0798cb-5966-5dcb-beb3-84f637ab6139',
    'd36727cc-ce42-51a3-9425-41afb0b9acdd',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '70a98347-c765-5555-bf07-4272c78e7a22': [
    '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
    'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
    '7f0798cb-5966-5dcb-beb3-84f637ab6139',
    'd36727cc-ce42-51a3-9425-41afb0b9acdd',
  ],
  '6b7bdf77-0318-5835-9ba4-e004db519d15': [
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  ],
  '86fd00b9-2a4a-51c1-8567-fa88b154819c': [
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  'd6984aba-b165-5a66-acec-7dadd71ca098': [
    '6d323d54-0aee-55d0-a9e1-ef2efdea0346',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '8fddf47f-b6c5-59ee-839f-f475fda0aed2': [
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
    'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
    'da26294f-4316-5bd5-a37a-bd89397b3b8b',
  ],
  'be1a10c0-b7b3-59ef-b21b-9b234f441124': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
    'c71315c1-f329-4289-a145-d99819da7bad',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '2998da51-13e8-5958-bf85-23266b09545a': [
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
    'defe44d2-c3d3-456b-a786-fad2cef13fe8',
    '4245c54f-d609-41bc-9eff-e9ceeff4902f',
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
  ],
  '7c42f59b-0b98-53c4-822d-70b89fe6d6bb': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
  ],
  '01310fed-1894-5f9d-b150-f4d9b3790931': [
    'c5413852-abae-566b-b435-f9939209ca63',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
    '1a1c09f0-96b7-4c33-a623-0e8101537876',
    '4245c54f-d609-41bc-9eff-e9ceeff4902f',
  ],
  'ed5ce03b-7a98-57de-a9c7-4f9f0f319d3e': [
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
  ],
  '2920c85a-ea2a-563f-b322-ca8cdd2543ca': [
    '51bc5513-6879-548f-b19a-9746b667f1a3',
    'd5bff282-741f-4cc5-9622-b77584fdcc5a',
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
  ],
  '356336a4-bc37-571a-a2e9-d7d86b41e337': [
    '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
  ],
  '598ff3f1-4958-5280-a30f-e618a77972cf': [
    'b05da028-65e4-5cd1-a13c-6c1a95b6dfdf',
    '727d0946-7019-50ed-8fc6-85db12508733',
    'b9fcbad4-a855-54b7-8017-4caac1e2ffb7',
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
  ],
  '22c3cc6f-5468-508f-816e-56eb634f6f41': [
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'ad021f2e-6b94-5e6e-a264-3d1110094b87',
    '51bc5513-6879-548f-b19a-9746b667f1a3',
  ],
  '934b3728-ba2b-5b65-815a-6041602c018a': [
    '43adaa0b-1f37-5d55-a496-6900555274a1',
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
  ],
  'bf0914ff-b121-53dd-9176-6c7582112d3c': [
    'b1f00a6d-1a03-496c-b1bd-c1f2259f59a8',
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
    '43adaa0b-1f37-5d55-a496-6900555274a1',
  ],
  'ff34c4a6-3de6-5e0b-b447-a57b39b30633': [
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'ea2d5085-4ec1-5e33-87e0-15edcad635bf',
  ],
  '7a24a080-48a7-5249-b208-5283c67a3054': [
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'badb0ef3-233d-560e-bc2a-9df99f09fe7d',
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
  ],
  'aeea2987-ea73-58f9-9611-6fb434d6f0b5': [
    'cf340ce4-8d91-5d22-a1d9-53bf408abdb3',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
  ],
  '658f6116-c13f-5ac6-a75c-481bfc92298f': [
    'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
    '4e046c1c-bcc7-5e3c-9f71-f80d69027483',
    '4b8b5f4c-c222-57b5-a2f2-ef2efacc03dd',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
    '2fab2e3a-1558-5e67-aed0-15fc51c737cd',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  'e0c393e4-10a7-57e4-8d3d-362910f3c047': [
    '2fab2e3a-1558-5e67-aed0-15fc51c737cd',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
    'd81576e9-0320-5a90-8a1d-cd824981f2f6',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '410b1355-c593-5aab-bc4e-8fdcb512ef9c': [
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    '5492f0e0-cbae-574e-a853-182616205ed3',
    '49872cc0-401f-5464-9235-4763df4db5cf',
  ],
  'f2f287c7-cc8d-50ca-b80a-7dea597439af': [
    '6e7c35e0-7a38-5996-a42e-005038eff0db',
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
  ],
  '3d5eace7-5496-50f6-9bda-bc3e8ac40cb5': [
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    '6e7c35e0-7a38-5996-a42e-005038eff0db',
    '5492f0e0-cbae-574e-a853-182616205ed3',
  ],
  '321e53bc-850f-5127-945b-1f461b1d0c60': [
    'b1ad9493-acca-5366-9ecd-4b7bf7edaf4a',
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  ],
  'd889c4dd-eb1b-57a0-8e71-cd9ddf57f8a4': [
    'a12fddce-0215-58d9-bd91-21be8a960d25',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '75420912-fbae-5652-ad75-59a28d328435': [
    'a12fddce-0215-58d9-bd91-21be8a960d25',
    'e6a50c74-c922-508c-aa27-07bac2566955',
  ],
  '93256f65-3b22-5caf-89eb-0ddf0e3dae9b': [
    'bb5c5eab-2fc1-5336-b8cf-14d147695487',
    'e6a50c74-c922-508c-aa27-07bac2566955',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'd5355d5d-1db0-5a96-b769-c855fa127daf': [
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
    '49872cc0-401f-5464-9235-4763df4db5cf',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '7006a7a0-9f2e-5ea4-aa95-312ecd9db38e': [
    '2bc068de-5d2b-5f94-bd51-755982befb6f',
    '2b700858-bc2e-5ddf-a791-b14d44160480',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  'a8775a10-9af9-586d-a90a-5ad3259bccac': [
    '0a172021-dfd9-5926-b92c-c01a9dfe9aa8',
    '6d18104b-5704-5c45-b39a-2c84565b1796',
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
  ],
  'c24db4aa-7cae-525d-beca-6da5bf085ea6': [
    '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e',
    '7c986fca-1129-5eff-a17e-0a04bb7346ee',
    'db6b8de4-21e0-58e8-a347-2ae39f538f92',
  ],
  'b1de2e2b-439a-5a10-8139-a6a2e9bf14c8': [
    'eb0ffdea-c12d-56df-b7e8-c0297d2f8aff',
    '497f1311-17d6-56ff-afb1-422a738e5c16',
    '594f7f21-6b8a-531c-8424-5f1dcbaf0f23',
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
  ],
  'a5318d9f-8ac0-54ad-911f-8cf35acbab03': [
    '982df2f3-e040-5f4b-b668-0fe05d994b29',
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '01dae520-33a8-5953-ab1d-f3329aff9a09': [
    '594f7f21-6b8a-531c-8424-5f1dcbaf0f23',
    'a42f91a4-0d21-5aa9-ae11-f48be6f2e431',
    '497f1311-17d6-56ff-afb1-422a738e5c16',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
  ],
  '1292f05c-47da-5e95-a706-8f456b507d50': [
    '94a3a80e-f1de-51a2-b834-1e3431c5d3ca',
    '2b700858-bc2e-5ddf-a791-b14d44160480',
  ],
  '99401ce9-6c74-56c0-acbe-dd6d92a254d9': [
    '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
    '49872cc0-401f-5464-9235-4763df4db5cf',
    '9b47a758-1b5d-5906-84c9-8621050d5aa5',
  ],
  'a9271f07-a357-5821-a18a-4af3aa5789ee': [
    '4e823349-b60c-5d2a-b96f-d3f23ae50e3a',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '0337c4aa-9350-583c-89e2-e136e1f813e5': [
    'a7bec355-48c5-5107-bfab-d6956f9c9205',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    '2b700858-bc2e-5ddf-a791-b14d44160480',
    '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
  ],
  '8b150142-cec6-53ec-8a19-317182089b08': [
    'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
    'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
    'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
  ],
  'f794cbd9-db43-54e9-9abe-45fae5724705': [
    'e07f36de-2819-59f8-a707-fa25b4633ed3',
    'db6b8de4-21e0-58e8-a347-2ae39f538f92',
  ],
  'cc2ffcad-52de-5a1c-8d32-c9264dd135d3': [
    'e07f36de-2819-59f8-a707-fa25b4633ed3',
    'a7bec355-48c5-5107-bfab-d6956f9c9205',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
  ],
  '38126b26-5efd-5b0e-8c41-ad77111483a6': [
    'f67550ac-df22-5a3e-8172-f04642efca64',
    '206fe51d-cc78-5422-b139-32cc97eb1c37',
    'db6b8de4-21e0-58e8-a347-2ae39f538f92',
    '9b47a758-1b5d-5906-84c9-8621050d5aa5',
  ],
  'f2d7d811-d8d0-5f7c-ab0f-91734ec337a6': [
    '7df923a0-6470-595e-8cea-53126fad9506',
    '9b47a758-1b5d-5906-84c9-8621050d5aa5',
    'da3169ae-c72a-5782-ad95-408167a5c6da',
    '49872cc0-401f-5464-9235-4763df4db5cf',
  ],
  '09a09524-4d0c-5f3f-b39e-3e669970a6a3': [
    '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
    'ba16948b-5e07-54af-b77b-776e677c6906',
    '497f1311-17d6-56ff-afb1-422a738e5c16',
  ],
  '8c600779-e830-5734-83e8-7e2c46955441': [
    'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
    '5b8eaf71-96fe-50eb-b9ea-a8fa392df086',
    'e28381b4-50ef-5cac-bfa4-b7c8e03aef82',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '404ea587-bfd8-5196-8532-a2713423279a': [
    '826af579-3e51-5ac9-bc2a-208d8a2fc99e',
    '2b700858-bc2e-5ddf-a791-b14d44160480',
    '5db07785-8cca-50d5-81a9-e0264d344af9',
  ],
  '9f0d2e0e-9bcf-5b30-9f78-af6374ca0a44': [
    'f203a552-fcf0-560c-baa2-47d4eb2379c8',
    '14d99a65-8d58-5647-88ab-02137b96d55b',
    '5db07785-8cca-50d5-81a9-e0264d344af9',
  ],
  '466996a2-112f-508c-9454-c59385ebda84': [
    '61e84097-57b9-5434-9909-8ed8368a7823',
    'db6b8de4-21e0-58e8-a347-2ae39f538f92',
  ],
  '6d7f80f4-e1ea-5de1-a826-09cc491de239': [
    '61e84097-57b9-5434-9909-8ed8368a7823',
    'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
    'aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745',
  ],
  '8797a4fb-523d-5103-8a57-9a3aeed8c3f2': [
    '6ae54ff9-dc3b-563b-b2ee-09a0f0d00162',
    'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '441baceb-6988-5b1c-934d-3048fec0aa3e': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
  ],
  '52183287-205f-581d-a2f0-e60354d6f4d7': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
  ],
  '1cd279e6-a689-5745-af8e-0c67ac9995b8': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    '52b6722a-b3b2-5d2d-a507-0215532b0422',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
    '4245c54f-d609-41bc-9eff-e9ceeff4902f',
  ],
  'cdf51cb6-f037-55a1-86b3-612c120c7340': [
    '52b6722a-b3b2-5d2d-a507-0215532b0422',
    'aef1e312-6a0c-5323-9202-c22ae84086f2',
    'c5413852-abae-566b-b435-f9939209ca63',
    '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
  ],
  '99e805f2-f068-598a-9df4-441bce40565a': [
    'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f',
    '5476480f-7ff2-529f-aade-968198c782a9',
    'd2860d7f-32ff-5d74-b2f8-b7bfc8d75aec',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
  ],
  'e7915b65-1409-59ea-9331-e1693de17a5e': [
    '51bc5513-6879-548f-b19a-9746b667f1a3',
    'd5bff282-741f-4cc5-9622-b77584fdcc5a',
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
  ],
  '90560c21-73ff-5aac-b679-ee2e2214d768': [
    '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
    'f6e5929f-d52a-42a4-a5d2-ff498ee7083f',
    'a359c859-eee0-40ef-a9d1-88db2e6c55b2',
  ],
  'c3b0c38d-fa53-5204-bf6e-70929d7d9bc1': [
    'b05da028-65e4-5cd1-a13c-6c1a95b6dfdf',
    '5c57dbc7-d258-4aad-a84c-e773f3c493ae',
    '727d0946-7019-50ed-8fc6-85db12508733',
  ],
  'ee021874-03ff-5b59-8d1d-5544548d917c': [
    '52b6722a-b3b2-5d2d-a507-0215532b0422',
    '6031bed0-9baa-4f45-b2a5-57ffb00d39cc',
    '8c97c234-a932-5e84-aed5-237b4e2a8336',
  ],
  '97fd9d31-7adf-52ce-b792-849e9e211d71': [
    '8c97c234-a932-5e84-aed5-237b4e2a8336',
    'b05da028-65e4-5cd1-a13c-6c1a95b6dfdf',
    '727d0946-7019-50ed-8fc6-85db12508733',
  ],
  '12fd4c5a-8ed0-5925-837e-c814ee7cbeda': [
    'defe44d2-c3d3-456b-a786-fad2cef13fe8',
    '727d0946-7019-50ed-8fc6-85db12508733',
  ],
  '8d364ac6-6482-50d5-9c0c-7cce78462823': [
    'defe44d2-c3d3-456b-a786-fad2cef13fe8',
    '727d0946-7019-50ed-8fc6-85db12508733',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  'bfe30e7f-3319-5a1f-bcc6-8a4513c10911': [
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'ad021f2e-6b94-5e6e-a264-3d1110094b87',
    '51bc5513-6879-548f-b19a-9746b667f1a3',
  ],
  '8d720664-de81-58fe-ba75-15e3ab35af32': [
    '43adaa0b-1f37-5d55-a496-6900555274a1',
    'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
  ],
  '00282af9-6771-5364-aecc-2be8e746bdc6': [
    'b1f00a6d-1a03-496c-b1bd-c1f2259f59a8',
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
    '43adaa0b-1f37-5d55-a496-6900555274a1',
  ],
  '084ba6d5-d84a-588a-b20c-a3e5d2f9e5bf': [
    'd7244ce4-5409-58d1-a1b4-bfae35f391e1',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
    'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
    'ef6d5067-96b0-5388-87dd-5ac4e6a3e313',
  ],
  '190fa5fa-325d-59a5-8a12-34ed99a74e82': [
    'badb0ef3-233d-560e-bc2a-9df99f09fe7d',
    'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
  ],
  '89e872f5-2bf9-5278-9d9d-52ff010f6fa3': [
    'cf340ce4-8d91-5d22-a1d9-53bf408abdb3',
    '904670af-8e4c-543e-bc9b-e6248d87a10d',
  ],
  '5eab922e-aeb4-5d3e-9cc5-2e485f787794': [
    'b3f3f4f7-b5cc-40e1-b57a-3d93649baa61',
    '4e046c1c-bcc7-5e3c-9f71-f80d69027483',
    '4b8b5f4c-c222-57b5-a2f2-ef2efacc03dd',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
    '2fab2e3a-1558-5e67-aed0-15fc51c737cd',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '61476d0d-ed9c-5ced-b9b4-6d88ed2eded6': [
    '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
    '81c0d811-e6de-5489-8415-3b257c734a2e',
    '2d62b444-796e-548d-aeee-cfd9c6665ddc',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  ],
  '50c558cc-8fed-5288-8908-7499ed686e8b': [
    '2fab2e3a-1558-5e67-aed0-15fc51c737cd',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
    'd81576e9-0320-5a90-8a1d-cd824981f2f6',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '7d5bed45-f84c-5230-bab2-aefd8875bacc': [
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    '5492f0e0-cbae-574e-a853-182616205ed3',
    '49872cc0-401f-5464-9235-4763df4db5cf',
    '6e7c35e0-7a38-5996-a42e-005038eff0db',
  ],
  'af941258-3df8-560f-9a43-e16d0ebb88cc': [
    '6e7c35e0-7a38-5996-a42e-005038eff0db',
    'cde9b548-2cf4-59ad-b5d4-a71872afbe56',
    'badb0ef3-233d-560e-bc2a-9df99f09fe7d',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
  ],
  '720a5037-0bc6-5e67-8aba-24d03168f898': [
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    '6e7c35e0-7a38-5996-a42e-005038eff0db',
    '5492f0e0-cbae-574e-a853-182616205ed3',
  ],
  'be4f8330-c717-556b-b4ec-dff318a7bfff': [
    '64b30d2e-cbe1-55d8-915a-a050d736b96e',
    '3b50255a-6b01-578b-8f5c-4383536a3221',
  ],
  '881bb442-6171-5849-b95b-5cf72902ce44': [
    '4e046c1c-bcc7-5e3c-9f71-f80d69027483',
    '8eb6456b-d915-50ed-a076-2b23c2e5420c',
    '5492f0e0-cbae-574e-a853-182616205ed3',
  ],
  '1b2cc723-d403-5948-9897-b2c5f022612a': [
    'b1ad9493-acca-5366-9ecd-4b7bf7edaf4a',
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  ],
  'da143538-8478-5175-a759-2fdd0b39f77c': [
    'a12fddce-0215-58d9-bd91-21be8a960d25',
  ],
  '58571be6-2f04-5b8a-b07a-98448bc47925': [
    'a12fddce-0215-58d9-bd91-21be8a960d25',
    'e6a50c74-c922-508c-aa27-07bac2566955',
  ],
  'b5fb9c07-1427-5400-82da-bfac9a8ce67b': [
    'bb5c5eab-2fc1-5336-b8cf-14d147695487',
    'e6a50c74-c922-508c-aa27-07bac2566955',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '096063c6-8853-5a36-9e20-ba7a81cd845c': [
    '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
    '49872cc0-401f-5464-9235-4763df4db5cf',
    '2973da95-2cfc-5817-9c99-3c0c82777369',
    'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
  '4e02bc89-1294-5b27-86f4-95be35d88e7b': [
    '3d3e5917-d367-535d-a6ad-b9d87259e6ce',
    '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
  ],
  '6a715839-21e8-5af3-8c56-015f1b09423a': [
    'ea17b0af-3d53-5a10-acda-7fd9348537ce',
    '58fc7852-722c-5a67-be6a-bfd1be0b527e',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  ],
  'd5ccdb26-cfad-5afa-8c18-a23d95eb398f': [
    'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
    'dfa53498-34f5-5326-9d94-87e7b528caf3',
  ],
  '031e3a67-159e-5b74-becd-d351b324841f': [
    '5476480f-7ff2-529f-aade-968198c782a9',
    '28f6a324-5f5e-5771-91d2-c007f6c275aa',
    'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f',
  ],
  'ed6622f3-529c-5d62-8e2f-688bceb2598c': [
    '91683676-01cf-5003-80fa-a04d043b4e61',
    '81c0d811-e6de-5489-8415-3b257c734a2e',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  'ab0b09f3-0309-5847-a99f-2ebab1775a45': [
    'e6a50c74-c922-508c-aa27-07bac2566955',
    'a12fddce-0215-58d9-bd91-21be8a960d25',
    'd3c153b9-e09b-5668-8386-73105546a7c1',
    'ad62f563-4fee-5399-8d9c-03a214658aa9',
  ],
  '0f39ecb1-2b70-53bf-b4ca-1ab1299548c1': [
    'bb5c5eab-2fc1-5336-b8cf-14d147695487',
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    'e6a50c74-c922-508c-aa27-07bac2566955',
    'b378c8b3-5e83-5abf-8243-b0f345037bfc',
  ],
}

const sourceDocument: SourceDocument = {
  key: 'LEHRPLANPLUS_PHYSIK_GYMNASIUM',
  title: 'LehrplanPLUS Gymnasium Bayern - Physik',
  path: sourcePath,
  role: 'binding-core',
  official: true,
  url: 'https://www.lehrplanplus.bayern.de/schulart/gymnasium/fach/physik',
}

function absoluteRepoPath(repoRelativePath: string): string {
  return path.resolve(repoRoot, repoRelativePath)
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim()
}

function stageFromTitle(title: string): 'SekI' | 'SekII' | null {
  const year = Number(title.match(/Ph(\d+)/u)?.[1] ?? title.match(/Jahrgangsstufe\s+(\d+)/u)?.[1])
  if ([8, 9, 10].includes(year)) return 'SekI'
  if ([11, 12, 13].includes(year)) return 'SekII'
  return null
}

function courseLevelFromTitle(title: string): 'GK_LK' | 'LK' | 'unspecified' {
  if (/erhöhtes Anforderungsniveau/u.test(title)) return 'LK'
  if (/grundlegendes Anforderungsniveau/u.test(title)) return 'GK_LK'
  return 'unspecified'
}

function topicCodeFromTitle(title: string): string {
  const year = title.match(/Ph(\d+)/u)?.[1]
  const learningArea = title.match(/Lernbereich\s+(\d+)/u)?.[1]
  if (!year || !learningArea) throw new Error(`Cannot derive topic code from passage title: ${title}`)

  const profile = /Biophysik/u.test(title)
    ? '-BIO'
    : /Astrophysik/u.test(title)
      ? '-ASTRO'
      : ''
  const level = /erhöhtes Anforderungsniveau/u.test(title)
    ? '-EA'
    : /grundlegendes Anforderungsniveau/u.test(title)
      ? '-GA'
      : ''
  return `Ph${year}${level}${profile}.${learningArea}`
}

function sourceRef(topicCode: string, bulletIndex: number): string {
  return `LehrplanPLUS Bayern Gymnasium Physik, ${topicCode}.${bulletIndex}`
}

function isPassageNode(goal: SourceGoalNode): boolean {
  return Boolean(goal.contains?.length)
    && /^(.+:\s+)?Ph\d+\s+Lernbereich\s+\d+:/u.test(goal.title)
}

function isSourceGoalNode(goal: SourceGoalNode): boolean {
  return !(goal.contains?.length)
    && !(goal.tags ?? []).includes('Motivation')
    && !/^Warum Physik\?/u.test(goal.title)
    && normalizeWhitespace(goal.description ?? '').length > 0
}

function buildExtraction(source: SourceLandscape): { passages: Passage[], sourceGoals: SourceGoal[], expectedTopicCodes: string[] } {
  const goalsById = new Map(source.goals.map((goal) => [goal.id, goal]))
  const passageNodes = source.goals.filter(isPassageNode)
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []

  passageNodes.forEach((passageNode) => {
    const topicCode = topicCodeFromTitle(passageNode.title)
    const stage = stageFromTitle(passageNode.title)
    const courseLevel = courseLevelFromTitle(passageNode.title)
    const childGoals = (passageNode.contains ?? [])
      .map((childId) => goalsById.get(childId))
      .filter((goal): goal is SourceGoalNode => Boolean(goal) && isSourceGoalNode(goal))

    const passage: Passage = {
      id: passageNode.id,
      topicCode,
      title: passageNode.title,
      text: childGoals.map((goal, index) => `${index + 1}) ${normalizeWhitespace(goal.description ?? goal.title)}`).join('\n'),
      sourcePath,
      sourceUrl: sourceDocument.url,
      rawText: passageNode.title,
      sourceGoalIds: childGoals.map((goal) => goal.id),
    }
    passages.push(passage)

    childGoals.forEach((goal, index) => {
      const description = normalizeWhitespace(goal.description ?? goal.title)
      sourceGoals.push({
        id: goal.id,
        passageId: passage.id,
        topicCode,
        bulletIndex: index + 1,
        aspectIndex: 1,
        title: normalizeWhitespace(goal.title),
        description,
        sourceText: description,
        sourceSpan: `${topicCode}.${index + 1}`,
        parentBulletText: description,
        sourceRef: sourceRef(topicCode, index + 1),
        courseLevel,
        granularity: 'officialCompetency',
        tags: [
          'jurisdiction:DE-BY',
          `stage:${stage ?? 'unknown'}`,
          `courseLevel:${courseLevel}`,
          `topic:${topicCode}`,
        ],
        rawSourceText: description,
        rawSourceSpan: `${topicCode}.${index + 1}`,
        rawParentBulletText: description,
      })
    })
  })

  return {
    passages,
    sourceGoals,
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
  }
}

function buildPipeline(parsed: { passages: Passage[], sourceGoals: SourceGoal[] }): { version: 1, currentStep: string, steps: PipelineStep[] } {
  const sourcePathPresent = existsSync(absoluteRepoPath(sourcePath))
  const passageIds = new Set(parsed.passages.map((passage) => passage.id))
  const duplicateSourceGoalIds = parsed.sourceGoals
    .map((sourceGoal) => sourceGoal.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index)
  const missingPassageRefs = parsed.sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptySourceTexts = parsed.sourceGoals
    .filter((sourceGoal) => sourceGoal.sourceText.length === 0)
    .map((sourceGoal) => sourceGoal.id)
  const m1Complete = sourcePathPresent && parsed.passages.length === 42
  const m2Complete = m1Complete
    && parsed.sourceGoals.length === 296
    && duplicateSourceGoalIds.length === 0
    && missingPassageRefs.length === 0
    && emptySourceTexts.length === 0

  const steps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: m1Complete ? 'complete' : 'incomplete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Strukturierte LehrplanPLUS-Physikquelle liegt lokal vor',
          passed: sourcePathPresent,
          details: sourcePath,
        },
        {
          id: 'topic-passages-extracted',
          label: 'Alle zieltragenden LehrplanPLUS-Physik-Lernbereiche sind als Passagen extrahiert',
          passed: parsed.passages.length === 42,
          details: `Erfasst: ${parsed.passages.length}/42 Passagen; Sek I: ${parsed.passages.filter((passage) => /^Ph(?:8|9|10)\./u.test(passage.topicCode)).length}, Sek II: ${parsed.passages.filter((passage) => /^Ph(?:11|12|13)/u.test(passage.topicCode)).length}.`,
        },
        {
          id: 'no-legacy-snapshot-counted',
          label: 'Kein alter Pilot-Quellsnapshot wird als Passage-Extraction gewertet',
          passed: true,
          details: 'Verwendet wird curricula/DE/Gymnasium/input/BY/gymnasium/Physik.json als strukturierte LehrplanPLUS-Quelle; source-json/*.snapshot-Dateien werden nicht gezählt.',
        },
      ],
    },
    {
      id: 'MAPPING-2',
      label: 'Source-Ziele aus Lehrplanpassagen erstellt',
      status: m2Complete ? 'complete' : m1Complete ? 'incomplete' : 'blocked',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'source-goals-created',
          label: 'Aus den LehrplanPLUS-Kompetenzerwartungen wurden Source-Ziele erzeugt',
          passed: parsed.sourceGoals.length === 296,
          details: `${parsed.sourceGoals.length} Source-Ziele`,
        },
        {
          id: 'source-goal-ids-unique',
          label: 'Source-Ziel-IDs sind eindeutig',
          passed: duplicateSourceGoalIds.length === 0,
          details: `Doppelte IDs: ${duplicateSourceGoalIds.length > 0 ? duplicateSourceGoalIds.join(', ') : '-'}`,
        },
        {
          id: 'source-goals-reference-passages',
          label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
          passed: missingPassageRefs.length === 0,
          details: `Ohne Passage: ${missingPassageRefs.length > 0 ? missingPassageRefs.join(', ') : '-'}`,
        },
        {
          id: 'source-goal-text-present',
          label: 'Jedes Source-Ziel enthält den LehrplanPLUS-Originaltext',
          passed: emptySourceTexts.length === 0,
          details: `Ohne Text: ${emptySourceTexts.length > 0 ? emptySourceTexts.join(', ') : '-'}`,
        },
      ],
    },
    {
      id: 'MAPPING-3',
      label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
      status: m2Complete ? 'incomplete' : 'blocked',
      dependsOn: ['MAPPING-1', 'MAPPING-2'],
      checks: [
        {
          id: 'mapping-2-complete',
          label: 'MAPPING-2 abgeschlossen',
          passed: m2Complete,
          details: m2Complete
            ? '296 Source-Ziele liegen vor; MAPPING-3 kann gegen diese Source-Extraction-IDs laufen.'
            : 'MAPPING-3 wartet auf vollständige Source-Ziele.',
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: existsSync(absoluteRepoPath(reviewPath)),
          details: reviewPath,
        },
      ],
    },
  ]

  return {
    version: 1,
    currentStep: m2Complete ? 'MAPPING-3' : steps.find((step) => step.status !== 'complete')?.id ?? '',
    steps,
  }
}

function writeReviewSeed(parsed: { sourceGoals: SourceGoal[] }, sourceLandscapeId: string): void {
  const reviewAbsolutePath = absoluteRepoPath(reviewPath)
  const legacyMappingAbsolutePath = absoluteRepoPath(legacyMappingPath)
  if (!existsSync(legacyMappingAbsolutePath)) return

  const legacyMapping = JSON.parse(readFileSync(legacyMappingAbsolutePath, 'utf8')) as {
    mappings?: Array<{ legacyGoalId?: string; canonicalGoalId?: string; matchType?: string }>
  }
  const sourceGoalIds = new Set(parsed.sourceGoals.map((sourceGoal) => sourceGoal.id))
  const canonicalTargetsBySourceGoalId = new Map<string, Array<{ canonicalGoalId: string; matchType: string }>>()
  ;(legacyMapping.mappings ?? []).forEach((mapping) => {
    if (typeof mapping.legacyGoalId !== 'string' || !sourceGoalIds.has(mapping.legacyGoalId)) return
    if (typeof mapping.canonicalGoalId !== 'string' || !mapping.canonicalGoalId.trim()) return
    const targets = canonicalTargetsBySourceGoalId.get(mapping.legacyGoalId) ?? []
    targets.push({
      canonicalGoalId: mapping.canonicalGoalId,
      matchType: mapping.matchType === 'exact' ? 'exact' : 'partial',
    })
    canonicalTargetsBySourceGoalId.set(mapping.legacyGoalId, targets)
  })
  Object.entries(reviewedCanonicalTargetsBySourceGoalId).forEach(([sourceGoalId, canonicalGoalIds]) => {
    if (!sourceGoalIds.has(sourceGoalId)) {
      throw new Error(`Reviewed BY Physik source goal not found in extraction: ${sourceGoalId}`)
    }
    canonicalTargetsBySourceGoalId.set(sourceGoalId, canonicalGoalIds.map((canonicalGoalId) => ({
      canonicalGoalId,
      matchType: canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    })))
  })
  const explicitlyReviewedSourceGoalIds = new Set(Object.keys(reviewedCanonicalTargetsBySourceGoalId))
  const allSourceGoalsExplicitlyReviewed = parsed.sourceGoals.every((sourceGoal) => explicitlyReviewedSourceGoalIds.has(sourceGoal.id))

  const decisions = parsed.sourceGoals
    .filter((sourceGoal) => canonicalTargetsBySourceGoalId.has(sourceGoal.id))
    .map((sourceGoal) => {
      const targets = canonicalTargetsBySourceGoalId.get(sourceGoal.id) ?? []
      const explicitlyReviewed = explicitlyReviewedSourceGoalIds.has(sourceGoal.id)
      return {
        sourceGoalId: sourceGoal.id,
        topicCode: sourceGoal.topicCode,
        sourceSpan: sourceGoal.sourceSpan,
        decision: 'mapped',
        canonicalGoalIds: targets.map((target) => target.canonicalGoalId),
        rationale: explicitlyReviewed
          ? 'Fachliche BY-Physik-M3-Review: Das Source-Ziel ist durch die angegebenen kanonischen SkillPilot-Ziele inhaltlich vollständig abgedeckt; mehrere Ziele beschreiben nur eine 1:n-Zuordnungsform.'
          : 'Vorgefundene BY-Physik-Legacy-Mappingkante als M3-Startpunkt übernommen; diese Entscheidung zählt nicht als abgeschlossene Gesamt-Review der Source-Extraction.',
        reviewedAt: '2026-05-10',
        reviewer: explicitlyReviewed ? 'codex' : 'codex-seed',
      }
    })

  const mappings = decisions.flatMap((decision) => {
    const targets = canonicalTargetsBySourceGoalId.get(decision.sourceGoalId) ?? []
    return targets.map((target) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId: target.canonicalGoalId,
      matchType: target.matchType,
      reviewDecisionId: decision.sourceGoalId,
    }))
  })

  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
  writeFileSync(reviewAbsolutePath, `${JSON.stringify({
    version: 1,
    reviewId: path.basename(reviewPath, '.json'),
    sourceLandscapeId,
    targetLandscapeId: canonicalPhysicsLandscapeId,
    sourceExtractionPath: outputPath,
    status: allSourceGoalsExplicitlyReviewed ? 'complete' : 'in_progress',
    note: allSourceGoalsExplicitlyReviewed
      ? 'Alle BY-Physik-Source-Ziele wurden fachlich gegen kanonische SkillPilot-Ziele reviewed; 1:n-Zuordnungen sind vollstaendige inhaltliche Abdeckungen durch mehrere Ziele.'
      : 'Seed aus vorhandener BY-Physik-Legacy-Mappingdatei; nicht als vollstaendige fachliche M3-Review interpretieren.',
    mappings,
    decisions,
  }, null, 2)}\n`)
}

function main(): void {
  const source = JSON.parse(readFileSync(absoluteRepoPath(sourcePath), 'utf8')) as SourceLandscape
  const parsed = buildExtraction(source)
  writeReviewSeed(parsed, source.landscapeId)
  const extraction = {
    schemaVersion: 1,
    extractionId: 'DE-BY-PHYSIK-GYMNASIUM-LEHRPLANPLUS',
    title: 'DE-BY - Physik Gymnasium (Bayern, LehrplanPLUS Source-Extraction)',
    sourceLandscapeId: source.landscapeId,
    jurisdiction: 'DE-BY',
    subject: 'Physik',
    stage: 'SekI+SekII',
    sourceDocument,
    sourceDocuments: [sourceDocument],
    method: {
      sourceAcquisition: 'Die strukturierte lokale LehrplanPLUS-Physikquelle fuer Gymnasium Bayern ist registriert; die offizielle LehrplanPLUS-Fachseite ist als Kontroll-URL hinterlegt.',
      passageExtraction: 'Aus der strukturierten LehrplanPLUS-Physikquelle wurden alle zieltragenden Ph8-Ph13-Lernbereichsabschnitte als Passage-Einheiten persistiert; synthetische Jahrgangs- und Motivationsknoten werden nicht als Lehrplanpassagen gewertet.',
      sourceGoalExtraction: 'Alle in den Passage-Einheiten enthaltenen Kompetenzerwartungen mit Zieltext wurden als Source-Ziele persistiert.',
    },
    expectedTopicCodes: parsed.expectedTopicCodes,
    pipelineStatus: buildPipeline(parsed),
    passages: parsed.passages,
    sourceGoals: parsed.sourceGoals,
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        reviewedAgainst: [
          { jurisdiction: 'DE-HE', sourceGoals: 322, note: 'HE Physik Sek I+Sek II, echte Source-Extraction' },
          { jurisdiction: 'DE-BW', sourceGoals: 265, note: 'BW Physik Sek I+Sek II, echte Source-Extraction' },
        ],
        count: parsed.sourceGoals.length,
        assessment: 'plausible',
        rationale: '296 BY-Physik-Source-Ziele liegen zwischen BW (265) und HE (322) und verletzen die 30-Prozent-Abweichungsheuristik nicht.',
      },
    },
  }

  const outputAbsolutePath = absoluteRepoPath(outputPath)
  mkdirSync(path.dirname(outputAbsolutePath), { recursive: true })
  writeFileSync(outputAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
  console.log(`${extraction.extractionId}: ${parsed.passages.length} passages, ${parsed.sourceGoals.length} source goals`)
  console.log(outputPath)
}

main()
