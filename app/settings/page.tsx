'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { elevenLabs } from '@/lib/elevenlabs'
import type { AppSettings } from '@/types'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const loadedSettings = storage.getSettings()
    setSettings(loadedSettings)
    setApiKey(loadedSettings.elevenLabsApiKey || '')
  }, [])

  const handleSave = () => {
    if (!settings) return

    console.log('💾 Saving settings with API key:', apiKey ? apiKey.substring(0, 8) + '...' : 'none')

    const updatedSettings = {
      ...settings,
      elevenLabsApiKey: apiKey,
    }

    storage.saveSettings(updatedSettings)
    console.log('✅ Settings saved to localStorage')

    if (apiKey) {
      elevenLabs.setApiKey(apiKey)
      console.log('✅ API key set in ElevenLabs service')
    }

    // Verify it was saved
    const verified = storage.getSettings()
    console.log('🔍 Verified saved API key:', verified.elevenLabsApiKey ? verified.elevenLabsApiKey.substring(0, 8) + '...' : 'none')

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      const defaults = storage.getSettings()
      setSettings(defaults)
      setApiKey('')
      storage.saveSettings(defaults)
    }
  }

  const handleTestVoice = async () => {
    if (!apiKey) {
      alert('Please enter an API key first')
      return
    }

    setTesting(true)
    console.log('🎤 Testing ElevenLabs voice...')

    // Make sure the API key is set
    elevenLabs.setApiKey(apiKey)

    try {
      await elevenLabs.speak('Hello! This is a test of the ElevenLabs professional voice. If you can hear this in a natural, professional voice, your setup is working correctly.', 'Charlotte')
      console.log('✅ Voice test completed')
      alert('Voice test completed! Check the console for details.')
    } catch (error) {
      console.error('❌ Voice test failed:', error)
      alert('Voice test failed. Check the console for details.')
    } finally {
      setTesting(false)
    }
  }

  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/library"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Library
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* ElevenLabs API Key */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              🔑 ElevenLabs API Key
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Enter your ElevenLabs API key to use professional AI voices. Get your API key at{' '}
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                elevenlabs.io
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_..."
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            {apiKey && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ API key configured
                </p>
                <button
                  onClick={handleTestVoice}
                  disabled={testing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {testing ? '🔊 Testing...' : '🎤 Test Voice'}
                </button>
              </div>
            )}
          </div>

          {/* Voice Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              🎭 Voice Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Delivery Speed: {settings.voiceSettings.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.voiceSettings.speed}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voiceSettings: {
                        ...settings.voiceSettings,
                        speed: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pause Duration: {settings.voiceSettings.pauseDuration.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={settings.voiceSettings.pauseDuration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voiceSettings: {
                        ...settings.voiceSettings,
                        pauseDuration: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Emotional Expression: {Math.round(settings.voiceSettings.emotionalIntensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.voiceSettings.emotionalIntensity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voiceSettings: {
                        ...settings.voiceSettings,
                        emotionalIntensity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Speech Recognition Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              🎤 Speech Recognition
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Sensitivity: {Math.round(settings.speechRecognition.sensitivity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.speechRecognition.sensitivity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      speechRecognition: {
                        ...settings.speechRecognition,
                        sensitivity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Timeout: {settings.speechRecognition.timeout / 1000}s
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="1000"
                  value={settings.speechRecognition.timeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      speechRecognition: {
                        ...settings.speechRecognition,
                        timeout: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Practice Mode */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              ⚙️ Practice Mode
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) =>
                  setSettings({ ...settings, autoAdvance: e.target.checked })
                }
                className="w-6 h-6 rounded text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Auto-Advance
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Automatically move to the next line after speaking
                </div>
              </div>
            </label>
          </div>

          {/* Save Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
