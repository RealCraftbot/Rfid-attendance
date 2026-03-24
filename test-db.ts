import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test query
    const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`
    console.log('PostgreSQL Version:', result[0]?.version)
    
    // Count organizations
    const orgCount = await prisma.organization.count()
    console.log(`Number of organizations: ${orgCount}`)
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`Number of users: ${userCount}`)
    
    // Count students
    const studentCount = await prisma.student.count()
    console.log(`Number of students: ${studentCount}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
