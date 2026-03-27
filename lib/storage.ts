import type { Script, AppSettings } from '@/types'

const SCRIPTS_KEY = 'scene-partner-scripts'
const SETTINGS_KEY = 'scene-partner-settings'

export const storage = {
  // Scripts
  getScripts: (): Script[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(SCRIPTS_KEY)
      if (stored) {
        const scripts = JSON.parse(stored)
        console.log('📖 Loaded', scripts.length, 'scripts from localStorage')
        return scripts
      }
      console.log('📖 No scripts found in localStorage')
      return []
    } catch (error) {
      console.error('❌ Error loading scripts:', error)
      return []
    }
  },

  saveScript: (script: Script): void => {
    try {
      const scripts = storage.getScripts()
      const existingIndex = scripts.findIndex(s => s.id === script.id)

      if (existingIndex >= 0) {
        scripts[existingIndex] = script
        console.log('📝 Updated existing script:', script.title, 'ID:', script.id)
      } else {
        scripts.push(script)
        console.log('📝 Added new script:', script.title, 'ID:', script.id)
      }

      const serialized = JSON.stringify(scripts)
      localStorage.setItem(SCRIPTS_KEY, serialized)

      // Verify it was saved
      const verified = localStorage.getItem(SCRIPTS_KEY)
      if (verified) {
        console.log('✅ Script saved successfully. Total scripts:', scripts.length)
      } else {
        console.error('❌ Script save verification failed!')
      }
    } catch (error) {
      console.error('❌ Error saving script:', error)
    }
  },

  deleteScript: (id: string): void => {
    const scripts = storage.getScripts().filter(s => s.id !== id)
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts))
  },

  getScript: (id: string): Script | null => {
    const scripts = storage.getScripts()
    return scripts.find(s => s.id === id) || null
  },

  // Settings
  getSettings: (): AppSettings => {
    if (typeof window === 'undefined') {
      return getDefaultSettings()
    }
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : getDefaultSettings()
  },

  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },
}

function getDefaultSettings(): AppSettings {
  return {
    voiceSettings: {
      speed: 1.0,
      pauseDuration: 1.0,
      emotionalIntensity: 0.8,
    },
    speechRecognition: {
      sensitivity: 0.7,
      timeout: 3000,
    },
    autoAdvance: true,
  }
}
