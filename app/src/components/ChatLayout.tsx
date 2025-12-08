import React, { useState, useEffect } from 'react';
import { AutoResizingTextarea } from './AutoResizingTextarea';

export const ChatLayout: React.FC = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [input, setInput] = useState('');

    // Toggle Funktion und Setzen der Klasse am HTML-Tag
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className="flex h-screen text-text-primary font-sans antialiased bg-chat-bg transition-colors duration-200">

            {/* SIDEBAR */}
            <aside className="w-[260px] bg-sidebar-bg flex flex-col p-2 border-r border-black/5 dark:border-white/5 transition-colors">
                <button
                    onClick={() => console.log('Neuer Chat')}
                    className="flex items-center gap-3 rounded-md border border-black/10 p-3 text-sm transition-colors hover:bg-gray-500/10 dark:border-white/20 dark:hover:bg-gray-500/10 text-text-primary"
                >
                    <span>+</span> Neuer Chat
                </button>

                <div className="flex-1"></div>

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center gap-3 rounded-md p-3 text-sm hover:bg-gray-500/10 transition-colors text-text-primary"
                >
                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="flex-1 flex flex-col bg-chat-bg relative transition-colors">

                {/* Chat History Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center text-sm dark:bg-chat-bg">

                        {/* Beispiel Nachricht: User */}
                        <div className="w-full border-b border-black/10 dark:border-gray-900/50 text-text-primary bg-transparent">
                            <div className="mx-auto max-w-3xl flex gap-4 p-4 md:gap-6 md:py-6">
                                <div className="font-bold">You</div>
                                <div className="min-h-[20px]">Wie baue ich eine App wie diese?</div>
                            </div>
                        </div>

                        {/* Beispiel Nachricht: AI (Hintergrund ist im Darkmode oft leicht anders oder gleich) */}
                        <div className="w-full border-b border-black/10 dark:border-gray-900/50 bg-gray-50 dark:bg-[#444654]">
                            <div className="mx-auto max-w-3xl flex gap-4 p-4 md:gap-6 md:py-6">
                                <div className="font-bold text-text-primary">AI</div>
                                <div className="min-h-[20px] text-text-primary">Indem du Tailwind und semantische Farben nutzt!</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Input Area */}
                <div className="w-full p-4 pb-6">
                    <div className="mx-auto max-w-3xl relative flex items-center w-full bg-input-bg border border-black/10 dark:border-none rounded-xl shadow-md shadow-black/5 overflow-hidden">
                        <AutoResizingTextarea
                            className="w-full bg-transparent text-text-primary p-4 pr-10 outline-none focus:ring-0 placeholder-text-secondary max-h-[200px]"
                            placeholder="Send a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="absolute right-3 bottom-3 p-1 rounded-md text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                    <div className="text-center text-xs text-text-secondary mt-2">
                        Free Research Preview. ChatGPT style clone.
                    </div>
                </div>

            </main>
        </div>
    );
}
