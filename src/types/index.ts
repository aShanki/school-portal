export interface Class {
  _id: string
  name: string
  subject: string
  teacherId?: {
    _id: string
    name: string
  }
  studentIds?: string[]
  averageGrade?: number
}

export interface AttendanceRecord {
  _id: string
  classId: string
  studentId: string
  status: 'present' | 'absent' | 'late'
  date: string
}

export interface ClassAttendance {
  _id: string
  name: string
  teacherId: {
    name: string
  }
  attendance: {
    present: number
    late: number
    absent: number
    rate: number
  }
}

export interface MongoUser extends Document {
  _id: string
  name: string
  email: string
  role: string
  parentIds?: string[]
  averageGrade?: number
  attendanceRate?: number
}
