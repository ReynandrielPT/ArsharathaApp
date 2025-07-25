import { Schema, model, Document } from 'mongoose';

/**
 * Represents a single message within a learning session.
 * A message can be from a user or the AI.
 */


export interface IMessage extends Document {
  /** The ID of the session this message belongs to. */
  sessionId: Schema.Types.ObjectId;
  /** The sender of the message, either the 'user' or the 'ai'. */
  sender: 'user' | 'ai';
  /** The text content of the message. For AI, this can be a JSON string of commands. */
  text: string;
  /** An array of File IDs associated with this message (e.g., for user uploads). */
  fileIds?: Schema.Types.ObjectId[];
  /** The timestamp when the message was created. */
  createdAt: Date;
  /** The timestamp when the message was last updated. */
  updatedAt: Date;
}

const messageSchema = new Schema({
  /** Reference to the parent Session. */
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  /** Specifies who sent the message. */
  sender: { type: String, enum: ['user', 'ai'], required: true },
  /** The main content of the message. */
  text: { type: String, required: true },
  /** Optional references to files associated with this message. */
  fileIds: [{ type: Schema.Types.ObjectId, ref: 'File' }],
}, { timestamps: true });

export const Message = model<IMessage>('Message', messageSchema);
