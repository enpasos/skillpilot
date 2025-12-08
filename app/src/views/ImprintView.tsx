import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ImprintView: React.FC = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex justify-center transition-colors">
            <div className="max-w-4xl w-full glass-panel p-8 shadow-2xl border border-border-color">
                <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    {language === 'en' ? 'Back to App' : 'Zurück zur App'}
                </Link>

                <h1 className="text-3xl font-bold mb-8 border-b border-border-color pb-4 text-text-primary">
                    {language === 'en' ? 'Imprint' : 'Impressum'}
                </h1>

                <div className="prose dark:prose-invert max-w-none text-text-primary">
                    <p>
                        <span className="block font-bold text-lg mb-2">enpasos - Enterprise Patterns & Solutions GmbH</span>
                        {language === 'en' ? 'Managing Director: Dr. Matthias Unverzagt' : 'Geschäftsführer: Dr. Matthias Unverzagt'}
                    </p>

                    <p>
                        <strong>{language === 'en' ? 'Contact:' : 'Kontakt:'}</strong><br />
                        E-Mail: <a href="mailto:support@skillpilot.com" className="text-sky-500 hover:underline">support@skillpilot.com</a>
                    </p>

                    <p>
                        <strong>{language === 'en' ? 'Address:' : 'Anschrift:'}</strong><br />
                        Haintürchenstr. 2<br />
                        D-61462 Königstein
                    </p>

                    <p>
                        <strong>{language === 'en' ? 'Register Entry:' : 'Registereintrag:'}</strong><br />
                        {language === 'en' ? 'Register Court: Local Court Königstein' : 'Registergericht: Amtsgericht Königstein'}<br />
                        {language === 'en' ? 'Register Number: HRB 6597' : 'Registernummer: HRB 6597'}
                    </p>

                    <p>
                        <strong>{language === 'en' ? 'VAT ID:' : 'Umsatzsteuer-ID:'}</strong><br />
                        {language === 'en' ? 'VAT Identification Number according to §27 a Value Added Tax Act:' : 'Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:'}<br />
                        DE 245617005
                    </p>
                </div>
            </div>
        </div>
    );
};
