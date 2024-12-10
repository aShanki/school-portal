import mongoose, { Schema } from 'mongoose'

const AttendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late'], 
    required: true 
  }
}, {
  timestamps: true
})

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)