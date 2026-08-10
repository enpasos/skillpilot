import css from "./skillpilot-start.css";
import {
  SkillPilotStartBridge,
  type SkillPilotStartHostSupport,
  type SkillPilotStartToolResult
} from "./skillpilot-start-bridge";
import {
  HANDOFF_RETENTION_MS,
  SkillPilotBootstrapHttpError,
  canonicalSkillPilotId,
  createSkillPilotBootstrapRequest,
  createSkillPilotCapabilityArguments,
  createSkillPilotGetContextCall,
  createSkillPilotSetupMutationCall,
  isExactSkillPilotFallbackUrl,
  learningSessionIdFromStartMessage,
  sendSkillPilotBootstrap,
  skillPilotCapabilityFromToolResult,
  skillPilotSetupStateFromToolResult,
  skillPilotStartOpenFromToolResult,
  type SkillPilotBootstrapRequest,
  type SkillPilotIdentityMode,
  type SkillPilotStartLocale,
  type SkillPilotStartOpenResult,
  type SkillPilotSetupState,
  type SkillPilotSetupToolCall
} from "./skillpilot-start";

type OpenAiCompatibilityWindow = Window & {
  openai?: {
    toolResponseMetadata?: unknown;
    toolOutput?: unknown;
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolResponseMetadata?: unknown;
    toolOutput?: unknown;
  };
}>;

type FlowState =
  | "INITIALIZING"
  | "READY_FOR_ID"
  | "ISSUING_CAPABILITY"
  | "VALIDATING_AND_LAUNCHING"
  | "AWAITING_CREATED_ID_SAVE"
  | "LOADING_SETUP"
  | "AWAITING_SETUP_SELECTION"
  | "APPLYING_SETUP"
  | "SESSION_CREATED_PENDING_HOST_ACCEPTANCE"
  | "HOST_MESSAGE_OUTCOME_UNKNOWN"
  | "HOST_MESSAGE_ACCEPTED"
  | "FAILED"
  | "HANDOFF_EXPIRED";

type FailureKind =
  | "CAPABILITY"
  | "BOOTSTRAP"
  | "TERMINAL_BOOTSTRAP"
  | "SETUP_READ"
  | "SETUP_MUTATION_OUTCOME_UNKNOWN"
  | "SETUP_REJECTED"
  | "MESSAGE_REJECTED"
  | "MESSAGE_OUTCOME_UNKNOWN"
  | "EXPIRED";

type PendingStartMessage = {
  text: string;
  expiresAtMs: number;
};

type PendingSetupMutation = {
  call: SkillPilotSetupToolCall;
};

type Copy = {
  eyebrow: string;
  title: string;
  readyBody: string;
  newIdentity: string;
  newIdentityBody: string;
  existingIdentity: string;
  existingIdentityBody: string;
  idLabel: string;
  idHint: string;
  invalidId: string;
  language: string;
  german: string;
  english: string;
  eligibility: string;
  eligibilityFallback: string;
  currentMajorWarning: string;
  stayCurrent: string;
  upgradeTitle: string;
  upgradeBody: string;
  openSuccessor: string;
  start: string;
  issuing: string;
  launching: string;
  loadingSetup: string;
  applyingSetup: string;
  handingOff: string;
  checkingHost: string;
  unsupportedTitle: string;
  unsupportedBody: string;
  errorTitle: string;
  capabilityErrorBody: string;
  bootstrapErrorBody: string;
  terminalBootstrapErrorBody: string;
  setupReadErrorBody: string;
  setupMutationOutcomeUnknownBody: string;
  setupRejectedBody: string;
  messageRejectedBody: string;
  messageOutcomeUnknownBody: string;
  retryBootstrap: string;
  retrySetupRead: string;
  retrySetupMutation: string;
  retryMessage: string;
  enterAgain: string;
  newStart: string;
  completeTitle: string;
  completeBody: string;
  createdIdTitle: string;
  createdIdBody: string;
  createdIdLabel: string;
  copyId: string;
  copiedId: string;
  savedIdConfirmation: string;
  continueSetup: string;
  curriculumTitle: string;
  curriculumBody: string;
  personalizationTitle: string;
  personalizationBody: string;
  selectedCount: string;
  unavailableTitle: string;
  unavailableBody: string;
  expiredTitle: string;
  expiredBody: string;
  openSkillPilot: string;
};

