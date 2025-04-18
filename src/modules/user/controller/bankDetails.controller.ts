import { Request, Response } from "express";
import User, { IUser } from "../../user/model/user.model";
import path from "path";
import fs from "fs";
import { prefixFields, updateFields } from "../../../utils/updateFunc";

export const addBankDetails = async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).userId;
    try {
        const {accountNumber, ifscCode, BankName, BranchName, accountHolderName} = req.body;
        // console.log(accountNumber, ifscCode, BankName, BranchName, accountHolderName)
        const user = await User.findByIdAndUpdate(userId,{ $set: { bankDetail: { accountNumber, ifscCode, BankName, BranchName, accountHolderName } } }, { new: true });
        res.status(201).send({ success: true, data: user });
    } catch (err: any) {
        return res.status(500).send({ success: false, message: err.message });
    }
};

export const editBankDetails = async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).userId;
    try {
        let update = updateFields(req.body)
        update  = prefixFields(update.$set, "bankDetail")
       
        const user = await User.findByIdAndUpdate(userId,{$set: update}, { new: true });
        res.status(201).send({ success: true, data: user });
    } catch (err: any) {
        return res.status(500).send({ success: false, message: err.message });
    }
}