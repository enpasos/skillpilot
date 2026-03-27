import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getInfoModalCopy } from '../utils/infoModalCopy';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    buttonText?: string;
    type?: 'info' | 'error' | 'success';
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    buttonText,
    type = 'info',
}) => {
    const { language } = useLanguage();
    const copy = getInfoModalCopy(language === 'en' ? 'en' : 'de');

    if (!isOpen) return null;

    const headerColor = type === 'error' ? 'text-red-500' : 'text-text-primary';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-sidebar-bg rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-border-color"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={`text-xl font-bold mb-4 ${headerColor}`}>{title}</h2>
                <div className="text-text-secondary mb-8 text-sm leading-relaxed">
                    {children}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
                    >
                        {buttonText ?? copy.confirmButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
