import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  modelName: string;  // 🔄 renamed from 'model'
  field: string;
  count: number;
}

const counterSchema = new Schema<ICounter>({
  modelName: { type: String, required: true },
  field: { type: String, required: true },
  count: { type: Number, default: 0 },
});

const Counter = mongoose.model<ICounter>('Counter', counterSchema);
export default Counter;
