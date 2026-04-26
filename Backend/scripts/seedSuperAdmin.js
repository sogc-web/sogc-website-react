const { connectToDatabase } = require('../src/config/database')
const { Admin } = require('../src/models/Admin')

async function seedSuperAdmin() {
  await connectToDatabase()

  const email = 'societyofglobalcycle@gmail.com'

  const existingAdmin = await Admin.findOne({ email })

  if (existingAdmin) {
    let changed = false

    if (existingAdmin.role !== 'superadmin') {
      existingAdmin.role = 'superadmin'
      changed = true
    }

    if (existingAdmin.status !== 'active') {
      existingAdmin.status = 'active'
      changed = true
    }

    if (existingAdmin.provider !== 'google') {
      existingAdmin.provider = 'google'
      changed = true
    }

    if (changed) {
      await existingAdmin.save()
      console.log(`Updated existing superadmin: ${email}`)
    } else {
      console.log(`Superadmin already present: ${email}`)
    }

    return
  }

  await Admin.create({
    email,
    name: 'SOGC Superadmin',
    role: 'superadmin',
    status: 'active',
    provider: 'google',
    inviteAcceptedAt: new Date(),
  })

  console.log(`Created superadmin: ${email}`)
}

seedSuperAdmin()
  .catch((error) => {
    console.error('Failed to seed superadmin:', error)
    process.exit(1)
  })
  .finally(async () => {
    try {
      const mongoose = require('mongoose')
      await mongoose.disconnect()
    } catch (_error) {
      // noop
    }
  })
