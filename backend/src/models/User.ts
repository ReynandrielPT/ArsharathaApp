import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string; // Firebase User ID
  email: string;
  fullName: string;
  settings: {
    bionicReading: boolean;
    font: 'default' | 'OpenDyslexic';
    spacing: 'default' | 'medium' | 'large';
    chunking: boolean;
  };
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  settings: {
    bionicReading: { type: Boolean, default: false },
    font: { type: String, enum: ['default', 'OpenDyslexic'], default: 'default' },
    spacing: { type: String, enum: ['default', 'medium', 'large'], default: 'default' },
    chunking: { type: Boolean, default: false },
  },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
