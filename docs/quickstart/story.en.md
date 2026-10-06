# SkillPilot: Start Learning in 5 Steps

**Updated:** October 6, 2026

Your learning. Your pace. Choose your curriculum, get support while practising, and discover your achievements in the Cockpit.

Choose **Claude**, **ChatGPT Desktop (Beta)** or, with a separately configured test connection, **Gemini (Beta)** as your learning coach. The ChatGPT learning start through the Git marketplace works on Windows. Claude uses **Claude Pro** and can also be used in the Claude app after setup. Gemini currently has a controlled web test with one privately configured test account; general access for multiple accounts has not yet been checked. The [access overview](https://skillpilot.com/faq/coach-setup) explains the requirements and age limits for your chosen provider.

This quickstart explains the basics in about five minutes. The September 13 video and older screenshots show the Claude route; the video's statement about ChatGPT availability is outdated. This current guide describes the Gemini route. Take as much time as you need for the initial setup.

## 1. Set up your learning coach once

### Claude

You need a **Claude Pro account first**. Sign in to **Claude Web** with that account. If the current SkillPilot plugin is already installed from the marketplace and connected, go straight to step 2.

1. Open **Settings → Plugins → Add → Add marketplace → Add from a repository**.
2. Enter `enpasos/skillpilot-claude-marketplace`. This is the [public SkillPilot marketplace](https://github.com/enpasos/skillpilot-claude-marketplace). Keep **Sync automatically** switched on and select **Sync**.
3. Find **SkillPilot Coach v1** from that marketplace and add the plugin. Under **Your plugins**, it should be installed exactly once and enabled. Compare the version with the [current SkillPilot installation guide](https://skillpilot.com/plugins).
4. Inside the plugin, open **Connectors → skillpilot** and select **Connect**. Follow any prompts shown, then check that the status says **Connected**.

The marketplace connection is also your route for future updates. Automatic updates have been observed during the beta; timing can vary. For an existing installation, follow the **Update** section of the current guide. Once the plugin and connector are ready, open SkillPilot for the following steps.

### ChatGPT Desktop (Beta)

1. In ChatGPT Desktop, open **Plugins → Add → Add marketplace**.
2. Add the address of the [SkillPilot ChatGPT marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace).
3. Install **SkillPilot Coach v1** from this marketplace. Check that at least **1.1.1** is installed and the plugin is enabled.
4. Open the SkillPilot connection in the plugin and complete sign-in.

For later fixes, refresh the marketplace and check the version actually installed. The [ChatGPT guide](https://skillpilot.com/plugins#chatgpt-desktop) also explains switching from an archive installation. This learning start uses ChatGPT Desktop; browser, mobile ChatGPT app and voice mode have not been confirmed.

### Gemini (Beta): controlled web test

You need a **personal Google account, age 18 or over**, **US access**, an **English Gemini interface** and **Keep Activity enabled**. Custom apps and Skills are rolling out gradually; check that your account offers both features. The English interface does not determine the coach's language: SkillPilot sets German or English for this integration when you start learning. See [Google: custom apps](https://support.google.com/gemini/answer/17209137?hl=en-12) and [Google: Skills](https://support.google.com/gemini/answer/17094296?hl=en).

1. Connect the custom app **SkillPilot** using the server address and private connection details configured for your own test account. A shared public connection is currently unavailable; production activation requires separate setup and verification.
2. Download the **Gemini coaching Skill** from the [Gemini guide](https://skillpilot.com/plugins#gemini). Import the ZIP under **Gemini Settings → Skills → Upload skill** and save the Skill.
3. Check that the app is connected and **skillpilot-coach-v1** is available. After a Skill update, import the current ZIP again.

The controlled test loaded the learning context, saved two learning goals and continued learning in a new Gemini web chat. A working direct link opens the learning-goal image; embedded display has not been observed. Additional accounts, mobile apps, voice mode, card practice, Verified Recall and exams have not yet been checked in an actual Gemini chat. The [integration runbook](https://enpasos.github.io/skillpilot/deploy/gemini-integration/) documents the tested scope and test-connection setup.

## 2. Open SkillPilot and protect your SkillPilot ID

Open [skillpilot.com](https://skillpilot.com) and select **Learn now**. Read the notices and terms before accepting them.

Select **Create a new SkillPilot ID**. Your permanent ID is the key to your learning record: select **Save SkillPilot ID securely** and keep the encrypted file and its password safe. To access your record later, you need your ID or this file and its password.

Already have an ID? Enter it in SkillPilot or select **Choose protected file**. Keep your permanent ID and its password private.

## 3. Choose your curriculum

Select **Continue to step 2: Choose curriculum** and decide what you want to learn. Then configure your personal curriculum, such as school type, learning stage and subjects, along with the further choices offered for your selection.

The English video uses **University & Higher Ed → All → MIT OpenCourseWare Foundations** as an example. Choose the curriculum that fits your own learning plans.

These choices define your lasting learning framework. You can change your current focus in the Cockpit later. Review the summary before continuing.

## 4. Start your learning session

Select your learning coach in the **Let’s go** section.

**Claude:** Select **Step 2: Start with Claude**. SkillPilot opens a new Claude chat with the prepared start message. Send it unchanged and complete any sign-in or authorization shown.

**ChatGPT Desktop:** Select **Prepare learning with ChatGPT**, then **Copy ChatGPT start message**. Open a new chat in ChatGPT Desktop with **SkillPilot Coach v1**, paste the message and send it.

**Gemini:** Select **Gemini (Beta)**, confirm that your custom app and imported Skill are ready, then select **Prepare learning with Gemini → Copy start message → Open Gemini**. In the new Gemini chat, use **/** to select **skillpilot-coach-v1** and **@** to select the custom app **SkillPilot**. Paste and send the complete start message. If Gemini offers **Allow** when saving, review the requested action before approving it. Check the saved progress in the Cockpit afterwards.

Each start option creates a separate learning session for the selected provider. The prepared start message contains a **learning session valid for 24 hours**. Keep this message and your learning chat private. Gemini tool calls require at least one hour of validity remaining, so prepare a new learning session after at most 23 hours. In a new Gemini chat, activate the Skill and app again and send the same start message while this limit is still met.

## 5. Learn and see your achievements in the Cockpit

The coach loads your learning context and guides you through the current goal. Do the work yourself, ask questions, and request smaller steps or a hint when needed. AI can make mistakes: check explanations and assessments, and explain your reasoning when you disagree.

Select **Open Cockpit** to see your current learning record and active goal. After completing a goal, check your **saved progress** there.

For the goal displayed automatically, choose **Give feedback on this learning goal** to report a problem, including coach behaviour. Describe the issue briefly in your own words, focusing on the learning goal and what you observed. Keep personal details and your start message private.

## With Claude: Phone, photos and voice mode

- Open the same chat in the app using the same Claude account. You can continue there within the session's 24-hour validity.
- Upload a photo of your calculation or sketch, or use the camera directly in the Claude app. This works especially conveniently on a phone. Cover personal details first.
- **Voice mode works in the ongoing beta.** If speech pauses, wait briefly; in our experience so far, Claude then continues. You can also continue in text chat when needed.

Claude processes your chat, photos and voice inputs. Through the coach interface, SkillPilot receives only the intended structured learning-state data.

## If something goes wrong

**Trouble opening Claude?** Allow pop-ups for SkillPilot and try starting again.

**Session expired?** Start a new learning session from SkillPilot and send the prepared message in the new chat. Your saved achievements remain accessible with the same SkillPilot ID.

**Gemini reports missing tool access?** Select the app with **@SkillPilot** and the Skill with **/** again. The current test connection requires a new sign-in after at most one hour or a restart of the test environment. Reconnecting does not extend your learning session. Do not copy backend data into the chat as a substitute.

**Saving failed?** Ask the coach to check the current state and save the completion again if needed. Then check the Cockpit; if the session has expired, start a new one first.

Find more answers in the [FAQs](https://skillpilot.com/faq) and [setup guides for Claude, ChatGPT and Gemini](https://skillpilot.com/plugins).

Discover what you can do — and celebrate every success.
