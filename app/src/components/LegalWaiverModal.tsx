import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';
import { getLegalWaiverCopy } from '../utils/legalWaiverCopy';

export const LegalWaiverModal: React.FC = () => {
    const { language } = useLanguage();
    const copy = getLegalWaiverCopy(language === 'en' ? 'en' : 'de');
    const [isOpen, setIsOpen] = useState(() => {
        const hasAccepted = localStorage.getItem('skillpilot_legal_waiver_accepted');
        return !hasAccepted;
    });
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        localStorage.setItem('skillpilot_legal_waiver_accepted', 'true');
        setIsOpen(false);
    };

    const handleReadMore = (e: React.MouseEvent) => {
        e.preventDefault();
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
                    <ReactMarkdown>{copy.shortDisclaimer}</ReactMarkdown>
                </div>

                <div className="mt-4 text-sm text-text-secondary">
                    <p>
                        {copy.detailsPrefix}
                        <a href="/legal" onClick={handleReadMore} className="text-sky-500 hover:underline">{copy.detailsLinkLabel}</a>
                        {copy.detailsSuffix}
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
                            {copy.acceptanceLabel}
                        </span>
                    </label>

                    <button
                        onClick={handleAccept}
                        disabled={!accepted}
                        className={`w-full py-3 rounded-md font-bold text-base transition-colors ${accepted
                            ? 'bg-sky-600 text-white hover:bg-sky-500'
                            : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-100 cursor-not-allowed'
                            }`}
                    >
                        {copy.confirmButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
