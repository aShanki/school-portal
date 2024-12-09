import { Schema, model, models } from 'mongoose'

const gradeSchema = new Schema({
  studentId: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  assignmentId: { 
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true 
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  grade: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export default models.Grade || model('Grade', gradeSchema)