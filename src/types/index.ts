export type ContentType = 'presentation' | 'test' | 'game' | 'practice' | 'homework'

export interface GenerateRequest {
  topic: string
  language: 'uz' | 'ru' | 'en'
  contentTypes: ContentType[]
}

export interface Slide {
  id: string
  title: string
  subtitle?: string
  content: string[]
  emoji?: string
  imageKeyword?: string
  type: 'intro' | 'content' | 'example' | 'summary'
}

export interface Presentation {
  topic: string
  slides: Slide[]
}

export interface TestQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Test {
  topic: string
  questions: TestQuestion[]
  timeLimit?: number
}

export interface GameCard {
  id: string
  term: string
  definition: string
  emoji?: string
}

export interface GameData {
  type: 'matching' | 'cards'
  topic: string
  cards: GameCard[]
  instructions: string
}

export interface PracticeTask {
  id: string
  taskNumber: number
  instruction: string
  type: 'fill-blank' | 'short-answer' | 'calculation' | 'essay' | 'true-false'
  answer?: string
  hints?: string[]
}

export interface Practice {
  topic: string
  tasks: PracticeTask[]
  totalPoints: number
}

export interface HomeworkTask {
  id: string
  taskNumber: number
  instruction: string
  type: 'written' | 'research' | 'creative' | 'practical'
  deadline?: string
  resources?: string[]
}

export interface Homework {
  topic: string
  tasks: HomeworkTask[]
  estimatedTime: string
  objectives: string[]
}

export interface GeneratedContent {
  id: string
  request: GenerateRequest
  presentation?: Presentation
  test?: Test
  game?: GameData
  practice?: Practice
  homework?: Homework
  createdAt: Date
}
