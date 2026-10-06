export const GEMINI_SKILL_DOWNLOAD_URL = '/plugins/gemini/skillpilot-coach-v1-0.1.0.zip'
export const GEMINI_CUSTOM_APP_HELP_URL = 'https://support.google.com/gemini/answer/17209137?hl=en-12'
export const GEMINI_SKILL_HELP_URL = 'https://support.google.com/gemini/answer/17094296?hl=en'

const de = {
  title: 'Gemini (Beta)',
  hint: 'Lerne mit deinem SkillPilot-Lernprofil in Gemini. Für diese Betaversion brauchst du eine freigeschaltete SkillPilot-Verbindung sowie Custom Apps und Skills in Gemini.',
  setupTitle: 'Einmalig: Custom App und Coach-Skill einrichten',
  access: 'Google schaltet Custom Apps und Skills schrittweise frei. Custom Apps benötigen derzeit ein persönliches Google-Konto ab 18 Jahren, US-Zugang, Englisch und aktivierte „Keep Activity“. Prüfe, ob dein Konto beide Funktionen anbietet.',
  appSetup: 'Verbinde die Custom App mit dem Namen „SkillPilot“ über den freigegebenen MCP-Zugang des Betatests. Nutze die Serveradresse und Verbindungsdaten für deinen freigegebenen Betatest.',
  download: 'Gemini Coach-Skill herunterladen',
  skillSetup: 'Importiere die ZIP-Datei in Gemini unter Settings → Skills. Wähle in einem neuen Chat über „/“ den Skill „skillpilot-coach-v1“ und über „@“ die Custom App „SkillPilot“. Beide müssen aktiv sein.',
  appHelp: 'Google: Custom Apps',
  skillHelp: 'Google: Skills importieren',
  ready: 'Meine Custom App „SkillPilot“ ist verbunden und der Coach-Skill ist importiert.',
  prepare: 'Lernen mit Gemini vorbereiten',
  preparing: 'Lernsession wird vorbereitet …',
  failed: 'Die Lernsession konnte nicht vorbereitet werden. Prüfe deinen SkillPilot-Zugang und versuche es erneut.',
  promptLabel: 'Persönliche Startnachricht',
  copy: 'Startnachricht kopieren',
  copied: 'Startnachricht kopiert',
  open: 'Gemini öffnen',
  paste: 'Öffne Gemini, aktiviere den Coach-Skill mit „/“ und „SkillPilot“ mit „@“. Füge anschließend die vollständige Startnachricht ein und sende sie. Die Nachricht enthält deinen privaten Sitzungsschlüssel; teile sie nicht. Bereite nach spätestens 23 Stunden eine neue Lernsession vor.',
  continuation: 'Für einen neuen Chat aktiviere Skill und App erneut und sende dieselbe Startnachricht, solange sie gültig ist. Nach Ablauf bereite hier eine neue Lernsession vor. Dein gespeicherter Lernfortschritt bleibt erhalten.',
}

const en: typeof de = {
  title: 'Gemini (Beta)',
  hint: 'Learn with your SkillPilot learning profile in Gemini. This beta requires approved SkillPilot access and custom apps and Skills in Gemini.',
  setupTitle: 'One-time setup: custom app and coaching Skill',
  access: 'Google is gradually rolling out custom apps and Skills. Custom apps currently require a personal Google account, age 18 or over, US access, English, and Keep Activity enabled. Check that your account offers both features.',
  appSetup: 'Connect the custom app named “SkillPilot” using the approved MCP access for the beta test. Use the server address and connection details for your approved beta test.',
  download: 'Download the Gemini coaching Skill',
  skillSetup: 'Import the ZIP in Gemini under Settings → Skills. In a new chat, use “/” to select “skillpilot-coach-v1” and “@” to select the custom app “SkillPilot”. Both must be active.',
  appHelp: 'Google: custom apps',
  skillHelp: 'Google: importing Skills',
  ready: 'My “SkillPilot” custom app is connected and the coaching Skill is imported.',
  prepare: 'Prepare learning with Gemini',
  preparing: 'Preparing your learning session …',
  failed: 'Your learning session could not be prepared. Check your SkillPilot access and try again.',
  promptLabel: 'Personal start message',
  copy: 'Copy start message',
  copied: 'Start message copied',
  open: 'Open Gemini',
  paste: 'Open Gemini, activate the coaching Skill with “/” and “SkillPilot” with “@”. Then paste and send the complete start message. It contains your private session key; do not share it. Prepare a new learning session after at most 23 hours.',
  continuation: 'In a new chat, activate the Skill and app again and send the same start message while it remains valid. After expiry, prepare a new learning session here. Your saved learning progress is retained.',
}

export const getGeminiV1Copy = (language: string) => language.startsWith('en') ? en : de
