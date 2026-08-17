import { ExternalLink, Play } from 'lucide-react'

interface MarkdownDocumentVideoCardProps {
  url: string
  eyebrow: string
  title: string
  description: string
  openLabel: string
}

export const MarkdownDocumentVideoCard = ({
  url,
  eyebrow,
  title,
  description,
  openLabel,
}: MarkdownDocumentVideoCardProps) => (
  <section className="mb-10 overflow-hidden rounded-3xl border border-sky-400/30 bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-1 shadow-2xl shadow-sky-950/30">
    <div className="rounded-[1.35rem] bg-slate-950/55 p-5 sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            <Play size={15} fill="currentColor" aria-hidden="true" />
            {eyebrow}
          </div>
          <h2 className="m-0 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-sky-300/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-200/70 hover:bg-sky-300/20 hover:text-white sm:self-auto"
        >
          <ExternalLink size={16} aria-hidden="true" />
          {openLabel}
        </a>
      </div>
      <video
        className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-contain shadow-xl"
        aria-label={title}
        controls
        playsInline
        preload="metadata"
        src={url}
      >
        <a href={url}>{openLabel}</a>
      </video>
    </div>
  </section>
)
