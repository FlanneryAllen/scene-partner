export interface Script {
  id: string
  title: string
  author?: string
  lines: ScriptLine[]
  createdAt: string
  lastPracticed?: string
}

export interface ScriptLine {
  character: string
  line: string
  isUser: boolean
}

export interface AppSettings {
  elevenLabsApiKey?: string
  voiceSettings: {
    speed: number
    pauseDuration: number
    emotionalIntensity: number
  }
  speechRecognition: {
    sensitivity: number
    timeout: number
  }
  autoAdvance: boolean
}
