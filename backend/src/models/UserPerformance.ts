import mongoose, { Document, Schema } from 'mongoose';

interface IVarkPerformance {
  countResponse: number;
  countNegativeResponse: number;
}

export interface IUserPerformance extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  visual: IVarkPerformance;
  auditory: IVarkPerformance;
  reading: IVarkPerformance;
  kinesthetic: IVarkPerformance;
}

const VarkPerformanceSchema = new Schema({
  countResponse: { type: Number, default: 0 },
  countNegativeResponse: { type: Number, default: 0 },
}, { _id: false });

const UserPerformanceSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  visual: { type: VarkPerformanceSchema, default: () => ({}) },
  auditory: { type: VarkPerformanceSchema, default: () => ({}) },
  reading: { type: VarkPerformanceSchema, default: () => ({}) },
  kinesthetic: { type: VarkPerformanceSchema, default: () => ({}) },
});

export const UserPerformance = mongoose.model<IUserPerformance>('UserPerformance', UserPerformanceSchema);
