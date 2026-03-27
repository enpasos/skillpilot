import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getImprintViewCopy } from '../utils/imprintViewCopy';

export const ImprintView: React.FC = () => {
    const { language } = useLanguage();
    const copy = getImprintViewCopy(language === 'en' ? 'en' : 'de');

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-6 sm:px-6 lg:px-10 flex justify-center transition-colors">
            <div className="max-w-4xl w-full">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    {copy.backToApp}
                </Link>

                <h1 className="text-3xl font-bold mb-8 border-b border-border-color pb-4 text-text-primary">
                    {copy.title}
                </h1>

                <div className="prose dark:prose-invert max-w-none text-text-primary">
                    <p>
                        <span className="block font-bold text-lg mb-2">enpasos - Enterprise Patterns & Solutions GmbH</span>
                        {copy.managingDirector}
                    </p>

                    <p>
                        <strong>{copy.contactLabel}</strong><br />
                        E-Mail: <a href="mailto:support@skillpilot.com" className="text-sky-500 hover:underline">support@skillpilot.com</a>
                    </p>

                    <p>
                        <strong>{copy.addressLabel}</strong><br />
                        Heuhohlweg 42<br />
                        D-61462 Königstein
                    </p>

                    <p>
                        <strong>{copy.registerEntryLabel}</strong><br />
                        {copy.registerCourt}<br />
                        {copy.registerNumber}
                    </p>

                    <p>
                        <strong>{copy.vatIdLabel}</strong><br />
                        {copy.vatIdDescription}<br />
                        DE 245617005
                    </p>
                </div>
            </div>
        </div>
    );
};
