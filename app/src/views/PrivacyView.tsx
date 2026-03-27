import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrivacyViewCopy } from '../utils/privacyViewCopy';

export const PrivacyView: React.FC = () => {
    const { language } = useLanguage();
    const copy = getPrivacyViewCopy(language);

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
                    <p className="text-text-secondary text-sm">
                        {copy.effectiveDate}
                    </p>

                    <p>{copy.intro}</p>

                    {copy.sections.map((section) => (
                        <React.Fragment key={section.title}>
                            <h2>{section.title}</h2>
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                            {section.bullets && (
                                <ul>
                                    {section.bullets.map((bullet) => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                            )}
                            {section.paragraphsAfterBullets?.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </React.Fragment>
                    ))}

                    <h2>{copy.contactTitle}</h2>
                    <p>{copy.contactIntro}<br />
                        <a href="mailto:support@skillpilot.com" className="text-sky-500 hover:underline">support@skillpilot.com</a><br />
                        <Link to="/imprint" className="text-sky-500 hover:underline">{copy.imprintLabel}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