const COPY: Record<SkillPilotStartLocale, Copy> = {
  de: {
    eyebrow: "SkillPilot Coach v1",
    title: "Lernsession starten",
    readyBody: "Erstelle hier eine neue SkillPilot-ID oder verwende eine vorhandene. Die gesamte Einrichtung bleibt in diesem Fenster.",
    newIdentity: "Neue SkillPilot-ID erstellen",
    newIdentityBody: "SkillPilot erzeugt die ID beim Start. Sie wird dir anschließend einmal zum sicheren Speichern angezeigt.",
    existingIdentity: "Vorhandene SkillPilot-ID verwenden",
    existingIdentityBody: "Deine vorhandene ID wird ausschließlich direkt per HTTPS an SkillPilot gesendet.",
    idLabel: "SkillPilot-ID",
    idHint: "Die ID wird erst nach deiner Bestätigung direkt per HTTPS an SkillPilot gesendet.",
    invalidId: "Gib eine gültige SkillPilot-ID ein.",
    language: "Sprache der Lernsession",
    german: "Deutsch",
    english: "Englisch",
    eligibility:
      "Ich bestätige den Hinweis: ChatGPT hostet und führt diese Komponente aus. Die SkillPilot-ID wird nur flüchtig in der Komponente gehalten und direkt per HTTPS an SkillPilot gesendet. Sie wird niemals in Chat, Modellkontext, MCP-Toolargumente oder -resultate, Host-State, Web-Speicher, URL, Logs oder Analytik übernommen. Nur auf meine ausdrückliche Kopieraktion schreibt die Komponente sie zusätzlich in die lokale System-Zwischenablage. Die Einrichtung erfolgt vollständig in dieser Komponente. Erst danach wird eine Startnachricht übergeben, die nur die kurzlebige Lernsession enthält. Zusätzlich gelten die Datenschutzbedingungen des Plattformanbieters. Ich bin mindestens 13 Jahre alt und erfülle höhere Altersanforderungen meines Landes; unter 18 habe ich die erforderliche Erlaubnis.",
    eligibilityFallback: "Ohne Bestätigung wird keine ID erzeugt und keine Lernsession gestartet.",
    currentMajorWarning: "SkillPilot Coach v2 ist verfügbar. Dieser Start bleibt bei v1.",
    stayCurrent: "Bei v1 bleiben und starten",
    upgradeTitle: "Neue Coach-Version erforderlich",
    upgradeBody: "Dieser v1-Start erstellt keine neue Lernsession mehr. Öffne SkillPilot Coach v2 als neuen, getrennten Start.",
    openSuccessor: "SkillPilot Coach v2 öffnen",
    start: "Lernen starten",
    issuing: "Sicherer Start wird vorbereitet …",
    launching: "Lernsession wird erstellt …",
    loadingSetup: "Einrichtung wird sicher geladen …",
    applyingSetup: "Auswahl wird gespeichert …",
    handingOff: "Startnachricht wird dem Host angeboten …",
    checkingHost: "Host-Funktionen werden geprüft …",
    unsupportedTitle: "Direkter Start nicht verfügbar",
    unsupportedBody:
      "Dieser Host kann die Lernsession nicht sicher an den Chat übergeben. Öffne SkillPilot im Browser.",
    errorTitle: "Start nicht abgeschlossen",
    capabilityErrorBody: "Der sichere Start konnte nicht vorbereitet werden. Gib deine SkillPilot-ID erneut ein oder öffne SkillPilot.",
    bootstrapErrorBody: "Die Antwort des Starts ist unklar. Wiederhole exakt denselben Startversuch; die gleiche Anforderungs-ID verhindert eine zweite Lernsession innerhalb dieses Versuchs.",
    terminalBootstrapErrorBody: "Dieser Startversuch wurde endgültig abgelehnt. Prüfe bei einer vorhandenen ID deine Eingabe und beginne ausdrücklich einen neuen Versuch.",
    setupReadErrorBody: "Die aktuelle Einrichtung konnte nicht sicher geladen werden. Du kannst sie in diesem Fenster erneut laden.",
    setupMutationOutcomeUnknownBody: "Es ist unklar, ob SkillPilot diese Auswahl bereits gespeichert hat. Wiederhole exakt dieselbe Auswahl; dieselbe Anforderungs-ID verhindert eine zweite Änderung.",
    setupRejectedBody: "Die Auswahl wurde abgelehnt oder ist nicht mehr aktuell. Lade den aktuellen Einrichtungsstand erneut.",
    messageRejectedBody: "Der Host hat die Startnachricht abgelehnt. Du kannst exakt dieselbe Nachricht erneut anbieten; dadurch wird keine zweite Lernsession erstellt.",
    messageOutcomeUnknownBody: "Es ist unklar, ob der Host die Startnachricht bereits aufgenommen hat. Erneutes Anbieten kann dieselbe Nachricht doppelt in den Chat einfügen, erstellt aber keine zweite Lernsession.",
    retryBootstrap: "Denselben Startversuch wiederholen",
    retrySetupRead: "Einrichtung erneut laden",
    retrySetupMutation: "Dieselbe Auswahl wiederholen",
    retryMessage: "Dieselbe Nachricht erneut anbieten",
    enterAgain: "SkillPilot-ID erneut eingeben",
    newStart: "Neuen Startversuch beginnen",
    completeTitle: "Startnachricht angenommen",
    completeBody: "Der Host hat die Nachrichtenanfrage angenommen. Dies bestätigt noch keine Antwort des Lerncoachs.",
    createdIdTitle: "SkillPilot-ID sicher speichern",
    createdIdBody: "Diese ID ist dein dauerhafter Zugang zu deinem Lernstand. Sie wird nur flüchtig in dieser von ChatGPT gehosteten Komponente angezeigt und nicht in Chat, Modellkontext, MCP-Toolargumente oder -resultate oder Host-State übernommen.",
    createdIdLabel: "Deine neue SkillPilot-ID",
    copyId: "ID kopieren",
    copiedId: "ID kopiert",
    savedIdConfirmation: "Ich habe meine SkillPilot-ID sicher gespeichert.",
    continueSetup: "Einrichtung fortsetzen",
    curriculumTitle: "Lernumgebung auswählen",
    curriculumBody: "Wähle eine der aktuell von SkillPilot angebotenen Lernumgebungen.",
    personalizationTitle: "Lernumgebung personalisieren",
    personalizationBody: "Beantworte den aktuellen Einrichtungsschritt. SkillPilot führt dich danach automatisch weiter.",
    selectedCount: "Ausgewählt",
    unavailableTitle: "SkillPilot-Start nicht verfügbar",
    unavailableBody: "Der sichere Direktstart ist derzeit nicht verfügbar.",
    expiredTitle: "Sicherer Start abgelaufen",
    expiredBody: "Die kurzzeitig gehaltenen Startdaten wurden entfernt. Öffne SkillPilot im Browser oder beginne später einen neuen Start.",
    openSkillPilot: "SkillPilot öffnen"
  },
  en: {
    eyebrow: "SkillPilot Coach v1",
    title: "Start a learning session",
    readyBody: "Create a new SkillPilot ID here or use an existing one. The complete setup stays in this window.",
    newIdentity: "Create a new SkillPilot ID",
    newIdentityBody: "SkillPilot creates the ID when you start. It is then shown once so you can save it securely.",
    existingIdentity: "Use an existing SkillPilot ID",
    existingIdentityBody: "Your existing ID is sent only directly to SkillPilot over HTTPS.",
    idLabel: "SkillPilot ID",
    idHint: "The ID is sent directly to SkillPilot over HTTPS only after you confirm.",
    invalidId: "Enter a valid SkillPilot ID.",
    language: "Learning-session language",
    german: "German",
    english: "English",
    eligibility:
      "I confirm the notice: ChatGPT hosts and runs this component. The SkillPilot ID is held only transiently in the component and sent directly to SkillPilot over HTTPS. It is never placed in chat, model context, MCP tool arguments or results, host state, web storage, URLs, logs, or analytics. Only when I explicitly choose Copy does the component also write it to the local system clipboard. Setup is completed entirely in this component. Only afterwards is a start message passed on, containing only the short-lived learning session. The platform provider's privacy terms also apply. I am at least 13 and meet any higher age requirement in my country; if I am under 18, I have the required permission.",
    eligibilityFallback: "Without confirmation, no ID is created and no learning session is started.",
    currentMajorWarning: "SkillPilot Coach v2 is available. This start remains on v1.",
    stayCurrent: "Stay on v1 and start",
    upgradeTitle: "New Coach version required",
    upgradeBody: "This v1 start no longer creates a new learning session. Open SkillPilot Coach v2 as a new, separate start.",
    openSuccessor: "Open SkillPilot Coach v2",
    start: "Start learning",
    issuing: "Preparing the secure start …",
    launching: "Creating the learning session …",
    loadingSetup: "Loading setup securely …",
    applyingSetup: "Saving selection …",
    handingOff: "Offering the start message to the host …",
    checkingHost: "Checking host capabilities …",
    unsupportedTitle: "Direct start unavailable",
    unsupportedBody:
      "This host cannot pass the learning session to the chat safely. Open SkillPilot in your browser.",
    errorTitle: "Start not completed",
    capabilityErrorBody: "The secure start could not be prepared. Enter your SkillPilot ID again or open SkillPilot.",
    bootstrapErrorBody: "The start response is uncertain. Retry the exact same start attempt; the same request ID prevents a second learning session within this attempt.",
    terminalBootstrapErrorBody: "This start attempt was definitively rejected. If you used an existing ID, check the entry and explicitly begin a new attempt.",
    setupReadErrorBody: "The current setup could not be loaded securely. You can load it again in this window.",
    setupMutationOutcomeUnknownBody: "It is unclear whether SkillPilot already saved this selection. Retry the exact same selection; the same request ID prevents a second change.",
    setupRejectedBody: "The selection was rejected or is no longer current. Load the current setup state again.",
    messageRejectedBody: "The host rejected the start message. You can offer the exact same message again; this does not create a second learning session.",
    messageOutcomeUnknownBody: "It is unclear whether the host already accepted the start message. Offering it again can add the same message to the chat twice, but it never creates a second learning session.",
    retryBootstrap: "Retry the same start attempt",
    retrySetupRead: "Load setup again",
    retrySetupMutation: "Retry the same selection",
    retryMessage: "Offer the same message again",
    enterAgain: "Enter the SkillPilot ID again",
    newStart: "Begin a new start attempt",
    completeTitle: "Start message accepted",
    completeBody: "The host accepted the message request. This does not yet confirm a response from the Learning Coach.",
    createdIdTitle: "Save your SkillPilot ID securely",
    createdIdBody: "This ID is your permanent access to your learning state. It is shown only transiently in this ChatGPT-hosted component and is not placed in chat, model context, MCP tool arguments or results, or host state.",
    createdIdLabel: "Your new SkillPilot ID",
    copyId: "Copy ID",
    copiedId: "ID copied",
    savedIdConfirmation: "I have saved my SkillPilot ID securely.",
    continueSetup: "Continue setup",
    curriculumTitle: "Choose a learning environment",
    curriculumBody: "Choose one of the learning environments currently offered by SkillPilot.",
    personalizationTitle: "Personalise the learning environment",
    personalizationBody: "Answer the current setup step. SkillPilot then guides you forward automatically.",
    selectedCount: "Selected",
    unavailableTitle: "SkillPilot start unavailable",
    unavailableBody: "The secure direct start is currently unavailable.",
    expiredTitle: "Secure start expired",
    expiredBody: "The briefly retained start data was removed. Open SkillPilot in your browser or begin a new start later.",
    openSkillPilot: "Open SkillPilot"
  }
};

