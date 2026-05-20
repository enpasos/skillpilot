import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLegalViewCopy } from '../utils/legalViewCopy';
import { PublicPageHeader } from '../components/PublicPageHeader';

export const LegalView: React.FC = () => {
    const { language } = useLanguage();
    const copy = getLegalViewCopy(language === 'en' ? 'en' : 'de');
    return (
        <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-6 sm:px-6 lg:px-10 flex justify-center transition-colors">
            <div className="max-w-4xl w-full">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    {copy.backToApp}
                </Link>

                <PublicPageHeader
                    align="left"
                    className="mb-8 border-b border-border-color pb-6"
                    title={copy.title}
                />

                <div className="prose dark:prose-invert max-w-none text-text-primary">
                    <ReactMarkdown>{copy.markdown}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
