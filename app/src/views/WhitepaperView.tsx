import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const WHITEPAPER_URL_DE = 'https://enpasos.github.io/skillpilot/whitepaper/whitepaper.de.html';
const WHITEPAPER_URL_EN = 'https://enpasos.github.io/skillpilot/whitepaper/whitepaper.en.html';

export const WhitepaperView: React.FC = () => {
    const { language } = useLanguage();
    const url = language === 'en' ? WHITEPAPER_URL_EN : WHITEPAPER_URL_DE;

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex justify-center transition-colors">
            <div className="max-w-5xl w-full glass-panel p-6 shadow-2xl border border-border-color flex flex-col h-[90vh]">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors flex-shrink-0">
                    <ArrowLeft size={20} className="mr-2" />
                    {language === 'en' ? 'Back to Start' : 'Zurück zur Startseite'}
                </Link>
                <iframe
                    src={url}
                    className="w-full flex-grow border border-gray-200 dark:border-gray-700 rounded-md bg-white"
                    title="Whitepaper"
                />
            </div>
        </div>
    );
};
