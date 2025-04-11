// import mongoose, { Schema, Document } from 'mongoose';

// export interface ICounter extends Document {
//   modelName: string;  // 🔄 renamed from 'model'
//   field: string;
//   count: number;
// }

// const counterSchema = new Schema<ICounter>({
//   modelName: { type: String, required: true },
//   field: { type: String, required: true },
//   count: { type: Number, default: 0 },
// });

// const Counter = mongoose.model<ICounter>('Counter', counterSchema);
// export default Counter;

// models/Counter.ts
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // eg. "user"
  sequenceValue: { type: Number, default: 0 }
});

export const Counter = mongoose.model('Counter', counterSchema);
