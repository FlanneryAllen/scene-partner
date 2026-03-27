'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { storage } from '@/lib/storage'
import { elevenLabs } from '@/lib/elevenlabs'
import type { Script, ScriptLine } from '@/types'

export default function RehearsalSession() {
  const params = useParams()
  const id = params.id as string

  const [script, setScript] = useState<Script | null>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const loadedScript = storage.getScript(id)
    setScript(loadedScript)

    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        setRecognizedText(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
        if (storage.getSettings().autoAdvance) {
          handleNextLine()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      elevenLabs.stop()
    }
  }, [id])

  const handleRecordToggle = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
      setRecognizedText('')
    }
  }

  const handlePlayLine = async () => {
    if (!script) return

    // Prevent multiple simultaneous plays
    if (isPlaying) {
      console.log('⏸ Already playing, ignoring play request')
      return
    }

    const line = script.lines[currentLineIndex]
    if (line.isUser) return

    setIsPlaying(true)
    const voiceName = line.character === 'OPHELIA' ? 'Charlotte' : 'Antoni'

    try {
      await elevenLabs.speak(line.line, voiceName)
    } catch (error) {
      console.error('Error playing line:', error)
    }

    setIsPlaying(false)

    // Auto-advance if enabled (when manually playing a line)
    const settings = storage.getSettings()
    if (settings.autoAdvance && currentLineIndex < script.lines.length - 1) {
      console.log('🔄 Auto-advancing to next line...')
      setTimeout(() => {
        const newIndex = currentLineIndex + 1
        setCurrentLineIndex(newIndex)
      }, settings.voiceSettings.pauseDuration * 1000)
    }
  }

  const handleNextLine = () => {
    if (!script) return

    // Stop any currently playing audio
    elevenLabs.stop()
    setIsPlaying(false)

    if (currentLineIndex < script.lines.length - 1) {
      const newIndex = currentLineIndex + 1
      setCurrentLineIndex(newIndex)
      const nextLine = script.lines[newIndex]
      if (!nextLine.isUser) {
        // Auto-play AI lines after advancing
        setTimeout(() => {
          if (isPlaying) return // Don't play if already playing

          setIsPlaying(true)
          const voiceName = nextLine.character === 'OPHELIA' ? 'Charlotte' : 'Antoni'
          elevenLabs.speak(nextLine.line, voiceName).then(() => {
            setIsPlaying(false)
            // Auto-advance again if enabled
            const settings = storage.getSettings()
            if (settings.autoAdvance && newIndex < script.lines.length - 1) {
              setTimeout(() => {
                handleNextLine()
              }, settings.voiceSettings.pauseDuration * 1000)
            }
          }).catch(error => {
            console.error('Error in auto-play:', error)
            setIsPlaying(false)
          })
        }, 500)
      }
    }
  }

  const handlePause = () => {
    elevenLabs.stop()
    setIsPlaying(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handlePrevLine = () => {
    // Stop any currently playing audio
    elevenLabs.stop()
    setIsPlaying(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)

    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1)
    }
  }

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📜</div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Script not found
          </h2>
          <Link
            href="/library"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  const currentLine = script.lines[currentLineIndex]

  // Safety check
  if (!currentLine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Invalid line index
          </h2>
          <Link
            href="/library"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/library"
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-1 block"
              >
                ← Back to Library
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {script.title}
              </h1>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Line {currentLineIndex + 1} of {script.lines.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{
                width: `${((currentLineIndex + 1) / script.lines.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Script Lines */}
        <div className="space-y-4 mb-8">
          {script.lines.map((line, index) => {
            const isActive = index === currentLineIndex
            const isPast = index < currentLineIndex

            return (
              <div
                key={index}
                className={`p-6 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 shadow-xl scale-105'
                    : isPast
                    ? 'bg-slate-100 dark:bg-slate-800/50 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-800/30 opacity-40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      line.isUser
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {line.isUser ? '👤' : '🎭'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {line.character}
                      </h3>
                      {isActive && isPlaying && !line.isUser && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
                          Speaking...
                        </span>
                      )}
                      {isActive && isRecording && line.isUser && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                          Recording...
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 text-lg">
                      {line.line}
                    </p>
                    {isActive && recognizedText && line.isUser && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">
                        You said: "{recognizedText}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevLine}
                disabled={currentLineIndex === 0}
                className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-4 rounded-full transition-colors disabled:cursor-not-allowed"
              >
                ⏮️
              </button>

              {/* Pause button - always visible when playing or recording */}
              {(isPlaying || isRecording) && (
                <button
                  onClick={handlePause}
                  className="bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-full text-2xl transition-colors shadow-lg"
                >
                  ⏸️
                </button>
              )}

              {currentLine.isUser ? (
                <>
                  <button
                    onClick={handleRecordToggle}
                    className={`p-6 rounded-full text-3xl transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-primary-600 hover:bg-primary-700'
                    } text-white shadow-lg`}
                  >
                    🎤
                  </button>
                  <button
                    onClick={handleNextLine}
                    disabled={currentLineIndex === script.lines.length - 1}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white p-5 rounded-full text-2xl transition-colors shadow-lg disabled:cursor-not-allowed"
                  >
                    ▶️
                  </button>
                </>
              ) : (
                <button
                  onClick={handlePlayLine}
                  disabled={isPlaying}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white p-6 rounded-full text-3xl transition-colors shadow-lg disabled:cursor-not-allowed"
                >
                  {isPlaying ? '🔊' : '▶️'}
                </button>
              )}

              <button
                onClick={handleNextLine}
                disabled={currentLineIndex === script.lines.length - 1}
                className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-4 rounded-full transition-colors disabled:cursor-not-allowed"
              >
                ⏭️
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => {
                  elevenLabs.stop()
                  if (recognitionRef.current) {
                    recognitionRef.current.stop()
                  }
                  setIsPlaying(false)
                  setIsRecording(false)
                }}
                className="text-red-600 dark:text-red-400 hover:underline text-sm"
              >
                Emergency Stop
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
