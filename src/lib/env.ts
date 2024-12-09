import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({
  path: resolve(process.cwd(), '.env.local')
})

// Validate environment variables
const requiredEnvVars = ['MONGODB_URI', 'AUTH_SECRET', 'NEXTAUTH_URL'] as const
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
} as const