export interface Class {
  _id: string
  name: string
  subject: string
  teacherId?: {
    _id: string
    name: string
  }
  studentIds?: string[]
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
