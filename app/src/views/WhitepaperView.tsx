import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const WHITEPAPER_TEXT_DE = `
# SkillPilot Whitepaper (DE)

**Version:** 1.0
**Datum:** Dezember 2025
**Projekt:** SkillPilot

---

## Zusammenfassung

SkillPilot modelliert Lehrpläne (**Curricula**) als **Skill-Graph**. Lernende, Lehrkräfte und KI-Agenten nutzen diesen als maschinenlesbare Landkarte. So kann der Lernende von seinem aktuellen **Skill-Stand** sicher zu seinen **Skill-Zielen** navigieren. Ein KI-Agent führt ihn dabei durch **personalisierte Curricula**. Dazu erfasst das System Lernerfolge auf atomaren Skill-Zielen und leitet daraus den **Beherrschungsgrad** für übergeordnete Themen ab. Auf dieser Basis führt der Weg über die **nächsten erreichbaren Skill-Ziele** systematisch hin zu den individuellen Bildungszielen.

---

## 1. Die Herausforderung: Individuelle Skill-Navigation

Klassische Bildung basiert auf Curricula, die staatlich herausgegeben oder im Rahmen von **Akkreditierungsprozessen** festgelegt werden. Für Lehrer oder Professoren ist es jedoch eine immense **buchhalterische** Herausforderung, für jeden einzelnen Schüler oder Studenten feingranular zu erfassen, wo er in der Skill-Landschaft steht und wie er sich bewegt. Dies wird besonders deutlich bei Einführungsvorlesungen mit über tausend Studierenden. Diese „Tool-Lücke“ will SkillPilot schließen.

---

## 2. Der Umbruch: Möglichkeiten moderner KI-Agenten nutzen

In den drei Jahren, seit ChatGPT im November 2022 online ging, hat sich die Welt der sprachbasierten KI rasant entwickelt. Ein Gefühl für dieses Tempo vermittelt der Blick auf *Humanity's Last Exam*, den bisher härtesten KI-Benchmark. Dieser wurde Anfang 2025 eingeführt, um KIs mit tausenden extremen Expertenfragen auf echtes logisches Denken statt bloßes Wissen zu prüfen. Während Spitzenmodelle zu Jahresbeginn noch fast völlig versagten (unter 10 % Erfolg), konnten führende KIs diese Leistung bis zum Jahresende auf etwa 50 % verfünffachen.

Stand Ende 2025 sind KIs damit fachlich und sprachlich vielen Themen gewachsen, die an Schulen und Universitäten gelehrt werden. Doch sie haben Grenzen: Sie sind keine ausgebildeten Pädagogen und arbeiten nicht wie algorithmisch exakte Buchhaltungsprogramme, die fehlerfrei rechnen und verwalten.

Um die für **SkillPilot** benötigte algorithmische **Präzision** bei der Navigation auf den Lernzielen zu sichern, kommt uns ein weiterer Trend zugute: Die Kopplung von Sprach-KIs an klassische Software. Es etablieren sich Standards, die es KIs wie ChatGPT ermöglichen, gezielt Schnittstellen (APIs) klassischer Programme aufzurufen.

Daraus ergibt sich der Ansatz für **SkillPilot** fast von selbst: Es entsteht als hybride Anwendung. Eine klassische, exakte Software übernimmt im Hintergrund die präzise „Buchführung“ und Navigation der Skill-Ziele. Führende Sprach-KIs werden so instruiert (als SkillPilot GPT), dass sie als einfühlsame Trainer mit den Lernenden sprechen, für den Lernfortschritt aber die exakte Logik der Software im Hintergrund nutzen.

---

## 3. Die Technologie: Der Skill-Graph

Das Herzstück von SkillPilot ist die Abkehr von linearen Listen hin zu einem vernetzten Graphen.

![Beispiel-Visualisierung des Skill-Graphen](/whitepaper/graph_example.png)

* **Die Landkarte (Knoten & Verbindungen):** Lernziele sind Knoten in einem Netzwerk. Verbindungen definieren Abhängigkeiten ("Du musst A können, bevor du B lernst") oder Hierarchien ("Themenfeld X beinhaltet die Skills Y und Z").
* **Die Frontier (Die Lerngrenze):** Das System berechnet für jeden Lernenden dynamisch die sogenannte „Frontier“. Das ist die Menge aller Skills, für die der Lernende *jetzt gerade* bereit ist – also Skills, deren Voraussetzungen er bereits erfüllt hat, die er aber selbst noch nicht beherrscht.

Dies verhindert Überforderung und stellt sicher, dass der KI-Tutor keine willkürlichen Sprünge macht, sondern pädagogisch sinnvoll im Bereich der nächsten Entwicklung (Zone of Proximal Development) agiert.

---

## 4. Der Datenansatz: Sicherheit & Privacy

Ein zentraler Pfeiler von SkillPilot ist „Privacy by Design“ durch eine strikte Datentrennung.

![Schematische Darstellung der Datentrennung](/whitepaper/architecture_sketch.svg)

Die klassische algorithmische Komponente – der **SkillPilot Server** – kennt den Lernenden ausschließlich als Pseudonym (\`skillpilotId\`). Auf diesem Server werden lediglich technisch notwendige Metadaten gespeichert: der erreichte Lernfortschritt im Graphen.

Der eigentliche Dialoginhalt ist vom Server entkoppelt. Welche Informationen der Lernende der Sprach-KI im Gespräch preisgibt, liegt in seiner eigenen Verantwortung. Die Brücke zur realen Welt schlägt allein der Lehrende. Die Zuordnungstabelle („Wer ist welches Pseudonym?“) wird ausschließlich lokal auf dem Rechner des Lehrenden oder in dessen geschützter Ablage gespeichert, niemals zentral.

---

## 5. Status Quo: Verfügbare Inhalte

SkillPilot ist keine theoretische Übung. Das System ist bereits mit umfangreichen Curricula ausgestattet, die offizielle Bildungsstandards abbilden:

* **Schule (Hessen Sek I & II):** Vollständige Abdeckung der Fächer Mathematik, Physik, Chemie, Biologie, Informatik, Geschichte sowie Sprachen (Deutsch, Englisch, Französisch, Latein).
* **Sprachen (GER):** Europäischer Referenzrahmen für Englisch und Französisch (A1–C2).
* **Universität:** Exemplarische Module (z. B. TUM Physik).

Diese Inhalte dienen als Startpunkt und können von der Community erweitert werden.

---

## 6. Der offene Ansatz: Geschäftsmodell & Einladung

Um eine breite Akzeptanz und nachhaltige Weiterentwicklung zu sichern, wird SkillPilot als **Open Source Software unter der Apache-2.0-Lizenz** veröffentlicht. Dies ist eine bewusste Einladung an die klassischen Akteure des Bildungswesens.

Ziel ist es, etablierte Player ins Boot zu holen, statt sie zu verdrängen. Herausgeber von Lehrmaterialien, Lehrer, Professoren und Bildungseinrichtungen behalten ihre Souveränität. Sie können ihre bewährten Inhalte und Curricula über die SkillPilot-Technologie modernisieren und zugänglich machen, ohne die Kontrolle an eine geschlossene Plattform zu verlieren.

**Initiator:**
Juristischer Träger ist die **enpasos GmbH**, ein Familienunternehmen, das auf zwei Jahrzehnte Beratungserfahrung im Bereich klassischer Softwarearchitekturen zurückblickt. Die Motivation für SkillPilot speist sich aus der persönlichen Erfahrung der Familienmitglieder, die das klassische deutsche Schul- und Universitätssystem durchlaufen haben und dessen Herausforderungen kennen. Wir würden uns freuen, dieses Fundament gemeinsam zu nutzen, um uns für die Bildung der nächsten Generation besser aufzustellen.

---
`;

