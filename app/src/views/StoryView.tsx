import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { MarkdownDocumentH1 } from '../components/MarkdownDocumentHeading'
import { MarkdownDocumentVideoCard } from '../components/MarkdownDocumentVideoCard'
import { getMarkdownDocumentViewCopy } from '../utils/markdownDocumentViewCopy'

type LoadState = 'loading' | 'ready' | 'error'

const SUPPORTED_LANGS = new Set(['de', 'en'])

const QUICKSTART_VIDEO_URLS = {
    de: '/api/public/quickstart/videos/skillpilot-coach-v1/1.0.0/de/sha256-151a5c097a2c73e73b40e6521e410724e6b0737630dff8d5f40419e673132ee6.mp4',
    en: '/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4',
} as const

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
    const { language, setLanguage } = useLanguage()
    const { lang } = useParams()
    const activeLanguage = useMemo(() => resolveLanguage(lang, language), [lang, language])
    const [content, setContent] = useState('')
    const [loadState, setLoadState] = useState<LoadState>('loading')

    useEffect(() => {
        if (language !== activeLanguage) {
            setLanguage(activeLanguage)
        }
    }, [activeLanguage, language, setLanguage])

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

    const labels = getMarkdownDocumentViewCopy(activeLanguage, 'story')

    const switchLanguage = activeLanguage === 'en' ? 'de' : 'en'
    const basePath = '/quickstart'
    const videoUrl = QUICKSTART_VIDEO_URLS[activeLanguage]

    if (lang !== activeLanguage) {
        return <Navigate to={`${basePath}/${activeLanguage}`} replace />
    }

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
                    <>
                        <MarkdownDocumentVideoCard
                            url={videoUrl}
                            eyebrow={labels.videoEyebrow}
                            title={labels.videoTitle}
                            description={labels.videoDescription}
                            openLabel={labels.videoOpen}
                        />
                        <div className="prose dark:prose-invert max-w-none text-text-primary">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: (props) => <MarkdownDocumentH1 {...props} compact />,
                                    img: ({ title, ...props }) => {
                                        const widthMatch = typeof title === 'string'
                                            ? title.match(/\b(?:width|max-width|w)=(\d+)\b/i)
                                            : null
                                        const explicitMaxWidth = widthMatch ? `${widthMatch[1]}px` : undefined
                                        const rawSrc = typeof props.src === 'string' ? props.src : ''
                                        const normalizedSrc = rawSrc.toLowerCase()
                                        const src = normalizedSrc.startsWith('/') || normalizedSrc.startsWith('http') ? rawSrc : `/${rawSrc}`

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
                                                loading={props.loading ?? 'lazy'}
                                                decoding={props.decoding ?? 'async'}
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
                    </>
                )}
            </div>
        </div>
    )
}