const INITIAL_RESULT_TIMEOUT_MS = 10_000;
const ACTION_TIMEOUT_MS = 15_000;
const HOST_CAPABILITY_TIMEOUT_MS = 5_000;

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing SkillPilot start root");
const root: HTMLElement = rootElement;
const compatibilityWindow = window as OpenAiCompatibilityWindow;
const bridge = new SkillPilotStartBridge(applyToolResult);

let start: SkillPilotStartOpenResult | undefined;
let selectedLocale: SkillPilotStartLocale = "de";
let identityMode: SkillPilotIdentityMode = "CREATE";
let manualSkillPilotId = "";
let providerEligibilityConfirmed = false;
let hostSupport: SkillPilotStartHostSupport | undefined;
let pendingBootstrapRequest: SkillPilotBootstrapRequest | undefined;
let pendingBootstrapDispatched = false;
let pendingBootstrapRetryUntilMs: number | undefined;
let pendingStartMessage: PendingStartMessage | undefined;
let learningSessionId: string | undefined;
let createdSkillpilotId: string | undefined;
let createdIdSaveAcknowledged = false;
let createdIdCopied = false;
let setupState: SkillPilotSetupState | undefined;
let pendingSetupMutation: PendingSetupMutation | undefined;
let flowState: FlowState = "INITIALIZING";
let failureKind: FailureKind | undefined;
let busy = false;
let flowRevision = 0;
let hostSupportCheckRevision = 0;
let activeAbortController: AbortController | undefined;
let sensitiveRetentionTimer: number | undefined;
let compatibilityToolOutput: unknown = compatibilityWindow.openai?.toolOutput;
let compatibilityMetadata: unknown = compatibilityWindow.openai?.toolResponseMetadata;
let initialResultTimer: number | undefined = window.setTimeout(
  renderInitialUnavailable,
  INITIAL_RESULT_TIMEOUT_MS
);

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const globals = (event as OpenAiSetGlobalsEvent).detail?.globals;
    if (!globals) return;
    if (globals.toolOutput !== undefined) compatibilityToolOutput = globals.toolOutput;
    if (globals.toolResponseMetadata !== undefined) {
      compatibilityMetadata = globals.toolResponseMetadata;
    }
    acceptOpenResult(compatibilityToolOutput, compatibilityMetadata);
    void refreshHostSupport();
  },
  { passive: true }
);
window.addEventListener("pagehide", handlePageHide, { passive: true });
window.addEventListener("pageshow", () => {
  renderCurrent();
  void refreshHostSupport();
}, { passive: true });

renderLoading(COPY.en);
acceptOpenResult(compatibilityToolOutput, compatibilityMetadata);
void refreshHostSupport();

function applyToolResult(result: SkillPilotStartToolResult): void {
  // App-only issuer results are consumed by the matching call promise. A
  // duplicate notification must never be reinterpreted as the public open result.
  if (
    busy
    || pendingBootstrapRequest
    || pendingStartMessage
    || learningSessionId
    || flowState === "HOST_MESSAGE_ACCEPTED"
  ) {
    return;
  }
  acceptOpenResult(result);
}

function acceptOpenResult(value: unknown, metadataSource?: unknown): void {
  if (
    busy
    || pendingBootstrapRequest
    || pendingStartMessage
    || learningSessionId
    || flowState === "HOST_MESSAGE_ACCEPTED"
  ) {
    return;
  }
  const next = skillPilotStartOpenFromToolResult(value, metadataSource);
  if (!next) return;
  clearInitialResultTimer();
  clearSensitiveRuntime(false);
  start = next;
  selectedLocale = next.defaultLocale;
  identityMode = "CREATE";
  flowState = next.status === "ID_REQUIRED" ? "READY_FOR_ID" : "FAILED";
  failureKind = undefined;
  renderCurrent();
}

