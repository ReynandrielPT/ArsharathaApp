import { Schema, model, Document } from 'mongoose';

/**
 * Represents a user of the application.
 */
export interface IUser extends Document {
  /** The user's unique username. */
  username: string;
  /** The user's hashed password. */
  password: string;
  /** Whether the user has completed the ADHD assessment. */
  hasCompletedAssessment: boolean;
  /** Whether the user has been identified as having ADHD characteristics. */
  isADHD: boolean;
  /** Whether the user has ADHD mode enabled. */
  adhdMode: boolean;
  /** The date of the user's last assessment. */
  lastAssessmentDate?: Date;
}

const userSchema = new Schema<IUser>({
  /** The username for the account, must be unique. */
  username: { type: String, required: true, unique: true },
  /** The hashed password for the account. */
  password: { type: String, required: true },
  /** Whether the user has completed the ADHD assessment. */
  hasCompletedAssessment: { type: Boolean, default: false },
  /** Whether the user has been identified as having ADHD characteristics. */
  isADHD: { type: Boolean, default: false },
  /** Whether the user has ADHD mode enabled. */
  adhdMode: { type: Boolean, default: false },
  /** The date of the user's last assessment. */
  lastAssessmentDate: { type: Date },
}, {
  timestamps: true
});

export const User = model('User', userSchema);
