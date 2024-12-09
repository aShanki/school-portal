// Grade-related constants
export const PARTICIPATION_ASSIGNMENT_ID = 'participation'

// Assignment types
export const ASSIGNMENT_TYPES = [
  'Unit Test',
  'Seatwork', 
  'Term Test',
  'Homework',
  'Research',
  'Participation'
] as const

// Assignment configurations
export const ASSIGNMENTS_CONFIG = {
  'Term Test': { count: 1, points: 60 },
  'Unit Test': { count: 3, points: 50 },
  'Seatwork': { count: 6, points: 35 },
  'Homework': { count: 10, points: 10 },
  'Participation': { count: 1, points: 100 }
} as const