async function refreshHostSupport(): Promise<void> {
  const checkRevision = ++hostSupportCheckRevision;
  try {
    const support = await withTimeout(
      bridge.hostSupport(),
      HOST_CAPABILITY_TIMEOUT_MS
    );
    if (checkRevision !== hostSupportCheckRevision) return;
    hostSupport = support;
  } catch {
    if (checkRevision !== hostSupportCheckRevision) return;
    hostSupport = { serverTools: false, textMessages: false, openLinks: false };
  }
  renderCurrent();
}

function renderCurrent(): void {
  if (!start) return;
  document.documentElement.lang = selectedLocale;
  const copy = COPY[selectedLocale];

  if (start.status === "MAJOR_UPGRADE_REQUIRED") {
    renderUpgradeRequired(start, copy);
    return;
  }
  if (start.status !== "ID_REQUIRED") {
    renderUnavailableWithFallback(start, copy);
    return;
  }
  if (flowState === "HOST_MESSAGE_ACCEPTED") {
    renderComplete(start, copy);
    return;
  }
  if (flowState === "HANDOFF_EXPIRED" || failureKind === "EXPIRED") {
    renderFailure(start, copy, "EXPIRED");
    return;
  }
  if (busy) {
    renderBusy(copy);
    return;
  }
  if (hostSupport && (!hostSupport.serverTools || !hostSupport.textMessages)) {
    renderCapabilityFallback(start, copy);
    return;
  }
  if (failureKind) {
    renderFailure(start, copy, failureKind);
    return;
  }
  if (flowState === "AWAITING_CREATED_ID_SAVE" && createdSkillpilotId) {
    renderCreatedIdSave(copy);
    return;
  }
  if (flowState === "AWAITING_SETUP_SELECTION" && setupState?.requiredAction) {
    renderSetupSelection(copy, setupState);
    return;
  }
  renderReady(start, copy);
}

function renderReady(startState: SkillPilotStartOpenResult, copy: Copy): void {
  const article = shell(copy.title, copy.readyBody, copy);
  const actions = element("div", "actions");
  const warningWithSuccessor = startState.contractLine.newSessionPolicy === "WARN"
    && startState.contractLine.successor !== null;
  const startButton = button(
    warningWithSuccessor ? copy.stayCurrent : copy.start,
    "button button-primary"
  );
  const syncStartButton = () => {
    startButton.disabled = !providerEligibilityConfirmed
      || (identityMode === "EXISTING" && !canonicalSkillPilotId(manualSkillPilotId))
      || !hostSupport;
  };
  startButton.addEventListener("click", () => void beginFreshStart());
  actions.append(startButton);
  if (warningWithSuccessor) {
    actions.append(successorButton(startState, copy));
  }

  const identity = document.createElement("fieldset");
  identity.className = "identity-fieldset";
  const identityLegend = document.createElement("legend");
  identityLegend.textContent = copy.idLabel;
  identity.append(identityLegend);
  const identityChoices = element("div", "identity-options");
  for (const mode of ["CREATE", "EXISTING"] as const) {
    const label = element("label", "identity-option");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "skillpilot-start-identity";
    input.value = mode;
    input.checked = identityMode === mode;
    input.addEventListener("change", () => {
      if (!input.checked || busy || pendingBootstrapRequest || pendingStartMessage) return;
      identityMode = mode;
      if (mode === "CREATE") manualSkillPilotId = "";
      renderCurrent();
    });
    const text = element("span", "identity-option-text");
    const strong = element("strong", "identity-option-title");
    strong.textContent = mode === "CREATE" ? copy.newIdentity : copy.existingIdentity;
    const detail = element("span", "identity-option-body");
    detail.textContent = mode === "CREATE"
      ? copy.newIdentityBody
      : copy.existingIdentityBody;
    text.append(strong, detail);
    label.append(input, text);
    identityChoices.append(label);
  }
  identity.append(identityChoices);

  let idGroup: HTMLElement | undefined;
  if (identityMode === "EXISTING") {
    idGroup = element("div", "id-group");
    const idLabel = document.createElement("label");
    idLabel.className = "id-label";
    idLabel.htmlFor = "skillpilot-start-id";
    idLabel.textContent = copy.idLabel;
    const idInput = document.createElement("input");
    idInput.id = "skillpilot-start-id";
    idInput.className = "id-input";
    idInput.type = "text";
    idInput.value = manualSkillPilotId;
    idInput.maxLength = 100;
    idInput.autocomplete = "off";
    idInput.spellcheck = false;
    idInput.setAttribute("autocapitalize", "none");
    idInput.setAttribute("aria-describedby", "skillpilot-start-id-hint");
    const idHint = element("p", "hint");
    idHint.id = "skillpilot-start-id-hint";
    const syncIdValidation = () => {
      idHint.textContent = canonicalSkillPilotId(manualSkillPilotId)
        ? copy.idHint
        : manualSkillPilotId
          ? copy.invalidId
          : copy.idHint;
      syncStartButton();
    };
    idInput.addEventListener("input", () => {
      manualSkillPilotId = idInput.value;
      syncIdValidation();
    });
    syncIdValidation();
    idGroup.append(idLabel, idInput, idHint);
  }

  const language = document.createElement("fieldset");
  language.className = "language-fieldset";
  const legend = document.createElement("legend");
  legend.textContent = copy.language;
  language.append(legend);
  const choices = element("div", "language-options");
  for (const supportedLocale of startState.supportedLocales) {
    const label = element("label", "language-option");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "skillpilot-start-language";
    input.value = supportedLocale;
    input.checked = selectedLocale === supportedLocale;
    input.addEventListener("change", () => {
      if (!input.checked || busy || pendingBootstrapRequest || pendingStartMessage) return;
      selectedLocale = supportedLocale;
      renderCurrent();
    });
    label.append(
      input,
      document.createTextNode(supportedLocale === "de" ? COPY.de.german : COPY.en.english)
    );
    choices.append(label);
  }
  language.append(choices);

  const eligibility = element("label", "eligibility");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = providerEligibilityConfirmed;
  checkbox.addEventListener("change", () => {
    providerEligibilityConfirmed = checkbox.checked;
    syncStartButton();
  });
  const eligibilityText = element("span", "eligibility-text");
  eligibilityText.textContent = copy.eligibility;
  eligibility.append(checkbox, eligibilityText);
  const eligibilityFallback = element("p", "hint");
  eligibilityFallback.textContent = copy.eligibilityFallback;
  syncStartButton();

  article.append(identity);
  if (idGroup) article.append(idGroup);
  article.append(language, eligibility, eligibilityFallback);
  if (startState.contractLine.newSessionPolicy === "WARN") {
    const warning = element("p", "hint status-warning-copy");
    warning.textContent = copy.currentMajorWarning;
    article.append(warning);
  }
  if (!hostSupport) {
    const checking = element("p", "hint");
    checking.setAttribute("role", "status");
    checking.textContent = copy.checkingHost;
    article.append(checking);
  }
  article.append(actions);
  root.replaceChildren(article);
}