const WHITEPAPER_TEXT_EN = `
# SkillPilot Whitepaper (EN)

**Version:** 1.0  
**Date:** December 2025  
**Project:** SkillPilot

---

## Summary

SkillPilot models curricula as a **skill graph**. Learners, teachers, and AI agents use this as a machine-readable map. This allows the learner to safely navigate from their current **skill state** to their **skill goals**. An AI agent guides them through **personalized curricula**. To do this, the system records learning achievements on atomic skill goals and derives the **mastery level** for higher-level topics from them. On this basis, the path via the **next attainable skill goals** leads systematically to individual educational objectives.

---

## 1. The Challenge: Individual Skill Navigation

Traditional education is based on curricula that are issued by the state or defined as part of **accreditation processes**. For teachers or professors, however, it is an immense **bookkeeping** challenge to record in a fine-grained way where each individual pupil or student stands in the skill landscape and how they are moving through it. This becomes particularly evident in introductory lectures with more than a thousand students. SkillPilot aims to close this “tool gap”.

---

## 2. The Shift: Leveraging Modern AI Agents

In the three years since ChatGPT went online in November 2022, the world of language-based AI has evolved rapidly. A sense of this pace can be gained from *Humanity's Last Exam*, the toughest AI benchmark to date. It was introduced in early 2025 to test AIs with thousands of extremely difficult expert questions for genuine logical reasoning rather than mere knowledge. While top models almost completely failed at the beginning of the year (below 10% success), leading AIs were able to increase this performance to around 50% by the end of the year.

As of the end of 2025, AIs are thus up to many of the subject-matter and language demands of what is taught in schools and universities. But they have limitations: they are not trained educators and they do not act like algorithmically exact bookkeeping programs that calculate and manage without error.

To ensure the algorithmic **precision** needed for **SkillPilot** when navigating learning objectives, a further trend works in our favor: the coupling of language AIs with classical software. Standards are emerging that allow AIs like ChatGPT to call the interfaces (APIs) of traditional programs in a targeted way.

From this, the approach for **SkillPilot** almost suggests itself: it is created as a hybrid application. A classical, exact piece of software takes over the precise “bookkeeping” and navigation of skill goals in the background. Leading language AIs are instructed (as SkillPilot GPT) to act as empathetic trainers in conversation with learners, but to rely on the exact logic of the software in the background for learning progress.

---

## 3. The Technology: The Skill Graph

At the heart of SkillPilot lies the departure from linear lists towards a connected graph.

![Example visualization of the skill graph](/whitepaper/graph_example.png)

* **The Map (Nodes & Connections):** Learning objectives are nodes in a network. Connections define dependencies (“You must be able to do A before you learn B”) or hierarchies (“Topic area X includes skills Y and Z”).
* **The Frontier (Learning Boundary):** The system dynamically calculates the so-called “frontier” for each learner. This is the set of all skills for which the learner is *right now* ready—i.e. skills whose prerequisites they already fulfill but which they themselves do not yet master.

This prevents overload and ensures that the AI tutor does not make arbitrary jumps, but instead operates pedagogically sensibly within the next zone of development (zone of proximal development).

---

## 4. The Data Approach: Security & Privacy

A central pillar of SkillPilot is “privacy by design” through strict separation of data.

![Schematic representation of data separation](/whitepaper/architecture_sketch.svg)

The classical algorithmic component—the **SkillPilot server**—knows the learner solely as a pseudonym (\`skillpilotId\`). Only technically necessary metadata are stored on this server: the learning progress achieved in the graph.

The actual dialog content is decoupled from the server. What information the learner discloses to the language AI in the conversation is their own responsibility. The only bridge to the real world is the teacher. The mapping table (“Who is which pseudonym?”) is stored exclusively locally on the teacher’s computer or in their protected storage, never centrally.

---

## 5. Status Quo: Available Content

SkillPilot is not a theoretical exercise. The system already comes with extensive curricula that reflect official educational standards:

* **Schools (Hessen lower and upper secondary):** Complete coverage of the subjects mathematics, physics, chemistry, biology, computer science, history, and languages (German, English, French, Latin).
* **Languages (GER/CEFR):** European Framework of Reference for English and French (A1–C2).
* **University:** Sample modules (e.g. TUM Physics).

This content serves as a starting point and can be expanded by the community.

---

## 6. The Open Approach: Business Model & Invitation

To ensure broad acceptance and sustainable further development, SkillPilot is released as **open source software under the Apache-2.0 license**. This is a deliberate invitation to the traditional players in the education system.

The goal is to bring established stakeholders on board rather than displace them. Publishers of educational materials, teachers, professors, and educational institutions retain their sovereignty. They can modernize and make their proven content and curricula accessible via the SkillPilot technology without losing control to a closed platform.

**Initiator:**  
The legal entity behind SkillPilot is **enpasos GmbH**, a family-owned company that draws on two decades of consulting experience in classical software architectures. The motivation for SkillPilot stems from the personal experience of the family members, who have passed through the traditional German school and university system and know its challenges first-hand. We would be delighted to use this foundation together to better position ourselves for the education of the next generation.

---
`;

export const WhitepaperView: React.FC = () => {
    const { language } = useLanguage();
    const content = language === 'en' ? WHITEPAPER_TEXT_EN : WHITEPAPER_TEXT_DE;

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex justify-center transition-colors">
            <div className="max-w-4xl w-full glass-panel p-8 shadow-2xl border border-border-color">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    {language === 'en' ? 'Back to Start' : 'Zurück zur Startseite'}
                </Link>

                <h1 className="text-3xl font-bold mb-8 border-b border-border-color pb-4 text-text-primary">Whitepaper</h1>

                <div className="prose dark:prose-invert max-w-none text-text-primary">
                    <ReactMarkdown
                        components={{
                            img: ({ node, ...props }) => (
                                <img {...props} style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                            )
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
