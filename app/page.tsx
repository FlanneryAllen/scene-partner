'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [scripts, setScripts] = useState<any[]>([])

  useEffect(() => {
    const loadScripts = () => {
      const stored = localStorage.getItem('scene-partner-scripts')
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('🏠 Home page - loaded scripts:', parsed.length)
        setScripts(parsed)
      } else {
        console.log('🏠 Home page - no scripts found')
        setScripts([])
      }
    }

    loadScripts()

    // Reload when window gains focus
    window.addEventListener('focus', loadScripts)
    return () => window.removeEventListener('focus', loadScripts)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Scene Partner
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/library"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Library
              </Link>
              <Link
                href="/settings"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Your AI Rehearsal Partner
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Practice scenes with professional AI voices. Import your scripts and start rehearsing.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/library?action=import"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Import Script
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Upload a PDF or text file to get started
            </p>
          </Link>

          <Link
            href="/library"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Script Library
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'} ready to practice
            </p>
          </Link>

          <Link
            href="/settings"
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Settings
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Configure voices and preferences
            </p>
          </Link>
        </div>

        {/* Recent Scripts */}
        {scripts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Recent Scripts
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts.slice(0, 6).map((script: any, index: number) => (
                <Link
                  key={index}
                  href={`/rehearsal/${script.id}`}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {script.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {script.lines?.length || 0} lines
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
