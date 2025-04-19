import mongoose, { Document, Schema } from "mongoose";
import { RequestReasons, RequestStatus } from "../../../utils/constants";
import { Counter } from "../../user/model/counter.model";

export interface IRequest {
  status: RequestStatus;
  customerName: string;
  customerId: mongoose.Types.ObjectId;
  reason: RequestReasons;
  amountToWithdraw: number;
  message: string;
  lastUpdatedBy:mongoose.Types.ObjectId;
  uniqueId:number;
}

export interface IRequestModal extends IRequest, Document {}

export const requestSchema = new Schema<IRequestModal>(
  {
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
    customerName: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "users", 
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(RequestReasons),
      required: true,
    },
    amountToWithdraw: { type: Number, default: 0 },
    message: { type: String, required: false },
    lastUpdatedBy:{
      type: Schema.Types.ObjectId,
      ref: "users", 
    },
    uniqueId:{ type: Number, unique: true },
  },
  {
    timestamps: true,
  }
);

requestSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // Only run on new docs

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'request' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true } // create if not exists
    );
    this.uniqueId = counter.sequenceValue;
    next();
  } catch (err) {
    console.log(err)
  }
});

const UserRequest = mongoose.model<IRequestModal>("request", requestSchema);
export default UserRequest;
