import { storage } from './storage'

// ElevenLabs voice IDs (same as Flutter version)
const VOICE_IDS: Record<string, string> = {
  'Antoni': 'ErXwobaYiN019PkySvjV',
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Adam': '21m00Tcm4TlvDq8ikWAM',
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Bella': 'EXAVITQu4vr4xnSDxMaL',
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
}

export class ElevenLabsService {
  private apiKey: string | null = null
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const settings = storage.getSettings()
      this.apiKey = settings.elevenLabsApiKey || null
    }
  }

  setApiKey(key: string) {
    console.log('🔑 Setting ElevenLabs API key:', key.substring(0, 8) + '...')
    this.apiKey = key
    const settings = storage.getSettings()
    storage.saveSettings({ ...settings, elevenLabsApiKey: key })
    console.log('✅ API key saved to localStorage')
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  async speak(text: string, voiceName: string = 'Charlotte'): Promise<void> {
    // Re-check for API key in case it was set after initialization
    if (!this.apiKey && typeof window !== 'undefined') {
      const settings = storage.getSettings()
      if (settings.elevenLabsApiKey) {
        console.log('🔑 Found API key in storage, loading...')
        this.apiKey = settings.elevenLabsApiKey
      }
    }

    if (!this.apiKey) {
      console.warn('⚠️ No ElevenLabs API key found - using fallback browser TTS')
      console.warn('💡 Go to Settings to add your ElevenLabs API key for professional voices')
      return this.fallbackSpeak(text)
    }

    const voiceId = VOICE_IDS[voiceName] || VOICE_IDS['Charlotte']

    try {
      console.log('🎭 Speaking with ElevenLabs voice:', voiceName, 'Voice ID:', voiceId)

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ ElevenLabs API error:', response.status, response.statusText, errorText)
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const audioData = await response.arrayBuffer()
      console.log('✅ Received audio data:', audioData.byteLength, 'bytes')
      await this.playAudio(audioData)

      console.log('✅ ElevenLabs speech completed successfully')
    } catch (error) {
      console.error('Error with ElevenLabs:', error)
      return this.fallbackSpeak(text)
    }
  }

  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }

    const audioBuffer = await this.audioContext.decodeAudioData(audioData)
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)

    return new Promise((resolve) => {
      source.onended = () => resolve()
      source.start()
      this.currentSource = source
    })
  }

  private fallbackSpeak(text: string): Promise<void> {
    console.log('⚠ Using browser TTS fallback')
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => resolve()
      speechSynthesis.speak(utterance)
    })
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource = null
    }
    speechSynthesis.cancel()
  }
}

export const elevenLabs = new ElevenLabsService()
