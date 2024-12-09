import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import Class from '@/models/Class'
import Assignment from '@/models/Assignment'
import Grade from '@/models/Grade'
import Attendance from '@/models/Attendance'
import { env } from './env'
import { PARTICIPATION_ASSIGNMENT_ID } from './constants'
import { addDays, isBefore, isWeekend, subMonths } from 'date-fns'

const ASSIGNMENT_TYPES = ['Unit Test', 'Seatwork', 'Term Test', 'Homework', 'Research', 'Participation']
const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology', 'Literature']

const ASSIGNMENTS_CONFIG = {
  'Term Test': { count: 1, points: 60 },
  'Unit Test': { count: 3, points: 50 },
  'Seatwork': { count: 6, points: 35 },
  'Homework': { count: 10, points: 10 },
  'Participation': { count: 1, points: 100 }
} as const

function generateEmail(name: string, role: string): string {
  const domains = {
    'teacher': 'teachers.com',
    'student': 'students.com',
    'parent': 'parents.com'
  }
  return `${name.toLowerCase().replace(/\s/g, '.')}@${domains[role.toLowerCase()]}`
}

const generateUniqueNames = (count: number, prefix = '') => {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra', 'Ashley', 'Margaret']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
  
  const usedNames = new Set()
  const names = []

  for (let i = 0; i < count; i++) {
    let name
    let attempts = 0
    do {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      name = `${firstName} ${lastName}`
      if (attempts > 0) {
        name = `${name} ${attempts}`
      }
      attempts++
    } while (usedNames.has(name))

    usedNames.add(name)
    names.push(prefix + name)
  }

  return names
}

// Helper to generate a random grade
function generateGrade(totalPoints: number): number {
  // Generate grades with a normal-ish distribution
  const percentage = Math.min(100, Math.max(60, (Math.random() + Math.random() + Math.random()) * 33.33))
  return Math.round((percentage / 100) * totalPoints)
}

function generateAttendanceStatus(): 'present' | 'absent' | 'late' {
  const rand = Math.random()
  if (rand < 0.8) return 'present' // 80% chance of present
  if (rand < 0.9) return 'late'    // 10% chance of late
  return 'absent'                   // 10% chance of absent
}

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Assignment.deleteMany({}),
      Grade.deleteMany({}),
      Attendance.deleteMany({})  // Add this line
    ])
    console.log('Cleared existing data')

    const password = await bcrypt.hash('password123', 10)

    // Prepare all user documents in memory
    const teacherNames = generateUniqueNames(20, 'Teacher ')
    const studentNames = generateUniqueNames(20, 'Student ')
    const parentNames = generateUniqueNames(20, 'Parent ')

    const teacherDocs = teacherNames.map(name => ({
      name,
      email: generateEmail(name, 'teacher'),
      password,
      role: 'TEACHER'
    }))

    const parentDocs = parentNames.map(name => ({
      name,
      email: generateEmail(name, 'parent'),
      password,
      role: 'PARENT'
    }))

    // Create parents first
    const parents = await User.insertMany(parentDocs)
    console.log('Created parents')

    // Assign ALL parents to each student
    const studentDocsWithParents = studentNames.map(name => ({
      name,
      email: generateEmail(name, 'student'),
      password,
      role: 'STUDENT',
      parentIds: parents.map(p => p._id)  // Changed to include all parent IDs
    }))

    // Create remaining users
    const [teachers, students] = await Promise.all([
      User.insertMany(teacherDocs),
      User.insertMany(studentDocsWithParents),
      User.create({
        name: 'Admin User',
        email: 'admin@admin.com',
        password,
        role: 'ADMIN'
      })
    ])

    console.log('Created users')

    // Create classes first to get their IDs
    const classDocs = []

    teachers.forEach(teacher => {
      for (let i = 0; i < 3; i++) {
        const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
        const className = `${subject} ${i + 1}`
        
        classDocs.push({
          name: className,
          subject,
          teacherId: teacher._id,
          studentIds: students.map(s => s._id)
        })
      }
    })

    // Insert classes and get their IDs
    const classes = await Class.insertMany(classDocs)
    console.log('Created classes')

    // Now prepare and insert assignments first
    const assignmentDocs = []
    classes.forEach(newClass => {
      Object.entries(ASSIGNMENTS_CONFIG).forEach(([type, config]) => {
        if (type === 'Participation') {
          assignmentDocs.push({
            name: 'Class Participation',
            description: 'Overall class participation grade',
            category: 'Participation',
            totalPoints: 100,
            status: 'active',
            classId: newClass._id,
            teacherId: newClass.teacherId,
            createdAt: new Date()
          })
        } else {
          for (let j = 0; j < config.count; j++) {
            assignmentDocs.push({
              name: `${type} ${j + 1}`,
              description: `${type} ${j + 1} for ${newClass.name}`,
              classId: newClass._id,
              category: type,
              totalPoints: config.points,
              status: 'active',
              teacherId: newClass.teacherId
            })
          }
        }
      })
    })

    // Insert assignments first to get their IDs
    const assignments = await Assignment.insertMany(assignmentDocs)
    console.log('Created assignments')

    // Now prepare grades with valid assignment IDs
    const gradeDocs = []
    classes.forEach(newClass => {
      const classAssignments = assignments.filter(a => a.classId.toString() === newClass._id.toString())
      
      classAssignments.forEach(assignment => {
        students.forEach(student => {
          const points = assignment.category === 'Participation' 
            ? Math.floor(Math.random() * (100 - 70 + 1)) + 70
            : generateGrade(assignment.totalPoints)
          
          gradeDocs.push({
            studentId: student._id,
            assignmentId: assignment._id,
            classId: newClass._id,
            points,
            totalPoints: assignment.totalPoints,
            grade: (points / assignment.totalPoints) * 100,
            updatedAt: new Date()
          })
        })
      })
    })

    // Finally insert all grades
    console.log('Preparing grade insert...')
    await Grade.insertMany(gradeDocs)

    // Add attendance records
    console.log('Creating attendance records...')
    const attendanceDocs = []
    const twoMonthsAgo = subMonths(new Date(), 2)
    const today = new Date()

    classes.forEach(cls => {
      let currentDate = twoMonthsAgo
      
      while (isBefore(currentDate, today)) {
        if (!isWeekend(currentDate)) {
          cls.studentIds.forEach(studentId => {
            attendanceDocs.push({
              studentId,
              teacherId: cls.teacherId,
              classId: cls._id,
              date: new Date(currentDate),
              status: generateAttendanceStatus(),
              createdAt: new Date()
            })
          })
        }
        currentDate = addDays(currentDate, 1)
      }
    })

    await Attendance.insertMany(attendanceDocs)
    console.log(`Created ${attendanceDocs.length} attendance records`)

    console.log('Created:', {
      classCount: classes.length,
      assignmentCount: assignments.length,
      gradeCount: gradeDocs.length,
      attendanceCount: attendanceDocs.length
    })

    console.log('Seed completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()