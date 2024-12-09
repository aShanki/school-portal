import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    required: true,
    default: 'TEACHER'
  },
  parentIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: function(this: any) {
      return this.role === 'STUDENT'
    },
    validate: {
      validator: function(v: any[]) {
        return this.role !== 'STUDENT' || (Array.isArray(v) && v.length > 0);
      },
      message: 'Student must have at least one parent'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Check if the model is already defined to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;