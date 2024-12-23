import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  totalPoints: { type: Number, required: true },
  description: String,
  classId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Class' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema)