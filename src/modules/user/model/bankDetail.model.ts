import mongoose, { Document, Schema } from "mongoose";

export interface IBankDetail{
    accountNumber?: string;
    ifscCode?:string;
    BankName?: string;
    BranchName?: string;
    accountHolderName?:string;
  }

  export interface IBankDetailModal extends IBankDetail, Document {}
// ✅ Add this to export the schema itself
export const bankDetailSchema = new Schema<IBankDetail>(
    {
      accountNumber: { type: String },
      ifscCode: { type: String },
      BankName: { type: String },
      BranchName: { type: String },
      accountHolderName: { type: String },
    },
    {
      timestamps: false,
      _id: false, // important if it's embedded and doesn't need a separate ID
    }
  );
  
  // Optional model if you need it standalone
  const BankDetail = mongoose.model<IBankDetailModal>("bankDetail", bankDetailSchema);
  export default BankDetail;
  