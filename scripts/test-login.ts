import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('Connected to MongoDB\n')

    const db = mongoose.connection.db!
    const admin = await db.collection('users').findOne({ email: 'admin@flyinguate.com' })

    if (!admin) {
      console.log('❌ Admin user not found!')
      console.log('\nCreating admin user...')

      const salt = await bcrypt.genSalt(12)
      const hash = await bcrypt.hash('adminpass123', salt)

      await db.collection('users').insertOne({
        email: 'admin@flyinguate.com',
        passwordHash: hash,
        fullName: 'Admin',
        role: 'admin',
        accountBalance: 0,
        kycVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      console.log('✅ Admin created!')
      console.log('   Email: admin@flyinguate.com')
      console.log('   Password: adminpass123')
      return
    }

    console.log('Admin found:')
    console.log('  Email:', admin.email)
    console.log('  Role:', admin.role)
    console.log('  Hash exists:', !!admin.passwordHash)

    // Test passwords
    const passwords = ['adminpass123', 'Admin123!', 'admin123']
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, admin.passwordHash)
      console.log(`  Test "${pwd}":`, isValid ? '✅ VALID' : '❌ invalid')
    }

  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

testLogin()
