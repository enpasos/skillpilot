package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.CurriculumPersonalizationPlanner;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Live native regression for the registered reductions, independent of ignored measurement receipts. */
class FirstMathPrerequisiteReductionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String BIOLOGY = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String LATIN = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String GERMAN = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String CHEMISTRY = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    // Exact separately frozen Chemistry candidate; historical sourceFP baselines remain unchanged.
    private static final String CHEMISTRY_V7_WRAPPER_DIGEST = "sha256:e7d4415a37e5f4d9b351ff85538d519b79a0a2ff642293ee5e3118bb6ef6c4b6";
    private static final String CHEMISTRY_V6_PARENT_DIGEST = "sha256:e9d880b8f038b251a766d1208ae04f65004e161c336ee894d31a0433c380c389";
    private static final Path CHEMISTRY_SOURCE = findRepositoryRoot().resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json");
    private static final Map<String, List<String>> CHEMISTRY_ASSESSMENT_CLUSTER_BASIS = Map.of(
            "8bf5a0ac-7ce1-53ea-b684-d9cc7b6072d5", List.of(
                    "7982e338-79bd-554a-badf-21d9a72ed7f0", "37672991-f784-5223-a616-70e79b4cbcea",
                    "0091a271-9103-549b-85e4-775412331a71", "a2ea5606-4ab6-5962-a510-32d205459dd5"),
            "70742457-7aeb-5c55-a852-e73b8288a8d1", List.of(
                    "0ff2e679-cfcd-5fbf-bc87-e74859cfdac1", "30dbd316-41c7-514b-85b4-7a77a4bc8b2c",
                    "fc3d6ef9-7c0c-5b53-aade-23f20ac8a5cd", "ff33692b-c42a-5d27-b222-08a96b878954"));
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final Map<String, Set<String>> PHYSICS_PROBES_BY_SOURCE = Map.ofEntries(
            Map.entry("00e2ddfe-18c1-57a4-86ad-ee467a1a3d61", Set.of("00e2ddfe-18c1-57a4-86ad-ee467a1a3d61")),
            Map.entry("0432a422-401b-5134-bf08-05cfd8c7a366", Set.of("0432a422-401b-5134-bf08-05cfd8c7a366")),
            Map.entry("09029573-864f-40ca-bf8a-cee7bf6dcb73", Set.of("09029573-864f-40ca-bf8a-cee7bf6dcb73")),
            Map.entry("09e058e9-f3ed-5046-b0e9-495b694bf2a1", Set.of("09e058e9-f3ed-5046-b0e9-495b694bf2a1")),
            Map.entry("0b08aed8-3c0f-5b38-844c-1bb363abbf68", Set.of("0b08aed8-3c0f-5b38-844c-1bb363abbf68")),
            Map.entry("0b090935-1e43-581b-84ec-078741f8969e", Set.of("0b090935-1e43-581b-84ec-078741f8969e")),
            Map.entry("0ceb4400-3e8f-586c-a669-a8877906bd8d", Set.of("0ceb4400-3e8f-586c-a669-a8877906bd8d")),
            Map.entry("0cf2a5b0-8660-578d-8316-2b8a50fbdff7", Set.of("0cf2a5b0-8660-578d-8316-2b8a50fbdff7")),
            Map.entry("0dd1e39c-8557-5a4e-b467-caae964fff67", Set.of("0dd1e39c-8557-5a4e-b467-caae964fff67")),
            Map.entry("0f5346d6-de1b-5e38-aaba-68db205e594b", Set.of("0f5346d6-de1b-5e38-aaba-68db205e594b")),
            Map.entry("119cb138-b0c4-559d-8f1a-a4ae42db0656", Set.of("119cb138-b0c4-559d-8f1a-a4ae42db0656")),
            Map.entry("14d99a65-8d58-5647-88ab-02137b96d55b", Set.of("14d99a65-8d58-5647-88ab-02137b96d55b")),
            Map.entry("15cb40f1-e2d3-5754-9e7b-e8888fe78340", Set.of("15cb40f1-e2d3-5754-9e7b-e8888fe78340")),
            Map.entry("161502b8-e52d-58d0-8f01-9f777b56d392", Set.of("161502b8-e52d-58d0-8f01-9f777b56d392")),
            Map.entry("1659e056-c7ac-553d-b4d6-467cc5688dd1", Set.of("1659e056-c7ac-553d-b4d6-467cc5688dd1")),
            Map.entry("16caf92e-2800-57d1-946c-5b92ce848a96", Set.of("16caf92e-2800-57d1-946c-5b92ce848a96")),
            Map.entry("18058384-a1bc-5ba2-8f5d-1fe9498acbf0", Set.of("18058384-a1bc-5ba2-8f5d-1fe9498acbf0")),
            Map.entry("1ab5f599-0927-579d-94cc-feecdf3b5603", Set.of("1ab5f599-0927-579d-94cc-feecdf3b5603")),
            Map.entry("1b432223-3d59-5586-86a9-2214b4844101", Set.of("1b432223-3d59-5586-86a9-2214b4844101")),
            Map.entry("22561c66-3957-5d55-b07a-25de1f359930", Set.of("22561c66-3957-5d55-b07a-25de1f359930")),
            Map.entry("22bdd29e-00d3-5d43-97d6-8b442b8bfc8c", Set.of("22bdd29e-00d3-5d43-97d6-8b442b8bfc8c")),
            Map.entry("23530be9-66b6-57d7-9ff8-0c55dd5b1295", Set.of("23530be9-66b6-57d7-9ff8-0c55dd5b1295")),
            Map.entry("264dc31c-ec92-5e39-a8b8-16f1d74366d4", Set.of("264dc31c-ec92-5e39-a8b8-16f1d74366d4")),
            Map.entry("26c1e946-e858-57ef-a19b-d6bb295c76f4", Set.of("26c1e946-e858-57ef-a19b-d6bb295c76f4")),
            Map.entry("2825b528-00ee-52d0-870e-686890cb1195", Set.of("2825b528-00ee-52d0-870e-686890cb1195")),
            Map.entry("2973da95-2cfc-5817-9c99-3c0c82777369", Set.of("2973da95-2cfc-5817-9c99-3c0c82777369")),
            Map.entry("2b9e565f-d9b4-5e23-b5b7-b7977cecff06", Set.of("2b9e565f-d9b4-5e23-b5b7-b7977cecff06")),
            Map.entry("2c195204-2e21-5369-8782-7bf4fc41bf9f", Set.of("2c195204-2e21-5369-8782-7bf4fc41bf9f")),
            Map.entry("2c3f9ee1-fe78-5583-8eb1-fa6369b95905", Set.of("2c3f9ee1-fe78-5583-8eb1-fa6369b95905")),
            Map.entry("320732e8-1c44-5fa4-9a47-972243cfc32a", Set.of("422dcfaa-b082-57f0-a987-eec83a63937e", "5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7", "99954602-819d-57f3-9c09-737e69f162df", "cf892388-6cb4-5981-adf2-7168aeb948b1")),
            Map.entry("32b896b9-f2f1-4d4e-96ad-e869ac3d3759", Set.of("32b896b9-f2f1-4d4e-96ad-e869ac3d3759")),
            Map.entry("330808f6-789a-583d-86df-e271a7683d8b", Set.of("330808f6-789a-583d-86df-e271a7683d8b")),
            Map.entry("341ec911-6624-529c-8799-b5a5113ee907", Set.of("341ec911-6624-529c-8799-b5a5113ee907")),
            Map.entry("3631c8f7-ff48-57ff-b7ee-8397ff1d166a", Set.of("3631c8f7-ff48-57ff-b7ee-8397ff1d166a")),
            Map.entry("36d5b915-1cb8-5a05-b64a-5f9497a33d1f", Set.of("36d5b915-1cb8-5a05-b64a-5f9497a33d1f")),
            Map.entry("38e0ff49-f132-44c8-b17a-73dada5344db", Set.of("38e0ff49-f132-44c8-b17a-73dada5344db")),
            Map.entry("39ef1e8a-9203-5192-8c76-8e0c3322646f", Set.of("39ef1e8a-9203-5192-8c76-8e0c3322646f")),
            Map.entry("3aaac6ad-948e-502a-9d49-ce40db0f2ca3", Set.of("3aaac6ad-948e-502a-9d49-ce40db0f2ca3")),
            Map.entry("41872413-497e-5b88-ac65-365ed7d9851f", Set.of("41872413-497e-5b88-ac65-365ed7d9851f")),
            Map.entry("422dcfaa-b082-57f0-a987-eec83a63937e", Set.of("422dcfaa-b082-57f0-a987-eec83a63937e")),
            Map.entry("43adaa0b-1f37-5d55-a496-6900555274a1", Set.of("43adaa0b-1f37-5d55-a496-6900555274a1")),
            Map.entry("47dc2c52-b776-5694-9715-ae98c7c23f85", Set.of("09e058e9-f3ed-5046-b0e9-495b694bf2a1", "0b08aed8-3c0f-5b38-844c-1bb363abbf68", "2825b528-00ee-52d0-870e-686890cb1195", "39ef1e8a-9203-5192-8c76-8e0c3322646f", "3aaac6ad-948e-502a-9d49-ce40db0f2ca3", "41872413-497e-5b88-ac65-365ed7d9851f", "6d882aac-9658-5f0d-bf3d-9338f0143bbc", "84ddb244-e560-592f-9d43-e84c801fe5b4", "8ac61062-f63e-5935-96ae-84014906c368", "8cdef591-6ddb-5151-8c74-a80be0271079", "8fbae050-c5c9-52b6-9983-2c366e9c8ade", "8fe0ebf1-8256-53d2-9b01-fdb945e57a59", "9678afc1-44ca-54fb-b280-29336d45a928", "bdaa56ad-6257-58a3-a633-8a6339f72f09", "c2e0fc31-27a2-5727-9025-a824db9150d2", "ce14a7e7-7e2a-517f-a465-78ba3fbe414d", "d1306bda-35ff-53e9-9458-3cbc128874d8", "db47ac91-7bb0-5ba3-b39d-e2d6fc98396e", "e19fccd7-6a35-5c9e-86e1-dcca76481e9c", "f06c581a-7157-584e-a692-99bcd613cff9")),
            Map.entry("4a58df57-f791-502f-8b8d-9ba155e46035", Set.of("4a58df57-f791-502f-8b8d-9ba155e46035")),
            Map.entry("4daef009-6425-526a-8574-4fa75f28f946", Set.of("4daef009-6425-526a-8574-4fa75f28f946")),
            Map.entry("4e046c1c-bcc7-5e3c-9f71-f80d69027483", Set.of("4e046c1c-bcc7-5e3c-9f71-f80d69027483")),
            Map.entry("50328a4f-91e8-5c8b-8d61-8f9c98a5cddf", Set.of("50328a4f-91e8-5c8b-8d61-8f9c98a5cddf")),
            Map.entry("5733c2c5-be2d-5879-89db-4ed4e5f3eff3", Set.of("5733c2c5-be2d-5879-89db-4ed4e5f3eff3")),
            Map.entry("5773ccbe-cd20-5ba0-99a5-7ccd5f42be51", Set.of("5773ccbe-cd20-5ba0-99a5-7ccd5f42be51")),
            Map.entry("58c4b989-5cd0-5bf2-99d1-a0163fc837a1", Set.of("58c4b989-5cd0-5bf2-99d1-a0163fc837a1")),
            Map.entry("5a5bc118-4420-5bb7-94c3-67837f2ce0dd", Set.of("5a5bc118-4420-5bb7-94c3-67837f2ce0dd")),
            Map.entry("5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7", Set.of("5c6d2ec8-d692-5ad2-a72a-8a9e5544a6c7")),
            Map.entry("5e64eacd-5204-5028-af23-02a43377c56e", Set.of("5e64eacd-5204-5028-af23-02a43377c56e")),
            Map.entry("5f289cdc-fda1-4058-b44f-041ba1398e79", Set.of("5f289cdc-fda1-4058-b44f-041ba1398e79")),
            Map.entry("5fda8623-69e0-5503-9c6d-86d054a8cf91", Set.of("5fda8623-69e0-5503-9c6d-86d054a8cf91")),
            Map.entry("616ac6cf-901b-509a-8cbb-bd422ddecf05", Set.of("616ac6cf-901b-509a-8cbb-bd422ddecf05")),
            Map.entry("66100588-17bb-58c6-91dd-2349c880dd87", Set.of("66100588-17bb-58c6-91dd-2349c880dd87")),
            Map.entry("6ba2e47f-7e88-5d30-8f1a-3f4b4f785ca1", Set.of("6ba2e47f-7e88-5d30-8f1a-3f4b4f785ca1")),
            Map.entry("6c9d0ef3-c82f-534f-8024-6b0efcb88276", Set.of("6c9d0ef3-c82f-534f-8024-6b0efcb88276")),
            Map.entry("6d18104b-5704-5c45-b39a-2c84565b1796", Set.of("6d18104b-5704-5c45-b39a-2c84565b1796")),
            Map.entry("6d25344c-35d7-5853-925d-2bccbaf50630", Set.of("6d25344c-35d7-5853-925d-2bccbaf50630")),
            Map.entry("6d882aac-9658-5f0d-bf3d-9338f0143bbc", Set.of("6d882aac-9658-5f0d-bf3d-9338f0143bbc")),
            Map.entry("6ea3fb3c-abdc-568f-ab13-97c36dc274e4", Set.of("6ea3fb3c-abdc-568f-ab13-97c36dc274e4")),
            Map.entry("706703af-b936-5e64-8fe2-ab1128feaf49", Set.of("706703af-b936-5e64-8fe2-ab1128feaf49")),
            Map.entry("71b51afd-c71b-506f-8128-d6de36b509d1", Set.of("71b51afd-c71b-506f-8128-d6de36b509d1")),
            Map.entry("72649cf5-893c-5f03-88bd-a2497171d434", Set.of("72649cf5-893c-5f03-88bd-a2497171d434")),
            Map.entry("72ee642f-7574-517e-abd6-17d699b05af6", Set.of("72ee642f-7574-517e-abd6-17d699b05af6")),
            Map.entry("72effc66-87f4-5f5e-8d36-1547677365fb", Set.of("72effc66-87f4-5f5e-8d36-1547677365fb")),
            Map.entry("741774ef-15fc-4bcf-a370-e2c5cf4257d0", Set.of("741774ef-15fc-4bcf-a370-e2c5cf4257d0")),
            Map.entry("74a74132-fa39-541c-8d3c-696cf228452d", Set.of("74a74132-fa39-541c-8d3c-696cf228452d")),
            Map.entry("77257ded-ccf0-521f-8a8c-38c8f85fd3ca", Set.of("77257ded-ccf0-521f-8a8c-38c8f85fd3ca")),
            Map.entry("783c1ffe-d983-5c5a-8897-2c88fc64147c", Set.of("783c1ffe-d983-5c5a-8897-2c88fc64147c")),
            Map.entry("78cf6eff-b3bc-5444-9ef8-5d39dae8d17d", Set.of("78cf6eff-b3bc-5444-9ef8-5d39dae8d17d")),
            Map.entry("7982cd8e-2151-59e7-858d-c1361c5d249e", Set.of("7982cd8e-2151-59e7-858d-c1361c5d249e")),
            Map.entry("7be8cb95-7174-5beb-94c5-c0e7bb9b1836", Set.of("7be8cb95-7174-5beb-94c5-c0e7bb9b1836")),
            Map.entry("7c0b94b9-2af7-59d4-bfae-278a3418f6a8", Set.of("7c0b94b9-2af7-59d4-bfae-278a3418f6a8")),
            Map.entry("7cb0e5a0-c4ef-5e24-82b6-d8f85ffded8d", Set.of("7cb0e5a0-c4ef-5e24-82b6-d8f85ffded8d")),
            Map.entry("7e0308d8-a239-5c0f-b2c0-724f21e4da60", Set.of("7e0308d8-a239-5c0f-b2c0-724f21e4da60")),
            Map.entry("7f83e25c-38f7-5ac2-8f9c-ec54eeef1026", Set.of("7f83e25c-38f7-5ac2-8f9c-ec54eeef1026")),
            Map.entry("81c0d811-e6de-5489-8415-3b257c734a2e", Set.of("81c0d811-e6de-5489-8415-3b257c734a2e")),
            Map.entry("82feb329-c3bc-58ba-a5b0-6ccdf226dbeb", Set.of("82feb329-c3bc-58ba-a5b0-6ccdf226dbeb")),
            Map.entry("8320bb17-e6ab-50ea-a965-aa331bfd33e1", Set.of("8320bb17-e6ab-50ea-a965-aa331bfd33e1")),
            Map.entry("841edfdb-5e12-5a37-ab12-552a1d8e92ca", Set.of("841edfdb-5e12-5a37-ab12-552a1d8e92ca")),
            Map.entry("84ddb244-e560-592f-9d43-e84c801fe5b4", Set.of("84ddb244-e560-592f-9d43-e84c801fe5b4")),
            Map.entry("86015397-23c4-5ed7-b893-bc619ec961a8", Set.of("86015397-23c4-5ed7-b893-bc619ec961a8")),
            Map.entry("879491c0-7153-570b-91f4-c61d9fe8a143", Set.of("879491c0-7153-570b-91f4-c61d9fe8a143")),
            Map.entry("88d07c80-5d7d-5c70-b385-b22769381e44", Set.of("88d07c80-5d7d-5c70-b385-b22769381e44")),
            Map.entry("899481ae-2917-5fb0-805e-29e7c3c051be", Set.of("899481ae-2917-5fb0-805e-29e7c3c051be")),
            Map.entry("89cadf81-143b-5f6b-82bd-29ba20d92a1b", Set.of("89cadf81-143b-5f6b-82bd-29ba20d92a1b")),
            Map.entry("8a1d4093-9832-5010-b1ca-9d32d8c05afa", Set.of("8a1d4093-9832-5010-b1ca-9d32d8c05afa")),
            Map.entry("8ac61062-f63e-5935-96ae-84014906c368", Set.of("8ac61062-f63e-5935-96ae-84014906c368")),
            Map.entry("8cdef591-6ddb-5151-8c74-a80be0271079", Set.of("8cdef591-6ddb-5151-8c74-a80be0271079")),
            Map.entry("8fbae050-c5c9-52b6-9983-2c366e9c8ade", Set.of("8fbae050-c5c9-52b6-9983-2c366e9c8ade")),
            Map.entry("8fe0ebf1-8256-53d2-9b01-fdb945e57a59", Set.of("8fe0ebf1-8256-53d2-9b01-fdb945e57a59")),
            Map.entry("8ff2a728-fba3-538e-83e9-69bdd8e1369e", Set.of("8ff2a728-fba3-538e-83e9-69bdd8e1369e")),
            Map.entry("91b20476-12cf-50d6-880a-ea509ffe8a9a", Set.of("91b20476-12cf-50d6-880a-ea509ffe8a9a")),
            Map.entry("92d8f398-0c9f-523c-88d7-44165b6b4768", Set.of("92d8f398-0c9f-523c-88d7-44165b6b4768")),
            Map.entry("93cdaa49-88e8-5e26-8506-656366d9ce3c", Set.of("93cdaa49-88e8-5e26-8506-656366d9ce3c")),
            Map.entry("9678afc1-44ca-54fb-b280-29336d45a928", Set.of("9678afc1-44ca-54fb-b280-29336d45a928")),
            Map.entry("99954602-819d-57f3-9c09-737e69f162df", Set.of("99954602-819d-57f3-9c09-737e69f162df")),
            Map.entry("a77e53d5-246d-52df-86a2-d14f7a08fb77", Set.of("a77e53d5-246d-52df-86a2-d14f7a08fb77")),
            Map.entry("a844895e-2cdc-4665-aad2-a49c62f11759", Set.of("a844895e-2cdc-4665-aad2-a49c62f11759")),
            Map.entry("a94f9b05-ecb1-5a13-8364-44c1c98be8e4", Set.of("a94f9b05-ecb1-5a13-8364-44c1c98be8e4")),
            Map.entry("a9562b05-c54d-5635-9244-3f7dd24a8642", Set.of("a9562b05-c54d-5635-9244-3f7dd24a8642")),
            Map.entry("ab2b9c0f-db98-5d20-adee-e46eafe037b4", Set.of("ab2b9c0f-db98-5d20-adee-e46eafe037b4")),
            Map.entry("abe032d3-97dd-5eaf-964e-0439cea27ac2", Set.of("26c1e946-e858-57ef-a19b-d6bb295c76f4", "706703af-b936-5e64-8fe2-ab1128feaf49", "d82ac375-2aa8-578a-893a-025e0a27e60f", "d8a08f79-befc-5a29-9b74-6481d40c02c3")),
            Map.entry("acf192a8-c398-51dc-a03b-672ab55df957", Set.of("acf192a8-c398-51dc-a03b-672ab55df957")),
            Map.entry("ad62f563-4fee-5399-8d9c-03a214658aa9", Set.of("ad62f563-4fee-5399-8d9c-03a214658aa9")),
            Map.entry("af1c3116-5b55-55f5-86da-8c2cfe2c550c", Set.of("af1c3116-5b55-55f5-86da-8c2cfe2c550c")),
            Map.entry("b15f3e47-6051-5382-aa86-1e4f09e245d5", Set.of("b15f3e47-6051-5382-aa86-1e4f09e245d5")),
            Map.entry("b378c8b3-5e83-5abf-8243-b0f345037bfc", Set.of("b378c8b3-5e83-5abf-8243-b0f345037bfc")),
            Map.entry("b585ff81-6332-5d11-ae63-ee6a9928c00d", Set.of("b585ff81-6332-5d11-ae63-ee6a9928c00d")),
            Map.entry("b9fcbad4-a855-54b7-8017-4caac1e2ffb7", Set.of("b9fcbad4-a855-54b7-8017-4caac1e2ffb7")),
            Map.entry("bdaa56ad-6257-58a3-a633-8a6339f72f09", Set.of("bdaa56ad-6257-58a3-a633-8a6339f72f09")),
            Map.entry("be6d4895-65ab-545b-8df9-84e5a308a5e3", Set.of("be6d4895-65ab-545b-8df9-84e5a308a5e3")),
            Map.entry("c2e0fc31-27a2-5727-9025-a824db9150d2", Set.of("c2e0fc31-27a2-5727-9025-a824db9150d2")),
            Map.entry("c3c24489-4907-585f-8b56-2cb069aa6bf2", Set.of("c3c24489-4907-585f-8b56-2cb069aa6bf2")),
            Map.entry("ce14a7e7-7e2a-517f-a465-78ba3fbe414d", Set.of("ce14a7e7-7e2a-517f-a465-78ba3fbe414d")),
            Map.entry("ce431132-dfc4-42c2-aff6-bd72035190f8", Set.of("ce431132-dfc4-42c2-aff6-bd72035190f8")),
            Map.entry("cf892388-6cb4-5981-adf2-7168aeb948b1", Set.of("cf892388-6cb4-5981-adf2-7168aeb948b1")),
            Map.entry("d0eb16e9-9a52-5237-baca-ad5a14a4c59b", Set.of("d0eb16e9-9a52-5237-baca-ad5a14a4c59b")),
            Map.entry("d1306bda-35ff-53e9-9458-3cbc128874d8", Set.of("d1306bda-35ff-53e9-9458-3cbc128874d8")),
            Map.entry("d304cfd0-f87c-51f7-8dee-f5f405da4b3d", Set.of("d304cfd0-f87c-51f7-8dee-f5f405da4b3d")),
            Map.entry("d350cfa7-c606-501e-abf7-1c9e546b266b", Set.of("d350cfa7-c606-501e-abf7-1c9e546b266b")),
            Map.entry("d441ee2f-9230-5751-832b-5b0b5cf14605", Set.of("d441ee2f-9230-5751-832b-5b0b5cf14605")),
            Map.entry("d67502e3-5e0a-595b-a24b-65b1c40de36e", Set.of("d67502e3-5e0a-595b-a24b-65b1c40de36e")),
            Map.entry("d6dc0e02-831d-4894-a61a-852bcc74f147", Set.of("d6dc0e02-831d-4894-a61a-852bcc74f147")),
            Map.entry("d81576e9-0320-5a90-8a1d-cd824981f2f6", Set.of("d81576e9-0320-5a90-8a1d-cd824981f2f6")),
            Map.entry("d82ac375-2aa8-578a-893a-025e0a27e60f", Set.of("d82ac375-2aa8-578a-893a-025e0a27e60f")),
            Map.entry("d8442d03-8b7e-54b7-9d9a-dc31ce541daa", Set.of("d8442d03-8b7e-54b7-9d9a-dc31ce541daa")),
            Map.entry("d8a08f79-befc-5a29-9b74-6481d40c02c3", Set.of("d8a08f79-befc-5a29-9b74-6481d40c02c3")),
            Map.entry("da3169ae-c72a-5782-ad95-408167a5c6da", Set.of("da3169ae-c72a-5782-ad95-408167a5c6da")),
            Map.entry("db47ac91-7bb0-5ba3-b39d-e2d6fc98396e", Set.of("db47ac91-7bb0-5ba3-b39d-e2d6fc98396e")),
            Map.entry("dd99528a-bae5-5b78-89e6-c6092c927f8d", Set.of("dd99528a-bae5-5b78-89e6-c6092c927f8d")),
            Map.entry("e11b2ee9-e528-4857-9ecd-59bd460fba81", Set.of("e11b2ee9-e528-4857-9ecd-59bd460fba81")),
            Map.entry("e19fccd7-6a35-5c9e-86e1-dcca76481e9c", Set.of("e19fccd7-6a35-5c9e-86e1-dcca76481e9c")),
            Map.entry("e359f8bb-6106-44aa-9edf-694528d2d2a9", Set.of("e359f8bb-6106-44aa-9edf-694528d2d2a9")),
            Map.entry("e5c08365-a0d3-592c-ad8e-d2c2c6e2b717", Set.of("e5c08365-a0d3-592c-ad8e-d2c2c6e2b717")),
            Map.entry("e73de7c5-5f09-5e84-8a95-8d764b422ec3", Set.of("e73de7c5-5f09-5e84-8a95-8d764b422ec3")),
            Map.entry("ed3a6f6b-2ca3-51c2-8f00-58e11eb02401", Set.of("5733c2c5-be2d-5879-89db-4ed4e5f3eff3", "86015397-23c4-5ed7-b893-bc619ec961a8", "e73de7c5-5f09-5e84-8a95-8d764b422ec3", "fa333c2f-3150-5831-a649-28615164b2f2")),
            Map.entry("ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a", Set.of("ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a")),
            Map.entry("f06c581a-7157-584e-a692-99bcd613cff9", Set.of("f06c581a-7157-584e-a692-99bcd613cff9")),
            Map.entry("f4eac786-a8e1-5f23-aedf-17bc70fc347f", Set.of("58c4b989-5cd0-5bf2-99d1-a0163fc837a1", "66100588-17bb-58c6-91dd-2349c880dd87", "7be8cb95-7174-5beb-94c5-c0e7bb9b1836", "c3c24489-4907-585f-8b56-2cb069aa6bf2")),
            Map.entry("f532c772-7b6e-59aa-ad65-e0eeafc3767f", Set.of("f532c772-7b6e-59aa-ad65-e0eeafc3767f")),
            Map.entry("fa333c2f-3150-5831-a649-28615164b2f2", Set.of("fa333c2f-3150-5831-a649-28615164b2f2")));
    private static final String GERMAN_ATOM = "2fb368b0-7b9d-5df0-99b6-6d719fd47f95";
    private static final String GERMAN_CLUSTER = "53462f11-c368-51df-bb68-c36a83d761b1";
    private static final String GERMAN_OTHER = "bb3dee7b-d6d3-513b-8824-bdf6414e02df";
    private static final String GERMAN_LEAF = "2122b969-61e9-412f-9e97-8777c606d27a";
    private static final String GERMAN_LEAF_PREREQUISITE = "eff86a92-e048-5494-b561-6ecdda1fbf67";
    private static final List<String> GERMAN_LEAVES = List.of(
            "001b6ae3-207a-400d-852d-2c4068df8d2f", "17164008-3c30-4d22-8f2b-bf2e5a79f9de", GERMAN_LEAF,
            "263b9af0-c584-4364-a35f-6dfccd7aaf21", "6904ca70-3f22-41eb-bc9c-9896bf7bb1e9",
            "70f5f3c6-f0e9-4bd7-8095-a20be459975c", "d4642285-5b73-4541-a088-6c1e77b37637",
            "ead22176-e8f4-45b6-8a3d-e04661f3c3e4", "f0c354f9-6f7a-494a-8f64-675bf1b42f5e",
            "fb8f990d-224f-4277-92a1-13bee8f7f8a4");
    private static final Set<String> GERMAN_TARGET_SCOPES = Set.of("DE-HE/CrossStage/G9/LK",
            "DE-HE/SekII/G8/GK", "DE-HE/SekII/G8/GK+LK", "DE-HE/SekII/G8/LK",
            "DE-HE/SekII/G9/GK", "DE-HE/SekII/G9/GK+LK", "DE-HE/SekII/G9/LK");
    private static final String BIOLOGY_ORIENTATION = "2d451684-6e53-565e-a987-f362da919d2c";
    private static final String LATIN_CLUSTER = "e82cc731-ebf4-588f-9fea-f0d31f7ad0e7";
    private static final String LATIN_ATOM = "bd6b8f87-f9b5-54ad-828e-e1c36c1d4d82";
    private static final String LATIN_BRIDGE = "1476af3f-0ff9-59c0-8a1a-e81dfc011ae2";
    private static final String LATIN_ORIENTATION = "551f2d6c-a030-57cc-9dbd-af30b2c3972a";
    private static final String EXCLUDED_NAVIGATION_CLUSTER = "d11b3b18-deec-5d1a-bff6-512cddf595a2";
    private static final String SOURCE = "bf17cada-3ccd-5d9a-b9e3-42065cfdbb01";
    private static final String RETAINED = "91e2f564-3bc8-4924-af85-2a3fa84c1471";
    private static final String REMOVED = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String CONTINUED_BRIDGE = "71683f37-24de-4e0f-badd-858b56fa4d64";
    private static final String V2 = "atomic-descendant-covered-cluster-reduction-v2";
    private static final String V3 = "ordered-atomic-materialization-and-cluster-reduction-v3";
    private static final String V4 = "continued-atomic-prerequisite-reduction-v4";
    private static final String V5 = "atomic-cluster-target-normalization-v5";
    private static final String V6 = "append-only-prerequisite-reduction-batches-v6";
    private static final String V7 = "prerequisite-reduction-applicability-refresh-v7";
    private static final String V8 = "assessment-basis-bound-prerequisite-reduction-v8";
    private static final Set<String> MATH_EXAMS = Set.of("464a6024-a2f8-53b4-84e0-d7b9df22a0b1",
            "9ad83149-3cb7-5b87-a617-3eae3715a50c");
    private static final Set<String> UNEXPOSED_CANONICAL_ATOMIC_BASES = Set.of(
            "858335d7-3336-5958-adf0-24c772091cf0", "cadc3bb3-e98d-5cda-893b-8b61811ba166");
    private static final List<String> BEFORE = List.of(RETAINED, REMOVED);
    private static final List<String> AFTER = List.of(RETAINED);
    private static final List<String> SUBJECTS = List.of(MATH,
            BIOLOGY, "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", "605bdaf6-32d5-56fd-8d92-5a80c2fd2901",
            "67bd301b-e11a-582d-94ba-4f4b1a4cefff", "92406d94-e3c1-58ec-b7c6-12122278d25a",
            "7d51b38c-a149-5407-bddc-d2ce7878b020", LATIN,
            "51b60137-46e8-5498-973e-ea38bb32f327");
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path MATH_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
    private static final Path BIOLOGY_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json");
    private static final Path LATIN_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json");
    private static final Path GERMAN_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json");
    private static final Path PHYSICS_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json");
    private static final Path REDUCTION_REGISTRY = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static Path findRepositoryRoot() {
        Path start = Path.of("").toAbsolutePath().normalize();
        for (Path candidate = start; candidate != null; candidate = candidate.getParent()) {
            if (Files.isDirectory(candidate.resolve("curricula"))
                    && Files.isDirectory(candidate.resolve("app/src/generated"))
                    && Files.isDirectory(candidate.resolve("backend"))) {
                return candidate;
            }
        }
        throw new IllegalStateException("Cannot locate SkillPilot repository root from " + start);
    }

    /** Bounded projection-model regression without enumerating the live curriculum scopes. */
    @Test
    void rawRegistryFramesRejectMissingOverlaysBadDigestsAndRequiresPresenceChanges() throws Exception {
        JsonNode declared = readNativeRegistryDeclaration();
        JsonNode active = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        JsonNode cacheDeclaration = active;
        if (V8.equals(active.path("proofContract").asText())) {
            NativeBasisBoundFrame frame = readBasisBoundFrame(active, Map.of());
            cacheDeclaration = frame.registry();
            ObjectNode badParentDigest = active.deepCopy();
            badParentDigest.put("parentRegistryRawDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readBasisBoundFrame(badParentDigest, Map.of())).isInstanceOf(AssertionError.class);
            ObjectNode missingBasis = active.deepCopy();
            ((com.fasterxml.jackson.databind.node.ArrayNode) missingBasis.path("entries").get(0).path("basisBindings")).remove(0);
            assertThatThrownBy(() -> readBasisBoundFrame(missingBasis, Map.of())).isInstanceOf(AssertionError.class);
            ObjectNode duplicateBasis = active.deepCopy();
            var basisBindings = (com.fasterxml.jackson.databind.node.ArrayNode) duplicateBasis.path("entries").get(0).path("basisBindings");
            basisBindings.add(basisBindings.get(0).deepCopy());
            assertThatThrownBy(() -> readBasisBoundFrame(duplicateBasis, Map.of())).isInstanceOf(AssertionError.class);
            ObjectNode wrongStart = active.deepCopy();
            String source = active.path("entries").get(0).path("basisBindings").get(0).path("source").asText();
            for (JsonNode snapshot : wrongStart.path("entries").get(0).path("batch").path("originalRequires"))
                if (source.equals(snapshot.path("source").asText())) ((ObjectNode) snapshot).set("requires", MAPPER.createArrayNode());
            assertThatThrownBy(() -> readBasisBoundFrame(wrongStart, Map.of())).isInstanceOf(AssertionError.class);
            ObjectNode missingStart = active.deepCopy();
            ((com.fasterxml.jackson.databind.node.ArrayNode) missingStart.path("entries").get(0).path("batch").path("originalRequires")).remove(0);
            assertThatThrownBy(() -> readBasisBoundFrame(missingStart, Map.of())).isInstanceOf(AssertionError.class);
            ObjectNode wrongPredecessor = active.deepCopy();
            ((ObjectNode) wrongPredecessor.path("entries").get(0).path("batch")).put("previousDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readBasisBoundFrame(wrongPredecessor, Map.of())).isInstanceOf(AssertionError.class);
            Map<Path, JsonNode> changedMetadata = mutableDocuments(frame.currentDocuments());
            ((ObjectNode) registeredGoal(frameGoals(changedMetadata), source).path("extendedData")).put("unapprovedNativeFixtureField", true);
            ObjectNode reboundEnd = active.deepCopy();
            for (JsonNode binding : reboundEnd.path("catalogSources")) {
                Path file = REPOSITORY.resolve(binding.path("path").asText());
                ((ObjectNode) binding).put("currentDocumentDigest", documentHash(changedMetadata.get(file)));
            }
            for (JsonNode binding : reboundEnd.path("entries").get(reboundEnd.path("entries").size() - 1)
                    .path("batch").path("currentDocumentDigests")) {
                Path file = REPOSITORY.resolve(binding.path("path").asText());
                ((ObjectNode) binding).put("currentDocumentDigest", documentHash(changedMetadata.get(file)));
            }
            assertThatThrownBy(() -> readBasisBoundFrame(reboundEnd, changedMetadata)).isInstanceOf(AssertionError.class);
            assertThat(frame.currentDocuments()).as("negative overlays do not mutate the exact final V8 frame")
                    .isEqualTo(readBasisBoundFrame(active, Map.of()).currentDocuments());
        }
        if (V7.equals(cacheDeclaration.path("proofContract").asText())) {
            ObjectNode badParentDigest = cacheDeclaration.deepCopy();
            badParentDigest.put("parentRegistryRawDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badParentDigest)).isInstanceOf(AssertionError.class);
            ObjectNode missingCacheSnapshot = cacheDeclaration.deepCopy();
            ((com.fasterxml.jackson.databind.node.ArrayNode) missingCacheSnapshot.path("originalApplicability")).remove(0);
            assertThatThrownBy(() -> readReductionRegistry(missingCacheSnapshot)).isInstanceOf(AssertionError.class);
            ObjectNode wrongCachePresence = cacheDeclaration.deepCopy();
            ((ObjectNode) wrongCachePresence.path("originalApplicability").get(0)).put("present", false).putNull("value");
            assertThatThrownBy(() -> readReductionRegistry(wrongCachePresence)).isInstanceOf(AssertionError.class);
        }
        assertThat(declared.path("proofContract").asText()).as("certified V5 or V6 with independently reconstructed V5 prefix").isIn(V5, V6);
        ReductionRegistry registry = readReductionRegistry(declared);
        JsonNode current = readFrameDocument(MATH_SOURCE, registry.currentDocuments());
        List<ChangedSource> changes = registry.changesByFile().get(MATH_SOURCE);
        ChangedSource atom = changes.stream().filter(changed -> registry.suffixSourceIds().contains(changed.goalId())
                && changed.atomicSource()).findFirst().orElseThrow();
        assertThat(atom.originalRequires()).isEmpty();
        assertThat(atom.originalRequiresPresent()).isTrue();
        assertThat(atom.currentRequires()).containsExactly(REMOVED);
        JsonNode before = reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE), changes, true);
        JsonNode beforeAtom = rawGoals(before).get(atom.goalId());
        assertThat(beforeAtom.has("requires")).isTrue();
        assertThat(beforeAtom.path("requires")).isEmpty();

        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().filter(changed -> !changed.goalId().equals(atom.goalId())).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH,
                new DocumentDigests("sha256:" + "0".repeat(64), registry.documentDigests().get(MATH_SOURCE).current()), changes, true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().map(changed -> changed.goalId().equals(atom.goalId()) ? changed.withOriginalPresence(false) : changed).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        JsonNode absentArray = beforeAtom.deepCopy();
        ((ObjectNode) absentArray).remove("requires");
        var compiler = new CompletionProfileCompiler();
        assertThat(compiler.normalizePrerequisites(Map.of(atom.goalId(), MAPPER.treeToValue(absentArray, LearningGoal.class)))
                .transitivePrerequisites(atom.goalId())).isEmpty();
        assertThat(compiler.normalizePrerequisites(Map.of(atom.goalId(), MAPPER.treeToValue(beforeAtom, LearningGoal.class)))
                .transitivePrerequisites(atom.goalId())).isEmpty();
        assertThat(absentArray.has("requires")).isFalse();

        ObjectNode missing = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missing.path("suffixOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missing)).isInstanceOf(AssertionError.class);
        ObjectNode missingTail = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingTail.path("tailOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingTail)).isInstanceOf(AssertionError.class);
        ObjectNode extraTail = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) extraTail.path("tailOriginalRequires"))
                .add(extraTail.path("tailOriginalRequires").get(0).deepCopy());
        assertThatThrownBy(() -> readReductionRegistry(extraTail)).isInstanceOf(AssertionError.class);
        ChangedSource tail = changes.stream().filter(changed -> registry.tailSourceIds().contains(changed.goalId()))
                .findFirst().orElseThrow();
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().filter(changed -> !changed.goalId().equals(tail.goalId())).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().map(changed -> changed.goalId().equals(tail.goalId())
                        ? changed.withOriginalPresence(!changed.originalRequiresPresent()) : changed).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        JsonNode missingCurrentTail = current.deepCopy();
        ((ObjectNode) rawGoals(missingCurrentTail).get(tail.goalId())).remove("requires");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, missingCurrentTail, MATH,
                registry.documentDigests().get(MATH_SOURCE), changes, false))
                .isInstanceOf(AssertionError.class).hasMessageContaining("current raw document");
        ObjectNode missingClusterTargetOverlay = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingClusterTargetOverlay.path("clusterTargetOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingClusterTargetOverlay)).isInstanceOf(AssertionError.class);
        ObjectNode nullClusterTargetOverlay = declared.deepCopy();
        ((ObjectNode) nullClusterTargetOverlay.path("clusterTargetOriginalRequires").get(0)).putNull("requires");
        assertThatThrownBy(() -> readReductionRegistry(nullClusterTargetOverlay)).isInstanceOf(AssertionError.class);
        ObjectNode missingClusterTargetStep = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingClusterTargetStep.path("clusterTargetSuffix")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingClusterTargetStep)).isInstanceOf(AssertionError.class);
        ObjectNode reorderedClusterTargetSteps = declared.deepCopy();
        var clusterTargetSteps = (com.fasterxml.jackson.databind.node.ArrayNode) reorderedClusterTargetSteps.path("clusterTargetSuffix");
        JsonNode firstStep = clusterTargetSteps.get(0).deepCopy();
        clusterTargetSteps.set(0, clusterTargetSteps.get(10).deepCopy());
        clusterTargetSteps.set(10, firstStep);
        assertThatThrownBy(() -> readReductionRegistry(reorderedClusterTargetSteps)).isInstanceOf(AssertionError.class);
        ObjectNode badV4Checkpoint = declared.deepCopy();
        ((ObjectNode) badV4Checkpoint.path("v4Checkpoint")).put("registryDigest", "sha256:" + "0".repeat(64));
        assertThatThrownBy(() -> readReductionRegistry(badV4Checkpoint)).isInstanceOf(AssertionError.class);
        JsonNode germanCurrent = readFrameDocument(GERMAN_SOURCE, registry.currentDocuments());
        List<ChangedSource> germanChanges = registry.changesByFile().get(GERMAN_SOURCE);
        assertThat(germanChanges).hasSize(1);
        assertThatThrownBy(() -> reconstructRawDocument(GERMAN_SOURCE, germanCurrent, GERMAN,
                registry.documentDigests().get(GERMAN_SOURCE), List.of(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(GERMAN_SOURCE, germanCurrent, GERMAN,
                registry.documentDigests().get(GERMAN_SOURCE), List.of(germanChanges.getFirst().withOriginalPresence(false)), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        ObjectNode unknown = declared.deepCopy();
        unknown.put("proofContract", "unreviewed-reduction-contract");
        assertThatThrownBy(() -> readReductionRegistry(unknown)).isInstanceOf(AssertionError.class);

        if (V6.equals(declared.path("proofContract").asText())) {
            ObjectNode badV5Checkpoint = declared.deepCopy();
            ((ObjectNode) badV5Checkpoint.path("v5Checkpoint")).put("registryDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badV5Checkpoint)).isInstanceOf(AssertionError.class);
            ObjectNode missingBatchSnapshot = declared.deepCopy();
            ((com.fasterxml.jackson.databind.node.ArrayNode) missingBatchSnapshot.path("batches").get(0).path("originalRequires")).remove(0);
            assertThatThrownBy(() -> readReductionRegistry(missingBatchSnapshot)).isInstanceOf(AssertionError.class);
            ObjectNode duplicateBatchSnapshot = declared.deepCopy();
            var batchSnapshots = (com.fasterxml.jackson.databind.node.ArrayNode) duplicateBatchSnapshot.path("batches").get(0).path("originalRequires");
            batchSnapshots.add(batchSnapshots.get(0).deepCopy());
            assertThatThrownBy(() -> readReductionRegistry(duplicateBatchSnapshot)).isInstanceOf(AssertionError.class);
            ObjectNode badBatchEnd = declared.deepCopy();
            ((ObjectNode) badBatchEnd.path("batches").get(0).path("currentDocumentDigests").get(0))
                    .put("currentDocumentDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badBatchEnd)).isInstanceOf(AssertionError.class);
            ObjectNode badBatchPredecessor = declared.deepCopy();
            ((ObjectNode) badBatchPredecessor.path("batches").get(0)).put("previousDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badBatchPredecessor)).isInstanceOf(AssertionError.class);
        }

        // The same raw reconstruction helper also preserves a genuine null
        // overlay; native topology alone maps both raw forms to empty demand.
        JsonNode syntheticCurrent = MAPPER.readTree("""
                {"landscapeId":"presence-fixture","goals":[
                  {"id":"a","type":"atomic","contains":[],"requires":["b"]},
                  {"id":"b","type":"atomic","contains":[]}]}
                """);
        JsonNode syntheticBefore = syntheticCurrent.deepCopy();
        ((ObjectNode) rawGoals(syntheticBefore).get("a")).remove("requires");
        DocumentDigests syntheticDigests = new DocumentDigests(CompletionReviewBindings.canonicalHash(syntheticBefore, MAPPER),
                CompletionReviewBindings.canonicalHash(syntheticCurrent, MAPPER));
        ChangedSource absent = new ChangedSource("presence-fixture", "a", List.of(), List.of("b"), List.of(), true, false, true);
        JsonNode restored = reconstructRawDocument(Path.of("synthetic-presence.json"), syntheticCurrent,
                "presence-fixture", syntheticDigests, List.of(absent), true);
        assertThat(rawGoals(restored).get("a").has("requires")).isFalse();
        assertThat(CompletionReviewBindings.canonicalHash(restored, MAPPER)).isEqualTo(syntheticDigests.original());
        assertThat(compiler.normalizePrerequisites(Map.of("a", MAPPER.treeToValue(rawGoals(restored).get("a"), LearningGoal.class)))
                .transitivePrerequisites("a")).isEmpty();
        assertThatThrownBy(() -> reconstructRawDocument(Path.of("synthetic-presence.json"), syntheticCurrent,
                "presence-fixture", syntheticDigests, List.of(absent.withOriginalPresence(true)), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void canonicalProbeUsesClosedLearningBasisAndMissingAcquisitionTargetsFailClosed() throws Exception {
        Map<String, LearningGoal> graph = new TreeMap<>();
        for (String id : List.of("T", "K", "P", "Q")) {
            LearningGoal goal = new LearningGoal();
            goal.setId(id); goal.setType("K".equals(id) ? "cluster" : "atomic");
            goal.setContains("K".equals(id) ? List.of("P") : List.of());
            goal.setRequires("T".equals(id) ? List.of("K") : "P".equals(id) ? List.of("Q") : List.of());
            graph.put(id, goal);
        }
        var service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), mock(LandscapeService.class),
                mock(GoalMappingService.class), mock(DeckResourceService.class), MAPPER, mock(ApplicationEventPublisher.class));
        JsonNode canonicalBefore = MAPPER.valueToTree(graph);
        CanonicalProbe probe = canonicalProbe(graph, Set.of("T"));
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(probe.projection(), "learningScope");
        assertThat(learning.seedAtomicGoalIds()).containsExactly("T");
        assertThat(learning.learningAtomicGoalIds()).containsExactlyInAnyOrder("T", "P", "Q");
        assertThat(roleProbe(service, probe.graph(), probe.projection(), "T", probe.topology())).isTrue();
        Object missingTarget = withoutAcquisitionTarget(probe.projection(), "Q");
        PersonalCurriculumLearningScope broken = ReflectionTestUtils.invokeMethod(missingTarget, "learningScope");
        assertThat(broken.seedAtomicGoalIds()).isEqualTo(learning.seedAtomicGoalIds());
        assertThat(broken.learningAtomicGoalIds()).doesNotContain("Q");
        assertThat(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(missingTarget, "visibleGoals")).doesNotContainKey("Q");
        assertThat(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(missingTarget, "canonicalPrerequisiteGoals")).isSameAs(graph);
        assertThat(roleProbe(service, probe.graph(), missingTarget, "T", probe.topology())).isFalse();
        assertThat(roleProbe(service, probe.graph(), withoutNonAtomicRole(probe.projection(), "K"), "T", probe.topology())).isTrue();
        assertThat((JsonNode) MAPPER.valueToTree(graph)).isEqualTo(canonicalBefore);
        assertThat(learning.learningAtomicGoalIds()).contains("Q");
        Map<String, LearningGoal> missingDefinition = new TreeMap<>(graph);
        missingDefinition.remove("Q");
        assertThatThrownBy(() -> canonicalProbe(missingDefinition, Set.of("T")))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("MISSING_REFERENCE"));
    }

    @Test
    void currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget() throws Exception {
        ReductionRegistry registry = readActualCurrentRegistry();
        var fixture = new NativeFixture(registry, false);
        Set<String> subjects = new TreeSet<>(registry.canonicalOwners().values());
        assertThat(subjects).hasSize(21).contains(ROOT);
        subjects.remove(ROOT);
        JsonNode guiOfferings = readGuiOfferings();
        Set<String> guiSubjects = new TreeSet<>();
        guiOfferings.fieldNames().forEachRemaining(guiSubjects::add);
        assertThat(guiSubjects).containsExactlyInAnyOrderElementsOf(SUBJECTS);
        assertThat(subjects).containsAll(guiSubjects);
        Set<String> jurisdictions = new TreeSet<>();
        fixture.landscapes.getById(ROOT).getFilters().forEach(filter -> jurisdictions.add(filter.getId()));
        assertThat(jurisdictions).contains("ALL", "DE-BY", "DE-HE");
        Map<String, String> coverage = new TreeMap<>();
        Set<String> visitedSubjects = new TreeSet<>();
        var publicService = org.mockito.Mockito.spy(fixture.service);
        String learnerId = "unsaved-current-catalog-scope-control";
        for (String subject : subjects) {
            Discovery discovery = discover(fixture, subject, guiOfferings.path(subject), jurisdictions);
            int checked = 0, unavailable = 0, incomplete = 0, invalid = 0;
            for (var entry : discovery.configurations().entrySet()) {
                String key = subject + "/" + entry.getKey();
                Map<String, Map<String, Object>> config = entry.getValue();
                PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                        (id, settings) -> ReflectionTestUtils.invokeMethod(
                                fixture.service, "resolvePersonalizationOfferingScope", id, settings), config);
                String category;
                if (plan.valid() && !plan.required()) {
                    // resolve checks actual emitted targets/definitions/completion against
                    // separately selected seeds and the unpruned canonical prerequisite graph.
                    NativeScope scope = fixture.resolve(config);
                    assertThat(scope.roles().atomicTargets()).as("nonempty complete scope %s", key).isNotEmpty();
                    category = "checked";
                    checked++;
                } else {
                    assertThat(discovery.plannerScopes()).as("native completed scopes cannot become incomplete").doesNotContain(entry.getKey());
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(config));
                    org.mockito.Mockito.doReturn(learner).when(publicService).getLearner(learnerId);
                    assertThatThrownBy(() -> publicService.getPlanningScope(learnerId, subject))
                            .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class, failure -> {
                                assertThat(failure.getStatusCode().value()).isEqualTo(409);
                                assertThat(failure.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                            });
                    category = plan.valid() ? "incomplete" : "invalid:" + plan.problemCode();
                    if (plan.valid()) incomplete++; else invalid++;
                }
                assertThat(coverage.putIfAbsent(key, category)).as("one coverage outcome per actual configuration").isNull();
            }
            for (String jurisdiction : jurisdictions) {
                boolean hasConfiguration = discovery.configurations().values().stream().anyMatch(config ->
                        jurisdiction.equals(config.get(ROOT).get("filterId")));
                if (hasConfiguration) continue;
                for (var entry : discovery.offeredPlans().entrySet()) {
                    Map<String, Map<String, Object>> config = MAPPER.readValue(entry.getKey(), new TypeReference<>() { });
                    if (!jurisdiction.equals(config.get(ROOT).get("filterId"))) continue;
                    assertThat(entry.getValue().options()).as("an offered subject must have a discovered scope: %s/%s", subject, jurisdiction)
                            .noneMatch(option -> subject.equals(option.landscapeId()));
                }
                assertThat(coverage.putIfAbsent(subject + "/" + jurisdiction + "/no-offer", "not-offered")).isNull();
                unavailable++;
            }
            assertThat(checked + incomplete + invalid).isEqualTo(discovery.configurations().size());
            if (guiSubjects.contains(subject)) assertThat(checked).as("required subject has real checked scopes: %s", subject).isPositive();
            assertThat(visitedSubjects.add(subject)).isTrue();
            System.out.printf("CURRENT_NATIVE_LEARNING_SCOPE subject=%s checked=%d notOffered=%d incomplete=%d invalid=%d guiDeclared=%s%n",
                    subject, checked, unavailable, incomplete, invalid, guiSubjects.contains(subject));
        }
        assertThat(visitedSubjects).isEqualTo(subjects);
        assertThat(coverage).isNotEmpty();
        System.out.printf("CURRENT_NATIVE_LEARNING_SCOPE_COVERAGE catalogs=%d subjects=%d guiSubjects=%d classifiedRows=%d multiSubjectPowerSet=false%n",
                registry.canonicalOwners().size(), visitedSubjects.size(), guiSubjects.size(), coverage.size());
    }

    @Test
    void currentBiologyBavariaProjectionRetainsRequiredLearningAcrossJurisdictions() throws Exception {
        String assessment = "487c79f5-7e4d-5da8-ad8f-f0f96c23a974";
        String hessenPreparation = "afde0001-d7d7-5ed3-8a60-383e8da5620e";
        String bavarianPreparation = "11675f1a-5de2-5926-be78-1e8275f19f5b";
        var fixture = new NativeFixture(readActualCurrentRegistry(), false);
        byte[] sourceBefore = Files.readAllBytes(BIOLOGY_SOURCE);
        Map<String, Map<String, Object>> config = Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-BY", "stage", "CrossStage", "durationModel", "G9"),
                BIOLOGY, Map.of("selected", true, "filterId", "GK"));
        // Finish only the actual planner's outstanding group confirmations.
        // The selected country, stage, duration and subject remain fixed.
        for (int step = 0; ; step++) {
            assertThat(step).isLessThan(10);
            PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                    (id, settings) -> ReflectionTestUtils.invokeMethod(
                            fixture.service, "resolvePersonalizationOfferingScope", id, settings), config);
            assertThat(plan.valid()).isTrue();
            if (!plan.required()) break;
            PersonalizationPlan.Option option = plan.options().stream()
                    .filter(candidate -> candidate.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                    .findFirst().orElseThrow(() -> new AssertionError("Unexpected unresolved Biology selection: " + plan));
            Map<String, Object> mutable = new LinkedHashMap<>();
            config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
            ReflectionTestUtils.invokeMethod(CurriculumPersonalizationPlanner.class,
                    "recordGroupCompletion", mutable, ROOT, option);
            config = MAPPER.convertValue(mutable, new TypeReference<>() { });
        }
        NativeScope scope = fixture.resolve(config);
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(scope.projection(), "learningScope");
        assertThat(learning.seedAtomicGoalIds()).contains(assessment).doesNotContain(hessenPreparation);
        assertThat(scope.topology().transitivePrerequisites(assessment))
                .contains(hessenPreparation, bavarianPreparation);
        assertThat(scope.roles().atomicTargets()).contains(assessment, hessenPreparation, bavarianPreparation);
        assertThat(fixture.canonicalGoals.get(hessenPreparation).getApplicability().get("jurisdiction"))
                .containsExactly("DE-HE");

        String learnerId = "unsaved-biology-required-learning-control";
        scope.learner().setSkillpilotId(learnerId);
        when(fixture.learners.findById(learnerId)).thenReturn(java.util.Optional.of(scope.learner()));
        var exported = fixture.service.getLearnerLandscapeClosure(learnerId, ROOT, "de");
        Set<String> exportedTargets = new TreeSet<>(), plannedTargets = new TreeSet<>();
        for (var landscape : exported) {
            var metadata = landscape.getPersonalCurriculumProjection();
            if (metadata == null || metadata.targetGoalIds().isEmpty()) continue;
            exportedTargets.addAll(metadata.targetGoalIds());
            var plan = fixture.service.getPlanningScope(learnerId, landscape.getLandscapeId());
            plannedTargets.addAll(plan.scopeAtomicGoalIds());
        }
        assertThat(exportedTargets).isEqualTo(scope.roles().atomicTargets());
        assertThat(plannedTargets).isEqualTo(scope.roles().atomicTargets());
        assertThat(plannedTargets).contains(hessenPreparation, bavarianPreparation);

        // Keep the independently compiled L, seeds, canonical graph and full mastery intact.
        // Dropping only an emitted target or only its visible definition must fail.
        Map<String, Double> fullMastery = new TreeMap<>();
        scope.graph().keySet().forEach(id -> fullMastery.put(id, 1.0));
        for (boolean removeTarget : List.of(true, false)) {
            Object broken = withoutEmittedAcquisitionAtom(scope.projection(), hessenPreparation, removeTarget);
            assertThat(ReflectionTestUtils.<PersonalCurriculumLearningScope>invokeMethod(broken, "learningScope"))
                    .isSameAs(learning);
            assertThatThrownBy(() -> fixture.assertLearningEmission(
                    scope.learner().getPersonalCurriculum(), broken)).isInstanceOf(AssertionError.class)
                    .hasMessageContaining("APV-102");
            assertThat(roleProbe(fixture.service, scope, broken, assessment, scope.topology())).isFalse();
            Object narrowed = ReflectionTestUtils.invokeMethod(fixture.service, "frontierPrerequisites",
                    scope.learner(), broken, fullMastery, Set.of(assessment));
            assertThat(ReflectionTestUtils.<Object>invokeMethod(narrowed, "topology")).isNotNull();
            assertThat(ReflectionTestUtils.<Boolean>invokeMethod(fixture.service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(assessment), broken, narrowed)).isFalse();
        }
        verify(fixture.mastery, org.mockito.Mockito.never()).save(org.mockito.ArgumentMatchers.any(Mastery.class));
        verify(fixture.mastery, org.mockito.Mockito.never()).saveAll(org.mockito.ArgumentMatchers.any());
        assertThat(Files.readAllBytes(BIOLOGY_SOURCE)).isEqualTo(sourceBefore);
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void economicsAuthoredAtomicAbiturTargetsPreserveNativePrerequisitesAndFrontier() throws Exception {
        String economics = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
        String orientation = "6bf2d1cc-e745-50dd-a617-71c06a6c6945";
        ReductionRegistry registry = readReductionRegistry();
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : registry.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(registry, true);
        var after = new NativeFixture(registry, false);
        JsonNode offerings = readGuiOfferings().path(economics);
        Discovery original = discover(before, economics, offerings);
        Discovery reduced = discover(after, economics, offerings);
        assertThat(reduced).as("actual offered Economics configurations").isEqualTo(original);
        Map<String, String> cases = new LinkedHashMap<>();
        cases.put("DE-HE/CrossStage//GK", "d7f40fca-bdde-5a07-9c37-c892c2588177");
        cases.put("DE-HE/CrossStage//LK", "a068e975-4dae-56ba-b510-f26532d6de0b");
        assertThat(registry.changedSources()).as("both Economics Abitur sources stay outside the reduction registry")
                .doesNotContainKeys(cases.values().toArray(String[]::new));
        Map<String, List<String>> assessmentAtomsByCluster = Map.of(
                "d7f40fca-bdde-5a07-9c37-c892c2588177", List.of(
                        "916f7816-f7c9-541a-810f-000241b323ff", "1758e57b-779f-5e16-8f35-47ada351ee2b",
                        "6c58eddd-1315-524d-b87b-9102cce6a3b0"),
                "a068e975-4dae-56ba-b510-f26532d6de0b", List.of(
                        "e474c510-81b1-5c1b-af9c-2e41c02a026a", "ff93ca09-0619-569f-8120-39d22585232a",
                        "0c401ff4-6624-5662-8f92-a9893b3011d9"));
        Set<String> checkedAssessmentAtoms = new TreeSet<>();
        List<String> differences = new ArrayList<>();
        for (var entry : cases.entrySet()) {
            String configId = entry.getKey(), sourceId = entry.getValue();
            assertThat(original.configurations()).as("existing authored Economics configuration %s", configId).containsKey(configId);
            var config = original.configurations().get(configId);
            NativeScope left = before.resolve(config);
            NativeScope right = after.resolve(reduced.configurations().get(configId));
            assertThat(right.roles()).as("unchanged authored roles: %s", configId).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("unchanged actual lookup context: %s", configId).isEqualTo(left.graph().keySet());
            List<String> assessmentAtoms = assessmentAtomsByCluster.get(sourceId);
            for (NativeScope actual : List.of(left, right)) {
                assertThat(actual.roles().targets()).contains(sourceId);
                assertThat(actual.roles().atomicTargets()).containsAll(assessmentAtoms).doesNotContain(sourceId);
                assertThat(actual.graph().get(sourceId).getType()).isEqualTo("cluster");
                assertThat(actual.graph().get(sourceId).getContains()).containsExactlyElementsOf(assessmentAtoms);
                PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(actual.projection(), "learningScope");
                assertThat(learning.seedAtomicGoalIds()).containsAll(assessmentAtoms).doesNotContain(sourceId);
                assertThat(learning.learningAtomicGoalIds()).doesNotContain(sourceId);
                assertThat(actual.context()).as("actual compiled assessment atoms: %s", configId).containsAll(assessmentAtoms);
                Map<String, LearningGoal> lookup = ReflectionTestUtils.invokeMethod(actual.frontier(), "lookup");
                assertThat(lookup).as("actual production frontier lookup: %s", configId)
                        .containsKeys(assessmentAtoms.toArray(String[]::new));
                for (String atomId : assessmentAtoms) {
                    assertThat(actual.graph().get(atomId).getType()).isEqualTo("atomic");
                    assertThat(actual.graph().get(atomId).getContains()).isEmpty();
                    assertThat(actual.graph().get(atomId).getTags()).contains("Assessment", "Abitur");
                }
            }
            assertThat(before.canonicalGoals.get(sourceId).getContains()).containsExactlyElementsOf(assessmentAtoms);
            assertThat(after.canonicalGoals.get(sourceId).getContains()).containsExactlyElementsOf(assessmentAtoms);
            List<String> originalRaw = before.canonicalGoals.get(sourceId).getRequires();
            List<String> reducedRaw = after.canonicalGoals.get(sourceId).getRequires();
            assertThat(originalRaw).containsExactly(orientation);
            assertThat(reducedRaw).containsExactlyElementsOf(originalRaw);
            for (String atomId : assessmentAtoms) {
                checkedAssessmentAtoms.add(atomId);
                Set<String> originalAtomic = left.topology().transitivePrerequisites(atomId);
                Set<String> reducedAtomic = right.topology().transitivePrerequisites(atomId);
                Set<String> originalGoals = left.topology().transitiveGoalPrerequisites(atomId);
                Set<String> reducedGoals = right.topology().transitiveGoalPrerequisites(atomId);
                assertThat(originalAtomic).as("full canonical assessment demand: %s/%s", configId, atomId)
                        .contains(orientation)
                        .containsAll(before.canonicalGoals.get(atomId).getRequires());
                assertThat(originalGoals).as("inherited Economics orientation: %s/%s", configId, atomId).contains(orientation);
                Map<String, Double> originalMastery = new TreeMap<>(), reducedMastery = new TreeMap<>();
                left.graph().forEach((id, goal) -> { if (goal.getContains().isEmpty()) originalMastery.put(id, 1.0); });
                right.graph().forEach((id, goal) -> { if (goal.getContains().isEmpty()) reducedMastery.put(id, 1.0); });
                assertThat(originalMastery).doesNotContainKey(sourceId);
                assertThat(reducedMastery).doesNotContainKey(sourceId);
                boolean originalFull = atomicFrontierProbe(before.service, left, atomId,
                        new AtomicFrontierCase("econ-strict-full-mastered", originalMastery, null, true, null));
                boolean reducedFull = atomicFrontierProbe(after.service, right, atomId,
                        new AtomicFrontierCase("econ-strict-full-mastered", reducedMastery, null, true, null));
                originalMastery.remove(orientation);
                reducedMastery.remove(orientation);
                boolean originalMissing = atomicFrontierProbe(before.service, left, atomId,
                        new AtomicFrontierCase("econ-strict-missing-orientation", originalMastery, null, true, null));
                boolean reducedMissing = atomicFrontierProbe(after.service, right, atomId,
                        new AtomicFrontierCase("econ-strict-missing-orientation", reducedMastery, null, true, null));
                Map<String, Object> diagnostic = new LinkedHashMap<>();
                diagnostic.put("configurationId", configId);
                diagnostic.put("configuration", config);
                diagnostic.put("structuralCluster", sourceId);
                diagnostic.put("assessmentAtom", atomId);
                diagnostic.put("actualAtomicTargetAndLookupBothFrames", true);
                diagnostic.put("orientationRole", Map.of("before", hasDeclaredRole(left, orientation), "after", hasDeclaredRole(right, orientation)));
                diagnostic.put("rawClusterRequires", Map.of("before", originalRaw, "after", reducedRaw));
                diagnostic.put("atomicDemand", Map.of("before", originalAtomic, "after", reducedAtomic));
                diagnostic.put("preExpansionDemand", Map.of("before", originalGoals, "after", reducedGoals));
                diagnostic.put("strictFullMastery", Map.of("before", originalFull, "after", reducedFull));
                diagnostic.put("strictMissingOrientation", Map.of("before", originalMissing, "after", reducedMissing));
                System.out.printf("ECON_SCOPE_PROJECTION_INVARIANCE %s%n", MAPPER.writeValueAsString(diagnostic));
                String label = configId + " assessment=" + atomId;
                if (!originalAtomic.equals(reducedAtomic)) differences.add(label + " atomic demand changed: " + originalAtomic + " -> " + reducedAtomic);
                if (!originalGoals.equals(reducedGoals)) differences.add(label + " pre-expansion demand changed: " + originalGoals + " -> " + reducedGoals);
                if (!originalFull || !reducedFull) differences.add(label + " full-mastery positive control: " + originalFull + " -> " + reducedFull);
                if (originalMissing || reducedMissing) differences.add(label + " strict missing-orientation availability: " + originalMissing + " -> " + reducedMissing);
            }
        }
        assertThat(checkedAssessmentAtoms).containsExactlyInAnyOrderElementsOf(
                assessmentAtomsByCluster.values().stream().flatMap(List::stream).toList());
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) {
            assertThat(Files.readAllBytes(source.getKey())).as("canonical source remains untouched: %s", source.getKey())
                    .isEqualTo(source.getValue());
        }
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).as("registry remains untouched").isEqualTo(registryBytes);
        assertThat(differences).as("native invariance of the actually atomic Economics Abitur targets").isEmpty();
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void firstMathEdgePreservesLiveOfferingsProjectionsAtomicDemandAndEffectiveRoleValidity() throws Exception {
        ReductionRegistry registry = readReductionRegistry();
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : registry.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        // Both frames use the current native policy. Before reconstructs the full
        // original registry baseline, including the first Math reduction.
        var before = new NativeFixture(registry, true);
        var after = new NativeFixture(registry, false);
        assertThat(after.canonicalAtomicIds).as("canonical atomic classification before scope")
                .isEqualTo(before.canonicalAtomicIds);
        assertThat(after.atomicProbesBySource).as("canonical descendant coverage before scope")
                .isEqualTo(before.atomicProbesBySource);
        assertThat(nativeGermanApplicability(after)).as("native derived German applicability before scope")
                .isEqualTo(nativeGermanApplicability(before));
        Set<String> germanReachedScopes = new TreeSet<>(), germanTargetScopes = new TreeSet<>();
        int germanCompletionPairs = 0, germanPolicyPairs = 0, germanMasteredSourcePairs = 0;
        boolean germanControlledRolesChecked = false;
        JsonNode offerings = readGuiOfferings();
        int sourceTargets = 0, sourceContextsOnly = 0, foreignContexts = 0;
        int validRoles = 0, invalidRoles = 0;
        boolean negativeRoleCaseChecked = false;
        boolean navigationClusterCaseChecked = false;
        boolean inheritedRoleCaseChecked = false, transitiveRoleCaseChecked = false;
        boolean latinMissingRoleCaseChecked = false;
        boolean continuedMathFocusCaseChecked = false;
        Map<String, Integer> configurationCounts = new TreeMap<>();
        Map<String, Integer> changedContextPairs = new TreeMap<>();
        Map<String, Integer> changedTargetPairs = new TreeMap<>();
        Map<String, Integer> changedValidRoles = new TreeMap<>();
        Map<String, Integer> changedInvalidRoles = new TreeMap<>();
        Set<String> coveredChangedSources = new TreeSet<>();
        Map<String, Set<String>> coveredAtomicProbes = new TreeMap<>();
        long atomicFrontierComparisons = 0;
        long mathFrontierComparisons = 0;
        long mathPositiveTargetControls = 0;
        long liveAtomicTargetComparisons = 0;
        long contextGoalComparisons = 0;

        for (String subject : SUBJECTS) {
            Discovery original = discover(before, subject, offerings.path(subject));
            Discovery reduced = discover(after, subject, offerings.path(subject));
            assertThat(reduced).as("actual offered and selected configurations: %s", subject).isEqualTo(original);
            assertThat(original.plannerScopes()).as("native planner coverage: %s", subject).isNotEmpty();
            assertThat(original.guiScopes()).as("declared GUI coverage: %s", subject).isNotEmpty();
            configurationCounts.put(subject, original.configurations().size());
            for (var entry : original.configurations().entrySet()) {
                String scope = subject + "/" + entry.getKey();
                NativeScope left = before.resolve(entry.getValue());
                NativeScope right = after.resolve(reduced.configurations().get(entry.getKey()));
                assertThat(right.roles()).as("projection roles and views: %s", scope).isEqualTo(left.roles());
                assertThat(right.graph().keySet()).as("complete resolved graph: %s", scope)
                        .isEqualTo(left.graph().keySet());
                assertThat(right.context()).as("complete native compiler context: %s", scope).isEqualTo(left.context());
                if (GERMAN.equals(subject)) {
                    assertThat(projectedApplicability(right)).as("actual projected German applicability: %s", scope)
                            .isEqualTo(projectedApplicability(left));
                    if (left.graph().containsKey(GERMAN_ATOM)) {
                        germanReachedScopes.add(entry.getKey());
                        assertThat(left.roles().atomicTargets()).as("actual German assessment target: %s", scope).contains(GERMAN_ATOM);
                        assertThat(right.roles().atomicTargets()).contains(GERMAN_ATOM);
                        germanTargetScopes.add(entry.getKey());
                        assertGermanRawGoalNormalization(left.topology(), right.topology(), scope);
                        assertGermanActualCompletionAndPolicyPreserved(before.service, left, after.service, right,
                                registry.documentDigests().get(GERMAN_SOURCE), scope);
                        germanCompletionPairs += 5;
                        germanPolicyPairs += 20;
                        germanMasteredSourcePairs++;
                        if ("DE-HE/SekII/G8/GK".equals(entry.getKey())) {
                            assertGermanControlledRoleDifferences(before.service, left, after.service, right);
                            germanControlledRolesChecked = true;
                        }
                    }
                }

                if (BIOLOGY.equals(subject) && "DE-MV/SekI/G8/".equals(entry.getKey())) {
                    assertDuplicateRemovalPreservesAcquisitionTargets(before.service, left,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    assertDuplicateRemovalPreservesAcquisitionTargets(after.service, right,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.graph().get("b530a382-2786-5794-8821-3e01a62d88fd").getType()).isEqualTo("cluster");
                    }
                    inheritedRoleCaseChecked = true;
                }
                if (MATH.equals(subject) && "ALL/CrossStage//GK".equals(entry.getKey())) {
                    String source = "1878f680-095c-511d-aaed-e98393f7fde9";
                    String missingRole = "9460c3ff-e72d-4107-bc73-087d217200aa";
                    assertDuplicateRemovalPreservesAcquisitionTargets(before.service, left,
                            source, missingRole);
                    assertRequiredAcquisitionTargets(after.service, right, source, missingRole);
                    assertThat(right.graph().get(source).getRequires()).as("certified tail 912 already removed the duplicate")
                            .doesNotContain(missingRole);
                    assertThat(right.topology().transitivePrerequisites(source)).as("full atomic demand after the actual tail")
                            .isEqualTo(left.topology().transitivePrerequisites(source));
                    assertThat(right.topology().transitiveGoalPrerequisites(source)).as("full role demand after the actual tail")
                            .isEqualTo(left.topology().transitiveGoalPrerequisites(source));
                    List<String> finalWitness = List.of(source, "5f548596-9bc3-532e-88a0-81d5029809e9",
                            "636b3e2d-c687-5469-8850-e085df06878d", "b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2",
                            "eb070ed2-7ef4-5afe-b203-190ebb0116af", "50eb5156-5046-5887-80dc-3128c5f8cbd6", missingRole);
                    assertThat(right.graph()).as("actual native vertices of the certified tail 912 witness")
                            .containsKeys(finalWitness.toArray(String[]::new));
                    for (int index = 0; index + 1 < finalWitness.size(); index++) {
                        assertThat(right.graph().get(finalWitness.get(index)).getRequires())
                                .as("literal final native tail 912 witness edge %d", index).contains(finalWitness.get(index + 1));
                    }
                    transitiveRoleCaseChecked = true;
                }

                if (BIOLOGY.equals(subject) && "DE-BY/CrossStage/G9/GK".equals(entry.getKey())) {
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.roles().targets()).contains(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.roles().atomicTargets()).doesNotContain(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.graph()).containsKey(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.graph().get(EXCLUDED_NAVIGATION_CLUSTER).getType()).isEqualTo("cluster");
                        assertThat(actual.graph().get(EXCLUDED_NAVIGATION_CLUSTER).getContains())
                                .containsExactlyElementsOf(before.canonicalGoals.get(EXCLUDED_NAVIGATION_CLUSTER).getContains());
                        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(actual.projection(), "learningScope");
                        assertThat(learning.seedAtomicGoalIds()).doesNotContain(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(learning.learningAtomicGoalIds()).doesNotContain(EXCLUDED_NAVIGATION_CLUSTER);
                    }
                    assertBiologyOrientationAvailable(before.service, left);
                    assertBiologyOrientationAvailable(after.service, right);
                    assertInvalidAtomicRequirementOutsideFocusFailsClosed(before.service, left);
                    navigationClusterCaseChecked = true;
                }

                if (!MATH.equals(subject)) {
                    assertThat(left.graph()).as("foreign resolved context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(right.graph()).as("foreign reduced context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(left.context()).as(scope).doesNotContain(SOURCE);
                    assertThat(right.context()).as(scope).doesNotContain(SOURCE);
                    foreignContexts++;
                }
                for (String id : left.graph().keySet()) {
                    // The registry overlay changes only these raw requires arrays.
                    if (!registry.changedSources().containsKey(id)) {
                        assertThat(right.graph().get(id).getRequires()).as("requires %s: %s", id, scope)
                                .isEqualTo(left.graph().get(id).getRequires());
                    }
                    assertThat(right.graph().get(id).getContains()).as("contains %s: %s", id, scope)
                            .isEqualTo(left.graph().get(id).getContains());
                }
                Map<String, LearningGoal> originalLookup = ReflectionTestUtils.invokeMethod(left.frontier(), "lookup");
                Map<String, LearningGoal> reducedLookup = ReflectionTestUtils.invokeMethod(right.frontier(), "lookup");
                for (String id : left.roles().atomicTargets()) {
                    assertThat(originalLookup).as("actual atomic target in original production lookup %s: %s", id, scope).containsKey(id);
                    assertThat(reducedLookup).as("actual atomic target in reduced production lookup %s: %s", id, scope).containsKey(id);
                    assertThat(left.context()).as("original compiler target %s: %s", id, scope).contains(id);
                    assertThat(right.context()).as("reduced compiler target %s: %s", id, scope).contains(id);
                    liveAtomicTargetComparisons++;
                }
                Set<String> liveProbeIds = new TreeSet<>(left.context());
                liveProbeIds.retainAll(before.canonicalAtomicIds);
                liveProbeIds.addAll(left.roles().atomicTargets());
                Object originalFullMastery = fullMasteryPrerequisites(left.graph(), left.topology());
                Object reducedFullMastery = fullMasteryPrerequisites(right.graph(), right.topology());
                for (String id : liveProbeIds) {
                    // Scope-atomic goalEntries must be checked even when their
                    // unfiltered canonical definition remains a cluster.
                    assertThat(right.topology().transitivePrerequisites(id)).as("full atomic demand %s: %s", id, scope)
                            .isEqualTo(left.topology().transitivePrerequisites(id));
                    if (GERMAN_ATOM.equals(id)) assertGermanRawGoalNormalization(left.topology(), right.topology(), scope);
                    else assertThat(right.topology().transitiveGoalPrerequisites(id))
                                .as("pre-expansion prerequisite roles %s: %s", id, scope)
                                .isEqualTo(left.topology().transitiveGoalPrerequisites(id));
                    boolean originalRoleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), id, originalFullMastery);
                    assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), id, reducedFullMastery))
                            .as("complete native role check %s: %s", id, scope)
                            .isEqualTo(originalRoleValid);
                    if (registry.suffixSourceIds().contains(id)) {
                        mathFrontierComparisons += assertMathSuffixAtomicFrontierPreserved(before.service, left,
                                after.service, right, id, originalRoleValid, scope);
                        if (originalRoleValid && left.roles().atomicTargets().contains(id)) mathPositiveTargetControls++;
                    }
                    if (!continuedMathFocusCaseChecked && RETAINED.equals(id) && originalRoleValid
                            && left.roles().atomicTargets().containsAll(Set.of(RETAINED, REMOVED))) {
                        assertContinuedMathFocusPreserved(before.service, left, after.service, right, scope);
                        continuedMathFocusCaseChecked = true;
                    }
                    contextGoalComparisons++;
                }
                Map<String, Boolean> originalRoleValidity = new LinkedHashMap<>();
                for (ChangedSource changed : registry.changedSources().values()) {
                    if (left.graph().containsKey(changed.goalId())) {
                        assertThat(left.graph().get(changed.goalId()).getRequires())
                                .as("original registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.originalRequires());
                        assertThat(right.graph().get(changed.goalId()).getRequires())
                                .as("current registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.currentRequires());
                    }
                    for (String id : before.atomicProbesBySource.get(changed.goalId())) {
                        if (!left.context().contains(id)) continue;
                        boolean originalHelper = roleProbe(before.service, left, left.projection(), id, left.topology());
                        boolean reducedHelper = roleProbe(after.service, right, right.projection(), id, right.topology());
                        assertThat(reducedHelper).as("native effective-role helper %s for source %s: %s",
                                id, changed.goalId(), scope).isEqualTo(originalHelper);
                        originalRoleValidity.put(id, originalHelper);
                        coveredChangedSources.add(changed.goalId());
                        coveredAtomicProbes.computeIfAbsent(changed.goalId(), ignored -> new TreeSet<>()).add(id);
                        changedContextPairs.merge(changed.owner(), 1, Integer::sum);
                        if (left.roles().targets().contains(id)) changedTargetPairs.merge(changed.owner(), 1, Integer::sum);
                        (originalHelper ? changedValidRoles : changedInvalidRoles).merge(changed.owner(), 1, Integer::sum);
                        if (LATIN_CLUSTER.equals(changed.goalId()) && left.roles().atomicTargets().contains(id)) {
                            atomicFrontierComparisons += assertLatinAtomicFrontierPreserved(
                                    before.service, left, after.service, right, id, originalHelper, scope);
                            if (!latinMissingRoleCaseChecked && originalHelper
                                    && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                                assertThat(roleProbe(before.service, left, withoutAcquisitionTarget(left.projection(), LATIN_ORIENTATION),
                                        id, left.topology())).isFalse();
                                assertThat(roleProbe(after.service, right, withoutAcquisitionTarget(right.projection(), LATIN_ORIENTATION),
                                        id, right.topology())).isFalse();
                                latinMissingRoleCaseChecked = true;
                            }
                        }
                    }
                }
                if (!left.context().contains(SOURCE)) continue;
                assertThat(subject).as("first Math source reached only from Math: %s", scope).isEqualTo(MATH);
                assertThat(left.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(BEFORE);
                assertThat(right.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(AFTER);
                assertThat(hasDeclaredRole(left, REMOVED)).as("removed prerequisite retains a declared role: %s", scope).isTrue();
                assertThat(hasDeclaredRole(right, REMOVED)).as("reduced prerequisite retains a declared role: %s", scope).isTrue();
                for (NativeScope actual : List.of(left, right)) {
                    PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(actual.projection(), "learningScope");
                    assertThat(learning.learningAtomicGoalIds()).as("required Math acquisition basis: %s", scope)
                            .contains(SOURCE, REMOVED);
                    assertThat(actual.roles().atomicTargets()).as("emitted Math acquisition targets: %s", scope)
                            .contains(SOURCE, REMOVED);
                    if (!learning.seedAtomicGoalIds().contains(SOURCE)) {
                        List<String> path = learning.requiredByPaths().get(SOURCE);
                        assertThat(path).as("derived Math source has a canonical seed witness: %s", scope)
                                .isNotNull().hasSizeGreaterThan(1).endsWith(SOURCE);
                        assertThat(learning.seedAtomicGoalIds()).contains(path.getFirst());
                        for (int index = 1; index < path.size(); index++) {
                            assertThat(actual.topology().directPrerequisites(path.get(index - 1)))
                                    .as("normalized Math acquisition witness edge %d: %s", index, scope)
                                    .contains(path.get(index));
                        }
                    }
                }
                boolean originalHelper = originalRoleValidity.get(SOURCE);
                assertThat(originalHelper).as("complete Math learning basis has valid acquisition roles: %s", scope).isTrue();
                if (originalHelper) validRoles++; else invalidRoles++;
                if (left.roles().targets().contains(SOURCE)) sourceTargets++; else sourceContextsOnly++;

                if (!negativeRoleCaseChecked && originalHelper
                        && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                    // The endpoint remains required transitively under the same E+ role policy.
                    assertThat(roleProbe(before.service, left, withoutAcquisitionTarget(left.projection(), REMOVED))).isFalse();
                    assertThat(roleProbe(after.service, right, withoutAcquisitionTarget(right.projection(), REMOVED))).isFalse();
                    negativeRoleCaseChecked = true;
                }
            }
        }
        Set<String> missingChangedSources = new TreeSet<>(registry.changedSources().keySet());
        missingChangedSources.removeAll(coveredChangedSources);
        Set<String> missingHistoricalSources = new TreeSet<>(missingChangedSources);
        missingHistoricalSources.retainAll(registry.historicalSourceIds());
        assertThat(missingHistoricalSources).as("exact historical canonical atomic bases unexposed by actual authored views")
                .containsExactlyInAnyOrderElementsOf(UNEXPOSED_CANONICAL_ATOMIC_BASES);
        Set<String> missingTailSources = new TreeSet<>(missingChangedSources);
        missingTailSources.retainAll(registry.tailSourceIds());
        Set<String> coveredTailSources = new TreeSet<>(coveredChangedSources);
        coveredTailSources.retainAll(registry.tailSourceIds());
        int liveCoveredSources = coveredChangedSources.size();
        Map<String, Set<String>> canonicalCoveredAtoms = new TreeMap<>();
        long canonicalRoleComparisons = 0;
        for (String source : UNEXPOSED_CANONICAL_ATOMIC_BASES) {
            Set<String> atoms = before.atomicProbesBySource.get(source);
            assertThat(atoms).as("three complete canonical PoWi assessment atoms of %s", source).hasSize(3);
            CanonicalProbe left = canonicalProbe(before, atoms);
            CanonicalProbe right = canonicalProbe(after, atoms);
            assertThat(right.context()).as("canonical compiler context of %s", source).isEqualTo(left.context());
            for (String atom : left.context()) {
                assertThat(before.canonicalAtomicIds).contains(atom);
                assertThat(right.topology().transitivePrerequisites(atom)).isEqualTo(left.topology().transitivePrerequisites(atom));
                assertThat(right.topology().transitiveGoalPrerequisites(atom)).isEqualTo(left.topology().transitiveGoalPrerequisites(atom));
            }
            for (String atom : atoms) {
                assertThat(roleProbe(before.service, left.graph(), left.projection(), atom, left.topology())).isTrue();
                assertThat(roleProbe(after.service, right.graph(), right.projection(), atom, right.topology())).isTrue();
                for (ClusterWitnessCoverage operation : registry.clusterWitnessCoverage()) {
                    if (!operation.sourceId().equals(source)) continue;
                    String prerequisite = operation.prerequisiteId();
                    assertThat(left.topology().transitivePrerequisites(atom)).contains(prerequisite);
                    assertThat(right.topology().transitivePrerequisites(atom)).contains(prerequisite);
                    assertThat(left.topology().transitiveGoalPrerequisites(atom)).contains(prerequisite);
                    assertThat(right.topology().transitiveGoalPrerequisites(atom)).contains(prerequisite);
                    assertThat(roleProbe(before.service, left.graph(), withoutAcquisitionTarget(left.projection(), prerequisite), atom, left.topology())).isFalse();
                    assertThat(roleProbe(after.service, right.graph(), withoutAcquisitionTarget(right.projection(), prerequisite), atom, right.topology())).isFalse();
                    canonicalRoleComparisons++;
                }
            }
            canonicalCoveredAtoms.put(source, atoms);
        }
        Map<String, Set<String>> tailCanonicalCoveredAtoms = new TreeMap<>();
        long tailCanonicalRoleComparisons = 0;
        for (String source : missingTailSources) {
            Set<String> atoms = before.atomicProbesBySource.get(source);
            assertThat(atoms).as("unexposed atomic tail source %s", source).containsExactly(source);
            CanonicalProbe left = canonicalProbe(before, atoms);
            CanonicalProbe right = canonicalProbe(after, atoms);
            assertThat(right.context()).as("separate canonical tail context of %s", source).isEqualTo(left.context());
            for (String atom : left.context()) {
                assertThat(before.canonicalAtomicIds).contains(atom);
                assertThat(right.topology().transitivePrerequisites(atom)).as("canonical tail atomic demand %s", atom)
                        .isEqualTo(left.topology().transitivePrerequisites(atom));
                assertThat(right.topology().transitiveGoalPrerequisites(atom)).as("canonical tail role demand %s", atom)
                        .isEqualTo(left.topology().transitiveGoalPrerequisites(atom));
            }
            assertThat(roleProbe(before.service, left.graph(), left.projection(), source, left.topology())).isTrue();
            assertThat(roleProbe(after.service, right.graph(), right.projection(), source, right.topology())).isTrue();
            for (String prerequisite : registry.tailRemovedPrerequisites().get(source)) {
                assertThat(left.topology().transitivePrerequisites(source)).contains(prerequisite);
                assertThat(right.topology().transitivePrerequisites(source)).contains(prerequisite);
                assertThat(roleProbe(before.service, left.graph(), withoutAcquisitionTarget(left.projection(), prerequisite), source, left.topology())).isFalse();
                assertThat(roleProbe(after.service, right.graph(), withoutAcquisitionTarget(right.projection(), prerequisite), source, right.topology())).isFalse();
                tailCanonicalRoleComparisons++;
            }
            tailCanonicalCoveredAtoms.put(source, atoms);
        }
        assertThat(coveredChangedSources.stream().filter(registry.historicalSourceIds()::contains).count())
                .as("historical sources with real authored-scope descendant probes").isEqualTo(198);
        assertThat(liveCoveredSources).as("all sources with real authored-scope descendant probes")
                .isEqualTo(198 + registry.suffixSourceIds().size() + coveredTailSources.size() + registry.clusterTargetSourceIds().size());
        assertThat(coveredChangedSources).as("all V3 Math materialization sources have actual authored-scope coverage")
                .containsAll(registry.suffixSourceIds());
        assertThat(coveredChangedSources.stream().filter(id -> registry.historicalSourceIds().contains(id)
                || registry.suffixSourceIds().contains(id)).count()).as("V3 prefix exposure remains separate").isEqualTo(227);
        assertThat(canonicalCoveredAtoms.values().stream().mapToInt(Set::size).sum()).isEqualTo(6);
        assertThat(canonicalRoleComparisons).as("canonical removed-role negative controls").isEqualTo(6);
        Set<String> allCoveredSources = new TreeSet<>(coveredChangedSources);
        allCoveredSources.addAll(canonicalCoveredAtoms.keySet());
        allCoveredSources.addAll(tailCanonicalCoveredAtoms.keySet());
        assertThat(allCoveredSources).as("combined live and separate canonical source coverage")
                .containsExactlyInAnyOrderElementsOf(registry.changedSources().keySet());
        before.atomicProbesBySource.forEach((source, probes) -> {
            Set<String> combined = new TreeSet<>(coveredAtomicProbes.getOrDefault(source, Set.of()));
            combined.addAll(canonicalCoveredAtoms.getOrDefault(source, Set.of()));
            combined.addAll(tailCanonicalCoveredAtoms.getOrDefault(source, Set.of()));
            assertThat(combined)
                    .as("all canonical atomic probes for registered source %s", source)
                    .containsExactlyInAnyOrderElementsOf(probes);
        });
        assertThat(configurationCounts.values().stream().mapToInt(Integer::intValue).sum())
                .as("all actual native planner and GUI configurations").isEqualTo(1240);
        assertThat(configurationCounts.get(GERMAN)).as("all actual German configurations").isEqualTo(99);
        assertThat(germanReachedScopes).as("exact actual source contexts, no incoming source dependencies")
                .containsExactlyInAnyOrderElementsOf(GERMAN_TARGET_SCOPES);
        assertThat(germanTargetScopes).as("seven actual positive prepared-source-open policy controls")
                .containsExactlyInAnyOrderElementsOf(GERMAN_TARGET_SCOPES);
        assertThat(germanCompletionPairs).isEqualTo(35);
        assertThat(germanPolicyPairs).isEqualTo(140);
        assertThat(germanMasteredSourcePairs).isEqualTo(7);
        assertThat(germanControlledRolesChecked).as("separate artificial role-projection differences").isTrue();
        assertThat(sourceTargets).as("actual Math target coverage").isPositive();
        assertThat(sourceContextsOnly).as("required atomic Math sources cannot remain context-only outside L").isZero();
        assertThat(foreignContexts).isPositive();
        assertThat(validRoles).isPositive();
        // Resolved scopes contain complete L; deliberate emitted-target losses
        // remain invalid in the unchanged negative controls above.
        assertThat(invalidRoles).as("resolved Math source scopes have complete acquisition roles").isZero();
        assertThat(sourceTargets).isEqualTo(validRoles);
        assertThat(negativeRoleCaseChecked).as("effective-role negative control executed").isTrue();
        assertThat(navigationClusterCaseChecked).as("actual Bio navigation-cluster counterexample executed").isTrue();
        assertThat(inheritedRoleCaseChecked).as("actual Bio inherited-role counterexample executed").isTrue();
        assertThat(transitiveRoleCaseChecked).as("actual Math transitive-role counterexample executed").isTrue();
        assertThat(latinMissingRoleCaseChecked).as("Latin descendant still requires the removed orientation role").isTrue();
        assertThat(atomicFrontierComparisons).as("actual Latin atomic-target frontier comparisons").isPositive();
        assertThat(mathFrontierComparisons).as("actual new Math atomic-target frontier comparisons").isPositive();
        assertThat(mathPositiveTargetControls).as("actually offered new Math targets with positive full-mastery frontier controls").isPositive();
        assertThat(continuedMathFocusCaseChecked).as("actual Retained/Orientation focus with outside-focus continuation bridge").isTrue();
        assertThat(liveAtomicTargetComparisons).as("all actual atomic scope targets checked").isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) {
            assertThat(Files.readAllBytes(source.getKey())).as("canonical source remains untouched: %s", source.getKey())
                    .isEqualTo(source.getValue());
        }
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).as("registry remains untouched").isEqualTo(registryBytes);
        System.out.printf("FIRST_MATH_REDUCTION_NATIVE_COVERAGE configurations=%s sourceTargets=%d sourceContextsOnly=%d foreignContexts=%d validRoles=%d invalidRoles=%d%n",
                configurationCounts, sourceTargets, sourceContextsOnly, foreignContexts, validRoles, invalidRoles);
        System.out.printf("REGISTERED_REDUCTION_NATIVE_COVERAGE baseline=original-registry currentPolicy=true configurations=%d contextGoalComparisons=%d registeredSources=%d liveReachedSources=%d contextPairs=%s targetPairs=%s validRoles=%s invalidRoles=%s atomicFrontierComparisons=%d%n",
                configurationCounts.values().stream().mapToInt(Integer::intValue).sum(), contextGoalComparisons,
                registry.changedSources().size(), coveredChangedSources.size(), changedContextPairs, changedTargetPairs,
                changedValidRoles, changedInvalidRoles, atomicFrontierComparisons);
        System.out.printf("REGISTERED_REDUCTION_CANONICAL_COVERAGE liveSources=%d canonicalSources=%d combinedSources=%d canonicalAtoms=6 canonicalMissingRoleCases=%d liveAtomicTargetComparisons=%d%n",
                liveCoveredSources, canonicalCoveredAtoms.size(), allCoveredSources.size(), canonicalRoleComparisons,
                liveAtomicTargetComparisons);
        System.out.printf("MATH_MATERIALIZATION_NATIVE_COVERAGE sources=%d atomicSources=27 clusterSources=2 frontierComparisons=%d positiveTargetControls=%d%n",
                registry.suffixSourceIds().size(), mathFrontierComparisons, mathPositiveTargetControls);
        System.out.printf("MATH_ATOMIC_TAIL_NATIVE_COVERAGE registeredSources=%d liveSources=%d unexposedSources=%d separateCanonicalSources=%d canonicalMissingRoleCases=%d unexposedSourceIds=%s%n",
                registry.tailSourceIds().size(), coveredTailSources.size(), missingTailSources.size(),
                tailCanonicalCoveredAtoms.size(), tailCanonicalRoleComparisons, missingTailSources);
        System.out.printf("GERMAN_CLUSTER_TARGET_NATIVE_COVERAGE configurations=%d reachedScopes=%s targetScopes=%s atomicDemand=20 rawGoalDemand=2-to-12 completionPairs=%d commonPolicyPairs=%d masteredSourceCompletionAndEffectiveMasteryPairs=%d separateControlledRoleCases=2%n",
                configurationCounts.get(GERMAN), germanReachedScopes, germanTargetScopes,
                germanCompletionPairs, germanPolicyPairs, germanMasteredSourcePairs);
    }

    /** Historical German V6 end-frame evidence, before Physics and before the V7 cache refresh. */
    @Test
    void batchedGermanSourcesPreserveFinalCurrentNativeAtomicDemandRolesAndFrontier() throws Exception {
        JsonNode declared = readNativeRegistryDeclaration();
        assertThat(declared.path("proofContract").asText()).as("this native regression requires the certified V6 end frame").isEqualTo(V6);
        BatchNativeFrames frames = readBatchedReductionRegistry(declared);
        ReductionRegistry prefix = frames.legacy(), current = frames.afterGerman();
        assertThat(prefix.changedSources()).as("the independently checked V5 inventory remains separate").hasSize(720);
        Set<String> newSources = new TreeSet<>(current.batchSourceIds());
        newSources.removeAll(prefix.changedSources().keySet());
        assertThat(current.changedSources()).as("final inventory derives from prefix plus genuinely new batch sources")
                .hasSize(prefix.changedSources().size() + newSources.size());
        Set<String> germanSources = new TreeSet<>();
        current.batchSourceIds().stream().filter(id -> GERMAN.equals(current.changedSources().get(id).owner())).forEach(germanSources::add);
        assertThat(germanSources).as("reviewed complete first German batch source inventory").hasSize(18);
        Set<String> germanOverlap = new TreeSet<>(germanSources);
        germanOverlap.retainAll(prefix.changedSources().keySet());
        assertThat(germanOverlap).as("the first German V5 source is changed again").containsExactly(GERMAN_ATOM);
        assertThat(germanSources.stream().filter(newSources::contains).count()).isEqualTo(17);
        assertThat(current.changedSources().get(GERMAN_ATOM).originalRequires())
                .as("overlap retains the earliest pre-V5 raw array, never the last batch snapshot")
                .containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : current.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(prefix, false);
        var after = new NativeFixture(current, false);
        assertThat(after.canonicalAtomicIds).isEqualTo(before.canonicalAtomicIds);
        assertThat(nativeGermanApplicability(after)).as("final-current native German applicability").isEqualTo(nativeGermanApplicability(before));
        for (String source : germanSources) {
            assertThat(current.changedSources().get(source).atomicSource()).isTrue();
            assertThat(after.atomicProbesBySource.get(source)).containsExactly(source);
            assertThat(canonicalAtomicDescendants(source, before.canonicalGoals)).containsExactly(source);
        }
        JsonNode offerings = readGuiOfferings().path(GERMAN);
        Discovery leftDiscovery = discover(before, GERMAN, offerings), rightDiscovery = discover(after, GERMAN, offerings);
        assertThat(rightDiscovery).as("actual German planner/GUI offerings").isEqualTo(leftDiscovery);
        assertThat(leftDiscovery.configurations()).hasSize(99);
        Set<String> contextReached = new TreeSet<>(), targetReached = new TreeSet<>();
        Map<String, Set<String>> runtimeReachedUnion = new TreeMap<>();
        germanSources.forEach(source -> runtimeReachedUnion.put(source, new TreeSet<>()));
        LearnerService beforePublic = org.mockito.Mockito.spy(before.service), afterPublic = org.mockito.Mockito.spy(after.service);
        String probeId = "unsaved-german-batch-native-control";
        long rolePairs = 0, frontierPairs = 0, positiveControls = 0, negativeControls = 0, invalidRolePairs = 0;
        int completedScopes = 0, incompleteScopes = 0, incomplete409Responses = 0;
        for (var configuration : leftDiscovery.configurations().entrySet()) {
            String scope = configuration.getKey();
            List<PersonalizationPlan> plans = new ArrayList<>();
            for (NativeFixture fixture : List.of(before, after)) plans.add(CurriculumPersonalizationPlanner.plan(
                    ROOT, fixture.landscapes::getById,
                    (subject, settings) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", subject, settings),
                    configuration.getValue()));
            assertThat(plans.get(1)).as("actual personal-curriculum validity: %s", scope).isEqualTo(plans.get(0));
            if (!plans.get(0).valid() || plans.get(0).required()) {
                assertThat(leftDiscovery.plannerScopes()).doesNotContain(scope);
                assertThat(rightDiscovery.plannerScopes()).doesNotContain(scope);
                for (LearnerService service : List.of(beforePublic, afterPublic)) {
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(configuration.getValue()));
                    org.mockito.Mockito.doReturn(learner).when(service).getLearner(probeId);
                    try {
                        service.getPlanningScope(probeId, GERMAN);
                        throw new AssertionError("Incomplete personal curriculum unexpectedly accepted: " + scope);
                    } catch (org.springframework.web.server.ResponseStatusException expected) {
                        assertThat(expected.getStatusCode().value()).isEqualTo(409);
                        assertThat(expected.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                        incomplete409Responses++;
                    }
                }
                incompleteScopes++;
                continue;
            }
            completedScopes++;
            NativeScope left = before.resolve(configuration.getValue()), right = after.resolve(rightDiscovery.configurations().get(scope));
            assertThat(right.roles()).as("final-current actual roles: %s", scope).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("final-current native graph: %s", scope).isEqualTo(left.graph().keySet());
            assertThat(right.context()).as("final-current compiler context: %s", scope).isEqualTo(left.context());
            assertThat(projectedApplicability(right)).as("final-current projected applicability: %s", scope).isEqualTo(projectedApplicability(left));
            Set<String> probes = new TreeSet<>(left.context());
            probes.retainAll(before.canonicalAtomicIds);
            probes.addAll(left.roles().atomicTargets());
            Object leftMastered = fullMasteryPrerequisites(left.graph(), left.topology());
            Object rightMastered = fullMasteryPrerequisites(right.graph(), right.topology());
            for (String id : probes) {
                assertThat(right.topology().transitivePrerequisites(id)).as("final-current full atomic demand %s: %s", id, scope)
                        .isEqualTo(left.topology().transitivePrerequisites(id));
                assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), id, rightMastered))
                        .as("final-current effective role validity %s: %s", id, scope)
                        .isEqualTo(roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), id, leftMastered));
                rolePairs++;
            }
            for (String source : germanSources) {
                assertThat(right.context().contains(source)).as("separate source-context reach %s: %s", source, scope)
                        .isEqualTo(left.context().contains(source));
                if (left.context().contains(source)) contextReached.add(source);
                boolean target = left.roles().atomicTargets().contains(source);
                assertThat(right.roles().atomicTargets().contains(source)).as("actual atomic target exposure %s: %s", source, scope).isEqualTo(target);
                if (!target) continue;
                targetReached.add(source);
                runtimeReachedUnion.get(source).add(scope);
                boolean roleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), source, leftMastered);
                Map<String, Double> mastered = new TreeMap<>();
                left.graph().keySet().forEach(id -> mastered.put(id, 1.0));
                Set<String> demand = left.topology().transitivePrerequisites(source);
                if (roleValid) assertThat(demand).as("meaningful positive German prerequisite control %s: %s", source, scope).isNotEmpty();
                Map<String, Double> missing = new TreeMap<>(mastered);
                if (roleValid) missing.remove(demand.stream().sorted().findFirst().orElseThrow());
                List<AtomicFrontierCase> cases = List.of(
                        new AtomicFrontierCase("batch-normal-empty", Map.of(), null, false, null),
                        new AtomicFrontierCase("batch-normal-mastered", mastered, null, false, roleValid),
                        new AtomicFrontierCase("batch-strict-mastered", mastered, null, true, roleValid),
                        new AtomicFrontierCase("batch-strict-missing-one", missing, null, true, null),
                        new AtomicFrontierCase("batch-strict-empty", Map.of(), null, true, false),
                        new AtomicFrontierCase("batch-normal-single-source-focus", Map.of(), Set.of(source), false, roleValid),
                        new AtomicFrontierCase("batch-strict-single-source-focus", Map.of(), Set.of(source), true, false));
                for (AtomicFrontierCase probe : cases) {
                    boolean original = atomicFrontierProbe(before.service, left, source, probe);
                    boolean finalCurrent = atomicFrontierProbe(after.service, right, source, probe);
                    assertThat(finalCurrent).as("final-current real frontier %s/%s: %s", source, probe.name(), scope).isEqualTo(original);
                    if (!roleValid) {
                        assertThat(original).as("invalid source roles fail closed %s/%s: %s", source, probe.name(), scope).isFalse();
                        invalidRolePairs++;
                    }
                    if (probe.expected() != null) assertThat(original).as("actual frontier control %s/%s: %s", source, probe.name(), scope)
                            .isEqualTo(probe.expected());
                    if (roleValid && "batch-strict-mastered".equals(probe.name()) && original) positiveControls++;
                    if (roleValid && "batch-strict-empty".equals(probe.name()) && !original) negativeControls++;
                    frontierPairs++;
                }
            }
        }
        assertThat(completedScopes + incompleteScopes).as("all discovered configurations are classified").isEqualTo(99);
        assertThat(incompleteScopes).as("GUI-only incomplete personal curricula are separate negative controls").isEqualTo(55);
        assertThat(incomplete409Responses).as("paired actual planning-API 409 controls").isEqualTo(2 * incompleteScopes);
        assertThat(contextReached).as("context reach is recorded separately from positive target exposure").containsAll(targetReached);
        assertThat(targetReached).as("all 18 sources require actual target exposure under completed personal curricula")
                .containsExactlyInAnyOrderElementsOf(germanSources);
        runtimeReachedUnion.forEach((source, scopes) -> assertThat(scopes).as("actual runtime target scopes of %s", source).isNotEmpty());
        assertThat(runtimeReachedUnion.get("de86a077-6c71-56d7-92da-9d8e376fb110"))
                .as("previously aborted source must reach all four real HE profiles")
                .containsAll(Set.of("DE-HE/SekII/G8/GK", "DE-HE/SekII/G9/GK", "DE-HE/SekII/G8/GK+LK", "DE-HE/SekII/G9/GK+LK"));
        assertThat(rolePairs).isPositive();
        assertThat(frontierPairs).isPositive();
        assertThat(positiveControls).isPositive();
        assertThat(negativeControls).isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) assertThat(Files.readAllBytes(source.getKey())).isEqualTo(source.getValue());
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).isEqualTo(registryBytes);
        System.out.printf("GERMAN_BATCH_FINAL_V6_NATIVE_COVERAGE baseline=exact-V5-prefix current=historical-German-V6-end-frame prefixSources=%d registeredSources=%d germanBatchSources=%d newGermanSources=17 discoveredConfigurations=99 completedScopes=%d incompleteScopes=%d incomplete409Responses=%d contextReached=%s runtimeReachedUnion=%s rolePairs=%d frontierPairs=%d positiveControls=%d negativeControls=%d invalidRolePairs=%d publicPositiveFrontierListCoverage=false nodeProofCoverage=false%n",
                prefix.changedSources().size(), current.changedSources().size(), germanSources.size(), completedScopes, incompleteScopes,
                incomplete409Responses, contextReached, runtimeReachedUnion, rolePairs, frontierPairs, positiveControls, negativeControls, invalidRolePairs);
    }

    /** Actual V7 Physics runtime comparison: identical current caches on both required-work frames. */
    @Test
    void batchedPhysicsSourcesPreserveFinalCurrentNativeAtomicDemandRolesAndFrontier() throws Exception {
        NativeV7Boundary boundary = readNativeV7Boundary();
        JsonNode active = boundary.registry();
        assertThat(active.path("proofContract").asText()).isEqualTo(V7);
        assertThat(rawByteHash(boundary.bytes())).isEqualTo(CHEMISTRY_V7_WRAPPER_DIGEST);
        assertThat(active.path("parentRegistryRawDigest").asText())
                .isEqualTo(CHEMISTRY_V6_PARENT_DIGEST);
        NativeV6Frame cacheFrame = readApplicabilityRefreshFrame(active, boundary.documents());
        JsonNode declared = cacheFrame.registry();
        assertThat(declared.path("proofContract").asText()).isEqualTo(V6);
        assertThat(declared.path("batches")).as("German then Physics then Chemistry delivery; compare only the Physics boundary").hasSize(3);
        assertThat(declared.path("batches").get(0).path("id").asText())
                .isEqualTo("de-complete-atomic-prerequisites-and-transitive-reduction");
        BatchNativeFrames frames = readBatchedReductionRegistry(declared, cacheFrame.documents());
        assertDocumentDigest(frames.afterGerman().currentDocuments().get(PHYSICS_SOURCE),
                "sha256:d940e65e82bbe28b09395a61f7d6a117ca95589fb758e361cee0c0751a4939f1", "historical after-German Physics before cache refresh");
        assertDocumentDigest(frames.afterPhysics().currentDocuments().get(PHYSICS_SOURCE),
                "sha256:b03e3da1ac957226765dbec846a600fde1183719927652ed6caf0b7ec02b67ba", "historical after-Physics document before cache refresh");
        CurrentCacheComparisonFrames comparison = currentPhysicsCacheFrames(active, declared, cacheFrame, frames);
        ReductionRegistry prior = comparison.before(), current = comparison.after();
        assertThat(declared.path("batches").get(1).path("id").asText())
                .isEqualTo("ph-complete-atomic-prerequisites-and-transitive-reduction");
        assertThat(declared.path("batches").get(1).path("previousDigest").asText())
                .isEqualTo("sha256:c21e1fcd260dc83fec0826388dabad3ae59432b1c94335a7d8257af7e3d6fe2e");
        assertThat(rawHash(declared.path("batches").get(0))).as("unchanged complete German batch 1")
                .isEqualTo("sha256:c21e1fcd260dc83fec0826388dabad3ae59432b1c94335a7d8257af7e3d6fe2e");
        assertThat(prior.changedSources()).as("after-German snapshot union, never V5-only baseline").hasSize(737);
        assertThat(current.changedSources()).hasSize(881);
        assertThat(declared.path("batches").get(1).path("operations")).hasSize(2843);
        assertThat(declared.path("batches").get(1).path("legacyContinuations")).hasSize(17);
        assertDocumentDigest(prior.currentDocuments().get(PHYSICS_SOURCE),
                "sha256:078683f2729c8d6ad893c61a9a702e0acafd95ff16bc001908aa3f3e6f6411f7", "derived after-German Physics with current V7 caches");
        assertDocumentDigest(current.currentDocuments().get(PHYSICS_SOURCE),
                "sha256:bf83d684f86aa9c2ae46f8f8a4db93b709be4550993b372dce069b32699d817c", "actual final V7 Physics document");
        Set<String> physicsSources = new TreeSet<>();
        for (JsonNode original : declared.path("batches").get(1).path("originalRequires")) {
            String[] identity = qualifiedIdentity(original.path("source").asText());
            assertThat(identity[0]).as("only Physics is changed in the second batch").isEqualTo(PHYSICS);
            assertThat(physicsSources.add(identity[1])).isTrue();
        }
        assertThat(physicsSources).as("exact reviewed operation-source inventory, including net-unchanged sources")
                .containsExactlyInAnyOrderElementsOf(PHYSICS_PROBES_BY_SOURCE.keySet());
        assertThat(physicsSources).hasSize(144);
        assertThat(physicsSources).doesNotContainAnyElementsOf(prior.changedSources().keySet());
        assertThat(physicsSources.stream().filter(source -> current.changedSources().get(source).atomicSource()).count()).isEqualTo(139);
        assertThat(physicsSources.stream().filter(source -> !current.changedSources().get(source).atomicSource()).count()).isEqualTo(5);
        Map<String, JsonNode> priorPhysics = rawGoals(prior.currentDocuments().get(PHYSICS_SOURCE));
        Map<String, JsonNode> currentPhysics = rawGoals(current.currentDocuments().get(PHYSICS_SOURCE));
        assertThat(priorPhysics).hasSize(766);
        assertThat(physicsSources.stream().filter(source ->
                !java.util.Objects.equals(priorPhysics.get(source).get("requires"), currentPhysics.get(source).get("requires"))).count())
                .as("all operation sources remain covered although four arrays return to their start state").isEqualTo(140);
        Set<String> expectedUnion = new TreeSet<>(prior.changedSources().keySet());
        expectedUnion.addAll(physicsSources);
        assertThat(current.changedSources().keySet()).as("complete prior-plus-Physics deduplicated native inventory")
                .containsExactlyInAnyOrderElementsOf(expectedUnion);
        ObjectNode badPredecessor = declared.deepCopy();
        ((ObjectNode) badPredecessor.path("batches").get(1)).put("previousDigest", "sha256:" + "0".repeat(64));
        assertThatThrownBy(() -> readBatchedReductionRegistry(badPredecessor)).isInstanceOf(AssertionError.class);
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : current.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(prior, false);
        var after = new NativeFixture(current, false);
        assertThat(after.canonicalAtomicIds).isEqualTo(before.canonicalAtomicIds);
        assertThat(nativePhysicsApplicability(after)).as("actual derived Physics applicability before any scope")
                .isEqualTo(nativePhysicsApplicability(before));
        Set<String> allProbes = new TreeSet<>();
        for (String source : physicsSources) {
            assertThat(current.changedSources().get(source).owner()).isEqualTo(PHYSICS);
            Set<String> probes = canonicalAtomicDescendants(source, before.canonicalGoals);
            assertThat(probes).as("all reviewed atomic descendants for Physics source %s", source)
                    .containsExactlyInAnyOrderElementsOf(PHYSICS_PROBES_BY_SOURCE.get(source));
            assertThat(canonicalAtomicDescendants(source, after.canonicalGoals)).isEqualTo(probes);
            assertThat(after.atomicProbesBySource.get(source)).isEqualTo(probes);
            allProbes.addAll(probes);
        }
        assertThat(allProbes).as("distinct reviewed affected atomic descendants").hasSize(139);
        assertThat(PHYSICS_PROBES_BY_SOURCE.values().stream().mapToInt(Set::size).sum()).isEqualTo(175);
        Set<String> affectedProbes = new TreeSet<>(allProbes);
        Map<String, Set<String>> mathDemandByProbe = new TreeMap<>();
        Set<String> mathAtoms = new TreeSet<>(), mathIds = rawGoals(prior.currentDocuments().get(MATH_SOURCE)).keySet();
        int rawMathReferences = 0;
        for (var rawSource : priorPhysics.entrySet()) for (JsonNode reference : rawSource.getValue().path("requires")) {
            String prerequisite = reference.asText();
            if (!mathIds.contains(prerequisite)) continue;
            assertThat(prerequisite).as("the reviewed raw Physics-to-Math links remain unqualified").doesNotContain(":");
            assertThat(before.canonicalAtomicIds).contains(prerequisite);
            mathAtoms.add(prerequisite);
            rawMathReferences++;
            for (String atom : canonicalAtomicDescendants(rawSource.getKey(), before.canonicalGoals))
                mathDemandByProbe.computeIfAbsent(atom, ignored -> new TreeSet<>()).add(prerequisite);
        }
        assertThat(rawMathReferences).as("actual after-German raw Physics-to-Math references").isEqualTo(162);
        assertThat(mathAtoms).as("actual distinct foreign Math atomic prerequisites").hasSize(54);
        allProbes.addAll(mathDemandByProbe.keySet());
        Set<String> unavailableProbes = physicsUnavailableCompatibilityProbes(before, after, allProbes);
        Set<String> canonicalProbeCoverage = assertPhysicsCanonicalProbeDemands(before, after, affectedProbes, unavailableProbes);
        Discovery leftDiscovery = discover(before, PHYSICS, readGuiOfferings().path(PHYSICS));
        Discovery rightDiscovery = discover(after, PHYSICS, readGuiOfferings().path(PHYSICS));
        assertThat(rightDiscovery).as("real Physics planner and GUI configurations").isEqualTo(leftDiscovery);
        assertThat(leftDiscovery.configurations()).isNotEmpty();
        Map<String, Set<String>> sourceRuntimeReachedUnion = new TreeMap<>(), runtimeReachedUnion = new TreeMap<>();
        Map<String, Set<String>> positiveReached = new TreeMap<>(), negativeReached = new TreeMap<>();
        Map<String, Set<String>> validRoleReached = new TreeMap<>(), invalidRoleReached = new TreeMap<>();
        Map<String, Set<String>> failClosedReached = new TreeMap<>();
        Map<String, Set<String>> sourceProbeReached = new TreeMap<>();
        PHYSICS_PROBES_BY_SOURCE.forEach((source, probes) -> probes.forEach(atom ->
                sourceProbeReached.put(source + "->" + atom, new TreeSet<>())));
        Map<String, Set<String>> mathContextReached = new TreeMap<>(), mathPositiveReached = new TreeMap<>(), mathNegativeReached = new TreeMap<>();
        Map<String, Set<String>> mathConsumerTargets = new TreeMap<>(), mathValidConsumers = new TreeMap<>(), mathInvalidConsumers = new TreeMap<>();
        Map<String, Set<String>> mathPairPositive = new TreeMap<>(), mathPairNegative = new TreeMap<>(), mathPairFailClosed = new TreeMap<>();
        mathDemandByProbe.forEach((atom, maths) -> maths.forEach(math -> {
            String pair = atom + "->" + math;
            for (Map<String, Set<String>> ledger : List.of(mathConsumerTargets, mathValidConsumers, mathInvalidConsumers,
                    mathPairPositive, mathPairNegative, mathPairFailClosed)) ledger.put(pair, new TreeSet<>());
        }));
        mathAtoms.forEach(atom -> {
            mathContextReached.put(atom, new TreeSet<>());
            mathPositiveReached.put(atom, new TreeSet<>());
            mathNegativeReached.put(atom, new TreeSet<>());
        });
        physicsSources.forEach(source -> sourceRuntimeReachedUnion.put(source, new TreeSet<>()));
        allProbes.forEach(atom -> {
            runtimeReachedUnion.put(atom, new TreeSet<>());
            positiveReached.put(atom, new TreeSet<>());
            negativeReached.put(atom, new TreeSet<>());
            validRoleReached.put(atom, new TreeSet<>());
            invalidRoleReached.put(atom, new TreeSet<>());
            failClosedReached.put(atom, new TreeSet<>());
        });
        LearnerService beforePublic = org.mockito.Mockito.spy(before.service), afterPublic = org.mockito.Mockito.spy(after.service);
        String probeId = "unsaved-physics-batch-native-control";
        boolean completionWitnessNegativesChecked = false;
        long rolePairs = 0, frontierPairs = 0, completionPairs = 0, positiveControls = 0, negativeControls = 0, invalidRolePairs = 0;
        int completedScopes = 0, incompleteScopes = 0, incomplete409Responses = 0;
        for (var configuration : leftDiscovery.configurations().entrySet()) {
            String scope = configuration.getKey();
            List<PersonalizationPlan> plans = new ArrayList<>();
            for (NativeFixture fixture : List.of(before, after)) plans.add(CurriculumPersonalizationPlanner.plan(
                    ROOT, fixture.landscapes::getById,
                    (subject, settings) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", subject, settings),
                    configuration.getValue()));
            assertThat(plans.get(1)).as("real Physics personal-curriculum validity: %s", scope).isEqualTo(plans.get(0));
            if (!plans.get(0).valid() || plans.get(0).required()) {
                assertThat(leftDiscovery.plannerScopes()).doesNotContain(scope);
                assertThat(rightDiscovery.plannerScopes()).doesNotContain(scope);
                for (LearnerService service : List.of(beforePublic, afterPublic)) {
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(configuration.getValue()));
                    org.mockito.Mockito.doReturn(learner).when(service).getLearner(probeId);
                    try {
                        service.getPlanningScope(probeId, PHYSICS);
                        throw new AssertionError("Incomplete Physics personal curriculum unexpectedly accepted: " + scope);
                    } catch (org.springframework.web.server.ResponseStatusException expected) {
                        assertThat(expected.getStatusCode().value()).isEqualTo(409);
                        assertThat(expected.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                        incomplete409Responses++;
                    }
                }
                incompleteScopes++;
                continue;
            }
            completedScopes++;
            NativeScope left = before.resolve(configuration.getValue()), right = after.resolve(rightDiscovery.configurations().get(scope));
            assertThat(right.roles()).as("Physics roles: %s", scope).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("Physics native graph: %s", scope).isEqualTo(left.graph().keySet());
            assertThat(right.context()).as("Physics compiler context: %s", scope).isEqualTo(left.context());
            assertThat(projectedApplicability(right)).as("Physics projected applicability: %s", scope).isEqualTo(projectedApplicability(left));
            for (String unavailable : unavailableProbes) {
                assertPhysicsUnavailableInActualScope(left, unavailable, scope);
                assertPhysicsUnavailableInActualScope(right, unavailable, scope);
            }
            Set<String> contextAtoms = new TreeSet<>(left.context());
            contextAtoms.retainAll(before.canonicalAtomicIds);
            contextAtoms.addAll(left.roles().atomicTargets());
            Object leftMastered = fullMasteryPrerequisites(left.graph(), left.topology());
            Object rightMastered = fullMasteryPrerequisites(right.graph(), right.topology());
            for (String atom : contextAtoms) {
                assertThat(right.topology().transitivePrerequisites(atom)).as("Physics full atomic demand %s: %s", atom, scope)
                        .isEqualTo(left.topology().transitivePrerequisites(atom));
                if (!left.roles().atomicTargets().contains(atom)) continue;
                assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), atom, rightMastered))
                        .as("Physics effective role validity %s: %s", atom, scope)
                        .isEqualTo(roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), atom, leftMastered));
                rolePairs++;
            }
            for (String math : mathAtoms) {
                assertThat(right.context().contains(math)).as("actual foreign Math compiler-context reach %s: %s", math, scope)
                        .isEqualTo(left.context().contains(math));
                assertThat(right.roles().targets().contains(math)).isEqualTo(left.roles().targets().contains(math));
                assertThat(right.roles().support().contains(math)).isEqualTo(left.roles().support().contains(math));
                if (left.context().contains(math)) mathContextReached.get(math).add(scope);
            }
            Map<String, Double> all = new TreeMap<>();
            left.graph().keySet().forEach(id -> all.put(id, 1.0));
            Object previousBefore = ReflectionTestUtils.getField(before.service, "completionApplicationService");
            Object previousAfter = ReflectionTestUtils.getField(after.service, "completionApplicationService");
            var beforeApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(),
                    prior.documentDigests().get(PHYSICS_SOURCE).current(), true));
            var afterApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(),
                    current.documentDigests().get(PHYSICS_SOURCE).current(), true));
            ReflectionTestUtils.setField(before.service, "completionApplicationService", beforeApplication);
            ReflectionTestUtils.setField(after.service, "completionApplicationService", afterApplication);
            try {
                CompiledCompletionProfile leftCompletion = ReflectionTestUtils.invokeMethod(before.service, "compileCompletionScope",
                        left.learner(), "automatic:personal-curriculum", left.projection(), left.graph());
                CompiledCompletionProfile rightCompletion = ReflectionTestUtils.invokeMethod(after.service, "compileCompletionScope",
                        right.learner(), "automatic:personal-curriculum", right.projection(), right.graph());
                Map<String, Set<String>> leftAssessmentDemand = new TreeMap<>(), rightAssessmentDemand = new TreeMap<>();
                leftCompletion.assessmentGoalIds().forEach(id ->
                        leftAssessmentDemand.put(id, left.topology().transitivePrerequisites(id)));
                rightCompletion.assessmentGoalIds().forEach(id ->
                        rightAssessmentDemand.put(id, right.topology().transitivePrerequisites(id)));
                for (Map<String, Double> masteryCase : List.of(Map.<String, Double>of(), all)) {
                    CompletionEvaluation original = beforeApplication.evaluate(leftCompletion, masteryCase);
                    assertPhysicsCompletionPreserved(original, afterApplication.evaluate(rightCompletion, masteryCase),
                            leftCompletion, rightCompletion, left, right, masteryCase, leftAssessmentDemand, rightAssessmentDemand,
                            "Physics whole-scope completion: " + scope);
                    if (!completionWitnessNegativesChecked && !original.blockedByGoalIds().isEmpty()) {
                        assertPhysicsCompletionWitnessNegatives(leftCompletion, left, leftAssessmentDemand, masteryCase, original);
                        completionWitnessNegativesChecked = true;
                    }
                    assertThat(original.complete()).as("Physics all-open/all-closed completion control: %s", scope)
                            .isEqualTo(!masteryCase.isEmpty());
                    completionPairs++;
                }
                for (String atom : allProbes) {
                    boolean target = left.roles().atomicTargets().contains(atom);
                    assertThat(right.roles().atomicTargets().contains(atom)).as("Physics actual target exposure %s: %s", atom, scope).isEqualTo(target);
                    assertThat(right.context().contains(atom)).as("Physics source context reach %s: %s", atom, scope)
                            .isEqualTo(left.context().contains(atom));
                    if (!target) continue;
                    runtimeReachedUnion.get(atom).add(scope);
                    for (String source : physicsSources) if (PHYSICS_PROBES_BY_SOURCE.get(source).contains(atom)) {
                        sourceRuntimeReachedUnion.get(source).add(scope);
                        sourceProbeReached.get(source + "->" + atom).add(scope);
                    }
                    Set<String> demand = left.topology().transitivePrerequisites(atom);
                    boolean roleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), atom, leftMastered);
                    if (roleValid) assertThat(demand).as("meaningful Physics prerequisite control %s: %s", atom, scope).isNotEmpty();
                    (roleValid ? validRoleReached : invalidRoleReached).get(atom).add(scope);
                    Map<String, Double> prepared = new TreeMap<>();
                    demand.forEach(id -> prepared.put(id, 1.0));
                    assertThat(prepared).doesNotContainKey(atom);
                    Map<String, Double> missing = new TreeMap<>(prepared);
                    if (!demand.isEmpty()) missing.remove(demand.stream().sorted().findFirst().orElseThrow());
                    List<AtomicFrontierCase> cases = List.of(
                            new AtomicFrontierCase("physics-normal-empty", Map.of(), null, false, null),
                            new AtomicFrontierCase("physics-normal-prepared-source-open", prepared, null, false, roleValid),
                            new AtomicFrontierCase("physics-strict-prepared-source-open", prepared, null, true, roleValid),
                            new AtomicFrontierCase("physics-strict-missing-one", missing, null, true, null),
                            new AtomicFrontierCase("physics-strict-empty", Map.of(), null, true, false),
                            new AtomicFrontierCase("physics-normal-single-source-focus", Map.of(), Set.of(atom), false, roleValid),
                            new AtomicFrontierCase("physics-strict-single-source-focus", Map.of(), Set.of(atom), true, false));
                    for (AtomicFrontierCase probe : cases) {
                        boolean original = atomicFrontierProbe(before.service, left, atom, probe);
                        assertThat(atomicFrontierProbe(after.service, right, atom, probe))
                                .as("Physics normal/strict/focus frontier %s/%s: %s", atom, probe.name(), scope).isEqualTo(original);
                        if (!roleValid) {
                            assertThat(original).as("invalid Physics roles fail closed %s/%s: %s", atom, probe.name(), scope).isFalse();
                            invalidRolePairs++;
                        }
                        if (probe.expected() != null) assertThat(original).as("real Physics frontier control %s/%s: %s", atom, probe.name(), scope)
                                .isEqualTo(probe.expected());
                        if (roleValid && "physics-strict-prepared-source-open".equals(probe.name()) && original) {
                            positiveControls++;
                            positiveReached.get(atom).add(scope);
                        }
                        if (roleValid && "physics-strict-empty".equals(probe.name()) && !original) {
                            negativeControls++;
                            negativeReached.get(atom).add(scope);
                        }
                        frontierPairs++;
                    }
                    // Record invalid coverage only after every unchanged seven-case frontier control passed.
                    if (!roleValid) failClosedReached.get(atom).add(scope);
                    for (String math : mathDemandByProbe.getOrDefault(atom, Set.of())) {
                        assertThat(demand).as("actual foreign atomic demand %s->%s: %s", atom, math, scope).contains(math);
                        String consumerPair = atom + "->" + math;
                        mathConsumerTargets.get(consumerPair).add(scope);
                        (roleValid ? mathValidConsumers : mathInvalidConsumers).get(consumerPair).add(scope);
                        // Deliberately remove one actual foreign acquisition target from an otherwise
                        // unchanged real projection; mastery/focus cannot repair that missing learning target.
                        assertThat(roleProbeWithPrerequisites(before.service, left.graph(),
                                withoutAcquisitionTarget(left.projection(), math), atom, leftMastered))
                                .as("missing foreign Math acquisition target fails closed before %s->%s: %s", atom, math, scope).isFalse();
                        assertThat(roleProbeWithPrerequisites(after.service, right.graph(),
                                withoutAcquisitionTarget(right.projection(), math), atom, rightMastered))
                                .as("missing foreign Math acquisition target fails closed after %s->%s: %s", atom, math, scope).isFalse();
                        invalidRolePairs++;
                        Map<String, Double> missingMath = new TreeMap<>(prepared);
                        missingMath.remove(math);
                        for (AtomicFrontierCase probe : List.of(
                                new AtomicFrontierCase("physics-math-strict-prepared", prepared, null, true, roleValid),
                                new AtomicFrontierCase("physics-math-strict-one-open", missingMath, null, true, null),
                                new AtomicFrontierCase("physics-math-normal-single-source-focus", missingMath, Set.of(atom), false, roleValid),
                                new AtomicFrontierCase("physics-math-strict-single-source-focus", missingMath, Set.of(atom), true, null))) {
                            boolean original = atomicFrontierProbe(before.service, left, atom, probe);
                            assertThat(atomicFrontierProbe(after.service, right, atom, probe))
                                    .as("actual foreign Math normal/strict/focus control %s->%s/%s: %s", atom, math, probe.name(), scope)
                                    .isEqualTo(original);
                            if (probe.expected() != null) assertThat(original).isEqualTo(probe.expected());
                            if (roleValid && "physics-math-strict-prepared".equals(probe.name()) && original) {
                                mathPositiveReached.get(math).add(scope);
                                mathPairPositive.get(consumerPair).add(scope);
                            }
                            if (roleValid && "physics-math-strict-one-open".equals(probe.name()) && !original) {
                                mathNegativeReached.get(math).add(scope);
                                mathPairNegative.get(consumerPair).add(scope);
                            }
                            if (!roleValid) {
                                assertThat(original).as("invalid foreign-demand role controls fail closed").isFalse();
                                invalidRolePairs++;
                            }
                            frontierPairs++;
                        }
                        // Eligibility belongs to this real consumer pair, not to the whole Math/scope union.
                        if (!roleValid) mathPairFailClosed.get(consumerPair).add(scope);
                        for (Map<String, Double> masteryCase : List.of(prepared, missingMath)) {
                            assertPhysicsCompletionPreserved(beforeApplication.evaluate(leftCompletion, masteryCase),
                                    afterApplication.evaluate(rightCompletion, masteryCase), leftCompletion, rightCompletion,
                                    left, right, masteryCase, leftAssessmentDemand, rightAssessmentDemand,
                                    "foreign Math prerequisite completion input " + atom + "->" + math + ": " + scope);
                            Map<String, Double> originalEffective = ReflectionTestUtils.invokeMethod(before.service,
                                    "computeEffectiveMastery", left.graph(), masteryCase);
                            Map<String, Double> finalEffective = ReflectionTestUtils.invokeMethod(after.service,
                                    "computeEffectiveMastery", right.graph(), masteryCase);
                            assertThat(finalEffective).as("foreign Math effective mastery input %s->%s: %s", atom, math, scope)
                                    .isEqualTo(originalEffective);
                            completionPairs++;
                        }
                    }
                    Map<String, Double> masteredSourceLeafOpen = new TreeMap<>(missing);
                    masteredSourceLeafOpen.put(atom, 1.0);
                    for (Map<String, Double> masteryCase : List.of(prepared, missing, masteredSourceLeafOpen)) {
                        assertPhysicsCompletionPreserved(beforeApplication.evaluate(leftCompletion, masteryCase),
                                afterApplication.evaluate(rightCompletion, masteryCase), leftCompletion, rightCompletion,
                                left, right, masteryCase, leftAssessmentDemand, rightAssessmentDemand,
                                "Physics complete evaluation for source/prerequisite state " + atom + ": " + scope);
                        Map<String, Double> originalEffective = ReflectionTestUtils.invokeMethod(before.service, "computeEffectiveMastery", left.graph(), masteryCase);
                        Map<String, Double> finalEffective = ReflectionTestUtils.invokeMethod(after.service, "computeEffectiveMastery", right.graph(), masteryCase);
                        assertThat(finalEffective).as("Physics effective mastery %s: %s", atom, scope).isEqualTo(originalEffective);
                        completionPairs++;
                    }
                }
            } finally {
                ReflectionTestUtils.setField(before.service, "completionApplicationService", previousBefore);
                ReflectionTestUtils.setField(after.service, "completionApplicationService", previousAfter);
            }
        }
        assertThat(completedScopes + incompleteScopes).isEqualTo(leftDiscovery.configurations().size());
        assertThat(completedScopes).isPositive();
        assertThat(incompleteScopes).as("actual incomplete-curriculum method controls must be reached").isPositive();
        assertThat(incomplete409Responses).as("paired actual planning-method controls").isEqualTo(2 * incompleteScopes);
        assertPhysicsProbeExposureDomain(allProbes, runtimeReachedUnion, unavailableProbes, canonicalProbeCoverage);
        for (String atom : allProbes) {
            assertPhysicsCoverageLedger("Physics " + atom, runtimeReachedUnion.get(atom), validRoleReached.get(atom),
                    invalidRoleReached.get(atom), positiveReached.get(atom), negativeReached.get(atom), failClosedReached.get(atom));
        }
        // Preserve all 144 operation sources and all 175 source/atomic-probe provenance pairs.
        // A cluster source is represented by its reviewed atomic descendants, never raw cluster reachability.
        sourceRuntimeReachedUnion.forEach((source, scopes) -> {
            Set<String> expected = new TreeSet<>();
            PHYSICS_PROBES_BY_SOURCE.get(source).forEach(atom -> expected.addAll(runtimeReachedUnion.get(atom)));
            assertThat(scopes).as("actual source/descendant target union %s", source).isEqualTo(expected);
            if (scopes.isEmpty()) {
                assertThat(unavailableProbes).containsAll(PHYSICS_PROBES_BY_SOURCE.get(source));
                assertThat(canonicalProbeCoverage).containsAll(PHYSICS_PROBES_BY_SOURCE.get(source));
            }
        });
        sourceProbeReached.forEach((pair, scopes) -> {
            String atom = pair.substring(pair.indexOf("->") + 2);
            assertThat(scopes).as("complete actual source/probe exposure %s", pair).isEqualTo(runtimeReachedUnion.get(atom));
            if (scopes.isEmpty()) {
                assertThat(unavailableProbes).contains(atom);
                assertThat(canonicalProbeCoverage).contains(atom);
            }
        });
        for (String math : mathAtoms) {
            Set<String> actualConsumers = new TreeSet<>(), eligibleConsumers = new TreeSet<>();
            mathDemandByProbe.forEach((atom, maths) -> {
                if (!maths.contains(math)) return;
                String pair = atom + "->" + math;
                assertThat(mathConsumerTargets.get(pair)).as("all real consumer scopes %s", pair).isEqualTo(runtimeReachedUnion.get(atom));
                assertPhysicsCoverageLedger("Math consumer " + pair, mathConsumerTargets.get(pair), mathValidConsumers.get(pair),
                        mathInvalidConsumers.get(pair), mathPairPositive.get(pair), mathPairNegative.get(pair), mathPairFailClosed.get(pair));
                actualConsumers.addAll(mathConsumerTargets.get(pair));
                eligibleConsumers.addAll(mathValidConsumers.get(pair));
            });
            assertThat(actualConsumers).as("Math has an actual target consumer %s", math).isNotEmpty();
            assertThat(mathContextReached.get(math)).as("actual Math context %s", math).isNotEmpty().containsAll(actualConsumers);
            assertThat(mathPositiveReached.get(math)).as("Math positives are exactly role-valid consumer scopes %s", math).isEqualTo(eligibleConsumers);
            assertThat(mathNegativeReached.get(math)).as("Math negatives are exactly role-valid consumer scopes %s", math).isEqualTo(eligibleConsumers);
        }
        assertThat(rolePairs).isPositive();
        assertThat(frontierPairs).isPositive();
        assertThat(completionPairs).isPositive();
        assertThat(completionWitnessNegativesChecked).as("fake, mastered and unrelated blocking-consumer negatives reached").isTrue();
        assertThat(invalidRolePairs).as("actual and deliberately missing foreign-role negative controls").isPositive();
        assertThat(positiveControls).isPositive();
        assertThat(negativeControls).isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) assertThat(Files.readAllBytes(source.getKey())).isEqualTo(source.getValue());
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).isEqualTo(registryBytes);
        System.out.printf("PHYSICS_BATCH_FINAL_V7_NATIVE_COVERAGE baseline=after-German-with-current-V7-caches current=after-Physics-with-current-V7-caches finalCatalogBoundSeparately=true cacheSources=27 priorRegisteredSources=%d registeredSources=%d physicsBatchSources=%d affectedAtomicProbes=%d nativeAtomicProbes=%d sourceProbePairs=175 foreignMathRawReferences=162 foreignMathAtoms=54 discoveredConfigurations=%d completedScopes=%d incompleteScopes=%d incomplete409Responses=%d sourceRuntimeReachedUnion=%s sourceProbeReached=%s runtimeReachedUnion=%s mathContextReached=%s mathPositiveReached=%s mathNegativeReached=%s rolePairs=%d frontierPairs=%d completionPairs=%d positiveControls=%d negativeControls=%d invalidRolePairs=%d completionWitnessNegativeControls=3 canonicalAtomicProbeCoverage=%s unavailableCompatibilityProbes=%s validRoleReached=%s invalidRoleReached=%s failClosedReached=%s mathConsumerTargets=%s mathValidConsumers=%s mathInvalidConsumers=%s mathPairPositive=%s mathPairNegative=%s mathPairFailClosed=%s publicPositiveFrontierListCoverage=false nodeProofCoverage=false%n",
                prior.changedSources().size(), current.changedSources().size(), physicsSources.size(), affectedProbes.size(), allProbes.size(),
                leftDiscovery.configurations().size(), completedScopes, incompleteScopes, incomplete409Responses,
                sourceRuntimeReachedUnion, sourceProbeReached, runtimeReachedUnion, mathContextReached, mathPositiveReached, mathNegativeReached,
                rolePairs, frontierPairs, completionPairs, positiveControls, negativeControls, invalidRolePairs,
                canonicalProbeCoverage, unavailableProbes, validRoleReached, invalidRoleReached, failClosedReached,
                mathConsumerTargets, mathValidConsumers, mathInvalidConsumers, mathPairPositive, mathPairNegative, mathPairFailClosed);
    }

    @Test
    void batchedChemistrySourcesPreserveFinalCurrentNativeAtomicDemandRolesAndFrontier() throws Exception {
        // Raw bytes were checked against the separately frozen Chemistry candidate manifest.
        NativeV7Boundary boundary = readNativeV7Boundary();
        JsonNode active = boundary.registry();
        assertThat(rawByteHash(boundary.bytes())).isEqualTo(CHEMISTRY_V7_WRAPPER_DIGEST);
        assertThat(active.path("parentRegistryRawDigest").asText()).isEqualTo(CHEMISTRY_V6_PARENT_DIGEST);
        NativeV6Frame cacheFrame = readApplicabilityRefreshFrame(active, boundary.documents());
        JsonNode declared = cacheFrame.registry();
        assertThat(declared.path("batches")).hasSize(3);
        JsonNode chemistryBatch = declared.path("batches").get(2);
        assertThat(chemistryBatch.path("id").asText()).isEqualTo("ch-complete-atomic-prerequisites-and-transitive-reduction");
        assertThat(rawHash(chemistryBatch)).isEqualTo("sha256:866aa0455fd0b6b118f0c7f72d5dd78a09227dec07e230125801a2ad61e6ac05");
        assertThat(rawByteHash(Files.readAllBytes(CHEMISTRY_SOURCE)))
                .isEqualTo("sha256:e29c271e797956c4679e211034b6ad83a0e5a45ef1da25f3d39166657eaf4b5d");
        assertThat(chemistryBatch.path("previousDigest").asText())
                .isEqualTo("sha256:905c70b6a80683d4d5a7c1024568ce672f60a0aecbb33f264a85c97448b3bc8f");
        Path physicsParentPath = exactRegularRepositoryFile(
                "curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry-v6-physics-20261109.json");
        assertThat(rawByteHash(Files.readAllBytes(physicsParentPath)))
                .isEqualTo("sha256:dd38bd85793769d2afae6b34a3b0b89112c497ee1b17b54f92a61af5bf785c93");
        JsonNode physicsParent = MAPPER.readTree(physicsParentPath.toFile());
        for (int index = 0; index < 2; index++) assertThat(declared.path("batches").get(index))
                .as("immutable complete historical batch %s", index).isEqualTo(physicsParent.path("batches").get(index));
        BatchNativeFrames frames = readBatchedReductionRegistry(declared, cacheFrame.documents());
        CurrentCacheComparisonFrames comparison = currentChemistryCacheFrames(active, cacheFrame, frames);
        ReductionRegistry prior = comparison.before(), current = comparison.after();
        assertThat(prior.changedSources()).hasSize(881);
        assertThat(current.changedSources()).hasSize(1062);
        assertThat(chemistryBatch.path("operations")).hasSize(1308);
        assertThat(chemistryBatch.path("legacyContinuations")).hasSize(2);
        Set<String> chemistrySources = new TreeSet<>(), operationSources = new TreeSet<>();
        for (JsonNode original : chemistryBatch.path("originalRequires")) {
            String[] id = qualifiedIdentity(original.path("source").asText());
            assertThat(id[0]).isEqualTo(CHEMISTRY);
            assertThat(chemistrySources.add(id[1])).isTrue();
        }
        int materializations = 0, clusterTargets = 0, clusterSources = 0, atomicCuts = 0;
        for (JsonNode operation : chemistryBatch.path("operations")) {
            List<JsonNode> steps = new ArrayList<>();
            if (operation.has("step")) steps.add(operation.path("step"));
            else operation.path("steps").forEach(steps::add);
            assertThat(steps).isNotEmpty();
            for (JsonNode step : steps) {
                String[] id = qualifiedIdentity(step.path("source").asText());
                assertThat(id[0]).as("only authored Chemistry operation sources").isEqualTo(CHEMISTRY);
                operationSources.add(id[1]);
                switch (step.path("operation").asText()) {
                    case "materialize-atomic" -> materializations++;
                    case "remove-cluster-target" -> clusterTargets++;
                    case "remove-cluster" -> clusterSources++;
                    default -> { assertThat(step.has("witness")).isTrue(); atomicCuts++; }
                }
            }
        }
        assertThat(materializations).isEqualTo(578);
        assertThat(clusterTargets).isEqualTo(46);
        assertThat(clusterSources).isEqualTo(11);
        assertThat(atomicCuts).isEqualTo(673);
        assertThat(chemistrySources).hasSize(181).isEqualTo(operationSources);
        assertThat(chemistrySources).doesNotContainAnyElementsOf(prior.changedSources().keySet());
        assertThat(chemistrySources.stream().filter(id -> current.changedSources().get(id).atomicSource()).count()).isEqualTo(171);
        assertThat(chemistrySources.stream().filter(id -> !current.changedSources().get(id).atomicSource()).count()).isEqualTo(10);
        Set<String> expectedUnion = new TreeSet<>(prior.changedSources().keySet());
        expectedUnion.addAll(chemistrySources);
        assertThat(current.changedSources().keySet()).isEqualTo(expectedUnion);
        for (String original : List.of("bb707fda-504c-4699-a78c-d0a6c320658f", "871eabde-6e19-59d3-bc7c-60977a9837db",
                "08b44b8f-e407-5a1f-82dc-e70e598022cf", "10ce2814-8796-5633-9bed-f6990d039b91")) {
            assertThat(current.changedSources().get(original).originalRequires())
                    .as("unchanged earliest Chemistry baseline %s", original).isEqualTo(prior.changedSources().get(original).originalRequires());
            assertThat(current.changedSources().get(original).originalRequiresPresent())
                    .isEqualTo(prior.changedSources().get(original).originalRequiresPresent());
        }
        Map<String, JsonNode> priorChemistry = rawGoals(prior.currentDocuments().get(CHEMISTRY_SOURCE));
        Map<String, JsonNode> currentChemistry = rawGoals(current.currentDocuments().get(CHEMISTRY_SOURCE));
        assertThat(priorChemistry).hasSize(742);
        assertThat(chemistrySources.stream().filter(id -> !java.util.Objects.equals(
                priorChemistry.get(id).get("requires"), currentChemistry.get(id).get("requires"))).count()).isEqualTo(153);
        ObjectNode badPredecessor = declared.deepCopy();
        ((ObjectNode) badPredecessor.path("batches").get(2)).put("previousDigest", "sha256:" + "0".repeat(64));
        assertThatThrownBy(() -> readBatchedReductionRegistry(badPredecessor)).isInstanceOf(AssertionError.class);
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : current.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(prior, false);
        var after = new NativeFixture(current, false);
        assertThat(after.canonicalAtomicIds).isEqualTo(before.canonicalAtomicIds);
        assertThat(nativeChemistryApplicability(after)).isEqualTo(nativeChemistryApplicability(before));
        Map<String, Set<String>> probesBySource = new TreeMap<>();
        Set<String> allProbes = new TreeSet<>();
        for (String source : chemistrySources) {
            assertThat(current.changedSources().get(source).owner()).isEqualTo(CHEMISTRY);
            Set<String> atoms = canonicalAtomicDescendants(source, before.canonicalGoals);
            assertThat(canonicalAtomicDescendants(source, after.canonicalGoals)).isEqualTo(atoms);
            assertThat(after.atomicProbesBySource.get(source)).isEqualTo(atoms);
            probesBySource.put(source, new TreeSet<>(atoms));
            allProbes.addAll(atoms);
        }
        assertThat(allProbes).hasSize(174);
        assertThat(probesBySource.values().stream().mapToInt(Set::size).sum()).isEqualTo(241);
        assertThat(rawHash(MAPPER.valueToTree(probesBySource))).isEqualTo("sha256:bf5118a166f46f2604567531d242195b90c0d10fcd48ce12e2cce8226ccf4714");
        Set<String> unavailableProbes = physicsUnavailableCompatibilityProbes(before, after, allProbes);
        Set<String> canonicalProbeCoverage = assertChemistryCanonicalDemands(before, after, priorChemistry, allProbes, unavailableProbes);
        Discovery leftDiscovery = discover(before, CHEMISTRY, readGuiOfferings().path(CHEMISTRY));
        Discovery rightDiscovery = discover(after, CHEMISTRY, readGuiOfferings().path(CHEMISTRY));
        assertThat(rightDiscovery).as("actual Chemistry planner, GUI and independently resolved GK/LK configurations").isEqualTo(leftDiscovery);
        assertThat(leftDiscovery.configurations()).isNotEmpty();
        Map<String, Set<String>> sourceRuntimeReachedUnion = new TreeMap<>(), sourceProbeReached = new TreeMap<>();
        Map<String, Set<String>> runtimeReachedUnion = new TreeMap<>(), positiveReached = new TreeMap<>(), negativeReached = new TreeMap<>();
        Map<String, Set<String>> validRoleReached = new TreeMap<>(), invalidRoleReached = new TreeMap<>(), failClosedReached = new TreeMap<>();
        probesBySource.forEach((source, atoms) -> {
            sourceRuntimeReachedUnion.put(source, new TreeSet<>());
            atoms.forEach(atom -> sourceProbeReached.put(source + "->" + atom, new TreeSet<>()));
        });
        allProbes.forEach(atom -> {
            for (Map<String, Set<String>> ledger : List.of(runtimeReachedUnion, positiveReached, negativeReached,
                    validRoleReached, invalidRoleReached, failClosedReached)) ledger.put(atom, new TreeSet<>());
        });
        Map<String, Set<String>> assessmentBasisReached = new TreeMap<>();
        CHEMISTRY_ASSESSMENT_CLUSTER_BASIS.keySet().forEach(id -> assessmentBasisReached.put(id, new TreeSet<>()));
        LearnerService beforePublic = org.mockito.Mockito.spy(before.service), afterPublic = org.mockito.Mockito.spy(after.service);
        String probeId = "unsaved-chemistry-batch-native-control";
        boolean completionWitnessNegativesChecked = false;
        long rolePairs = 0, frontierPairs = 0, completionPairs = 0, positiveControls = 0, negativeControls = 0, invalidRolePairs = 0;
        int completedScopes = 0, incompleteScopes = 0, incomplete409Responses = 0, combinedScopeComparisons = 0;
        for (var configuration : leftDiscovery.configurations().entrySet()) {
            String scope = configuration.getKey();
            List<PersonalizationPlan> plans = new ArrayList<>();
            for (NativeFixture fixture : List.of(before, after)) plans.add(CurriculumPersonalizationPlanner.plan(
                    ROOT, fixture.landscapes::getById,
                    (subject, settings) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", subject, settings),
                    configuration.getValue()));
            assertThat(plans.get(1)).as("real Chemistry personal-curriculum validity: %s", scope).isEqualTo(plans.get(0));
            if (!plans.get(0).valid() || plans.get(0).required()) {
                assertThat(leftDiscovery.plannerScopes()).doesNotContain(scope);
                assertThat(rightDiscovery.plannerScopes()).doesNotContain(scope);
                for (LearnerService service : List.of(beforePublic, afterPublic)) {
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(configuration.getValue()));
                    org.mockito.Mockito.doReturn(learner).when(service).getLearner(probeId);
                    try {
                        service.getPlanningScope(probeId, CHEMISTRY);
                        throw new AssertionError("Incomplete Chemistry personal curriculum unexpectedly accepted: " + scope);
                    } catch (org.springframework.web.server.ResponseStatusException expected) {
                        assertThat(expected.getStatusCode().value()).isEqualTo(409);
                        assertThat(expected.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                        incomplete409Responses++;
                    }
                }
                incompleteScopes++;
                continue;
            }
            completedScopes++;
            NativeScope left = before.resolve(configuration.getValue()), right = after.resolve(rightDiscovery.configurations().get(scope));
            assertThat(right.roles()).as("Chemistry roles: %s", scope).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("Chemistry native graph: %s", scope).isEqualTo(left.graph().keySet());
            assertThat(right.context()).as("Chemistry compiler context: %s", scope).isEqualTo(left.context());
            assertThat(projectedApplicability(right)).as("Chemistry projected applicability: %s", scope).isEqualTo(projectedApplicability(left));
            for (String unavailable : unavailableProbes) {
                assertPhysicsUnavailableInActualScope(left, unavailable, scope);
                assertPhysicsUnavailableInActualScope(right, unavailable, scope);
            }
            assertChemistryProjectionPreserved(left, right, scope);
            for (var basis : CHEMISTRY_ASSESSMENT_CLUSTER_BASIS.entrySet()) {
                if (!left.roles().targets().contains(basis.getKey())) continue;
                assertChemistryAssessmentClusterBasis(left, basis.getKey(), basis.getValue(), scope);
                assertChemistryAssessmentClusterBasis(right, basis.getKey(), basis.getValue(), scope);
                assessmentBasisReached.get(basis.getKey()).add(scope);
            }
            if ("GK+LK".equals(configuration.getValue().get(CHEMISTRY).get("filterId"))) {
                // Preserve the actual authoritative combined scope, including its established
                // joint course filtering; do not substitute a newly invented single-scope union.
                String combined = MAPPER.writeValueAsString(configuration.getValue());
                assertThat(after.service.getFilteredAtomicGoalIds(ROOT, combined, null, false))
                        .as("actual combined-scope public atomic target identity %s", scope)
                        .isEqualTo(before.service.getFilteredAtomicGoalIds(ROOT, combined, null, false));
                combinedScopeComparisons++;
            }
            Set<String> contextAtoms = new TreeSet<>(left.context());
            contextAtoms.retainAll(before.canonicalAtomicIds);
            contextAtoms.addAll(left.roles().atomicTargets());
            Object leftMastered = fullMasteryPrerequisites(left.graph(), left.topology());
            Object rightMastered = fullMasteryPrerequisites(right.graph(), right.topology());
            for (String atom : contextAtoms) {
                assertThat(right.topology().transitivePrerequisites(atom)).as("Chemistry full atomic demand %s: %s", atom, scope)
                        .isEqualTo(left.topology().transitivePrerequisites(atom));
                if (!left.roles().atomicTargets().contains(atom)) continue;
                assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), atom, rightMastered))
                        .as("Chemistry effective role validity %s: %s", atom, scope)
                        .isEqualTo(roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), atom, leftMastered));
                rolePairs++;
            }

            Map<String, Double> all = new TreeMap<>();
            left.graph().keySet().forEach(id -> all.put(id, 1.0));
            Object previousBefore = ReflectionTestUtils.getField(before.service, "completionApplicationService");
            Object previousAfter = ReflectionTestUtils.getField(after.service, "completionApplicationService");
            var beforeApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(),
                    prior.documentDigests().get(CHEMISTRY_SOURCE).current(), true));
            var afterApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(),
                    current.documentDigests().get(CHEMISTRY_SOURCE).current(), true));
            ReflectionTestUtils.setField(before.service, "completionApplicationService", beforeApplication);
            ReflectionTestUtils.setField(after.service, "completionApplicationService", afterApplication);
            try {
                CompiledCompletionProfile leftCompletion = ReflectionTestUtils.invokeMethod(before.service, "compileCompletionScope",
                        left.learner(), "automatic:personal-curriculum", left.projection(), left.graph());
                CompiledCompletionProfile rightCompletion = ReflectionTestUtils.invokeMethod(after.service, "compileCompletionScope",
                        right.learner(), "automatic:personal-curriculum", right.projection(), right.graph());
                Map<String, Set<String>> leftAssessmentDemand = new TreeMap<>(), rightAssessmentDemand = new TreeMap<>();
                leftCompletion.assessmentGoalIds().forEach(id ->
                        leftAssessmentDemand.put(id, left.topology().transitivePrerequisites(id)));
                rightCompletion.assessmentGoalIds().forEach(id ->
                        rightAssessmentDemand.put(id, right.topology().transitivePrerequisites(id)));
                for (var basis : CHEMISTRY_ASSESSMENT_CLUSTER_BASIS.entrySet()) {
                    String anchor = basis.getKey();
                    if (!left.roles().targets().contains(anchor)) continue;
                    Map<String, Double> anchorOnlyMastery = Map.of(anchor, 1.0);
                    CompletionEvaluation original = beforeApplication.evaluate(leftCompletion, anchorOnlyMastery);
                    CompletionEvaluation reduced = afterApplication.evaluate(rightCompletion, anchorOnlyMastery);
                    assertPhysicsCompletionPreserved(original, reduced, leftCompletion, rightCompletion, left, right,
                            anchorOnlyMastery, leftAssessmentDemand, rightAssessmentDemand,
                            "Chemistry cluster mastery does not replace child assessments " + anchor + ": " + scope);
                    assertChemistryClusterMasteryDoesNotTransfer(before.service, left, anchorOnlyMastery, original, basis.getValue(), scope);
                    assertChemistryClusterMasteryDoesNotTransfer(after.service, right, anchorOnlyMastery, reduced, basis.getValue(), scope);
                    completionPairs++;
                }
                for (Map<String, Double> masteryCase : List.of(Map.<String, Double>of(), all)) {
                    CompletionEvaluation original = beforeApplication.evaluate(leftCompletion, masteryCase);
                    assertPhysicsCompletionPreserved(original, afterApplication.evaluate(rightCompletion, masteryCase),
                            leftCompletion, rightCompletion, left, right, masteryCase, leftAssessmentDemand, rightAssessmentDemand,
                            "Chemistry whole-scope completion: " + scope);
                    if (!completionWitnessNegativesChecked && !original.blockedByGoalIds().isEmpty()) {
                        assertPhysicsCompletionWitnessNegatives(leftCompletion, left, leftAssessmentDemand, masteryCase, original);
                        completionWitnessNegativesChecked = true;
                    }
                    assertThat(original.complete()).as("Chemistry all-open/all-closed completion control: %s", scope)
                            .isEqualTo(!masteryCase.isEmpty());
                    completionPairs++;
                }
                for (String atom : allProbes) {
                    boolean target = left.roles().atomicTargets().contains(atom);
                    assertThat(right.roles().atomicTargets().contains(atom)).as("Chemistry actual target exposure %s: %s", atom, scope).isEqualTo(target);
                    assertThat(right.context().contains(atom)).as("Chemistry source context reach %s: %s", atom, scope)
                            .isEqualTo(left.context().contains(atom));
                    if (!target) continue;
                    runtimeReachedUnion.get(atom).add(scope);
                    for (String source : chemistrySources) if (probesBySource.get(source).contains(atom)) {
                        sourceRuntimeReachedUnion.get(source).add(scope);
                        sourceProbeReached.get(source + "->" + atom).add(scope);
                    }
                    Set<String> demand = left.topology().transitivePrerequisites(atom);
                    boolean roleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), atom, leftMastered);
                    if (roleValid) assertThat(demand).as("meaningful Chemistry prerequisite control %s: %s", atom, scope).isNotEmpty();
                    if (roleValid) {
                        assertChemistryMissingRoleControls(before.service, left, atom, scope);
                        assertChemistryMissingRoleControls(after.service, right, atom, scope);
                        invalidRolePairs += 6;
                    }
                    (roleValid ? validRoleReached : invalidRoleReached).get(atom).add(scope);
                    Map<String, Double> prepared = new TreeMap<>();
                    demand.forEach(id -> prepared.put(id, 1.0));
                    assertThat(prepared).doesNotContainKey(atom);
                    Map<String, Double> missing = new TreeMap<>(prepared);
                    if (!demand.isEmpty()) missing.remove(demand.stream().sorted().findFirst().orElseThrow());
                    List<AtomicFrontierCase> cases = List.of(
                            new AtomicFrontierCase("chemistry-normal-empty", Map.of(), null, false, null),
                            new AtomicFrontierCase("chemistry-normal-prepared-source-open", prepared, null, false, roleValid),
                            new AtomicFrontierCase("chemistry-strict-prepared-source-open", prepared, null, true, roleValid),
                            new AtomicFrontierCase("chemistry-strict-missing-one", missing, null, true, null),
                            new AtomicFrontierCase("chemistry-strict-empty", Map.of(), null, true, false),
                            new AtomicFrontierCase("chemistry-normal-single-source-focus", Map.of(), Set.of(atom), false, roleValid),
                            new AtomicFrontierCase("chemistry-strict-single-source-focus", Map.of(), Set.of(atom), true, false));
                    for (AtomicFrontierCase probe : cases) {
                        boolean original = atomicFrontierProbe(before.service, left, atom, probe);
                        assertThat(atomicFrontierProbe(after.service, right, atom, probe))
                                .as("Chemistry normal/strict/focus frontier %s/%s: %s", atom, probe.name(), scope).isEqualTo(original);
                        if (!roleValid) {
                            assertThat(original).as("invalid Chemistry roles fail closed %s/%s: %s", atom, probe.name(), scope).isFalse();
                            invalidRolePairs++;
                        }
                        if (probe.expected() != null) assertThat(original).as("real Chemistry frontier control %s/%s: %s", atom, probe.name(), scope)
                                .isEqualTo(probe.expected());
                        if (roleValid && "chemistry-strict-prepared-source-open".equals(probe.name()) && original) {
                            positiveControls++;
                            positiveReached.get(atom).add(scope);
                        }
                        if (roleValid && "chemistry-strict-empty".equals(probe.name()) && !original) {
                            negativeControls++;
                            negativeReached.get(atom).add(scope);
                        }
                        frontierPairs++;
                    }
                    // Record invalid coverage only after every unchanged seven-case frontier control passed.
                    if (!roleValid) failClosedReached.get(atom).add(scope);

                    Map<String, Double> masteredSourceLeafOpen = new TreeMap<>(missing);
                    masteredSourceLeafOpen.put(atom, 1.0);
                    for (Map<String, Double> masteryCase : List.of(prepared, missing, masteredSourceLeafOpen)) {
                        assertPhysicsCompletionPreserved(beforeApplication.evaluate(leftCompletion, masteryCase),
                                afterApplication.evaluate(rightCompletion, masteryCase), leftCompletion, rightCompletion,
                                left, right, masteryCase, leftAssessmentDemand, rightAssessmentDemand,
                                "Chemistry complete evaluation for source/prerequisite state " + atom + ": " + scope);
                        Map<String, Double> originalEffective = ReflectionTestUtils.invokeMethod(before.service, "computeEffectiveMastery", left.graph(), masteryCase);
                        Map<String, Double> finalEffective = ReflectionTestUtils.invokeMethod(after.service, "computeEffectiveMastery", right.graph(), masteryCase);
                        assertThat(finalEffective).as("Chemistry effective mastery %s: %s", atom, scope).isEqualTo(originalEffective);
                        completionPairs++;
                    }
                }
            } finally {
                ReflectionTestUtils.setField(before.service, "completionApplicationService", previousBefore);
                ReflectionTestUtils.setField(after.service, "completionApplicationService", previousAfter);
            }
        }
        assertThat(completedScopes + incompleteScopes).isEqualTo(leftDiscovery.configurations().size());
        assertThat(completedScopes).isPositive();
        assertThat(incompleteScopes).as("actual Chemistry incomplete-configuration controls").isPositive();
        assertThat(incomplete409Responses).isEqualTo(2 * incompleteScopes);
        assertPhysicsProbeExposureDomain(allProbes, runtimeReachedUnion, unavailableProbes, canonicalProbeCoverage);
        for (String atom : allProbes) assertPhysicsCoverageLedger("Chemistry " + atom, runtimeReachedUnion.get(atom),
                validRoleReached.get(atom), invalidRoleReached.get(atom), positiveReached.get(atom), negativeReached.get(atom), failClosedReached.get(atom));
        sourceRuntimeReachedUnion.forEach((source, scopes) -> {
            Set<String> expected = new TreeSet<>();
            probesBySource.get(source).forEach(atom -> expected.addAll(runtimeReachedUnion.get(atom)));
            assertThat(scopes).isEqualTo(expected);
            if (scopes.isEmpty()) {
                assertThat(unavailableProbes).containsAll(probesBySource.get(source));
                assertThat(canonicalProbeCoverage).containsAll(probesBySource.get(source));
            }
        });
        sourceProbeReached.forEach((pair, scopes) -> {
            String atom = pair.substring(pair.indexOf("->") + 2);
            assertThat(scopes).isEqualTo(runtimeReachedUnion.get(atom));
            if (scopes.isEmpty()) { assertThat(unavailableProbes).contains(atom); assertThat(canonicalProbeCoverage).contains(atom); }
        });
        assessmentBasisReached.forEach((anchor, scopes) ->
                assertThat(scopes).as("actual reviewed assessment-cluster basis reached %s", anchor).isNotEmpty());
        assertThat(combinedScopeComparisons).as("actual discovered combined-scope identity comparisons").isPositive();
        assertThat(rolePairs).isPositive();
        assertThat(frontierPairs).isPositive();
        assertThat(completionPairs).isPositive();
        assertThat(completionWitnessNegativesChecked).isTrue();
        assertThat(invalidRolePairs).isPositive();
        assertThat(positiveControls).isPositive();
        assertThat(negativeControls).isPositive();
        before.verifyOnlyUnsavedFixtures(); after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) assertThat(Files.readAllBytes(source.getKey())).isEqualTo(source.getValue());
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).isEqualTo(registryBytes);
        System.out.printf("CHEMISTRY_BATCH_FINAL_V7_NATIVE_COVERAGE baseline=after-Physics-with-current-27-caches current=Chemistry-final operations=1308 sources=%d atomicProbes=%d sourceProbePairs=241 discovered=%d complete=%d incomplete=%d incomplete409=%d rolePairs=%d frontierPairs=%d completionPairs=%d positive=%d negative=%d invalidRolePairs=%d runtime=%s valid=%s invalid=%s failClosed=%s sourceRuntime=%s sourceProbeRuntime=%s canonicalCoverage=%s metadataExcluded=%s publicPositiveFrontierListCoverage=false nodeProofCoverage=false%n",
                chemistrySources.size(), allProbes.size(), leftDiscovery.configurations().size(), completedScopes, incompleteScopes,
                incomplete409Responses, rolePairs, frontierPairs, completionPairs, positiveControls, negativeControls, invalidRolePairs,
                runtimeReachedUnion, validRoleReached, invalidRoleReached, failClosedReached, sourceRuntimeReachedUnion, sourceProbeReached,
                canonicalProbeCoverage, unavailableProbes);
    }

    private static CurrentCacheComparisonFrames currentChemistryCacheFrames(JsonNode wrapper, NativeV6Frame cacheFrame,
            BatchNativeFrames frames) throws IOException {
        JsonNode snapshots = wrapper.path("originalApplicability");
        assertThat(snapshots).hasSize(27);
        Map<Path, JsonNode> before = mutableDocuments(frames.afterPhysics().currentDocuments());
        Map<Path, JsonNode> after = mutableDocuments(frames.current().currentDocuments());
        copyCurrentApplicability(snapshots, cacheFrame.currentDocuments(), before);
        copyCurrentApplicability(snapshots, cacheFrame.currentDocuments(), after);
        assertThat(after).as("whole actual final Chemistry V7 catalog").isEqualTo(cacheFrame.currentDocuments());
        for (Path path : before.keySet()) {
            if (!path.equals(CHEMISTRY_SOURCE)) assertThat(after.get(path)).as("other twenty canonical documents: %s", path).isEqualTo(before.get(path));
            else {
                ObjectNode left = before.get(path).deepCopy(), right = after.get(path).deepCopy();
                for (JsonNode goal : left.path("goals")) ((ObjectNode) goal).remove("requires");
                for (JsonNode goal : right.path("goals")) ((ObjectNode) goal).remove("requires");
                assertThat(right).as("all Chemistry non-requires fields, goal order and contains").isEqualTo(left);
            }
        }
        Map<Path, JsonNode> oldBefore = mutableDocuments(before), oldAfter = mutableDocuments(after);
        restoreOriginalApplicability(snapshots, oldBefore); restoreOriginalApplicability(snapshots, oldAfter);
        assertThat(oldBefore).isEqualTo(frames.afterPhysics().currentDocuments());
        assertThat(oldAfter).isEqualTo(frames.current().currentDocuments());
        return new CurrentCacheComparisonFrames(currentCacheComparisonRegistry(frames.afterPhysics(), before),
                currentCacheComparisonRegistry(frames.current(), after));
    }

    private static Map<String, JsonNode> nativeChemistryApplicability(NativeFixture fixture) {
        Map<String, JsonNode> result = new TreeMap<>();
        for (var landscape : fixture.landscapes.getClosure(ROOT)) if (CHEMISTRY.equals(landscape.getLandscapeId()))
            for (var goal : landscape.getGoals()) result.put(goal.getId(), MAPPER.valueToTree(goal).path("applicability"));
        assertThat(result).hasSize(742); return result;
    }

    private static void assertChemistryProjectionPreserved(NativeScope before, NativeScope after, String label) {
        assertThat(ReflectionTestUtils.<Object>invokeMethod(after.projection(), "presentationRootGoalIds"))
                .as("Chemistry presentation roots %s", label)
                .isEqualTo(ReflectionTestUtils.<Object>invokeMethod(before.projection(), "presentationRootGoalIds"));
        Map<String, LearningGoal> left = ReflectionTestUtils.invokeMethod(before.projection(), "visibleGoals");
        Map<String, LearningGoal> right = ReflectionTestUtils.invokeMethod(after.projection(), "visibleGoals");
        assertThat(right.keySet()).as("Chemistry visible goal IDs %s", label).isEqualTo(left.keySet());
        left.forEach((id, goal) -> {
            ObjectNode a = MAPPER.valueToTree(goal), b = MAPPER.valueToTree(right.get(id));
            a.remove("requires"); b.remove("requires");
            assertThat(b).as("Chemistry ordered tree, text, applicability and presentation %s: %s", id, label).isEqualTo(a);
        });
    }

    private static Set<String> assertChemistryCanonicalDemands(NativeFixture before, NativeFixture after,
            Map<String, JsonNode> rawChemistry, Set<String> probes, Set<String> unavailable) throws IOException {
        var compiler = new CompletionProfileCompiler();
        var left = compiler.normalizePrerequisites(before.canonicalGoals);
        var right = compiler.normalizePrerequisites(after.canonicalGoals);
        Set<String> atoms = new TreeSet<>();
        rawChemistry.forEach((id, goal) -> { if (goal.path("contains").isEmpty()) atoms.add(id); });
        assertThat(atoms).hasSize(641).containsAll(probes);
        left.validateContext(atoms); right.validateContext(atoms);
        long pairs = 0;
        List<String> closurePairs = new ArrayList<>();
        for (String atom : atoms) {
            Set<String> demand = left.transitivePrerequisites(atom);
            assertThat(right.transitivePrerequisites(atom)).as("whole canonical Chemistry atomic demand %s", atom).isEqualTo(demand);
            assertThat(demand).doesNotContain(atom);
            // No outgoing foreign requires: every normalized prerequisite remains a Chemistry atom.
            assertThat(atoms).containsAll(demand);
            pairs += demand.size();
            for (String prerequisite : demand) closurePairs.add(CHEMISTRY + ":" + atom + "->" + CHEMISTRY + ":" + prerequisite);
        }
        assertThat(pairs).isEqualTo(6194);
        Collections.sort(closurePairs);
        assertThat(rawByteHash(MAPPER.writeValueAsBytes(closurePairs)))
                .as("actual native Chemistry R_at+ matches independently generated qualified-pair inventory")
                .isEqualTo("sha256:2227bfb66136b96af97ef934c16d45f7702d0ba78c45d10eae8f16a067a8bb95");
        for (String atom : unavailable) {
            assertThat(physicsUnavailableCompatibilityGoal(before.canonicalGoals.get(atom))).isTrue();
            assertThat(physicsUnavailableCompatibilityGoal(after.canonicalGoals.get(atom))).isTrue();
            assertThat(right.transitivePrerequisites(atom)).isEqualTo(left.transitivePrerequisites(atom));
        }
        String unknown = probes.iterator().next() + "-missing-chemistry-reference-control";
        for (var topology : List.of(left, right)) assertThatThrownBy(() -> topology.transitivePrerequisites(unknown))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("MISSING_REFERENCE"));
        return Collections.unmodifiableSet(new TreeSet<>(probes));
    }

    private static void assertChemistryAssessmentClusterBasis(NativeScope scope, String anchor,
            List<String> children, String label) {
        LearningGoal cluster = scope.graph().get(anchor);
        assertThat(cluster).as("actual canonical assessment cluster %s: %s", anchor, label).isNotNull();
        assertThat(cluster.getType()).isEqualTo("cluster");
        assertThat(cluster.getContains()).as("reviewed canonical four-child basis %s: %s", anchor, label).containsExactlyElementsOf(children);
        assertThat(scope.roles().atomicTargets()).as("a canonical cluster is not a masterable atom %s: %s", anchor, label)
                .doesNotContain(anchor).containsAll(children);
        Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(scope.projection(), "visibleGoals");
        assertThat(visible).containsKey(anchor);
        assertThat(visible.get(anchor).getContains()).as("visible reviewed assessment basis %s: %s", anchor, label)
                .containsExactlyElementsOf(children);
        for (String child : children) {
            assertThat(scope.graph()).containsKey(child);
            assertThat(scope.graph().get(child).getType()).isEqualTo("atomic");
            assertThat(scope.graph().get(child).getContains()).isEmpty();
            assertThat(visible).containsKey(child);
        }
    }

    private static void assertChemistryClusterMasteryDoesNotTransfer(LearnerService service, NativeScope scope,
            Map<String, Double> anchorOnlyMastery, CompletionEvaluation evaluation, List<String> children, String label) {
        Map<String, Double> effective = ReflectionTestUtils.invokeMethod(service, "computeEffectiveMastery", scope.graph(), anchorOnlyMastery);
        for (String child : children) assertThat(Mastery.isMastered(effective.get(child)))
                .as("cluster mastery does not become effective child mastery %s: %s", child, label).isFalse();
        assertThat(evaluation.masteredGoalIds()).as("no child mastery transfer %s", label).doesNotContainAnyElementsOf(children);
        assertThat(evaluation.masteredAssessmentGoalIds()).as("each child assessment needs its own explicit result %s", label)
                .doesNotContainAnyElementsOf(children);
        assertThat(evaluation.waivedGoalIds()).as("cluster mastery does not waive child assessments %s", label)
                .doesNotContainAnyElementsOf(children);
    }

    private static void assertChemistryMissingRoleControls(LearnerService service, NativeScope scope,
            String atom, String label) throws Exception {
        String prerequisite = scope.topology().transitivePrerequisites(atom).stream()
                .filter(scope.roles().atomicTargets()::contains).sorted().findFirst().orElseThrow();
        Object projection = withoutEmittedAcquisitionAtom(scope.projection(), prerequisite, true);
        assertThat(roleProbeWithPrerequisites(service, scope.graph(), projection, atom,
                fullMasteryPrerequisites(scope.graph(), scope.topology())))
                .as("Chemistry missing acquisition target fails despite full mastery %s: %s", atom, label).isFalse();
        NativeScope invalid = new NativeScope(scope.learner(), projection, scope.frontier(), scope.roles(), scope.graph(), scope.context(), scope.topology());
        Map<String, Double> prepared = new TreeMap<>();
        scope.topology().transitivePrerequisites(atom).forEach(id -> prepared.put(id, 1.0));
        for (AtomicFrontierCase probe : List.of(
                new AtomicFrontierCase("chemistry-missing-role-strict", prepared, null, true, false),
                new AtomicFrontierCase("chemistry-missing-role-normal-focus", prepared, Set.of(atom), false, false)))
            assertThat(atomicFrontierProbe(service, invalid, atom, probe)).as("Chemistry missing-role frontier %s: %s", probe.name(), label).isFalse();
    }

    private static boolean physicsUnavailableCompatibilityGoal(LearningGoal goal) {
        return goal != null && goal.getExtendedData() != null
                && Boolean.TRUE.equals(goal.getExtendedData().get("compatibilityOnly"))
                && "excluded".equals(goal.getExtendedData().get("applicabilityProjection"));
    }

    private static Set<String> physicsUnavailableCompatibilityProbes(NativeFixture before, NativeFixture after, Set<String> probes) {
        Set<String> unavailable = new TreeSet<>();
        for (String atom : probes) {
            LearningGoal left = before.canonicalGoals.get(atom), right = after.canonicalGoals.get(atom);
            assertThat(left).as("canonical Physics probe before %s", atom).isNotNull();
            assertThat(right).as("canonical Physics probe after %s", atom).isNotNull();
            boolean excluded = physicsUnavailableCompatibilityGoal(left);
            assertThat(physicsUnavailableCompatibilityGoal(right)).as("same explicit compatibility exclusion %s", atom).isEqualTo(excluded);
            if (excluded) {
                assertThat(right.getExtendedData()).as("unchanged excluded-source metadata %s", atom).isEqualTo(left.getExtendedData());
                unavailable.add(atom);
            }
        }
        return unavailable;
    }

    private static void assertPhysicsUnavailableInActualScope(NativeScope scope, String atom, String label) {
        assertThat(scope.roles().targets()).as("excluded source is not an actual target %s: %s", atom, label).doesNotContain(atom);
        assertThat(scope.roles().support()).as("excluded source is not actual support %s: %s", atom, label).doesNotContain(atom);
        assertThat(scope.context()).as("excluded source is not in the actual compiler context %s: %s", atom, label).doesNotContain(atom);
        Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(scope.projection(), "visibleGoals");
        assertThat(visible).as("excluded source is not learner-visible %s: %s", atom, label).doesNotContainKey(atom);
    }

    /** Canonical demand coverage is separate from real enrollment; no target roles are manufactured. */
    private static Set<String> assertPhysicsCanonicalProbeDemands(NativeFixture before, NativeFixture after,
            Set<String> affectedProbes, Set<String> unavailable) {
        Map<String, LearningGoal> left = new CompletionCanonicalGraphResolver(before.landscapes, before.mapper).load(ROOT);
        Map<String, LearningGoal> right = new CompletionCanonicalGraphResolver(after.landscapes, after.mapper).load(ROOT);
        var compiler = new CompletionProfileCompiler();
        var leftTopology = compiler.normalizePrerequisites(left);
        var rightTopology = compiler.normalizePrerequisites(right);
        leftTopology.validateContext(affectedProbes);
        rightTopology.validateContext(affectedProbes);
        Set<String> context = new TreeSet<>(affectedProbes);
        for (String atom : affectedProbes) {
            assertThat(left.get(atom).getContains()).as("atomic canonical probe %s", atom).isEmpty();
            assertThat(right.get(atom).getContains()).isEmpty();
            Set<String> demand = leftTopology.transitivePrerequisites(atom);
            assertThat(rightTopology.transitivePrerequisites(atom)).as("full canonical atomic demand %s", atom).isEqualTo(demand);
            assertThat(demand).doesNotContain(atom);
            context.addAll(demand);
        }
        for (String atom : context) assertThat(rightTopology.transitivePrerequisites(atom))
                .as("whole canonical atomic demand context %s", atom).isEqualTo(leftTopology.transitivePrerequisites(atom));
        for (String atom : unavailable) {
            assertThat(affectedProbes).as("unavailable operation probe retains canonical coverage").contains(atom);
            assertThat(physicsUnavailableCompatibilityGoal(left.get(atom))).isTrue();
            assertThat(physicsUnavailableCompatibilityGoal(right.get(atom))).isTrue();
            assertThat(right.get(atom).getExtendedData()).isEqualTo(left.get(atom).getExtendedData());
            Set<String> demand = rightTopology.transitivePrerequisites(atom);
            assertThat(demand).as("nonempty unavailable-source demand %s", atom).isNotEmpty().doesNotContain(atom);
            assertThat(demand).as("all original direct demands remain transitively present %s", atom).containsAll(left.get(atom).getRequires());
        }
        String unknown = affectedProbes.iterator().next() + "-missing-reference-control";
        for (var topology : List.of(leftTopology, rightTopology)) assertThatThrownBy(() -> topology.transitivePrerequisites(unknown))
                .as("canonical unknown-reference control").isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("MISSING_REFERENCE"));
        return Collections.unmodifiableSet(new TreeSet<>(affectedProbes));
    }

    private static void assertPhysicsProbeExposureDomain(Set<String> probes, Map<String, Set<String>> runtime,
            Set<String> unavailable, Set<String> canonicalCoverage) {
        assertThat(runtime.keySet()).as("complete Physics probe exposure ledger").isEqualTo(probes);
        Set<String> unexposed = new TreeSet<>();
        runtime.forEach((atom, scopes) -> { if (scopes.isEmpty()) unexposed.add(atom); });
        assertThat(unexposed).as("only metadata-excluded compatibility probes lack real target exposure").isEqualTo(unavailable);
        assertThat(canonicalCoverage).as("every excluded probe retains real canonical demand coverage").containsAll(unavailable);
    }

    /** Every actual target pair is either eligible or demonstrably fail-closed; neither set is inferred from outcomes. */
    private static void assertPhysicsCoverageLedger(String label, Set<String> targets, Set<String> valid,
            Set<String> invalid, Set<String> positive, Set<String> negative, Set<String> failClosed) {
        Set<String> overlap = new TreeSet<>(valid);
        overlap.retainAll(invalid);
        assertThat(overlap).as("%s role-valid/invalid scopes are disjoint", label).isEmpty();
        Set<String> partition = new TreeSet<>(valid);
        partition.addAll(invalid);
        assertThat(partition).as("%s native role ledger covers every target scope", label).isEqualTo(targets);
        assertThat(positive).as("%s exact eligible positive coverage", label).isEqualTo(valid);
        assertThat(negative).as("%s exact eligible negative coverage", label).isEqualTo(valid);
        assertThat(failClosed).as("%s exact ineligible fail-closed coverage", label).isEqualTo(invalid);
    }

    /** State is invariant; a blocker value is one valid open-assessment consumer, not a stable witness ID. */
    private static void assertPhysicsCompletionPreserved(CompletionEvaluation before, CompletionEvaluation after,
            CompiledCompletionProfile beforeProfile, CompiledCompletionProfile afterProfile,
            NativeScope beforeScope, NativeScope afterScope, Map<String, Double> mastery,
            Map<String, Set<String>> beforeAssessmentDemand, Map<String, Set<String>> afterAssessmentDemand, String label) {
        assertThat(afterProfile.targetGoalIds()).as("%s compiled targets", label).isEqualTo(beforeProfile.targetGoalIds());
        assertThat(afterProfile.assessmentGoalIds()).as("%s compiled assessments", label).isEqualTo(beforeProfile.assessmentGoalIds());
        assertThat(after.masteredGoalIds()).as("%s masteredGoalIds", label).isEqualTo(before.masteredGoalIds());
        assertThat(after.waivedGoalIds()).as("%s waivedGoalIds", label).isEqualTo(before.waivedGoalIds());
        assertThat(after.pendingTargetGoalIds()).as("%s pendingTargetGoalIds", label).isEqualTo(before.pendingTargetGoalIds());
        assertThat(after.masteredAssessmentGoalIds()).as("%s masteredAssessmentGoalIds", label).isEqualTo(before.masteredAssessmentGoalIds());
        assertThat(after.waiverReasons()).as("%s waiverReasons", label).isEqualTo(before.waiverReasons());
        assertThat(after.complete()).as("%s complete", label).isEqualTo(before.complete());
        assertThat(after.targetCount()).as("%s targetCount", label).isEqualTo(before.targetCount());
        assertThat(after.masteredTargetCount()).as("%s masteredTargetCount", label).isEqualTo(before.masteredTargetCount());
        assertThat(after.waivedTargetCount()).as("%s waivedTargetCount", label).isEqualTo(before.waivedTargetCount());
        assertThat(after.requiredAssessmentCount()).as("%s requiredAssessmentCount", label).isEqualTo(before.requiredAssessmentCount());
        assertThat(after.blockedByGoalIds().keySet()).as("%s blocked prerequisite keys", label).isEqualTo(before.blockedByGoalIds().keySet());
        before.blockedByGoalIds().forEach((prerequisite, consumer) -> assertPhysicsCompletionWitness(prerequisite, consumer,
                beforeProfile, beforeScope, beforeAssessmentDemand, mastery, before.waivedGoalIds()));
        after.blockedByGoalIds().forEach((prerequisite, consumer) -> assertPhysicsCompletionWitness(prerequisite, consumer,
                afterProfile, afterScope, afterAssessmentDemand, mastery, after.waivedGoalIds()));
    }

    private static void assertPhysicsCompletionWitness(String prerequisite, String consumer,
            CompiledCompletionProfile profile, NativeScope scope, Map<String, Set<String>> fullAssessmentDemand,
            Map<String, Double> mastery, Set<String> waived) {
        String witness = prerequisite + " -> " + consumer;
        assertThat(profile.contextGoalIds()).as("blocking prerequisite in compiled profile: %s", witness).contains(prerequisite);
        assertThat(scope.context()).as("blocking prerequisite in native context: %s", witness).contains(prerequisite);
        assertThat(profile.assessmentGoalIds()).as("blocking prerequisite is ordinary: %s", witness).doesNotContain(prerequisite);
        assertThat(Mastery.isMastered(mastery.get(prerequisite))).as("blocking prerequisite is unmastered: %s", witness).isFalse();
        assertThat(waived).as("blocking prerequisite is not waived: %s", witness).doesNotContain(prerequisite);
        assertThat(profile.assessmentGoalIds()).as("blocking consumer is a compiled assessment: %s", witness).contains(consumer);
        assertThat(Mastery.isMastered(mastery.get(consumer))).as("blocking consumer is open: %s", witness).isFalse();
        assertThat(fullAssessmentDemand).as("full native assessment topology: %s", witness).containsKey(consumer);
        // These sets come directly from topology.transitivePrerequisites(assessment), without mastery cuts.
        assertThat(fullAssessmentDemand.get(consumer)).as("prerequisite belongs to blocking consumer demand: %s", witness)
                .contains(prerequisite);
    }

    private static void assertPhysicsCompletionWitnessNegatives(CompiledCompletionProfile profile, NativeScope scope,
            Map<String, Set<String>> fullAssessmentDemand, Map<String, Double> mastery, CompletionEvaluation evaluation) {
        for (var blocked : evaluation.blockedByGoalIds().entrySet()) {
            String prerequisite = blocked.getKey(), consumer = blocked.getValue();
            String unrelated = profile.assessmentGoalIds().stream()
                    .filter(id -> !Mastery.isMastered(mastery.get(id)))
                    .filter(id -> !fullAssessmentDemand.get(id).contains(prerequisite)).findFirst().orElse(null);
            if (unrelated == null) continue;
            assertThatThrownBy(() -> assertPhysicsCompletionWitness(prerequisite, consumer + "-not-an-assessment",
                    profile, scope, fullAssessmentDemand, mastery, evaluation.waivedGoalIds()))
                    .as("fake blocking consumer fails").isInstanceOf(AssertionError.class);
            Map<String, Double> masteredConsumer = new TreeMap<>(mastery);
            masteredConsumer.put(consumer, 1.0);
            assertThatThrownBy(() -> assertPhysicsCompletionWitness(prerequisite, consumer,
                    profile, scope, fullAssessmentDemand, masteredConsumer, evaluation.waivedGoalIds()))
                    .as("mastered blocking consumer fails").isInstanceOf(AssertionError.class);
            assertThatThrownBy(() -> assertPhysicsCompletionWitness(prerequisite, unrelated,
                    profile, scope, fullAssessmentDemand, mastery, evaluation.waivedGoalIds()))
                    .as("unrelated open assessment fails").isInstanceOf(AssertionError.class);
            return;
        }
        throw new AssertionError("No actual blocking witness with an unrelated open assessment for negative controls");
    }

    private record CurrentCacheComparisonFrames(ReductionRegistry before, ReductionRegistry after) { }

    /** Only the 27 current cache fields are copied; every historical digest is checked before deriving new ones. */
    private static CurrentCacheComparisonFrames currentPhysicsCacheFrames(JsonNode wrapper, JsonNode parent,
            NativeV6Frame cacheFrame, BatchNativeFrames historical) throws IOException {
        JsonNode snapshots = wrapper.path("originalApplicability");
        Map<Path, JsonNode> after = mutableDocuments(historical.afterPhysics().currentDocuments());
        copyCurrentApplicability(snapshots, cacheFrame.currentDocuments(), after);
        Map<Path, JsonNode> expectedCurrent = mutableDocuments(historical.current().currentDocuments());
        copyCurrentApplicability(snapshots, cacheFrame.currentDocuments(), expectedCurrent);
        assertThat(expectedCurrent).as("the complete final V7 catalog remains bound independently of the Physics boundary")
                .isEqualTo(cacheFrame.currentDocuments());
        Map<Path, JsonNode> before = mutableDocuments(after);
        Map<String, Map<String, JsonNode>> beforeGoals = frameGoals(before);
        JsonNode physics = parent.path("batches").get(1);
        assertThat(physics.path("originalRequires")).hasSize(144);
        for (JsonNode original : physics.path("originalRequires")) {
            ObjectNode goal = (ObjectNode) registeredGoal(beforeGoals, original.path("source").asText());
            if (original.path("requires").isNull()) goal.remove("requires");
            else goal.set("requires", original.path("requires").deepCopy());
        }
        Map<Path, JsonNode> expectedBefore = mutableDocuments(historical.afterGerman().currentDocuments());
        copyCurrentApplicability(snapshots, cacheFrame.currentDocuments(), expectedBefore);
        assertThat(before).as("only the second batch's exact 144 requires snapshots form the comparison start")
                .isEqualTo(expectedBefore);
        Map<String, Map<String, JsonNode>> afterGoals = frameGoals(after);
        for (JsonNode original : snapshots) {
            String source = original.path("source").asText();
            JsonNode left = registeredGoal(beforeGoals, source), right = registeredGoal(afterGoals, source);
            assertThat(left.has("applicability")).as("identical current cache presence: %s", source)
                    .isEqualTo(right.has("applicability"));
            assertThat(left.get("applicability")).as("identical current cache value: %s", source)
                    .isEqualTo(right.get("applicability"));
        }
        Map<Path, JsonNode> restoredBefore = mutableDocuments(before), restoredAfter = mutableDocuments(after);
        restoreOriginalApplicability(snapshots, restoredBefore);
        restoreOriginalApplicability(snapshots, restoredAfter);
        assertFrameDigests(parent.path("batches").get(0).path("currentDocumentDigests"), restoredBefore,
                "old-cache restoration reaches the exact historical German V6 checkpoint");
        assertFrameDigests(parent.path("batches").get(1).path("currentDocumentDigests"), restoredAfter,
                "old-cache restoration reaches the exact historical Physics V6 checkpoint");
        ReductionRegistry currentBefore = currentCacheComparisonRegistry(historical.afterGerman(), before);
        ReductionRegistry currentAfter = currentCacheComparisonRegistry(historical.afterPhysics(), after);
        Map<String, String> beforeDigests = new TreeMap<>(), afterDigests = new TreeMap<>();
        for (Path file : before.keySet()) {
            String relative = REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/');
            beforeDigests.put(relative, currentBefore.documentDigests().get(file).current());
            afterDigests.put(relative, currentAfter.documentDigests().get(file).current());
        }
        System.out.printf("PHYSICS_V7_DERIVED_CURRENT_FRAME_DIGESTS before=%s after=%s historicalPinsRewritten=false cacheSources=27%n",
                MAPPER.writeValueAsString(beforeDigests), MAPPER.writeValueAsString(afterDigests));
        return new CurrentCacheComparisonFrames(currentBefore, currentAfter);
    }

    private static void copyCurrentApplicability(JsonNode snapshots, Map<Path, JsonNode> current,
            Map<Path, JsonNode> destination) {
        Map<String, Map<String, JsonNode>> sourceGoals = frameGoals(current), targetGoals = frameGoals(destination);
        for (JsonNode snapshot : snapshots) {
            String source = snapshot.path("source").asText();
            JsonNode actual = registeredGoal(sourceGoals, source);
            ObjectNode target = (ObjectNode) registeredGoal(targetGoals, source);
            if (actual.has("applicability")) target.set("applicability", actual.get("applicability").deepCopy());
            else target.remove("applicability");
        }
    }

    private static void restoreOriginalApplicability(JsonNode snapshots, Map<Path, JsonNode> documents) {
        Map<String, Map<String, JsonNode>> goals = frameGoals(documents);
        for (JsonNode snapshot : snapshots) {
            ObjectNode goal = (ObjectNode) registeredGoal(goals, snapshot.path("source").asText());
            if (snapshot.path("present").asBoolean()) goal.set("applicability", snapshot.path("value").deepCopy());
            else goal.remove("applicability");
        }
    }

    private static ReductionRegistry currentCacheComparisonRegistry(ReductionRegistry historical,
            Map<Path, JsonNode> documents) {
        Map<Path, DocumentDigests> digests = new LinkedHashMap<>();
        for (var entry : historical.documentDigests().entrySet()) {
            // original() remains the unchanged historical reference. These derived
            // current frames are used only with originalBaseline=false, never as new sourceFP baselines.
            digests.put(entry.getKey(), new DocumentDigests(entry.getValue().original(), documentHash(documents.get(entry.getKey()))));
        }
        ReductionRegistry result = new ReductionRegistry(historical.canonicalOwners(), historical.changesByFile(),
                historical.changedSources(), historical.clusterWitnessCoverage(), Collections.unmodifiableMap(digests),
                historical.historicalSourceIds(), historical.suffixSourceIds(), historical.tailSourceIds(),
                historical.clusterTargetSourceIds(), historical.tailRemovedPrerequisites(), immutableDocuments(documents),
                historical.batchSourceIds(), historical.originalDocuments());
        for (var entry : result.canonicalOwners().entrySet()) reconstructRawDocument(entry.getKey(), documents.get(entry.getKey()),
                entry.getValue(), result.documentDigests().get(entry.getKey()), result.changesByFile().getOrDefault(entry.getKey(), List.of()),
                false, result.batchSourceIds());
        return result;
    }

    private static Map<String, JsonNode> nativePhysicsApplicability(NativeFixture fixture) {
        Map<String, JsonNode> result = new TreeMap<>();
        for (var landscape : fixture.landscapes.getClosure(ROOT)) {
            if (!PHYSICS.equals(landscape.getLandscapeId())) continue;
            for (var goal : landscape.getGoals()) result.put(goal.getId(), MAPPER.valueToTree(goal).path("applicability"));
        }
        assertThat(result).as("native Physics LandscapeService applicability").isNotEmpty();
        return result;
    }

    private record Roles(Set<String> targets, Set<String> atomicTargets, Set<String> support, Set<String> viewIds) { }
    private record NativeScope(Learner learner, Object projection, Object frontier, Roles roles,
            Map<String, LearningGoal> graph, Set<String> context, CompletionProfileCompiler.PrerequisiteTopology topology) { }
    private record CanonicalProbe(Map<String, LearningGoal> graph, Set<String> context,
            CompletionProfileCompiler.PrerequisiteTopology topology, Object projection) { }

    /** Explicit test-role fixture, independent of GUI enrollment and its authored atomic macros. */
    private static CanonicalProbe canonicalProbe(NativeFixture fixture, Set<String> atoms) throws Exception {
        var graph = new CompletionCanonicalGraphResolver(fixture.landscapes, fixture.mapper)
                .loadForAtomicSeeds(ROOT, atoms, Map.of());
        return canonicalProbe(graph, atoms);
    }

    private static CanonicalProbe canonicalProbe(Map<String, LearningGoal> graph, Set<String> atoms) throws Exception {
        var learningScope = PersonalCurriculumLearningScope.compile(graph, atoms);
        Set<String> targets = learningScope.learningAtomicGoalIds();
        var compiler = new CompletionProfileCompiler();
        var topology = compiler.normalizePrerequisites(graph);
        topology.validateContext(targets);
        var compiled = compiler.compileAutomatic(graph, targets, targets, "registered-canonical-atomic-probe");
        Set<String> support = new TreeSet<>();
        atoms.forEach(atom -> support.addAll(topology.transitiveGoalPrerequisites(atom)));
        support.removeAll(targets);
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$GoalProjection");
        var constructor = type.getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class, Set.class,
                List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(graph, targets, support, graph, Set.of(),
                atoms.stream().sorted().toList(), true, learningScope, graph);
        return new CanonicalProbe(graph, compiled.contextGoalIds(), topology, projection);
    }
    private record Discovery(Map<String, Map<String, Map<String, Object>>> configurations,
            Set<String> plannerScopes, Set<String> guiScopes, Map<String, PersonalizationPlan> offeredPlans) { }

    private static final class NativeFixture {
        final ObjectMapper mapper;
        final LandscapeService landscapes;
        final LearnerService service;
        final Map<String, LearningGoal> canonicalGoals;
        final CompletionProfileCompiler.PrerequisiteTopology canonicalTopology;
        final Set<String> canonicalAtomicIds;
        final Map<String, Set<String>> atomicProbesBySource;
        final LearnerRepository learners = mock(LearnerRepository.class);
        final LearnerClientStateRepository clients = mock(LearnerClientStateRepository.class);
        final MasteryRepository mastery = mock(MasteryRepository.class);
        final PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);

        NativeFixture(ReductionRegistry registry, boolean originalBaseline) {
            // Only the baseline's registered raw requires arrays are overlaid.
            mapper = new ObjectMapper(new RegistryBaselineJsonFactory(registry, originalBaseline));
            var properties = new LandscapeProperties();
            properties.setDirectory(REPOSITORY.resolve("curricula").toString());
            landscapes = new LandscapeService(properties, mapper);
            landscapes.pinRuntimeGeneration();
            var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
            canonicalGoals = Collections.unmodifiableMap(canonical);
            canonicalTopology = new CompletionProfileCompiler().normalizePrerequisites(canonicalGoals);
            assertThat(CompletionProfileCompiler.isOrientation(canonical.get(REMOVED))).isTrue();
            Set<String> atomicIds = new TreeSet<>();
            canonical.forEach((id, goal) -> {
                if (goal.getContains().isEmpty()) atomicIds.add(id);
            });
            canonicalAtomicIds = Collections.unmodifiableSet(atomicIds);
            if (!registry.clusterTargetSourceIds().isEmpty()) {
                assertThat(canonicalAtomicDescendants(GERMAN_CLUSTER, canonical)).as("complete canonical German cluster leaf set")
                        .containsExactlyInAnyOrderElementsOf(GERMAN_LEAVES);
                assertThat(canonical.get(GERMAN_ATOM).getType()).isEqualTo("atomic");
                assertThat(canonical.get(GERMAN_ATOM).getContains()).isEmpty();
                assertThat(canonical.get(GERMAN_CLUSTER).getType()).isEqualTo("cluster");
                assertThat(canonical.get(GERMAN_CLUSTER).getContains()).isNotEmpty();
            }
            Map<String, Set<String>> probes = new TreeMap<>();
            for (ChangedSource changed : registry.changedSources().values()) {
                LearningGoal source = canonical.get(changed.goalId());
                assertThat(source).as("native overlay source %s", changed.goalId()).isNotNull();
                assertThat(source.getRequires()).as("native %s raw overlay for %s",
                        originalBaseline ? "original" : "current", changed.goalId())
                        .containsExactlyElementsOf(originalBaseline ? changed.originalRequires() : changed.currentRequires());
                assertThat(canonicalAtomicIds.contains(changed.goalId()))
                        .as("unfiltered source classification %s", changed.goalId()).isEqualTo(changed.atomicSource());
                probes.put(changed.goalId(), canonicalAtomicDescendants(changed.goalId(), canonical));
            }
            atomicProbesBySource = Collections.unmodifiableMap(probes);
            for (ClusterWitnessCoverage coverage : registry.clusterWitnessCoverage()) {
                assertThat(coverage.atomicSourceIds())
                        .as("complete canonical atomic witness coverage for %s", coverage.sourceId())
                        .containsExactlyInAnyOrderElementsOf(atomicProbesBySource.get(coverage.sourceId()));
            }
            Set<String> followupAtoms = new TreeSet<>();
            registry.changedSources().values().stream()
                    .filter(changed -> registry.historicalSourceIds().contains(changed.goalId()))
                    .filter(changed -> !changed.atomicSource() && !LATIN_CLUSTER.equals(changed.goalId()))
                    .forEach(changed -> followupAtoms.addAll(atomicProbesBySource.get(changed.goalId())));
            if (!registry.historicalSourceIds().isEmpty()) {
                assertThat(followupAtoms).as("canonical atomic descendants of all twelve historical follow-up cluster sources")
                        .hasSize(70);
                assertThat(atomicProbesBySource.get(LATIN_CLUSTER)).containsExactly(LATIN_ATOM);
            } else {
                // A current V8 comparison has an explicit immediate-V7 original
                // frame and only its suffix sources, not invented legacy cuts.
                assertThat(registry.originalDocuments().keySet()).containsExactlyInAnyOrderElementsOf(registry.canonicalOwners().keySet());
                assertThat(followupAtoms).isEmpty();
            }
            if (!registry.suffixSourceIds().isEmpty()) {
                Set<String> mathAtoms = new TreeSet<>();
                for (String exam : MATH_EXAMS) mathAtoms.addAll(atomicProbesBySource.get(exam));
                assertThat(atomicProbesBySource.get("464a6024-a2f8-53b4-84e0-d7b9df22a0b1")).hasSize(14);
                assertThat(atomicProbesBySource.get("9ad83149-3cb7-5b87-a617-3eae3715a50c")).hasSize(13);
                assertThat(mathAtoms).as("complete separate Math exam descendant basis").hasSize(27);
                assertThat(mathAtoms).containsExactlyInAnyOrderElementsOf(registry.suffixSourceIds().stream()
                        .filter(id -> registry.changedSources().get(id).atomicSource()).toList());
            }
            assertThat(canonicalAtomicDescendants(LATIN_CLUSTER, canonical)).containsExactly(LATIN_ATOM);
            assertThat(canonical.get(LATIN_ATOM).getRequires()).contains(LATIN_BRIDGE);
            assertThat(canonical.get(LATIN_BRIDGE).getRequires()).contains(LATIN_ORIENTATION);
            Map<String, List<String>> contains = new TreeMap<>();
            canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
            service = new LearnerService(learners, clients, mastery, plans, landscapes,
                    new GoalMappingService(properties, mapper), mock(DeckResourceService.class), mapper, events);
            ReflectionTestUtils.setField(service, "compositionViewService", new CompositionViewService(properties, mapper, () -> contains));
            var catalog = mock(CompletionProfileCatalog.class);
            when(catalog.automatic()).thenReturn(true);
            when(catalog.available()).thenReturn(true);
            ReflectionTestUtils.setField(service, "completionApplicationService", new CompletionApplicationService(catalog));
        }

        NativeScope resolve(Map<String, Map<String, Object>> config) throws Exception {
            String personalCurriculum = mapper.writeValueAsString(config);
            var learner = new Learner();
            learner.setSelectedCurriculum(ROOT);
            learner.setPersonalCurriculum(personalCurriculum);
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT, personalCurriculum, false);
            assertLearningEmission(personalCurriculum, projection);
            Set<String> atomic = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", "automatic:personal-curriculum", projection);
            Set<String> targets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
            Set<String> views = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
            Map<String, LearningGoal> graph = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            var compiler = new CompletionProfileCompiler();
            Object frontier = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", learner, projection, Map.of(), null);
            CompletionProfileCompiler.PrerequisiteTopology topology = ReflectionTestUtils.invokeMethod(frontier, "topology");
            assertThat(topology).as("actual runtime prerequisite topology: %s", personalCurriculum).isNotNull();
            topology.validateContext(atomic);
            var compiled = compiler.compileAutomatic(graph, atomic, targets, "first-math-edge-regression");
            return new NativeScope(learner, projection, frontier, new Roles(targets, atomic, support, views), graph, compiled.contextGoalIds(), topology);
        }

        void assertLearningEmission(String personalCurriculum, Object projection) {
            Object seeds = ReflectionTestUtils.invokeMethod(service, "computeSeedGoalProjection", ROOT, personalCurriculum, false);
            Set<String> seedTargets = ReflectionTestUtils.invokeMethod(seeds, "targetGoalIds");
            Map<String, LearningGoal> seedDefinitions = ReflectionTestUtils.invokeMethod(seeds, "structuralGoals");
            Set<String> expected = new TreeSet<>();
            for (String id : seedTargets) {
                LearningGoal seed = seedDefinitions.get(id);
                assertThat(seed).as("APV-102 seed definition %s", id).isNotNull();
                if (seed.getContains() != null && !seed.getContains().isEmpty()) continue;
                LearningGoal goal = canonicalGoals.get(id);
                assertThat(goal).as("APV-102 canonical atomic seed %s", id).isNotNull();
                assertThat(goal.getContains()).as("APV-102 canonical seed must be atomic: %s", id).isEmpty();
                expected.add(id);
                expected.addAll(canonicalTopology.transitivePrerequisites(id));
            }
            Set<String> targetIds = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
            Set<String> actualAtoms = new TreeSet<>();
            for (String id : targetIds) {
                LearningGoal goal = structural.get(id);
                assertThat(goal).as("APV-102 emitted target definition %s", id).isNotNull();
                if (goal.getContains() != null && !goal.getContains().isEmpty()) continue;
                assertThat(canonicalAtomicIds).as("APV-102 emitted target must be a known canonical atom: %s", id).contains(id);
                actualAtoms.add(id);
            }
            assertThat(actualAtoms).as("APV-102 emitted targets equal independent canonical demand: %s", personalCurriculum)
                    .isEqualTo(expected);
            Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
            assertThat(visible.keySet()).as("APV-102 every required target has an emitted definition").containsAll(expected);
            Set<String> completion = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets",
                    "automatic:personal-curriculum", projection);
            assertThat(completion).as("APV-102 completion receives the complete independent acquisition basis").isEqualTo(expected);
        }

        void verifyOnlyUnsavedFixtures() {
            // Native option application invokes persistence, intercepted exclusively by this mock.
            verify(learners, atLeastOnce()).save(argThat(learner -> learner.getSkillpilotId() == null));
            verifyNoMoreInteractions(learners);
            verifyNoInteractions(clients, mastery, plans);
        }
    }

    private record ChangedSource(String owner, String goalId, List<String> originalRequires,
            List<String> currentRequires, List<String> canonicalContains, boolean atomicSource,
            boolean originalRequiresPresent, boolean currentRequiresPresent) {
        ChangedSource withOriginalPresence(boolean present) {
            return new ChangedSource(owner, goalId, originalRequires, currentRequires, canonicalContains,
                    atomicSource, present, currentRequiresPresent);
        }
    }
    private record DocumentDigests(String original, String current) { }
    private record ClusterWitnessCoverage(String sourceId, String prerequisiteId, Set<String> atomicSourceIds) { }
    private record ReductionRegistry(Map<Path, String> canonicalOwners,
            Map<Path, List<ChangedSource>> changesByFile, Map<String, ChangedSource> changedSources,
            List<ClusterWitnessCoverage> clusterWitnessCoverage, Map<Path, DocumentDigests> documentDigests,
            Set<String> historicalSourceIds, Set<String> suffixSourceIds, Set<String> tailSourceIds,
            Set<String> clusterTargetSourceIds,
            Map<String, Set<String>> tailRemovedPrerequisites, Map<Path, JsonNode> currentDocuments,
            Set<String> batchSourceIds, Map<Path, JsonNode> originalDocuments) { }

    private static ReductionRegistry readReductionRegistry() throws IOException {
        return readReductionRegistry(readNativeRegistryDeclaration());
    }

    private static ReductionRegistry readReductionRegistry(JsonNode registry) throws IOException {
        if (V8.equals(registry.path("proofContract").asText())) {
            NativeBasisBoundFrame frame = readBasisBoundFrame(registry, Map.of());
            NativeV6Frame prefix = readApplicabilityRefreshFrame(frame.registry(), frame.documents());
            return readBatchedReductionRegistry(prefix.registry(), prefix.documents()).legacy();
        }
        if (V7.equals(registry.path("proofContract").asText())) {
            NativeV6Frame frame = readApplicabilityRefreshFrame(registry);
            return readBatchedReductionRegistry(frame.registry(), frame.documents()).legacy();
        }
        if (V6.equals(registry.path("proofContract").asText())) {
            String activeContract = MAPPER.readTree(REDUCTION_REGISTRY.toFile()).path("proofContract").asText();
            System.out.printf("REGISTERED_NATIVE_FRAME active=%s tested=exact-reconstructed-V5-prefix finalCurrentCoverage=false%n", activeContract);
            return readBatchedReductionRegistry(registry).legacy();
        }
        return readReductionRegistry(registry, Map.of());
    }

    private static ReductionRegistry readReductionRegistry(JsonNode registry, Map<Path, JsonNode> documents) throws IOException {
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isIn(V2, V3, V4, V5);
        boolean clusterTargetNormalization = V5.equals(registry.path("proofContract").asText());
        boolean continued = clusterTargetNormalization || V4.equals(registry.path("proofContract").asText());
        boolean ordered = continued || V3.equals(registry.path("proofContract").asText());
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("catalogSources").isArray()).isTrue();
        assertThat(registry.path("originalRequires").isArray() && !registry.path("originalRequires").isEmpty()).isTrue();
        assertThat(registry.path("originalRequires").get(0).path("source").asText()).isEqualTo(MATH + ":" + SOURCE);

        Map<Path, String> canonicalOwners = new LinkedHashMap<>();
        Map<Path, DocumentDigests> documentDigests = new LinkedHashMap<>();
        Map<String, Path> ownerFiles = new LinkedHashMap<>();
        Map<String, Map<String, JsonNode>> goalsByOwner = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            String owner = source.path("landscapeId").asText();
            String relative = source.path("path").asText();
            assertThat(owner).isNotBlank();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(file.startsWith(REPOSITORY)).isTrue();
            assertThat(canonicalOwners.putIfAbsent(file, owner)).as("unique canonical registry path: %s", file).isNull();
            assertThat(ownerFiles.putIfAbsent(owner, file)).as("unique canonical registry owner: %s", owner).isNull();
            JsonNode canonical = readFrameDocument(file, documents);
            assertThat(canonical.path("landscapeId").asText()).isEqualTo(owner);
            DocumentDigests digests = new DocumentDigests(source.path("baselineDocumentDigest").asText(),
                    source.path("currentDocumentDigest").asText());
            assertDocumentDigest(canonical, digests.current(), "current raw document " + relative);
            documentDigests.put(file, digests);
            goalsByOwner.put(owner, rawGoals(canonical));
        }
        assertThat(canonicalOwners).hasSize(21);
        assertHistoricalBindings(registry, ordered, continued, clusterTargetNormalization);
        assertThat(canonicalOwners).containsKeys(MATH_SOURCE, BIOLOGY_SOURCE, LATIN_SOURCE, GERMAN_SOURCE);
        assertThat(registry.path("removals").isArray()).isTrue();
        assertThat(registry.path("removals")).as("retained historical operation count").hasSize(204);
        assertThat(registry.path("originalRequires")).as("retained historical raw overlay count").hasSize(200);
        int legacyRemovals = 0, clusterRemovals = 0;
        Set<String> clusterSourceIds = new TreeSet<>();
        List<ClusterWitnessCoverage> clusterWitnessCoverage = new ArrayList<>();
        for (JsonNode removal : registry.path("removals")) {
            String qualifiedSource = removal.path("source").asText();
            String prerequisite = removal.path("prerequisite").asText();
            JsonNode sourceGoal = registeredGoal(goalsByOwner, qualifiedSource);
            assertAtomicWitness(registeredGoal(goalsByOwner, prerequisite), prerequisite);
            if (!removal.has("atomicWitnesses")) {
                assertAtomicWitness(sourceGoal, qualifiedSource);
                assertThat(removal.path("witness").isArray()).isTrue();
                legacyRemovals++;
                continue;
            }
            clusterRemovals++;
            String sourceId = qualifiedIdentity(qualifiedSource)[1];
            clusterSourceIds.add(sourceId);
            assertThat(sourceGoal.path("type").asText()).isEqualTo("cluster");
            assertThat(sourceGoal.path("contains").isArray() && !sourceGoal.path("contains").isEmpty()).isTrue();
            assertThat(removal.has("witness")).isFalse();
            assertThat(removal.path("atomicWitnesses").isArray()).isTrue();
            assertThat(removal.path("atomicWitnesses")).isNotEmpty();
            Set<String> witnessStarts = new TreeSet<>();
            for (JsonNode rawWitness : removal.path("atomicWitnesses")) {
                List<String> witness = rawRequires(rawWitness, qualifiedSource);
                assertThat(witness).as("atomic descendant path for %s", qualifiedSource).hasSizeGreaterThanOrEqualTo(2);
                assertThat(witness.get(witness.size() - 1)).isEqualTo(prerequisite);
                for (String vertex : witness) assertAtomicWitness(registeredGoal(goalsByOwner, vertex), vertex);
                assertThat(witnessStarts.add(qualifiedIdentity(witness.get(0))[1]))
                        .as("exactly one witness per canonical atomic descendant of %s", qualifiedSource).isTrue();
            }
            clusterWitnessCoverage.add(new ClusterWitnessCoverage(sourceId, qualifiedIdentity(prerequisite)[1], Collections.unmodifiableSet(witnessStarts)));
            if (LATIN_CLUSTER.equals(sourceId)) {
                assertThat(qualifiedSource).isEqualTo(LATIN + ":" + LATIN_CLUSTER);
                assertThat(prerequisite).isEqualTo(LATIN + ":" + LATIN_ORIENTATION);
                assertThat(removal.path("atomicWitnesses")).hasSize(1);
                assertThat(rawRequires(removal.path("atomicWitnesses").get(0), LATIN_CLUSTER))
                        .containsExactly(LATIN + ":" + LATIN_ATOM, LATIN + ":" + LATIN_BRIDGE,
                                LATIN + ":" + LATIN_ORIENTATION);
            }
        }
        assertThat(legacyRemovals).as("original Math and 186 Bio operations retained").isEqualTo(187);
        assertThat(clusterRemovals).as("Latin plus sixteen covered follow-up operations").isEqualTo(17);
        assertThat(clusterSourceIds).as("Latin plus twelve follow-up cluster sources").hasSize(13);

        Set<String> historicalSourceIds = new TreeSet<>(), suffixSourceIds = new TreeSet<>(), tailSourceIds = new TreeSet<>();
        Set<String> clusterTargetSourceIds = new TreeSet<>();
        Map<String, Set<String>> tailRemovedPrerequisites = new TreeMap<>();
        List<JsonNode> originals = new ArrayList<>();
        for (JsonNode original : registry.path("originalRequires")) {
            assertThat(historicalSourceIds.add(qualifiedIdentity(original.path("source").asText())[1])).isTrue();
            assertThat(original.path("requires").isArray()).isTrue();
            originals.add(original);
        }
        if (ordered) {
            assertThat(registry.path("suffix").isArray()).isTrue();
            assertThat(registry.path("suffix")).hasSize(29);
            Set<String> newAtoms = new TreeSet<>(), newClusters = new TreeSet<>();
            for (JsonNode step : registry.path("suffix")) {
                String source = step.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(step.path("prerequisite").asText()).isEqualTo(MATH + ":" + REMOVED);
                assertThat(suffixSourceIds.add(id)).as("one actual Math suffix step per source").isTrue();
                assertThat(historicalSourceIds).doesNotContain(id);
                JsonNode goal = registeredGoal(goalsByOwner, source);
                if ("materialize-atomic".equals(step.path("operation").asText())) {
                    assertAtomicWitness(goal, source);
                    assertThat(rawRequires(goal.path("requires"), source)).containsExactly(REMOVED);
                    newAtoms.add(id);
                } else {
                    assertThat(step.path("operation").asText()).isEqualTo("remove-cluster");
                    assertThat(goal.path("type").asText()).isEqualTo("cluster");
                    assertThat(rawRequires(goal.path("requires"), source)).isEmpty();
                    Set<String> witnesses = new TreeSet<>();
                    for (JsonNode witness : step.path("atomicWitnesses")) {
                        List<String> path = rawRequires(witness, source);
                        assertThat(path).hasSize(2);
                        assertThat(path.get(1)).isEqualTo(MATH + ":" + REMOVED);
                        assertAtomicWitness(registeredGoal(goalsByOwner, path.get(0)), path.get(0));
                        assertThat(witnesses.add(qualifiedIdentity(path.get(0))[1])).isTrue();
                    }
                    assertThat(witnesses).isNotEmpty();
                    clusterWitnessCoverage.add(new ClusterWitnessCoverage(id, REMOVED, Set.copyOf(witnesses)));
                    clusterSourceIds.add(id);
                    newClusters.add(id);
                }
            }
            assertThat(newAtoms).hasSize(27);
            assertThat(newClusters).containsExactlyInAnyOrderElementsOf(MATH_EXAMS);
            assertThat(registry.path("suffixOriginalRequires").isArray()).isTrue();
            Set<String> overlaid = new TreeSet<>();
            for (JsonNode original : registry.path("suffixOriginalRequires")) {
                String source = original.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(suffixSourceIds).contains(id);
                assertThat(overlaid.add(id)).as("unique suffix original overlay: %s", id).isTrue();
                assertThat(original.has("requires")).isTrue();
                assertThat(original.path("requires").isNull() || original.path("requires").isArray()).isTrue();
                if (newAtoms.contains(id)) {
                    assertThat(original.path("requires").isArray()).as("actual new Math atom has a present empty before-array").isTrue();
                    assertThat(original.path("requires")).isEmpty();
                } else assertThat(rawRequires(original.path("requires"), source)).containsExactly(REMOVED);
                originals.add(original);
            }
            assertThat(overlaid).containsExactlyInAnyOrderElementsOf(suffixSourceIds);
        }
        if (continued) {
            assertThat(registry.path("tailOriginalRequires").isArray()).isTrue();
            assertThat(registry.path("tailOriginalRequires")).as("one true original snapshot for each disjoint tail source").hasSize(490);
            for (JsonNode original : registry.path("tailOriginalRequires")) {
                String source = original.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(historicalSourceIds).doesNotContain(id);
                assertThat(suffixSourceIds).doesNotContain(id);
                assertThat(tailSourceIds.add(id)).as("unique disjoint tail original source %s", id).isTrue();
                assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
                assertThat(original.has("requires")).isTrue();
                assertThat(original.path("requires").isNull() || original.path("requires").isArray()).isTrue();
                originals.add(original);
            }
            assertThat(registry.path("atomicRemovals").isArray()).isTrue();
            assertThat(registry.path("atomicRemovals")).as("separate atomic reduction tail operation count").hasSize(922);
            for (JsonNode removal : registry.path("atomicRemovals")) {
                String source = removal.path("source").asText(), prerequisite = removal.path("prerequisite").asText();
                String id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(qualifiedIdentity(prerequisite)[0]).isEqualTo(MATH);
                assertThat(tailSourceIds).contains(id);
                assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
                assertAtomicWitness(registeredGoal(goalsByOwner, prerequisite), prerequisite);
                assertThat(removal.has("atomicWitnesses")).isFalse();
                List<String> witness = rawRequires(removal.path("witness"), source);
                assertThat(witness).hasSizeGreaterThanOrEqualTo(3);
                assertThat(witness.getFirst()).isEqualTo(source);
                assertThat(witness.getLast()).isEqualTo(prerequisite);
                for (String vertex : witness) assertAtomicWitness(registeredGoal(goalsByOwner, vertex), vertex);
                assertThat(tailRemovedPrerequisites.computeIfAbsent(id, ignored -> new TreeSet<>())
                        .add(qualifiedIdentity(prerequisite)[1])).as("unique tail source/prerequisite operation %s -> %s", source, prerequisite).isTrue();
            }
            assertThat(tailRemovedPrerequisites.keySet()).containsExactlyInAnyOrderElementsOf(tailSourceIds);
            assertThat(tailRemovedPrerequisites.values().stream().mapToInt(Set::size).sum()).isEqualTo(922);
            assertThat(registry.path("witnessContinuations")).hasSize(1);
            JsonNode continuation = registry.path("witnessContinuations").get(0);
            assertThat(continuation.size()).isEqualTo(3);
            assertThat(continuation.path("historicalRemovalIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("edgeIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("tailRemovalIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("historicalRemovalIndex").asInt()).isZero();
            assertThat(continuation.path("edgeIndex").asInt()).isEqualTo(1);
            assertThat(continuation.path("tailRemovalIndex").asInt()).isEqualTo(608);
            JsonNode replacement = registry.path("atomicRemovals").get(608);
            assertThat(replacement.path("source").asText()).isEqualTo(MATH + ":" + RETAINED);
            assertThat(replacement.path("prerequisite").asText()).isEqualTo(MATH + ":" + REMOVED);
            assertThat(rawRequires(replacement.path("witness"), RETAINED))
                    .containsExactly(MATH + ":" + RETAINED, MATH + ":" + CONTINUED_BRIDGE, MATH + ":" + REMOVED);
        }
        if (clusterTargetNormalization) {
            assertThat(registry.path("clusterTargetOriginalRequires").isArray()).isTrue();
            assertThat(registry.path("clusterTargetOriginalRequires")).hasSize(1);
            JsonNode original = registry.path("clusterTargetOriginalRequires").get(0);
            String source = GERMAN + ":" + GERMAN_ATOM;
            assertThat(original.size()).isEqualTo(2);
            assertThat(original.path("source").asText()).isEqualTo(source);
            assertThat(rawRequires(original.path("requires"), source)).containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
            assertThat(historicalSourceIds).doesNotContain(GERMAN_ATOM);
            assertThat(suffixSourceIds).doesNotContain(GERMAN_ATOM);
            assertThat(tailSourceIds).doesNotContain(GERMAN_ATOM);
            assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
            JsonNode cluster = registeredGoal(goalsByOwner, GERMAN + ":" + GERMAN_CLUSTER);
            assertThat(cluster.path("type").asText()).isEqualTo("cluster");
            assertThat(cluster.path("contains")).isNotEmpty();
            assertThat(registry.path("clusterTargetSuffix").isArray()).isTrue();
            assertThat(registry.path("clusterTargetSuffix")).hasSize(11);
            List<String> replay = new ArrayList<>(List.of(GERMAN_CLUSTER, GERMAN_OTHER));
            for (int index = 0; index < 11; index++) {
                JsonNode step = registry.path("clusterTargetSuffix").get(index);
                assertThat(step.path("source").asText()).isEqualTo(source);
                if (index < 10) {
                    assertThat(step.size()).as("bounded V5 materialization fields: %d", index).isEqualTo(4);
                    String leaf = GERMAN_LEAVES.get(index);
                    assertThat(step.path("operation").asText()).isEqualTo("materialize-atomic");
                    assertThat(step.path("prerequisite").asText()).isEqualTo(GERMAN + ":" + leaf);
                    JsonNode origin = step.path("origin");
                    assertThat(origin.isObject()).isTrue();
                    assertThat(origin.size()).as("bounded V5 origin fields: %d", index).isEqualTo(4);
                    assertThat(origin.path("source").asText()).isEqualTo(source);
                    assertThat(origin.path("prerequisite").asText()).isEqualTo(GERMAN_CLUSTER);
                    assertThat(rawRequires(origin.path("sourceContainsPath"), source)).containsExactly(source);
                    List<String> prerequisitePath = rawRequires(origin.path("prerequisiteContainsPath"), source);
                    assertThat(prerequisitePath).hasSize(3);
                    assertThat(prerequisitePath.getFirst()).isEqualTo(GERMAN + ":" + GERMAN_CLUSTER);
                    assertThat(prerequisitePath.getLast()).isEqualTo(GERMAN + ":" + leaf);
                    for (int pathIndex = 0; pathIndex + 1 < prerequisitePath.size(); pathIndex++) {
                        String parent = prerequisitePath.get(pathIndex), child = prerequisitePath.get(pathIndex + 1);
                        assertThat(qualifiedIdentity(parent)[0]).isEqualTo(GERMAN);
                        assertThat(qualifiedIdentity(child)[0]).isEqualTo(GERMAN);
                        assertThat(rawRequires(registeredGoal(goalsByOwner, parent).path("contains"), parent))
                                .as("literal V5 prerequisite contains edge %s -> %s", parent, child)
                                .contains(qualifiedIdentity(child)[1]);
                    }
                    assertAtomicWitness(registeredGoal(goalsByOwner, GERMAN + ":" + leaf), leaf);
                    assertThat(replay).doesNotContain(leaf);
                    replay.add(leaf);
                } else {
                    assertThat(step.size()).as("bounded V5 final removal fields").isEqualTo(3);
                    assertThat(replay).hasSize(12).contains(GERMAN_CLUSTER);
                    assertThat(step.path("operation").asText()).isEqualTo("remove-cluster-target");
                    assertThat(step.path("prerequisite").asText()).isEqualTo(GERMAN + ":" + GERMAN_CLUSTER);
                    assertThat(replay.remove(GERMAN_CLUSTER)).isTrue();
                }
            }
            assertThat(rawRequires(registeredGoal(goalsByOwner, source).path("requires"), source))
                    .as("exact ordered 2-to-11 German raw rewrite").containsExactlyElementsOf(replay);
            assertThat(replay).hasSize(11).doesNotContain(GERMAN_CLUSTER);
            // Inventory every canonical owner, including qualified references.
            // With no incoming raw edge the source is the only possible changed
            // pre-expansion closure; all other closure assertions stay strict.
            List<String> incoming = new ArrayList<>();
            goalsByOwner.forEach((owner, goals) -> goals.forEach((id, goal) -> {
                if (!goal.has("requires")) return;
                for (String prerequisite : rawRequires(goal.path("requires"), owner + ":" + id)) {
                    if (GERMAN_ATOM.equals(prerequisite) || prerequisite.endsWith(":" + GERMAN_ATOM)) incoming.add(owner + ":" + id);
                }
            }));
            assertThat(incoming).as("all 21 canonical owners: exact incoming raw prerequisite inventory of German source").isEmpty();
            clusterTargetSourceIds.add(GERMAN_ATOM);
            originals.add(original);
        }
        Map<Path, List<ChangedSource>> changesByFile = new LinkedHashMap<>();
        Map<String, ChangedSource> changedSources = new LinkedHashMap<>();
        for (JsonNode original : originals) {
            String qualifiedSource = original.path("source").asText();
            String[] identity = qualifiedIdentity(qualifiedSource);
            String owner = identity[0], id = identity[1];
            assertThat(ownerFiles).as("registered source owner: %s", qualifiedSource).containsKey(owner);
            JsonNode goal = goalsByOwner.get(owner).get(id);
            assertThat(goal).as("registered native source %s", qualifiedSource).isNotNull();
            List<String> canonicalContains = rawRequires(goal.path("contains"), qualifiedSource);
            boolean atomicSource = canonicalContains.isEmpty();
            if (atomicSource) {
                assertAtomicWitness(goal, qualifiedSource);
                assertThat(clusterSourceIds).doesNotContain(id);
            } else {
                assertThat(clusterSourceIds).as("registered covered-cluster source %s", qualifiedSource).contains(id);
                assertThat(goal.path("type").asText()).isEqualTo("cluster");
            }
            boolean beforePresent = !original.path("requires").isNull(), afterPresent = goal.has("requires");
            List<String> before = beforePresent ? rawRequires(original.path("requires"), qualifiedSource) : List.of();
            List<String> after = afterPresent ? rawRequires(goal.path("requires"), qualifiedSource) : List.of();
            assertThat(after).as("registered source has an actual raw reduction: %s", qualifiedSource).isNotEqualTo(before);
            if (tailSourceIds.contains(id)) {
                assertThat(before).containsAll(tailRemovedPrerequisites.get(id));
                assertThat(after).as("literal tail deletions preserve all other original entries in order: %s", id)
                        .containsExactlyElementsOf(before.stream().filter(prerequisite -> !tailRemovedPrerequisites.get(id).contains(prerequisite)).toList());
            }
            ChangedSource changed = new ChangedSource(owner, id, before, after, canonicalContains, atomicSource,
                    beforePresent, afterPresent);
            assertThat(changedSources.putIfAbsent(id, changed)).as("unique registered canonical source: %s", id).isNull();
            changesByFile.computeIfAbsent(ownerFiles.get(owner), ignored -> new ArrayList<>()).add(changed);
        }
        ChangedSource firstMath = changedSources.get(SOURCE);
        assertThat(firstMath.owner()).isEqualTo(MATH);
        assertThat(firstMath.originalRequires()).containsExactlyElementsOf(BEFORE);
        assertThat(firstMath.currentRequires()).containsExactlyElementsOf(AFTER);
        Map<String, JsonNode> math = goalsByOwner.get(MATH);
        for (String id : List.of(SOURCE, RETAINED, REMOVED)) assertAtomicWitness(math.get(id), id);
        if (continued) {
            assertThat(changedSources.get(RETAINED).originalRequires()).as("historical before-only Math witness edge").contains(REMOVED);
            assertThat(rawRequires(math.get(RETAINED).path("requires"), RETAINED))
                    .as("certified final continuation first literal edge").contains(CONTINUED_BRIDGE).doesNotContain(REMOVED);
            assertAtomicWitness(math.get(CONTINUED_BRIDGE), CONTINUED_BRIDGE);
            assertThat(rawRequires(math.get(CONTINUED_BRIDGE).path("requires"), CONTINUED_BRIDGE))
                    .as("certified final continuation second literal edge").contains(REMOVED);
        } else assertThat(math.get(RETAINED).path("requires")).as("historical direct authored Math witness edge")
                .contains(MAPPER.getNodeFactory().textNode(REMOVED));
        ChangedSource latin = changedSources.get(LATIN_CLUSTER);
        assertThat(latin).as("registered Latin raw cluster overlay").isNotNull();
        assertThat(latin.atomicSource()).isFalse();
        assertThat(latin.originalRequires()).containsExactly(LATIN_ORIENTATION);
        assertThat(latin.currentRequires()).isEmpty();
        assertThat(changedSources.values().stream().filter(changed -> historicalSourceIds.contains(changed.goalId()))
                .filter(ChangedSource::atomicSource).count())
                .as("legacy native source checks remain atomic").isEqualTo(187);
        assertThat(changedSources.values().stream().filter(changed -> historicalSourceIds.contains(changed.goalId()))
                .filter(changed -> !changed.atomicSource()).count())
                .as("all thirteen registered covered-cluster sources").isEqualTo(13);
        assertThat(changedSources.keySet().stream().filter(id -> !tailSourceIds.contains(id) && !clusterTargetSourceIds.contains(id)).count())
                .as("historical plus V3 prefix source count stays separate").isEqualTo(ordered ? 229 : 200);
        assertThat(changedSources.values().stream().filter(changed -> !tailSourceIds.contains(changed.goalId()) && !clusterTargetSourceIds.contains(changed.goalId()))
                .filter(ChangedSource::atomicSource).count()).as("historical plus V3 prefix atomic count stays separate").isEqualTo(ordered ? 214 : 187);
        assertThat(changedSources).hasSize(clusterTargetNormalization ? 720 : continued ? 719 : ordered ? 229 : 200);
        assertThat(changedSources.values().stream().filter(ChangedSource::atomicSource).count()).isEqualTo(clusterTargetNormalization ? 705 : continued ? 704 : ordered ? 214 : 187);
        assertThat(changedSources.values().stream().filter(changed -> !changed.atomicSource()).count()).isEqualTo(ordered ? 15 : 13);

        Map<Path, List<ChangedSource>> immutableChanges = new LinkedHashMap<>();
        changesByFile.forEach((file, changes) -> immutableChanges.put(file, List.copyOf(changes)));
        ReductionRegistry result = new ReductionRegistry(Collections.unmodifiableMap(canonicalOwners),
                Collections.unmodifiableMap(immutableChanges), Collections.unmodifiableMap(changedSources),
                List.copyOf(clusterWitnessCoverage), Collections.unmodifiableMap(documentDigests),
                Set.copyOf(historicalSourceIds), Set.copyOf(suffixSourceIds), Set.copyOf(tailSourceIds),
                Set.copyOf(clusterTargetSourceIds),
                Collections.unmodifiableMap(tailRemovedPrerequisites), immutableDocuments(documents), Set.of(), Map.of());
        for (var entry : canonicalOwners.entrySet()) {
            reconstructRawDocument(entry.getKey(), readFrameDocument(entry.getKey(), documents), entry.getValue(),
                    documentDigests.get(entry.getKey()), immutableChanges.getOrDefault(entry.getKey(), List.of()), true);
        }
        return result;
    }

    /** Native reader boundary only: Node remains the sequential proof/auditor authority. */
    private record BatchNativeFrames(ReductionRegistry legacy, ReductionRegistry current, ReductionRegistry afterGerman,
            ReductionRegistry afterPhysics) { }

    private record NativeV6Frame(JsonNode registry, Map<Path, JsonNode> documents, Map<Path, JsonNode> currentDocuments) { }

    private record NativeV7Boundary(JsonNode registry, byte[] bytes, Map<Path, JsonNode> documents) { }

    /** Raw frame transport only; the public Node verifier remains the per-cut proof authority. */
    private record NativeBasisBoundFrame(JsonNode registry, byte[] parentBytes, Map<Path, JsonNode> documents,
            Map<Path, JsonNode> currentDocuments, Set<String> touchedSources) { }

    private static NativeV7Boundary readNativeV7Boundary() throws IOException {
        byte[] bytes = Files.readAllBytes(REDUCTION_REGISTRY);
        JsonNode active = MAPPER.readTree(bytes);
        if (V8.equals(active.path("proofContract").asText())) {
            NativeBasisBoundFrame frame = readBasisBoundFrame(active, Map.of());
            return new NativeV7Boundary(frame.registry(), frame.parentBytes(), frame.documents());
        }
        assertThat(active.path("proofContract").asText()).isEqualTo(V7);
        return new NativeV7Boundary(active, bytes, Map.of());
    }

    private static NativeBasisBoundFrame readBasisBoundFrame(JsonNode registry,
            Map<Path, JsonNode> suppliedDocuments) throws IOException {
        assertFields(registry, "V8 basis-bound registry", "schemaVersion", "proofContract", "auditScope", "catalogSources",
                "parentRegistryPath", "parentRegistryRawDigest", "entries");
        assertThat(registry.path("schemaVersion").isIntegralNumber()).isTrue();
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isEqualTo(V8);
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        String parentPath = registry.path("parentRegistryPath").asText();
        assertThat(parentPath).startsWith("curricula/DE/Gymnasium/provenance/");
        Path parentFile = exactRegularRepositoryFile(parentPath);
        byte[] parentBytes = Files.readAllBytes(parentFile);
        assertThat(registry.path("parentRegistryRawDigest").asText()).matches("sha256:[0-9a-f]{64}");
        assertThat(rawByteHash(parentBytes)).as("byte-identical fixed V7 parent")
                .isEqualTo(registry.path("parentRegistryRawDigest").asText());
        JsonNode parent = MAPPER.readTree(parentBytes);
        assertFields(parent, "fixed V7 parent", "schemaVersion", "proofContract", "auditScope", "catalogSources",
                "parentRegistryPath", "parentRegistryRawDigest", "originalApplicability");
        assertThat(parent.path("schemaVersion").isIntegralNumber()).isTrue();
        assertThat(parent.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(parent.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(parent.path("proofContract").asText()).as("V8 accepts a fixed V7, never a recursive V8 parent").isEqualTo(V7);
        assertThat(parent.path("catalogSources").isArray()).isTrue();
        Map<String, JsonNode> parentBindings = new LinkedHashMap<>();
        for (JsonNode source : parent.path("catalogSources")) {
            assertFields(source, "V7 parent source", "path", "landscapeId", "baselineDocumentDigest", "currentDocumentDigest");
            assertThat(parentBindings.putIfAbsent(source.path("path").asText(), source)).isNull();
        }
        assertThat(parentBindings).hasSize(21);
        assertThat(registry.path("catalogSources").isArray()).isTrue();
        Map<Path, JsonNode> currentDocuments = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            assertFields(source, "V8 source", "path", "landscapeId", "baselineDocumentDigest", "currentDocumentDigest");
            String relative = source.path("path").asText();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            JsonNode binding = parentBindings.get(relative);
            assertThat(binding).as("same full V7/V8 catalog path %s", relative).isNotNull();
            assertThat(source.path("landscapeId")).isEqualTo(binding.path("landscapeId"));
            assertThat(source.path("baselineDocumentDigest")).isEqualTo(binding.path("baselineDocumentDigest"));
            Path file = exactRegularRepositoryFile(relative);
            JsonNode document = readFrameDocument(file, suppliedDocuments);
            assertThat(document.path("landscapeId")).isEqualTo(source.path("landscapeId"));
            assertDocumentDigest(document, source.path("currentDocumentDigest").asText(), "actual final V8 document " + relative);
            assertThat(currentDocuments.putIfAbsent(file, document)).isNull();
        }
        assertThat(currentDocuments).hasSize(parentBindings.size());
        Map<Path, JsonNode> restored = mutableDocuments(currentDocuments);
        JsonNode entries = registry.path("entries");
        assertThat(entries.isArray()).isTrue();
        assertThat(entries).isNotEmpty();
        Set<String> batchIds = new TreeSet<>(), basisSources = new TreeSet<>(), touchedSources = new TreeSet<>();
        for (int index = entries.size() - 1; index >= 0; index--) {
            JsonNode entry = entries.get(index), batch = entry.path("batch");
            assertFields(entry, "V8 flat entry", "basisBindings", "batch");
            assertFields(batch, "V8 batch", "id", "previousDigest", "originalRequires", "operations",
                    "currentDocumentDigests", "legacyContinuations");
            assertUniqueBatchId(batchIds, batch.path("id"));
            assertThat(batch.path("previousDigest").asText()).as("flat entry predecessor %s", index)
                    .isEqualTo(index == 0 ? registry.path("parentRegistryRawDigest").asText() : rawHash(entries.get(index - 1)));
            assertFrameDigests(batch.path("currentDocumentDigests"), restored, "V8 entry end " + index);
            Map<String, Map<String, JsonNode>> endGoals = frameGoals(immutableDocuments(restored)), goals = frameGoals(restored);
            Map<String, JsonNode> snapshots = new LinkedHashMap<>();
            assertThat(batch.path("originalRequires").isArray()).isTrue();
            for (JsonNode original : batch.path("originalRequires")) {
                assertFields(original, "V8 original requires", "source", "requires");
                String source = original.path("source").asText();
                assertThat(snapshots.putIfAbsent(source, original)).as("one V8 start snapshot %s", source).isNull();
                ObjectNode goal = (ObjectNode) registeredGoal(goals, source);
                if (original.path("requires").isNull()) goal.remove("requires");
                else goal.set("requires", MAPPER.valueToTree(rawRequires(original.path("requires"), source)));
                touchedSources.add(source);
            }
            assertThat(batch.path("operations").isArray()).isTrue();
            assertThat(batch.path("operations")).isNotEmpty();
            Set<String> operationSources = new TreeSet<>();
            for (JsonNode operation : batch.path("operations")) {
                if (operation.has("step")) operationSources.add(operation.path("step").path("source").asText());
                else {
                    assertThat(operation.path("steps").isArray()).isTrue();
                    assertThat(operation.path("steps")).isNotEmpty();
                    for (JsonNode step : operation.path("steps")) operationSources.add(step.path("source").asText());
                }
            }
            assertThat(snapshots.keySet()).as("exact V8 operation-source snapshots").isEqualTo(operationSources);
            Set<String> declared = new TreeSet<>();
            assertThat(entry.path("basisBindings").isArray()).isTrue();
            for (JsonNode binding : entry.path("basisBindings")) {
                assertFields(binding, "assessment basis binding", "operation", "source");
                assertThat(binding.path("operation").asText()).isEqualTo("bind-assessment-applicability-basis");
                String source = binding.path("source").asText();
                assertThat(declared.add(source) && basisSources.add(source)).as("one newly bound basis %s", source).isTrue();
                assertThat(snapshots).containsKey(source);
                JsonNode original = snapshots.get(source).path("requires");
                assertThat(original.isArray()).isTrue();
                assertThat(original).isNotEmpty();
                ObjectNode goal = (ObjectNode) registeredGoal(goals, source);
                JsonNode basis = goal.path("extendedData").path("assessmentApplicabilityBasis");
                assertFields(basis, "literal assessment basis", "kind", "goalRefs");
                assertThat(basis.path("kind").asText()).isEqualTo("allOfGoalApplicability");
                assertThat(basis.path("goalRefs")).as("exact immediate-start reference order and spelling %s", source).isEqualTo(original);
                ((ObjectNode) goal.path("extendedData")).remove("assessmentApplicabilityBasis");
            }
            Set<String> expected = new TreeSet<>();
            for (String source : snapshots.keySet()) {
                JsonNode start = registeredGoal(goals, source), end = registeredGoal(endGoals, source);
                boolean changed = !java.util.Objects.equals(start.get("requires"), end.get("requires"));
                boolean eligible = start.path("contains").isEmpty() && start.path("extendedData").isObject()
                        && start.path("extendedData").path("applicabilityFromRequires").isBoolean()
                        && start.path("extendedData").path("applicabilityFromRequires").asBoolean()
                        && !start.path("extendedData").has("assessmentApplicabilityBasis")
                        && !"cluster".equals(start.path("type").asText())
                        && (hasRawTag(start, "Assessment") || hasRawTag(start, "Practice") || start.has("examData"));
                if (changed && eligible) expected.add(source);
            }
            assertThat(declared).as("exact changed eligible unbound assessment endpoints").isEqualTo(expected);
            if (index == 0) {
                for (var binding : parentBindings.entrySet()) assertDocumentDigest(
                        restored.get(REPOSITORY.resolve(binding.getKey())), binding.getValue().path("currentDocumentDigest").asText(),
                        "restored full V7 parent " + binding.getKey());
            } else assertFrameDigests(entries.get(index - 1).path("batch").path("currentDocumentDigests"), restored,
                    "V8 entry start " + index);
        }
        for (JsonNode document : restored.values()) for (JsonNode goal : document.path("goals"))
            assertThat(goal.path("extendedData").has("assessmentApplicabilityBasis"))
                    .as("the fixed V7 prefix is basis-free: %s", goal.path("id").asText()).isFalse();
        assertThat(Files.readAllBytes(parentFile)).containsExactly(parentBytes);
        return new NativeBasisBoundFrame(parent, parentBytes, immutableDocuments(restored), immutableDocuments(currentDocuments),
                Set.copyOf(touchedSources));
    }

    private static boolean hasRawTag(JsonNode goal, String expected) {
        for (JsonNode tag : goal.path("tags")) if (tag.isTextual() && expected.equals(tag.asText())) return true;
        return false;
    }

    private static ReductionRegistry readActualCurrentRegistry() throws IOException {
        JsonNode active = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        if (!V8.equals(active.path("proofContract").asText())) {
            NativeV7Boundary boundary = readNativeV7Boundary();
            NativeV6Frame cache = readApplicabilityRefreshFrame(boundary.registry(), boundary.documents());
            BatchNativeFrames historical = readBatchedReductionRegistry(cache.registry(), cache.documents());
            return currentChemistryCacheFrames(boundary.registry(), cache, historical).after();
        }
        NativeBasisBoundFrame frame = readBasisBoundFrame(active, Map.of());
        NativeV6Frame prefix = readApplicabilityRefreshFrame(frame.registry(), frame.documents());
        readBatchedReductionRegistry(prefix.registry(), prefix.documents()); // retain every V1–V7 native boundary check
        // This comparison is explicitly immediate-V7 -> final-V8, not the earliest
        // comparison-only sourceFP baseline. Store both whole raw frames: a
        // requires-only restoration cannot remove the declared new basis keys.
        Map<Path, String> owners = new LinkedHashMap<>();
        Map<Path, DocumentDigests> digests = new LinkedHashMap<>();
        Map<Path, List<ChangedSource>> changes = new LinkedHashMap<>();
        Map<String, ChangedSource> changedSources = new LinkedHashMap<>();
        Map<String, Map<String, JsonNode>> before = frameGoals(frame.documents()), after = frameGoals(frame.currentDocuments());
        for (var entry : frame.documents().entrySet()) {
            Path file = entry.getKey();
            String owner = entry.getValue().path("landscapeId").asText();
            owners.put(file, owner);
            digests.put(file, new DocumentDigests(documentHash(entry.getValue()), documentHash(frame.currentDocuments().get(file))));
            List<ChangedSource> fileChanges = new ArrayList<>();
            for (String source : frame.touchedSources()) {
                String[] identity = qualifiedIdentity(source);
                if (!owner.equals(identity[0])) continue;
                JsonNode left = registeredGoal(before, source), right = registeredGoal(after, source);
                List<String> contains = rawRequires(left.path("contains"), source);
                assertThat(right.path("contains")).isEqualTo(left.path("contains"));
                ChangedSource changed = new ChangedSource(owner, identity[1],
                        left.has("requires") ? rawRequires(left.path("requires"), source) : List.of(),
                        right.has("requires") ? rawRequires(right.path("requires"), source) : List.of(), contains, contains.isEmpty(),
                        left.has("requires"), right.has("requires"));
                assertThat(changedSources.putIfAbsent(identity[1], changed)).isNull();
                fileChanges.add(changed);
            }
            changes.put(file, List.copyOf(fileChanges));
        }
        Set<String> batchIds = new TreeSet<>(changedSources.keySet());
        return new ReductionRegistry(Collections.unmodifiableMap(owners), Collections.unmodifiableMap(changes),
                Collections.unmodifiableMap(changedSources), List.of(), Collections.unmodifiableMap(digests),
                Set.of(), Set.of(), Set.of(), Set.of(), Map.of(), frame.currentDocuments(), Set.copyOf(batchIds), frame.documents());
    }

    private static JsonNode readNativeRegistryDeclaration() throws IOException {
        JsonNode active = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        if (V8.equals(active.path("proofContract").asText())) {
            NativeBasisBoundFrame frame = readBasisBoundFrame(active, Map.of());
            return readApplicabilityRefreshFrame(frame.registry(), frame.documents()).registry();
        }
        return V7.equals(active.path("proofContract").asText())
                ? readApplicabilityRefreshFrame(active).registry() : active;
    }

    /** Bind only the raw cache boundary; the actual TS compiler certifies the derived cache values. */
    private static NativeV6Frame readApplicabilityRefreshFrame(JsonNode registry) throws IOException {
        JsonNode active = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        Map<Path, JsonNode> documents = V8.equals(active.path("proofContract").asText())
                ? readBasisBoundFrame(active, Map.of()).documents() : Map.of();
        return readApplicabilityRefreshFrame(registry, documents);
    }

    private static NativeV6Frame readApplicabilityRefreshFrame(JsonNode registry,
            Map<Path, JsonNode> documents) throws IOException {
        assertFields(registry, "V7 cache refresh", "schemaVersion", "proofContract", "auditScope", "catalogSources",
                "parentRegistryPath", "parentRegistryRawDigest", "originalApplicability");
        assertThat(registry.path("schemaVersion").isIntegralNumber()).isTrue();
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isEqualTo(V7);
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("parentRegistryPath").isTextual()).isTrue();
        String parentPath = registry.path("parentRegistryPath").asText();
        assertThat(parentPath).startsWith("curricula/DE/Gymnasium/provenance/");
        Path parentFile = exactRegularRepositoryFile(parentPath);
        byte[] parentBytes = Files.readAllBytes(parentFile);
        assertThat(registry.path("parentRegistryRawDigest").asText()).matches("sha256:[0-9a-f]{64}");
        assertThat(rawByteHash(parentBytes)).as("byte-identical historical V6 parent")
                .isEqualTo(registry.path("parentRegistryRawDigest").asText());
        JsonNode parent = MAPPER.readTree(parentBytes);
        assertThat(parent.path("proofContract").asText()).as("V7 accepts only a strict V6 parent, never recursion").isEqualTo(V6);
        assertThat(parent.path("catalogSources").isArray()).isTrue();
        Map<String, JsonNode> parentBindings = new LinkedHashMap<>();
        for (JsonNode source : parent.path("catalogSources")) {
            assertFields(source, "parent catalog source", "path", "landscapeId", "baselineDocumentDigest", "currentDocumentDigest");
            assertThat(parentBindings.putIfAbsent(source.path("path").asText(), source)).isNull();
        }
        assertThat(parentBindings).hasSize(21);
        assertThat(registry.path("catalogSources").isArray()).isTrue();
        Map<Path, JsonNode> currentDocuments = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            assertFields(source, "V7 catalog source", "path", "landscapeId", "baselineDocumentDigest", "currentDocumentDigest");
            String relative = source.path("path").asText();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            JsonNode binding = parentBindings.get(relative);
            assertThat(binding).as("same full V6/V7 catalog path %s", relative).isNotNull();
            assertThat(source.path("landscapeId")).isEqualTo(binding.path("landscapeId"));
            assertThat(source.path("baselineDocumentDigest")).isEqualTo(binding.path("baselineDocumentDigest"));
            Path file = exactRegularRepositoryFile(relative);
            JsonNode document = readFrameDocument(file, documents);
            assertThat(document.path("landscapeId")).isEqualTo(source.path("landscapeId"));
            assertDocumentDigest(document, source.path("currentDocumentDigest").asText(), "actual V7 full document " + relative);
            assertThat(currentDocuments.putIfAbsent(file, document)).isNull();
        }
        assertThat(currentDocuments).hasSize(parentBindings.size());
        Map<Path, JsonNode> restoredDocuments = mutableDocuments(currentDocuments);
        Map<String, Map<String, JsonNode>> restoredGoals = frameGoals(restoredDocuments);
        Map<String, Map<String, JsonNode>> currentGoals = frameGoals(currentDocuments);
        assertThat(registry.path("originalApplicability").isArray()).isTrue();
        assertThat(registry.path("originalApplicability")).as("the reviewed 19 Physics, 7 Chemistry and 1 Informatics caches").hasSize(27);
        Set<String> sources = new TreeSet<>();
        for (JsonNode original : registry.path("originalApplicability")) {
            assertFields(original, "original applicability", "source", "present", "value");
            String source = original.path("source").asText();
            assertThat(sources.add(source)).as("one cache snapshot per source %s", source).isTrue();
            assertThat(original.path("present").isBoolean()).isTrue();
            boolean present = original.path("present").asBoolean();
            assertThat(present ? original.path("value").isObject() : original.path("value").isNull()).isTrue();
            ObjectNode goal = (ObjectNode) registeredGoal(restoredGoals, source);
            JsonNode current = registeredGoal(currentGoals, source);
            assertThat(current.has("applicability") == present
                    && (!present || original.path("value").equals(current.get("applicability"))))
                    .as("cache snapshot must describe a real change %s", source).isFalse();
            if (present) goal.set("applicability", original.path("value").deepCopy());
            else goal.remove("applicability");
        }
        for (var entry : restoredDocuments.entrySet()) {
            String relative = REPOSITORY.relativize(entry.getKey()).toString().replace(File.separatorChar, '/');
            assertDocumentDigest(entry.getValue(), parentBindings.get(relative).path("currentDocumentDigest").asText(),
                    "historical V6 pre-cache full document " + relative);
        }
        assertThat(Files.readAllBytes(parentFile)).as("historical parent bytes remain unchanged").containsExactly(parentBytes);
        System.out.printf("REGISTERED_NATIVE_FRAME active=V7 tested=historical-V6-precache-frame finalV7Coverage=false cacheSources=%d derivedCacheVerification=node-only%n", sources.size());
        return new NativeV6Frame(parent, immutableDocuments(restoredDocuments), immutableDocuments(currentDocuments));
    }

    private static Path exactRegularRepositoryFile(String relative) throws IOException {
        Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
        assertThat(file.startsWith(REPOSITORY)).isTrue();
        assertThat(REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/')).isEqualTo(relative);
        assertThat(Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)).as("regular native frame file %s", relative).isTrue();
        assertThat(file.toRealPath()).as("no native frame aliases %s", relative).isEqualTo(file);
        return file;
    }

    private static String rawByteHash(byte[] bytes) {
        try { return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (java.security.NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }

    private static BatchNativeFrames readBatchedReductionRegistry(JsonNode registry) throws IOException {
        JsonNode active = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        Map<Path, JsonNode> documents;
        if (V8.equals(active.path("proofContract").asText())) {
            NativeBasisBoundFrame frame = readBasisBoundFrame(active, Map.of());
            documents = readApplicabilityRefreshFrame(frame.registry(), frame.documents()).documents();
        } else documents = V7.equals(active.path("proofContract").asText())
                ? readApplicabilityRefreshFrame(active).documents() : Map.of();
        return readBatchedReductionRegistry(registry, documents);
    }

    private static BatchNativeFrames readBatchedReductionRegistry(JsonNode registry, Map<Path, JsonNode> documents) throws IOException {
        assertFields(registry, "V6 registry", "schemaVersion", "proofContract", "auditScope", "catalogSources",
                "originalRequires", "removals", "v2Checkpoint", "suffixOriginalRequires", "suffix", "v3Checkpoint",
                "tailOriginalRequires", "atomicRemovals", "witnessContinuations", "v4Checkpoint",
                "clusterTargetOriginalRequires", "clusterTargetSuffix", "v5Checkpoint", "batches");
        assertThat(registry.path("schemaVersion").isIntegralNumber()).isTrue();
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isEqualTo(V6);
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("batches").isArray()).isTrue();
        assertThat(registry.path("batches")).isNotEmpty();
        assertFields(registry.path("v5Checkpoint"), "V5 checkpoint", "registryDigest", "currentDocumentDigests");
        Map<Path, JsonNode> finalDocuments = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            String relative = source.path("path").asText();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(file.startsWith(REPOSITORY)).isTrue();
            assertThat(REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/')).isEqualTo(relative);
            JsonNode document = readFrameDocument(file, documents);
            assertThat(document.path("landscapeId").asText()).isEqualTo(source.path("landscapeId").asText());
            assertDocumentDigest(document, source.path("currentDocumentDigest").asText(), "V6 final document " + relative);
            assertThat(finalDocuments.putIfAbsent(file, document)).isNull();
        }
        assertThat(finalDocuments).hasSize(21);
        Map<Path, JsonNode> checkpointDocuments = mutableDocuments(finalDocuments);
        Map<Path, JsonNode> afterGermanDocuments = Map.of(), afterPhysicsDocuments = Map.of();
        // Every batch snapshot is its own start frame, including overlap with
        // an earlier batch or the V1-V5 prefix; null restores field absence.
        for (int index = registry.path("batches").size() - 1; index >= 0; index--) {
            JsonNode batch = registry.path("batches").get(index);
            if (index == 0) afterGermanDocuments = immutableDocuments(checkpointDocuments);
            if (index == 1) afterPhysicsDocuments = immutableDocuments(checkpointDocuments);
            assertFields(batch, "V6 batch", "id", "previousDigest", "originalRequires", "operations",
                    "currentDocumentDigests", "legacyContinuations");
            assertFrameDigests(batch.path("currentDocumentDigests"), checkpointDocuments, "batch end " + index);
            assertThat(batch.path("originalRequires").isArray()).isTrue();
            Set<String> snapshots = new TreeSet<>();
            Map<String, Map<String, JsonNode>> goals = frameGoals(checkpointDocuments);
            for (JsonNode original : batch.path("originalRequires")) {
                assertFields(original, "batch original requires", "source", "requires");
                String source = original.path("source").asText();
                assertThat(snapshots.add(source)).as("one start snapshot per batch source %s", source).isTrue();
                ObjectNode goal = (ObjectNode) registeredGoal(goals, source);
                if (original.path("requires").isNull()) goal.remove("requires");
                else goal.set("requires", MAPPER.valueToTree(rawRequires(original.path("requires"), source)));
            }
            JsonNode startDigests = index == 0 ? registry.path("v5Checkpoint").path("currentDocumentDigests")
                    : registry.path("batches").get(index - 1).path("currentDocumentDigests");
            assertFrameDigests(startDigests, checkpointDocuments, "batch start " + index);
        }
        ObjectNode prefix = registry.deepCopy();
        restoreCheckpointDocumentDigests(prefix, registry.path("v5Checkpoint"));
        prefix.remove(List.of("v5Checkpoint", "batches"));
        prefix.put("proofContract", V5);
        assertRawDocumentDigest(prefix, registry.path("v5Checkpoint").path("registryDigest").asText(), "complete V5 checkpoint");
        // No legacy reader checks are skipped or taught the new aggregate count.
        ReductionRegistry legacy = readReductionRegistry(prefix, checkpointDocuments);
        assertThat(legacy.changedSources()).hasSize(720);
        Set<String> touchedSources = new TreeSet<>(), firstBatchSources = new TreeSet<>(),
                throughPhysicsSources = new TreeSet<>(), uniqueIds = new TreeSet<>();
        String previousDigest = registry.path("v5Checkpoint").path("registryDigest").asText();
        for (int index = 0; index < registry.path("batches").size(); index++) {
            JsonNode batch = registry.path("batches").get(index);
            assertUniqueBatchId(uniqueIds, batch.path("id"));
            assertThat(batch.path("previousDigest").asText()).as("append-only batch predecessor %s", index).isEqualTo(previousDigest);
            // Every complete start and end frame was checked in the reverse
            // pass above. Walking predecessor hashes here binds that ordered
            // boundary inventory; it does not replay or certify operations.
            for (JsonNode original : batch.path("originalRequires")) {
                touchedSources.add(original.path("source").asText());
                if (index == 0) firstBatchSources.add(original.path("source").asText());
                if (index <= 1) throughPhysicsSources.add(original.path("source").asText());
            }
            previousDigest = rawHash(batch);
        }
        ReductionRegistry current = mergeBatchedNativeSources(legacy, finalDocuments, touchedSources);
        assertFrameDigests(registry.path("batches").get(0).path("currentDocumentDigests"), afterGermanDocuments, "after German batch");
        ReductionRegistry afterGerman = registry.path("batches").size() == 1 ? current
                : mergeBatchedNativeSources(legacy, afterGermanDocuments, firstBatchSources);
        ReductionRegistry afterPhysics = null;
        if (registry.path("batches").size() >= 2) {
            assertFrameDigests(registry.path("batches").get(1).path("currentDocumentDigests"), afterPhysicsDocuments,
                    "after Physics batch, independent of later batches");
            afterPhysics = registry.path("batches").size() == 2 ? current
                    : mergeBatchedNativeSources(legacy, afterPhysicsDocuments, throughPhysicsSources);
        }
        return new BatchNativeFrames(legacy, current, afterGerman, afterPhysics);
    }

    private static ReductionRegistry mergeBatchedNativeSources(ReductionRegistry legacy, Map<Path, JsonNode> documents,
            Set<String> touchedSources) throws IOException {
        Map<Path, JsonNode> baseline = new LinkedHashMap<>();
        for (var entry : legacy.canonicalOwners().entrySet()) baseline.put(entry.getKey(), reconstructRawDocument(entry.getKey(),
                readFrameDocument(entry.getKey(), legacy.currentDocuments()), entry.getValue(), legacy.documentDigests().get(entry.getKey()),
                legacy.changesByFile().getOrDefault(entry.getKey(), List.of()), true));
        Map<String, Map<String, JsonNode>> originalGoals = frameGoals(baseline), currentGoals = frameGoals(documents);
        Set<String> sources = new TreeSet<>(touchedSources), batchIds = new TreeSet<>();
        legacy.changedSources().values().forEach(source -> sources.add(source.owner() + ":" + source.goalId()));
        touchedSources.forEach(source -> batchIds.add(qualifiedIdentity(source)[1]));
        Map<String, ChangedSource> merged = new LinkedHashMap<>();
        Map<Path, List<ChangedSource>> changes = new LinkedHashMap<>();
        Map<Path, DocumentDigests> digests = new LinkedHashMap<>();
        for (var entry : legacy.canonicalOwners().entrySet()) digests.put(entry.getKey(),
                new DocumentDigests(legacy.documentDigests().get(entry.getKey()).original(), documentHash(documents.get(entry.getKey()))));
        for (String source : sources) {
            String[] identity = qualifiedIdentity(source);
            JsonNode before = registeredGoal(originalGoals, source), after = registeredGoal(currentGoals, source);
            List<String> contains = rawRequires(before.path("contains"), source);
            assertThat(after.path("contains")).as("batch contains remains unchanged %s", source).isEqualTo(before.path("contains"));
            assertThat(after.path("type")).isEqualTo(before.path("type"));
            assertStructuralSource(before, source, contains.isEmpty());
            assertStructuralSource(after, source, contains.isEmpty());
            ChangedSource changed = new ChangedSource(identity[0], identity[1],
                    before.has("requires") ? rawRequires(before.path("requires"), source) : List.of(),
                    after.has("requires") ? rawRequires(after.path("requires"), source) : List.of(), contains, contains.isEmpty(),
                    before.has("requires"), after.has("requires"));
            assertThat(merged.putIfAbsent(identity[1], changed)).as("unique native stable source ID %s", source).isNull();
            Path file = legacy.canonicalOwners().entrySet().stream().filter(entry -> identity[0].equals(entry.getValue()))
                    .map(Map.Entry::getKey).findFirst().orElseThrow();
            changes.computeIfAbsent(file, ignored -> new ArrayList<>()).add(changed);
        }
        Map<Path, List<ChangedSource>> immutableChanges = new LinkedHashMap<>();
        changes.forEach((file, value) -> immutableChanges.put(file, List.copyOf(value)));
        ReductionRegistry result = new ReductionRegistry(legacy.canonicalOwners(), Collections.unmodifiableMap(immutableChanges),
                Collections.unmodifiableMap(merged), legacy.clusterWitnessCoverage(), Collections.unmodifiableMap(digests),
                legacy.historicalSourceIds(), legacy.suffixSourceIds(), legacy.tailSourceIds(), legacy.clusterTargetSourceIds(),
                legacy.tailRemovedPrerequisites(), immutableDocuments(documents), Set.copyOf(batchIds), Map.of());
        for (var entry : result.canonicalOwners().entrySet()) reconstructRawDocument(entry.getKey(), documents.get(entry.getKey()),
                entry.getValue(), result.documentDigests().get(entry.getKey()), result.changesByFile().getOrDefault(entry.getKey(), List.of()),
                true, result.batchSourceIds());
        return result;
    }

    private static void assertFields(JsonNode value, String label, String... expected) {
        assertThat(value.isObject()).as(label).isTrue();
        Set<String> actual = new TreeSet<>();
        value.fieldNames().forEachRemaining(actual::add);
        assertThat(actual).as("exact %s fields", label).containsExactlyInAnyOrder(expected);
    }

    private static void assertUniqueBatchId(Set<String> ids, JsonNode value) {
        assertThat(value.isTextual()).isTrue();
        assertThat(value.asText()).isNotBlank();
        assertThat(ids.add(value.asText())).as("unique native batch boundary ID %s", value).isTrue();
    }

    private static Map<String, Map<String, JsonNode>> frameGoals(Map<Path, JsonNode> documents) {
        Map<String, Map<String, JsonNode>> goals = new LinkedHashMap<>();
        documents.values().forEach(document -> assertThat(goals.putIfAbsent(document.path("landscapeId").asText(), rawGoals(document))).isNull());
        return goals;
    }

    private static Map<Path, JsonNode> mutableDocuments(Map<Path, JsonNode> documents) {
        Map<Path, JsonNode> result = new LinkedHashMap<>();
        documents.forEach((path, document) -> result.put(path, document.deepCopy()));
        return result;
    }

    private static Map<Path, JsonNode> immutableDocuments(Map<Path, JsonNode> documents) {
        return Collections.unmodifiableMap(mutableDocuments(documents));
    }

    private static JsonNode readFrameDocument(Path file, Map<Path, JsonNode> documents) throws IOException {
        if (documents.isEmpty()) return MAPPER.readTree(file.toFile());
        assertThat(documents).as("complete native frame document %s", file).containsKey(file);
        return documents.get(file).deepCopy();
    }

    private static void assertFrameDigests(JsonNode bindings, Map<Path, JsonNode> documents, String label) {
        assertThat(bindings.isArray()).as(label).isTrue();
        Set<Path> paths = new HashSet<>();
        for (JsonNode binding : bindings) {
            assertFields(binding, "document digest", "path", "currentDocumentDigest");
            String relative = binding.path("path").asText();
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/')).isEqualTo(relative);
            assertThat(paths.add(file)).as("unique %s path %s", label, file).isTrue();
            assertThat(documents).containsKey(file);
            assertDocumentDigest(documents.get(file), binding.path("currentDocumentDigest").asText(), label + ": " + file);
        }
        assertThat(paths).as("complete %s catalog paths", label).containsExactlyInAnyOrderElementsOf(documents.keySet());
    }

    private static String rawHash(JsonNode value) {
        try { return CompletionReviewBindings.canonicalHash(value, MAPPER); }
        catch (Exception error) { throw new IllegalStateException("Cannot hash raw native frame", error); }
    }

    /** Catalog document digest: the landscape without its learning-unit layer (registry records stay raw). */
    private static String documentHash(JsonNode document) {
        return LearningUnitLayerProjection.documentHash(document, MAPPER);
    }

    private static void assertDocumentDigest(JsonNode document, String expected, String label) {
        assertThat(documentHash(document)).as(label).isEqualTo(expected);
    }

    private static void assertHistoricalBindings(JsonNode registry, boolean ordered, boolean continued, boolean clusterTargetNormalization) {
        assertRawDocumentDigest(registry.path("originalRequires"),
                "sha256:b731e23f6ef9e142d4efb7b95c844f8bed84f11e71c462fa21e40d9b2dc6583c", "historical 200 arrays");
        assertRawDocumentDigest(registry.path("removals"),
                "sha256:2c533d75b972288ab828a7312af9156d59c738e9d4a0e5755c3b25862470630f", "historical 204 removals");
        var baselines = MAPPER.createArrayNode();
        for (JsonNode source : registry.path("catalogSources")) {
            var binding = baselines.addObject();
            for (String field : List.of("path", "landscapeId", "baselineDocumentDigest")) binding.set(field, source.path(field));
        }
        assertRawDocumentDigest(baselines,
                "sha256:356ffe9a535fb4b35734c7c1bee0c5e9258feab163ea6dec83c4260d793d1471", "historical 21 baseline bindings");
        ObjectNode historical = registry.deepCopy();
        if (clusterTargetNormalization) {
            JsonNode checkpoint = historical.path("v4Checkpoint");
            assertThat(checkpoint.size()).isEqualTo(2);
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:b43287aac991215610cf9a3fa01a766c17d9a3e4bc47eb4cc45d61573ddb9803");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v4Checkpoint", "clusterTargetOriginalRequires", "clusterTargetSuffix"));
            historical.put("proofContract", V4);
            assertRawDocumentDigest(historical,
                    "sha256:b43287aac991215610cf9a3fa01a766c17d9a3e4bc47eb4cc45d61573ddb9803", "complete historical V4 checkpoint");
        }
        if (continued) {
            JsonNode checkpoint = historical.path("v3Checkpoint");
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:55bbd974c3265cd3802b7bf5d8622beeb2d3d5ac4795d4e0dfdb27b63302f06b");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v3Checkpoint", "tailOriginalRequires", "atomicRemovals", "witnessContinuations"));
            historical.put("proofContract", V3);
            assertRawDocumentDigest(historical,
                    "sha256:55bbd974c3265cd3802b7bf5d8622beeb2d3d5ac4795d4e0dfdb27b63302f06b", "complete historical V3 checkpoint");
        }
        if (ordered) {
            JsonNode checkpoint = historical.path("v2Checkpoint");
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:9142a16a3418ec77a7689a14c74eb86d0f77ee6e0ed166fac39c0f4737c0650f");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v2Checkpoint", "suffixOriginalRequires", "suffix"));
            historical.put("proofContract", V2);
        }
        assertRawDocumentDigest(historical,
                "sha256:9142a16a3418ec77a7689a14c74eb86d0f77ee6e0ed166fac39c0f4737c0650f", "complete historical V2 checkpoint");
    }

    private static void restoreCheckpointDocumentDigests(ObjectNode registry, JsonNode checkpoint) {
        assertThat(checkpoint.path("currentDocumentDigests").isArray()).isTrue();
        Map<String, String> currentDigests = new LinkedHashMap<>();
        for (JsonNode entry : checkpoint.path("currentDocumentDigests")) {
            assertThat(currentDigests.putIfAbsent(entry.path("path").asText(), entry.path("currentDocumentDigest").asText())).isNull();
        }
        assertThat(currentDigests).hasSize(21);
        for (JsonNode source : registry.path("catalogSources")) {
            assertThat(currentDigests).containsKey(source.path("path").asText());
            ((ObjectNode) source).put("currentDocumentDigest", currentDigests.get(source.path("path").asText()));
        }
    }

    private static void assertRawDocumentDigest(JsonNode document, String expected, String label) {
        try {
            assertThat(CompletionReviewBindings.canonicalHash(document, MAPPER)).as(label).isEqualTo(expected);
        } catch (Exception error) {
            throw new IllegalStateException("Cannot hash " + label, error);
        }
    }

    private static JsonNode reconstructRawDocument(Path source, JsonNode current, String owner,
            DocumentDigests digests, List<ChangedSource> changes, boolean originalBaseline) {
        return reconstructRawDocument(source, current, owner, digests, changes, originalBaseline, Set.of());
    }

    private static JsonNode reconstructRawDocument(Path source, JsonNode current, String owner,
            DocumentDigests digests, List<ChangedSource> changes, boolean originalBaseline, Set<String> structuralSourceIds) {
        assertThat(current.path("landscapeId").asText()).isEqualTo(owner);
        assertDocumentDigest(current, digests.current(), "current raw document " + source);
        JsonNode result = current.deepCopy();
        Map<String, JsonNode> goals = rawGoals(result);
        for (ChangedSource changed : changes) {
            JsonNode goal = goals.get(changed.goalId());
            assertThat(goal).as("raw overlay source %s", changed.goalId()).isNotNull();
            if (structuralSourceIds.contains(changed.goalId())) assertStructuralSource(goal, changed.goalId(), changed.atomicSource());
            else if (changed.atomicSource()) assertAtomicWitness(goal, changed.goalId());
            else assertThat(goal.path("type").asText()).isEqualTo("cluster");
            assertThat(rawRequires(goal.path("contains"), changed.goalId()))
                    .as("unchanged canonical contains for %s", changed.goalId()).containsExactlyElementsOf(changed.canonicalContains());
            assertThat(goal.has("requires")).as("current raw requires presence: %s", changed.goalId()).isEqualTo(changed.currentRequiresPresent());
            assertThat(goal.has("requires") ? rawRequires(goal.path("requires"), changed.goalId()) : List.of())
                    .as("pinned current raw requires: %s", changed.goalId()).containsExactlyElementsOf(changed.currentRequires());
            if (originalBaseline) {
                if (changed.originalRequiresPresent()) ((ObjectNode) goal).set("requires", MAPPER.valueToTree(changed.originalRequires()));
                else ((ObjectNode) goal).remove("requires");
            }
        }
        assertDocumentDigest(result, originalBaseline ? digests.original() : digests.current(),
                (originalBaseline ? "baseline" : "current") + " raw document " + source);
        return result;
    }

    private static String[] qualifiedIdentity(String reference) {
        String[] identity = reference.split(":", -1);
        assertThat(identity).as("qualified registry reference: %s", reference).hasSize(2);
        assertThat(identity[0]).isNotBlank();
        assertThat(identity[1]).isNotBlank();
        return identity;
    }

    private static JsonNode registeredGoal(Map<String, Map<String, JsonNode>> goalsByOwner, String reference) {
        String[] identity = qualifiedIdentity(reference);
        assertThat(goalsByOwner).as("registered reference owner: %s", reference).containsKey(identity[0]);
        JsonNode goal = goalsByOwner.get(identity[0]).get(identity[1]);
        assertThat(goal).as("registered canonical reference: %s", reference).isNotNull();
        return goal;
    }

    private static Map<String, JsonNode> rawGoals(JsonNode canonical) {
        assertThat(canonical.path("goals").isArray()).isTrue();
        Map<String, JsonNode> goals = new LinkedHashMap<>();
        canonical.path("goals").forEach(goal -> {
            String id = goal.path("id").asText();
            assertThat(id).isNotBlank();
            assertThat(goals.putIfAbsent(id, goal)).as("unique raw canonical goal: %s", id).isNull();
        });
        return goals;
    }

    private static Set<String> canonicalAtomicDescendants(String sourceId, Map<String, LearningGoal> canonical) {
        Set<String> visited = new TreeSet<>(), atoms = new TreeSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(List.of(sourceId));
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!visited.add(id)) continue;
            LearningGoal goal = canonical.get(id);
            assertThat(goal).as("complete canonical contains descendant %s of %s", id, sourceId).isNotNull();
            if (goal.getContains().isEmpty()) atoms.add(id);
            else pending.addAll(goal.getContains());
        }
        assertThat(atoms).as("nonempty canonical atomic basis of %s", sourceId).isNotEmpty();
        return Collections.unmodifiableSet(atoms);
    }

    private static void assertStructuralSource(JsonNode goal, String id, boolean atomic) {
        assertThat(goal).as("registered V6 structural source %s", id).isNotNull();
        assertThat(goal.path("contains").isArray()).isTrue();
        assertThat(goal.path("contains").isEmpty()).as("V6 contains classification %s", id).isEqualTo(atomic);
        if (goal.has("type")) assertThat(goal.path("type").asText()).as("noncontradictory explicit V6 type %s", id)
                .isEqualTo(atomic ? "atomic" : "cluster");
    }

    private static void assertAtomicWitness(JsonNode goal, String id) {
        assertThat(goal).as("registered native source/witness: %s", id).isNotNull();
        assertThat(goal.path("type").asText()).as("structurally atomic witness: %s", id).isEqualTo("atomic");
        assertThat(goal.path("contains").isArray()).isTrue();
        assertThat(goal.path("contains").isEmpty()).isTrue();
    }

    private static List<String> rawRequires(JsonNode references, String id) {
        assertThat(references.isArray()).as("raw ordered requires: %s", id).isTrue();
        List<String> result = new ArrayList<>();
        for (JsonNode reference : references) {
            assertThat(reference.isTextual()).isTrue();
            assertThat(reference.asText()).isNotBlank();
            result.add(reference.asText());
        }
        return List.copyOf(result);
    }

    private static final class RegistryBaselineJsonFactory extends JsonFactory {
        private final ReductionRegistry registry;
        private final boolean originalBaseline;
        RegistryBaselineJsonFactory(ReductionRegistry registry, boolean originalBaseline) {
            this.registry = registry;
            this.originalBaseline = originalBaseline;
        }
        private RegistryBaselineJsonFactory(RegistryBaselineJsonFactory source) {
            super(source, null);
            registry = source.registry;
            originalBaseline = source.originalBaseline;
        }
        @Override public JsonFactory copy() { return new RegistryBaselineJsonFactory(this); }
        @Override public JsonParser createParser(File file) throws IOException {
            Path source = file.toPath().toAbsolutePath().normalize();
            if (!registry.canonicalOwners().containsKey(source)) return super.createParser(file);
            JsonNode tree;
            if (!registry.originalDocuments().isEmpty()) {
                tree = readFrameDocument(source, originalBaseline ? registry.originalDocuments() : registry.currentDocuments());
                DocumentDigests digests = registry.documentDigests().get(source);
                assertDocumentDigest(tree, originalBaseline ? digests.original() : digests.current(),
                        "explicit whole V8 " + (originalBaseline ? "baseline" : "current") + " frame " + source);
            } else tree = reconstructRawDocument(source, readFrameDocument(source, registry.currentDocuments()), registry.canonicalOwners().get(source),
                    registry.documentDigests().get(source), registry.changesByFile().getOrDefault(source, List.of()),
                    originalBaseline, registry.batchSourceIds());
            return super.createParser(tree.toString());
        }
    }

    private static Discovery discover(NativeFixture fixture, String subject, JsonNode declared) throws Exception {
        assertThat(declared.isObject() && !declared.isEmpty()).as("GUI offerings for %s", subject).isTrue();
        Set<String> jurisdictions = new TreeSet<>();
        declared.fieldNames().forEachRemaining(jurisdictions::add);
        jurisdictions.add("ALL");
        return discover(fixture, subject, declared, jurisdictions);
    }

    private static Discovery discover(NativeFixture fixture, String subject, JsonNode declared,
            Set<String> jurisdictions) throws Exception {
        Map<String, Map<String, Map<String, Object>>> configurations = new TreeMap<>();
        Map<String, PersonalizationPlan> offeredPlans = new TreeMap<>();
        for (String jurisdiction : jurisdictions) {
            ArrayDeque<Map<String, Map<String, Object>>> pending = new ArrayDeque<>();
            pending.add(Map.of(ROOT, Map.of("selected", true, "filterId", jurisdiction)));
            Set<Map<String, Map<String, Object>>> visited = new HashSet<>();
            while (!pending.isEmpty()) {
                var config = pending.removeFirst();
                if (!visited.add(config)) continue;
                assertThat(visited.size()).as("bounded actual planner discovery").isLessThan(10000);
                PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                        (id, scope) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", id, scope), config);
                assertThat(plan.valid()).as("planner failure must not disappear: %s %s %s", subject, config, plan.problemCode()).isTrue();
                offeredPlans.put(MAPPER.writeValueAsString(config), plan);
                if (!plan.required()) {
                    if (Boolean.TRUE.equals(config.getOrDefault(subject, Map.of()).get("selected"))) {
                        assertThat(configurations.putIfAbsent(identity(config, subject), config)).as("unique planner configuration").isNull();
                    }
                    continue;
                }
                for (PersonalizationPlan.Option option : plan.options()) {
                    if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP || ROOT.equals(option.landscapeId()) || subject.equals(option.landscapeId())) {
                        Map<String, Object> mutable = new LinkedHashMap<>();
                        config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
                        var learner = new Learner(); learner.setSelectedCurriculum(ROOT);
                        ReflectionTestUtils.invokeMethod(fixture.service, "applyCurrentPersonalizationOption", learner, mutable, option);
                        pending.add(MAPPER.readValue(learner.getPersonalCurriculum(), new TypeReference<>() { }));
                    }
                }
            }
        }
        Set<String> planner = new TreeSet<>(configurations.keySet());
        Set<String> gui = new TreeSet<>();
        declared.fields().forEachRemaining(country -> {
            JsonNode settings = country.getValue();
            assertThat(settings.path("stages").isArray() && !settings.path("stages").isEmpty()).isTrue();
            assertThat(settings.path("durationModels").isArray()).isTrue();
            List<String> durations = new ArrayList<>();
            settings.path("durationModels").forEach(duration -> {
                assertThat(duration.asText()).isIn("G8", "G9"); durations.add(duration.asText());
            });
            if (durations.isEmpty()) durations.add("");
            settings.path("stages").forEach(stage -> {
                assertThat(stage.asText()).isIn("SekI", "SekII", "CrossStage");
                for (String duration : durations) for (String course : "SekI".equals(stage.asText()) ? List.of("") : List.of("GK", "LK", "GK+LK")) {
                    String identity = String.join("/", country.getKey(), stage.asText(), duration, course);
                    assertThat(gui.add(identity)).as("unique declared GUI configuration").isTrue();
                    Map<String, Object> root = new TreeMap<>(Map.of("selected", true, "filterId", country.getKey(), "stage", stage.asText()));
                    if (!duration.isBlank()) root.put("durationModel", duration);
                    Map<String, Object> selection = new TreeMap<>(Map.of("selected", true));
                    if (!course.isBlank()) selection.put("filterId", course);
                    configurations.putIfAbsent(identity, Map.of(ROOT, root, subject, selection));
                }
            });
        });
        return new Discovery(configurations, planner, gui, offeredPlans);
    }

    private static String identity(Map<String, Map<String, Object>> config, String subject) {
        Map<String, Object> root = config.get(ROOT);
        return String.join("/", (String) root.get("filterId"), (String) root.get("stage"),
                (String) root.getOrDefault("durationModel", ""), (String) config.get(subject).getOrDefault("filterId", ""));
    }

    private static JsonNode readGuiOfferings() throws IOException {
        String source = Files.readString(REPOSITORY.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker = "export const GYMNASIUM_CONTENT_OFFERINGS = ";
        int start = source.indexOf(marker), end = source.indexOf(" as const satisfies GymnasiumContentOfferings", start);
        assertThat(start).isNotNegative();
        assertThat(end).isGreaterThan(start);
        return new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(source.substring(start + marker.length(), end));
    }

    private static boolean hasDeclaredRole(NativeScope scope, String id) {
        return scope.roles().targets().contains(id) || scope.roles().support().contains(id);
    }

    private record AtomicFrontierCase(String name, Map<String, Double> mastery, Set<String> focus,
            boolean strict, Boolean expected) { }

    private static Map<String, JsonNode> nativeGermanApplicability(NativeFixture fixture) {
        Map<String, JsonNode> result = new TreeMap<>();
        for (var landscape : fixture.landscapes.getClosure(ROOT)) {
            if (!GERMAN.equals(landscape.getLandscapeId())) continue;
            for (var goal : landscape.getGoals()) result.put(goal.getId(), MAPPER.valueToTree(goal).path("applicability"));
        }
        assertThat(result).as("native German LandscapeService applicability").isNotEmpty();
        return result;
    }

    private static Map<String, JsonNode> projectedApplicability(NativeScope scope) {
        Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(scope.projection(), "visibleGoals");
        Map<String, JsonNode> result = new TreeMap<>();
        visible.forEach((id, goal) -> result.put(id, MAPPER.valueToTree(goal).path("applicability")));
        return result;
    }

    private static void assertGermanRawGoalNormalization(CompletionProfileCompiler.PrerequisiteTopology before,
            CompletionProfileCompiler.PrerequisiteTopology after, String scope) {
        assertThat(before.transitiveGoalPrerequisites(GERMAN_ATOM))
                .as("exact original German pre-expansion demand: %s", scope).containsExactlyInAnyOrder(GERMAN_CLUSTER, GERMAN_OTHER);
        Set<String> normalizedRoles = new TreeSet<>(GERMAN_LEAVES);
        normalizedRoles.add(GERMAN_OTHER);
        normalizedRoles.add(GERMAN_LEAF_PREREQUISITE);
        assertThat(after.transitiveGoalPrerequisites(GERMAN_ATOM))
                .as("exact normalized German pre-expansion demand: %s", scope)
                .hasSize(12).containsExactlyInAnyOrderElementsOf(normalizedRoles).doesNotContain(GERMAN_CLUSTER);
        assertThat(before.transitivePrerequisites(GERMAN_ATOM)).as("original complete German atomic demand: %s", scope).hasSize(20);
        assertThat(after.transitivePrerequisites(GERMAN_ATOM)).as("normalized complete German atomic demand: %s", scope)
                .isEqualTo(before.transitivePrerequisites(GERMAN_ATOM));
    }

    private static void assertGermanActualCompletionAndPolicyPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, DocumentDigests digests, String scope) {
        assertThat(before.graph().get(GERMAN_ATOM).getRequires()).containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
        List<String> current = new ArrayList<>(List.of(GERMAN_OTHER));
        current.addAll(GERMAN_LEAVES);
        assertThat(after.graph().get(GERMAN_ATOM).getRequires()).containsExactlyElementsOf(current);
        for (NativeScope actual : List.of(before, after)) {
            assertThat(actual.graph().get(GERMAN_ATOM).getType()).isEqualTo("atomic");
            assertThat(actual.graph().get(GERMAN_ATOM).getContains()).isEmpty();
            assertThat(actual.roles().atomicTargets()).contains(GERMAN_ATOM, GERMAN_LEAF);
            assertThat(actual.topology().transitivePrerequisites(GERMAN_ATOM)).contains(GERMAN_LEAF);
        }
        Map<String, Double> all = new TreeMap<>();
        before.graph().keySet().forEach(id -> all.put(id, 1.0));
        Map<String, Double> prepared = new TreeMap<>(all);
        prepared.remove(GERMAN_ATOM);
        Map<String, Double> leafOpen = new TreeMap<>(prepared);
        leafOpen.remove(GERMAN_LEAF);
        leafOpen.remove(GERMAN_CLUSTER);
        Map<String, Double> clusterMastered = new TreeMap<>(leafOpen);
        clusterMastered.put(GERMAN_CLUSTER, 1.0);
        Map<String, Map<String, Double>> cases = new LinkedHashMap<>();
        cases.put("all-open", Map.of());
        cases.put("all-closed", all);
        cases.put("prepared-source-open", prepared);
        cases.put("one-leaf-open-source-open", leafOpen);
        cases.put("cluster-mastered-leaf-open-source-open", clusterMastered);
        Set<String> focus = new TreeSet<>(before.roles().targets());
        assertThat(focus.remove(GERMAN_LEAF)).as("required actual target leaf is removed from focus: %s", scope).isTrue();
        assertThat(focus).contains(GERMAN_ATOM).doesNotContain(GERMAN_LEAF);

        // Independent native completion caches carry the pinned raw frame hashes.
        // Restore the existing fixture applications after this bounded matrix.
        Object previousBefore = ReflectionTestUtils.getField(beforeService, "completionApplicationService");
        Object previousAfter = ReflectionTestUtils.getField(afterService, "completionApplicationService");
        var beforeApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), digests.original(), true));
        var afterApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), digests.current(), true));
        ReflectionTestUtils.setField(beforeService, "completionApplicationService", beforeApplication);
        ReflectionTestUtils.setField(afterService, "completionApplicationService", afterApplication);
        try {
            CompiledCompletionProfile original = ReflectionTestUtils.invokeMethod(beforeService, "compileCompletionScope",
                    before.learner(), "automatic:personal-curriculum", before.projection(), before.graph());
            CompiledCompletionProfile normalized = ReflectionTestUtils.invokeMethod(afterService, "compileCompletionScope",
                    after.learner(), "automatic:personal-curriculum", after.projection(), after.graph());
            for (var entry : cases.entrySet()) {
                String name = entry.getKey();
                CompletionEvaluation left = beforeApplication.evaluate(original, entry.getValue());
                CompletionEvaluation right = afterApplication.evaluate(normalized, entry.getValue());
                assertThat(right).as("complete actual German evaluation %s: %s", name, scope).isEqualTo(left);
                assertThat(left.complete()).as("actual German completion control %s: %s", name, scope).isEqualTo("all-closed".equals(name));
                if (!"all-closed".equals(name)) assertThat(entry.getValue().getOrDefault(GERMAN_ATOM, 0.0)).isZero();
                for (boolean strict : List.of(false, true)) for (boolean focused : List.of(false, true)) {
                    boolean expected = switch (name) {
                        case "all-closed", "prepared-source-open" -> true;
                        case "one-leaf-open-source-open", "cluster-mastered-leaf-open-source-open" -> focused && !strict;
                        default -> false;
                    };
                    var probe = new AtomicFrontierCase(name, entry.getValue(), focused ? focus : null, strict, expected);
                    boolean leftPolicy = atomicFrontierProbe(beforeService, before, GERMAN_ATOM, probe);
                    boolean rightPolicy = atomicFrontierProbe(afterService, after, GERMAN_ATOM, probe);
                    assertThat(leftPolicy).as("actual German common-policy control %s strict=%s leafOutsideFocus=%s: %s",
                            name, strict, focused, scope).isEqualTo(expected);
                    assertThat(rightPolicy).as("actual German common-policy preservation %s strict=%s leafOutsideFocus=%s: %s",
                            name, strict, focused, scope).isEqualTo(leftPolicy);
                }
            }
            Map<String, Double> sourceMasteredLeafOpen = new TreeMap<>(all);
            sourceMasteredLeafOpen.put(GERMAN_ATOM, 1.0);
            sourceMasteredLeafOpen.put(GERMAN_LEAF, 0.0);
            assertThat(sourceMasteredLeafOpen.get(GERMAN_ATOM)).isEqualTo(1.0);
            assertThat(sourceMasteredLeafOpen.get(GERMAN_LEAF)).isZero();
            assertThat(afterApplication.evaluate(normalized, sourceMasteredLeafOpen))
                    .as("full completion with explicit assessment mastery and an open prerequisite: %s", scope)
                    .isEqualTo(beforeApplication.evaluate(original, sourceMasteredLeafOpen));
            Map<String, Double> originalEffective = ReflectionTestUtils.invokeMethod(beforeService, "computeEffectiveMastery", before.graph(), sourceMasteredLeafOpen);
            Map<String, Double> normalizedEffective = ReflectionTestUtils.invokeMethod(afterService, "computeEffectiveMastery", after.graph(), sourceMasteredLeafOpen);
            assertThat(normalizedEffective).as("native effective mastery with explicit assessment mastery and an open prerequisite: %s", scope)
                    .isEqualTo(originalEffective);
        } finally {
            ReflectionTestUtils.setField(beforeService, "completionApplicationService", previousBefore);
            ReflectionTestUtils.setField(afterService, "completionApplicationService", previousAfter);
        }
        System.out.printf("GERMAN_CLUSTER_TARGET_ACTUAL_SCOPE scope=%s preparedSourceOpenPositive=true requiredTargetLeafOutsideFocus=%s completionPairs=5 commonPolicyPairs=20 masteredSourceCompletionAndEffectiveMasteryPairs=1%n",
                scope, GERMAN_LEAF);
    }

    private static void assertGermanControlledRoleDifferences(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after) throws Exception {
        for (NativeScope actual : List.of(before, after)) {
            assertThat(Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(actual.projection(), "compositionViewApplied"))).isTrue();
            assertThat(hasDeclaredRole(actual, GERMAN_CLUSTER)).isTrue();
            for (String leaf : GERMAN_LEAVES) assertThat(hasDeclaredRole(actual, leaf)).isTrue();
        }
        // Missing acquisition atoms fail in both equivalent normalized frames.
        assertThat(roleProbe(beforeService, before, withoutAcquisitionTarget(before.projection(), GERMAN_LEAF), GERMAN_ATOM, before.topology()))
                .as("missing required acquisition leaf before normalization").isFalse();
        assertThat(roleProbe(afterService, after, withoutAcquisitionTarget(after.projection(), GERMAN_LEAF), GERMAN_ATOM, after.topology()))
                .as("missing required acquisition leaf after normalization").isFalse();
        // Removing only a non-atomic authored support role leaves complete L intact.
        assertThat(roleProbe(beforeService, before, withoutNonAtomicRole(before.projection(), GERMAN_CLUSTER), GERMAN_ATOM, before.topology()))
                .as("complete learning basis without a redundant cluster role before normalization").isTrue();
        assertThat(roleProbe(afterService, after, withoutNonAtomicRole(after.projection(), GERMAN_CLUSTER), GERMAN_ATOM, after.topology()))
                .as("complete learning basis without a redundant cluster role after normalization").isTrue();
    }

    private static void assertContinuedMathFocusPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String scope) {
        Set<String> focus = Set.of(RETAINED, REMOVED);
        assertThat(focus).doesNotContain(CONTINUED_BRIDGE);
        assertThat(before.roles().atomicTargets()).containsAll(focus);
        assertThat(after.roles().atomicTargets()).containsAll(focus);
        assertThat(before.graph().get(RETAINED).getRequires()).as("historical direct orientation edge").contains(REMOVED);
        assertThat(after.graph().get(RETAINED).getRequires()).as("current literal continuation first edge")
                .contains(CONTINUED_BRIDGE).doesNotContain(REMOVED);
        assertThat(after.graph().get(CONTINUED_BRIDGE).getRequires()).as("current literal continuation second edge").contains(REMOVED);
        assertThat(before.topology().transitivePrerequisites(RETAINED)).contains(CONTINUED_BRIDGE, REMOVED);
        assertThat(after.topology().transitivePrerequisites(RETAINED)).contains(CONTINUED_BRIDGE, REMOVED);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(REMOVED);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("continued-normal-focus-full-mastered", mastered, focus, false, true),
                new AtomicFrontierCase("continued-normal-focus-missing-orientation", missingOrientation, focus, false, false),
                new AtomicFrontierCase("continued-normal-focus-only-orientation-mastered", Map.of(REMOVED, 1.0), focus, false, true),
                new AtomicFrontierCase("continued-strict-focus-full-mastered", mastered, focus, true, true),
                new AtomicFrontierCase("continued-strict-focus-missing-orientation", missingOrientation, focus, true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, RETAINED, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, RETAINED, probe);
            assertThat(original).as("actual continued Math frontier positive/negative control %s: %s", probe.name(), scope)
                    .isEqualTo(probe.expected());
            assertThat(reduced).as("actual continued Math focus invariance %s: %s", probe.name(), scope).isEqualTo(original);
        }
        System.out.printf("MATH_CONTINUED_WITNESS_FOCUS_COVERAGE scope=%s source=%s focus=%s outsideFocusBridge=%s cases=%d%n",
                scope, RETAINED, focus, CONTINUED_BRIDGE, cases.size());
    }

    private static int assertMathSuffixAtomicFrontierPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String id, boolean validRoles, String scope) {
        assertThat(before.topology().transitivePrerequisites(id)).as("original Math demand: %s/%s", scope, id).contains(REMOVED);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(goal -> mastered.put(goal, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(REMOVED);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("math-normal-empty", Map.of(), null, false, null),
                new AtomicFrontierCase("math-normal-mastered", mastered, null, false, validRoles),
                new AtomicFrontierCase("math-strict-mastered", mastered, null, true, validRoles),
                new AtomicFrontierCase("math-strict-missing-orientation", missingOrientation, null, true, false),
                new AtomicFrontierCase("math-normal-atomic-focus", Map.of(), Set.of(id), false, validRoles),
                new AtomicFrontierCase("math-strict-atomic-focus", Map.of(), Set.of(id), true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, id, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, id, probe);
            assertThat(reduced).as("new Math atomic frontier %s/%s: %s", id, probe.name(), scope).isEqualTo(original);
            if (probe.expected() != null) assertThat(original).as("new Math frontier control %s/%s: %s", id, probe.name(), scope)
                    .isEqualTo(probe.expected());
        }
        return cases.size();
    }

    private static int assertLatinAtomicFrontierPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String atomId, boolean validRoles, String scope) {
        assertThat(atomId).isEqualTo(LATIN_ATOM);
        assertThat(before.topology().transitivePrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        assertThat(before.topology().transitiveGoalPrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(LATIN_ORIENTATION);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("normal-empty", Map.of(), null, false, null),
                new AtomicFrontierCase("normal-mastered", mastered, null, false, validRoles),
                new AtomicFrontierCase("strict-mastered", mastered, null, true, validRoles),
                new AtomicFrontierCase("strict-mastered-intermediate-missing-orientation", missingOrientation, null, true, false),
                new AtomicFrontierCase("strict-only-orientation-mastered", Map.of(LATIN_ORIENTATION, 1.0), null, true, false),
                new AtomicFrontierCase("normal-atomic-focus-empty", Map.of(), Set.of(atomId), false, validRoles),
                new AtomicFrontierCase("strict-atomic-focus-empty", Map.of(), Set.of(atomId), true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, atomId, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, atomId, probe);
            assertThat(reduced).as("native atomic frontier %s/%s: %s", atomId, probe.name(), scope).isEqualTo(original);
            if (probe.expected() != null) {
                assertThat(original).as("native frontier control %s/%s: %s", atomId, probe.name(), scope)
                        .isEqualTo(probe.expected());
            }
        }
        return cases.size();
    }

    private static boolean atomicFrontierProbe(LearnerService service, NativeScope scope,
            String atomId, AtomicFrontierCase probe) {
        Boolean originalStrictMode = scope.learner().getStrictMode();
        try {
            scope.learner().setStrictMode(probe.strict());
            Object prerequisites = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites",
                    scope.learner(), scope.projection(), probe.mastery(), probe.focus());
            assertThat(ReflectionTestUtils.<Object>invokeMethod(prerequisites, "topology"))
                    .as("actual atomic frontier topology: %s", probe.name()).isNotNull();
            return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(atomId), scope.projection(), prerequisites);
        } finally {
            scope.learner().setStrictMode(originalStrictMode);
        }
    }

    private static void assertBiologyOrientationAvailable(LearnerService service, NativeScope scope) {
        LearningGoal orientation = scope.graph().get(BIOLOGY_ORIENTATION);
        assertThat(orientation).isNotNull();
        assertThat(CompletionProfileCompiler.isOrientation(orientation)).isTrue();
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                orientation, scope.projection(), scope.frontier())).isTrue();
    }

    private static void assertInvalidAtomicRequirementOutsideFocusFailsClosed(LearnerService service, NativeScope scope) {
        String outsideFocus = scope.roles().atomicTargets().stream()
                .filter(id -> !BIOLOGY_ORIENTATION.equals(id) && "atomic".equals(scope.graph().get(id).getType()))
                .sorted().findFirst().orElseThrow();
        LearningGoal outsideGoal = scope.graph().get(outsideFocus);
        List<String> original = outsideGoal.getRequires();
        try {
            // The cached native definition is changed only in this isolated fixture.
            outsideGoal.setRequires(List.of("unknown-atomic-requirement-outside-focus"));
            Object rejected = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", scope.learner(),
                    scope.projection(), Map.of(), Set.of(BIOLOGY_ORIENTATION));
            assertThat(ReflectionTestUtils.<Object>invokeMethod(rejected, "topology")).isNull();
            assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(BIOLOGY_ORIENTATION), scope.projection(), rejected)).isFalse();
        } finally {
            outsideGoal.setRequires(original);
        }
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection) throws Exception {
        return roleProbe(service, scope, projection, SOURCE, scope.topology());
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        return roleProbe(service, scope.graph(), projection, sourceId, topology);
    }

    private static boolean roleProbe(LearnerService service, Map<String, LearningGoal> graph, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        return roleProbeWithPrerequisites(service, graph, projection, sourceId, fullMasteryPrerequisites(graph, topology));
    }

    private static Object fullMasteryPrerequisites(Map<String, LearningGoal> graph,
            CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        Map<String, Double> mastered = new TreeMap<>();
        graph.keySet().forEach(id -> mastered.put(id, 1.0));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$FrontierPrerequisites");
        var constructor = type.getDeclaredConstructor(Map.class, CompletionProfileCompiler.PrerequisiteTopology.class, Map.class, Set.class);
        constructor.setAccessible(true);
        return constructor.newInstance(graph, topology, mastered, null);
    }

    private static boolean roleProbeWithPrerequisites(LearnerService service, Map<String, LearningGoal> graph,
            Object projection, String sourceId, Object prerequisites) {
        return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered", graph.get(sourceId), projection, prerequisites);
    }

    private static void assertRequiredAcquisitionTargets(LearnerService service, NativeScope scope,
            String sourceId, String prerequisiteId) throws Exception {
        assertThat(scope.roles().targets()).contains(sourceId);
        assertThat(scope.context()).contains(sourceId);
        assertThat(scope.graph()).containsKey(sourceId);
        assertThat(scope.topology().transitiveGoalPrerequisites(sourceId)).contains(prerequisiteId);
        Map<String, LearningGoal> canonical = ReflectionTestUtils.invokeMethod(scope.projection(), "canonicalPrerequisiteGoals");
        Set<String> requiredAtoms = canonicalAtomicDescendants(prerequisiteId, canonical);
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(scope.projection(), "learningScope");
        assertThat(learning).isNotNull();
        assertThat(learning.learningAtomicGoalIds()).containsAll(requiredAtoms);
        assertThat(scope.roles().atomicTargets()).containsAll(requiredAtoms);
        assertThat(roleProbe(service, scope, scope.projection(), sourceId, scope.topology())).isTrue();
        for (String atom : requiredAtoms) assertThat(roleProbe(service, scope,
                withoutAcquisitionTarget(scope.projection(), atom), sourceId, scope.topology())).isFalse();
    }

    private static void assertDuplicateRemovalPreservesAcquisitionTargets(LearnerService service, NativeScope scope,
            String sourceId, String prerequisiteId) throws Exception {
        assertRequiredAcquisitionTargets(service, scope, sourceId, prerequisiteId);
        LearningGoal source = scope.graph().get(sourceId);
        List<String> original = source.getRequires();
        assertThat(original).contains(prerequisiteId);
        try {
            // Remove just this duplicate in the isolated native graph, never in canonical data.
            source.setRequires(original.stream().filter(id -> !prerequisiteId.equals(id)).toList());
            var reduced = new CompletionProfileCompiler().normalizePrerequisites(scope.graph());
            reduced.validateContext(scope.roles().atomicTargets());
            assertThat(reduced.transitiveGoalPrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitiveGoalPrerequisites(sourceId));
            assertThat(reduced.transitivePrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitivePrerequisites(sourceId));
            assertThat(roleProbe(service, scope, scope.projection(), sourceId, reduced)).isTrue();
        } finally {
            source.setRequires(original);
        }
    }

    /** Deliberately broken emitted acquisition basis; canonical definitions remain resolvable. */
    private static Object withoutAcquisitionTarget(Object projection, String id) throws Exception {
        PersonalCurriculumLearningScope original = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        assertThat(original).isNotNull();
        assertThat(original.learningAtomicGoalIds()).as("missing-target fixture removes an actual acquisition atom").contains(id);
        Set<String> learning = new TreeSet<>(original.learningAtomicGoalIds());
        Map<String, List<String>> paths = new TreeMap<>(original.requiredByPaths());
        learning.remove(id); paths.remove(id);
        var broken = new PersonalCurriculumLearningScope(original.seedAtomicGoalIds(), learning, paths);
        Map<String, LearningGoal> visible = new TreeMap<>(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(projection, "visibleGoals"));
        visible.remove(id);
        return copyProjectionWithoutRole(projection, id, visible, broken);
    }

    /** Corrupt only one emitted representation; canonical definitions and the full L stay intact. */
    private static Object withoutEmittedAcquisitionAtom(Object projection, String id, boolean removeTarget) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Map<String, LearningGoal> visible = new TreeMap<>(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(projection, "visibleGoals"));
        assertThat(targets).contains(id);
        assertThat(visible).containsKey(id);
        if (removeTarget) targets.remove(id);
        else visible.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class,
                Set.class, List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        return constructor.newInstance(visible, targets,
                ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied"),
                ReflectionTestUtils.invokeMethod(projection, "learningScope"),
                ReflectionTestUtils.invokeMethod(projection, "canonicalPrerequisiteGoals"));
    }

    /** A non-atomic authored support role alone is not an acquisition obligation. */
    private static Object withoutNonAtomicRole(Object projection, String id) throws Exception {
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        assertThat(learning).isNotNull();
        assertThat(learning.learningAtomicGoalIds()).doesNotContain(id);
        Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
        assertThat(structural.get(id)).as("non-atomic role fixture keeps its canonical definition").isNotNull();
        assertThat(structural.get(id).getContains()).isNotEmpty();
        return copyProjectionWithoutRole(projection, id,
                ReflectionTestUtils.invokeMethod(projection, "visibleGoals"), learning);
    }

    private static Object copyProjectionWithoutRole(Object projection, String id,
            Map<String, LearningGoal> visible, PersonalCurriculumLearningScope learning) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Set<String> support = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "prerequisiteOnlyGoalIds"));
        targets.remove(id); support.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class,
                Set.class, List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        return constructor.newInstance(visible, targets, support,
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"), ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied"), learning,
                ReflectionTestUtils.invokeMethod(projection, "canonicalPrerequisiteGoals"));
    }
}
