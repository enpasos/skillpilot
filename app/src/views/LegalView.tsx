import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLegalViewCopy } from '../utils/legalViewCopy';
import { PublicPageHeader } from '../components/PublicPageHeader';

export const LegalView: React.FC = () => {
    const { language } = useLanguage();
    const copy = getLegalViewCopy(language === 'en' ? 'en' : 'de');
    const { hash } = useLocation();
    const oerLogoRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (hash !== '#oer-logo') return;
        // Native anchor scrolling can run before this lazy-loaded view mounts.
        const frame = requestAnimationFrame(() => {
            oerLogoRef.current?.scrollIntoView({ block: 'start' });
            oerLogoRef.current?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [hash]);

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-6 sm:px-6 lg:px-10 flex justify-center transition-colors">
            <div className="max-w-4xl w-full min-w-0 break-words">
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

                <section
                    id="oer-logo"
                    ref={oerLogoRef}
                    tabIndex={-1}
                    aria-labelledby="oer-logo-title"
                    className="prose dark:prose-invert max-w-none scroll-mt-6 border-t border-border-color mt-10 pt-6 text-text-primary"
                >
                    <h2 id="oer-logo-title">{copy.oerLogo.title}</h2>
                    <p>{copy.oerLogo.workTitle} — {copy.oerLogo.creator}.</p>
                    <p>
                        <a href={copy.oerLogo.sourceHref}>{copy.oerLogo.sourceLabel}</a>
                        {' · '}
                        <a href={copy.oerLogo.licenseHref}>{copy.oerLogo.licenseLabel}</a>
                    </p>
                    <p>{copy.oerLogo.useNotice} {copy.oerLogo.scopeNotice}</p>
                    <p>{copy.oerLogo.endorsementNotice}</p>
                </section>
            </div>
        </div>
    );
};
