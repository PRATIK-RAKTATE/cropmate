import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { seedDemoData } from '../services/seedService.js'

await connectDatabase(env.mongoUri)
await seedDemoData()
await disconnectDatabase()
console.log('Seed complete')