function renderCreatedIdSave(copy: Copy): void {
  const id = createdSkillpilotId;
  if (!id) return;
  const article = shell(copy.createdIdTitle, copy.createdIdBody, copy, "status-warning");
  const group = element("div", "created-id-group");
  const label = element("p", "id-label");
  label.textContent = copy.createdIdLabel;
  const value = element("code", "created-id-value");
  value.textContent = id;
  const copyButton = button(
    createdIdCopied ? copy.copiedId : copy.copyId,
    "button"
  );
  copyButton.addEventListener("click", () => void copyCreatedId(id));
  group.append(label, value, copyButton);

  const confirmation = element("label", "eligibility");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = createdIdSaveAcknowledged;
  const confirmationText = element("span", "eligibility-text");
  confirmationText.textContent = copy.savedIdConfirmation;
  confirmation.append(checkbox, confirmationText);

  const actions = element("div", "actions");
  const continueButton = button(copy.continueSetup, "button button-primary");
  continueButton.disabled = !createdIdSaveAcknowledged;
  checkbox.addEventListener("change", () => {
    createdIdSaveAcknowledged = checkbox.checked;
    continueButton.disabled = !createdIdSaveAcknowledged;
  });
  continueButton.addEventListener("click", () => void continueAfterCreatedIdSave());
  actions.append(continueButton);
  article.append(group, confirmation, actions);
  root.replaceChildren(article);
}

async function copyCreatedId(expectedId: string): Promise<void> {
  if (createdSkillpilotId !== expectedId || flowState !== "AWAITING_CREATED_ID_SAVE") {
    return;
  }
  try {
    if (typeof navigator.clipboard?.writeText !== "function") return;
    await navigator.clipboard.writeText(expectedId);
    if (createdSkillpilotId !== expectedId) return;
    createdIdCopied = true;
    renderCurrent();
  } catch {
    // The ID remains selectable in the local DOM when clipboard access is denied.
  }
}

function renderSetupSelection(copy: Copy, state: SkillPilotSetupState): void {
  const curriculum = state.requiredAction === "setCurriculum";
  const article = shell(
    curriculum ? copy.curriculumTitle : copy.personalizationTitle,
    curriculum ? copy.curriculumBody : copy.personalizationBody,
    copy
  );
  if (state.decision) {
    const decision = element("section", "setup-decision");
    const stage = element("p", "setup-stage");
    stage.textContent = state.decision.stageLabel;
    const group = element("h2", "setup-group");
    group.textContent = state.decision.groupLabel;
    const count = element("p", "hint");
    count.textContent = `${copy.selectedCount}: ${state.decision.selectedCount}/${state.decision.maxSelections}`;
    decision.append(stage, group, count);
    article.append(decision);
  }
  const options = element("div", "setup-options");
  for (const option of state.options) {
    const optionButton = button(option.label, "setup-option");
    if (option.description) {
      const description = element("span", "setup-option-description");
      description.textContent = option.description;
      optionButton.append(description);
    }
    optionButton.addEventListener("click", () => void applySetupOption(option.id));
    options.append(optionButton);
  }
  article.append(options);
  root.replaceChildren(article);
}

function renderBusy(copy: Copy): void {
  const text = flowState === "ISSUING_CAPABILITY"
    ? copy.issuing
    : flowState === "VALIDATING_AND_LAUNCHING"
      ? copy.launching
      : flowState === "LOADING_SETUP"
        ? copy.loadingSetup
        : flowState === "APPLYING_SETUP"
          ? copy.applyingSetup
          : copy.handingOff;
  renderStatus(copy.title, text, "status-panel");
}

function renderUnavailableWithFallback(
  startState: SkillPilotStartOpenResult,
  copy: Copy
): void {
  const article = shell(copy.unavailableTitle, copy.unavailableBody, copy, "status-warning");
  const actions = element("div", "actions");
  actions.append(fallbackButton(startState, copy, true));
  article.append(actions);
  root.replaceChildren(article);
}

function renderUpgradeRequired(
  startState: SkillPilotStartOpenResult,
  copy: Copy
): void {
  const article = shell(copy.upgradeTitle, copy.upgradeBody, copy, "status-warning");
  const actions = element("div", "actions");
  actions.append(successorButton(startState, copy, true));
  article.append(actions);
  root.replaceChildren(article);
}

function renderCapabilityFallback(
  startState: SkillPilotStartOpenResult,
  copy: Copy
): void {
  const article = shell(copy.unsupportedTitle, copy.unsupportedBody, copy, "status-warning");
  const actions = element("div", "actions");
  actions.append(fallbackButton(startState, copy, true));
  article.append(actions);
  root.replaceChildren(article);
}

function renderComplete(
  startState: SkillPilotStartOpenResult,
  copy: Copy
): void {
  const article = shell(copy.completeTitle, copy.completeBody, copy, "status-success");
  article.setAttribute("role", "status");
  const actions = element("div", "actions");
  const newStart = button(copy.newStart, "button button-primary");
  newStart.addEventListener("click", resetForFreshInput);
  actions.append(newStart);
  article.append(actions);
  root.replaceChildren(article);
}

