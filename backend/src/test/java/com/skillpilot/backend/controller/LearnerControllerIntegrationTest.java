package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CurriculaService;
import com.skillpilot.backend.service.LearnerService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.time.Instant;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LearnerControllerIntegrationTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATH_ROOT_ID = "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String CANONICAL_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_ROOT_ID = "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String CANONICAL_CHEMISTRY_ID = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String CANONICAL_BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String CANONICAL_INFORMATICS_ID = "7d51b38c-a149-5407-bddc-d2ce7878b020";
    private static final String CANONICAL_HISTORY_ID = "92406d94-e3c1-58ec-b7c6-12122278d25a";
    private static final String CANONICAL_GERMAN_ID = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String CANONICAL_POLITICS_ECONOMICS_ID = "51b60137-46e8-5498-973e-ea38bb32f327";
    private static final String CANONICAL_ENGLISH_ID = "c8c84073-46ae-57ec-898a-882d08d7a72f";
    private static final String CANONICAL_FRENCH_ID = "96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977";
    private static final String CANONICAL_LATIN_ID = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String CANONICAL_SPANISH_ID = "90eedebf-9ea8-5247-85dd-31c147f907c3";
    private static final String CANONICAL_ITALIAN_ID = "25c6b527-10d6-5d92-9d76-fab23585f29b";
    private static final String CANONICAL_RUSSIAN_ID = "242ba9bd-7ec7-5ec3-a15e-4f0f2b01aa37";
    private static final String CANONICAL_POLISH_ID = "f145785b-0c44-5246-af66-8a153d202cb9";
    private static final String CANONICAL_CZECH_ID = "0900df4c-beeb-5542-86f9-bd479c94746a";
    private static final String CANONICAL_GREEK_ID = "70a2cb55-127b-5c6e-b518-4a1c9f4f77a0";
    private static final String CANONICAL_CHINESE_ID = "8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80";
    private static final String CANONICAL_MUSIC_ID = "f620c251-c1e1-41c1-b4e1-b10950b43608";
    private static final String CANONICAL_ECONOMICS_ID = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
    private static final String HESSEN_GYMNASIUM_UPPER_ROOT_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String HESSEN_GYMNASIUM_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID = "2f391ba2-ba1e-40e4-a8d2-dff049516c13";
    private static final String HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID = "3e56aa75-c76c-4de5-883b-0aac98297846";
    private static final String HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID = "c1a02ddd-736d-4975-920b-18b03aff147f";
    private static final String HESSEN_GYMNASIUM_UPPER_HISTORY_ID = "bdc89685-73d3-446c-af5a-eaf642c07463";
    private static final String HESSEN_GYMNASIUM_UPPER_GERMAN_ID = "f1ba2118-853f-4aa0-bef5-4f749bc621ed";
    private static final String HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID = "1d0e9f8f-0087-49e4-8ea2-976e5a89b165";
    private static final String HESSEN_GYMNASIUM_UPPER_ENGLISH_ID = "bc2124fa-2974-46cc-85e7-2392e61250e1";
    private static final String HESSEN_GYMNASIUM_UPPER_FRENCH_ID = "30acd190-609c-4109-8ee7-06fc5594af19";
    private static final String HESSEN_GYMNASIUM_UPPER_LATIN_ID = "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1";
    private static final String HESSEN_GYMNASIUM_UPPER_SPANISH_ID = "936efc61-a4d5-49fd-8694-085d1347db80";
    private static final String HESSEN_GYMNASIUM_UPPER_GREEK_ID = "c7209caa-18e5-4dd8-b68f-dd86e228d045";
    private static final String HESSEN_GYMNASIUM_UPPER_CHINESE_ID = "7651cbe2-5fb8-464d-b0c4-3e830cda41dd";
    private static final String HESSEN_GYMNASIUM_UPPER_MUSIC_ID = "a8c23058-6998-49f2-9f3b-a85e951d5ab0";
    private static final String HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID = "a334a745-1d67-4e1d-86a5-dadc04f144d2";
    private static final String HESSEN_GYMNASIUM_LOWER_ROOT_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String HESSEN_GYMNASIUM_LOWER_MATH_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
    private static final String HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = "996d097a-cac2-4b5f-979a-b3a0b9803265";
    private static final String HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = "bea90c22-b9c5-4c0c-9b10-89d875f50772";
    private static final String HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = "71438941-0ceb-46ee-ad31-773cee700779";
    private static final String HESSEN_GYMNASIUM_LOWER_FRENCH_ID = "762de708-85fa-4324-958e-56002a318f7f";
    private static final String BAVARIA_GYMNASIUM_ROOT_ID = "12322e3f-f351-5d40-b4ea-4a13d7e15854";
    private static final String BAVARIA_GYMNASIUM_MATH_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String BAVARIA_GYMNASIUM_PHYSICS_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String BAVARIA_GYMNASIUM_CHEMISTRY_ID = "ff1ca997-b6cc-5ece-8e13-5498b4bbf808";
    private static final String BAVARIA_GYMNASIUM_BIOLOGY_ID = "357a7003-b636-570e-a0bd-6bb63518d2f6";
    private static final String BAVARIA_GYMNASIUM_CHINESE_ID = "40744ec5-7de1-5e41-9fc2-a1e774721644";
    private static final String BAVARIA_GYMNASIUM_INFORMATICS_ID = "1af3eba8-749f-5359-8f12-18f87b13616c";
    private static final String BAVARIA_GYMNASIUM_HISTORY_ID = "01c2ba7a-ebd4-5840-bc09-123d7b31c914";
    private static final String BAVARIA_GYMNASIUM_GERMAN_ID = "05f1cd27-5a58-5415-8fda-d4807067f70a";
    private static final String BAVARIA_GYMNASIUM_ENGLISH_ID = "9da8e86b-92dc-5ba0-827e-339400af2b38";
    private static final String BAVARIA_GYMNASIUM_GREEK_ID = "22703293-7307-5ad2-b158-efe6ae28c7c3";
    private static final String BAVARIA_GYMNASIUM_ECONOMICS_ID = "4959d7df-e430-5c1d-bb7b-873d6252a27f";
    private static final String BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID = "486a8278-39b2-5450-96f8-1076a47b655b";
    private static final String BAVARIA_GYMNASIUM_LATIN_ID = "c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b";
    private static final String BAVARIA_GYMNASIUM_MUSIC_ID = "a00d70bf-3d3c-58fc-af4f-881b29635c2e";
    private static final String BAVARIA_GYMNASIUM_FRENCH_ID = "49aefe0c-f365-5f30-b84f-b9a7699e4f2c";
    private static final String BAVARIA_GYMNASIUM_SPANISH_ID = "8dba4715-f75e-5339-9e99-02236e4b80dd";
    private static final String BAVARIA_GYMNASIUM_ITALIAN_ID = "c7643536-1163-50d8-86a6-9645c8fd3e25";
    private static final String BAVARIA_GYMNASIUM_RUSSIAN_ID = "2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7";
    private static final String BAVARIA_GYMNASIUM_POLISH_ID = "21148204-794c-515d-ae20-c4d5cd4e56d8";
    private static final String BAVARIA_GYMNASIUM_CZECH_ID = "097f3667-2488-57b2-a3e0-2cb334e422a2";
    private static final String LEGACY_BAVARIA_MATH_ROOT_ID = "eb9048a4-9cb9-5aaf-8a91-aeba08e05b0c";
    private static final String CANONICAL_PHYSICS_GK_PERSONAL_CONFIG = """
            {
              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
            }
            """;
    private static final String CANONICAL_PHYSICS_CROSS_STAGE_GK_PERSONAL_CONFIG = """
            {
              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                "selected": true,
                "filterId": "GK",
                "stage": "CrossStage"
              }
            }
            """;
    private static final String CANONICAL_MATH_ANALYSIS_CLUSTER_ID = "a668ea17-9226-4074-8f8e-051acbe839eb";
    private static final String CANONICAL_MATH_POWER_FUNCTIONS_ID = "30c013ac-5164-4c3c-8bc1-9a10b2f49533";
    private static final String CANONICAL_MATH_FUNCTION_CONCEPT_ID = "09f47964-2cd0-410e-93ee-9632b582fc91";
    private static final String CANONICAL_MATH_WHY_ID = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String CANONICAL_MATH_CALCULATE_VALUES_ID = "c65ecabf-d00b-4e2d-99ae-b64692325ffb";
    private static final String CANONICAL_MATH_READ_VALUES_ID = "a8c42ee9-2898-4247-819f-c235032ac78a";
    private static final String CANONICAL_MATH_SYMMETRY_ID = "d8c9eb57-1614-4c1d-829a-618134def352";
    private static final String CANONICAL_PHYSICS_CLUSTER_ID = "65ddd780-0323-45d1-8f94-5e31bf28da23";
    private static final String CANONICAL_PHYSICS_E3_CLUSTER_ID = "287739a3-6143-55d0-abe7-1a08889e9b49";
    private static final String CANONICAL_PHYSICS_E2_CLUSTER_ID = "9340e894-bb0d-45a4-91f2-b90a63ad50a8";
    private static final String CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID = "4dc9a094-66d7-4d4d-9436-134aabe48f39";
    private static final String CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID = "e9d616d8-685f-4129-a36f-dae7a280bae7";
    private static final String CANONICAL_PHYSICS_DIAGRAMS_ID = "ce431132-dfc4-42c2-aff6-bd72035190f8";
    private static final String CANONICAL_PHYSICS_UNIFORM_MOTION_ID = "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd";
    private static final String CANONICAL_PHYSICS_SUPERPOSITION_ID = "68c90ba6-c438-463c-9a53-cf61062d416a";
    private static final String CANONICAL_PHYSICS_FIRST_LAW_ID = "31a2ef52-114b-4d2c-a720-6ef5a390b6dc";
    private static final String CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID = "2eecd0e2-a7ca-4568-9b12-3d47706c65fb";
    private static final String CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID = "0da13365-02c2-44f1-8a81-d524ca0ac3ae";
    private static final String CANONICAL_CHEMISTRY_E_PHASE_CLUSTER_ID = "323a222e-5db8-53c5-b2dc-6f9c1d0d277c";
    private static final String CANONICAL_CHEMISTRY_REDOX_TERMS_ID = "04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162";
    private static final String CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID = "4961130b-1ee8-58f2-a319-dff0a864db6a";
    private static final String CANONICAL_BIOLOGY_E_PHASE_CLUSTER_ID = "78370970-54ec-579e-ab99-d16cce22e27d";
    private static final String CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID = "11e90f71-a9a4-5a57-b619-ad5d81e81f96";
    private static final String CANONICAL_BIOLOGY_CELL_TYPES_ID = "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f";
    private static final String CANONICAL_INFORMATICS_E_PHASE_CLUSTER_ID = "eaf62c0d-5e76-5467-94e0-bd100f3cb7e1";
    private static final String CANONICAL_INFORMATICS_E1_CLUSTER_ID = "c70a6558-79a4-5775-92ac-76af116141b9";
    private static final String CANONICAL_INFORMATICS_NETWORKS_ID = "ca07458c-1fc1-5ca1-b226-69f59e2d62d3";
    private static final String CANONICAL_INFORMATICS_TCP_IP_ID = "6539320a-aa0e-59e5-a34a-55f1a8b78337";
    private static final String CANONICAL_HISTORY_E_PHASE_CLUSTER_ID = "abed1f19-6cf8-54a4-aae2-d7691f97c2cf";
    private static final String CANONICAL_HISTORY_WHY_ID = "178c5d72-5a0c-514e-abed-0dc65c8d1aa2";
    private static final String CANONICAL_HISTORY_FORMS_CONTEXT_ID = "6fb3ce2a-8273-5b62-8a46-59f28ed3ad76";
    private static final String CANONICAL_HISTORY_REVOLUTION_CONTEXT_ID = "c5cb2db1-73ba-59bc-9ca0-c8c8a512b47a";
    private static final String CANONICAL_HISTORY_WEIMAR_CLUSTER_ID = "e7718577-7e82-5481-8398-460a06c5f3fb";
    private static final String CANONICAL_GERMAN_E_PHASE_CLUSTER_ID = "bbcabb0c-b319-5622-a5b7-a0259f7de255";
    private static final String CANONICAL_GERMAN_WHY_ID = "eff86a92-e048-5494-b561-6ecdda1fbf67";
    private static final String CANONICAL_GERMAN_GRAMMAR_ID = "2122b969-61e9-412f-9e97-8777c606d27a";
    private static final String CANONICAL_GERMAN_TEXT_TYPE_ID = "263b9af0-c584-4364-a35f-6dfccd7aaf21";
    private static final String CANONICAL_ENGLISH_E_PHASE_CLUSTER_ID = "8d4bc24e-8eb1-5167-9bd3-dda9845277c9";
    private static final String CANONICAL_ENGLISH_WHY_ID = "8610bd4b-6c16-579e-a741-5f602b3c2ea4";
    private static final String CANONICAL_ENGLISH_GROWING_UP_ID = "aefe30a8-cb8e-54dc-b1db-da7634f32584";
    private static final String CANONICAL_ENGLISH_TEXT_COMPREHENSION_ID = "4ba50e17-1a1c-5ea3-a615-ceb4229844c9";
    private static final String CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID = "aeacdf33-3be6-5a7f-adae-d2b490f81a0a";
    private static final String CANONICAL_ENGLISH_GROWING_UP_INTERCULTURAL_REFLECTION_ID =
            "393426c6-88ba-543e-8ea2-314e53fbb04d";
    private static final String CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_WRITING_MEDIATE_ID =
            "a9ba9796-5e6e-5a99-8c89-265aed2b6cbc";
    private static final String CANONICAL_FRENCH_ROOT_ID = "3cdb4109-e977-54f3-b662-0800e2f043d3";
    private static final String CANONICAL_FRENCH_E_PHASE_CLUSTER_ID = "fb4e7e31-be77-57ff-addb-d329633c049f";
    private static final String CANONICAL_FRENCH_WHY_ID = "81f0501c-890a-5ebd-be54-4ae7698d4d52";
    private static final String CANONICAL_FRENCH_READ_FAMILY_ID = "5f0b8adf-e7af-5cdd-a50c-0a721662b54c";
    private static final String CANONICAL_FRENCH_READ_YOUTH_ID = "a39ca386-25f4-53ee-9fb7-f4e787cb218a";
    private static final String CANONICAL_LATIN_E_PHASE_CLUSTER_ID = "415d72d7-34e2-5321-94c6-1d7a9a04404c";
    private static final String CANONICAL_LATIN_WHY_ID = "551f2d6c-a030-57cc-9dbd-af30b2c3972a";
    private static final String CANONICAL_LATIN_GRAMMAR_ID = "1476af3f-0ff9-59c0-8a1a-e81dfc011ae2";
    private static final String CANONICAL_LATIN_INTERPRETATION_ID = "662680a7-6018-5721-9166-2f73a7ea92c6";
    private static final String CANONICAL_SPANISH_E_PHASE_CLUSTER_ID = "f4bf14a4-099c-5baf-b1b2-75b5f5a8b8d0";
    private static final String CANONICAL_SPANISH_WHY_ID = "45767ca3-092b-5a6e-938d-72d6a08792dd";
    private static final String CANONICAL_SPANISH_READ_IDENTITY_ID = "2e40b905-27db-5976-bf4f-98c450cef0ac";
    private static final String CANONICAL_SPANISH_LISTEN_RELATIONSHIPS_ID = "31fc4aa9-6aaa-5728-9f93-4056e7524e8c";
    private static final String CANONICAL_ITALIAN_YEAR11_ID = "a9b442ce-de30-55f4-b682-838a706f26a4";
    private static final String CANONICAL_ITALIAN_WHY_ID = "7c89bfc4-b001-59c1-9a19-9c9e4a83fd21";
    private static final String CANONICAL_RUSSIAN_YEAR11_ID = "749d4bf1-adae-5c7d-a3e3-bd589074454f";
    private static final String CANONICAL_RUSSIAN_WHY_ID = "90e9542c-d052-5919-b6f7-ab461d155e75";
    private static final String CANONICAL_POLISH_YEAR11_ID = "7253caaf-5994-558d-a03f-ff52414ddc37";
    private static final String CANONICAL_POLISH_WHY_ID = "dbe53e98-bc35-5568-89ed-fa292051c1dd";
    private static final String CANONICAL_CZECH_YEAR11_ID = "6d8b2fdb-af63-5110-abc2-fee9946b91ff";
    private static final String CANONICAL_CZECH_WHY_ID = "bce55678-c4c3-52e9-9e21-97c0ba051135";
    private static final String CANONICAL_GREEK_E_PHASE_CLUSTER_ID = "fa373166-b85a-5cbb-ac34-1f9a97e39e49";
    private static final String CANONICAL_GREEK_E_PHASE_ID = "b743649c-d25a-50b8-8302-9e972e2a72c2";
    private static final String CANONICAL_GREEK_WHY_ID = "c8acea81-7cc7-5471-ba3d-cedde0e28bc6";
    private static final String CANONICAL_GREEK_LANGUAGE_FORMS_ID = "98a4f066-729b-517e-aa43-0975df521f1a";
    private static final String CANONICAL_GREEK_TEXT_UNDERSTANDING_ID = "2e09f77d-6e0c-5d11-aba2-f53863579a22";
    private static final String CANONICAL_GREEK_CULTURE_RELIGION_ID = "086a36a2-a443-5205-b59a-247d6bbb5d9f";
    private static final String CANONICAL_CHINESE_E_PHASE_ID = "e3a03481-cca8-510a-a559-e648aa7c2576";
    private static final String CANONICAL_CHINESE_E_PHASE_CLUSTER_ID = "78e54102-c215-50a5-b0c2-4f1deaa7a200";
    private static final String CANONICAL_CHINESE_WHY_ID = "d7a23bd7-81ee-5c3e-8e92-f5915ab588f2";
    private static final String CANONICAL_MUSIC_E_PHASE_ID = "c2bf22c5-4627-5e07-8e6c-d0dfaed165c0";
    private static final String CANONICAL_MUSIC_WHY_ID = "13716bad-4406-581e-8947-a685fb4f02a4";
    private static final String CANONICAL_MUSIC_NOTATION_ID = "a51650e4-40a6-572f-821e-839e8cff83c1";
    private static final String CANONICAL_MUSIC_RHYTHM_ID = "18479156-9314-5047-94fb-f112b846ccf1";
    private static final String CANONICAL_ECONOMICS_E1_CLUSTER_ID = "464e91ba-1aa4-56d1-bc00-818b5673a163";
    private static final String CANONICAL_ECONOMICS_E2_CLUSTER_ID = "f14dcf9f-66c5-5907-9e06-08f59a9a0e13";
    private static final String CANONICAL_ECONOMICS_ANALYZE_WORK_ID = "8768186a-a52c-50b3-a1d7-a56084aa31e0";
    private static final String CANONICAL_ECONOMICS_SOCIAL_CHANGE_ID = "77edbcf9-d14d-547e-8a5f-43863a3e300b";
    private static final String CANONICAL_ECONOMICS_CONSUMER_PROTECTION_ID = "c386592a-b259-538c-9929-25775af99b83";
    private static final String CANONICAL_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID = "bb341613-10ba-5d25-a331-36831bf766e3";
    private static final String CANONICAL_POLITICS_ECONOMICS_SOCIETY_CLUSTER_ID = "56cc2051-994e-57cc-8cbf-2d60bcad16a3";
    private static final String CANONICAL_POLITICS_ECONOMICS_ECONOMY_CLUSTER_ID = "7fbc5949-2c8c-53e5-a97f-af3cedf020c9";
    private static final String CANONICAL_POLITICS_ECONOMICS_WHY_ID = "b76a024a-55a6-5c77-85cd-b37ef10e5197";
    private static final String CANONICAL_POLITICS_ECONOMICS_RULE_OF_LAW_CLUSTER_ID =
            "8438a4b4-1275-51de-a222-c421b243d6fc";
    private static final String CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID =
            "af5870d3-ceb7-59cb-a038-ee9f273f9847";
    private static final String CANONICAL_POLITICS_ECONOMICS_MARKET_FOUNDATIONS_ID =
            "4b5b33cf-cc5e-566d-b27b-d8fef97bdd5b";
    private static final String LEGACY_PHYSICS_CLUSTER_ID = "af70212d-e318-462d-a53f-fee8f05697d6";
    private static final String LEGACY_PHYSICS_E3_CLUSTER_ID = "0f3f9df2-37ee-4fd9-95b6-8786367d3794";
    private static final String LEGACY_PHYSICS_E2_CLUSTER_ID = "52c3d2e8-6634-4806-b84b-3709e3c4aef1";
    private static final String LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID = "e26447c4-36a3-43ef-b400-ca918754f3b0";
    private static final String LEGACY_PHYSICS_ACCELERATED_ID = "d00d74e7-4fce-48e2-9d00-49f52082f8e6";
    private static final String LEGACY_PHYSICS_ENERGY_CONSERVATION_ID = "9aeaf941-baef-43fb-8077-50d37e600c26";
    private static final String LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID = "0436c8fc-b849-4cab-84d7-32e92c0d94a9";
    private static final String LEGACY_PHYSICS_WHY_ID = "4b56b5c6-0e7b-4486-aa8f-7d5be7f085a5";
    private static final String LEGACY_PHYSICS_DIAGRAMS_ID = "e8160c09-a013-4146-80e6-b0e5dedd8fc6";
    private static final String LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID = "a72207c1-0803-44c6-90be-2835121bbd18";
    private static final String LEGACY_CHEMISTRY_WHY_ID = "9058eb3b-3198-4fa0-8d0b-7249cf1bbcd0";
    private static final String LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID = "b126e678-4432-4ab3-a347-4cfd936ad8de";
    private static final String LEGACY_BIOLOGY_WHY_ID = "f56ab9a6-a04d-4dce-bb62-68bd1c9f3564";
    private static final String LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID = "9037d005-eea9-45b3-b5ed-23cea87312e7";
    private static final String LEGACY_INFORMATICS_WHY_ID = "db2d4785-9a69-468f-ba42-ac4be2bcfdb3";
    private static final String LEGACY_HISTORY_E_PHASE_CLUSTER_ID = "175a9c63-e86d-48d9-a4a0-eb818b2683dc";
    private static final String LEGACY_HISTORY_WHY_ID = "af666eb2-0845-42e9-baa7-d951df9cbc6d";
    private static final String LEGACY_GERMAN_E_PHASE_CLUSTER_ID = "da121f0a-946a-4f64-b322-89016916488c";
    private static final String LEGACY_GERMAN_WHY_ID = "572f8e34-c116-40bf-b7ee-4fc6bea1c4d4";
    private static final String LEGACY_ENGLISH_E_PHASE_CLUSTER_ID = "90ac9109-a708-4e9e-a112-6ba1fc9a8eb1";
    private static final String LEGACY_ENGLISH_WHY_ID = "27b96d3f-d705-419c-a757-b557bbe1ad59";
    private static final String LEGACY_FRENCH_ROOT_ID = "35cf060b-92dd-4b7b-b066-e95a51dc31d1";
    private static final String LEGACY_FRENCH_WHY_ID = "24216866-f18f-4db6-bdc3-05e81397c6c9";
    private static final String LEGACY_LATIN_E_PHASE_CLUSTER_ID = "90831aaf-1d6b-48ef-800a-f89163ad2728";
    private static final String LEGACY_LATIN_WHY_ID = "735abeb1-41ab-4e65-8be8-865731853213";
    private static final String LEGACY_SPANISH_E_PHASE_CLUSTER_ID = "9fa56b9a-3944-4d28-b7f3-ee1ebf18bb62";
    private static final String LEGACY_SPANISH_WHY_ID = "549ca3b3-28f3-42dc-ba23-eb299061ec93";
    private static final String LEGACY_GREEK_E_PHASE_ID = "bb6a397a-076b-4bdc-b2f2-7f42d11cd63e";
    private static final String LEGACY_GREEK_WHY_ID = "f4c86e99-93b1-4376-b9d0-408d611de20e";
    private static final String LEGACY_BAYERN_GREEK_YEAR10_CLUSTER_ID = "58470b33-4e36-58a7-97f8-9c49bab419fc";
    private static final String LEGACY_BAYERN_GREEK_WHY_ID = "8ef4c145-81b1-5c3c-81de-48dc3b49f61f";
    private static final String LEGACY_CHINESE_E_PHASE_ID = "edcbd970-9484-470a-9f59-2949fcc11775";
    private static final String LEGACY_CHINESE_WHY_ID = "e8aa1479-67e9-47bd-a248-496f1d1b8078";
    private static final String LEGACY_BAYERN_CHINESE_E_PHASE_CLUSTER_ID = "65974585-84e6-5cef-b1e5-e3098b0e6db0";
    private static final String LEGACY_BAYERN_CHINESE_WHY_ID = "f843da87-8244-5931-9400-aaf71e14d2fa";
    private static final String LEGACY_MUSIC_E_PHASE_ID = "1f2736e0-7ce6-4ce3-b699-c087debea900";
    private static final String LEGACY_MUSIC_WHY_ID = "b962c0be-d534-44ba-81d9-289cea06732a";
    private static final String LEGACY_ECONOMICS_E1_CLUSTER_ID = "d8960ba2-2e78-4cf8-b213-6cfcf3c4b135";
    private static final String LEGACY_ECONOMICS_WHY_ID = "45569ebe-14ed-4151-9cc8-da074c881d21";
    private static final String LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID = "e8dcf1ec-fdda-4528-ab67-212810d973a9";
    private static final String LEGACY_POLITICS_ECONOMICS_WHY_ID = "3bee27bb-2277-4a7a-a66e-5038d6ee1781";
    private static final String LEGACY_MATH_ANALYSIS_CLUSTER_ID = "a6ee6304-8c26-4eda-b56e-676655e703c2";
    private static final String LEGACY_MATH_ASSUMPTIONS_ID = "3f089297-03ce-42a6-9817-fcb31f75d66a";
    private static final String LEGACY_MATH_FUNCTION_CONCEPT_ID = "0903db01-4377-4a79-8f29-aceffea68f24";
    private static final String LEGACY_MATH_READ_VALUES_ID = "cd46ce36-883e-4e68-8bfd-2bbdc0ecce9d";
    private static final String LEGACY_MATH_SYMMETRY_ID = "8f42b49d-a2fb-45f5-9da3-97ec96b8113e";
    private static final String LEGACY_MATH_LK_PROOF_STRATEGIES_ID = "b3cd4a12-509f-46bb-b077-6d517a7aab76";
    private static final String LEGACY_MATH_MEMORY_E_PHASE_ID = "cef2c3f7-af4f-41db-809f-805957a66be3";
    private static final String CANONICAL_MATH_MEMORY_E_PHASE_ID = "77259806-add7-5fcb-b89c-376e1b0c88d6";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID =
            "6be922a1-e60a-5317-b910-b6fea632f0fb";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID =
            "aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID =
            "d91f9aba-814a-573e-a09e-ebeb3b9f2bf5";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID =
            "f7f4e1f0-3c48-5f1c-a474-4a41ca6296b6";
    private static final String LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID =
            "f431504c-3f62-562b-9af2-1475a3eaeed8";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID =
            "3d13ecad-1fab-527e-a833-5596edaa23c5";
    private static final String LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID =
            "0074dc7c-b4ab-5bfb-b1b7-a8f5cdb9accc";
    private static final String LEGACY_BAYERN_CHEMISTRY_ROOT_ID =
            "6600db65-5d0e-5d6b-8b51-20ac0d06e3fa";
    private static final String LEGACY_BAYERN_CHEMISTRY_REACTIONS_CLUSTER_ID =
            "29dece01-b7d9-5ed7-9602-f4d33c14eb3e";
    private static final String LEGACY_BAYERN_CHEMISTRY_MASS_CONSERVATION_ID =
            "95174725-dac5-5218-83c7-d5de8bc85dfb";
    private static final String LEGACY_BAYERN_CHEMISTRY_WHY_ID =
            "23135ca7-9f40-593a-9542-aeadb070ab92";
    private static final String CANONICAL_SEK1_CHEMISTRY_REACTIONS_CLUSTER_ID =
            "a00d302b-7762-4b9d-a6d7-de0c58b35540";
    private static final String BREMEN_CHEMISTRY_LOWER_SOURCE_ID =
            "b7e7ae4c-9e68-4231-bc73-da0da1efd9b4";
    private static final String BREMEN_CHEMISTRY_UPPER_SOURCE_ID =
            "98a4a027-3df3-5797-8664-c731d31942d5";
    private static final String BREMEN_CHEMISTRY_LOWER_SOURCE_GOAL_ID =
            "hb-chemistry-seki-bp2006-2022-3-1-luft-feuer-001-f3d42bd4";
    private static final String LEGACY_BAYERN_ENGLISH_YEAR11_CLUSTER_ID =
            "bb82312d-72b3-581e-b2a8-4ff7d5a5c0e1";
    private static final String LEGACY_BAYERN_ENGLISH_WHY_ID =
            "60827dde-1e79-5d24-9199-8e3b1db2020a";
    private static final String LEGACY_BAYERN_SPANISH_YEAR11_CLUSTER_ID =
            "8af1354d-41d8-5247-bd13-ed687280e2df";
    private static final String LEGACY_BAYERN_SPANISH_WHY_ID =
            "54ebc139-4bc5-5a91-80ad-c0e0e2ddf011";
    private static final String LEGACY_BAYERN_ITALIAN_YEAR11_CLUSTER_ID =
            "b710be14-8d49-5f14-ab37-394b35b84e10";
    private static final String LEGACY_BAYERN_ITALIAN_WHY_ID =
            "fcb79ea5-e777-50a0-927a-72edc5dfb4c5";
    private static final String LEGACY_BAYERN_RUSSIAN_YEAR11_CLUSTER_ID =
            "3ee5e185-0780-5393-bffa-0969a0333812";
    private static final String LEGACY_BAYERN_RUSSIAN_WHY_ID =
            "37df8430-2f97-50f8-a852-84e0be2da04e";
    private static final String LEGACY_BAYERN_POLISH_YEAR11_CLUSTER_ID =
            "44807e72-96c6-576e-bd89-43954a0e281a";
    private static final String LEGACY_BAYERN_POLISH_WHY_ID =
            "22cafb13-f570-501c-b7e6-1455f9db04e9";
    private static final String LEGACY_BAYERN_CZECH_YEAR11_CLUSTER_ID =
            "fada773b-c6bb-5574-bffc-728e0cb78052";
    private static final String LEGACY_BAYERN_CZECH_WHY_ID =
            "c09a1fe9-529b-5022-a541-a073b28f3d76";
    private static final String LEGACY_BAYERN_BIOLOGY_ROOT_ID =
            "3684bc95-f3db-5b57-b12e-9e02de718fad";
    private static final String LEGACY_BAYERN_BIOLOGY_GENETICS_CLUSTER_ID =
            "83af486d-92eb-501a-b32d-15a256be7d60";
    private static final String LEGACY_BAYERN_BIOLOGY_DNA_MODEL_ID =
            "e4f857b8-85da-58e5-9fb4-b4f05048d3b5";
    private static final String LEGACY_BAYERN_BIOLOGY_WHY_ID =
            "51457572-b3ad-5ba3-aa12-86ca45067b08";
    private static final String LEGACY_BAYERN_INFORMATICS_WHY_ID =
            "33b80734-cf18-5e6a-9b48-6a614b3992e2";
    private static final String LEGACY_BAYERN_INFORMATICS_NETWORKS_CLUSTER_ID =
            "eb772e65-91bb-541a-9d7a-06ab1a0b4b5e";
    private static final String LEGACY_BAYERN_INFORMATICS_INTERNET_STRUCTURE_ID =
            "0bb9320e-cfb2-5944-a4cf-2e0d26c4c9f7";
    private static final String LEGACY_BAYERN_HISTORY_WHY_ID =
            "7d92749a-3614-5e2b-97e4-eacd6339ccaf";
    private static final String LEGACY_BAYERN_HISTORY_WEIMAR_CLUSTER_ID =
            "1a54f4d8-c86d-5c19-b05f-cfbdec101df0";
    private static final String LEGACY_BAYERN_GERMAN_E_PHASE_CLUSTER_ID =
            "eeb4ac18-a545-55fd-84ed-acce0fec5947";
    private static final String LEGACY_BAYERN_GERMAN_GRAMMAR_ID =
            "e8bf22b0-cd8d-5224-869d-8b94c7fe6d33";
    private static final String LEGACY_BAYERN_GERMAN_WHY_ID =
            "2968400d-768c-517b-a598-dce1985b157b";
    private static final String LEGACY_BAYERN_FRENCH_ROOT_ID =
            "a2cc33f1-8751-5be7-aca0-14250f4fba33";
    private static final String LEGACY_BAYERN_FRENCH_YEAR11_CLUSTER_ID =
            "ef0e8cd9-7aec-57bc-af53-cebbdb628010";
    private static final String LEGACY_BAYERN_FRENCH_WHY_ID =
            "86e9e6b9-9859-5e8e-83ae-3e6362f476af";
    private static final String LEGACY_BAYERN_LATIN_E_PHASE_CLUSTER_ID =
            "b32269d2-70c1-54f9-a0df-bcbd3fbd6fe4";
    private static final String LEGACY_BAYERN_LATIN_WHY_ID =
            "0976df84-5b34-5c83-8b0a-ed374af4615b";
    private static final String LEGACY_BAYERN_MUSIC_E_PHASE_CLUSTER_ID =
            "423aa1a3-1bab-51c1-9e5f-02e027f4c50c";
    private static final String LEGACY_BAYERN_MUSIC_WHY_ID =
            "aac9c038-c7fd-51ff-95de-aeab19545483";
    private static final String LEGACY_BAYERN_ECONOMICS_HOUSEHOLD_CLUSTER_ID =
            "4b55574a-14fc-5f97-a9eb-682e919c18fa";
    private static final String LEGACY_BAYERN_ECONOMICS_CONSUMER_PROTECTION_ID =
            "84f15888-3d5b-54e5-ab4d-cbe007bc2570";
    private static final String LEGACY_BAYERN_ECONOMICS_WHY_ID =
            "eee51d91-0175-5a15-94ff-af7cf7484c49";
    private static final String LEGACY_BAYERN_POLITICS_SOCIETY_WHY_ID =
            "1311e9ab-0422-5744-b8c9-fd39bf15dd38";
    private static final String LEGACY_BAYERN_POLITICS_SOCIETY_RULE_OF_LAW_CLUSTER_ID =
            "ff38498e-2154-59ca-b69c-b0af47cc3d98";
    private static final String CANONICAL_BIOLOGY_Q1_CLUSTER_ID =
            "3ae95c96-e058-5045-b5e7-a613b8086f8b";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID =
            "713ad139-bcb8-5a71-a520-3f194a0f8754";
    private static final String LEGACY_BAYERN_FUNCTION_CLUSTER_ID =
            "f9538605-8bf4-5279-b00a-c18786f9cc51";
    private static final String LEGACY_BAYERN_FUNCTION_CONCEPT_ID =
            "0042dc1e-859b-5c95-95a4-48aeff1bae63";
    private static final String CANONICAL_SEK1_MATH_CLUSTER_ID =
            "5c6b7342-0f67-4b4c-894d-fd83a6df64b3";
    private static final String LEGACY_SEK1_LINEAR_FUNCTIONS_ID = "faafd111-21a1-4f67-945a-6bff60b3e19b";
    private static final String CANONICAL_SEK1_LINEAR_FUNCTIONS_ID = "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186";
    private static final String LEGACY_SEK1_MATH_ASSIGNMENTS_ID = "4261f57b-13c9-4733-a0dc-72f2dcd4726d";
    private static final String LEGACY_SEK1_PHYSICS_MECHANICS_CLUSTER_ID = "22f30637-5c9c-45c9-9c39-fd736ae565fb";
    private static final String CANONICAL_SEK1_PHYSICS_MECHANICS_CLUSTER_ID = "9645f0d8-43a3-5f29-873c-daa5ace638db";
    private static final String LEGACY_SEK1_PHYSICS_DIAGRAMS_ID = "d95d5a8b-8415-46d2-b8aa-568a7244f7a9";
    private static final String LEGACY_SEK1_CHEMISTRY_FOUNDATIONS_CLUSTER_ID = "8feb6b0f-d39c-4daf-9a13-9cb00413ff55";
    private static final String CANONICAL_SEK1_CHEMISTRY_FOUNDATIONS_CLUSTER_ID = "3588c15e-adbe-5b81-b3a7-10da20574e3d";
    private static final String LEGACY_SEK1_CHEMISTRY_METHODS_ID = "8476c11a-9c9a-4d4c-b1eb-9977d9fe4558";
    private static final String LEGACY_SEK1_BIOLOGY_FOUNDATIONS_CLUSTER_ID = "09ada9f9-7ed6-454c-b1cf-105c3e803ddc";
    private static final String CANONICAL_SEK1_BIOLOGY_FOUNDATIONS_CLUSTER_ID = "b530a382-2786-5794-8821-3e01a62d88fd";
    private static final String LEGACY_SEK1_BIOLOGY_LIFE_CHARACTERISTICS_ID = "6829bc14-3ac9-4e99-a0ca-b73f2e126d1a";
    private static final String LEGACY_SEK1_FRENCH_ROOT_ID = "2470bbf6-afaf-47de-a60a-c378aa10633a";
    private static final String LEGACY_SEK1_FRENCH_WHY_ID = "3b56ea78-beef-5bfa-84d8-ac8df9904f01";
    private static final String CANONICAL_SEK1_FRENCH_CLUSTER_ID = "f7f02fb7-8376-5aba-961c-743e528d1ff7";
    private static final String CANONICAL_SEK1_FRENCH_LISTENING_ID = "40d64ae5-d572-5b31-8fb2-4f789fc4b55a";

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private LearnerClientStateRepository learnerClientStateRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private CurriculumChampionRepository curriculumChampionRepository;

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private CurriculaService curriculaService;

    @Autowired
    private ObjectMapper objectMapper;

    @LocalServerPort
    private int port;

    private String learnerId;

    @BeforeEach
    void setUp() {
        curriculumChampionRepository.deleteAll();
        learnerClientStateRepository.deleteAll();
        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();

        Learner learner = new Learner();
        learner.setSkillpilotId("idempotent-learner");
        learner.setAutoPilot(false);
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @Test
    void registerChampionCountsProjectedLegacyMasteryForCanonicalGymnasiumTopic() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learnerRepository.save(learner);
        completeCanonicalSekTwoPersonalization(CANONICAL_MATH_ID);

        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_MATH_ASSUMPTIONS_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_SYMMETRY_ID, 1.0)));

        var response = curriculaService.registerChampion(
                new ChampionRegistrationRequest(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        learnerId,
                        "enpasos",
                        CANONICAL_MATH_ROOT_ID));

        assertThat(response.champion().curriculumId()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(response.champion().topicId()).isEqualTo(CANONICAL_MATH_ROOT_ID);
        assertThat(response.champion().masteredCount()).isEqualTo(2);
        assertThat(response.champion().totalTopicGoals()).isEqualTo(294);

        var snapshot = curriculaService.getSnapshot();
        var curriculum = snapshot.curricula().stream()
                .filter(entry -> CANONICAL_GYMNASIUM_ROOT_ID.equals(entry.curriculumId()))
                .findFirst()
                .orElseThrow();
        assertThat(curriculum.champions())
                .anySatisfy(champion -> {
                    assertThat(champion.topicId()).isEqualTo(CANONICAL_MATH_ROOT_ID);
                    assertThat(champion.masteredCount()).isEqualTo(2);
                    assertThat(champion.totalTopicGoals()).isEqualTo(294);
                });
    }

    @Test
    void registerChampionRespectsCanonicalStateFilterForProjectedLegacyMastery() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-BY"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        masteryRepository.save(new Mastery(learner, LEGACY_MATH_LK_PROOF_STRATEGIES_ID, 1.0));

        var response = curriculaService.registerChampion(
                new ChampionRegistrationRequest(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        learnerId,
                        "enpasos",
                        CANONICAL_MATH_ROOT_ID));

        assertThat(response.champion().masteredCount()).isZero();
    }

    @Test
    void registerChampionRespectsGkLkFilterForLearnerFacingCanonicalScope() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_MATH_SYMMETRY_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_LK_PROOF_STRATEGIES_ID, 1.0)));

        var response = curriculaService.registerChampion(
                new ChampionRegistrationRequest(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        learnerId,
                        "enpasos",
                        CANONICAL_MATH_ROOT_ID));

        assertThat(response.champion().masteredCount()).isEqualTo(1);
        assertThat(response.champion().totalTopicGoals()).isGreaterThan(1);
    }

    @Test
    void registerChampionCountsBothCourseLevelsForCombinedCanonicalScope() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "ALL"},
                  "__skillpilot_stage_scope_sek1__": {"selected": true},
                  "__skillpilot_stage_scope_sek2__": {"selected": true}
                }
                """);
        learnerRepository.save(learner);

        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_MATH_SYMMETRY_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_LK_PROOF_STRATEGIES_ID, 1.0)));

        var response = curriculaService.registerChampion(
                new ChampionRegistrationRequest(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        learnerId,
                        "enpasos",
                        CANONICAL_MATH_ROOT_ID));

        assertThat(response.champion().masteredCount()).isEqualTo(2);
        assertThat(response.champion().totalTopicGoals()).isGreaterThan(2);
    }

    @Test
    void registerChampionUsesLearnerFacingLegacyEquivalentPhysicsTotalsForHessenView() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learnerRepository.save(learner);
        completeCanonicalSekTwoPersonalization(CANONICAL_PHYSICS_ID);

        masteryRepository.save(new Mastery(learner, LEGACY_PHYSICS_DIAGRAMS_ID, 1.0));

        var response = curriculaService.registerChampion(
                new ChampionRegistrationRequest(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        learnerId,
                        "enpasos",
                        CANONICAL_PHYSICS_ROOT_ID));

        assertThat(response.champion().masteredCount()).isEqualTo(1);
        assertThat(response.champion().totalTopicGoals()).isEqualTo(189);
    }

    @Test
    void deregisterChampionsRemovesAllTopicEntriesForCurriculum() {
        CurriculumChampion first = new CurriculumChampion();
        first.setCurriculumId(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        first.setTopicId(CANONICAL_MATH_ROOT_ID);
        first.setSkillpilotId("sp-alpha");
        first.setGithubId("enpasos");

        CurriculumChampion second = new CurriculumChampion();
        second.setCurriculumId(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        second.setTopicId(CANONICAL_PHYSICS_ROOT_ID);
        second.setSkillpilotId("sp-beta");
        second.setGithubId("enpasos");

        CurriculumChampion third = new CurriculumChampion();
        third.setCurriculumId(CANONICAL_GYMNASIUM_ROOT_ID);
        third.setTopicId(CANONICAL_MATH_ROOT_ID);
        third.setSkillpilotId("sp-gamma");
        third.setGithubId("other-user");

        curriculumChampionRepository.saveAll(List.of(first, second, third));

        curriculaService.deregisterChampions("enpasos", List.of(HESSEN_GYMNASIUM_UPPER_ROOT_ID));

        assertThat(curriculumChampionRepository.findByGithubId("enpasos")).isEmpty();
        assertThat(curriculumChampionRepository.findByGithubId("other-user"))
                .extracting(CurriculumChampion::getCurriculumId)
                .containsExactly(CANONICAL_GYMNASIUM_ROOT_ID);
    }

    @Test
    void putPlannedGoals_isIdempotent() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learnerRepository.save(learner);
        completeCanonicalSekTwoPersonalization(CANONICAL_PHYSICS_ID);

        learnerService.setPlannedGoals(
                learnerId,
                Set.of(CANONICAL_PHYSICS_DIAGRAMS_ID));
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(CANONICAL_PHYSICS_DIAGRAMS_ID));

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .hasSize(1)
                .first()
                .extracting(pg -> pg.getGoalId())
                .isEqualTo(CANONICAL_PHYSICS_DIAGRAMS_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyMotionScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyE3ScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_E3_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_E3_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyE2ScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_E2_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E2_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_E2_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyConservationScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyConservationPlanAndMasteryIntoCanonicalFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID),
                List.of(
                        LEGACY_PHYSICS_ENERGY_CONSERVATION_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID, CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID)
                .doesNotContain(
                        LEGACY_PHYSICS_ENERGY_CONSERVATION_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID,
                        LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID, CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyMotionPlanAndMasteryIntoCanonicalFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID),
                List.of(
                        LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID,
                        LEGACY_SEK1_LINEAR_FUNCTIONS_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_UNIFORM_MOTION_ID)
                .doesNotContain(
                        LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID,
                        LEGACY_SEK1_LINEAR_FUNCTIONS_ID,
                        LEGACY_PHYSICS_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_UNIFORM_MOTION_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyE3PlanAndMasteryIntoCanonicalSuperpositionFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_E3_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID),
                List.of(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SUPERPOSITION_ID)
                .doesNotContain(
                        LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID,
                        LEGACY_PHYSICS_E3_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_SUPERPOSITION_ID);
    }

    @Test
    void getLearnerStateHttpTurnsLegacyE3PlanAndMasteryIntoCanonicalSuperpositionFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(LEGACY_PHYSICS_E3_CLUSTER_ID),
                List.of(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SUPERPOSITION_ID)
                .doesNotContain(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID, LEGACY_PHYSICS_E3_CLUSTER_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_SUPERPOSITION_ID);
    }

    @Test
    void getLearnerStateHttpExposesAuthoredNewtonAtomsInsteadOfCurricularAreaCluster() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID),
                List.of(LEGACY_PHYSICS_ACCELERATED_ID),
                CANONICAL_PHYSICS_CROSS_STAGE_GK_PERSONAL_CONFIG);

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(jsonIds(planned))
                .containsExactly(CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_FIRST_LAW_ID)
                .doesNotContain(
                        CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID,
                        LEGACY_PHYSICS_ACCELERATED_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_PHYSICS_FIRST_LAW_ID)
                .doesNotContain(CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID);

        learnerService.setActiveGoal(learnerId, CANONICAL_PHYSICS_FIRST_LAW_ID);
        var masteryUpdate = learnerService.setMastery(
                learnerId,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_PHYSICS_FIRST_LAW_ID, 1.0),
                        CANONICAL_PHYSICS_FIRST_LAW_ID));

        assertThat(masteryUpdate.saved()).isTrue();
        assertThat(masteryUpdate.savedGoalId()).isEqualTo(CANONICAL_PHYSICS_FIRST_LAW_ID);
        assertThat(masteryUpdate.activeGoal()).isNull();
        assertThat(masteryUpdate.frontier())
                .extracting(goal -> goal.id())
                .doesNotContain(
                        CANONICAL_PHYSICS_NEWTON_AXIOMS_CLUSTER_ID,
                        CANONICAL_PHYSICS_FIRST_LAW_ID);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId))
                .filteredOn(mastery -> CANONICAL_PHYSICS_FIRST_LAW_ID.equals(mastery.getGoalKey()))
                .singleElement()
                .extracting(Mastery::getValue)
                .isEqualTo(1.0);
    }

    @Test
    void compatibilitySessionRejectsUiLearningWrites() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("readonly-ui-learning");
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        HttpResponse<String> activeGoalResponse = sendJsonRequest(
                "POST",
                "/api/ui/learners/readonly-ui-learning/active-goal",
                """
                        {
                          "goalId": "%s"
                        }
                        """.formatted(LEGACY_MATH_FUNCTION_CONCEPT_ID));
        assertThat(activeGoalResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("readonly-ui-learning").orElseThrow().getActiveGoalId()).isNull();

        HttpResponse<String> plannedResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/readonly-ui-learning/planned",
                """
                        {
                          "goals": ["%s"]
                        }
                        """.formatted(LEGACY_MATH_ANALYSIS_CLUSTER_ID));
        assertThat(plannedResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId("readonly-ui-learning")).isEmpty();

        HttpResponse<String> clientStateResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/readonly-ui-learning/client-state/" + LEGACY_MATH_MEMORY_E_PHASE_ID,
                """
                        {
                          "updatedAt": "2026-03-14T10:15:30Z",
                          "srsState": {
                            "card-1": {
                              "interval": 1,
                              "repetition": 0,
                              "ef": 2.5,
                              "nextReview": 0
                            }
                          }
                        }
                        """);
        assertThat(clientStateResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerClientStateRepository.findById(
                new LearnerClientStateId("readonly-ui-learning", LEGACY_MATH_MEMORY_E_PHASE_ID))).isEmpty();
    }

    @Test
    void retiredBavariaAndHessenLowerSessionsRemainReadOnlyWithoutCutoverRuntime() throws Exception {
        Map<String, String> retiredCurriculaByLearner = Map.of(
                "readonly-bavaria-after-cutover-removal", BAVARIA_GYMNASIUM_MATH_ID,
                "readonly-hessen-lower-after-cutover-removal", HESSEN_GYMNASIUM_LOWER_MATH_ID);

        for (Map.Entry<String, String> entry : retiredCurriculaByLearner.entrySet()) {
            Learner learner = new Learner();
            learner.setSkillpilotId(entry.getKey());
            learner.setSelectedCurriculum(entry.getValue());
            learnerRepository.save(learner);

            HttpResponse<String> response = sendJsonRequest(
                    "POST",
                    "/api/ui/learners/" + entry.getKey() + "/active-goal",
                    """
                            {
                              "goalId": "retired-goal"
                            }
                            """);

            assertThat(response.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
            assertThatThrownBy(() -> learnerService.assertWritableLearningSession(entry.getKey()))
                    .hasMessageContaining("This retired compatibility learner session is read-only.");
            assertThat(learnerRepository.findById(entry.getKey()).orElseThrow().getActiveGoalId()).isNull();
        }
    }

    @Test
    void compatibilitySessionRejectsUiCurriculumMutationWrites() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("readonly-ui-config");
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        HttpResponse<String> curriculumResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/readonly-ui-config/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(CANONICAL_GYMNASIUM_ROOT_ID));
        assertThat(curriculumResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("readonly-ui-config").orElseThrow().getSelectedCurriculum())
                .isEqualTo(HESSEN_GYMNASIUM_UPPER_MATH_ID);

        HttpResponse<String> personalCurriculumResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/readonly-ui-config/personal-curriculum",
                """
                        {
                          "%s": {
                            "selected": true,
                            "filterId": "DE-HE"
                          }
                        }
                        """.formatted(CANONICAL_GYMNASIUM_ROOT_ID));
        assertThat(personalCurriculumResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("readonly-ui-config").orElseThrow().getPersonalCurriculum())
                .contains("\"2796fc7b-ba9d-446f-8f26-711dd6d8a9a3\"");
    }

    @Test
    void retiredCompatibilityCurriculumCannotBeSelectedViaUiEndpoint() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("retired-ui-selection");
        learnerRepository.save(learner);

        HttpResponse<String> curriculumResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(HESSEN_GYMNASIUM_UPPER_MATH_ID));

        assertThat(curriculumResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-ui-selection").orElseThrow().getSelectedCurriculum()).isNull();
    }

    @Test
    void retiredCompatibilityCurriculumCannotBeSelectedViaAiEndpoint() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("retired-ai-selection");
        learnerRepository.save(learner);

        HttpResponse<String> curriculumResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(HESSEN_GYMNASIUM_UPPER_MATH_ID));

        assertThat(curriculumResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-ai-selection").orElseThrow().getSelectedCurriculum()).isNull();
    }

    @Test
    void retainedBremenChemistrySourceExtractionsCannotBeSelectedViaUiEndpoint() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("retained-bremen-chemistry-selection");
        learnerRepository.save(learner);

        HttpResponse<String> lowerResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retained-bremen-chemistry-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BREMEN_CHEMISTRY_LOWER_SOURCE_ID));
        assertThat(lowerResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retained-bremen-chemistry-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> upperResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retained-bremen-chemistry-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BREMEN_CHEMISTRY_UPPER_SOURCE_ID));
        assertThat(upperResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retained-bremen-chemistry-selection").orElseThrow().getSelectedCurriculum())
                .isNull();
    }

    @Test
    void retainedBremenChemistrySourceExtractionSessionRejectsLearningWrites() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("readonly-bremen-chemistry-source-learning");
        learner.setSelectedCurriculum(BREMEN_CHEMISTRY_LOWER_SOURCE_ID);
        learnerRepository.save(learner);

        HttpResponse<String> activeGoalResponse = sendJsonRequest(
                "POST",
                "/api/ui/learners/readonly-bremen-chemistry-source-learning/active-goal",
                """
                        {
                          "goalId": "%s"
                        }
                        """.formatted(BREMEN_CHEMISTRY_LOWER_SOURCE_GOAL_ID));
        assertThat(activeGoalResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("readonly-bremen-chemistry-source-learning").orElseThrow().getActiveGoalId())
                .isNull();

        HttpResponse<String> plannedResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/readonly-bremen-chemistry-source-learning/planned",
                """
                        {
                          "goals": ["%s"]
                        }
                        """.formatted(BREMEN_CHEMISTRY_LOWER_SOURCE_GOAL_ID));
        assertThat(plannedResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId("readonly-bremen-chemistry-source-learning"))
                .isEmpty();
    }

    @Test
    void retiredBavariaPilotCompatibilityCurriculaCannotBeSelectedViaUiEndpoint() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("retired-bavaria-ui-selection");
        learnerRepository.save(learner);

        HttpResponse<String> rootResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_ROOT_ID));
        assertThat(rootResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> mathResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_MATH_ID));
        assertThat(mathResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> physicsResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_PHYSICS_ID));
        assertThat(physicsResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> chemistryResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_CHEMISTRY_ID));
        assertThat(chemistryResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> biologyResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_BIOLOGY_ID));
        assertThat(biologyResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> frenchResponse = sendJsonRequest(
                "PUT",
                "/api/ui/learners/retired-bavaria-ui-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_FRENCH_ID));
        assertThat(frenchResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ui-selection").orElseThrow().getSelectedCurriculum())
                .isNull();
    }

    @Test
    void retiredBavariaPilotCompatibilityCurriculaCannotBeSelectedViaAiEndpoint() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("retired-bavaria-ai-selection");
        learnerRepository.save(learner);

        HttpResponse<String> rootResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_ROOT_ID));
        assertThat(rootResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> mathResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_MATH_ID));
        assertThat(mathResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> physicsResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_PHYSICS_ID));
        assertThat(physicsResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> chemistryResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_CHEMISTRY_ID));
        assertThat(chemistryResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> biologyResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_BIOLOGY_ID));
        assertThat(biologyResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> frenchResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/retired-bavaria-ai-selection/curriculum",
                """
                        {
                          "curriculumId": "%s"
                        }
                        """.formatted(BAVARIA_GYMNASIUM_FRENCH_ID));
        assertThat(frenchResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(learnerRepository.findById("retired-bavaria-ai-selection").orElseThrow().getSelectedCurriculum())
                .isNull();
    }

    @Test
    void compatibilitySessionRejectsAiMasteryWrites() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("readonly-ai-mastery");
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        HttpResponse<String> masteryResponse = sendJsonRequest(
                "POST",
                "/api/ai/en/learners/readonly-ai-mastery/mastery",
                """
                        {
                          "goalId": "%s"
                        }
                        """.formatted(LEGACY_MATH_FUNCTION_CONCEPT_ID));
        assertThat(masteryResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(masteryRepository.findById(new com.skillpilot.backend.domain.MasteryId(
                "readonly-ai-mastery",
                LEGACY_MATH_FUNCTION_CONCEPT_ID))).isEmpty();
    }

    @Test
    void compatibilitySessionAiStateRouteStaysRetired() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("readonly-ai-state");
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        HttpResponse<String> retiredResponse = getRequest("/api/ai/en/learners/readonly-ai-state/state");
        assertThat(retiredResponse.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
    }

    @Test
    void compatibilityLandscapeDetailRouteIsRetired() throws Exception {
        HttpResponse<String> response = getRequest("/api/ui/landscapes/" + HESSEN_GYMNASIUM_UPPER_MATH_ID);

        assertThat(response.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
    }

    @Test
    void compatibilityLandscapeClosureRouteIsRetired() throws Exception {
        HttpResponse<String> response = getRequest("/api/ui/landscapes/" + HESSEN_GYMNASIUM_UPPER_MATH_ID + "/closure?lang=de");

        assertThat(response.statusCode()).isEqualTo(HttpStatus.CONFLICT.value());
    }

    @Test
    void learnerScopedClosureReturnsOnlySelectedCanonicalLandscapes() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("scoped-closure");
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "__skillpilot_stage_scope_sek1__": {"selected": true},
                  "__skillpilot_stage_scope_sek2__": {"selected": true},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "ALL"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": false, "filterId": "ALL"}
                }
                """);
        learnerRepository.save(learner);

        HttpResponse<String> response = getRequest(
                "/api/ui/learners/scoped-closure/landscapes/" + CANONICAL_GYMNASIUM_ROOT_ID + "/closure?lang=de");

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        JsonNode body = objectMapper.readTree(response.body());
        assertThat(body.isArray()).isTrue();
        List<String> landscapeIds = new ArrayList<>();
        for (JsonNode landscape : body) {
            landscapeIds.add(landscape.path("landscapeId").asText());
        }
        assertThat(landscapeIds).contains(CANONICAL_GYMNASIUM_ROOT_ID, CANONICAL_MATH_ID);
        assertThat(landscapeIds).doesNotContain(CANONICAL_PHYSICS_ID);
    }

    @Test
    void learnerStateUsesReviewedMathSekIDurationProjectionForAtomicTotals() throws Exception {
        String[][] scopes = {
                { "DE-BB", "238", "238" },
                { "DE-BE", "237", "237" },
                { "DE-BW", "256", "256" },
                { "DE-BY", "226", "226" },
                { "DE-HB", "211", "211" },
                { "DE-HE", "324", "378" },
                { "DE-HH", "237", "237" },
                { "DE-MV", "237", "237" },
                { "DE-NI", "237", "237" },
                { "DE-NW", "237", "237" },
                { "DE-RP", "158", "165" },
                { "DE-SH", "222", "229" },
                { "DE-SL", "237", "237" },
                { "DE-SN", "237", "237" },
                { "DE-ST", "237", "237" },
                { "DE-TH", "238", "238" }
        };
        SoftAssertions softly = new SoftAssertions();

        for (String[] scope : scopes) {
            String jurisdiction = scope[0];
            Learner learner = new Learner();
            learner.setSkillpilotId("duration-composition-" + jurisdiction.toLowerCase(Locale.ROOT));
            learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    CANONICAL_MATH_ID, jurisdiction, "G8", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g8State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g8Total = g8State.path("goals").path("personalized").path("total_atomic").asInt();

            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    CANONICAL_MATH_ID, jurisdiction, "G9", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g9State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g9Total = g9State.path("goals").path("personalized").path("total_atomic").asInt();

            assertThat(jsonTextValues(g8State.path("activeFilters"))).contains(jurisdiction, "G8", "GK");
            assertThat(jsonTextValues(g9State.path("activeFilters"))).contains(jurisdiction, "G9", "GK");
            softly.assertThat(g8Total).as(jurisdiction + " G8 total").isEqualTo(Integer.parseInt(scope[1]));
            softly.assertThat(g9Total).as(jurisdiction + " G9 total").isEqualTo(Integer.parseInt(scope[2]));
        }
        softly.assertAll();
    }

    @Test
    void learnerStateUsesMathCrossStageDurationCompositionViewsForAtomicTotals() throws Exception {
        String[][] scopes = {
                { "DE-HE", "GK", "738", "769" },
                { "DE-HE", "LK", "864", "895" },
                { "DE-RP", "GK", "577", "584" },
                { "DE-RP", "LK", "688", "695" },
                { "DE-SH", "GK", "622", "629" },
                { "DE-SH", "LK", "718", "725" }
        };
        SoftAssertions softly = new SoftAssertions();

        for (String[] scope : scopes) {
            String jurisdiction = scope[0];
            String courseProfile = scope[1];
            Learner learner = new Learner();
            learner.setSkillpilotId("duration-crossstage-" + jurisdiction.toLowerCase(Locale.ROOT) + "-"
                    + courseProfile.toLowerCase(Locale.ROOT));
            learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    CANONICAL_MATH_ID, jurisdiction, "G8", courseProfile, true, true));
            learnerRepository.save(learner);

            JsonNode g8State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g8Total = g8State.path("goals").path("personalized").path("total_atomic").asInt();

            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    CANONICAL_MATH_ID, jurisdiction, "G9", courseProfile, true, true));
            learnerRepository.save(learner);

            JsonNode g9State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g9Total = g9State.path("goals").path("personalized").path("total_atomic").asInt();

            assertThat(jsonTextValues(g8State.path("activeFilters"))).contains(jurisdiction, "G8", courseProfile);
            assertThat(jsonTextValues(g9State.path("activeFilters"))).contains(jurisdiction, "G9", courseProfile);
            softly.assertThat(g8Total).as(jurisdiction + " " + courseProfile + " G8 total")
                    .isEqualTo(Integer.parseInt(scope[2]));
            softly.assertThat(g9Total).as(jurisdiction + " " + courseProfile + " G9 total")
                    .isEqualTo(Integer.parseInt(scope[3]));
        }
        softly.assertAll();
    }

    @Test
    void learnerStateUsesReviewedScienceSekIDurationProjectionForAtomicTotals() throws Exception {
        String[][] scopes = {
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-BW", "80", "80" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-BY", "129", "129" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-HB", "97", "97" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-HE", "129", "129" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-NI", "88", "88" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-RP", "77", "77" },
                { "Biologie", CANONICAL_BIOLOGY_ID, "DE-SL", "60", "60" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-BB", "83", "83" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-BE", "83", "83" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-BW", "74", "74" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-BY", "89", "89" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-HB", "74", "74" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-HE", "89", "89" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-HH", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-MV", "57", "57" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-NI", "78", "78" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-NW", "59", "59" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-RP", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-SH", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-SL", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-SN", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-ST", "58", "58" },
                { "Chemie", CANONICAL_CHEMISTRY_ID, "DE-TH", "58", "58" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-BW", "141", "141" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-BY", "100", "100" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-HB", "134", "134" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-HE", "138", "138" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-HH", "134", "134" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-MV", "141", "141" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-SL", "138", "138" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-SN", "138", "138" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-ST", "141", "141" },
                { "Physik", CANONICAL_PHYSICS_ID, "DE-TH", "138", "138" }
        };
        SoftAssertions softly = new SoftAssertions();

        for (String[] scope : scopes) {
            String subject = scope[0];
            String subjectLandscapeId = scope[1];
            String jurisdiction = scope[2];
            Learner learner = new Learner();
            learner.setSkillpilotId("duration-science-" + subject.toLowerCase(Locale.ROOT) + "-"
                    + jurisdiction.toLowerCase(Locale.ROOT));
            learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    subjectLandscapeId, jurisdiction, "G8", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g8State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g8Total = g8State.path("goals").path("personalized").path("total_atomic").asInt();

            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    subjectLandscapeId, jurisdiction, "G9", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g9State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g9Total = g9State.path("goals").path("personalized").path("total_atomic").asInt();

            assertThat(jsonTextValues(g8State.path("activeFilters"))).contains(jurisdiction, "G8", "GK");
            assertThat(jsonTextValues(g9State.path("activeFilters"))).contains(jurisdiction, "G9", "GK");
            softly.assertThat(g8Total).as(subject + " " + jurisdiction + " G8 total")
                    .isEqualTo(Integer.parseInt(scope[3]));
            softly.assertThat(g9Total).as(subject + " " + jurisdiction + " G9 total")
                    .isEqualTo(Integer.parseInt(scope[4]));
        }
        softly.assertAll();
    }

    @Test
    void learnerStateUsesReviewedAdditionalM6SekIDurationProjectionForAtomicTotals() throws Exception {
        String[][] scopes = {
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-BB", "25", "25" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-BE", "25", "25" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-BW", "4", "4" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-BY", "34", "34" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-HH", "21", "21" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-MV", "24", "24" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-NI", "21", "21" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-NW", "19", "19" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-RP", "17", "17" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-SH", "26", "26" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-SL", "28", "28" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-SN", "28", "28" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-ST", "21", "21" },
                { "Informatik", CANONICAL_INFORMATICS_ID, "DE-TH", "23", "23" },
                { "Latein", CANONICAL_LATIN_ID, "DE-BB", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-BE", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-BW", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-BY", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-HB", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-HH", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-MV", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-NI", "27", "27" },
                { "Latein", CANONICAL_LATIN_ID, "DE-NW", "27", "27" },
                { "Latein", CANONICAL_LATIN_ID, "DE-RP", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-SH", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-SL", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-SN", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-ST", "28", "28" },
                { "Latein", CANONICAL_LATIN_ID, "DE-TH", "28", "28" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-BB", "19", "19" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-BE", "19", "19" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-HB", "14", "14" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-HE", "30", "30" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-HH", "21", "21" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-MV", "17", "17" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-NW", "27", "27" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-RP", "18", "18" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-SH", "34", "34" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-SL", "18", "18" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-SN", "19", "19" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-ST", "19", "19" },
                { "Politik und Wirtschaft", CANONICAL_POLITICS_ECONOMICS_ID, "DE-TH", "18", "18" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-BB", "82", "82" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-BE", "82", "82" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-BY", "128", "128" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-HB", "40", "40" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-HH", "38", "38" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-MV", "26", "26" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-NI", "47", "47" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-NW", "48", "48" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-RP", "40", "40" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-SH", "46", "46" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-SL", "40", "40" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-SN", "37", "37" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-ST", "37", "37" },
                { "Wirtschaftswissenschaften", CANONICAL_ECONOMICS_ID, "DE-TH", "78", "78" }
        };

        for (String[] scope : scopes) {
            String subject = scope[0];
            String subjectLandscapeId = scope[1];
            String jurisdiction = scope[2];
            Learner learner = new Learner();
            learner.setSkillpilotId("duration-m6-"
                    + subject.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-")
                    + "-" + jurisdiction.toLowerCase(Locale.ROOT));
            learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    subjectLandscapeId, jurisdiction, "G8", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g8State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g8Total = g8State.path("goals").path("personalized").path("total_atomic").asInt();

            learner.setPersonalCurriculum(canonicalGymnasiumSubjectPersonalCurriculum(
                    subjectLandscapeId, jurisdiction, "G9", "GK", true, false));
            learnerRepository.save(learner);

            JsonNode g9State = objectMapper.readTree(getRequest(
                    "/api/ui/learners/" + learner.getSkillpilotId() + "/state").body());
            int g9Total = g9State.path("goals").path("personalized").path("total_atomic").asInt();

            assertThat(jsonTextValues(g8State.path("activeFilters"))).contains(jurisdiction, "G8", "GK");
            assertThat(jsonTextValues(g9State.path("activeFilters"))).contains(jurisdiction, "G9", "GK");
            assertThat(g8Total).as(subject + " " + jurisdiction + " G8 total")
                    .isEqualTo(Integer.parseInt(scope[3]));
            assertThat(g9Total).as(subject + " " + jurisdiction + " G9 total")
                    .isEqualTo(Integer.parseInt(scope[4]));
        }
    }

    @Test
    void compatibilityCurriculumTopicsUseFrozenArchiveRegistry() throws Exception {
        HttpResponse<String> response = getRequest("/api/ui/curricula/" + HESSEN_GYMNASIUM_UPPER_MATH_ID + "/topics");

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        JsonNode body = objectMapper.readTree(response.body());
        assertThat(body.isArray()).isTrue();
        List<String> titles = new ArrayList<>();
        for (JsonNode topic : body) {
            titles.add(topic.path("title").asText());
        }
        assertThat(titles).contains("Q3 Stochastik", "Abiturprüfung Mathematik");
    }

    private String getLearnerStateBodyForPlannedGoals(String... goalIds) throws Exception {
        return getLearnerStateBody(List.of(goalIds), List.of());
    }

    private String getLearnerStateBody(List<String> plannedGoalIds, List<String> masteredGoalIds) throws Exception {
        return getLearnerStateBody(
                plannedGoalIds,
                masteredGoalIds,
                CANONICAL_PHYSICS_GK_PERSONAL_CONFIG);
    }

    private String getLearnerStateBody(
            List<String> plannedGoalIds,
            List<String> masteredGoalIds,
            String personalCurriculum) throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_PHYSICS_ID);
        learner.setPersonalCurriculum(personalCurriculum);
        learnerRepository.save(learner);

        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        plannedGoalRepository.saveAll(
                plannedGoalIds.stream().map(goalId -> new PlannedGoal(learner, goalId)).toList());
        masteryRepository.saveAll(
                masteredGoalIds.stream().map(goalId -> new Mastery(learner, goalId, 1.0)).toList());

        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/" + learnerId + "/state"))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        return response.body();
    }

    private String fetchLearnerStateBody() throws Exception {
        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/" + learnerId + "/state"))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        return response.body();
    }

    private HttpResponse<String> sendJsonRequest(String method, String path, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");

        if ("POST".equals(method)) {
            builder.POST(HttpRequest.BodyPublishers.ofString(body));
        } else if ("PUT".equals(method)) {
            builder.PUT(HttpRequest.BodyPublishers.ofString(body));
        } else {
            throw new IllegalArgumentException("Unsupported method: " + method);
        }

        return HttpClient.newHttpClient().send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> getRequest(String path) throws Exception {
        return HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + path))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private String canonicalGymnasiumSubjectPersonalCurriculum(
            String subjectLandscapeId,
            String jurisdiction,
            String durationModel,
            String courseProfile,
            boolean sek1Selected,
            boolean sek2Selected) {
        return """
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "%s"},
                  "__skillpilot_stage_scope_sek1__": {"selected": %s},
                  "__skillpilot_stage_scope_sek2__": {"selected": %s},
                  "%s": {"selected": true, "filterId": "%s", "durationModel": "%s"}
                }
                """.formatted(jurisdiction, sek1Selected, sek2Selected, subjectLandscapeId, courseProfile, durationModel);
    }

    private void completeCanonicalSekTwoPersonalization(String subjectLandscapeId) {
        applyCurrentPersonalizationOption(option ->
                "DE-HE".equals(option.filterId()));
        applyCurrentPersonalizationOption(option ->
                "durationModel".equals(option.scopeKey())
                        && "G9".equals(option.scopeValue()));
        applyCurrentPersonalizationOption(option ->
                "stage".equals(option.scopeKey())
                        && "SekII".equals(option.scopeValue()));
        applyCurrentPersonalizationOption(option ->
                option.kind() == PersonalizationPlan.OptionKind.VALUE
                        && subjectLandscapeId.equals(option.landscapeId())
                        && option.filterId() == null);
        applyCurrentPersonalizationOption(option ->
                option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP);
        applyCurrentPersonalizationOption(option ->
                option.kind() == PersonalizationPlan.OptionKind.VALUE
                        && subjectLandscapeId.equals(option.landscapeId())
                        && "GK".equals(option.filterId()));

        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage())
                .as("fixture must complete Level 2 before setting Level 3: %s", plan)
                .isEqualTo(PersonalizationPlan.Stage.COMPLETE);
    }

    private void applyCurrentPersonalizationOption(
            java.util.function.Predicate<PersonalizationPlan.Option> predicate) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        PersonalizationPlan.Option option = plan.options().stream()
                .filter(predicate)
                .findFirst()
                .orElseThrow(() -> new AssertionError(
                        "Expected current personalization option in " + plan));
        learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of(),
                option.optionId());
    }

    private String findResultStatus(JsonNode results, String skillpilotId) {
        for (JsonNode result : results) {
            if (skillpilotId.equals(result.path("skillpilotId").asText())) {
                return result.path("status").asText();
            }
        }
        return null;
    }

    private List<String> jsonIds(JsonNode nodes) {
        List<String> ids = new ArrayList<>();
        if (nodes == null || !nodes.isArray()) {
            return ids;
        }
        for (JsonNode node : nodes) {
            ids.add(node.path("id").asText());
        }
        return ids;
    }

    private List<String> jsonTextValues(JsonNode nodes) {
        List<String> values = new ArrayList<>();
        if (nodes == null || !nodes.isArray()) {
            return values;
        }
        for (JsonNode node : nodes) {
            values.add(node.asText());
        }
        return values;
    }

    private boolean containsNodeWithTag(JsonNode nodes, String tag) {
        if (nodes == null || !nodes.isArray()) {
            return false;
        }
        for (JsonNode node : nodes) {
            JsonNode tags = node.path("tags");
            if (!tags.isArray()) {
                continue;
            }
            for (JsonNode entry : tags) {
                if (tag.equals(entry.asText())) {
                    return true;
                }
            }
        }
        return false;
    }

}
