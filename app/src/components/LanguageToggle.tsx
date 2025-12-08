import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex bg-gray-200 dark:bg-slate-800 rounded-lg p-1">
            <button
                onClick={() => setLanguage('de')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'de'
                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                DE
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'en'
                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                EN
            </button>
        </div>
    );
};
