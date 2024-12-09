
import { Schema, model, models } from 'mongoose'

const assignmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Unit Test', 'Seatwork', 'Term Test', 'Homework', 'Research', 'Participation']
  },
  totalPoints: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'archived']
  },
  dueDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default models.Assignment || model('Assignment', assignmentSchema)