import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late'],
    required: true,
    default: 'absent'
  },
  note: { type: String },
});

// Add compound index for efficient queries
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);