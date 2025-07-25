import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  sessionId: Schema.Types.ObjectId;
  sender: 'user' | 'ai';
  text: string;
  fileIds?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  fileIds: [{ type: Schema.Types.ObjectId, ref: 'File' }],
}, { timestamps: true });

export const Message = model<IMessage>('Message', messageSchema);
