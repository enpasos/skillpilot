import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

type LoadState = 'loading' | 'ready' | 'error'

const SUPPORTED_LANGS = new Set(['de', 'en'])

const resolveLanguage = (routeLang: string | undefined, fallback: 'de' | 'en') => {
    const normalized = (routeLang || '').toLowerCase()
    if (SUPPORTED_LANGS.has(normalized)) {
        return normalized as 'de' | 'en'
    }
    return fallback
}

const convertHtmlImagesToMarkdown = (markdown: string) => (
    markdown.replace(/<img\s+[^>]*>/gi, (match) => {
        const srcMatch = match.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
        if (!srcMatch) return match
        const altMatch = match.match(/\balt\s*=\s*["']([^"']*)["']/i)
        const widthMatch = match.match(/\bwidth\s*=\s*["']?(\d+)["']?/i)
        const altText = altMatch ? altMatch[1] : ''
        const title = widthMatch ? ` "width=${widthMatch[1]}"` : ''
        return `![${altText}](${srcMatch[1]}${title})`
    })
)

export const StoryView: React.FC = () => {
    const { language } = useLanguage()
    const { lang } = useParams()
    const location = useLocation()
    const activeLanguage = useMemo(() => resolveLanguage(lang, language), [lang, language])
    const [content, setContent] = useState('')
    const [loadState, setLoadState] = useState<LoadState>('loading')

    useEffect(() => {
        const fileLanguage = activeLanguage === 'en' ? 'en' : 'de'
        // Load generic story.de.md / story.en.md from public root
        const url = `/story.${fileLanguage}.md`
        let isActive = true

        if (loadState !== 'loading') setLoadState('loading')
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}`)
                }
                return response.text()
            })
            .then((text) => {
                if (!isActive) return
                setContent(convertHtmlImagesToMarkdown(text))
                setLoadState('ready')
            })
            .catch(() => {
                if (!isActive) return
                setLoadState('error')
            })

        return () => {
            isActive = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLanguage])

    const labels = activeLanguage === 'en'
        ? {
            back: 'Back to App',
            switchLabel: 'Deutsch',
            loading: 'Loading story...',
            error: 'Story could not be loaded.',
        }
        : {
            back: 'Zurück zur App',
            switchLabel: 'English',
            loading: 'Story wird geladen...',
            error: 'Story konnte nicht geladen werden.',
        }

    const switchLanguage = activeLanguage === 'en' ? 'de' : 'en'
    const basePath = location.pathname.startsWith('/quickstart') ? '/quickstart' : '/story'

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-6 sm:px-6 lg:px-10 flex justify-center transition-colors">
            <div className="max-w-4xl w-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <Link to="/" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        {labels.back}
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                        <Link
                            to={`${basePath}/${switchLanguage}`}
                            className="text-sky-500 hover:text-sky-400 transition-colors"
                        >
                            {labels.switchLabel}
                        </Link>
                    </div>
                </div>

                {loadState === 'loading' && (
                    <p className="text-text-secondary">{labels.loading}</p>
                )}
                {loadState === 'error' && (
                    <p className="text-rose-400">{labels.error}</p>
                )}
                {loadState === 'ready' && (
                    <div className="prose dark:prose-invert max-w-none text-text-primary">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({ title, ...props }) => {
                                    const widthMatch = typeof title === 'string'
                                        ? title.match(/\b(?:width|max-width|w)=(\d+)\b/i)
                                        : null
                                    const explicitMaxWidth = widthMatch ? `${widthMatch[1]}px` : undefined
                                    const rawSrc = typeof props.src === 'string' ? props.src.toLowerCase() : ''
                                    const src = rawSrc.startsWith('/') || rawSrc.startsWith('http') ? rawSrc : `/${rawSrc}`

                                    const maxWidth = explicitMaxWidth
                                    const className = [
                                        'max-w-full h-auto rounded-lg border border-border-color',
                                        maxWidth ? 'block mx-auto' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')
                                    const style = maxWidth ? { maxWidth, width: '100%' } : undefined

                                    return (
                                        <img
                                            {...props}
                                            src={src}
                                            title={explicitMaxWidth ? undefined : title}
                                            className={className}
                                            style={style}
                                        />
                                    )
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}
