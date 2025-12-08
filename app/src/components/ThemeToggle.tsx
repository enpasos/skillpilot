import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className="relative inline-block">
            <input
                type="checkbox"
                id="morph-toggle"
                className="sr-only"
                checked={isDark}
                onChange={toggleTheme}
            />
            <label
                htmlFor="morph-toggle"
                className={`
          relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer overflow-hidden transition-all duration-300
        `}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                <span
                    className={`relative w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${isDark ? 'rotate-180' : 'rotate-0'
                        }`}
                >
                    <span
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'
                            }`}
                    >
                        <Sun size={20} className="text-text-secondary hover:text-sky-400 transition-colors" />
                    </span>
                    <span
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <Moon size={20} className="text-text-secondary hover:text-sky-400 transition-colors" />
                    </span>
                </span>
            </label>
        </div>
    )
}
