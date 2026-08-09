import { useState } from 'react'
import Header from './components/layout/Header'
import SchedulerTab from './components/scheduler/SchedulerTab'
import { ToastProvider } from './components/common/Toast'

export default function App() {
  const [screenshotMode, setScreenshotMode] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-court-cream">
        {!screenshotMode && (
          <Header
            screenshotMode={screenshotMode}
            onToggleScreenshotMode={() => setScreenshotMode((v) => !v)}
          />
        )}

        <main>
          <SchedulerTab
            screenshotMode={screenshotMode}
            onExitScreenshotMode={() => setScreenshotMode(false)}
          />
        </main>

        {!screenshotMode && (
          <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-court-ink-soft sm:px-6">
            <div className="net-line mx-auto mb-3 max-w-xs" />
            0-0-2 Desk · Pasay City Pickleball Club
          </footer>
        )}
      </div>
    </ToastProvider>
  )
}
