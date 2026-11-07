#!/usr/bin/env python3
"""Transport the externally fixed, finite V-context index through the existing raw Git kernel.

This selector supplies the actual reader's closed auxiliary input list. It does
not qualify reviews, select ready goals, or change the historical 18-case capsule.
"""
import json
import re

import visualization_review_git_capsule as kernel


# Closed transports: preserved historical54/Math57 and exact independently reviewed Econ17 successor.
MATH132_INDEX_SHA256 = '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803'
MATH132_CONTEXT_BINDING = {'prior74Index': {'path': 'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json', 'sha256': '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785'}, 'math58Pins': {'path': 'contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json', 'sha256': 'b561cd08c41439154a529b5e8fe3243a41567204ffce9f4c43adca531f843f76'}, 'source': {'path': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', 'sha256': 'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'}, 'math58GoalIds': ['2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2', 'b41cb496-dad5-596e-9c23-cdcbdab3ec2e', 'efc3506a-5f35-4d77-9498-d70a091a470b', '8d30d241-0247-48ac-83d3-4e0de61584d3', 'cdf49335-cebf-54b4-9f52-50d5badabe2f', '6b0075bb-f71c-59f6-ab98-fb894568cc26', 'ca8b2e67-7d14-5baf-8404-26820fe3d548', 'b819973b-4cad-48a4-9f7e-f74b5e75ea6c', '34ba4714-a0ff-4a48-857f-d2481cbe0441', 'a9fde754-51b4-58d7-85e5-5e36160581e6', 'b1dcc191-d046-50de-984a-ee5c17157628', 'c3c057a3-caf9-44a5-ae60-639e3119e94a', '6acd79f5-9447-5ea1-8127-6dbb72bd057d', '91571d3f-3651-4477-ba21-320fc4077453', '80c232f1-8f72-5829-9dbe-5a610ccab3be', 'ffd1ae26-c461-4439-9b18-d835c8f38e1a', '67c4d6f8-45fc-53d5-8c95-a4c423e421a6', '15505229-efec-4d01-8e71-acf15f9c2424', '886caebc-a042-4a94-91f9-6dc184203c42', '83a6ccb1-576e-59e1-8a97-8a332ec7dda8', '0272c501-2931-5e52-b62f-af068db63c44', 'fcfbff12-bd03-52ec-b242-a693212b3d2b', '8d1bb6ce-2433-4637-94ba-3bdc35fa5b10', 'c2831918-26f1-421e-90fb-ce707689594e', '508292f2-671b-4fd3-acbf-53d705e44693', 'b37851f1-d64a-47ec-a54a-1e70fa5586a9', '3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb', '44cb7404-114e-5b14-b33a-ddee41952d46', 'fb7a4fa0-03b5-53b4-bd86-608480b748a1', '81527aac-1abf-588d-acae-b82a86564b06', '9ea981ed-8b78-502c-b316-01d8cb885814', 'f1eee698-04c6-5d60-bcc6-a3c67129eea2', 'f40fcaf7-c630-589c-9f48-6c9e69da0b9d', 'f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97', '797ee047-b8dd-45cf-880e-98571a56c690', '15512e77-31e3-5222-8a6b-84791618e5ce', 'f7a9a0b4-ec64-468f-8da4-59c5055eac1d', '76478e47-5ff9-5de1-b601-5e6e436ad855', 'c420e0be-1e74-4050-834c-d8da7f41095a', '3f4d1340-1fbb-5109-b9c2-08fc61303133', '8dd9f210-2683-5902-acab-e3be22725232', '11c88ea2-8502-5008-bec2-3e491c75ace4', 'a111f535-ff21-5953-90f6-bee81d61b186', '2f565855-bcd6-4da5-bc80-4b72a2d93d50', 'acbb7e26-f85f-405b-a3e5-affa6add6711', 'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d', '565fcd3f-52cd-5402-a0ac-a1069ed9c598', '093397e0-eec8-45bb-9a5a-a24827876df5', '628928a6-4f48-54dc-952d-dec0e69dc856', '5390691d-1b7c-5572-9589-a69c2bba9a27', '8fa32a68-46eb-414e-8292-a4c4052b2522', '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5', '2ae76eae-799c-463e-9ec9-82327f8209a8', 'f4df008d-fcd4-5ba3-821b-2ee8bd8a1180', 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6', '2bb4bb91-7929-483a-b735-44275f6b5cdc', 'b04d65dc-1214-5323-89a7-317d6b099e1a', 'f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0'], 'all132GoalIds': ['0272c501-2931-5e52-b62f-af068db63c44', '0509ae79-abb4-5e6b-8db2-521c1bccacf4', '093397e0-eec8-45bb-9a5a-a24827876df5', '099086bb-5100-5ce0-8334-0aab8850a48e', '09e58ea8-1920-5600-bd2b-cc1f199d051f', '0b6db337-3fc6-5c30-860d-c8fbd535cb5c', '0c2ddfcd-1399-41ad-aaed-4f061812602a', '11c57203-1619-5bba-8905-9c10d7f77d57', '11c88ea2-8502-5008-bec2-3e491c75ace4', '13b20cee-8977-5b3f-938b-2064e96f2a5b', '15505229-efec-4d01-8e71-acf15f9c2424', '15512e77-31e3-5222-8a6b-84791618e5ce', '1582ec45-1655-5f7c-a2bd-a3fc00e583fa', '167bfd78-9202-5599-9325-66d7a1579185', '1bddc795-8aeb-5408-90b3-12e4be51e912', '2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2', '25278ecf-2e77-556e-9fe6-8f0b954cc680', '26ebbe6e-6512-520d-80a4-2e7e80f29f72', '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5', '29076abc-83ab-5e01-af81-18b7b3f7cf5a', '2a8b5b56-8c4e-5ed2-81f9-7fea08c98e60', '2ae76eae-799c-463e-9ec9-82327f8209a8', '2bb4bb91-7929-483a-b735-44275f6b5cdc', '2f565855-bcd6-4da5-bc80-4b72a2d93d50', '34ba4714-a0ff-4a48-857f-d2481cbe0441', '35558905-753d-5fcb-b25e-7f85ffdbff56', '3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb', '3bcb976d-3e45-5c62-81ac-5ed909df202b', '3f4d1340-1fbb-5109-b9c2-08fc61303133', '424bae9f-8f2e-5093-a17d-ee5eadb6edde', '43acb850-7685-5e53-acf6-6675120120d1', '44cb7404-114e-5b14-b33a-ddee41952d46', '45bd0edd-3d4e-55f1-88bf-407c4706e860', '4cd0c6d8-6485-51d0-883d-5d49ac46be70', '508292f2-671b-4fd3-acbf-53d705e44693', '5390691d-1b7c-5572-9589-a69c2bba9a27', '54049ed4-9364-5564-a55a-3959193d9018', '565fcd3f-52cd-5402-a0ac-a1069ed9c598', '577f0e2d-643a-5a0c-833b-301622a6cb00', '596c02e3-6263-5084-8593-c5f51808326b', '5ae551bf-942c-5896-b8e0-93aad36fe9b0', '5b5d1d53-71c3-5fbf-b1cf-977c868b60e3', '5e5ed258-dfe5-5ea6-9a40-859e79ef0ce5', '604cde3e-4095-50c3-b712-e6bd7cea4717', '606c4050-d196-509e-9a95-53733d6b06bb', '628928a6-4f48-54dc-952d-dec0e69dc856', '641dee8e-9658-5db1-89eb-2353f8322a8a', '667b75ad-2d20-5f22-ad57-46be5b7c53c7', '66ca6838-c9b3-5ab3-b47a-6a669bc4c21c', '676684da-5ba2-5c2a-ba7e-a8413915c29c', '67c4d6f8-45fc-53d5-8c95-a4c423e421a6', '682facbf-3c9d-5485-88a3-20f2394ed77f', '6acd79f5-9447-5ea1-8127-6dbb72bd057d', '6b0075bb-f71c-59f6-ab98-fb894568cc26', '6f75cdff-7d32-533b-8fe9-3d003b7af241', '76478e47-5ff9-5de1-b601-5e6e436ad855', '7727b988-e62c-5ebf-8e2f-0c719b13881c', '797ee047-b8dd-45cf-880e-98571a56c690', '79d244e0-049e-59e9-a2fb-b8f8670b315a', '7c9efc27-e74f-5a82-bf56-95a9aa21cb94', '7cbcca15-e93b-57ce-8f14-ffd1a557e288', '7d0c69c6-0c67-5221-9ccc-d55e3eb2c303', '7d399b4d-d057-5284-8e2c-6778e023307d', '7d4d7a90-a1d0-5818-8d55-a0c3e995957b', '7d632b0b-60b8-5c33-8094-ef1569b313dc', '7f1d5e9f-65ef-5d1d-83e5-5e2534772720', '80c232f1-8f72-5829-9dbe-5a610ccab3be', '81527aac-1abf-588d-acae-b82a86564b06', '83a6ccb1-576e-59e1-8a97-8a332ec7dda8', '84f7321d-7fb7-5e3a-ab8f-8690b26929f3', '87ee2b5a-8d10-51e4-a288-539e5ac251ea', '886caebc-a042-4a94-91f9-6dc184203c42', '8adaa076-10ad-5fbf-8a22-247b52046da4', '8d1bb6ce-2433-4637-94ba-3bdc35fa5b10', '8d30d241-0247-48ac-83d3-4e0de61584d3', '8dd9f210-2683-5902-acab-e3be22725232', '8dee6c0a-0f76-5717-87b6-04ec89229371', '8ebbbe19-43dd-53ff-a6d0-9d94a5973616', '8fa32a68-46eb-414e-8292-a4c4052b2522', '91571d3f-3651-4477-ba21-320fc4077453', '922d89fc-1cbd-56e9-ac5d-5cb59085de6c', '9267ad99-f474-5fd7-8b6a-bd03fbc70394', '9832485e-8431-58cb-b251-9473da415a5e', '99541aa7-c590-5f5d-8e89-fe2e39da7a9c', '9ea7d847-7425-5157-a827-ee5f8c2e8c0a', '9ea981ed-8b78-502c-b316-01d8cb885814', '9ebddb42-c799-5cf3-bfbc-f611ac66207b', 'a111f535-ff21-5953-90f6-bee81d61b186', 'a72ddc94-6b38-5c14-8d8b-661472e4dfba', 'a9fde754-51b4-58d7-85e5-5e36160581e6', 'acbb7e26-f85f-405b-a3e5-affa6add6711', 'b04d65dc-1214-5323-89a7-317d6b099e1a', 'b1dcc191-d046-50de-984a-ee5c17157628', 'b37851f1-d64a-47ec-a54a-1e70fa5586a9', 'b41cb496-dad5-596e-9c23-cdcbdab3ec2e', 'b456e539-24bb-5ec5-a996-14c9c77b64d0', 'b4a82d8d-6311-5575-b222-cbaf6ea90d32', 'b819973b-4cad-48a4-9f7e-f74b5e75ea6c', 'bc1ebc6a-3c15-547f-92a0-02ddeeafb5e4', 'becf0989-ee9f-5c8e-8173-5b8246e7944a', 'c2831918-26f1-421e-90fb-ce707689594e', 'c3c057a3-caf9-44a5-ae60-639e3119e94a', 'c420e0be-1e74-4050-834c-d8da7f41095a', 'c5272ab8-baa0-570b-9f31-426d1f4460f2', 'c7341b02-3da3-50f8-a750-5d10ed7c9958', 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6', 'ca8b2e67-7d14-5baf-8404-26820fe3d548', 'cc57df5b-69fd-5774-90d7-aa5ebd3d1632', 'cdf49335-cebf-54b4-9f52-50d5badabe2f', 'ce198bc9-b014-52ba-814f-25cc3e020668', 'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe', 'd17ff931-085d-56be-932d-3839b5b88ba8', 'd22433a8-fa0a-5db5-b65f-9d47b801f2d9', 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0', 'ebbce1c2-51b3-5215-8bcb-fbb74affdd62', 'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d', 'efc3506a-5f35-4d77-9498-d70a091a470b', 'f0b0a96f-65ed-5647-a6f8-bfe7aa4a5d91', 'f1eee698-04c6-5d60-bcc6-a3c67129eea2', 'f40fcaf7-c630-589c-9f48-6c9e69da0b9d', 'f4df008d-fcd4-5ba3-821b-2ee8bd8a1180', 'f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97', 'f7034be8-64e9-5f63-9556-d7b8dc59eda7', 'f7a9a0b4-ec64-468f-8da4-59c5055eac1d', 'f9132615-8166-5e42-ad04-d8b2b75d719d', 'f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0', 'fb249488-944c-5123-a21e-5cb9a0431e8b', 'fb7a4fa0-03b5-53b4-bd86-608480b748a1', 'fcf756f1-7252-54cb-9257-de8259090021', 'fcfbff12-bd03-52ec-b242-a693212b3d2b', 'fd913fec-e64a-5a1a-88f6-724d788ed951', 'ffd1ae26-c461-4439-9b18-d835c8f38e1a']}

