
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const SHORT_DISCLAIMER = `
# Bitte bestätigen Sie die folgenden Punkte, um SkillPilot zu nutzen:

* **Modellcharakter**: Mir ist bewusst, dass die Lerninhalte und Lernziele in SkillPilot Modelle sind und keinen Anspruch auf Vollständigkeit erheben.
* **KI-Grenzen**: Ich weiß, dass KI-Bewertungen fehlerhaft sein können und nicht prüfungs- oder rechtsverbindlich sind.
* **Datenintegrität**: Mir ist klar, dass Angaben von Nutzenden (z. B. zu Fähigkeiten und Lernfortschritten) manipuliert oder unzutreffend sein können.
* **Verfügbarkeit**: Ich akzeptiere, dass die Verfügbarkeit des Dienstes nicht garantiert ist und Daten verloren gehen können.
* **Haftung**: Ich nutze SkillPilot auf eigenes Risiko; eine Haftung des Betreibers ist im gesetzlich zulässigen Umfang ausgeschlossen.
`;

export const LegalWaiverModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('skillpilot_legal_waiver_accepted');
        if (!hasAccepted) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('skillpilot_legal_waiver_accepted', 'true');
        setIsOpen(false);
    };

    const handleReadMore = (e: React.MouseEvent) => {
        e.preventDefault();
        // Just navigate behind the modal? No, better to perhaps have it available in main app.
        // Or open in new tab?
        // Since we are in a modal blocking app access, we can't easily navigate to /legal without dismissing modal...
        // But /legal might be accessible.
        // Let's just point out that full text is available.
        window.open('/legal', '_blank');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel p-8 shadow-2xl border border-border-color max-w-[600px] w-full max-h-[90vh] overflow-y-auto bg-sidebar-bg text-text-primary">
                <div className="prose dark:prose-invert text-text-primary">
                    <ReactMarkdown>{SHORT_DISCLAIMER}</ReactMarkdown>
                </div>

                <div className="mt-4 text-sm text-text-secondary">
                    <p>
                        Die ausführlichen <a href="/legal" onClick={handleReadMore} className="text-sky-500 hover:underline">Rechtlichen Hinweise und den Haftungsausschluss</a> finden Sie hier.
                    </p>
                </div>

                <div className="mt-5 border-t border-border-color pt-5">
                    <label className="flex items-center mb-5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="mr-3 w-5 h-5 accent-sky-600 rounded"
                        />
                        <span className="text-base">
                            Ich habe die Hinweise gelesen und akzeptiere den Haftungsausschluss.
                        </span>
                    </label>

                    <button
                        onClick={handleAccept}
                        disabled={!accepted}
                        className={`w-full py-3 rounded-md font-bold text-base transition-colors ${accepted
                            ? 'bg-sky-600 text-white hover:bg-sky-500'
                            : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Bestätigen & Fortfahren
                    </button>
                </div>
            </div>
        </div>
    );
};
