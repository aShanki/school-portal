import mongoose from 'mongoose';

interface IUser extends mongoose.Document {
  name?: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  parentIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
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
    required: function(this: IUser) {
      return this.role === 'STUDENT'
    },
    validate: {
      validator: function(this: IUser, v: mongoose.Types.ObjectId[]) {
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
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;