BIO188_INDEX_SHA256 = '60293cf3836ba584c1e84ed4d5e19b6c31f012bb261bc41cd76fd3ad382a3ed8'
BIO188_RESOURCE_LIMITS = {'working': 523239424, 'object': 495976448, 'embedded': 14680064}
BIO188_OBJECT_BYTES = 495607951
BIO188_EMBEDDED_BYTES = 14659066
BIO188_CONTEXT_BINDING = {'profile': 'biology-sealed-native-three-families-v1', 'prior132Index': {'path': 'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json', 'sha256': '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803'}, 'source': {'path': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json', 'sha256': '9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79'}, 'biology56GoalIds': ['1abf08d7-6fc1-5705-b2d4-21cb44ceeba0', '41467314-3611-5ee3-98c5-f1e8eca2efc2', '1f65f78e-b528-5d88-ad00-8e8714a2303e', 'c7e2d7e5-ce6b-53e0-806d-66ae4d7846dd', 'bd5e675f-61cc-593d-913e-383e1d3f8783', 'bb6fb806-ee15-5881-8529-2425cadfb5a1', '73624d0c-bc6f-5b5d-baf5-099ca62fab79', 'ed84c759-62e5-537f-90b8-4e8c2dbfd9bb', '30a1d736-77ca-5087-b640-b756c249bc40', 'bf2abe42-07bb-5c35-9118-d6141076c299', '7e26c129-91f7-52de-8114-2361411c80f8', '848fcbe0-dc25-53eb-a1a8-38313b65cf6d', '498f082d-742c-5f21-9d09-16feeb4276a6', '668c01c7-0887-5a54-84ff-648facd8e962', '8f9dc189-e875-56dd-bd97-996c8bf0cdc4', 'f9597bb0-1b33-53df-8359-cdd43180307b', '4b3b0cd7-47d2-5213-b1ce-4e829ccbb6a2', 'dc1c2eff-5e42-50f1-ab75-b180b4f58907', 'c25a1bc9-c664-53d7-b2d8-500741da773c', 'd773ac89-37ef-51cd-a6ee-a75a6b10c43b', '5f39afac-897c-5ed3-95b5-89ccf66b2532', 'bdbb1a13-f448-5536-86ab-894805e2f6be', 'ac69483b-6a77-573d-a7c0-add32bb867e2', '9263ee6c-bf62-531c-bb09-78a4a51b8ed7', 'bac3e333-d044-559e-8d8e-b8eff4af2b56', '19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d', '892a1d3a-9923-5ac2-affa-f2d5c38e3c54', 'be06115e-96e8-537e-b18a-313056e6cbe8', '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd', '7eeb9de9-9a8e-5932-8f60-183367c87d09', '4e12ba43-a58c-5611-8c43-3cc0c8465e33', '8e1300bb-14a1-5155-884a-144c88f1c04b', '8a56672b-b662-5bcd-9f43-8ffc4abc4f01', '2f462b79-4ebc-5ab5-9e72-91135c5252c7', '6faa6c23-00c9-5758-bd98-01825692abb2', '6e2dae03-9ea9-5466-b93e-13adcfb01245', '66967754-3934-58b3-b79e-d0f867dae070', 'ac7f0a5a-dff6-570b-b0fd-10cb0f33be29', '06e91b97-e7cc-5698-a854-8a946a4bb7d0', '1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30', '9ac89f04-4483-5aac-8636-65c9d967048a', '33262175-0139-5d8a-a3f2-641191459f71', 'eee09949-587f-51d2-8f51-aa6c40c71bbf', '967b666d-aed4-50d8-be73-70269cb306db', '480146f6-4749-52e3-a5e5-d08629e0c38f', '3e913f00-c3d7-5bbe-a73e-36bdc0d4a6e8', 'ba9b6ed1-553c-5096-abf7-1e2cba8cfcfd', 'dcc9d2e5-16f4-5813-ab66-7095c8a165a6', 'ba96880f-d31e-54c2-8139-4a748fc9541a', '249f4c5d-fd23-57c7-ac62-773d62c33b49', '4b7fdc2c-9dbe-5439-8d84-295abc240eec', 'f7fd8d03-aea2-530a-a384-0f63d270f5f6', '1d2b1038-dcd5-529a-b085-9e14f1d58c76', 'b8fc739d-f5de-5f83-92fe-28dc6597add5', '8be0001b-4fe0-5ea1-9d61-b3c4bbb16660', '74740709-fc77-5a54-88a6-bb14c3777941'], 'all188GoalIds': ['0272c501-2931-5e52-b62f-af068db63c44', '0509ae79-abb4-5e6b-8db2-521c1bccacf4', '06e91b97-e7cc-5698-a854-8a946a4bb7d0', '093397e0-eec8-45bb-9a5a-a24827876df5', '099086bb-5100-5ce0-8334-0aab8850a48e', '09e58ea8-1920-5600-bd2b-cc1f199d051f', '0b6db337-3fc6-5c30-860d-c8fbd535cb5c', '0c2ddfcd-1399-41ad-aaed-4f061812602a', '11c57203-1619-5bba-8905-9c10d7f77d57', '11c88ea2-8502-5008-bec2-3e491c75ace4', '13b20cee-8977-5b3f-938b-2064e96f2a5b', '15505229-efec-4d01-8e71-acf15f9c2424', '15512e77-31e3-5222-8a6b-84791618e5ce', '1582ec45-1655-5f7c-a2bd-a3fc00e583fa', '167bfd78-9202-5599-9325-66d7a1579185', '19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d', '1abf08d7-6fc1-5705-b2d4-21cb44ceeba0', '1bddc795-8aeb-5408-90b3-12e4be51e912', '1d2b1038-dcd5-529a-b085-9e14f1d58c76', '1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30', '1f65f78e-b528-5d88-ad00-8e8714a2303e', '2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2', '249f4c5d-fd23-57c7-ac62-773d62c33b49', '25278ecf-2e77-556e-9fe6-8f0b954cc680', '26ebbe6e-6512-520d-80a4-2e7e80f29f72', '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5', '29076abc-83ab-5e01-af81-18b7b3f7cf5a', '2a8b5b56-8c4e-5ed2-81f9-7fea08c98e60', '2ae76eae-799c-463e-9ec9-82327f8209a8', '2bb4bb91-7929-483a-b735-44275f6b5cdc', '2f462b79-4ebc-5ab5-9e72-91135c5252c7', '2f565855-bcd6-4da5-bc80-4b72a2d93d50', '30a1d736-77ca-5087-b640-b756c249bc40', '33262175-0139-5d8a-a3f2-641191459f71', '34ba4714-a0ff-4a48-857f-d2481cbe0441', '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd', '35558905-753d-5fcb-b25e-7f85ffdbff56', '3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb', '3bcb976d-3e45-5c62-81ac-5ed909df202b', '3e913f00-c3d7-5bbe-a73e-36bdc0d4a6e8', '3f4d1340-1fbb-5109-b9c2-08fc61303133', '41467314-3611-5ee3-98c5-f1e8eca2efc2', '424bae9f-8f2e-5093-a17d-ee5eadb6edde', '43acb850-7685-5e53-acf6-6675120120d1', '44cb7404-114e-5b14-b33a-ddee41952d46', '45bd0edd-3d4e-55f1-88bf-407c4706e860', '480146f6-4749-52e3-a5e5-d08629e0c38f', '498f082d-742c-5f21-9d09-16feeb4276a6', '4b3b0cd7-47d2-5213-b1ce-4e829ccbb6a2', '4b7fdc2c-9dbe-5439-8d84-295abc240eec', '4cd0c6d8-6485-51d0-883d-5d49ac46be70', '4e12ba43-a58c-5611-8c43-3cc0c8465e33', '508292f2-671b-4fd3-acbf-53d705e44693', '5390691d-1b7c-5572-9589-a69c2bba9a27', '54049ed4-9364-5564-a55a-3959193d9018', '565fcd3f-52cd-5402-a0ac-a1069ed9c598', '577f0e2d-643a-5a0c-833b-301622a6cb00', '596c02e3-6263-5084-8593-c5f51808326b', '5ae551bf-942c-5896-b8e0-93aad36fe9b0', '5b5d1d53-71c3-5fbf-b1cf-977c868b60e3', '5e5ed258-dfe5-5ea6-9a40-859e79ef0ce5', '5f39afac-897c-5ed3-95b5-89ccf66b2532', '604cde3e-4095-50c3-b712-e6bd7cea4717', '606c4050-d196-509e-9a95-53733d6b06bb', '628928a6-4f48-54dc-952d-dec0e69dc856', '641dee8e-9658-5db1-89eb-2353f8322a8a', '667b75ad-2d20-5f22-ad57-46be5b7c53c7', '668c01c7-0887-5a54-84ff-648facd8e962', '66967754-3934-58b3-b79e-d0f867dae070', '66ca6838-c9b3-5ab3-b47a-6a669bc4c21c', '676684da-5ba2-5c2a-ba7e-a8413915c29c', '67c4d6f8-45fc-53d5-8c95-a4c423e421a6', '682facbf-3c9d-5485-88a3-20f2394ed77f', '6acd79f5-9447-5ea1-8127-6dbb72bd057d', '6b0075bb-f71c-59f6-ab98-fb894568cc26', '6e2dae03-9ea9-5466-b93e-13adcfb01245', '6f75cdff-7d32-533b-8fe9-3d003b7af241', '6faa6c23-00c9-5758-bd98-01825692abb2', '73624d0c-bc6f-5b5d-baf5-099ca62fab79', '74740709-fc77-5a54-88a6-bb14c3777941', '76478e47-5ff9-5de1-b601-5e6e436ad855', '7727b988-e62c-5ebf-8e2f-0c719b13881c', '797ee047-b8dd-45cf-880e-98571a56c690', '79d244e0-049e-59e9-a2fb-b8f8670b315a', '7c9efc27-e74f-5a82-bf56-95a9aa21cb94', '7cbcca15-e93b-57ce-8f14-ffd1a557e288', '7d0c69c6-0c67-5221-9ccc-d55e3eb2c303', '7d399b4d-d057-5284-8e2c-6778e023307d', '7d4d7a90-a1d0-5818-8d55-a0c3e995957b', '7d632b0b-60b8-5c33-8094-ef1569b313dc', '7e26c129-91f7-52de-8114-2361411c80f8', '7eeb9de9-9a8e-5932-8f60-183367c87d09', '7f1d5e9f-65ef-5d1d-83e5-5e2534772720', '80c232f1-8f72-5829-9dbe-5a610ccab3be', '81527aac-1abf-588d-acae-b82a86564b06', '83a6ccb1-576e-59e1-8a97-8a332ec7dda8', '848fcbe0-dc25-53eb-a1a8-38313b65cf6d', '84f7321d-7fb7-5e3a-ab8f-8690b26929f3', '87ee2b5a-8d10-51e4-a288-539e5ac251ea', '886caebc-a042-4a94-91f9-6dc184203c42', '892a1d3a-9923-5ac2-affa-f2d5c38e3c54', '8a56672b-b662-5bcd-9f43-8ffc4abc4f01', '8adaa076-10ad-5fbf-8a22-247b52046da4', '8be0001b-4fe0-5ea1-9d61-b3c4bbb16660', '8d1bb6ce-2433-4637-94ba-3bdc35fa5b10', '8d30d241-0247-48ac-83d3-4e0de61584d3', '8dd9f210-2683-5902-acab-e3be22725232', '8dee6c0a-0f76-5717-87b6-04ec89229371', '8e1300bb-14a1-5155-884a-144c88f1c04b', '8ebbbe19-43dd-53ff-a6d0-9d94a5973616', '8f9dc189-e875-56dd-bd97-996c8bf0cdc4', '8fa32a68-46eb-414e-8292-a4c4052b2522', '91571d3f-3651-4477-ba21-320fc4077453', '922d89fc-1cbd-56e9-ac5d-5cb59085de6c', '9263ee6c-bf62-531c-bb09-78a4a51b8ed7', '9267ad99-f474-5fd7-8b6a-bd03fbc70394', '967b666d-aed4-50d8-be73-70269cb306db', '9832485e-8431-58cb-b251-9473da415a5e', '99541aa7-c590-5f5d-8e89-fe2e39da7a9c', '9ac89f04-4483-5aac-8636-65c9d967048a', '9ea7d847-7425-5157-a827-ee5f8c2e8c0a', '9ea981ed-8b78-502c-b316-01d8cb885814', '9ebddb42-c799-5cf3-bfbc-f611ac66207b', 'a111f535-ff21-5953-90f6-bee81d61b186', 'a72ddc94-6b38-5c14-8d8b-661472e4dfba', 'a9fde754-51b4-58d7-85e5-5e36160581e6', 'ac69483b-6a77-573d-a7c0-add32bb867e2', 'ac7f0a5a-dff6-570b-b0fd-10cb0f33be29', 'acbb7e26-f85f-405b-a3e5-affa6add6711', 'b04d65dc-1214-5323-89a7-317d6b099e1a', 'b1dcc191-d046-50de-984a-ee5c17157628', 'b37851f1-d64a-47ec-a54a-1e70fa5586a9', 'b41cb496-dad5-596e-9c23-cdcbdab3ec2e', 'b456e539-24bb-5ec5-a996-14c9c77b64d0', 'b4a82d8d-6311-5575-b222-cbaf6ea90d32', 'b819973b-4cad-48a4-9f7e-f74b5e75ea6c', 'b8fc739d-f5de-5f83-92fe-28dc6597add5', 'ba96880f-d31e-54c2-8139-4a748fc9541a', 'ba9b6ed1-553c-5096-abf7-1e2cba8cfcfd', 'bac3e333-d044-559e-8d8e-b8eff4af2b56', 'bb6fb806-ee15-5881-8529-2425cadfb5a1', 'bc1ebc6a-3c15-547f-92a0-02ddeeafb5e4', 'bd5e675f-61cc-593d-913e-383e1d3f8783', 'bdbb1a13-f448-5536-86ab-894805e2f6be', 'be06115e-96e8-537e-b18a-313056e6cbe8', 'becf0989-ee9f-5c8e-8173-5b8246e7944a', 'bf2abe42-07bb-5c35-9118-d6141076c299', 'c25a1bc9-c664-53d7-b2d8-500741da773c', 'c2831918-26f1-421e-90fb-ce707689594e', 'c3c057a3-caf9-44a5-ae60-639e3119e94a', 'c420e0be-1e74-4050-834c-d8da7f41095a', 'c5272ab8-baa0-570b-9f31-426d1f4460f2', 'c7341b02-3da3-50f8-a750-5d10ed7c9958', 'c7e2d7e5-ce6b-53e0-806d-66ae4d7846dd', 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6', 'ca8b2e67-7d14-5baf-8404-26820fe3d548', 'cc57df5b-69fd-5774-90d7-aa5ebd3d1632', 'cdf49335-cebf-54b4-9f52-50d5badabe2f', 'ce198bc9-b014-52ba-814f-25cc3e020668', 'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe', 'd17ff931-085d-56be-932d-3839b5b88ba8', 'd22433a8-fa0a-5db5-b65f-9d47b801f2d9', 'd773ac89-37ef-51cd-a6ee-a75a6b10c43b', 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0', 'dc1c2eff-5e42-50f1-ab75-b180b4f58907', 'dcc9d2e5-16f4-5813-ab66-7095c8a165a6', 'ebbce1c2-51b3-5215-8bcb-fbb74affdd62', 'ec9f2ed4-c9e6-5fb3-a073-75b53127e55d', 'ed84c759-62e5-537f-90b8-4e8c2dbfd9bb', 'eee09949-587f-51d2-8f51-aa6c40c71bbf', 'efc3506a-5f35-4d77-9498-d70a091a470b', 'f0b0a96f-65ed-5647-a6f8-bfe7aa4a5d91', 'f1eee698-04c6-5d60-bcc6-a3c67129eea2', 'f40fcaf7-c630-589c-9f48-6c9e69da0b9d', 'f4df008d-fcd4-5ba3-821b-2ee8bd8a1180', 'f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97', 'f7034be8-64e9-5f63-9556-d7b8dc59eda7', 'f7a9a0b4-ec64-468f-8da4-59c5055eac1d', 'f7fd8d03-aea2-530a-a384-0f63d270f5f6', 'f9132615-8166-5e42-ad04-d8b2b75d719d', 'f9597bb0-1b33-53df-8359-cdd43180307b', 'f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0', 'fb249488-944c-5123-a21e-5cb9a0431e8b', 'fb7a4fa0-03b5-53b4-bd86-608480b748a1', 'fcf756f1-7252-54cb-9257-de8259090021', 'fcfbff12-bd03-52ec-b242-a693212b3d2b', 'fd913fec-e64a-5a1a-88f6-724d788ed951', 'ffd1ae26-c461-4439-9b18-d835c8f38e1a']}

_ACCEPTED_INDEXES = {
    BIO188_INDEX_SHA256: ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 188),
    MATH132_INDEX_SHA256: ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 132),
    '3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e':
        ('6fe35a6b0fa807e5a97475b34f3715dc16a89c00', 54),
    '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0':
        ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 57),
    '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785':
        ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 74),
}


