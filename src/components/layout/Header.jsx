import { Camera } from 'lucide-react'
import paddleMark from '../../assets/pasay-002-mark.jpg'
import paddleFull from '../../assets/pasay-002-full.jpg'

export default function Header({ screenshotMode, onToggleScreenshotMode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-court-line bg-court-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 overflow-hidden rounded-lg ring-1 ring-court-forest">
            <img src={paddleMark} alt="" className="h-full w-full object-cover ml-0.5" />
          </span>
          <div>
            <span className="block font-display text-lg font-bold leading-tight tracking-tight text-court-ink">
              0-0-2 Desk
            </span>
            <span className="block text-xs font-medium leading-tight text-court-ink-soft">
              Pasay City Pickleball Club
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleScreenshotMode}
          aria-pressed={screenshotMode}
          aria-label="Screenshot Mode"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-court-forest/30 bg-white px-3.5 py-2 text-sm font-medium text-court-forest shadow-card transition-colors hover:bg-court-forest hover:text-white"
        >
          <Camera size={16} />
          <span className="hidden sm:inline">Screenshot Mode</span>
        </button>
      </div>
    </header>
  )
}
