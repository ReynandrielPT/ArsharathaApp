import { Schema, model, Document } from 'mongoose';

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  canvasState?: any;
  currentMode: 'V' | 'A' | 'R' | 'K';
  kinestheticData?: {
    elements: { id: string; text: string }[];
    dropZones: { elementId: string; x: number; y: number; tolerance: number }[];
  };
}

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  canvasState: { type: Schema.Types.Mixed },
  currentMode: { type: String, enum: ['V', 'A', 'R', 'K'], default: 'R' },
  kinestheticData: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

export const Session = model<ISession>('Session', sessionSchema);
