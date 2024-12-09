import { Types } from 'mongoose'

export interface UserDocument {
  _id: Types.ObjectId
  name: string
  email: string
}

export interface ClassDocument {
  _id: Types.ObjectId
  name: string
  teacherId: UserDocument
}

export interface AttendanceDocument {
  _id: Types.ObjectId
  date: Date
  status: string
  remarks?: string
  studentId: Types.ObjectId
  classId: Types.ObjectId
}