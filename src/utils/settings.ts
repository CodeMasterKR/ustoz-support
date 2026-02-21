import type { ContentType } from '@/types'

export interface AppSettings {
  // Umumiy
  defaultLanguage: 'uz' | 'ru' | 'en'
  defaultContentTypes: ContentType[]
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  animationsEnabled: boolean
  soundEnabled: boolean

  // AI
  groqApiKey: string
  aiModel: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'gemma2-9b-it'

  // Taqdimot
  presentationSlideCount: number
  showSlideImages: boolean
  slidesAutoPlay: boolean
  slideTransition: 'fade' | 'slide' | 'zoom'

  // Test
  testQuestionCount: number
  testTimeLimit: number
  testDifficultyEasy: number
  testDifficultyMedium: number
  testDifficultyHard: number
  showExplanations: boolean
  shuffleOptions: boolean

  // Amaliyot
  practiceTaskCount: number
  showHints: boolean

  // Uyga vazifa
  homeworkTaskCount: number
  defaultDeadlineDays: number

  // Ma'lumotlar
  historyLimit: number

  // O'quvchilar
  defaultGradeSystem: '5' | '10' | '100' | 'letter'
  autoBackup: boolean
}

const KEY = 'ustoz_settings'

export const DEFAULTS: AppSettings = {
  defaultLanguage: 'uz',
  defaultContentTypes: ['presentation', 'test'],
  theme: 'light',
  compactMode: false,
  animationsEnabled: true,
  soundEnabled: false,
  groqApiKey: '',
  aiModel: 'llama-3.3-70b-versatile',
  presentationSlideCount: 7,
  showSlideImages: true,
  slidesAutoPlay: false,
  slideTransition: 'slide',
  testQuestionCount: 20,
  testTimeLimit: 40,
  testDifficultyEasy: 40,
  testDifficultyMedium: 40,
  testDifficultyHard: 20,
  showExplanations: true,
  shuffleOptions: true,
  practiceTaskCount: 8,
  showHints: true,
  homeworkTaskCount: 5,
  defaultDeadlineDays: 3,
  historyLimit: 40,
  defaultGradeSystem: '5',
  autoBackup: false,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function resetSettings() {
  localStorage.removeItem(KEY)
}