def index_originals(root, index_path, accepted_index):
    kernel.require(accepted_index in _ACCEPTED_INDEXES, 'Unknown fixed reviewed-context transport')
    expected_anchor, expected_count = _ACCEPTED_INDEXES[accepted_index]
    def unique_object(pairs):
        value = {}
        for key, item in pairs:
            kernel.require(key not in value, 'Duplicate index JSON property')
            value[key] = item
        return value
    index = json.loads(kernel.read_bound(root, index_path, accepted_index), object_pairs_hook=unique_object)
    expected_fields = {'schemaVersion', 'kind', 'acceptedRepositoryCommit', 'rows',
                       'originalReferences', 'newReviewClaimed', 'runtimeActivationAllowed'}
    if accepted_index in (MATH132_INDEX_SHA256, BIO188_INDEX_SHA256):
        expected_fields |= {'currentReferences', 'currentContextBinding'}
    if accepted_index == BIO188_INDEX_SHA256:
        expected_fields.add('biology56ContextBinding')
    kernel.require(set(index) == expected_fields,
                   'Unknown or missing reviewed-context index field')
    kernel.require(index['schemaVersion'] == 1 and index['kind'] == 'externally-pinned-reviewed-visualization-context-index'
                   and index['newReviewClaimed'] is False and index['runtimeActivationAllowed'] is False,
                   'Wrong reviewed-context index contract')
    kernel.require(re.fullmatch('[0-9a-f]{40}', index['acceptedRepositoryCommit']) is not None,
                   'Invalid original-history anchor')
    kernel.require(index['acceptedRepositoryCommit'] == expected_anchor, 'Crossed fixed original-history anchor')
    refs, receipts, working, goals = {}, [], {}, set()
    def digest(value):
        kernel.require(isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value) is not None, 'Invalid input SHA256')
    def add_working(path, value):
        digest(value)
        raw = kernel.read_bound(root, path, value)
        row = {'path': path, 'sha256': value, 'bytes': len(raw)}
        kernel.require(path not in working or working[path] == row, 'Conflicting original working input')
        working[path] = row
    add_working(index_path, accepted_index)
    kernel.require(isinstance(index['rows'], list) and len(index['rows']) == expected_count, 'The fixed reviewed-context transport count differs')
    for row in index['rows']:
        kernel.require(set(row) == {'landscapeId', 'goalId', 'receipt'}
                       and isinstance(row['landscapeId'], str) and isinstance(row['goalId'], str), 'Invalid owner/goal row')
        key = (row['landscapeId'], row['goalId'])
        kernel.require(key not in goals, 'Duplicate owner/goal qualification')
        goals.add(key)
        receipt = row['receipt']
        kernel.require(set(receipt) == {'path', 'sha256'}, 'Invalid qualification reference')
        add_working(receipt['path'], receipt['sha256'])
        receipts.append(receipt)
    kernel.require(len({row['path'] for row in receipts}) == len(receipts), 'Duplicate qualification locator')
    kernel.require(isinstance(index['originalReferences'], list) and index['originalReferences'], 'Empty original closure')
    for row in index['originalReferences']:
        kernel.require(set(row) == {'path', 'gitCommit', 'sha256', 'currentCopyRequired'}
                       and type(row['currentCopyRequired']) is bool, 'Invalid original auxiliary binding')
        kernel.relative(row['path']); digest(row['sha256'])
        kernel.require(isinstance(row['gitCommit'], str) and re.fullmatch('[0-9a-f]{40}', row['gitCommit']) is not None,
                       'Invalid original artifact commit')
        ref = {field: row[field] for field in ('path', 'gitCommit', 'sha256')}
        key = (ref['gitCommit'], ref['path'])
        kernel.require(key not in refs, 'Duplicate original auxiliary binding')
        refs[key] = ref
        if row['currentCopyRequired']:
            add_working(ref['path'], ref['sha256'])
    if accepted_index in (MATH132_INDEX_SHA256, BIO188_INDEX_SHA256):
        kernel.require(index['currentContextBinding'] == MATH132_CONTEXT_BINDING, 'Fixed132 current source/goal set differs')
        kernel.require(sorted(row['goalId'] for row in index['rows'][:132]) == MATH132_CONTEXT_BINDING['all132GoalIds'], 'Fixed132 goal IDs differ')
        add_working(MATH132_CONTEXT_BINDING['prior74Index']['path'], MATH132_CONTEXT_BINDING['prior74Index']['sha256'])
        prior = json.loads(kernel.read_bound(root, MATH132_CONTEXT_BINDING['prior74Index']['path'], MATH132_CONTEXT_BINDING['prior74Index']['sha256']))
        kernel.require(index['rows'][:74] == prior['rows'], 'Historical74 receipt rows changed')
        count = 521 if accepted_index == BIO188_INDEX_SHA256 else 408
        kernel.require(len(index['currentReferences']) == count and len({r['path'] for r in index['currentReferences']}) == count, 'Fixed132 current evidence set differs')
        for current in index['currentReferences']:
            kernel.require(set(current) == {'path', 'sha256', 'bytes'} and type(current['bytes']) is int and current['bytes'] >= 0, 'Invalid current evidence binding')
            add_working(current['path'], current['sha256'])
            kernel.require(working[current['path']]['bytes'] == current['bytes'], 'Current evidence length differs')
    if accepted_index == BIO188_INDEX_SHA256:
        kernel.require(index['biology56ContextBinding'] == BIO188_CONTEXT_BINDING, 'Fixed188 Bio source/goal binding differs')
        prior_ref = BIO188_CONTEXT_BINDING['prior132Index']
        add_working(prior_ref['path'], prior_ref['sha256'])
        prior132 = json.loads(kernel.read_bound(root, prior_ref['path'], prior_ref['sha256']))
        kernel.require(index['rows'][:132] == prior132['rows'], 'Historical132 receipt rows changed')
        kernel.require(sorted(row['goalId'] for row in index['rows']) == BIO188_CONTEXT_BINDING['all188GoalIds']
                       and [row['goalId'] for row in index['rows'][132:]] == BIO188_CONTEXT_BINDING['biology56GoalIds'], 'Fixed188 finite IDs differ')
    return index, [refs[key] for key in sorted(refs)], receipts, [working[path] for path in sorted(working)]


