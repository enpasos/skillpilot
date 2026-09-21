import { Link } from 'react-router-dom'
import type { PublicLandingCopy } from '../utils/publicLandingCopy'

interface PublicLandingOerProps {
  copy: PublicLandingCopy['oer']
}

export const PublicLandingOer = ({ copy }: PublicLandingOerProps) => {
  return (
    <figure
      data-testid="public-landing-oer"
      className="relative m-0 min-h-44 bg-[#1576bd] min-[480px]:min-h-0"
    >
      <Link
        to="/legal#oer-logo"
        data-testid="public-landing-oer-licensing"
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 pb-7 pt-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <img
          data-testid="public-landing-oer-logo"
          src="/assets/third-party/oer/global-oer-logo.png"
          alt={copy.logoAlt}
          width={330}
          height={221}
          loading="lazy"
          decoding="async"
          className="block h-auto max-h-full w-auto max-w-full object-contain"
        />
        <span className="absolute bottom-3 text-[11px] leading-4 underline underline-offset-2">{copy.licensingAction}</span>
      </Link>
    </figure>
  )
}