function renderFailure(
  startState: SkillPilotStartOpenResult,
  copy: Copy,
  kind: FailureKind
): void {
  const title = kind === "EXPIRED" ? copy.expiredTitle : copy.errorTitle;
  const body = kind === "CAPABILITY"
    ? copy.capabilityErrorBody
    : kind === "BOOTSTRAP"
      ? copy.bootstrapErrorBody
      : kind === "TERMINAL_BOOTSTRAP"
        ? copy.terminalBootstrapErrorBody
        : kind === "SETUP_READ"
          ? copy.setupReadErrorBody
          : kind === "SETUP_MUTATION_OUTCOME_UNKNOWN"
            ? copy.setupMutationOutcomeUnknownBody
            : kind === "SETUP_REJECTED"
              ? copy.setupRejectedBody
      : kind === "MESSAGE_REJECTED"
        ? copy.messageRejectedBody
        : kind === "MESSAGE_OUTCOME_UNKNOWN"
          ? copy.messageOutcomeUnknownBody
          : copy.expiredBody;
  const article = shell(title, body, copy, "status-error");
  article.setAttribute("role", "alert");
  const actions = element("div", "actions");
  if (kind === "BOOTSTRAP" && pendingBootstrapRequest) {
    const retry = button(copy.retryBootstrap, "button button-primary");
    retry.addEventListener("click", () => void retryPendingBootstrap());
    actions.append(retry);
  } else if (kind === "SETUP_READ" && learningSessionId) {
    const retry = button(copy.retrySetupRead, "button button-primary");
    retry.addEventListener("click", () => void retrySetupRead());
    actions.append(retry);
  } else if (kind === "SETUP_MUTATION_OUTCOME_UNKNOWN" && pendingSetupMutation) {
    const retry = button(copy.retrySetupMutation, "button button-primary");
    retry.addEventListener("click", () => void retryPendingSetupMutation());
    actions.append(retry);
  } else if (kind === "SETUP_REJECTED" && learningSessionId) {
    const retry = button(copy.retrySetupRead, "button button-primary");
    retry.addEventListener("click", () => void retrySetupRead());
    actions.append(retry);
  } else if (
    (kind === "MESSAGE_REJECTED" || kind === "MESSAGE_OUTCOME_UNKNOWN")
    && pendingStartMessage
  ) {
    const retry = button(copy.retryMessage, "button button-primary");
    retry.addEventListener("click", () => void retryPendingMessage());
    actions.append(retry);
  } else if (kind === "CAPABILITY" || kind === "TERMINAL_BOOTSTRAP") {
    const retry = button(copy.newStart, "button button-primary");
    retry.addEventListener("click", resetForFreshInput);
    actions.append(retry);
  } else if (kind === "EXPIRED") {
    const retry = button(copy.newStart, "button button-primary");
    retry.addEventListener("click", resetForFreshInput);
    actions.append(retry);
  }
  if (
    kind === "CAPABILITY"
    || kind === "TERMINAL_BOOTSTRAP"
    || kind === "EXPIRED"
  ) {
    actions.append(fallbackButton(startState, copy, actions.children.length === 0));
  }
  article.append(actions);
  root.replaceChildren(article);
}

