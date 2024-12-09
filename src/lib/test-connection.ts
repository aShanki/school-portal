
import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import { env } from './env'

async function testConnection() {
  try {
    // Test MongoDB native driver
    console.log('Testing MongoDB native connection...')
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    const adminDb = client.db('admin')
    const result = await adminDb.command({ ping: 1 })
    console.log('MongoDB native connection successful:', result)
    await client.close()

    // Test Mongoose connection
    console.log('Testing Mongoose connection...')
    await mongoose.connect(env.MONGODB_URI)
    console.log('Mongoose connection successful')
    await mongoose.disconnect()

  } catch (error) {
    console.error('Connection test failed:', error)
  }
}

testConnection()