def _with_fixed74_limits(action):
    """Guard the effective Namespace from the one authoritative kernel parser."""
    def bounded(args):
        if args.accepted_census_sha256 == '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785':
            kernel.require(args.maximum_working_bytes <= 201326592,
                           'Fixed74 working allowance exceeds its external192-MiB bound')
            kernel.require(args.maximum_object_bytes <= 268435456,
                           'Fixed74 object allowance exceeds unchanged256-MiB bound')
            kernel.require(args.maximum_embedded_bytes <= 16777216,
                           'Fixed74 embedded allowance exceeds unchanged16-MiB bound')
        fixed132 = args.accepted_census_sha256 == MATH132_INDEX_SHA256
        if fixed132:
            for kind, maximum, label in (("working", 308 * 1024 * 1024, "external308-MiB"),
                                         ("object", 282 * 1024 * 1024, "external282-MiB"),
                                         ("embedded", 14 * 1024 * 1024, "external14-MiB")):
                allowance = getattr(args, "maximum_" + kind + "_bytes")
                kernel.require(0 <= allowance <= maximum, "Fixed132 " + kind + " allowance exceeds " + label + " bound")
            # Object totals are measured from this exact immutable original closure.
            # Current working bytes are recomputed, never inferred from goal counts.
            kernel.require(args.maximum_object_bytes >= 295355809, "Fixed132 actual object bytes exceed caller budget")
            kernel.require(args.maximum_embedded_bytes >= 14589626, "Fixed132 actual embedded bytes exceed caller budget")
            _, _, _, working = index_originals(args.repository_root.resolve(strict=True), args.census_path, args.accepted_census_sha256)
            kernel.require(sum({r['sha256']: r['bytes'] for r in working}.values()) <= args.maximum_working_bytes,
                           "Fixed132 actual working bytes exceed caller budget")
            if action.__name__ == "materialize":
                body = json.loads((args.capsule / "capsule.json").read_bytes())
                kernel.require(sum(r['bytes'] for r in body['objects'] if r['storage'] == 'embedded') <= args.maximum_embedded_bytes,
                               "Fixed132 embedded payload exceeds caller budget")
        fixed188 = args.accepted_census_sha256 == BIO188_INDEX_SHA256
        if fixed188:
            for kind, maximum in BIO188_RESOURCE_LIMITS.items():
                allowance = getattr(args, "maximum_" + kind + "_bytes")
                kernel.require(0 <= allowance <= maximum, "Fixed188 " + kind + " allowance exceeds its measured finite bound")
            kernel.require(args.maximum_object_bytes >= BIO188_OBJECT_BYTES, "Fixed188 actual object bytes exceed caller budget")
            kernel.require(args.maximum_embedded_bytes >= BIO188_EMBEDDED_BYTES, "Fixed188 actual embedded bytes exceed caller budget")
            _, _, _, working = index_originals(args.repository_root.resolve(strict=True), args.census_path, args.accepted_census_sha256)
            kernel.require(sum({r['sha256']: r['bytes'] for r in working}.values()) <= args.maximum_working_bytes,
                           "Fixed188 actual working bytes exceed caller budget")
        result = action(args)
        if fixed132 and action.__name__ == "build":
            body = json.loads((args.output / "capsule.json").read_bytes())
            kernel.require(sum(r['bytes'] for r in body['objects']) == 295355809
                           and sum(r['bytes'] for r in body['objects'] if r['storage'] == 'embedded') == 14589626,
                           "Fixed132 measured original object set differs")
        if fixed188 and action.__name__ == "build":
            body = json.loads((args.output / "capsule.json").read_bytes())
            kernel.require(sum(r['bytes'] for r in body['objects']) == BIO188_OBJECT_BYTES
                           and sum(r['bytes'] for r in body['objects'] if r['storage'] == 'embedded') == BIO188_EMBEDDED_BYTES,
                           "Fixed188 measured original object set differs")
        return result
    return bounded


if __name__ == '__main__':
    # Parse exactly once inside unchanged kernel.main(). Both actual operations
    # receive the same effective Namespace after this closed resource guard.
    kernel.originals = index_originals
    kernel.build = _with_fixed74_limits(kernel.build)
    kernel.materialize = _with_fixed74_limits(kernel.materialize)
    kernel.main()