async function beginFreshStart(): Promise<void> {
  const current = start;
  const submittedIdentityMode = identityMode;
  let submittedId = submittedIdentityMode === "EXISTING"
    ? canonicalSkillPilotId(manualSkillPilotId)
    : undefined;
  const capabilityArguments = current
    ? createSkillPilotCapabilityArguments(current, providerEligibilityConfirmed)
    : undefined;
  if (
    !current
    || (submittedIdentityMode === "EXISTING" && !submittedId)
    || !capabilityArguments
    || busy
  ) return;

  const revision = flowRevision;
  bridge.beginAttempt();
  manualSkillPilotId = "";
  providerEligibilityConfirmed = false;
  failureKind = undefined;
  busy = true;
  flowState = "ISSUING_CAPABILITY";
  renderCurrent();

  try {
    const support = await withTimeout(bridge.hostSupport(), ACTION_TIMEOUT_MS);
    if (revision !== flowRevision) return;
    hostSupport = support;
    if (!support.serverTools || !support.textMessages) {
      throw new Error("unsupported-host");
    }
    const issuedResult = await withTimeout(
      bridge.issueCapability(capabilityArguments),
      ACTION_TIMEOUT_MS
    );
    if (revision !== flowRevision) return;
    if (issuedResult.isError === true) throw new Error("capability-rejected");
    const capability = skillPilotCapabilityFromToolResult(issuedResult);
    const expectedSourceMajorDecision = capabilityArguments.sourceMajorDecision
      ?? "ALLOW_CURRENT_MAJOR";
    if (
      capability?.sourceMajorDecision !== expectedSourceMajorDecision
      || capability.policyRevision !== current.contractLine.policyRevision
    ) {
      throw new Error("capability-decision-mismatch");
    }
    const clientRequestId = newClientRequestId();
    const request = capability && clientRequestId
      ? createSkillPilotBootstrapRequest(
        capability,
        submittedIdentityMode,
        submittedIdentityMode === "EXISTING" ? submittedId : undefined,
        selectedLocale,
        clientRequestId
      )
      : undefined;
    if (!request) throw new Error("invalid-capability-result");

    pendingBootstrapRequest = request;
    submittedId = undefined;
    pendingBootstrapDispatched = false;
    pendingBootstrapRetryUntilMs = undefined;
    await performPendingBootstrap(revision);
  } catch {
    if (revision !== flowRevision) return;
    if (!pendingBootstrapRequest && !pendingStartMessage) {
      failureKind = "CAPABILITY";
      flowState = "FAILED";
    } else if (pendingBootstrapRequest) {
      failureKind = "BOOTSTRAP";
      flowState = "FAILED";
    } else if (!failureKind) {
      failureKind = "MESSAGE_OUTCOME_UNKNOWN";
      flowState = "HOST_MESSAGE_OUTCOME_UNKNOWN";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function retryPendingBootstrap(): Promise<void> {
  if (!pendingBootstrapRequest || busy) return;
  const revision = flowRevision;
  busy = true;
  failureKind = undefined;
  try {
    await performPendingBootstrap(revision);
  } catch {
    if (revision === flowRevision) {
      if (!failureKind) {
        failureKind = pendingStartMessage
          ? "MESSAGE_OUTCOME_UNKNOWN"
          : "BOOTSTRAP";
      }
      flowState = failureKind === "MESSAGE_OUTCOME_UNKNOWN"
        ? "HOST_MESSAGE_OUTCOME_UNKNOWN"
        : "FAILED";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function performPendingBootstrap(revision: number): Promise<void> {
  const request = pendingBootstrapRequest;
  if (!request) throw new Error("missing-pending-bootstrap");
  const now = Date.now();
  if (!pendingBootstrapDispatched && request.capabilityExpiresAtMs <= now) {
    expireSensitiveRuntime();
    return;
  }
  if (
    pendingBootstrapDispatched
    && (pendingBootstrapRetryUntilMs === undefined || pendingBootstrapRetryUntilMs <= now)
  ) {
    expireSensitiveRuntime();
    return;
  }
  if (!pendingBootstrapDispatched) {
    pendingBootstrapDispatched = true;
    pendingBootstrapRetryUntilMs = now + HANDOFF_RETENTION_MS;
    scheduleSensitiveCleanup(HANDOFF_RETENTION_MS);
  }
  flowState = "VALIDATING_AND_LAUNCHING";
  renderCurrent();
  activeAbortController = new AbortController();
  let result;
  try {
    result = await withTimeout(
      sendSkillPilotBootstrap(request, activeAbortController.signal),
      ACTION_TIMEOUT_MS,
      () => activeAbortController?.abort()
    );
  } catch (error) {
    if (error instanceof SkillPilotBootstrapHttpError && !error.retryable) {
      pendingBootstrapRequest = undefined;
      pendingBootstrapDispatched = false;
      pendingBootstrapRetryUntilMs = undefined;
      clearSensitiveRetentionTimer();
      failureKind = "TERMINAL_BOOTSTRAP";
      flowState = "FAILED";
      return;
    }
    throw error;
  } finally {
    activeAbortController = undefined;
  }
  if (revision !== flowRevision) return;

  // Drop the ID and capability as soon as the exact server response is known.
  const handoffExpiresAtMs = pendingBootstrapRetryUntilMs ?? Date.now();
  const sessionId = learningSessionIdFromStartMessage(
    result.startMessage,
    result.communicationLocale
  );
  if (!sessionId) throw new Error("invalid-learning-session-handoff");
  pendingBootstrapRequest = undefined;
  pendingBootstrapDispatched = false;
  pendingBootstrapRetryUntilMs = undefined;
  pendingStartMessage = {
    text: result.startMessage,
    expiresAtMs: Math.min(Date.parse(result.expiresAt), handoffExpiresAtMs)
  };
  learningSessionId = sessionId;
  createdSkillpilotId = result.createdSkillpilotId;
  createdIdSaveAcknowledged = false;
  createdIdCopied = false;
  setupState = undefined;
  pendingSetupMutation = undefined;
  scheduleSensitiveCleanup(
    Math.max(0, pendingStartMessage.expiresAtMs - Date.now())
  );
  if (createdSkillpilotId) {
    flowState = "AWAITING_CREATED_ID_SAVE";
    renderCurrent();
    return;
  }
  await loadSetupContext(revision);
}

async function continueAfterCreatedIdSave(): Promise<void> {
  if (
    !createdSkillpilotId
    || !createdIdSaveAcknowledged
    || !learningSessionId
    || busy
  ) return;
  const revision = flowRevision;
  // Saving is explicit. Drop the permanent ID before any MCP tool call and
  // replace the local DOM with the loading state immediately.
  createdSkillpilotId = undefined;
  createdIdSaveAcknowledged = false;
  createdIdCopied = false;
  busy = true;
  failureKind = undefined;
  try {
    await loadSetupContext(revision);
  } catch {
    if (revision === flowRevision && !failureKind) {
      failureKind = "SETUP_READ";
      flowState = "FAILED";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function retrySetupRead(): Promise<void> {
  if (!learningSessionId || busy) return;
  const revision = flowRevision;
  busy = true;
  failureKind = undefined;
  try {
    await loadSetupContext(revision);
  } catch {
    if (revision === flowRevision && !failureKind) {
      failureKind = "SETUP_READ";
      flowState = "FAILED";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function loadSetupContext(revision: number): Promise<void> {
  const call = createSkillPilotGetContextCall(learningSessionId);
  if (!call) throw new Error("missing-learning-session");
  flowState = "LOADING_SETUP";
  renderCurrent();
  let result: SkillPilotStartToolResult;
  try {
    result = await withTimeout(bridge.callSetupTool(call), ACTION_TIMEOUT_MS);
  } catch {
    if (revision === flowRevision) {
      failureKind = "SETUP_READ";
      flowState = "FAILED";
    }
    throw new Error("setup-read-failed");
  }
  if (revision !== flowRevision) return;
  const next = skillPilotSetupStateFromToolResult(result, selectedLocale);
  if (!next) {
    failureKind = "SETUP_READ";
    flowState = "FAILED";
    throw new Error("invalid-setup-context");
  }
  await adoptSetupState(next, revision);
}

async function adoptSetupState(
  next: SkillPilotSetupState,
  revision: number
): Promise<void> {
  setupState = next;
  failureKind = undefined;
  if (next.requiredAction) {
    flowState = "AWAITING_SETUP_SELECTION";
    renderCurrent();
    return;
  }
  await deliverPendingMessage(revision);
}

async function applySetupOption(optionId: string): Promise<void> {
  const current = setupState;
  const sessionId = learningSessionId;
  if (!current?.requiredAction || !sessionId || busy || pendingSetupMutation) return;
  if (!current.options.some((option) => option.id === optionId)) return;
  const clientRequestId = newClientRequestId();
  const call = createSkillPilotSetupMutationCall(
    current.requiredAction,
    sessionId,
    current.stateVersion,
    optionId,
    clientRequestId
  );
  if (!call) return;
  const revision = flowRevision;
  pendingSetupMutation = { call };
  busy = true;
  failureKind = undefined;
  try {
    await performPendingSetupMutation(revision);
  } catch {
    if (revision === flowRevision && !failureKind) {
      failureKind = "SETUP_MUTATION_OUTCOME_UNKNOWN";
      flowState = "FAILED";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function retryPendingSetupMutation(): Promise<void> {
  if (!pendingSetupMutation || busy) return;
  const revision = flowRevision;
  busy = true;
  failureKind = undefined;
  try {
    await performPendingSetupMutation(revision);
  } catch {
    if (revision === flowRevision && !failureKind) {
      failureKind = "SETUP_MUTATION_OUTCOME_UNKNOWN";
      flowState = "FAILED";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function performPendingSetupMutation(revision: number): Promise<void> {
  const pending = pendingSetupMutation;
  if (!pending) throw new Error("missing-setup-mutation");
  flowState = "APPLYING_SETUP";
  renderCurrent();
  let result: SkillPilotStartToolResult;
  try {
    result = await withTimeout(
      bridge.callSetupTool(pending.call),
      ACTION_TIMEOUT_MS
    );
  } catch {
    if (revision === flowRevision) {
      failureKind = "SETUP_MUTATION_OUTCOME_UNKNOWN";
      flowState = "FAILED";
    }
    throw new Error("setup-mutation-outcome-unknown");
  }
  if (revision !== flowRevision) return;
  pendingSetupMutation = undefined;
  const next = skillPilotSetupStateFromToolResult(result, selectedLocale);
  const expectedStateVersion = pending.call.arguments.expectedStateVersion;
  if (
    !next
    || typeof expectedStateVersion !== "number"
    || !Number.isSafeInteger(expectedStateVersion)
    || next.stateVersion <= expectedStateVersion
  ) {
    failureKind = "SETUP_REJECTED";
    flowState = "FAILED";
    throw new Error("setup-mutation-rejected");
  }
  await adoptSetupState(next, revision);
}

async function retryPendingMessage(): Promise<void> {
  if (!pendingStartMessage || busy) return;
  const revision = flowRevision;
  busy = true;
  failureKind = undefined;
  try {
    await deliverPendingMessage(revision);
  } catch {
    if (revision === flowRevision && !failureKind) {
      failureKind = "MESSAGE_OUTCOME_UNKNOWN";
      flowState = "HOST_MESSAGE_OUTCOME_UNKNOWN";
    }
  } finally {
    if (revision === flowRevision) {
      busy = false;
      renderCurrent();
    }
  }
}

async function deliverPendingMessage(revision: number): Promise<void> {
  const pending = pendingStartMessage;
  if (!pending || pending.expiresAtMs <= Date.now()) {
    expireSensitiveRuntime();
    return;
  }
  flowState = "SESSION_CREATED_PENDING_HOST_ACCEPTANCE";
  renderCurrent();
  let delivery;
  try {
    delivery = await withTimeout(
      bridge.sendStartMessage(pending.text),
      ACTION_TIMEOUT_MS
    );
  } catch {
    if (revision === flowRevision && pendingStartMessage) {
      failureKind = "MESSAGE_OUTCOME_UNKNOWN";
      flowState = "HOST_MESSAGE_OUTCOME_UNKNOWN";
    }
    throw new Error("host-message-outcome-unknown");
  }
  if (revision !== flowRevision) return;
  if (!delivery.supported || !delivery.hostAccepted) {
    failureKind = "MESSAGE_REJECTED";
    flowState = "FAILED";
    throw new Error("host-message-not-accepted");
  }

  pendingStartMessage = undefined;
  learningSessionId = undefined;
  createdSkillpilotId = undefined;
  createdIdSaveAcknowledged = false;
  createdIdCopied = false;
  setupState = undefined;
  pendingSetupMutation = undefined;
  clearSensitiveRetentionTimer();
  failureKind = undefined;
  flowState = "HOST_MESSAGE_ACCEPTED";
}

function resetForFreshInput(): void {
  clearSensitiveRuntime(false);
  identityMode = "CREATE";
  flowState = "READY_FOR_ID";
  failureKind = undefined;
  renderCurrent();
}

function fallbackButton(
  startState: SkillPilotStartOpenResult,
  copy: Copy,
  primary = false
): HTMLButtonElement {
  const fallback = button(
    copy.openSkillPilot,
    primary ? "button button-primary" : "button"
  );
  fallback.addEventListener("click", () => void openFallback(startState.fallbackUrl));
  return fallback;
}

function successorButton(
  startState: SkillPilotStartOpenResult,
  copy: Copy,
  primary = false
): HTMLButtonElement {
  const successor = button(
    copy.openSuccessor,
    primary ? "button button-primary" : "button"
  );
  successor.addEventListener("click", () => void openSuccessor(startState));
  return successor;
}

async function openSuccessor(startState: SkillPilotStartOpenResult): Promise<void> {
  const url = startState.contractLine.successor?.handoffUrl;
  if (!url) return;
  clearSensitiveRuntime(false);
  try {
    if (await withTimeout(bridge.openLink(url), 5_000)) return;
  } catch {
    // Fall through to the same parser-allowlisted successor URL.
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function openFallback(url: string): Promise<void> {
  if (!isExactSkillPilotFallbackUrl(url)) return;
  clearSensitiveRuntime(false);
  try {
    if (await withTimeout(bridge.openLink(url), 5_000)) return;
  } catch {
    // Fall through to the same already allowlisted first-party URL.
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function scheduleSensitiveCleanup(delayMs: number): void {
  clearSensitiveRetentionTimer();
  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    expireSensitiveRuntime();
    return;
  }
  sensitiveRetentionTimer = window.setTimeout(
    expireSensitiveRuntime,
    Math.min(delayMs, HANDOFF_RETENTION_MS)
  );
}

function expireSensitiveRuntime(): void {
  clearSensitiveRuntime(false);
  flowState = "HANDOFF_EXPIRED";
  failureKind = "EXPIRED";
  busy = false;
  renderCurrent();
}

function handlePageHide(): void {
  const hadSensitiveRuntime = Boolean(
    manualSkillPilotId
    || pendingBootstrapRequest
    || pendingStartMessage
    || learningSessionId
    || createdSkillpilotId
    || pendingSetupMutation
  );
  clearSensitiveRuntime(false);
  busy = false;
  if (hadSensitiveRuntime && flowState !== "HOST_MESSAGE_ACCEPTED") {
    flowState = "HANDOFF_EXPIRED";
    failureKind = "EXPIRED";
  }
}

function clearSensitiveRuntime(renderAfterClear: boolean): void {
  flowRevision += 1;
  activeAbortController?.abort();
  activeAbortController = undefined;
  pendingBootstrapRequest = undefined;
  pendingBootstrapDispatched = false;
  pendingBootstrapRetryUntilMs = undefined;
  pendingStartMessage = undefined;
  learningSessionId = undefined;
  createdSkillpilotId = undefined;
  createdIdSaveAcknowledged = false;
  createdIdCopied = false;
  setupState = undefined;
  pendingSetupMutation = undefined;
  manualSkillPilotId = "";
  providerEligibilityConfirmed = false;
  clearSensitiveRetentionTimer();
  if (renderAfterClear) renderCurrent();
}

function clearSensitiveRetentionTimer(): void {
  if (sensitiveRetentionTimer === undefined) return;
  window.clearTimeout(sensitiveRetentionTimer);
  sensitiveRetentionTimer = undefined;
}

function shell(
  title: string,
  body: string,
  copy: Copy,
  extraClass = ""
): HTMLElement {
  const article = element("article", `start-shell ${extraClass}`.trim());
  const header = element("header", "start-header");
  const eyebrow = element("p", "eyebrow");
  eyebrow.textContent = copy.eyebrow;
  const heading = document.createElement("h1");
  heading.textContent = title;
  const paragraph = element("p", "body-copy");
  paragraph.textContent = body;
  header.append(eyebrow, heading, paragraph);
  article.append(header);
  return article;
}

function renderLoading(copy: Copy): void {
  const status = element("section", "start-shell status-panel");
  status.setAttribute("role", "status");
  const text = element("p", "body-copy");
  text.textContent = copy.checkingHost;
  status.append(text);
  root.replaceChildren(status);
}

function renderInitialUnavailable(): void {
  initialResultTimer = undefined;
  const copy = COPY.en;
  renderStatus(copy.unavailableTitle, copy.unavailableBody, "status-error");
}

function renderStatus(title: string, body: string, className: string): void {
  const article = shell(title, body, COPY[selectedLocale], className);
  article.setAttribute("role", className === "status-error" ? "alert" : "status");
  root.replaceChildren(article);
}

function clearInitialResultTimer(): void {
  if (initialResultTimer === undefined) return;
  window.clearTimeout(initialResultTimer);
  initialResultTimer = undefined;
}

function newClientRequestId(): string | undefined {
  try {
    const value = crypto.randomUUID();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

function button(text: string, className: string): HTMLButtonElement {
  const result = document.createElement("button");
  result.type = "button";
  result.className = className;
  result.textContent = text;
  return result;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string
): HTMLElementTagNameMap[K] {
  const result = document.createElement(tagName);
  result.className = className;
  return result;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      onTimeout?.();
      reject(new Error("timeout"));
    }, timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}
