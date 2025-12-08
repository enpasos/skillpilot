import { useLanguage } from '../contexts/LanguageContext';
import { de } from '../locales/de';
import { en } from '../locales/en';

export const useTranslation = () => {
    const { language } = useLanguage();
    return language === 'en' ? en : de;
};
