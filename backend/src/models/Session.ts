import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  varkMode: 'V' | 'A' | 'R' | 'K';
  speechEnabled: boolean;
}

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  varkMode: { type: String, enum: ['V', 'A', 'R', 'K'], default: 'R' },
  speechEnabled: { type: Boolean, default: true },
}, {
  timestamps: true
});

export const Session = model<ISession>('Session', sessionSchema);
