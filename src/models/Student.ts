
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  grade: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);