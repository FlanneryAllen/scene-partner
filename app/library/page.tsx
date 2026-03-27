'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { storage } from '@/lib/storage'
import type { Script } from '@/types'

export default function Library() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [showImport, setShowImport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadScripts = () => {
      const loaded = storage.getScripts()
      console.log('📚 Loaded scripts:', loaded.length, loaded)
      setScripts(loaded)
    }

    loadScripts()

    // Reload scripts when window gains focus (in case they imported elsewhere)
    window.addEventListener('focus', loadScripts)
    return () => window.removeEventListener('focus', loadScripts)
  }, [])

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    // Parse script - simple format: CHARACTER: line
    const scriptLines = lines
      .map((line, index) => {
        const match = line.match(/^([A-Z\s]+):\s*(.+)$/)
        if (!match) return null

        const character = match[1].trim()
        const lineText = match[2].trim()

        // Determine if this is a user line (e.g., first character is usually the user)
        const isUser = index % 2 === 0

        return {
          character,
          line: lineText,
          isUser,
        }
      })
      .filter(Boolean) as any[]

    const newScript: Script = {
      id: Date.now().toString(),
      title: file.name.replace(/\.(txt|pdf)$/, ''),
      lines: scriptLines,
      createdAt: new Date().toISOString(),
    }

    console.log('💾 Saving script:', newScript)
    storage.saveScript(newScript)

    const updatedScripts = storage.getScripts()
    console.log('✅ Scripts after save:', updatedScripts.length, updatedScripts)
    setScripts(updatedScripts)
    setShowImport(false)

    // Alert user
    alert(`Script "${newScript.title}" imported successfully! (${scriptLines.length} lines)`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      storage.deleteScript(id)
      setScripts(storage.getScripts())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Script Library
            </h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/settings"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Scripts ({scripts.length})
          </h2>
          <button
            onClick={() => setShowImport(!showImport)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showImport ? 'Cancel' : '+ Import Script'}
          </button>
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Import Script
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Upload a text file with your script. Format each line as:
              <code className="block mt-2 bg-slate-100 dark:bg-slate-700 p-2 rounded">
                CHARACTER: Line text
              </code>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="text/plain,.txt,.pdf,application/pdf"
              onChange={handleFileImport}
              className="block w-full text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer p-3"
            />
          </div>
        )}

        {/* Scripts Grid */}
        {scripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              No scripts yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Import your first script to get started
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Import Script
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {script.title}
                </h3>
                {script.author && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    by {script.author}
                  </p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {script.lines.length} lines
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/rehearsal/${script.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Practice
                  </Link>
                  <button
                    onClick={() => handleDelete(script.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
