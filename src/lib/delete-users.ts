
import mongoose from 'mongoose'
import { env } from './env'
import User from './models/User'

async function deleteUsers() {
  try {
    await mongoose.connect(env.MONGODB_URI)
    await User.deleteMany({})
    console.log('All users deleted')
    process.exit(0)
  } catch (error) {
    console.error('Delete error:', error)
    process.exit(1)
  }
}

deleteUsers()