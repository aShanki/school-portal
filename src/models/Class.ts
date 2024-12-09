import mongoose from 'mongoose'

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  subject: {
    type: String,
    required: true
  },
  schedule: {
    dayOfWeek: Number,
    startTime: String,
    endTime: String
  },
  assignments: [{
    name: {
      type: String,
      required: true
    },
    totalPoints: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  grades: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignmentId: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Class || mongoose.model('Class', ClassSchema)