// server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;  
  email: string;
  dateOfBirth: Date;
  password?: string;
  googleId?: string;
  otp?: string | undefined;
  otpExpires?: Date | undefined;
  isVerified: boolean;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },  
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  password: { type: String, required: false }, // Not required for Google OAuth users
  googleId: { type: String, required: false, unique: true, sparse: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Middleware to hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;