import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const PrivacyView: React.FC = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex justify-center transition-colors">
            <div className="max-w-4xl w-full glass-panel p-8 shadow-2xl border border-border-color">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    {language === 'en' ? 'Back to App' : 'Zurück zur App'}
                </Link>

                <h1 className="text-3xl font-bold mb-8 border-b border-border-color pb-4 text-text-primary">
                    {language === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung'}
                </h1>

                <div className="prose dark:prose-invert max-w-none text-text-primary">
                    <p className="text-text-secondary text-sm">
                        {language === 'en' ? 'Date: November 27, 2025' : 'Stand: 27. November 2025'}
                    </p>

                    {language === 'en' ? (
                        <>
                            <p>We appreciate your interest in SkillPilot. Protecting your privacy is very important to us.
                                Below we provide detailed information about how we handle your data.</p>

                            <h2>1. Pseudonymous Use</h2>
                            <p>SkillPilot is designed to be used completely pseudonymously. We do not require
                                registration with a real name or email address. Your learning progress is stored exclusively under a
                                randomly generated <strong>SkillPilot ID</strong> (UUID).</p>
                            <p>This ID is the only key to your data. If you lose this ID, we cannot restore your learning status,
                                as we have no link to your person.</p>

                            <h2>2. Data Collection and Storage</h2>
                            <p>When you use SkillPilot, we store the following information under your SkillPilot ID:</p>
                            <ul>
                                <li>Your chosen learning path (curriculum/landscape).</li>
                                <li>Your current learning status (mastery) for individual skills.</li>
                                <li>Your planned learning goals (frontier).</li>
                            </ul>
                            <p>This data is used exclusively to provide you with suitable learning suggestions and to visualize your progress.</p>

                            <h2>3. Use by AI Assistants (GPTs)</h2>
                            <p>When you use SkillPilot via an AI assistant (e.g., ChatGPT), the assistant transmits your
                                SkillPilot ID to our interface (API) to retrieve learning goals or save progress. We
                                do not receive any chat logs or personal messages from your conversation with the
                                AI assistant.</p>

                            <h2>4. Transfer to Third Parties</h2>
                            <p>We do not sell your data and do not share it with unauthorized third parties. Our services are hosted
                                on secure servers.</p>

                            <h2>5. Your Rights</h2>
                            <p>Since we only store your data pseudonymously, we can only process information or deletion requests if you
                                provide us with your SkillPilot ID. You can have your data deleted at any time by transmitting your ID
                                to us or (if implemented) using the delete function in the app.</p>

                            <h2>6. Contact</h2>
                            <p>If you have any questions about data protection, please contact us at:<br />
                                <a href="mailto:support@skillpilot.com" className="text-sky-500 hover:underline">support@skillpilot.com</a><br />
                                <Link to="/imprint" className="text-sky-500 hover:underline">Imprint</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <p>Wir freuen uns über Ihr Interesse an SkillPilot. Der Schutz Ihrer Privatsphäre ist für uns sehr wichtig.
                                Nachstehend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.</p>

                            <h2>1. Pseudonyme Nutzung</h2>
                            <p>SkillPilot ist so konzipiert, dass es vollständig pseudonym genutzt werden kann. Wir verlangen keine
                                Registrierung mit Klarnamen oder E-Mail-Adresse. Ihr Lernfortschritt wird ausschließlich unter einer
                                zufällig generierten <strong>SkillPilot-ID</strong> (UUID) gespeichert.</p>
                            <p>Diese ID ist der einzige Schlüssel zu Ihren Daten. Wenn Sie diese ID verlieren, können wir Ihren Lernstand
                                nicht wiederherstellen, da wir keine Verknüpfung zu Ihrer Person haben.</p>

                            <h2>2. Erhebung und Speicherung von Daten</h2>
                            <p>Wenn Sie SkillPilot nutzen, speichern wir unter Ihrer SkillPilot-ID folgende Informationen:</p>
                            <ul>
                                <li>Ihren gewählten Lernpfad (Curriculum/Landschaft).</li>
                                <li>Ihren aktuellen Lernstand (Mastery) für einzelne Kompetenzen.</li>
                                <li>Ihre geplanten Lernziele (Frontier).</li>
                            </ul>
                            <p>Diese Daten dienen ausschließlich dazu, Ihnen passende Lernvorschläge zu machen und Ihren Fortschritt zu
                                visualisieren.</p>

                            <h2>3. Nutzung durch KI-Assistenten (GPTs)</h2>
                            <p>Wenn Sie SkillPilot über einen KI-Assistenten (z.B. ChatGPT) nutzen, übermittelt der Assistent Ihre
                                SkillPilot-ID an unsere Schnittstelle (API), um Lernziele abzurufen oder Fortschritte zu speichern. Wir
                                erhalten dabei keine Chat-Protokolle oder persönlichen Nachrichten aus Ihrer Konversation mit dem
                                KI-Assistenten.</p>

                            <h2>4. Weitergabe an Dritte</h2>
                            <p>Wir verkaufen Ihre Daten nicht und geben sie nicht unbefugt an Dritte weiter. Das Hosting unserer Dienste
                                erfolgt auf sicheren Servern.</p>

                            <h2>5. Ihre Rechte</h2>
                            <p>Da wir Ihre Daten nur pseudonym speichern, können wir Auskunfts- oder Löschanfragen nur bearbeiten, wenn Sie
                                uns Ihre SkillPilot-ID mitteilen. Sie können Ihre Daten jederzeit löschen lassen, indem Sie uns Ihre ID
                                übermitteln oder (sofern implementiert) die Löschfunktion in der App nutzen.</p>

                            <h2>6. Kontakt</h2>
                            <p>Bei Fragen zum Datenschutz erreichen Sie uns unter:<br />
                                <a href="mailto:support@skillpilot.com" className="text-sky-500 hover:underline">support@skillpilot.com</a><br />
                                <Link to="/imprint" className="text-sky-500 hover:underline">Impressum</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
