import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  originalFilename: string;
  path: string;
  mimetype: string;
  size: number;
  userId: mongoose.Schema.Types.ObjectId;
}

const FileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  originalFilename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const File = mongoose.model<IFile>('File', FileSchema);
